import crypto from 'crypto';
import { Request, Response } from 'express';
import {
  serverDb,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from './firebaseServer';

/**
 * Helper to verify Paddle Webhook HMAC signature (Paddle Billing v2)
 */
export function verifyPaddleWebhookSignature(
  signatureHeader: string | undefined,
  rawBody: string,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  try {
    const parts = signatureHeader.split(';');
    let ts = '';
    let h1 = '';

    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === 'ts') ts = val;
      if (key === 'h1') h1 = val;
    }

    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expectedHmac, 'hex'));
  } catch (err) {
    console.error('[Paddle Webhook Signature Verification Error]:', err);
    return false;
  }
}

/**
 * Express Handler for POST /api/paddle/webhook
 */
export async function handlePaddleWebhook(req: Request & { rawBody?: string }, res: Response) {
  try {
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const signatureHeader = (req.headers['paddle-signature'] || req.headers['Paddle-Signature']) as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Validate Signature if webhook secret is configured
    if (webhookSecret) {
      const isValid = verifyPaddleWebhookSignature(signatureHeader, rawBody, webhookSecret);
      if (!isValid) {
        console.warn('[Paddle Webhook] Invalid signature received.');
        return res.status(401).json({ error: 'Invalid Paddle webhook signature' });
      }
    } else {
      console.log('[Paddle Webhook] PADDLE_WEBHOOK_SECRET not set; processing without signature validation (Sandbox/Testing).');
    }

    const payload = req.body;
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = (payload.event_type || payload.action || 'unknown').toLowerCase();
    const data = payload.data || {};

    console.log(`[Paddle Webhook Received] Event: ${eventType} (ID: ${eventId})`);

    // Idempotency Check via Firestore `paddle_events` collection
    const eventDocRef = doc(serverDb, 'paddle_events', eventId);
    const existingEventDoc = await getDoc(eventDocRef);
    if (existingEventDoc.exists()) {
      console.log(`[Paddle Webhook] Event ${eventId} already processed. Skipping duplicate.`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed' });
    }

    // Extract metadata from custom_data & items
    const customData = data.custom_data || data.items?.[0]?.custom_data || {};
    const userId = customData.userId || customData.user_id;
    const userEmail = customData.userEmail || customData.user_email || data.customer?.email || data.customer_email;
    const priceId = data.items?.[0]?.price?.id || data.items?.[0]?.price_id || data.price_id || '';

    // Exactly 8 Paddle Price IDs from environment variables
    const PRO_MONTHLY = (process.env.PADDLE_PRO_MONTHLY_PRICE_ID || process.env.VITE_PADDLE_PRO_MONTHLY_PRICE_ID || process.env.PADDLE_PRO_PRICE_ID || '').trim();
    const PRO_6_MONTH = (process.env.PADDLE_PRO_6_MONTH_PRICE_ID || process.env.VITE_PADDLE_PRO_6_MONTH_PRICE_ID || process.env.PADDLE_PRO_SIX_MONTH_PRICE_ID || process.env.VITE_PADDLE_PRO_SIX_MONTH_PRICE_ID || '').trim();
    const PRO_YEARLY = (process.env.PADDLE_PRO_YEARLY_PRICE_ID || process.env.VITE_PADDLE_PRO_YEARLY_PRICE_ID || '').trim();
    const PRO_5_YEAR = (process.env.PADDLE_PRO_5_YEAR_PRICE_ID || process.env.VITE_PADDLE_PRO_5_YEAR_PRICE_ID || process.env.PADDLE_PRO_FIVE_YEAR_PRICE_ID || '').trim();

    const PREMIUM_MONTHLY = (process.env.PADDLE_PREMIUM_MONTHLY_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID || process.env.PADDLE_PREMIUM_PRICE_ID || '').trim();
    const PREMIUM_6_MONTH = (process.env.PADDLE_PREMIUM_6_MONTH_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_6_MONTH_PRICE_ID || process.env.PADDLE_PREMIUM_SIX_MONTH_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_SIX_MONTH_PRICE_ID || '').trim();
    const PREMIUM_YEARLY = (process.env.PADDLE_PREMIUM_YEARLY_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID || '').trim();
    const PREMIUM_5_YEAR = (process.env.PADDLE_PREMIUM_5_YEAR_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_5_YEAR_PRICE_ID || process.env.PADDLE_PREMIUM_FIVE_YEAR_PRICE_ID || '').trim();

    // Determine target plan ('Pro' or 'Premium')
    let targetPlan: 'Pro' | 'Premium' = 'Pro';
    let billingDuration: 'monthly' | '6_month' | 'yearly' | '5_year' = 'monthly';
    let billingCycle: 'monthly' | 'six_months' | 'yearly' | 'five_year' = 'monthly';

    const cleanPriceId = (priceId || '').trim();

    // Check Premium matches
    if (
      (PREMIUM_MONTHLY && cleanPriceId === PREMIUM_MONTHLY) ||
      (PREMIUM_6_MONTH && cleanPriceId === PREMIUM_6_MONTH) ||
      (PREMIUM_YEARLY && cleanPriceId === PREMIUM_YEARLY) ||
      (PREMIUM_5_YEAR && cleanPriceId === PREMIUM_5_YEAR) ||
      customData.requestedPlan === 'Premium' ||
      customData.requestedPlan === 'Business'
    ) {
      targetPlan = 'Premium';
      if (PREMIUM_5_YEAR && cleanPriceId === PREMIUM_5_YEAR) {
        billingDuration = '5_year';
        billingCycle = 'five_year';
      } else if (PREMIUM_YEARLY && cleanPriceId === PREMIUM_YEARLY) {
        billingDuration = 'yearly';
        billingCycle = 'yearly';
      } else if (PREMIUM_6_MONTH && cleanPriceId === PREMIUM_6_MONTH) {
        billingDuration = '6_month';
        billingCycle = 'six_months';
      } else if (PREMIUM_MONTHLY && cleanPriceId === PREMIUM_MONTHLY) {
        billingDuration = 'monthly';
        billingCycle = 'monthly';
      }
    } else {
      // Pro matches
      targetPlan = 'Pro';
      if (PRO_5_YEAR && cleanPriceId === PRO_5_YEAR) {
        billingDuration = '5_year';
        billingCycle = 'five_year';
      } else if (PRO_YEARLY && cleanPriceId === PRO_YEARLY) {
        billingDuration = 'yearly';
        billingCycle = 'yearly';
      } else if (PRO_6_MONTH && cleanPriceId === PRO_6_MONTH) {
        billingDuration = '6_month';
        billingCycle = 'six_months';
      } else if (PRO_MONTHLY && cleanPriceId === PRO_MONTHLY) {
        billingDuration = 'monthly';
        billingCycle = 'monthly';
      }
    }

    // Secondary fallback from customData if priceId was unconfigured
    if (customData.billingCycle) {
      const cc = customData.billingCycle.toLowerCase();
      if (cc === 'five_year' || cc === '5_year') {
        billingDuration = '5_year';
        billingCycle = 'five_year';
      } else if (cc === 'yearly' || cc === '1_year') {
        billingDuration = 'yearly';
        billingCycle = 'yearly';
      } else if (cc === 'six_months' || cc === '6_month') {
        billingDuration = '6_month';
        billingCycle = 'six_months';
      }
    }

    // Locate target user document in Firestore
    let targetUserDocRef: any = null;
    let targetUserId: string = userId || '';

    if (targetUserId) {
      const userRef = doc(serverDb, 'users', targetUserId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        targetUserDocRef = userRef;
      }
    }

    if (!targetUserDocRef && userEmail) {
      const usersRef = collection(serverDb, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const firstUser = querySnap.docs[0];
        targetUserDocRef = firstUser.ref;
        targetUserId = firstUser.id;
      }
    }

    // Categorize Event Types
    const isActiveEvent = [
      'subscription.created',
      'subscription.updated',
      'subscription.activated',
      'subscription.resumed',
      'transaction.completed',
      'transaction.paid',
    ].includes(eventType);

    const isPastDueEvent = eventType === 'subscription.past_due';
    const isPausedEvent = eventType === 'subscription.paused';
    const isCancelEvent = eventType === 'subscription.canceled' || eventType === 'subscription.cancelled';

    if (isActiveEvent && targetUserDocRef) {
      const periodDurationMs =
        billingDuration === '5_year'
          ? 5 * 365 * 24 * 60 * 60 * 1000
          : billingDuration === 'yearly'
          ? 365 * 24 * 60 * 60 * 1000
          : billingDuration === '6_month'
          ? 180 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

      const startsAt = data.current_billing_period?.starts_at || new Date().toISOString();
      const endsAt = data.current_billing_period?.ends_at || new Date(Date.now() + periodDurationMs).toISOString();
      const scheduledChange = data.scheduled_change;
      const cancelAtPeriodEnd = scheduledChange?.action === 'cancel' || Boolean(data.cancel_at_period_end);

      const updateData = {
        userId: targetUserId,
        plan: targetPlan.toLowerCase(),
        subscriptionPlan: targetPlan,
        subscription: targetPlan.toLowerCase(),
        billingDuration: billingDuration,
        billingCycle: billingCycle,
        subscriptionStatus: 'active',
        paddleCustomerId: data.customer_id || data.customer?.id || '',
        paddleSubscriptionId: data.id || data.subscription_id || '',
        paddleTransactionId: data.transaction_id || data.id || `PADDLE_${Date.now()}`,
        paddlePriceId: cleanPriceId,
        currentPeriodStart: startsAt,
        currentPeriodEnd: endsAt,
        cancelAtPeriodEnd,
        startDate: startsAt,
        expiryDate: endsAt,
        paymentProvider: 'Paddle',
        paymentMethod: 'Paddle Billing',
        paymentRegion: 'international',
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(targetUserDocRef, updateData);
      console.log(`[Paddle Webhook] Updated user ${targetUserId} to plan=${targetPlan.toLowerCase()} (billingDuration=${billingDuration}, status=active)`);

      // Add / Update subscription history record in Firestore
      const reqId = `paddle_${data.id || Date.now()}`;
      const chargedAmount =
        targetPlan === 'Premium'
          ? billingDuration === '5_year'
            ? 120.00
            : billingDuration === 'yearly'
            ? 30.00
            : billingDuration === '6_month'
            ? 17.85
            : 3.50
          : billingDuration === '5_year'
          ? 60.00
          : billingDuration === 'yearly'
          ? 14.40
          : billingDuration === '6_month'
          ? 7.65
          : 1.50;

      await setDoc(
        doc(serverDb, 'subscriptionRequests', reqId),
        {
          id: reqId,
          userId: targetUserId,
          userEmail: userEmail || '',
          requestedPlan: targetPlan,
          plan: targetPlan.toLowerCase(),
          currentPlan: 'Free',
          billingCycle: billingCycle,
          billingDuration: billingDuration,
          paymentMethod: 'Paddle Billing',
          paymentProvider: 'Paddle',
          paymentRegion: 'international',
          currency: 'USD',
          transactionId: data.transaction_id || data.id || `TRX_${Date.now()}`,
          paddleCustomerId: data.customer_id || data.customer?.id || '',
          paddleSubscriptionId: data.id || data.subscription_id || '',
          paddlePriceId: cleanPriceId,
          amount: chargedAmount,
          status: 'approved',
          requestDate: new Date().toISOString(),
          reviewedDate: new Date().toISOString(),
          approvedBy: 'Paddle Webhook System',
          currentPeriodStart: startsAt,
          currentPeriodEnd: endsAt,
          cancelAtPeriodEnd,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } else if (isPastDueEvent && targetUserDocRef) {
      await updateDoc(targetUserDocRef, {
        subscriptionStatus: 'past_due',
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Paddle Webhook] User ${targetUserId} subscription marked as past_due.`);
    } else if (isPausedEvent && targetUserDocRef) {
      await updateDoc(targetUserDocRef, {
        subscriptionStatus: 'paused',
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Paddle Webhook] User ${targetUserId} subscription marked as paused.`);
    } else if (isCancelEvent && targetUserDocRef) {
      // When subscription actually ends / cancels in Paddle:
      // Revert to Free plan, without deleting products, inventory, customers, sales, orders, or personal ledger.
      await updateDoc(targetUserDocRef, {
        plan: 'free',
        subscriptionPlan: 'Free',
        subscription: 'free',
        subscriptionStatus: 'canceled',
        cancelAtPeriodEnd: false,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Paddle Webhook] User ${targetUserId} subscription cancelled. Plan safely reverted to Free.`);
    }

    // Save processed event to Firestore for idempotency & audit trail
    await setDoc(eventDocRef, {
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
      userId: targetUserId || null,
      userEmail: userEmail || null,
      priceId: cleanPriceId || null,
      paddleSubscriptionId: data.id || data.subscription_id || null,
    });

    return res.status(200).json({
      status: 'ok',
      eventType,
      eventId,
      userId: targetUserId || 'unlinked',
    });
  } catch (error: any) {
    console.error('[Paddle Webhook Processing Error]:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error processing Paddle webhook',
    });
  }
}


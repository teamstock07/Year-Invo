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
  addDoc,
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
    const signatureHeader = req.headers['paddle-signature'] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Validate Signature if webhook secret is configured
    if (webhookSecret) {
      const isValid = verifyPaddleWebhookSignature(signatureHeader, rawBody, webhookSecret);
      if (!isValid) {
        console.warn('[Paddle Webhook] Invalid signature received.');
        return res.status(401).json({ error: 'Invalid Paddle webhook signature' });
      }
    } else {
      console.log('[Paddle Webhook] PADDLE_WEBHOOK_SECRET not set; proceeding with unverified webhook processing (Sandbox Mode).');
    }

    const payload = req.body;
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event_type || payload.action || 'unknown';
    const data = payload.data || {};

    console.log(`[Paddle Webhook Received] Event: ${eventType} (ID: ${eventId})`);

    // Idempotency Check via Firestore `paddle_events` collection
    const eventDocRef = doc(serverDb, 'paddle_events', eventId);
    const existingEventDoc = await getDoc(eventDocRef);
    if (existingEventDoc.exists()) {
      console.log(`[Paddle Webhook] Event ${eventId} already processed. Skipping.`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed' });
    }

    // Extract metadata from custom_data
    const customData = data.custom_data || data.items?.[0]?.custom_data || {};
    const userId = customData.userId || customData.user_id;
    const userEmail = customData.userEmail || customData.user_email || data.customer?.email || data.customer_email;
    const priceId = data.items?.[0]?.price?.id || data.items?.[0]?.price_id || data.price_id || '';

    // Price ID mapping
    const PRICE_PRO_MONTHLY = process.env.VITE_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01kzv66qktfknx85x73xer2qgj';
    const PRICE_PRO_YEARLY = process.env.VITE_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01kzv6jmxvp82kaym27fpt92dn';
    const PRICE_PREMIUM_MONTHLY = process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID || 'pri_01kzv6fev3d3n02cwx6bzdwsag';
    const PRICE_PREMIUM_YEARLY = process.env.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID || 'pri_01kzv6m5hxxgsc4x829zy2bnhe';

    let targetPlan: 'Pro' | 'Business' = 'Pro';
    let billingCycle: 'monthly' | 'yearly' = 'monthly';

    if (
      priceId === PRICE_PREMIUM_MONTHLY ||
      priceId === PRICE_PREMIUM_YEARLY ||
      customData.requestedPlan === 'Business' ||
      customData.requestedPlan === 'Premium'
    ) {
      targetPlan = 'Business';
    } else if (
      priceId === PRICE_PRO_MONTHLY ||
      priceId === PRICE_PRO_YEARLY ||
      customData.requestedPlan === 'Pro'
    ) {
      targetPlan = 'Pro';
    }

    if (
      priceId === PRICE_PRO_YEARLY ||
      priceId === PRICE_PREMIUM_YEARLY ||
      customData.billingCycle === 'yearly'
    ) {
      billingCycle = 'yearly';
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

    const isActiveEvent = [
      'subscription.created',
      'subscription.updated',
      'subscription.activated',
      'transaction.completed',
      'transaction.paid',
    ].includes(eventType);

    const isCancelEvent = [
      'subscription.canceled',
      'subscription.past_due',
    ].includes(eventType);

    if (isActiveEvent && targetUserDocRef) {
      const startsAt = data.current_billing_period?.starts_at || new Date().toISOString();
      const endsAt = data.current_billing_period?.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const updateData = {
        subscriptionPlan: targetPlan,
        subscription: targetPlan.toLowerCase(),
        subscriptionStatus: 'active',
        paddleCustomerId: data.customer_id || data.customer?.id || '',
        paddleSubscriptionId: data.id || data.subscription_id || '',
        paddlePriceId: priceId,
        billingCycle: billingCycle,
        paymentProvider: 'Paddle',
        paymentRegion: 'international',
        currentPeriodStart: startsAt,
        currentPeriodEnd: endsAt,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(targetUserDocRef, updateData);
      console.log(`[Paddle Webhook] Updated user ${targetUserId} to ${targetPlan} Plan (${billingCycle})`);

      // Add / Update subscription request record in Firestore
      const reqId = `paddle_${data.id || Date.now()}`;
      await setDoc(
        doc(serverDb, 'subscriptionRequests', reqId),
        {
          id: reqId,
          userId: targetUserId,
          userEmail: userEmail || '',
          requestedPlan: targetPlan,
          currentPlan: 'Free',
          billingCycle: billingCycle,
          paymentMethod: 'Paddle Billing',
          paymentProvider: 'Paddle',
          paymentRegion: 'international',
          currency: 'USD',
          transactionId: data.id || data.transaction_id || `TRX_${Date.now()}`,
          amount: targetPlan === 'Business' ? (billingCycle === 'yearly' ? 45 : 5) : (billingCycle === 'yearly' ? 26.91 : 2.99),
          status: 'approved',
          requestDate: new Date().toISOString(),
          reviewedDate: new Date().toISOString(),
          approvedBy: 'Paddle Webhook System',
          paddleCustomerId: data.customer_id || data.customer?.id || '',
          paddleSubscriptionId: data.id || data.subscription_id || '',
          paddlePriceId: priceId,
          currentPeriodStart: startsAt,
          currentPeriodEnd: endsAt,
        },
        { merge: true }
      );
    } else if (isCancelEvent && targetUserDocRef) {
      await updateDoc(targetUserDocRef, {
        subscriptionPlan: 'Free',
        subscription: 'free',
        subscriptionStatus: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Paddle Webhook] User ${targetUserId} subscription cancelled/reverted to Free.`);
    }

    // Save processed event to Firestore for idempotency & audit trail
    await setDoc(eventDocRef, {
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
      userId: targetUserId || null,
      userEmail: userEmail || null,
      priceId: priceId || null,
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

import { Request, Response } from 'express';
import { serverDb, doc, getDoc, updateDoc } from './firebaseServer';
import { getPaddlePriceId } from '../src/config/paddle';

const getPaddleBaseUrl = (): string => {
  const env = (process.env.PADDLE_ENVIRONMENT || process.env.VITE_PADDLE_ENVIRONMENT || 'production').toLowerCase().trim();
  const token = (process.env.PADDLE_CLIENT_TOKEN || process.env.VITE_PADDLE_CLIENT_TOKEN || '').trim();
  const isSandbox = env === 'sandbox' || token.startsWith('test_');
  return isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
};

/**
 * GET /api/paddle/config
 * Returns safe public client-side Paddle configuration without exposing secret keys.
 */
export function handleGetPaddleConfig(req: Request, res: Response) {
  const env = (process.env.PADDLE_ENVIRONMENT || process.env.VITE_PADDLE_ENVIRONMENT || 'production').toLowerCase().trim();
  const clientToken = (process.env.PADDLE_CLIENT_TOKEN || process.env.VITE_PADDLE_CLIENT_TOKEN || '').trim();
  const isSandbox = env === 'sandbox' || (clientToken.startsWith('test_') && env !== 'production');
  const environment = isSandbox ? 'sandbox' : 'production';

  return res.json({
    environment,
    clientToken,
    priceIds: {
      proMonthly: (process.env.PADDLE_PRO_MONTHLY_PRICE_ID || process.env.VITE_PADDLE_PRO_MONTHLY_PRICE_ID || '').trim(),
      pro6Month: (process.env.PADDLE_PRO_6_MONTH_PRICE_ID || process.env.VITE_PADDLE_PRO_6_MONTH_PRICE_ID || '').trim(),
      proYearly: (process.env.PADDLE_PRO_YEARLY_PRICE_ID || process.env.VITE_PADDLE_PRO_YEARLY_PRICE_ID || '').trim(),
      pro5Year: (process.env.PADDLE_PRO_5_YEAR_PRICE_ID || process.env.VITE_PADDLE_PRO_5_YEAR_PRICE_ID || '').trim(),
      premiumMonthly: (process.env.PADDLE_PREMIUM_MONTHLY_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID || '').trim(),
      premium6Month: (process.env.PADDLE_PREMIUM_6_MONTH_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_6_MONTH_PRICE_ID || '').trim(),
      premiumYearly: (process.env.PADDLE_PREMIUM_YEARLY_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID || '').trim(),
      premium5Year: (process.env.PADDLE_PREMIUM_5_YEAR_PRICE_ID || process.env.VITE_PADDLE_PREMIUM_5_YEAR_PRICE_ID || '').trim(),
    },
  });
}

/**
 * POST /api/paddle/cancel-subscription
 * Securely cancels an active Paddle subscription on the backend.
 */
export async function handleCancelPaddleSubscription(req: Request, res: Response) {
  try {
    const { userId, subscriptionId, effectiveFrom = 'next_billing_period' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const apiKey = process.env.PADDLE_API_KEY;
    const userRef = doc(serverDb, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data() || {};
    const paddleSubId = subscriptionId || userData.paddleSubscriptionId;

    if (paddleSubId && apiKey) {
      // Call Paddle Billing v2 API to cancel subscription
      const baseUrl = getPaddleBaseUrl();
      const response = await fetch(`${baseUrl}/subscriptions/${paddleSubId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          effective_from: effectiveFrom,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[Paddle Cancel API Error]:', errorData);
      }
    }

    if (effectiveFrom === 'immediately') {
      await updateDoc(userRef, {
        plan: 'free',
        subscriptionPlan: 'Free',
        subscription: 'free',
        subscriptionStatus: 'canceled',
        cancelAtPeriodEnd: false,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Retain active paid access until current period ends
      await updateDoc(userRef, {
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: effectiveFrom === 'immediately'
        ? 'Subscription canceled immediately.'
        : 'Subscription scheduled for cancellation at the end of the billing period.',
    });
  } catch (error: any) {
    console.error('[Paddle Cancel Subscription Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to cancel subscription.',
    });
  }
}

/**
 * POST /api/paddle/update-subscription
 * Securely upgrades or updates a user subscription to a new plan or duration.
 */
export async function handleUpdatePaddleSubscription(req: Request, res: Response) {
  try {
    const { userId, newPlan, newDuration } = req.body;

    if (!userId || !newPlan) {
      return res.status(400).json({ error: 'userId and newPlan are required.' });
    }

    const apiKey = process.env.PADDLE_API_KEY;
    const userRef = doc(serverDb, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data() || {};
    const paddleSubId = userData.paddleSubscriptionId;
    const newPriceId = getPaddlePriceId(newPlan, newDuration || userData.billingDuration || 'monthly');

    if (!newPriceId) {
      return res.status(400).json({ error: `No Paddle Price ID configured for plan ${newPlan} (${newDuration}).` });
    }

    if (paddleSubId && apiKey) {
      const baseUrl = getPaddleBaseUrl();
      const response = await fetch(`${baseUrl}/subscriptions/${paddleSubId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              price_id: newPriceId,
              quantity: 1,
            },
          ],
          proration_billing_mode: 'prorated_immediately',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Paddle Update API Error]:', errorData);
        return res.status(response.status).json({
          error: errorData.error?.message || 'Failed to update subscription with Paddle.',
        });
      }
    }

    return res.json({
      success: true,
      message: `Subscription updated to ${newPlan} successfully.`,
      newPriceId,
    });
  } catch (error: any) {
    console.error('[Paddle Update Subscription Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update subscription.',
    });
  }
}

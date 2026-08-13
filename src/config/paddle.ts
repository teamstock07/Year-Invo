export interface PaddlePlanMapping {
  plan: 'Pro' | 'Business' | 'Premium';
  billingCycle: 'monthly' | 'yearly';
  priceId: string;
}

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> }).env || {};

export const PADDLE_CONFIG = {
  environment: (metaEnv.VITE_PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  clientToken: metaEnv.VITE_PADDLE_CLIENT_TOKEN || 'test_82d63f916d56d10fa09ecf385c5',
  priceIds: {
    proMonthly: metaEnv.VITE_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01kzv66qktfknx85x73xer2qgj',
    proYearly: metaEnv.VITE_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01kzv6jmxvp82kaym27fpt92dn',
    premiumMonthly: metaEnv.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID || 'pri_01kzv6fev3d3n02cwx6bzdwsag',
    premiumYearly: metaEnv.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID || 'pri_01kzv6m5hxxgsc4x829zy2bnhe',
  },
};

/**
 * Returns the exact Paddle Price ID for a given plan and billing cycle.
 */
export const getPaddlePriceId = (
  plan: 'Pro' | 'Business' | 'Premium',
  billingCycle: 'monthly' | 'yearly'
): string => {
  const isPremium = plan === 'Premium' || plan === 'Business';
  if (isPremium) {
    return billingCycle === 'yearly'
      ? PADDLE_CONFIG.priceIds.premiumYearly
      : PADDLE_CONFIG.priceIds.premiumMonthly;
  }
  return billingCycle === 'yearly'
    ? PADDLE_CONFIG.priceIds.proYearly
    : PADDLE_CONFIG.priceIds.proMonthly;
};

/**
 * Determines plan name and billing cycle from a given Paddle Price ID.
 */
export const getPlanAndCycleFromPriceId = (
  priceId: string
): { plan: 'Pro' | 'Business'; billingCycle: 'monthly' | 'yearly' } => {
  const { priceIds } = PADDLE_CONFIG;
  if (priceId === priceIds.premiumYearly) {
    return { plan: 'Business', billingCycle: 'yearly' };
  }
  if (priceId === priceIds.premiumMonthly) {
    return { plan: 'Business', billingCycle: 'monthly' };
  }
  if (priceId === priceIds.proYearly) {
    return { plan: 'Pro', billingCycle: 'yearly' };
  }
  return { plan: 'Pro', billingCycle: 'monthly' };
};

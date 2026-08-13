export interface PaddlePlanMapping {
  plan: 'Pro' | 'Business' | 'Premium';
  billingCycle: 'monthly' | 'yearly';
  priceId: string;
}

const getMetaEnv = (): Record<string, string> => {
  try {
    return ((import.meta as any).env as Record<string, string>) || {};
  } catch (e) {
    return {};
  }
};

const metaEnv = getMetaEnv();

const getEnv = (metaVal: string | undefined, processKey: string, fallback: string): string => {
  let val = metaVal;
  if (!val && typeof process !== 'undefined' && process.env && process.env[processKey]) {
    val = process.env[processKey];
  }
  if (!val) {
    val = fallback;
  }
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

const rawToken = getEnv(
  metaEnv.VITE_PADDLE_CLIENT_TOKEN,
  'VITE_PADDLE_CLIENT_TOKEN',
  'live_ff98bcb698b681e88f039a1097b'
);

const defaultEnv = rawToken.startsWith('live_') ? 'production' : 'sandbox';

export const PADDLE_CONFIG = {
  environment: (getEnv(
    metaEnv.VITE_PADDLE_ENVIRONMENT,
    'VITE_PADDLE_ENVIRONMENT',
    defaultEnv
  ) as 'sandbox' | 'production') || defaultEnv,

  clientToken: rawToken,

  priceIds: {
    proMonthly: getEnv(
      metaEnv.VITE_PADDLE_PRO_MONTHLY_PRICE_ID,
      'VITE_PADDLE_PRO_MONTHLY_PRICE_ID',
      'pri_01kzv66qktfknx85x73xer2qgj'
    ),
    proYearly: getEnv(
      metaEnv.VITE_PADDLE_PRO_YEARLY_PRICE_ID,
      'VITE_PADDLE_PRO_YEARLY_PRICE_ID',
      'pri_01kzv6jmxvp82kaym27fpt92dn'
    ),
    premiumMonthly: getEnv(
      metaEnv.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID,
      'VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID',
      'pri_01kzv6fev3d3n02cwx6bzdwsag'
    ),
    premiumYearly: getEnv(
      metaEnv.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID,
      'VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID',
      'pri_01kzv6m5hxxgsc4x829zy2bnhe'
    ),
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


import { BillingCycle } from '../types';

export interface PaddlePlanMapping {
  plan: 'Pro' | 'Business' | 'Premium';
  billingCycle: BillingCycle;
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

const explicitEnv = getEnv(metaEnv.VITE_PADDLE_ENVIRONMENT, 'VITE_PADDLE_ENVIRONMENT', '');
const explicitToken = getEnv(metaEnv.VITE_PADDLE_CLIENT_TOKEN, 'VITE_PADDLE_CLIENT_TOKEN', '');

// Determine environment
const environment: 'sandbox' | 'production' =
  explicitEnv === 'production'
    ? 'production'
    : explicitEnv === 'sandbox'
    ? 'sandbox'
    : explicitToken.startsWith('live_')
    ? 'production'
    : 'sandbox';

// Determine clientToken: ensure token prefix matches target environment
let clientToken = explicitToken;
if (!clientToken) {
  clientToken =
    environment === 'production'
      ? 'live_ff98bcb698b681e88f039a1097b'
      : 'test_4edba2ed321c928c96b435a966d';
} else if (environment === 'sandbox' && clientToken.startsWith('live_')) {
  console.warn(
    '[PADDLE CONFIG] Live token provided for Sandbox environment. Falling back to Sandbox token (test_...) to match Sandbox Price IDs.'
  );
  clientToken = 'test_4edba2ed321c928c96b435a966d';
} else if (environment === 'production' && clientToken.startsWith('test_')) {
  console.warn(
    '[PADDLE CONFIG] Test token provided for Production environment. Falling back to Live token for Production.'
  );
  clientToken = 'live_ff98bcb698b681e88f039a1097b';
}

export const PADDLE_CONFIG = {
  environment,
  clientToken,

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
    proFiveYear: getEnv(
      metaEnv.VITE_PADDLE_PRO_FIVE_YEAR_PRICE_ID,
      'VITE_PADDLE_PRO_FIVE_YEAR_PRICE_ID',
      'pri_01kzv6jmxvp82kaym27fpt95yr'
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
    premiumFiveYear: getEnv(
      metaEnv.VITE_PADDLE_PREMIUM_FIVE_YEAR_PRICE_ID,
      'VITE_PADDLE_PREMIUM_FIVE_YEAR_PRICE_ID',
      'pri_01kzv6m5hxxgsc4x829zy2b5yr'
    ),
  },
};

/**
 * Returns the exact Paddle Price ID for a given plan and billing cycle.
 */
export const getPaddlePriceId = (
  plan: 'Pro' | 'Business' | 'Premium',
  billingCycle: BillingCycle
): string => {
  const isPremium = plan === 'Premium' || plan === 'Business';
  if (isPremium) {
    if (billingCycle === 'five_year') return PADDLE_CONFIG.priceIds.premiumFiveYear;
    if (billingCycle === 'yearly') return PADDLE_CONFIG.priceIds.premiumYearly;
    return PADDLE_CONFIG.priceIds.premiumMonthly;
  }
  if (billingCycle === 'five_year') return PADDLE_CONFIG.priceIds.proFiveYear;
  if (billingCycle === 'yearly') return PADDLE_CONFIG.priceIds.proYearly;
  return PADDLE_CONFIG.priceIds.proMonthly;
};

/**
 * Determines plan name and billing cycle from a given Paddle Price ID.
 */
export const getPlanAndCycleFromPriceId = (
  priceId: string
): { plan: 'Pro' | 'Premium'; billingCycle: BillingCycle } => {
  const { priceIds } = PADDLE_CONFIG;
  if (priceId === priceIds.premiumFiveYear) {
    return { plan: 'Premium', billingCycle: 'five_year' };
  }
  if (priceId === priceIds.premiumYearly) {
    return { plan: 'Premium', billingCycle: 'yearly' };
  }
  if (priceId === priceIds.premiumMonthly) {
    return { plan: 'Premium', billingCycle: 'monthly' };
  }
  if (priceId === priceIds.proFiveYear) {
    return { plan: 'Pro', billingCycle: 'five_year' };
  }
  if (priceId === priceIds.proYearly) {
    return { plan: 'Pro', billingCycle: 'yearly' };
  }
  return { plan: 'Pro', billingCycle: 'monthly' };
};


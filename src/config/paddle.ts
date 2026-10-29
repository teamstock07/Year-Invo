import { BillingCycle } from '../types';

export type PaddleBillingDuration = 'monthly' | '6_month' | 'yearly' | '5_year';

export interface PaddlePlanMapping {
  plan: 'Pro' | 'Premium';
  billingCycle: BillingCycle;
  billingDuration: PaddleBillingDuration;
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

const getEnv = (metaVal: string | undefined, processKey: string, fallback: string = ''): string => {
  let val = metaVal;
  if (!val && typeof process !== 'undefined' && process.env && process.env[processKey]) {
    val = process.env[processKey];
  }
  if (!val) {
    val = fallback;
  }
  return (val || '').trim().replace(/^["']|["']$/g, '').trim();
};

// 1. Paddle Environment ('production' | 'sandbox')
const rawEnv =
  getEnv(metaEnv.VITE_PADDLE_ENVIRONMENT, 'VITE_PADDLE_ENVIRONMENT', '') ||
  getEnv(metaEnv.PADDLE_ENVIRONMENT, 'PADDLE_ENVIRONMENT', '') ||
  (typeof process !== 'undefined' && process.env?.PADDLE_ENVIRONMENT) ||
  '';

const explicitToken =
  getEnv(metaEnv.VITE_PADDLE_CLIENT_TOKEN, 'VITE_PADDLE_CLIENT_TOKEN', '') ||
  getEnv(metaEnv.PADDLE_CLIENT_TOKEN, 'PADDLE_CLIENT_TOKEN', '') ||
  (typeof process !== 'undefined' && process.env?.PADDLE_CLIENT_TOKEN) ||
  '';

export const environment: 'sandbox' | 'production' =
  rawEnv === 'sandbox' || (explicitToken.startsWith('test_') && rawEnv !== 'production')
    ? 'sandbox'
    : 'production';

// 2. Paddle Client-side Token (Public - never secret keys)
export const clientToken = explicitToken || '';

// 3. Exactly EIGHT Paid Price IDs Configuration
// PRO (Monthly, 6 Months, Yearly, 5 Years)
const proMonthlyPriceId =
  getEnv(metaEnv.VITE_PADDLE_PRO_MONTHLY_PRICE_ID, 'PADDLE_PRO_MONTHLY_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PRO_MONTHLY_PRICE_ID, 'VITE_PADDLE_PRO_MONTHLY_PRICE_ID', '') ||
  '';

const pro6MonthPriceId =
  getEnv(metaEnv.VITE_PADDLE_PRO_6_MONTH_PRICE_ID, 'PADDLE_PRO_6_MONTH_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PRO_6_MONTH_PRICE_ID, 'VITE_PADDLE_PRO_6_MONTH_PRICE_ID', '') ||
  '';

const proYearlyPriceId =
  getEnv(metaEnv.VITE_PADDLE_PRO_YEARLY_PRICE_ID, 'PADDLE_PRO_YEARLY_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PRO_YEARLY_PRICE_ID, 'VITE_PADDLE_PRO_YEARLY_PRICE_ID', '') ||
  '';

const pro5YearPriceId =
  getEnv(metaEnv.VITE_PADDLE_PRO_5_YEAR_PRICE_ID, 'PADDLE_PRO_5_YEAR_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PRO_5_YEAR_PRICE_ID, 'VITE_PADDLE_PRO_5_YEAR_PRICE_ID', '') ||
  '';

// PREMIUM (Monthly, 6 Months, Yearly, 5 Years)
const premiumMonthlyPriceId =
  getEnv(metaEnv.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID, 'PADDLE_PREMIUM_MONTHLY_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PREMIUM_MONTHLY_PRICE_ID, 'VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID', '') ||
  '';

const premium6MonthPriceId =
  getEnv(metaEnv.VITE_PADDLE_PREMIUM_6_MONTH_PRICE_ID, 'PADDLE_PREMIUM_6_MONTH_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PREMIUM_6_MONTH_PRICE_ID, 'VITE_PADDLE_PREMIUM_6_MONTH_PRICE_ID', '') ||
  '';

const premiumYearlyPriceId =
  getEnv(metaEnv.VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID, 'PADDLE_PREMIUM_YEARLY_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PREMIUM_YEARLY_PRICE_ID, 'VITE_PADDLE_PREMIUM_YEARLY_PRICE_ID', '') ||
  '';

const premium5YearPriceId =
  getEnv(metaEnv.VITE_PADDLE_PREMIUM_5_YEAR_PRICE_ID, 'PADDLE_PREMIUM_5_YEAR_PRICE_ID', '') ||
  getEnv(metaEnv.PADDLE_PREMIUM_5_YEAR_PRICE_ID, 'VITE_PADDLE_PREMIUM_5_YEAR_PRICE_ID', '') ||
  '';

export const PADDLE_CONFIG = {
  environment,
  clientToken,
  checkoutEnabled: true as boolean,
  checkoutStatusReason: '' as string,

  priceIds: {
    // Pro Tier (4 Durations)
    proMonthly: proMonthlyPriceId,
    pro6Month: pro6MonthPriceId,
    proYearly: proYearlyPriceId,
    pro5Year: pro5YearPriceId,

    // Aliases for compatibility
    proBase: proMonthlyPriceId,
    proSixMonth: pro6MonthPriceId,
    proFiveYear: pro5YearPriceId,

    // Premium Tier (4 Durations)
    premiumMonthly: premiumMonthlyPriceId,
    premium6Month: premium6MonthPriceId,
    premiumYearly: premiumYearlyPriceId,
    premium5Year: premium5YearPriceId,

    // Aliases for compatibility
    premiumBase: premiumMonthlyPriceId,
    premiumSixMonth: premium6MonthPriceId,
    premiumFiveYear: premium5YearPriceId,
  },
};

/**
 * Dynamically synchronizes Paddle configuration with the server runtime endpoint (/api/paddle/config)
 * if client-side variables were not baked in at build time.
 */
let syncPromise: Promise<typeof PADDLE_CONFIG> | null = null;

export const syncPaddleRuntimeConfig = async (forceRefresh = false): Promise<typeof PADDLE_CONFIG> => {
  if (typeof window === 'undefined') {
    return PADDLE_CONFIG;
  }

  if (syncPromise && !forceRefresh) {
    return syncPromise;
  }

  syncPromise = (async () => {
    try {
      const url = forceRefresh ? '/api/paddle/config?refresh=true' : '/api/paddle/config';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.environment) {
          PADDLE_CONFIG.environment = data.environment;
        }
        if (data.clientToken && !PADDLE_CONFIG.clientToken) {
          PADDLE_CONFIG.clientToken = data.clientToken;
        }
        if (typeof data.checkoutEnabled === 'boolean') {
          PADDLE_CONFIG.checkoutEnabled = data.checkoutEnabled;
          PADDLE_CONFIG.checkoutStatusReason = data.checkoutStatusReason || '';
        }
        if (data.priceIds) {
          if (data.priceIds.proMonthly) {
            PADDLE_CONFIG.priceIds.proMonthly = data.priceIds.proMonthly;
            PADDLE_CONFIG.priceIds.proBase = data.priceIds.proMonthly;
          }
          if (data.priceIds.pro6Month) {
            PADDLE_CONFIG.priceIds.pro6Month = data.priceIds.pro6Month;
            PADDLE_CONFIG.priceIds.proSixMonth = data.priceIds.pro6Month;
          }
          if (data.priceIds.proYearly) {
            PADDLE_CONFIG.priceIds.proYearly = data.priceIds.proYearly;
          }
          if (data.priceIds.pro5Year) {
            PADDLE_CONFIG.priceIds.pro5Year = data.priceIds.pro5Year;
            PADDLE_CONFIG.priceIds.proFiveYear = data.priceIds.pro5Year;
          }

          if (data.priceIds.premiumMonthly) {
            PADDLE_CONFIG.priceIds.premiumMonthly = data.priceIds.premiumMonthly;
            PADDLE_CONFIG.priceIds.premiumBase = data.priceIds.premiumMonthly;
          }
          if (data.priceIds.premium6Month) {
            PADDLE_CONFIG.priceIds.premium6Month = data.priceIds.premium6Month;
            PADDLE_CONFIG.priceIds.premiumSixMonth = data.priceIds.premium6Month;
          }
          if (data.priceIds.premiumYearly) {
            PADDLE_CONFIG.priceIds.premiumYearly = data.priceIds.premiumYearly;
          }
          if (data.priceIds.premium5Year) {
            PADDLE_CONFIG.priceIds.premium5Year = data.priceIds.premium5Year;
            PADDLE_CONFIG.priceIds.premiumFiveYear = data.priceIds.premium5Year;
          }
        }
      }
    } catch (err) {
      console.warn('[PADDLE CONFIG] Could not fetch server runtime config, using local config:', err);
    }
    return PADDLE_CONFIG;
  })();

  return syncPromise;
};

// Initiate non-blocking runtime configuration fetch in browser
if (typeof window !== 'undefined') {
  syncPaddleRuntimeConfig().catch(() => {});
}

/**
 * Returns the exact Paddle Price ID for a given plan and billing cycle/duration.
 */
export const getPaddlePriceId = (
  plan: 'Pro' | 'Business' | 'Premium' | 'Lifetime' | string,
  billingCycle: BillingCycle | string
): string => {
  const normPlan = plan === 'Premium' || plan === 'Business' || plan === 'Lifetime' ? 'Premium' : 'Pro';
  const normCycle = (billingCycle || 'monthly').toString().toLowerCase();

  const isSixMonths = normCycle === 'six_months' || normCycle === '6_month' || normCycle === '6months';
  const isYearly = normCycle === 'yearly' || normCycle === '1_year' || normCycle === 'annual';
  const isFiveYear = normCycle === 'five_year' || normCycle === '5_year' || normCycle === '5years';

  if (normPlan === 'Premium') {
    if (isFiveYear) return PADDLE_CONFIG.priceIds.premium5Year || PADDLE_CONFIG.priceIds.premiumFiveYear;
    if (isYearly) return PADDLE_CONFIG.priceIds.premiumYearly;
    if (isSixMonths) return PADDLE_CONFIG.priceIds.premium6Month || PADDLE_CONFIG.priceIds.premiumSixMonth;
    return PADDLE_CONFIG.priceIds.premiumMonthly || PADDLE_CONFIG.priceIds.premiumBase;
  }

  // Pro Plan
  if (isFiveYear) return PADDLE_CONFIG.priceIds.pro5Year || PADDLE_CONFIG.priceIds.proFiveYear;
  if (isYearly) return PADDLE_CONFIG.priceIds.proYearly;
  if (isSixMonths) return PADDLE_CONFIG.priceIds.pro6Month || PADDLE_CONFIG.priceIds.proSixMonth;
  return PADDLE_CONFIG.priceIds.proMonthly || PADDLE_CONFIG.priceIds.proBase;
};

/**
 * Determines plan name and billing cycle/duration from a given Paddle Price ID.
 */
export const getPlanAndCycleFromPriceId = (
  priceId: string
): {
  plan: 'Pro' | 'Premium';
  billingCycle: BillingCycle;
  billingDuration: PaddleBillingDuration;
} => {
  const cleanId = (priceId || '').trim();
  const { priceIds } = PADDLE_CONFIG;

  // Check Premium Price IDs
  if (cleanId && (
    cleanId === priceIds.premium5Year ||
    cleanId === priceIds.premiumFiveYear ||
    cleanId === priceIds.premiumYearly ||
    cleanId === priceIds.premium6Month ||
    cleanId === priceIds.premiumSixMonth ||
    cleanId === priceIds.premiumMonthly ||
    cleanId === priceIds.premiumBase
  )) {
    if (cleanId === priceIds.premium5Year || cleanId === priceIds.premiumFiveYear) {
      return { plan: 'Premium', billingCycle: 'five_year', billingDuration: '5_year' };
    }
    if (cleanId === priceIds.premiumYearly) {
      return { plan: 'Premium', billingCycle: 'yearly', billingDuration: 'yearly' };
    }
    if (cleanId === priceIds.premium6Month || cleanId === priceIds.premiumSixMonth) {
      return { plan: 'Premium', billingCycle: 'six_months', billingDuration: '6_month' };
    }
    return { plan: 'Premium', billingCycle: 'monthly', billingDuration: 'monthly' };
  }

  // Check Pro Price IDs
  if (cleanId && (
    cleanId === priceIds.pro5Year ||
    cleanId === priceIds.proFiveYear ||
    cleanId === priceIds.proYearly ||
    cleanId === priceIds.pro6Month ||
    cleanId === priceIds.proSixMonth ||
    cleanId === priceIds.proMonthly ||
    cleanId === priceIds.proBase
  )) {
    if (cleanId === priceIds.pro5Year || cleanId === priceIds.proFiveYear) {
      return { plan: 'Pro', billingCycle: 'five_year', billingDuration: '5_year' };
    }
    if (cleanId === priceIds.proYearly) {
      return { plan: 'Pro', billingCycle: 'yearly', billingDuration: 'yearly' };
    }
    if (cleanId === priceIds.pro6Month || cleanId === priceIds.proSixMonth) {
      return { plan: 'Pro', billingCycle: 'six_months', billingDuration: '6_month' };
    }
    return { plan: 'Pro', billingCycle: 'monthly', billingDuration: 'monthly' };
  }

  // Fallback defaults
  return { plan: 'Pro', billingCycle: 'monthly', billingDuration: 'monthly' };
};

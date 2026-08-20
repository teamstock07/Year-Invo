/**
 * Centralized Subscription Pricing Configuration & Engine for YearInvo
 * 
 * Single Source of Truth for:
 * - 3 Exact Plans: Free Trial (15 days), Pro, Premium
 * - 3 Supported Billing Periods: 1 Month (monthly), 6 Months (six_months), 1 Year (yearly)
 * - Bangladesh (BDT) Local Pricing & Discounts (Pro: ৳100 intro/৳150, ৳765 6mo, ৳1,440 1yr; Premium: ৳250 mo, ৳1,275 6mo, ৳3,000 1yr)
 * - International (USD) Base Pricing & Discounts (Pro: $1.50 mo, $7.65 6mo, $14.40 1yr; Premium: $3.50 mo, $17.85 6mo, $30.00 1yr)
 * - Dynamic Live Currency Conversion Engine for any display currency
 * - Authoritative Plan Limits and Feature Restrictions
 */

import { BillingCycle, SubscriptionPlan, Language } from '../types';
import {
  convertCurrency,
  formatMoney,
  normalizeCurrencyCode,
  getCurrencySymbol,
} from '../services/currencyService';

export type { BillingCycle, SubscriptionPlan };

export interface PlanPricingDefinition {
  monthly: number;
  monthlyRenewal?: number;
  monthlyIntro?: number;
  sixMonths: number;
  sixMonthsDiscountPercent: number;
  yearly: number;
  yearlyDiscountPercent: number;
  fiveYear?: number;
  fiveYearDiscountPercent?: number;
}

export interface RegionalPricingConfig {
  currency: string;
  currencySymbol: string;
  pro: PlanPricingDefinition;
  premium: PlanPricingDefinition;
}

export const PRICING_CONFIG = {
  bangladesh: {
    currency: 'BDT',
    currencySymbol: '৳',
    pro: {
      monthly: 100, // Introductory ৳100 first month / ৳150 regular renewal
      monthlyIntro: 100,
      monthlyRenewal: 150,
      sixMonths: 765, // ৳765 (Save 15% compared to 6 × ৳150 = ৳900)
      sixMonthsDiscountPercent: 15,
      yearly: 1440, // ৳1,440 (Save 20% compared to 12 × ৳150 = ৳1,800)
      yearlyDiscountPercent: 20,
      fiveYear: 6000,
      fiveYearDiscountPercent: 33,
    },
    premium: {
      monthly: 250, // ৳250 / month
      monthlyIntro: 250,
      monthlyRenewal: 250,
      sixMonths: 1275, // ৳1,275 (Save 15% compared to 6 × ৳250 = ৳1,500)
      sixMonthsDiscountPercent: 15,
      yearly: 3000, // ৳3,000 base 1-year rate
      yearlyDiscountPercent: 0,
      fiveYear: 12000,
      fiveYearDiscountPercent: 20,
    },
  },
  international: {
    currency: 'USD',
    currencySymbol: '$',
    baseCurrency: 'USD',
    pro: {
      monthly: 1.50, // $1.50 / month
      monthlyIntro: 1.50,
      monthlyRenewal: 1.50,
      sixMonths: 7.65, // $7.65 (Save 15% vs 6 × $1.50 = $9.00)
      sixMonthsDiscountPercent: 15,
      yearly: 14.40, // $14.40 (Save 20% vs 12 × $1.50 = $18.00)
      yearlyDiscountPercent: 20,
      fiveYear: 60.00,
      fiveYearDiscountPercent: 33,
    },
    premium: {
      monthly: 3.50, // $3.50 / month
      monthlyIntro: 3.50,
      monthlyRenewal: 3.50,
      sixMonths: 17.85, // $17.85 (Save 15% vs 6 × $3.50 = $21.00)
      sixMonthsDiscountPercent: 15,
      yearly: 30.00, // $30.00 (Save 28.6% vs 12 × $3.50 = $42.00)
      yearlyDiscountPercent: 29,
      fiveYear: 120.00,
      fiveYearDiscountPercent: 43,
    },
  },
};

export const pricingConfig = {
  bangladesh: {
    currency: 'BDT',
    proMonthly: PRICING_CONFIG.bangladesh.pro.monthly,
    premiumMonthly: PRICING_CONFIG.bangladesh.premium.monthly,
  },
  international: {
    baseCurrency: 'USD',
    proMonthly: PRICING_CONFIG.international.pro.monthly,
    premiumMonthly: PRICING_CONFIG.international.premium.monthly,
  },
} as const;

/**
 * Plan Feature Matrix & Limit Definitions
 */
export interface PlanLimits {
  plan: SubscriptionPlan;
  trialDays: number;
  maxProducts: number;
  maxStockTotal: number;
  maxSalesPerDay: number;
  isPosAllowed: boolean;
  isTeamManagementAllowed: boolean;
  isQrBarcodeAllowed: boolean;
  isMultiBranchAllowed: boolean;
  isAiInsightsAllowed: boolean;
  isPayrollAllowed: boolean;
  isExpired?: boolean;
}

export const PLAN_LIMITS: Record<'Free' | 'Pro' | 'Premium', Omit<PlanLimits, 'plan'>> = {
  Free: {
    trialDays: 15,
    maxProducts: 5,
    maxStockTotal: 500,
    maxSalesPerDay: 50,
    isPosAllowed: false,
    isTeamManagementAllowed: false,
    isQrBarcodeAllowed: false,
    isMultiBranchAllowed: false,
    isAiInsightsAllowed: false,
    isPayrollAllowed: false,
  },
  Pro: {
    trialDays: 0,
    maxProducts: Number.POSITIVE_INFINITY,
    maxStockTotal: Number.POSITIVE_INFINITY,
    maxSalesPerDay: Number.POSITIVE_INFINITY,
    isPosAllowed: false,
    isTeamManagementAllowed: false,
    isQrBarcodeAllowed: true, // Basic barcode labels
    isMultiBranchAllowed: false,
    isAiInsightsAllowed: true,
    isPayrollAllowed: true,
  },
  Premium: {
    trialDays: 0,
    maxProducts: Number.POSITIVE_INFINITY,
    maxStockTotal: Number.POSITIVE_INFINITY,
    maxSalesPerDay: Number.POSITIVE_INFINITY,
    isPosAllowed: true,
    isTeamManagementAllowed: true,
    isQrBarcodeAllowed: true,
    isMultiBranchAllowed: true,
    isAiInsightsAllowed: true,
    isPayrollAllowed: true,
  },
};

export const getPlanLimits = (
  rawPlan: SubscriptionPlan | string | undefined | null,
  isExpired: boolean = false
): PlanLimits => {
  const norm = (
    rawPlan === 'Lifetime' || rawPlan === 'Business' || rawPlan === 'Premium'
      ? 'Premium'
      : rawPlan === 'Pro' || rawPlan === 'Tier2'
      ? 'Pro'
      : 'Free'
  ) as 'Free' | 'Pro' | 'Premium';

  const base = PLAN_LIMITS[norm];
  if (isExpired && norm !== 'Free') {
    return {
      plan: 'Free',
      ...PLAN_LIMITS.Free,
      isExpired: true,
    };
  }

  return {
    plan: norm,
    ...base,
    isExpired,
  };
};

export interface CalculatedPlanPrice {
  plan: 'Free' | 'Pro' | 'Premium';
  billingCycle: BillingCycle;
  baseCurrency: string; // 'BDT' or 'USD'
  displayCurrency: string; // The active viewing currency e.g. 'INR', 'EUR', 'USD', 'BDT'
  baseMonthly: number;
  months: number;
  originalBaseTotal: number;
  finalBaseTotal: number;
  displayTotal: number; // Converted numeric amount
  total: number; // alias to displayTotal
  finalTotal: number; // alias to displayTotal for backwards compatibility
  totalFormatted: string;
  savings: number;
  savingsFormatted: string;
  discountPercent: number; // e.g. 0, 15, 20, 28
  effectiveMonthly: number;
  effectiveMonthlyFormatted: string;
  currency: string;
  currencySymbol: string;
  isConverted: boolean;
  renewalNotice?: string;
}

/**
 * Formats numeric price cleanly with 2 decimals or integer if zero cents
 */
export const getPlanPriceFormatted = (amount: number, currency: string = 'USD'): string => {
  return formatMoney(amount, currency, currency);
};

/**
 * Checks whether a given country string represents Bangladesh
 */
export const isBangladeshCountry = (country?: string | null): boolean => {
  if (!country) return false;
  const c = country.trim().toLowerCase();
  return (
    c === 'bangladesh' ||
    c === 'bd' ||
    c === 'bgd' ||
    c === 'bangladesh (bd)' ||
    c === 'বাংলাদেশ'
  );
};

/**
 * Calculates accurate pricing for any plan and billing cycle.
 */
export const calculatePlanPricing = (
  plan: SubscriptionPlan | string,
  billingCycle: BillingCycle,
  isBangladeshOrCountry?: boolean | string,
  targetDisplayCurrency?: string,
  customRates?: Record<string, number> | null,
  lang: Language | string = 'en'
): CalculatedPlanPrice => {
  // Determine effective display currency
  let rawCurrency = targetDisplayCurrency;
  if (!rawCurrency && typeof isBangladeshOrCountry === 'string' && !isBangladeshCountry(isBangladeshOrCountry)) {
    rawCurrency = isBangladeshOrCountry;
  }
  if (!rawCurrency) {
    rawCurrency = (isBangladeshOrCountry === true || isBangladeshCountry(isBangladeshOrCountry as string)) ? 'BDT' : 'USD';
  }

  const displayCurrency = normalizeCurrencyCode(rawCurrency);
  const displaySymbol = getCurrencySymbol(displayCurrency);

  const isBDT = displayCurrency === 'BDT';
  const baseCurrency = isBDT ? PRICING_CONFIG.bangladesh.currency : PRICING_CONFIG.international.currency;

  const normPlan = (plan === 'Business' || plan === 'Premium' ? 'Premium' : plan === 'Pro' ? 'Pro' : 'Free') as
    | 'Free'
    | 'Pro'
    | 'Premium';

  const months = billingCycle === 'five_year' ? 60 : billingCycle === 'yearly' ? 12 : billingCycle === 'six_months' ? 6 : 1;

  if (normPlan === 'Free') {
    return {
      plan: 'Free',
      billingCycle,
      baseCurrency,
      displayCurrency,
      baseMonthly: 0,
      months,
      originalBaseTotal: 0,
      finalBaseTotal: 0,
      displayTotal: 0,
      total: 0,
      finalTotal: 0,
      totalFormatted: formatMoney(0, baseCurrency, displayCurrency, lang, undefined, customRates),
      savings: 0,
      savingsFormatted: formatMoney(0, baseCurrency, displayCurrency, lang, undefined, customRates),
      discountPercent: 0,
      effectiveMonthly: 0,
      effectiveMonthlyFormatted: formatMoney(0, baseCurrency, displayCurrency, lang, undefined, customRates),
      currency: displayCurrency,
      currencySymbol: displaySymbol,
      isConverted: false,
    };
  }

  const regional = isBDT ? PRICING_CONFIG.bangladesh : PRICING_CONFIG.international;
  const planDef = normPlan === 'Pro' ? regional.pro : regional.premium;
  const monthlyPrice = planDef.monthly;

  let discountPercent = 0;
  let finalBaseTotal = monthlyPrice;
  const baseMonthlyNominal = (planDef as any).monthlyRenewal || monthlyPrice;
  const originalBaseTotal = baseMonthlyNominal * months;

  if (billingCycle === 'monthly') {
    finalBaseTotal = monthlyPrice;
    discountPercent = 0;
  } else if (billingCycle === 'six_months') {
    finalBaseTotal = planDef.sixMonths;
    discountPercent = planDef.sixMonthsDiscountPercent;
  } else if (billingCycle === 'yearly') {
    finalBaseTotal = planDef.yearly;
    discountPercent = planDef.yearlyDiscountPercent;
  } else if (billingCycle === 'five_year') {
    finalBaseTotal = planDef.fiveYear || planDef.yearly * 4;
    discountPercent = planDef.fiveYearDiscountPercent || 25;
  }

  const baseSavings = Math.max(0, Math.round((originalBaseTotal - finalBaseTotal) * 100) / 100);

  // Convert from USD base currency to selected display currency using live rates (when not BDT and not USD)
  const isConverted = !isBDT && displayCurrency !== 'USD';
  const displayTotal = isConverted
    ? convertCurrency(finalBaseTotal, 'USD', displayCurrency, customRates)
    : finalBaseTotal;

  const displaySavings = isConverted
    ? convertCurrency(baseSavings, 'USD', displayCurrency, customRates)
    : baseSavings;

  const effectiveMonthly = Math.round((displayTotal / months) * 100) / 100;

  let renewalNotice: string | undefined = undefined;
  if (normPlan === 'Pro' && isBDT && billingCycle === 'monthly') {
    renewalNotice = '১ম মাস ১০০৳ (বিশেষ অফার), পরবর্তী মাস থেকে নিয়মিত ১৫০৳/মাস';
  }

  return {
    plan: normPlan,
    billingCycle,
    baseCurrency,
    displayCurrency,
    baseMonthly: monthlyPrice,
    months,
    originalBaseTotal,
    finalBaseTotal,
    displayTotal,
    total: displayTotal,
    finalTotal: displayTotal,
    totalFormatted: formatMoney(finalBaseTotal, baseCurrency, displayCurrency, lang, undefined, customRates),
    savings: displaySavings,
    savingsFormatted: formatMoney(baseSavings, baseCurrency, displayCurrency, lang, undefined, customRates),
    discountPercent,
    effectiveMonthly,
    effectiveMonthlyFormatted: formatMoney(finalBaseTotal / months, baseCurrency, displayCurrency, lang, undefined, customRates),
    currency: displayCurrency,
    currencySymbol: displaySymbol,
    isConverted,
    renewalNotice,
  };
};

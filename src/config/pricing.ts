/**
 * Centralized Subscription Pricing Configuration & Engine for YearInvo
 * 
 * Single Source of Truth for:
 * - Bangladesh (BDT) Local Pricing & Discounts (৳100 Pro, ৳250 Premium)
 * - International (USD) Base Pricing & Discounts ($1.50 Pro, $3.50 Premium)
 * - Monthly / Yearly (12-mo with discounts) / 5-Year (60-mo with 25% discount)
 * - Dynamic Live Currency Conversion Engine for any display currency (from USD base)
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
  yearlyDiscount: number; // e.g. 0.50 for 50%, 0.15 for 15%
  fiveYearDiscount: number; // e.g. 0.25 for 25%
}

export interface RegionalPricingConfig {
  currency: string;
  currencySymbol: string;
  pro: PlanPricingDefinition;
  premium: PlanPricingDefinition;
}

/**
 * Centralized Pricing Source of Truth
 */
export const pricingConfig = {
  bangladesh: {
    currency: 'BDT',
    proMonthly: 100,
    premiumMonthly: 250,
  },
  international: {
    baseCurrency: 'USD',
    proMonthly: 1.50,
    premiumMonthly: 3.50,
  },
} as const;

export const PRICING_CONFIG = {
  bangladesh: {
    currency: pricingConfig.bangladesh.currency,
    currencySymbol: '৳',
    pro: {
      monthly: pricingConfig.bangladesh.proMonthly,
      yearlyDiscount: 0.50, // 50% discount from 12-month equivalent (৳100 * 12 * 0.5 = ৳600/yr)
      fiveYearDiscount: 0.25, // 25% discount from 60-month equivalent (৳100 * 60 * 0.75 = ৳4500/5yr)
    },
    premium: {
      monthly: pricingConfig.bangladesh.premiumMonthly,
      yearlyDiscount: 0.15, // 15% discount from 12-month equivalent (৳250 * 12 * 0.85 = ৳2550/yr)
      fiveYearDiscount: 0.25, // 25% discount from 60-month equivalent (৳250 * 60 * 0.75 = ৳11250/5yr)
    },
  },
  international: {
    baseCurrency: pricingConfig.international.baseCurrency,
    currencySymbol: '$',
    pro: {
      monthly: pricingConfig.international.proMonthly,
      yearlyDiscount: 0.50, // 50% discount ($1.50 * 12 * 0.50 = $9.00/yr)
      fiveYearDiscount: 0.25, // 25% discount ($1.50 * 60 * 0.75 = $67.50/5yr)
    },
    premium: {
      monthly: pricingConfig.international.premiumMonthly,
      yearlyDiscount: 0.15, // 15% discount ($3.50 * 12 * 0.85 = $35.70/yr)
      fiveYearDiscount: 0.25, // 25% discount ($3.50 * 60 * 0.75 = $157.50/5yr)
    },
  },
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
  discountPercent: number; // 0, 15, 25, 50
  effectiveMonthly: number;
  effectiveMonthlyFormatted: string;
  currency: string;
  currencySymbol: string;
  isConverted: boolean;
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
 * 
 * Rules:
 * 1. BANGLADESH BASE (selected currency = BDT):
 *    Pro = ৳100 / mo, Premium = ৳250 / mo. Fixed local tier, no exchange rate conversion.
 * 2. INTERNATIONAL BASE (selected currency != BDT):
 *    Pro = $1.50 USD / mo, Premium = $3.50 USD / mo.
 *    Converted from USD base to selected currency (USD, INR, EUR, PKR, AED, etc.) using live exchange rates.
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

  // BASE PRICING SELECTION:
  // BDT is dedicated fixed local pricing tier.
  // Any other currency uses USD base ($1.50 Pro, $3.50 Premium) and converts via live exchange rates.
  const isBDT = displayCurrency === 'BDT';
  const baseCurrency = isBDT ? pricingConfig.bangladesh.currency : pricingConfig.international.baseCurrency;

  const normPlan = (plan === 'Business' || plan === 'Premium' ? 'Premium' : plan === 'Pro' ? 'Pro' : 'Free') as
    | 'Free'
    | 'Pro'
    | 'Premium';

  const months = billingCycle === 'five_year' ? 60 : billingCycle === 'yearly' ? 12 : 1;

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
  const originalBaseTotal = monthlyPrice * months;

  if (billingCycle === 'monthly') {
    finalBaseTotal = monthlyPrice;
    discountPercent = 0;
  } else if (billingCycle === 'yearly') {
    discountPercent = Math.round(planDef.yearlyDiscount * 100);
    finalBaseTotal = Math.round(originalBaseTotal * (1 - planDef.yearlyDiscount) * 100) / 100;
  } else if (billingCycle === 'five_year') {
    discountPercent = Math.round(planDef.fiveYearDiscount * 100);
    finalBaseTotal = Math.round(originalBaseTotal * (1 - planDef.fiveYearDiscount) * 100) / 100;
  }

  const baseSavings = Math.round((originalBaseTotal - finalBaseTotal) * 100) / 100;

  // Convert from USD base currency to selected display currency using live rates (when not BDT and not USD)
  const isConverted = !isBDT && displayCurrency !== 'USD';
  const displayTotal = isConverted
    ? convertCurrency(finalBaseTotal, 'USD', displayCurrency, customRates)
    : finalBaseTotal;

  const displaySavings = isConverted
    ? convertCurrency(baseSavings, 'USD', displayCurrency, customRates)
    : baseSavings;

  const effectiveMonthly = Math.round((displayTotal / months) * 100) / 100;

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
  };
};

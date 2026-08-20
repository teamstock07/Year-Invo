import { BillingCycle } from '../types';
import { PRICING_CONFIG, calculatePlanPricing } from './pricing';

export type PaymentRegionId = 'international' | 'bangladesh';

export interface PlanPricingPeriod {
  monthly: number;
  sixMonths: number;
  six_months?: number;
  yearly: number;
  fiveYear: number;
  five_year?: number;
}

export interface PaymentProviderConfig {
  id: string;
  name: string;
  region: PaymentRegionId;
  enabled: boolean;
  currency: string; // 'USD' | 'BDT'
  currencySymbol: string; // '$' | '৳'
  description: string;
  badge?: string;
  logoType?: 'paddle' | 'paypal' | 'stripe' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank';
  instructions?: {
    accountName?: string;
    accountNumber?: string;
    branch?: string;
    note?: string;
  };
  supportedPlans: {
    Pro: PlanPricingPeriod;
    Premium: PlanPricingPeriod;
    Business?: PlanPricingPeriod; // Alias for Premium
  };
}

export interface PaymentRegionConfig {
  id: PaymentRegionId;
  title: string;
  subtitle: string;
  currency: string;
  currencySymbol: string;
}

export const PAYMENT_REGIONS: PaymentRegionConfig[] = [
  {
    id: 'international',
    title: 'International Payment',
    subtitle: 'Paddle Checkout: Global Cards, PayPal, Apple/Google Pay (USD)',
    currency: 'USD',
    currencySymbol: '$',
  },
  {
    id: 'bangladesh',
    title: 'Bangladesh Local Payment',
    subtitle: 'bKash, Nagad, Rocket & Bank Wire Transfer (BDT ৳)',
    currency: 'BDT',
    currencySymbol: '৳',
  },
];

// Calculated plan pricing for both regions
const bdProMo = calculatePlanPricing('Pro', 'monthly', true).finalTotal;
const bdPro6Mo = calculatePlanPricing('Pro', 'six_months', true).finalTotal;
const bdProYr = calculatePlanPricing('Pro', 'yearly', true).finalTotal;
const bdPro5Yr = calculatePlanPricing('Pro', 'five_year', true).finalTotal;

const bdPremMo = calculatePlanPricing('Premium', 'monthly', true).finalTotal;
const bdPrem6Mo = calculatePlanPricing('Premium', 'six_months', true).finalTotal;
const bdPremYr = calculatePlanPricing('Premium', 'yearly', true).finalTotal;
const bdPrem5Yr = calculatePlanPricing('Premium', 'five_year', true).finalTotal;

const intlProMo = calculatePlanPricing('Pro', 'monthly', false).finalTotal;
const intlPro6Mo = calculatePlanPricing('Pro', 'six_months', false).finalTotal;
const intlProYr = calculatePlanPricing('Pro', 'yearly', false).finalTotal;
const intlPro5Yr = calculatePlanPricing('Pro', 'five_year', false).finalTotal;

const intlPremMo = calculatePlanPricing('Premium', 'monthly', false).finalTotal;
const intlPrem6Mo = calculatePlanPricing('Premium', 'six_months', false).finalTotal;
const intlPremYr = calculatePlanPricing('Premium', 'yearly', false).finalTotal;
const intlPrem5Yr = calculatePlanPricing('Premium', 'five_year', false).finalTotal;

const bdSupportedPlans = {
  Pro: { monthly: bdProMo, sixMonths: bdPro6Mo, six_months: bdPro6Mo, yearly: bdProYr, fiveYear: bdPro5Yr },
  Premium: { monthly: bdPremMo, sixMonths: bdPrem6Mo, six_months: bdPrem6Mo, yearly: bdPremYr, fiveYear: bdPrem5Yr },
  Business: { monthly: bdPremMo, sixMonths: bdPrem6Mo, six_months: bdPrem6Mo, yearly: bdPremYr, fiveYear: bdPrem5Yr },
};

const intlSupportedPlans = {
  Pro: { monthly: intlProMo, sixMonths: intlPro6Mo, six_months: intlPro6Mo, yearly: intlProYr, fiveYear: intlPro5Yr },
  Premium: { monthly: intlPremMo, sixMonths: intlPrem6Mo, six_months: intlPrem6Mo, yearly: intlPremYr, fiveYear: intlPrem5Yr },
  Business: { monthly: intlPremMo, sixMonths: intlPrem6Mo, six_months: intlPrem6Mo, yearly: intlPremYr, fiveYear: intlPrem5Yr },
};

export const PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
  // --- International Payment Providers (Processed through official Paddle Checkout) ---
  {
    id: 'paddle_checkout',
    name: 'Paddle Checkout',
    region: 'international',
    enabled: true,
    currency: 'USD',
    currencySymbol: '$',
    description: 'Official secure global checkout with Card, PayPal, Google Pay & local methods',
    badge: 'Official Gateway',
    logoType: 'card',
    supportedPlans: intlSupportedPlans,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    region: 'international',
    enabled: true,
    currency: 'USD',
    currencySymbol: '$',
    description: 'Fast & secure checkout with PayPal via Paddle Checkout',
    logoType: 'paypal',
    supportedPlans: intlSupportedPlans,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    region: 'international',
    enabled: true,
    currency: 'USD',
    currencySymbol: '$',
    description: 'Visa, Mastercard, American Express & major cards via Paddle',
    logoType: 'card',
    supportedPlans: intlSupportedPlans,
  },

  // --- Bangladesh Payment Providers (Manual / Direct Local Mobile & Bank Transfer) ---
  {
    id: 'bkash',
    name: 'bKash Mobile Wallet',
    region: 'bangladesh',
    enabled: true,
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Send Money or Payment via bKash App or USSD *247#',
    badge: 'Most Popular',
    logoType: 'bkash',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01700000000',
      note: '1. Go to bKash App -> Send Money\n2. Enter Number: 01700000000\n3. Enter Amount & Reference (Store Name)\n4. Copy TrxID and enter below.',
    },
    supportedPlans: bdSupportedPlans,
  },
  {
    id: 'nagad',
    name: 'Nagad Mobile Banking',
    region: 'bangladesh',
    enabled: true,
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Send Money or Payment using Nagad App or USSD *167#',
    logoType: 'nagad',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01800000000',
      note: '1. Go to Nagad App -> Send Money\n2. Enter Number: 01800000000\n3. Enter Amount & Reference (Store Name)\n4. Copy TrxID and enter below.',
    },
    supportedPlans: bdSupportedPlans,
  },
  {
    id: 'rocket',
    name: 'DBBL Rocket',
    region: 'bangladesh',
    enabled: true,
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Dutch-Bangla Bank Rocket mobile banking transfer (*322#)',
    logoType: 'rocket',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01900000000-1',
      note: '1. Dial *322# or open Rocket App -> Send Money\n2. Enter Account: 01900000000-1\n3. Enter Amount & Reference\n4. Copy TrxID and enter below.',
    },
    supportedPlans: bdSupportedPlans,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Wire Transfer',
    region: 'bangladesh',
    enabled: true,
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Direct EFT / NPSB / BEFTN bank transfer to company account',
    logoType: 'bank',
    instructions: {
      accountName: 'YearInvo Software Solution',
      accountNumber: '1501203948501001',
      branch: 'Gulshan Branch, BRAC Bank PLC',
      note: 'Please include your Store Name or Email as reference in the bank transfer note/slip.',
    },
    supportedPlans: bdSupportedPlans,
  },
];

export const getEnabledProviders = (region?: PaymentRegionId): PaymentProviderConfig[] => {
  return PAYMENT_PROVIDERS.filter((p) => p.enabled && (!region || p.region === region));
};

export const getProviderById = (id: string): PaymentProviderConfig | undefined => {
  return PAYMENT_PROVIDERS.find((p) => p.id === id);
};

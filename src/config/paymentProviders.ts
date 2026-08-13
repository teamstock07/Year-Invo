export type PaymentRegionId = 'international' | 'bangladesh';

export interface PaymentProviderConfig {
  id: string;
  name: string;
  region: PaymentRegionId;
  enabled: boolean;
  currency: string; // 'USD' | 'BDT'
  currencySymbol: string; // '$' | '৳'
  description: string;
  badge?: string;
  logoType?: 'paypal' | 'stripe' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank';
  instructions?: {
    accountName?: string;
    accountNumber?: string;
    branch?: string;
    note?: string;
  };
  supportedPlans: {
    Pro: { monthly: number; yearly: number };
    Business: { monthly: number; yearly: number };
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
    subtitle: 'PayPal & Global Credit/Debit Cards (USD)',
    currency: 'USD',
    currencySymbol: '$',
  },
  {
    id: 'bangladesh',
    title: 'Bangladesh Payment',
    subtitle: 'bKash, Nagad, Rocket & Bank Transfer (BDT)',
    currency: 'BDT',
    currencySymbol: '৳',
  },
];

export const PAYMENT_PROVIDERS: PaymentProviderConfig[] = [
  // --- International Payment Providers ---
  {
    id: 'paddle',
    name: 'Paddle Billing (Cards & PayPal)',
    region: 'international',
    enabled: true,
    currency: 'USD',
    currencySymbol: '$',
    description: 'Instant Paddle Billing checkout supporting Global Credit/Debit Cards, PayPal & Apple Pay (Sandbox)',
    badge: 'Official Paddle',
    logoType: 'card',
    instructions: {
      note: 'Click "Proceed to Paddle Checkout" below to open the secure Paddle checkout modal for your selected plan.',
    },
    supportedPlans: {
      Pro: { monthly: 2.99, yearly: 26.91 },
      Business: { monthly: 5.00, yearly: 45.00 },
    },
  },
  {
    id: 'paypal',
    name: 'PayPal / Credit Card (Manual)',
    region: 'international',
    enabled: true, // Configured & active
    currency: 'USD',
    currencySymbol: '$',
    description: 'Manual transaction submission via PayPal account or International Cards',
    logoType: 'paypal',
    instructions: {
      note: 'Complete your payment via PayPal and enter your PayPal Transaction ID / Payment Reference below for manual verification.',
    },
    supportedPlans: {
      Pro: { monthly: 2.99, yearly: 26.91 },
      Business: { monthly: 5.00, yearly: 45.00 },
    },
  },
  {
    id: 'stripe',
    name: 'Stripe Direct Card',
    region: 'international',
    enabled: false, // Set to true when configured
    currency: 'USD',
    currencySymbol: '$',
    description: 'Direct credit or debit card processing via Stripe payment gateway',
    logoType: 'stripe',
    supportedPlans: {
      Pro: { monthly: 2.99, yearly: 26.91 },
      Business: { monthly: 5.00, yearly: 45.00 },
    },
  },

  // --- Bangladesh Payment Providers ---
  {
    id: 'bkash',
    name: 'bKash Mobile Wallet',
    region: 'bangladesh',
    enabled: true, // Configured & active
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Fast & secure bKash Send Money / Merchant payment via bKash App or USSD *247#',
    badge: 'Most Popular',
    logoType: 'bkash',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01700000000',
      note: '1. Go to bKash App -> Send Money\n2. Enter Number: 01700000000\n3. Enter Amount & Reference (Store Name)\n4. Copy TrxID and enter below.',
    },
    supportedPlans: {
      Pro: { monthly: 350, yearly: 3150 },
      Business: { monthly: 600, yearly: 5400 },
    },
  },
  {
    id: 'nagad',
    name: 'Nagad Mobile Banking',
    region: 'bangladesh',
    enabled: true, // Configured & active
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Send Money or Merchant Payment using Nagad App or USSD *167#',
    logoType: 'nagad',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01800000000',
      note: '1. Go to Nagad App -> Send Money\n2. Enter Number: 01800000000\n3. Enter Amount & Reference (Store Name)\n4. Copy TrxID and enter below.',
    },
    supportedPlans: {
      Pro: { monthly: 350, yearly: 3150 },
      Business: { monthly: 600, yearly: 5400 },
    },
  },
  {
    id: 'rocket',
    name: 'DBBL Rocket',
    region: 'bangladesh',
    enabled: true, // Configured & active
    currency: 'BDT',
    currencySymbol: '৳',
    description: 'Dutch-Bangla Bank Rocket mobile banking transfer',
    logoType: 'rocket',
    instructions: {
      accountName: 'YearInvo POS Ltd',
      accountNumber: '01900000000-1',
      note: '1. Dial *322# or open Rocket App -> Send Money\n2. Enter Account: 01900000000-1\n3. Enter Amount & Reference\n4. Copy TrxID and enter below.',
    },
    supportedPlans: {
      Pro: { monthly: 350, yearly: 3150 },
      Business: { monthly: 600, yearly: 5400 },
    },
  },
  {
    id: 'bank_transfer',
    name: 'Bank Wire Transfer',
    region: 'bangladesh',
    enabled: true, // Configured & active
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
    supportedPlans: {
      Pro: { monthly: 350, yearly: 3150 },
      Business: { monthly: 600, yearly: 5400 },
    },
  },
];

export const getEnabledProviders = (region?: PaymentRegionId): PaymentProviderConfig[] => {
  return PAYMENT_PROVIDERS.filter((p) => p.enabled && (!region || p.region === region));
};

export const getProviderById = (id: string): PaymentProviderConfig | undefined => {
  return PAYMENT_PROVIDERS.find((p) => p.id === id);
};

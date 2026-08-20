import { Language } from '../types';

export interface LanguageCurrencyPair {
  language: Language;
  languageName: string;
  languageNative: string;
  flag: string;
  currency: string; // Symbol: '৳', '$', '₹', '﷼', '€', '£'
  currencyCode: string; // 3-letter ISO: 'BDT', 'USD', 'INR', 'SAR', 'EUR', 'GBP'
  currencyLabel: string; // Display label: '৳ BDT', '$ USD', '₹ INR', '﷼ SAR', '€ EUR', '£ GBP'
}

/**
 * Deterministic 1:1 Bi-directional Mapping between the 6 Supported Languages
 * and the 6 Supported Currencies.
 */
export const SUPPORTED_LANGUAGE_CURRENCY_PAIRS: LanguageCurrencyPair[] = [
  {
    language: 'bn',
    languageName: 'Bengali',
    languageNative: 'বাংলা',
    flag: '🇧🇩',
    currency: '৳',
    currencyCode: 'BDT',
    currencyLabel: '৳ BDT',
  },
  {
    language: 'en',
    languageName: 'English',
    languageNative: 'English',
    flag: '🇬🇧',
    currency: '$',
    currencyCode: 'USD',
    currencyLabel: '$ USD',
  },
  {
    language: 'hi',
    languageName: 'Hindi',
    languageNative: 'हिन्दी',
    flag: '🇮🇳',
    currency: '₹',
    currencyCode: 'INR',
    currencyLabel: '₹ INR',
  },
  {
    language: 'ar',
    languageName: 'Arabic',
    languageNative: 'العربية',
    flag: '🇸🇦',
    currency: '﷼',
    currencyCode: 'SAR',
    currencyLabel: '﷼ SAR',
  },
  {
    language: 'fr',
    languageName: 'French',
    languageNative: 'Français',
    flag: '🇫🇷',
    currency: '€',
    currencyCode: 'EUR',
    currencyLabel: '€ EUR',
  },
  {
    language: 'es',
    languageName: 'Spanish',
    languageNative: 'Español',
    flag: '🇪🇸',
    currency: '£',
    currencyCode: 'GBP',
    currencyLabel: '£ GBP',
  },
];

/**
 * 1:1 Map from Language to Currency Symbol
 */
export const LANGUAGE_TO_CURRENCY_MAP: Record<Language, string> = {
  bn: '৳',
  en: '$',
  hi: '₹',
  ar: '﷼',
  fr: '€',
  es: '£',
};

/**
 * 1:1 Map from Currency Symbol/Code to Language
 */
export const CURRENCY_TO_LANGUAGE_MAP: Record<string, Language> = {
  // Bengali / BDT
  '৳': 'bn',
  'BDT': 'bn',
  
  // English / USD
  '$': 'en',
  'USD': 'en',
  
  // Hindi / INR
  '₹': 'hi',
  'INR': 'hi',
  
  // Arabic / SAR (and legacy AED alias)
  '﷼': 'ar',
  'SAR': 'ar',
  'د.إ': 'ar',
  'AED': 'ar',
  
  // French / EUR
  '€': 'fr',
  'EUR': 'fr',
  
  // Spanish / GBP
  '£': 'es',
  'GBP': 'es',
};

/**
 * Helper to get mapped currency for any language
 */
export function getMappedCurrencyForLanguage(lang: Language): string {
  return LANGUAGE_TO_CURRENCY_MAP[lang] || '৳';
}

/**
 * Helper to get mapped language for any currency symbol/code
 */
export function getMappedLanguageForCurrency(curr: string): Language {
  const clean = (curr || '').trim();
  return CURRENCY_TO_LANGUAGE_MAP[clean] || 'bn';
}

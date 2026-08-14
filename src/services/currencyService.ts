/**
 * Centralized Live Exchange Rates Service & Global Currency Engine for YearInvo
 * 
 * Requirements & Features:
 * - Live rates fetched from high-availability API (open.er-api.com / fallback)
 * - Cached in memory & localStorage (10-minute TTL)
 * - Fallback to last known valid cache if offline/error; fallback to base currency if no rate
 * - convertCurrency(amount, fromCurrency, toCurrency, rates?)
 * - getExchangeRate(fromCurrency, toCurrency)
 * - formatMoney(amount, sourceCurrency, displayCurrency, locale, options) using Intl.NumberFormat
 * - [CURRENCY DEBUG] console logs in development mode
 * - Never converts twice (always starts from source/base currency)
 */

import { useState, useEffect } from 'react';
import { Language } from '../types';

const CACHE_KEY = 'yearinvo_exchange_rates_cache_v2';
const CACHE_TIMESTAMP_KEY = 'yearinvo_exchange_rates_ts_v2';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

export interface ExchangeRatesData {
  base: string; // 'USD'
  rates: Record<string, number>;
  lastUpdated: number;
}

// In-memory rate cache
let memoryCache: ExchangeRatesData | null = null;
let activeFetchPromise: Promise<Record<string, number>> | null = null;

// Currency symbol to standard 3-letter ISO Code mapping
export const SYMBOL_TO_CODE: Record<string, string> = {
  '$': 'USD',
  '৳': 'BDT',
  '₹': 'INR',
  '€': 'EUR',
  '£': 'GBP',
  'د.إ': 'AED',
  'AED': 'AED',
  '﷼': 'SAR',
  'SAR': 'SAR',
  'Rs': 'PKR',
  'PKR': 'PKR',
  '¥': 'JPY',
  'JPY': 'JPY',
  'CNY': 'CNY',
  'C$': 'CAD',
  'CAD': 'CAD',
  'A$': 'AUD',
  'AUD': 'AUD',
  'RM': 'MYR',
  'MYR': 'MYR',
  'SG$': 'SGD',
  'SGD': 'SGD',
  'BDT': 'BDT',
  'USD': 'USD',
  'INR': 'INR',
  'EUR': 'EUR',
  'GBP': 'GBP',
};

// Code to standard symbol mapping
export const CODE_TO_SYMBOL: Record<string, string> = {
  USD: '$',
  BDT: '৳',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
  PKR: 'Rs',
  JPY: '¥',
  CNY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  MYR: 'RM',
  SGD: 'SG$',
};

// Decimals per currency (JPY/KRW = 0, others default to 2 or integer logic)
export const CURRENCY_DECIMALS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  CLP: 0,
  VND: 0,
  BDT: 2,
  USD: 2,
  EUR: 2,
  INR: 2,
  PKR: 2,
  GBP: 2,
  AED: 2,
  SAR: 2,
  CAD: 2,
  AUD: 2,
  MYR: 2,
  SGD: 2,
};

/**
 * Standard realistic baseline fallback exchange rates (USD base) used when offline or before live network fetch completes
 */
export const DEFAULT_FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  BDT: 122.0,
  INR: 86.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.6725,
  SAR: 3.75,
  PKR: 278.0,
  JPY: 154.0,
  CNY: 7.25,
  CAD: 1.38,
  AUD: 1.54,
  MYR: 4.45,
  SGD: 1.34,
};

export const normalizeCurrencyCode = (currencyOrSymbol?: string | null): string => {
  if (!currencyOrSymbol) return 'USD';
  const clean = currencyOrSymbol.trim();
  if (SYMBOL_TO_CODE[clean]) return SYMBOL_TO_CODE[clean];
  const upper = clean.toUpperCase();
  if (SYMBOL_TO_CODE[upper]) return SYMBOL_TO_CODE[upper];
  return upper.length === 3 ? upper : 'USD';
};

export const getCurrencySymbol = (currencyOrCode?: string | null): string => {
  if (!currencyOrCode) return '$';
  const clean = currencyOrCode.trim();
  if (CODE_TO_SYMBOL[clean]) return CODE_TO_SYMBOL[clean];
  const code = normalizeCurrencyCode(clean);
  return CODE_TO_SYMBOL[code] || clean;
};

/**
 * Load cached rates from localStorage
 */
const loadFromStorage = (): ExchangeRatesData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const rawTs = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (raw && rawTs) {
      const lastUpdated = parseInt(rawTs, 10);
      const rates = JSON.parse(raw);
      if (rates && typeof rates === 'object' && lastUpdated > 0) {
        return { base: 'USD', rates, lastUpdated };
      }
    }
  } catch (e) {
    console.warn('[CurrencyService] Failed to read cached exchange rates from localStorage:', e);
  }
  return null;
};

/**
 * Save rates to localStorage
 */
const saveToStorage = (rates: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
  } catch (e) {}
};

/**
 * Fetches latest live exchange rates (USD base)
 */
export const fetchLiveExchangeRates = async (): Promise<Record<string, number>> => {
  const now = Date.now();

  // Check in-memory cache
  if (memoryCache && now - memoryCache.lastUpdated < CACHE_TTL_MS) {
    return memoryCache.rates;
  }

  // Check localStorage cache
  if (!memoryCache) {
    const cached = loadFromStorage();
    if (cached) {
      memoryCache = cached;
      if (now - cached.lastUpdated < CACHE_TTL_MS) {
        return cached.rates;
      }
    }
  }

  // Deduplicate active network requests
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      // Primary Open Exchange Rate API (Live, reliable, free, CORS-enabled)
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data && data.rates && typeof data.rates === 'object') {
        const rates: Record<string, number> = {
          ...data.rates,
          USD: 1, // USD is base
        };

        memoryCache = {
          base: 'USD',
          rates,
          lastUpdated: Date.now(),
        };
        saveToStorage(rates);
        return rates;
      }
      throw new Error('Malformed exchange rate response');
    } catch (primaryErr) {
      console.warn('[CurrencyService] Primary live rates API fetch failed, trying secondary fallback:', primaryErr);

      try {
        const fallbackRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.rates) {
            const rates = { ...fallbackData.rates, USD: 1 };
            memoryCache = { base: 'USD', rates, lastUpdated: Date.now() };
            saveToStorage(rates);
            return rates;
          }
        }
      } catch (secErr) {
        console.warn('[CurrencyService] Secondary fallback API also failed:', secErr);
      }

      // Offline / API failure: Return last known valid cached rates
      if (memoryCache && memoryCache.rates) {
        console.log('[CurrencyService] Using cached exchange rates as offline fallback.');
        return memoryCache.rates;
      }

      const stored = loadFromStorage();
      if (stored && stored.rates) {
        memoryCache = stored;
        return stored.rates;
      }

      // If absolutely no network or cache, return base USD rate with fallback defaults
      return DEFAULT_FALLBACK_RATES;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
};

// Immediate background warm-up
if (typeof window !== 'undefined') {
  fetchLiveExchangeRates().catch(() => {});
}

/**
 * Gets live exchange rate between two currencies (e.g. from USD to INR, or BDT to USD)
 */
export const getLiveExchangeRate = async (from: string, to?: string): Promise<number> => {
  const fromCode = to ? normalizeCurrencyCode(from) : 'USD';
  const toCode = to ? normalizeCurrencyCode(to) : normalizeCurrencyCode(from);

  if (fromCode === toCode) return 1;

  const rates = await fetchLiveExchangeRates();
  const fromRate = rates[fromCode] || DEFAULT_FALLBACK_RATES[fromCode] || (fromCode === 'USD' ? 1 : 0);
  const toRate = rates[toCode] || DEFAULT_FALLBACK_RATES[toCode] || (toCode === 'USD' ? 1 : 0);

  if (!fromRate || !toRate) {
    return 1;
  }

  return toRate / fromRate;
};

/**
 * Alias supporting getExchangeRate("USD", "INR") or getExchangeRate("INR")
 */
export const getExchangeRate = async (fromOrTo: string, maybeTo?: string): Promise<number> => {
  return getLiveExchangeRate(fromOrTo, maybeTo);
};

/**
 * Synchronously calculates exchange rate using provided or cached rates
 */
export const getExchangeRateSync = (
  from: string,
  to: string,
  rates?: Record<string, number> | null
): number => {
  const fromCode = normalizeCurrencyCode(from);
  const toCode = normalizeCurrencyCode(to);

  if (fromCode === toCode) return 1;

  const activeRates = rates || memoryCache?.rates || loadFromStorage()?.rates || DEFAULT_FALLBACK_RATES;

  const fromRate =
    activeRates[fromCode] ||
    DEFAULT_FALLBACK_RATES[fromCode] ||
    (fromCode === 'USD' ? 1 : 0);
  const toRate =
    activeRates[toCode] ||
    DEFAULT_FALLBACK_RATES[toCode] ||
    (toCode === 'USD' ? 1 : 0);

  if (!fromRate || !toRate) return 1;

  return toRate / fromRate;
};

/**
 * Centralized Currency Conversion Function
 * Converts `amount` from `fromCurrency` to `toCurrency`.
 * Never modifies the original amount.
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string = 'BDT',
  toCurrency: string = 'BDT',
  customRates?: Record<string, number> | null
): number => {
  if (amount === 0 || isNaN(amount) || !isFinite(amount)) return 0;

  const fromCode = normalizeCurrencyCode(fromCurrency);
  const toCode = normalizeCurrencyCode(toCurrency);

  if (fromCode === toCode) return amount;

  const rate = getExchangeRateSync(fromCode, toCode, customRates);
  const converted = Math.round(amount * rate * 100) / 100;

  // Development debugging log (Requirement 27)
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
    // Only log occasional or significant conversions to keep console clean
    try {
      (window as any).__LAST_CURRENCY_CONVERSION = {
        sourceCurrency: fromCode,
        targetCurrency: toCode,
        originalAmount: amount,
        exchangeRate: rate,
        convertedAmount: converted,
        timestamp: new Date().toISOString(),
      };
    } catch (e) {}
  }

  return converted;
};

/**
 * Maps system language to BCP 47 locale string
 */
export const getLocaleForLanguage = (lang?: Language | string): string => {
  if (!lang) return 'en-US';
  const clean = lang.toLowerCase();
  if (clean === 'bn' || clean === 'bangla' || clean === 'bengali') return 'bn-BD';
  if (clean === 'hi' || clean === 'hindi') return 'hi-IN';
  if (clean === 'ar' || clean === 'arabic' || clean === 'ae' || clean === 'ur') return 'ar-SA';
  if (clean === 'fr') return 'fr-FR';
  if (clean === 'es') return 'es-ES';
  return 'en-US';
};

export interface FormatMoneyOptions {
  decimals?: number;
  disableConversion?: boolean;
  useGrouping?: boolean;
}

/**
 * Global Money Formatter (Requirement 24)
 * 1. Determines source currency and display currency.
 * 2. Fetches/uses cached live exchange rate.
 * 3. Converts amount (unless disabled).
 * 4. Formats using Intl.NumberFormat according to target currency and locale.
 */
export const formatMoney = (
  amount: number | string | undefined | null,
  sourceCurrency: string = 'BDT',
  displayCurrency: string = 'BDT',
  localeOrLang: Language | string = 'en',
  options?: FormatMoneyOptions,
  customRates?: Record<string, number> | null
): string => {
  if (amount === undefined || amount === null || amount === '') return '0';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return '0';

  const sourceCode = normalizeCurrencyCode(sourceCurrency);
  const targetCode = normalizeCurrencyCode(displayCurrency);
  const locale = getLocaleForLanguage(localeOrLang);

  // Convert amount if source and target differ and conversion is not explicitly disabled
  const effectiveAmount =
    !options?.disableConversion && sourceCode !== targetCode
      ? convertCurrency(num, sourceCode, targetCode, customRates)
      : num;

  // Determine decimal places (e.g. JPY has 0, others default to 2, or custom option)
  const defaultDecimals = CURRENCY_DECIMALS[targetCode] ?? 2;
  const decimals = options?.decimals !== undefined ? options.decimals : defaultDecimals;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: options?.useGrouping ?? true,
    });

    return formatter.format(effectiveAmount);
  } catch (e) {
    // Robust fallback if Intl.NumberFormat fails for a specific code
    const symbol = getCurrencySymbol(targetCode);
    const isZeroDec = decimals === 0 || Number.isInteger(effectiveAmount);
    const formattedNum = isZeroDec
      ? Math.round(effectiveAmount).toLocaleString(locale)
      : effectiveAmount.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return `${symbol}${formattedNum}`;
  }
};

/**
 * Formats a currency amount with symbol and appropriate decimal places
 */
export const formatCurrencyAmount = (amount: number, currency: string = 'USD'): string => {
  return formatMoney(amount, currency, currency, 'en');
};

/**
 * Synchronously converts a USD base amount to a target currency using provided or cached rates
 */
export const convertUsdSync = (
  usdAmount: number,
  targetCurrency: string,
  rates?: Record<string, number> | null
): {
  amount: number;
  formattedAmount: string;
  currencyCode: string;
  currencySymbol: string;
  isConverted: boolean;
  rateUsed: number;
} => {
  const code = normalizeCurrencyCode(targetCurrency);
  const symbol = getCurrencySymbol(code);

  if (usdAmount === 0) {
    return {
      amount: 0,
      formattedAmount: '0',
      currencyCode: code,
      currencySymbol: symbol,
      isConverted: false,
      rateUsed: 1,
    };
  }

  const converted = convertCurrency(usdAmount, 'USD', code, rates);
  const formatted = formatMoney(usdAmount, 'USD', code, 'en', undefined, rates);

  return {
    amount: converted,
    formattedAmount: formatted,
    currencyCode: code,
    currencySymbol: symbol,
    isConverted: code !== 'USD',
    rateUsed: getExchangeRateSync('USD', code, rates),
  };
};

/**
 * React Hook for component level exchange rates subscription & live conversion
 */
export const useExchangeRates = () => {
  const [rates, setRates] = useState<Record<string, number>>(() => {
    if (memoryCache) return memoryCache.rates;
    const cached = loadFromStorage();
    if (cached) {
      memoryCache = cached;
      return cached.rates;
    }
    return { USD: 1, BDT: 120 };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchLiveExchangeRates()
      .then((loadedRates) => {
        if (isMounted) {
          setRates(loadedRates);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch exchange rates');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const convert = (amount: number, from: string, to: string) => {
    return convertCurrency(amount, from, to, rates);
  };

  const format = (
    amount: number | string | undefined | null,
    sourceCurrency: string = 'BDT',
    displayCurrency: string = 'BDT',
    lang: Language | string = 'en',
    options?: FormatMoneyOptions
  ) => {
    return formatMoney(amount, sourceCurrency, displayCurrency, lang, options, rates);
  };

  const convertFromUsd = (usdAmount: number, targetCurrency: string) => {
    return convertUsdSync(usdAmount, targetCurrency, rates);
  };

  return {
    rates,
    isLoading,
    error,
    convert,
    format,
    convertFromUsd,
    getSymbol: getCurrencySymbol,
  };
};

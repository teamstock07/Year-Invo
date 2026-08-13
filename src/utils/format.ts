import { Language } from '../types';

export const convertDigitsInString = (str: string, lang: Language): string => {
  if (!str) return str;
  if (lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
  } else if (lang === 'hi') {
    const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, (w) => hiDigits[parseInt(w, 10)]);
  } else if (lang === 'ar') {
    const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arDigits[parseInt(w, 10)]);
  }
  return str;
};

export const formatNumber = (
  val: number | string | undefined | null,
  lang: Language = 'en',
  options?: { decimals?: number; useGrouping?: boolean }
): string => {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) {
    return convertDigitsInString(String(val), lang);
  }

  const localeMap: Record<Language, string> = {
    bn: 'bn-BD',
    hi: 'hi-IN-u-nu-deva',
    ar: 'ar-EG',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
  };

  const locale = localeMap[lang] || 'en-US';
  const decimals = options?.decimals !== undefined ? options.decimals : (Number.isInteger(num) ? 0 : 2);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: options?.useGrouping ?? true,
    }).format(num);
  } catch (e) {
    return convertDigitsInString(num.toFixed(decimals), lang);
  }
};

export const formatCurrency = (
  amount: number | string | undefined | null,
  currencySymbol: string = '৳',
  lang: Language = 'en',
  options?: { decimals?: number }
): string => {
  const formattedNum = formatNumber(amount, lang, options);
  return `${currencySymbol}${formattedNum}`;
};

export const formatDate = (
  dateStr: string | Date | undefined | null,
  lang: Language = 'en'
): string => {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return convertDigitsInString(String(dateStr), lang);

  const localeMap: Record<Language, string> = {
    bn: 'bn-BD',
    hi: 'hi-IN',
    ar: 'ar-EG',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
  };

  try {
    const formattedDate = new Intl.DateTimeFormat(localeMap[lang] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
    return convertDigitsInString(formattedDate, lang);
  } catch (e) {
    return convertDigitsInString(d.toISOString().split('T')[0], lang);
  }
};

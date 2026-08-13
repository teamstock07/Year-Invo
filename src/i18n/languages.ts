import { Language } from '../types';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

export const COUNTRY_TO_LANGUAGE_MAP: Record<string, Language> = {
  // Bangladesh
  'Bangladesh': 'bn',
  'BD': 'bn',
  
  // India
  'India': 'hi',
  'IN': 'hi',

  // Arabic countries
  'Saudi Arabia': 'ar',
  'SA': 'ar',
  'United Arab Emirates': 'ar',
  'UAE': 'ar',
  'AE': 'ar',
  'Qatar': 'ar',
  'QA': 'ar',
  'Kuwait': 'ar',
  'KW': 'ar',
  'Oman': 'ar',
  'OM': 'ar',
  'Bahrain': 'ar',
  'BH': 'ar',
  'Egypt': 'ar',
  'EG': 'ar',
  'Jordan': 'ar',

  // France & French territories
  'France': 'fr',
  'FR': 'fr',
  'Belgium': 'fr',
  'Switzerland': 'fr',

  // Spain & Latin America
  'Spain': 'es',
  'ES': 'es',
  'Mexico': 'es',
  'MX': 'es',
  'Argentina': 'es',
  'AR': 'es',
  'Colombia': 'es',
  'CO': 'es',
  'Chile': 'es',
  'Peru': 'es',

  // English speaking countries
  'United Kingdom': 'en',
  'UK': 'en',
  'GB': 'en',
  'United States': 'en',
  'US': 'en',
  'Canada': 'en',
  'CA': 'en',
  'Australia': 'en',
  'AU': 'en',
};

export const getDefaultLanguageForCountry = (countryStr?: string): Language => {
  if (!countryStr) return 'en';
  const trimmed = countryStr.trim();
  if (COUNTRY_TO_LANGUAGE_MAP[trimmed]) return COUNTRY_TO_LANGUAGE_MAP[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, lang] of Object.entries(COUNTRY_TO_LANGUAGE_MAP)) {
    if (key.toLowerCase() === lower) return lang;
  }
  if (lower.includes('bangladesh') || lower.includes('বাংলা')) return 'bn';
  if (lower.includes('india') || lower.includes('bharat') || lower.includes('भारत')) return 'hi';
  if (lower.includes('arab') || lower.includes('saudi') || lower.includes('emirates') || lower.includes('dubai') || lower.includes('egypt') || lower.includes('qatar')) return 'ar';
  if (lower.includes('france') || lower.includes('french')) return 'fr';
  if (lower.includes('spain') || lower.includes('spanish') || lower.includes('mexico')) return 'es';
  return 'en';
};

export const isRtlLanguage = (lang: Language): boolean => {
  return lang === 'ar';
};

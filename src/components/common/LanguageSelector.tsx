import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { SUPPORTED_LANGUAGES, isRtlLanguage } from '../../i18n/languages';
import { getMappedCurrencyForLanguage } from '../../config/languageCurrency';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage, settings, updateSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    const mappedCurrency = getMappedCurrencyForLanguage(code);
    if (settings.currency !== mappedCurrency) {
      updateSettings({ currency: mappedCurrency });
    }
    setIsOpen(false);
  };

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#ff5c01]/10 border-[#ff5c01] text-[#ff5c01] shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <div className="flex flex-col text-left rtl:text-right flex-1 min-w-0">
                <span className="truncate">{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400 font-normal truncate">{lang.name}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#ff5c01] shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Globe className="w-4 h-4 text-slate-500" />
        <select
          value={language}
          onChange={(e) => handleSelectLanguage(e.target.value as Language)}
          className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {lang.flag} {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121829] hover:bg-[#182035] text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-white/15 focus:outline-none transition-colors cursor-pointer shadow-xs"
        title="Select Language"
      >
        <Globe className="w-4 h-4 text-[#ff5c01]" />
        <span className="text-sm leading-none">{currentLangInfo.flag}</span>
        <span>{currentLangInfo.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-[#0c101c] rounded-2xl shadow-2xl border border-white/15 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-white/10 mb-1">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Select Language / ভাষা নির্বাচন
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto py-0.5 custom-scrollbar">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10 cursor-pointer ${
                    isSelected
                      ? 'text-[#ff5c01] font-bold bg-[#ff5c01]/10'
                      : 'text-slate-200'
                  }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex-1 text-left rtl:text-right flex items-center justify-between">
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-2 rtl:mr-2">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ff5c01] shrink-0 ml-1 rtl:mr-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

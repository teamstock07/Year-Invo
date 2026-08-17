import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Moon,
  Sun,
  Globe,
  DollarSign,
  Menu,
  X,
  Sparkles,
  LogIn,
  ChevronDown,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LandingHeaderProps {
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  activeSection,
  onNavigateSection,
  onOpenLogin,
  onOpenSignup,
}) => {
  const { settings, updateSettings, language, theme, toggleTheme, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome') || 'Home' },
    { id: 'features', label: t('landing.features') || 'Features' },
    { id: 'pricing', label: t('landing.pricing') || 'Pricing' },
    { id: 'about', label: t('navAbout') || 'About' },
    { id: 'support', label: t('navHelp') || 'Support' },
    { id: 'contact', label: t('landing.contact') || 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#09090b]/90 border-b border-slate-200 dark:border-slate-800/80 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          onClick={() => handleNavClick('home')}
        >
          <MainWebsiteLogo
            size={34}
            customUrl={settings.siteLogoUrl}
            siteName={settings.siteBrandName || 'YearInvo'}
            subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-[#ff5c01] transition-colors">
                {settings.siteBrandName || 'YearInvo'}
              </span>
              <span className="text-[9px] sm:text-[10px] bg-purple-500/10 dark:bg-[#ff5c01]/20 border border-purple-500/20 dark:border-[#ff5c01]/40 text-purple-700 dark:text-[#ff8038] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={settings.currency || '৳'}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs font-extrabold py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
              title="Select Store Currency"
            >
              <option value="৳">৳ BDT</option>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="د.إ">د.إ AED</option>
              <option value="₹">₹ INR</option>
              <option value="Rs">Rs PKR</option>
              <option value="¥">¥ JPY/CNY</option>
              <option value="£">£ GBP</option>
              <option value="﷼">﷼ SAR</option>
            </select>
          </div>

          {/* Language Selector */}
          <LanguageSelector variant="dropdown" />

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
            title={theme === 'light' ? t('darkMode') : t('lightMode')}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Auth Action Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2 ml-1">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
            >
              {t('landing.signIn') || t('login')}
            </button>

            <button
              onClick={onOpenSignup}
              className="px-4 py-1.5 text-xs font-black text-white bg-[#ff5c01] hover:bg-[#e05100] rounded-xl shadow-md shadow-[#ff5c01]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('landing.getStarted') || t('signUp')}</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#ff5c01]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09090b] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-extrabold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center"
            >
              {t('landing.signIn') || t('login')}
            </button>
            <button
              onClick={() => {
                onOpenSignup();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-black text-white bg-[#ff5c01] rounded-xl text-center shadow-md shadow-[#ff5c01]/20 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('landing.getStarted') || t('signUp')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

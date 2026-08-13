import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Store,
  MoreVertical,
  Coins,
  Monitor,
  X,
  ChevronRight,
} from 'lucide-react';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    user,
    settings,
    updateSettings,
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    globalSearch,
    setGlobalSearch,
    logout,
    activeTab,
    setActiveTab,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileAccountModal, setShowMobileAccountModal] = useState(false);
  const [showMobileThreeDotModal, setShowMobileThreeDotModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const storeDisplayName = settings.brandName || user?.brandName || 'My Store';

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const defaultCurrencyMap: Record<string, string> = {
      en: '$',
      ar: 'د.إ',
      bn: '৳',
      hi: '₹',
      ur: 'Rs',
      fr: '€',
      de: '€',
      es: '€',
      zh: '¥',
      ja: '¥',
      ae: 'د.إ',
    };
    if (defaultCurrencyMap[newLang]) {
      updateSettings({ currency: defaultCurrencyMap[newLang] });
    }
  };

  const handleSetTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    if (selectedTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (setTheme) {
        setTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        if ((systemPrefersDark && theme === 'light') || (!systemPrefersDark && theme === 'dark')) {
          toggleTheme();
        }
      }
    } else {
      if (setTheme) {
        setTheme(selectedTheme);
      } else {
        if ((selectedTheme === 'dark' && theme === 'light') || (selectedTheme === 'light' && theme === 'dark')) {
          toggleTheme();
        }
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateSettings({ logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-[#E8EEF2] dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 bg-white/90 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors select-none">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Left Side: Store Logo, Store Name & Permanent Platform Branding */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div
          className="flex items-center gap-2 select-none cursor-pointer group min-w-0"
          onClick={() => setActiveTab('dashboard')}
          title="Go to Dashboard"
        >
          {/* Main Store Logo Badge */}
          <div className="relative p-1 bg-slate-900 dark:bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-xs group-hover:border-[#ff5c01] transition-colors shrink-0">
            <MainWebsiteLogo
              size={28}
              customUrl={settings.logoUrl}
              siteName={storeDisplayName}
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-black text-slate-900 dark:text-white text-xs sm:text-base leading-tight group-hover:text-[#ff5c01] transition-colors truncate max-w-[100px] xs:max-w-[150px] sm:max-w-xs">
                {storeDisplayName}
              </h1>
              <span className="hidden sm:inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/20 uppercase shrink-0">
                {user?.subscriptionPlan || 'Free'}
              </span>
            </div>
            {/* Permanent Platform Branding */}
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 leading-none truncate mt-0.5">
              Powered by <span className="font-bold text-[#ff5c01]">YearInvo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Global Search Bar - Desktop Only */}
      {['products', 'categories', 'stock'].includes(activeTab) ? (
        <div className="flex-1 max-w-xs sm:max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="bg-slate-100 dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-full focus:outline-hidden focus:border-[#ff5c01] transition-colors"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden sm:block" />
      )}

      {/* ========================================================================= */}
      {/* DESKTOP / TABLET RIGHT SIDE ACTION CONTROLS (sm:flex)                     */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Currency & Language - Desktop / Tablet Only */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Selector Dropdown */}
          <div className="relative">
            <select
              value={settings.currency || '৳'}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-auto bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-black py-1.5 px-2.5 rounded-xl border border-[#E8EEF2] dark:border-slate-800 focus:outline-none focus:border-[#ff5c01] cursor-pointer shadow-2xs truncate"
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

          {/* Multi-Language Selector Dropdown */}
          <LanguageSelector variant="dropdown" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Desktop Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#09090b]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-[#E8EEF2] dark:border-slate-800 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#E8EEF2] dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#ff5c01]" />
                  {t('notifications')}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#ff5c01] font-medium hover:underline cursor-pointer"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-500">
                    {t('noNotifications')}
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex gap-3 ${
                        !n.read ? 'bg-[#ff5c01]/10' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'low_stock' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                        {n.type === 'expired' && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                        {n.type === 'due' && <Sparkles className="w-5 h-5 text-[#ff5c01]" />}
                        {n.type === 'system' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {language === 'bn' ? n.titleBn : n.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {language === 'bn' ? n.messageBn : n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{n.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Profile / Account Icon */}
        <div className="relative ml-1 pl-3 border-l border-[#E8EEF2] dark:border-slate-800">
          <button
            onClick={() => {
              setShowNotifications(false);
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer p-0.5"
            title="Profile & Settings"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">{user?.ownerName || 'Ariful Islam'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">{user?.role || 'Owner'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#ff5c01] text-white border border-white/20 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {user?.ownerName?.[0] || 'A'}
            </div>
          </button>

          {/* Desktop User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-[260px] bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-[#E8EEF2] dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E8EEF2] dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.ownerName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                {storeDisplayName && (
                  <p className="text-[10px] font-extrabold text-[#ff5c01] mt-1 truncate uppercase">
                    Store: {storeDisplayName}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#ff5c01]" />
                  <span>Profile & Settings</span>
                </div>
                <span className="text-[9px] bg-[#ff5c01]/10 text-[#ff5c01] font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Edit Store
                </span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-[#E8EEF2] dark:border-slate-800 mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE RIGHT SIDE ACTION CONTROLS (sm:hidden)                             */}
      {/* Contains ONLY: 1. Notification Icon, 2. Account Icon, 3. Three-Dot Icon   */}
      {/* ========================================================================= */}
      <div className="flex sm:hidden items-center gap-1 shrink-0">
        {/* 1. Notification Icon */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowMobileAccountModal(false);
            setShowMobileThreeDotModal(false);
          }}
          className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-[#ff5c01] dark:hover:text-[#ff5c01] transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 cursor-pointer shrink-0"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#09090b]" />
          )}
        </button>

        {/* 2. Account / Profile Icon */}
        <button
          onClick={() => {
            setShowMobileAccountModal(true);
            setShowNotifications(false);
            setShowMobileThreeDotModal(false);
          }}
          className="p-1 text-slate-700 dark:text-slate-300 hover:text-[#ff5c01] transition-colors rounded-xl active:scale-95 cursor-pointer shrink-0"
          title="Account Profile"
          aria-label="Account Profile"
        >
          <div className="w-8 h-8 rounded-xl bg-[#ff5c01] text-white border border-white/20 flex items-center justify-center shadow-xs shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* 3. Three-Dot Menu Icon */}
        <button
          onClick={() => {
            setShowMobileThreeDotModal(true);
            setShowNotifications(false);
            setShowMobileAccountModal(false);
          }}
          className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#ff5c01] dark:hover:text-[#ff5c01] transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 cursor-pointer shrink-0"
          title="Settings & Preferences"
          aria-label="Settings and Preferences"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE PORTAL OVERLAYS                                                    */}
      {/* ========================================================================= */}

      {/* MOBILE NOTIFICATION OVERLAY PORTAL */}
      {showNotifications && createPortal(
        <div className="fixed inset-0 z-[9999] sm:hidden flex flex-col justify-start pt-16 px-3">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setShowNotifications(false)}
          />

          {/* Notification Overlay Card */}
          <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#ff5c01]" />
                <span>{t('notifications')}</span>
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#ff5c01] font-bold hover:underline cursor-pointer"
                  >
                    {t('markAllRead')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-slate-500">
                  {t('noNotifications')}
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) setActiveTab(n.linkTab);
                      setShowNotifications(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex gap-3 ${
                      !n.read ? 'bg-[#ff5c01]/10' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'low_stock' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                      {n.type === 'expired' && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                      {n.type === 'due' && <Sparkles className="w-5 h-5 text-[#ff5c01]" />}
                      {n.type === 'system' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? n.titleBn : n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {language === 'bn' ? n.messageBn : n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{n.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MOBILE ACCOUNT OVERLAY PORTAL */}
      {showMobileAccountModal && createPortal(
        <div className="fixed inset-0 z-[9999] sm:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMobileAccountModal(false)}
          />

          {/* Account Drawer Panel */}
          <div className="relative z-10 w-[310px] max-w-[85vw] h-full bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff5c01]" />
                <span>Account Profile</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMobileAccountModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Close Account Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Details */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 flex items-center gap-3 shadow-md">
              <div className="w-11 h-11 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center font-black text-base shadow-lg shrink-0 border border-white/20">
                {user?.ownerName?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    {user?.ownerName || 'Ariful Islam'}
                  </h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 uppercase shrink-0">
                    {user?.subscriptionPlan || 'Free'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'owner@yearinvo.com'}</p>
                <p className="text-[10px] font-bold text-[#ff5c01] uppercase tracking-wide truncate">
                  Store: {storeDisplayName}
                </p>
              </div>
            </div>

            {/* Store Branding & Settings Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                setShowMobileAccountModal(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff5c01]/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-left truncate">
                  <span className="block font-bold text-slate-900 dark:text-white text-xs truncate">Store Branding & Settings</span>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate">Customize logo & store details</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Logout Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <button
                type="button"
                onClick={() => {
                  setShowMobileAccountModal(false);
                  logout();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout') || 'Logout Account'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MOBILE THREE-DOT MENU OVERLAY PORTAL (Language, Currency, Appearance) */}
      {showMobileThreeDotModal && createPortal(
        <div className="fixed inset-0 z-[9999] sm:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowMobileThreeDotModal(false)}
          />

          {/* Three-Dot Menu Drawer Panel */}
          <div className="relative z-10 w-[310px] max-w-[85vw] h-full bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <MoreVertical className="w-4 h-4 text-[#ff5c01]" />
                <span>Settings & Preferences</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMobileThreeDotModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Language Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#ff5c01]" />
                <span>Language</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'en', label: 'English (EN)' },
                  { id: 'bn', label: 'বাংলা (BN)' },
                  { id: 'hi', label: 'हिंदी (HI)' },
                  { id: 'ar', label: 'عربي (AR)' },
                  { id: 'ur', label: 'اردو (UR)' },
                  { id: 'fr', label: 'Français (FR)' },
                  { id: 'de', label: 'Deutsch (DE)' },
                  { id: 'es', label: 'Español (ES)' },
                  { id: 'zh', label: '中文 (ZH)' },
                  { id: 'ja', label: '日本語 (JA)' },
                ].map((langItem) => {
                  const isSelected = language === langItem.id;
                  return (
                    <button
                      key={langItem.id}
                      type="button"
                      onClick={() => handleLanguageChange(langItem.id as Language)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{langItem.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Currency Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-[#ff5c01]" />
                <span>Currency</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '৳', label: '৳ BDT' },
                  { id: '$', label: '$ USD' },
                  { id: '€', label: '€ EUR' },
                  { id: 'د.إ', label: 'د.إ AED' },
                  { id: '₹', label: '₹ INR' },
                  { id: 'Rs', label: 'Rs PKR' },
                  { id: '¥', label: '¥ JPY' },
                  { id: '£', label: '£ GBP' },
                  { id: '﷼', label: '﷼ SAR' },
                ].map((curr) => {
                  const isSelected = (settings.currency || '৳') === curr.id;
                  return (
                    <button
                      key={curr.id}
                      type="button"
                      onClick={() => updateSettings({ currency: curr.id })}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all border text-center truncate cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {curr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Appearance Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5c01]" />
                <span>Appearance</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetTheme('light')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 shrink-0" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetTheme('dark')}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetTheme('system')}
                  className="py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5 shrink-0" />
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};



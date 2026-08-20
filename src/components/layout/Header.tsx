import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import {
  SUPPORTED_LANGUAGE_CURRENCY_PAIRS,
  getMappedCurrencyForLanguage,
  getMappedLanguageForCurrency,
} from '../../config/languageCurrency';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import { getNotificationContent } from '../../services/notificationService';
import { getUserDisplayName } from '../../utils/user';
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
  Settings,
  SlidersHorizontal,
  MoreVertical,
  Coins,
  Monitor,
  X,
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Clock,
  CreditCard,
  Package,
  PackageX,
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
    formatCurrency,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileAccountModal, setShowMobileAccountModal] = useState(false);
  const [showMobileThreeDotModal, setShowMobileThreeDotModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const storeDisplayName = settings.brandName || user?.brandName || 'My Store';
  const userDisplayName = getUserDisplayName(user);
  const userAvatar = user?.photoUrl || user?.avatarUrl || user?.profilePhotoUrl;

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const mappedCurrency = getMappedCurrencyForLanguage(newLang);
    if (settings.currency !== mappedCurrency) {
      updateSettings({ currency: mappedCurrency });
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    updateSettings({ currency: newCurrency });
    const mappedLanguage = getMappedLanguageForCurrency(newCurrency);
    if (language !== mappedLanguage) {
      setLanguage(mappedLanguage);
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
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-3 sm:px-6 lg:px-8 bg-[#0a0e1a] backdrop-blur-xl transition-colors select-none text-white shadow-md shadow-black/10">
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
          <div className="relative p-1 bg-slate-900/90 rounded-xl border border-white/15 flex items-center justify-center shadow-xs group-hover:border-[#ff5c01] transition-colors shrink-0">
            <MainWebsiteLogo
              size={28}
              customUrl={settings.logoUrl}
              siteName={storeDisplayName}
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-black text-white text-xs sm:text-base leading-tight group-hover:text-[#ff5c01] transition-colors truncate max-w-[100px] xs:max-w-[150px] sm:max-w-xs">
                {storeDisplayName}
              </h1>
              <span className="hidden sm:inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/20 uppercase shrink-0">
                {user?.subscriptionPlan || 'Free'}
              </span>
            </div>
            {/* Permanent Platform Branding */}
            <span className="text-[9px] font-semibold text-slate-400 leading-none truncate mt-0.5">
              Powered by <span className="font-bold text-[#ff5c01]">YearInvo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Global Search Bar - Desktop Only */}
      {['products', 'categories', 'stock'].includes(activeTab) ? (
        <div className="flex-1 max-w-xs sm:max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="bg-[#121829] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 w-full focus:outline-hidden focus:border-[#ff5c01] transition-colors"
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
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-auto bg-[#121829] hover:bg-[#182035] text-white text-xs font-bold py-1.5 px-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-[#ff5c01] cursor-pointer shadow-xs truncate"
              title="Select Store Currency"
            >
              {SUPPORTED_LANGUAGE_CURRENCY_PAIRS.map((pair) => (
                <option key={pair.currency} value={pair.currency} className="bg-[#0a0e1a] text-white">
                  {pair.currencyLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Language Selector Dropdown */}
          <LanguageSelector variant="dropdown" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/10 cursor-pointer"
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-200" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Desktop Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/10 cursor-pointer"
            title={t('notifications') || 'Notifications'}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-[#0a0e1a] flex items-center justify-center animate-in zoom-in-50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c101c] rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#ff5c01]/15 rounded-lg text-[#ff5c01]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    {t('notifications')}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                      {unreadCount} {t('unread') || 'unread'}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#ff5c01] font-bold hover:underline cursor-pointer"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-white/10 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                      <Bell className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      {t('noNotifications')}
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const content = getNotificationContent(n, language, (amt) => formatCurrency(amt));
                    let iconElement = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                    let iconBg = 'bg-emerald-950/60 border-emerald-800/60';
                    let priorityBadge = null;

                    if (n.type === 'out_of_stock') {
                      iconElement = <PackageX className="w-4 h-4 text-rose-400" />;
                      iconBg = 'bg-rose-950/60 border-rose-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                          {language === 'bn' ? 'জরুরি' : 'Critical'}
                        </span>
                      );
                    } else if (n.type === 'low_stock') {
                      iconElement = <AlertTriangle className="w-4 h-4 text-amber-400" />;
                      iconBg = 'bg-amber-950/60 border-amber-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shrink-0">
                          {language === 'bn' ? 'সতর্কতা' : 'Warning'}
                        </span>
                      );
                    } else if (n.type === 'expired') {
                      iconElement = <AlertCircle className="w-4 h-4 text-rose-400" />;
                      iconBg = 'bg-rose-950/60 border-rose-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                          {language === 'bn' ? 'মেয়াদ শেষ' : 'Expired'}
                        </span>
                      );
                    } else if (n.type === 'expiring_soon') {
                      iconElement = <Clock className="w-4 h-4 text-amber-400" />;
                      iconBg = 'bg-amber-950/60 border-amber-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shrink-0">
                          {language === 'bn' ? 'সতর্কতা' : 'Warning'}
                        </span>
                      );
                    } else if (n.type === 'overdue_due') {
                      iconElement = <AlertOctagon className="w-4 h-4 text-rose-400" />;
                      iconBg = 'bg-rose-950/60 border-rose-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                          {language === 'bn' ? 'জরুরি' : 'Overdue'}
                        </span>
                      );
                    } else if (n.type === 'pending_due' || n.type === 'due') {
                      iconElement = <CreditCard className="w-4 h-4 text-[#ff5c01]" />;
                      iconBg = 'bg-orange-950/60 border-orange-800/60';
                      priorityBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-slate-300 shrink-0">
                          {language === 'bn' ? 'বকেয়া' : 'Due'}
                        </span>
                      );
                    } else if (n.type === 'subscription') {
                      iconElement = <Sparkles className="w-4 h-4 text-indigo-400" />;
                      iconBg = 'bg-indigo-950/60 border-indigo-800/60';
                    }

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTab) setActiveTab(n.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-white/5 cursor-pointer transition-all flex items-start gap-3 relative group ${
                          !n.read ? 'bg-[#ff5c01]/10' : 'opacity-85'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${iconBg}`}>
                          {iconElement}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="text-xs font-bold text-white truncate">
                              {content.title}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {priorityBadge}
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#ff5c01] shrink-0" title="Unread" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {content.message}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {n.date}
                            </span>
                            {n.linkTab && (
                              <span className="text-[10px] text-[#ff5c01] font-bold group-hover:underline flex items-center gap-0.5">
                                {language === 'bn' ? 'দেখুন' : 'View'}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Profile / Account Icon */}
        <div className="relative ml-1 pl-3 border-l border-white/10">
          <button
            onClick={() => {
              setShowNotifications(false);
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer p-0.5 group"
            title="Profile & Settings"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold leading-tight text-white group-hover:text-[#ff5c01] transition-colors">{userDisplayName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{user?.role || 'Owner'}</p>
            </div>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userDisplayName}
                className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5c01] to-amber-500 text-white border border-white/20 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <User className="w-4.5 h-4.5 text-white" />
              </div>
            )}
          </button>

          {/* Desktop User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-[270px] bg-[#0c101c]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userDisplayName} className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20 uppercase shrink-0">
                        {user?.subscriptionPlan || 'Free'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                {storeDisplayName && (
                  <p className="text-[10px] font-extrabold text-[#ff5c01] mt-1.5 truncate uppercase">
                    Store: {storeDisplayName}
                  </p>
                )}
              </div>

              {/* 1. Profile */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#ff5c01]/15 text-[#ff5c01] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{t('profile') || 'Profile'}</span>
              </button>

              {/* 2. Store Branding */}
              <button
                onClick={() => {
                  setActiveTab('branding');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#ff5c01]/15 text-[#ff5c01] flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{t('storeBranding') || 'Store Branding'}</span>
              </button>

              {/* 3. Settings */}
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#ff5c01]/15 text-[#ff5c01] flex items-center justify-center shrink-0">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{t('settings') || 'Settings'}</span>
              </button>

              {/* 4. Customize Dashboard */}
              <button
                onClick={() => {
                  setActiveTab('customize-dashboard');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#ff5c01]/15 text-[#ff5c01] flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{t('customizeDashboard') || 'Customize Dashboard'}</span>
              </button>

              {/* 5. Logout */}
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('logout') || 'Logout'}</span>
                </button>
              </div>
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
          className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/10 active:scale-95 cursor-pointer shrink-0"
          title={t('notifications') || 'Notifications'}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-[#0a0e1a] flex items-center justify-center animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* 2. Account / Profile Icon */}
        <button
          onClick={() => {
            setShowMobileAccountModal(true);
            setShowNotifications(false);
            setShowMobileThreeDotModal(false);
          }}
          className="p-1 text-slate-300 hover:text-white transition-colors rounded-xl active:scale-95 cursor-pointer shrink-0"
          title="Account Profile"
          aria-label="Account Profile"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff5c01] to-amber-500 text-white border border-white/20 flex items-center justify-center shadow-xs shrink-0">
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
          className="p-2 text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/10 active:scale-95 cursor-pointer shrink-0"
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
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#ff5c01]/10 rounded-lg text-[#ff5c01]">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t('notifications')}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    {unreadCount} {t('unread') || 'unread'}
                  </span>
                )}
              </div>
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

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
                    <Bell className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t('noNotifications')}
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const content = getNotificationContent(n, language, (amt) => formatCurrency(amt));
                  let iconElement = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                  let iconBg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50';
                  let priorityBadge = null;

                  if (n.type === 'out_of_stock') {
                    iconElement = <PackageX className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
                    iconBg = 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                        {language === 'bn' ? 'জরুরি' : 'Critical'}
                      </span>
                    );
                  } else if (n.type === 'low_stock') {
                    iconElement = <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
                    iconBg = 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shrink-0">
                        {language === 'bn' ? 'সতর্কতা' : 'Warning'}
                      </span>
                    );
                  } else if (n.type === 'expired') {
                    iconElement = <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
                    iconBg = 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                        {language === 'bn' ? 'মেয়াদ শেষ' : 'Expired'}
                      </span>
                    );
                  } else if (n.type === 'expiring_soon') {
                    iconElement = <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
                    iconBg = 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shrink-0">
                        {language === 'bn' ? 'সতর্কতা' : 'Warning'}
                      </span>
                    );
                  } else if (n.type === 'overdue_due') {
                    iconElement = <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
                    iconBg = 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shrink-0">
                        {language === 'bn' ? 'জরুরি' : 'Overdue'}
                      </span>
                    );
                  } else if (n.type === 'pending_due' || n.type === 'due') {
                    iconElement = <CreditCard className="w-4 h-4 text-[#ff5c01]" />;
                    iconBg = 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900/50';
                    priorityBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {language === 'bn' ? 'বকেয়া' : 'Due'}
                      </span>
                    );
                  } else if (n.type === 'subscription') {
                    iconElement = <Sparkles className="w-4 h-4 text-indigo-500" />;
                    iconBg = 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50';
                  }

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start gap-3 relative group ${
                        !n.read ? 'bg-[#ff5c01]/5 dark:bg-[#ff5c01]/10' : 'opacity-85'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${iconBg}`}>
                        {iconElement}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {content.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {priorityBadge}
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#ff5c01] shrink-0" title="Unread" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {content.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {n.date}
                          </span>
                          {n.linkTab && (
                            <span className="text-[10px] text-[#ff5c01] font-bold group-hover:underline flex items-center gap-0.5">
                              {language === 'bn' ? 'দেখুন' : 'View'}
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
          <div className="relative z-10 w-[310px] max-w-[85vw] h-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
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
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userDisplayName}
                  className="w-11 h-11 rounded-2xl object-cover shadow-lg shrink-0 border border-white/20"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center shadow-lg shrink-0 border border-white/20">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    {userDisplayName}
                  </h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 uppercase shrink-0">
                    {user?.subscriptionPlan || 'Free'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'owner@yearinvo.com'}</p>
                {storeDisplayName && (
                  <p className="text-[10px] font-bold text-[#ff5c01] uppercase tracking-wide truncate">
                    Store: {storeDisplayName}
                  </p>
                )}
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1.5 flex-1">
              {/* 1. Profile */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setShowMobileAccountModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff5c01]/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block font-bold text-slate-900 dark:text-white text-xs truncate">{t('profile') || 'Profile'}</span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate">View and edit personal info</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* 2. Store Branding */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('branding');
                  setShowMobileAccountModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff5c01]/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block font-bold text-slate-900 dark:text-white text-xs truncate">{t('storeBranding') || 'Store Branding'}</span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate">Customize logo & store details</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* 3. Settings */}
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
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block font-bold text-slate-900 dark:text-white text-xs truncate">{t('settings') || 'Settings'}</span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate">Preferences, invoice & tax rules</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* 4. Customize Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('customize-dashboard');
                  setShowMobileAccountModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#ff5c01]/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block font-bold text-slate-900 dark:text-white text-xs truncate">{t('customizeDashboard') || 'Customize Dashboard'}</span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate">Toggle dashboard modules</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

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
                {SUPPORTED_LANGUAGE_CURRENCY_PAIRS.map((pair) => {
                  const isSelected = (settings.currency || '৳') === pair.currency;
                  return (
                    <button
                      key={pair.currency}
                      type="button"
                      onClick={() => handleCurrencyChange(pair.currency)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all border text-center truncate cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {pair.currencyLabel}
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



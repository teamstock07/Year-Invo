import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { getCustomerStoreName } from '../../utils/brand';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
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
  ChevronDown,
  MoreVertical,
  Camera,
} from 'lucide-react';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    user,
    settings,
    updateSettings,
    language,
    setLanguage,
    theme,
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
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-[#E8EEF2] dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 lg:hidden cursor-pointer"
            title="Menu Options"
          >
            <MoreVertical className="w-5 h-5 text-[#ff5c01]" />
          </button>
        )}

        <div
          className="flex items-center gap-2.5 select-none cursor-pointer group"
          onClick={() => setActiveTab('dashboard')}
          title="Go to Dashboard"
        >
          {/* Main Store Logo Badge */}
          <div className="relative p-0.5 bg-slate-900 dark:bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-xs group-hover:border-[#ff5c01] transition-colors">
            <MainWebsiteLogo
              size={32}
              customUrl={settings.logoUrl}
              siteName={storeDisplayName}
            />
          </div>

          <div className="hidden sm:block">
            <h1 className="font-black text-slate-900 dark:text-white text-base leading-tight flex items-center gap-1.5 group-hover:text-[#ff5c01] transition-colors">
              <span>{storeDisplayName}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Global Search Bar - Enabled only on Product, Category, and Stock views */}
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
        <div className="flex-1" />
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Currency Selector Dropdown */}
        <div className="relative">
          <select
            value={settings.currency || '৳'}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-black py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-[#E8EEF2] dark:border-slate-800 focus:outline-none focus:border-[#ff5c01] cursor-pointer shadow-2xs"
            title="Select Store Currency"
          >
            <option value="৳">৳ BDT (Taka)</option>
            <option value="$">$ USD (Dollar)</option>
            <option value="€">€ EUR (Euro)</option>
            <option value="د.إ">د.إ AED (Dirham)</option>
            <option value="₹">₹ INR (Rupee)</option>
            <option value="Rs">Rs PKR (Rupee)</option>
            <option value="¥">¥ JPY/CNY (Yen/Yuan)</option>
            <option value="£">£ GBP (Pound)</option>
            <option value="﷼">﷼ SAR (Riyal)</option>
          </select>
        </div>

        {/* Multi-Language Selector Dropdown */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-[#E8EEF2] dark:border-slate-800 focus:outline-none focus:border-[#ff5c01] cursor-pointer shadow-2xs"
            title="Select Language"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="bn">Bangla</option>
            <option value="hi">Hindi</option>
            <option value="ur">Urdu</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#09090b]"></span>
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
                    className="text-xs text-[#ff5c01] font-medium hover:underline"
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

        {/* User Profile */}
        <div className="relative ml-1 pl-3 border-l border-[#E8EEF2] dark:border-slate-800">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">{user?.ownerName || 'Ariful Islam'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">{user?.role || 'Owner'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#ff5c01] text-white border border-white/20 flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.ownerName?.[0] || 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0c0c0e] rounded-2xl shadow-2xl border border-[#E8EEF2] dark:border-slate-800 py-2 z-50">
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
    </header>
  );
};

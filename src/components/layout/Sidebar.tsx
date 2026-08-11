import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import {
  LayoutDashboard,
  Zap,
  ShoppingCart,
  Package,
  Tags,
  Boxes,
  History,
  ShoppingBag,
  Users,
  Truck,
  CreditCard,
  Receipt,
  TrendingUp,
  AlertTriangle,
  QrCode,
  Sparkles,
  Lock,
  Crown,
  Settings,
  HelpCircle,
  Info,
  X,
  Store,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, t, user, settings, updateSettings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const plan = user?.subscriptionPlan || 'Free';
  const isPosLocked = plan === 'Free';

  const menuItems = [
    ...(user?.role === 'Owner'
      ? [{ id: 'owner', label: 'Owner Panel', icon: Crown, highlight: true }]
      : []),
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quicksale', label: 'Quick Sale', icon: Zap, highlight: true },
    { 
      id: 'pos', 
      label: 'POS System', 
      icon: ShoppingCart, 
      locked: isPosLocked,
      badge: isPosLocked ? 'PRO' : undefined 
    },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'stock', label: 'Stock Management', icon: Boxes },
    { id: 'saleshistory', label: 'Sales History', icon: History },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'due', label: 'Due Management', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Profit Analytics', icon: TrendingUp },
    { id: 'expired', label: 'Expired Products', icon: AlertTriangle },
    { id: 'barcode', label: 'Barcode & QR Code', icon: QrCode },
    { id: 'ai', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
    { id: 'branding', label: 'Store Branding', icon: Store },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Hidden Logo File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-60 bg-white dark:bg-[#0c0c0e] border-r border-[#E8EEF2] dark:border-slate-800 text-slate-700 dark:text-slate-300 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Logo Drawer Header (Hidden on Desktop) */}
        <div className="p-4 lg:hidden flex items-center justify-between border-b border-[#E8EEF2] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 bg-slate-900 dark:bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-xs">
              <MainWebsiteLogo
                size={32}
                customUrl={settings.logoUrl}
                siteName={settings.brandName || user?.brandName || 'My Store'}
              />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                {settings.brandName || user?.brandName || 'My Store'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/20 font-bold'
                    : item.highlight
                    ? 'bg-[#ff5c01]/10 text-[#ff5c01] hover:bg-[#ff5c01]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.locked && (
                    <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-500'}`} />
                  )}
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive ? 'bg-white text-[#ff5c01]' : 'bg-[#ff5c01] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Subscription Footer Card */}
        <div className="p-3 border-t border-[#E8EEF2] dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`w-full text-left bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 border transition-all rounded-xl p-2.5 cursor-pointer ${
              activeTab === 'subscription' ? 'border-[#ff5c01] ring-1 ring-[#ff5c01]' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
              <span>{t('subscription') || 'Subscription'}</span>
              <Crown className="w-3 h-3 text-[#ff5c01]" />
            </p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {user?.subscriptionPlan || 'Free Plan'}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};

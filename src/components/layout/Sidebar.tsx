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
  const { activeTab, setActiveTab, t, user, settings, updateSettings, dashboardPreferences } = useApp();
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

  const rawMenuItems = [
    ...(user?.role === 'Owner'
      ? [{ id: 'owner', label: t('navOwnerPanel') || 'Owner Panel', icon: Crown, highlight: true }]
      : []),
    { id: 'dashboard', label: t('navDashboard') || 'Dashboard', icon: LayoutDashboard },
    ...(dashboardPreferences?.quickSale !== false ? [{ id: 'quicksale', label: t('navQuickSale') || 'Quick Sale', icon: Zap, highlight: true }] : []),
    ...(dashboardPreferences?.pos !== false ? [{ 
      id: 'pos', 
      label: t('navPos') || 'POS System', 
      icon: ShoppingCart, 
      locked: isPosLocked,
      badge: isPosLocked ? 'PRO' : undefined 
    }] : []),
    ...(dashboardPreferences?.products !== false ? [{ id: 'products', label: t('navProducts') || 'Products', icon: Package }] : []),
    ...(dashboardPreferences?.products !== false && dashboardPreferences?.categories !== false ? [{ id: 'categories', label: t('navCategories') || 'Categories', icon: Tags }] : []),
    ...(dashboardPreferences?.products !== false && dashboardPreferences?.stockManagement !== false ? [{ id: 'stock', label: t('navStock') || 'Stock Management', icon: Boxes }] : []),
    ...(dashboardPreferences?.salesHistory !== false ? [{ id: 'saleshistory', label: t('navSales') || 'Sales History', icon: History }] : []),
    ...(dashboardPreferences?.purchases !== false ? [{ id: 'purchases', label: t('navPurchases') || 'Purchases', icon: ShoppingBag }] : []),
    ...(dashboardPreferences?.customers !== false ? [{ id: 'customers', label: t('navCustomers') || 'Customers', icon: Users }] : []),
    ...(dashboardPreferences?.suppliers !== false ? [{ id: 'suppliers', label: t('navSuppliers') || 'Suppliers', icon: Truck }] : []),
    ...(dashboardPreferences?.dueManagement !== false ? [{ id: 'due', label: t('navDue') || 'Due Management', icon: CreditCard }] : []),
    ...(dashboardPreferences?.expenses !== false ? [{ id: 'expenses', label: t('navExpenses') || 'Expenses', icon: Receipt }] : []),
    ...(dashboardPreferences?.reports !== false ? [{ id: 'reports', label: t('navProfit') || 'Profit Analytics', icon: TrendingUp }] : []),
    ...(dashboardPreferences?.expiryManagement !== false ? [{ id: 'expired', label: t('navExpired') || 'Expired Products', icon: AlertTriangle }] : []),
    ...(dashboardPreferences?.barcode !== false ? [{ id: 'barcode', label: t('navBarcode') || 'Barcode & QR Code', icon: QrCode }] : []),
    { id: 'ai', label: t('navAiInsights') || 'AI Business Advisor', icon: Sparkles, badge: 'SOON' },
    { id: 'branding', label: t('branding') || 'Store Branding', icon: Store },
    { id: 'settings', label: t('navSettings') || t('settings') || 'Settings', icon: Settings },
    ...(dashboardPreferences?.support !== false ? [{ id: 'help', label: t('navHelp') || 'Help & Support', icon: HelpCircle }] : []),
    { id: 'about', label: t('navAbout') || 'About', icon: Info },
  ];

  const menuItems = rawMenuItems;

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
        className={`fixed lg:static top-0 left-0 z-50 h-full w-60 bg-[#0c0c0e] border-r border-slate-800 text-slate-300 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Logo Drawer Header (Hidden on Desktop) */}
        <div className="p-4 lg:hidden flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-xs">
              <MainWebsiteLogo
                size={32}
                customUrl={settings.logoUrl}
                siteName={settings.brandName || user?.brandName || 'My Store'}
              />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-white block leading-tight">
                {settings.brandName || user?.brandName || 'My Store'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/30 font-bold'
                    : item.highlight
                    ? 'bg-[#ff5c01]/15 text-[#ff5c01] hover:bg-[#ff5c01]/25 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.highlight ? 'text-[#ff5c01]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.locked && (
                    <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-400'}`} />
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
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`w-full text-left bg-slate-900/90 hover:bg-slate-800 border transition-all rounded-xl p-2.5 cursor-pointer ${
              activeTab === 'subscription' ? 'border-[#ff5c01] ring-1 ring-[#ff5c01]' : 'border-slate-800'
            }`}
          >
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
              <span>{t('subscription') || 'Subscription'}</span>
              <Crown className="w-3 h-3 text-[#ff5c01]" />
            </p>
            <p className="text-xs font-semibold text-slate-100">
              {user?.subscriptionPlan || 'Free Plan'}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};

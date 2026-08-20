import React, { useRef, useState, useEffect } from 'react';
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
  Calendar,
  Award,
  ShieldCheck,
  Banknote,
  Coins,
  Activity,
  ChevronDown,
  ChevronRight,
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
  const role = user?.role || 'Owner';

  // Role based visibility checks
  const canAccessSales = role === 'Owner' || role === 'Manager' || role === 'Cashier' || role === 'Accountant' || role === 'PlatformOwner';
  const canAccessInventory = role === 'Owner' || role === 'Manager' || role === 'Inventory Manager' || role === 'PlatformOwner';
  const canAccessFinance = role === 'Owner' || role === 'Manager' || role === 'Accountant' || role === 'PlatformOwner';
  const canAccessTeam = role === 'Owner' || role === 'PlatformOwner';
  const canAccessPayroll = role === 'Owner' || role === 'Accountant' || role === 'PlatformOwner';
  const canAccessSettings = role === 'Owner' || role === 'Manager' || role === 'PlatformOwner';

  // Team Management & Payroll Grouped Children
  const teamChildren = [
    ...(dashboardPreferences?.teamManagement !== false && canAccessTeam
      ? [
          {
            id: 'team',
            label: t('modTeamManagement') || 'Team Management',
            icon: ShieldCheck,
          },
        ]
      : []),
    ...(dashboardPreferences?.payroll !== false && canAccessPayroll
      ? [
          {
            id: 'payroll',
            label: t('modPayroll') || 'Employee Payroll',
            icon: Banknote,
          },
        ]
      : []),
    ...(dashboardPreferences?.auditLog !== false && canAccessTeam
      ? [
          {
            id: 'audit-log',
            label: t('modAuditLog') || 'Audit Log',
            icon: Activity,
          },
        ]
      : []),
  ];

  const hasTeamGroup = teamChildren.length > 0;
  const isTeamActive =
    activeTab === 'team' ||
    activeTab === 'teamManagement' ||
    activeTab === 'payroll' ||
    activeTab === 'salary' ||
    activeTab === 'audit' ||
    activeTab === 'audit-log' ||
    activeTab === 'auditLog';

  const [isTeamExpanded, setIsTeamExpanded] = useState<boolean>(true);

  // Automatically keep expanded when an active tab in the group is selected
  useEffect(() => {
    if (isTeamActive) {
      setIsTeamExpanded(true);
    }
  }, [isTeamActive]);

  // Primary menu items before the Team & Payroll group
  const isPlatformSuperAdmin =
    user?.email?.toLowerCase().trim() === 'teamstock07@gmail.com' ||
    user?.role === 'PlatformOwner';

  const primaryMenuItems = [
    ...(isPlatformSuperAdmin
      ? [{ id: 'owner', label: t('navOwnerPanel') || 'Owner Panel', icon: Crown, highlight: true }]
      : []),
    ...(dashboardPreferences?.dashboard !== false ? [{ id: 'dashboard', label: t('navDashboard') || 'Dashboard', icon: LayoutDashboard }] : []),
    ...(dashboardPreferences?.quickSale !== false && canAccessSales ? [{ id: 'quicksale', label: t('navQuickSale') || 'Quick Sale', icon: Zap, highlight: true }] : []),
    ...(dashboardPreferences?.pos !== false && canAccessSales ? [{ 
      id: 'pos', 
      label: t('navPos') || 'POS & Sell', 
      icon: ShoppingCart, 
      locked: isPosLocked,
      badge: isPosLocked ? 'PRO' : undefined 
    }] : []),
    ...(dashboardPreferences?.products !== false && canAccessInventory ? [{ id: 'products', label: t('navProducts') || 'Products', icon: Package }] : []),
    ...(dashboardPreferences?.products !== false && dashboardPreferences?.categories !== false && canAccessInventory ? [{ id: 'categories', label: t('navCategories') || 'Categories', icon: Tags }] : []),
    ...(dashboardPreferences?.products !== false && dashboardPreferences?.stockManagement !== false && canAccessInventory ? [{ id: 'stock', label: t('navStock') || 'Stock Management', icon: Boxes }] : []),
    ...(dashboardPreferences?.smartReorder !== false && canAccessInventory ? [{ id: 'smart-reorder', label: t('modSmartReorder') || 'Smart Reorder', icon: Sparkles }] : []),
    ...(dashboardPreferences?.salesHistory !== false && canAccessSales ? [{ id: 'saleshistory', label: t('navSales') || 'Sales History', icon: History }] : []),
    ...(dashboardPreferences?.salesCalendar !== false && canAccessSales ? [{ id: 'sales-calendar', label: t('modSalesCalendar') || 'Sales Calendar', icon: Calendar }] : []),
    ...(dashboardPreferences?.purchases !== false && canAccessInventory ? [{ id: 'purchases', label: t('navPurchases') || 'Purchases', icon: ShoppingBag }] : []),
    ...(dashboardPreferences?.customers !== false && (canAccessSales || canAccessFinance) ? [{ id: 'customers', label: t('navCustomers') || 'Customers', icon: Users }] : []),
    ...(dashboardPreferences?.customerLoyalty !== false && canAccessSales ? [{ id: 'loyalty', label: t('modCustomerLoyalty') || 'Customer Loyalty', icon: Award }] : []),
    ...(dashboardPreferences?.suppliers !== false && canAccessInventory ? [{ id: 'suppliers', label: t('navSuppliers') || 'Suppliers', icon: Truck }] : []),
    ...(dashboardPreferences?.dueManagement !== false && (canAccessSales || canAccessFinance) ? [{ id: 'due', label: t('navDue') || 'Due Management', icon: CreditCard }] : []),
    ...(dashboardPreferences?.expenses !== false && canAccessFinance ? [{ id: 'expenses', label: t('navExpenses') || 'Expenses', icon: Receipt }] : []),
    ...(dashboardPreferences?.capitalInvestment !== false && canAccessFinance ? [{ id: 'capital-investment', label: t('navCapitalInvestment') || 'Capital & Investment', icon: Coins }] : []),
  ];

  // Secondary menu items after the Team & Payroll group
  const secondaryMenuItems = [
    ...(dashboardPreferences?.reports !== false && canAccessFinance ? [{ id: 'reports', label: t('navProfit') || 'Profit & Loss', icon: TrendingUp }] : []),
    ...(dashboardPreferences?.expiryManagement !== false && canAccessInventory ? [{ id: 'expired', label: t('navExpired') || 'Expired Products', icon: AlertTriangle }] : []),
    ...(dashboardPreferences?.barcode !== false && canAccessInventory ? [{ id: 'barcode', label: t('navBarcode') || 'Barcode & QR Code', icon: QrCode }] : []),
    ...(dashboardPreferences?.aiAssistant !== false ? [{ id: 'ai', label: t('navAiInsights') || 'AI Business Assistant', icon: Sparkles }] : []),
    ...(canAccessSettings && dashboardPreferences?.storeSettings !== false ? [{ id: 'branding', label: t('branding') || 'Store Branding', icon: Store }] : []),
    ...(canAccessSettings && dashboardPreferences?.storeSettings !== false ? [{ id: 'settings', label: t('navSettings') || t('settings') || 'Settings', icon: Settings }] : []),
    ...(dashboardPreferences?.support !== false ? [{ id: 'help', label: t('navHelp') || 'Help & Support', icon: HelpCircle }] : []),
    { id: 'about', label: t('navAbout') || 'About', icon: Info },
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
        className={`fixed lg:static top-0 left-0 z-50 h-full w-60 bg-[#0a0e1a] backdrop-blur-xl border-r border-white/10 text-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out shadow-xl shadow-black/20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Logo Drawer Header (Hidden on Desktop) */}
        <div className="p-4 lg:hidden flex items-center justify-between border-b border-white/10 bg-[#0a0e1a]">
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 bg-slate-900/90 rounded-xl border border-white/15 flex items-center justify-center shadow-xs">
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Primary items */}
          {primaryMenuItems.map((item) => {
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
                    ? 'bg-gradient-to-r from-[#ff5c01] to-amber-500 text-white shadow-md shadow-[#ff5c01]/25 font-bold'
                    : item.highlight
                    ? 'bg-[#ff5c01]/15 text-[#ff7a2e] hover:bg-[#ff5c01]/25 font-bold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : item.highlight ? 'text-[#ff7a2e]' : 'text-slate-400 group-hover:text-white'}`} />
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

          {/* Grouped Parent Menu: Team Management & Payroll */}
          {hasTeamGroup && (
            <div className="pt-0.5 pb-0.5">
              <button
                type="button"
                onClick={() => setIsTeamExpanded((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isTeamActive
                    ? 'bg-white/10 text-white font-bold border border-white/15'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className={`w-4 h-4 shrink-0 transition-colors ${isTeamActive ? 'text-[#ff5c01]' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="truncate">{t('navTeamAndPayroll') || 'Team Management & Payroll'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {isTeamExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
                  )}
                </div>
              </button>

              {/* Indented Child Items */}
              {isTeamExpanded && (
                <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-white/15 ml-4 my-1">
                  {teamChildren.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = activeTab === child.id;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(child.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer group ${
                          isChildActive
                            ? 'bg-gradient-to-r from-[#ff5c01] to-amber-500 text-white shadow-sm shadow-[#ff5c01]/25 font-bold'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${isChildActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Secondary items */}
          {secondaryMenuItems.map((item) => {
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
                    ? 'bg-gradient-to-r from-[#ff5c01] to-amber-500 text-white shadow-md shadow-[#ff5c01]/25 font-bold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Subscription Footer Card */}
        <div className="p-3 border-t border-white/10 bg-[#0a0e1a]">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`w-full text-left bg-[#0e1424] hover:bg-[#131b30] border transition-all rounded-xl p-2.5 cursor-pointer ${
              activeTab === 'subscription' ? 'border-[#ff5c01] ring-1 ring-[#ff5c01]' : 'border-white/10'
            }`}
          >
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
              <span>{t('subscription') || 'Subscription'}</span>
              <Crown className="w-3 h-3 text-[#ff5c01]" />
            </p>
            <p className="text-xs font-semibold text-white">
              {user?.subscriptionPlan || 'Free Plan'}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};

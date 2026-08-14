import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardPreferences } from '../../types';
import {
  SlidersHorizontal,
  Zap,
  ShoppingBag,
  Package,
  FolderTree,
  Boxes,
  Receipt,
  History,
  Truck,
  Users,
  Building2,
  CreditCard,
  TrendingDown,
  BarChart3,
  QrCode,
  CalendarX,
  UserCheck,
  HelpCircle,
  Search,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
  AlertTriangle,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ModuleItem {
  key: keyof DashboardPreferences;
  nameKey: string;
  descKey: string;
  defaultName: string;
  defaultDesc: string;
  icon: React.ElementType;
  category: 'sales' | 'inventory' | 'finance' | 'operations' | 'support';
  dependsOn?: keyof DashboardPreferences;
}

export const CustomizeDashboardView: React.FC = () => {
  const { dashboardPreferences, updateDashboardPreferences, t, language, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const modulesList: ModuleItem[] = [
    {
      key: 'quickSale',
      nameKey: 'modQuickSale',
      descKey: 'modQuickSaleDesc',
      defaultName: 'Quick Sale',
      defaultDesc: 'Fast counter checkout and instant sales',
      icon: Zap,
      category: 'sales',
    },
    {
      key: 'pos',
      nameKey: 'modPos',
      descKey: 'modPosDesc',
      defaultName: 'POS System',
      defaultDesc: 'Full point-of-sale counter register with receipts',
      icon: ShoppingBag,
      category: 'sales',
    },
    {
      key: 'products',
      nameKey: 'modProducts',
      descKey: 'modProductsDesc',
      defaultName: 'Products',
      defaultDesc: 'Manage items, prices, barcodes & stock catalog',
      icon: Package,
      category: 'inventory',
    },
    {
      key: 'categories',
      nameKey: 'modCategories',
      descKey: 'modCategoriesDesc',
      defaultName: 'Categories',
      defaultDesc: 'Product categories and brand classification',
      icon: FolderTree,
      category: 'inventory',
      dependsOn: 'products',
    },
    {
      key: 'stockManagement',
      nameKey: 'modStockManagement',
      descKey: 'modStockManagementDesc',
      defaultName: 'Stock Management',
      defaultDesc: 'Inventory audit, adjustments & low-stock alerts',
      icon: Boxes,
      category: 'inventory',
      dependsOn: 'products',
    },
    {
      key: 'salesManagement',
      nameKey: 'modSalesManagement',
      descKey: 'modSalesManagementDesc',
      defaultName: 'Sales Management',
      defaultDesc: 'Invoice generation and counter sales operations',
      icon: Receipt,
      category: 'sales',
    },
    {
      key: 'salesHistory',
      nameKey: 'modSalesHistory',
      descKey: 'modSalesHistoryDesc',
      defaultName: 'Sales History',
      defaultDesc: 'Past transactions, receipt records & invoice archive',
      icon: History,
      category: 'sales',
    },
    {
      key: 'purchases',
      nameKey: 'modPurchases',
      descKey: 'modPurchasesDesc',
      defaultName: 'Purchases',
      defaultDesc: 'Supplier purchase orders and incoming inventory',
      icon: Truck,
      category: 'inventory',
    },
    {
      key: 'customers',
      nameKey: 'modCustomers',
      descKey: 'modCustomersDesc',
      defaultName: 'Customers',
      defaultDesc: 'Customer directory, purchase history & ledgers',
      icon: Users,
      category: 'finance',
    },
    {
      key: 'suppliers',
      nameKey: 'modSuppliers',
      descKey: 'modSuppliersDesc',
      defaultName: 'Suppliers',
      defaultDesc: 'Vendor directory and supplier ledger tracking',
      icon: Building2,
      category: 'finance',
    },
    {
      key: 'dueManagement',
      nameKey: 'modDueManagement',
      descKey: 'modDueManagementDesc',
      defaultName: 'Due Management',
      defaultDesc: 'Customer and supplier balances & credit collection',
      icon: CreditCard,
      category: 'finance',
    },
    {
      key: 'expenses',
      nameKey: 'modExpenses',
      descKey: 'modExpensesDesc',
      defaultName: 'Expenses',
      defaultDesc: 'Daily operational costs and business expenditure',
      icon: TrendingDown,
      category: 'finance',
    },
    {
      key: 'reports',
      nameKey: 'modReports',
      descKey: 'modReportsDesc',
      defaultName: 'Reports & Analytics',
      defaultDesc: 'Profit analytics, sales insights & report exports',
      icon: BarChart3,
      category: 'finance',
    },
    {
      key: 'barcode',
      nameKey: 'modBarcode',
      descKey: 'modBarcodeDesc',
      defaultName: 'Barcode & QR',
      defaultDesc: 'Barcode generator, label printing & code generator',
      icon: QrCode,
      category: 'operations',
    },
    {
      key: 'expiryManagement',
      nameKey: 'modExpiryManagement',
      descKey: 'modExpiryManagementDesc',
      defaultName: 'Expiry Management',
      defaultDesc: 'Track product expiration dates and alerts',
      icon: CalendarX,
      category: 'operations',
    },
    {
      key: 'teamManagement',
      nameKey: 'modTeamManagement',
      descKey: 'modTeamManagementDesc',
      defaultName: 'Team Management',
      defaultDesc: 'Staff members, cashier accounts and role permissions',
      icon: UserCheck,
      category: 'operations',
    },
    {
      key: 'support',
      nameKey: 'modSupport',
      descKey: 'modSupportDesc',
      defaultName: 'Help & Support',
      defaultDesc: 'User manuals, FAQs and customer support center',
      icon: HelpCircle,
      category: 'support',
    },
  ];

  const handleToggle = async (key: keyof DashboardPreferences) => {
    setSaveStatus('saving');
    const currentValue = dashboardPreferences[key];
    const newValue = !currentValue;

    await updateDashboardPreferences({ [key]: newValue });
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  const handleEnableAll = async () => {
    setSaveStatus('saving');
    const allEnabled: Partial<DashboardPreferences> = {};
    modulesList.forEach((m) => {
      allEnabled[m.key] = true;
    });
    await updateDashboardPreferences(allEnabled);
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  const handleResetDefaults = async () => {
    setSaveStatus('saving');
    const allDefaults: Partial<DashboardPreferences> = {};
    modulesList.forEach((m) => {
      allDefaults[m.key] = true;
    });
    await updateDashboardPreferences(allDefaults);
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  // Filter modules
  const filteredModules = modulesList.filter((m) => {
    const isEnabled = dashboardPreferences[m.key];
    if (activeFilter === 'enabled' && !isEnabled) return false;
    if (activeFilter === 'disabled' && isEnabled) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (t(m.nameKey) || m.defaultName).toLowerCase();
      const desc = (t(m.descKey) || m.defaultDesc).toLowerCase();
      return name.includes(q) || desc.includes(q);
    }
    return true;
  });

  const enabledCount = modulesList.filter((m) => dashboardPreferences[m.key]).length;
  const isProductsDisabled = !dashboardPreferences.products;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 bg-white dark:bg-[#0c0c0e] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01]">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t('customizeDashboardTitle') || t('customizeDashboard') || 'Customize Dashboard'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t('customizeDashboardDesc') || 'Choose which features appear in your dashboard, sidebar, and mobile menu. Turning modules OFF safely hides them without deleting any data.'}
            </p>
          </div>

          {/* Quick Stats & Live Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4 text-[#ff5c01]" />
              <span>
                {enabledCount} / {modulesList.length} {language === 'bn' ? 'মডিউল সক্রিয়' : 'Active Modules'}
              </span>
            </div>

            {saveStatus === 'saving' && (
              <div className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('saving') || 'Saving...'}</span>
              </div>
            )}

            {saveStatus === 'saved' && (
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('saved') || 'Saved'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dependency Alert if Products is OFF */}
      {isProductsDisabled && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <span className="font-extrabold block">
              {t('dependencyWarning') || 'Dependency Warning'}
            </span>
            <p>
              {t('dependencyProductsWarning') || 'Stock Management and Categories depend on Products. Turning off Products will also hide dependent modules.'}
            </p>
          </div>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchModules') || 'Search modules...'}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#ff5c01] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('filterAll') || 'All'} ({modulesList.length})
            </button>
            <button
              onClick={() => setActiveFilter('enabled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'enabled'
                  ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('filterEnabled') || 'Active'} ({enabledCount})
            </button>
            <button
              onClick={() => setActiveFilter('disabled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'disabled'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('filterDisabled') || 'Hidden'} ({modulesList.length - enabledCount})
            </button>
          </div>

          <button
            onClick={handleEnableAll}
            className="px-3.5 py-2 rounded-2xl bg-[#ff5c01]/10 hover:bg-[#ff5c01]/20 text-[#ff5c01] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Enable all modules"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('enableAll') || 'Enable All'}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDefaults') || 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const isEnabled = dashboardPreferences[module.key];
          const Icon = module.icon;
          const isDependentOnProducts = module.dependsOn === 'products' && isProductsDisabled;

          return (
            <div
              key={module.key}
              className={`p-4.5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isEnabled
                  ? 'bg-white dark:bg-[#0c0c0e] border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#ff5c01]/40'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
              }`}
            >
              <div>
                {/* Top Bar: Icon + Toggle */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                      isEnabled
                        ? 'bg-[#ff5c01]/10 text-[#ff5c01]'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(module.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#ff5c01]"></div>
                  </label>
                </div>

                {/* Module Title & Description */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t(module.nameKey) || module.defaultName}</span>
                  {!isEnabled && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                      {t('filterDisabled') || 'Hidden'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {t(module.descKey) || module.defaultDesc}
                </p>

                {/* Dependency Warning Tag */}
                {isDependentOnProducts && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires Products to be turned ON</span>
                  </div>
                )}
              </div>

              {/* Status Badge footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400 dark:text-slate-500 capitalize">
                  {module.category}
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isEnabled
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>{t('filterEnabled') || 'Visible'}</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>{t('filterDisabled') || 'Hidden'}</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Information Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-[#ff5c01] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'নিরাপদ কাস্টমাইজেশন গ্যারান্টি' : 'Safe Customization & Data Preservation'}
          </p>
          <p>
            {language === 'bn'
              ? 'যেকোনো মডিউল বন্ধ করলেও আপনার পূর্বে সংরক্ষিত কোনো তথ্য, পণ্য, বিক্রয় বা কাস্টমার রেকর্ড মুছে যাবে না। পুনরায় মডিউল চালু করলে সবকিছু আগের মতোই পাবেন।'
              : 'Disabling any module simply hides it from your navigation and dashboard cards. None of your products, sales history, customer records, dues, or transaction data will ever be deleted.'}
          </p>
        </div>
      </div>
    </div>
  );
};

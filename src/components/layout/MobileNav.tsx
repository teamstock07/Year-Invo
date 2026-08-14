import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  ShoppingCart,
  CreditCard,
  Package,
  Grid,
  X,
  ShoppingBag,
  Receipt,
  FileSpreadsheet,
  Boxes,
  Users,
  Truck,
  QrCode,
  Sparkles,
  Settings,
  AlertTriangle,
  Tags,
  Zap,
  History,
  HelpCircle,
  Info,
  Crown,
  Store,
  TrendingUp,
} from 'lucide-react';

export const MobileNav: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const { activeTab, setActiveTab, user, t, dashboardPreferences } = useApp();
  const [showAllMenuSheet, setShowAllMenuSheet] = useState(false);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setShowAllMenuSheet(false);
  };

  const isProductsOn = dashboardPreferences?.products !== false;

  // Feature Categories for Mobile Sheet
  const rawFeatureCategories = [
    ...(user?.role === 'Owner'
      ? [
          {
            title: t('adminControl') || 'Admin Control',
            items: [
              {
                id: 'owner',
                name: t('navOwnerPanel') || 'Owner Panel',
                icon: Crown,
                color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
                badge: 'OWNER',
              },
            ],
          },
        ]
      : []),
    {
      title: t('salesOperations') || 'Sales Operations',
      items: [
        ...(dashboardPreferences?.quickSale !== false
          ? [
              {
                id: 'quicksale',
                name: t('navQuickSale') || 'Quick Sale',
                icon: Zap,
                color: 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/30',
                primary: true,
              },
            ]
          : []),
        ...(dashboardPreferences?.pos !== false
          ? [
              {
                id: 'pos',
                name: t('navPos') || 'POS System',
                icon: ShoppingCart,
                color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
                badge: user?.subscriptionPlan === 'Free' ? 'PRO' : undefined,
              },
            ]
          : []),
        ...(dashboardPreferences?.salesHistory !== false
          ? [
              {
                id: 'saleshistory',
                name: t('navSales') || 'Sales History',
                icon: History,
                color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
              },
            ]
          : []),
        ...(dashboardPreferences?.dueManagement !== false
          ? [
              {
                id: 'due',
                name: t('navDue') || 'Customer Dues',
                icon: CreditCard,
                color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
              },
            ]
          : []),
      ],
    },
    {
      title: t('inventoryManagement') || 'Inventory & Stock',
      items: [
        ...(isProductsOn
          ? [
              {
                id: 'products',
                name: t('navProducts') || 'Products Catalog',
                icon: Package,
                color: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
              },
            ]
          : []),
        ...(isProductsOn && dashboardPreferences?.categories !== false
          ? [
              {
                id: 'categories',
                name: t('navCategories') || 'Categories',
                icon: Tags,
                color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
              },
            ]
          : []),
        ...(isProductsOn && dashboardPreferences?.stockManagement !== false
          ? [
              {
                id: 'stock',
                name: t('navStock') || 'Stock Audit',
                icon: Boxes,
                color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
              },
            ]
          : []),
        ...(dashboardPreferences?.purchases !== false
          ? [
              {
                id: 'purchases',
                name: t('navPurchases') || 'Purchases',
                icon: ShoppingBag,
                color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
              },
            ]
          : []),
        ...(dashboardPreferences?.barcode !== false
          ? [
              {
                id: 'barcode',
                name: t('navBarcode') || 'Barcode & QR',
                icon: QrCode,
                color: 'bg-[#ff5c01]/10 text-[#ff5c01] dark:bg-[#ff5c01]/20',
              },
            ]
          : []),
        ...(dashboardPreferences?.expiryManagement !== false
          ? [
              {
                id: 'expired',
                name: t('navExpired') || 'Expired Products',
                icon: AlertTriangle,
                color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
              },
            ]
          : []),
      ],
    },
    {
      title: t('partiesContacts') || 'Customers & Suppliers',
      items: [
        ...(dashboardPreferences?.customers !== false
          ? [
              {
                id: 'customers',
                name: t('navCustomers') || 'Customers',
                icon: Users,
                color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
              },
            ]
          : []),
        ...(dashboardPreferences?.suppliers !== false
          ? [
              {
                id: 'suppliers',
                name: t('navSuppliers') || 'Suppliers',
                icon: Truck,
                color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
              },
            ]
          : []),
      ],
    },
    {
      title: t('financeAnalytics') || 'Finance & Analytics',
      items: [
        ...(dashboardPreferences?.expenses !== false
          ? [
              {
                id: 'expenses',
                name: t('navExpenses') || 'Expenses',
                icon: Receipt,
                color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
              },
            ]
          : []),
        ...(dashboardPreferences?.reports !== false
          ? [
              {
                id: 'reports',
                name: t('navProfit') || 'Reports & Profit',
                icon: TrendingUp,
                color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
              },
            ]
          : []),
        {
          id: 'ai',
          name: t('navAiInsights') || 'AI Business Advisor',
          icon: Sparkles,
          color: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
          badge: 'SOON',
        },
      ],
    },
    {
      title: t('storeManagement') || 'Management & Store',
      items: [
        {
          id: 'branding',
          name: t('branding') || 'Store Branding',
          icon: Store,
          color: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
        },
        {
          id: 'settings',
          name: t('navSettings') || t('settings') || 'Settings',
          icon: Settings,
          color: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
        },
        ...(dashboardPreferences?.support !== false
          ? [
              {
                id: 'help',
                name: t('navHelp') || 'Help & Support',
                icon: HelpCircle,
                color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
              },
            ]
          : []),
        {
          id: 'about',
          name: t('navAbout') || 'About YearInvo',
          icon: Info,
          color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        },
      ],
    },
  ].filter((cat) => cat.items.length > 0);

  const featureCategories = rawFeatureCategories;

  return (
    <>
      {/* Bottom Bar for Mobile - Strict 5-Column Grid ensuring Quick Sale is always 100% centered */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-1 py-1.5 grid grid-cols-5 items-center shadow-2xl">
        {/* 1. Home */}
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all w-full cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-[#ff5c01] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium truncate max-w-full">{t('navHome') || 'Home'}</span>
        </button>

        {/* 2. Products */}
        <button
          onClick={() => handleSelectTab('products')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all w-full cursor-pointer ${
            activeTab === 'products'
              ? 'text-[#ff5c01] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium truncate max-w-full">{t('navProducts') || 'Products'}</span>
        </button>

        {/* 3. Quick Sale (Primary Action - Centered in Column 3) */}
        <div className="flex flex-col items-center justify-center w-full relative">
          <button
            onClick={() => handleSelectTab('quicksale')}
            className={`flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-2xl transition-all cursor-pointer ring-4 ring-white dark:ring-[#0c0c0e] shadow-lg ${
              activeTab === 'quicksale'
                ? 'bg-[#ff5c01] text-white shadow-[#ff5c01]/40 scale-105'
                : 'bg-[#ff5c01] text-white shadow-[#ff5c01]/30 hover:scale-105 active:scale-95'
            }`}
            title={t('navQuickSale') || 'Quick Sale'}
          >
            <Zap className="w-6 h-6 fill-current" />
          </button>
          <span
            className={`text-[9px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full ${
              activeTab === 'quicksale' ? 'text-[#ff5c01]' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('navQuickSale') || 'Quick Sale'}
          </span>
        </div>

        {/* 4. Reports */}
        <button
          onClick={() => handleSelectTab('reports')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all w-full cursor-pointer ${
            activeTab === 'reports'
              ? 'text-[#ff5c01] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px] font-medium truncate max-w-full">{t('navProfit') || 'Reports'}</span>
        </button>

        {/* 5. Menu */}
        <button
          onClick={() => setShowAllMenuSheet(true)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all w-full cursor-pointer ${
            showAllMenuSheet
              ? 'text-[#ff5c01] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium truncate max-w-full">{t('navMenu') || 'Menu'}</span>
        </button>
      </div>

      {/* Premium All Functions Menu Sheet Modal on Mobile */}
      {showAllMenuSheet && (
        <div
          onClick={() => setShowAllMenuSheet(false)}
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end transition-all animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl custom-scrollbar"
          >
            {/* Modal Premium Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] dark:bg-[#ff5c01]/20">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {t('navMenu') || 'Menu'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Explore Features & Functions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllMenuSheet(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Function Cards */}
            <div className="space-y-5">
              {featureCategories.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all active:scale-[0.97] text-left cursor-pointer group ${
                            item.primary
                              ? 'bg-gradient-to-r from-[#ff5c01] to-[#e05100] text-white border-transparent shadow-md shadow-[#ff5c01]/25 ring-2 ring-[#ff5c01]/30'
                              : isItemActive
                              ? 'bg-[#ff5c01]/10 dark:bg-[#ff5c01]/20 border-[#ff5c01]/40 text-[#ff5c01] font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              item.primary ? 'bg-white/20 text-white' : item.color
                            }`}
                          >
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`block text-xs font-bold leading-snug truncate ${
                                  item.primary
                                    ? 'text-white'
                                    : isItemActive
                                    ? 'text-[#ff5c01]'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0 ${
                                    item.primary
                                      ? 'bg-white/30 text-white'
                                      : 'bg-[#ff5c01]/15 text-[#ff5c01] dark:bg-[#ff5c01]/25 dark:text-[#ff8038]'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowAllMenuSheet(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};



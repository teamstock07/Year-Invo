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
  Shield,
  HelpCircle,
  HelpCircle as SupportIcon,
  Info,
  Crown,
} from 'lucide-react';

export const MobileNav: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const { activeTab, setActiveTab, user, t } = useApp();
  const [showAllMenuSheet, setShowAllMenuSheet] = useState(false);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setShowAllMenuSheet(false);
  };

  // Feature Categories for Mobile Sheet
  const featureCategories = [
    ...(user?.role === 'Owner'
      ? [
          {
            title: t('adminControl') || 'Admin Control',
            items: [
              {
                id: 'owner',
                name: t('navOwnerPanel') || 'Owner Panel',
                icon: Crown,
                color: 'bg-purple-500 text-white dark:bg-purple-600',
              },
            ],
          },
        ]
      : []),
    {
      title: t('salesOperations') || 'Sales Operations',
      items: [
        { id: 'quicksale', name: t('navQuickSale') || 'Quick Sale', icon: Zap, color: 'bg-[#ff5c01]/10 text-[#ff5c01] dark:bg-[#ff5c01]/20' },
        { id: 'pos', name: t('navPos') || 'POS Register', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
        { id: 'saleshistory', name: t('navSales') || 'Sales History', icon: History, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
        { id: 'due', name: t('navDue') || 'Customer Dues', icon: CreditCard, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
      ],
    },
    {
      title: t('businessTools') || 'Business Tools',
      items: [
        { id: 'stock', name: t('navStock') || 'Stock Audit', icon: Boxes, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' },
        { id: 'expired', name: t('navExpired') || 'Expiry Products', icon: AlertTriangle, color: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400' },
        { id: 'ai', name: t('navAiInsights') || 'AI Insights', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
        { id: 'reports', name: t('navProfit') || 'Business Reports', icon: FileSpreadsheet, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
      ],
    },
    {
      title: t('otherUtilities') || 'Other Utilities',
      items: [
        { id: 'products', name: t('navProducts') || 'Product Catalog', icon: Package, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' },
        { id: 'categories', name: t('navCategories') || 'Categories', icon: Tags, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400' },
        { id: 'customers', name: t('navCustomers') || 'Customers', icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' },
        { id: 'suppliers', name: t('navSuppliers') || 'Suppliers', icon: Truck, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
        { id: 'barcode', name: t('navBarcode') || 'Barcode Print', icon: QrCode, color: 'bg-[#ff5c01]/10 text-[#ff5c01]' },
        { id: 'settings', name: t('navSettings') || t('settings') || 'Settings', icon: Settings, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
        { id: 'help', name: t('navHelp') || 'Help & Support', icon: HelpCircle, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
        { id: 'about', name: t('navAbout') || 'About', icon: Info, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' },
      ],
    },
  ];

  return (
    <>
      {/* Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {/* 1. Home */}
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#ff5c01] font-bold bg-[#ff5c01]/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{t('navHome') || 'Home'}</span>
        </button>

        {/* 2. Products */}
        <button
          onClick={() => handleSelectTab('products')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'products'
              ? 'text-[#ff5c01] font-bold bg-[#ff5c01]/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">{t('navProducts') || 'Products'}</span>
        </button>

        {/* 3. Center Highlighted Quick Sale Button */}
        <button
          onClick={() => handleSelectTab('quicksale')}
          className="flex flex-col items-center justify-center -mt-5 w-13 h-13 rounded-2xl bg-[#ff5c01] text-white shadow-xl shadow-[#ff5c01]/35 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white dark:ring-[#0c0c0e]"
          title="Quick Sale"
        >
          <Zap className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tight">{t('navQuickSale') || 'Quick Sale'}</span>
        </button>

        {/* 4. Reports */}
        <button
          onClick={() => handleSelectTab('reports')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'reports'
              ? 'text-[#ff5c01] font-bold bg-[#ff5c01]/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px]">{t('navProfit') || 'Reports'}</span>
        </button>

        {/* 5. Menu */}
        <button
          onClick={() => setShowAllMenuSheet(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            showAllMenuSheet
              ? 'text-[#ff5c01] font-bold bg-[#ff5c01]/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">{t('navMenu') || 'Menu'}</span>
        </button>
      </div>

      {/* All Functions Sheet Modal on Mobile */}
      {showAllMenuSheet && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end transition-all animate-fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {t('allAppFunctions') || 'All App Functions'}
                </h3>
              </div>
              <button
                onClick={() => setShowAllMenuSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Function Categories */}
            {featureCategories.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
                      >
                        <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center mb-1.5 shadow-xs group-active:scale-95 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowAllMenuSheet(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider"
              >
                {t('close') || 'Close Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


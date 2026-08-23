import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineDashboardView } from './OnlineDashboardView';
import { OnlineOrdersView } from './OnlineOrdersView';
import { OnlineOrderStatusView } from './OnlineOrderStatusView';
import { OnlineProductsView } from './OnlineProductsView';
import { OnlineCustomersView } from './OnlineCustomersView';
import { DeliverySettingsView } from './DeliverySettingsView';
import { CodManagementView } from './CodManagementView';
import { OnlineReportsView } from './OnlineReportsView';
import {
  ShoppingBag,
  LayoutDashboard,
  Truck,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Package,
} from 'lucide-react';

interface OnlineBusinessModuleProps {
  initialSubTab?: string;
  initialTab?: string;
}

const normalizeSubTab = (tabName?: string): string => {
  if (!tabName) return 'dashboard';
  const clean = tabName.toLowerCase().replace(/[-_]/g, '');
  if (clean.includes('status')) return 'status';
  if (clean.includes('order')) return 'orders';
  if (clean.includes('product')) return 'products';
  if (clean.includes('customer')) return 'customers';
  if (clean.includes('delivery') || clean.includes('rate') || clean.includes('review')) return 'delivery';
  if (clean.includes('cod')) return 'cod';
  if (clean.includes('report')) return 'reports';
  return 'dashboard';
};

export const OnlineBusinessModule: React.FC<OnlineBusinessModuleProps> = ({
  initialSubTab,
  initialTab,
}) => {
  const { t, activeTab, setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<string>(() =>
    normalizeSubTab(initialTab || initialSubTab || activeTab)
  );

  // Synchronize active sub-tab when user navigates via Sidebar, MobileNav, or direct tab trigger
  useEffect(() => {
    const target = initialTab || initialSubTab || activeTab;
    if (target) {
      const normalized = normalizeSubTab(target);
      setActiveSubTab(normalized);
    }
  }, [initialTab, initialSubTab, activeTab]);

  const handleSubTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    // Keep sidebar and active tab in sync
    const correspondingGlobalTab = `online-${tabId === 'orders' ? 'orders' : tabId === 'status' ? 'status' : tabId === 'customers' ? 'customers' : tabId === 'delivery' ? 'delivery' : tabId === 'cod' ? 'cod' : tabId === 'reports' ? 'reports' : tabId === 'products' ? 'products' : 'dashboard'}`;
    if (activeTab !== correspondingGlobalTab) {
      setActiveTab(correspondingGlobalTab);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('onlineDashboard') || 'Online Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: t('onlineOrders') || 'Online Orders', icon: ShoppingBag },
    { id: 'products', label: t('onlineProducts') || 'Online Products', icon: Package },
    { id: 'status', label: t('orderStatus') || 'Order Status', icon: Truck },
    { id: 'customers', label: t('onlineCustomers') || 'Online Customers', icon: Users },
    { id: 'delivery', label: t('deliveryAndRates') || 'Delivery & Rates', icon: Settings },
    { id: 'cod', label: t('codManagement') || 'COD Management', icon: DollarSign },
    { id: 'reports', label: t('onlineReports') || 'Online Reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200/60 dark:border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSubTabChange(item.id)}
              className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sub-View Content */}
      <div>
        {activeSubTab === 'dashboard' && (
          <OnlineDashboardView onNavigateToTab={(tab) => handleSubTabChange(tab)} />
        )}
        {activeSubTab === 'orders' && (
          <OnlineOrdersView onNavigateToTab={(tab) => handleSubTabChange(tab)} />
        )}
        {activeSubTab === 'products' && <OnlineProductsView />}
        {activeSubTab === 'status' && <OnlineOrderStatusView />}
        {activeSubTab === 'customers' && <OnlineCustomersView />}
        {activeSubTab === 'delivery' && <DeliverySettingsView />}
        {activeSubTab === 'cod' && <CodManagementView />}
        {activeSubTab === 'reports' && <OnlineReportsView />}
      </div>
    </div>
  );
};


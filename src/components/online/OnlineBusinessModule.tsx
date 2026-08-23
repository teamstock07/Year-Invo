import React, { useState } from 'react';
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
}

export const OnlineBusinessModule: React.FC<OnlineBusinessModuleProps> = ({
  initialSubTab = 'dashboard',
}) => {
  const { t } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);

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
              onClick={() => setActiveSubTab(item.id)}
              className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
          <OnlineDashboardView onNavigateToTab={(tab) => setActiveSubTab(tab)} />
        )}
        {activeSubTab === 'orders' && (
          <OnlineOrdersView onNavigateToTab={(tab) => setActiveSubTab(tab)} />
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

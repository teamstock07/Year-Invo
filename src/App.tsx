import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { PosSystem } from './components/pos/PosSystem';
import { ProductList } from './components/products/ProductList';
import { CategoryBrandView } from './components/category/CategoryBrandView';
import { StockManagement } from './components/stock/StockManagement';
import { ExpiredProductsView } from './components/stock/ExpiredProductsView';
import { SalesModule } from './components/sales/SalesModule';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { DueManagement } from './components/due/DueManagement';
import { ExpenseList } from './components/expenses/ExpenseList';
import { CustomerDirectoryView } from './components/customers/CustomerDirectoryView';
import { SupplierDirectoryView } from './components/suppliers/SupplierDirectoryView';
import { ReportsView } from './components/reports/ReportsView';
import { BarcodeGeneratorView } from './components/barcode/BarcodeGeneratorView';
import { AiInsightsView } from './components/ai/AiInsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { BrandingView } from './components/settings/BrandingView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { HelpSupportView } from './components/help/HelpSupportView';
import { AboutView } from './components/about/AboutView';
import { LoginView } from './components/auth/LoginView';

import { getDisplayBrandName } from './utils/brand';

const MainLayout: React.FC = () => {
  const { user, activeTab, theme, settings } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    document.title = getDisplayBrandName(settings.brandName);
  }, [settings.brandName]);

  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'quicksale':
      case 'sales':
        return <SalesModule initialSubTab="quicksale" />;
      case 'pos':
        return <SalesModule initialSubTab="pos" />;
      case 'products':
        return <ProductList />;
      case 'categories':
        return <CategoryBrandView />;
      case 'stock':
        return <StockManagement />;
      case 'saleshistory':
        return <SalesModule initialSubTab="history" />;
      case 'purchases':
        return <StockManagement />;
      case 'customers':
        return <CustomerDirectoryView />;
      case 'suppliers':
        return <SupplierDirectoryView />;
      case 'due':
        return <DueManagement />;
      case 'expenses':
        return <ExpenseList />;
      case 'reports':
      case 'profit':
        return <ReportsView />;
      case 'expired':
        return <ExpiredProductsView />;
      case 'barcode':
        return <BarcodeGeneratorView />;
      case 'ai':
        return <AiInsightsView />;
      case 'settings':
        return <SettingsView />;
      case 'branding':
        return <BrandingView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'help':
        return <HelpSupportView />;
      case 'about':
        return <AboutView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`h-screen overflow-hidden font-sans ${theme === 'dark' ? 'dark bg-[#09090b] text-slate-200' : 'bg-[#F5F7FA] text-slate-900'} antialiased flex flex-col`}>
      {/* Top Header Navigation */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Locked Left Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar pb-24 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

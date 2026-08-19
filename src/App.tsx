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
import { PurchasesView } from './components/purchases/PurchasesView';
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
import { CustomizeDashboardView } from './components/settings/CustomizeDashboardView';
import { ProfileView } from './components/profile/ProfileView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { HelpSupportView } from './components/help/HelpSupportView';
import { AboutView } from './components/about/AboutView';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { LoginView } from './components/auth/LoginView';
import { LivePublicView } from './components/public/LivePublicView';
import { TeamManagementView } from './components/team/TeamManagementView';
import { PayrollView } from './components/payroll/PayrollView';
import { SmartReorderView } from './components/stock/SmartReorderView';
import { CustomerLoyaltyView } from './components/customers/CustomerLoyaltyView';
import { SalesCalendarView } from './components/sales/SalesCalendarView';
import { AuditLogView } from './components/audit/AuditLogView';
import { CapitalInvestmentView } from './components/capital/CapitalInvestmentView';
import { BusinessTypeSetupModal } from './components/common/BusinessTypeSetupModal';
import { EmailVerificationPrompt } from './components/auth/EmailVerificationPrompt';

import { getDisplayBrandName } from './utils/brand';

const MainLayout: React.FC = () => {
  const { user, isEmailVerified, activeTab, setActiveTab, theme, settings } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFirstTimeBizModal, setShowFirstTimeBizModal] = useState(() => {
    if (!user) return false;
    const hasPrompted = localStorage.getItem(`biz_type_prompted_${user.id}`);
    return !user.businessType && !hasPrompted;
  });

  // Check URL parameters for Live Customer Due or Live Invoice View
  const [urlParams, setUrlParams] = useState(() => new URLSearchParams(window.location.search));

  React.useEffect(() => {
    document.title = getDisplayBrandName(settings.brandName);
  }, [settings.brandName]);

  const dueCustomerId = urlParams.get('dueCustomerId') || urlParams.get('dueId') || urlParams.get('customer');
  const invoiceNo = urlParams.get('invoice') || urlParams.get('invoiceNo');

  const handleClearLiveView = () => {
    window.history.pushState({}, '', window.location.pathname);
    setUrlParams(new URLSearchParams(''));
  };

  // If live statement parameter is present in URL, present LivePublicView directly
  if (dueCustomerId || invoiceNo) {
    return (
      <LivePublicView
        dueCustomerId={dueCustomerId}
        invoiceNo={invoiceNo}
        onExitLiveView={handleClearLiveView}
      />
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Enforce Email Verification: Show EmailVerificationPrompt screen until email is verified
  const isAdminUser = user.email?.trim().toLowerCase() === 'teamstock07@gmail.com';
  if (!isAdminUser && !isEmailVerified && !user.verifiedEmail) {
    return <EmailVerificationPrompt />;
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
      case 'smart-reorder':
      case 'smartReorder':
        return <SmartReorderView />;
      case 'saleshistory':
        return <SalesModule initialSubTab="history" />;
      case 'sales-calendar':
      case 'salesCalendar':
        return <SalesCalendarView />;
      case 'purchases':
        return <PurchasesView />;
      case 'customers':
        return <CustomerDirectoryView />;
      case 'loyalty':
      case 'customerLoyalty':
        return <CustomerLoyaltyView />;
      case 'suppliers':
        return <SupplierDirectoryView onNavigateToPurchases={() => setActiveTab('purchases')} />;
      case 'due':
        return <DueManagement />;
      case 'expenses':
        return <ExpenseList />;
      case 'capital-investment':
      case 'capitalInvestment':
      case 'capital':
      case 'investment':
        return <CapitalInvestmentView />;
      case 'team':
      case 'teamManagement':
        return <TeamManagementView />;
      case 'payroll':
      case 'salary':
        return <PayrollView />;
      case 'audit':
      case 'audit-log':
      case 'auditLog':
        return <AuditLogView />;
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
      case 'profile':
        return <ProfileView />;
      case 'customize-dashboard':
        return <CustomizeDashboardView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'help':
        return <HelpSupportView />;
      case 'about':
        return <AboutView />;
      case 'owner':
        return <OwnerDashboard />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`h-screen overflow-hidden font-sans ${theme === 'dark' ? 'dark bg-[#0b0f19] text-slate-200' : 'bg-[#f1f5f9] text-slate-900'} bg-grid-pattern antialiased flex flex-col relative`}>
      {/* Subtle Ambient Radial Highlights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-orange-500/5 via-amber-500/3 to-transparent blur-3xl rounded-full" />

      {/* Top Header Navigation */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Responsive Locked Left Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar pb-24 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* First-time Business Type Selection Modal */}
      {showFirstTimeBizModal && (
        <BusinessTypeSetupModal
          isOpen={showFirstTimeBizModal}
          onClose={() => {
            if (user) {
              localStorage.setItem(`biz_type_prompted_${user.id}`, 'true');
            }
            setShowFirstTimeBizModal(false);
          }}
        />
      )}

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

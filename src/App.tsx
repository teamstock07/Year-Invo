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
import { OnlineBusinessModule } from './components/online/OnlineBusinessModule';
import { PersonalLedgerModule } from './components/personalLedger/PersonalLedgerModule';
import { BusinessTypeSetupModal } from './components/common/BusinessTypeSetupModal';
import { EmailVerificationPrompt } from './components/auth/EmailVerificationPrompt';
import { AcceptInvitationView } from './components/team/AcceptInvitationView';
import { PremiumFeatureGuard } from './components/common/PremiumFeatureGuard';
import { ShoppingCart, BookOpen, QrCode, ShieldCheck, Banknote, Sparkles, Award, Activity } from 'lucide-react';

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
  const invitationToken = urlParams.get('token') || urlParams.get('inviteToken') || urlParams.get('invitationToken');

  const handleClearLiveView = () => {
    window.history.pushState({}, '', window.location.pathname);
    setUrlParams(new URLSearchParams(''));
  };

  // If team invitation token is present in URL, present AcceptInvitationView directly
  if (invitationToken) {
    return (
      <AcceptInvitationView
        token={invitationToken}
        onSuccess={handleClearLiveView}
      />
    );
  }

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
        return (
          <PremiumFeatureGuard
            featureKey="isPosAllowed"
            featureNameEn="Point of Sale (POS) Register"
            featureNameBn="পয়েন্ট অব সেল (POS) কাউন্টার"
            descriptionEn="Full counter POS terminal with barcode scanning, custom discounts, cash register, and receipt printing."
            descriptionBn="বারকোড স্ক্যানিং, কাস্টম ডিসকাউন্ট ও ক্যাশ রসিদ প্রিন্টিংসহ সম্পূর্ণ পিওএস ক্যাশ কাউন্টার।"
            icon={ShoppingCart}
          >
            <SalesModule initialSubTab="pos" />
          </PremiumFeatureGuard>
        );
      case 'products':
        return <ProductList />;
      case 'categories':
        return <CategoryBrandView />;
      case 'stock':
        return <StockManagement />;
      case 'smart-reorder':
      case 'smartReorder':
        return (
          <PremiumFeatureGuard
            featureKey="isSmartReorderAllowed"
            featureNameEn="Smart Reorder System"
            featureNameBn="স্মার্ট রি-অর্ডার সিস্টেম"
            descriptionEn="Predictive inventory intelligence with automatic supplier reordering and stock depletion forecasts."
            descriptionBn="স্বয়ংক্রিয় রি-অর্ডার অ্যালার্ট, স্টক পূর্বাভাস ও সাপ্লায়ার রিকমেন্ডেশন সিস্টেম।"
            icon={Sparkles}
          >
            <SmartReorderView />
          </PremiumFeatureGuard>
        );
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
        return (
          <PremiumFeatureGuard
            featureKey="isCustomerLoyaltyAllowed"
            featureNameEn="Customer Loyalty & Rewards"
            featureNameBn="কাস্টমার লয়ালটি ও পয়েন্ট প্রোগ্রাম"
            descriptionEn="Build customer retention with automatic points accumulation, redemption rules, and tier rewards."
            descriptionBn="গ্রাহকদের জন্য পয়েন্ট রিওয়ার্ড প্রোগ্রাম, ক্যাশব্যাক ও বিশেষ মেম্বারশিপ সুবিধা।"
            icon={Award}
          >
            <CustomerLoyaltyView />
          </PremiumFeatureGuard>
        );
      case 'suppliers':
        return <SupplierDirectoryView onNavigateToPurchases={() => setActiveTab('purchases')} />;
      case 'due':
        return <DueManagement />;
      case 'personal-ledger':
      case 'personalLedger':
      case 'personal':
      case 'personal_ledger':
        return (
          <PremiumFeatureGuard
            featureKey="isPersonalLedgerAllowed"
            featureNameEn="Personal Ledger (ব্যক্তিগত খাতা)"
            featureNameBn="ব্যক্তিগত খাতা"
            descriptionEn="Isolated digital ledger for managing personal loans, borrowing, and friends/family dues."
            descriptionBn="ব্যবসায়িক হিসাবের বাইরে ব্যক্তিগত ধার-দেনা ও ঋণের সম্পূর্ণ পৃথক হিসাব খাতা।"
            icon={BookOpen}
          >
            <PersonalLedgerModule />
          </PremiumFeatureGuard>
        );
      case 'expenses':
        return <ExpenseList />;
      case 'capital-investment':
      case 'capitalInvestment':
      case 'capital':
      case 'investment':
        return <CapitalInvestmentView />;
      case 'online-business':
      case 'onlineBusiness':
      case 'online':
      case 'online-dashboard':
      case 'onlineDashboard':
      case 'online_dashboard':
      case 'onlinedashboard':
      case 'online-orders':
      case 'online-order':
      case 'onlineOrders':
      case 'onlineOrder':
      case 'online_orders':
      case 'online_order':
      case 'onlineorders':
      case 'onlineorder':
      case 'online-status':
      case 'onlineStatus':
      case 'online_status':
      case 'onlinestatus':
      case 'order-status':
      case 'orderStatus':
      case 'online-products':
      case 'online-product':
      case 'onlineProducts':
      case 'onlineProduct':
      case 'online_products':
      case 'onlineproducts':
      case 'online-customers':
      case 'online-customer':
      case 'onlineCustomers':
      case 'onlineCustomer':
      case 'online_customers':
      case 'onlinecustomers':
      case 'online-delivery':
      case 'onlineDelivery':
      case 'online_delivery':
      case 'online-delivery-review':
      case 'online-delivery-and-review':
      case 'onlineDeliveryReview':
      case 'onlineDeliveryAndReview':
      case 'onlinedelivery':
      case 'delivery-and-review':
      case 'deliveryAndReview':
      case 'delivery-rates':
      case 'deliveryRates':
      case 'delivery-settings':
      case 'deliverySettings':
      case 'online-cod':
      case 'onlineCod':
      case 'online_cod':
      case 'onlinecod':
      case 'cod-management':
      case 'codManagement':
      case 'online-reports':
      case 'online-report':
      case 'onlineReports':
      case 'onlineReport':
      case 'online_reports':
      case 'online_report':
      case 'onlinereports':
      case 'onlinereport':
        return <OnlineBusinessModule initialTab={activeTab} initialSubTab={activeTab} />;
      case 'team':
      case 'teamManagement':
      case 'team-management':
      case 'team_management':
      case 'teammanagement':
      case 'ceo':
      case 'ceo-team':
      case 'ceoTeam':
      case 'ceoteam':
      case 'ceo-team-management':
      case 'ceoTeamManagement':
      case 'ceo_team_management':
      case 'ceoteammanagement':
      case 'staff':
      case 'employees':
        return (
          <PremiumFeatureGuard
            featureKey="isTeamManagementAllowed"
            featureNameEn="Team Member Management & Roles"
            featureNameBn="টিম ম্যানেজমেন্ট ও রোলস"
            descriptionEn="Invite staff members, create custom roles, assign branches, and manage permissions."
            descriptionBn="কর্মী নিয়োগ, কাস্টম রোল তৈরি, ব্রাঞ্চ অ্যাসাইন ও সিকিউরিটি পারমিশন নিয়ন্ত্রণ।"
            icon={ShieldCheck}
          >
            <TeamManagementView />
          </PremiumFeatureGuard>
        );
      case 'payroll':
      case 'salary':
        return (
          <PremiumFeatureGuard
            featureKey="isPayrollAllowed"
            featureNameEn="Employee Payroll & Salaries"
            featureNameBn="কর্মচারী বেতন ও পে-রোল"
            descriptionEn="Manage staff salaries, overtime, bonuses, advance pay adjustments, and print salary slips."
            descriptionBn="কর্মচারীদের মাসিক বেতন, বোনাস, অগ্রিম কর্তন ও পে-স্লিপ জেনারেট করার সুবিধা।"
            icon={Banknote}
          >
            <PayrollView />
          </PremiumFeatureGuard>
        );
      case 'audit':
      case 'audit-log':
      case 'auditLog':
        return (
          <PremiumFeatureGuard
            featureKey="isAuditLogAllowed"
            featureNameEn="Audit Log & Security Tracking"
            featureNameBn="অডিট লগ ও সিস্টেম অ্যাক্টিভিটি"
            descriptionEn="Real-time activity audit trail tracking every staff action, stock modification, and financial edit."
            descriptionBn="স্টাফদের প্রতিটি কার্যকলাপ, স্টক পরিবর্তন ও আর্থিক লেনদেন পরিবর্তনের বিস্তারিত লগ।"
            icon={Activity}
          >
            <AuditLogView />
          </PremiumFeatureGuard>
        );
      case 'reports':
      case 'profit':
        return <ReportsView />;
      case 'expired':
        return <ExpiredProductsView />;
      case 'barcode':
        return (
          <PremiumFeatureGuard
            featureKey="isQrBarcodeAllowed"
            featureNameEn="Barcode & QR Code Generator"
            featureNameBn="বারকোড ও কিউআর কোড জেনারেটর"
            descriptionEn="Design custom barcode and QR code stickers, configure layout sizes, and print in multi-label thermal or A4 sheets."
            descriptionBn="কাস্টম বারকোড ও কিউআর লেবেল জেনারেটর এবং থার্মাল রোল ও A4 পেপারে প্রিন্টিং।"
            icon={QrCode}
          >
            <BarcodeGeneratorView />
          </PremiumFeatureGuard>
        );
      case 'ai':
        return (
          <PremiumFeatureGuard
            featureKey="isAiInsightsAllowed"
            featureNameEn="AI Business Assistant & Intelligence"
            featureNameBn="এআই বিজনেস অ্যাসিস্ট্যান্ট"
            descriptionEn="AI business forecasts, demand prediction, expense optimization, and profit-growth suggestions."
            descriptionBn="এআই ভিত্তিক ভবিষ্যৎ সেলস প্রেডিকশন, খরচ নিয়ন্ত্রণ ও লাভ বাড়ানোর পরামর্শ।"
            icon={Sparkles}
          >
            <AiInsightsView />
          </PremiumFeatureGuard>
        );
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
        if (user?.email?.toLowerCase().trim() === 'teamstock07@gmail.com' || user?.role === 'PlatformOwner') {
          return <OwnerDashboard />;
        }
        return <DashboardView />;
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

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, DashboardPreferences, defaultDashboardPreferences } from '../../types';
import {
  SlidersHorizontal,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  LayoutDashboard,
  Zap,
  ShoppingCart,
  Package,
  Tags,
  Boxes,
  History,
  ShoppingBag,
  Truck,
  Users,
  CreditCard,
  Award,
  Receipt,
  TrendingUp,
  BarChart3,
  Calendar,
  Bell,
  UserCheck,
  Coins,
  QrCode,
  ShieldCheck,
  Store,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  User,
  Shield,
  ToggleLeft,
  ToggleRight,
  Filter,
} from 'lucide-react';

interface FeatureDefinition {
  key: keyof DashboardPreferences;
  name: string;
  nameBn?: string;
  description: string;
  category: 'core' | 'sales' | 'inventory' | 'finance' | 'management' | 'system';
  icon: any;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    nameBn: 'ড্যাশবোর্ড',
    description: 'Main overview dashboard, live analytics & KPI metrics summary',
    category: 'core',
    icon: LayoutDashboard,
  },
  {
    key: 'quickSale',
    name: 'Quick Sale',
    nameBn: 'কুইক সেল',
    description: 'Instant barcode counter checkout and accelerated fast billing',
    category: 'sales',
    icon: Zap,
  },
  {
    key: 'pos',
    name: 'POS & Sell',
    nameBn: 'পিওএস ও বিক্রয়',
    description: 'Full POS counter terminal with carts, discount, receipts & search',
    category: 'sales',
    icon: ShoppingCart,
  },
  {
    key: 'products',
    name: 'Products',
    nameBn: 'পণ্য তালিকা',
    description: 'Product catalog, pricing, buying rates, stock alerts & details',
    category: 'inventory',
    icon: Package,
  },
  {
    key: 'categories',
    name: 'Categories',
    nameBn: 'ক্যাটাগরি',
    description: 'Product category classification, grouping & brands organization',
    category: 'inventory',
    icon: Tags,
  },
  {
    key: 'stockManagement',
    name: 'Stock Management',
    nameBn: 'স্টক ম্যানেজমেন্ট',
    description: 'Inventory audit, physical stock adjustments & low-stock warnings',
    category: 'inventory',
    icon: Boxes,
  },
  {
    key: 'smartReorder',
    name: 'Smart Reorder',
    nameBn: 'স্মার্ট রিঅর্ডার',
    description: 'Intelligent inventory depletion forecasting & reorder recommendations',
    category: 'inventory',
    icon: Sparkles,
  },
  {
    key: 'salesManagement',
    name: 'Sales Management',
    nameBn: 'বিক্রয় ব্যবস্থাপনা',
    description: 'Invoice lookup, return authorizations, discount audits & slips',
    category: 'sales',
    icon: ShoppingBag,
  },
  {
    key: 'salesHistory',
    name: 'Sales History',
    nameBn: 'বিক্রয় ইতিহাস',
    description: 'Complete sales transaction log, receipt printing & customer invoices',
    category: 'sales',
    icon: History,
  },
  {
    key: 'purchases',
    name: 'Purchases',
    nameBn: 'ক্রয় হিসাব',
    description: 'Supplier purchase orders, inbound goods receiving & invoices',
    category: 'inventory',
    icon: ShoppingBag,
  },
  {
    key: 'suppliers',
    name: 'Suppliers',
    nameBn: 'সাপ্লায়ার',
    description: 'Vendor contact directory, supplier ledger & purchase records',
    category: 'inventory',
    icon: Truck,
  },
  {
    key: 'customers',
    name: 'Customers',
    nameBn: 'কাস্টমার',
    description: 'Customer contact directory, purchase profiles & phone list',
    category: 'sales',
    icon: Users,
  },
  {
    key: 'dueManagement',
    name: 'Customer Due',
    nameBn: 'বাকি খাতা',
    description: 'Customer credit ledger, due collection tracker & reminder logs',
    category: 'sales',
    icon: CreditCard,
  },
  {
    key: 'customerLoyalty',
    name: 'Customer Loyalty',
    nameBn: 'কাস্টমার লয়্যালটি',
    description: 'Reward points, membership tiers & loyalty discounts',
    category: 'sales',
    icon: Award,
  },
  {
    key: 'expenses',
    name: 'Expenses',
    nameBn: 'দৈনিক খরচ',
    description: 'Daily operational expenses, utility bills, rent & petty cash',
    category: 'finance',
    icon: Receipt,
  },
  {
    key: 'reports',
    name: 'Profit & Loss / Reports',
    nameBn: 'লাভ-ক্ষতি ও রিপোর্ট',
    description: 'Comprehensive P&L analysis, revenue summaries & exportable reports',
    category: 'finance',
    icon: TrendingUp,
  },
  {
    key: 'salesCalendar',
    name: 'Sales Calendar',
    nameBn: 'সেলস ক্যালেন্ডার',
    description: 'Interactive day-by-day sales activity view & revenue spikes',
    category: 'sales',
    icon: Calendar,
  },
  {
    key: 'notifications',
    name: 'Notifications',
    nameBn: 'নোটিফিকেশন',
    description: 'System alerts, low stock pings, due alerts & activity messages',
    category: 'system',
    icon: Bell,
  },
  {
    key: 'teamManagement',
    name: 'Team Management',
    nameBn: 'টিম ম্যানেজমেন্ট',
    description: 'Staff accounts, role permissions, activity logs & access limits',
    category: 'management',
    icon: UserCheck,
  },
  {
    key: 'payroll',
    name: 'Employee Payroll',
    nameBn: 'কর্মচারী বেতন',
    description: 'Staff payroll, monthly salary vouchers, advances & attendance records',
    category: 'management',
    icon: Coins,
  },
  {
    key: 'capitalInvestment',
    name: 'Capital & Investment',
    nameBn: 'মূলধন ও বিনিয়োগ',
    description: 'Owner capital injections, partner shares & pure equity tracking',
    category: 'finance',
    icon: Coins,
  },
  {
    key: 'barcode',
    name: 'Barcode & QR',
    nameBn: 'বারকোড ও কিউআর',
    description: 'Barcode sticker generator, printable labels & product QR codes',
    category: 'inventory',
    icon: QrCode,
  },
  {
    key: 'aiAssistant',
    name: 'AI Business Assistant',
    nameBn: 'এআই সহকারী',
    description: 'Smart automated business recommendations, restocking insights & tips',
    category: 'core',
    icon: Sparkles,
  },
  {
    key: 'auditLog',
    name: 'Audit Log',
    nameBn: 'অডিট লগ',
    description: 'Security operation trails, user logins, edits & deletion archives',
    category: 'system',
    icon: ShieldCheck,
  },
  {
    key: 'storeSettings',
    name: 'Store Settings',
    nameBn: 'স্টোর সেটিংস',
    description: 'Business profile, branding logo, receipt config & printer setup',
    category: 'system',
    icon: Store,
  },
  {
    key: 'dashboardCustomization',
    name: 'Dashboard Customization',
    nameBn: 'ড্যাশবোর্ড কাস্টমাইজেশন',
    description: 'Merchant dashboard layout customizer, module toggles & cards ordering',
    category: 'system',
    icon: Sliders,
  },
];

interface AccountFeatureControlProps {
  selectedUserFromParent?: UserProfile | null;
  onSelectUserFromParent?: (user: UserProfile | null) => void;
}

export const AccountFeatureControl: React.FC<AccountFeatureControlProps> = ({
  selectedUserFromParent,
  onSelectUserFromParent,
}) => {
  const { allUsers, updateUserData, logActivity } = useApp();

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'sales' | 'inventory' | 'finance' | 'management' | 'system'>('all');
  const [featureSearch, setFeatureSearch] = useState('');
  
  // Selected user for feature management
  const [selectedUserId, setSelectedUserId] = useState<string>(
    selectedUserFromParent?.id || (allUsers.length > 0 ? allUsers[0].id : '')
  );

  // Local feature toggles state for active user
  const selectedUser = useMemo(() => {
    return allUsers.find((u) => u.id === selectedUserId) || allUsers[0] || null;
  }, [allUsers, selectedUserId]);

  const [featuresState, setFeaturesState] = useState<DashboardPreferences>(
    selectedUser?.dashboardPreferences
      ? { ...defaultDashboardPreferences, ...selectedUser.dashboardPreferences }
      : defaultDashboardPreferences
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state whenever selected user changes
  React.useEffect(() => {
    if (selectedUser) {
      setFeaturesState(
        selectedUser.dashboardPreferences
          ? { ...defaultDashboardPreferences, ...selectedUser.dashboardPreferences }
          : defaultDashboardPreferences
      );
    }
  }, [selectedUser]);

  // Sync with parent prop if provided
  React.useEffect(() => {
    if (selectedUserFromParent) {
      setSelectedUserId(selectedUserFromParent.id);
    }
  }, [selectedUserFromParent]);

  // Filtered users for user picker
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = userSearch.toLowerCase();
      return (
        (u.ownerName || '').toLowerCase().includes(q) ||
        (u.brandName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.mobile || '').toLowerCase().includes(q) ||
        (u.subscriptionPlan || '').toLowerCase().includes(q)
      );
    });
  }, [allUsers, userSearch]);

  // Filtered features list
  const filteredFeatures = useMemo(() => {
    return FEATURE_DEFINITIONS.filter((feat) => {
      const matchesCategory = selectedCategory === 'all' || feat.category === selectedCategory;
      const q = featureSearch.toLowerCase();
      const matchesSearch =
        feat.name.toLowerCase().includes(q) ||
        (feat.nameBn || '').toLowerCase().includes(q) ||
        feat.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, featureSearch]);

  // Toggle single feature
  const handleToggle = (key: keyof DashboardPreferences) => {
    setFeaturesState((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  // Bulk Enable All
  const handleEnableAll = () => {
    const updated: Partial<DashboardPreferences> = {};
    FEATURE_DEFINITIONS.forEach((f) => {
      (updated as any)[f.key] = true;
    });
    setFeaturesState((prev) => ({ ...prev, ...updated }));
  };

  // Bulk Disable All (keeps dashboard on for safety)
  const handleDisableAll = () => {
    const updated: Partial<DashboardPreferences> = {};
    FEATURE_DEFINITIONS.forEach((f) => {
      (updated as any)[f.key] = false;
    });
    // Keep dashboard enabled as absolute minimum
    updated.dashboard = true;
    setFeaturesState((prev) => ({ ...prev, ...updated }));
  };

  // Reset to default
  const handleResetToDefault = () => {
    setFeaturesState(defaultDashboardPreferences);
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setSaveNotification(null);

    try {
      await updateUserData(selectedUser.id, {
        dashboardPreferences: featuresState,
      });

      logActivity(
        'Updated Account Feature Control',
        `অ্যাকাউন্ট ফিচার কন্ট্রোল আপডেট করা হয়েছে (${selectedUser.brandName})`,
        selectedUser.id
      );

      setSaveNotification({
        type: 'success',
        message: `Feature permissions successfully saved for "${selectedUser.brandName || selectedUser.ownerName}". Changes take effect immediately!`,
      });

      setTimeout(() => {
        setSaveNotification(null);
      }, 4000);
    } catch (err: any) {
      setSaveNotification({
        type: 'error',
        message: err.message || 'Failed to save feature permissions. Please retry.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Enabled counts
  const enabledCount = useMemo(() => {
    return Object.values(featuresState).filter((v) => v !== false).length;
  }, [featuresState]);

  const totalCount = FEATURE_DEFINITIONS.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                Feature Access Management
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Admin Control Level
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Account Feature Control</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Granularly grant or restrict access to any module for individual registered merchant/owner accounts. Disabled features will be hidden from their navigation menus and completely blocked.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || !selectedUser}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Permissions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification message */}
        {saveNotification && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all animate-fadeIn ${
              saveNotification.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {saveNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{saveNotification.message}</span>
          </div>
        )}
      </div>

      {/* Main Grid: User Selector Column + Features Control Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Selector (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Select Business Account</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/60 text-purple-300 font-mono text-[10px] font-bold">
                {allUsers.length} Users
              </span>
            </div>

            {/* Search Account input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by store, owner, email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="text-slate-400 hover:text-white text-xs absolute right-3 top-1/2 -translate-y-1/2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Account List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No accounts found matching "{userSearch}"
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        if (onSelectUserFromParent) {
                          onSelectUserFromParent(u);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500/60 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-slate-800 text-purple-300 border-slate-700'
                          }`}
                        >
                          {u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-white truncate">
                            {u.brandName || u.ownerName || 'Unnamed Store'}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <span>{u.ownerName}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-purple-400 font-semibold">{u.subscriptionPlan}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Features Management for Selected Account (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-md">
              {/* Selected Account Profile Card */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/80 text-purple-300 font-black text-base flex items-center justify-center shrink-0 shadow-inner">
                    {selectedUser.ownerName ? selectedUser.ownerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-base text-white">
                        {selectedUser.brandName || selectedUser.ownerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">
                        {selectedUser.subscriptionPlan} Plan
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          selectedUser.status === 'blocked'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : selectedUser.status === 'suspended'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {selectedUser.status || 'active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Owner: <strong className="text-slate-200">{selectedUser.ownerName}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Email: <span className="font-mono text-slate-300">{selectedUser.email}</span></span>
                      {selectedUser.mobile && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span>Phone: <span className="font-mono text-slate-300">{selectedUser.mobile}</span></span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Feature stats counter badge */}
                <div className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-right shrink-0">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Active Features
                  </div>
                  <div className="text-base font-black text-purple-400 flex items-center justify-end gap-1">
                    <span>{enabledCount}</span>
                    <span className="text-xs text-slate-500 font-normal">/ {totalCount}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar: Filter by Category + Search + Quick Bulk Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
                    {[
                      { id: 'all', label: 'All Features' },
                      { id: 'core', label: 'Core & AI' },
                      { id: 'sales', label: 'POS & Sales' },
                      { id: 'inventory', label: 'Inventory' },
                      { id: 'finance', label: 'Finance' },
                      { id: 'management', label: 'Team & Payroll' },
                      { id: 'system', label: 'Store & System' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Bulk Quick Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleEnableAll}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Enable all modules for this merchant"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Enable All</span>
                    </button>

                    <button
                      onClick={handleDisableAll}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Disable non-essential modules"
                    >
                      <span>Disable All</span>
                    </button>

                    <button
                      onClick={handleResetToDefault}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Reset to default system permissions"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Feature Keyword Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Filter features list by name, keyword..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Features List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {filteredFeatures.map((feat) => {
                  const Icon = feat.icon;
                  const isEnabled = (featuresState as any)[feat.key] !== false;

                  return (
                    <div
                      key={feat.key}
                      onClick={() => handleToggle(feat.key)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
                        isEnabled
                          ? 'bg-slate-950/90 border-purple-500/40 hover:border-purple-500/70 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isEnabled
                              ? 'bg-purple-950 border-purple-700/60 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`font-extrabold text-xs ${isEnabled ? 'text-white' : 'text-slate-400'}`}>
                              {feat.name}
                            </h4>
                            {feat.nameBn && (
                              <span className="text-[10px] text-slate-400">({feat.nameBn})</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {feat.description}
                          </p>
                        </div>
                      </div>

                      {/* Toggle switch switch button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(feat.key);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 border ${
                          isEnabled
                            ? 'bg-purple-600 border-purple-500'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform transform shadow-md ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>
                    Rule: <strong className="text-slate-200">Account Feature Enabled</strong> ∧ <strong className="text-slate-200">Plan Allows</strong> ∧ <strong className="text-slate-200">Role Permission</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Permissions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Building className="w-12 h-12 mx-auto opacity-30 text-purple-400" />
              <p className="font-bold text-slate-300">No Business Account Selected</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Please select a registered merchant from the left list to view and configure their account feature permissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AccountFeatureControl;

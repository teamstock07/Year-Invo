import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan, UserProfile, UserRole } from '../../types';
import {
  ShieldCheck,
  Users,
  Search,
  UserX,
  UserCheck,
  Trash2,
  Key,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Building2,
  Mail,
  Phone,
  BarChart2,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
  Crown,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit3,
  Filter,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Unlock,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Zap,
  Ban,
  X,
  Sparkles,
  Check,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const OwnerDashboard: React.FC = () => {
  const {
    user,
    allUsers,
    updateUserRole,
    sendFirebasePasswordReset,
    suspendUser,
    activateUser,
    blockUser,
    unblockUser,
    deleteUser,
    resetUserPassword,
    updateUserPlan,
    updateUserData,
    refreshUsers,
    subscriptionRequests,
    approveSubscriptionRequest,
    rejectSubscriptionRequest,
    settings,
    updateSettings,
    sales,
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'announcements' | 'settings'>('overview');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'store_asc'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync / Refreshing State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected Users / Action Modals
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<{
    ownerName: string;
    brandName: string;
    email: string;
    mobile: string;
    businessType: string;
    role: UserRole;
    subscriptionPlan: SubscriptionPlan;
    status: 'active' | 'suspended' | 'blocked' | 'deleted';
    notes: string;
  }>({
    ownerName: '',
    brandName: '',
    email: '',
    mobile: '',
    businessType: 'General Retail',
    role: 'Manager',
    subscriptionPlan: 'Free',
    status: 'active',
    notes: '',
  });

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('123456');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Confirm Action Modal (Suspend, Block, Delete)
  const [confirmActionModal, setConfirmActionModal] = useState<{
    user: UserProfile;
    action: 'suspend' | 'activate' | 'block' | 'unblock' | 'delete';
  } | null>(null);

  // Reject Request Modal State
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Platform Branding State
  const [siteBrandName, setSiteBrandName] = useState(settings.siteBrandName || 'YearInvo');
  const [siteSubBrand, setSiteSubBrand] = useState(settings.siteSubBrandName || 'by Year Media');
  const [siteLogoUrl, setSiteLogoUrl] = useState(settings.siteLogoUrl || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Strict Security Check: Only Owner / Admin can view
  if (user?.role !== 'Owner') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <Ban className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-white">Access Restricted</h3>
            <p className="text-sm text-slate-400">
              The Owner Command Center is strictly restricted to Platform Owner accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle Manual Data Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Helper date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((u) => {
        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          u.ownerName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.brandName.toLowerCase().includes(q) ||
          u.mobile.includes(q) ||
          u.id.toLowerCase().includes(q);

        // Role filter
        const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();

        // Plan filter
        const matchesPlan = planFilter === 'all' || u.subscriptionPlan.toLowerCase() === planFilter.toLowerCase();

        // Status filter
        const userStatus = u.status || 'active';
        const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

        // Date filter
        let matchesDate = true;
        if (dateFilter === 'today') {
          matchesDate = u.createdAt === todayStr;
        } else if (dateFilter === 'week') {
          const uDate = new Date(u.createdAt);
          matchesDate = uDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const uDate = new Date(u.createdAt);
          matchesDate = uDate >= monthAgo;
        }

        return matchesSearch && matchesRole && matchesPlan && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'name_asc') return a.ownerName.localeCompare(b.ownerName);
        if (sortBy === 'store_asc') return a.brandName.localeCompare(b.brandName);
        return 0;
      });
  }, [allUsers, searchQuery, roleFilter, planFilter, statusFilter, dateFilter, sortBy, todayStr, weekAgo, monthAgo]);

  // Pagination logic
  const totalUsersCount = filteredUsers.length;
  const totalPages = Math.ceil(totalUsersCount / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Calculated Stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => !u.status || u.status === 'active').length;
  const blockedUsers = allUsers.filter((u) => u.status === 'blocked' || u.status === 'suspended').length;
  const todayRegistrations = allUsers.filter((u) => u.createdAt === todayStr).length;
  const premiumUsers = allUsers.filter(
    (u) => u.subscriptionPlan === 'Pro' || u.subscriptionPlan === 'Business' || u.subscriptionPlan === 'Lifetime'
  ).length;
  const freeUsers = allUsers.filter((u) => u.subscriptionPlan === 'Free' || u.subscriptionPlan === 'Starter').length;
  const pendingRequests = subscriptionRequests.filter((r) => r.status === 'pending');

  // Platform Sales & Revenue Estimates
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  // Chart Data: Registrations trend by month/date
  const registrationChartData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    allUsers.forEach((u) => {
      const d = u.createdAt || 'Recent';
      dateMap[d] = (dateMap[d] || 0) + 1;
    });
    const keys = Object.keys(dateMap).sort().slice(-7);
    if (keys.length === 0) return [{ date: 'Today', users: 1 }];
    return keys.map((k) => ({ date: k, users: dateMap[k] }));
  }, [allUsers]);

  // Chart Data: Subscription Plan Breakdown
  const planDistributionData = useMemo(() => {
    const planCounts: Record<string, number> = { Free: 0, Starter: 0, Pro: 0, Business: 0, Lifetime: 0 };
    allUsers.forEach((u) => {
      const p = u.subscriptionPlan || 'Free';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });
    return [
      { name: 'Free', value: planCounts.Free, color: '#64748B' },
      { name: 'Starter', value: planCounts.Starter, color: '#3B82F6' },
      { name: 'Pro', value: planCounts.Pro, color: '#8B5CF6' },
      { name: 'Business', value: planCounts.Business, color: '#EC4899' },
      { name: 'Lifetime', value: planCounts.Lifetime, color: '#F59E0B' },
    ].filter((item) => item.value > 0);
  }, [allUsers]);

  // Edit User Modal Open Handler
  const handleOpenEditModal = (u: UserProfile) => {
    setEditUserModal(u);
    setEditForm({
      ownerName: u.ownerName || '',
      brandName: u.brandName || '',
      email: u.email || '',
      mobile: u.mobile || '',
      businessType: u.businessType || 'General Retail',
      role: u.role || 'Manager',
      subscriptionPlan: u.subscriptionPlan || 'Free',
      status: u.status || 'active',
      notes: u.notes || '',
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    updateUserData(editUserModal.id, {
      ownerName: editForm.ownerName,
      brandName: editForm.brandName,
      email: editForm.email,
      mobile: editForm.mobile,
      businessType: editForm.businessType,
      role: editForm.role,
      subscriptionPlan: editForm.subscriptionPlan,
      status: editForm.status,
      notes: editForm.notes,
    });
    setEditUserModal(null);
  };

  // Password Reset Handlers
  const handleDirectPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    resetUserPassword(resetModalUser.id, newPasswordInput);
    setResetSuccessMsg(`Password for ${resetModalUser.ownerName} has been reset to "${newPasswordInput}".`);
    setTimeout(() => {
      setResetSuccessMsg(null);
      setResetModalUser(null);
    }, 2000);
  };

  const handleSendEmailResetLink = async () => {
    if (!resetModalUser) return;
    const res = await sendFirebasePasswordReset(resetModalUser.email);
    setResetSuccessMsg(res.message || 'Password reset email sent successfully.');
  };

  // Confirm Action Handler
  const handleExecuteConfirmAction = () => {
    if (!confirmActionModal) return;
    const { user: targetUser, action } = confirmActionModal;
    if (action === 'suspend') suspendUser(targetUser.id);
    else if (action === 'activate') activateUser(targetUser.id);
    else if (action === 'block') blockUser(targetUser.id);
    else if (action === 'unblock') unblockUser(targetUser.id);
    else if (action === 'delete') deleteUser(targetUser.id);

    setConfirmActionModal(null);
  };

  // Branding Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteBrandName,
      siteSubBrandName: siteSubBrand,
      siteLogoUrl,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Export User CSV
  const handleExportCSV = () => {
    const headers = ['User ID,Owner Name,Store Name,Email,Mobile,Role,Plan,Status,Created At'];
    const rows = filteredUsers.map(
      (u) =>
        `"${u.id}","${u.ownerName}","${u.brandName}","${u.email}","${u.mobile}","${u.role}","${u.subscriptionPlan}","${
          u.status || 'active'
        }","${u.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YearInvo_Users_Export_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Platform Owner Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Platform Owner Panel
              </span>
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Master Administrative Rights
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Realtime Firestore Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Owner Command Center</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete platform control: Monitor registered merchants, manage permissions, suspend/block accounts, approve upgrade subscriptions, and track system metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Users'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Users (CSV)</span>
            </button>

            {pendingRequests.length > 0 && (
              <button
                onClick={() => setActiveTab('subscriptions')}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer animate-pulse"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingRequests.length} Pending Approval</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar shadow-inner">
        {[
          { id: 'overview', label: 'Dashboard & Analytics', icon: BarChart3 },
          { id: 'users', label: `Users & Stores (${totalUsers})`, icon: Users, badge: todayRegistrations > 0 ? `+${todayRegistrations} today` : undefined },
          { id: 'subscriptions', label: `Subscriptions (${pendingRequests.length})`, icon: Award, badge: pendingRequests.length > 0 ? `${pendingRequests.length}` : undefined },
          { id: 'announcements', label: 'Broadcast Message', icon: Bell },
          { id: 'settings', label: 'Platform Branding', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                    isActive ? 'bg-white text-purple-700' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Users</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tight">{totalUsers}</p>
                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">{activeUsers} Active</span>
                  <span>•</span>
                  <span>{blockedUsers} Resticted</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Today Registrations</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-400 tracking-tight">+{todayRegistrations}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">New store signups today</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Premium Merchants</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-400 tracking-tight">{premiumUsers}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Pro, Business &amp; Lifetime</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Blocked / Suspended</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <UserX className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-rose-400 tracking-tight">{blockedUsers}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Access restricted users</p>
              </div>
            </div>
          </div>

          {/* Revenue & Plan Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Total Platform Volume</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">৳ {totalSalesRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Cumulative store transactions processed</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Free Tier Accounts</span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-200">{freeUsers}</p>
              <p className="text-xs text-slate-400">Free starter accounts</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Pending Subscriptions</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400">{pendingRequests.length}</p>
              <p className="text-xs text-slate-400">Awaiting owner verification</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Registration Trend Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>Registration Growth Trend</span>
                  </h3>
                  <p className="text-xs text-slate-400">New merchant signups over recent period</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                  Live Firestore
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationChartData}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#userGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription Plan Distribution Pie */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Subscription Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400">Active tier distribution</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {planDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-semibold">{item.name}:</span>
                    <span className="font-black text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Recently Registered Merchants</span>
              </h3>
              <button
                onClick={() => setActiveTab('users')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Users</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
              {allUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="p-4 bg-slate-950/40 hover:bg-slate-800/40 transition-colors flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-300 font-black text-sm flex items-center justify-center shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.ownerName} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{u.brandName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {u.role}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">{u.ownerName} • {u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
                      {u.subscriptionPlan} Plan
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.status === 'blocked'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : u.status === 'suspended'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {u.status || 'ACTIVE'}
                    </span>
                    <button
                      onClick={() => setDetailUser(u)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters & Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
            {/* Search Input & View Toggle */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search user by name, email, store name, mobile..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Filters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
              {/* Role Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Roles</option>
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              {/* Plan Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Plan</label>
                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Business">Business</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Registration Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2 px-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="store_asc">Store (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Filter Status Badge / Summary */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
              <p>
                Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
                <strong className="text-white">{allUsers.length}</strong> merchants
              </p>
              {(roleFilter !== 'all' || planFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setRoleFilter('all');
                    setPlanFilter('all');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">User / Merchant</th>
                      <th className="p-3.5">Store / Business</th>
                      <th className="p-3.5">Contact Info</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Subscription</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registered</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold text-slate-400">No users matched your criteria</p>
                          <p className="text-xs">Try adjusting your search query or filters above.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => {
                        const isUserBlocked = u.status === 'blocked';
                        const isUserSuspended = u.status === 'suspended';
                        const isUserDeleted = u.status === 'deleted';

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* User & Avatar */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                                  {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt={u.ownerName} className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-white truncate max-w-[150px]">{u.ownerName}</h4>
                                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Store */}
                            <td className="p-3.5">
                              <div>
                                <p className="font-bold text-slate-200">{u.brandName}</p>
                                <p className="text-[10px] text-slate-400">{u.businessType || 'Retail'}</p>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="p-3.5 font-mono text-[11px] text-slate-300">
                              {u.mobile || <span className="text-slate-500">N/A</span>}
                            </td>

                            {/* Role */}
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                  u.role === 'Owner'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : u.role === 'Manager'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Subscription */}
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-[11px]">
                                {u.subscriptionPlan}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                  isUserBlocked
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : isUserSuspended
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : isUserDeleted
                                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isUserBlocked
                                      ? 'bg-rose-400'
                                      : isUserSuspended
                                      ? 'bg-amber-400'
                                      : isUserDeleted
                                      ? 'bg-slate-500'
                                      : 'bg-emerald-400'
                                  }`}
                                />
                                {u.status || 'ACTIVE'}
                              </span>
                            </td>

                            {/* Registered Date */}
                            <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                              {u.createdAt}
                            </td>

                            {/* Actions Button Group */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setDetailUser(u)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  title="View Full Profile Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleOpenEditModal(u)}
                                  className="p-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-purple-800/60"
                                  title="Edit User Profile"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setResetModalUser(u)}
                                  className="p-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-800/60"
                                  title="Reset Password"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>

                                {u.role !== 'Owner' && (
                                  <>
                                    {isUserSuspended ? (
                                      <button
                                        onClick={() => setConfirmActionModal({ user: u, action: 'activate' })}
                                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-emerald-800/60"
                                        title="Unsuspend / Activate Account"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmActionModal({ user: u, action: 'suspend' })}
                                        className="p-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-amber-800/60"
                                        title="Suspend Account"
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {isUserBlocked ? (
                                      <button
                                        onClick={() => setConfirmActionModal({ user: u, action: 'unblock' })}
                                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-emerald-800/60"
                                        title="Unblock Access"
                                      >
                                        <Unlock className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmActionModal({ user: u, action: 'block' })}
                                        className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-800/60"
                                        title="Block Access completely"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => setConfirmActionModal({ user: u, action: 'delete' })}
                                      className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-800/40"
                                      title="Delete Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID CARD VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.length === 0 ? (
                <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-slate-400">No users matched your criteria</p>
                </div>
              ) : (
                paginatedUsers.map((u) => {
                  const isUserBlocked = u.status === 'blocked';
                  const isUserSuspended = u.status === 'suspended';
                  const isUserDeleted = u.status === 'deleted';

                  return (
                    <div
                      key={u.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-300 font-black text-base flex items-center justify-center shrink-0">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.ownerName} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'
                              )}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{u.ownerName}</h4>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isUserBlocked
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : isUserSuspended
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : isUserDeleted
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {u.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Store Name:</span>
                            <span className="font-bold text-slate-200">{u.brandName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mobile:</span>
                            <span className="font-mono text-slate-300">{u.mobile || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Role &amp; Plan:</span>
                            <span className="font-bold text-purple-300">
                              {u.role} • {u.subscriptionPlan}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Registered:</span>
                            <span className="text-slate-400">{u.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setDetailUser(u)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-purple-800/60"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setResetModalUser(u)}
                          className="p-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-800/60"
                          title="Reset Pass"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {u.role !== 'Owner' && (
                          <button
                            onClick={() =>
                              setConfirmActionModal({
                                user: u,
                                action: isUserSuspended ? 'activate' : 'suspend',
                              })
                            }
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              isUserSuspended
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                                : 'bg-amber-950 text-amber-300 border-amber-800/60'
                            }`}
                          >
                            {isUserSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 py-1 px-2 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">
                  Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION APPROVALS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Pending Merchant Upgrade Requests</span>
                </h3>
                <p className="text-xs text-slate-400">Review subscription plan upgrade requests from merchants</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-black">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-slate-200">No pending upgrade requests</p>
                <p className="text-xs text-slate-500">All merchant subscription requests have been processed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-5 bg-slate-950/50 hover:bg-slate-800/40 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{req.brandName}</h4>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            {req.requestedPlan} Plan
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Applicant: {req.userName} ({req.userEmail})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => approveSubscriptionRequest(req.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Upgrade</span>
                        </button>

                        <button
                          onClick={() => setRejectModalReqId(req.id)}
                          className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Request</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Requested Plan</span>
                        <span className="font-bold text-amber-400">{req.requestedPlan}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Billing Cycle</span>
                        <span className="font-bold text-slate-200 capitalize">{req.billingCycle}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Payment Method</span>
                        <span className="font-bold text-slate-200">{req.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Trx ID / Amount</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {req.transactionId || 'Manual'} • ৳{req.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST ANNOUNCEMENT */}
      {activeTab === 'announcements' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Broadcast Announcement</h3>
                <p className="text-xs text-slate-400">Publish a system banner notice visible to all store managers</p>
              </div>
            </div>

            {announcementSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Announcement published successfully!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!announcementTitle.trim()) return;
                setAnnouncementSuccess(true);
                setAnnouncementTitle('');
                setAnnouncementMsg('');
                setTimeout(() => setAnnouncementSuccess(false), 3000);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Maintenance on Sunday 2:00 AM"
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Provide full description of update or announcement..."
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Broadcast Notice</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM BRANDING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Platform System Branding</h3>
                <p className="text-xs text-slate-400">Configure global site branding for YearInvo platform</p>
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Branding settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Primary Site Brand Name</label>
                <input
                  type="text"
                  required
                  value={siteBrandName}
                  onChange={(e) => setSiteBrandName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sub-Brand Tagline</label>
                <input
                  type="text"
                  value={siteSubBrand}
                  onChange={(e) => setSiteSubBrand(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Platform Logo Image URL</label>
                <input
                  type="text"
                  value={siteLogoUrl}
                  onChange={(e) => setSiteLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Save Branding Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW FULL USER DETAILS */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-300 font-black text-lg flex items-center justify-center">
                  {detailUser.avatarUrl ? (
                    <img src={detailUser.avatarUrl} alt={detailUser.ownerName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    detailUser.ownerName ? detailUser.ownerName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">{detailUser.ownerName}</h3>
                  <p className="text-xs text-purple-300 font-medium">{detailUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-purple-400 uppercase text-[10px]">Merchant Profile</h4>
                <div className="space-y-1 text-slate-300">
                  <p><strong>Store Name:</strong> {detailUser.brandName}</p>
                  <p><strong>Business Type:</strong> {detailUser.businessType}</p>
                  <p><strong>Mobile:</strong> {detailUser.mobile || 'N/A'}</p>
                  <p><strong>Country:</strong> {detailUser.country || 'Bangladesh'}</p>
                  <p><strong>Address:</strong> {detailUser.storeAddress || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-amber-400 uppercase text-[10px]">Account &amp; Security</h4>
                <div className="space-y-1 text-slate-300">
                  <p><strong>User ID:</strong> <span className="font-mono text-[10px] text-purple-300">{detailUser.id}</span></p>
                  <p><strong>Role:</strong> {detailUser.role}</p>
                  <p><strong>Plan:</strong> {detailUser.subscriptionPlan}</p>
                  <p><strong>Status:</strong> <span className="uppercase font-bold">{detailUser.status || 'active'}</span></p>
                  <p><strong>Registered Date:</strong> {detailUser.createdAt}</p>
                  {detailUser.lastLogin && <p><strong>Last Login:</strong> {detailUser.lastLogin}</p>}
                </div>
              </div>
            </div>

            {detailUser.notes && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-extrabold text-slate-400 uppercase text-[10px] mb-1">Administrative Notes</h4>
                <p className="text-slate-300">{detailUser.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const u = detailUser;
                  setDetailUser(null);
                  handleOpenEditModal(u);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Edit User Data
              </button>
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER DATA */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <span>Edit User Profile Details</span>
              </h3>
              <button
                onClick={() => setEditUserModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Store / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.brandName}
                    onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">User Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Owner">Platform Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={editForm.subscriptionPlan}
                    onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value as SubscriptionPlan })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Free">Free</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Business">Business</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Optional notes regarding this user account..."
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Resetting password for: <strong className="text-white">{resetModalUser.ownerName}</strong> ({resetModalUser.email})
            </p>

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleDirectPasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Set New Password Manually</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Set Password Directly
                </button>

                <button
                  type="button"
                  onClick={handleSendEmailResetLink}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Send Firebase Password Reset Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM ACTION MODAL */}
      {confirmActionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
                confirmActionModal.action === 'suspend' || confirmActionModal.action === 'block' || confirmActionModal.action === 'delete'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-white capitalize">
                Confirm {confirmActionModal.action} Account
              </h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to {confirmActionModal.action}{' '}
                <strong className="text-white">{confirmActionModal.user.ownerName}</strong> ({confirmActionModal.user.email})?
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmActionModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteConfirmAction}
                className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer capitalize ${
                  confirmActionModal.action === 'suspend' || confirmActionModal.action === 'block' || confirmActionModal.action === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Yes, {confirmActionModal.action} User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REJECT SUBSCRIPTION REQUEST */}
      {rejectModalReqId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white">Reject Subscription Upgrade</h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason / Rejection Note</label>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Invalid payment transaction ID..."
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalReqId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectSubscriptionRequest(rejectModalReqId, rejectNote);
                  setRejectModalReqId(null);
                  setRejectNote('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

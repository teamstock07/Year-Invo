import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan, UserProfile, UserRole, SubscriptionRequest } from '../../types';
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
  CheckCircle,
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
  CreditCard,
  AlertTriangle,
  Save,
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
  RotateCcw,
  FileText,
  History,
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

import {
  BkashLogo,
  NagadLogo,
  RocketLogo,
  BankTransferLogo,
} from '../common/PaymentLogos';

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
    cancelSubscriptionRequest,
    cancelUserSubscription,
    settings,
    updateSettings,
    sales,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
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

  // Settings Sub-tab State
  const [settingsSubTab, setSettingsSubTab] = useState<'payment' | 'branding'>('payment');

  // Owner Payment Settings State
  const initialBd = settings.paymentSettings?.bangladesh || {
    enabled: settings.paymentSettings?.localPaymentEnabled ?? true,
    methods: {
      bkash: {
        enabled: true,
        number: settings.paymentSettings?.paymentNumber || '01700000000',
      },
      nagad: {
        enabled: true,
        number: settings.paymentSettings?.paymentNumber || '01700000000',
      },
      rocket: {
        enabled: false,
        number: settings.paymentSettings?.paymentNumber || '01700000000',
      },
    },
    receiverName: settings.paymentSettings?.receiverName || 'YearInvo Store',
    storeName: settings.paymentSettings?.storeName || 'YearInvo Store',
    transactionIdInstruction: settings.paymentSettings?.transactionIdInstruction || 'Copy your transaction ID and enter it below.',
  };

  const [localPaymentEnabled, setLocalPaymentEnabled] = useState<boolean>(
    initialBd.enabled ?? true
  );

  const [bkashEnabled, setBkashEnabled] = useState<boolean>(
    initialBd.methods?.bkash?.enabled ?? true
  );
  const [bkashNumber, setBkashNumber] = useState<string>(
    initialBd.methods?.bkash?.number || settings.paymentSettings?.paymentNumber || '01700000000'
  );

  const [nagadEnabled, setNagadEnabled] = useState<boolean>(
    initialBd.methods?.nagad?.enabled ?? true
  );
  const [nagadNumber, setNagadNumber] = useState<string>(
    initialBd.methods?.nagad?.number || settings.paymentSettings?.paymentNumber || '01700000000'
  );

  const [rocketEnabled, setRocketEnabled] = useState<boolean>(
    initialBd.methods?.rocket?.enabled ?? true
  );
  const [rocketNumber, setRocketNumber] = useState<string>(
    initialBd.methods?.rocket?.number || settings.paymentSettings?.paymentNumber || '01900000000-1'
  );

  const [bankEnabled, setBankEnabled] = useState<boolean>(
    (initialBd.methods as any)?.bank?.enabled ?? true
  );
  const [bankAccountNumber, setBankAccountNumber] = useState<string>(
    (initialBd.methods as any)?.bank?.accountNumber || '1501203948501001'
  );

  const [receiverName, setReceiverName] = useState<string>(
    initialBd.receiverName || settings.paymentSettings?.receiverName || 'YearInvo Store'
  );
  const [ownerStoreName, setOwnerStoreName] = useState<string>(
    initialBd.storeName || settings.paymentSettings?.storeName || 'YearInvo Store'
  );
  const [transactionIdInstruction, setTransactionIdInstruction] = useState<string>(
    initialBd.transactionIdInstruction || settings.paymentSettings?.transactionIdInstruction || 'Copy your transaction ID and enter it below.'
  );

  const [paymentSettingsSaved, setPaymentSettingsSaved] = useState(false);
  const [paymentValidationError, setPaymentValidationError] = useState<string | null>(null);

  // Sync state when settings context changes
  useEffect(() => {
    if (settings.paymentSettings) {
      const bd = settings.paymentSettings.bangladesh;
      if (bd) {
        setLocalPaymentEnabled(bd.enabled ?? true);
        setBkashEnabled(bd.methods?.bkash?.enabled ?? true);
        setBkashNumber(bd.methods?.bkash?.number || '');
        setNagadEnabled(bd.methods?.nagad?.enabled ?? true);
        setNagadNumber(bd.methods?.nagad?.number || '');
        setRocketEnabled(bd.methods?.rocket?.enabled ?? true);
        setRocketNumber(bd.methods?.rocket?.number || '');
        setBankEnabled((bd.methods as any)?.bank?.enabled ?? true);
        setBankAccountNumber((bd.methods as any)?.bank?.accountNumber || '1501203948501001');
        setReceiverName(bd.receiverName || '');
        setOwnerStoreName(bd.storeName || '');
        setTransactionIdInstruction(bd.transactionIdInstruction || '');
      } else if (settings.paymentSettings.paymentNumber) {
        setLocalPaymentEnabled(settings.paymentSettings.localPaymentEnabled ?? true);
        setBkashNumber(settings.paymentSettings.paymentNumber);
        setNagadNumber(settings.paymentSettings.paymentNumber);
        setRocketNumber(settings.paymentSettings.paymentNumber);
        setReceiverName(settings.paymentSettings.receiverName || '');
        setOwnerStoreName(settings.paymentSettings.storeName || '');
        setTransactionIdInstruction(settings.paymentSettings.transactionIdInstruction || '');
      }
    }
  }, [settings.paymentSettings]);

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
  // Subscription Management States & Modals
  const [subFilterTab, setSubFilterTab] = useState<'all' | 'pending' | 'approved' | 'cancelled' | 'rejected' | 'expired'>('all');
  const [cancelConfirmModal, setCancelConfirmModal] = useState<{
    req?: SubscriptionRequest;
    userProfile?: UserProfile;
  } | null>(null);
  const [cancelReasonNote, setCancelReasonNote] = useState('');
  const [approveConfirmModal, setApproveConfirmModal] = useState<SubscriptionRequest | null>(null);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<SubscriptionRequest | null>(null);

  // Subscription Request Categories
  const pendingRequests = useMemo(() => subscriptionRequests.filter((r) => r.status === 'pending'), [subscriptionRequests]);
  const approvedRequests = useMemo(() => subscriptionRequests.filter((r) => r.status === 'approved'), [subscriptionRequests]);
  const cancelledRequests = useMemo(() => subscriptionRequests.filter((r) => r.status === 'cancelled'), [subscriptionRequests]);
  const rejectedRequests = useMemo(() => subscriptionRequests.filter((r) => r.status === 'rejected'), [subscriptionRequests]);
  const expiredRequests = useMemo(() => subscriptionRequests.filter((r) => r.status === 'expired'), [subscriptionRequests]);

  const filteredSubscriptionRequests = useMemo(() => {
    let list = subscriptionRequests;
    if (subFilterTab === 'pending') list = pendingRequests;
    else if (subFilterTab === 'approved') list = approvedRequests;
    else if (subFilterTab === 'cancelled') list = cancelledRequests;
    else if (subFilterTab === 'rejected') list = rejectedRequests;
    else if (subFilterTab === 'expired') list = expiredRequests;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.brandName && r.brandName.toLowerCase().includes(q)) ||
          (r.userName && r.userName.toLowerCase().includes(q)) ||
          (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
          (r.requestedPlan && r.requestedPlan.toLowerCase().includes(q)) ||
          (r.transactionId && r.transactionId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [
    subscriptionRequests,
    subFilterTab,
    pendingRequests,
    approvedRequests,
    cancelledRequests,
    rejectedRequests,
    expiredRequests,
    searchQuery,
  ]);

  // Handle Approve Request with Duplicate Active Check
  const handleInitiateApprove = (req: SubscriptionRequest) => {
    const targetUser = allUsers.find((u) => u.id === req.userId || u.email === req.userEmail);
    const hasActivePaidPlan =
      targetUser &&
      (targetUser.subscriptionPlan === 'Pro' ||
        targetUser.subscriptionPlan === 'Business' ||
        targetUser.subscriptionPlan === 'Tier2' ||
        targetUser.subscriptionPlan === 'Lifetime' ||
        targetUser.subscriptionPlan === 'Starter') &&
      targetUser.subscriptionPlan !== req.requestedPlan;

    if (hasActivePaidPlan) {
      setApproveConfirmModal(req);
    } else {
      approveSubscriptionRequest(req.id);
    }
  };

  // Handle Execute Subscription Cancellation
  const handleConfirmCancel = async () => {
    if (cancelConfirmModal?.req) {
      await cancelSubscriptionRequest(cancelConfirmModal.req.id, cancelReasonNote);
    } else if (cancelConfirmModal?.userProfile) {
      await cancelUserSubscription(cancelConfirmModal.userProfile.id, cancelReasonNote);
    }
    setCancelConfirmModal(null);
    setCancelReasonNote('');
  };

  // Handle Confirm Duplicate Plan Replacement Approval
  const handleConfirmDuplicateApprove = async () => {
    if (approveConfirmModal) {
      await approveSubscriptionRequest(approveConfirmModal.id);
      setApproveConfirmModal(null);
    }
  };

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

  // Payment Settings Handler with Validation
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentValidationError(null);

    if (localPaymentEnabled) {
      if (!bkashEnabled && !nagadEnabled && !rocketEnabled && !bankEnabled) {
        setPaymentValidationError('At least ONE Bangladesh payment method must be selected (bKash, Nagad, Rocket, or Bank Transfer).');
        return;
      }
      if (bkashEnabled && !bkashNumber.trim()) {
        setPaymentValidationError('bKash number cannot be empty when bKash is selected.');
        return;
      }
      if (nagadEnabled && !nagadNumber.trim()) {
        setPaymentValidationError('Nagad number cannot be empty when Nagad is selected.');
        return;
      }
      if (rocketEnabled && !rocketNumber.trim()) {
        setPaymentValidationError('Rocket number cannot be empty when Rocket is selected.');
        return;
      }
      if (bankEnabled && !bankAccountNumber.trim()) {
        setPaymentValidationError('Bank Account Number cannot be empty when Bank Wire is selected.');
        return;
      }
      if (!receiverName.trim()) {
        setPaymentValidationError('Receiver Name cannot be empty.');
        return;
      }
      if (!ownerStoreName.trim()) {
        setPaymentValidationError('Store Name cannot be empty.');
        return;
      }
      if (!transactionIdInstruction.trim()) {
        setPaymentValidationError('Transaction ID Instruction cannot be empty.');
        return;
      }
    }

    const activeList: string[] = [];
    if (bkashEnabled) activeList.push('bKash');
    if (nagadEnabled) activeList.push('Nagad');
    if (rocketEnabled) activeList.push('Rocket DBBL');
    if (bankEnabled) activeList.push('Bank Wire');

    const primaryNumber = (bkashEnabled && bkashNumber.trim()) ||
                          (nagadEnabled && nagadNumber.trim()) ||
                          (rocketEnabled && rocketNumber.trim()) ||
                          (bankEnabled && bankAccountNumber.trim()) || '';

    updateSettings({
      paymentSettings: {
        localPaymentEnabled,
        paymentMethod: activeList.join(' + ') || 'bKash',
        paymentNumber: primaryNumber,
        receiverName: receiverName.trim(),
        storeName: ownerStoreName.trim(),
        transactionIdInstruction: transactionIdInstruction.trim(),
        bangladesh: {
          enabled: localPaymentEnabled,
          methods: {
            bkash: {
              enabled: bkashEnabled,
              number: bkashNumber.trim(),
            },
            nagad: {
              enabled: nagadEnabled,
              number: nagadNumber.trim(),
            },
            rocket: {
              enabled: rocketEnabled,
              number: rocketNumber.trim(),
            },
            bank: {
              enabled: bankEnabled,
              accountNumber: bankAccountNumber.trim(),
            },
          },
          receiverName: receiverName.trim(),
          storeName: ownerStoreName.trim(),
          transactionIdInstruction: transactionIdInstruction.trim(),
        },
        qrEnabled: settings.paymentSettings?.qrEnabled ?? true,
        qrProvider: activeList[0] || 'bKash',
        qrImageUrl: settings.paymentSettings?.qrImageUrl || '',
        accountName: receiverName.trim(),
        accountNumber: primaryNumber,
        updatedAt: new Date().toISOString(),
      },
    });

    setPaymentSettingsSaved(true);
    setTimeout(() => setPaymentSettingsSaved(false), 3500);
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
                <span className="text-[11px] font-extrabold uppercase tracking-wider">{t('users') || 'Total Users'}</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tight">{formatNumber(totalUsers)}</p>
                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">{formatNumber(activeUsers)} {t('active') || 'Active'}</span>
                  <span>•</span>
                  <span>{formatNumber(blockedUsers)} {t('blocked') || 'Restricted'}</span>
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
                <p className="text-3xl font-black text-emerald-400 tracking-tight">+{formatNumber(todayRegistrations)}</p>
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
                <p className="text-3xl font-black text-amber-400 tracking-tight">{formatNumber(premiumUsers)}</p>
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
                <p className="text-3xl font-black text-rose-400 tracking-tight">{formatNumber(blockedUsers)}</p>
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
              <p className="text-2xl font-black text-white">{formatCurrency(totalSalesRevenue)}</p>
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

      {/* TAB 3: SUBSCRIPTION APPROVALS & MANAGEMENT */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Summary Stat Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Requests</span>
                <span className="font-extrabold text-lg text-white">{subscriptionRequests.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pending Review</span>
                <span className="font-extrabold text-lg text-amber-400">{pendingRequests.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active / Approved</span>
                <span className="font-extrabold text-lg text-emerald-400">{approvedRequests.length}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Cancelled / Revoked</span>
                <span className="font-extrabold text-lg text-rose-400">{cancelledRequests.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Merchant Subscription Management & History</span>
                </h3>
                <p className="text-xs text-slate-400">Review, approve, cancel, or revoke merchant subscription plans with complete audit history</p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
                <button
                  onClick={() => setSubFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subFilterTab === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({subscriptionRequests.length})
                </button>
                <button
                  onClick={() => setSubFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subFilterTab === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-amber-400'
                  }`}
                >
                  Pending ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setSubFilterTab('approved')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subFilterTab === 'approved' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Active ({approvedRequests.length})
                </button>
                <button
                  onClick={() => setSubFilterTab('cancelled')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subFilterTab === 'cancelled' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  Cancelled ({cancelledRequests.length})
                </button>
                <button
                  onClick={() => setSubFilterTab('rejected')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subFilterTab === 'rejected' ? 'bg-slate-700 text-slate-200 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              </div>
            </div>

            {filteredSubscriptionRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-slate-200">No subscription records found</p>
                <p className="text-xs text-slate-500">There are no records matching the selected status filter ({subFilterTab}).</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                {filteredSubscriptionRequests.map((req) => (
                  <div key={req.id} className="p-5 bg-slate-950/50 hover:bg-slate-800/40 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{req.brandName || 'Store'}</h4>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                            {req.requestedPlan} Plan
                          </span>
                          {req.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                              ● Pending Review
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                              ● Active / Approved
                            </span>
                          )}
                          {req.status === 'cancelled' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                              ✕ Cancelled / Revoked
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px]">
                              ✕ Rejected
                            </span>
                          )}
                          {req.status === 'expired' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50 font-bold text-[10px]">
                              ⏱ Expired
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Applicant: <strong className="text-slate-200">{req.userName}</strong> ({req.userEmail}) • UID: <span className="font-mono text-slate-400">{req.userId || 'N/A'}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          onClick={() => setSelectedDetailRequest(req)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          title="View Details and Audit Log"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleInitiateApprove(req)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve Upgrade</span>
                            </button>

                            <button
                              onClick={() => setRejectModalReqId(req.id)}
                              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <button
                            onClick={() => setCancelConfirmModal({ req })}
                            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel / Revoke Subscription</span>
                          </button>
                        )}

                        {(req.status === 'cancelled' || req.status === 'rejected') && (
                          <button
                            onClick={() => handleInitiateApprove(req)}
                            className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reactivate Plan</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Plan & Cycle</span>
                        <span className="font-bold text-amber-400">{req.requestedPlan} ({req.billingCycle})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Payment Region</span>
                        <span className="font-bold text-slate-200 capitalize">
                          {req.paymentRegion === 'international' ? 'International' : 'Bangladesh'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Payment Provider</span>
                        <span className="font-bold text-slate-200">{req.paymentProvider || req.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Trx ID & Amount</span>
                        <span className="font-mono text-purple-300 font-bold">
                          {req.transactionId || 'Manual'} • {req.currency === 'USD' || req.currency === '$' ? '$' : '৳'}{req.amount} ({req.currency || (req.paymentRegion === 'bangladesh' ? 'BDT' : 'USD')})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          {req.status === 'approved' ? 'Approved Date' : req.status === 'cancelled' ? 'Cancelled Date' : 'Submitted Date'}
                        </span>
                        <span className="font-bold text-slate-300">
                          {req.status === 'approved' && req.reviewedDate
                            ? formatDate(req.reviewedDate)
                            : req.status === 'cancelled' && req.cancelledAt
                            ? formatDate(req.cancelledAt)
                            : formatDate(req.requestDate)}
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

      {/* TAB 5: PLATFORM BRANDING & PAYMENT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setSettingsSubTab('payment')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                settingsSubTab === 'payment'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsSubTab('branding')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                settingsSubTab === 'branding'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Platform Branding</span>
            </button>
          </div>

          {settingsSubTab === 'payment' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Payment Settings</h3>
                    <p className="text-xs text-slate-400">Manage manual payment parameters for Bangladesh local subscriptions</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase">
                  Owner Panel
                </span>
              </div>

              {paymentSettingsSaved && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Payment settings saved successfully</span>
                </div>
              )}

              {paymentValidationError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{paymentValidationError}</span>
                </div>
              )}

              <form onSubmit={handleSavePaymentSettings} className="space-y-5">
                {/* Bangladesh Payment Section */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                        <span>🇧🇩</span> Bangladesh Payment
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Select multiple payment methods and specify independent numbers for each.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={localPaymentEnabled}
                        onChange={(e) => setLocalPaymentEnabled(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  {localPaymentEnabled && (
                    <div className="space-y-4">
                      {/* Payment Methods Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-2">
                          Select Payment Methods
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* bKash */}
                          <div
                            onClick={() => setBkashEnabled(!bkashEnabled)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              bkashEnabled
                                ? 'bg-pink-950/40 border-pink-500/50 text-white shadow-lg shadow-pink-950/30'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={bkashEnabled}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setBkashEnabled(e.target.checked);
                                }}
                                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-extrabold text-xs block text-pink-400">bKash</span>
                                <span className="text-[10px] text-slate-400">Mobile Financial</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              bkashEnabled ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {bkashEnabled ? 'Active' : 'Off'}
                            </span>
                          </div>

                          {/* Nagad */}
                          <div
                            onClick={() => setNagadEnabled(!nagadEnabled)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              nagadEnabled
                                ? 'bg-orange-950/40 border-orange-500/50 text-white shadow-lg shadow-orange-950/30'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={nagadEnabled}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setNagadEnabled(e.target.checked);
                                }}
                                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-extrabold text-xs block text-orange-400">Nagad</span>
                                <span className="text-[10px] text-slate-400">Postal Financial</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              nagadEnabled ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {nagadEnabled ? 'Active' : 'Off'}
                            </span>
                          </div>

                          {/* Rocket */}
                          <div
                            onClick={() => setRocketEnabled(!rocketEnabled)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              rocketEnabled
                                ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-lg shadow-purple-950/30'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={rocketEnabled}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setRocketEnabled(e.target.checked);
                                }}
                                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-extrabold text-xs block text-purple-400">Rocket</span>
                                <span className="text-[10px] text-slate-400">DBBL Mobile</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              rocketEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {rocketEnabled ? 'Active' : 'Off'}
                            </span>
                          </div>

                          {/* Bank Transfer */}
                          <div
                            onClick={() => setBankEnabled(!bankEnabled)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              bankEnabled
                                ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-950/30'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={bankEnabled}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setBankEnabled(e.target.checked);
                                }}
                                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-extrabold text-xs block text-blue-400">Bank Wire</span>
                                <span className="text-[10px] text-slate-400">BEFTN / NPSB</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              bankEnabled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {bankEnabled ? 'Active' : 'Off'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Payment Number Inputs */}
                      <div className="space-y-3 pt-1 border-t border-slate-800/60">
                        <p className="text-[11px] text-slate-400 font-medium">
                          Enter payment numbers for each enabled method below. You may use the same number for all services or assign unique numbers:
                        </p>

                        {bkashEnabled && (
                          <div>
                            <label className="block text-xs font-bold text-pink-400 mb-1 flex items-center gap-1.5">
                              <span>bKash Number</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={bkashNumber}
                              onChange={(e) => setBkashNumber(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-extrabold text-amber-400 focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        )}

                        {nagadEnabled && (
                          <div>
                            <label className="block text-xs font-bold text-orange-400 mb-1 flex items-center gap-1.5">
                              <span>Nagad Number</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={nagadNumber}
                              onChange={(e) => setNagadNumber(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-extrabold text-amber-400 focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        )}

                        {rocketEnabled && (
                          <div>
                            <label className="block text-xs font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                              <span>Rocket Number</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={rocketNumber}
                              onChange={(e) => setRocketNumber(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-extrabold text-amber-400 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        )}

                        {bankEnabled && (
                          <div>
                            <label className="block text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                              <span>Bank Account Number</span>
                              <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={bankAccountNumber}
                              onChange={(e) => setBankAccountNumber(e.target.value)}
                              placeholder="1501203948501001"
                              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-extrabold text-amber-400 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Common Store & Instruction Information */}
                      <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Receiver Name
                          </label>
                          <input
                            type="text"
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            placeholder="e.g. Store Owner Name"
                            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Store Name
                          </label>
                          <input
                            type="text"
                            value={ownerStoreName}
                            onChange={(e) => setOwnerStoreName(e.target.value)}
                            placeholder="e.g. My Store Name"
                            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Transaction ID Instruction
                          </label>
                          <textarea
                            rows={3}
                            value={transactionIdInstruction}
                            onChange={(e) => setTransactionIdInstruction(e.target.value)}
                            placeholder="Copy your transaction ID and enter it below."
                            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Payment Settings</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
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
          )}
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

      {/* MODAL 6: CANCEL / REVOKE SUBSCRIPTION CONFIRMATION */}
      {cancelConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-extrabold text-lg text-white">
                  Confirm Subscription Cancellation
                </h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to cancel / revoke this active subscription plan?
                </p>
              </div>
            </div>

            {/* Business Data Preservation Guarantee Note */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Safe Revocation Guarantee</span>
              </p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Cancelling this subscription will revert the merchant's store plan to the <strong>Free Plan</strong>. The merchant's user account, store products, sales history, customer databases, and inventory records will <strong>NOT be deleted or altered</strong>.
              </p>
            </div>

            {/* Target Subscription Info Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Store / Merchant:</span>
                <span className="font-extrabold text-white">
                  {cancelConfirmModal.req?.brandName || cancelConfirmModal.userProfile?.brandName || 'Store'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Owner Email:</span>
                <span className="font-mono text-purple-300">
                  {cancelConfirmModal.req?.userEmail || cancelConfirmModal.userProfile?.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Plan:</span>
                <span className="font-bold text-amber-400">
                  {cancelConfirmModal.req?.requestedPlan || cancelConfirmModal.userProfile?.subscriptionPlan}
                </span>
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reason / Internal Audit Note (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReasonNote}
                onChange={(e) => setCancelReasonNote(e.target.value)}
                placeholder="e.g. Requested by merchant / Payment refund issued / Policy violation..."
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCancelConfirmModal(null);
                  setCancelReasonNote('');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Keep Active
              </button>

              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: DUPLICATE PLAN REPLACEMENT CONFIRMATION */}
      {approveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Existing Active Subscription Found</h3>
                <p className="text-xs text-slate-400">Confirm plan upgrade replacement</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Merchant <strong className="text-white">{approveConfirmModal.brandName}</strong> ({approveConfirmModal.userEmail}) currently has an active subscription.
            </p>

            <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs space-y-1">
              <p className="text-purple-300">
                Approving this request will replace their current plan with the <strong>{approveConfirmModal.requestedPlan} Plan</strong> ({approveConfirmModal.billingCycle}).
              </p>
              <p className="text-slate-400 text-[11px]">
                The previous request history will be preserved with full audit logs.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setApproveConfirmModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDuplicateApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Supersede</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SUBSCRIPTION REQUEST AUDIT & DETAILS */}
      {selectedDetailRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">Subscription Audit Details</h3>
              </div>
              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Merchant Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                <span>Merchant Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Brand Name</span>
                  <span className="font-extrabold text-white">{selectedDetailRequest.brandName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Applicant Name</span>
                  <span className="font-bold text-slate-200">{selectedDetailRequest.userName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email Address</span>
                  <span className="font-mono text-purple-300 text-[11px]">{selectedDetailRequest.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">User ID (UID)</span>
                  <span className="font-mono text-slate-400 text-[10px] truncate block">{selectedDetailRequest.userId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Plan & Payment Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Plan & Payment Details</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Requested Plan</span>
                  <span className="font-bold text-amber-400">{selectedDetailRequest.requestedPlan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Billing Cycle</span>
                  <span className="font-bold text-slate-200 capitalize">{selectedDetailRequest.billingCycle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Region</span>
                  <span className="font-bold text-slate-200">
                    {selectedDetailRequest.paymentRegion === 'international' ? 'International Payment (USD)' : 'Bangladesh Payment (BDT)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Provider</span>
                  <span className="font-bold text-slate-200">
                    {selectedDetailRequest.paymentProvider || selectedDetailRequest.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Transaction ID</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {selectedDetailRequest.transactionId || 'Manual / None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Amount</span>
                  <span className="font-extrabold text-emerald-400">
                    {selectedDetailRequest.currency === 'USD' || selectedDetailRequest.currency === '$' ? '$' : '৳'}{selectedDetailRequest.amount} ({selectedDetailRequest.currency || (selectedDetailRequest.paymentRegion === 'bangladesh' ? 'BDT' : 'USD')})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Subscription Status</span>
                  <span className="font-bold uppercase text-emerald-400">{selectedDetailRequest.status}</span>
                </div>
                {selectedDetailRequest.currentPeriodStart && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Start Date</span>
                    <span className="font-bold text-slate-300">{formatDate(selectedDetailRequest.currentPeriodStart)}</span>
                  </div>
                )}
                {selectedDetailRequest.currentPeriodEnd && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Next Billing Date</span>
                    <span className="font-bold text-purple-300">{formatDate(selectedDetailRequest.currentPeriodEnd)}</span>
                  </div>
                )}
                {selectedDetailRequest.paddleSubscriptionId && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Paddle Subscription ID</span>
                    <span className="font-mono text-indigo-300 font-bold">{selectedDetailRequest.paddleSubscriptionId}</span>
                  </div>
                )}
                {selectedDetailRequest.paddlePriceId && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Paddle Price ID</span>
                    <span className="font-mono text-indigo-300 font-bold">{selectedDetailRequest.paddlePriceId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Log Timeline</span>
              </h4>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Request Submitted:</span>
                  </span>
                  <span className="font-bold text-slate-200">{formatDate(selectedDetailRequest.requestDate)}</span>
                </div>

                {selectedDetailRequest.reviewedDate && (
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approved On:</span>
                    </span>
                    <span className="font-bold text-emerald-400">
                      {formatDate(selectedDetailRequest.reviewedDate)} {selectedDetailRequest.approvedBy ? `(by ${selectedDetailRequest.approvedBy})` : ''}
                    </span>
                  </div>
                )}

                {selectedDetailRequest.cancelledAt && (
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancelled On:</span>
                    </span>
                    <span className="font-bold text-rose-400">
                      {formatDate(selectedDetailRequest.cancelledAt)} {selectedDetailRequest.cancelledBy ? `(by ${selectedDetailRequest.cancelledBy})` : ''}
                    </span>
                  </div>
                )}

                {selectedDetailRequest.notes && (
                  <div className="border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400 block text-[10px]">Notes / Comments:</span>
                    <p className="text-slate-200 text-xs bg-slate-900 p-2 rounded-lg mt-1 italic border border-slate-800">
                      "{selectedDetailRequest.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              {selectedDetailRequest.status === 'approved' && (
                <button
                  onClick={() => {
                    const req = selectedDetailRequest;
                    setSelectedDetailRequest(null);
                    setCancelConfirmModal({ req });
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Subscription</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

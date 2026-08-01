import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan, UserProfile } from '../../types';
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
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Phone,
  BarChart2,
  Bell,
  Settings as SettingsIcon,
  Crown,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    user,
    allUsers,
    suspendUser,
    activateUser,
    deleteUser,
    resetUserPassword,
    updateUserPlan,
    subscriptionRequests,
    approveSubscriptionRequest,
    rejectSubscriptionRequest,
    settings,
    updateSettings,
    sales,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'announcements' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('123456');

  // Change Plan Modal State
  const [planModalUser, setPlanModalUser] = useState<UserProfile | null>(null);
  const [selectedPlanInput, setSelectedPlanInput] = useState<SubscriptionPlan>('Business');

  // Reject Request Modal State
  const [rejectModalReqId, setRejectModalReqId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Platform Site Settings State
  const [siteBrandName, setSiteBrandName] = useState(settings.siteBrandName || 'YearInvo');
  const [siteSubBrand, setSiteSubBrand] = useState(settings.siteSubBrandName || 'by Year Media');
  const [siteLogoUrl, setSiteLogoUrl] = useState(settings.siteLogoUrl || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Ensure only Owner can view this
  if (user?.role !== 'Owner') {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 space-y-2">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
        <h3 className="font-extrabold text-lg">Access Denied</h3>
        <p className="text-xs">The Owner Dashboard is strictly restricted to Platform Owner accounts.</p>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' ? true : u.status === statusFilter || (statusFilter === 'active' && !u.status);
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = subscriptionRequests.filter((r) => r.status === 'pending');

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

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    resetUserPassword(resetModalUser.id, newPasswordInput);
    alert(`Password for ${resetModalUser.ownerName} has been reset to "${newPasswordInput}".`);
    setResetModalUser(null);
  };

  const handleChangePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planModalUser) return;
    updateUserPlan(planModalUser.id, selectedPlanInput);
    alert(`Plan for ${planModalUser.brandName} has been updated to ${selectedPlanInput}.`);
    setPlanModalUser(null);
  };

  const handleConfirmReject = () => {
    if (!rejectModalReqId) return;
    rejectSubscriptionRequest(rejectModalReqId, rejectNote);
    setRejectModalReqId(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Platform Owner Control
            </span>
            <span className="text-xs font-bold text-slate-400">• Master Administrator</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Owner Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Full platform governance: manage registered merchants, approve subscription plans, and configure system rules.
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <button
            onClick={() => setActiveTab('subscriptions')}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer animate-pulse"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{pendingRequests.length} Pending Subscription Approvals</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Platform Metrics', icon: BarChart2 },
          { id: 'users', label: `Users & Stores (${allUsers.length})`, icon: Users },
          { id: 'subscriptions', label: `Subscription Requests (${pendingRequests.length})`, icon: Award },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'settings', label: 'Platform Branding', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Total Registered Merchants</span>
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-white">{allUsers.length}</p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                {allUsers.filter((u) => u.status !== 'suspended').length} Active Accounts
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Pending Subscriptions</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-400">{pendingRequests.length}</p>
              <p className="text-[11px] text-slate-400">Awaiting Owner Review</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Paid / Business Plans</span>
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-purple-400">
                {allUsers.filter((u) => u.subscriptionPlan === 'Business' || u.subscriptionPlan === 'Pro').length}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">Pro &amp; Business Merchants</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Suspended Users</span>
                <UserX className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-black text-rose-400">
                {allUsers.filter((u) => u.status === 'suspended').length}
              </p>
              <p className="text-[11px] text-rose-400 font-semibold">Access restricted</p>
            </div>
          </div>

          {/* User Distribution Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#7C3AED]" />
              <span>Registered Merchants Summary</span>
            </h3>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
              {allUsers.map((u) => (
                <div key={u.id} className="p-4 bg-slate-950/40 hover:bg-slate-800/40 transition-colors flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-48">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 text-[#a78bfa] font-black text-sm flex items-center justify-center">
                      {u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{u.brandName}</span>
                        {u.role === 'Owner' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black text-[9px]">
                            OWNER
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">{u.ownerName} • {u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      {u.businessType || 'General Retail'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold">
                      {u.subscriptionPlan} Plan
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      u.status === 'suspended'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & STORES MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, store or mobile..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((u) => {
              const isOwner = u.role === 'Owner';
              const isSuspended = u.status === 'suspended';

              return (
                <div
                  key={u.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all relative ${
                    isSuspended ? 'border-rose-900/60 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#a78bfa] font-black text-lg flex items-center justify-center shrink-0">
                        {u.ownerName ? u.ownerName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                          <span>{u.brandName}</span>
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black text-[10px]">
                              PLATFORM OWNER
                            </span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-slate-400">{u.ownerName}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      isSuspended
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Address</span>
                      <span className="font-semibold text-slate-200 truncate block">{u.email}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Phone / Mobile</span>
                      <span className="font-semibold text-slate-200 block">{u.mobile || 'N/A'}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Store Type</span>
                      <span className="font-semibold text-slate-200 truncate block">{u.businessType}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Plan</span>
                      <span className="font-black text-[#a78bfa] block">{u.subscriptionPlan}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {!isOwner && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPlanModalUser(u)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span>Change Plan</span>
                        </button>

                        <button
                          onClick={() => setResetModalUser(u)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reset Password</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isSuspended ? (
                          <button
                            onClick={() => activateUser(u.id)}
                            className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Activate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendUser(u.id)}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                            <span>Suspend</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user "${u.brandName}"? This action cannot be undone.`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION REQUESTS APPROVAL */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-extrabold text-sm text-white">Merchant Plan Upgrade Requests</h3>
              <p className="text-xs text-slate-400">
                Review and approve or reject requested plan subscriptions submitted by store owners.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs rounded-full">
              {pendingRequests.length} Pending Approval
            </span>
          </div>

          {subscriptionRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 space-y-2">
              <Award className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No subscription upgrade requests submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptionRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';

                return (
                  <div
                    key={req.id}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all ${
                      isPending
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : isApproved
                        ? 'border-emerald-500/30'
                        : 'border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-white">{req.brandName}</h4>
                          <span className="text-xs text-slate-400">({req.userName})</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{req.userEmail}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Plan</span>
                        <span className="font-semibold text-slate-300">{req.currentPlan}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Requested Plan</span>
                        <span className="font-black text-[#a78bfa]">{req.requestedPlan}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Method / Txn</span>
                        <span className="font-semibold text-slate-300">{req.paymentMethod} {req.transactionId ? `(${req.transactionId})` : ''}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Amount / Cycle</span>
                        <span className="font-bold text-emerald-400">৳{req.amount} ({req.billingCycle})</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setRejectModalReqId(req.id)}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Request</span>
                        </button>

                        <button
                          onClick={() => approveSubscriptionRequest(req.id)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve &amp; Activate Plan</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-base text-white">Broadcast System Announcement</h3>
            <p className="text-xs text-slate-400">
              Send an official notification announcement to all merchant notification feeds across the platform.
            </p>
          </div>

          {announcementSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Broadcast announcement sent successfully to all registered users!</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!announcementTitle || !announcementMsg) return;
              setAnnouncementSuccess(true);
              setAnnouncementTitle('');
              setAnnouncementMsg('');
              setTimeout(() => setAnnouncementSuccess(false), 4000);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Announcement Message *
              </label>
              <textarea
                rows={4}
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Type your official message to merchants..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-black text-xs rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Send Broadcast to All Merchants</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PLATFORM BRANDING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-base text-white">Platform Branding &amp; Configuration</h3>
            <p className="text-xs text-slate-400">
              Customize the global platform branding displayed on login headers, footer tags, and receipt defaults.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Platform settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Site Brand Name
              </label>
              <input
                type="text"
                value={siteBrandName}
                onChange={(e) => setSiteBrandName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Sub-Brand Tag
              </label>
              <input
                type="text"
                value={siteSubBrand}
                onChange={(e) => setSiteSubBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Custom Logo URL (Optional)
              </label>
              <input
                type="text"
                value={siteLogoUrl}
                onChange={(e) => setSiteLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Save Platform Branding
            </button>
          </form>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-extrabold text-base text-white">Reset Password for {resetModalUser.brandName}</h3>
            <p className="text-xs text-slate-400">
              Enter a new password for {resetModalUser.ownerName} ({resetModalUser.email}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Confirm Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE USER PLAN */}
      {planModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-extrabold text-base text-white">Directly Upgrade/Downgrade Plan</h3>
            <p className="text-xs text-slate-400">
              Select new subscription plan for {planModalUser.brandName}.
            </p>

            <form onSubmit={handleChangePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Subscription Plan</label>
                <select
                  value={selectedPlanInput}
                  onChange={(e) => setSelectedPlanInput(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                >
                  <option value="Free">Free Starter Plan</option>
                  <option value="Starter">Starter Plan</option>
                  <option value="Pro">Pro Business Plan</option>
                  <option value="Business">Enterprise Business Plan</option>
                  <option value="Lifetime">Lifetime Plan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanModalUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT REQUEST NOTE */}
      {rejectModalReqId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-extrabold text-base text-white">Reject Subscription Request</h3>
            <p className="text-xs text-slate-400">Provide an optional reason for rejecting this request.</p>

            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Invalid transaction ID provided..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalReqId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

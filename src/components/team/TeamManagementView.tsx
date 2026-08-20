import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TeamMember,
  TeamRole,
  TeamPermissions,
  TeamInvitation,
  roleDefaultPermissions,
} from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Lock,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  X,
  Info,
  Send,
  RotateCw,
  Ban,
  AlertCircle,
  Loader2,
  Inbox,
  Check,
} from 'lucide-react';

const PERMISSION_GROUPS: {
  name: string;
  keys: (keyof TeamPermissions)[];
  descriptions: Record<keyof TeamPermissions, string>;
}[] = [
  {
    name: 'Point of Sale & Counter',
    keys: ['dashboard', 'quickSale', 'pos', 'sales', 'salesHistory', 'refund'],
    descriptions: {
      dashboard: 'View main store dashboard & metrics overview',
      quickSale: 'Access Instant Quick Sale counter register',
      pos: 'Full POS register with custom discounts & multi-payment',
      sales: 'Process sales and issue printed receipts',
      salesHistory: 'View past invoices and receipt transaction archives',
      refund: 'Issue refunds and returns on completed sales',
      products: '',
      createProduct: '',
      editProduct: '',
      deleteProduct: '',
      categories: '',
      inventory: '',
      stockAdjustment: '',
      purchases: '',
      suppliers: '',
      customers: '',
      customerDue: '',
      expenses: '',
      capitalInvestment: '',
      profitLoss: '',
      reports: '',
      notifications: '',
      teamManagement: '',
      payroll: '',
      storeBranding: '',
      settings: '',
      subscription: '',
      paymentSettings: '',
      auditLog: '',
    },
  },
  {
    name: 'Products & Inventory',
    keys: ['products', 'createProduct', 'editProduct', 'deleteProduct', 'categories', 'inventory', 'stockAdjustment', 'purchases', 'suppliers'],
    descriptions: {
      products: 'Browse product catalog, barcodes & pricing',
      createProduct: 'Add new items into store inventory',
      editProduct: 'Update item prices, barcodes and descriptions',
      deleteProduct: 'Permanently remove items from product catalog',
      categories: 'Create and manage item categories & brands',
      inventory: 'Audit inventory stock levels and reorder alerts',
      stockAdjustment: 'Make stock correction, additions and damage write-offs',
      purchases: 'Create supplier purchase orders & restock inventory',
      suppliers: 'Manage vendor directory and supplier ledgers',
      dashboard: '',
      quickSale: '',
      pos: '',
      sales: '',
      refund: '',
      salesHistory: '',
      customers: '',
      customerDue: '',
      expenses: '',
      capitalInvestment: '',
      profitLoss: '',
      reports: '',
      notifications: '',
      teamManagement: '',
      payroll: '',
      storeBranding: '',
      settings: '',
      subscription: '',
      paymentSettings: '',
      auditLog: '',
    },
  },
  {
    name: 'Customers & Financials',
    keys: ['customers', 'customerDue', 'expenses', 'capitalInvestment', 'profitLoss', 'reports', 'payroll'],
    descriptions: {
      customers: 'Customer directory and transaction histories',
      customerDue: 'Collect customer due balances and send payment reminders',
      expenses: 'Record operational expenses (Rent, Electricity, Utilities)',
      capitalInvestment: 'Track business owner capital investments & withdrawals',
      profitLoss: 'View real-time Net Profit, COGS and revenue analytics',
      reports: 'Generate and export detailed sales & tax reports',
      payroll: 'Access Employee Salary & Payroll management module',
      dashboard: '',
      quickSale: '',
      pos: '',
      products: '',
      createProduct: '',
      editProduct: '',
      deleteProduct: '',
      categories: '',
      inventory: '',
      stockAdjustment: '',
      purchases: '',
      suppliers: '',
      sales: '',
      refund: '',
      salesHistory: '',
      notifications: '',
      teamManagement: '',
      storeBranding: '',
      settings: '',
      subscription: '',
      paymentSettings: '',
      auditLog: '',
    },
  },
  {
    name: 'Store Administration & Security',
    keys: ['teamManagement', 'storeBranding', 'settings', 'subscription', 'paymentSettings', 'auditLog', 'notifications'],
    descriptions: {
      teamManagement: 'Invite staff members, assign roles and custom permissions',
      storeBranding: 'Change store name, invoice logo, header and footer',
      settings: 'Manage global business settings, backup, currency & language',
      subscription: 'Manage store plan and upgrade subscriptions',
      paymentSettings: 'Configure bKash, Nagad, Rocket and QR payment settings',
      auditLog: 'View activity history and audit logs of critical actions',
      notifications: 'Receive real-time alerts for low stock, due & expiry',
      dashboard: '',
      quickSale: '',
      pos: '',
      products: '',
      createProduct: '',
      editProduct: '',
      deleteProduct: '',
      categories: '',
      inventory: '',
      stockAdjustment: '',
      purchases: '',
      suppliers: '',
      sales: '',
      refund: '',
      salesHistory: '',
      customers: '',
      customerDue: '',
      expenses: '',
      capitalInvestment: '',
      profitLoss: '',
      reports: '',
      payroll: '',
    },
  },
];

export const TeamManagementView: React.FC = () => {
  const {
    user,
    settings,
    teamMembers: contextTeamMembers,
    saveTeamMembers: contextSaveTeamMembers,
  } = useApp();

  // Connected to real-time cloud Firestore synchronized state
  const teamMembers = contextTeamMembers || [];

  const saveTeamMembers = (updated: TeamMember[]) => {
    if (contextSaveTeamMembers) {
      contextSaveTeamMembers(updated);
    }
    try {
      localStorage.setItem(`biz_team_members_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Invitations state
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<TeamRole>('Cashier');
  const [formStatus, setFormStatus] = useState<'Active' | 'Invited' | 'Disabled'>('Active');
  const [formPermissions, setFormPermissions] = useState<TeamPermissions>(roleDefaultPermissions.Cashier);

  // Invitation Submission status
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load invitations from server
  const fetchInvitations = async () => {
    if (!user?.id) return;
    try {
      setLoadingInvitations(true);
      const res = await fetch(`/api/team/invitations?storeId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.invitations)) {
        setInvitations(data.invitations);
      }
    } catch (e) {
      console.warn('[Invitations] Fetch notice:', e);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id]);

  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Cashier');
    setFormStatus('Active');
    setFormPermissions(roleDefaultPermissions.Cashier);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone || '');
    setFormRole(member.role);
    setFormStatus(member.status);
    setFormError(null);
    setFormSuccess(null);
    const effectivePermissions = {
      ...roleDefaultPermissions[member.role],
      ...(member.customPermissions || {}),
    };
    setFormPermissions(effectivePermissions);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: TeamRole) => {
    setFormRole(newRole);
    setFormPermissions(roleDefaultPermissions[newRole]);
  };

  const handlePermissionToggle = (key: keyof TeamPermissions) => {
    setFormPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Submit Handler: Creates team member and delivers email invitation via Resend
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanName = formName.trim();
    const cleanEmail = formEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setFormError('Please provide a staff name and a valid email address.');
      return;
    }

    if (editingMember) {
      // Direct local update of existing team member permissions
      const updated = teamMembers.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: cleanName,
              email: cleanEmail,
              phone: formPhone.trim(),
              role: formRole,
              status: formStatus,
              customPermissions: formPermissions,
            }
          : m
      );
      saveTeamMembers(updated);
      setIsModalOpen(false);
      return;
    }

    // New Invitation Flow -> Calls Server Endpoint to send email via Resend
    setIsSending(true);

    try {
      const storeId = user?.id || 'default_store';
      const storeName = settings.brandName || user?.storeName || user?.name || 'Your Store';
      const ownerName = user?.name || 'Store Owner';

      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          storeName,
          name: cleanName,
          email: cleanEmail,
          phone: formPhone.trim(),
          role: formRole,
          customPermissions: formPermissions,
          invitedBy: storeId,
          invitedByName: ownerName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send invitation email.');
      }

      setFormSuccess(`Invitation email successfully sent to ${cleanEmail}!`);

      // Refresh invitations list and local team members
      await fetchInvitations();

      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: formPhone.trim(),
        role: formRole,
        status: 'Invited',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Invited',
        invitedBy: ownerName,
        invitationId: data.invitation?.id,
        customPermissions: formPermissions,
      };

      const exists = teamMembers.some((m) => m.email.toLowerCase() === cleanEmail);
      if (!exists) {
        saveTeamMembers([...teamMembers, newMember]);
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setIsSending(false);
        setActiveTab('invitations');
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Email delivery failed. Please check server configuration.');
      setIsSending(false);
    }
  };

  // Resend invitation action
  const handleResendInvite = async (invitationId: string, email: string) => {
    if (!user?.id) return;
    setResendingId(invitationId);
    setActionNotice(null);

    try {
      const res = await fetch('/api/team/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          storeId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend invitation email.');
      }

      setActionNotice({ type: 'success', message: `Invitation email resent to ${email}` });
      await fetchInvitations();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to resend invitation.' });
    } finally {
      setResendingId(null);
    }
  };

  // Revoke invitation action
  const handleRevokeInvite = async (invitationId: string, name: string) => {
    if (!user?.id) return;
    if (!confirm(`Are you sure you want to revoke the invitation for "${name}"? They will no longer be able to accept it.`)) {
      return;
    }

    setRevokingId(invitationId);
    setActionNotice(null);

    try {
      const res = await fetch('/api/team/revoke-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          storeId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke invitation.');
      }

      setActionNotice({ type: 'success', message: `Invitation for ${name} has been revoked.` });
      await fetchInvitations();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to revoke invitation.' });
    } finally {
      setRevokingId(null);
    }
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove team member "${name}"?`)) {
      const updated = teamMembers.filter((m) => m.id !== id);
      saveTeamMembers(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = teamMembers.map((m) => {
      if (m.id === id) {
        const nextStatus: 'Active' | 'Disabled' = m.status === 'Active' ? 'Disabled' : 'Active';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    saveTeamMembers(updated);
  };

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery));
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invitedEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || inv.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = teamMembers.filter((m) => m.status === 'Active').length;
  const pendingInvitesCount = invitations.filter((i) => i.status === 'pending').length;
  const acceptedInvitesCount = invitations.filter((i) => i.status === 'accepted').length;
  const disabledCount = teamMembers.filter((m) => m.status === 'Disabled').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5c01] bg-[#ff5c01]/10 px-2.5 py-0.5 rounded-full border border-[#ff5c01]/20">
                Workforce &amp; Access Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#ff5c01]" />
              <span>Team Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Invite cashiers, managers, and staff with secure single-use email invitations powered by Resend.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#ff5c01] to-amber-500 hover:from-[#e05100] hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
              actionNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="glass-panel rounded-2xl p-3.5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Active Staff</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{activeCount}</p>
          </div>
          <div className="glass-panel rounded-2xl p-3.5">
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Pending Invites</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingInvitesCount}</p>
          </div>
          <div className="glass-panel rounded-2xl p-3.5">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Accepted Invites</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{acceptedInvitesCount}</p>
          </div>
          <div className="glass-panel rounded-2xl p-3.5">
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Disabled Staff</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{disabledCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-[#ff5c01] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Staff Members ({teamMembers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('invitations');
            fetchInvitations();
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'bg-[#ff5c01] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Invitations ({invitations.length})</span>
          {pendingInvitesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Accountant">Accountant</option>
            <option value="Custom Role">Custom Role</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
          >
            <option value="all">All Status</option>
            {activeTab === 'members' ? (
              <>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Disabled">Disabled</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* TAB 1: Staff Members Grid */}
      {activeTab === 'members' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const isOwner = member.role === 'Owner';
              return (
                <div
                  key={member.id}
                  className={`glass-card glass-hover rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                    member.status === 'Disabled'
                      ? 'border-rose-900/40 opacity-70'
                      : ''
                  }`}
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff5c01] to-amber-500 flex items-center justify-center font-bold text-white text-base shadow-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isOwner && <ShieldCheck className="w-4 h-4 text-[#ff5c01]" />}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : member.status === 'Invited'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1.5 py-3 border-y border-slate-800 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Joined: {member.joinedDate}</span>
                      </div>
                    </div>

                    {/* Permissions Summary Pills */}
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Access Scope
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {isOwner ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#ff5c01]/15 text-[#ff5c01] font-bold">
                            Full Administrator Access
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {member.role} Preset
                            </span>
                            {member.customPermissions?.payroll && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-semibold">
                                Payroll
                              </span>
                            )}
                            {member.customPermissions?.pos && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-semibold">
                                POS Counter
                              </span>
                            )}
                            {member.customPermissions?.expenses && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-semibold">
                                Expenses
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwner && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          member.status === 'Active'
                            ? 'border-amber-700/50 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30'
                            : 'border-emerald-700/50 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30'
                        }`}
                      >
                        {member.status === 'Active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Disable</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                          title="Edit Permissions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                          title="Delete Member"
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

          {filteredMembers.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Team Members Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search criteria or click "Invite Team Member" to send an email invitation.
              </p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Email Invitations List */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ff5c01]" />
                <h3 className="text-sm font-bold text-white">Sent Email Invitations</h3>
              </div>
              <button
                onClick={fetchInvitations}
                disabled={loadingInvitations}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingInvitations ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invited Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sent Date</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredInvitations.map((inv) => {
                    const isPending = inv.status === 'pending';
                    const isExpired = inv.status === 'expired';
                    const isAccepted = inv.status === 'accepted';
                    const isRevoked = inv.status === 'revoked';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {inv.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {inv.invitedEmail}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#ff5c01] bg-[#ff5c01]/10 px-2 py-0.5 rounded-md border border-[#ff5c01]/20">
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Check className="w-3 h-3" />
                              <span>Accepted</span>
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              <Clock className="w-3 h-3" />
                              <span>Expired</span>
                            </span>
                          )}
                          {isRevoked && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <Ban className="w-3 h-3" />
                              <span>Revoked</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(isPending || isExpired) && (
                              <button
                                onClick={() => handleResendInvite(inv.id, inv.invitedEmail)}
                                disabled={resendingId === inv.id}
                                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Resend email with new secure single-use token"
                              >
                                {resendingId === inv.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RotateCw className="w-3 h-3" />
                                )}
                                <span>Resend</span>
                              </button>
                            )}

                            {isPending && (
                              <button
                                onClick={() => handleRevokeInvite(inv.id, inv.name)}
                                disabled={revokingId === inv.id}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Revoke invitation"
                              >
                                {revokingId === inv.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Ban className="w-3 h-3" />
                                )}
                                <span>Revoke</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInvitations.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">No invitations found.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click "Invite Team Member" to send an email invitation to a new staff member.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingMember ? (
                    <>
                      <Key className="w-5 h-5 text-[#ff5c01]" />
                      <span>Edit Staff Permissions</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-[#ff5c01]" />
                      <span>Invite New Team Member</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingMember
                    ? 'Update custom permission flags for this staff member.'
                    : 'A secure single-use invitation email will be sent via Resend.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSending}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Banners */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember}>
              <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address (Recipient) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="staff@store.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+880 1700 000000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Assigned Role *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => handleRoleChange(e.target.value as TeamRole)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="Cashier">Cashier (Point of Sale, Receipts &amp; Quick Sale)</option>
                      <option value="Manager">Manager (Operations, Stock &amp; Customers)</option>
                      <option value="Inventory Manager">Inventory Manager (Stock, Products &amp; Suppliers)</option>
                      <option value="Accountant">Accountant (Sales Reports, Expenses &amp; Payroll)</option>
                      <option value="Custom Role">Custom Role (Fine-grained toggles)</option>
                      <option value="Owner">Owner (Full Store Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Role description info banner */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-[#ff5c01] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Preset Applied: {formRole}</p>
                    <p className="text-slate-400 mt-0.5">
                      You can customize individual permission flags below. Custom toggles will override the base role default.
                    </p>
                  </div>
                </div>

                {/* Granular Permissions Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Granular Access Permissions
                  </h4>

                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => (
                      <div
                        key={group.name}
                        className="bg-slate-850 border border-slate-800 rounded-xl p-4"
                      >
                        <h5 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                          <span>{group.name}</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {group.keys.map((permKey) => {
                            const isGranted = Boolean(formPermissions[permKey]);
                            const desc = group.descriptions[permKey];

                            return (
                              <label
                                key={permKey}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                  isGranted
                                    ? 'bg-[#ff5c01]/10 border-[#ff5c01]/40 text-white'
                                    : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  onChange={() => handlePermissionToggle(permKey)}
                                  className="mt-0.5 rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                                />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold capitalize text-slate-100">
                                    {permKey.replace(/([A-Z])/g, ' $1')}
                                  </p>
                                  {desc && (
                                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                      {desc}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff5c01] to-amber-500 hover:from-[#e05100] hover:to-amber-600 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-[#ff5c01]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Invitation Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{editingMember ? 'Save Permissions' : 'Send Invite'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

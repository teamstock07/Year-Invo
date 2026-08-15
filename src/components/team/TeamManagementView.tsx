import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TeamMember,
  TeamRole,
  TeamPermissions,
  roleDefaultPermissions,
} from '../../types';
import {
  Users,
  UserPlus,
  Shield,
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
  HelpCircle,
  Clock,
  Key,
  X,
  Info,
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
    keys: ['customers', 'customerDue', 'expenses', 'profitLoss', 'reports', 'payroll'],
    descriptions: {
      customers: 'Customer directory and transaction histories',
      customerDue: 'Collect customer due balances and send payment reminders',
      expenses: 'Record operational expenses (Rent, Electricity, Utilities)',
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
      profitLoss: '',
      reports: '',
      payroll: '',
    },
  },
];

export const TeamManagementView: React.FC = () => {
  const {
    user,
    t,
    language,
    theme,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const openAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Cashier');
    setFormStatus('Active');
    setFormPermissions(roleDefaultPermissions.Cashier);
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone || '');
    setFormRole(member.role);
    setFormStatus(member.status);
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

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert('Please provide staff name and email address.');
      return;
    }

    if (editingMember) {
      const updated = teamMembers.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formName.trim(),
              email: formEmail.trim().toLowerCase(),
              phone: formPhone.trim(),
              role: formRole,
              status: formStatus,
              customPermissions: formPermissions,
            }
          : m
      );
      saveTeamMembers(updated);
    } else {
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        role: formRole,
        status: formStatus,
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Invited',
        customPermissions: formPermissions,
      };
      saveTeamMembers([...teamMembers, newMember]);
    }

    setIsModalOpen(false);
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

  const activeCount = teamMembers.filter((m) => m.status === 'Active').length;
  const invitedCount = teamMembers.filter((m) => m.status === 'Invited').length;
  const disabledCount = teamMembers.filter((m) => m.status === 'Disabled').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5c01] bg-[#ff5c01]/10 px-2 py-0.5 rounded-full">
                Workforce & Access Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#ff5c01]" />
              <span>Team Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Invite cashiers, managers, and accountants. Configure granular role permissions to keep your store data secure.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#ff5c01] hover:bg-[#e05200] text-white text-xs font-bold rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>

        {/* Quick Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-400">Total Staff</p>
            <p className="text-xl font-bold text-white mt-0.5">{teamMembers.length}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Active Members</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-amber-400">Invited / Pending</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{invitedCount}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-rose-400">Disabled Accounts</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{disabledCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
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
            className="bg-slate-800 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Invited">Invited</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Staff Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isOwner = member.role === 'Owner';
          return (
            <div
              key={member.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                member.status === 'Disabled'
                  ? 'border-rose-900/40 opacity-70'
                  : 'border-slate-800 hover:border-slate-700 shadow-sm'
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
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isOwner && <ShieldCheck className="w-4 h-4 text-[#ff5c01]" />}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
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
            Try adjusting your search criteria or click "Invite Team Member" to add a new staff account.
          </p>
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
                  <Key className="w-5 h-5 text-[#ff5c01]" />
                  <span>{editingMember ? 'Edit Staff Permissions' : 'Invite New Team Member'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure role assignment and granular module permission flags.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                      Email Address *
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
                      <option value="Cashier">Cashier (Point of Sale, Receipts & Quick Sale)</option>
                      <option value="Manager">Manager (Operations, Stock & Customers)</option>
                      <option value="Inventory Manager">Inventory Manager (Stock, Products & Suppliers)</option>
                      <option value="Accountant">Accountant (Sales Reports, Expenses & Payroll)</option>
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
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff5c01] hover:bg-[#e05200] text-xs font-bold text-white shadow-md shadow-[#ff5c01]/20 transition-all cursor-pointer"
                >
                  {editingMember ? 'Save Permissions' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

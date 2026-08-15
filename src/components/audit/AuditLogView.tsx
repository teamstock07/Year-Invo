import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Shield,
  Clock,
  User,
  Activity,
  Layers,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const {
    user,
    activityLogs,
    auditLogs: contextAuditLogs,
    saveAuditLogs: contextSaveAuditLogs,
  } = useApp();

  // Connected to real-time cloud Firestore synchronized state
  const auditLogs = (contextAuditLogs && contextAuditLogs.length > 0)
    ? contextAuditLogs
    : (activityLogs || []).map((log, idx) => ({
        id: `audit-${idx}-${Date.now()}`,
        userId: user?.id || 'owner',
        userName: user?.ownerName || user?.fullName || 'Store Owner',
        userEmail: user?.email || 'owner@yearinvo.com',
        userRole: 'Owner',
        action: log.action,
        actionBn: log.actionBn,
        category: log.action.toLowerCase().includes('salary') || log.action.toLowerCase().includes('payroll')
          ? ('payroll' as const)
          : log.action.toLowerCase().includes('sale')
          ? ('sales' as const)
          : log.action.toLowerCase().includes('product') || log.action.toLowerCase().includes('stock')
          ? ('inventory' as const)
          : log.action.toLowerCase().includes('expense')
          ? ('expense' as const)
          : ('settings' as const),
        details: log.details || 'System operation executed',
        timestamp: log.timestamp,
      }));

  const saveAuditLogs = (updated: AuditLogEntry[]) => {
    if (contextSaveAuditLogs) {
      contextSaveAuditLogs(updated);
    }
    try {
      localStorage.setItem(`biz_audit_logs_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Category', 'Action', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole || 'Owner'}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YearInvo_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all audit activity records?')) {
      saveAuditLogs([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Security & Operations Audit</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-blue-400" />
              <span>Audit Trail & Activity Log</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Chronological log of critical store actions: payroll disbursements, staff permission changes, inventory edits, and administrative operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleClearLogs}
              disabled={auditLogs.length === 0}
              className="px-3.5 py-2.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-400">Total Audit Records</p>
            <p className="text-xl font-bold text-white mt-0.5">{auditLogs.length}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Payroll Events</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {auditLogs.filter((l) => l.category === 'payroll').length}
            </p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-purple-400">Team & Security</p>
            <p className="text-xl font-bold text-purple-400 mt-0.5">
              {auditLogs.filter((l) => l.category === 'team' || l.category === 'settings').length}
            </p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-blue-400">Sales & Inventory</p>
            <p className="text-xl font-bold text-blue-400 mt-0.5">
              {auditLogs.filter((l) => l.category === 'sales' || l.category === 'inventory').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            <option value="payroll">Payroll & Salaries</option>
            <option value="team">Team & Access</option>
            <option value="inventory">Inventory & Products</option>
            <option value="sales">Sales & POS</option>
            <option value="expense">Expenses</option>
            <option value="settings">Settings & Backup</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-white block">{log.userName}</span>
                      <span className="text-[10px] text-slate-500">{log.userRole || 'Admin'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        log.category === 'payroll'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.category === 'team'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : log.category === 'inventory'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : log.category === 'sales'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-md break-words">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Audit Records Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              System events and payroll actions will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

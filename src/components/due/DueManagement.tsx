import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShareDueModal } from './ShareDueModal';
import { Customer } from '../../types';
import {
  CreditCard,
  Users,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  History,
  Search,
  Calendar,
  Eye,
  PlusCircle,
  X,
  FileText,
  Clock,
  Share2,
} from 'lucide-react';

export const DueManagement: React.FC = () => {
  const { customers, suppliers, dueCollections, collectDue, metrics, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'history'>('customers');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');

  // Modal for new collection payment
  const [selectedEntityForPay, setSelectedEntityForPay] = useState<{
    id: string;
    name: string;
    type: 'customer' | 'supplier';
    currentDue: number;
  } | null>(null);

  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('Cash');
  const [note, setNote] = useState<string>('');

  // Modal for specific Entity History
  const [historyEntity, setHistoryEntity] = useState<{
    id: string;
    name: string;
    type: 'customer' | 'supplier';
  } | null>(null);

  // Modal for Share Due Statement
  const [selectedCustomerForShare, setSelectedCustomerForShare] = useState<Customer | null>(null);

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityForPay || payAmount <= 0) return;

    collectDue({
      type: selectedEntityForPay.type,
      entityId: selectedEntityForPay.id,
      amountPaid: payAmount,
      paymentMethod: payMethod,
      note,
    });

    setSelectedEntityForPay(null);
    setPayAmount(0);
    setNote('');
  };

  // Calculate totals for dues received & paid history
  const totalCustomerDuesReceived = dueCollections
    .filter((d) => d.type === 'customer')
    .reduce((sum, d) => sum + d.amountPaid, 0);

  const totalSupplierDuesPaid = dueCollections
    .filter((d) => d.type === 'supplier')
    .reduce((sum, d) => sum + d.amountPaid, 0);

  // Filtered global payment history
  const filteredHistory = dueCollections.filter((item) => {
    const matchesType = historyTypeFilter === 'all' || item.type === historyTypeFilter;
    const matchesQuery =
      !historySearch ||
      item.entityName.toLowerCase().includes(historySearch.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(historySearch.toLowerCase())) ||
      item.paymentMethod.toLowerCase().includes(historySearch.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#ff5c01]" />
            {t('dueTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage customer receivables, supplier payables, and complete due collection payment history logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Dues</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Supplier Dues</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Payment History</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Customer Dues */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Due (Arising)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {symbol} {(metrics?.totalDueCustomers || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Current outstanding store credit</p>
        </div>

        {/* Customer Dues Received */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dues Received (Collected)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {symbol} {(totalCustomerDuesReceived || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Total collected payment history</p>
        </div>

        {/* Supplier Dues Payable */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supplier Owed Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {symbol} {(metrics?.totalDueSuppliers || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Current unpaid bulk purchase debts</p>
        </div>

        {/* Supplier Dues Paid */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supplier Dues Paid</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {symbol} {(totalSupplierDuesPaid || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Total paid to suppliers to date</p>
        </div>
      </div>

      {/* Main Content Sections */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Customer Dues & Collection Directory</h3>
              <p className="text-xs text-slate-500">Click on any collection amount or history icon to view payment logs.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5 text-right">Total Spent</th>
                  <th className="p-3.5 text-right">Dues Received (Paid)</th>
                  <th className="p-3.5 text-right">Current Due</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No customer due accounts found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const custPaidHistory = dueCollections
                      .filter((d) => d.type === 'customer' && d.entityId === c.id)
                      .reduce((sum, d) => sum + d.amountPaid, 0);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">
                          <div>{c.name}</div>
                          {c.address && <div className="text-[10px] text-slate-400 font-normal">{c.address}</div>}
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">{c.phone}</td>
                        <td className="p-3.5 text-right font-bold text-slate-800 dark:text-slate-100">
                          {symbol} {(c.totalSpent || 0).toLocaleString()}
                        </td>
                        {/* Clickable Collection History Amount */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setHistoryEntity({ id: c.id, name: c.name, type: 'customer' })}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Click to view full payment history logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{symbol} {(custPaidHistory || 0).toLocaleString()}</span>
                          </button>
                        </td>
                        {/* Current Due */}
                        <td className="p-3.5 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                          {symbol} {(c.dueAmount || c.totalDue || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                const currentDue = c.dueAmount || c.totalDue || 0;
                                setSelectedEntityForPay({ id: c.id, name: c.name, type: 'customer', currentDue });
                                setPayAmount(currentDue);
                              }}
                              disabled={(c.dueAmount || c.totalDue || 0) === 0}
                              className="px-3 py-1.5 bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
                            >
                              Collect Due
                            </button>
                            <button
                              onClick={() => setSelectedCustomerForShare({ ...c, totalDue: c.dueAmount || c.totalDue || 0 })}
                              className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Share Customer Due Statement"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setHistoryEntity({ id: c.id, name: c.name, type: 'customer' })}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="View Collection History"
                            >
                              <History className="w-4 h-4" />
                            </button>
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

      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Supplier Debts & Payment Directory</h3>
              <p className="text-xs text-slate-500">Track and pay supplier accounts and inspect paid history logs.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Supplier Name</th>
                  <th className="p-3.5">Company Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5 text-right">Dues Paid</th>
                  <th className="p-3.5 text-right">Owed Due Balance</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No supplier accounts found.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => {
                    const suppPaidHistory = dueCollections
                      .filter((d) => d.type === 'supplier' && d.entityId === s.id)
                      .reduce((sum, d) => sum + d.amountPaid, 0);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{s.name}</td>
                        <td className="p-3.5 text-slate-500">{s.company}</td>
                        <td className="p-3.5 text-slate-500">{s.mobile}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setHistoryEntity({ id: s.id, name: s.name, type: 'supplier' })}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="Click to view full payment logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{symbol} {(suppPaidHistory || 0).toLocaleString()}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right font-black text-amber-600 dark:text-amber-400 text-sm">
                          {symbol} {(s.dueAmount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedEntityForPay({ id: s.id, name: s.name, type: 'supplier', currentDue: s.dueAmount });
                                setPayAmount(s.dueAmount);
                              }}
                              disabled={s.dueAmount === 0}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
                            >
                              Pay Supplier
                            </button>
                            <button
                              onClick={() => setHistoryEntity({ id: s.id, name: s.name, type: 'supplier' })}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="View Payment History"
                            >
                              <History className="w-4 h-4" />
                            </button>
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

      {/* Global History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-[#ff5c01]" />
                Complete Dues Collection & Payment History Log
              </h3>
              <p className="text-xs text-slate-500">Every recorded due payment date, time, entity, and amount.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search name or note..."
                  className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setHistoryTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyTypeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('customer')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyTypeFilter === 'customer' ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Customer Received
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('supplier')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyTypeFilter === 'supplier' ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Supplier Paid
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Customer / Supplier</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5 text-right">Amount Paid</th>
                  <th className="p-3.5 text-right">Remaining Due</th>
                  <th className="p-3.5">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No due payment logs found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(rec.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="p-3.5 uppercase font-bold text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            rec.type === 'customer'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {rec.type === 'customer' ? 'Customer Received' : 'Supplier Paid'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{rec.entityName}</td>
                      <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">{rec.paymentMethod}</td>
                      <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {symbol} {(rec.amountPaid || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-500">
                        {symbol} {(rec.remainingDue || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 italic max-w-xs truncate">{rec.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Specific Entity Payment History Modal */}
      {historyEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#ff5c01]" />
                  <span>Due Payment History: {historyEntity.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 capitalize">{historyEntity.type} Account Log</p>
              </div>

              <button
                onClick={() => setHistoryEntity(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of payments */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {dueCollections.filter((d) => d.type === historyEntity.type && d.entityId === historyEntity.id).length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No payment collections recorded for {historyEntity.name} yet.
                </div>
              ) : (
                dueCollections
                  .filter((d) => d.type === historyEntity.type && d.entityId === historyEntity.id)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-[#ff5c01]" />
                          <span>{new Date(rec.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                          Method: <span className="text-[#ff5c01]">{rec.paymentMethod}</span>
                          {rec.note && <span className="text-slate-400 font-normal ml-2">({rec.note})</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {symbol} {(rec.amountPaid || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          Remaining Due: {symbol}{(rec.remainingDue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const match =
                    historyEntity.type === 'customer'
                      ? customers.find((c) => c.id === historyEntity.id)
                      : suppliers.find((s) => s.id === historyEntity.id);

                  if (match) {
                    setSelectedEntityForPay({
                      id: match.id,
                      name: match.name,
                      type: historyEntity.type,
                      currentDue: match.dueAmount,
                    });
                    setPayAmount(match.dueAmount);
                    setHistoryEntity(null);
                  }
                }}
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Collection / Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryEntity(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due Collection / Payment Modal */}
      {selectedEntityForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {selectedEntityForPay.type === 'customer' ? 'Collect Customer Due' : 'Pay Supplier Debt'}
              </h3>
              <button
                onClick={() => setSelectedEntityForPay(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-100">{selectedEntityForPay.name}</p>
              <p className="text-slate-500">
                Current Due Balance:{' '}
                <span className="font-black text-rose-600">
                  {symbol} {(selectedEntityForPay?.currentDue || 0).toLocaleString()}
                </span>
              </p>
            </div>

            <form onSubmit={handleConfirmCollection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount ({symbol})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedEntityForPay.currentDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#ff5c01]"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="bKash/Mobile">bKash / Mobile Banking</option>
                  <option value="Bank">Bank Deposit</option>
                  <option value="Card">Card Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid partial cash due"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntityForPay(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Customer Due Modal */}
      <ShareDueModal
        customer={selectedCustomerForShare}
        isOpen={Boolean(selectedCustomerForShare)}
        onClose={() => setSelectedCustomerForShare(null)}
      />
    </div>
  );
};


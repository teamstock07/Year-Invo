import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier, Purchase } from '../../types';
import { SupplierDetailsModal } from './SupplierDetailsModal';
import { PurchaseInvoiceModal } from '../purchases/PurchaseInvoiceModal';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CreditCard,
  Eye,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  DollarSign,
  PlusCircle,
  X,
} from 'lucide-react';

interface SupplierDirectoryViewProps {
  onNavigateToPurchases?: (prefillSupplierId?: string) => void;
}

export const SupplierDirectoryView: React.FC<SupplierDirectoryViewProps> = ({
  onNavigateToPurchases,
}) => {
  const {
    suppliers,
    purchases,
    dueCollections,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    collectDue,
    settings,
    formatDate,
    t,
  } = useApp();

  const symbol = settings.currency || '৳';

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'settled'>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    company: '',
    mobile: '',
    email: '',
    address: '',
  });

  // Details Modal
  const [selectedSupplierForDetails, setSelectedSupplierForDetails] = useState<Supplier | null>(null);

  // Pay Due Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payNote, setPayNote] = useState('');
  const [payError, setPayError] = useState('');

  // 1. Calculate dynamic metrics per supplier from actual purchases and due collections
  const supplierMetricsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        totalPurchasesAmount: number;
        totalPaid: number;
        outstandingDue: number;
        invoiceCount: number;
      }
    >();

    suppliers.forEach((s) => {
      const suppPurchases = purchases.filter((p) => p.supplierId === s.id);
      const totalPurchasesAmount = suppPurchases.reduce(
        (sum, p) => sum + (Number(p.totalAmount) || 0),
        0
      );
      const initialPaid = suppPurchases.reduce(
        (sum, p) => sum + (Number(p.paidAmount) || 0),
        0
      );
      const suppCollections = dueCollections.filter(
        (d) => d.type === 'supplier' && d.entityId === s.id
      );
      const subsequentPaid = suppCollections.reduce(
        (sum, d) => sum + (Number(d.amountPaid) || 0),
        0
      );
      const totalPaid = initialPaid + subsequentPaid;
      const outstandingDue = Math.max(0, totalPurchasesAmount - totalPaid);

      map.set(s.id, {
        totalPurchasesAmount,
        totalPaid,
        outstandingDue,
        invoiceCount: suppPurchases.length,
      });
    });

    return map;
  }, [suppliers, purchases, dueCollections]);

  // Overall Global Supplier KPIs
  const globalKpis = useMemo(() => {
    let grandPurchases = 0;
    let grandPaid = 0;
    let grandDue = 0;
    let suppliersWithDueCount = 0;

    suppliers.forEach((s) => {
      const m = supplierMetricsMap.get(s.id);
      if (m) {
        grandPurchases += m.totalPurchasesAmount;
        grandPaid += m.totalPaid;
        grandDue += m.outstandingDue;
        if (m.outstandingDue > 0) suppliersWithDueCount += 1;
      }
    });

    return {
      totalSuppliers: suppliers.length,
      grandPurchases,
      grandPaid,
      grandDue,
      suppliersWithDueCount,
    };
  }, [suppliers, supplierMetricsMap]);

  // Filtered Suppliers List
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchesSearch =
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sup.company && sup.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sup.mobile.includes(searchTerm) ||
        (sup.address && sup.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const metrics = supplierMetricsMap.get(sup.id);
      const due = metrics ? metrics.outstandingDue : 0;

      if (!matchesSearch) return false;
      if (statusFilter === 'due') return due > 0;
      if (statusFilter === 'settled') return due === 0;
      return true;
    });
  }, [suppliers, searchTerm, statusFilter, supplierMetricsMap]);

  // Handlers for Add/Edit Supplier
  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setSupplierFormData({ name: '', company: '', mobile: '', email: '', address: '' });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierFormData({
      name: sup.name,
      company: sup.company || '',
      mobile: sup.mobile,
      email: sup.email || '',
      address: sup.address || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name.trim()) return;

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, supplierFormData);
    } else {
      await addSupplier(supplierFormData);
    }

    setIsAddEditModalOpen(false);
  };

  // Handlers for Pay Due
  const handleOpenPayModal = (sup: Supplier) => {
    const metrics = supplierMetricsMap.get(sup.id);
    const due = metrics ? metrics.outstandingDue : sup.dueAmount;
    setPayingSupplier(sup);
    setPayAmountInput(due > 0 ? String(due) : '');
    setPayMethod('Cash');
    setPayNote('');
    setPayError('');
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier) return;

    const amount = Number(payAmountInput);
    if (!amount || amount <= 0) {
      setPayError('Please enter a valid payment amount greater than 0');
      return;
    }

    const metrics = supplierMetricsMap.get(payingSupplier.id);
    const maxDue = metrics ? metrics.outstandingDue : payingSupplier.dueAmount;

    if (amount > maxDue && maxDue > 0) {
      if (!confirm(`The amount (${symbol}${amount}) is greater than the outstanding due (${symbol}${maxDue}). Proceed?`)) {
        return;
      }
    }

    await collectDue({
      type: 'supplier',
      entityId: payingSupplier.id,
      amountPaid: amount,
      paymentMethod: payMethod,
      note: payNote.trim() || `Payment to ${payingSupplier.name}`,
    });

    setIsPayModalOpen(false);
    setPayingSupplier(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('navSuppliers') || 'Supplier Management'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wholesale vendor accounts, purchases integration, and automated payable ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#ff5c01]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Global Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Vendors */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Suppliers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {globalKpis.totalSuppliers}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active vendor partnerships
          </p>
        </div>

        {/* Total Purchases */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchases</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {symbol} {(globalKpis.grandPurchases || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total inventory cost invoiced
          </p>
        </div>

        {/* Total Paid */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {symbol} {(globalKpis.grandPaid || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Settled to suppliers
          </p>
        </div>

        {/* Total Outstanding Payable */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Outstanding Payable</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {symbol} {(globalKpis.grandDue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across {globalKpis.suppliersWithDueCount} suppliers
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, phone..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({suppliers.length})
          </button>
          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'due'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <span>With Due</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {globalKpis.suppliersWithDueCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'settled'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Settled ({suppliers.length - globalKpis.suppliersWithDueCount})
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No suppliers found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add wholesale suppliers to connect with Purchases and keep your payable ledger accurate.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Supplier</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Supplier & Company</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Total Purchases</th>
                  <th className="py-3.5 px-4 text-right">Total Paid</th>
                  <th className="py-3.5 px-4 text-right">Outstanding Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                {filteredSuppliers.map((sup) => {
                  const m = supplierMetricsMap.get(sup.id) || {
                    totalPurchasesAmount: 0,
                    totalPaid: 0,
                    outstandingDue: 0,
                    invoiceCount: 0,
                  };

                  const hasDue = m.outstandingDue > 0;

                  return (
                    <tr
                      key={sup.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#ff5c01] flex items-center justify-center font-black shrink-0">
                            {sup.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {sup.name}
                            </div>
                            {sup.company ? (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {sup.company}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400">Direct Vendor</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {sup.mobile || 'N/A'}
                          </div>
                          {sup.address && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {sup.address}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Purchases */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-slate-900 dark:text-white">
                          {symbol} {(m.totalPurchasesAmount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {m.invoiceCount} invoices
                        </div>
                      </td>

                      {/* Total Paid */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {symbol} {(m.totalPaid || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.round(((m.totalPaid || 0) / (m.totalPurchasesAmount || 1)) * 100)}% settled
                        </div>
                      </td>

                      {/* Outstanding Due */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-black text-sm ${
                            hasDue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {symbol} {(m.outstandingDue || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {hasDue ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Due Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details Ledger */}
                          <button
                            onClick={() => setSelectedSupplierForDetails(sup)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#ff5c01] hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="View Supplier Ledger & Statement"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Pay Due */}
                          {hasDue && (
                            <button
                              onClick={() => handleOpenPayModal(sup)}
                              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Record Payment for Outstanding Due"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay</span>
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(sup)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete supplier "${sup.name}"?`)) {
                                deleteSupplier(sup.id);
                              }
                            }}
                            className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSupplierForDetails && (
        <SupplierDetailsModal
          supplier={selectedSupplierForDetails}
          isOpen={Boolean(selectedSupplierForDetails)}
          onClose={() => setSelectedSupplierForDetails(null)}
          onRecordPayment={(sup) => {
            handleOpenPayModal(sup);
          }}
          onNewPurchase={(sup) => {
            setSelectedSupplierForDetails(null);
            if (onNavigateToPurchases) {
              onNavigateToPurchases(sup.id);
            }
          }}
        />
      )}

      {/* Pay Due Modal */}
      {isPayModalOpen && payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Pay Supplier Due
                  </h3>
                  <p className="text-[11px] text-slate-400">{payingSupplier.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              {/* Due Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Current Outstanding Due:
                </span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  {symbol}{' '}
                  {(
                    supplierMetricsMap.get(payingSupplier.id)?.outstandingDue ??
                    payingSupplier.dueAmount ??
                    0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount ({symbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  placeholder="Enter amount to pay"
                  className="w-full px-3.5 py-2.5 text-sm font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-white"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                >
                  <option value="Cash">Cash / নগদ</option>
                  <option value="bKash">bKash / বিকাশ</option>
                  <option value="Nagad">Nagad / নগদ (মোবাইল)</option>
                  <option value="Bank Transfer">Bank Transfer / ব্যাংক</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Cheque no, invoice ref, or note..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              {payError && (
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
                  {payError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#ff5c01]" />
                {editingSupplier ? 'Edit Supplier Details' : 'Add New Wholesale Supplier'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierFormData.name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                  placeholder="e.g. Rahim Wholesale Traders"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Enterprise Name
                </label>
                <input
                  type="text"
                  value={supplierFormData.company}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, company: e.target.value })}
                  placeholder="e.g. Meghna Group Distribution"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={supplierFormData.mobile}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, mobile: e.target.value })}
                  placeholder="e.g. 01712345678"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={supplierFormData.email}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                  placeholder="vendor@example.com"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warehouse / Office Address
                </label>
                <input
                  type="text"
                  value={supplierFormData.address}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                  placeholder="e.g. Khatungonj, Chittagong"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

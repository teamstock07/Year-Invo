import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Purchase, PurchaseItem, Supplier } from '../../types';
import { PurchaseInvoiceModal } from './PurchaseInvoiceModal';
import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  Truck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Trash2,
  DollarSign,
  Filter,
  UserPlus,
  Building2,
  Eye,
  ArrowUpDown,
  History,
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    addPurchase,
    products,
    suppliers,
    addSupplier,
    collectDuePayment,
    settings,
    language,
    t,
  } = useApp();

  const symbol = settings.currency || '৳';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPayDueModalOpen, setIsPayDueModalOpen] = useState(false);
  const [payDueSupplier, setPayDueSupplier] = useState<Supplier | null>(null);
  const [payDueAmount, setPayDueAmount] = useState<number>(0);
  const [payDueMethod, setPayDueMethod] = useState<'Cash' | 'Bank' | 'Mobile'>('Cash');
  const [payDueNote, setPayDueNote] = useState('');

  // New Purchase Form State
  const [newPurchaseSupplierId, setNewPurchaseSupplierId] = useState('');
  const [newPurchaseItems, setNewPurchaseItems] = useState<PurchaseItem[]>([]);
  const [newPurchasePaidAmount, setNewPurchasePaidAmount] = useState<number>(0);
  const [newPurchasePaymentMethod, setNewPurchasePaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile'>('Cash');
  const [newPurchaseDate, setNewPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPurchaseNote, setNewPurchaseNote] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [itemBuyingPrice, setItemBuyingPrice] = useState<number>(0);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnit, setItemUnit] = useState('pcs');

  // Quick Add Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCompany, setNewSupplierCompany] = useState('');
  const [newSupplierMobile, setNewSupplierMobile] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');

  // Calculations for Create Modal
  const purchaseSubtotal = useMemo(() => {
    return newPurchaseItems.reduce((sum, item) => sum + item.total, 0);
  }, [newPurchaseItems]);

  const calculatedDueAmount = Math.max(0, purchaseSubtotal - (newPurchasePaidAmount || 0));

  // Handle Adding Item to Draft Purchase
  const handleAddItemToDraft = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod) return;

    if (itemQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const price = itemBuyingPrice >= 0 ? itemBuyingPrice : prod.buyingPrice;
    const lineTotal = price * itemQuantity;

    const existingIdx = newPurchaseItems.findIndex((i) => i.productId === prod.id);
    if (existingIdx > -1) {
      const updated = [...newPurchaseItems];
      updated[existingIdx].quantity += itemQuantity;
      updated[existingIdx].buyingPrice = price;
      updated[existingIdx].total = updated[existingIdx].quantity * price;
      setNewPurchaseItems(updated);
    } else {
      setNewPurchaseItems([
        ...newPurchaseItems,
        {
          productId: prod.id,
          productName: prod.name,
          buyingPrice: price,
          quantity: itemQuantity,
          unit: itemUnit || prod.unit || 'pcs',
          total: lineTotal,
        },
      ]);
    }

    // Reset draft item inputs
    setSelectedProductToAdd('');
    setItemQuantity(1);
    setItemBuyingPrice(0);
  };

  const handleRemoveDraftItem = (index: number) => {
    setNewPurchaseItems(newPurchaseItems.filter((_, idx) => idx !== index));
  };

  // Submit New Purchase
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchaseSupplierId) {
      alert('Please select a supplier');
      return;
    }
    if (newPurchaseItems.length === 0) {
      alert('Please add at least one product item to the purchase');
      return;
    }

    const targetSupplier = suppliers.find((s) => s.id === newPurchaseSupplierId);
    const supplierName = targetSupplier ? targetSupplier.name : 'Unknown Supplier';

    try {
      const purchase = await addPurchase({
        supplierId: newPurchaseSupplierId,
        supplierName,
        items: newPurchaseItems,
        totalAmount: purchaseSubtotal,
        paidAmount: Number(newPurchasePaidAmount) || 0,
        dueAmount: calculatedDueAmount,
        paymentMethod: newPurchasePaymentMethod,
        date: new Date(newPurchaseDate).toISOString(),
        note: newPurchaseNote,
      });

      // Reset state and close
      setIsCreateModalOpen(false);
      setNewPurchaseSupplierId('');
      setNewPurchaseItems([]);
      setNewPurchasePaidAmount(0);
      setNewPurchaseNote('');
      setSelectedInvoice(purchase);
    } catch (err: any) {
      console.error('Failed to create purchase:', err);
      alert(`Error saving purchase: ${err?.message || 'Something went wrong'}`);
    }
  };

  // Quick Add Supplier
  const handleQuickAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim() || !newSupplierMobile.trim()) {
      alert('Name and Mobile number are required');
      return;
    }

    try {
      const created = await addSupplier({
        name: newSupplierName.trim(),
        company: newSupplierCompany.trim() || 'General Supplier',
        mobile: newSupplierMobile.trim(),
        address: newSupplierAddress.trim(),
      });

      setNewPurchaseSupplierId(created.id);
      setIsAddSupplierModalOpen(false);
      setNewSupplierName('');
      setNewSupplierCompany('');
      setNewSupplierMobile('');
      setNewSupplierAddress('');
    } catch (err: any) {
      alert('Failed to add supplier');
    }
  };

  // Settle Supplier Due
  const handlePaySupplierDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDueSupplier || payDueAmount <= 0) return;

    try {
      await collectDuePayment({
        type: 'supplier',
        entityId: payDueSupplier.id,
        entityName: payDueSupplier.name,
        amountPaid: payDueAmount,
        paymentMethod: payDueMethod,
        note: payDueNote || `Payment against outstanding purchases`,
      });

      setIsPayDueModalOpen(false);
      setPayDueSupplier(null);
      setPayDueAmount(0);
      setPayDueNote('');
    } catch (err: any) {
      alert('Failed to record supplier payment');
    }
  };

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return purchases.filter((p) => {
      // Search
      const matchesSearch =
        p.purchaseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      let matchesStatus = true;
      if (statusFilter === 'paid') matchesStatus = p.dueAmount === 0;
      if (statusFilter === 'due') matchesStatus = p.dueAmount > 0;

      // Supplier
      let matchesSupplier = true;
      if (supplierFilter !== 'all') matchesSupplier = p.supplierId === supplierFilter;

      // Date
      let matchesDate = true;
      const pDate = p.date.split('T')[0];
      if (dateFilter === 'today') matchesDate = pDate === todayStr;
      if (dateFilter === 'week') {
        const diff = (now.getTime() - new Date(p.date).getTime()) / (1000 * 3600 * 24);
        matchesDate = diff <= 7;
      }
      if (dateFilter === 'month') matchesDate = pDate.startsWith(todayStr.substring(0, 7));

      return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
    });
  }, [purchases, searchQuery, statusFilter, supplierFilter, dateFilter]);

  // Overall Metrics
  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  const totalPurchasesPaid = purchases.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);
  const totalPurchasesDue = suppliers.reduce((acc, s) => acc + (Number(s.dueAmount) || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPurchases = purchases.filter((p) => p.date.startsWith(todayStr));
  const todayPurchasesTotal = todayPurchases.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ['Purchase No', 'Date', 'Supplier', 'Items Count', 'Total Amount', 'Paid Amount', 'Due Amount', 'Payment Method', 'Notes'],
      ...filteredPurchases.map((p) => [
        p.purchaseNo,
        new Date(p.date).toLocaleDateString(),
        `"${p.supplierName}"`,
        p.items.length,
        p.totalAmount,
        p.paidAmount,
        p.dueAmount,
        p.paymentMethod,
        `"${p.note || ''}"`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `purchases-report-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {language === 'bn' ? 'সাপ্লায়ার পারচেজ ও ক্রয় হিসাব' : 'Supplier Purchases'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log supplier purchase orders, manage buying prices, print invoices, and track vendor dues & history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন পারচেজ এন্ট্রি' : '+ New Purchase'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'মোট ক্রয় ভলিউম' : 'Total Purchases'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {symbol} {(totalPurchasesAmount || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{purchases.length} invoices recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'সাপ্লায়ার পরিশোধিত' : 'Total Paid'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {symbol} {(totalPurchasesPaid || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Cleared vendor payments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'সাপ্লায়ার বাকি বকেয়া' : 'Supplier Due (Payable)'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">
            {symbol} {(totalPurchasesDue || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Outstanding balance to suppliers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'আজকের নতুন ক্রয়' : "Today's Purchases"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {symbol} {(todayPurchasesTotal || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{todayPurchases.length} invoices today</span>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'ইনভয়েস #, সাপ্লায়ার বা পণ্যের নাম দিয়ে খুঁজুন...' : 'Search invoice #, supplier, or product...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Supplier Selector */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.company})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid in Full</option>
            <option value="due">Due / Unpaid</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Purchases History Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
            <tr>
              <th className="p-3.5">Invoice # / Date</th>
              <th className="p-3.5">Supplier Details</th>
              <th className="p-3.5">Items Purchased</th>
              <th className="p-3.5 text-right">Total Amount</th>
              <th className="p-3.5 text-right">Paid</th>
              <th className="p-3.5 text-right">Supplier Due</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                  <p className="font-semibold">No purchase records found.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "+ New Purchase" above to record your first supplier purchase.</p>
                </td>
              </tr>
            ) : (
              filteredPurchases.map((purchase) => {
                const supp = suppliers.find((s) => s.id === purchase.supplierId);

                return (
                  <tr key={purchase.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                        {purchase.purchaseNo}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(purchase.date).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{purchase.supplierName}</span>
                      </div>
                      {supp?.company && (
                        <span className="text-[10px] text-slate-400 block pl-5">{supp.company}</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {purchase.items.length} items
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                        {purchase.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-black text-slate-800 dark:text-slate-100 font-mono text-sm">
                      {symbol} {(purchase.totalAmount || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {symbol} {(purchase.paidAmount || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-bold font-mono">
                      {purchase.dueAmount > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-black">
                          {symbol} {(purchase.dueAmount || 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {purchase.dueAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase">
                          Due Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase">
                          Paid
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(purchase)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-1"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>

                        {purchase.dueAmount > 0 && supp && (
                          <button
                            onClick={() => {
                              setPayDueSupplier(supp);
                              setPayDueAmount(supp.dueAmount);
                              setIsPayDueModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all"
                            title="Pay Supplier Due"
                          >
                            Pay Due
                          </button>
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

      {/* Modal 1: Create New Purchase */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Record New Supplier Purchase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add purchased products to restock inventory and log supplier payment / credit invoice.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePurchase} className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Supplier Selection + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Supplier / Vendor <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddSupplierModalOpen(true)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      + Add New Supplier
                    </button>
                  </div>
                  <select
                    value={newPurchaseSupplierId}
                    onChange={(e) => setNewPurchaseSupplierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company}) {s.dueAmount > 0 ? `[Current Due: ${symbol}${s.dueAmount}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Purchase Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Items Entry Builder */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px] block">
                  Add Products to Purchase Invoice
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Select Product */}
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Select Product</label>
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => {
                        setSelectedProductToAdd(e.target.value);
                        const prod = products.find((p) => p.id === e.target.value);
                        if (prod) {
                          setItemBuyingPrice(prod.buyingPrice || 0);
                          setItemUnit(prod.unit || 'pcs');
                        }
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-xs"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Cur Stock: {p.currentStock} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buying Price */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Purchase Price ({symbol})</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={itemBuyingPrice}
                      onChange={(e) => setItemBuyingPrice(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-center"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToDraft}
                      disabled={!selectedProductToAdd}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Items List Table */}
                {newPurchaseItems.length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Buying Price</th>
                          <th className="p-2.5 text-right">Line Total</th>
                          <th className="p-2.5 text-center">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {newPurchaseItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{item.productName}</td>
                            <td className="p-2.5 text-center font-semibold">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-2.5 text-right font-mono">
                              {symbol} {(item.buyingPrice || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-100 font-mono">
                              {symbol} {(item.total || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment Breakdown & Settlement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={newPurchasePaymentMethod}
                    onChange={(e) => setNewPurchasePaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Mobile">bKash / Nagad / Mobile</option>
                  </select>

                  <div className="mt-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Purchase Notes / Reference
                    </label>
                    <textarea
                      value={newPurchaseNote}
                      onChange={(e) => setNewPurchaseNote(e.target.value)}
                      placeholder="e.g. Challan #9872, Batch restock"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Total Purchase:</span>
                    <span className="font-black text-slate-800 dark:text-slate-100 text-base">
                      {symbol} {(purchaseSubtotal || 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Paid to Supplier ({symbol})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={purchaseSubtotal}
                        step="any"
                        value={newPurchasePaidAmount || ''}
                        onChange={(e) => setNewPurchasePaidAmount(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setNewPurchasePaidAmount(purchaseSubtotal)}
                        className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold shrink-0"
                      >
                        Full Paid
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Supplier Due Balance:</span>
                    <span className={`font-black text-base ${calculatedDueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                      {symbol} {(calculatedDueAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPurchaseItems.length === 0 || !newPurchaseSupplierId}
                  className="px-5 py-2.5 rounded-xl font-black bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Purchase & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Add Supplier */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Add New Supplier
              </h4>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="e.g. Rahim Traders"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={newSupplierCompany}
                  onChange={(e) => setNewSupplierCompany(e.target.value)}
                  placeholder="e.g. ABC Wholesale Ltd."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mobile / Contact <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSupplierMobile}
                  onChange={(e) => setNewSupplierMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Address</label>
                <input
                  type="text"
                  value={newSupplierAddress}
                  onChange={(e) => setNewSupplierAddress(e.target.value)}
                  placeholder="e.g. Chawkbazar, Dhaka"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Pay Supplier Due Modal */}
      {isPayDueModalOpen && payDueSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Pay Supplier Due
              </h4>
              <button onClick={() => setIsPayDueModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-black text-slate-800 dark:text-slate-100">{payDueSupplier.name}</p>
              <p className="text-slate-500">{payDueSupplier.company}</p>
              <p className="text-rose-600 dark:text-rose-400 font-extrabold pt-1">
                Outstanding Due Balance: {symbol} {(payDueSupplier.dueAmount || 0).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handlePaySupplierDue} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Amount ({symbol}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={payDueSupplier.dueAmount}
                  step="any"
                  required
                  value={payDueAmount}
                  onChange={(e) => setPayDueAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={payDueMethod}
                  onChange={(e) => setPayDueMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Mobile">bKash / Nagad / Mobile</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Note</label>
                <input
                  type="text"
                  value={payDueNote}
                  onChange={(e) => setPayDueNote(e.target.value)}
                  placeholder="e.g. Paid via Cheque #4421"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayDueModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Invoice Modal */}
      {selectedInvoice && (
        <PurchaseInvoiceModal purchase={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

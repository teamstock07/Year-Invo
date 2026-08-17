import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockAdjustment } from '../../types';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  ArrowRightLeft,
  DollarSign,
  PackageX,
  FileSpreadsheet,
  Download,
  History,
  ShieldAlert,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export const StockManagement: React.FC = () => {
  const {
    products,
    updateProduct,
    adjustments,
    adjustStock,
    sales,
    purchases,
    settings,
    language,
    setActiveTab,
    t,
  } = useApp();

  const symbol = settings.currency || '৳';

  // Sub-tabs: 'current' | 'adjustments' | 'lowstock' | 'damaged' | 'movement'
  const [subTab, setSubTab] = useState<'current' | 'adjustments' | 'lowstock' | 'damaged' | 'movement'>('current');

  // Search & Filters for Current Stock
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'instock' | 'low' | 'out'>('all');

  // Modal 1: Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustType, setAdjustType] = useState<'addition' | 'reduction' | 'audit_correction'>('audit_correction');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState('');

  // Modal 2: Damaged / Expired Write-off Modal
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damageProductId, setDamageProductId] = useState('');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [damageReason, setDamageReason] = useState('Broken / Damaged in Storage');

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Filtered Products for Current Stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'instock') matchesStatus = p.currentStock > p.minStockAlert;
      if (statusFilter === 'low') matchesStatus = p.currentStock <= p.minStockAlert && p.currentStock > 0;
      if (statusFilter === 'out') matchesStatus = p.currentStock === 0;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.currentStock <= p.minStockAlert);
  }, [products]);

  // Expired or near-expiry products
  const now = new Date();
  const expiredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.expiryDate) return false;
      const exp = new Date(p.expiryDate);
      return exp < now && p.currentStock > 0;
    });
  }, [products, now]);

  // Damaged write-off history
  const damagedAdjustments = useMemo(() => {
    return adjustments.filter((a) => a.type === 'damage_writeoff');
  }, [adjustments]);

  // Stock Movement Log (Aggregated from Sales, Purchases, Adjustments)
  const stockMovements = useMemo(() => {
    interface MovementItem {
      id: string;
      date: string;
      productName: string;
      type: 'Sale' | 'Purchase Restock' | 'Adjustment Addition' | 'Adjustment Reduction' | 'Damage Write-off' | 'Audit Correction';
      quantityDelta: number;
      reference: string;
      reason: string;
    }

    const items: MovementItem[] = [];

    // Adjustments
    adjustments.forEach((adj) => {
      let mType: MovementItem['type'] = 'Adjustment Addition';
      if (adj.type === 'damage_writeoff') mType = 'Damage Write-off';
      else if (adj.type === 'reduction') mType = 'Adjustment Reduction';
      else if (adj.type === 'audit_correction') mType = 'Audit Correction';

      items.push({
        id: adj.id,
        date: adj.date,
        productName: adj.productName,
        type: mType,
        quantityDelta: adj.quantity,
        reference: `ADJ-${adj.id.slice(-6)}`,
        reason: `${adj.reason} (By: ${adj.adjustedBy || 'Admin'})`,
      });
    });

    // Purchases
    purchases.forEach((pur) => {
      pur.items.forEach((pItem, idx) => {
        items.push({
          id: `${pur.id}-${idx}`,
          date: pur.date.split('T')[0],
          productName: pItem.productName,
          type: 'Purchase Restock',
          quantityDelta: pItem.quantity,
          reference: pur.purchaseNo,
          reason: `Supplier: ${pur.supplierName}`,
        });
      });
    });

    // Recent Sales
    sales.slice(0, 100).forEach((sale) => {
      sale.items.forEach((sItem, idx) => {
        items.push({
          id: `${sale.id}-${idx}`,
          date: sale.date.split('T')[0],
          productName: sItem.name,
          type: 'Sale',
          quantityDelta: -sItem.quantity,
          reference: sale.receiptNo,
          reason: `Customer Sale (${sale.paymentMethod})`,
        });
      });
    });

    // Sort by Date descending
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [adjustments, purchases, sales]);

  // Overall Inventory Stats
  const totalStockQuantity = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.currentStock * p.buyingPrice, 0);
  const totalSellingValuation = products.reduce((acc, p) => acc + p.currentStock * p.price, 0);
  const totalDamagedLoss = damagedAdjustments.reduce((acc, a) => {
    const prod = products.find((p) => p.id === a.productId);
    const cost = prod?.buyingPrice || 0;
    return acc + Math.abs(a.quantity) * cost;
  }, 0);

  // Handle Manual Stock Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || adjustQty === 0) return;

    const prod = products.find((p) => p.id === adjustProductId);
    if (!prod) return;

    let delta = adjustQty;
    if (adjustType === 'reduction') {
      delta = -Math.abs(adjustQty);
    } else if (adjustType === 'addition') {
      delta = Math.abs(adjustQty);
    } else if (adjustType === 'audit_correction') {
      // Direct count set to adjustQty
      delta = adjustQty - prod.currentStock;
    }

    try {
      await adjustStock(
        prod.id,
        delta,
        adjustReason || (adjustType === 'audit_correction' ? 'Physical stock inventory audit' : 'Manual stock adjustment'),
        adjustType
      );

      setIsAdjustModalOpen(false);
      setAdjustProductId('');
      setAdjustQty(1);
      setAdjustReason('');
    } catch (err: any) {
      alert(`Adjustment failed: ${err?.message || 'Error occurred'}`);
    }
  };

  // Handle Damaged Stock Write-off
  const handleSaveDamageWriteoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageProductId || damageQty <= 0) return;

    const prod = products.find((p) => p.id === damageProductId);
    if (!prod) return;

    if (damageQty > prod.currentStock) {
      alert(`Damaged quantity (${damageQty}) cannot exceed current stock (${prod.currentStock})`);
      return;
    }

    try {
      await adjustStock(
        prod.id,
        -damageQty,
        damageReason || 'Damaged / Expired stock write-off',
        'damage_writeoff'
      );

      setIsDamageModalOpen(false);
      setDamageProductId('');
      setDamageQty(1);
      setDamageReason('Broken / Damaged in Storage');
    } catch (err: any) {
      alert(`Damage write-off failed: ${err?.message || 'Error occurred'}`);
    }
  };

  // Export Inventory CSV
  const handleExportStockCSV = () => {
    const rows = [
      ['Product Name', 'SKU', 'Category', 'Unit', 'Current Stock', 'Min Alert', 'Buying Price', 'Selling Price', 'Cost Valuation', 'Potential Value', 'Expiry Date'],
      ...products.map((p) => [
        `"${p.name}"`,
        `"${p.sku}"`,
        `"${p.category}"`,
        p.unit || 'pcs',
        p.currentStock,
        p.minStockAlert,
        p.buyingPrice,
        p.price,
        p.currentStock * p.buyingPrice,
        p.currentStock * p.price,
        p.expiryDate || 'N/A',
      ]),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-stock-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Boxes className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {language === 'bn' ? 'স্টক ও ইনভেন্টরি ম্যানেজমেন্ট' : 'Stock Management'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock audit, inventory adjustments, low-stock thresholds, damaged write-offs, and stock movement logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportStockCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Download Inventory CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsDamageModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <PackageX className="w-4 h-4" />
            <span>{language === 'bn' ? 'নষ্ট/ক্ষতিগ্রস্ত পণ্য' : 'Damage Write-off'}</span>
          </button>
          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{language === 'bn' ? '+ স্টক সমন্বয়' : '+ Adjust Stock'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'মোট মজুত পরিমাণ' : 'Total Stock Qty'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {(totalStockQuantity || 0).toLocaleString()} <span className="text-xs text-slate-400 font-semibold">units</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{products.length} unique products</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'ইনভেন্টরি কেনা মূল্য' : 'Inventory Cost Value'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {symbol} {(totalCostValuation || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">
            Selling Val: {symbol} {(totalSellingValuation || 0).toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'লো স্টক অ্যালার্ট' : 'Low Stock Alerts'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-xl font-black ${lowStockProducts.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {lowStockProducts.length} <span className="text-xs text-slate-400 font-semibold">items</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Below minimum threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'ক্ষতিগ্রস্ত/নষ্ট রাইট-অফ' : 'Damaged Losses'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <PackageX className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">
            {symbol} {(totalDamagedLoss || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{damagedAdjustments.length} write-off incidents</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-x-auto">
        {[
          { id: 'current', label: language === 'bn' ? 'বর্তমান মজুত স্টক' : 'Current Stock', icon: Boxes },
          { id: 'adjustments', label: language === 'bn' ? 'স্টক সমন্বয় লগ' : 'Stock Adjustments', count: adjustments.length, icon: SlidersHorizontal },
          { id: 'lowstock', label: language === 'bn' ? 'লো স্টক অ্যালার্ট' : 'Low Stock Alerts', count: lowStockProducts.length, alert: lowStockProducts.length > 0, icon: AlertTriangle },
          { id: 'damaged', label: language === 'bn' ? 'ক্ষতিগ্রস্ত ও নষ্ট' : 'Damaged / Expired', count: damagedAdjustments.length + expiredProducts.length, icon: PackageX },
          { id: 'movement', label: language === 'bn' ? 'স্টক মুভমেন্ট হিস্ট্রি' : 'Stock Movement Log', icon: ArrowRightLeft },
        ].map((tItem) => {
          const Icon = tItem.icon;
          const isActive = subTab === tItem.id;

          return (
            <button
              key={tItem.id}
              onClick={() => setSubTab(tItem.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tItem.label}</span>
              {typeof tItem.count === 'number' && tItem.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    tItem.alert
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tItem.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Current Stock */}
      {subTab === 'current' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden"
              >
                <option value="all">All Stock Status</option>
                <option value="instock">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Current Stock Table */}
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Stock Level</th>
                  <th className="p-3.5 text-center">Min Alert</th>
                  <th className="p-3.5 text-right">Cost Price</th>
                  <th className="p-3.5 text-right">Selling Price</th>
                  <th className="p-3.5 text-right">Cost Value</th>
                  <th className="p-3.5 text-center">Stock Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      No products match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                            p.currentStock === 0
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : p.currentStock <= p.minStockAlert
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {p.currentStock} {p.unit || 'pcs'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-500 font-mono">
                        {p.minStockAlert} {p.unit || 'pcs'}
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                        {symbol} {(p.buyingPrice || 0).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-800 dark:text-slate-100 font-bold">
                        {symbol} {(p.price || 0).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {symbol} {((p.currentStock || 0) * (p.buyingPrice || 0)).toLocaleString()}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setAdjustProductId(p.id);
                            setAdjustType('audit_correction');
                            setAdjustQty(p.currentStock);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Stock Adjustments History */}
      {subTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Adjustment Type</th>
                  <th className="p-3.5 text-center">Change Qty</th>
                  <th className="p-3.5">Reason / Note</th>
                  <th className="p-3.5">Adjusted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                      <p className="font-semibold">No stock adjustments logged yet.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Use the "+ Adjust Stock" button to record physical counts or corrections.</p>
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-500">{adj.date}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{adj.productName}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            adj.type === 'addition'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : adj.type === 'damage_writeoff'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : adj.type === 'audit_correction'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {adj.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-sm">
                        <span className={adj.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {adj.quantity >= 0 ? `+${adj.quantity}` : adj.quantity}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{adj.reason}</td>
                      <td className="p-3.5 text-slate-500 font-semibold">{adj.adjustedBy || 'Admin'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Low Stock Alerts */}
      {subTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5 text-center">Current Stock</th>
                  <th className="p-3.5 text-center">Threshold Alert</th>
                  <th className="p-3.5 text-center">Deficit</th>
                  <th className="p-3.5 text-right">Est. Restock Cost</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      <p className="font-bold">All products are healthy & above minimum stock levels!</p>
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p) => {
                    const deficit = Math.max(0, p.minStockAlert - p.currentStock + 10);
                    const restockCost = deficit * p.buyingPrice;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-black text-xs">
                            {p.currentStock} {p.unit || 'pcs'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-500 font-mono">
                          {p.minStockAlert} {p.unit || 'pcs'}
                        </td>
                        <td className="p-3.5 text-center font-bold text-amber-600 font-mono">
                          +{deficit} {p.unit || 'pcs'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {symbol} {(restockCost || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setActiveTab('smart-reorder')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Smart Reorder
                          </button>
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

      {/* VIEW 4: Damaged / Expired Stock */}
      {subTab === 'damaged' && (
        <div className="space-y-6">
          {/* Expired Stock Alert Box */}
          {expiredProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-rose-700 dark:text-rose-400">
                    {expiredProducts.length} Expired Products Detected
                  </h4>
                  <p className="text-xs text-rose-600/80">
                    Items that passed expiration date should be quarantined and written off from inventory.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('expired')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700"
              >
                Manage Expired
              </button>
            </div>
          )}

          {/* Damaged Write-off Ledger */}
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
                Damaged & Spoiled Stock Write-Off Log
              </h3>
              <button
                onClick={() => setIsDamageModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Damaged Stock
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5 text-center">Written-off Qty</th>
                  <th className="p-3.5">Damage Reason</th>
                  <th className="p-3.5 text-right">Financial Loss</th>
                  <th className="p-3.5">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {damagedAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No damaged or spoiled stock written off.
                    </td>
                  </tr>
                ) : (
                  damagedAdjustments.map((dam) => {
                    const prod = products.find((p) => p.id === dam.productId);
                    const loss = Math.abs(dam.quantity) * (prod?.buyingPrice || 0);

                    return (
                      <tr key={dam.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-500">{dam.date}</td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{dam.productName}</td>
                        <td className="p-3.5 text-center font-bold text-rose-600 font-mono">
                          {Math.abs(dam.quantity)} units
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{dam.reason}</td>
                        <td className="p-3.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                          {symbol} {(loss || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-slate-500 font-semibold">{dam.adjustedBy || 'Admin'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: Stock Movement Log */}
      {subTab === 'movement' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Movement Type</th>
                  <th className="p-3.5 text-center">Stock Delta</th>
                  <th className="p-3.5">Reference #</th>
                  <th className="p-3.5">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No stock movement history recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockMovements.slice(0, 150).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono text-slate-500">{m.date}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{m.productName}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            m.type === 'Purchase Restock' || m.type === 'Adjustment Addition'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : m.type === 'Sale'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-sm">
                        <span className={m.quantityDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 font-bold">{m.reference}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{m.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Manual Stock Adjustment */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                Adjust Stock Level
              </h4>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Product <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={adjustProductId}
                  onChange={(e) => {
                    setAdjustProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && adjustType === 'audit_correction') {
                      setAdjustQty(prod.currentStock);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setAdjustType(newType);
                    const prod = products.find((p) => p.id === adjustProductId);
                    if (prod && newType === 'audit_correction') {
                      setAdjustQty(prod.currentStock);
                    } else if (newType !== 'audit_correction') {
                      setAdjustQty(1);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="audit_correction">Audit Correction (Set exact physical count)</option>
                  <option value="addition">Addition (+ Increase quantity)</option>
                  <option value="reduction">Reduction (- Decrease quantity)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {adjustType === 'audit_correction' ? 'Exact Physical Count Quantity' : 'Quantity Delta to Adjust'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Month-end inventory audit count"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Damaged / Expired Write-Off */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PackageX className="w-5 h-5 text-rose-600" />
                Write-off Damaged Stock
              </h4>
              <button onClick={() => setIsDamageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDamageWriteoff} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Product <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={damageProductId}
                  onChange={(e) => setDamageProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Damaged / Expired Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={damageQty}
                  onChange={(e) => setDamageQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-rose-600 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Damage</label>
                <select
                  value={damageReason}
                  onChange={(e) => setDamageReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Broken / Damaged in Storage">Broken / Damaged in Storage</option>
                  <option value="Expired Product Write-off">Expired Product Write-off</option>
                  <option value="Water / Moisture Damage">Water / Moisture Damage</option>
                  <option value="Lost in Transit / Shrinkage">Lost in Transit / Shrinkage</option>
                  <option value="Quality Inspection Rejection">Quality Inspection Rejection</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDamageModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Confirm Write-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

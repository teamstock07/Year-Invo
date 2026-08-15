import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, SmartReorderItem } from '../../types';
import {
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Package,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Plus,
  Truck,
  Sparkles,
  Layers,
} from 'lucide-react';

export const SmartReorderView: React.FC = () => {
  const { products, sales, suppliers, addPurchase, setActiveTab, formatMoney, formatCurrency, displayCurrency, language } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate sales velocity and recommended reorders
  const reorderItems: SmartReorderItem[] = useMemo(() => {
    // 30 days ago timestamp
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Map sales counts per product in past 30 days
    const productSalesCountMap: Record<string, number> = {};
    sales.forEach((s) => {
      const saleDate = new Date(s.date);
      if (saleDate >= thirtyDaysAgo) {
        s.items.forEach((item) => {
          productSalesCountMap[item.productId] = (productSalesCountMap[item.productId] || 0) + item.quantity;
        });
      }
    });

    const list: SmartReorderItem[] = [];

    products.forEach((p) => {
      const monthlySales = productSalesCountMap[p.id] || 0;
      const threshold = p.minStockAlert || 5;
      const currentStock = p.currentStock;

      // Condition: Stock is 0 OR stock is at or below threshold * 1.5
      const isReorderNeeded = currentStock <= 0 || currentStock <= threshold * 1.5;

      if (isReorderNeeded) {
        // Recommended Order Quantity Formula = (30 Day Sales) + (minStockAlert * 2) - currentStock
        const baseBuffer = threshold * 2;
        const projectedDemand = Math.max(monthlySales, 5);
        const calculatedQty = Math.max(1, projectedDemand + baseBuffer - currentStock);

        let urgency: 'critical' | 'high' | 'normal' = 'normal';
        if (currentStock <= 0) {
          urgency = 'critical';
        } else if (currentStock <= threshold) {
          urgency = 'high';
        }

        list.push({
          productId: p.id,
          productName: p.name,
          category: p.category,
          currentStock,
          minStockAlert: threshold,
          monthlySalesVelocity: monthlySales,
          recommendedReorderQty: calculatedQty,
          supplierName: p.supplier || 'Primary Vendor',
          buyingPrice: p.buyingPrice,
          estimatedCost: calculatedQty * p.buyingPrice,
          urgency,
        });
      }
    });

    // Sort: critical first, then high, then normal
    return list.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, normal: 1 };
      return priorityOrder[b.urgency] - priorityOrder[a.urgency];
    });
  }, [products, sales]);

  // Filtered List
  const filteredItems = reorderItems.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  // Aggregate metrics
  const totalReorderItems = reorderItems.length;
  const criticalItemsCount = reorderItems.filter((i) => i.urgency === 'critical').length;
  const highItemsCount = reorderItems.filter((i) => i.urgency === 'high').length;
  const totalEstimatedCost = reorderItems.reduce((sum, i) => sum + i.estimatedCost, 0);

  // Quick Purchase generation
  const handleQuickReorder = (item: SmartReorderItem) => {
    const matchingSupplier = suppliers.find((s) => s.name === item.supplierName) || suppliers[0];

    addPurchase({
      supplierId: matchingSupplier?.id || '',
      supplierName: matchingSupplier?.name || item.supplierName || 'General Supplier',
      invoiceNo: `PO-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          quantity: item.recommendedReorderQty,
          buyingPrice: item.buyingPrice,
          total: item.estimatedCost,
        },
      ],
      totalAmount: item.estimatedCost,
      paidAmount: item.estimatedCost,
      dueAmount: 0,
      paymentMethod: 'Cash',
      notes: `Smart Reorder PO: Replenishment for ${item.productName}`,
    });

    alert(`Purchase order created successfully for ${item.recommendedReorderQty} units of "${item.productName}"! Stock will be updated.`);
  };

  // Reorder All Critical Items in One Click
  const handleReorderAllCritical = () => {
    const criticalList = reorderItems.filter((i) => i.urgency === 'critical');
    if (criticalList.length === 0) {
      alert('No critical out-of-stock items found.');
      return;
    }

    if (
      confirm(
        `Create bulk purchase orders for ${criticalList.length} critical items (Total: ${formatMoney(
          criticalList.reduce((s, i) => s + i.estimatedCost, 0)
        )})?`
      )
    ) {
      criticalList.forEach((item) => {
        handleQuickReorder(item);
      });
      setActiveTab('purchases');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Inventory Intelligence</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <span>Smart Reorder System</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Automatic inventory replenishment advisor based on real-time stock levels, minimum thresholds, and 30-day sales velocity.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleReorderAllCritical}
              disabled={criticalItemsCount === 0}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Reorder All Out of Stock ({criticalItemsCount})</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-400">Items Needing Reorder</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalReorderItems}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-rose-400">Out of Stock (Critical)</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{criticalItemsCount}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-amber-400">Low Stock (High Urgency)</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{highItemsCount}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Est. Restock Budget</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {formatMoney(totalEstimatedCost)}
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
            placeholder="Search items for replenishment..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical (0 Stock)</option>
            <option value="high">High (Low Stock)</option>
            <option value="normal">Normal (Approaching)</option>
          </select>
        </div>
      </div>

      {/* Reorder Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Product Name & Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4">30-Day Sales</th>
                <th className="py-3 px-4">Recommended Reorder</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {item.category} • Supplier: {item.supplierName}
                      </p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-sm font-bold ${
                        item.currentStock <= 0 ? 'text-rose-400 font-black' : 'text-amber-400'
                      }`}
                    >
                      {item.currentStock} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{item.minStockAlert} units</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white">{item.monthlySalesVelocity} sold</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-sm">
                      +{item.recommendedReorderQty} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {formatMoney(item.estimatedCost)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.urgency === 'critical'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : item.urgency === 'high'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleQuickReorder(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05200] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">All Stock Levels Optimal</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No products currently require reordering. Your inventory is healthy and well-stocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

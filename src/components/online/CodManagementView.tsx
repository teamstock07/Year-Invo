import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineOrder } from '../../types';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Truck,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  Check,
  X,
} from 'lucide-react';

export const CodManagementView: React.FC = () => {
  const {
    onlineOrders,
    recordCodCollection,
    formatCurrency,
    formatDate,
    settings,
    t,
  } = useApp();

  const [filterState, setFilterState] = useState<'All' | 'Pending' | 'Collected'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderToCollect, setSelectedOrderToCollect] = useState<OnlineOrder | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number>(0);
  const [courierNote, setCourierNote] = useState('');

  // COD orders list
  const codOrders = useMemo(() => {
    const list = onlineOrders || [];
    return list.filter((o) => o.paymentMethod === 'COD');
  }, [onlineOrders]);

  const summary = useMemo(() => {
    let pendingAmount = 0;
    let collectedAmount = 0;
    let pendingCount = 0;
    let collectedCount = 0;

    codOrders.forEach((o) => {
      if (o.codCollected || o.paymentStatus === 'Paid') {
        collectedAmount += o.grandTotal;
        collectedCount++;
      } else {
        pendingAmount += o.grandTotal;
        pendingCount++;
      }
    });

    return {
      pendingAmount,
      collectedAmount,
      pendingCount,
      collectedCount,
      totalCodAmount: pendingAmount + collectedAmount,
    };
  }, [codOrders]);

  const filteredOrders = useMemo(() => {
    return codOrders.filter((o) => {
      const isCollected = o.codCollected || o.paymentStatus === 'Paid';
      if (filterState === 'Pending' && isCollected) return false;
      if (filterState === 'Collected' && !isCollected) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          o.orderNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.courierName && o.courierName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [codOrders, filterState, searchTerm]);

  const handleOpenCollectModal = (order: OnlineOrder) => {
    setSelectedOrderToCollect(order);
    setCollectionAmount(order.grandTotal);
    setCourierNote('');
  };

  const handleConfirmCollection = async () => {
    if (!selectedOrderToCollect) return;
    await recordCodCollection(
      selectedOrderToCollect.id,
      collectionAmount,
      courierNote.trim() || undefined
    );
    setSelectedOrderToCollect(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Cash On Delivery (COD) Management</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track courier cash collections, pending remittances, and settlement records.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending COD Collections
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.pendingAmount)}
          </div>
          <span className="text-xs text-slate-400">
            {summary.pendingCount} orders awaiting courier remittance
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Settled / Received COD
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.collectedAmount)}
          </div>
          <span className="text-xs text-slate-400">
            {summary.collectedCount} orders paid & settled
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total COD Volume
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(summary.totalCodAmount)}
          </div>
          <span className="text-xs text-slate-400">
            {codOrders.length} lifetime COD orders
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['Pending', 'Collected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterState(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filterState === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab === 'Pending' ? 'Pending Remittance' : tab === 'Collected' ? 'Collected / Settled' : 'All COD Orders'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, courier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No COD orders found for this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Courier & Tracking</th>
                  <th className="px-4 py-3.5">COD Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredOrders.map((order) => {
                  const isSettled = order.codCollected || order.paymentStatus === 'Paid';
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          #{order.orderNo}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          🚚 {order.courierName || 'In-House'}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-[11px] font-mono text-slate-400">
                            {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(order.grandTotal)}
                      </td>

                      <td className="px-4 py-3.5">
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <Check className="w-3 h-3" />
                            <span>Collected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {!isSettled ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCollectModal(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Collected</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">
                            ✓ Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Modal */}
      {selectedOrderToCollect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Record Courier COD Remittance
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderToCollect(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order:</span>
                  <span className="font-bold text-indigo-600">#{selectedOrderToCollect.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{selectedOrderToCollect.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier:</span>
                  <span className="font-semibold">{selectedOrderToCollect.courierName || 'In-House'}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collected Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Courier Remittance Note / Bank Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Batch #4982"
                  value={courierNote}
                  onChange={(e) => setCourierNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderToCollect(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCollection}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

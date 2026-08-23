import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineOrder, OnlineOrderStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  RotateCcw,
  ArrowRight,
  MoreVertical,
  User,
  Phone,
  MapPin,
  Eye,
  FileText,
} from 'lucide-react';

export const OnlineOrderStatusView: React.FC = () => {
  const {
    onlineOrders,
    updateOnlineOrderStatus,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const [activeQuickOrder, setActiveQuickOrder] = useState<OnlineOrder | null>(null);

  const columns: { status: OnlineOrderStatus; label: string; icon: any; color: string; bg: string }[] = [
    { status: 'Pending', label: t('pendingApproval') || 'Pending Approval', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
    { status: 'Confirmed', label: t('confirmedApproved') || 'Confirmed / Approved', icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
    { status: 'Processing', label: t('packagingProcessing') || 'Packaging / Processing', icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60' },
    { status: 'Shipped', label: t('handedToCourier') || 'Handed to Courier (Shipped)', icon: Truck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60' },
    { status: 'Delivered', label: t('deliveredSuccessfully') || 'Delivered Successfully', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
    { status: 'Cancelled', label: t('cancelledReturned') || 'Cancelled / Returned', icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' },
  ];

  const getOrdersForStatus = (status: OnlineOrderStatus) => {
    const list = onlineOrders || [];
    if (status === 'Cancelled') {
      return list.filter((o) => o.status === 'Cancelled' || o.status === 'Returned');
    }
    return list.filter((o) => o.status === status);
  };

  const getNextStatus = (current: OnlineOrderStatus): OnlineOrderStatus | null => {
    switch (current) {
      case 'Pending':
        return 'Confirmed';
      case 'Confirmed':
        return 'Processing';
      case 'Processing':
        return 'Shipped';
      case 'Shipped':
        return 'Delivered';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t('orderStatusPipeline') || 'Order Status Pipeline'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('orderStatusDesc') || 'Visual kanban board to monitor orders through every fulfillment milestone.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('activeOrders') || 'Total Active Pipeline'}: {onlineOrders.filter((o) => !['Delivered', 'Cancelled', 'Returned'].includes(o.status)).length}
          </span>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const orders = getOrdersForStatus(col.status);
          const Icon = col.icon;
          return (
            <div
              key={col.status}
              className="flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[500px] p-3 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {col.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {orders.length}
                </span>
              </div>

              {/* Order Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No orders in this stage
                  </div>
                ) : (
                  orders.map((order) => {
                    const nextSt = getNextStatus(order.status);
                    return (
                      <div
                        key={order.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            #{order.orderNo}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(order.grandTotal)}
                          </span>
                        </div>

                        <div className="space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {order.customerName}
                          </div>
                          <div className="text-slate-400 truncate">
                            📞 {order.customerPhone}
                          </div>
                          <div className="text-slate-400 truncate">
                            📍 {order.deliveryCity || 'Inside City'}
                          </div>
                          {order.courierName && (
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium text-[10px]">
                              🚚 {order.courierName}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-400">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </span>

                          {nextSt && (
                            <button
                              type="button"
                              onClick={() => updateOnlineOrderStatus(order.id, nextSt)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                            >
                              <span>Next: {nextSt}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

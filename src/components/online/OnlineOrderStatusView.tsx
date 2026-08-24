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
  User,
  Phone,
  MapPin,
  Eye,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export const OnlineOrderStatusView: React.FC = () => {
  const {
    onlineOrders,
    updateOnlineOrderStatus,
    formatCurrency,
    formatDate,
    settings,
    user,
    t,
  } = useApp();

  // Modal State for Cancel / Return Action Dialog
  const [modalAction, setModalAction] = useState<'Cancel' | 'Return' | null>(null);
  const [targetOrder, setTargetOrder] = useState<OnlineOrder | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [incurredCost, setIncurredCost] = useState<number>(0);
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [viewDetailOrder, setViewDetailOrder] = useState<OnlineOrder | null>(null);

  const columns: { status: OnlineOrderStatus; label: string; icon: any; color: string; bg: string }[] = [
    { status: 'Pending', label: t('pendingApproval') || 'Pending Approval', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
    { status: 'Confirmed', label: t('confirmedApproved') || 'Confirmed / Approved', icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
    { status: 'Processing', label: t('packagingProcessing') || 'Packaging / Processing', icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60' },
    { status: 'Shipped', label: t('handedToCourier') || 'Handed to Courier', icon: Truck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60' },
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

  const handleOpenCancelModal = (order: OnlineOrder) => {
    setTargetOrder(order);
    setModalAction('Cancel');
    setActionReason('Customer cancelled / Delivery issue');
    const defaultCost =
      order.courierCost !== undefined
        ? Number(order.courierCost)
        : order.deliveryCharge || (order.deliveryCity === 'Outside City' ? 150 : 80);
    setIncurredCost(defaultCost);
    setAdditionalCost(0);
  };

  const handleOpenReturnModal = (order: OnlineOrder) => {
    setTargetOrder(order);
    setModalAction('Return');
    setActionReason('Parcel returned by customer');
    const defaultCost =
      order.courierCost !== undefined
        ? Number(order.courierCost)
        : order.deliveryCharge || (order.deliveryCity === 'Outside City' ? 150 : 80);
    setIncurredCost(defaultCost);
    setAdditionalCost(0);
  };

  const handleCloseModal = () => {
    setModalAction(null);
    setTargetOrder(null);
    setActionReason('');
    setIncurredCost(0);
    setAdditionalCost(0);
  };

  const handleConfirmAction = async () => {
    if (!targetOrder || !modalAction) return;

    const baseCost = Number(incurredCost) || 0;
    const addCost = Number(additionalCost) || 0;
    const totalLost = baseCost + addCost;

    if (modalAction === 'Cancel') {
      await updateOnlineOrderStatus(targetOrder.id, 'Cancelled', {
        cancellationReason: actionReason || 'Order Cancelled',
        courierCost: baseCost,
        cancellationCost: baseCost,
        totalLoss: totalLost,
        cancelledBy: user?.ownerName || user?.name || user?.email || 'Admin',
        cancellationStage: targetOrder.status,
      });
    } else if (modalAction === 'Return') {
      await updateOnlineOrderStatus(targetOrder.id, 'Returned', {
        returnReason: actionReason || 'Parcel returned by customer',
        returnCourierCost: baseCost,
        totalReturnLoss: totalLost,
        totalLoss: totalLost,
        courierCost: baseCost,
        returnedBy: user?.ownerName || user?.name || user?.email || 'Admin',
      });
    }

    handleCloseModal();
  };

  const cancelReasons = [
    'Customer cancelled before delivery',
    'Customer refused at doorstep',
    'Customer phone unreachable / switched off',
    'Wrong delivery address / Location not found',
    'Delivery delayed by courier partner',
    'Damaged parcel during transit',
    'Duplicate order placed',
  ];

  const returnReasons = [
    'Customer refused parcel on delivery',
    'Wrong size / item received by customer',
    'Defective or damaged product',
    'Customer not satisfied with product quality',
    'Customer unreachable during delivery attempts',
    'Parcel return requested by customer',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t('orderStatusPipeline') || 'Online Order Fulfillment Pipeline'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track and advance orders through every fulfillment milestone from approval to courier dispatch and delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            Active in Pipeline:{' '}
            <span className="font-bold">
              {onlineOrders.filter((o) => !['Delivered', 'Cancelled', 'Returned'].includes(o.status)).length}
            </span>
          </div>
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
              className="flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[520px] p-3 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
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
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pr-1 scrollbar-thin">
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No orders in this stage
                  </div>
                ) : (
                  orders.map((order) => {
                    const isHandedToCourier = order.status === 'Shipped';
                    const isDelivered = order.status === 'Delivered';
                    const isCancelled = order.status === 'Cancelled';
                    const isReturned = order.status === 'Returned';

                    return (
                      <div
                        key={order.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-2.5 text-xs"
                      >
                        {/* Card Header: Order No & Price */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setViewDetailOrder(order)}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>#{order.orderNo}</span>
                            <Eye className="w-3 h-3 text-slate-400" />
                          </button>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(order.grandTotal)}
                          </span>
                        </div>

                        {/* Customer Information */}
                        <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{order.customerName}</span>
                          </div>
                          <div className="text-slate-500 truncate flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{order.deliveryCity || 'Inside City'}</span>
                          </div>
                          {order.courierName && (
                            <div className="text-purple-600 dark:text-purple-400 font-semibold text-[10px] truncate">
                              🚚 {order.courierName}
                              {order.trackingNumber ? ` (${order.trackingNumber})` : ''}
                            </div>
                          )}
                        </div>

                        {/* Item counts & payment note */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
                          <span>
                            {order.items?.reduce((s, i) => s + i.quantity, 0) || 1} items
                          </span>
                          <span className="font-medium uppercase">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>

                        {/* ============================================================== */}
                        {/* STAGE-SPECIFIC ACTIONS */}
                        {/* ============================================================== */}

                        {/* 1. PENDING STAGE */}
                        {order.status === 'Pending' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateOnlineOrderStatus(order.id, 'Confirmed')}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                            >
                              <span>Approve</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order)}
                              title="Cancel Order"
                              className="px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* 2. CONFIRMED STAGE */}
                        {order.status === 'Confirmed' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateOnlineOrderStatus(order.id, 'Processing')}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                            >
                              <span>Pack / Process</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order)}
                              title="Cancel Order"
                              className="px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* 3. PROCESSING STAGE */}
                        {order.status === 'Processing' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateOnlineOrderStatus(order.id, 'Shipped')}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                            >
                              <span>Hand to Courier</span>
                              <Truck className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order)}
                              title="Cancel Order"
                              className="px-2 py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* 4. HANDED TO COURIER STAGE (SHIPPED) - 3 ACTIONS REQUIRED */}
                        {isHandedToCourier && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
                            {/* Action 1: Delivery Successful */}
                            <button
                              type="button"
                              onClick={() => updateOnlineOrderStatus(order.id, 'Delivered')}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>1. Delivery Successful</span>
                            </button>

                            {/* Actions 2 & 3: Cancel Order & Return Order */}
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenCancelModal(order)}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 rounded-lg transition-colors border border-rose-300 dark:border-rose-800"
                              >
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>2. Cancel</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReturnModal(order)}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 dark:border-amber-800"
                              >
                                <RotateCcw className="w-3 h-3 text-amber-600" />
                                <span>3. Return</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 5. DELIVERED STAGE */}
                        {isDelivered && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenReturnModal(order)}
                              className="px-2 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Return / Refund
                            </button>
                          </div>
                        )}

                        {/* 6. CANCELLED / RETURNED STAGE */}
                        {(isCancelled || isReturned) && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isCancelled
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isCancelled ? 'CANCELLED' : 'RETURNED'}
                              </span>
                              {order.financialImpact !== undefined && order.financialImpact < 0 && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  Loss: {formatCurrency(order.financialImpact)}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">
                              {order.cancellationReason || order.returnReason || 'No reason recorded'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* CANCEL / RETURN ORDER MODAL WITH REASON & COURIER LOSS INPUT */}
      {/* ============================================================== */}
      {modalAction && targetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    modalAction === 'Cancel'
                      ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {modalAction === 'Cancel' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {modalAction === 'Cancel' ? 'Cancel Order' : 'Return Order'} #{targetOrder.orderNo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record reason, actual courier cost, and financial loss for accounting.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Preview Brief */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {targetOrder.customerName} ({targetOrder.customerPhone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-medium text-right text-slate-700 dark:text-slate-300 max-w-[240px]">
                  {targetOrder.deliveryAddress || targetOrder.deliveryCity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Value:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(targetOrder.subtotal || targetOrder.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stage:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {targetOrder.status}
                </span>
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                {modalAction === 'Cancel' ? 'Cancellation Reason *' : 'Return Reason *'}
              </label>
              <input
                type="text"
                placeholder={
                  modalAction === 'Cancel'
                    ? 'Enter why the order was cancelled...'
                    : 'Enter why the order was returned...'
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Preset Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(modalAction === 'Cancel' ? cancelReasons : returnReasons).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActionReason(tag)}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Incurred Cost Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Actual Courier / Delivery Cost ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={incurredCost}
                  onChange={(e) => setIncurredCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Amount paid or owed to courier partner.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Other Return Loss / Penalty ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Packaging/handling loss (optional).
                </p>
              </div>
            </div>

            {/* Financial Impact & Accounting Summary */}
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Total Recorded Business Loss:</span>
                </span>
                <span className="text-sm text-rose-700 dark:text-rose-400">
                  {formatCurrency((Number(incurredCost) || 0) + (Number(additionalCost) || 0))}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                • Unpaid COD amount ({formatCurrency(targetOrder.grandTotal)}) will <strong>NOT</strong> be counted as sales revenue.
              </p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                ✓ All items ({targetOrder.items?.reduce((s, i) => s + i.quantity, 0) || 1} units) will be automatically returned and restocked in inventory.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel / Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                  modalAction === 'Cancel'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {modalAction === 'Cancel' ? 'Confirm Cancellation' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK VIEW DETAIL MODAL */}
      {/* ============================================================== */}
      {viewDetailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Details #{viewDetailOrder.orderNo}
                </h3>
                <span className="text-xs text-slate-400">
                  Placed on {formatDate(viewDetailOrder.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Current Status</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {viewDetailOrder.status}
                </span>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewDetailOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold">{viewDetailOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-medium text-right max-w-[220px]">
                    {viewDetailOrder.deliveryAddress || viewDetailOrder.deliveryCity}
                  </span>
                </div>
                {viewDetailOrder.courierName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courier:</span>
                    <span className="font-semibold">
                      {viewDetailOrder.courierName}
                      {viewDetailOrder.trackingNumber ? ` (${viewDetailOrder.trackingNumber})` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Ordered Items ({viewDetailOrder.items?.length || 0})
                </span>
                {viewDetailOrder.items?.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>
                      {i.productName} × {i.quantity}
                    </span>
                    <span className="font-bold">{formatCurrency(i.total)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(viewDetailOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    Delivery Charge (
                    {viewDetailOrder.deliveryPayer === 'Owner' ? 'Paid by Store' : 'Paid by Customer'}
                    ):
                  </span>
                  <span>{formatCurrency(viewDetailOrder.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-indigo-200 dark:border-indigo-800 pt-1 text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(viewDetailOrder.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDetailOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

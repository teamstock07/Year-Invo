import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Package,
  Users,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  XCircle,
  RotateCcw,
  Percent,
  Calculator,
  ArrowDownRight,
  FileText,
} from 'lucide-react';

interface OnlineDashboardViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const OnlineDashboardView: React.FC<OnlineDashboardViewProps> = ({
  onNavigateToTab,
}) => {
  const {
    onlineOrders,
    onlineCustomers,
    products,
    settings,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const metrics = useMemo(() => {
    let totalGrossSales = 0;
    let deliveredRevenue = 0;
    let pendingPipelineValue = 0;
    let cancelledValue = 0;
    let returnedValue = 0;

    let pendingCodAmount = 0;
    let collectedCodAmount = 0;

    let ownerFreeShippingPaid = 0;
    let totalCourierCost = 0;
    let cancellationLoss = 0;
    let totalDiscounts = 0;
    let deliveredProductCost = 0;

    // Status Counters
    const statusCounts = {
      All: 0,
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
    };

    const courierStats: Record<string, { count: number; revenue: number; cost: number }> = {};
    const list = onlineOrders || [];

    // Map for fast product cost lookup
    const productCostMap = new Map<string, number>();
    products.forEach((p) => {
      productCostMap.set(p.id, Number(p.purchasePrice || p.costPrice || 0));
    });

    list.forEach((order) => {
      statusCounts.All++;
      const orderTotal = Number(order.grandTotal) || 0;
      const orderCourierCost = Number(order.courierCost) || 0;
      totalGrossSales += orderTotal;
      totalDiscounts += Number(order.discount) || 0;

      // Status aggregation
      if (order.status === 'Delivered') {
        statusCounts.Delivered++;
        deliveredRevenue += orderTotal;
        totalCourierCost += orderCourierCost;

        // Calculate product cost for delivered items
        order.items?.forEach((item) => {
          const unitCost =
            productCostMap.get(item.productId) ??
            Number((item as any).purchasePrice || (item as any).costPrice || 0);
          deliveredProductCost += unitCost * (item.quantity || 1);
        });
      } else if (order.status === 'Cancelled') {
        statusCounts.Cancelled++;
        cancelledValue += orderTotal;
        const loss =
          order.financialImpact !== undefined && order.financialImpact < 0
            ? Math.abs(order.financialImpact)
            : orderCourierCost;
        cancellationLoss += loss;
        totalCourierCost += loss;
      } else if (order.status === 'Returned') {
        statusCounts.Returned++;
        returnedValue += orderTotal;
        const loss =
          order.financialImpact !== undefined && order.financialImpact < 0
            ? Math.abs(order.financialImpact)
            : orderCourierCost;
        cancellationLoss += loss;
        totalCourierCost += loss;
      } else {
        // Pending Pipeline (Pending, Confirmed, Processing, Shipped)
        pendingPipelineValue += orderTotal;
        if (order.status === 'Pending') statusCounts.Pending++;
        else if (order.status === 'Confirmed') statusCounts.Confirmed++;
        else if (order.status === 'Processing') statusCounts.Processing++;
        else if (order.status === 'Shipped') statusCounts.Shipped++;
      }

      // COD breakdown
      if (order.paymentMethod === 'COD') {
        if (order.codCollected || order.paymentStatus === 'Paid') {
          collectedCodAmount += order.codCollectedAmount || orderTotal;
        } else if (order.status !== 'Cancelled' && order.status !== 'Returned') {
          pendingCodAmount += orderTotal;
        }
      }

      // Owner free delivery shipping absorption
      if (order.deliveryPayer === 'Owner') {
        ownerFreeShippingPaid += Number(order.deliveryCharge) || 0;
      }

      // Courier Partner performance
      const courier = order.courierName || 'In-House Courier';
      if (!courierStats[courier]) {
        courierStats[courier] = { count: 0, revenue: 0, cost: 0 };
      }
      courierStats[courier].count++;
      courierStats[courier].revenue += orderTotal;
      courierStats[courier].cost += orderCourierCost;
    });

    // Net Profit Calculation:
    // Revenue (Delivered) - Product Cost - Delivery/Courier Cost - Cancellation/Return Loss - Discounts = Online Profit/Loss
    const netProfit =
      deliveredRevenue -
      deliveredProductCost -
      ownerFreeShippingPaid -
      cancellationLoss;

    const profitMargin =
      deliveredRevenue > 0 ? (netProfit / deliveredRevenue) * 100 : 0;

    const returnRate =
      statusCounts.All > 0
        ? ((statusCounts.Cancelled + statusCounts.Returned) / statusCounts.All) * 100
        : 0;

    return {
      totalGrossSales,
      deliveredRevenue,
      pendingPipelineValue,
      cancelledValue,
      returnedValue,
      pendingCodAmount,
      collectedCodAmount,
      ownerFreeShippingPaid,
      totalCourierCost,
      cancellationLoss,
      totalDiscounts,
      deliveredProductCost,
      netProfit,
      profitMargin,
      statusCounts,
      returnRate,
      courierStats,
    };
  }, [onlineOrders, products]);

  const recentOrders = useMemo(() => {
    return [...(onlineOrders || [])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [onlineOrders]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Online Business Financial Dashboard</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time sales, order pipeline status, courier expenses, COD reconciliation, and net profit calculations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToTab && onNavigateToTab('orders')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create / Manage Orders</span>
          </button>
        </div>
      </div>

      {/* Real-time Order Status Pipeline Counters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Order Status Pipeline (Real-Time Counters)
          </span>
          <button
            type="button"
            onClick={() => onNavigateToTab && onNavigateToTab('status')}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Live Pipeline Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            {
              id: 'All',
              label: 'Total Orders',
              count: metrics.statusCounts.All,
              color: 'text-slate-900 dark:text-white',
              bg: 'bg-slate-100 dark:bg-slate-800',
              border: 'border-slate-300 dark:border-slate-700',
            },
            {
              id: 'Pending',
              label: 'Pending',
              count: metrics.statusCounts.Pending,
              color: 'text-amber-600 dark:text-amber-400',
              bg: 'bg-amber-50 dark:bg-amber-950/40',
              border: 'border-amber-200 dark:border-amber-800/60',
            },
            {
              id: 'Confirmed',
              label: 'Confirmed',
              count: metrics.statusCounts.Confirmed,
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-50 dark:bg-blue-950/40',
              border: 'border-blue-200 dark:border-blue-800/60',
            },
            {
              id: 'Processing',
              label: 'Processing',
              count: metrics.statusCounts.Processing,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-950/40',
              border: 'border-indigo-200 dark:border-indigo-800/60',
            },
            {
              id: 'Shipped',
              label: 'Shipped',
              count: metrics.statusCounts.Shipped,
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-950/40',
              border: 'border-purple-200 dark:border-purple-800/60',
            },
            {
              id: 'Delivered',
              label: 'Delivered',
              count: metrics.statusCounts.Delivered,
              color: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-emerald-50 dark:bg-emerald-950/40',
              border: 'border-emerald-200 dark:border-emerald-800/60',
            },
            {
              id: 'Cancelled',
              label: 'Cancelled',
              count: metrics.statusCounts.Cancelled,
              color: 'text-rose-600 dark:text-rose-400',
              bg: 'bg-rose-50 dark:bg-rose-950/40',
              border: 'border-rose-200 dark:border-rose-800/60',
            },
            {
              id: 'Returned',
              label: 'Returned',
              count: metrics.statusCounts.Returned,
              color: 'text-slate-600 dark:text-slate-400',
              bg: 'bg-slate-50 dark:bg-slate-800/60',
              border: 'border-slate-200 dark:border-slate-700',
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateToTab && onNavigateToTab('orders')}
              className={`p-3 rounded-xl border ${item.border} ${item.bg} text-left transition-all hover:scale-[1.02] shadow-xs`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {item.label}
              </span>
              <span className={`text-xl font-extrabold ${item.color} mt-0.5 block`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Financial Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total & Delivered Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Online Sales
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalGrossSales)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Delivered: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(metrics.deliveredRevenue)}</strong></span>
            <span className="text-indigo-600 font-bold">{metrics.statusCounts.Delivered} done</span>
          </div>
        </div>

        {/* Card 2: Pending Pipeline Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Pipeline Value
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(metrics.pendingPipelineValue)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>In Processing/Transit</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('status')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Track Pipeline →
            </button>
          </div>
        </div>

        {/* Card 3: COD Collected & Pending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              COD Receivables
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.collectedCodAmount)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Pending: <strong>{formatCurrency(metrics.pendingCodAmount)}</strong></span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('cod')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              COD Desk →
            </button>
          </div>
        </div>

        {/* Card 4: Net Online Profit / Loss */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Online Profit
            </span>
            <div
              className={`p-2 rounded-xl ${
                metrics.netProfit >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}
            >
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black ${
              metrics.netProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(metrics.netProfit)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Margin: <strong>{metrics.profitMargin.toFixed(1)}%</strong></span>
            <span className="text-[11px] text-slate-400">After all costs</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Net Profit & Expense Calculation Breakdown Formula */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Online Profit & Loss Equation Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formula: Revenue (Delivered) − Product Cost − Courier Shipping Cost − Cancellation Losses − Discounts = Net Profit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Return Rate: {metrics.returnRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Visual Financial Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Revenue */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Delivered Revenue</span>
            </span>
            <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              +{formatCurrency(metrics.deliveredRevenue)}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
              {metrics.statusCounts.Delivered} successful orders
            </p>
          </div>

          {/* Product Purchase Cost */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Delivered Product Cost</span>
            </span>
            <div className="text-base font-extrabold text-rose-700 dark:text-rose-400">
              -{formatCurrency(metrics.deliveredProductCost)}
            </div>
            <p className="text-[10px] text-rose-600 dark:text-rose-500">
              Base wholesale purchase cost
            </p>
          </div>

          {/* Courier & Shipping Expense */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Owner Free Delivery</span>
            </span>
            <div className="text-base font-extrabold text-purple-700 dark:text-purple-400">
              -{formatCurrency(metrics.ownerFreeShippingPaid)}
            </div>
            <p className="text-[10px] text-purple-600 dark:text-purple-500">
              Store free shipping promotions
            </p>
          </div>

          {/* Cancellation & Return Losses */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancellation / Courier Loss</span>
            </span>
            <div className="text-base font-extrabold text-amber-700 dark:text-amber-400">
              -{formatCurrency(metrics.cancellationLoss)}
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-500">
              Lost courier fees on cancels/returns
            </p>
          </div>

          {/* Final Net Profit */}
          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              metrics.netProfit >= 0
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60'
                : 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700'
            }`}
          >
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                metrics.netProfit >= 0
                  ? 'text-indigo-800 dark:text-indigo-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Net Online Profit</span>
            </span>
            <div
              className={`text-base font-black ${
                metrics.netProfit >= 0
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {formatCurrency(metrics.netProfit)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {metrics.profitMargin.toFixed(1)}% net margin
            </p>
          </div>
        </div>
      </div>

      {/* Courier Breakdown & Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Online Orders */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Recent Online Orders</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab && onNavigateToTab('orders')}
              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View All ({onlineOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No online orders recorded yet. Click "Create / Manage Orders" above to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        #{order.orderNo}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {order.customerPhone} • {order.items.length} items •{' '}
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.grandTotal)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : order.status === 'Shipped'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : order.status === 'Returned'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Courier Partner Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            <span>Courier Partner Performance</span>
          </h3>

          {Object.keys(metrics.courierStats).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No courier shipments logged.
            </div>
          ) : (
            <div className="space-y-3">
              {(Object.entries(metrics.courierStats) as [string, { count: number; revenue: number; cost: number }][]).map(([courier, stat]) => {
                const pct =
                  metrics.statusCounts.All > 0 ? (stat.count / metrics.statusCounts.All) * 100 : 0;
                return (
                  <div key={courier} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{courier}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {stat.count} parcels ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Order Value: {formatCurrency(stat.revenue)}</span>
                      <span>Est. Courier Fee: {formatCurrency(stat.cost)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('customers')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Customers</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('reports')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

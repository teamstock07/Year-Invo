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
    settings,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let pendingCodAmount = 0;
    let collectedCodAmount = 0;
    let storeShippingExpense = 0;
    let activeOrdersCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    const courierStats: Record<string, { count: number; revenue: number }> = {};
    const list = onlineOrders || [];

    list.forEach((order) => {
      totalRevenue += order.grandTotal || 0;

      if (order.status === 'Delivered') {
        deliveredCount++;
        deliveredRevenue += order.grandTotal || 0;
      } else if (order.status === 'Cancelled' || order.status === 'Returned') {
        cancelledCount++;
      } else {
        activeOrdersCount++;
      }

      if (order.paymentMethod === 'COD') {
        if (order.codCollected || order.paymentStatus === 'Paid') {
          collectedCodAmount += order.grandTotal || 0;
        } else {
          pendingCodAmount += order.grandTotal || 0;
        }
      }

      if (order.deliveryPayer === 'Owner') {
        storeShippingExpense += order.deliveryCharge || 0;
      }

      const courier = order.courierName || 'In-House Courier';
      if (!courierStats[courier]) {
        courierStats[courier] = { count: 0, revenue: 0 };
      }
      courierStats[courier].count++;
      courierStats[courier].revenue += order.grandTotal || 0;
    });

    const totalOrders = list.length;
    const returnRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      deliveredRevenue,
      pendingCodAmount,
      collectedCodAmount,
      storeShippingExpense,
      activeOrdersCount,
      deliveredCount,
      cancelledCount,
      totalOrders,
      returnRate,
      courierStats,
    };
  }, [onlineOrders]);

  const recentOrders = useMemo(() => {
    return [...(onlineOrders || [])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [onlineOrders]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Online Business Dashboard</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Comprehensive overview of online sales, pending fulfillment, COD receivables, and delivery partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToTab && onNavigateToTab('orders')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Online Sales */}
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
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Delivered: {formatCurrency(metrics.deliveredRevenue)}</span>
            <span className="text-indigo-600 font-bold">{metrics.totalOrders} orders</span>
          </div>
        </div>

        {/* Card 2: Active Pipeline Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Fulfillment
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {metrics.activeOrdersCount}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>In processing or transit</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('status')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Pipeline →
            </button>
          </div>
        </div>

        {/* Card 3: Pending COD Receivables */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending COD Amount
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.pendingCodAmount)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Collected: {formatCurrency(metrics.collectedCodAmount)}</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('cod')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              COD Desk →
            </button>
          </div>
        </div>

        {/* Card 4: Store Shipping Absorption */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Owner Shipping Expense
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(metrics.storeShippingExpense)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Free delivery promotions</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('delivery')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Rates →
            </button>
          </div>
        </div>
      </div>

      {/* Courier Breakdown & Recent Activity Section */}
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
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No online orders recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
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
                      {order.deliveryCity || 'Inside City'} • {order.items.length} items •{' '}
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
            <span>Courier Performance</span>
          </h3>

          {Object.keys(metrics.courierStats).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No courier shipments logged.
            </div>
          ) : (
            <div className="space-y-3">
              {(Object.entries(metrics.courierStats) as [string, { count: number; revenue: number }][]).map(([courier, stat]) => {
                const pct =
                  metrics.totalOrders > 0 ? (stat.count / metrics.totalOrders) * 100 : 0;
                return (
                  <div key={courier} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{courier}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {stat.count} orders ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 text-right">
                      Volume: {formatCurrency(stat.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions Shortcuts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('customers')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Customers</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('reports')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
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

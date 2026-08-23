import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  BarChart3,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export const OnlineReportsView: React.FC = () => {
  const {
    onlineOrders,
    formatCurrency,
    formatDate,
    settings,
  } = useApp();

  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | 'today'>('all');

  const filteredOrders = useMemo(() => {
    const now = new Date().getTime();
    const list = onlineOrders || [];
    return list.filter((ord) => {
      if (dateRange === 'all') return true;
      const ordTime = new Date(ord.createdAt).getTime();
      const diffDays = (now - ordTime) / (1000 * 3600 * 24);

      if (dateRange === 'today') return diffDays < 1;
      if (dateRange === '7d') return diffDays <= 7;
      if (dateRange === '30d') return diffDays <= 30;
      return true;
    });
  }, [onlineOrders, dateRange]);

  const report = useMemo(() => {
    let totalSales = 0;
    let deliveredSales = 0;
    let shippingBilledToCustomer = 0;
    let shippingAbsorbedByOwner = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;

    const courierMap: Record<string, { totalOrders: number; delivered: number; revenue: number }> = {};
    const cityMap: Record<string, { orders: number; revenue: number }> = {
      'Inside City': { orders: 0, revenue: 0 },
      'Outside City': { orders: 0, revenue: 0 },
    };
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      totalSales += order.grandTotal || 0;

      if (order.status === 'Delivered') {
        deliveredCount++;
        deliveredSales += order.grandTotal || 0;
      } else if (order.status === 'Cancelled' || order.status === 'Returned') {
        cancelledCount++;
      } else {
        pendingCount++;
      }

      if (order.deliveryPayer === 'Customer') {
        shippingBilledToCustomer += order.deliveryCharge || 0;
      } else {
        shippingAbsorbedByOwner += order.deliveryCharge || 0;
      }

      // Courier performance
      const courier = order.courierName || 'In-House';
      if (!courierMap[courier]) {
        courierMap[courier] = { totalOrders: 0, delivered: 0, revenue: 0 };
      }
      courierMap[courier].totalOrders++;
      courierMap[courier].revenue += order.grandTotal || 0;
      if (order.status === 'Delivered') {
        courierMap[courier].delivered++;
      }

      // City distribution
      const cityKey = order.deliveryCity === 'Outside City' ? 'Outside City' : 'Inside City';
      cityMap[cityKey].orders++;
      cityMap[cityKey].revenue += order.grandTotal || 0;

      // Product sales
      (order.items || []).forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productMap[item.productId].quantity += item.quantity || 0;
        productMap[item.productId].revenue += item.total || 0;
      });
    });

    const totalOrders = filteredOrders.length;
    const fulfillmentRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;
    const returnRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSales,
      deliveredSales,
      shippingBilledToCustomer,
      shippingAbsorbedByOwner,
      totalOrders,
      deliveredCount,
      cancelledCount,
      pendingCount,
      fulfillmentRate,
      returnRate,
      courierMap,
      cityMap,
      topProducts,
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Online Business Analytics & Reports</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analyze online sales volume, shipping expenses, courier fulfillment rates, and top products.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['today', '7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateRange === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Online Sales
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(report.totalSales)}
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            {report.totalOrders} online orders
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Delivery Success Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {report.fulfillmentRate.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-400">
            {report.deliveredCount} delivered successfully
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Shipping Billed To Customer
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(report.shippingBilledToCustomer)}
          </div>
          <span className="text-xs text-slate-400">Customer paid shipping</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Owner Shipping Expense
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(report.shippingAbsorbedByOwner)}
          </div>
          <span className="text-xs text-slate-400">Absorbed for free delivery promotions</span>
        </div>
      </div>

      {/* Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courier Success Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Courier Partner Performance</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="pb-2">Courier</th>
                  <th className="pb-2 text-center">Orders</th>
                  <th className="pb-2 text-center">Delivered</th>
                  <th className="pb-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {(Object.entries(report.courierMap) as [string, { totalOrders: number; delivered: number; revenue: number }][]).map(([courier, data]) => {
                  const rate = data.totalOrders > 0 ? (data.delivered / data.totalOrders) * 100 : 0;
                  return (
                    <tr key={courier}>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {courier}
                      </td>
                      <td className="py-2.5 text-center">{data.totalOrders}</td>
                      <td className="py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        {data.delivered} ({rate.toFixed(0)}%)
                      </td>
                      <td className="py-2.5 text-right font-bold">
                        {formatCurrency(data.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Online Products */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Top Selling Products Online</span>
          </h3>

          {report.topProducts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No product sales in this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {report.topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-semibold">
                      {p.quantity} sold
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

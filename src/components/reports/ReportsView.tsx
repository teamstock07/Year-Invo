import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import { FileSpreadsheet, Download, FileText, Calendar, TrendingUp, DollarSign } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { metrics, sales, purchases, expenses, dueCollections, products, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleDownloadCSV = () => {
    const reportData = [
      ['Metric', 'Amount'],
      ['Total Sales', `${symbol} ${metrics.monthlySales}`],
      ['Total Expenses', `${symbol} ${metrics.monthlyExpense}`],
      ['Net Profit', `${symbol} ${metrics.monthlyProfit}`],
      ['Cash Balance', `${symbol} ${metrics.totalBalance}`],
      ['Inventory Cost Value', `${symbol} ${metrics.totalInventoryCostValue}`],
      ['Inventory Potential Value', `${symbol} ${metrics.totalInventorySellingValue}`],
      ['Customer Due Receivable', `${symbol} ${metrics.totalDueCustomers}`],
      ['Supplier Due Payable', `${symbol} ${metrics.totalDueSuppliers}`],
    ];

    const csvContent = reportData.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            {t('reportsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate financial balance sheets, profit & loss statements, and inventory valuation logs.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                period === p ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Summary Card Sheet */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
              {getDisplayBrandName(settings.brandName)} Financial Statement
            </h3>
            <p className="text-xs text-slate-500 uppercase font-semibold mt-0.5">
              Period: {period.toUpperCase()} • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Sales Revenue</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {symbol} {metrics.monthlySales.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Expenses</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {symbol} {metrics.monthlyExpense.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Net Profit</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {symbol} {metrics.monthlyProfit.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Inventory Cost</span>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
              {symbol} {metrics.totalInventoryCostValue.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Customer Due Receivable</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
              {symbol} {metrics.totalDueCustomers.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Supplier Due Payable</span>
            <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1 block">
              {symbol} {metrics.totalDueSuppliers.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Sales Log Section */}
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3">Sales Breakdown Log</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{s.invoiceNo}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{s.customerName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{s.paymentMethod}</td>
                    <td className="p-3 text-right font-black text-emerald-600">{symbol} {s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

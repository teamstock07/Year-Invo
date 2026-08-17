import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { ShoppingBag, Search, Eye, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const { sales, settings, t, language } = useApp();
  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'1m' | '3m'>('1m');

  // Filter sales by date range (1 Month default = 30 days, 3 Months = 90 days)
  const now = new Date();
  const daysThreshold = dateRange === '3m' ? 90 : 30;
  const cutoffDate = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

  const rangeFilteredSales = sales.filter((s) => {
    const saleDate = new Date(s.date);
    return saleDate >= cutoffDate;
  });

  const finalFilteredSales = rangeFilteredSales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate Total Sales Revenue & Profit/Loss for selected range
  const totalPeriodSales = rangeFilteredSales.reduce((sum, s) => sum + s.total, 0);

  const totalPeriodProfit = rangeFilteredSales.reduce((acc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      const buyingPrice = item.buyingPrice || (item.sellingPrice * 0.7);
      const itemCost = buyingPrice * item.quantity;
      return itemAcc + (item.total - itemCost);
    }, 0);
    return acc + saleProfit;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Date Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#ff5c01]" />
            {t('navSales')} ({sales.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'বিক্রয়ের ইতিহাস, ফিল্টার এবং সময়কাল অনুযায়ী লাভ/ক্ষতির হিসাব'
              : 'Complete transaction history with period-based revenue and profit/loss calculations.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDateRange('1m')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateRange === '1m'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isBn ? '১ মাস (1 Month)' : '1 Month'}</span>
            </button>
            <button
              onClick={() => setDateRange('3m')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                dateRange === '3m'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isBn ? '৩ মাস (3 Months)' : '3 Months'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'ইনভয়েস বা গ্রাহক খুঁজুন...' : 'Search invoice or customer...'}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Period Profit & Sales Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Sales Metric */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {dateRange === '1m'
                ? (isBn ? 'গত ১ মাসের মোট বিক্রি' : 'Selected 1 Month Sales Revenue')
                : (isBn ? 'গত ৩ মাসের মোট বিক্রি' : 'Selected 3 Months Sales Revenue')}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {symbol} {(totalPeriodSales || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {rangeFilteredSales.length} {isBn ? 'টি ট্রানজ্যাকশন সম্পন্ন' : 'transactions recorded'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Dynamic Profit / Loss Metric */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {dateRange === '1m'
                ? (isBn ? 'গত ১ মাসের নিট লাভ/ক্ষতি' : 'Selected 1 Month Profit / Loss')
                : (isBn ? 'গত ৩ মাসের নিট লাভ/ক্ষতি' : 'Selected 3 Months Profit / Loss')}
            </span>
            <h3 className={`text-2xl font-black mt-1 ${totalPeriodProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {symbol} {Math.abs(totalPeriodProfit || 0).toLocaleString()} {totalPeriodProfit < 0 ? '(Loss)' : ''}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isBn ? 'কেনা দাম ও বিক্রি দামের সমন্বিত হিসাব' : 'Calculated based on item buying vs selling prices'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
            totalPeriodProfit >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
          }`}>
            {totalPeriodProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">Invoice No</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4 text-right">Items</th>
              <th className="p-4 text-right">Total Amount</th>
              <th className="p-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {finalFilteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  {isBn ? 'বাছাইকৃত সময়কালে কোনো বিক্রয় তথ্য পাওয়া যায়নি' : 'No transactions recorded for the selected date range.'}
                </td>
              </tr>
            ) : (
              finalFilteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-100">{sale.invoiceNo}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{sale.customerName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold text-[10px]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">{sale.items.length} items</td>
                  <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {symbol} {(sale.total || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedSale(sale);
                        setIsReceiptOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View & Print Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        sale={selectedSale}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

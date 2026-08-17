import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  Receipt,
  CreditCard,
  Building2,
  Truck,
  Boxes,
  Wallet,
  ArrowRight,
  Info,
  Scale,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { metrics, sales, expenses, settings, language, t, formatCurrency } = useApp();
  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');
  const [activeTab, setActiveTab] = useState<'statement' | 'sales_breakdown' | 'expense_breakdown'>('statement');

  // Filter data according to selected period
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  const filteredSales = sales.filter((s) => {
    if (period === 'all') return true;
    const sDate = s.date.split('T')[0];
    if (period === 'daily') return sDate === todayStr;
    if (period === 'weekly') {
      const diffDays = (now.getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    if (period === 'monthly') return sDate.startsWith(todayStr.substring(0, 7));
    if (period === 'yearly') return sDate.startsWith(todayStr.substring(0, 4));
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (period === 'all') return true;
    const eDate = e.date.split('T')[0];
    if (period === 'daily') return eDate === todayStr;
    if (period === 'weekly') {
      const diffDays = (now.getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    if (period === 'monthly') return eDate.startsWith(todayStr.substring(0, 7));
    if (period === 'yearly') return eDate.startsWith(todayStr.substring(0, 4));
    return true;
  });

  // 1. Total Sales (Revenue)
  const totalSales = filteredSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

  // 2. Cost of Goods Sold (COGS / Buying Price of Sold Inventory)
  const costOfGoodsSold = filteredSales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce(
        (sum, item) => sum + (Number(item.buyingPrice) || 0) * (Number(item.quantity) || 1),
        0
      )
    );
  }, 0);

  // 3. Gross Profit = Total Sales - Cost of Goods Sold
  const grossProfit = totalSales - costOfGoodsSold;
  const grossMarginPercent = totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : '0';

  // 4. Total Operating Expenses
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // 5. Net Profit & Net Loss Calculation
  // Net Result = Gross Profit - Total Expenses
  // If Gross Profit >= Total Expenses: Net Profit = Gross Profit - Total Expenses, Net Loss = 0
  // If Total Expenses > Gross Profit: Net Loss = Total Expenses - Gross Profit, Net Profit = 0
  const netResult = grossProfit - totalExpenses;
  const isLoss = netResult < 0;
  const isProfit = netResult > 0;
  const isBreakEven = netResult === 0;

  const netProfit = isProfit ? netResult : 0;
  const netLoss = isLoss ? totalExpenses - grossProfit : 0; // Difference when expenses exceed gross profit

  const netMarginPercent =
    totalSales > 0 ? ((Math.abs(netResult) / totalSales) * 100).toFixed(1) : '0';

  const periodNewDue = filteredSales.reduce((acc, s) => acc + (Number(s.dueAmount) || 0), 0);

  // Group expenses by category for itemized breakdown
  const expensesByCategory = filteredExpenses.reduce<Record<string, number>>((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  const formatVal = (val: unknown) => {
    const num = Number(val);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const handleDownloadCSV = () => {
    const reportData = [
      ['PROFIT & LOSS FINANCIAL STATEMENT', ''],
      ['Store / Brand', getDisplayBrandName(settings.brandName)],
      ['Period', period.toUpperCase()],
      ['Report Date', new Date().toISOString().split('T')[0]],
      ['', ''],
      ['--- CORE PROFIT & LOSS METRICS ---', ''],
      ['1. Total Sales (Revenue)', `${symbol} ${formatVal(totalSales)}`],
      ['2. Cost of Goods Sold (COGS)', `${symbol} ${formatVal(costOfGoodsSold)}`],
      ['3. Gross Profit (Sales - COGS)', `${symbol} ${formatVal(grossProfit)}`],
      ['Gross Profit Margin (%)', `${grossMarginPercent}%`],
      ['4. Total Operating Expenses', `${symbol} ${formatVal(totalExpenses)}`],
      ['', ''],
      ['--- NET FINANCIAL OUTCOME ---', ''],
      ['Status', isLoss ? 'NET LOSS' : isProfit ? 'NET PROFIT' : 'BREAK-EVEN'],
      ['5. Net Profit', `${symbol} ${formatVal(netProfit)}`],
      ['6. Net Loss (Total Loss)', `${symbol} ${formatVal(netLoss)}`],
      ['Net Margin (%)', `${netMarginPercent}%`],
      ['', ''],
      ['--- CUMULATIVE BALANCE & INVENTORY ---', ''],
      ['New Due Created in Period', `${symbol} ${formatVal(periodNewDue)}`],
      ['Total Customer Due Receivable (Cumulative)', `${symbol} ${formatVal(metrics?.totalDueCustomers)}`],
      ['Total Supplier Due Payable (Cumulative)', `${symbol} ${formatVal(metrics?.totalDueSuppliers)}`],
      ['Inventory Cost Valuation', `${symbol} ${formatVal(metrics?.totalInventoryCostValue)}`],
      ['Inventory Retail Potential Value', `${symbol} ${formatVal(metrics?.totalInventorySellingValue)}`],
      ['All-Time Cash Balance', `${symbol} ${formatVal(metrics?.totalBalance)}`],
    ];

    const csvContent = reportData.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit_loss_report_${period}_${todayStr}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {isBn ? 'লাভ-ক্ষতি ও আর্থিক হিসাব (Profit & Loss)' : 'Profit & Loss Statement'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'বিক্রয়, বিক্রিত পণ্যের ক্রয়মূল্য (COGS), মোট লাভ, খরচ এবং নিট লাভ বা নিট ক্ষতির হিসাব।'
              : 'Accurate financial statement tracking Total Sales, Cost of Goods Sold, Gross Profit, Total Expenses, Net Profit, and Net Loss.'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['daily', 'weekly', 'monthly', 'yearly', 'all'] as const).map((p) => {
            const labels: Record<typeof p, { en: string; bn: string }> = {
              daily: { en: 'Daily', bn: 'আজ' },
              weekly: { en: '7 Days', bn: '৭ দিন' },
              monthly: { en: 'Monthly', bn: 'চলতি মাস' },
              yearly: { en: 'Yearly', bn: 'চলতি বছর' },
              all: { en: 'All-Time', bn: 'সব সময়' },
            };
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  period === p
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isBn ? labels[p].bn : labels[p].en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {/* Title Bar & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{getDisplayBrandName(settings.brandName)}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {period.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'রিপোর্ট তৈরির তারিখ:' : 'Statement generated on'}{' '}
              {new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'এক্সেল / CSV রিপোর্ট ডাউনলোড' : 'Export CSV / Excel'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. DYNAMIC OUTCOME ALERT BANNER (High Visibility Net Profit vs Total Loss) */}
        {/* ========================================================================= */}
        {isLoss ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <h4 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    {isBn ? 'নিট ক্ষতি (Net Loss Alert)' : 'Net Loss Status'}
                  </h4>
                </div>
                <p className="text-xs text-rose-600/90 dark:text-rose-400/90 mt-0.5">
                  {isBn
                    ? `মোট খরচ (${symbol} ${formatVal(totalExpenses)}) মোট লাভের (${symbol} ${formatVal(grossProfit)}) চেয়ে বেশি হওয়ায় এই সময়ে ক্ষতি হয়েছে।`
                    : `Total Expenses exceed Gross Profit by ${symbol} ${formatVal(netLoss)} in this period.`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-white/70 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                🔴 {isBn ? 'মোট ক্ষতি (Total Loss)' : 'Total Loss'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                {symbol} {formatVal(netLoss)}
              </span>
            </div>
          </div>
        ) : isProfit ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {isBn ? 'নিট লাভ (Net Profit Status)' : 'Profitable Business Period'}
                  </h4>
                </div>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 mt-0.5">
                  {isBn
                    ? `মোট লাভ (${symbol} ${formatVal(grossProfit)}) থেকে সব খরচ বাদ দেওয়ার পর নিট মুনাফা অর্জিত হয়েছে।`
                    : `Gross Profit covers all operating expenses with a positive net profit margin of ${netMarginPercent}%.`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-white/70 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                🟢 {isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {symbol} {formatVal(netProfit)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-slate-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ব্রেক-ইভেন অবস্থা (Break-Even)' : 'Break-Even Status'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isBn ? 'মোট লাভ ও মোট খরচের পরিমাণ সমান।' : 'Gross profit equals operating expenses exactly.'}
                </p>
              </div>
            </div>
            <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{symbol} 0</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CORE PROFIT & LOSS METRICS GRID (Required 6 Essential Financial Items) */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isBn ? 'মূল আর্থিক নির্দেশকসমূহ (Financial KPI Overview)' : 'Financial Breakdown Overview'}
            </h4>
            <span className="text-[11px] text-slate-400">
              {isBn ? 'সূত্র: নিট লাভ = মোট লাভ - খরচ' : 'Net Profit = Gross Profit - Expenses'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* 1. Total Sales */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                1. {isBn ? 'মোট বিক্রয় (Total Sales)' : 'Total Sales'}
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {symbol} {formatVal(totalSales)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {filteredSales.length} {isBn ? 'টি চালান' : 'invoices'}
              </span>
            </div>

            {/* 2. Cost of Goods Sold (COGS) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                2. {isBn ? 'বিক্রিত পণ্যের খরচ (COGS)' : 'Cost of Goods Sold'}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-300 mt-1 block">
                {symbol} {formatVal(costOfGoodsSold)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {isBn ? 'পণ্যের মোট কেনা দাম' : 'Item buying cost'}
              </span>
            </div>

            {/* 3. Gross Profit */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase block">
                3. {isBn ? 'মোট লাভ (Gross Profit)' : 'Gross Profit'}
              </span>
              <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {symbol} {formatVal(grossProfit)}
              </span>
              <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 block mt-0.5 font-medium">
                {grossMarginPercent}% {isBn ? 'মার্জিন' : 'margin'}
              </span>
            </div>

            {/* 4. Total Expenses */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                4. {isBn ? 'মোট খরচ (Total Expenses)' : 'Total Expenses'}
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {symbol} {formatVal(totalExpenses)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {filteredExpenses.length} {isBn ? 'টি এন্ট্রি' : 'expense entries'}
              </span>
            </div>

            {/* 5. Net Profit */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isProfit
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">
                5. {isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {symbol} {formatVal(netProfit)}
              </span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block mt-0.5">
                {isProfit ? `${netMarginPercent}% ${isBn ? 'মুনাফা' : 'margin'}` : isBn ? 'লাভ হয়নি' : 'No profit'}
              </span>
            </div>

            {/* 6. Net Loss (Total Loss) */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isLoss
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">
                6. {isBn ? 'নিট ক্ষতি (Net Loss)' : 'Net Loss'}
              </span>
              <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                {symbol} {formatVal(netLoss)}
              </span>
              <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80 block mt-0.5">
                {isLoss ? (isBn ? '🔴 ক্ষতি হয়েছে' : '🔴 Net loss incurred') : isBn ? 'ক্ষতি হয়নি' : 'No loss'}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Cumulative Financial Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">
              {isBn ? 'নতুন বকেয়া (এই পিরিয়ডে)' : 'Period New Due Created'}
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {symbol} {formatVal(periodNewDue)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">
              {isBn ? 'কাস্টমার বকেয়া (পাওনা)' : 'Total Customer Receivable'}
            </span>
            <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
              {symbol} {formatVal(metrics?.totalDueCustomers)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">
              {isBn ? 'সাপ্লায়ার বকেয়া (দেনা)' : 'Supplier Payable Due'}
            </span>
            <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400 mt-0.5 block">
              {symbol} {formatVal(metrics?.totalDueSuppliers)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">
              {isBn ? 'মওজুদ স্টক খরচ মূল্য' : 'Inventory Cost Value'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {symbol} {formatVal(metrics?.totalInventoryCostValue)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">
              {isBn ? 'মোট ক্যাশ ব্যালেন্স' : 'Current Cash Balance'}
            </span>
            <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {symbol} {formatVal(metrics?.totalBalance)}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DETAILED VIEW TABS (Income Statement Ledger, Sales Log, Expenses Log)  */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 mb-4 pb-2">
            <button
              onClick={() => setActiveTab('statement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'statement'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'ইনকাম স্টেটমেন্ট (P&L Ledger)' : 'Income Statement Ledger'}
            </button>
            <button
              onClick={() => setActiveTab('sales_breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sales_breakdown'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'বিক্রয় ও লাভ লগ' : 'Sales & Margins Log'} ({filteredSales.length})
            </button>
            <button
              onClick={() => setActiveTab('expense_breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'expense_breakdown'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'খরচের তালিকা' : 'Expense Breakdown'} ({filteredExpenses.length})
            </button>
          </div>

          {/* TAB 1: FORMAL INCOME STATEMENT TABLE */}
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3 sm:p-4">{isBn ? 'হিসাবের বিবরণ (Line Item)' : 'Account Line Item'}</th>
                      <th className="p-3 sm:p-4 text-center">{isBn ? 'অপারেশন' : 'Formula'}</th>
                      <th className="p-3 sm:p-4 text-right">{isBn ? 'পরিমাণ (Amount)' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {/* Revenue */}
                    <tr className="bg-white dark:bg-slate-900">
                      <td className="p-3 sm:p-4 font-bold text-slate-800 dark:text-slate-200">
                        {isBn ? '১. মোট বিক্রয় / রেভিনিউ' : '1. Total Revenue / Gross Sales'}
                      </td>
                      <td className="p-3 sm:p-4 text-center text-slate-400 font-mono">(+)</td>
                      <td className="p-3 sm:p-4 text-right font-black text-blue-600 dark:text-blue-400">
                        {symbol} {formatVal(totalSales)}
                      </td>
                    </tr>

                    {/* COGS */}
                    <tr className="bg-white dark:bg-slate-900">
                      <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-400 pl-6">
                        {isBn ? '২. বিক্রিত পণ্যের ক্রয়মূল্য (Cost of Goods Sold)' : '2. Less: Cost of Goods Sold (COGS)'}
                      </td>
                      <td className="p-3 sm:p-4 text-center text-slate-400 font-mono">(-)</td>
                      <td className="p-3 sm:p-4 text-right font-bold text-slate-600 dark:text-slate-400">
                        {symbol} {formatVal(costOfGoodsSold)}
                      </td>
                    </tr>

                    {/* Gross Profit Subtotal */}
                    <tr className="bg-indigo-50/40 dark:bg-indigo-950/20 font-bold">
                      <td className="p-3 sm:p-4 text-indigo-900 dark:text-indigo-200">
                        {isBn ? '৩. মোট লাভ (Gross Profit)' : '3. Gross Profit (Sales - COGS)'}
                      </td>
                      <td className="p-3 sm:p-4 text-center text-indigo-600 font-mono">(=)</td>
                      <td className="p-3 sm:p-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                        {symbol} {formatVal(grossProfit)}
                      </td>
                    </tr>

                    {/* Operating Expenses */}
                    <tr className="bg-white dark:bg-slate-900">
                      <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-400 pl-6">
                        {isBn ? '৪. মোট অপারেটিং খরচ (Operating Expenses)' : '4. Less: Operating Expenses'}
                      </td>
                      <td className="p-3 sm:p-4 text-center text-slate-400 font-mono">(-)</td>
                      <td className="p-3 sm:p-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {symbol} {formatVal(totalExpenses)}
                      </td>
                    </tr>

                    {/* Final Net Outcome Row */}
                    <tr
                      className={`${
                        isLoss
                          ? 'bg-rose-500/10 dark:bg-rose-950/40 border-t-2 border-rose-500'
                          : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-t-2 border-emerald-500'
                      }`}
                    >
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        {isLoss ? (
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <span>🔴 {isBn ? 'নিট ক্ষতি (Net Loss)' : 'Net Loss (Total Loss)'}</span>
                            <span className="text-xs font-normal">
                              ({isBn ? 'মোট খরচ মোট লাভের চেয়ে বেশি' : 'Expenses exceed Gross Profit'})
                            </span>
                          </div>
                        ) : isProfit ? (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <span>🟢 {isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}</span>
                            <span className="text-xs font-normal">
                              ({isBn ? 'মুনাফা মার্জিন' : 'Profit Margin'}: {netMarginPercent}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">
                            {isBn ? 'ব্রেক-ইভেন (Break-Even)' : 'Break-Even Result'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono font-bold">(=)</td>
                      <td
                        className={`p-4 text-right font-black text-lg sm:text-xl ${
                          isLoss
                            ? 'text-rose-600 dark:text-rose-400'
                            : isProfit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isLoss ? `${symbol} ${formatVal(netLoss)}` : `${symbol} ${formatVal(netProfit)}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Categorized Expense Breakdown Summary */}
              {Object.keys(expensesByCategory).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isBn ? 'খরচের ক্যাটাগরি বিশ্লেষণ' : 'Operating Expenses by Category'}
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(expensesByCategory).map(([cat, amt]) => (
                      <div
                        key={cat}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                      >
                        <span className="text-slate-500 dark:text-slate-400 block truncate">{cat}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                          {symbol} {formatVal(amt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALES & GROSS MARGIN PER INVOICE */}
          {activeTab === 'sales_breakdown' && (
            <div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Sale Price</th>
                      <th className="p-3 text-right">COGS</th>
                      <th className="p-3 text-right">Gross Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          {isBn ? 'এই সময়ে কোন বিক্রয় নেই' : 'No sales records found in this period.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((s) => {
                        const saleBuyingCost = s.items.reduce(
                          (sum, item) => sum + (Number(item.buyingPrice) || 0) * (Number(item.quantity) || 1),
                          0
                        );
                        const saleGrossMargin = s.total - saleBuyingCost;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{s.invoiceNo}</td>
                            <td className="p-3 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{s.customerName}</td>
                            <td className="p-3 text-slate-500">{s.items.length} items</td>
                            <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                              {symbol} {formatVal(s.total)}
                            </td>
                            <td className="p-3 text-right text-slate-500">
                              {symbol} {formatVal(saleBuyingCost)}
                            </td>
                            <td
                              className={`p-3 text-right font-black ${
                                saleGrossMargin >= 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {symbol} {formatVal(saleGrossMargin)}
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

          {/* TAB 3: EXPENSE BREAKDOWN LOG */}
          {activeTab === 'expense_breakdown' && (
            <div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Method</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          {isBn ? 'এই সময়ে কোন খরচের তথ্য নেই' : 'No expenses recorded in this period.'}
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                              {e.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{e.title}</td>
                          <td className="p-3 text-slate-500">{e.paymentMethod}</td>
                          <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400">
                            {symbol} {formatVal(e.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

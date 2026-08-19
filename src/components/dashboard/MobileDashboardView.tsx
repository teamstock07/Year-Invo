import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import {
  Zap,
  ShoppingCart,
  Package,
  Users,
  ShoppingBag,
  FileSpreadsheet,
  Wallet,
  Boxes,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Receipt,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  Truck,
  BarChart3,
  Activity,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Coins,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const MobileDashboardView: React.FC = () => {
  const {
    metrics,
    settings,
    user,
    setActiveTab,
    products,
    sales,
    expenses,
    customers,
    language,
    t,
    formatNumber,
    formatCurrency,
    dashboardPreferences,
  } = useApp();

  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  // Analytics timeframe filter
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Activity Tab State
  const [activeActivityTab, setActiveActivityTab] = useState<'sales' | 'customers' | 'expenses'>('sales');

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    quickActions: true,
    analytics: true,
    alerts: true,
    activity: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatAmount = (amt: number | undefined | null) => {
    if (amt === undefined || amt === null || isNaN(Number(amt))) return '0';
    return Number(amt).toLocaleString();
  };

  const rawStore = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawStore) || rawStore || 'YearInvo Store';
  const planName = user?.subscriptionPlan || 'Free';

  // Compute today's order count
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date && s.date.startsWith(todayStr));
  const todaySalesCount = todaySales.length > 0 ? todaySales.length : (sales.length > 0 ? Math.min(sales.length, 5) : 0);

  // Filter low stock and expired items
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockAlert);
  const expiredProducts = products.filter(
    (p) =>
      p.status === 'expired' ||
      (p.expiryDate && new Date(p.expiryDate) <= new Date())
  );

  // Due customers count
  const dueCustomers = customers.filter((c) => (c.dueAmount || 0) > 0);

  // 7-Day & Monthly Sales Chart Data
  const weeklyData = [
    { day: isBn ? 'সোম' : 'Mon', sales: Math.round(metrics.todaySales * 0.4), profit: Math.round(metrics.todayProfit * 0.4) },
    { day: isBn ? 'মঙ্গল' : 'Tue', sales: Math.round(metrics.todaySales * 0.6), profit: Math.round(metrics.todayProfit * 0.5) },
    { day: isBn ? 'বুধ' : 'Wed', sales: Math.round(metrics.todaySales * 0.5), profit: Math.round(metrics.todayProfit * 0.45) },
    { day: isBn ? 'বৃহঃ' : 'Thu', sales: Math.round(metrics.todaySales * 0.8), profit: Math.round(metrics.todayProfit * 0.75) },
    { day: isBn ? 'শুক্র' : 'Fri', sales: Math.round(metrics.todaySales * 0.9), profit: Math.round(metrics.todayProfit * 0.85) },
    { day: isBn ? 'শনি' : 'Sat', sales: Math.round(metrics.todaySales * 0.7), profit: Math.round(metrics.todayProfit * 0.6) },
    { day: isBn ? 'রবি' : 'Sun', sales: metrics.todaySales, profit: metrics.todayProfit },
  ];

  const monthlyData = [
    { day: isBn ? 'সপ্তাহ ১' : 'W1', sales: Math.round(metrics.monthlySales * 0.2), profit: Math.round(metrics.monthlySales * 0.05) },
    { day: isBn ? 'সপ্তাহ ২' : 'W2', sales: Math.round(metrics.monthlySales * 0.28), profit: Math.round(metrics.monthlySales * 0.07) },
    { day: isBn ? 'সপ্তাহ ৩' : 'W3', sales: Math.round(metrics.monthlySales * 0.22), profit: Math.round(metrics.monthlySales * 0.06) },
    { day: isBn ? 'সপ্তাহ ৪' : 'W4', sales: Math.round(metrics.monthlySales * 0.3), profit: Math.round(metrics.monthlySales * 0.08) },
  ];

  const chartData = analyticsTimeframe === 'weekly' ? weeklyData : monthlyData;

  // 2x4 Quick Action Grid
  const rawQuickActions = [
    ...(dashboardPreferences?.quickSale !== false ? [{
      id: 'quicksale',
      label: isBn ? 'কুইক সেল' : 'Quick Sale',
      icon: Zap,
      gradient: 'from-[#ff5c01] to-amber-500',
      textColor: 'text-[#ff5c01]',
      badge: isBn ? 'দ্রুত' : 'Fast',
    }] : []),
    ...(dashboardPreferences?.pos !== false ? [{
      id: 'pos',
      label: isBn ? 'POS কাউন্টার' : 'POS Register',
      icon: ShoppingCart,
      gradient: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-500',
    }] : []),
    ...(dashboardPreferences?.products !== false ? [{
      id: 'products',
      label: isBn ? 'প্রোডাক্টস' : 'Products',
      icon: Package,
      gradient: 'from-indigo-500 to-purple-600',
      textColor: 'text-indigo-500',
    }] : []),
    ...(dashboardPreferences?.customers !== false ? [{
      id: 'customers',
      label: isBn ? 'কাস্টমার' : 'Customers',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-500',
    }] : []),
    ...(dashboardPreferences?.purchases !== false ? [{
      id: 'purchases',
      label: isBn ? 'পারচেজ/ক্রয়' : 'Purchases',
      icon: Truck,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-500',
    }] : []),
    ...(dashboardPreferences?.reports !== false ? [{
      id: 'reports',
      label: isBn ? 'রিপোর্ট' : 'Reports',
      icon: FileSpreadsheet,
      gradient: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-500',
    }] : []),
    ...(dashboardPreferences?.expenses !== false ? [{
      id: 'expenses',
      label: isBn ? 'খরচের হিসাব' : 'Expenses',
      icon: Wallet,
      gradient: 'from-rose-500 to-red-600',
      textColor: 'text-rose-500',
    }] : []),
    ...(dashboardPreferences?.products !== false && dashboardPreferences?.stockManagement !== false ? [{
      id: 'stock',
      label: isBn ? 'স্টক অডিট' : 'Stock',
      icon: Boxes,
      gradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-500',
    }] : []),
  ];

  const quickActions = rawQuickActions;

  const currentDateFormatted = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-3.5 pb-24 pt-1 px-1.5 xs:px-2 sm:px-4 max-w-lg mx-auto select-none">
      
      {/* ========================================================= */}
      {/* 1. WELCOME CARD (Fintech Gradient & Glassmorphism)        */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#130f24] to-[#1c0e0b] dark:from-[#09090b] dark:via-[#110d1f] dark:to-[#170a06] border border-white/10 dark:border-slate-800 p-4 sm:p-5 text-white shadow-xl shadow-purple-950/20">
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#ff5c01]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-purple-600/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-300">
                {isBn ? 'স্বাগতম,' : 'Welcome back,'}{' '}
                <span className="font-extrabold text-white">{user?.ownerName || 'Store Manager'}</span>
              </span>
            </div>

            {/* Plan Badge */}
            <button
              onClick={() => setActiveTab('subscription')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-[10px] font-black text-amber-300 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{planName}</span>
            </button>
          </div>

          {/* Store Title */}
          <div className="flex items-end justify-between gap-3 pt-0.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isBn ? 'মাই বিজনেস স্টোর' : 'Active Merchant Store'}
              </p>
              <h1 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-white leading-tight truncate max-w-[280px]">
                {storeName}
              </h1>
            </div>
          </div>

          {/* Bottom Date */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3 h-3 text-[#ff5c01]" />
              <span>{currentDateFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BUSINESS SUMMARY CARD (Compact 7-Metric KPI Grid)     */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#ff5c01]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isBn ? 'বিজনেস সামারি' : 'Business Summary'}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
            {isBn ? 'আজকের পারফরম্যান্স' : "Today's Metrics"}
          </span>
        </div>

        {/* 7 Compact KPI Items in Grid - Colorful Glassmorphism */}
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
          {/* 1. Today Sales */}
          <div
            onClick={() => setActiveTab('quicksale')}
            className="relative overflow-hidden p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/15 dark:via-teal-900/20 dark:to-cyan-900/15 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {isBn ? 'আজকের বিক্রয়' : "Today's Sales"}
              </span>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingCart className="w-3 h-3" />
              </div>
            </div>
            <p className="text-xs xs:text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(metrics.todaySales)}
            </p>
          </div>

          {/* 2. Today Profit / Loss */}
          <div
            onClick={() => setActiveTab('reports')}
            className={`relative overflow-hidden p-2.5 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
              metrics.todayLoss > 0
                ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-rose-500/10 dark:from-rose-500/15 dark:via-amber-900/20 dark:to-rose-900/15 border-rose-500/25 hover:border-rose-400/60'
                : 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-teal-500/15 dark:via-emerald-900/20 dark:to-cyan-900/15 border-teal-500/25 hover:border-teal-400/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {metrics.todayLoss > 0
                  ? (isBn ? 'আজকের ক্ষতি' : "Today Loss")
                  : (isBn ? 'আজকের লাভ' : "Today Profit")}
              </span>
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 shadow-2xs text-white ${
                metrics.todayLoss > 0
                  ? 'bg-gradient-to-br from-rose-500 to-amber-600'
                  : 'bg-gradient-to-br from-teal-500 to-emerald-600'
              }`}>
                {metrics.todayLoss > 0 ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
              </div>
            </div>
            <p className={`text-xs xs:text-sm font-black truncate ${
              metrics.todayLoss > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'
            }`}>
              {metrics.todayLoss > 0 ? formatCurrency(metrics.todayLoss) : formatCurrency(metrics.todayProfit)}
            </p>
          </div>

          {/* 3. Today Orders */}
          <div
            onClick={() => setActiveTab('saleshistory')}
            className="relative overflow-hidden p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-indigo-500/10 dark:from-sky-500/15 dark:via-blue-900/20 dark:to-indigo-900/15 backdrop-blur-xl border border-sky-500/25 hover:border-sky-400/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {isBn ? 'আজকের অর্ডার' : "Orders"}
              </span>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingBag className="w-3 h-3" />
              </div>
            </div>
            <p className="text-xs xs:text-sm font-black text-slate-900 dark:text-white truncate">
              {formatNumber(todaySalesCount)} {isBn ? 'টি' : 'orders'}
            </p>
          </div>

          {/* 4. Total Products */}
          <div
            onClick={() => setActiveTab('products')}
            className="relative overflow-hidden p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-violet-500/10 dark:from-purple-500/15 dark:via-indigo-900/20 dark:to-violet-900/15 backdrop-blur-xl border border-purple-500/25 hover:border-purple-400/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {isBn ? 'প্রোডাক্টস' : 'Products'}
              </span>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Package className="w-3 h-3" />
              </div>
            </div>
            <p className="text-xs xs:text-sm font-black text-purple-600 dark:text-purple-400 truncate">
              {formatNumber(products.length)} {isBn ? 'টি' : 'items'}
            </p>
          </div>

          {/* 5. Customer Today Due */}
          <div
            onClick={() => setActiveTab('due')}
            className="relative overflow-hidden p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-500/15 dark:via-orange-900/20 dark:to-yellow-900/15 backdrop-blur-xl border border-amber-500/25 hover:border-amber-400/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {isBn ? 'আজকের বকেয়া' : "Today's Due"}
              </span>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="w-3 h-3" />
              </div>
            </div>
            <p className="text-xs xs:text-sm font-black text-amber-600 dark:text-amber-400 truncate">
              {formatCurrency(metrics.todayDue)}
            </p>
          </div>

          {/* 6. Stock Alert */}
          <div
            onClick={() => setActiveTab('stock')}
            className="relative overflow-hidden p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-500/15 dark:via-orange-900/20 dark:to-rose-900/15 backdrop-blur-xl border border-amber-500/25 hover:border-amber-400/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {isBn ? 'স্টক অ্যালার্ট' : 'Stock Alert'}
              </span>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <AlertTriangle className="w-3 h-3" />
              </div>
            </div>
            <p className={`text-xs xs:text-sm font-black truncate ${metrics.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {formatNumber(metrics.lowStockCount)} {isBn ? 'টি কম' : 'low'}
            </p>
          </div>
        </div>

        {/* 7th Summary Strip: Subscription Status */}
        <div
          onClick={() => setActiveTab('subscription')}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-slate-900/10 dark:from-purple-950/30 dark:to-slate-950/50 border border-purple-500/20 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {isBn ? 'প্ল্যান স্ট্যাটাস:' : 'Subscription Plan:'} <span className="text-purple-600 dark:text-purple-400 font-extrabold">{planName}</span>
              </p>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'আনলিমিটেড অ্যাকসেস ও ক্লাউড সিঙ্ক ফিচার সক্রিয়' : 'Full access to POS, Invoices & Analytics'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-500 shrink-0" />
        </div>

        {/* Capital & Investment Strip */}
        {dashboardPreferences?.capitalInvestment !== false && (
          <div
            onClick={() => setActiveTab('capital-investment')}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 dark:from-amber-950/30 dark:to-slate-950/50 border border-amber-500/25 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {isBn ? 'বর্তমান মূলধন:' : 'Current Capital:'}{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                    {formatCurrency(metrics.currentCapital || 0)}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? `মোট বিনিয়োগ: ${formatCurrency(metrics.totalInvestedCapital || 0)} | উত্তোলন: ${formatCurrency(metrics.totalWithdrawnCapital || 0)}`
                    : `Invested: ${formatCurrency(metrics.totalInvestedCapital || 0)} | Withdrawn: ${formatCurrency(metrics.totalWithdrawnCapital || 0)}`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK ACTIONS (2 x 4 Premium Button Grid)             */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#ff5c01]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isBn ? 'কুইক অ্যাকশন' : 'Quick Actions'}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#ff5c01]">2×4 Grid</span>
        </div>

        {/* 2 Rows x 4 Columns */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => setActiveTab(act.id)}
                className="group relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#ff5c01]/40 active:scale-90 transition-all cursor-pointer shadow-2xs"
              >
                {act.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#ff5c01] text-white text-[8px] font-black uppercase tracking-tighter shadow-xs">
                    {act.badge}
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${act.gradient} text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform mb-1.5`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight line-clamp-1">
                  {act.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ANALYTICS & CHARTS SECTION                              */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isBn ? 'সেলস এনালাইটিক্স' : 'Sales Analytics'}
            </h2>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl text-[10px] font-extrabold">
            <button
              onClick={() => setAnalyticsTimeframe('weekly')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                analyticsTimeframe === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setAnalyticsTimeframe('monthly')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                analyticsTimeframe === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              1M
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="mobSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5c01" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff5c01" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="mobProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0c0e',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#ff5c01"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mobSalesGrad)"
                  name={isBn ? 'বিক্রয়' : 'Sales'}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#mobProfitGrad)"
                  name={isBn ? 'লাভ' : 'Profit'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5c01]" />
              <span>{isBn ? 'মোট বিক্রয়:' : 'Total Sales:'} <span className="text-[#ff5c01]">{symbol}{formatAmount(metrics.monthlySales)}</span></span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{isBn ? 'মোট লাভ:' : 'Net Profit:'} <span className="text-emerald-500">{symbol}{formatAmount(metrics.monthlyProfit)}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. COLORFUL ALERT CARDS (Low Stock, Expired, Due, Orders)  */}
      {/* ========================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isBn ? 'জরুরী অ্যালার্ট সমূহ' : 'Critical Business Alerts'}
            </h2>
          </div>
        </div>

        {/* Alert 1: Low Stock */}
        <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                {isBn ? 'লো-স্টক প্রোডাক্ট অ্যালার্ট' : 'Low Stock Warning'}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate">
                {lowStockProducts.length > 0
                  ? `${lowStockProducts.length} ${isBn ? 'টি আইটেমের স্টক শেষের পথে' : 'items below minimum threshold'}`
                  : (isBn ? 'সকল প্রোডাক্টের স্টক পর্যাপ্ত' : 'Inventory levels healthy')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm hover:bg-amber-400 active:scale-95 transition-transform shrink-0 cursor-pointer"
          >
            {isBn ? 'রিস্টক' : 'Restock'}
          </button>
        </div>

        {/* Alert 2: Expired Products */}
        <div className="rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                {isBn ? 'মেয়াদোত্তীর্ণ পণ্য অ্যালার্ট' : 'Expiry Date Alert'}
              </p>
              <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium truncate">
                {expiredProducts.length > 0
                  ? `${expiredProducts.length} ${isBn ? 'টি আইটেমের মেয়াদ শেষ' : 'items near or past expiry'}`
                  : (isBn ? 'কোন মেয়াদোত্তীর্ণ পণ্য নেই' : 'No expired items logged')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('expired')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-[10px] shadow-sm hover:bg-rose-500 active:scale-95 transition-transform shrink-0 cursor-pointer"
          >
            {isBn ? 'চেক করুন' : 'Inspect'}
          </button>
        </div>

        {/* Alert 3: Pending Customer Due */}
        <div className="rounded-2xl bg-orange-500/10 dark:bg-orange-950/30 border border-orange-500/30 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                {isBn ? 'কাস্টমার বাকী অ্যালার্ট' : 'Pending Dues Collect'}
              </p>
              <p className="text-[10px] text-orange-700 dark:text-orange-300 font-medium truncate">
                {symbol}{formatAmount(metrics.totalDueCustomers)} ({dueCustomers.length} {isBn ? 'জন গ্রাহক' : 'due accounts'})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('due')}
            className="px-3 py-1.5 rounded-xl bg-[#ff5c01] text-white font-black text-[10px] shadow-sm hover:bg-[#e05100] active:scale-95 transition-transform shrink-0 cursor-pointer"
          >
            {isBn ? 'আদায়' : 'Collect'}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. RECENT ACTIVITY STREAM (Sales, Expenses, Customers)    */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#ff5c01]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {isBn ? 'সাম্প্রতিক এক্টিভিটি' : 'Recent Activity Stream'}
            </h2>
          </div>

          {/* Activity Category Tab Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl text-[10px] font-extrabold">
            <button
              onClick={() => setActiveActivityTab('sales')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeActivityTab === 'sales'
                  ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isBn ? 'বিক্রয়' : 'Sales'}
            </button>
            <button
              onClick={() => setActiveActivityTab('expenses')}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                activeActivityTab === 'expenses'
                  ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isBn ? 'খরচ' : 'Expenses'}
            </button>
          </div>
        </div>

        {/* Tab Content: Sales */}
        {activeActivityTab === 'sales' && (
          <div className="space-y-2">
            {sales.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                onClick={() => setActiveTab('saleshistory')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {sale.invoiceNo}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                      {sale.paymentMethod || 'Cash'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {sale.customerName || 'Walk-in Customer'} • {sale.items?.length || 1} {isBn ? 'টি আইটেম' : 'items'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {symbol} {formatAmount(sale.total)}
                  </p>
                  <p className="text-[9px] font-medium text-slate-400">
                    {sale.date ? sale.date.split('T')[0] : 'Today'}
                  </p>
                </div>
              </div>
            ))}

            {sales.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isBn ? 'এখনো কোনো বিক্রয় রেকর্ড নেই' : 'No sales activity recorded yet.'}
              </p>
            )}

            <button
              onClick={() => setActiveTab('saleshistory')}
              className="w-full py-2 text-center text-[11px] font-bold text-[#ff5c01] hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isBn ? 'সকল বিক্রয় ইনভয়েস দেখুন' : 'View Full Sales History'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content: Expenses */}
        {activeActivityTab === 'expenses' && (
          <div className="space-y-2">
            {expenses.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                onClick={() => setActiveTab('expenses')}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {exp.category || exp.description || 'Expense'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {exp.date} • {exp.note || 'Store Operational'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-rose-500">
                    -{symbol} {formatAmount(exp.amount)}
                  </p>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isBn ? 'এখনো কোনো খরচের রেকর্ড নেই' : 'No expense entries recorded yet.'}
              </p>
            )}

            <button
              onClick={() => setActiveTab('expenses')}
              className="w-full py-2 text-center text-[11px] font-bold text-[#ff5c01] hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isBn ? 'সকল খরচের হিসাব দেখুন' : 'Manage Expenses'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

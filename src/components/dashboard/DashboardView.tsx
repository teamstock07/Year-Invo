import React from 'react';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import { MobileDashboardView } from './MobileDashboardView';
import {
  TrendingUp,
  Receipt,
  Boxes,
  CreditCard,
  ShoppingCart,
  ShoppingBag,
  FileSpreadsheet,
  Tags,
  QrCode,
  Sparkles,
  Settings,
  AlertTriangle,
  Wallet,
  Store,
  Crown,
  Users,
  Truck,
  ArrowUpRight,
  PlusCircle,
  Package,
  Zap,
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

export const DashboardView: React.FC = () => {
  const { metrics, settings, user, setActiveTab, t, products, language } = useApp();
  const symbol = settings.currency || '৳';
  const planName = user?.subscriptionPlan || 'Free';

  // Dynamic Chart data based on actual sales or zeroed out
  const salesChartData = [
    { day: 'Mon', sales: 0, profit: 0 },
    { day: 'Tue', sales: 0, profit: 0 },
    { day: 'Wed', sales: 0, profit: 0 },
    { day: 'Thu', sales: 0, profit: 0 },
    { day: 'Fri', sales: 0, profit: 0 },
    { day: 'Sat', sales: 0, profit: 0 },
    { day: 'Sun', sales: metrics.todaySales, profit: metrics.todayProfit },
  ];

  const calcBalance = metrics.todaySales - metrics.todayExpense;
  const formatAmount = (amt: number) => (amt === 0 ? '0' : amt.toLocaleString());

  const rawStore = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawStore) || rawStore || 'Your Store Name';

  // 6 Metric Cards
  const metricCards = [
    {
      id: 'balance',
      label: language === 'bn' ? 'মোট ব্যালেন্স' : 'Current Balance',
      value: `${symbol} ${formatAmount(calcBalance)}`,
      icon: Wallet,
      color: 'text-[#ff5c01]',
      bg: 'bg-[#ff5c01]/10',
    },
    {
      id: 'sales',
      label: t('todaySales'),
      value: `${symbol} ${formatAmount(metrics.todaySales)}`,
      icon: ShoppingCart,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'expense',
      label: t('todayExpense'),
      value: `${symbol} ${formatAmount(metrics.todayExpense)}`,
      icon: Receipt,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      id: 'profit',
      label: t('todayProfit'),
      value: `${symbol} ${formatAmount(metrics.todayProfit)}`,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      id: 'due',
      label: t('totalDueCustomers'),
      value: `${symbol} ${formatAmount(metrics.totalDueCustomers)}`,
      icon: CreditCard,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      tab: 'due',
    },
    {
      id: 'stock',
      label: language === 'bn' ? 'মোট প্রোডাক্ট স্টক' : 'Total Product Stock',
      value: `${metrics.totalStockQty === 0 ? '0' : metrics.totalStockQty.toLocaleString()} pcs`,
      icon: Boxes,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      tab: 'stock',
    },
  ];

  // Grouped Feature Sections
  const featureGroups = [
    {
      title: language === 'bn' ? 'সেলস ও কাউন্টার (Sales & POS)' : 'Sales & POS Modes',
      items: [
        {
          id: 'quicksale',
          title: language === 'bn' ? '⚡ কুইক সেল' : 'Quick Sale',
          desc: language === 'bn' ? 'ক্ষুদ্র ব্যবসার জন্য দ্রুত চেকআউট' : 'Simple & fast checkout for small businesses',
          icon: PlusCircle,
          color: 'from-amber-500 to-[#ff5c01]',
        },
        {
          id: 'pos',
          title: language === 'bn' ? '🛒 POS কাউন্টার' : 'POS Register',
          desc: language === 'bn' ? 'সুপারমার্কেট এর জন্য অ্যাডভান্সড POS' : 'Complete POS with barcode & receipt print',
          icon: ShoppingCart,
          color: 'from-sky-500 to-blue-600',
        },
        {
          id: 'saleshistory',
          title: language === 'bn' ? '🧾 সেলস হিস্টোরি' : 'Sales History',
          desc: language === 'bn' ? 'সকল ইনভয়েস ও রিসিপ্ট রেকর্ড' : 'View past transactions & invoice receipts',
          icon: ShoppingBag,
          color: 'from-emerald-500 to-teal-600',
        },
        {
          id: 'due',
          title: language === 'bn' ? '💳 কাস্টমার বাকি (Due)' : 'Customer Dues',
          desc: language === 'bn' ? 'বকেয়া ট্র্যাকিং ও কালেকশন' : 'Track customer balance & due ledger',
          icon: CreditCard,
          color: 'from-amber-500 to-orange-600',
        },
      ],
    },
    {
      title: language === 'bn' ? 'ইনভেন্টরি ও প্রোডাক্ট (Inventory)' : 'Inventory & Catalog',
      items: [
        {
          id: 'products',
          title: language === 'bn' ? '📦 প্রোডাক্টস লিস্ট' : 'Product Catalog',
          desc: language === 'bn' ? 'আইটেম যোগ ও দাম ম্যানেজ করুন' : 'Manage items, prices, barcodes & stock',
          icon: Package,
          color: 'from-indigo-500 to-purple-600',
        },
        {
          id: 'categories',
          title: language === 'bn' ? '🏷️ ক্যাটাগরি' : 'Categories',
          desc: language === 'bn' ? 'পণ্যের ক্যাটাগরি সাজান' : 'Organize inventory by product categories',
          icon: Tags,
          color: 'from-teal-500 to-cyan-600',
        },
        {
          id: 'stock',
          title: language === 'bn' ? '🏪 স্টক ম্যানেজমেন্ট' : 'Stock Audit & Alert',
          desc: language === 'bn' ? 'স্টক কাউন্ট ও লো-স্টক এলার্ট' : 'Monitor stock levels & reorder alerts',
          icon: Boxes,
          color: 'from-violet-500 to-pink-600',
        },
        {
          id: 'expired',
          title: language === 'bn' ? '⚠️ মেয়ার্দউত্তীর্ণ প্রোডাক্ট' : 'Expired Items',
          desc: language === 'bn' ? 'এক্সপায়ারি ডেট ট্র্যাকার' : 'Identify & clear expiring inventory',
          icon: AlertTriangle,
          color: 'from-rose-500 to-red-600',
        },
      ],
    },
    {
      title: language === 'bn' ? 'হিসাব ও রিপোর্ট (Analytics)' : 'Reports & Tools',
      items: [
        {
          id: 'reports',
          title: language === 'bn' ? '📊 বিজনেস রিপোর্ট' : 'Profit & Loss Reports',
          desc: language === 'bn' ? 'লাভ-ক্ষতি ও স্টেটমেন্ট' : 'Sales analytics & profit breakdown',
          icon: FileSpreadsheet,
          color: 'from-blue-500 to-cyan-600',
        },
        {
          id: 'barcode',
          title: language === 'bn' ? '🏷️ বারকোড ও QR জেনারেটর' : 'Barcode & QR Code',
          desc: language === 'bn' ? 'বারকোড ও কিউআর লেবেল প্রিন্ট' : 'Generate thermal barcode sticker labels',
          icon: QrCode,
          color: 'from-[#ff5c01] to-amber-600',
        },
        {
          id: 'settings',
          title: language === 'bn' ? '⚙️ সিস্টেম সেটিংস' : 'Store Settings',
          desc: language === 'bn' ? 'স্টোর নাম ও ইনভয়েস কাস্টমাইজ' : 'Configure store profile & print headers',
          icon: Settings,
          color: 'from-[#ff5c01] to-red-600',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Dashboard (< md) */}
      <div className="block md:hidden">
        <MobileDashboardView />
      </div>

      {/* Desktop & Tablet Dashboard (>= md) */}
      <div className="hidden md:block space-y-6 pb-12">
      {/* Modern SaaS Header & Welcome Section */}
      <div className="bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Small Text: Welcome Back, {User Name} */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Welcome Back, <span className="font-bold text-slate-700 dark:text-slate-200">{user?.ownerName || 'Ariful Islam'}</span>
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ● Live
            </span>
          </div>

          {/* Large Heading: {Store Name} - Most Prominent */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {storeName}
          </h1>

          {/* Below Store Name: Managing your business with Year Invo by Year Media */}
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed space-y-0.5">
            <p>Managing your business with <span className="font-bold text-[#ff5c01]">Year Invo</span></p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">by Year Media</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => setActiveTab('quicksale')}
            className="bg-[#ff5c01] hover:bg-[#e05100] text-white px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ff5c01]/25 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Sale</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 cursor-pointer whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS System</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#E8EEF2] dark:border-slate-700 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#ff5c01]" />
            <span>View Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 cursor-pointer whitespace-nowrap"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>

      {/* Upgrade Plan Hero Promo Banner Card */}
      {planName === 'Free' && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-800/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Unlock POS System, Barcode Scanner &amp; QR Payments
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Upgrade to Pro or Premium plan to run full supermarket POS counters and print barcode stickers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('subscription')}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg whitespace-nowrap cursor-pointer z-10 shrink-0"
          >
            🚀 Upgrade Plan Now
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => card.tab && setActiveTab(card.tab)}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all ${
                card.tab ? 'cursor-pointer hover:-translate-y-0.5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{card.value}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart & Stock Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'বিক্রয় ও লাভ ট্রেন্ড' : 'Weekly Sales & Profit Revenue'}
              </h3>
              <p className="text-[11px] text-slate-400">7-Day Sales Performance</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5c01]"></span> Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Profit
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5c01" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff5c01" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0c0e',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ff5c01" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Alert Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
              <span>{language === 'bn' ? 'স্টক নোটিফিকেশন' : 'Inventory Alerts'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">
                {metrics.lowStockCount} Low Stock
              </span>
            </h3>

            <div className="space-y-2.5">
              {products.filter((p) => p.currentStock <= p.minStockAlert).slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E8EEF2] dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.currentStock} {p.unit} remaining</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('stock')}
                    className="text-[10px] font-bold text-[#ff5c01] hover:underline"
                  >
                    REORDER
                  </button>
                </div>
              ))}
              {products.filter((p) => p.currentStock <= p.minStockAlert).length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">All inventory levels are healthy.</p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#ff5c01]/10 border border-[#ff5c01]/20">
            <p className="text-[10px] font-bold text-[#ff5c01] uppercase tracking-wider">Total Stock Valuation</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {symbol} {metrics.totalInventoryCostValue === 0 ? '0' : metrics.totalInventoryCostValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Features Section Grid */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'বিজনেস মডেল ও টুলস' : 'Business Modules'}
        </h2>

        {featureGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
              {group.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md shadow-[#ff5c01]/10 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#ff5c01] transition-colors" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#ff5c01] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
};

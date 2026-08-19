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
  Calendar,
  Award,
  ShieldCheck,
  Banknote,
  Coins,
  Activity,
  TrendingDown,
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
  const { metrics, settings, user, setActiveTab, t, products, language, formatNumber, formatCurrency, dashboardPreferences } = useApp();
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

  const rawStore = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawStore) || rawStore || 'Your Store Name';

  // 6 Metric Cards with Premium Glassmorphism & Soft Glow
  const metricCards = [
    {
      id: 'balance',
      label: t('totalBalance') || (language === 'bn' ? 'মোট ব্যালেন্স' : 'Current Balance'),
      value: formatCurrency(calcBalance),
      icon: Wallet,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 text-white',
      cardBg: 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-500/15 dark:via-indigo-900/20 dark:to-cyan-900/15',
      border: 'border-blue-500/25 hover:border-blue-400/60 dark:border-blue-500/30 dark:hover:border-blue-400/70',
      glow: 'from-blue-500/20 to-indigo-500/20',
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'sales',
      label: t('todaySales'),
      value: formatCurrency(metrics.todaySales),
      icon: ShoppingCart,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30 text-white',
      cardBg: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/15 dark:via-teal-900/20 dark:to-cyan-900/15',
      border: 'border-emerald-500/25 hover:border-emerald-400/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/70',
      glow: 'from-emerald-500/20 to-teal-500/20',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'expense',
      label: t('todayExpense'),
      value: formatCurrency(metrics.todayExpense),
      icon: Receipt,
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/30 text-white',
      cardBg: 'bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-rose-500/15 dark:via-pink-900/20 dark:to-purple-900/15',
      border: 'border-rose-500/25 hover:border-rose-400/60 dark:border-rose-500/30 dark:hover:border-rose-400/70',
      glow: 'from-rose-500/20 to-pink-500/20',
      accentColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'profit',
      label: metrics.todayLoss > 0
        ? (language === 'bn' ? 'আজকের ক্ষতি (Loss)' : "Today's Loss")
        : (t('todayProfit') || (language === 'bn' ? 'আজকের লাভ (Profit)' : "Today's Profit")),
      value: metrics.todayLoss > 0 ? formatCurrency(metrics.todayLoss) : formatCurrency(metrics.todayProfit),
      icon: metrics.todayLoss > 0 ? AlertTriangle : TrendingUp,
      iconBg: metrics.todayLoss > 0
        ? 'bg-gradient-to-br from-rose-500 to-amber-600 shadow-md shadow-rose-500/30 text-white'
        : 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/30 text-white',
      cardBg: metrics.todayLoss > 0
        ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-rose-500/10 dark:from-rose-500/15 dark:via-amber-900/20 dark:to-rose-900/15'
        : 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-teal-500/15 dark:via-emerald-900/20 dark:to-cyan-900/15',
      border: metrics.todayLoss > 0
        ? 'border-rose-500/25 hover:border-rose-400/60 dark:border-rose-500/30 dark:hover:border-rose-400/70'
        : 'border-teal-500/25 hover:border-teal-400/60 dark:border-teal-500/30 dark:hover:border-teal-400/70',
      glow: metrics.todayLoss > 0 ? 'from-rose-500/20 to-amber-500/20' : 'from-teal-500/20 to-emerald-500/20',
      accentColor: metrics.todayLoss > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400',
      tab: 'reports',
    },
    {
      id: 'due',
      label: t('todayDue') || (language === 'bn' ? 'আজকের বকেয়া' : "Today's Due"),
      value: formatCurrency(metrics.todayDue),
      icon: CreditCard,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/30 text-white',
      cardBg: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-500/15 dark:via-orange-900/20 dark:to-yellow-900/15',
      border: 'border-amber-500/25 hover:border-amber-400/60 dark:border-amber-500/30 dark:hover:border-amber-400/70',
      glow: 'from-amber-500/20 to-orange-500/20',
      accentColor: 'text-amber-600 dark:text-amber-400',
      tab: 'due',
    },
    {
      id: 'stock',
      label: t('stockQty') || (language === 'bn' ? 'মোট প্রোডাক্ট স্টক' : 'Total Product Stock'),
      value: `${formatNumber(metrics.totalStockQty)} pcs`,
      icon: Boxes,
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30 text-white',
      cardBg: 'bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-violet-500/10 dark:from-purple-500/15 dark:via-indigo-900/20 dark:to-violet-900/15',
      border: 'border-purple-500/25 hover:border-purple-400/60 dark:border-purple-500/30 dark:hover:border-purple-400/70',
      glow: 'from-purple-500/20 to-indigo-500/20',
      accentColor: 'text-purple-600 dark:text-purple-400',
      tab: 'stock',
    },
  ];

  const isProductsOn = dashboardPreferences?.products !== false;

  // Grouped Feature Sections
  const rawFeatureGroups = [
    {
      title: language === 'bn' ? 'সেলস ও কাউন্টার (Sales & POS)' : 'Sales & POS Modes',
      items: [
        ...(dashboardPreferences?.quickSale !== false ? [{
          id: 'quicksale',
          title: language === 'bn' ? '⚡ কুইক সেল' : 'Quick Sale',
          desc: language === 'bn' ? 'ক্ষুদ্র ব্যবসার জন্য দ্রুত চেকআউট' : 'Simple & fast checkout for small businesses',
          icon: PlusCircle,
          color: 'from-amber-500 to-[#ff5c01]',
        }] : []),
        ...(dashboardPreferences?.pos !== false ? [{
          id: 'pos',
          title: language === 'bn' ? '🛒 POS কাউন্টার' : 'POS Register',
          desc: language === 'bn' ? 'সুপারমার্কেট এর জন্য অ্যাডভান্সড POS' : 'Complete POS with barcode & receipt print',
          icon: ShoppingCart,
          color: 'from-sky-500 to-blue-600',
        }] : []),
        ...(dashboardPreferences?.salesHistory !== false ? [{
          id: 'saleshistory',
          title: language === 'bn' ? '🧾 সেলস হিস্টোরি' : 'Sales History',
          desc: language === 'bn' ? 'সকল ইনভয়েস ও রিসিপ্ট record' : 'View past transactions & invoice receipts',
          icon: ShoppingBag,
          color: 'from-emerald-500 to-teal-600',
        }] : []),
        ...(dashboardPreferences?.dueManagement !== false ? [{
          id: 'due',
          title: language === 'bn' ? '💳 কাস্টমার বাকি (Due)' : 'Customer Dues',
          desc: language === 'bn' ? 'বকেয়া ট্র্যাকিং ও কালেকশন' : 'Track customer balance & due ledger',
          icon: CreditCard,
          color: 'from-amber-500 to-orange-600',
        }] : []),
      ],
    },
    {
      title: language === 'bn' ? 'ইনভেন্টরি ও প্রোডাক্ট (Inventory)' : 'Inventory & Catalog',
      items: [
        ...(isProductsOn ? [{
          id: 'products',
          title: language === 'bn' ? '📦 প্রোডাক্টস লিস্ট' : 'Product Catalog',
          desc: language === 'bn' ? 'আইটেম যোগ ও দাম ম্যানেজ করুন' : 'Manage items, prices, barcodes & stock',
          icon: Package,
          color: 'from-indigo-500 to-purple-600',
        }] : []),
        ...(isProductsOn && dashboardPreferences?.categories !== false ? [{
          id: 'categories',
          title: language === 'bn' ? '🏷️ ক্যাটাগরি' : 'Categories',
          desc: language === 'bn' ? 'পণ্যের ক্যাটাগরি সাজান' : 'Organize inventory by product categories',
          icon: Tags,
          color: 'from-teal-500 to-cyan-600',
        }] : []),
        ...(isProductsOn && dashboardPreferences?.stockManagement !== false ? [{
          id: 'stock',
          title: language === 'bn' ? '🏪 স্টক ম্যানেজমেন্ট' : 'Stock Management',
          desc: language === 'bn' ? 'স্টক অডিট, সমন্বয় ও মুভমেন্ট লগ' : 'Real-time stock, adjustments & movement ledger',
          icon: Boxes,
          color: 'from-amber-500 to-orange-600',
        }] : []),
        ...(isProductsOn && dashboardPreferences?.purchases !== false ? [{
          id: 'purchases',
          title: language === 'bn' ? '🛍️ সাপ্লায়ার পারচেজ' : 'Purchases & Invoices',
          desc: language === 'bn' ? 'ক্রয় চালান, ইনভয়েস ও সাপ্লায়ার বাকি' : 'Supplier purchases, invoices & vendor dues',
          icon: ShoppingBag,
          color: 'from-blue-600 to-indigo-700',
        }] : []),
        ...(isProductsOn && dashboardPreferences?.smartReorder !== false ? [{
          id: 'smart-reorder',
          title: language === 'bn' ? 'স্মার্ট রি-অর্ডার' : 'Smart Reorder',
          desc: language === 'bn' ? 'সেলস ভেলোসিটি ও অটো পারচেজ' : 'Sales velocity & stock replenishment',
          icon: Sparkles,
          color: 'from-amber-500 to-emerald-600',
        }] : []),
        ...(dashboardPreferences?.customerLoyalty !== false ? [{
          id: 'loyalty',
          title: language === 'bn' ? 'কাস্টমার লয়্যালটি' : 'Customer Loyalty',
          desc: language === 'bn' ? 'পয়েন্ট আর্ন ও ডিসকাউন্ট রিডিম' : 'Loyalty tiers, points & cashback rewards',
          icon: Award,
          color: 'from-pink-500 to-rose-600',
        }] : []),
        ...(dashboardPreferences?.expiryManagement !== false ? [{
          id: 'expired',
          title: language === 'bn' ? 'মেয়াদোত্তীর্ণ পণ্য' : 'Expired Items',
          desc: language === 'bn' ? 'এক্সপায়ারি ডেট ট্র্যাকার' : 'Identify & clear expiring inventory',
          icon: AlertTriangle,
          color: 'from-rose-500 to-red-600',
        }] : []),
      ],
    },
    {
      title: language === 'bn' ? 'টিম ও পে-রোল' : 'Team & Payroll',
      items: [
        ...(dashboardPreferences?.payroll !== false ? [{
          id: 'payroll',
          title: language === 'bn' ? 'এমপ্লয়ি পে-রোল' : 'Employee Payroll',
          desc: language === 'bn' ? 'বেতন হিসাব, অগ্রিম ও পে-রোল হিস্টোরি' : 'Manage employee salary, advances & slips',
          icon: Banknote,
          color: 'from-emerald-500 to-green-600',
        }] : []),
        ...(dashboardPreferences?.teamManagement !== false ? [{
          id: 'team',
          title: language === 'bn' ? 'টিম ম্যানেজমেন্ট' : 'Team Management',
          desc: language === 'bn' ? 'ক্যাশিয়ার, ম্যানেজার ও রোল কন্ট্রোল' : 'Role-based permissions & invitations',
          icon: ShieldCheck,
          color: 'from-blue-500 to-indigo-600',
        }] : []),
        ...(dashboardPreferences?.auditLog !== false ? [{
          id: 'audit-log',
          title: language === 'bn' ? 'অডিট লগ' : 'Audit Log',
          desc: language === 'bn' ? 'প্রতিটি এক্টিভিটি ও পে-রোল লগ রেকর্ড' : 'Track all staff actions & financial edits',
          icon: Activity,
          color: 'from-slate-600 to-slate-800',
        }] : []),
      ],
    },
    {
      title: language === 'bn' ? 'হিসাব ও রিপোর্ট' : 'Reports & Analytics',
      items: [
        ...(dashboardPreferences?.capitalInvestment !== false ? [{
          id: 'capital-investment',
          title: language === 'bn' ? '💰 মূলধন ও বিনিয়োগ' : 'Capital & Investment',
          desc: language === 'bn' ? 'ব্যবসায়ের মূলধন ও বিনিয়োগ ট্র্যাকার' : 'Track invested capital & owner withdrawals',
          icon: Coins,
          color: 'from-amber-500 to-orange-600',
        }] : []),
        ...(dashboardPreferences?.reports !== false ? [{
          id: 'reports',
          title: language === 'bn' ? 'লাভ ও ক্ষতি' : 'Profit & Loss',
          desc: language === 'bn' ? 'লাভ-ক্ষতি ও স্টেটমেন্ট' : 'Sales analytics & profit breakdown',
          icon: FileSpreadsheet,
          color: 'from-blue-500 to-cyan-600',
        }] : []),
        ...(dashboardPreferences?.salesCalendar !== false ? [{
          id: 'sales-calendar',
          title: language === 'bn' ? 'সেলস ক্যালেন্ডার' : 'Sales Calendar',
          desc: language === 'bn' ? 'মাসিক ক্যালেন্ডার ভিউ ও ড্রিলডাউন' : 'Daily sales breakdown on calendar view',
          icon: Calendar,
          color: 'from-purple-500 to-indigo-600',
        }] : []),
        ...(dashboardPreferences?.barcode !== false ? [{
          id: 'barcode',
          title: language === 'bn' ? '🏷️ বারকোড ও QR জেনারেটর' : 'Barcode & QR Code',
          desc: language === 'bn' ? 'বারকোড ও কিউআর লেবেল প্রিন্ট' : 'Generate thermal barcode sticker labels',
          icon: QrCode,
          color: 'from-[#ff5c01] to-amber-600',
        }] : []),
        {
          id: 'settings',
          title: language === 'bn' ? '⚙️ সিস্টেম সেটিংস' : 'Store Settings',
          desc: language === 'bn' ? 'স্টোর নাম ও ইনভয়েস কাস্টমাইজ' : 'Configure store profile & print headers',
          icon: Settings,
          color: 'from-[#ff5c01] to-red-600',
        },
      ],
    },
  ].filter((group) => group.items.length > 0);

  const featureGroups = rawFeatureGroups;

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
            <span>{t('navPos') || 'POS & Sell'}</span>
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
                Unlock POS &amp; Sell, Barcode Scanner &amp; QR Payments
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Upgrade to Pro or Premium plan to run full supermarket POS &amp; Sell counters and print barcode stickers.
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

      {/* Metric Cards Grid - Colorful Glassmorphism & Soft Glow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => card.tab && setActiveTab(card.tab)}
              className={`relative overflow-hidden p-4 rounded-2xl ${card.cardBg} backdrop-blur-xl border ${card.border} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group select-none ${
                card.tab ? 'cursor-pointer' : ''
              }`}
            >
              {/* Glass Top Specular Highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

              {/* Ambient Soft Glow Orb */}
              <div
                className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-gradient-to-br ${card.glow} blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 pointer-events-none`}
              />

              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {card.value}
                </p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Capital & Investment Overview Card (Isolated from P&L) */}
      {dashboardPreferences?.capitalInvestment !== false && (
        <div
          onClick={() => setActiveTab('capital-investment')}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-600/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border border-amber-500/30 hover:border-amber-400/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 group-hover:scale-105 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'bn' ? 'মূলধন ও বিনিয়োগ ওভারভিউ' : 'Capital & Investment'}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {metrics.investmentCount || 0} {language === 'bn' ? 'বিনিয়োগ' : 'Investments'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'ব্যবসায়ের মূলধন বিক্রয় ও লাভ-ক্ষতি থেকে সম্পূর্ণ আলাদাভাবে সংরক্ষিত'
                    : 'Track business owner investments & withdrawals independently from profit/loss'}
                </p>
              </div>
            </div>

            {/* Metrics pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'মোট বিনিয়োগ' : 'Total Invested'}
                </p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(metrics.totalInvestedCapital || 0)}
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/20 shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'মূলধন উত্তোলন' : 'Total Withdrawn'}
                </p>
                <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(metrics.totalWithdrawnCapital || 0)}
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
                <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wider">
                  {language === 'bn' ? 'বর্তমান মূলধন' : 'Current Capital'}
                </p>
                <p className="text-sm font-black text-white">
                  {formatCurrency(metrics.currentCapital || 0)}
                </p>
              </div>

              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Trend Chart & Stock Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'বিক্রয় ও লাভ ট্রেন্ড' : 'Weekly Sales & Profit Revenue'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">7-Day Sales Performance</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
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
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ff5c01" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Alert Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
              <span>{language === 'bn' ? 'স্টক নোটিফিকেশন' : 'Inventory Alerts'}</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                {metrics.lowStockCount} Low Stock
              </span>
            </h3>

            <div className="space-y-2.5">
              {products.filter((p) => p.currentStock <= p.minStockAlert).slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.currentStock} {p.unit} remaining</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">All inventory levels are healthy.</p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Stock Valuation (Cost)</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {symbol} {(metrics?.totalInventoryCostValue || 0).toLocaleString()}
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
                    className="p-5 rounded-2xl glass-card glass-hover cursor-pointer group"
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

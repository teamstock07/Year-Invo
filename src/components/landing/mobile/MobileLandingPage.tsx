import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../../context/AppContext';
import { MainWebsiteLogo } from '../../common/MainWebsiteLogo';
import { getDisplayBrandName } from '../../../utils/brand';
import { Language } from '../../../types';
import { calculatePlanPricing, BillingCycle } from '../../../config/pricing';
import { getCurrencySymbol, normalizeCurrencyCode } from '../../../services/currencyService';
import {
  Bell,
  User,
  Menu,
  X,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Package,
  CreditCard,
  BarChart3,
  ShoppingCart,
  QrCode,
  CheckCircle2,
  Globe,
  DollarSign,
  Moon,
  Sun,
  LogIn,
  Check,
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  Send,
  Building2,
  Lock,
  Award,
  BookOpen,
  Printer,
  Heart,
  ChevronRight,
  Activity,
  Layers,
  Boxes,
  Users,
  Truck,
  Smartphone,
  FileSpreadsheet,
} from 'lucide-react';

interface MobileLandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const MobileLandingPage: React.FC<MobileLandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
}) => {
  const { settings, updateSettings, language, setLanguage, theme, toggleTheme, exchangeRates } = useApp();
  const isBn = language === 'bn';
  const displayCurrency = settings.currency || '৳';
  const isBDT = normalizeCurrencyCode(displayCurrency) === 'BDT';
  const symbol = getCurrencySymbol(displayCurrency);

  // Mobile Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Pricing State
  const [selectedPlanTab, setSelectedPlanTab] = useState<'free' | 'pro' | 'premium'>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Notification Toast State
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Smooth scroll handler for mobile section links
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setDrawerOpen(false);
    const element = document.getElementById(`mobile-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSent(true);
      setTimeout(() => {
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setContactSent(false);
      }, 4000);
    }
  };

  const getPrice = (monthlyAmount: number) => {
    if (monthlyAmount === 0) return '0';
    const amount = billingCycle === 'yearly' ? Math.round(monthlyAmount * 10) : monthlyAmount;
    return amount.toLocaleString();
  };

  // Mobile Feature Items
  const features = [
    {
      id: 'quicksale',
      title: isBn ? 'কুইক সেল ও ক্যাশ কাউন্টার' : 'Quick Sale & Cash Register',
      desc: isBn
        ? 'মাত্র ৩ ক্লিকে ক্যাশ, কার্ড বা মোবাইল ব্যাংকিংয়ে সেল সম্পন্ন করুন। দ্রুততম ডিজিটাল কাস্টমার রসিদ।'
        : 'Process cash, card, or mobile wallet sales in 3 clicks with digital receipt generation.',
      icon: Zap,
      gradient: 'from-[#ff5c01] to-amber-500',
      badge: isBn ? 'ইনস্ট্যান্ট' : 'Instant',
    },
    {
      id: 'pos',
      title: isBn ? 'হাই-স্পীড POS বারকোড সিস্টেম' : 'High-Speed POS Terminal',
      desc: isBn
        ? 'বারকোড স্ক্যানার দিয়ে স্ক্যান করুন, ডিসকাউন্ট যুক্ত করুন এবং থার্মাল মেমো প্রিন্ট করুন।'
        : 'Scan barcodes with handheld hardware scanners and print thermal invoices instantly.',
      icon: ShoppingCart,
      gradient: 'from-sky-500 to-blue-600',
      badge: 'POS Ready',
    },
    {
      id: 'product',
      title: isBn ? 'প্রোডাক্ট ও ভ্যারিয়েন্ট ক্যাটালগ' : 'Product & Variant Catalog',
      desc: isBn
        ? 'সাইজ, কালার, ক্যাটাগরি ও ব্র্যান্ড অনুযায়ী প্রোডাক্ট যুক্ত ও ট্র্যাক করুন।'
        : 'Manage items with custom SKU, category, brand, cost price, and selling price.',
      icon: Package,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'stock',
      title: isBn ? 'স্মার্ট স্টক ও লো-স্টক অ্যালার্ট' : 'Smart Stock Reorder Alert',
      desc: isBn
        ? 'স্টক কমে গেলে বা শূন্য হলে সিস্টেম আপনাকে সতর্ক করবে।'
        : 'Automatic alerts when inventory reaches minimum reorder threshold.',
      icon: Boxes,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'barcode',
      title: isBn ? 'বারকোড ও QR স্টিকার প্রিন্টার' : 'Barcode Sticker Generator',
      desc: isBn
        ? 'Code128 স্টিকারে প্রোডাক্টের নাম ও প্রাইস জেনারেট করে থার্মাল প্রিন্টারে প্রিন্ট করুন।'
        : 'Generate Code128 barcodes with store name & price for thermal sticker rolls.',
      icon: QrCode,
      gradient: 'from-purple-500 to-pink-600',
      badge: 'Thermal Print',
    },
    {
      id: 'reports',
      title: isBn ? 'সেলস ও প্রফিট রিপোর্ট' : 'Sales & Profit Reports',
      desc: isBn
        ? 'দৈনিক ও মাসিক অটোম্যাটিক বিক্রি, খরচ এবং নিট লাভের বিস্তারিত হিসাব।'
        : 'Real-time sales summaries, cost of goods sold, and net profit analytics.',
      icon: FileSpreadsheet,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'customers',
      title: isBn ? 'কাস্টমার ডিরেক্টরি ও বাকী খাতা' : 'Customer Due Khata Ledger',
      desc: isBn
        ? 'গ্রাহকদের বকেয়ার হিসাব ও ডিজিটাল পেমেন্ট ট্র্যাকিং।'
        : 'Track customer ledger, pending due balance, and partial payment history.',
      icon: Users,
      gradient: 'from-teal-500 to-[#10B981]',
    },
    {
      id: 'mobile',
      title: isBn ? '১০০% মোবাইল সাশ ড্যাশবোর্ড' : '100% Mobile SaaS App',
      desc: isBn
        ? 'স্মার্টফোন থেকে এক হাতেই পুরো দোকান পরিচালনা ও ক্লাউড সিঙ্ক।'
        : 'Optimized touch interface designed for mobile phones on the go.',
      icon: Smartphone,
      gradient: 'from-[#ff5c01] to-rose-500',
      badge: 'Mobile Optimized',
    },
  ];

  const getPlanPricing = (planId: string) => {
    if (planId === 'free') {
      return {
        amount: isBDT ? '৳০' : `${symbol}0`,
        note: isBn ? '১ মাসের জন্য ফ্রি' : 'Free for 1 Month',
        subtext: isBn ? 'ফ্রি ট্রায়াল' : '1 Month Free Trial',
      };
    }

    const plan = planId === 'pro' ? 'Pro' : 'Premium';
    const calculated = calculatePlanPricing(
      plan,
      billingCycle,
      isBDT,
      displayCurrency,
      exchangeRates,
      language
    );

    let note = '';
    let subtext = '';

    if (billingCycle === 'monthly') {
      note = isBn ? '/মাস' : '/month';
      subtext = isBDT
        ? (planId === 'pro' ? (isBn ? 'নিয়মিত মাসিক প্ল্যান' : 'Standard Monthly Plan') : (isBn ? 'চেইন শপ ও আনলিমিটেড ব্রাঞ্চ' : 'Unrestricted Multi-Branch Power'))
        : (isBn ? 'স্ট্যান্ডার্ড মাসিক বিলিং' : 'Standard monthly billing');
    } else if (billingCycle === 'yearly') {
      note = isBn ? '/বছর' : '/year';
      subtext = isBn
        ? `${calculated.effectiveMonthlyFormatted}/মাস হিসেবে গণনা`
        : `Equivalent to ${calculated.effectiveMonthlyFormatted}/mo`;
    } else if (billingCycle === 'five_year') {
      note = isBn ? '/৫ বছর' : '/5 years';
      subtext = isBn
        ? `${calculated.effectiveMonthlyFormatted}/মাস (৬০ মাসের মোট প্যাকেজ)`
        : `Equivalent to ${calculated.effectiveMonthlyFormatted}/mo (60-mo bundle)`;
    }

    return {
      amount: calculated.totalFormatted,
      note,
      subtext,
    };
  };

  // Mobile Pricing Tiers
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: isBn ? 'ফ্রি ১ মাস' : '1 Month Free Trial',
      desc: isBn ? 'ছোট ব্যবসার জন্য ১ মাসের ফ্রি ট্রায়াল' : 'Perfect for small retail shops with 1 month free trial',
      features: [
        isBn ? '১টি শোরুম / দোকান শাখা' : '1 Store Branch',
        isBn ? 'সর্বোচ্চ ১০০টি প্রোডাক্ট' : 'Up to 100 Products',
        isBn ? 'স্ট্যান্ডার্ড POS ক্যাশ কাউন্টার' : 'Standard POS Checkout Terminal',
        isBn ? 'কাস্টমার বাকী খাতা' : 'Customer Due Ledger',
        isBn ? 'দৈনিক সেভার ক্লাউড ব্যাকআপ' : 'Daily Cloud Sync',
      ],
      buttonText: isBn ? '১ মাসের ফ্রী অ্যাকাউন্ট খুলুন' : 'Start 1 Month Free Trial',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Business',
      badge: isBn ? 'সবচেয়ে জনপ্রিয়' : 'MOST POPULAR',
      desc: isBn ? 'আনলিমিটেড প্রোডাক্ট ও বারকোড প্রিন্টিং' : 'Best for growing retail stores with unlimited inventory',
      features: [
        isBn ? 'আনলিমিটেড প্রোডাক্ট ও ভ্যারিয়েন্ট' : 'Unlimited Products & Variants',
        isBn ? 'হাই-স্পীড বারকোড স্টিকার প্রিন্ট' : 'High-Speed Barcode Label Printing',
        isBn ? 'থার্মাল মেমো ইনভয়েস প্রিন্ট' : 'Thermal Invoice Printing',
        isBn ? 'কাস্টমার ও সাপ্লায়ার বাকী খাতা' : 'Customer & Supplier Ledger',
        isBn ? 'স্টক ও মেয়ার্দ উত্তীর্ণ অ্যালার্ট' : 'Stock & Expiry Alerts',
        isBn ? 'মাল্টি-স্টাফ ম্যানেজার রোলস' : 'Multi-Staff Manager Roles',
      ],
      buttonText: isBn ? 'প্রো প্ল্যানে যোগ দিন' : 'Get Started Pro',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium Enterprise',
      badge: isBn ? 'সুপারস্টার' : 'ENTERPRISE',
      desc: isBn ? 'একাধিক শাখা ও সুপারমার্কেটের জন্য' : 'For multi-branch chains & high-volume supermarkets',
      features: [
        isBn ? 'আনলিমিটেড দোকান শাখা (Multi-Branch)' : 'Unlimited Store Branches',
        isBn ? 'এআই স্মার্ট লাভ ও ইনভেন্টরি প্রিডিক্টর' : 'AI Profit & Sales Predictor',
        isBn ? 'কাস্টম ডোমেইন ও লোগো ব্র্যান্ডিং' : 'Custom Branding & Domain',
        isBn ? '২৪/৭ সাপোর্ট ও ডিডিকেটেড সাপোর্ট' : '24/7 Priority Support',
      ],
      buttonText: isBn ? 'প্রিমিয়াম প্ল্যান বেছে নিন' : 'Get Started Premium',
      popular: false,
    },
  ];

  // Mobile FAQs
  const faqs = [
    {
      q: isBn ? 'YearInvo কি ফোনে ভালো কাজ করে?' : 'Does YearInvo work on smartphones?',
      a: isBn
        ? 'হ্যাঁ! এটি ১০০% মোবাইল ফ্রেন্ডলি। আপনিযেকোনো অ্যানড্রয়েড বা আইফোনের ব্রাউজার থেকে অ্যাপের মতো চালাতে পারবেন।'
        : 'Yes! YearInvo is fully optimized for mobile devices with a touch-friendly interface for one-handed operation.',
    },
    {
      q: isBn ? 'বারকোড স্ক্যান করা কি ফোনে সম্ভব?' : 'Can I print barcodes from my mobile phone?',
      a: isBn
        ? 'হ্যাঁ, মোবাইল বা ল্যাপটপে থার্মাল প্রিন্টার কানেক্ট করে সহজেই Code128 বারকোড ও ইনভয়েস প্রিন্ট করতে পারবেন।'
        : 'Yes, you can generate Code128 thermal sticker labels and print directly to thermal receipt printers.',
    },
    {
      q: isBn ? 'ডাটা কি হারিয়ে যাবে?' : 'Is my store data safe in the cloud?',
      a: isBn
        ? 'না, গুগল ফায়ারবেস সিকিউর ক্লাউড ডাটাবেসে আপনার সকল হিসাব শতভাগ সংরক্ষিত ও এনক্রিপ্টেড থাকে।'
        : 'Your store data is continuously backed up using Google Firebase Cloud encryption and strict authentication.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden pb-12 selection:bg-purple-500 selection:text-white">
      
      {/* ========================================================= */}
      {/* 1. NEW CLEAN MOBILE HEADER                                 */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 h-14 flex items-center justify-between shadow-2xs">
        
        {/* Left Side: Brand Logo & Name */}
        <div
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-transform"
        >
          <MainWebsiteLogo
            size={28}
            customUrl={settings.siteLogoUrl}
            siteName={settings.siteBrandName || 'YearInvo'}
            subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                {settings.siteBrandName || 'YearInvo'}
              </span>
              <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-purple-500/10 dark:bg-[#ff5c01]/20 text-purple-700 dark:text-[#ff8038] border border-purple-500/20">
                POS
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 leading-tight">
              {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
            </span>
          </div>
        </div>

        {/* Right Side: Notification Icon + Profile/Login Icon + Menu Icon */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Notification Icon */}
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 relative active:scale-90 transition-transform cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {/* Profile / Login Quick Icon */}
          <button
            onClick={onOpenLogin}
            className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 dark:text-[#ff8038] border border-purple-500/20 flex items-center justify-center font-bold active:scale-90 transition-transform cursor-pointer"
            title="Login to Store"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Menu Icon (☰) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#ff5c01] text-white flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-[#ff5c01]/30 cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Quick Notification Toast Drawer */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 left-4 z-50 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between text-xs backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">YearInvo v2.4 Live Cloud System</p>
                <p className="text-[10px] text-slate-400">1 Month Free Starter Plan active for retail merchants.</p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. MOBILE DRAWER MENU                                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Slide-In Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[320px] bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto p-5"
            >
              <div className="space-y-6">
                
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MainWebsiteLogo
                      size={28}
                      customUrl={settings.siteLogoUrl}
                      siteName={settings.siteBrandName || 'YearInvo'}
                      subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
                    />
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {settings.siteBrandName || 'YearInvo'}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400">
                        {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2">
                    {isBn ? 'মেনু লিংক' : 'NAVIGATION'}
                  </p>

                  {[
                    { id: 'home', label: isBn ? 'হোম' : 'Home', icon: Sparkles },
                    { id: 'features', label: isBn ? 'ফিচার সমূহ' : 'Features', icon: Zap },
                    { id: 'pricing', label: isBn ? 'সাবস্ক্রিপশন প্ল্যান' : 'Subscription', icon: DollarSign },
                    { id: 'about', label: isBn ? 'আমাদের কথা' : 'About', icon: Building2 },
                    { id: 'support', label: isBn ? 'সাপোর্ট ও সাহায্য' : 'Support', icon: HelpCircle },
                    { id: 'contact', label: isBn ? 'যোগাযোগ' : 'Contact', icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSection === item.id
                            ? 'bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#ff8038] border border-purple-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-purple-500" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    );
                  })}
                </div>

                {/* Organized Settings & Controls Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                    {isBn ? 'সেটিংস ও প্রেফারেন্স' : 'SETTINGS & PREFERENCES'}
                  </p>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <span>{isBn ? 'ভাষা (Language)' : 'Language'}</span>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-extrabold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="bn">BN (বাংলা)</option>
                      <option value="en">EN (English)</option>
                      <option value="ar">AR (عربي)</option>
                      <option value="hi">HI (हिंदी)</option>
                      <option value="ur">UR (اردو)</option>
                    </select>
                  </div>

                  {/* Currency Selector */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>{isBn ? 'মুদ্রা (Currency)' : 'Currency'}</span>
                    </div>
                    <select
                      value={settings.currency || '৳'}
                      onChange={(e) => updateSettings({ currency: e.target.value })}
                      className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-extrabold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="৳">৳ BDT</option>
                      <option value="$">$ USD</option>
                      <option value="€">€ EUR</option>
                      <option value="د.إ">د.إ AED</option>
                      <option value="₹">₹ INR</option>
                      <option value="Rs">Rs PKR</option>
                      <option value="¥">¥ JPY</option>
                      <option value="£">£ GBP</option>
                      <option value="﷼">﷼ SAR</option>
                    </select>
                  </div>

                  {/* Light / Dark Mode Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                      {theme === 'light' ? (
                        <Moon className="w-4 h-4 text-slate-700" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{theme === 'light' ? 'Light Theme' : 'Dark Theme'}</span>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1 rounded-lg bg-[#ff5c01] text-white text-[10px] font-black uppercase cursor-pointer"
                    >
                      {theme === 'light' ? 'Switch Dark' : 'Switch Light'}
                    </button>
                  </div>

                </div>

              </div>

              {/* Bottom Action Buttons inside Drawer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-500" />
                  <span>{isBn ? 'দোকানে লগইন করুন' : 'Log In to Store'}</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenSignup();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#ff5c01] text-white font-black text-xs shadow-lg shadow-[#ff5c01]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{isBn ? 'ফ্রি স্টোর তৈরি করুন' : 'Create Free Account'}</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. HERO SECTION (Mobile First)                             */}
      {/* ========================================================= */}
      <section id="mobile-home" className="pt-6 pb-10 px-4 space-y-6 relative overflow-hidden">
        
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-72 bg-gradient-to-b from-purple-500/15 via-indigo-500/5 to-transparent blur-2xl pointer-events-none -z-10 rounded-full" />

        {/* Top Highlight Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-[#ff8038] text-[10px] font-black border border-purple-500/20 shadow-2xs">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
          <span>{isBn ? '১০০% ফ্রি প্ল্যান • ক্লাউড ইনভেন্টরি' : '100% FREE STARTER • CLOUD POS'}</span>
        </div>

        {/* Small Illustration Graphic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xl relative overflow-hidden space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live POS Cash Terminal
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-extrabold">{symbol}2,450.00</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-extrabold">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 uppercase text-[8px] block">Today Sales</span>
              <span className="text-slate-900 dark:text-white text-xs">{symbol}48,500</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 uppercase text-[8px] block">Net Profit</span>
              <span className="text-purple-600 dark:text-[#ff8038] text-xs">{symbol}9,350</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2.5 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {isBn ? (
              <>
                আধুনিক খুচরা দোকানের <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5c01] to-indigo-500">
                  স্মার্ট POS ও ইনভেন্টরি
                </span>
              </>
            ) : (
              <>
                Modern Retail POS &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5c01] to-indigo-500">
                  Smart Inventory
                </span>
              </>
            )}
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {isBn
              ? 'দ্রুত বিলিং, অটো স্টক অ্যালার্ট, বকেয়া খাতা ট্র্যাকিং ও থার্মাল বারকোড প্রিন্ট — এক হাত দিয়েই মোবাইল থেকে পরিচালনা করুন।'
              : 'Fast POS billing, automatic stock alerts, customer due khata, and thermal barcode stickers — accessible from any smartphone.'}
          </p>
        </div>

        {/* CTA Buttons (Vertical Stack for Mobile Thumbs) */}
        <div className="space-y-2.5 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenSignup}
            className="w-full py-3.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-black rounded-2xl text-xs shadow-lg shadow-[#ff5c01]/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{isBn ? 'ফ্রি স্টোর তৈরি করুন' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLogin}
            className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isBn ? 'লাইভ ডেমো ও লগইন' : 'Explore Live Demo'}</span>
          </motion.button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-slate-900 dark:text-white">5,000+</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Stores</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-purple-600 dark:text-[#ff8038]">{symbol}150M+</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Sales</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-emerald-500">99.9%</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Uptime</p>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 4. FEATURES (Mobile Vertical Scroll)                      */}
      {/* ========================================================= */}
      <section id="mobile-features" className="py-8 px-4 bg-slate-100/70 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800/80 space-y-5">
        
        <div className="space-y-1 text-center">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-[#ff8038] text-[10px] font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'স্মার্ট ফিচারসমূহ' : 'MOBILE FEATURES'}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'দোকানের সবকিছু এক জায়গায়' : 'Everything Needed for Your Store'}
          </h2>
        </div>

        {/* Vertical Stack of Feature Cards */}
        <div className="space-y-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feat.gradient} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                    {feat.badge && (
                      <span className="px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-black uppercase text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================= */}
      {/* 5. PRICING (Mobile Focused Card View)                      */}
      {/* ========================================================= */}
      <section id="mobile-pricing" className="py-8 px-4 space-y-5">
        
        <div className="space-y-2 text-center">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-[#ff8038] text-[10px] font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'প্রাইসিং প্ল্যান' : 'PRICING TIERS'}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'সাশ্রয়ী সাবস্ক্রিপশন প্ল্যান' : 'Affordable SaaS Plans'}
          </h2>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-[10px] gap-0.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-2.5 py-1 font-black rounded-lg cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isBn ? 'মাসিক' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-2.5 py-1 font-black rounded-lg cursor-pointer flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-[#ff5c01] text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{isBn ? '১ বছর' : '1-Yr'}</span>
              <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black">
                {isBn ? '৫০% ছাড়' : '50%'}
              </span>
            </button>
            <button
              onClick={() => setBillingCycle('five_year')}
              className={`px-2.5 py-1 font-black rounded-lg cursor-pointer flex items-center gap-1 ${
                billingCycle === 'five_year'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{isBn ? '৫ বছর' : '5-Yr'}</span>
              <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black">
                {isBn ? '২৫% ছাড়' : '25%'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Plan Tab Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-black">
          <button
            onClick={() => setSelectedPlanTab('free')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              selectedPlanTab === 'free'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setSelectedPlanTab('pro')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center relative ${
              selectedPlanTab === 'pro'
                ? 'bg-[#ff5c01] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Pro 🔥
          </button>
          <button
            onClick={() => setSelectedPlanTab('premium')}
            className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
              selectedPlanTab === 'premium'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Premium
          </button>
        </div>

        {/* Display Single Active Mobile Plan Card */}
        {pricingPlans
          .filter((p) => p.id === selectedPlanTab)
          .map((plan) => {
            const pricingInfo = getPlanPricing(plan.id);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 ${
                  plan.popular ? 'border-[#ff5c01] shadow-xl' : 'border-slate-200 dark:border-slate-800'
                } space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#ff5c01] dark:text-[#ff8038] block">
                      {plan.badge}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {pricingInfo.amount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block">{pricingInfo.note}</span>
                    {pricingInfo.subtext && (
                      <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 block mt-0.5">
                        {pricingInfo.subtext}
                      </span>
                    )}
                  </div>
                </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{plan.desc}</p>

              {/* Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400">Included Features:</p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenSignup}
                className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  plan.popular
                    ? 'bg-[#ff5c01] text-white shadow-lg shadow-[#ff5c01]/30'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}

      </section>

      {/* ========================================================= */}
      {/* 6. ABOUT (Compact Mobile Section)                          */}
      {/* ========================================================= */}
      <section id="mobile-about" className="py-8 px-4 bg-slate-100/70 dark:bg-slate-950/80 border-y border-slate-200 dark:border-slate-800/80 space-y-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-[#ff8038] text-[10px] font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'পরিচিতি' : 'ABOUT US'}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            YearInvo by Year Media
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {isBn
              ? 'YearInvo হলো খুচরা দোকানদার ও মার্চেন্টদের জন্য একটি আধুনিক ক্লাউড সফটওয়্যার, যা কেনাবেচা, ইনভেন্টরি, বারকোড স্টিকার প্রিন্ট ও বকেয়া খাতাকে শতভাগ সহজ করে দেয়।'
              : 'YearInvo by Year Media is a cloud POS and inventory management platform designed for retail merchants.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <Lock className="w-4 h-4 text-purple-500" />
            <h4 className="font-bold text-slate-900 dark:text-white">Cloud Encrypted</h4>
            <p className="text-[10px] text-slate-400">Firebase Powered</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-slate-900 dark:text-white">Zero Hardware</h4>
            <p className="text-[10px] text-slate-400">Runs on any Phone</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. SUPPORT (Compact FAQ & Contact Mobile Section)           */}
      {/* ========================================================= */}
      <section id="mobile-support" className="py-8 px-4 space-y-5">
        
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-[#ff8038] text-[10px] font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'সাহায্য কেন্দ্র' : 'HELP & FAQ'}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'সাধারণ প্রশ্ন ও কন্টাক্ট' : 'Frequently Asked Questions'}
          </h2>
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-3.5 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-slate-600 dark:text-slate-400 text-[11px] border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Quick Form */}
        <div id="mobile-contact" className="bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            {isBn ? 'মেসেজ পাঠান' : 'Quick Message Support'}
          </h3>

          {contactSent ? (
            <p className="text-xs text-emerald-500 font-bold">✓ Message sent! We will contact you shortly.</p>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-2 text-xs">
              <input
                type="text"
                placeholder="Your Name *"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
              />
              <textarea
                rows={3}
                placeholder="Message or question..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#ff5c01] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

      </section>

      {/* ========================================================= */}
      {/* 8. MOBILE FOOTER                                          */}
      {/* ========================================================= */}
      <footer className="mt-8 pt-6 pb-8 border-t border-slate-200 dark:border-slate-800 px-4 space-y-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <MainWebsiteLogo
            size={24}
            customUrl={settings.siteLogoUrl}
            siteName={settings.siteBrandName || 'YearInvo'}
            subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
          />
          <span className="font-black text-slate-900 dark:text-white text-sm">
            {settings.siteBrandName || 'YearInvo'}
          </span>
        </div>

        <p className="text-[11px] leading-relaxed">
          {settings.siteBrandName || 'YearInvo'} {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'} • Smart POS &amp; Inventory Software
        </p>

        <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <button onClick={onOpenLogin} className="hover:underline cursor-pointer">Login</button>
          <span>•</span>
          <button onClick={onOpenSignup} className="hover:underline cursor-pointer">Sign Up</button>
          <span>•</span>
          <button onClick={() => scrollToSection('contact')} className="hover:underline cursor-pointer">Contact</button>
        </div>

        <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          © {new Date().getFullYear()} {settings.siteBrandName || 'YearInvo'}. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface LandingPricingProps {
  onOpenSignup: () => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenSignup }) => {
  const { settings, language } = useApp();
  const isBn = language === 'bn';
  const symbol = settings.currency || '৳';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (monthlyAmount: number) => {
    if (monthlyAmount === 0) return '0';
    const amount = billingCycle === 'yearly' ? Math.round(monthlyAmount * 10) : monthlyAmount;
    return amount.toLocaleString();
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: isBn ? 'ফ্রি প্ল্যান' : '100% Free Forever',
      desc: isBn
        ? 'নতুন দোকান বা ছোট ব্যবসার জন্য সম্পূর্ণ ফ্রীতে ব্যবহার করুন।'
        : 'Perfect for small retail shops starting digital store management.',
      price: getPrice(0),
      period: isBn ? 'চিরদিনের জন্য ফ্রি' : 'Forever Free',
      popular: false,
      features: [
        isBn ? '১টি শোরুম / দোকান শাখা' : '1 Store Branch',
        isBn ? 'সর্বোচ্চ ১০০টি প্রোডাক্ট যুক্ত করার সুবিধা' : 'Up to 100 Active Products',
        isBn ? 'স্ট্যান্ডার্ড POS ক্যাশ কাউন্টার' : 'Standard POS Checkout Terminal',
        isBn ? 'কাস্টমার বকেয়া খাতা ও হিসেব' : 'Customer Due Ledger',
        isBn ? 'দৈনিক সেলস ও লাভ রিপোর্ট' : 'Basic Daily Sales Summary',
        isBn ? 'নিরাপদ ক্লাউড ডাটা ব্যাকআপ' : 'Secure Cloud Data Synchronization',
      ],
      notIncluded: [
        isBn ? 'বারকোড স্টিকার প্রিন্ট জেনারেটর' : 'Barcode Sticker Printing',
        isBn ? 'মাল্টি-স্টাফ রুলস ও পারমিশন' : 'Multi-Staff Role Management',
        isBn ? 'কাস্টম লোগো ও ব্র্যান্ডিং' : 'Custom Store Logo Printing',
      ],
      buttonText: isBn ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Start Free Forever',
      buttonVariant: 'secondary',
    },
    {
      id: 'pro',
      name: 'Pro Business',
      badge: isBn ? 'সবচেয়ে জনপ্রিয়' : 'MOST POPULAR',
      desc: isBn
        ? 'মাঝারি ও দ্রুত বর্ধনশীল দোকানের সকল আধুনিক ফিচারের জন্য সেরা প্ল্যান।'
        : 'Best for growing retail stores needing unlimited products & barcode printing.',
      price: getPrice(499),
      period: billingCycle === 'yearly' ? (isBn ? '/বছর' : '/year') : (isBn ? '/মাস' : '/month'),
      popular: true,
      features: [
        isBn ? 'আনলিমিটেড প্রোডাক্ট ও ভ্যারিয়েন্ট' : 'Unlimited Active Products',
        isBn ? '১টি মূল শাখা + সাব-কাউন্টার' : '1 Main Branch + Multi-Counter POS',
        isBn ? 'হাই-স্পীড বারকোড ও QR স্টিকার প্রিন্ট' : 'High-Speed Barcode & QR Label Printing',
        isBn ? 'থার্মাল মেমো ইনভয়েস প্রিন্ট' : 'Thermal Invoice & Receipt Printing',
        isBn ? 'কাস্টমার ও সাপ্লায়ার বকেয়া ট্র্যাকিং' : 'Advanced Customer & Supplier Ledger',
        isBn ? 'স্টক অ্যালার্ট ও ডেট এক্সপায়ার্ড অ্যালার্ট' : 'Stock Reorder & Expired Product Warning',
        isBn ? 'মাল্টি-স্টাফ ম্যানেজার/স্টাফ রোলস' : 'Multi-Staff Roles & Access Controls',
        isBn ? 'Excel / PDF রিপোর্ট এক্সপোর্ট' : 'Excel & PDF Export for All Reports',
      ],
      notIncluded: [
        isBn ? 'কাস্টম ডোমেইন সংযোগ' : 'Custom Domain Connection',
      ],
      buttonText: isBn ? 'প্রো প্ল্যানে যোগ দিন' : 'Get Started Pro',
      buttonVariant: 'primary',
    },
    {
      id: 'premium',
      name: 'Premium Enterprise',
      badge: isBn ? 'প্রিমিয়াম সুপারস্টার' : 'ENTERPRISE POWER',
      desc: isBn
        ? 'একাধিক শাখা, সুপারমার্কেট এবং চেইন শপের জন্য সম্পূর্ণ পাওয়ার প্যাক।'
        : 'For large supermarkets, multi-branch chains, and wholesale businesses.',
      price: getPrice(999),
      period: billingCycle === 'yearly' ? (isBn ? '/বছর' : '/year') : (isBn ? '/মাস' : '/month'),
      popular: false,
      features: [
        isBn ? 'আনলিমিটেড দোকান শাখা (Multi-Branch)' : 'Unlimited Store Branches',
        isBn ? 'আনলিমিটেড প্রোডাক্ট ও স্টাফ অ্যাকাউন্ট' : 'Unlimited Products & Staff Accounts',
        isBn ? 'এআই স্মার্ট লাভ ও ইনভেন্টরি প্রিডিক্টর' : 'AI Smart Profit Predictor & Forecasting',
        isBn ? 'কাস্টম ডোমেইন ও নিজস্ব লোগো ব্র্যান্ডিং' : 'Custom Domain & Custom Invoice Branding',
        isBn ? 'প্রাইওরিটি ২৪/৭ ফোন ও হোয়াটসঅ্যাপ সাপোর্ট' : 'Priority 24/7 Phone & WhatsApp Support',
        isBn ? 'ডিডিকেটেড ডাটাবেস ও অটো ক্লাউড ব্যাকআপ' : 'Dedicated Database & Instant Backups',
      ],
      notIncluded: [],
      buttonText: isBn ? 'প্রিমিয়াম প্ল্যান বেছে নিন' : 'Get Started Premium',
      buttonVariant: 'accent',
    },
  ];

  return (
    <section id="pricing" className="py-12 sm:py-20 bg-white dark:bg-[#09090b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#a78bfa] text-xs font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'স্বচ্ছ ও সাশ্রয়ী প্রাইসিং' : 'TRANSPARENT SUBSCRIPTION PLANS'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn
              ? 'আপনার দোকানের জন্য সেরা প্ল্যান বেছে নিন'
              : 'Simple Plans Built for Retail Success'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            {isBn
              ? 'কোনো হিডেন চার্জ নেই। যেকোনো সময় প্ল্যান পরিবর্তন বা আপগ্রেড করতে পারবেন।'
              : 'No hidden setup fees. Upgrade or adjust your subscription anytime as your business grows.'}
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isBn ? 'মাসিক বিলিং' : 'Monthly Billing'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{isBn ? 'বার্ষিক বিলিং' : 'Annual Billing'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                {isBn ? '২০% ছাড়' : '20% OFF'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
          {plans.map((plan, index) => {
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'border-2 border-[#7C3AED] shadow-2xl shadow-[#7C3AED]/20 transform lg:-translate-y-2'
                    : 'border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {!plan.popular && (
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 min-h-[32px]">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {symbol}{plan.price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>

                  {/* Included Features List */}
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {isBn ? 'যা যা সুবিধা পাবেন:' : 'Included Features:'}
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Upgrade Button */}
                <div className="pt-8 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenSignup}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular
                        ? 'bg-[#7C3AED] hover:bg-[#6d28d9] text-white shadow-lg shadow-[#7C3AED]/30'
                        : plan.id === 'premium'
                        ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Plan Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4"
        >
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isBn ? 'প্ল্যান সমূহের বিস্তারিত তুলনা (Compare Plans)' : 'Compare Plan Features'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isBn ? 'প্রতিটি প্ল্যানের ফিচারের সম্পূর্ণ তালিকা একসাথে দেখুন' : 'Detailed feature matrix across Free, Pro, and Premium tiers.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Feature Name</th>
                  <th className="py-3 px-3 text-center">Free Starter</th>
                  <th className="py-3 px-3 text-center text-purple-600 dark:text-purple-400">Pro Business</th>
                  <th className="py-3 px-3 text-center">Premium Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                <tr>
                  <td className="py-2.5 px-3 font-bold">Store Branches</td>
                  <td className="py-2.5 px-3 text-center">1 Branch</td>
                  <td className="py-2.5 px-3 text-center font-bold text-purple-600 dark:text-purple-400">1 Branch + Counter</td>
                  <td className="py-2.5 px-3 text-center font-bold">Unlimited Branches</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Active Products Limit</td>
                  <td className="py-2.5 px-3 text-center">Up to 100</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Barcode Sticker Generation</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-500">✓ Code128 Thermal</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-500">✓ Code128 Thermal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Customer &amp; Supplier Dues Khata</td>
                  <td className="py-2.5 px-3 text-center">Basic Ledger</td>
                  <td className="py-2.5 px-3 text-center font-bold">Advanced + Logs</td>
                  <td className="py-2.5 px-3 text-center font-bold">Advanced + Logs</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Multi-Staff Roles &amp; Security</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-center font-bold">✓ Manager/Staff</td>
                  <td className="py-2.5 px-3 text-center font-bold">✓ Unlimited Roles</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">AI Business Insights</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-center font-bold">Basic Insights</td>
                  <td className="py-2.5 px-3 text-center font-bold text-purple-500">✓ AI Profit Predictor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

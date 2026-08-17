import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { calculatePlanPricing, BillingCycle } from '../../config/pricing';
import {
  getExchangeRate,
  convertCurrency,
  formatCurrencyAmount,
  normalizeCurrencyCode,
  getCurrencySymbol,
} from '../../services/currencyService';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface LandingPricingProps {
  onOpenSignup: () => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenSignup }) => {
  const { settings, language, exchangeRates } = useApp();
  const isBn = language === 'bn';
  const displayCurrency = settings.currency || '৳';
  const isBDT = normalizeCurrencyCode(displayCurrency) === 'BDT';

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const getPlanPricing = (planId: 'free' | 'pro' | 'premium') => {
    if (planId === 'free') {
      return {
        amount: isBn ? '০' : '0',
        currencyLabel: isBDT ? '৳' : getCurrencySymbol(displayCurrency),
        note: isBn ? '১ মাসের জন্য ফ্রি' : 'Free for 1 Month',
        subtext: isBn ? 'ফ্রি ট্রায়াল (৩০ দিন)' : '1 Month Free Trial',
        discountBadge: null,
        savingsLabel: '0',
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

    const discountBadge = calculated.discountPercent > 0
      ? (isBn ? `${calculated.discountPercent}% ছাড়` : `${calculated.discountPercent}% OFF`)
      : null;

    return {
      amount: calculated.totalFormatted,
      currencyLabel: '',
      note,
      subtext,
      discountBadge,
      savingsLabel: calculated.savingsFormatted,
    };
  };

  const plans = [
    {
      id: 'free' as const,
      name: 'Free Starter',
      badge: isBn ? 'ফ্রি ১ মাস' : '1 Month Free Trial',
      desc: isBn
        ? 'নতুন দোকান বা ছোট ব্যবসার জন্য ১ মাসের ফ্রি ট্রায়াল ব্যবস্থার সুবিধা।'
        : 'Perfect for small retail shops with a 1 month free trial access.',
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
      buttonText: isBn ? '১ মাসের ফ্রী অ্যাকাউন্ট খুলুন' : 'Start 1 Month Free Trial',
      buttonVariant: 'secondary',
    },
    {
      id: 'pro' as const,
      name: 'Pro Business',
      badge: isBn ? 'সবচেয়ে জনপ্রিয়' : 'MOST POPULAR',
      desc: isBn
        ? 'মাঝারি ও দ্রুত বর্ধনশীল দোকানের সকল আধুনিক ফিচারের জন্য সেরা প্ল্যান।'
        : 'Best for growing retail stores needing unlimited products & barcode printing.',
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
      id: 'premium' as const,
      name: 'Premium Enterprise',
      badge: isBn ? 'প্রিমিয়াম সুপারস্টার' : 'ENTERPRISE POWER',
      desc: isBn
        ? 'একাধিক শাখা, সুপারমার্কেট এবং চেইন শপের জন্য সম্পূর্ণ পাওয়ার প্যাক।'
        : 'For large supermarkets, multi-branch chains, and wholesale businesses.',
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
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#ff8038] text-xs font-black uppercase tracking-wider border border-purple-500/20">
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

          {/* 3 Billing Cycle Selector (Monthly / Yearly / 5-Year) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'মাসিক বিলিং' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{isBn ? '১ বছর' : '1-Year'}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                billingCycle === 'yearly' ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {isBn ? '৫০% পর্যন্ত ছাড়' : 'Up to 50% OFF'}
              </span>
            </button>
            <button
              onClick={() => setBillingCycle('five_year')}
              className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'five_year'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>{isBn ? '৫ বছর' : '5-Year'}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                billingCycle === 'five_year' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}>
                {isBn ? '২৫% ছাড়' : '25% OFF'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
          {plans.map((plan, index) => {
            const pricingInfo = getPlanPricing(plan.id);
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
                    ? 'border-2 border-[#ff5c01] shadow-2xl shadow-[#ff5c01]/20 transform lg:-translate-y-2'
                    : 'border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff5c01] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {!plan.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 pb-1 border-y border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-baseline gap-1">
                      {pricingInfo.currencyLabel && (
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {pricingInfo.currencyLabel}
                        </span>
                      )}
                      <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {pricingInfo.amount}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {pricingInfo.note}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {pricingInfo.subtext && (
                        <p className="text-[11px] font-extrabold text-[#ff5c01] dark:text-[#ff8038]">
                          {pricingInfo.subtext}
                        </p>
                      )}
                      {pricingInfo.discountBadge && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                          {pricingInfo.discountBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {isBn ? 'প্ল্যানের সুবিধাসমূহ:' : 'Included Features:'}
                    </p>
                    {plan.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}

                    {plan.notIncluded.length > 0 && (
                      <div className="pt-2 space-y-2 opacity-50">
                        {plan.notIncluded.map((feature, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-400 line-through"
                          >
                            <span className="w-4 h-4 text-center shrink-0">—</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA Action Button */}
                <div className="pt-8">
                  <button
                    onClick={onOpenSignup}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      plan.buttonVariant === 'primary'
                        ? 'bg-[#ff5c01] hover:bg-[#e05100] text-white shadow-lg shadow-[#ff5c01]/30 hover:shadow-xl hover:shadow-[#ff5c01]/40 hover:-translate-y-0.5'
                        : plan.buttonVariant === 'accent'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:-translate-y-0.5'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Support Guarantee Note */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {isBn ? '১০০% নিরাপদ ও নিরবচ্ছিন্ন ক্লাউড সার্ভিস' : '100% Secure & Reliable Cloud Guarantee'}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'বিকাশ, নগদ, রকেট এবং আন্তর্জাতিক প্যাডেল পেমেন্ট সাপোর্ট। সার্বক্ষণিক কাস্টমার কেয়ার।'
                  : 'Automated instant checkout via Paddle and Bangladesh local mobile banking.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSignup}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shrink-0 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isBn ? 'ফ্রি ট্রায়াল শুরু করুন' : 'Start Free Trial'}
          </button>
        </div>

      </div>
    </section>
  );
};

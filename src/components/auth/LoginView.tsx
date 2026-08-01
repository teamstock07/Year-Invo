import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import { getDisplayBrandName } from '../../utils/brand';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Tag,
  X,
  ShoppingCart,
  Package,
  CreditCard,
  QrCode,
  TrendingUp,
  BarChart3,
  Sparkles,
  Zap,
  Store,
  Layers,
  Check,
  Crown,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup, settings, language, setLanguage } = useApp();

  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state matching user's requested specification
  const [yourName, setYourName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [storeType, setStoreType] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');

  const [error, setError] = useState('');

  const isBn = language === 'bn';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(isBn ? 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please enter email and password');
      return;
    }
    const res = login(email, password);
    if (!res.success) {
      setError(res.message || 'Failed to sign in.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!yourName || !storeName || !storeType || !email || !password || !storePhone || !storeAddress) {
      setError(isBn ? 'অনুগ্রহ করে সকল তারকাচিহ্নিত (*) ঘরগুলো পূরণ করুন' : 'Please fill in all required fields marked with *');
      return;
    }

    const res = signup({
      ownerName: yourName,
      brandName: storeName,
      email,
      password,
      mobile: storePhone,
      businessType: storeType,
      storeAddress: storeAddress,
      affiliateCode: affiliateCode.trim() || undefined,
      affiliateProgram: affiliateCode.trim() ? 'Mazbi Affiliate Program' : undefined,
    });

    if (!res.success) {
      setError(res.message || 'Failed to create account.');
    }
  };

  const handleQuickDemoLogin = () => {
    login('owner@omnibiz.com', '123456');
  };

  const handleFillOwnerCredentials = () => {
    setEmail('owner@yearinvo.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setMode('landing')}
        >
          <MainWebsiteLogo
            size={34}
            customUrl={settings.siteLogoUrl}
            siteName={settings.siteBrandName || 'YearInvo'}
            subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
          />
          <div className="flex flex-col">
            <span className="font-black text-lg text-white tracking-tight leading-tight flex items-center gap-1.5">
              {settings.siteBrandName || 'YearInvo'}
              <span className="text-[10px] bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#a78bfa] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'en' ? 'bg-[#7C3AED] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'bn' ? 'bg-[#7C3AED] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              BN
            </button>
          </div>

          {/* Action Header Buttons */}
          <button
            onClick={() => {
              setError('');
              setMode('login');
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            {isBn ? 'লগইন' : 'Log In'}
          </button>

          <button
            onClick={() => {
              setError('');
              setMode('signup');
            }}
            className="px-4 py-2 text-xs font-extrabold text-white bg-[#7C3AED] hover:bg-[#6d28d9] rounded-xl shadow-lg shadow-[#7C3AED]/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'ফ্রি স্টোর তৈরি করুন' : 'Sign Up Free'}</span>
          </button>
        </div>
      </header>

      {/* ================= PUBLIC SHOWCASE DASHBOARD LANDING ================= */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-[#a78bfa] text-xs font-bold shadow-inner">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{isBn ? '১০০% ফ্রি প্ল্যান • ক্লাউড ব্যাকআপ • বারকোড রেডি' : '100% FREE STARTER PLAN • CLOUD READY • BARCODE GENERATOR'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {isBn ? (
              <>
                আধুনিক খুচরা বিজনেসের <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-purple-400 to-indigo-300">
                  স্মার্ট POS ও ইনভেন্টরি
                </span>{' '}
                সিস্টেম
              </>
            ) : (
              <>
                Modern Retail POS &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-purple-400 to-indigo-300">
                  Smart Inventory
                </span>{' '}
                Platform
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {isBn
              ? 'দ্রুত বিলিং, অটো স্টক অ্যালার্ট, বকেয়া খাতা ট্র্যাকিং, বারকোড স্টিকার প্রিন্ট ও এআই বিজনেস ইনসাইট — আপনার দোকানের সবকিছু এক জায়গায়।'
              : 'Effortless sales, automatic stock alerts, customer due khata tracking, thermal barcode printing, and AI business insights — all in one powerful platform.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setError('');
                setMode('signup');
              }}
              className="px-6 py-3.5 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-[#7C3AED]/30 flex items-center gap-2 cursor-pointer"
            >
              <span>{isBn ? 'নতুন দোকান তৈরি করুন (ফ্রি)' : 'Create Your Free Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleQuickDemoLogin}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'লাইভ ডেমো দেখুন' : 'Explore Live Demo'}</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Showcase Dashboard Preview Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full filter blur-3xl pointer-events-none" />

          {/* Showcase Dashboard Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live System Preview
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {getDisplayBrandName(settings.brandName)} • Interactive Dashboard
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700/80">
                Today: ৳48,500 Sales
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                142 Orders Completed
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">{isBn ? 'আজকের বিক্রি' : 'Today Sales'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">৳48,500</p>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ +18.4% vs yesterday</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">{isBn ? 'স্টক ভ্যালু' : 'Inventory Value'}</span>
                <Package className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl font-black text-white">৳12,50,000</p>
              <span className="text-[10px] text-slate-400 font-semibold">418 Products active</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">{isBn ? 'কাস্টমার বকেয়া' : 'Customer Dues'}</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-white">৳14,200</p>
              <span className="text-[10px] text-amber-400 font-semibold">6 Due accounts</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">{isBn ? 'আজকের লাভ' : 'Net Profit'}</span>
                <BarChart3 className="w-4 h-4 text-[#a78bfa]" />
              </div>
              <p className="text-xl font-black text-[#a78bfa]">৳9,350</p>
              <span className="text-[10px] text-slate-400 font-semibold">Calculated automatically</span>
            </div>
          </div>

          {/* Core Feature Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#a78bfa] flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Fast POS Terminal</h4>
                <p className="text-[11px] text-slate-400">Scan barcodes, apply discounts, and print invoices in 2 seconds.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Barcode &amp; QR Print</h4>
                <p className="text-[11px] text-slate-400">Generate Code128 barcode stickers for thermal sticker printers.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">AI Smart Insights</h4>
                <p className="text-[11px] text-slate-400">Automatic profit analysis, expense optimizer, and sales forecasts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Business Types Carousel Badges */}
        <div className="space-y-4 text-center">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            {isBn ? 'সকল ধরণের দোকানের জন্য পারফেক্ট' : 'TAILORED FOR EVERY TYPE OF RETAIL STORE'}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              'Retail Store & POS Counter',
              'Supermarket & Grocery',
              'Pharmacy & Healthcare',
              'Electronics & Mobile Shop',
              'Fashion Boutique',
              'Restaurant & Cafe',
              'Hardware Supplies',
              'Wholesale Business',
            ].map((type, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-[#7C3AED] hover:text-white transition-all cursor-default"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Banner Call-To-Action */}
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-800/40 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isBn ? 'আজই আপনার ডিজিটাল খাতা ও POS চালু করুন' : 'Ready to start managing your store digitally?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isBn ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন, কোনো কার্ড প্রয়োজন নেই।' : 'Sign up in less than 2 minutes. Free starter account forever.'}
            </p>
          </div>

          <button
            onClick={() => {
              setError('');
              setMode('signup');
            }}
            className="px-6 py-3.5 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-[#7C3AED]/30 whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>{isBn ? 'ফ্রি সাইন আপ করুন' : 'Sign Up Free Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= AUTH MODAL OVERLAY FOR SIGNUP / LOGIN ================= */}
      {mode !== 'landing' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl relative my-auto">
            {mode === 'login' ? (
              /* LOGIN MODE FORM */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setMode('landing')}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                  title="Close / Back to Dashboard Overview"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6 pr-8">
                  <h2 className="text-2xl font-black text-white">Sign In to Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Enter your login credentials to manage your store</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@omnibiz.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20 mt-2 cursor-pointer"
                  >
                    <span>Sign In to Store</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-3">
                  <button
                    onClick={() => {
                      setError('');
                      setMode('signup');
                    }}
                    className="text-xs font-bold text-[#a78bfa] hover:underline"
                  >
                    Need a new account? Sign Up Here
                  </button>

                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 mb-1">Quick Fill Credentials</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleQuickDemoLogin}
                        className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Demo Merchant</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFillOwnerCredentials}
                        className="py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-bold rounded-xl text-xs border border-purple-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Platform Owner</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SIGNUP MODE FORM - DIRECT ENTRY TO MAIN INTERFACE UPON SIGNUP */
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Close / Cancel Signup Button */}
                <button
                  type="button"
                  onClick={() => setMode('landing')}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs z-10"
                  title="Close signup / Back to Dashboard Overview"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top Pill Badge */}
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800/80 text-[#a78bfa] text-[11px] font-extrabold uppercase tracking-wider inline-block">
                    FREE STARTER PLAN
                  </span>
                </div>

                {/* Header Title & Subtitle */}
                <div className="pr-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Create your store
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    Set up POS, invoices, and inventory in minutes. Choose your store type — we'll tailor the tools for you.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* 1. Your Name * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* 2. Store Name * & 3. Store Type * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Downtown Mart"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Select Your Store Type *
                      </label>
                      <select
                        value={storeType}
                        onChange={(e) => setStoreType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select store type</option>
                        <option value="General Retail & Grocery">Retail Store & POS Counter</option>
                        <option value="Supermarket & Departmental">Supermarket & Grocery</option>
                        <option value="Pharmacy & Healthcare">Pharmacy & Healthcare Store</option>
                        <option value="Electronics & Mobile">Electronics & Mobile Shop</option>
                        <option value="Clothing & Fashion Boutique">Fashion & Clothing Boutique</option>
                        <option value="Restaurant & Cafe">Restaurant, Cafe & Food Court</option>
                        <option value="Hardware & Sanitary">Hardware & Construction Supplies</option>
                        <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                        <option value="General Service Store">General Service & Other Business</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Email * & 5. Password * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* 6. Store Phone Number * & 7. Store Address * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Phone Number *
                      </label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Store Address *
                      </label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="123 Commercial Ave, City"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* 8. Affiliate Code (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Affiliate Code <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      placeholder="e.g. MAZBI123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all font-medium"
                    />
                    {affiliateCode.trim().length > 0 && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Will automatically link your account to the Mazbi Affiliate Program</span>
                      </p>
                    )}
                  </div>

                  {/* Action Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-black rounded-2xl text-sm transition-all text-center shadow-lg shadow-[#ff5c01]/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Create Your Store &amp; Access Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setMode('login');
                      }}
                      className="text-xs font-bold text-[#ff5c01] hover:underline cursor-pointer"
                    >
                      Already registered? Log In to existing account
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-1 mt-auto">
        <p>YearInvo by Year Media • Modern POS &amp; Inventory Management System</p>
        <p>© {new Date().getFullYear()} All rights reserved. Secure Cloud Platform.</p>
      </footer>
    </div>
  );
};


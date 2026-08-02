import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Package,
  CreditCard,
  BarChart3,
  ShoppingCart,
  QrCode,
  Sparkles,
  CheckCircle2,
  Activity,
  Award,
  RefreshCw,
  Plus,
  Check,
  DollarSign,
  Printer,
} from 'lucide-react';

interface LandingHeroProps {
  onOpenSignup: () => void;
  onOpenLogin: () => void;
}

const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
  value,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const duration = 1500; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenSignup, onOpenLogin }) => {
  const { settings, language } = useApp();
  const isBn = language === 'bn';
  const symbol = settings.currency || '৳';

  const [previewTab, setPreviewTab] = useState<'pos' | 'barcode' | 'ai'>('pos');

  return (
    <section id="home" className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 overflow-hidden">
      {/* Background Animated Gradient Blobs & Floating Particles */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-purple-600/20 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
      />

      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 right-[10%] w-72 h-72 bg-purple-500/15 blur-3xl pointer-events-none -z-10 rounded-full"
      />

      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-40 left-[10%] w-80 h-80 bg-indigo-500/15 blur-3xl pointer-events-none -z-10 rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Hero Header Text */}
        <div className="text-center space-y-5 max-w-4xl mx-auto">
          
          {/* Top Highlight Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-950/60 border border-purple-500/30 text-purple-700 dark:text-[#a78bfa] text-xs font-black tracking-wide shadow-xs backdrop-blur-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>
              {isBn
                ? '১০০% ফ্রি স্টার্টার প্ল্যান • ক্লাউড ব্যাকআপ • বারকোড রেডি'
                : '100% FREE STARTER PLAN • CLOUD READY • BARCODE & POS'}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            {isBn ? (
              <>
                আধুনিক খুচরা বিজনেসের <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-purple-600 to-indigo-500 dark:from-[#a78bfa] dark:via-purple-400 dark:to-indigo-300">
                  স্মার্ট POS ও ইনভেন্টরি
                </span>{' '}
                সিস্টেম
              </>
            ) : (
              <>
                Modern Retail POS &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-purple-600 to-indigo-500 dark:from-[#a78bfa] dark:via-purple-400 dark:to-indigo-300">
                  Smart Inventory
                </span>{' '}
                Platform
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            {isBn
              ? 'দ্রুত বিলিং, অটো স্টক অ্যালার্ট, কাস্টমার বকেয়া খাতা ট্র্যাকিং, বারকোড স্টিকার প্রিন্ট ও এআই বিজনেস ইনসাইট — আপনার সকল দোকানের হিসাব এক জায়গায়।'
              : 'Fast billing, automatic stock alerts, customer due khata tracking, thermal barcode sticker printing, and AI business insights — all in one powerful SaaS platform.'}
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenSignup}
              className="px-6 py-3.5 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-[#7C3AED]/30 flex items-center gap-2.5 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-spin-slow" />
              <span>{isBn ? 'নতুন দোকান তৈরি করুন (ফ্রি)' : 'Create Your Free Store'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenLogin}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'লাইভ ডেমো ও লগইন' : 'Explore Live Demo'}</span>
            </motion.button>
          </motion.div>

          {/* Business Key Highlights Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-3 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-bold text-slate-600 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'নো ক্রেডিট কার্ড প্রয়োজন' : 'No Credit Card Required'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? '২ মিনিটে সেটআপ' : '2-Min Instant Setup'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'মোবাইল ও পিসিতে সিঙ্ক' : 'Mobile & PC Cloud Sync'}</span>
            </div>
          </motion.div>
        </div>

        {/* Business Trust Metrics Bar with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto pt-2"
        >
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-2xs backdrop-blur-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={5000} suffix="+" />
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isBn ? 'সক্রিয় দোকান' : 'Active Merchant Stores'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-2xs backdrop-blur-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-[#a78bfa]">
              <AnimatedCounter value={150} prefix={symbol} suffix="M+" />
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isBn ? 'মাসিক বিক্রি ভলিউম' : 'Monthly Sales Volume'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-2xs backdrop-blur-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              99.9%
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isBn ? 'ক্লাউড আপটাইম' : 'Cloud Server Uptime'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-2xs backdrop-blur-sm"
          >
            <p className="text-2xl sm:text-3xl font-black text-amber-500">24/7</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isBn ? 'লাইভ সাপোর্ট' : 'Real-time Cloud Sync'}
            </p>
          </motion.div>
        </motion.div>

        {/* Interactive App Showcase Preview Container with Floating SaaS Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Floating SaaS Card 1: Top Left Notification Badge */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="hidden md:flex absolute -top-6 -left-6 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl items-center gap-3 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Live Transaction</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">🎉 New Order {symbol}2,450</p>
            </div>
          </motion.div>

          {/* Floating SaaS Card 2: Bottom Right Thermal Printer Badge */}
          <motion.div
            animate={{
              y: [0, 10, 0],
              rotate: [1, -1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="hidden md:flex absolute -bottom-6 -right-6 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl items-center gap-3 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-[#7C3AED] dark:text-[#a78bfa] flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Thermal Sticker</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">⚡ Code128 Printed (0.2s)</p>
            </div>
          </motion.div>

          {/* Central Interactive Showcase Showcase Box */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
            
            {/* Ambient Background Radial Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />

            {/* Top Showcase Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {getDisplayBrandName(settings.brandName)} • Interactive SaaS Terminal
                </span>
              </div>

              {/* Interactive Tab Controls */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPreviewTab('pos')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewTab === 'pos'
                      ? 'bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-[#a78bfa] shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Fast POS</span>
                </button>

                <button
                  onClick={() => setPreviewTab('barcode')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewTab === 'barcode'
                      ? 'bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-[#a78bfa] shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Barcode Print</span>
                </button>

                <button
                  onClick={() => setPreviewTab('ai')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewTab === 'ai'
                      ? 'bg-white dark:bg-slate-800 text-[#7C3AED] dark:text-[#a78bfa] shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Insights</span>
                </button>
              </div>
            </div>

            {/* Dynamic Animated Tab Content */}
            <AnimatePresence mode="wait">
              {previewTab === 'pos' && (
                <motion.div
                  key="pos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Top 4 KPI Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase">{isBn ? 'আজকের বিক্রি' : 'Today Sales'}</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{symbol}48,500</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">↑ +18.4% today</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase">{isBn ? 'স্টক ভ্যালু' : 'Inventory Value'}</span>
                        <Package className="w-4 h-4 text-indigo-500" />
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{symbol}12,50,000</p>
                      <span className="text-[10px] text-slate-500 font-bold">418 Items active</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase">{isBn ? 'কাস্টমার বকেয়া' : 'Customer Dues'}</span>
                        <CreditCard className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{symbol}14,200</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">6 Accounts due</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                        <span className="text-[10px] font-bold uppercase">{isBn ? 'আজকের লাভ' : 'Net Profit'}</span>
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-lg font-black text-purple-600 dark:text-[#a78bfa]">{symbol}9,350</p>
                      <span className="text-[10px] text-slate-500 font-bold">Auto computed</span>
                    </div>
                  </div>

                  {/* Animated Business Growth SVG Chart & Live Counter */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-500 animate-pulse" />
                        <span className="font-bold text-slate-900 dark:text-white">Real-time Sales Activity Stream</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        ● LIVE 60 FPS
                      </span>
                    </div>

                    {/* Smooth SVG Growth Curve */}
                    <div className="h-20 w-full relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          d="M 0,60 Q 75,20 150,45 T 300,15 T 450,30 T 500,5"
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 0,60 Q 75,20 150,45 T 300,15 T 450,30 T 500,5 L 500,80 L 0,80 Z"
                          fill="url(#chartGradient)"
                        />
                        <circle cx="500" cy="5" r="4" fill="#a78bfa" className="animate-ping" />
                        <circle cx="500" cy="5" r="4" fill="#7C3AED" />
                      </svg>
                    </div>

                    {/* Sample Cart / POS Register Stream */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                          ⚡
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant POS Checkout Terminal</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Scan Code128 barcodes or click to add items in 0.5 sec.</p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onOpenSignup}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                      >
                        Try Live Checkout →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {previewTab === 'barcode' && (
                <motion.div
                  key="barcode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Thermal Barcode Sticker Generator</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Generate 2-inch or 3-inch barcode stickers for any product instantly.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                      CODE128 Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[1, 2, 3, 4].map((n) => (
                      <motion.div
                        key={n}
                        whileHover={{ scale: 1.04 }}
                        className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-2xs"
                      >
                        <p className="text-[10px] font-black text-slate-900 dark:text-white truncate">Polo T-Shirt #{n}</p>
                        <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400">{symbol}850.00</p>
                        <div className="h-6 bg-slate-100 dark:bg-slate-950 rounded flex items-center justify-center font-mono text-[8px] text-slate-600 dark:text-slate-400">
                          ||| | |||| | ||| #{n}8291
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {previewTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/30 border border-purple-500/20 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">AI Profit &amp; Inventory Assistant</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    "Your store generated {symbol}48,500 in sales today with a 19.2% net profit margin. Stock level for 3 items is running low. Recommendation: Restock Polo Shirts before Friday."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { RetailInventoryAnimation } from './RetailInventoryAnimation';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Package,
  Printer,
  Smartphone,
  Layers,
  Lock,
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

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenSignup, onOpenLogin }) => {
  const { settings, language } = useApp();
  const isBn = language === 'bn';
  const symbol = settings.currency || '৳';

  return (
    <section id="home" className="relative pt-4 sm:pt-10 pb-12 sm:pb-20 overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-[#ff5c01]/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
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
        className="absolute top-20 right-[5%] w-72 h-72 bg-[#ff5c01]/10 blur-3xl pointer-events-none -z-10 rounded-full"
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
        className="absolute top-40 left-[5%] w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ========================================================= */}
        {/* 2-COLUMN MAIN HERO: LEFT (HEADLINE & CTAS) + RIGHT (ANIMATION) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: HIGH-CONVERTING HERO VALUE PROPOSITION */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Top Highlight Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff5c01]/10 dark:bg-[#ff5c01]/20 border border-[#ff5c01]/30 text-[#ff5c01] dark:text-[#ff8038] text-xs font-black tracking-wide shadow-xs backdrop-blur-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>
                {isBn
                  ? '১০০% ফ্রি স্টার্টার প্ল্যান • ক্লাউড ব্যাকআপ • বারকোড রেডি'
                  : '100% FREE STARTER PLAN • CLOUD READY • BARCODE & POS'}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]"
            >
              {isBn ? (
                <>
                  আধুনিক খুচরা বিজনেসের <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5c01] via-purple-600 to-indigo-600 dark:from-[#ff8038] dark:via-purple-400 dark:to-indigo-300">
                    স্মার্ট POS ও ইনভেন্টরি
                  </span>{' '}
                  প্ল্যাটফর্ম
                </>
              ) : (
                <>
                  Modern Retail POS &amp;{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5c01] via-purple-600 to-indigo-600 dark:from-[#ff8038] dark:via-purple-400 dark:to-indigo-300">
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
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0"
            >
              {isBn
                ? 'দ্রুত বিলিং, অটো স্টক অ্যালার্ট, কাস্টমার বকেয়া খাতা ট্র্যাকিং, বারকোড স্টিকার প্রিন্ট ও এআই বিজনেস ইনসাইট — আপনার সকল দোকানের হিসাব এক জায়গায়।'
                : 'Fast billing, automated stock alerts, customer due khata tracking, thermal barcode sticker printing, and AI business insights — all in one powerful SaaS platform.'}
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenSignup}
                className="px-6 py-3.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-[#ff5c01]/30 flex items-center gap-2.5 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
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

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs font-bold text-slate-600 dark:text-slate-400"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? 'নো ক্রেডিট কার্ড প্রয়োজন' : 'No Credit Card Required'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? '২ মিনিটে সেটআপ' : '2-Min Setup'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isBn ? 'মোবাইল ও পিসিতে সিঙ্ক' : 'Mobile & PC Cloud Sync'}</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: MODERN RETAIL & SMART INVENTORY ANIMATION + SCREENSHOT ANIMATIONS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            <RetailInventoryAnimation onOpenSignup={onOpenSignup} />
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* BUSINESS TRUST METRICS BAR WITH ANIMATED COUNTERS         */}
        {/* ========================================================= */}
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
            <p className="text-2xl sm:text-3xl font-black text-[#ff5c01] dark:text-[#ff8038]">
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

      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Target,
  Eye,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const LandingAbout: React.FC = () => {
  const { language } = useApp();
  const isBn = language === 'bn';

  const differentiators = [
    {
      title: isBn ? 'জিরো হার্ডওয়্যার লক-ইন' : 'Zero Hardware Lock-In',
      desc: isBn
        ? 'দামি কোনো ডিভাইস কেনা লাগবে না। আপনার মোবাইল, ল্যাপটপ বা যেকোনো সাধারণ প্রিন্টারে চলবে।'
        : 'Works seamlessly on laptops, desktop PCs, tablets, and smartphones without expensive dedicated hardware.',
      icon: Zap,
    },
    {
      title: isBn ? 'নিরাপদ ক্লাউড ডাটাবেস' : 'Bank-Grade Firebase Cloud Security',
      desc: isBn
        ? 'ফায়ারবেস এনক্রিপশনের মাধ্যমে আপনার স্টোরের সেলস ও হিসেব শতভাগ নিরাপদ ও সংরক্ষিত থাকে।'
        : 'Powered by Google Firebase Cloud Infrastructure with automatic daily encrypted backups.',
      icon: Lock,
    },
    {
      title: isBn ? 'BDT কারেন্সি ও দেশীয় বাজার বান্ধব' : 'BDT & Multi-Currency Native',
      desc: isBn
        ? 'বাংলাদেশের খুচরা বাজারের ধরন, বাকি খাতা ও বাকির রসিদ ব্যবস্থাপনার কথা মাথায় রেখে তৈরি।'
        : 'Designed specifically for South Asian retail workflows, due khatas, and local invoice requirements.',
    },
    {
      title: isBn ? 'রিয়েল-টাইম লাভ হিসাব' : 'Automated Net Profit Calculation',
      desc: isBn
        ? 'কেনা দামের সাথে ক্যাশ সেলের পার্থক্য হিসাব করে দৈনিক ও মাসিক প্রকৃত লাভ বের করে দেয়।'
        : 'Instant gross and net profit margin calculations on every invoice and monthly financial report.',
      icon: Award,
    },
  ];

  return (
    <section id="about" className="py-12 sm:py-20 bg-slate-50 dark:bg-[#0c0c0e] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#a78bfa] text-xs font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'ইয়ারইনভো পরিচিতি' : 'ABOUT YEARINVO'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn
              ? 'খুচরা ব্যবসায়ীদের আধুনিক প্রযুক্তি উপহার দিতে আমাদের পথচলা'
              : 'Empowering Retail Merchants with Smart Technology'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            YearInvo by Year Media • Modern POS &amp; Inventory Management System
          </p>
        </motion.div>

        {/* Introduction Text & Company Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#a78bfa] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                YearInvo by Year Media
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isBn ? 'স্মার্ট রিটেইল অপারেটিং সিস্টেম' : 'Smart Retail Operating System for Merchants'}
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {isBn
              ? 'YearInvo হলো খুচরা দোকান, সুপারমার্কেট, ফার্মেসী, ক্লথিং ব্র্যান্ড ও পাইকারী বিক্রেতাদের জন্য একটি আধুনিক ক্লাউড সফটওয়্যার। ম্যানুয়াল হিসাব এবং খাতাপত্রের ঝামেলা দূর করে কেনাবেচা, স্টক ইনভেন্টরি, বারকোড স্টিকার প্রিন্ট ও বকেয়া খাতাকে শতভাগ নির্ভুল করাই আমাদের মূল উদ্দেশ্য।'
              : 'YearInvo by Year Media is a modern cloud POS and inventory management platform designed specifically for retail merchants, supermarkets, pharmacies, apparel stores, and wholesale businesses. We bridge the gap between traditional pen-and-paper registers and enterprise cloud technology.'}
          </p>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Mission Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-purple-500/5 dark:bg-slate-950/80 border border-purple-500/20 space-y-2"
            >
              <div className="flex items-center gap-2 text-purple-700 dark:text-[#a78bfa]">
                <Target className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">{isBn ? 'আমাদের মিশন' : 'OUR MISSION'}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের হাতে সবচেয়ে সহজ, নিরাপদ ও দ্রুততম POS ও ইনভেন্টরি সিস্টেম পৌঁছে দেওয়া, যা তাঁদের ব্যবসার লাভ ও দক্ষতা বহুগুণ বৃদ্ধি করবে।'
                  : 'To provide small and medium retail merchants with the fastest, most intuitive, and secure cloud POS tools to double operational efficiency and eliminate stock leaks.'}
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-slate-950/80 border border-indigo-500/20 space-y-2"
            >
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Eye className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">{isBn ? 'আমাদের ভিশন' : 'OUR VISION'}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? 'প্রতিটি দোকানকে ডিজিটালাইজ করা এবং দেশের ১ নম্বর বিশ্বস্ত রিটেইল অটোমেশন সফটওয়্যার হিসেবে নিজেকে প্রতিষ্ঠিত করা।'
                  : 'To digitally transform millions of retail counters across the region and become the #1 trusted SaaS operating system for local retail commerce.'}
              </p>
            </motion.div>

          </div>
        </motion.div>

        {/* Why Choose YearInvo Differentiators */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white text-center">
            {isBn ? 'কেন YearInvo বেছে নেবেন?' : 'Why Choose YearInvo?'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {differentiators.map((diff, i) => {
              const Icon = diff.icon || CheckCircle2;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#a78bfa] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{diff.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{diff.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

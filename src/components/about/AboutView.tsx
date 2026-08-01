import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import {
  Info,
  Shield,
  FileText,
  Building2,
  Code2,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Lock,
  ChevronRight,
  X,
  Award,
  Heart,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { settings, user } = useApp();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const brandName = getDisplayBrandName(settings.brandName || user?.brandName);
  const appVersion = 'v2.5.0 Enterprise';

  const features = [
    {
      title: 'Smart POS & Quick Checkout',
      desc: 'High-speed point of sale with thermal barcode scanning, quick tender, and instant receipt printing.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Real-time Inventory Audit',
      desc: 'Automated stock count, low-stock warnings, and expiry date management.',
      icon: Layers,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Customer Due Ledger',
      desc: 'Full track record of customer credit accounts, SMS reminders, and partial payment history.',
      icon: Shield,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'AI Business Intelligence',
      desc: 'Smart predictive stock reordering, sales trend analytics, and profit margin optimizations.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#ff5c01]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5c01]/20 border border-[#ff5c01]/30 text-[#ff5c01] text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Official Release</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {brandName}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Complete Retail Operating System &amp; Inventory Management Solution for Modern Supermarkets &amp; Merchants.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-bold">
                Version: {appVersion}
              </span>
              <span>Build: #2026.08.01</span>
              <span>License: Enterprise Registered</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1.5 shrink-0 min-w-[180px]">
            <div className="w-12 h-12 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#ff5c01]/20 font-black text-xl">
              SM
            </div>
            <p className="font-extrabold text-sm text-white">{brandName}</p>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> System Healthy
            </p>
          </div>
        </div>
      </div>

      {/* Grid: App Features & Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ff5c01]" />
          <span>Core Capabilities &amp; Features Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4"
              >
                <div className={`p-3 rounded-2xl ${f.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company & Developer Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Company Information</h3>
              <p className="text-xs text-slate-400">Retail Tech &amp; Cloud Platform</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Legal Entity</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">StockMaster Technologies Ltd.</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Mission</span>
              <p className="leading-relaxed mt-0.5">
                Providing modern, accessible, offline-ready store management and financial accounting tools to businesses globally.
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Headquarters</span>
              <p className="flex items-center gap-1.5 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#ff5c01]" />
                Level 8, Tech Hub Tower, Gulshan-2, Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>

        {/* Developer Information */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Developer Information</h3>
              <p className="text-xs text-slate-400">Engineering &amp; Product Architecture</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Lead Developer &amp; Team</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">StockMaster Core Engineering</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Technology Stack</span>
              <p className="font-mono text-[11px] bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 mt-1">
                React 18 + Vite • TypeScript • Tailwind CSS • Google GenAI • Cloud Storage
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Security Standards</span>
              <p className="flex items-center gap-1.5 mt-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                End-to-end Local Persistence &amp; OAuth 2.0 Encrypted Auth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Website & Contact Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          Contact &amp; Web Resources
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://stockmaster.app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-[#ff5c01] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-[#ff5c01]" />
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#ff5c01]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Official Website</p>
              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 mt-0.5">https://stockmaster.app</p>
            </div>
          </a>

          <a
            href="mailto:support@stockmaster.app"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-[#ff5c01] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Support Email</p>
              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 mt-0.5">support@stockmaster.app</p>
            </div>
          </a>

          <a
            href="tel:+8801700000000"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-[#ff5c01] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Direct Hotline</p>
              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 mt-0.5">+880 1700-000000</p>
            </div>
          </a>
        </div>
      </div>

      {/* Legal & Copyright Section */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            © 2026 {brandName} (StockMaster Technologies Ltd). All rights reserved.
          </p>
          <p className="text-slate-500 text-[11px] flex items-center justify-center sm:justify-start gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for store owners &amp; merchants worldwide.
          </p>
        </div>

        {/* Legal Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveModal('privacy')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:text-[#ff5c01] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#ff5c01]" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveModal('terms')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:text-[#ff5c01] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#ff5c01]" />
            <span>Terms &amp; Conditions</span>
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Privacy Policy</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                Effective Date: August 1, 2026
              </p>
              <p>
                At {brandName}, protecting your business data and privacy is our top priority. This Privacy Policy outlines how your information is processed, stored, and protected when using our POS and Inventory system.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">1. Data Ownership &amp; Local Storage</h4>
              <p>
                All your product catalog details, customer directories, sales records, and financial transaction logs are strictly stored in your secured browser storage and local enterprise database instance. We do not sell or rent your business data to third parties.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">2. Information We Collect</h4>
              <p>
                We only maintain essential user profile details (such as account email, store brand name, and subscription plan tier) required to authenticate your login sessions and configure tax rate settings.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">3. Security Measures</h4>
              <p>
                We use industry-standard encryption protocols (SSL/TLS) for data transmission. Access controls and session tokens ensure your POS system remains secure against unauthorized access.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">4. Contact Us</h4>
              <p>
                If you have questions regarding this Privacy Policy or wish to request data export, please contact support@stockmaster.app.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-[#ff5c01] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Terms &amp; Conditions</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                Effective Date: August 1, 2026
              </p>
              <p>
                By using {brandName}, you agree to comply with and be bound by the following Terms and Conditions.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">1. Software License &amp; Usage</h4>
              <p>
                {brandName} grants you a non-exclusive, non-transferable license to operate this application for commercial or personal retail business management in accordance with your active subscription plan.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">2. Subscription Tiers &amp; Features</h4>
              <p>
                Advanced features including supermarket POS counters, barcode label sticker printing, camera scanning, and QR payments are subject to your subscription plan tier (Pro, Premium, or Enterprise).
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">3. User Responsibility</h4>
              <p>
                You are responsible for maintaining the accuracy of product prices, inventory stock counts, and sales entries entered into the software.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">4. Limitation of Liability</h4>
              <p>
                StockMaster Technologies Ltd. shall not be liable for indirect, consequential, or incidental business losses arising out of system usage or hardware malfunction.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-[#ff5c01] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

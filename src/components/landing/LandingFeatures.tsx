import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  ShoppingCart,
  Package,
  Boxes,
  Layers,
  QrCode,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Truck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface LandingFeaturesProps {
  onOpenSignup: () => void;
}

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ onOpenSignup }) => {
  const { language } = useApp();
  const isBn = language === 'bn';

  const featuresList = [
    {
      id: 'quicksale',
      title: isBn ? 'কুইক সেল ও ক্যাশ কাউন্টার' : 'Quick Sale & Cash Register',
      desc: isBn
        ? 'মাত্র ৩ ক্লিকে ক্যাশ, কার্ড বা মোবাইল ব্যাংকিংয়ে সেল সম্পন্ন করুন। দ্রুততম ডিজিটাল কাস্টমার রসিদ।'
        : 'Process cash, card, or mobile wallet sales in 3 clicks. Instant digital customer receipts.',
      icon: Zap,
      gradient: 'from-[#ff5c01] to-amber-500',
      badge: isBn ? 'ইনস্ট্যান্ট' : 'Instant',
    },
    {
      id: 'pos',
      title: isBn ? 'হাই-স্পীড POS বারকোড সিস্টেম' : 'High-Speed POS Terminal',
      desc: isBn
        ? 'ইউএসবি বা ব্লুটুথ বারকোড স্ক্যানার দিয়ে স্ক্যান করুন, ডিসকাউন্ট যুক্ত করুন এবং থার্মাল রসিদ প্রিন্ট করুন।'
        : 'Scan barcodes with handheld scanners, apply custom line-item discounts, and print thermal invoices.',
      icon: ShoppingCart,
      gradient: 'from-sky-500 to-blue-600',
      badge: 'POS Ready',
    },
    {
      id: 'product',
      title: isBn ? 'প্রোডাক্ট ও ভ্যারিয়েন্ট ম্যানেজমেন্ট' : 'Product & Variant Catalog',
      desc: isBn
        ? 'সাইজ, কালার, ক্যাটাগরি ও ব্র্যান্ড অনুযায়ী হাজার হাজার প্রোডাক্টের ক্যাটালগ তৈরি ও ট্র্যাক করুন।'
        : 'Manage thousands of items with custom SKU, category, brand, cost price, and selling price.',
      icon: Package,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'stock',
      title: isBn ? 'স্মার্ট স্টক ও লো-স্টক অ্যালার্ট' : 'Smart Stock & Reorder Alerts',
      desc: isBn
        ? 'স্টক কমে গেলে বা শূন্য হলে সিস্টেম আপনাকে সতর্ক করবে। কোনো প্রোডাক্ট যেন হঠাৎ শেষ না হয়ে যায়।'
        : 'Automatic alerts when inventory reaches minimum threshold. Never run out of top sellers.',
      icon: Boxes,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'inventory',
      title: isBn ? 'ইনভেন্টরি ভ্যালু ও কস্ট হিসাব' : 'Inventory Valuation & Costing',
      desc: isBn
        ? 'দোকানের মোট কেনা দাম ও বিক্রয় মূল্যের অটোম্যাটিক স্টক ভ্যালুয়েশন রিপোর্ট দেখুন।'
        : 'Calculate exact total store inventory cost vs expected sales revenue in real-time.',
      icon: Layers,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'barcode',
      title: isBn ? 'বারকোড ও QR কোড জেনারেটর' : 'Barcode & QR Sticker Generator',
      desc: isBn
        ? 'Code128 স্ট্যান্ডার্ডে নিজের দোকানের প্রোডাক্ট বারকোড তৈরি করুন এবং থার্মাল স্টিকারে প্রিন্ট করুন।'
        : 'Generate Code128 barcode labels with store name and price. Print on thermal sticker rolls.',
      icon: QrCode,
      gradient: 'from-purple-500 to-pink-600',
      badge: 'Thermal Print',
    },
    {
      id: 'reports',
      title: isBn ? 'অটোম্যাটিক সেলস ও খরচের রিপোর্ট' : 'Sales & Expense Reports',
      desc: isBn
        ? 'দৈনিক, সাপ্তাহিক ও মাসিক বিক্রয়, লাভ এবং খরচের নিখুঁত রিপোর্ট PDF বা Excel ফাইল হিসেবে ডাউনলোড করুন।'
        : 'Detailed daily, weekly, and monthly sales summaries with expense categorization and Excel export.',
      icon: FileSpreadsheet,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'profit',
      title: isBn ? 'প্রফিট মার্জিন ও গ্রস ইনকাম' : 'Profit Analytics & Margins',
      desc: isBn
        ? 'কেনা দাম ও বেচা দাম হিসাব করে প্রতিটি সেলস এবং সামগ্রিক বিজনেসের সঠিক লাভ জানুন।'
        : 'Automated cost-of-goods-sold (COGS) tracking for accurate net profit margin analysis.',
      icon: TrendingUp,
      gradient: 'from-rose-500 to-red-600',
    },
    {
      id: 'customers',
      title: isBn ? 'কাস্টমার ডিরেক্টরি ও বাকী খাতা' : 'Customer Directory & Due Khata',
      desc: isBn
        ? 'গ্রাহকদের বাকীর হিসাব নির্ভুল রাখুন। বকেয়া পরিশোধ এবং ডিজিটাল রসিদ পাঠানোর সুবিধা।'
        : 'Track customer ledger, pending due balance, partial payment logs, and transaction history.',
      icon: Users,
      gradient: 'from-teal-500 to-[#10B981]',
    },
    {
      id: 'suppliers',
      title: isBn ? 'সাপ্লায়ার ডিরেক্টরি ও পারচেজ' : 'Supplier Directory & Purchases',
      desc: isBn
        ? 'সাপ্লায়ারের কাজ থেকে মালামাল ক্রয়ের ইনভয়েস ও পে করার হিসাব ডিজিটাল খাতায় রাখুন।'
        : 'Log supplier purchase invoices, track vendor balances, and manage restock purchases.',
      icon: Truck,
      gradient: 'from-violet-500 to-indigo-600',
    },
    {
      id: 'mobile',
      title: isBn ? '১০০% মোবাইল রেসপন্সিভ ড্যাশবোর্ড' : '100% Mobile SaaS Dashboard',
      desc: isBn
        ? 'মোবাইল বা ট্যাবলেট থেকেই দোকানের সকল ফিচার ব্যবহার করুন। এক হাত দিয়েই পুরো বিজনেস পরিচালনা করুন।'
        : 'Optimized touch interface designed specifically for smartphones and tablets on the go.',
      icon: Smartphone,
      gradient: 'from-[#ff5c01] to-rose-500',
      badge: 'Mobile Optimized',
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-20 bg-slate-50 dark:bg-[#0c0c0e] border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#ff8038] text-xs font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'শক্তিশালী ফিচার সমূহ' : 'POWERFUL RETAIL CAPABILITIES'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn
              ? 'আপনার খুচরা ব্যবসাকে ডিজিটাল করতে যা কিছু প্রয়োজন'
              : 'Everything You Need to Run a Profitable Store'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            {isBn
              ? 'খাতাপত্রের ঝামেলা বাদ দিয়ে কম্পিউটার বা মোবাইলেই দোকান পরিচালনা করুন।'
              : 'Replace outdated paper notebooks with smart automated inventory, POS billing, and real-time cloud reporting.'}
          </p>
        </motion.div>

        {/* Features 11-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-purple-500/40 transition-all cursor-default space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {feat.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {feat.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#ff8038] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-1 text-center sm:text-left z-10">
            <h3 className="text-lg sm:text-xl font-black text-white">
              {isBn ? 'আপনার দোকানের জন্য উপযুক্ত টুলস ব্যবহার করুন' : 'Experience modern SaaS efficiency for your store'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {isBn ? 'কোনো সফটওয়্যার ইনস্টল ছাড়াই সাথে সাথে ব্যবহার শুরু করুন।' : 'No installation needed. Access your store from any web browser or mobile phone.'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSignup}
            className="px-6 py-3.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-[#ff5c01]/40 flex items-center gap-2 shrink-0 cursor-pointer z-10"
          >
            <span>{isBn ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

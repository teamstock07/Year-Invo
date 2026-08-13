import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  Send,
  CheckCircle2,
  BookOpen,
  QrCode,
  Printer,
  CreditCard,
} from 'lucide-react';

export const LandingSupport: React.FC = () => {
  const { language } = useApp();
  const isBn = language === 'bn';

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStore, setFormStore] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formEmail && formMsg) {
      setSubmitted(true);
      setTimeout(() => {
        setFormName('');
        setFormEmail('');
        setFormStore('');
        setFormMsg('');
        setSubmitted(false);
      }, 4000);
    }
  };

  const helpTopics = [
    {
      title: isBn ? 'শুরু করার গাইড' : 'Getting Started Guide',
      desc: isBn ? 'নতুন দোকান সেটআপ ও ইনভেন্টরি যুক্ত করার নির্দেশিকা।' : 'How to set up your store and add initial product inventory.',
      icon: BookOpen,
    },
    {
      title: isBn ? 'POS ও বারকোড স্ক্যানার' : 'POS Scanner Setup',
      desc: isBn ? 'ইউএসবি ও ব্লুটুথ বারকোড স্ক্যানার কানেক্ট করার উপায়।' : 'Connecting USB or Bluetooth handheld barcode scanners.',
      icon: QrCode,
    },
    {
      title: isBn ? 'থার্মাল প্রিন্টার সেটিংস' : 'Thermal Printer Config',
      desc: isBn ? '2-ইঞ্চি ও 3-ইঞ্চি পজ থার্মাল প্রিন্টারে মেমো প্রিন্ট করা।' : 'Printing sales invoices on thermal receipt printers.',
      icon: Printer,
    },
    {
      title: isBn ? 'বাকী খাতা ও পেমেন্ট' : 'Customer Dues & Ledger',
      desc: isBn ? 'বকেয়া হিসাব ট্র্যাকিং ও কাস্টমার লেজার দেখার নিয়ম।' : 'Tracking customer due balances and partial payments.',
      icon: CreditCard,
    },
  ];

  const faqs = [
    {
      q: isBn ? 'YearInvo সফটওয়্যার কি সম্পূর্ণ ফ্রি ব্যবহার করা যায়?' : 'Is YearInvo really free to try?',
      a: isBn
        ? 'হ্যাঁ! আমাদের Free Starter Plan ১ মাসের জন্য সম্পূর্ণ ফ্রি। আপনি ১০০টি প্রোডাক্ট পর্যন্ত কোনো ফি ছাড়াই ট্রায়াল দিতে পারবেন।'
        : 'Yes! Our Free Starter Plan includes a 1 month free trial with no credit card required. You can manage up to 100 products during trial.',
    },
    {
      q: isBn ? 'বারকোড স্টিকার কি যেকোনো প্রিন্টারে প্রিন্ট করা যাবে?' : 'Can I print barcode stickers on thermal sticker printers?',
      a: isBn
        ? 'হ্যাঁ, YearInvo সকল স্ট্যান্ডার্ড থার্মাল স্টিকার প্রিন্টারে Code128 বারকোড স্টিকার প্রিন্ট সমর্থন করে।'
        : 'Yes, YearInvo generates standard Code128 barcodes compatible with all 2-inch and 3-inch thermal label printers.',
    },
    {
      q: isBn ? 'ইন্টারনেট সাময়িক না থাকলে কি বিক্রি বন্ধ হয়ে যাবে?' : 'How does cloud backup work?',
      a: isBn
        ? 'মোটেও না! লোকাল স্টোরেজ ক্যাশ থাকার কারণে বিক্রি স্বাভাবিক থাকবে এবং ইন্টারনেট এলে অটোম্যাটিক ক্লাউডে সিঙ্ক হয়ে যাবে।'
        : 'Your data is securely stored in Google Firebase Cloud. Changes sync instantly across all logged-in devices.',
    },
    {
      q: isBn ? 'আমি কি পরে প্ল্যান পরিবর্তন করতে পারবো?' : 'Can I upgrade or change my plan anytime?',
      a: isBn
        ? 'হ্যাঁ, আপনি যেকোনো সময় আপনার স্টোর ড্যাশবোর্ড থেকে Free থেকে Pro বা Premium প্ল্যানে উন্নীত হতে পারবেন।'
        : 'Yes, you can upgrade, downgrade, or request plan switches at any time directly from your store dashboard.',
    },
  ];

  return (
    <section id="support" className="py-12 sm:py-20 bg-white dark:bg-[#09090b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:bg-purple-950/60 dark:text-[#a78bfa] text-xs font-black uppercase tracking-wider border border-purple-500/20">
            {isBn ? 'সাহায্য ও কাস্টমার সাপোর্ট' : 'HELP CENTER & SUPPORT'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isBn
              ? 'আমরা আপনাকে ২৪/৭ সাহায্য করতে প্রস্তুত'
              : 'We Are Here to Help You Succeed'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            {isBn
              ? 'যেকোনো প্রশ্ন, প্রযুক্তিগত সমস্যা বা ফিচারের বিস্তারিত জানতে আমাদের হেল্প সেন্টারে যোগাযোগ করুন।'
              : 'Browse our help guides, search common questions, or message our dedicated support desk directly.'}
          </p>
        </motion.div>

        {/* Help Center Grid Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-2 hover:border-purple-500/40 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#a78bfa] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{topic.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Accordion Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isBn ? 'সাধারণ জিজ্ঞাসাসমূহ (FAQ)' : 'Frequently Asked Questions'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isBn ? 'YearInvo সম্পর্কে ব্যবসায়ীদের জনপ্রিয় সাধারণ প্রশ্ন ও উত্তর।' : 'Quick answers to common questions about YearInvo features.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed font-normal overflow-hidden"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Support & Live Chat Section */}
        <div id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Support Info Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="space-y-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8"
          >
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                DIRECT HELP DESK
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isBn ? 'সাপোর্ট টিমের সাথে কথা বলুন' : 'Get in Touch with Our Team'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'আপনার কোনো জিজ্ঞাসা থাকলে মেইল বা ফোনেই সরাসরি আমাদের সাথে কথা বলুন।'
                  : 'Have custom requirements or need help setting up your store printer? Reach out via phone or email.'}
              </p>
            </div>

            {/* Support Channels */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Support</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">teamstock07@gmail.com</p>
                  <p className="text-[10px] text-slate-500">support@yearinvo.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone &amp; WhatsApp Hotline</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">+880 1700-000000</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Sat - Thu: 9:00 AM - 10:00 PM</p>
                </div>
              </div>

              {/* Live Chat (Coming Soon) Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border border-purple-800/40 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#a78bfa] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">In-App Live Chat Assistant</p>
                    <p className="text-[10px] text-slate-400">Instant AI &amp; Human Operator Chat</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0 animate-pulse">
                  COMING SOON
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Interactive Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isBn ? 'মেসেজ পাঠান' : 'Send Us a Message'}
            </h3>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center space-y-2"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>{isBn ? 'ধন্যবাদ! আপনার মেসেজটি আমরা পেয়েছি। খুব শীঘ্রই উত্তর দেওয়া হবে।' : 'Thank you! Your inquiry has been sent to our support desk.'}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={formStore}
                      onChange={(e) => setFormStore(e.target.value)}
                      placeholder="e.g. Apex Mart"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    How can we help you? *
                  </label>
                  <textarea
                    rows={4}
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    placeholder="Describe your question or store requirement..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'মেসেজ পাঠান' : 'Send Message'}</span>
                </motion.button>
              </form>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
};

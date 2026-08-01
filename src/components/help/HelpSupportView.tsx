import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  BookOpen,
  FileText,
  Bug,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Headphones,
  Zap,
  Printer,
  Boxes,
  CreditCard,
  X,
  Bot,
  User,
  Paperclip,
  ThumbsUp,
  Clock,
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const { language, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'support' | 'faq' | 'guide' | 'feedback'>('support');
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Live Chat Drawer State
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hello! 👋 Welcome to StockMaster Support. How can we help you with your POS or Inventory today?',
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Bug / Feature Request Form State
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('bug');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('Medium');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // FAQs List
  const faqs = [
    {
      category: 'POS & Sales',
      question: 'How do I scan products using a USB or Bluetooth Barcode Scanner?',
      answer: 'Simply plug in your USB barcode scanner into your computer or connect via Bluetooth. StockMaster automatically listens for hardware barcode scans when you are on the POS or Quick Sale page without needing to click any text box.',
    },
    {
      category: 'POS & Sales',
      question: 'Can I issue due/credit sales to customers without receiving full cash?',
      answer: 'Yes! Select "Due/Credit" as payment method or enter a lower amount in "Paid Amount". The system will calculate the remaining balance and prompt you to pick or create a customer record to track their due ledger.',
    },
    {
      category: 'Inventory',
      question: 'What happens when a product reaches its expiry date?',
      answer: 'Products that reach or pass their expiration date will be automatically flagged with an "EXPIRED" badge in inventory. The POS counter will block sales of expired items to protect customer safety.',
    },
    {
      category: 'Printer & Barcode',
      question: 'How do I print 58mm or 80mm thermal receipts and barcode stickers?',
      answer: 'Click "Print Receipt" or "Print Barcode Labels". Select your connected POS printer (Xprinter, POS-58, Zebra, TSC) in the browser print dialog and set layout margins to None.',
    },
    {
      category: 'Subscription & Account',
      question: 'How do I upgrade from Free to Pro or Premium Plan?',
      answer: 'Go to the Subscription menu in the sidebar or click "Upgrade Plan". Select your desired plan (Pro or Premium) and follow the simple activation instructions.',
    },
    {
      category: 'General',
      question: 'Is my store sales data saved safely offline?',
      answer: 'Yes! StockMaster stores all product items, customer ledgers, and transaction records securely in your browser local storage with instant auto-save backup.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = faqCategory === 'All' || faq.category === faqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setInputMessage('');

    // Simulated Auto-Reply Bot logic
    setTimeout(() => {
      let botReply = "Thank you for reaching out! Our support agent has received your query and will assist you shortly. You can also email us directly at support@stockmaster.app.";
      if (userText.toLowerCase().includes('pos') || userText.toLowerCase().includes('sale')) {
        botReply = "For POS counter queries, make sure your barcode scanner is connected. You can also use Quick Sale mode for instant checkout.";
      } else if (userText.toLowerCase().includes('printer') || userText.toLowerCase().includes('print')) {
        botReply = "To print 58mm/80mm receipts, click 'Print Receipt' on any order and set page margins to None in your print dialog.";
      } else if (userText.toLowerCase().includes('due') || userText.toLowerCase().includes('credit')) {
        botReply = "You can manage customer due payments under the 'Due Management' menu item in the sidebar.";
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle || !feedbackDesc) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackTitle('');
      setFeedbackDesc('');
      setFeedbackSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Support Center Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#ff5c01]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#ff5c01] text-white shadow-lg shadow-[#ff5c01]/20">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#ff5c01] uppercase tracking-wider">Help &amp; Support Hub</span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How can we help you today?</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Support Agents Online
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the StockMaster Support Center. Search FAQs, read documentation, contact customer support, or send a feature request.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            {[
              { id: 'support', label: 'Contact Support', icon: Phone },
              { id: 'faq', label: 'FAQs & Answers', icon: HelpCircle },
              { id: 'guide', label: 'User Guide & Docs', icon: BookOpen },
              { id: 'feedback', label: 'Bug & Feature Request', icon: Bug },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/25'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. CONTACT SUPPORT SECTION */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Live Chat (Future Ready) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#ff5c01] transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/20">
                    ● Live Chat Ready
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Live Chat Assistant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Chat instantly with our AI support bot &amp; live agent for quick troubleshooting.
                </p>
              </div>

              <button
                onClick={() => setIsLiveChatOpen(true)}
                className="w-full py-3 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Live Chat Now</span>
              </button>
            </div>

            {/* Email Support */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase border border-indigo-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> &lt; 2hr Reply
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Email Support</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Send technical queries or invoice attachment requests directly to our support engineers.
                </p>
                <p className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  support@stockmaster.app
                </p>
              </div>

              <a
                href="mailto:support@stockmaster.app?subject=POS%20Support%20Request"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email Ticket</span>
              </a>
            </div>

            {/* WhatsApp Support */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/20">
                    Fast WhatsApp
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">WhatsApp Support</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Direct message our hotline on WhatsApp for urgent store counter issues.
                </p>
                <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +880 1700-000000
                </p>
              </div>

              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Quick SLA & Support Commitment Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Premium Support Guarantee</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Pro and Premium subscribers receive priority response times and remote desktop support.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('faq')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs hover:border-[#ff5c01] transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              Browse FAQs Instead →
            </button>
          </div>
        </div>
      )}

      {/* 2. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {activeTab === 'faq' && (
        <div className="space-y-5">
          {/* FAQ Search & Category Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQ questions (e.g. barcode scanner, printer, dues, expiry)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-[#ff5c01]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['All', 'POS & Sales', 'Inventory', 'Printer & Barcode', 'Subscription & Account', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    faqCategory === cat
                      ? 'bg-[#ff5c01] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordions List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-[#ff5c01] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01] text-[10px] font-black uppercase shrink-0">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#ff5c01] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No matching FAQ found for "{faqSearchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. USER GUIDE & DOCUMENTATION */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Guide Item 1: POS & Quick Sale */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">POS Counter &amp; Quick Sale Guide</h3>
                  <p className="text-[11px] text-slate-400">Step-by-step cashier counter workflow</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed pt-1">
                <li>Use <strong>Quick Sale</strong> for high-speed small shop checkouts.</li>
                <li>Use <strong>POS Register</strong> for full supermarket receipts, barcode label scanning, and customer due management.</li>
                <li>Connect any standard USB/Bluetooth barcode scanner and scan directly.</li>
              </ul>
            </div>

            {/* Guide Item 2: Barcode & Label Thermal Printer */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Thermal Printer &amp; Barcode Label Setup</h3>
                  <p className="text-[11px] text-slate-400">58mm / 80mm receipts &amp; sticker printing</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed pt-1">
                <li>Generate custom 1D/2D barcodes in <strong>Barcode &amp; QR Code</strong> menu.</li>
                <li>Supports standard thermal printers (Xprinter, POS-58, Zebra, Rongta).</li>
                <li>Configure page size to 58mm roll or sticker labels in browser print settings.</li>
              </ul>
            </div>

            {/* Guide Item 3: Inventory & Expiry Tracking */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Inventory Audit &amp; Expiry Alert</h3>
                  <p className="text-[11px] text-slate-400">Stock audit, cost value &amp; expiration dates</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed pt-1">
                <li>Add minimum stock alert threshold per product to trigger automatic warnings.</li>
                <li>Monitor expiring items under <strong>Expired Products</strong> view.</li>
                <li>Track total inventory valuation based on purchase cost vs selling price.</li>
              </ul>
            </div>

            {/* Guide Item 4: Customer Due Ledger */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Customer Due &amp; Credit Ledger</h3>
                  <p className="text-[11px] text-slate-400">Collection records &amp; payment receipts</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed pt-1">
                <li>Assign sales to registered customer profiles to record due balances.</li>
                <li>Collect partial or full due payments under <strong>Due Management</strong>.</li>
                <li>Print due collection receipts for customers.</li>
              </ul>
            </div>
          </div>

          {/* Download Documentation PDF Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#ff5c01]/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Download Full User Manual (PDF)</h4>
                <p className="text-xs text-slate-300">Complete offline PDF documentation guide for staff &amp; cashiers.</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              📄 Print / Save Documentation
            </button>
          </div>
        </div>
      )}

      {/* 4. REPORT A BUG & FEATURE REQUEST */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">
              Report a Bug or Request a Feature
            </h3>
            <p className="text-xs text-slate-500">
              We continuously improve StockMaster based on merchant feedback.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                Thank you! Submission Received.
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Our product engineering team will review your report shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    feedbackType === 'bug' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bug className="w-4 h-4" />
                  <span>Report a Bug</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    feedbackType === 'feature' ? 'bg-[#ff5c01] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Feature Request</span>
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {feedbackType === 'bug' ? 'Bug Summary / Issue Title *' : 'Feature Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder={feedbackType === 'bug' ? 'e.g. Thermal receipt margin cut off' : 'e.g. Add WhatsApp invoice sending'}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              {/* Severity (for Bug) */}
              {feedbackType === 'bug' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={feedbackSeverity}
                    onChange={(e) => setFeedbackSeverity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                  >
                    <option value="Low">Low - Minor visual tweak</option>
                    <option value="Medium">Medium - Feature non-critical issue</option>
                    <option value="High">High - Cashier counter blocked</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  placeholder="Provide details or steps to reproduce..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Report to Engineering Team</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* LIVE CHAT SIMULATOR DRAWER MODAL */}
      {isLiveChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-slate-950/70 p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-sm h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Live Chat Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#ff5c01] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">StockMaster Live Support</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">● Online Agent Connected</p>
                </div>
              </div>
              <button
                onClick={() => setIsLiveChatOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-950/50 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#ff5c01] text-white rounded-br-none font-medium'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#ff5c01]"
              />
              <button
                type="submit"
                className="p-2 bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import { X, Share2, Copy, Check, Send, Mail, MessageSquare, Smartphone, Store, ExternalLink, Globe } from 'lucide-react';

interface ShareDueModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDueModal: React.FC<ShareDueModalProps> = ({ customer, isOpen, onClose }) => {
  const { settings, user, language } = useApp();
  const symbol = settings.currency || '৳';
  const [copied, setCopied] = useState(false);

  if (!isOpen || !customer) return null;

  const rawBrand = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawBrand) || rawBrand || 'Our Store';
  const storePhone = settings.phone || user?.mobile || '';
  const isBn = language === 'bn';

  const liveShareUrl = `${window.location.origin}${window.location.pathname}?dueCustomerId=${customer.id}`;

  const dueStatementText = `
📢 LIVE STORE DUE STATEMENT - ${storeName.toUpperCase()}
----------------------------------
Customer: ${customer.name}
Phone: ${customer.phone || 'N/A'}
Total Outstanding Due: ${symbol}${customer.totalDue.toLocaleString()}

🔗 View Live Real-Time Statement & History:
${liveShareUrl}

Please arrange payment at your earliest convenience.
${storePhone ? `Contact Store: ${storePhone}\n` : ''}Thank you!
`.trim();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(dueStatementText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Due Statement - ${customer.name}`,
          text: dueStatementText,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopyText();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${customer.phone ? customer.phone.replace(/[^0-9]/g, '') : ''}&text=${encodeURIComponent(dueStatementText)}`;
  const emailUrl = `mailto:${customer.email || ''}?subject=${encodeURIComponent(`Due Payment Statement from ${storeName}`)}&body=${encodeURIComponent(dueStatementText)}`;
  const smsUrl = `sms:${customer.phone || ''}?body=${encodeURIComponent(dueStatementText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {isBn ? 'বাকির হিসাব শেয়ার করুন' : 'Share Customer Due Statement'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {customer.name} • {symbol}{customer.totalDue.toLocaleString()} {isBn ? 'বাকি' : 'Due'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick Share Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-2.5 font-bold text-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Email */}
            <a
              href={emailUrl}
              className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white border border-indigo-500/20 transition-all flex items-center gap-2.5 font-bold text-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span>Email</span>
            </a>

            {/* SMS */}
            <a
              href={smsUrl}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20 transition-all flex items-center gap-2.5 font-bold text-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>SMS Message</span>
            </a>

            {/* Native Device Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500 text-purple-600 hover:text-white border border-purple-500/20 transition-all flex items-center gap-2.5 font-bold text-xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span>Device Share</span>
              </button>
            )}

            {/* Copy Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className={`p-3 rounded-2xl transition-all flex items-center gap-2.5 font-bold text-xs cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-[#ff5c01] hover:text-white text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${copied ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <span>{copied ? 'Copied!' : 'Copy Statement'}</span>
            </button>
          </div>

          {/* Live Link Info Box & Preview */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? '🔴 লাইভ স্টেটমেন্ট লিঙ্ক (Live Updating Link)' : '🔴 Live Statement Link'}</span>
              </span>
              <span className="text-[10px] font-normal opacity-80">{isBn ? 'কাস্টমার রিয়েল-টাইম ব্যালেন্স দেখতে পাবে' : 'Auto-updates on balance changes'}</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate select-all">
              {liveShareUrl}
            </div>
            <div className="flex justify-end">
              <a
                href={liveShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isBn ? 'লাইভ লিঙ্ক টেস্ট করুন' : 'Test Live Link'}</span>
              </a>
            </div>
          </div>

          {/* Statement Text Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 font-sans">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-100">
                <Store className="w-4 h-4 text-[#ff5c01]" />
                <span>{storeName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                Current Due: {symbol}{customer.totalDue.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
              <p><strong>Customer:</strong> {customer.name}</p>
              <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
              <p><strong>Outstanding Balance:</strong> {symbol} {customer.totalDue.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold pt-1">
                ✓ Customers opening the link see live real-time updates as you record payments or new sales.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

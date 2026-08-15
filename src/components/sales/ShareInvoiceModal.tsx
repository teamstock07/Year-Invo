import React, { useState } from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Store,
  FileText,
} from 'lucide-react';

interface ShareInvoiceModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareInvoiceModal: React.FC<ShareInvoiceModalProps> = ({ sale, isOpen, onClose }) => {
  const { settings, user } = useApp();
  const symbol = settings.currency || '৳';
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sale) return null;

  const rawBrand = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawBrand) || rawBrand || 'Our Store';
  const storePhone = settings.phone || user?.mobile || '';

  // Generate clean text summary for messaging apps
  const invoiceText = `
🧾 INVOICE FROM ${storeName.toUpperCase()}
----------------------------------
Invoice No: ${sale.invoiceNo}
Date: ${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
Customer: ${sale.customerName || 'Valued Customer'}

ITEMS:
${sale.items.map((item) => `- ${item.productName} x${item.quantity} = ${symbol}${item.total.toLocaleString()}`).join('\n')}

Subtotal: ${symbol}${sale.subtotal.toLocaleString()}
${sale.discount > 0 ? `Discount: -${symbol}${sale.discount.toLocaleString()}\n` : ''}${sale.tax > 0 ? `Tax: +${symbol}${sale.tax.toLocaleString()}\n` : ''}GRAND TOTAL: ${symbol}${sale.total.toLocaleString()}
Paid Amount: ${symbol}${sale.paidAmount.toLocaleString()}
${sale.dueAmount > 0 ? `DUE AMOUNT: ${symbol}${sale.dueAmount.toLocaleString()} (Partially Paid)\n` : 'STATUS: Fully Paid\n'}Payment Method: ${sale.paymentMethod}
${storePhone ? `Contact: ${storePhone}\n` : ''}Thank you for your business!
`.trim();

  const currentUrl = window.location.origin + window.location.pathname + `?invoice=${sale.invoiceNo}`;
  const shareSummaryWithUrl = `${invoiceText}\n\nView Invoice Online: ${currentUrl}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareSummaryWithUrl);
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
          title: `Invoice ${sale.invoiceNo} - ${storeName}`,
          text: invoiceText,
          url: currentUrl,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopyText();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareSummaryWithUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(invoiceText)}`;
  const emailUrl = `mailto:${sale.customerPhone ? '' : ''}?subject=${encodeURIComponent(`Invoice ${sale.invoiceNo} from ${storeName}`)}&body=${encodeURIComponent(shareSummaryWithUrl)}`;
  const smsUrl = `sms:${sale.customerPhone || ''}?body=${encodeURIComponent(shareSummaryWithUrl)}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Share Invoice
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Invoice {sale.invoiceNo} • {storeName}
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

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Share Buttons Grid */}
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2.5">
              Select Platform
            </span>
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

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white border border-sky-500/20 transition-all flex items-center gap-2.5 font-bold text-xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span>Telegram</span>
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

              {/* Copy Full Text */}
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
                <span>{copied ? 'Copied!' : 'Copy Receipt'}</span>
              </button>
            </div>
          </div>

          {/* Read-Only Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 font-sans">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-100">
                <Store className="w-4 h-4 text-[#ff5c01]" />
                <span>{storeName}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                sale.dueAmount > 0
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}>
                {sale.dueAmount > 0 ? `Partially Paid (Due: ${symbol}${sale.dueAmount})` : 'Fully Paid'}
              </span>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
              <p><strong>Invoice:</strong> {sale.invoiceNo}</p>
              <p><strong>Customer:</strong> {sale.customerName || 'Walk-in Customer'}</p>
              <p><strong>Items ({sale.items.length}):</strong></p>
              <div className="pl-2 space-y-0.5 text-slate-600 dark:text-slate-400">
                {sale.items.map((item, idx) => (
                  <p key={idx}>• {item.productName} x{item.quantity} ({symbol}{item.total})</p>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 font-sans space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Grand Total:</span>
                <span className="font-bold text-slate-900 dark:text-white">{symbol} {sale.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Paid Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{symbol} {sale.paidAmount.toLocaleString()}</span>
              </div>
              {sale.dueAmount > 0 && (
                <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                  <span>Due Amount:</span>
                  <span>{symbol} {sale.dueAmount.toLocaleString()}</span>
                </div>
              )}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

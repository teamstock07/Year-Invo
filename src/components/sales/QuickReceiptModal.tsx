import React, { useState } from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { ReceiptModal } from '../pos/ReceiptModal';
import { ShareInvoiceModal } from './ShareInvoiceModal';
import { CheckCircle, Eye, Share2, X } from 'lucide-react';

interface QuickReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickReceiptModal: React.FC<QuickReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { settings } = useApp();
  const symbol = settings.currency || '৳';
  const [isFullReceiptOpen, setIsFullReceiptOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!isOpen || !sale) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-5 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30 animate-bounce">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Order Successful
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Quick Sale transaction completed
            </p>
          </div>

          {/* Compact Order Details */}
          <div className="p-5 space-y-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  #{sale.invoiceNo}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 font-medium">Total Amount:</span>
                <span className="font-black text-slate-900 dark:text-white text-base">
                  {symbol} {sale.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Paid Amount:</span>
                <span>{symbol} {sale.paidAmount.toLocaleString()}</span>
              </div>

              {sale.dueAmount > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                  <span>Due Amount:</span>
                  <span>{symbol} {sale.dueAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 text-[11px]">Payment Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  sale.dueAmount > 0
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {sale.dueAmount > 0 ? 'PARTIALLY PAID' : 'PAID IN FULL'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullReceiptOpen(true)}
                  className="py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#ff5c01]" />
                  <span>View Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Invoice</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Full Invoice View Modal */}
      <ReceiptModal
        sale={sale}
        isOpen={isFullReceiptOpen}
        onClose={() => setIsFullReceiptOpen(false)}
      />

      {/* Share Invoice Modal */}
      <ShareInvoiceModal
        sale={sale}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};

import React from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import { CheckCircle, Printer, X, Zap } from 'lucide-react';

interface QuickReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickReceiptModal: React.FC<QuickReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { settings } = useApp();
  const symbol = settings.currency || '৳';

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const storeName = getDisplayBrandName(settings.brandName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Success Header Bar */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 text-center relative print:hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-emerald-400">Sale Completed!</h3>
          <p className="text-[11px] text-slate-400">Quick Sale processed successfully</p>
        </div>

        {/* Compact Thermal Receipt Content */}
        <div className="p-4 sm:p-5">
          <div
            id="compact-quick-receipt"
            className="bg-white text-slate-900 p-4 rounded-2xl shadow-md border border-slate-200 text-xs font-mono space-y-3"
          >
            {/* Store Name Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h2 className="font-black text-sm uppercase tracking-tight text-slate-900">
                {storeName}
              </h2>
              <p className="text-[10px] text-slate-500 font-sans font-semibold mt-0.5">
                Quick Sale Receipt
              </p>
            </div>

            {/* Meta Info */}
            <div className="text-[11px] space-y-1 font-sans border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold text-slate-900 font-mono">{sale.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-800">
                  {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="space-y-1.5 font-sans border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>Product</span>
                <span className="text-right">Qty / Total</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate max-w-[170px]">
                      {item.productName}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {symbol}{item.sellingPrice} × {item.quantity}
                    </span>
                  </div>
                  <div className="font-black text-slate-900 whitespace-nowrap text-right">
                    {symbol}{item.total}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount & Payment Method */}
            <div className="space-y-1.5 font-sans pt-1">
              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-[#ff5c01] text-base">{symbol}{sale.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Payment Method:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                  {sale.paymentMethod}
                </span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-400 font-sans">
              Thank you for your purchase!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

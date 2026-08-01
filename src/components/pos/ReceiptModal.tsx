import React from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { settings, t } = useApp();
  const symbol = settings.currency || '৳';

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] text-slate-100 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-900/80 print:hidden">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Invoice {sale.invoiceNo}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {new Date(sale.date).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Receipt Body */}
        <div id="thermal-receipt" className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Top White Store Header Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100">
            <div className="flex justify-between items-start gap-3">
              {/* Left Store Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    (getDisplayBrandName(settings.brandName)[0] || 'S').toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h2 className="font-extrabold text-base text-slate-900 leading-tight truncate">
                    {getDisplayBrandName(settings.brandName)}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium leading-normal break-words max-w-[200px]">
                    {settings.address || settings.receiptHeader || 'Store Address'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {settings.phone || settings.receiptFooter || ''}
                  </p>
                </div>
              </div>

              {/* Right Invoice Info */}
              <div className="flex flex-col items-end text-right shrink-0">
                <span className="text-xs font-black tracking-widest text-indigo-600 uppercase">
                  INVOICE
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-800 mt-0.5">
                  {sale.invoiceNo}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 border-b border-slate-800">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center py-2.5 px-2 text-xs">
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                          {item.productName.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-100 truncate text-xs leading-tight">
                        {item.productName}
                      </p>
                      {item.sku && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          #{item.sku}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-200 text-xs">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-slate-300 font-medium text-xs">
                    {symbol}{item.sellingPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-black text-white text-xs">
                    {symbol}{item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom White Totals Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Subtotal: {symbol}{sale.subtotal.toFixed(2)}</span>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between items-center text-xs text-rose-600 font-semibold">
                <span>Discount</span>
                <span>-{symbol}{sale.discount.toFixed(2)}</span>
              </div>
            )}

            {sale.tax > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-600 font-semibold">
                <span>Tax</span>
                <span>+{symbol}{sale.tax.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-lg sm:text-xl font-black text-indigo-600">
              <span>Total: {symbol}{sale.total.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600 font-bold">
              <span>Paid: <span className="text-slate-800">{symbol}{sale.paidAmount.toFixed(2)}</span></span>
              <span>
                {sale.dueAmount > 0 ? (
                  <span className="text-rose-600">Due: {symbol}{sale.dueAmount.toFixed(2)}</span>
                ) : (
                  <span className="text-slate-500">Due: {symbol}0.00</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-900/90 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

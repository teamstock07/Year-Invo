import React, { useState } from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import { ShareInvoiceModal } from '../sales/ShareInvoiceModal';
import {
  X,
  Printer,
  CheckCircle2,
  Share2,
  Download,
  Phone,
} from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, isOpen, onClose }) => {
  const { settings, user } = useApp();
  const symbol = settings.currency || '৳';
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const rawBrand = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawBrand) || rawBrand || 'My Store';
  const storePhone = settings.phone || user?.mobile || '';
  const cashierName = sale.cashierName || user?.ownerName || 'Cashier';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/80 dark:bg-emerald-950/30 print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Order Completed
                </h3>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Invoice #{sale.invoiceNo}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Store & Invoice Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Store Information */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {storeName}
                  </h1>
                  {storePhone && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-[#ff5c01]" />
                      <span>{storePhone}</span>
                    </p>
                  )}
                  {settings.address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {settings.address}
                    </p>
                  )}
                </div>

                {/* Invoice Meta */}
                <div className="sm:text-right space-y-1 text-xs">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#ff5c01]/10 text-[#ff5c01] font-black text-xs border border-[#ff5c01]/20">
                    INVOICE
                  </div>
                  <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    #{sale.invoiceNo}
                  </p>
                  <p className="text-slate-500 font-medium text-[11px]">
                    {new Date(sale.date).toLocaleDateString()} • {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Customer & Cashier Info Bar */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {sale.customerName || 'Walk-in Customer'}
                  </span>
                  {sale.customerPhone && (
                    <span className="block text-[11px] text-slate-500 font-mono">
                      {sale.customerPhone}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cashier</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{cashierName}</span>
                  <span className="block text-[11px] text-slate-500 font-medium">
                    Via {sale.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Product List Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Product Details
              </h4>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {sale.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <p className="font-bold">{item.productName}</p>
                          {item.sku && <span className="text-[10px] text-slate-400 font-mono">#{item.sku}</span>}
                        </td>
                        <td className="p-3 text-center font-extrabold">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                          {symbol}{item.sellingPrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                          {symbol}{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{symbol} {sale.subtotal.toLocaleString()}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                  <span>Discount</span>
                  <span>-{symbol} {sale.discount.toLocaleString()}</span>
                </div>
              )}

              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                  <span>Tax</span>
                  <span>+{symbol} {sale.tax.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-base sm:text-lg font-black text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-[#ff5c01]">{symbol} {sale.total.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold flex justify-between items-center">
                  <span>Paid Amount</span>
                  <span>{symbol} {sale.paidAmount.toLocaleString()}</span>
                </div>

                <div className={`p-2 rounded-xl border font-extrabold flex justify-between items-center ${
                  sale.dueAmount > 0
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <span>Due Amount</span>
                  <span>{symbol} {sale.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">Payment Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  sale.dueAmount > 0
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {sale.dueAmount > 0 ? 'PARTIALLY PAID' : 'PAID IN FULL'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#ff5c01]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ShareInvoiceModal
        sale={sale}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};

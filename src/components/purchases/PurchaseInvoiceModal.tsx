import React from 'react';
import { Purchase } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Share2, Building2, Phone, Calendar, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

interface PurchaseInvoiceModalProps {
  purchase: Purchase;
  onClose: () => void;
}

export const PurchaseInvoiceModal: React.FC<PurchaseInvoiceModalProps> = ({ purchase, onClose }) => {
  const { settings, suppliers } = useApp();
  const symbol = settings.currency || '৳';

  const supplier = suppliers.find((s) => s.id === purchase.supplierId);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Invoice - ${purchase.purchaseNo}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 20px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
            .brand-name { font-size: 24px; font-weight: 900; color: #0f172a; }
            .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .invoice-title { font-size: 20px; font-weight: 800; text-align: right; color: #2563eb; }
            .invoice-no { font-size: 13px; font-family: monospace; color: #475569; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }
            .info-box h4 { margin: 0 0 6px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; text-transform: uppercase; font-size: 11px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals { margin-left: auto; width: 280px; font-size: 13px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #cbd5e1; }
            .totals-row.grand { font-weight: 900; font-size: 15px; border-bottom: 2px solid #0f172a; border-top: 2px solid #0f172a; color: #0f172a; margin-top: 6px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; }
            .badge-paid { background: #dcfce7; color: #166534; }
            .badge-due { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">${settings.businessName || 'Business Suite'}</div>
              <div class="brand-sub">${settings.address || 'Inventory & Store Management'} | ${settings.phone || ''}</div>
            </div>
            <div>
              <div class="invoice-title">PURCHASE INVOICE</div>
              <div class="invoice-no">Invoice #: ${purchase.purchaseNo}</div>
              <div class="brand-sub">Date: ${new Date(purchase.date).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h4>Supplier Information</h4>
              <div><strong>Name:</strong> ${purchase.supplierName}</div>
              ${supplier?.company ? `<div><strong>Company:</strong> ${supplier.company}</div>` : ''}
              ${supplier?.mobile ? `<div><strong>Phone:</strong> ${supplier.mobile}</div>` : ''}
              ${supplier?.address ? `<div><strong>Address:</strong> ${supplier.address}</div>` : ''}
            </div>
            <div class="info-box">
              <h4>Purchase Details</h4>
              <div><strong>Payment Method:</strong> ${purchase.paymentMethod}</div>
              <div><strong>Status:</strong> ${purchase.dueAmount > 0 ? 'PARTIALLY PAID / DUE' : 'PAID IN FULL'}</div>
              ${purchase.note ? `<div><strong>Note:</strong> ${purchase.note}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item / Product Description</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Buying Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${purchase.items
                .map(
                  (item, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td><strong>${item.productName}</strong></td>
                  <td class="text-center">${item.quantity} ${item.unit || 'pcs'}</td>
                  <td class="text-right">${symbol} ${(item.buyingPrice || 0).toLocaleString()}</td>
                  <td class="text-right"><strong>${symbol} ${(item.total || 0).toLocaleString()}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${symbol} ${(purchase.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div class="totals-row">
              <span>Paid Amount:</span>
              <span>${symbol} ${(purchase.paidAmount || 0).toLocaleString()}</span>
            </div>
            <div class="totals-row grand">
              <span>Supplier Due Balance:</span>
              <span>${symbol} ${(purchase.dueAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            <p>Generated by ${settings.businessName || 'Business System'} • Purchase verification copy</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleShare = () => {
    const text = `PURCHASE INVOICE: ${purchase.purchaseNo}\nSupplier: ${purchase.supplierName}\nDate: ${new Date(purchase.date).toLocaleDateString()}\nTotal: ${symbol}${(purchase.totalAmount || 0).toLocaleString()}\nPaid: ${symbol}${(purchase.paidAmount || 0).toLocaleString()}\nDue: ${symbol}${(purchase.dueAmount || 0).toLocaleString()}\nItems: ${purchase.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Purchase invoice details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  Purchase Invoice
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {purchase.purchaseNo}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Supplier: <span className="font-semibold text-slate-700 dark:text-slate-300">{purchase.supplierName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Copy Summary"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Supplier Information
              </span>
              <p className="font-black text-sm text-slate-800 dark:text-slate-100">{purchase.supplierName}</p>
              {supplier?.company && (
                <p className="flex items-center gap-1 text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {supplier.company}
                </p>
              )}
              {supplier?.mobile && (
                <p className="flex items-center gap-1 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {supplier.mobile}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Invoice Details
              </span>
              <p className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date: <strong className="text-slate-700 dark:text-slate-200">{new Date(purchase.date).toLocaleString()}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Payment Method: <strong className="text-slate-700 dark:text-slate-200">{purchase.paymentMethod}</strong>
              </p>
              <div className="pt-1">
                {purchase.dueAmount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Due Pending: {symbol} {(purchase.dueAmount || 0).toLocaleString()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Paid in Full
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Buying Price</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchase.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.productName}</td>
                    <td className="p-3 text-center font-semibold">
                      {item.quantity} <span className="text-[10px] text-slate-400">{item.unit || 'pcs'}</span>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {symbol} {(item.buyingPrice || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {symbol} {(item.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 max-w-sm">
              {purchase.note && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-700 dark:text-slate-300 block mb-1">Invoice Notes:</strong>
                  <p>{purchase.note}</p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Total Purchase:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{symbol} {(purchase.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{symbol} {(purchase.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm">
                <span className="text-slate-700 dark:text-slate-300">Supplier Due:</span>
                <span className={purchase.dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}>
                  {symbol} {(purchase.dueAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

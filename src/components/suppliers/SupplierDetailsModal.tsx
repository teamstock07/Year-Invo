import React, { useState } from 'react';
import { Supplier, Purchase, DueCollection } from '../../types';
import { useApp } from '../../context/AppContext';
import { PurchaseInvoiceModal } from '../purchases/PurchaseInvoiceModal';
import {
  X,
  Truck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  History,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  PlusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Receipt,
  FileText,
} from 'lucide-react';

interface SupplierDetailsModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (supplier: Supplier) => void;
  onNewPurchase: (supplier: Supplier) => void;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  supplier,
  isOpen,
  onClose,
  onRecordPayment,
  onNewPurchase,
}) => {
  const { purchases, dueCollections, settings, formatDate, language, t } = useApp();
  const symbol = settings.currency || '৳';

  const [activeTab, setActiveTab] = useState<'purchases' | 'payments' | 'transactions'>('purchases');
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);

  if (!isOpen || !supplier) return null;

  // 1. All purchases from this supplier
  const supplierPurchases = purchases
    .filter((p) => p.supplierId === supplier.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 2. Financial Metrics dynamically derived from actual records
  const totalPurchaseAmount = supplierPurchases.reduce(
    (sum, p) => sum + (Number(p.totalAmount) || 0),
    0
  );

  const initialPurchasePaid = supplierPurchases.reduce(
    (sum, p) => sum + (Number(p.paidAmount) || 0),
    0
  );

  const supplierDueCollections = dueCollections
    .filter((d) => d.type === 'supplier' && d.entityId === supplier.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const subsequentDuePaid = supplierDueCollections.reduce(
    (sum, d) => sum + (Number(d.amountPaid) || 0),
    0
  );

  const totalPaid = initialPurchasePaid + subsequentDuePaid;
  const outstandingPayable = Math.max(0, totalPurchaseAmount - totalPaid);

  // 3. Complete Payment History List
  interface PaymentItem {
    id: string;
    date: string;
    amount: number;
    method: string;
    type: 'Initial Purchase Payment' | 'Due Settlement';
    reference: string;
    note?: string;
    collector?: string;
  }

  const paymentHistory: PaymentItem[] = [
    // Initial payments made during purchase
    ...supplierPurchases
      .filter((p) => (Number(p.paidAmount) || 0) > 0)
      .map((p) => ({
        id: `pay-init-${p.id}`,
        date: p.date,
        amount: p.paidAmount,
        method: p.paymentMethod || 'Cash',
        type: 'Initial Purchase Payment' as const,
        reference: p.purchaseNo,
        note: p.note || 'Paid at time of purchase invoice',
        collector: 'POS / Purchase Desk',
      })),
    // Subsequent settlements
    ...supplierDueCollections.map((d) => ({
      id: d.id,
      date: d.date,
      amount: d.amountPaid,
      method: d.paymentMethod,
      type: 'Due Settlement' as const,
      reference: d.id.startsWith('due-rec-') ? `REC-${d.id.slice(-6)}` : d.id,
      note: d.note || 'Supplier due collection payment',
      collector: d.collectedBy || 'Admin',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 4. Unified Chronological Transaction Ledger (Timeline)
  interface LedgerEntry {
    id: string;
    date: string;
    description: string;
    reference: string;
    type: 'PURCHASE' | 'PAYMENT';
    debit: number; // Increases payable (Purchase)
    credit: number; // Decreases payable (Payment)
    balanceAfter: number;
  }

  // Build sorted timeline from oldest to newest to compute running balance
  const rawEvents = [
    ...supplierPurchases.map((p) => ({
      id: `pur-${p.id}`,
      date: p.date,
      description: `Purchase Invoice: ${p.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ') || 'Inventory items'}`,
      reference: p.purchaseNo,
      type: 'PURCHASE' as const,
      amount: p.totalAmount,
      paidAtPurchase: p.paidAmount,
      paymentMethod: p.paymentMethod,
    })),
    ...supplierDueCollections.map((d) => ({
      id: `due-${d.id}`,
      date: d.date,
      description: d.note ? `Due Payment: ${d.note}` : `Due Payment Settlement via ${d.paymentMethod}`,
      reference: d.id.startsWith('due-rec-') ? `REC-${d.id.slice(-6)}` : d.id,
      type: 'PAYMENT' as const,
      amount: d.amountPaid,
      paidAtPurchase: 0,
      paymentMethod: d.paymentMethod,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const ledgerEntries: LedgerEntry[] = [];

  rawEvents.forEach((ev) => {
    if (ev.type === 'PURCHASE') {
      // 1. Add full purchase order to payable
      runningBalance += ev.amount;
      ledgerEntries.push({
        id: `${ev.id}-order`,
        date: ev.date,
        description: ev.description,
        reference: ev.reference,
        type: 'PURCHASE',
        debit: ev.amount,
        credit: 0,
        balanceAfter: runningBalance,
      });

      // 2. If immediate payment was made at purchase, record payment entry
      if (ev.paidAtPurchase > 0) {
        runningBalance -= ev.paidAtPurchase;
        ledgerEntries.push({
          id: `${ev.id}-paid`,
          date: ev.date,
          description: `Initial Payment for ${ev.reference} (${ev.paymentMethod})`,
          reference: ev.reference,
          type: 'PAYMENT',
          debit: 0,
          credit: ev.paidAtPurchase,
          balanceAfter: runningBalance,
        });
      }
    } else if (ev.type === 'PAYMENT') {
      runningBalance = Math.max(0, runningBalance - ev.amount);
      ledgerEntries.push({
        id: ev.id,
        date: ev.date,
        description: ev.description,
        reference: ev.reference,
        type: 'PAYMENT',
        debit: 0,
        credit: ev.amount,
        balanceAfter: runningBalance,
      });
    }
  });

  // Reverse so newest transactions are displayed at top
  const displayLedger = [...ledgerEntries].reverse();

  // Print Statement Helper
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supplier Statement - ${supplier.name}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 20px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
            .brand-name { font-size: 22px; font-weight: 900; color: #0f172a; }
            .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .title { font-size: 18px; font-weight: 800; text-align: right; color: #ff5c01; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }
            .info-box h4 { margin: 0 0 6px 0; font-size: 13px; color: #0f172a; text-transform: uppercase; font-weight: 800; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
            .metric-card { background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; }
            .metric-val { font-size: 18px; font-weight: 900; color: #0f172a; }
            .metric-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; text-transform: uppercase; font-size: 11px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .due-badge { color: #dc2626; font-weight: 800; }
            .paid-badge { color: #16a34a; font-weight: 800; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">${settings.businessName || 'Business Suite'}</div>
              <div class="brand-sub">${settings.address || ''} | ${settings.phone || ''}</div>
            </div>
            <div>
              <div class="title">SUPPLIER STATEMENT</div>
              <div style="font-size: 12px; color: #64748b; text-align: right;">Generated: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h4>Supplier Details</h4>
              <div><strong>Name:</strong> ${supplier.name}</div>
              <div><strong>Company:</strong> ${supplier.company || 'N/A'}</div>
              <div><strong>Phone:</strong> ${supplier.mobile}</div>
              <div><strong>Address:</strong> ${supplier.address || 'N/A'}</div>
            </div>
            <div class="info-box">
              <h4>Account Summary</h4>
              <div><strong>Total Purchases:</strong> ${symbol} ${(totalPurchaseAmount || 0).toLocaleString()}</div>
              <div><strong>Total Paid:</strong> ${symbol} ${(totalPaid || 0).toLocaleString()}</div>
              <div><strong>Outstanding Balance:</strong> <span class="due-badge">${symbol} ${(outstandingPayable || 0).toLocaleString()}</span></div>
              <div><strong>Total Invoices:</strong> ${supplierPurchases.length}</div>
            </div>
          </div>

          <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 8px;">Transaction Ledger</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th class="text-right">Debit (+)</th>
                <th class="text-right">Credit (-)</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerEntries.map((row) => `
                <tr>
                  <td>${new Date(row.date).toLocaleDateString()}</td>
                  <td><strong>${row.reference}</strong></td>
                  <td>${row.description}</td>
                  <td class="text-right">${(row.debit || 0) > 0 ? `${symbol} ${(row.debit || 0).toLocaleString()}` : '-'}</td>
                  <td class="text-right">${(row.credit || 0) > 0 ? `${symbol} ${(row.credit || 0).toLocaleString()}` : '-'}</td>
                  <td class="text-right" style="font-weight: bold;">${symbol} ${(row.balanceAfter || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Thank you for your business partnership! | ${settings.businessName || 'YearInvo'}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#ff5c01] flex items-center justify-center font-black shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {supplier.name}
                  </h2>
                  {supplier.company && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {supplier.company}
                    </span>
                  )}
                  {outstandingPayable > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Due Payable: {symbol} {(outstandingPayable || 0).toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Fully Settled
                    </span>
                  )}
                </div>

                {/* Contact Meta Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <a
                    href={`tel:${supplier.mobile}`}
                    className="flex items-center gap-1 hover:text-[#ff5c01] font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {supplier.mobile}
                  </a>
                  {supplier.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {supplier.email}
                    </span>
                  )}
                  {supplier.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {supplier.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Financial Highlight Cards */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Total Purchase Amount */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Total Purchase
                  </span>
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  {symbol} {(totalPurchaseAmount || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {supplierPurchases.length} invoices recorded
                </div>
              </div>

              {/* Total Paid */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Total Paid
                  </span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {symbol} {(totalPaid || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {paymentHistory.length} payments completed
                </div>
              </div>

              {/* Outstanding Payable Due */}
              <div className={`p-4 rounded-2xl border ${
                outstandingPayable > 0
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    outstandingPayable > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                  }`}>
                    Outstanding Due
                  </span>
                  <ArrowUpRight className={`w-4 h-4 ${outstandingPayable > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                <div className={`text-lg sm:text-xl font-black mt-1 ${
                  outstandingPayable > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {symbol} {(outstandingPayable || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {outstandingPayable > 0 ? 'Action required' : 'No balance pending'}
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-center gap-2">
                <button
                  onClick={() => onRecordPayment(supplier)}
                  className="w-full py-2 px-3 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Due</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onNewPurchase(supplier)}
                    className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3 text-[#ff5c01]" />
                    <span>Purchase</span>
                  </button>
                  <button
                    onClick={handlePrintStatement}
                    className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Statement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-5 sm:px-6 pt-3 pb-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'purchases'
                  ? 'border-[#ff5c01] text-[#ff5c01]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase History ({supplierPurchases.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'payments'
                  ? 'border-[#ff5c01] text-[#ff5c01]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment History ({paymentHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transactions'
                  ? 'border-[#ff5c01] text-[#ff5c01]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Transaction History ({displayLedger.length})</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
            {/* 1. PURCHASE HISTORY TAB */}
            {activeTab === 'purchases' && (
              <div className="space-y-3">
                {supplierPurchases.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No purchase invoices recorded yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Create purchase orders to restock products from this supplier and track payments automatically.
                    </p>
                    <button
                      onClick={() => onNewPurchase(supplier)}
                      className="mt-4 px-4 py-2 bg-[#ff5c01] text-white rounded-xl text-xs font-bold hover:bg-[#e05100] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create First Purchase</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="py-3 px-4">Invoice No</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Items Summary</th>
                            <th className="py-3 px-4 text-right">Total</th>
                            <th className="py-3 px-4 text-right">Paid</th>
                            <th className="py-3 px-4 text-right">Due</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                          {supplierPurchases.map((purchase) => {
                            const isPaid = purchase.dueAmount <= 0;
                            const isPartial = purchase.paidAmount > 0 && purchase.dueAmount > 0;
                            return (
                              <tr key={purchase.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                  {purchase.purchaseNo}
                                </td>
                                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  {formatDate(purchase.date)}
                                </td>
                                <td className="py-3 px-4 max-w-xs truncate" title={purchase.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}>
                                  {purchase.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                                  {symbol} {(purchase.totalAmount || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                  {symbol} {(purchase.paidAmount || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-bold">
                                  {purchase.dueAmount > 0 ? (
                                    <span className="text-rose-600 dark:text-rose-400">
                                      {symbol} {(purchase.dueAmount || 0).toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">৳0</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {isPaid ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      Paid
                                    </span>
                                  ) : isPartial ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      Partial Due
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      Unpaid Due
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => setSelectedInvoice(purchase)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#ff5c01] hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                                    title="View Invoice"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. PAYMENT HISTORY TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                {paymentHistory.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No payments recorded yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      All purchase down-payments and settlement transactions for this vendor will be logged here.
                    </p>
                    <button
                      onClick={() => onRecordPayment(supplier)}
                      className="mt-4 px-4 py-2 bg-[#ff5c01] text-white rounded-xl text-xs font-bold hover:bg-[#e05100] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Reference</th>
                            <th className="py-3 px-4">Payment Method</th>
                            <th className="py-3 px-4 text-right">Amount Paid</th>
                            <th className="py-3 px-4">Notes</th>
                            <th className="py-3 px-4">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                          {paymentHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(item.date)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.type === 'Due Settlement'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                {item.reference}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {item.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                                {symbol} {(item.amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                {item.note || '-'}
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                {item.collector}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. UNIFIED TRANSACTION LEDGER TAB */}
            {activeTab === 'transactions' && (
              <div className="space-y-3">
                {displayLedger.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No ledger transactions yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Transactions will automatically build a debit/credit running ledger as purchases and payments occur.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Reference</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4 text-right">Debit (Purchase +)</th>
                            <th className="py-3 px-4 text-right">Credit (Paid -)</th>
                            <th className="py-3 px-4 text-right">Outstanding Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                          {displayLedger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(entry.date)}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                {entry.reference}
                              </td>
                              <td className="py-3 px-4 max-w-sm truncate text-slate-600 dark:text-slate-300" title={entry.description}>
                                {entry.description}
                              </td>
                              <td className="py-3 px-4 text-right font-bold">
                                {entry.debit > 0 ? (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    +{symbol} {(entry.debit || 0).toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-bold">
                                {entry.credit > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    -{symbol} {(entry.credit || 0).toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-600">-</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-black">
                                <span className={entry.balanceAfter > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                                  {symbol} {(entry.balanceAfter || 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Supplier ID: <span className="font-mono font-bold">{supplier.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onRecordPayment(supplier)}
                className="px-5 py-2 text-xs font-bold bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Outstanding Due</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Nested Purchase Invoice View */}
      {selectedInvoice && (
        <PurchaseInvoiceModal
          purchase={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { getCustomerStoreName } from '../../utils/brand';
import {
  Store,
  CheckCircle,
  AlertCircle,
  Printer,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  TrendingDown,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface LivePublicViewProps {
  dueCustomerId?: string | null;
  invoiceNo?: string | null;
  onExitLiveView?: () => void;
}

export const LivePublicView: React.FC<LivePublicViewProps> = ({
  dueCustomerId,
  invoiceNo,
  onExitLiveView,
}) => {
  const { customers, sales, dueCollections, settings, user, language } = useApp();
  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  const rawBrand = settings.brandName || user?.brandName || '';
  const storeName = getCustomerStoreName(rawBrand) || rawBrand || 'YearInvo Retail';
  const storePhone = settings.phone || user?.mobile || '';
  const storeEmail = settings.email || user?.email || '';
  const storeAddress = settings.storeAddress || user?.storeAddress || '';

  // 1. If customer due statement mode
  const targetCustomer = dueCustomerId
    ? customers.find(
        (c) =>
          c.id.toLowerCase() === dueCustomerId.toLowerCase() ||
          (c.phone && c.phone.replace(/[^0-9]/g, '').includes(dueCustomerId.replace(/[^0-9]/g, '')))
      )
    : null;

  // Filter sales & collections for target customer
  const customerSales = targetCustomer
    ? sales.filter(
        (s) =>
          (s.customerId && s.customerId === targetCustomer.id) ||
          (s.customerName && s.customerName.toLowerCase() === targetCustomer.name.toLowerCase())
      )
    : [];

  const customerCollections = targetCustomer
    ? dueCollections.filter((d) => d.entityId === targetCustomer.id && d.type === 'customer')
    : [];

  // Calculate live dynamic due amount
  const liveDueBalance = targetCustomer ? targetCustomer.dueAmount ?? targetCustomer.totalDue ?? 0 : 0;

  // 2. If single invoice view mode
  const targetInvoice = invoiceNo
    ? sales.find((s) => s.invoiceNo.toLowerCase() === invoiceNo.toLowerCase())
    : null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappStoreUrl = storePhone
    ? `https://api.whatsapp.com/send?phone=${storePhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
        `Hello ${storeName}, I am viewing my live account statement. My current balance is ${symbol}${liveDueBalance}.`
      )}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans p-3 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Top Banner indicating Live Connection */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 flex items-center justify-between text-xs font-extrabold shadow-sm flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>{isBn ? '🔴 লাইভ রিয়েল-টাইম স্টেটমেন্ট (Live Statement)' : '🔴 LIVE REAL-TIME STATEMENT'}</span>
            <span className="hidden sm:inline-block opacity-80 font-normal">| Auto-Updated on Changes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
            {onExitLiveView && (
              <button
                onClick={onExitLiveView}
                className="px-2.5 py-1 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer font-black"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Store Admin App</span>
              </button>
            )}
          </div>
        </div>

        {/* Store Header Branding */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#ff5c01] font-black text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Verified Merchant Partner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{storeName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              {storePhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {storePhone}
                </span>
              )}
              {storeEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {storeEmail}
                </span>
              )}
              {storeAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {storeAddress}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {/* CONTENT AREA: 1. Customer Due Statement */}
        {dueCustomerId && (
          <div className="p-6 sm:p-8 space-y-6">
            {!targetCustomer ? (
              <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-sm text-rose-800 dark:text-rose-200">Customer Statement Not Found</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  The requested live customer ID does not exist or may have been removed. Please check the link or contact {storeName}.
                </p>
              </div>
            ) : (
              <>
                {/* Customer Account Summary Card */}
                <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#ff5c01] text-white">
                      Customer Live Account
                    </span>
                    <h2 className="text-2xl font-black">{targetCustomer.name}</h2>
                    <p className="text-xs text-slate-300 font-mono">
                      Phone: {targetCustomer.phone || 'N/A'} • Address: {targetCustomer.address || 'N/A'}
                    </p>
                  </div>

                  {/* Live Outstanding Due Balance Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right min-w-[220px]">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Live Outstanding Balance
                    </span>
                    <h3 className={`text-3xl font-black mt-1 ${liveDueBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {symbol} {liveDueBalance.toLocaleString()}
                    </h3>
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      {liveDueBalance > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" /> Due Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3" /> Fully Clear
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick WhatsApp Contact Link */}
                {storePhone && (
                  <div className="flex justify-end">
                    <a
                      href={whatsappStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Message {storeName} on WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Live Sales & Invoice History Table */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ff5c01]" />
                    <span>Live Transaction & Purchases History ({customerSales.length})</span>
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                        <tr>
                          <th className="p-3.5">Invoice No</th>
                          <th className="p-3.5">Date & Time</th>
                          <th className="p-3.5 text-right">Total</th>
                          <th className="p-3.5 text-right">Paid</th>
                          <th className="p-3.5 text-right">Due Balance</th>
                          <th className="p-3.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {customerSales.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              No purchase records found for this customer.
                            </td>
                          </tr>
                        ) : (
                          customerSales.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{s.invoiceNo}</td>
                              <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                {new Date(s.date).toLocaleString()}
                              </td>
                              <td className="p-3.5 text-right font-bold">{symbol} {s.total.toLocaleString()}</td>
                              <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                {symbol} {s.paidAmount.toLocaleString()}
                              </td>
                              <td className="p-3.5 text-right text-rose-600 dark:text-rose-400 font-black">
                                {symbol} {s.dueAmount.toLocaleString()}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  s.dueAmount > 0
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {s.dueAmount > 0 ? 'Due Pending' : 'Paid'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Payment Collections Received History */}
                {customerCollections.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                      <span>Payment Collections Received ({customerCollections.length})</span>
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                          <tr>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5">Method</th>
                            <th className="p-3.5 text-right">Amount Collected</th>
                            <th className="p-3.5">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {customerCollections.map((col) => (
                            <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                                {new Date(col.date).toLocaleString()}
                              </td>
                              <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{col.paymentMethod}</td>
                              <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                                + {symbol} {col.amountPaid.toLocaleString()}
                              </td>
                              <td className="p-3.5 text-slate-400 text-[11px]">{col.note || 'Due payment collection'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CONTENT AREA: 2. Single Digital Invoice View */}
        {invoiceNo && !dueCustomerId && (
          <div className="p-6 sm:p-8 space-y-6">
            {!targetInvoice ? (
              <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-sm text-rose-800 dark:text-rose-200">Invoice #{invoiceNo} Not Found</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  The requested live invoice number could not be located.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
                {/* Receipt Header */}
                <div className="text-center space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">{storeName}</h2>
                  <p className="text-xs text-slate-500 font-mono">Invoice #{targetInvoice.invoiceNo}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(targetInvoice.date).toLocaleString()}
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Items</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {targetInvoice.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.quantity} x {symbol}{item.sellingPrice}
                          </p>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          {symbol} {item.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1.5 text-xs font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{symbol} {targetInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {targetInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>- {symbol} {targetInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {targetInvoice.tax > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Tax</span>
                      <span>+ {symbol} {targetInvoice.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total</span>
                    <span>{symbol} {targetInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Paid Amount</span>
                    <span>{symbol} {targetInvoice.paidAmount.toLocaleString()}</span>
                  </div>
                  {targetInvoice.dueAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-black text-sm pt-1">
                      <span>Remaining Due</span>
                      <span>{symbol} {targetInvoice.dueAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="pt-2 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                    targetInvoice.dueAmount > 0
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                    {targetInvoice.dueAmount > 0 ? 'Partial Payment (Due Outstanding)' : 'Verified Fully Paid'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 font-medium">
          Powered by <strong className="text-slate-700 dark:text-slate-300">YearInvo</strong> by Year Media • Verified Live Statement Portal
        </div>
      </div>
    </div>
  );
};

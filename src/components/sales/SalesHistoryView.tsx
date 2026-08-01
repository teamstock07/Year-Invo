import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { ShoppingBag, Search, Eye, Calendar, Printer } from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const { user, setActiveTab, sales, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            {t('navSales')} ({sales.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete transaction history with reprintable receipts and cashier tracking.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice or customer..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">Invoice No</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4 text-right">Items</th>
              <th className="p-4 text-right">Total Amount</th>
              <th className="p-4 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-100">{sale.invoiceNo}</td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">
                  {new Date(sale.date).toLocaleString()}
                </td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{sale.customerName}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold text-[10px]">
                    {sale.paymentMethod}
                  </span>
                </td>
                <td className="p-4 text-right font-bold">{sale.items.length} items</td>
                <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                  {symbol} {sale.total.toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsReceiptOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="View & Print Receipt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        sale={selectedSale}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

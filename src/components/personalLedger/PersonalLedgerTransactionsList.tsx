import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalTransaction, PersonalTransactionType } from '../../types';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Trash2,
  Filter,
  CreditCard,
  User,
} from 'lucide-react';

interface PersonalLedgerTransactionsListProps {
  onOpenAddTx: (type?: any, contactId?: string) => void;
  onOpenStatementForContactId: (contactId: string) => void;
}

export const PersonalLedgerTransactionsList: React.FC<PersonalLedgerTransactionsListProps> = ({
  onOpenAddTx,
  onOpenStatementForContactId,
}) => {
  const {
    personalTransactions,
    personalContacts,
    deletePersonalTransaction,
    formatCurrency,
    displayCurrencySymbol,
    language,
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | PersonalTransactionType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const sortedTxs = [...personalTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = sortedTxs.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = tx.contactName.toLowerCase().includes(q);
      const matchPhone = (tx.contactPhone || '').toLowerCase().includes(q);
      const matchNote = (tx.notes || '').toLowerCase().includes(q);
      const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNote && !matchMethod) return false;
    }
    return true;
  });

  const handleDelete = (txId: string) => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?'
          : 'Are you sure you want to delete this transaction?'
      )
    ) {
      deletePersonalTransaction(txId);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search & Actions Top Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'ব্যক্তির নাম, বিবরণ বা মাধ্যম খুঁজুন...'
                : 'Search transactions by name, note or method...'
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddTx()}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন লেনদেন' : 'New Transaction'}</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Type Buttons and Dates */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              typeFilter === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'bn' ? 'সব লেনদেন' : 'All'} ({personalTransactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('RECEIVABLE')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'RECEIVABLE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'টাকা দিয়েছি (পাব)' : 'Lent'}</span>
          </button>
          <button
            onClick={() => setTypeFilter('PAYABLE')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'PAYABLE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'টাকা নিয়েছি (দেব)' : 'Borrowed'}</span>
          </button>
          <button
            onClick={() => setTypeFilter('SETTLEMENT_RECEIVED')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'SETTLEMENT_RECEIVED'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-teal-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'আদায় পেলাম' : 'Collected'}</span>
          </button>
          <button
            onClick={() => setTypeFilter('SETTLEMENT_PAID')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'SETTLEMENT_PAID'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পরিশোধ দিলাম' : 'Paid Back'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-orange-500"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-orange-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-orange-400 hover:text-orange-300 font-bold"
            >
              {language === 'bn' ? 'রিসেট' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">ব্যক্তি</th>
                <th className="py-3 px-4">লেনদেনের ধরণ</th>
                <th className="py-3 px-4">বিবরণ / নোট</th>
                <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                <th className="py-3 px-4 text-right">পরিমাণ</th>
                <th className="py-3 px-4 text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    কোনো লেনদেন রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isReceivable = tx.type === 'RECEIVABLE';
                  const isPayable = tx.type === 'PAYABLE';
                  const isSettleRec = tx.type === 'SETTLEMENT_RECEIVED';
                  const isSettlePaid = tx.type === 'SETTLEMENT_PAID';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        <span className="font-semibold">{tx.date}</span>
                        {tx.dueDate && (
                          <span className="block text-[10px] text-amber-400">
                            ফেরত: {tx.dueDate}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenStatementForContactId(tx.contactId)}
                          className="font-bold text-white hover:text-orange-400 transition-colors text-left flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{tx.contactName}</span>
                        </button>
                        {tx.contactPhone && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {tx.contactPhone}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isReceivable && (
                          <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/20 inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>{language === 'bn' ? 'টাকা দিলাম (পাব)' : 'Lent Money'}</span>
                          </span>
                        )}
                        {isPayable && (
                          <span className="px-2 py-1 rounded-md bg-rose-500/15 text-rose-300 text-[11px] font-bold border border-rose-500/20 inline-flex items-center gap-1">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>{language === 'bn' ? 'টাকা নিলাম (দেব)' : 'Borrowed'}</span>
                          </span>
                        )}
                        {isSettleRec && (
                          <span className="px-2 py-1 rounded-md bg-teal-500/15 text-teal-300 text-[11px] font-bold border border-teal-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'bn' ? 'আদায় পেলাম' : 'Settled Rec.'}</span>
                          </span>
                        )}
                        {isSettlePaid && (
                          <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'bn' ? 'পরিশোধ দিলাম' : 'Settled Paid'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs">
                        <span className="line-clamp-2">{tx.notes || '-'}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-[11px]">
                          {tx.paymentMethod || 'Cash'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={`text-sm ${
                            isReceivable
                              ? 'text-emerald-400'
                              : isPayable
                              ? 'text-rose-400'
                              : isSettleRec
                              ? 'text-teal-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {isReceivable && `+${formatCurrency(tx.amount)}`}
                          {isPayable && `-${formatCurrency(tx.amount)}`}
                          {isSettleRec && `-${formatCurrency(tx.amount)}`}
                          {isSettlePaid && `-${formatCurrency(tx.amount)}`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

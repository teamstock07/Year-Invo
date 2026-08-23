import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact, PersonalTransaction } from '../../types';
import {
  X,
  Printer,
  Share2,
  Phone,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Trash2,
  Edit2,
  MessageSquare,
} from 'lucide-react';

interface PersonalContactStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: PersonalContact;
  onAddTransaction: (contactId: string) => void;
  onSettleDue: (contact: PersonalContact, balance: number) => void;
}

export const PersonalContactStatementModal: React.FC<PersonalContactStatementModalProps> = ({
  isOpen,
  onClose,
  contact,
  onAddTransaction,
  onSettleDue,
}) => {
  const {
    personalTransactions,
    deletePersonalTransaction,
    displayCurrencySymbol,
    formatCurrency,
    settings,
    language,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_30_days'>('all');

  if (!isOpen) return null;

  // Filter transactions for this contact
  const contactTxs = personalTransactions
    .filter((tx) => tx.contactId === contact.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  let totalGiven = 0; // RECEIVABLE (I gave money)
  let totalTaken = 0; // PAYABLE (I borrowed money)
  let totalReceivedBack = 0; // SETTLEMENT_RECEIVED
  let totalPaidBack = 0; // SETTLEMENT_PAID

  contactTxs.forEach((tx) => {
    if (tx.type === 'RECEIVABLE') totalGiven += tx.amount;
    else if (tx.type === 'PAYABLE') totalTaken += tx.amount;
    else if (tx.type === 'SETTLEMENT_RECEIVED') totalReceivedBack += tx.amount;
    else if (tx.type === 'SETTLEMENT_PAID') totalPaidBack += tx.amount;
  });

  // Net Receivable from Contact = totalGiven - totalReceivedBack
  // Net Payable to Contact = totalTaken - totalPaidBack
  // Net overall balance for this contact: (totalGiven - totalReceivedBack) - (totalTaken - totalPaidBack)
  const netReceivable = Math.max(0, totalGiven - totalReceivedBack);
  const netPayable = Math.max(0, totalTaken - totalPaidBack);
  const netBalance = (totalGiven - totalReceivedBack) - (totalTaken - totalPaidBack);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!contact.phone) return;
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    let msg = '';

    if (netBalance > 0) {
      msg = `নমস্কার / আসসালামু আলাইকুম ${contact.name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আপনার কাছে বর্তমান পাওনা রয়েছে ৳${netBalance.toLocaleString()}.\nধন্যবাদ।`;
    } else if (netBalance < 0) {
      msg = `নমস্কার / আসসালামু আলাইকুম ${contact.name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আপনার দেনা রয়েছে ৳${Math.abs(netBalance).toLocaleString()}.\nধন্যবাদ।`;
    } else {
      msg = `নমস্কার / আসসালামু আলাইকুম ${contact.name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আমাদের মধ্যে কোনো বকেয়া নেই (হিসাব পরিষ্কার ৳0).\nধন্যবাদ।`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold text-lg">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {contact.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {contact.phone}
                  </span>
                )}
                {contact.address && <span>• {contact.address}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.phone && (
              <button
                onClick={handleShareWhatsApp}
                title="WhatsApp Reminder"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              title="Print Statement"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ব্যক্তিগত খাতা স্টেটমেন্ট</h1>
              <p className="text-sm text-gray-600">Personal Ledger Statement</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm">
            <div>
              <p className="font-bold text-gray-900">{contact.name}</p>
              {contact.phone && <p className="text-gray-600">ফোন: {contact.phone}</p>}
              {contact.address && <p className="text-gray-600">ঠিকানা: {contact.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">বর্তমান স্থিতি</p>
              <p className="text-lg font-bold text-gray-900">
                {netBalance > 0
                  ? `আমি পাব: ৳${netBalance.toLocaleString()}`
                  : netBalance < 0
                  ? `আমি দেব: ৳${Math.abs(netBalance).toLocaleString()}`
                  : 'পরিশোধিত (৳0)'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 print:p-6 print:overflow-visible">
          {/* Summary Balance Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 print:bg-gray-50 print:border-gray-200 print:text-gray-900">
              <span className="text-xs font-semibold text-emerald-300/80 block print:text-gray-500">
                মোট আমি পাব (ঋণ দেওয়া)
              </span>
              <span className="text-xl font-bold mt-1 block">
                {formatCurrency(totalGiven)}
              </span>
              <span className="text-[11px] text-emerald-400/70 block mt-0.5 print:text-gray-500">
                আদায় এসেছে: {formatCurrency(totalReceivedBack)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 print:bg-gray-50 print:border-gray-200 print:text-gray-900">
              <span className="text-xs font-semibold text-rose-300/80 block print:text-gray-500">
                মোট আমি দেব (ঋণ গ্রহণ)
              </span>
              <span className="text-xl font-bold mt-1 block">
                {formatCurrency(totalTaken)}
              </span>
              <span className="text-[11px] text-rose-400/70 block mt-0.5 print:text-gray-500">
                পরিশোধ করেছি: {formatCurrency(totalPaidBack)}
              </span>
            </div>

            <div
              className={`p-4 rounded-xl border print:bg-gray-100 print:border-gray-300 ${
                netBalance > 0
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : netBalance < 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800/40 border-slate-700 text-slate-300'
              }`}
            >
              <span className="text-xs font-semibold opacity-80 block print:text-gray-600">
                বর্তমান নেট স্থিতি
              </span>
              <span className="text-xl font-black mt-1 block">
                {formatCurrency(Math.abs(netBalance))}
              </span>
              <span className="text-[11px] font-medium block mt-0.5">
                {netBalance > 0
                  ? '• আপনার কাছে পাওনা'
                  : netBalance < 0
                  ? '• আপনার দেনা পরিশোধযোগ্য'
                  : '• হিসাব পরিশোধিত (শূন্য)'}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>লেনদেন বিবরণী ({contactTxs.length})</span>
            </h4>
            <div className="flex items-center gap-2">
              {Math.abs(netBalance) > 0 && (
                <button
                  type="button"
                  onClick={() => onSettleDue(contact, netBalance)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{netBalance > 0 ? 'টাকা আদায় নিন' : 'টাকা পরিশোধ দিন'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onAddTransaction(contact.id)}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>+ নতুন লেনদেন</span>
              </button>
            </div>
          </div>

          {/* Transactions Table / List */}
          <div className="rounded-xl border border-slate-800 overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold print:bg-gray-100 print:text-gray-700 print:border-gray-300">
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3">লেনদেনের বিবরণ</th>
                  <th className="py-2.5 px-3">মাধ্যম</th>
                  <th className="py-2.5 px-3 text-right">আমি পাব / আদায়</th>
                  <th className="py-2.5 px-3 text-right">আমি দেব / পরিশোধ</th>
                  <th className="py-2.5 px-3 text-center print:hidden">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                {contactTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 print:text-gray-500">
                      কোনো লেনদেন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  contactTxs.map((tx) => {
                    const isReceivableTx = tx.type === 'RECEIVABLE';
                    const isPayableTx = tx.type === 'PAYABLE';
                    const isSettleRec = tx.type === 'SETTLEMENT_RECEIVED';
                    const isSettlePaid = tx.type === 'SETTLEMENT_PAID';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/30 transition-colors print:hover:bg-transparent"
                      >
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap print:text-gray-800">
                          {tx.date}
                          {tx.dueDate && (
                            <span className="block text-[10px] text-amber-400">
                              ফেরত: {tx.dueDate}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-white print:text-gray-900 flex items-center gap-1.5">
                            {isReceivableTx && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                                টাকা দিয়েছি (আমি পাব)
                              </span>
                            )}
                            {isPayableTx && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px]">
                                টাকা নিয়েছি (আমি দেব)
                              </span>
                            )}
                            {isSettleRec && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px]">
                                আদায় পেলাম
                              </span>
                            )}
                            {isSettlePaid && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                                পরিশোধ দিয়েছি
                              </span>
                            )}
                          </div>
                          {tx.notes && (
                            <p className="text-slate-400 text-[11px] mt-0.5 print:text-gray-600">
                              {tx.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-gray-600 whitespace-nowrap">
                          {tx.paymentMethod || 'Cash'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                          {isReceivableTx && (
                            <span className="text-emerald-400 print:text-emerald-700">
                              +{formatCurrency(tx.amount)}
                            </span>
                          )}
                          {isSettleRec && (
                            <span className="text-teal-400 print:text-teal-700">
                              -{formatCurrency(tx.amount)} (আদায়)
                            </span>
                          )}
                          {!isReceivableTx && !isSettleRec && <span className="text-slate-600">-</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                          {isPayableTx && (
                            <span className="text-rose-400 print:text-rose-700">
                              +{formatCurrency(tx.amount)}
                            </span>
                          )}
                          {isSettlePaid && (
                            <span className="text-amber-400 print:text-amber-700">
                              -{formatCurrency(tx.amount)} (শোধ)
                            </span>
                          )}
                          {!isPayableTx && !isSettlePaid && <span className="text-slate-600">-</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center print:hidden whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('এই লেনদেনটি মুছে ফেলতে চান?')) {
                                deletePersonalTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Transaction"
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
    </div>
  );
};

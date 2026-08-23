import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact, PersonalTransaction } from '../../types';
import {
  Search,
  Plus,
  User,
  Phone,
  MapPin,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

interface PersonalLedgerContactsListProps {
  initialFilter?: 'all' | 'receivable' | 'payable' | 'settled';
  onOpenAddContact: () => void;
  onOpenEditContact: (contact: PersonalContact) => void;
  onOpenAddTx: (type?: any, contactId?: string) => void;
  onOpenStatement: (contact: PersonalContact) => void;
  onOpenSettle: (contact: PersonalContact, balance: number) => void;
}

export const PersonalLedgerContactsList: React.FC<PersonalLedgerContactsListProps> = ({
  initialFilter = 'all',
  onOpenAddContact,
  onOpenEditContact,
  onOpenAddTx,
  onOpenStatement,
  onOpenSettle,
}) => {
  const {
    personalContacts,
    personalTransactions,
    deletePersonalContact,
    formatCurrency,
    language,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'receivable' | 'payable' | 'settled'>(
    initialFilter
  );

  React.useEffect(() => {
    setFilterTab(initialFilter);
  }, [initialFilter]);

  // Compute balance for every contact
  const contactStats = personalContacts.map((contact) => {
    const txs = personalTransactions.filter((t) => t.contactId === contact.id);
    let given = 0;
    let receivedBack = 0;
    let taken = 0;
    let paidBack = 0;

    txs.forEach((tx) => {
      if (tx.type === 'RECEIVABLE') given += tx.amount;
      else if (tx.type === 'SETTLEMENT_RECEIVED') receivedBack += tx.amount;
      else if (tx.type === 'PAYABLE') taken += tx.amount;
      else if (tx.type === 'SETTLEMENT_PAID') paidBack += tx.amount;
    });

    const netBalance = (given - receivedBack) - (taken - paidBack);

    return {
      contact,
      given,
      receivedBack,
      taken,
      paidBack,
      netBalance,
      txCount: txs.length,
      lastTxDate: txs.length > 0 ? txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null,
    };
  });

  // Filter contacts
  const filtered = contactStats.filter(({ contact, netBalance }) => {
    // Tab filter
    if (filterTab === 'receivable' && netBalance <= 0) return false;
    if (filterTab === 'payable' && netBalance >= 0) return false;
    if (filterTab === 'settled' && netBalance !== 0) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = contact.name.toLowerCase().includes(q);
      const matchPhone = (contact.phone || '').toLowerCase().includes(q);
      const matchAddress = (contact.address || '').toLowerCase().includes(q);
      const matchNotes = (contact.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAddress && !matchNotes) return false;
    }

    return true;
  });

  const handleDelete = (contactId: string, name: string) => {
    if (
      window.confirm(
        language === 'bn'
          ? `আপনি কি নিশ্চিত যে "${name}"-কে এবং তার সাথে জড়িত সকল লেনদেন মুছে ফেলতে চান?`
          : `Are you sure you want to delete ${name} and all related transactions?`
      )
    ) {
      deletePersonalContact(contactId);
    }
  };

  const handleWhatsApp = (phone?: string, name?: string, balance: number = 0) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let msg = '';
    if (balance > 0) {
      msg = `নমস্কার / আসসালামু আলাইকুম ${name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আপনার কাছে বর্তমান পাওনা রয়েছে ৳${balance.toLocaleString()}.\nধন্যবাদ।`;
    } else if (balance < 0) {
      msg = `নমস্কার / আসসালামু আলাইকুম ${name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আপনার দেনা রয়েছে ৳${Math.abs(balance).toLocaleString()}.\nধন্যবাদ।`;
    } else {
      msg = `নমস্কার / আসসালামু আলাইকুম ${name},\nব্যক্তিগত খাতার হিসাব অনুযায়ী আমাদের মধ্যে কোনো বকেয়া নেই (হিসাব পরিষ্কার ৳0).\nধন্যবাদ।`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'নাম, মোবাইল নম্বর বা ঠিকানা খুঁজুন...'
                : 'Search by name, phone or address...'
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenAddContact}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ব্যক্তি যোগ করুন' : 'Add Person'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filterTab === 'all'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          {language === 'bn' ? 'সকল পরিচিতি' : 'All Contacts'} ({personalContacts.length})
        </button>
        <button
          onClick={() => setFilterTab('receivable')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterTab === 'receivable'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{language === 'bn' ? 'আমি পাব (পাওনা)' : 'I Will Receive'}</span>
          <span>({contactStats.filter((c) => c.netBalance > 0).length})</span>
        </button>
        <button
          onClick={() => setFilterTab('payable')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterTab === 'payable'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{language === 'bn' ? 'আমি দেব (দেনা)' : 'I Will Pay'}</span>
          <span>({contactStats.filter((c) => c.netBalance < 0).length})</span>
        </button>
        <button
          onClick={() => setFilterTab('settled')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filterTab === 'settled'
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          {language === 'bn' ? 'পরিশোধিত (০ স্থিতি)' : 'Settled (৳0)'} (
          {contactStats.filter((c) => c.netBalance === 0).length})
        </button>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-bold text-white mb-1">
              {language === 'bn' ? 'কোনো ব্যক্তি বা হিসাব পাওয়া যায়নি' : 'No contacts found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {language === 'bn'
                ? 'ব্যক্তিগত খাতার পরিচিতি যোগ করতে উপরের বাটনে ক্লিক করুন।'
                : 'Click the button below to add your first personal ledger contact.'}
            </p>
            <button
              onClick={onOpenAddContact}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
            >
              + {language === 'bn' ? 'নতুন ব্যক্তি যোগ করুন' : 'Add New Person'}
            </button>
          </div>
        ) : (
          filtered.map(({ contact, netBalance, txCount, lastTxDate }) => {
            const isReceivable = netBalance > 0;
            const isPayable = netBalance < 0;
            const isSettled = netBalance === 0;

            return (
              <div
                key={contact.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl"
              >
                <div>
                  {/* Top Bar with Avatar & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => onOpenStatement(contact)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                          isReceivable
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isPayable
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                          {contact.name}
                        </h4>
                        {contact.phone ? (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{contact.phone}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {language === 'bn' ? 'ফোন নম্বর নেই' : 'No phone'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {contact.phone && (
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(contact.phone, contact.name, netBalance)}
                          title="WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenEditContact(contact)}
                        title="Edit Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id, contact.name)}
                        title="Delete Person"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {contact.address && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{contact.address}</span>
                    </p>
                  )}

                  {/* Balance Display */}
                  <div
                    onClick={() => onOpenStatement(contact)}
                    className={`mt-4 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isReceivable
                        ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                        : isPayable
                        ? 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {isReceivable && (language === 'bn' ? 'আমি পাব' : 'I Will Receive')}
                        {isPayable && (language === 'bn' ? 'আমি দেব' : 'I Will Pay')}
                        {isSettled && (language === 'bn' ? 'হিসাব ক্লিয়ার' : 'Settled')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {txCount} {language === 'bn' ? 'টি লেনদেন' : 'txs'}
                      </span>
                    </div>
                    <div
                      className={`text-xl font-black mt-1 ${
                        isReceivable
                          ? 'text-emerald-400'
                          : isPayable
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(netBalance))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  {!isSettled && (
                    <button
                      type="button"
                      onClick={() => onOpenSettle(contact, netBalance)}
                      className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                        isReceivable
                          ? 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30'
                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isReceivable ? (language === 'bn' ? 'আদায় নিন' : 'Collect') : (language === 'bn' ? 'পরিশোধ দিন' : 'Pay')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenAddTx(undefined, contact.id)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লেনদেন' : 'Add Tx'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenStatement(contact)}
                    className="py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                    title="খতিয়ান / বিবরণী"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

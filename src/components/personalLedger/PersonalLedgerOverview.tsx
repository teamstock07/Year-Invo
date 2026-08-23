import React from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact, PersonalTransaction } from '../../types';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Wallet,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Phone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

interface PersonalLedgerOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddTx: (type?: any, contactId?: string) => void;
  onOpenAddContact: () => void;
  onOpenStatement: (contact: PersonalContact) => void;
  onOpenSettle: (contact: PersonalContact, balance: number) => void;
}

export const PersonalLedgerOverview: React.FC<PersonalLedgerOverviewProps> = ({
  onNavigateTab,
  onOpenAddTx,
  onOpenAddContact,
  onOpenStatement,
  onOpenSettle,
}) => {
  const {
    personalContacts,
    personalTransactions,
    formatCurrency,
    displayCurrencySymbol,
    language,
  } = useApp();

  // Calculate Balances for each contact
  // A contact's receivable = sum(RECEIVABLE) - sum(SETTLEMENT_RECEIVED)
  // A contact's payable = sum(PAYABLE) - sum(SETTLEMENT_PAID)
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

    const netReceivable = Math.max(0, given - receivedBack);
    const netPayable = Math.max(0, taken - paidBack);
    const netBalance = (given - receivedBack) - (taken - paidBack);

    return {
      contact,
      netReceivable,
      netPayable,
      netBalance,
      txCount: txs.length,
      lastTxDate: txs.length > 0 ? txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null,
    };
  });

  // Global calculations
  let totalReceivable = 0; // People owe me
  let totalPayable = 0; // I owe people
  let thisMonthReceived = 0;
  let thisMonthPaid = 0;

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  contactStats.forEach((cs) => {
    if (cs.netBalance > 0) totalReceivable += cs.netBalance;
    else if (cs.netBalance < 0) totalPayable += Math.abs(cs.netBalance);
  });

  personalTransactions.forEach((tx) => {
    if (tx.date && tx.date.startsWith(currentMonthStr)) {
      if (tx.type === 'SETTLEMENT_RECEIVED') thisMonthReceived += tx.amount;
      if (tx.type === 'SETTLEMENT_PAID') thisMonthPaid += tx.amount;
    }
  });

  const netOverall = totalReceivable - totalPayable;
  const receivableContacts = contactStats.filter((c) => c.netBalance > 0).sort((a, b) => b.netBalance - a.netBalance);
  const payableContacts = contactStats.filter((c) => c.netBalance < 0).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

  const recentTxs = [...personalTransactions]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Notice Banner */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>
            {language === 'bn'
              ? 'ব্যক্তিগত খাতা আপনার ব্যবসার সেলস, ইনভেন্টরি ও লাভ-ক্ষতি থেকে ১০০% স্বাধীন ও পৃথক।'
              : 'Personal Ledger is 100% separate from your business sales, stock & accounting metrics.'}
          </span>
        </div>
        <button
          onClick={onOpenAddContact}
          className="text-orange-400 hover:text-orange-300 font-bold whitespace-nowrap hidden sm:inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নতুন ব্যক্তি' : 'Add Person'}</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: আমি পাব (Receivable) */}
        <div
          onClick={() => onNavigateTab('receivable')}
          className="cursor-pointer group p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {receivableContacts.length} {language === 'bn' ? 'জন পাবেন' : 'people owe'}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">
              {language === 'bn' ? 'আমি পাব (মোট পাওনা)' : 'I Will Receive (Receivable)'}
            </span>
            <span className="text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight block mt-1">
              {formatCurrency(totalReceivable)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400/80">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'bn' ? 'চলতি মাসে আদায়:' : 'Collected this mo:'} {formatCurrency(thisMonthReceived)}
            </span>
            <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
              &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: আমি দেব (Payable) */}
        <div
          onClick={() => onNavigateTab('payable')}
          className="cursor-pointer group p-5 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/20 hover:border-rose-500/40 rounded-2xl transition-all hover:shadow-lg hover:shadow-rose-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-all" />
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {payableContacts.length} {language === 'bn' ? 'জনকে দিতে হবে' : 'people to pay'}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">
              {language === 'bn' ? 'আমি দেব (মোট দেনা)' : 'I Will Pay (Payable)'}
            </span>
            <span className="text-2xl lg:text-3xl font-black text-rose-400 tracking-tight block mt-1">
              {formatCurrency(totalPayable)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-rose-400/80">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'bn' ? 'চলতি মাসে পরিশোধ:' : 'Paid this mo:'} {formatCurrency(thisMonthPaid)}
            </span>
            <span className="text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform">
              &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: নেট স্থিতি (Net Balance) */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                {personalContacts.length} {language === 'bn' ? 'মোট পরিচিতি' : 'Total contacts'}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-medium text-slate-400 block">
                {language === 'bn' ? 'নেট ব্যক্তিগত স্থিতি' : 'Net Personal Balance'}
              </span>
              <span
                className={`text-2xl lg:text-3xl font-black tracking-tight block mt-1 ${
                  netOverall >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netOverall >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(netOverall))}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpenAddTx('RECEIVABLE')}
              className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-bold text-center transition-colors"
            >
              + {language === 'bn' ? 'ঋণ দিলাম' : 'Lend'}
            </button>
            <button
              type="button"
              onClick={() => onOpenAddTx('PAYABLE')}
              className="flex-1 py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-bold text-center transition-colors"
            >
              + {language === 'bn' ? 'ঋণ নিলাম' : 'Borrow'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Receivables & Top Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: আমি যাদের কাছে পাব */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-white">
                {language === 'bn' ? 'আমি যাদের কাছে পাব' : 'People Who Owe You'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('receivable')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {receivableContacts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {language === 'bn' ? 'কোনো পাওনা বাকি নেই' : 'No active receivables'}
              </div>
            ) : (
              receivableContacts.slice(0, 4).map(({ contact, netBalance }) => (
                <div
                  key={contact.id}
                  className="p-3 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div
                    onClick={() => onOpenStatement(contact)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {contact.phone || (language === 'bn' ? 'ফোন নম্বর নেই' : 'No phone')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">
                        {formatCurrency(netBalance)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenSettle(contact, netBalance)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[11px] font-bold"
                    >
                      {language === 'bn' ? 'আদায়' : 'Settle'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: আমি যাদের দেব */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold text-white">
                {language === 'bn' ? 'আমি যাদের দেব' : 'People You Owe'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('payable')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {payableContacts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                {language === 'bn' ? 'কোনো দেনা বাকি নেই' : 'No active payables'}
              </div>
            ) : (
              payableContacts.slice(0, 4).map(({ contact, netBalance }) => (
                <div
                  key={contact.id}
                  className="p-3 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div
                    onClick={() => onOpenStatement(contact)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 font-bold flex items-center justify-center shrink-0 text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {contact.phone || (language === 'bn' ? 'ফোন নম্বর নেই' : 'No phone')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-400 block">
                        {formatCurrency(Math.abs(netBalance))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenSettle(contact, netBalance)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                    >
                      {language === 'bn' ? 'পরিশোধ' : 'Pay'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>{language === 'bn' ? 'সাম্প্রতিক ব্যক্তিগত লেনদেন' : 'Recent Personal Transactions'}</span>
          </h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সব ইতিহাস' : 'Full History'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTxs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              {language === 'bn' ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No personal transactions yet'}
            </div>
          ) : (
            recentTxs.map((tx) => {
              const isReceivable = tx.type === 'RECEIVABLE';
              const isPayable = tx.type === 'PAYABLE';
              const isSettleRec = tx.type === 'SETTLEMENT_RECEIVED';
              const isSettlePaid = tx.type === 'SETTLEMENT_PAID';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-950/30 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isReceivable
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isPayable
                          ? 'bg-rose-500/15 text-rose-400'
                          : isSettleRec
                          ? 'bg-teal-500/15 text-teal-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {isReceivable && <ArrowUpRight className="w-4 h-4" />}
                      {isPayable && <ArrowDownLeft className="w-4 h-4" />}
                      {isSettleRec && <CheckCircle2 className="w-4 h-4" />}
                      {isSettlePaid && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{tx.contactName}</span>
                        <span className="text-[10px] text-slate-500">({tx.date})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {isReceivable && (language === 'bn' ? 'টাকা ঋণ দিয়েছি (আমি পাব)' : 'Lent Money')}
                        {isPayable && (language === 'bn' ? 'টাকা ঋণ নিয়েছি (আমি দেব)' : 'Borrowed Money')}
                        {isSettleRec && (language === 'bn' ? 'টাকা আদায় পেয়েছি' : 'Settlement Received')}
                        {isSettlePaid && (language === 'bn' ? 'টাকা পরিশোধ করেছি' : 'Settlement Paid')}
                        {tx.notes ? ` • ${tx.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm block ${
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
                      {isSettleRec && `-${formatCurrency(tx.amount)} (আদায়)`}
                      {isSettlePaid && `-${formatCurrency(tx.amount)} (শোধ)`}
                    </span>
                    <span className="text-[10px] text-slate-500">{tx.paymentMethod || 'Cash'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

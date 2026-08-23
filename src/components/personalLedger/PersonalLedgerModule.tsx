import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact, PersonalTransactionType } from '../../types';
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Clock,
  Plus,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { PersonalLedgerOverview } from './PersonalLedgerOverview';
import { PersonalLedgerContactsList } from './PersonalLedgerContactsList';
import { PersonalLedgerTransactionsList } from './PersonalLedgerTransactionsList';
import { AddPersonalContactModal } from './AddPersonalContactModal';
import { AddPersonalTransactionModal } from './AddPersonalTransactionModal';
import { SettlePersonalDueModal } from './SettlePersonalDueModal';
import { PersonalContactStatementModal } from './PersonalContactStatementModal';

export const PersonalLedgerModule: React.FC = () => {
  const { personalContacts, personalTransactions, language, t } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'receivable' | 'payable' | 'contacts' | 'history'>('overview');

  // Modal states
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<PersonalContact | null>(null);

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [defaultTxType, setDefaultTxType] = useState<PersonalTransactionType>('RECEIVABLE');
  const [defaultTxContactId, setDefaultTxContactId] = useState<string | undefined>(undefined);

  const [settleModalData, setSettleModalData] = useState<{
    isOpen: boolean;
    contact: PersonalContact | null;
    balance: number;
  }>({
    isOpen: false,
    contact: null,
    balance: 0,
  });

  const [statementContact, setStatementContact] = useState<PersonalContact | null>(null);

  // Handlers
  const handleOpenAddTx = (type: PersonalTransactionType = 'RECEIVABLE', contactId?: string) => {
    setDefaultTxType(type);
    setDefaultTxContactId(contactId);
    setIsAddTxOpen(true);
  };

  const handleOpenAddContact = () => {
    setEditingContact(null);
    setIsAddContactOpen(true);
  };

  const handleOpenEditContact = (contact: PersonalContact) => {
    setEditingContact(contact);
    setIsAddContactOpen(true);
  };

  const handleOpenStatement = (contact: PersonalContact) => {
    setStatementContact(contact);
  };

  const handleOpenStatementForContactId = (contactId: string) => {
    const found = personalContacts.find((c) => c.id === contactId);
    if (found) {
      setStatementContact(found);
    }
  };

  const handleOpenSettle = (contact: PersonalContact, balance: number) => {
    setSettleModalData({
      isOpen: true,
      contact,
      balance,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {language === 'bn' ? 'ব্যক্তিগত খাতা' : 'Personal Ledger'}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'ব্যক্তিগত ঋণ প্রদান ও গ্রহণের সম্পূর্ণ স্বাধীন ডিজিটাল খাতা'
                  : 'Personal money-lending and borrowing tracker, isolated from business'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddTx('RECEIVABLE')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{language === 'bn' ? 'টাকা দিলাম (আমি পাব)' : '+ Lent Money'}</span>
          </button>
          <button
            onClick={() => handleOpenAddTx('PAYABLE')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'টাকা নিলাম (আমি দেব)' : '+ Borrowed'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{language === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('receivable')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'receivable'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{language === 'bn' ? 'আমি পাব' : 'I Will Receive'}</span>
        </button>

        <button
          onClick={() => setActiveTab('payable')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'payable'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900/60'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'আমি দেব' : 'I Will Pay'}</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'bn' ? 'ব্যক্তি ও পরিচিতি' : 'Contacts'}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400">
            {personalContacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'bn' ? 'লেনদেন ইতিহাস' : 'Transactions'}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400">
            {personalTransactions.length}
          </span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <PersonalLedgerOverview
          onNavigateTab={(tab: any) => setActiveTab(tab)}
          onOpenAddTx={handleOpenAddTx}
          onOpenAddContact={handleOpenAddContact}
          onOpenStatement={handleOpenStatement}
          onOpenSettle={handleOpenSettle}
        />
      )}

      {activeTab === 'receivable' && (
        <PersonalLedgerContactsList
          initialFilter="receivable"
          onOpenAddContact={handleOpenAddContact}
          onOpenEditContact={handleOpenEditContact}
          onOpenAddTx={handleOpenAddTx}
          onOpenStatement={handleOpenStatement}
          onOpenSettle={handleOpenSettle}
        />
      )}

      {activeTab === 'payable' && (
        <PersonalLedgerContactsList
          initialFilter="payable"
          onOpenAddContact={handleOpenAddContact}
          onOpenEditContact={handleOpenEditContact}
          onOpenAddTx={handleOpenAddTx}
          onOpenStatement={handleOpenStatement}
          onOpenSettle={handleOpenSettle}
        />
      )}

      {activeTab === 'contacts' && (
        <PersonalLedgerContactsList
          initialFilter="all"
          onOpenAddContact={handleOpenAddContact}
          onOpenEditContact={handleOpenEditContact}
          onOpenAddTx={handleOpenAddTx}
          onOpenStatement={handleOpenStatement}
          onOpenSettle={handleOpenSettle}
        />
      )}

      {activeTab === 'history' && (
        <PersonalLedgerTransactionsList
          onOpenAddTx={handleOpenAddTx}
          onOpenStatementForContactId={handleOpenStatementForContactId}
        />
      )}

      {/* Modals */}
      <AddPersonalContactModal
        isOpen={isAddContactOpen}
        onClose={() => {
          setIsAddContactOpen(false);
          setEditingContact(null);
        }}
        initialContact={editingContact}
      />

      <AddPersonalTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        defaultType={defaultTxType}
        defaultContactId={defaultTxContactId}
      />

      {settleModalData.isOpen && settleModalData.contact && (
        <SettlePersonalDueModal
          isOpen={settleModalData.isOpen}
          onClose={() =>
            setSettleModalData({
              isOpen: false,
              contact: null,
              balance: 0,
            })
          }
          contact={settleModalData.contact}
          currentBalance={settleModalData.balance}
        />
      )}

      {statementContact && (
        <PersonalContactStatementModal
          isOpen={Boolean(statementContact)}
          onClose={() => setStatementContact(null)}
          contact={statementContact}
          onAddTransaction={(contactId) => {
            setStatementContact(null);
            handleOpenAddTx(undefined, contactId);
          }}
          onSettleDue={(contact, balance) => {
            setStatementContact(null);
            handleOpenSettle(contact, balance);
          }}
        />
      )}
    </div>
  );
};

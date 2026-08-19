import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Investment, CapitalWithdrawal } from '../../types';
import {
  Coins,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  Wallet,
  Building2,
  CreditCard,
  Edit2,
  Trash2,
  X,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const CapitalInvestmentView: React.FC = () => {
  const {
    investments,
    capitalWithdrawals,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addCapitalWithdrawal,
    updateCapitalWithdrawal,
    deleteCapitalWithdrawal,
    metrics,
    settings,
    language,
    formatCurrency,
    formatNumber,
    t,
  } = useApp();

  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  // Active View Tab
  const [activeSubTab, setActiveSubTab] = useState<'investments' | 'withdrawals'>('investments');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');

  // Modals state
  const [isAddInvestmentModalOpen, setIsAddInvestmentModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<CapitalWithdrawal | null>(null);

  // Investment Form State
  const [investmentForm, setInvestmentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    investor: '',
    paymentMethod: 'Cash',
    note: '',
  });

  // Withdrawal Form State
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    paymentMethod: 'Cash',
    note: '',
  });

  const paymentMethods = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Cheque', 'Other'];

  // Calculations
  const totalInvested = metrics.totalInvestedCapital || 0;
  const totalWithdrawn = metrics.totalWithdrawnCapital || 0;
  const currentCapital = metrics.currentCapital || 0;
  const investmentCount = investments.length;
  const withdrawalCount = capitalWithdrawals.length;

  // Filtered lists
  const filteredInvestments = investments.filter((inv) => {
    const invName = inv.investorName || inv.investor || 'Owner';
    const matchesSearch =
      invName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.note && inv.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.amount.toString().includes(searchQuery);
    const matchesPayment =
      selectedPaymentMethod === 'All' || inv.paymentMethod === selectedPaymentMethod;
    return matchesSearch && matchesPayment;
  });

  const filteredWithdrawals = capitalWithdrawals.filter((w) => {
    const withReason = w.reason || w.withdrawnBy || 'Owner Withdrawal';
    const matchesSearch =
      withReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.note && w.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((w.paymentMethod || 'Cash').toLowerCase().includes(searchQuery.toLowerCase())) ||
      w.amount.toString().includes(searchQuery);
    const matchesPayment =
      selectedPaymentMethod === 'All' || (w.paymentMethod || 'Cash') === selectedPaymentMethod;
    return matchesSearch && matchesPayment;
  });

  // Handlers
  const handleOpenAddInvestment = () => {
    setInvestmentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      investor: '',
      paymentMethod: 'Cash',
      note: '',
    });
    setEditingInvestment(null);
    setIsAddInvestmentModalOpen(true);
  };

  const handleOpenEditInvestment = (inv: Investment) => {
    setInvestmentForm({
      amount: inv.amount.toString(),
      date: inv.date,
      investor: inv.investorName || inv.investor || 'Owner',
      paymentMethod: inv.paymentMethod,
      note: inv.note || '',
    });
    setEditingInvestment(inv);
    setIsAddInvestmentModalOpen(true);
  };

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(investmentForm.amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    const invName = investmentForm.investor.trim() || 'Owner';

    if (editingInvestment) {
      updateInvestment({
        ...editingInvestment,
        amount: numAmount,
        date: investmentForm.date,
        investorName: invName,
        investor: invName,
        paymentMethod: investmentForm.paymentMethod,
        note: investmentForm.note.trim(),
      });
    } else {
      addInvestment({
        amount: numAmount,
        date: investmentForm.date,
        investorName: invName,
        investor: invName,
        paymentMethod: investmentForm.paymentMethod,
        note: investmentForm.note.trim(),
      });
    }

    setIsAddInvestmentModalOpen(false);
    setEditingInvestment(null);
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawalForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      reason: '',
      paymentMethod: 'Cash',
      note: '',
    });
    setEditingWithdrawal(null);
    setIsWithdrawModalOpen(true);
  };

  const handleOpenEditWithdrawal = (w: CapitalWithdrawal) => {
    setWithdrawalForm({
      amount: w.amount.toString(),
      date: w.date,
      reason: w.reason || w.withdrawnBy || 'Owner Withdrawal',
      paymentMethod: w.paymentMethod || 'Cash',
      note: w.note || '',
    });
    setEditingWithdrawal(w);
    setIsWithdrawModalOpen(true);
  };

  const handleSaveWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(withdrawalForm.amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    const wReason = withdrawalForm.reason.trim() || 'Owner Withdrawal';

    if (editingWithdrawal) {
      updateCapitalWithdrawal({
        ...editingWithdrawal,
        amount: numAmount,
        date: withdrawalForm.date,
        reason: wReason,
        withdrawnBy: wReason,
        paymentMethod: withdrawalForm.paymentMethod,
        note: withdrawalForm.note.trim(),
      });
    } else {
      addCapitalWithdrawal({
        amount: numAmount,
        date: withdrawalForm.date,
        reason: wReason,
        withdrawnBy: wReason,
        paymentMethod: withdrawalForm.paymentMethod,
        note: withdrawalForm.note.trim(),
      });
    }

    setIsWithdrawModalOpen(false);
    setEditingWithdrawal(null);
  };

  const handleDeleteInvestment = (id: string) => {
    if (window.confirm(isBn ? 'আপনি কি এই বিনিয়োগ রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to delete this investment record?')) {
      deleteInvestment(id);
    }
  };

  const handleDeleteWithdrawal = (id: string) => {
    if (window.confirm(isBn ? 'আপনি কি এই মূলধন উত্তোলন রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to delete this withdrawal record?')) {
      deleteCapitalWithdrawal(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <span>{isBn ? 'মূলধন ও বিনিয়োগ (Capital & Investment)' : 'Capital & Investment'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isBn
              ? 'ব্যবসা মালিকের নিজস্ব মূলধন ও বিনিয়োগ ট্র্যাকার। এটি বিক্রয় (Sales) বা লাভ-ক্ষতির (Profit/Loss) সাথে মিশ্রিত হয় না।'
              : 'Track money invested into the business by owners and investors separately from daily sales and revenue.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddInvestment}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন বিনিয়োগ যোগ' : 'Add Investment'}</span>
          </button>

          <button
            onClick={handleOpenWithdrawModal}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl shadow-md shadow-rose-600/25 transition-all cursor-pointer active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{isBn ? 'মূলধন উত্তোলন' : 'Withdraw Capital'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Glassmorphism & Soft Glow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invested Capital */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/15 dark:via-teal-900/20 dark:to-cyan-900/15 backdrop-blur-xl border border-emerald-500/25 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              {isBn ? 'মোট ইনভেস্টমেন্ট' : 'Total Inflow'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isBn ? 'মোট বিনিয়োগকৃত মূলধন' : 'Total Invested Capital'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(totalInvested)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {investmentCount} {isBn ? 'টি বিনিয়োগ রেকর্ড' : 'total investment entries'}
          </p>
        </div>

        {/* Card 2: Current Capital */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-500/15 dark:via-orange-900/20 dark:to-yellow-900/15 backdrop-blur-xl border border-amber-500/25 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {isBn ? 'বর্তমান তহবিল' : 'Net Fund'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isBn ? 'বর্তমান মূলধন (Current Capital)' : 'Current Capital'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 truncate">
            {formatCurrency(currentCapital)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {isBn ? 'বিনিয়োগ বিয়োগ উত্তোলন' : 'Invested − Withdrawn'}
          </p>
        </div>

        {/* Card 3: Total Withdrawn Capital */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-rose-500/15 dark:via-pink-900/20 dark:to-purple-900/15 backdrop-blur-xl border border-rose-500/25 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300">
              {isBn ? 'মোট উত্তোলন' : 'Withdrawals'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isBn ? 'মোট মূলধন উত্তোলন' : 'Total Withdrawn Capital'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 truncate">
            {formatCurrency(totalWithdrawn)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {withdrawalCount} {isBn ? 'টি উত্তোলন রেকর্ড' : 'total withdrawal entries'}
          </p>
        </div>

        {/* Card 4: Investment Count */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-purple-500/10 dark:from-indigo-500/15 dark:via-blue-900/20 dark:to-purple-900/15 backdrop-blur-xl border border-indigo-500/25 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
              {isBn ? 'হিসাব' : 'Transactions'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isBn ? 'বিনিয়োগ সংখ্যা' : 'Investment Count'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {formatNumber(investmentCount)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {isBn ? 'সক্রিয় তহবিল হিসাব' : 'Active funding entries'}
          </p>
        </div>
      </div>

      {/* Accounting Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">
            {isBn ? 'অ্যাকাউন্টিং নিয়মাবলী:' : 'Accounting Rules:'}{' '}
          </span>
          {isBn
            ? 'বিনিয়োগ করা অর্থ সেলস, রেভিনিউ, লাভ বা খরচ হিসেবে গণ্য হয় না। যখন এই মূলধন পণ্য ক্রয় বা পরিচালন খরচে ব্যবহৃত হয়, তখন সেগুলি স্বাভাবিকভাবে পারচেজ ও এক্সপেন্সে নথিভুক্ত হবে।'
            : 'Invested capital is tracked separately from revenue and profit. When investment money is spent on purchasing stock or business operations, those transactions will appear normally under Purchases and Expenses.'}
        </div>
      </div>

      {/* Subtabs & Search / Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Subtabs Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('investments')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'investments'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{isBn ? 'বিনিয়োগ হিস্ট্রি' : 'Investment History'}</span>
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/15 text-emerald-600 font-extrabold">
              {investments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('withdrawals')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'withdrawals'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{isBn ? 'মূলধন উত্তোলন হিস্ট্রি' : 'Withdrawal History'}</span>
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500/15 text-rose-600 font-extrabold">
              {capitalWithdrawals.length}
            </span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto flex-1 md:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isBn ? 'সার্চ করুন (নাম, নোট, পেমেন্ট)...' : 'Search by source, note, amount...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="All">{isBn ? 'সকল পেমেন্ট মেথড' : 'All Payment Methods'}</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / List View */}
      {activeSubTab === 'investments' ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-4">{isBn ? 'বিনিয়োগকারী / সোর্স' : 'Investor / Source'}</th>
                  <th className="py-3 px-4">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                  <th className="py-3 px-4">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="py-3 px-4">{isBn ? 'নোট / বিবরণ' : 'Description / Note'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredInvestments.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                          {inv.investor ? inv.investor.charAt(0).toUpperCase() : 'O'}
                        </div>
                        <span>{inv.investor || 'Owner'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{inv.paymentMethod || 'Cash'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        + {formatCurrency(inv.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {inv.note ? (
                        <span>{inv.note}</span>
                      ) : (
                        <span className="text-slate-400 italic">{isBn ? 'কোন নোট নেই' : 'No notes'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditInvestment(inv)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvestment(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvestments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <Coins className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {isBn ? 'কোনো বিনিয়োগ রেকর্ড পাওয়া যায়নি' : 'No investment records found'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isBn
                          ? 'নতুন বিনিয়োগ যুক্ত করতে "নতুন বিনিয়োগ যোগ" বাটনে ক্লিক করুন।'
                          : 'Click "Add Investment" above to record your first business capital.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-4">{isBn ? 'উত্তোলনের কারণ' : 'Reason / Purpose'}</th>
                  <th className="py-3 px-4">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                  <th className="py-3 px-4">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="py-3 px-4">{isBn ? 'নোট / বিবরণ' : 'Description / Note'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredWithdrawals.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs">
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                        <span>{w.reason || 'Owner Withdrawal'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{w.paymentMethod || 'Cash'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                        - {formatCurrency(w.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {w.note ? (
                        <span>{w.note}</span>
                      ) : (
                        <span className="text-slate-400 italic">{isBn ? 'কোন নোট নেই' : 'No notes'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditWithdrawal(w)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWithdrawal(w.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <ArrowDownLeft className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {isBn ? 'কোনো মূলধন উত্তোলন রেকর্ড নেই' : 'No withdrawal records found'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isBn
                          ? 'মালিক কর্তৃক মূলধন উত্তোলন লিপিবদ্ধ করতে "মূলধন উত্তোলন" বাটনে ক্লিক করুন।'
                          : 'Click "Withdraw Capital" above if money is withdrawn from business capital.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add / Edit Investment */}
      {isAddInvestmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingInvestment
                      ? isBn
                        ? 'বিনিয়োগ সম্পাদনা'
                        : 'Edit Investment'
                      : isBn
                      ? 'নতুন বিনিয়োগ যোগ করুন'
                      : 'Add New Investment'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ব্যবসায়ের নিজস্ব মূলধন যোগ' : 'Record capital injected into the business'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddInvestmentModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveInvestment} className="p-6 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিনিয়োগের পরিমাণ *' : 'Investment Amount *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    required
                    step="any"
                    min="1"
                    placeholder="e.g. 50000"
                    value={investmentForm.amount}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Investor / Source */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিনিয়োগকারী / উৎস (Investor / Source) *' : 'Investor / Source *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={isBn ? 'মালিকের নাম বা সোর্স (যেমন: Ariful Islam)' : 'Owner / Investor name (e.g. Self, Partner)'}
                    value={investmentForm.investor}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, investor: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'তারিখ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={investmentForm.date}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                  </label>
                  <select
                    value={investmentForm.paymentMethod}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিবরণ / নোট (ঐচ্ছিক)' : 'Description / Note (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isBn ? 'বিনিয়োগের বিবরণ বা ব্যাংক ট্রানজেকশন রেফারেন্স...' : 'Details, cheque no, transaction reference...'}
                  value={investmentForm.note}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddInvestmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  {editingInvestment
                    ? isBn
                      ? 'আপডেট করুন'
                      : 'Update Investment'
                    : isBn
                    ? 'বিনিয়োগ সংরক্ষণ করুন'
                    : 'Save Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Withdraw Capital */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingWithdrawal
                      ? isBn
                        ? 'উত্তোলন রেকর্ড সম্পাদনা'
                        : 'Edit Capital Withdrawal'
                      : isBn
                      ? 'মূলধন উত্তোলন রেকর্ড করুন'
                      : 'Withdraw Capital'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ব্যবসায় থেকে মালিকের মূলধন উত্তোলন' : 'Record money withdrawn from business capital'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveWithdrawal} className="p-6 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'উত্তোলনের পরিমাণ *' : 'Withdrawal Amount *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    required
                    step="any"
                    min="1"
                    placeholder="e.g. 10000"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'উত্তোলনের কারণ (Reason / Purpose) *' : 'Withdrawal Reason / Purpose *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: মালিকের ব্যক্তিগত প্রয়োজনে উত্তোলন, পার্টনার ড্রইং' : 'e.g. Personal Drawing, Partner Capital Return'}
                  value={withdrawalForm.reason}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'তারিখ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={withdrawalForm.date}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                  </label>
                  <select
                    value={withdrawalForm.paymentMethod}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'নোট / অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Note / Additional Details (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isBn ? 'অতিরিক্ত মন্তব্য বা অ্যাকাউন্ট নোট...' : 'Optional memo or notes...'}
                  value={withdrawalForm.note}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl shadow-md shadow-rose-600/25 transition-all cursor-pointer"
                >
                  {editingWithdrawal
                    ? isBn
                      ? 'আপডেট করুন'
                      : 'Update Withdrawal'
                    : isBn
                    ? 'উত্তোলন সংরক্ষণ করুন'
                    : 'Save Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

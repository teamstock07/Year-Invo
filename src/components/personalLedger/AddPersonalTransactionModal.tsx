import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact, PersonalTransaction, PersonalTransactionType } from '../../types';
import {
  X,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface AddPersonalTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: PersonalTransactionType;
  defaultContactId?: string;
  onSuccess?: (tx: PersonalTransaction) => void;
}

export const AddPersonalTransactionModal: React.FC<AddPersonalTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'RECEIVABLE',
  defaultContactId,
  onSuccess,
}) => {
  const {
    personalContacts,
    addPersonalContact,
    addPersonalTransaction,
    displayCurrencySymbol,
    t,
    language,
  } = useApp();

  const [txType, setTxType] = useState<PersonalTransactionType>(defaultType);
  const [contactId, setContactId] = useState(defaultContactId || '');
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTxType(defaultType);
      if (defaultContactId) {
        setContactId(defaultContactId);
        setIsCreatingNewContact(false);
      } else if (personalContacts.length > 0) {
        setContactId(personalContacts[0].id);
        setIsCreatingNewContact(false);
      } else {
        setIsCreatingNewContact(true);
      }
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPaymentMethod('Cash');
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultType, defaultContactId, personalContacts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Please enter a valid amount');
      return;
    }

    let targetContactId = contactId;
    let targetContactName = '';
    let targetContactPhone = '';

    if (isCreatingNewContact) {
      if (!newContactName.trim()) {
        setError(language === 'bn' ? 'ব্যক্তির নাম লিখুন' : 'Please enter contact name');
        return;
      }
      try {
        const created = await addPersonalContact({
          name: newContactName.trim(),
          phone: newContactPhone.trim(),
        });
        targetContactId = created.id;
        targetContactName = created.name;
        targetContactPhone = created.phone || '';
      } catch (err: any) {
        setError(err?.message || 'Failed to create contact');
        return;
      }
    } else {
      const selected = personalContacts.find((c) => c.id === contactId);
      if (!selected) {
        setError(language === 'bn' ? 'অনুগ্রহ করে একজন ব্যক্তি নির্বাচন করুন' : 'Please select a contact');
        return;
      }
      targetContactName = selected.name;
      targetContactPhone = selected.phone || '';
    }

    try {
      setIsSubmitting(true);
      setError('');

      const createdTx = await addPersonalTransaction({
        contactId: targetContactId,
        contactName: targetContactName,
        contactPhone: targetContactPhone,
        type: txType,
        amount: numAmount,
        date: date || new Date().toISOString().split('T')[0],
        dueDate: dueDate || undefined,
        paymentMethod,
        notes: notes.trim(),
      });

      onSuccess?.(createdTx);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{language === 'bn' ? 'ব্যক্তিগত খাতার নতুন লেনদেন' : 'New Personal Transaction'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'ব্যক্তিগত ঋণ প্রদান, গ্রহণ বা পরিশোধ হিসাব'
                : 'Lending, borrowing, or repayment record'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {language === 'bn' ? 'লেনদেনের ধরণ নির্বাচন করুন *' : 'Transaction Nature *'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxType('RECEIVABLE')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  txType === 'RECEIVABLE'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {language === 'bn' ? 'আমি পাব (ঋণ দিলাম)' : 'I Will Receive'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'অন্যকে টাকা দিয়েছি' : 'Lent money to contact'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTxType('PAYABLE')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  txType === 'PAYABLE'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-1 ring-rose-500/50'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {language === 'bn' ? 'আমি দেব (ঋণ নিলাম)' : 'I Will Pay'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'অন্যের থেকে টাকা নিয়েছি' : 'Borrowed from contact'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTxType('SETTLEMENT_RECEIVED')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  txType === 'SETTLEMENT_RECEIVED'
                    ? 'bg-teal-500/15 border-teal-500 text-teal-300 ring-1 ring-teal-500/50'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {language === 'bn' ? 'আদায় পেলাম' : 'Received Back'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'পাওনা টাকা ফেরত পেয়েছি' : 'Settlement of receivable'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTxType('SETTLEMENT_PAID')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  txType === 'SETTLEMENT_PAID'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {language === 'bn' ? 'পরিশোধ দিলাম' : 'Paid Back'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'দেনা টাকা পরিশোধ করেছি' : 'Settlement of payable'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Contact Selector / Creator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'bn' ? 'ব্যক্তি নির্বাচন বা নতুন পরিচিতি *' : 'Contact Person *'}
              </label>
              {personalContacts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewContact(!isCreatingNewContact)}
                  className="text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  {isCreatingNewContact
                    ? language === 'bn'
                      ? 'তালিকা থেকে বাছুন'
                      : 'Choose from list'
                    : language === 'bn'
                    ? '+ নতুন ব্যক্তি লিখুন'
                    : '+ Add new person'}
                </button>
              )}
            </div>

            {isCreatingNewContact || personalContacts.length === 0 ? (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder={language === 'bn' ? 'ব্যক্তির নাম (যেমন: আরিফ ভাই)' : 'Person Name'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder={language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            ) : (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {personalContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'টাকার পরিমাণ *' : 'Amount *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {displayCurrencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'লেনদেনের তারিখ *' : 'Transaction Date *'}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Due Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ফেরতের সম্ভাব্য তারিখ (ঐচ্ছিক)' : 'Expected Due Date (Optional)'}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="Cash">নগদ (Cash)</option>
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Rocket">রকেট (Rocket)</option>
                  <option value="Bank">ব্যাংক ট্রান্সফার (Bank)</option>
                  <option value="Other">অন্যান্য (Other)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'লেনদেনের বিবরণ / নোট (ঐচ্ছিক)' : 'Transaction Note (Optional)'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: জরুরি প্রয়োজনে ঋণ নেওয়া / দেওয়া'
                    : 'e.g. Emergency personal loan'
                }
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? language === 'bn'
                    ? 'যুক্ত হচ্ছে...'
                    : 'Saving...'
                  : language === 'bn'
                  ? 'লেনদেন যুক্ত করুন'
                  : 'Record Transaction'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

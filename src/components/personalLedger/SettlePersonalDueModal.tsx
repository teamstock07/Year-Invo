import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact } from '../../types';
import { X, Check, DollarSign, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';

interface SettlePersonalDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: PersonalContact;
  currentBalance: number; // Positive: They owe me (I Will Receive). Negative: I owe them (I Will Pay).
  onSuccess?: () => void;
}

export const SettlePersonalDueModal: React.FC<SettlePersonalDueModalProps> = ({
  isOpen,
  onClose,
  contact,
  currentBalance,
  onSuccess,
}) => {
  const { settlePersonalBalance, displayCurrencySymbol, formatCurrency, language } = useApp();

  const isReceivable = currentBalance > 0; // Money to collect from contact
  const absDue = Math.abs(currentBalance);

  const [amount, setAmount] = useState(absDue.toString());
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAmount(Math.abs(currentBalance).toString());
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setNotes(
        isReceivable
          ? language === 'bn'
            ? 'পাওনা আদায় গ্রহণ'
            : 'Receivable settlement collected'
          : language === 'bn'
          ? 'দেনা পরিশোধ প্রদান'
          : 'Payable settlement paid'
      );
      setError('');
    }
  }, [isOpen, currentBalance, isReceivable, language]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Please enter valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await settlePersonalBalance({
        contactId: contact.id,
        amount: numAmount,
        settlementType: isReceivable ? 'RECEIVE_FROM_CONTACT' : 'PAY_TO_CONTACT',
        paymentMethod,
        notes: notes.trim(),
        date,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to settle balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isReceivable
                ? language === 'bn'
                  ? 'টাকা আদায় গ্রহণ'
                  : 'Collect Receivable'
                : language === 'bn'
                ? 'টাকা পরিশোধ প্রদান'
                : 'Pay Balance'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {contact.name} {contact.phone ? `(${contact.phone})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current balance card */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isReceivable
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div>
              <span className="text-xs opacity-80 block">
                {isReceivable
                  ? language === 'bn'
                    ? 'বর্তমান মোট পাওনা'
                    : 'Current Receivable'
                  : language === 'bn'
                  ? 'বর্তমান মোট দেনা'
                  : 'Current Payable'}
              </span>
              <span className="text-base font-bold text-white">{formatCurrency(absDue)}</span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(absDue.toString())}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700"
            >
              {language === 'bn' ? 'সম্পূর্ণ শোধ' : 'Full Settle'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'আদায় / পরিশোধের পরিমাণ *' : 'Settlement Amount *'}
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
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-base font-bold text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'তারিখ *' : 'Date *'}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500"
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
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Cash">নগদ (Cash)</option>
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Rocket">রকেট (Rocket)</option>
                  <option value="Bank">ব্যাংক (Bank)</option>
                  <option value="Other">অন্যান্য (Other)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'নোট / মন্তব্য' : 'Note / Remarks'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500"
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
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? language === 'bn'
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : language === 'bn'
                  ? 'নিশ্চিত করুন'
                  : 'Confirm Settlement'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

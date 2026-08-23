import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PersonalContact } from '../../types';
import { X, User, Phone, MapPin, FileText, Check, AlertCircle } from 'lucide-react';

interface AddPersonalContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact: PersonalContact) => void;
  initialContact?: PersonalContact | null;
}

export const AddPersonalContactModal: React.FC<AddPersonalContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialContact,
}) => {
  const { addPersonalContact, updatePersonalContact, t, language } = useApp();

  const [name, setName] = useState(initialContact?.name || '');
  const [phone, setPhone] = useState(initialContact?.phone || '');
  const [address, setAddress] = useState(initialContact?.address || '');
  const [notes, setNotes] = useState(initialContact?.notes || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialContact) {
      setName(initialContact.name);
      setPhone(initialContact.phone || '');
      setAddress(initialContact.address || '');
      setNotes(initialContact.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
    setError('');
  }, [initialContact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে ব্যক্তির নাম লিখুন' : 'Please enter person name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (initialContact) {
        await updatePersonalContact(initialContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
        onSuccess?.({
          ...initialContact,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
      } else {
        const created = await addPersonalContact({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
        onSuccess?.(created);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialContact
                  ? language === 'bn'
                    ? 'ব্যক্তির তথ্য পরিবর্তন'
                    : 'Edit Person Details'
                  : language === 'bn'
                  ? 'নতুন ব্যক্তি যোগ করুন'
                  : 'Add New Person'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'ব্যক্তিগত খাতার পরিচিতি' : 'Personal Ledger Contact'}
              </p>
            </div>
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'ব্যক্তির নাম *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: আরিফুল ইসলাম' : 'e.g. John Doe'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'bn' ? '০১৭xxxxxxxx' : '+880 1700 000000'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'ঠিকানা / পরিচিতি' : 'Address / Location'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={language === 'bn' ? 'গ্রাম/শহর বা সম্পর্কের বিবরণ' : 'City, relation or address'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'বিশেষ নোট (ঐচ্ছিক)' : 'Notes (Optional)'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'bn' ? 'ব্যক্তি বা লেনদেন সম্পর্কিত কোনো বিশেষ নোট' : 'Any additional notes or relation details'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
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
              <span>{isSubmitting ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Person')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

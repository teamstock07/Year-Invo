import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessType, businessTypeRecommendedModules } from '../../types';
import {
  Store,
  ShoppingBag,
  Shirt,
  Smartphone,
  Pill,
  Utensils,
  Briefcase,
  Sparkles,
  Wrench,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Sliders,
  X,
} from 'lucide-react';

interface BusinessTypeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessTypeOption {
  type: BusinessType;
  label: string;
  labelBn: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  {
    type: 'Retail Shop',
    label: 'Retail Shop',
    labelBn: 'খুচরা দোকান / রিটেইল শপ',
    description: 'General merchandise, stationery, departmental stores, and mini marts.',
    icon: Store,
  },
  {
    type: 'Grocery',
    label: 'Grocery & Supermarket',
    labelBn: 'মুদি দোকান ও সুপারশপ',
    description: 'Daily food items, staples, perishable goods, expiry tracking & fast POS.',
    icon: ShoppingBag,
  },
  {
    type: 'Clothing',
    label: 'Clothing & Fashion',
    labelBn: 'পোশাক ও ফ্যাশন শপ',
    description: 'Apparel, shoes, fabrics, barcode tags, customer loyalty & size varieties.',
    icon: Shirt,
  },
  {
    type: 'Electronics',
    label: 'Electronics & Gadgets',
    labelBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
    description: 'Mobile phones, appliances, accessories, serial tracking & supplier dues.',
    icon: Smartphone,
  },
  {
    type: 'Pharmacy',
    label: 'Pharmacy & Healthcare',
    labelBn: 'ফার্মেসি ও ঔষধের দোকান',
    description: 'Medicine batches, strict expiry date management & quick search.',
    icon: Pill,
  },
  {
    type: 'Restaurant / Food',
    label: 'Restaurant / Food Court',
    labelBn: 'রেস্টুরেন্ট ও ক্যাফে',
    description: 'Fast kitchen orders, table billing, recipe stock & instant receipts.',
    icon: Utensils,
  },
  {
    type: 'Service Business',
    label: 'Service Business',
    labelBn: 'সার্ভিস ও সেবা ব্যবসা',
    description: 'Agencies, consultants, repair shops, invoices, dues & expense tracking.',
    icon: Briefcase,
  },
  {
    type: 'Beauty / Salon',
    label: 'Beauty / Salon / Spa',
    labelBn: 'বিউটি পার্লার ও সেলুন',
    description: 'Service packages, appointment billing, loyalty points & staff commissions.',
    icon: Sparkles,
  },
  {
    type: 'Hardware',
    label: 'Hardware & Sanitary',
    labelBn: 'হার্ডওয়্যার ও স্যানিটারি',
    description: 'Construction tools, sanitary ware, wholesale supplier ledgers & customer dues.',
    icon: Wrench,
  },
  {
    type: 'Other',
    label: 'Other Business Type',
    labelBn: 'অন্যান্য ব্যবসা',
    description: 'Custom configuration with all modules ready to tune as you grow.',
    icon: HelpCircle,
  },
];

export const BusinessTypeSetupModal: React.FC<BusinessTypeSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, updateDashboardPreferences, t, language, setActiveTab } = useApp();
  const [selectedType, setSelectedType] = useState<BusinessType>(
    (user?.businessType as BusinessType) || 'Retail Shop'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApply = async (autoCustomize = false) => {
    setIsSubmitting(true);
    try {
      // 1. Update user profile business type
      await updateProfile({ businessType: selectedType });

      // 2. Recommend & apply module profile
      const recommended = businessTypeRecommendedModules[selectedType] || {};
      await updateDashboardPreferences(recommended);

      setIsSubmitting(false);
      onClose();

      if (autoCustomize) {
        setActiveTab('customize-dashboard');
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5c01] bg-[#ff5c01]/10 px-2 py-0.5 rounded-full">
                {t('businessTypeSetup') || 'Store Configuration'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {t('whatTypeOfBusiness') || 'What type of business do you run?'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('businessTypeDesc') ||
                'Select your business category so YearInvo can recommend the optimal dashboard layout and modules for your daily workflow.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Type Grid */}
        <div className="p-6 max-h-[58vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BUSINESS_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedType === opt.type;

              return (
                <div
                  key={opt.type}
                  onClick={() => setSelectedType(opt.type)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-[#ff5c01]/10 border-[#ff5c01] ring-1 ring-[#ff5c01]'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-[#ff5c01] text-white'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">
                          {language === 'bn' ? opt.labelBn : opt.label}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 text-[#ff5c01]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>You can customize and toggle any module anytime in Settings.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleApply(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Customize Modules</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleApply(false)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05200] text-xs font-bold text-white shadow-md shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Applying...' : 'Apply & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

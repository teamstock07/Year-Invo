import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getUserDisplayName } from '../../utils/user';
import {
  User,
  Mail,
  Phone,
  Store,
  Briefcase,
  Globe,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  Crown,
  CreditCard,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateUser, t, language, setActiveTab } = useApp();

  const [formData, setFormData] = useState({
    ownerName: user?.ownerName || (user as any)?.fullName || '',
    brandName: user?.brandName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    businessType: user?.businessType || 'General Retail & Grocery',
    country: user?.country || 'Bangladesh',
    storeAddress: user?.storeAddress || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user.ownerName || (user as any).fullName || '',
        brandName: user.brandName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        businessType: user.businessType || 'General Retail & Grocery',
        country: user.country || 'Bangladesh',
        storeAddress: user.storeAddress || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({
        ownerName: formData.ownerName,
        fullName: formData.ownerName,
        name: formData.ownerName,
        brandName: formData.brandName,
        mobile: formData.mobile,
        businessType: formData.businessType,
        country: formData.country,
        storeAddress: formData.storeAddress,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = getUserDisplayName(user);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#0c0c0e] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Generic Account Icon */}
            <div className="w-16 h-16 rounded-3xl bg-[#ff5c01] text-white flex items-center justify-center shadow-lg shadow-[#ff5c01]/25 border border-white/20 shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {user?.subscriptionPlan || 'Free'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user?.email || 'owner@yearinvo.com'}
              </p>
              {user?.brandName && (
                <p className="text-[11px] font-bold text-[#ff5c01] uppercase tracking-wide">
                  Store: {user.brandName}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('branding')}
              className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#ff5c01]" />
              <span>{t('storeBranding') || 'Store Branding'}</span>
            </button>
            <button
              onClick={() => setActiveTab('customize-dashboard')}
              className="px-4 py-2 rounded-2xl bg-[#ff5c01]/10 hover:bg-[#ff5c01]/20 text-[#ff5c01] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('customizeDashboard') || 'Customize'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white dark:bg-[#0c0c0e] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {language === 'bn' ? 'ব্যক্তিগত ও ব্যবসায়িক প্রোফাইল' : 'Profile & Account Details'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আপনার অ্যাকাউন্ট ও স্টোরের তথ্য আপডেট করুন'
              : 'Update your personal name, business details, and contact information'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Owner / Profile Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>{t('ownerName') || 'Account / Profile Name'} *</span>
            </label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01] transition-colors"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This name will be displayed across the header, invoices, and system greetings.
            </p>
          </div>

          {/* Email Address (Auth ID) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('emailAddress') || 'Account Email'} (Firebase ID)</span>
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Authentication email is linked to your Firebase security credentials.
            </p>
          </div>

          {/* Store / Brand Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>{t('brandName') || 'Store / Business Name'}</span>
            </label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="e.g. Metro Super Store"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01] transition-colors"
            />
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>{t('mobileNumber') || 'Mobile Number'}</span>
            </label>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. +880 1712 345678"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01] transition-colors"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>Business Type</span>
            </label>
            <select
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
            >
              <option value="General Retail & Grocery">General Retail & Grocery</option>
              <option value="Supermarket / Departmental">Supermarket / Departmental</option>
              <option value="Clothing, Fashion & Apparel">Clothing, Fashion & Apparel</option>
              <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
              <option value="Electronics & Mobile">Electronics & Mobile</option>
              <option value="Restaurant / Cafe">Restaurant / Cafe</option>
              <option value="Hardware & Sanitary">Hardware & Sanitary</option>
              <option value="Wholesale & Distribution">Wholesale & Distribution</option>
              <option value="Other Business">Other Business</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>Country</span>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
            />
          </div>

          {/* Store Physical Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ff5c01]" />
              <span>Store Address</span>
            </label>
            <input
              type="text"
              value={formData.storeAddress}
              onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('saved') || 'Profile updated successfully!'}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Profile')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

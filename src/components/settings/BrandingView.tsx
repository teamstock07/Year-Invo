import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import {
  Image,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  Store,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  ArrowRight,
} from 'lucide-react';

export const BrandingView: React.FC = () => {
  const { settings, updateSettings, user, t, setActiveTab, language } = useApp();

  const [storeName, setStoreName] = useState<string>(
    settings.brandName || user?.brandName || ''
  );
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBn = language === 'bn';

  // Handle Logo Upload
  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে কেবল ইমেজ ফাইল নির্বাচন করুন (PNG, JPG, SVG, WEBP)' : 'Please select an image file (PNG, JPG, SVG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStoreName = storeName.trim() || 'My Store';
    updateSettings({
      brandName: finalStoreName,
      logoUrl: logoUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] dark:bg-[#ff5c01]/20">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isBn ? 'স্টোর ব্র্যান্ডিং ও লোগো সেটিংস' : 'Store Branding Settings'}
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {isBn
              ? 'আপনার দোকানের নিজস্ব লোগো ও নাম আপডেট করুন। এটি ওয়েবসাইট হেডার ও ইনভয়েসে প্রদর্শিত হবে।'
              : 'Customize your store logo and store name across the header, invoices, and system reports.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'ব্র্যান্ডিং সফলভাবে সেভ হয়েছে!' : 'Branding saved successfully!'}</span>
          </div>
        )}
      </div>

      {/* Real-time Header Live Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#ff5c01]" />
            <span>{isBn ? 'লাইভ হেডার প্রিভিউ' : 'Live Header Preview'}</span>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/30 font-extrabold uppercase">
            {logoUrl ? 'Custom Store Logo' : 'Default Application Logo'}
          </span>
        </div>

        {/* Mock Header Element */}
        <div className="h-16 rounded-xl border border-slate-700/80 bg-[#09090b] px-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-0.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-xs">
              <MainWebsiteLogo
                size={34}
                customUrl={logoUrl}
                siteName={storeName || 'My Store'}
              />
            </div>
            <div>
              <h2 className="font-black text-white text-base leading-tight">
                {storeName || (isBn ? 'আপনার দোকানের নাম' : 'Your Store Name')}
              </h2>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700 font-bold">
              Header Preview Mode
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Default Store Name */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#ff5c01]" />
              <span>{isBn ? '১. স্টোরের নাম (Store Name)' : '1. Store Name'}</span>
            </h2>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-md uppercase">
              Displays in Header
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আপনার দোকানের অ্যাকাউন্ট তৈরির সময় দেওয়া নাম নিচে দেখুন। এটি ওয়েবসাইট হেডারে ডিফল্ট নাম হিসেবে দেখা যাবে।'
              : 'Enter your Store Name below. This name automatically becomes the default title displayed in the header and reports.'}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isBn ? 'দোকানের নাম *' : 'Store Name *'}
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={isBn ? 'যেমন: মদিনা সুপার মার্কেট' : 'e.g. Downtown Supermarket'}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01] focus:ring-2 focus:ring-[#ff5c01]/20 transition-all"
            />
          </div>
        </div>

        {/* Card 2: Custom Store Logo Upload & Management */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-600" />
              <span>{isBn ? '২. কাস্টম স্টোর লোগো (Store Logo)' : '2. Custom Store Logo'}</span>
            </h2>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold px-2 py-0.5 rounded-md uppercase">
              Header & Invoice Logo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] ${
                dragActive
                  ? 'border-[#ff5c01] bg-[#ff5c01]/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-[#ff5c01]/60 bg-slate-50/60 dark:bg-slate-800/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {isBn ? 'নতুন লোগো আপলোড করুন' : 'Click or Drag & Drop custom logo'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                PNG, JPG, WEBP, or SVG (Max 5MB)
              </p>
              <button
                type="button"
                className="mt-3 px-3.5 py-1.5 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {logoUrl ? (isBn ? 'লোগো পরিবর্তন করুন' : 'Replace Logo') : (isBn ? 'লোগো ফাইল বাছুন' : 'Choose Logo File')}
              </button>
            </div>

            {/* Current Active Logo Status & Actions */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  {isBn ? 'বর্তমান একটিভ লোগো স্টেটাস' : 'Current Active Logo'}
                </span>

                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                    ) : (
                      <MainWebsiteLogo size={42} />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {logoUrl ? (isBn ? 'কাস্টম স্টোর লোগো একটিভ' : 'Custom Uploaded Logo') : (isBn ? 'ডিফল্ট অ্যাপ্লিকেশন লোগো' : 'Default Application Logo')}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {logoUrl
                        ? (isBn ? 'আপনার আপলোড করা ছবি হেডারে দেখা যাচ্ছে।' : 'Custom image is currently replacing the default logo.')
                        : (isBn ? 'কোনো ছবি না থাকায় ডিফল্ট লোগো দেখা যাচ্ছে।' : 'App logo is displayed. Upload a custom logo to replace it.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#ff5c01]" />
                  <span>{isBn ? 'লোগো রিপ্লেস করুন' : 'Replace Logo'}</span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isBn ? 'লোগো রিমুভ করুন' : 'Remove Logo'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs">{isBn ? 'ব্র্যান্ডিং ব্যবহারের নিয়মাবলি:' : 'How Logo & Store Name behave:'}</h4>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-800 dark:text-indigo-300">
              <li>{isBn ? 'ডিফল্টভাবে সিস্টেমের নিজস্ব অ্যাপ্লিকেশন লোগো হেডারে দেখা যায়।' : 'By default, the application logo displays in the header.'}</li>
              <li>{isBn ? 'কাস্টম লোগো আপলোড করলে সেটি সরাসরি হেডারে ডিফল্ট লোগোকে রিপ্লেস করবে।' : 'Uploading your custom logo automatically replaces the default logo.'}</li>
              <li>{isBn ? 'কাস্টম লোগো রিমুভ করলে পুনরায় ডিফল্ট অ্যাপ্লিকেশন লোগো ফিরে আসবে।' : 'Removing your custom logo brings back the default application logo immediately.'}</li>
              <li>{isBn ? 'স্টোরের নাম হেডারে সর্বদা লাইভ আপডেট থাকবে।' : 'Updating your Store Name updates the header title automatically.'}</li>
            </ul>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isBn ? 'ব্র্যান্ডিং সেটিংস সেভ করুন' : 'Save Branding Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

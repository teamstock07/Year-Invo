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
  QrCode,
  RefreshCw,
  Eye,
  Info,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const BrandingView: React.FC = () => {
  const { settings, updateSettings, user, t, setActiveTab, language } = useApp();

  const [activeSection, setActiveSection] = useState<'branding' | 'payment'>('branding');

  // Store Branding States
  const [storeName, setStoreName] = useState<string>(
    settings.brandName || user?.brandName || ''
  );
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [dragActive, setDragActive] = useState<boolean>(false);

  // POS Payment QR Settings States
  const pSet = settings.paymentSettings || {
    qrEnabled: true,
    qrProvider: 'bKash',
    qrImageUrl: '',
    accountName: '',
    accountNumber: '',
  };

  const [qrEnabled, setQrEnabled] = useState<boolean>(pSet.qrEnabled ?? true);
  const [qrProvider, setQrProvider] = useState<string>(pSet.qrProvider || 'bKash');
  const [qrImageUrl, setQrImageUrl] = useState<string>(pSet.qrImageUrl || '');
  const [accountName, setAccountName] = useState<string>(pSet.accountName || '');
  const [accountNumber, setAccountNumber] = useState<string>(pSet.accountNumber || '');
  const [qrDragActive, setQrDragActive] = useState<boolean>(false);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle QR Code Image Upload
  const handleQrUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে কেবল ইমেজ ফাইল নির্বাচন করুন (PNG, JPG, SVG, WEBP)' : 'Please select an image file (PNG, JPG, SVG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setQrImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleRemoveQr = () => {
    setQrImageUrl('');
    if (qrFileInputRef.current) {
      qrFileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStoreName = storeName.trim() || 'My Store';
    updateSettings({
      brandName: finalStoreName,
      logoUrl: logoUrl,
      paymentSettings: {
        qrEnabled,
        qrProvider: qrProvider.trim() || 'bKash',
        qrImageUrl,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        updatedAt: new Date().toISOString(),
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Quick Provider Presets
  const providerPresets = ['bKash', 'Nagad', 'Rocket', 'Bank QR', 'Custom QR'];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={logoFileInputRef}
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
        className="hidden"
      />
      <input
        type="file"
        ref={qrFileInputRef}
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleQrUpload(e.target.files[0])}
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
              {isBn ? 'স্টোর ব্র্যান্ডিং ও পেমেন্ট সেটিংস' : 'Store Branding & Payment Settings'}
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {isBn
              ? 'আপনার দোকানের লোগো, নাম এবং POS / Quick Sale-এ ব্যবহৃত QR পেমেন্ট কনফিগারেশন আপডেট করুন।'
              : 'Customize store logo, brand title, and configure store QR payment codes for POS and Quick Sale.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'সেটিংস সফলভাবে সেভ হয়েছে!' : 'Settings saved successfully!'}</span>
          </div>
        )}
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'branding'
              ? 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{isBn ? 'স্টোর প্রফাইল ও লোগো' : 'Store Profile & Logo'}</span>
        </button>

        <button
          type="button"
          id="payment-settings-tab"
          onClick={() => setActiveSection('payment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'payment'
              ? 'bg-[#ff5c01] text-white shadow-md shadow-[#ff5c01]/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{isBn ? 'POS পেমেন্ট সেটিংস (QR)' : 'POS Payment Settings (QR)'}</span>
          {qrImageUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeSection === 'branding' ? (
          <>
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
                  ? 'আপনার দোকানের নাম আপডেট করুন। এটি ওয়েবসাইট হেডার, রিপোর্ট ও ইনভয়েসে দেখা যাবে।'
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
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.[0]) handleLogoUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => logoFileInputRef.current?.click()}
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
                      onClick={() => logoFileInputRef.current?.click()}
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
          </>
        ) : (
          /* POS Payment Settings (QR Code) Section */
          <div className="space-y-6 animate-in fade-in">
            {/* Payment Configuration Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#ff5c01]" />
                    <span>{isBn ? 'POS পেমেন্ট QR সেটিংস' : 'POS Payment QR Settings'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isBn
                      ? 'POS এবং Quick Sale-এ কাস্টমারদের জন্য স্টোরের পেমেন্ট QR কোড নির্বাচন ও আপলোড করুন।'
                      : 'Configure store QR code image and payment details shown to customers during POS and Quick Sale checkout.'}
                  </p>
                </div>

                {/* Enable / Disable Switch */}
                <button
                  type="button"
                  onClick={() => setQrEnabled(!qrEnabled)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    qrEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {qrEnabled ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isBn ? 'QR পেমেন্ট সক্রিয় (ON)' : 'QR Payment Enabled'}</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>{isBn ? 'QR পেমেন্ট নিষ্ক্রিয় (OFF)' : 'QR Payment Disabled'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Provider & Account Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? 'পেমেন্ট প্রোভাইডার নির্বাচন বা নাম লিখুন *' : 'Payment Provider Name *'}
                    </label>

                    {/* Quick Preset Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {providerPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQrProvider(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border ${
                            qrProvider.toLowerCase() === preset.toLowerCase()
                              ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#ff5c01]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      required
                      value={qrProvider}
                      onChange={(e) => setQrProvider(e.target.value)}
                      placeholder="e.g. bKash, Nagad, Rocket, Bank QR"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'অ্যাকাউন্ট বা মার্চেন্ট নাম (ঐচ্ছিক)' : 'Account / Merchant Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Downtown Supermarket"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'অ্যাকাউন্ট বা মোবাইল নম্বর (ঐচ্ছিক)' : 'Account / Mobile Number (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. +880 1700 000000"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>
                </div>

                {/* QR Code Upload Box */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পেমেন্ট QR কোড ছবি আপলোড করুন *' : 'Payment QR Code Image *'}
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setQrDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setQrDragActive(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setQrDragActive(false);
                      if (e.dataTransfer.files?.[0]) handleQrUpload(e.dataTransfer.files[0]);
                    }}
                    onClick={() => qrFileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] ${
                      qrDragActive
                        ? 'border-[#ff5c01] bg-[#ff5c01]/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#ff5c01]/60 bg-slate-50/60 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center mb-2">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {isBn ? 'QR কোড ছবি আপলোড করতে ক্লিক বা ড্রাগ করুন' : 'Click or Drag & Drop QR Code Image'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Merchant QR Code (bKash, Nagad, Bank, etc.)
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-3 py-1 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      {qrImageUrl ? (isBn ? 'QR পরিবর্তন করুন' : 'Replace QR Code') : (isBn ? 'QR আপলোড করুন' : 'Upload QR Code')}
                    </button>
                  </div>

                  {qrImageUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">QR Image Uploaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-600 hover:bg-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live POS Payment Modal Preview */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ff5c01]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    {isBn ? 'POS এবং Quick Sale-এ পেমেন্ট প্রিভিউ' : 'Live Checkout Modal Preview'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/30 font-extrabold uppercase">
                  {qrEnabled ? 'ACTIVE IN POS' : 'DISABLED'}
                </span>
              </div>

              {qrEnabled ? (
                <div className="max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#ff5c01]" />
                      <span>{qrProvider || 'bKash'} QR Payment</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400">STORE SPECIFIC</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mx-auto">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Store Payment QR"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-2 text-center rounded-xl border border-dashed border-slate-300">
                        <QrCode className="w-10 h-10 mb-1 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">No Custom Image Uploaded</span>
                        <span className="text-[9px] text-slate-400">Fallback QR will be used</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">
                      Provider: <span className="text-[#ff5c01] font-black">{qrProvider || 'bKash'}</span>
                    </p>
                    {accountName && (
                      <p className="text-[11px] text-slate-300">Account: <strong>{accountName}</strong></p>
                    )}
                    {accountNumber && (
                      <p className="text-[11px] font-mono text-slate-400">No: {accountNumber}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                  <Info className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="font-bold text-sm text-white">QR Payment is currently Disabled</p>
                  <p className="text-xs text-slate-400">Toggle "QR Payment Enabled" above to enable QR payments on checkout.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informational Guidance Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs">{isBn ? 'ব্যবহারের নির্দেশিকা:' : 'Store Configuration Guidelines:'}</h4>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-800 dark:text-indigo-300">
              <li>{isBn ? 'এখানে আপলোড করা QR কোডটি কেবল আপনার স্টোরের POS এবং Quick Sale-এ প্রদর্শিত হবে।' : 'The QR code image uploaded here belongs strictly to your logged-in store.'}</li>
              <li>{isBn ? 'সেভ করার সাথে সাথে POS এবং Quick Sale স্ক্রিন লাইভ আপডেট হয়ে যাবে।' : 'Saving changes instantly updates POS and Quick Sale payment modals.'}</li>
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
            <span>{isBn ? 'সেটিংস সেভ করুন' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

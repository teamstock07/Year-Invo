import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import { Settings, Save, Shield, Download, Upload, Store, DollarSign, Receipt, Users, Camera, Trash2, Image, User, SlidersHorizontal } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllDataToZero, t, setActiveTab } = useApp();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const siteFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData({ ...formData, logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSiteLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData({ ...formData, siteLogoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
  };

  const handleRemoveSiteLogo = () => {
    setFormData({ ...formData, siteLogoUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportDatabase = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bizcontrol_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            {t('settingsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure store profile, currency, receipt headers, tax percentages, and staff permissions.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            ✓ Settings saved successfully!
          </span>
        )}
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-[#ff5c01] font-bold text-xs shadow-xs"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{t('settings') || 'Store Settings'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('profile') || 'User Profile'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>{t('storeBranding') || 'Store Branding'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customize-dashboard')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-xs hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t('customizeDashboard') || 'Customize Dashboard'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Store className="w-4 h-4 text-blue-600" />
            Store Profile & Branding
          </h3>

          {/* Logo Photo Upload Section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="relative group w-16 h-16 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center font-black text-2xl overflow-hidden shadow-md shadow-[#ff5c01]/20">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-white" />
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">Store Brand Logo Photo</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Upload your shop logo to appear on receipts, invoices, headers, and sidebar.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200 hover:text-rose-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hidden File Input for Main Site Logo */}
          <input
            type="file"
            ref={siteFileInputRef}
            onChange={handleSiteLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Branding Options (Main Site Brand vs Personal Store Account) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
              <span>Brand Configuration Options</span>
              <span className="text-[10px] text-[#ff5c01] font-extrabold uppercase">Primary: YearInvo by Year Media</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Option 1: Primary Website Logo & Main Brand (Fixed / Non-Editable) */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Option 1: Main Website Logo & Brand
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">
                    Fixed System Default
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
                  <MainWebsiteLogo size={42} />
                  <div>
                    <div className="font-black text-sm text-white leading-tight">YearInvo</div>
                    <div className="text-[10px] font-extrabold text-[#ff5c01] uppercase tracking-wider">by Year Media</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Official main platform brand and website logo (fixed system default - cannot be changed).
                </p>
              </div>

              {/* Option 2: Personal Store / Business Name (Editable) */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-[#ff5c01] uppercase tracking-wider block">
                    Option 2: Personal Store / Account Name *
                  </label>
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01] font-extrabold uppercase">
                    Editable Store Title
                  </span>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Store / Business Name</label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Your Store Name"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your customized store or business name (defaults to <strong>"Your Store Name"</strong>). Appears after Option 1 on invoices & headers.
                </p>
              </div>
            </div>

            {/* Live Combined Preview */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Live Header & Report Title Preview:</span>
              <span className="font-black text-sm text-[#ff5c01]">
                {getDisplayBrandName(formData.brandName)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('ownerName')}</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('mobileNumber')}</label>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('emailAddress')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Config */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Financial & Localization Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">System Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer"
              >
                <option value="en">🇺🇸 English</option>
                <option value="bn">🇧🇩 বাংলা (Bengali)</option>
                <option value="ar">🇸🇦 العربية (Arabic)</option>
                <option value="ae">🇦🇪 Dubai / UAE</option>
                <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="ur">🇵🇰 اردو (Urdu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('currencySymbol')}</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="৳ or $ or ₹ or AED"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('taxRatePercent')} (%)</label>
              <input
                type="number"
                min="0"
                value={formData.taxRatePercent}
                onChange={(e) => setFormData({ ...formData, taxRatePercent: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('businessType')}</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Receipt Branding Config */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-purple-600" />
            Thermal POS Receipt Branding
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('receiptHeader')}</label>
              <input
                type="text"
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('receiptFooter')}</label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Database Backup & Export Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-amber-600" />
            Database Backup & System Security
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Export Complete Store Backup</p>
              <p className="text-[11px] text-slate-500">Download encrypted JSON file of all sales, inventory, and customers.</p>
            </div>

            <button
              type="button"
              onClick={handleExportDatabase}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Reset System Metrics & Data to 00</p>
              <p className="text-[11px] text-slate-500">Reset all sales, expenses, and totals to 00 for a fresh start.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all metrics, sales, and totals to 00?')) {
                  resetAllDataToZero();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All to 00</span>
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveSettings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

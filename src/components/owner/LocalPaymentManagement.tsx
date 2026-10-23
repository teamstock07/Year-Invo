import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BangladeshMethodConfig, BangladeshPaymentConfig } from '../../types';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Info,
  HelpCircle,
  Sparkles,
  Eye,
  Sliders,
  Check,
  Lock,
} from 'lucide-react';
import {
  BkashIcon,
  NagadIcon,
  RocketIcon,
  BankTransferIcon,
  BkashLogo,
  NagadLogo,
  RocketLogo,
  BankTransferLogo,
} from '../common/PaymentLogos';

interface LocalPaymentManagementProps {
  onSaved?: () => void;
  className?: string;
}

export const LocalPaymentManagement: React.FC<LocalPaymentManagementProps> = ({
  onSaved,
  className = '',
}) => {
  const { settings, updateSettings, user, t } = useApp();

  const isPlatformSuperAdmin =
    user?.email?.toLowerCase().trim() === 'teamstock07@gmail.com' ||
    user?.role === 'PlatformOwner' ||
    user?.role === 'Owner';

  const bdConfig = settings.paymentSettings?.bangladesh;

  // Master switch
  const [localPaymentEnabled, setLocalPaymentEnabled] = useState<boolean>(
    bdConfig?.enabled ?? settings.paymentSettings?.localPaymentEnabled ?? true
  );

  // Method states: bKash
  const [bkashEnabled, setBkashEnabled] = useState<boolean>(
    bdConfig?.methods?.bkash?.enabled ?? true
  );
  const [bkashNumber, setBkashNumber] = useState<string>(
    bdConfig?.methods?.bkash?.number || settings.paymentSettings?.paymentNumber || '01700000000'
  );
  const [bkashType, setBkashType] = useState<string>(
    bdConfig?.methods?.bkash?.type || 'Personal'
  );
  const [bkashInstructions, setBkashInstructions] = useState<string>(
    bdConfig?.methods?.bkash?.instructions ||
      '1. Open bKash App or dial *247#\n2. Select "Send Money"\n3. Enter the Number & Amount\n4. Add Store Name as Reference\n5. Copy TrxID and submit below'
  );

  // Method states: Nagad
  const [nagadEnabled, setNagadEnabled] = useState<boolean>(
    bdConfig?.methods?.nagad?.enabled ?? true
  );
  const [nagadNumber, setNagadNumber] = useState<string>(
    bdConfig?.methods?.nagad?.number || settings.paymentSettings?.paymentNumber || '01800000000'
  );
  const [nagadType, setNagadType] = useState<string>(
    bdConfig?.methods?.nagad?.type || 'Personal'
  );
  const [nagadInstructions, setNagadInstructions] = useState<string>(
    bdConfig?.methods?.nagad?.instructions ||
      '1. Open Nagad App or dial *167#\n2. Select "Send Money"\n3. Enter the Number & Amount\n4. Add Store Name as Reference\n5. Copy TrxID and submit below'
  );

  // Method states: Rocket
  const [rocketEnabled, setRocketEnabled] = useState<boolean>(
    bdConfig?.methods?.rocket?.enabled ?? true
  );
  const [rocketNumber, setRocketNumber] = useState<string>(
    bdConfig?.methods?.rocket?.number || settings.paymentSettings?.paymentNumber || '01900000000-1'
  );
  const [rocketType, setRocketType] = useState<string>(
    bdConfig?.methods?.rocket?.type || 'Personal'
  );
  const [rocketInstructions, setRocketInstructions] = useState<string>(
    bdConfig?.methods?.rocket?.instructions ||
      '1. Open Rocket App or dial *322#\n2. Select "Send Money"\n3. Enter the Rocket Account & Amount\n4. Add Store Name as Reference\n5. Copy TrxID and submit below'
  );

  // Method states: Bank Transfer
  const [bankEnabled, setBankEnabled] = useState<boolean>(
    bdConfig?.methods?.bank?.enabled ?? true
  );
  const [bankAccountNumber, setBankAccountNumber] = useState<string>(
    bdConfig?.methods?.bank?.number || (bdConfig?.methods?.bank as any)?.accountNumber || '1501203948501001'
  );
  const [bankName, setBankName] = useState<string>(
    bdConfig?.methods?.bank?.bankName || 'BRAC Bank PLC'
  );
  const [bankBranch, setBankBranch] = useState<string>(
    bdConfig?.methods?.bank?.branchName || 'Gulshan Branch'
  );
  const [bankAccountName, setBankAccountName] = useState<string>(
    bdConfig?.methods?.bank?.accountName || 'YearInvo Software Solution'
  );
  const [bankRoutingNumber, setBankRoutingNumber] = useState<string>(
    bdConfig?.methods?.bank?.routingNumber || '060261325'
  );
  const [bankInstructions, setBankInstructions] = useState<string>(
    bdConfig?.methods?.bank?.instructions ||
      '1. Transfer via BEFTN / NPSB / EFT to the company bank account\n2. Mention your Store Name or Email in the transfer note\n3. Enter the transaction reference / slip number below'
  );

  // Common information
  const [receiverName, setReceiverName] = useState<string>(
    bdConfig?.receiverName || settings.paymentSettings?.receiverName || 'YearInvo Store'
  );
  const [storeName, setStoreName] = useState<string>(
    bdConfig?.storeName || settings.paymentSettings?.storeName || 'YearInvo Store'
  );
  const [transactionIdInstruction, setTransactionIdInstruction] = useState<string>(
    bdConfig?.transactionIdInstruction ||
      settings.paymentSettings?.transactionIdInstruction ||
      'Copy your transaction ID (TrxID) or Bank Reference Number and enter it below.'
  );

  const [activePreviewMethod, setActivePreviewMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state if settings update
  useEffect(() => {
    if (settings.paymentSettings?.bangladesh) {
      const bd = settings.paymentSettings.bangladesh;
      setLocalPaymentEnabled(bd.enabled ?? true);
      if (bd.methods) {
        if (bd.methods.bkash) {
          setBkashEnabled(bd.methods.bkash.enabled ?? true);
          setBkashNumber(bd.methods.bkash.number || '');
          setBkashType(bd.methods.bkash.type || 'Personal');
          if (bd.methods.bkash.instructions) setBkashInstructions(bd.methods.bkash.instructions);
        }
        if (bd.methods.nagad) {
          setNagadEnabled(bd.methods.nagad.enabled ?? true);
          setNagadNumber(bd.methods.nagad.number || '');
          setNagadType(bd.methods.nagad.type || 'Personal');
          if (bd.methods.nagad.instructions) setNagadInstructions(bd.methods.nagad.instructions);
        }
        if (bd.methods.rocket) {
          setRocketEnabled(bd.methods.rocket.enabled ?? true);
          setRocketNumber(bd.methods.rocket.number || '');
          setRocketType(bd.methods.rocket.type || 'Personal');
          if (bd.methods.rocket.instructions) setRocketInstructions(bd.methods.rocket.instructions);
        }
        if (bd.methods.bank) {
          setBankEnabled(bd.methods.bank.enabled ?? true);
          setBankAccountNumber(bd.methods.bank.number || (bd.methods.bank as any).accountNumber || '');
          setBankName(bd.methods.bank.bankName || 'BRAC Bank PLC');
          setBankBranch(bd.methods.bank.branchName || 'Gulshan Branch');
          setBankAccountName(bd.methods.bank.accountName || 'YearInvo Software Solution');
          setBankRoutingNumber(bd.methods.bank.routingNumber || '060261325');
          if (bd.methods.bank.instructions) setBankInstructions(bd.methods.bank.instructions);
        }
      }
      setReceiverName(bd.receiverName || '');
      setStoreName(bd.storeName || '');
      setTransactionIdInstruction(bd.transactionIdInstruction || '');
    }
  }, [settings.paymentSettings]);

  if (!isPlatformSuperAdmin) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
        <Lock className="w-8 h-8 text-rose-500 mx-auto" />
        <h4 className="font-extrabold text-sm text-white">Restricted Access</h4>
        <p className="text-xs text-slate-400">
          Local Payment Management is exclusively available to the Owner / Admin.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (localPaymentEnabled) {
      if (!bkashEnabled && !nagadEnabled && !rocketEnabled && !bankEnabled) {
        setValidationError('Please enable at least one local payment method (bKash, Nagad, Rocket, or Bank Transfer).');
        return;
      }
      if (bkashEnabled && !bkashNumber.trim()) {
        setValidationError('bKash account number cannot be empty.');
        return;
      }
      if (nagadEnabled && !nagadNumber.trim()) {
        setValidationError('Nagad account number cannot be empty.');
        return;
      }
      if (rocketEnabled && !rocketNumber.trim()) {
        setValidationError('Rocket account number cannot be empty.');
        return;
      }
      if (bankEnabled && !bankAccountNumber.trim()) {
        setValidationError('Bank account number cannot be empty.');
        return;
      }
      if (!receiverName.trim()) {
        setValidationError('Receiver name cannot be empty.');
        return;
      }
      if (!storeName.trim()) {
        setValidationError('Store name cannot be empty.');
        return;
      }
      if (!transactionIdInstruction.trim()) {
        setValidationError('Transaction ID instructions cannot be empty.');
        return;
      }
    }

    const activeList: string[] = [];
    if (bkashEnabled) activeList.push('bKash');
    if (nagadEnabled) activeList.push('Nagad');
    if (rocketEnabled) activeList.push('Rocket');
    if (bankEnabled) activeList.push('Bank Transfer');

    const primaryNumber = (bkashEnabled && bkashNumber.trim()) ||
                          (nagadEnabled && nagadNumber.trim()) ||
                          (rocketEnabled && rocketNumber.trim()) ||
                          (bankEnabled && bankAccountNumber.trim()) || '';

    const newBangladeshConfig: BangladeshPaymentConfig = {
      enabled: localPaymentEnabled,
      methods: {
        bkash: {
          enabled: bkashEnabled,
          number: bkashNumber.trim(),
          type: bkashType,
          instructions: bkashInstructions.trim(),
        },
        nagad: {
          enabled: nagadEnabled,
          number: nagadNumber.trim(),
          type: nagadType,
          instructions: nagadInstructions.trim(),
        },
        rocket: {
          enabled: rocketEnabled,
          number: rocketNumber.trim(),
          type: rocketType,
          instructions: rocketInstructions.trim(),
        },
        bank: {
          enabled: bankEnabled,
          number: bankAccountNumber.trim(),
          type: 'Bank Account',
          bankName: bankName.trim(),
          branchName: bankBranch.trim(),
          accountName: bankAccountName.trim(),
          routingNumber: bankRoutingNumber.trim(),
          instructions: bankInstructions.trim(),
        },
      },
      receiverName: receiverName.trim(),
      storeName: storeName.trim(),
      transactionIdInstruction: transactionIdInstruction.trim(),
    };

    updateSettings({
      paymentSettings: {
        localPaymentEnabled,
        paymentMethod: activeList.join(' + ') || 'bKash',
        paymentNumber: primaryNumber,
        receiverName: receiverName.trim(),
        storeName: storeName.trim(),
        transactionIdInstruction: transactionIdInstruction.trim(),
        bangladesh: newBangladeshConfig,
        qrEnabled: settings.paymentSettings?.qrEnabled ?? true,
        qrProvider: activeList[0] || 'bKash',
        qrImageUrl: settings.paymentSettings?.qrImageUrl || '',
        accountName: receiverName.trim(),
        accountNumber: primaryNumber,
        updatedAt: new Date().toISOString(),
      },
    });

    setSavedSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ff5c01]/10 border border-[#ff5c01]/30 flex items-center justify-center text-[#ff5c01] shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Local Payment Management
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Owner Control
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control Bangladeshi local payment methods (bKash, Nagad, Rocket, Bank Transfer) available to customers on Checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition-all">
              <span className="text-xs font-bold text-slate-300">
                {localPaymentEnabled ? 'Local Payments Active' : 'Local Payments Disabled'}
              </span>
              <input
                type="checkbox"
                checked={localPaymentEnabled}
                onChange={(e) => setLocalPaymentEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#ff5c01] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Local Payment settings updated and synchronized with Checkout successfully!</span>
          </div>
        )}

        {validationError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Method Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>🇧🇩</span> Configured Payment Methods
              </h4>
              <span className="text-[11px] text-slate-400">
                Customize account numbers, instructions & availability
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* BKASH CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                bkashEnabled ? 'bg-slate-950 border-pink-500/40 shadow-lg shadow-pink-950/20' : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <BkashIcon className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-pink-400">bKash</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-bold">
                          বিকাশ
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Direct mobile wallet transfer</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={bkashEnabled}
                      onChange={(e) => setBkashEnabled(e.target.checked)}
                      className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                    <span className={bkashEnabled ? 'text-pink-400' : 'text-slate-500'}>
                      {bkashEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {bkashEnabled && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          bKash Account Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-pink-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Account Type
                        </label>
                        <select
                          value={bkashType}
                          onChange={(e) => setBkashType(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500 text-xs font-bold"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                          <option value="Agent">Agent (Cash In)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Customer Payment Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={bkashInstructions}
                        onChange={(e) => setBkashInstructions(e.target.value)}
                        placeholder="Instructions for customer during checkout..."
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* NAGAD CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                nagadEnabled ? 'bg-slate-950 border-orange-500/40 shadow-lg shadow-orange-950/20' : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <NagadIcon className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-orange-400">Nagad</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 font-bold">
                          নগদ
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Post Office Mobile Financial Service</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={nagadEnabled}
                      onChange={(e) => setNagadEnabled(e.target.checked)}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                    />
                    <span className={nagadEnabled ? 'text-orange-400' : 'text-slate-500'}>
                      {nagadEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {nagadEnabled && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Nagad Account Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={nagadNumber}
                          onChange={(e) => setNagadNumber(e.target.value)}
                          placeholder="018XXXXXXXX"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-orange-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Account Type
                        </label>
                        <select
                          value={nagadType}
                          onChange={(e) => setNagadType(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-orange-500 text-xs font-bold"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                          <option value="Agent">Agent (Cash In)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Customer Payment Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={nagadInstructions}
                        onChange={(e) => setNagadInstructions(e.target.value)}
                        placeholder="Instructions for customer during checkout..."
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-orange-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ROCKET CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                rocketEnabled ? 'bg-slate-950 border-purple-500/40 shadow-lg shadow-purple-950/20' : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <RocketIcon className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-purple-400">Rocket (DBBL)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                          রকেট
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Dutch-Bangla Bank Mobile Banking</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={rocketEnabled}
                      onChange={(e) => setRocketEnabled(e.target.checked)}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                    <span className={rocketEnabled ? 'text-purple-400' : 'text-slate-500'}>
                      {rocketEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {rocketEnabled && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Rocket Number (with Check Digit) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={rocketNumber}
                          onChange={(e) => setRocketNumber(e.target.value)}
                          placeholder="019XXXXXXXX-X"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Account Type
                        </label>
                        <select
                          value={rocketType}
                          onChange={(e) => setRocketType(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 text-xs font-bold"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                          <option value="Agent">Agent (Cash In)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Customer Payment Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={rocketInstructions}
                        onChange={(e) => setRocketInstructions(e.target.value)}
                        placeholder="Instructions for customer during checkout..."
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BANK WIRE TRANSFER CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                bankEnabled ? 'bg-slate-950 border-blue-500/40 shadow-lg shadow-blue-950/20' : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <BankTransferIcon className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-blue-400">Bank Payment</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                          ব্যাংক ট্রান্সফার
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">EFT / NPSB / BEFTN Direct Bank Wire</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={bankEnabled}
                      onChange={(e) => setBankEnabled(e.target.checked)}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                    <span className={bankEnabled ? 'text-blue-400' : 'text-slate-500'}>
                      {bankEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {bankEnabled && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Bank Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. BRAC Bank PLC"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={bankBranch}
                          onChange={(e) => setBankBranch(e.target.value)}
                          placeholder="e.g. Gulshan Branch"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Account Name (Beneficiary)
                        </label>
                        <input
                          type="text"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="e.g. YearInvo Software Solution"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Bank Account Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="1501203948501001"
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-mono font-bold text-amber-400 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={bankRoutingNumber}
                        onChange={(e) => setBankRoutingNumber(e.target.value)}
                        placeholder="060261325"
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Bank Transfer Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={bankInstructions}
                        onChange={(e) => setBankInstructions(e.target.value)}
                        placeholder="Instructions for customer during checkout..."
                        className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Global Store & Verification Instructions */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>🏷️</span> Store & Verification Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Receiver / Account Holder Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. YearInvo Software Solution"
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-[#ff5c01] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Store / Brand Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. YearInvo Store"
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-[#ff5c01] text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">
                  Transaction ID Instruction (Shown above TrxID input during Checkout) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={transactionIdInstruction}
                  onChange={(e) => setTransactionIdInstruction(e.target.value)}
                  placeholder="e.g. Copy your transaction ID (TrxID) or Bank Reference Number and enter it below."
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-[#ff5c01] text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Live Customer Checkout Preview Card */}
          <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Customer Checkout Preview
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {bkashEnabled && (
                  <button
                    type="button"
                    onClick={() => setActivePreviewMethod('bkash')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      activePreviewMethod === 'bkash' ? 'bg-pink-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    bKash
                  </button>
                )}
                {nagadEnabled && (
                  <button
                    type="button"
                    onClick={() => setActivePreviewMethod('nagad')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      activePreviewMethod === 'nagad' ? 'bg-orange-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Nagad
                  </button>
                )}
                {rocketEnabled && (
                  <button
                    type="button"
                    onClick={() => setActivePreviewMethod('rocket')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      activePreviewMethod === 'rocket' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Rocket
                  </button>
                )}
                {bankEnabled && (
                  <button
                    type="button"
                    onClick={() => setActivePreviewMethod('bank')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      activePreviewMethod === 'bank' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Bank
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  {activePreviewMethod === 'bkash' && <BkashLogo />}
                  {activePreviewMethod === 'nagad' && <NagadLogo />}
                  {activePreviewMethod === 'rocket' && <RocketLogo />}
                  {activePreviewMethod === 'bank' && <BankTransferLogo />}
                  <span className="font-bold text-white">
                    {activePreviewMethod === 'bkash'
                      ? 'bKash Mobile Wallet'
                      : activePreviewMethod === 'nagad'
                      ? 'Nagad Mobile Banking'
                      : activePreviewMethod === 'rocket'
                      ? 'DBBL Rocket'
                      : 'Bank Wire Transfer'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-amber-400 font-bold border border-slate-800">
                  {storeName || 'YearInvo Store'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Number</span>
                  <span className="font-mono font-extrabold text-amber-400">
                    {activePreviewMethod === 'bkash'
                      ? bkashNumber || '017XXXXXXXX'
                      : activePreviewMethod === 'nagad'
                      ? nagadNumber || '018XXXXXXXX'
                      : activePreviewMethod === 'rocket'
                      ? rocketNumber || '019XXXXXXXX-X'
                      : bankAccountNumber || '1501203948501001'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Receiver Name</span>
                  <span className="font-bold text-slate-200">
                    {activePreviewMethod === 'bank' ? bankAccountName || receiverName : receiverName}
                  </span>
                </div>
                {activePreviewMethod === 'bank' && (
                  <>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Bank & Branch</span>
                      <span className="font-bold text-slate-200">
                        {bankName} ({bankBranch})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Routing Number</span>
                      <span className="font-mono font-bold text-slate-200">
                        {bankRoutingNumber}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 text-[11px] space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Instructions:
                </span>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {activePreviewMethod === 'bkash'
                    ? bkashInstructions
                    : activePreviewMethod === 'nagad'
                    ? nagadInstructions
                    : activePreviewMethod === 'rocket'
                    ? rocketInstructions
                    : bankInstructions}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                {transactionIdInstruction}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-[#ff5c01] hover:bg-[#e05100] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Local Payment Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerLoyaltySettings, Customer } from '../../types';
import {
  Award,
  Gift,
  Settings,
  UserCheck,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  X,
} from 'lucide-react';

export const CustomerLoyaltyView: React.FC = () => {
  const {
    customers,
    updateCustomer,
    formatMoney,
    formatCurrency,
    displayCurrency,
    user,
    loyaltySettings: contextLoyaltySettings,
    saveLoyaltySettings: contextSaveLoyaltySettings,
  } = useApp();

  // Connected to real-time cloud Firestore synchronized state
  const loyaltySettings: CustomerLoyaltySettings = contextLoyaltySettings || {
    enabled: true,
    pointsPerAmount: 1, // 1 point
    spendingAmountUnit: 100, // per ৳100 spent
    pointRedemptionValue: 1, // 1 point = ৳1 discount
    minPointsToRedeem: 50, // Minimum 50 points
  };

  const saveLoyaltySettings = (updated: CustomerLoyaltySettings) => {
    if (contextSaveLoyaltySettings) {
      contextSaveLoyaltySettings(updated);
    }
    try {
      localStorage.setItem(`biz_loyalty_settings_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdjustPointsModalOpen, setIsAdjustPointsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adjustPointsType, setAdjustPointsType] = useState<'add' | 'deduct'>('add');
  const [adjustPointsAmount, setAdjustPointsAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('');

  // Settings form states
  const [formEnabled, setFormEnabled] = useState(loyaltySettings.enabled);
  const [formPointsPerUnit, setFormPointsPerUnit] = useState(loyaltySettings.pointsPerAmount);
  const [formUnitAmount, setFormUnitAmount] = useState(loyaltySettings.spendingAmountUnit);
  const [formRedeemValue, setFormRedeemValue] = useState(loyaltySettings.pointRedemptionValue);
  const [formMinRedeem, setFormMinRedeem] = useState(loyaltySettings.minPointsToRedeem);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerLoyaltySettings = {
      enabled: formEnabled,
      pointsPerAmount: Number(formPointsPerUnit) || 1,
      spendingAmountUnit: Number(formUnitAmount) || 100,
      pointRedemptionValue: Number(formRedeemValue) || 1,
      minPointsToRedeem: Number(formMinRedeem) || 50,
    };
    saveLoyaltySettings(updated);
    setIsSettingsModalOpen(false);
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const currentPoints = selectedCustomer.loyaltyPoints || 0;
    const delta = adjustPointsType === 'add' ? adjustPointsAmount : -adjustPointsAmount;
    const newPoints = Math.max(0, currentPoints + delta);

    const lifetimeEarned =
      adjustPointsType === 'add'
        ? (selectedCustomer.lifetimePointsEarned || 0) + adjustPointsAmount
        : selectedCustomer.lifetimePointsEarned || 0;

    const lifetimeRedeemed =
      adjustPointsType === 'deduct'
        ? (selectedCustomer.lifetimePointsRedeemed || 0) + adjustPointsAmount
        : selectedCustomer.lifetimePointsRedeemed || 0;

    updateCustomer(selectedCustomer.id, {
      loyaltyPoints: newPoints,
      lifetimePointsEarned: lifetimeEarned,
      lifetimePointsRedeemed: lifetimeRedeemed,
    });

    setIsAdjustPointsModalOpen(false);
    setSelectedCustomer(null);
  };

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    );
  });

  // Calculate totals
  const totalPointsDistributed = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalPointsRedeemed = customers.reduce(
    (sum, c) => sum + (c.lifetimePointsRedeemed || 0),
    0
  );
  const totalLoyaltyValue = totalPointsDistributed * loyaltySettings.pointRedemptionValue;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Gift className="w-3 h-3" />
                <span>Rewards & Retention</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-purple-400" />
              <span>Customer Loyalty & Rewards Program</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Reward repeat shoppers with points on every invoice. Customers can redeem points for discounts during POS checkout.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                setFormEnabled(loyaltySettings.enabled);
                setFormPointsPerUnit(loyaltySettings.pointsPerAmount);
                setFormUnitAmount(loyaltySettings.spendingAmountUnit);
                setFormRedeemValue(loyaltySettings.pointRedemptionValue);
                setFormMinRedeem(loyaltySettings.minPointsToRedeem);
                setIsSettingsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>Configure Rules</span>
            </button>
          </div>
        </div>

        {/* Program Status & Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-400">Program Status</p>
            <span
              className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${
                loyaltySettings.enabled
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {loyaltySettings.enabled ? 'Active (Collecting)' : 'Disabled'}
            </span>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-purple-400">Active Points Balance</p>
            <p className="text-xl font-bold text-purple-400 mt-0.5">{totalPointsDistributed} pts</p>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Total Points Redeemed</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{totalPointsRedeemed} pts</p>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-blue-400">Est. Liability Value</p>
            <p className="text-xl font-bold text-blue-400 mt-0.5">
              {formatMoney(totalLoyaltyValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Loyalty Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by name or phone..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
            />
          </div>

          <div className="text-xs text-slate-400">
            Rule: Earning <span className="text-purple-400 font-bold">{loyaltySettings.pointsPerAmount} pt</span> per <span className="text-white font-bold">{formatMoney(loyaltySettings.spendingAmountUnit)}</span> spent. (1 pt = {formatMoney(loyaltySettings.pointRedemptionValue)} discount)
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Current Points</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Lifetime Earned</th>
                <th className="py-3 px-4">Lifetime Redeemed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Adjust Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.map((c) => {
                const points = c.loyaltyPoints || 0;
                const discountValue = points * loyaltySettings.pointRedemptionValue;
                const canRedeem = points >= loyaltySettings.minPointsToRedeem;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-[11px] text-slate-400">{c.phone || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-sm">
                        {points} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {formatMoney(discountValue)}
                      {canRedeem ? (
                        <span className="block text-[10px] text-emerald-500 font-normal">
                          ✓ Eligible for checkout discount
                        </span>
                      ) : (
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Min. {loyaltySettings.minPointsToRedeem} pts required
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {c.lifetimePointsEarned || points} pts
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {c.lifetimePointsRedeemed || 0} pts
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatMoney(c.totalSpent || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setAdjustPointsAmount(50);
                          setAdjustReason('');
                          setIsAdjustPointsModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold ml-auto cursor-pointer"
                      >
                        Adjust Points
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIGURE RULES MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Loyalty Program Settings</span>
              </h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <p className="text-xs font-bold text-white">Enable Customer Loyalty Program</p>
                  <p className="text-[11px] text-slate-400">
                    Automatically award points on POS receipts and enable discount redemption.
                  </p>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Points Earned
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPointsPerUnit}
                    onChange={(e) => setFormPointsPerUnit(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    For Every ({displayCurrency}) Spent
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formUnitAmount}
                    onChange={(e) => setFormUnitAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    1 Point Value in ({displayCurrency})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={formRedeemValue}
                    onChange={(e) => setFormRedeemValue(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Min Points to Redeem
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinRedeem}
                    onChange={(e) => setFormMinRedeem(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl text-xs text-purple-300">
                Summary: Customer spends {formatMoney(formUnitAmount)} → Earns {formPointsPerUnit} points. At checkout, {formMinRedeem} points gives a discount of {formatMoney(formMinRedeem * formRedeemValue)}.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST POINTS MODAL */}
      {isAdjustPointsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                Adjust Points — {selectedCustomer.name}
              </h2>
              <button
                onClick={() => setIsAdjustPointsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustPointsType('add')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      adjustPointsType === 'add'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    + Add Bonus Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustPointsType('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      adjustPointsType === 'deduct'
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    - Deduct Points
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Points Amount
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustPointsAmount}
                  onChange={(e) => setAdjustPointsAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Adjustment
                </label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Festival VIP gift, manual compensation..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustPointsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-xs font-bold text-white cursor-pointer"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

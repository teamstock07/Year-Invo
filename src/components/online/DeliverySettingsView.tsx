import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineBusinessSettings, DeliveryPayer, defaultOnlineBusinessSettings } from '../../types';
import {
  Truck,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  Building2,
  MapPin,
  HelpCircle,
  Package,
  Phone,
  MessageCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

export const DeliverySettingsView: React.FC = () => {
  const { settings, updateOnlineSettings, formatCurrency, t } = useApp();

  const currentOnlineSettings: OnlineBusinessSettings =
    settings.onlineBusiness || defaultOnlineBusinessSettings;

  const [formState, setFormState] = useState<OnlineBusinessSettings>({
    ...defaultOnlineBusinessSettings,
    ...currentOnlineSettings,
    delivery: {
      ...defaultOnlineBusinessSettings.delivery,
      ...(currentOnlineSettings.delivery || {}),
    },
  });

  const [isSaved, setIsSaved] = useState(false);
  const [newCourierInput, setNewCourierInput] = useState('');

  const handlePayerChange = (payer: DeliveryPayer) => {
    setFormState((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        defaultPayer: payer,
      },
    }));
  };

  const handleAddCourier = () => {
    if (!newCourierInput.trim()) return;
    const currentList = formState.delivery.supportedCouriers || [];
    if (!currentList.includes(newCourierInput.trim())) {
      setFormState((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          supportedCouriers: [...currentList, newCourierInput.trim()],
        },
      }));
    }
    setNewCourierInput('');
  };

  const handleRemoveCourier = (name: string) => {
    setFormState((prev) => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        supportedCouriers: (prev.delivery.supportedCouriers || []).filter((c) => c !== name),
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOnlineSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Reset delivery settings to default values?')) {
      setFormState({
        ...defaultOnlineBusinessSettings,
        enabled: currentOnlineSettings.enabled,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Delivery & Charge Configuration</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure default delivery rates, courier partners, and who absorbs shipping costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved Successfully!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">Delivery configurations updated and synced across all devices.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Who Pays Delivery Charge Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Who Pays Delivery Charge?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select whether shipping fee is billed to the customer or absorbed by the store owner as a promotional expense.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Option 1: Customer Pays */}
            <div
              onClick={() => handlePayerChange('Customer')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                formState.delivery.defaultPayer === 'Customer'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formState.delivery.defaultPayer === 'Customer'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-400'
                    }`}
                  >
                    {formState.delivery.defaultPayer === 'Customer' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Customer Pays (Standard)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Delivery charge is added to order subtotal. Customer pays for shipping.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Product Price:</span>
                  <span>{formatCurrency(500)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>{formatCurrency(formState.delivery.defaultInsideCityCharge || 80)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1 text-indigo-600 dark:text-indigo-400">
                  <span>Customer Total:</span>
                  <span>
                    {formatCurrency(500 + Number(formState.delivery.defaultInsideCityCharge || 80))}
                  </span>
                </div>
              </div>
            </div>

            {/* Option 2: Owner Pays (Free Delivery) */}
            <div
              onClick={() => handlePayerChange('Owner')}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                formState.delivery.defaultPayer === 'Owner'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formState.delivery.defaultPayer === 'Owner'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-400'
                    }`}
                  >
                    {formState.delivery.defaultPayer === 'Owner' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Owner Pays (Free Delivery to Customer)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Customer pays only product price. Shipping cost is recorded as owner expense.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Product Price:</span>
                  <span>{formatCurrency(500)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Delivery Charge:</span>
                  <span>{formatCurrency(formState.delivery.defaultInsideCityCharge || 80)} (Paid by Owner)</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1 text-slate-900 dark:text-white">
                  <span>Customer Total:</span>
                  <span>{formatCurrency(500)}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400 text-[11px]">
                  <span>Owner Shipping Expense:</span>
                  <span>{formatCurrency(formState.delivery.defaultInsideCityCharge || 80)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Delivery Rates & Free Threshold Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Standard Shipping Rates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set default rates for within metropolitan area vs outside city shipments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Inside City Rate ({settings.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formState.delivery.defaultInsideCityCharge}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery,
                        defaultInsideCityCharge: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full pl-3 pr-8 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                  {settings.currency}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">E.g., Dhaka/Chattogram City: ৳80</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Outside City Rate ({settings.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formState.delivery.defaultOutsideCityCharge}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery,
                        defaultOutsideCityCharge: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full pl-3 pr-8 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                  {settings.currency}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">E.g., Nationwide: ৳150</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Free Delivery Threshold ({settings.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formState.delivery.freeDeliveryThreshold || 0}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery,
                        freeDeliveryThreshold: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full pl-3 pr-8 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                  {settings.currency}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Orders above this qualify for free shipping (0 = disabled)</p>
            </div>
          </div>
        </div>

        {/* 3. Supported Courier Partners Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supported Couriers & Delivery Partners
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which couriers your store uses for assigning shipments and tracking numbers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(formState.delivery.supportedCouriers || []).map((courier) => (
              <span
                key={courier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                <span>{courier}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCourier(courier)}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add courier name (e.g. Steadfast, Pathao, RedX, Paperfly, In-House)"
              value={newCourierInput}
              onChange={(e) => setNewCourierInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCourier();
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddCourier}
              className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              + Add Courier
            </button>
          </div>
        </div>

        {/* 4. Order & Inventory Automation Policies */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Order Processing & Inventory Policies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure automatic inventory deductions and COD options.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Auto Deduct Inventory */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.autoDeductInventory}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    autoDeductInventory: e.target.checked,
                  }))
                }
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Automatic Inventory Deduction
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When an online order is placed or confirmed, automatically deduct ordered quantities from the store inventory. Restocks items if the order is later cancelled or returned.
                </p>
              </div>
            </label>

            {/* Cash on Delivery (COD) */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.delivery.enableCod}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    delivery: {
                      ...prev.delivery,
                      enableCod: e.target.checked,
                    },
                  }))
                }
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Enable Cash on Delivery (COD)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow online orders to be placed with Cash on Delivery and tracked via COD Management.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
            <span>Save Delivery Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

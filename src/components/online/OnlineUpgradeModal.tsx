import React from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, Sparkles, X, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface OnlineUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'free' | 'expired' | 'unauthorized';
}

export const OnlineUpgradeModal: React.FC<OnlineUpgradeModalProps> = ({
  isOpen,
  onClose,
  reason = 'free',
}) => {
  const { setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleGoToUpgrade = () => {
    onClose();
    setActiveTab('subscription');
  };

  const isExpired = reason === 'expired';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Header Banner */}
        <div className="relative p-6 text-white bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-sky-200">
                Exclusive Pro & Premium Feature
              </span>
              <h3 className="text-xl font-bold">
                {isExpired ? 'Subscription Expired' : 'Unlock Online Business Mode'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-sky-100 mt-1 leading-relaxed">
            {isExpired
              ? 'Your Pro/Premium subscription has expired. Renew today to re-activate your online storefront, orders, courier tracking, and COD management.'
              : 'Online Business Mode empowers your retail store to accept online orders, manage couriers, track COD receivables, and control delivery charges.'}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            What's included with Online Business:
          </h4>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Full Order Lifecycle & Pipeline
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track orders from Pending → Confirmed → Processing → Shipped → Delivered.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Flexible Delivery & Charge Rules
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure Inside/Outside City charges and choose whether Customer or Owner pays delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Courier Tracking & COD Collection
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage Pathao, Steadfast, RedX courier assignments and track cash-on-delivery payouts.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleGoToUpgrade}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>{isExpired ? 'Renew Subscription' : 'Upgrade to Pro / Premium'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

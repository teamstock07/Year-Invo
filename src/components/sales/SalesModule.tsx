import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuickSaleView } from './QuickSaleView';
import { PosSystem } from '../pos/PosSystem';
import { SalesHistoryView } from './SalesHistoryView';
import { Zap, ShoppingCart, History, Crown, Sparkles } from 'lucide-react';

interface SalesModuleProps {
  initialSubTab?: 'quicksale' | 'pos' | 'history';
}

export const SalesModule: React.FC<SalesModuleProps> = ({ initialSubTab = 'quicksale' }) => {
  const { user, setActiveTab } = useApp();
  const [subTab, setSubTab] = useState<'quicksale' | 'pos' | 'history'>(initialSubTab);

  const plan = user?.subscriptionPlan || 'Free';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Consolidated Header & Sub-Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Sales Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff5c01]/10 text-[#ff5c01] text-[10px] font-extrabold uppercase tracking-wide border border-[#ff5c01]/20">
              {plan} Plan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose Quick Sale for small shops or full POS Register for multi-item supermarket checkout.
          </p>
        </div>

        {/* Sub-Tab Navigation Pills */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('quicksale')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'quicksale'
                ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-[#ff5c01]" />
            <span>Quick Sale</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'pos'
                ? 'bg-[#ff5c01] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS System</span>
            {plan === 'Free' && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[9px] font-black uppercase">
                PRO/PREMIUM
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Sales History</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {subTab === 'quicksale' && <QuickSaleView />}
      {subTab === 'pos' && <PosSystem />}
      {subTab === 'history' && <SalesHistoryView />}
    </div>
  );
};

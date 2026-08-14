import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QuickSaleView } from './QuickSaleView';
import { PosSystem } from '../pos/PosSystem';
import { SalesHistoryView } from './SalesHistoryView';
import { Zap, History, Sparkles } from 'lucide-react';

interface SalesModuleProps {
  initialSubTab?: 'quicksale' | 'pos' | 'history';
}

export const SalesModule: React.FC<SalesModuleProps> = ({ initialSubTab = 'quicksale' }) => {
  const { user, t, setActiveTab } = useApp();
  const [subTab, setSubTab] = useState<'quicksale' | 'pos' | 'history'>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const plan = user?.subscriptionPlan || 'Free';

  return (
    <div className="space-y-4 pb-12">
      {/* Sub-Tab Navigation Bar: [ Quick Sale ] [ Sales History ] [ Upgrade ] */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
          {/* 1. Quick Sale (Active/Current Section) */}
          <button
            type="button"
            onClick={() => setSubTab('quicksale')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'quicksale'
                ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#ff5c01]" />
            <span>{t('quickSaleTitle') || 'Quick Sale'}</span>
          </button>

          {/* 2. Sales History */}
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('salesHistory') || 'Sales History'}</span>
          </button>

          {/* 3. Subscription / Upgrade */}
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('upgrade') || t('upgradePlan') || 'Upgrade'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className="px-2.5 py-1 rounded-full bg-[#ff5c01]/10 hover:bg-[#ff5c01]/20 text-[#ff5c01] text-[10px] font-extrabold uppercase tracking-wide border border-[#ff5c01]/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{plan} {t('subscriptionPlan') || 'Plan'}</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {subTab === 'quicksale' && (
        <QuickSaleView
          onOpenHistory={() => setSubTab('history')}
        />
      )}
      {subTab === 'pos' && <PosSystem />}
      {subTab === 'history' && <SalesHistoryView />}
    </div>
  );
};

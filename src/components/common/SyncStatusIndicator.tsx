import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { syncQueueService, SyncState } from '../../services/syncQueueService';
import { useApp } from '../../context/AppContext';

interface SyncStatusIndicatorProps {
  variant?: 'compact' | 'full' | 'pill' | 'header';
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const [syncState, setSyncState] = useState<SyncState>(syncQueueService.getState());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const { language } = useApp();
  const isBn = language === 'bn';

  useEffect(() => {
    const unsub = syncQueueService.subscribe((state) => {
      setSyncState(state);
    });
    return unsub;
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!syncState.isOnline || syncState.status === 'syncing') return;
    setIsManualSyncing(true);
    await syncQueueService.triggerSync();
    setIsManualSyncing(false);
  };

  const { status, isOnline, pendingCount } = syncState;

  // Format label text according to language & state
  const getLabel = () => {
    if (!isOnline) {
      if (pendingCount > 0) {
        return isBn
          ? `অফলাইন — ${pendingCount}টি পরিবর্তন সেভ করা আছে`
          : `Offline — ${pendingCount} saved locally`;
      }
      return isBn ? 'অফলাইন — লোকাল সেভ' : 'Offline — Saved locally';
    }

    if (status === 'syncing' || isManualSyncing) {
      return isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...';
    }

    if (status === 'error') {
      return isBn ? 'সিঙ্ক বিলম্ব — পুনরায় চেষ্টা' : 'Sync issue — Retrying...';
    }

    if (pendingCount > 0) {
      return isBn ? `${pendingCount}টি সিঙ্ক অপেক্ষমান` : `${pendingCount} pending sync`;
    }

    return isBn ? 'সব সিঙ্ক সম্পন্ন' : 'All changes synced';
  };

  // Header compact pill format
  if (variant === 'header' || variant === 'pill') {
    return (
      <div
        id="header-sync-status-indicator"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none transition-all duration-200 border ${
          !isOnline
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : status === 'syncing' || isManualSyncing
            ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 animate-pulse'
            : status === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : pendingCount > 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        } ${className}`}
        title={
          !isOnline
            ? isBn
              ? 'ইন্টারনেট নেই। আপনি নিশ্চিন্তে বিক্রি ও কাজ চালিয়ে যেতে পারেন, সংযোগ এলে স্বয়ংক্রিয়ভাবে ক্লাউডে সিঙ্ক হবে।'
              : 'No internet connection. You can keep making sales and edits offline; they will auto-sync once back online.'
            : isBn
            ? 'ক্লাউড ডেটাবেস সক্রিয় ও সিঙ্কড।'
            : 'Cloud database is connected and synchronized.'
        }
      >
        {!isOnline ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : status === 'syncing' || isManualSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
        ) : status === 'error' ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        ) : pendingCount > 0 ? (
          <Cloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}

        <span className="text-[11px] font-medium tracking-tight whitespace-nowrap hidden sm:inline">
          {getLabel()}
        </span>

        {pendingCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
            {pendingCount}
          </span>
        )}

        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleManualSync}
            className="hover:opacity-80 transition-opacity p-0.5"
            title="Force sync now"
          >
            <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  // Compact dot icon variant
  if (variant === 'compact') {
    return (
      <div
        id="compact-sync-indicator"
        className={`relative flex items-center justify-center p-1.5 rounded-lg ${
          !isOnline
            ? 'text-amber-400 bg-amber-500/10'
            : status === 'syncing' || isManualSyncing
            ? 'text-sky-400 bg-sky-500/10'
            : status === 'error'
            ? 'text-rose-400 bg-rose-500/10'
            : 'text-emerald-400 bg-emerald-500/10'
        } ${className}`}
        title={getLabel()}
      >
        {!isOnline ? (
          <CloudOff className="w-4 h-4" />
        ) : status === 'syncing' || isManualSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  // Full detailed banner format
  return (
    <div
      id="full-sync-status-banner"
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
        !isOnline
          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
          : status === 'syncing' || isManualSyncing
          ? 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
          : status === 'error'
          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <CloudOff className="w-4 h-4 text-amber-400" />
        ) : status === 'syncing' || isManualSyncing ? (
          <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
        ) : status === 'error' ? (
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        )}
        <span className="font-medium">{getLabel()}</span>
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          type="button"
          onClick={handleManualSync}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          <span>{isBn ? 'এখনই সিঙ্ক করুন' : 'Sync Now'}</span>
        </button>
      )}
    </div>
  );
};

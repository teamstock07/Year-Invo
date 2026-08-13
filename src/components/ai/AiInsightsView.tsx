import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Clock,
  TrendingUp,
  Boxes,
  Users,
  MessageSquare,
  Bell,
  CheckCircle2,
  Zap,
  Bot,
  ShieldAlert,
} from 'lucide-react';

export const AiInsightsView: React.FC = () => {
  const { t } = useApp();
  const [notified, setNotified] = useState(false);

  const upcomingFeatures = [
    {
      icon: TrendingUp,
      title: 'Smart Sales & Revenue Forecasting',
      desc: 'Predict upcoming demand spikes, seasonal sales trends, and profit margins automatically.',
      color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    },
    {
      icon: Boxes,
      title: 'Automated Restock & Expiry Assistant',
      desc: 'Receive proactive alerts for low-stock products and items nearing their expiration dates.',
      color: 'bg-[#ff5c01]/10 text-[#ff5c01] dark:bg-[#ff5c01]/20 dark:text-[#ff8038]',
    },
    {
      icon: Users,
      title: 'Due Recovery & Customer Intelligence',
      desc: 'Identify overdue customers and generate smart payment reminder recommendations.',
      color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    },
    {
      icon: MessageSquare,
      title: 'Voice & Text Natural Language Advisor',
      desc: 'Ask business questions in Plain English or Bengali and receive immediate actionable answers.',
      color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">
      {/* Hero Coming Soon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-8 text-white shadow-2xl border border-indigo-800/40">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#ff5c01]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#ff5c01] text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-[#ff5c01]/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Coming Soon
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                Gemini AI Powered
              </span>
            </div>
            <span className="text-xs text-indigo-300/80 font-mono">v2.0 Next Generation</span>
          </div>

          <div className="space-y-3 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-300 shrink-0 animate-pulse" />
              AI Business Advisor
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
              We are building a powerful AI Assistant specifically designed for Bangladeshi merchants and retail stores. Get automated sales predictions, intelligent restock guidance, and instant profit optimization advice.
            </p>
          </div>

          {/* Action / Notification Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setNotified(!notified)}
              className={`px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                notified
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-[#ff5c01] hover:bg-[#e05100] text-white shadow-[#ff5c01]/30 active:scale-95'
              }`}
            >
              {notified ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>You'll be notified on launch!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4.5 h-4.5" />
                  <span>Notify Me On Launch</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-100">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Under Active Development</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Roadmap Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff5c01]" />
            What to expect in AI Business Advisor
          </h2>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl">
            4 Core Engines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start gap-4 group"
              >
                <div className={`p-3 rounded-2xl ${feat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center gap-3 text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs font-semibold leading-normal">
          AI Business Advisor is coming soon in the next system release. All existing POS, Quick Sale, Inventory, Dues, and Reports features remain 100% active and operational.
        </p>
      </div>
    </div>
  );
};

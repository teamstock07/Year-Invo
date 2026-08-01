import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import { Sparkles, Send, Bot, TrendingUp, Lightbulb, AlertCircle, RefreshCw } from 'lucide-react';

export const AiInsightsView: React.FC = () => {
  const { metrics, products, settings, sales, t } = useApp();
  const symbol = settings.currency || '৳';

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const presetPrompts = [
    'How can I increase profit margin this month?',
    'Analyze my low stock products and suggest reorder priorities.',
    'Give me a 3-step promotional strategy for local customers.',
    'What are my highest risk items based on expiry date?',
  ];

  const handleFetchAiInsights = async (customQuery?: string) => {
    const queryToUse = customQuery || prompt;
    if (!queryToUse && !prompt) return;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryToUse,
          businessData: {
            brandName: getDisplayBrandName(settings.brandName),
            businessType: settings.businessType,
            metrics,
            productCount: products.length,
            lowStockCount: metrics.lowStockCount,
            salesCount: sales.length,
          },
        }),
      });

      const data = await res.json();
      if (data.insight) {
        setResponse(data.insight);
      } else if (data.error) {
        setResponse(`AI Service Notice: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setResponse(
        'AI Assistant suggests: 1. Focus on clearing low-stock inventory. 2. Bundle slow-moving items with high-margin items like Wild Honey. 3. Collect customer dues promptly to boost cash flow balance.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase">
              Gemini AI Powered
            </span>
            <span className="text-xs text-indigo-200">Business Growth Intelligence</span>
          </div>
          <h2 className="text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            AI Business Advisor
          </h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Get automated sales recommendations, demand predictions, pricing optimization, and automated restock alerts.
          </p>
        </div>
      </div>

      {/* Preset Strategy Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Quick AI Strategy Prompts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleFetchAiInsights(p);
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 text-left transition-all shadow-xs group flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                  {p}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Click to generate instant analysis →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive AI Chat / Search Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Ask custom business question to Gemini AI
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchAiInsights()}
            placeholder="e.g. How can I increase wild honey sales in Chittagong region?"
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          />
          <button
            onClick={() => handleFetchAiInsights()}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* AI Response Output Box */}
      {(response || isLoading) && (
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-slate-800 dark:text-slate-100 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Bot className="w-5 h-5" />
            <span>Gemini Strategic Recommendation</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-6 text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Analyzing store sales data, stock levels, and revenue telemetry...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert text-xs leading-relaxed space-y-2 whitespace-pre-line font-sans text-slate-700 dark:text-slate-200">
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

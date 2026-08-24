import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import {
  ShoppingCart,
  Package,
  QrCode,
  Sparkles,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Barcode,
  Layers,
  ArrowRight,
  Zap,
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  Scan,
} from 'lucide-react';

interface RetailInventoryAnimationProps {
  onOpenSignup?: () => void;
}

export const RetailInventoryAnimation: React.FC<RetailInventoryAnimationProps> = ({
  onOpenSignup,
}) => {
  const { settings, language, theme } = useApp();
  const isBn = language === 'bn';
  const symbol = settings.currency || '৳';
  const brandName = getDisplayBrandName(settings.brandName) || 'Store';

  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'barcode' | 'ai'>('pos');
  const [scanPulse, setScanPulse] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(3);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Auto-cycle through items or scan animation periodically
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanPulse(true);
      setTimeout(() => {
        setScanPulse(false);
      }, 1200);
    }, 4500);

    return () => clearInterval(scanInterval);
  }, []);

  // Periodic subtle tab hint if inactive
  useEffect(() => {
    const tabInterval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'pos') return 'inventory';
        if (prev === 'inventory') return 'barcode';
        if (prev === 'barcode') return 'ai';
        return 'pos';
      });
    }, 8000);

    return () => clearInterval(tabInterval);
  }, []);

  return (
    <div className="relative w-full max-w-[560px] mx-auto lg:max-w-none">
      {/* ========================================================= */}
      {/* FLOATING MINI SCREENSHOT ANIMATIONS (RIGHT / SURROUNDING) */}
      {/* ========================================================= */}

      {/* Screenshot 1: Mini Thermal Barcode Sticker (Floating Top Right) */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0.5, -0.5, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="hidden xl:flex flex-col absolute -top-8 -right-6 z-30 w-48 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Thermal 50×30
          </span>
        </div>

        <div className="pt-2 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate">
            <span>{brandName.slice(0, 16)}</span>
          </div>
          <p className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400 truncate">
            Cotton Polo Shirt
          </p>

          {/* Barcode & QR Mini Visual */}
          <div className="flex items-center justify-center gap-1.5 py-1 bg-slate-50 dark:bg-slate-950/60 rounded-lg">
            <div className="font-mono text-[7px] tracking-tighter text-slate-700 dark:text-slate-300 font-bold">
              ||| | |||| | |||
            </div>
            <div className="w-5 h-5 bg-black dark:bg-white rounded-xs p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-black rounded-2xs flex items-center justify-center text-[5px] font-bold text-black dark:text-white">
                QR
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] pt-1">
            <span className="font-mono font-bold text-slate-500">#TSH-702</span>
            <span className="font-black text-[#ff5c01]">{symbol}850</span>
          </div>

          <div className="flex items-center justify-center gap-1 text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 py-0.5 rounded">
            <Printer className="w-2.5 h-2.5" />
            <span>Printed (0.2s)</span>
          </div>
        </div>
      </motion.div>

      {/* Screenshot 2: Real-time Low Stock Alert (Floating Bottom Right) */}
      <motion.div
        animate={{
          y: [0, 8, 0],
          rotate: [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="hidden xl:flex flex-col absolute -bottom-6 -right-4 z-30 w-52 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Smart Stock Alert
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">Just now</span>
        </div>

        <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 rounded-xl p-2 text-left space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span className="truncate max-w-[110px]">Wireless Earbuds</span>
            <span className="text-amber-600 dark:text-amber-400 text-[10px]">3 left</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[25%]" />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
            <span>Reorder point: 5</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer">
              + Restock 20
            </span>
          </div>
        </div>
      </motion.div>

      {/* Screenshot 3: Instant Live Sale Notification (Floating Bottom Left) */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="hidden md:flex items-center gap-2.5 absolute -bottom-5 -left-4 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl py-2 px-3 shadow-xl backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
            Live POS Checkout
          </p>
          <p className="text-xs font-black text-slate-900 dark:text-white">
            +{symbol}2,450 <span className="text-emerald-500 text-[10px]">bKash Paid</span>
          </p>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* MAIN ANIMATED RETAIL & SMART INVENTORY SHOWCASE TERMINAL   */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-sm">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5c01]/10 dark:bg-[#ff5c01]/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Top Window Bar with Live Indicators */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/90 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1 truncate">
              {brandName} • Modern Retail Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Live
            </span>
          </div>
        </div>

        {/* Interactive Feature Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[11px] font-bold relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'pos'
                ? 'bg-white dark:bg-slate-800 text-[#ff5c01] dark:text-[#ff8038] shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smart POS</span>
            <span className="sm:hidden">POS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inventory</span>
            <span className="sm:hidden">Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'barcode'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Barcode</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Insight</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>

        {/* Tab 1: MODERN RETAIL POS TERMINAL */}
        <AnimatePresence mode="wait">
          {activeTab === 'pos' && (
            <motion.div
              key="pos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* POS Top Bar & Barcode Scanner Animation */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-2xl relative overflow-hidden">
                {/* Laser scan line animation */}
                {scanPulse && (
                  <motion.div
                    initial={{ left: '-10%' }}
                    animate={{ left: '110%' }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#ff5c01]/40 to-transparent pointer-events-none -skew-x-12 z-20"
                  />
                )}

                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className={`p-1.5 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] ${scanPulse ? 'scale-110' : ''} transition-transform`}>
                    <Scan className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Barcode Scanner</p>
                    <p className="font-mono text-xs text-slate-900 dark:text-white">
                      {scanPulse ? '⚡ Scanned #SKU-8821' : 'Ready: Scan or Tap Item'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                    Cart: {cartItemsCount} items
                  </span>
                </div>
              </div>

              {/* POS Cart Items List */}
              <div className="space-y-1.5">
                {[
                  { id: 1, name: 'Cotton Polo Shirt', sku: 'POLO-01', price: 850, qty: 1, tag: 'Clothing' },
                  { id: 2, name: 'Smart Wireless Earbuds', sku: 'EAR-99', price: 1650, qty: 1, tag: 'Electronics' },
                  { id: 3, name: 'Denim Slim Jeans', sku: 'JNS-42', price: 1450, qty: 1, tag: 'Fashion' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                          {item.name}
                        </p>
                        <p className="text-[9.5px] font-mono text-slate-400">
                          #{item.sku} • {item.tag}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 font-bold">x{item.qty}</span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {symbol}{item.price * item.qty}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* POS Summary & Quick Checkout */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Net Total</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {symbol}3,950
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto Khata</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSignup}
                    className="px-3.5 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-black text-xs rounded-xl shadow-md shadow-[#ff5c01]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Instant Bill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: SMART INVENTORY PLATFORM */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Inventory Overview Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Items</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">418 SKUs</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Valuation</p>
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{symbol}12.5L</p>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Low Stock</p>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400">3 Alerts</p>
                </div>
              </div>

              {/* Real-time Inventory Health Rows */}
              <div className="space-y-2">
                {[
                  { name: 'Polo Cotton Shirt', stock: 48, max: 60, status: 'In Stock', color: 'emerald' },
                  { name: 'Smart Wireless Earbuds', stock: 3, max: 30, status: 'Low Stock Alert', color: 'amber' },
                  { name: 'Leather Slim Wallet', stock: 19, max: 25, status: 'Optimal', color: 'indigo' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {item.name}
                      </span>
                      <span
                        className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                          item.color === 'amber'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : item.color === 'emerald'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {item.status} ({item.stock} pcs)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.color === 'amber'
                            ? 'bg-amber-500'
                            : item.color === 'emerald'
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${(item.stock / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>🔄 Auto-syncs with POS sales & purchase bills</span>
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="font-bold text-[#ff5c01] hover:underline"
                >
                  Manage Inventory →
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab 3: BARCODE & THERMAL STICKER STUDIO */}
          {activeTab === 'barcode' && (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-center">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    50×30mm & A4 Sheet Stickers
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    CODE128 + Store QR
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-center space-y-1 shadow-2xs">
                    <p className="text-[9px] font-black uppercase text-slate-400">
                      {brandName.toUpperCase()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      Polo Shirt #01
                    </p>
                    <div className="py-1 font-mono text-[7.5px] font-bold text-slate-600 dark:text-slate-400">
                      |||| | || |||| |
                    </div>
                    <p className="text-[10px] font-black text-[#ff5c01]">{symbol}850</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-center space-y-1 shadow-2xs">
                    <p className="text-[9px] font-black uppercase text-slate-400">
                      {brandName.toUpperCase()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      Wireless Earbuds
                    </p>
                    <div className="py-1 font-mono text-[7.5px] font-bold text-slate-600 dark:text-slate-400">
                      ||| |||| | ||| |
                    </div>
                    <p className="text-[10px] font-black text-[#ff5c01]">{symbol}1,650</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] text-slate-400">Compatible with Xprinter, Gprinter & Zebra</span>
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print Labels</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Tab 4: AI BUSINESS INSIGHTS */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-indigo-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Smart AI Retail Assistant
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "Today's peak sales hour is between 4 PM - 8 PM. Net profit margin is healthy at 19.4%. Recommendation: Restock 15 units of Polo Shirts before the weekend rush."
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <span>Forecast Accuracy: 96%</span>
                  <span className="bg-amber-500/20 px-2 py-0.5 rounded">Actionable Insight</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../../types';
import { findProductWithStoreCheck, normalizeCode } from '../../utils/scanner';
import { playBeepSound } from '../../utils/audio';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  QrCode,
  Zap,
  ShoppingBag,
  Plus,
  Check,
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductScanned: (product: Product) => void;
  language?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductScanned,
  language = 'en',
}) => {
  const { user, cart, settings } = useApp();
  const currentStoreId = user?.id || user?.brandName || '';
  const symbol = settings.currency || '৳';

  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScannedProduct, setLastScannedProduct] = useState<{
    name: string;
    sku: string;
    price: number;
    time: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const scannerContainerId = 'pos-camera-qr-reader';

  const isBn = language === 'bn';

  const handleProcessCode = useCallback((scannedCode: string) => {
    const code = normalizeCode(scannedCode);
    if (!code) return;

    const now = Date.now();
    // 1.2s cooldown on the EXACT SAME code to prevent accidental double-fire on same item frame
    if (
      lastScannedCodeRef.current &&
      lastScannedCodeRef.current.code === code &&
      now - lastScannedCodeRef.current.time < 1200
    ) {
      return;
    }
    lastScannedCodeRef.current = { code, time: now };

    setScanError(null);

    // Look for matching product using store-checked scanner logic
    const result = findProductWithStoreCheck(products, code, currentStoreId);

    if (result.error === 'different_store') {
      setScanError(
        isBn
          ? 'এই স্টোরে পণ্যটি পাওয়া যায়নি (অন্যান্য স্টোরের QR কোড)'
          : 'Product not found in this store.'
      );
      return;
    }

    const matched = result.product;

    if (!matched) {
      setScanError(
        isBn
          ? `কোনো প্রোডাক্ট পাওয়া যায়নি (Code: ${code})`
          : `Product not found for scanned code: ${code}`
      );
      return;
    }

    // Check status
    if (matched.status === 'damaged') {
      setScanError(
        isBn
          ? `ক্ষতিগ্রস্ত পণ্য - "${matched.name}" বিক্রি করা যাবে না!`
          : `Damaged Product - "${matched.name}" cannot be sold.`
      );
      return;
    }

    // Check stock
    if (matched.currentStock <= 0 || matched.status === 'out_of_stock') {
      setScanError(
        isBn
          ? `স্টক শেষ - "${matched.name}" বর্তমানে আউট অফ স্টক!`
          : `Out of Stock - Product "${matched.name}" is currently out of stock!`
      );
      return;
    }

    // Check expiry
    const todayStr = new Date().toISOString().split('T')[0];
    if (matched.expiryDate && matched.expiryDate <= todayStr) {
      setScanError(
        isBn
          ? `মেয়াদ শেষ - "${matched.name}" প্রোডাক্টের মেয়াদ উত্তীর্ণ!`
          : `Expired Product - Product "${matched.name}" has expired and cannot be sold.`
      );
      return;
    }

    // Play instant audio beep & add to cart
    playBeepSound();
    onProductScanned(matched);

    setScanCount((prev) => prev + 1);
    setLastScannedProduct({
      name: matched.name,
      sku: matched.sku || matched.barcode || matched.id,
      price: matched.sellingPrice,
      time: Date.now(),
    });

    // If user explicitly chose Single Scan Mode, close after 1 scan
    if (!isContinuousMode) {
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [products, currentStoreId, isBn, onProductScanned, isContinuousMode, onClose]);

  const restartScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (_) {}
    }

    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
    ];

    try {
      const html5Qrcode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 260, height: 200 },
        },
        (decodedText) => {
          handleProcessCode(decodedText);
        },
        () => {
          // Quiet frame scan callback
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera Scanner startup warning:', err);
      setIsScanning(false);
    }
  }, [handleProcessCode]);

  useEffect(() => {
    if (!isOpen) {
      setScanCount(0);
      setLastScannedProduct(null);
      setScanError(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        restartScanner();
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      const scanner = html5QrcodeRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner
              .stop()
              .catch(() => {})
              .then(() => {
                try {
                  scanner.clear();
                } catch (_) {}
              })
              .catch(() => {});
          } else {
            try {
              scanner.clear();
            } catch (_) {}
          }
        } catch (_) {}
      }
      html5QrcodeRef.current = null;
      setIsScanning(false);
    };
  }, [isOpen, restartScanner]);

  if (!isOpen) return null;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {isBn ? 'বারকোড ও QR কোড স্ক্যানার' : 'Continuous Barcode & QR Scanner'}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isBn
                  ? 'ক্যামেরার সামনে বারকোড ধরুন, স্ক্যানার চালু থাকবে।'
                  : 'Point camera at barcode or QR code. Scanner stays active.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-3.5">
          {/* Mode Selector & Quick Controls */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsContinuousMode(true)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isContinuousMode
                    ? 'bg-[#ff5c01] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isBn ? 'মাল্টি-স্ক্যান (চলমান)' : 'Continuous Multi-Scan'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsContinuousMode(false)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  !isContinuousMode
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{isBn ? 'সিঙ্গেল স্ক্যান' : 'Single Scan'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={restartScanner}
              className="p-1.5 rounded-xl text-slate-500 hover:text-[#ff5c01] hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Restart Camera Stream"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBn ? 'রিস্টার্ট' : 'Restart'}</span>
            </button>
          </div>

          {/* Real Camera View Area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#ff5c01]/60 min-h-[230px] flex items-center justify-center shadow-inner">
            <div id={scannerContainerId} className="w-full h-full min-h-[220px]" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-36 border-2 border-emerald-400/80 rounded-xl relative">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                <div className="w-full h-0.5 bg-emerald-400/60 absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/90 space-y-2">
                <Camera className="w-8 h-8 text-[#ff5c01] animate-pulse" />
                <p className="text-xs text-slate-200 font-bold">
                  {isBn ? 'ক্যামেরা চালু হচ্ছে...' : 'Starting camera stream...'}
                </p>
                <button
                  type="button"
                  onClick={restartScanner}
                  className="px-3 py-1.5 bg-[#ff5c01] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {isBn ? 'ক্যামেরা চালু করুন' : 'Enable Camera'}
                </button>
              </div>
            )}
          </div>

          {/* Last Scanned Banner */}
          {lastScannedProduct && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-100 line-clamp-1">
                    {lastScannedProduct.name}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                    SKU: #{lastScannedProduct.sku} • {symbol}{lastScannedProduct.price}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[11px] shrink-0">
                +1 Added
              </span>
            </div>
          )}

          {/* Error Banner */}
          {scanError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Manual / Machine Scanner Input fallback */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isBn ? 'বারকোড মেশিন বা ম্যানুয়াল এন্ট্রি:' : 'USB Scanner / Manual Code Entry:'}
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) {
                  handleProcessCode(manualCode);
                  setManualCode('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={isBn ? 'কোড স্ক্যান বা পেস্ট করুন...' : 'Scan or type QR/Barcode here...'}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[#ff5c01]"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {isBn ? 'যোগ করুন' : 'Add'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isBn ? 'মোট কার্ট আইটেম:' : 'Cart Items:'}
              </p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                {totalCartItems} {isBn ? 'টি পণ্য' : 'items in cart'} ({scanCount} scanned now)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-black shadow-md shadow-[#ff5c01]/20 transition-all cursor-pointer"
          >
            {isBn ? 'সম্পন্ন করুন' : 'Done Scanning'}
          </button>
        </div>
      </div>
    </div>
  );
};


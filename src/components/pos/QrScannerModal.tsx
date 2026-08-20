import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { findProductWithStoreCheck } from '../../utils/scanner';
import {
  X,
  Camera,
  RotateCcw,
  Check,
  AlertCircle,
  QrCode,
  Barcode,
  ShoppingBag,
  CheckCircle2,
  ScanLine,
  Package,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  language: string;
  onProductScanned: (product: Product, quantity?: number) => void;
}

type ScannerMode = 'barcode' | 'qr';

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  language,
  onProductScanned,
}) => {
  const { settings, user } = useApp();
  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  // Scanner View & Mode State (Exactly 2 options: 'barcode' or 'qr')
  const [activeMode, setActiveMode] = useState<ScannerMode>('barcode');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Scan State & Locking
  const [isScanLocked, setIsScanLocked] = useState<boolean>(false);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Manual / USB Scanner Input
  const [manualCode, setManualCode] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'yearinvo-pos-camera-stream';
  const isMountedRef = useRef<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synchronous ref lock: guarantees ONLY ONE scan event is ever processed per session
  const isProcessingRef = useRef<boolean>(false);

  // Audio Context helper
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return audioContextRef.current;
    } catch (_) {
      return null;
    }
  }, []);

  // Exactly ONE short scan-success sound / beep (880Hz sine wave, 100ms)
  const playSuccessBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, ctx.currentTime); // Crisp, high-pitch POS chime
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Non-blocking audio fallback
    }
  }, [getAudioContext]);

  // Single error alert tone (low pitch dual buzz)
  const playErrorBeep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }, [getAudioContext]);

  /**
   * Stop camera immediately and safely
   */
  const stopCameraScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        // Silently ignore already stopped errors
      }
      try {
        await scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  /**
   * Core Scan Event Handler:
   * 1. Synchronously locks against repeated callbacks.
   * 2. Immediately stops the camera scanner.
   * 3. Securely looks up product from store database.
   * 4. Plays exactly ONE beep and adds product to POS cart.
   * 5. Keeps camera OFF and waits for user.
   */
  const handleDecodedCode = useCallback(
    async (decodedText: string) => {
      // 1. SYNCHRONOUS LOCK: Ignore all subsequent callbacks immediately
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;
      setIsScanLocked(true);

      // 2. STOP CAMERA IMMEDIATELY: Camera turns OFF right after first detection
      await stopCameraScanner();

      const raw = (decodedText || '').trim();
      if (!raw) {
        isProcessingRef.current = false;
        setIsScanLocked(false);
        return;
      }

      // 3. SECURITY & STORE VERIFICATION
      const currentStoreId = user?.id || user?.brandName || '';
      const result = findProductWithStoreCheck(products, raw, currentStoreId);

      if (result.error === 'different_store') {
        playErrorBeep();
        setScannerError(
          isBn
            ? `এই পণ্যটি অন্য দোকানের। আপনার স্টোর ডাটাবেজে এটি অনুমোদিত নয় (কোড: "${raw}")।`
            : `Product belongs to another store or cannot be verified (Code: "${raw}").`
        );
        setDetectedProduct(null);
        setScanSuccess(false);
        return;
      }

      if (!result.product) {
        playErrorBeep();
        setScannerError(
          isBn
            ? `পণ্যটি ডাটাবেজে পাওয়া যায়নি (কোড: "${raw}")। সঠিক বারকোড বা কিউআর কোড স্ক্যান করুন।`
            : `Product not found in your inventory for code: "${raw}".`
        );
        setDetectedProduct(null);
        setScanSuccess(false);
        return;
      }

      const matched = result.product;
      const todayStr = new Date().toISOString().split('T')[0];

      if (matched.expiryDate && matched.expiryDate <= todayStr) {
        playErrorBeep();
        setScannerError(
          isBn
            ? `"${matched.name}" পণ্যের মেয়াদ উত্তীর্ণ হয়েছে এবং এটি বিক্রি করা যাবে না।`
            : `Product "${matched.name}" has expired and cannot be sold.`
        );
        setDetectedProduct(null);
        setScanSuccess(false);
        return;
      }

      if (matched.currentStock <= 0 || matched.status === 'out_of_stock') {
        playErrorBeep();
        setScannerError(
          isBn
            ? `"${matched.name}" স্টক শেষ (Out of Stock)!`
            : `Product "${matched.name}" is currently out of stock!`
        );
        setDetectedProduct(null);
        setScanSuccess(false);
        return;
      }

      // 4. PLAY EXACTLY ONE CONFIRMATION BEEP
      playSuccessBeep();

      // 5. AUTOMATICALLY ADD SINGLE PRODUCT ENTRY TO POS CART / CHECKOUT
      onProductScanned(matched, 1);

      // 6. UPDATE STATE TO REFLECT SUCCESSFUL DETECTION
      setDetectedProduct(matched);
      setScanSuccess(true);
      setScannerError(null);
    },
    [products, user, isBn, playSuccessBeep, playErrorBeep, onProductScanned, stopCameraScanner]
  );

  /**
   * Start / Switch Camera Scanner
   */
  const startCameraScanner = useCallback(async () => {
    if (!isOpen) return;

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {}
        try {
          await scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      const formatsToSupport =
        activeMode === 'barcode'
          ? [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.CODE_93,
              Html5QrcodeSupportedFormats.ITF,
              Html5QrcodeSupportedFormats.QR_CODE, // Also accept QR if generated as barcode
            ]
          : [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.DATA_MATRIX,
              Html5QrcodeSupportedFormats.AZTEC,
            ];

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 20,
        qrbox: activeMode === 'barcode' ? { width: 280, height: 130 } : { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        qrConfig,
        (decodedText) => {
          // Immediately route to single-detection handler
          handleDecodedCode(decodedText);
        },
        () => {
          // Ignore empty intermediate frames
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setScannerError(null);
      }
    } catch (err: any) {
      console.warn('[POS Scanner] Camera initialization error:', err);
      if (isMountedRef.current) {
        setIsScanning(false);
        setScannerError(
          isBn
            ? 'ক্যামেরা চালু করা সম্ভব হয়নি। ক্যামেরা পারমিশন দিন অথবা নিচে কোড লিখে সার্চ করুন।'
            : 'Camera permission denied or camera not found. Please enable permissions or enter code below.'
        );
      }
    }
  }, [isOpen, activeMode, handleDecodedCode, isBn]);

  /**
   * Explicit "Scan Again" Action:
   * Resets scanner lock and reactivates camera for exactly ONE new scan.
   */
  const handleScanAgain = () => {
    isProcessingRef.current = false;
    setIsScanLocked(false);
    setDetectedProduct(null);
    setScanSuccess(false);
    setScannerError(null);
    setManualCode('');

    // Reopen/activate camera scanner
    startCameraScanner();
  };

  /**
   * Switch between Barcode Scanner and QR Code Scanner modes
   */
  const handleModeSwitch = (mode: ScannerMode) => {
    if (activeMode === mode && isScanning) return;
    setActiveMode(mode);
    isProcessingRef.current = false;
    setIsScanLocked(false);
    setDetectedProduct(null);
    setScanSuccess(false);
    setScannerError(null);
    setManualCode('');
  };

  // Mount/Unmount effect
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      isProcessingRef.current = false;
      setIsScanLocked(false);
      setDetectedProduct(null);
      setScanSuccess(false);
      setScannerError(null);
      setManualCode('');

      const timer = setTimeout(() => {
        startCameraScanner();
      }, 150);

      return () => {
        clearTimeout(timer);
        stopCameraScanner();
      };
    } else {
      isProcessingRef.current = false;
      stopCameraScanner();
      setDetectedProduct(null);
      setIsScanLocked(false);
      setScanSuccess(false);
      setScannerError(null);
    }

    return () => {
      isMountedRef.current = false;
      stopCameraScanner();
    };
  }, [isOpen, activeMode, startCameraScanner, stopCameraScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center">
              {activeMode === 'barcode' ? <Barcode className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isBn ? 'পণ্য স্ক্যানার' : 'POS Camera Scanner'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff5c01] text-white">
                  {activeMode === 'barcode' ? 'Barcode 1D' : 'QR Code 2D'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'একবার স্ক্যান করলেই পণ্যটি সরাসরি কার্টে যোগ হবে'
                  : 'Point camera at code — scans once and adds to POS cart'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Mode Selection Tabs: Exactly 2 options */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80">
          <div className="grid grid-cols-2 gap-2">
            {/* OPTION 1: Barcode Scanner */}
            <button
              type="button"
              onClick={() => handleModeSwitch('barcode')}
              className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeMode === 'barcode'
                  ? 'bg-white dark:bg-slate-800 text-[#ff5c01] border-[#ff5c01] shadow-xs'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Barcode className="w-4 h-4" />
              <span>{isBn ? '১. বারকোড স্ক্যানার' : '1. Barcode Scanner'}</span>
            </button>

            {/* OPTION 2: QR Code Scanner */}
            <button
              type="button"
              onClick={() => handleModeSwitch('qr')}
              className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                activeMode === 'qr'
                  ? 'bg-white dark:bg-slate-800 text-[#ff5c01] border-[#ff5c01] shadow-xs'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{isBn ? '২. কিউআর কোড স্ক্যানার' : '2. QR Code Scanner'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* CAMERA VIEWFINDER (Active or Stopped State) */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 min-h-[220px] flex items-center justify-center shadow-inner">
            <div id={scannerContainerId} className="w-full h-full min-h-[210px]" />

            {/* Scanning Reticle (Only when camera is actively streaming and not locked) */}
            {isScanning && !isScanLocked && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {activeMode === 'barcode' ? (
                  <div className="w-64 h-28 border-2 border-emerald-400/90 rounded-xl relative shadow-lg shadow-emerald-500/10">
                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />
                    <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-44 h-44 border-2 border-emerald-400/90 rounded-xl relative shadow-lg shadow-emerald-500/10">
                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />
                    <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                )}
              </div>
            )}

            {/* Camera OFF / Scan Completed Overlay */}
            {(!isScanning || isScanLocked) && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 space-y-2 animate-in fade-in">
                {scanSuccess && detectedProduct ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-emerald-400">
                      {isBn ? 'স্ক্যান সম্পন্ন • ক্যামেরা বন্ধ রয়েছে' : 'Scan Complete • Camera Turned OFF'}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {isBn
                        ? 'পণ্যটি কার্টে যোগ করা হয়েছে। পরবর্তী পণ্য স্ক্যান করতে "Scan Again" চাপুন।'
                        : 'Product added to POS checkout. Click "Scan Again" to scan next item.'}
                    </p>
                  </>
                ) : scannerError ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-rose-400">
                      {isBn ? 'স্ক্যান ত্রুটি • ক্যামেরা বন্ধ' : 'Scan Error • Camera Stopped'}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {isBn
                        ? 'সঠিক বারকোড বা কিউআর কোড স্ক্যান করতে "Scan Again" চাপুন।'
                        : 'Click "Scan Again" to restart scanner with a valid code.'}
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-[#ff5c01] animate-pulse" />
                    <p className="text-xs text-slate-200 font-bold">
                      {isBn ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing Camera...'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 1. SCAN SUCCESS CARD (Detected product confirmed and added to cart) */}
          {scanSuccess && detectedProduct && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border-2 border-emerald-500/80 shadow-lg space-y-3.5 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 overflow-hidden">
                    {detectedProduct.image ? (
                      <img
                        src={detectedProduct.image}
                        alt={detectedProduct.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider mb-1">
                      <Check className="w-3 h-3" />
                      {isBn ? 'কার্টে ১টি পণ্য যোগ হয়েছে' : 'Added to POS Cart (1x)'}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {detectedProduct.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      SKU: #{detectedProduct.sku || detectedProduct.id} • {isBn ? 'স্টক:' : 'Stock:'}{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {detectedProduct.currentStock ?? detectedProduct.stock}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {isBn ? 'মূল্য' : 'Price'}
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {symbol}
                    {detectedProduct.sellingPrice ?? detectedProduct.price}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS: "Scan Again" & "Continue to Checkout" */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50">
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 text-[#ff5c01]" />
                  <span>{isBn ? 'আরেকটি স্ক্যান করুন' : 'Scan Again'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isBn ? 'চেকআউটে যান' : 'Done / Checkout'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. ERROR STATE BANNER & ACTION */}
          {scannerError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                    {isBn ? 'পণ্য শনাক্তকরণ ব্যর্থ' : 'Product Scan Error'}
                  </h4>
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {scannerError}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পুনরায় স্ক্যান করুন' : 'Scan Again'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {/* 3. MANUAL / USB SCANNER GUN INPUT FIELD */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isBn ? 'ইউএসবি বারকোড গান বা ম্যানুয়াল কোড সার্চ:' : 'USB Barcode Gun / Manual Code Entry:'}
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) {
                  handleDecodedCode(manualCode.trim());
                  setManualCode('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={
                  isBn
                    ? 'কোড টাইপ করুন বা বারকোড গান দিয়ে স্ক্যান করুন...'
                    : 'Type code or scan with USB barcode scanner...'
                }
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-[#ff5c01]"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {isBn ? 'খুঁজুন' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleScanAgain}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#ff5c01] hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Scan Again / Restart Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'পুনরায় স্ক্যান (Scan Again)' : 'Scan Again'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-black shadow-md shadow-[#ff5c01]/20 transition-all cursor-pointer"
          >
            {isBn ? 'চেকআউট কার্টে যান' : 'Go to POS Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Product } from '../../types';
import { playBeepSound } from '../../utils/audio';
import { Camera, X, AlertCircle, CheckCircle, RefreshCw, QrCode } from 'lucide-react';

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
  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'pos-camera-qr-reader';

  const isBn = language === 'bn';

  const handleProcessCode = (scannedCode: string) => {
    const code = scannedCode.trim();
    if (!code) return;

    setScanError(null);
    setScanSuccessMsg(null);

    // Look for matching product by barcode, SKU, or ID
    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === code.toLowerCase() ||
        p.sku.toLowerCase() === code.toLowerCase() ||
        p.id.toLowerCase() === code.toLowerCase()
    );

    if (!matched) {
      setScanError(isBn ? 'এই QR code-এর জন্য কোনো প্রোডাক্ট পাওয়া যায়নি (Unknown Code)' : `Product not found for QR code: ${code}`);
      return;
    }

    // Check if product is already sold / out of stock
    if (matched.currentStock <= 0 || matched.status === 'out_of_stock') {
      setScanError(isBn ? 'ইতিমধ্যে বিক্রি হয়ে গেছে (Already Sold)' : `Already Sold - Product "${matched.name}" is out of stock!`);
      return;
    }

    // Check expiry
    const todayStr = new Date().toISOString().split('T')[0];
    if (matched.expiryDate && matched.expiryDate <= todayStr) {
      setScanError(isBn ? 'পণ্যটির মেয়াদ শেষ হয়ে গেছে (Expired Product)' : `Product "${matched.name}" has expired and cannot be sold.`);
      return;
    }

    // Success
    playBeepSound();
    onProductScanned(matched);
    setScanSuccessMsg(isBn ? `প্রোডাক্ট কার্টে যুক্ত হয়েছে: ${matched.name}` : `Added to POS cart: ${matched.name}`);
    
    // Auto-dismiss success notice after 2.5s
    setTimeout(() => {
      setScanSuccessMsg(null);
    }, 2500);
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let localScanner: Html5Qrcode | null = null;
    setIsScanning(true);

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerContainerId);
        localScanner = html5Qrcode;
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            if (isMounted) {
              handleProcessCode(decodedText);
            }
          },
          () => {
            // Quiet frame scanning error
          }
        );

        // If component unmounted while camera was initializing, stop immediately
        if (!isMounted) {
          if (html5Qrcode.isScanning) {
            await html5Qrcode.stop().catch(() => {});
          }
          try {
            html5Qrcode.clear();
          } catch (_) {}
        }
      } catch (err: any) {
        console.warn('Camera QR Scanner startup warning:', err);
        if (isMounted) {
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure container element is mounted in DOM
    const timer = setTimeout(() => {
      if (isMounted) {
        startScanner();
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);

      const scanner = localScanner || html5QrcodeRef.current;
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
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isBn ? 'ক্যামেরা / QR কোড স্ক্যানার' : 'Camera QR & Barcode Scanner'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isBn ? 'মোবাইল ক্যামেরা বা মেশিন দিয়ে স্ক্যান করুন' : 'Scan product QR or Barcode to select'}
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
        <div className="p-5 space-y-4">
          {/* Real Camera View Area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-[#ff5c01]/50 min-h-[240px] flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full min-h-[220px]" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/90 space-y-2">
                <Camera className="w-8 h-8 text-slate-500 animate-pulse" />
                <p className="text-xs text-slate-300 font-medium">
                  {isBn ? 'ক্যামেরা চালু হচ্ছে না বা অনুমতি নেই। নিচে ম্যানুয়ালি কোড লিখুন।' : 'Camera unavailable or permission denied. Enter QR code below.'}
                </p>
              </div>
            )}
          </div>

          {/* Feedback Banners */}
          {scanError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{scanError}</span>
            </div>
          )}

          {scanSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{scanSuccessMsg}</span>
            </div>
          )}

          {/* Manual / Machine Scanner Input fallback */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isBn ? 'মেশিন বা ম্যানুয়াল QR / বারকোড এন্ট্রি:' : 'Machine / Manual QR Code Input:'}
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
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {isBn ? 'যোগ করুন' : 'Add'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

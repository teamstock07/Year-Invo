import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  QrCode,
  Printer,
  Sparkles,
  Lock,
  CheckCircle,
  Tag,
  Copy,
  Sliders,
  RotateCcw,
  Barcode,
  Search,
  Check,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface GeneratedLabelConfig {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  copies: number;
  barcodeDataUrl: string;
  qrDataUrl: string;
  codeType: 'barcode' | 'qrcode' | 'both';
  showPrice: boolean;
  showSKU: boolean;
  showBrand: boolean;
}

export const BarcodeGeneratorView: React.FC = () => {
  const {
    user,
    setActiveTab,
    products,
    settings,
    t,
    generatedProductCodes,
    recordGeneratedCode,
    isCodeGenerated,
    getGeneratedQRCount,
    recordGeneratedQRCodes,
  } = useApp();
  const symbol = settings.currency || '৳';
  const plan = user?.subscriptionPlan || 'Free';
  const isPremiumPlan =
    plan === 'Premium' || plan === 'Business' || plan === 'Lifetime';

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [copiesInput, setCopiesInput] = useState<number>(1);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode' | 'both'>('both');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showSKU, setShowSKU] = useState<boolean>(true);
  const [showBrand, setShowBrand] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [generatedConfig, setGeneratedConfig] = useState<GeneratedLabelConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const totalProductsCount = products.length;
  const usedCodesCount = generatedProductCodes.length;
  const isLimitReached = usedCodesCount >= totalProductsCount;
  const isSelectedProductGenerated = selectedProduct ? isCodeGenerated(selectedProduct.id) : false;

  const currentStock = selectedProduct ? (selectedProduct.currentStock ?? (selectedProduct as any).stock ?? 0) : 0;
  const alreadyGenerated = selectedProduct ? getGeneratedQRCount(selectedProduct.id) : 0;
  const availableCapacity = Math.max(0, currentStock - alreadyGenerated);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Auto-select first product if non-selected
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const handleGenerate = async () => {
    if (!selectedProduct) {
      alert('Please select a product first.');
      return;
    }

    const numCopies = Math.max(1, Number(copiesInput) || 1);

    // Record POS / QR Code generation count for tracking
    recordGeneratedQRCodes(selectedProduct.id, numCopies);

    setIsGenerating(true);

    try {
      // 1. Generate Barcode PNG Data URL (CODE128 encoding product SKU / barcode)
      let barcodeDataUrl = '';
      const barcodeValue = selectedProduct.sku || selectedProduct.barcode || selectedProduct.id;

      if (codeType === 'barcode' || codeType === 'both') {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, barcodeValue, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
        barcodeDataUrl = canvas.toDataURL('image/png');
      }

      // 2. Generate QR Code PNG Data URL (encoding structured YearInvo payload with productId)
      let qrDataUrl = '';
      if (codeType === 'qrcode' || codeType === 'both') {
        const currentStoreId = user?.id || user?.brandName || '';
        const qrPayload = JSON.stringify({
          type: 'yearinvo_product',
          productId: selectedProduct.id,
          sku: selectedProduct.sku || '',
          barcode: selectedProduct.barcode || '',
          storeId: currentStoreId,
        });

        qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
      }

      setGeneratedConfig({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        barcode: barcodeValue,
        sellingPrice: selectedProduct.sellingPrice,
        copies: numCopies,
        barcodeDataUrl,
        qrDataUrl,
        codeType,
        showPrice,
        showSKU,
        showBrand,
      });
    } catch (err) {
      console.error('Error generating barcode/QR code:', err);
      alert('Failed to generate label images. Please check product details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!generatedConfig) {
      alert('Please click Generate to prepare labels before printing.');
      return;
    }
    window.print();
  };

  if (!isPremiumPlan) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#ff5c01]/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#ff5c01] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#ff5c01]/20">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5c01]/10 text-[#ff5c01] text-xs font-bold border border-[#ff5c01]/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Barcode & QR Printing Locked</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Barcode Printing & 2D QR Code Generation Requires Premium
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              You are currently on the <strong className="text-slate-800 dark:text-slate-200">{plan} Plan</strong>. 
              Bulk Code128 thermal sticker printing, A4 sticker sheet generation, and 2D QR Code labels are exclusive features of the <strong className="text-[#ff5c01]">Premium Plan</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
              👑 Premium Plan Features:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Bulk Printable Label Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Code128 Thermal & A4 Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dynamic 2D QR Code Printing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Custom Copy Count & Price Tags</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className="px-6 py-3 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white font-black text-xs shadow-lg shadow-[#ff5c01]/20 cursor-pointer transition-all"
            >
              🚀 Upgrade to Premium Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer transition-all"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Print CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-sticker-section, #printable-sticker-section * {
            visibility: visible !important;
          }
          #printable-sticker-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sticker-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 5mm !important;
          }
          .print-sticker-card {
            border: 1px dashed #666 !important;
            padding: 3mm !important;
            border-radius: 4px !important;
            text-align: center !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ff5c01]/10 text-[#ff5c01] rounded-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Barcode & QR Code Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Select a product, choose the number of sticker copies, generate, and print ready-to-stick price labels.
          </p>
        </div>

        {generatedConfig && (
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print {generatedConfig.copies} Labels</span>
          </button>
        )}
      </div>

      {/* Usage Limit Summary Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Product Codes Overview
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {usedCodesCount} / {totalProductsCount} Products with Generated Codes
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalProductsCount === 0
                ? 'No products found in store. Add products to enable code generation.'
                : 'You can generate and print barcode or QR code labels anytime for any product.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Controls Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 no-print">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sliders className="w-4 h-4 text-[#ff5c01]" />
          <span>Label Generation Settings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Product Selector */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Select Product
            </label>
            <div className="relative mb-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter products..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-[#ff5c01]"
              />
            </div>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
            >
              {filteredProducts.map((p) => {
                const hasCode = isCodeGenerated(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — SKU: {p.sku} ({symbol}{p.sellingPrice}) {hasCode ? '✓ [Code Generated]' : '⚪ [Not Generated]'}
                  </option>
                );
              })}
            </select>

            {selectedProduct && (
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Product:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedProduct.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SKU / Code:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedProduct.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price:</span>
                    <strong className="text-[#ff5c01]">{symbol}{selectedProduct.sellingPrice}</strong>
                  </div>
                </div>

                {/* Stock vs QR Capacity Card (Informational Only) */}
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/50 space-y-2 text-xs">
                  <div className="font-extrabold text-purple-900 dark:text-purple-200 flex items-center justify-between border-b border-purple-200/80 dark:border-purple-800/80 pb-1.5">
                    <span>Stock & QR Code Capacity</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold">
                      Current Stock: {currentStock}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] text-slate-500 block">Current Stock</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{currentStock}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] text-slate-500 block">Generated QR Codes</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">{alreadyGenerated}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] text-slate-500 block">Available QR Capacity</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">
                        {availableCapacity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status indicator badge */}
                {isSelectedProductGenerated ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>POS / QR code generated for this product. You can regenerate or print labels anytime.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                    <span>⚪ Ready to generate new code for this product ({usedCodesCount + 1} of {totalProductsCount} available).</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Number of Copies */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              2. Number of Copies
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="200"
                value={copiesInput}
                onChange={(e) => setCopiesInput(Number(e.target.value))}
                placeholder="e.g. 20"
                className="w-full px-4 py-2.5 text-sm font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Labels</span>
            </div>
            <div className="flex gap-1">
              {[6, 12, 20, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCopiesInput(num)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    copiesInput === num
                      ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Code Type & Options */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              3. Code Style & Display
            </label>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCodeType('barcode')}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  codeType === 'barcode'
                    ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Barcode Only
              </button>
              <button
                type="button"
                onClick={() => setCodeType('qrcode')}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  codeType === 'qrcode'
                    ? 'bg-white dark:bg-slate-900 text-[#ff5c01] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                QR Code Only
              </button>
              <button
                type="button"
                onClick={() => setCodeType('both')}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  codeType === 'both'
                    ? 'bg-[#ff5c01] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Both
              </button>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>Price</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSKU}
                  onChange={(e) => setShowSKU(e.target.checked)}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>SKU Code</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBrand}
                  onChange={(e) => setShowBrand(e.target.checked)}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>Store Name</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProduct}
            className="w-full sm:w-auto px-8 py-3 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#ff5c01] hover:bg-[#e05100] text-white shadow-lg shadow-[#ff5c01]/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isGenerating
                ? 'Generating Labels...'
                : codeType === 'qrcode'
                ? `Generate ${copiesInput} QR Code Label${copiesInput > 1 ? 's' : ''}`
                : codeType === 'barcode'
                ? `Generate ${copiesInput} Barcode Label${copiesInput > 1 ? 's' : ''}`
                : `Generate ${copiesInput} Printable Label${copiesInput > 1 ? 's' : ''}`}
            </span>
          </button>

          {generatedConfig && (
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Generated Labels ({generatedConfig.copies})</span>
            </button>
          )}
        </div>
      </div>

      {/* Generated Labels Preview Grid Section */}
      {generatedConfig ? (
        <div id="printable-sticker-section" className="space-y-4">
          <div className="flex items-center justify-between no-print px-1">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              Previewing {generatedConfig.copies} Generated Sticker Labels
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              A4 Sticker Sheet / Thermal Ready
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print-sticker-grid">
              {Array.from({ length: generatedConfig.copies }).map((_, index) => (
                <div
                  key={index}
                  className="print-sticker-card p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-xs flex flex-col items-center justify-between space-y-1.5 transition-all hover:scale-[1.02]"
                >
                  {generatedConfig.showBrand && (
                    <p className="font-extrabold text-[10px] text-slate-900 dark:text-slate-100 uppercase tracking-tight line-clamp-1 border-b border-slate-100 dark:border-slate-800 pb-1 w-full">
                      {getDisplayBrandName(settings.brandName)}
                    </p>
                  )}

                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                    {generatedConfig.productName}
                  </p>

                  {/* Render Barcode Image if selected */}
                  {(generatedConfig.codeType === 'barcode' || generatedConfig.codeType === 'both') &&
                    generatedConfig.barcodeDataUrl && (
                      <div className="w-full flex justify-center py-1 overflow-hidden">
                        <img
                          src={generatedConfig.barcodeDataUrl}
                          alt="Barcode"
                          className="max-h-12 object-contain"
                        />
                      </div>
                    )}

                  {/* Render QR Image if selected */}
                  {(generatedConfig.codeType === 'qrcode' || generatedConfig.codeType === 'both') &&
                    generatedConfig.qrDataUrl && (
                      <div className="w-full flex justify-center py-1">
                        <img
                          src={generatedConfig.qrDataUrl}
                          alt="QR Code"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    )}

                  {/* Footer Info Row */}
                  <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    {generatedConfig.showSKU && (
                      <span className="font-mono text-slate-500 font-bold">
                        #{generatedConfig.sku}
                      </span>
                    )}

                    {generatedConfig.showPrice && (
                      <span className="font-black text-xs text-[#ff5c01] ml-auto">
                        {symbol}{generatedConfig.sellingPrice}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 space-y-3 no-print">
          <div className="w-12 h-12 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center mx-auto">
            <Barcode className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
            No Labels Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose a product, enter the number of copies (e.g., 20), and click <strong>Generate</strong> to build printable sticker labels.
          </p>
        </div>
      )}
    </div>
  );
};

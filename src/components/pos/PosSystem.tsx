import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Sale } from '../../types';
import { QuickReceiptModal } from '../sales/QuickReceiptModal';
import { ReceiptModal } from './ReceiptModal';
import { QrScannerModal } from './QrScannerModal';
import { CustomerSelector } from '../common/CustomerSelector';
import { findProductByCode, findProductWithStoreCheck } from '../../utils/scanner';
import { playSuccessSound, playBeepSound } from '../../utils/audio';
import {
  ShoppingCart,
  Search,
  QrCode,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Tag,
  Boxes,
  Camera,
  X,
  User,
  AlertCircle,
  CheckSquare,
  Square,
  Lock,
  Monitor,
  Landmark,
  FileSpreadsheet,
  Scan,
  Volume2,
  Store,
} from 'lucide-react';

export const PosSystem: React.FC = () => {
  const {
    user,
    setActiveTab,
    products,
    categories,
    customers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkoutPOS,
    addCustomer,
    settings,
    language,
    t,
  } = useApp();

  const plan = user?.subscriptionPlan || 'Free';
  const isProOrPremium = plan === 'Pro' || plan === 'Tier2' || plan === 'Premium' || plan === 'Business' || plan === 'Lifetime';
  const isPremiumPlan = plan === 'Premium' || plan === 'Business' || plan === 'Lifetime';

  const symbol = settings.currency || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.taxRatePercent || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'bKash/Mobile' | 'Due/Credit'>('Cash');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showCustomerDisplay, setShowCustomerDisplay] = useState(false);
  const [drawerOpenMessage, setDrawerOpenMessage] = useState(false);
  const [isQrPaymentModalOpen, setIsQrPaymentModalOpen] = useState(false);

  // Multi-Select Products State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);

  // Quick Customer Add Modal State
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Audio Beep Sound helper
  const playBeepSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  // Hardware Barcode Scanner Keyboard Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside text input or textarea (unless Enter pressed in search)
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim()) {
          const code = barcodeBuffer.trim();
          const currentStoreId = user?.id || user?.brandName || '';
          const result = findProductWithStoreCheck(products, code, currentStoreId);

          if (result.error === 'different_store') {
            alert('Product not found in this store.');
          } else if (result.product) {
            const matchedProd = result.product;
            const todayStr = new Date().toISOString().split('T')[0];
            if (matchedProd.expiryDate && matchedProd.expiryDate <= todayStr) {
              alert(`Product "${matchedProd.name}" has expired and cannot be sold.`);
            } else if (matchedProd.currentStock <= 0 || matchedProd.status === 'out_of_stock') {
              alert(`Product "${matchedProd.name}" is out of stock!`);
            } else {
              addToCart(matchedProd);
              playBeepSound();
            }
          } else {
            alert(`Product not found for code: "${code}"`);
          }
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart, user]);

  // Filter and sort Products (Valid products first, expired products last)
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Rank 1: Valid products with expiry date (expiryDate > todayStr)
      // Rank 2: Products with no expiry date
      // Rank 3: Expired products (expiryDate <= todayStr) - ALWAYS at bottom
      const getRank = (p: Product) => {
        if (!p.expiryDate) return 2;
        if (p.expiryDate <= todayStr) return 3;
        return 1;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      if (rankA === 1 && a.expiryDate && b.expiryDate) {
        return a.expiryDate.localeCompare(b.expiryDate);
      }

      if (rankA === 3 && a.expiryDate && b.expiryDate) {
        return a.expiryDate.localeCompare(b.expiryDate);
      }

      return 0;
    });

  const toggleSelectProduct = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAddSelectedToCart = () => {
    if (selectedProductIds.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        if (prod.expiryDate && prod.expiryDate <= todayStr) {
          alert(`Product "${prod.name}" has expired and cannot be sold.`);
        } else {
          addToCart(prod);
        }
      }
    });
    setSelectedProductIds([]);
  };

  const toggleSelectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const calculatedDiscount = discountType === 'percent'
    ? Math.round((subtotal * discountValue) / 100)
    : Math.min(subtotal, discountValue);
  const taxAmount = Math.round((subtotal * taxPercent) / 100);
  const grandTotal = Math.max(0, subtotal - calculatedDiscount + taxAmount);

  // Calculate actual paid amount based on user input or payment method
  const numericPaid = paidAmountInput === '' ? (paymentMethod === 'Due/Credit' ? 0 : grandTotal) : Math.max(0, Number(paidAmountInput));
  const remainingDue = Math.max(0, grandTotal - numericPaid);
  const changeReturn = Math.max(0, numericPaid - grandTotal);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  // Sync default paid amount when grandTotal or paymentMethod changes
  useEffect(() => {
    if (paymentMethod === 'Due/Credit') {
      setPaidAmountInput('0');
    } else {
      setPaidAmountInput(grandTotal.toString());
    }
  }, [grandTotal, paymentMethod]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (isProcessing) return;
    if (cart.length === 0) {
      alert('Cart is empty! Add products to proceed.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const expiredItem = cart.find(
      (item) => item.product.expiryDate && item.product.expiryDate <= todayStr
    );
    if (expiredItem) {
      alert(`"${expiredItem.product.name}" has expired and cannot be sold. Please remove it from the cart.`);
      return;
    }

    if (remainingDue > 0 && !selectedCustomerId) {
      alert('A remaining due balance of ' + symbol + (remainingDue || 0).toLocaleString() + ' requires choosing a registered customer! Please select or add a customer.');
      return;
    }

    try {
      setIsProcessing(true);
      const sale = await checkoutPOS({
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomerObj ? selectedCustomerObj.name : 'Walk-in Customer',
        customerPhone: selectedCustomerObj ? selectedCustomerObj.phone : undefined,
        discount: calculatedDiscount,
        tax: taxPercent,
        paymentMethod,
        cashReceived: numericPaid,
      });

      setCompletedSale(sale);
      setIsReceiptOpen(true);
      setDiscountValue(0);
      setPaidAmountInput('');
      try {
        playSuccessSound();
      } catch (soundErr) {
        console.warn('Audio playback error (ignored):', soundErr);
      }
    } catch (err: any) {
      console.error('POS Checkout failed:', err);
      alert(`Checkout failed: ${err?.message || 'Database error occurred. Transaction was not saved.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const created = await addCustomer({ name: newCustName.trim(), phone: newCustPhone.trim() });
      if (created && created.id) {
        setSelectedCustomerId(created.id);
      }
      setNewCustName('');
      setNewCustPhone('');
      setIsAddCustModalOpen(false);
    } catch (err: any) {
      console.error('Failed to add customer:', err);
      alert(`Failed to add customer: ${err?.message || 'Database error occurred'}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-6rem)]">
      {/* Left Column: Product Search & Grid (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative">
        {/* Top Search, Barcode & Scanner Mode Trigger */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                // Instant code match check
                if (val.trim()) {
                  const currentStoreId = user?.id || user?.brandName || '';
                  const result = findProductWithStoreCheck(products, val, currentStoreId);
                  if (result.product) {
                    const matched = result.product;
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (
                      (!matched.expiryDate || matched.expiryDate > todayStr) &&
                      matched.currentStock > 0 &&
                      matched.status !== 'out_of_stock'
                    ) {
                      addToCart(matched);
                      playBeepSound();
                      setSearchQuery('');
                    }
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const currentStoreId = user?.id || user?.brandName || '';
                  const result = findProductWithStoreCheck(products, searchQuery, currentStoreId);
                  if (result.error === 'different_store') {
                    alert('Product not found in this store.');
                  } else if (result.product) {
                    const matched = result.product;
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (matched.expiryDate && matched.expiryDate <= todayStr) {
                      alert(`Product "${matched.name}" has expired and cannot be sold.`);
                    } else if (matched.currentStock <= 0 || matched.status === 'out_of_stock') {
                      alert(`Product "${matched.name}" is out of stock!`);
                    } else {
                      addToCart(matched);
                      playBeepSound();
                      setSearchQuery('');
                    }
                  } else {
                    alert(`Product not found for code: "${searchQuery.trim()}"`);
                  }
                }
              }}
              placeholder={t('searchPosPlaceholder') + " (or scan barcode)"}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100 font-medium"
            />
          </div>

          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              if (isMultiSelectMode) setSelectedProductIds([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMultiSelectMode || selectedProductIds.length > 0
                ? 'bg-[#ff5c01]/10 text-[#ff5c01] border-[#ff5c01]/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Multi-Select Mode"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Multi-Select</span>
            {selectedProductIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#ff5c01] text-white rounded-full text-[10px] font-black">
                {selectedProductIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!isPremiumPlan) {
                alert('Camera Barcode Scanner is a Premium Plan feature. Please upgrade your subscription.');
                return;
              }
              setIsScannerOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPremiumPlan
                ? 'bg-[#ff5c01] text-white hover:bg-[#e05100] shadow-md shadow-[#ff5c01]/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
            title={isPremiumPlan ? 'Scan Barcode / QR Code' : 'Barcode Scanner (Premium Feature)'}
          >
            {isPremiumPlan ? <Camera className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-500" />}
            <span className="hidden sm:inline">{t('scanBarcode')}</span>
          </button>

          <button
            onClick={() => setShowCustomerDisplay(!showCustomerDisplay)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showCustomerDisplay
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Customer Display Screen"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">Display</span>
          </button>
        </div>

        {/* Hardware Scanner Active Status Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Hardware Barcode Scanner Ready (USB / Bluetooth)</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <Volume2 className="w-3 h-3" />
            <span>Audio Beep On</span>
          </div>
        </div>

        {drawerOpenMessage && (
          <div className="p-2 mb-2 rounded-xl bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-between shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              <span>Cash Drawer Signal Triggered</span>
            </div>
            <span className="text-[10px] uppercase font-mono">READY</span>
          </div>
        )}

        {/* Multi-Select Action Sub-Bar */}
        {(isMultiSelectMode || selectedProductIds.length > 0) && (
          <div className="p-2.5 mb-3 bg-[#ff5c01]/10 dark:bg-[#ff5c01]/15 border border-[#ff5c01]/30 rounded-xl flex items-center justify-between gap-2 text-xs">
            <button
              onClick={toggleSelectAllFiltered}
              className="font-bold text-slate-800 dark:text-slate-200 hover:text-[#ff5c01] flex items-center gap-1 cursor-pointer"
            >
              {selectedProductIds.length === filteredProducts.length ? (
                <CheckSquare className="w-4 h-4 text-[#ff5c01]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredProducts.length})</span>
            </button>

            <button
              onClick={handleAddSelectedToCart}
              disabled={selectedProductIds.length === 0}
              className="px-3 py-1.5 bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-lg shadow-sm text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Selected ({selectedProductIds.length}) to Cart</span>
            </button>
          </div>
        )}

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#ff5c01] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* High-Density Supermarket Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 content-start items-start pr-1 custom-scrollbar min-h-80">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProductIds.includes(prod.id);
            const cartItem = cart.find((item) => item.product.id === prod.id);
            const todayStr = new Date().toISOString().split('T')[0];
            const isExpired = Boolean(prod.expiryDate && prod.expiryDate <= todayStr);

            return (
              <div
                key={prod.id}
                onClick={(e) => {
                  if (isExpired) {
                    alert('This product has expired and cannot be sold.');
                    return;
                  }
                  if (isMultiSelectMode) {
                    toggleSelectProduct(prod.id, e);
                  } else {
                    addToCart(prod);
                    playBeepSound();
                  }
                }}
                className={`group relative p-2.5 rounded-xl border transition-all flex flex-col justify-start hover:shadow-md h-auto ${
                  isExpired
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 cursor-not-allowed opacity-90'
                    : isSelected
                    ? 'border-[#ff5c01] bg-[#ff5c01]/5 ring-2 ring-[#ff5c01]/20 cursor-pointer'
                    : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 hover:border-[#ff5c01]/60 cursor-pointer'
                }`}
              >
                {/* Multi-Select Checkbox Badge */}
                <div
                  onClick={(e) => {
                    if (isExpired) {
                      e.stopPropagation();
                      alert('This product has expired and cannot be sold.');
                      return;
                    }
                    toggleSelectProduct(prod.id, e);
                  }}
                  className="absolute top-2 left-2 z-10 cursor-pointer"
                >
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-md bg-[#ff5c01] text-white flex items-center justify-center shadow-sm">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                  ) : isMultiSelectMode && !isExpired ? (
                    <div className="w-5 h-5 rounded-md bg-white/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs">
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ) : null}
                </div>

                {/* Status Badges: Expired vs In Cart */}
                {isExpired ? (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] uppercase shadow-sm tracking-wide">
                    EXPIRED
                  </div>
                ) : cartItem ? (
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] shadow-sm">
                    x{cartItem.quantity}
                  </div>
                ) : null}

                {/* Compact Product Image */}
                <div className="h-24 w-full rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 mb-2">
                  <img
                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=200'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight min-h-[2rem]">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{prod.barcode || prod.sku}</p>

                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span className={`font-black text-xs ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-[#ff5c01]'}`}>
                      {symbol} {prod.sellingPrice}
                    </span>
                    {!isExpired && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod);
                          playBeepSound();
                        }}
                        className="p-1 rounded-md bg-[#ff5c01]/10 hover:bg-[#ff5c01] text-[#ff5c01] hover:text-white transition-colors"
                        title="Add to Cart"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: POS Cart & Checkout Panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Customer Selector & Quick Add */}
        <div className="mb-1 pb-2 border-b border-slate-100 dark:border-slate-800">
          <CustomerSelector
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            onQuickAdd={() => setIsAddCustModalOpen(true)}
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 custom-scrollbar max-h-48">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-8">
              <ShoppingCart className="w-9 h-9 mb-2 stroke-1 opacity-40" />
              <p className="text-xs font-semibold">{t('emptyCart')}</p>
            </div>
          ) : (
            cart.map((item) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isItemExpired = Boolean(item.product.expiryDate && item.product.expiryDate <= todayStr);

              return (
                <div key={item.product.id} className={`py-2 px-1 flex items-center justify-between gap-3 text-xs ${isItemExpired ? 'bg-rose-50/80 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 my-1' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {item.product.name}
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {symbol} {item.product.sellingPrice} × {item.quantity} ={' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {symbol} {item.product.sellingPrice * item.quantity}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (isItemExpired) {
                          alert('This product has expired and cannot be sold.');
                          return;
                        }
                        updateCartQuantity(item.product.id, item.quantity + 1);
                      }}
                      disabled={isItemExpired}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Summary & Payment Options */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Quick Cash Tender Hotkeys */}
          {cart.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Quick Cash Tender
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Exact', amount: grandTotal },
                  { label: symbol + '100', amount: 100 },
                  { label: symbol + '500', amount: 500 },
                  { label: symbol + '1000', amount: 1000 },
                ].map((tender, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPaymentMethod('Cash');
                      setPaidAmountInput(tender.amount.toString());
                    }}
                    className="py-1 px-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#ff5c01] hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {tender.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Discount & Tax Row */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-[10px]">{t('discount')}</span>
                  <div className="flex items-center rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold cursor-pointer transition-colors ${
                        discountType === 'fixed'
                          ? 'bg-[#ff5c01] text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {symbol}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold cursor-pointer transition-colors ${
                        discountType === 'percent'
                          ? 'bg-[#ff5c01] text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-[#ff5c01]"
                  />
                  {discountType === 'percent' && discountValue > 0 && (
                    <span className="absolute right-2 top-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      (-{symbol}{calculatedDiscount})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold text-[10px] block mb-1">{t('tax')} (%)</span>
                <input
                  type="number"
                  min="0"
                  value={taxPercent || ''}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-[#ff5c01]"
                />
              </div>
            </div>
          </div>

          {/* Due / Credit & Paid Amount Section (Placed ABOVE Payment Method) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Amount Paid ({symbol}):
              </span>
              <input
                type="number"
                min="0"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                placeholder={grandTotal.toString()}
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-black text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Remaining Due (Credit):</span>
              <span className={`font-black text-xs ${remainingDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {symbol} {(remainingDue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Invoice Status:</span>
              <span className={`px-2 py-0.2 rounded-full font-black text-[10px] ${
                remainingDue > 0
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}>
                {remainingDue > 0 ? 'PARTIALLY PAID / DUE' : 'PAID IN FULL'}
              </span>
            </div>

            {changeReturn > 0 && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="font-medium text-slate-500">Change Return:</span>
                <span className="font-black text-amber-500">{symbol} {(changeReturn || 0).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Payment Method Radio Pills */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('paymentMethod')}</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'bKash/Mobile', label: 'QR / Mobile', icon: Smartphone },
                { id: 'Card', label: 'Card', icon: CreditCard },
                { id: 'Due/Credit', label: 'Due / Credit', icon: Tag },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(pm.id as any);
                      if (pm.id === 'bKash/Mobile') {
                        setIsQrPaymentModalOpen(true);
                      }
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="p-3 rounded-xl bg-slate-950 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">{t('grandTotal')}</span>
              <span className="text-xl font-black text-[#ff5c01]">
                {symbol} {(grandTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">Net Received</span>
              <span className="text-xs font-bold text-emerald-400">
                {symbol} {(numericPaid || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-3 bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-xs rounded-xl shadow-lg shadow-[#ff5c01]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Transaction...' : (t('checkout') || 'Complete POS Sale')}</span>
          </button>
        </div>
      </div>

      {/* Camera Barcode / QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        language={language}
        onProductScanned={(scannedProduct) => {
          addToCart(scannedProduct);
        }}
      />

      {/* QR Code Payment Modal */}
      {isQrPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#ff5c01]" />
                <span>{settings.paymentSettings?.qrProvider || 'QR'} Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settings.paymentSettings?.qrEnabled && (settings.paymentSettings?.qrImageUrl || settings.paymentSettings?.qrProvider) ? (
              <>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
                  {settings.paymentSettings?.qrImageUrl ? (
                    <img
                      src={settings.paymentSettings.qrImageUrl}
                      alt="Store QR Payment"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `${settings.paymentSettings?.qrProvider || 'PAYMENT'}-${settings.brandName || 'STORE'}-${grandTotal}`
                      )}`}
                      alt="Generated QR Payment"
                      className="w-44 h-44 mx-auto"
                    />
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white">
                    Scan to pay: <span className="text-[#ff5c01] text-base font-black">{symbol}{(grandTotal || 0).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-slate-300 font-semibold">
                    Provider: <span className="text-[#ff5c01]">{settings.paymentSettings?.qrProvider || 'bKash'}</span>
                  </p>
                  {settings.paymentSettings?.accountName && (
                    <p className="text-[11px] text-slate-300">Account: <strong>{settings.paymentSettings.accountName}</strong></p>
                  )}
                  {settings.paymentSettings?.accountNumber && (
                    <p className="text-[11px] font-mono text-slate-400">A/C No: {settings.paymentSettings.accountNumber}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsQrPaymentModalOpen(false)}
                  className="w-full py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/20 transition-all cursor-pointer"
                >
                  Confirm QR Payment Received
                </button>
              </>
            ) : (
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">QR payment is not configured yet.</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your store's QR code in Store Branding to accept QR payments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsQrPaymentModalOpen(false);
                    setActiveTab('branding');
                  }}
                  className="w-full py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Configure QR Payment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isAddCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Add Quick Customer</h3>
            <form onSubmit={handleAddQuickCustomer} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Customer Name *"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5c01]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Successful Popup Modal */}
      <QuickReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        mode="pos"
        onClose={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
          setSelectedCustomerId('');
          setSearchQuery('');
          setDiscountValue(0);
          setPaidAmountInput('');
        }}
      />
    </div>
  );
};

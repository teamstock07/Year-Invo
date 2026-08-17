import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale, Product } from '../../types';
import { QuickReceiptModal } from './QuickReceiptModal';
import { CustomerSelector } from '../common/CustomerSelector';
import { findProductWithStoreCheck } from '../../utils/scanner';
import { playSuccessSound, playBeepSound } from '../../utils/audio';
import {
  Zap,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Banknote,
  CreditCard,
  Tag,
  QrCode,
  Store,
  X,
  Package,
  ShoppingBag,
  Percent,
  Coins,
  History,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react';

interface QuickSaleViewProps {
  onOpenHistory?: () => void;
}

export const QuickSaleView: React.FC<QuickSaleViewProps> = ({ onOpenHistory }) => {
  const {
    user,
    products,
    customers,
    addCustomer,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkoutPOS,
    settings,
    setActiveTab,
    t,
  } = useApp();

  const symbol = settings.currency || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Due/Credit' | 'bKash/Mobile'>('Cash');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  
  // Clear Discount Mode: 'fixed' (Amount) vs 'percent' (Percentage)
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountInput, setDiscountInput] = useState<string>('');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filter and sort available products (Valid products first, expired products last)
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
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

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  
  const numericDiscountVal = discountInput === '' ? 0 : Math.max(0, Number(discountInput) || 0);
  const calculatedDiscount = discountType === 'percent'
    ? Math.round((subtotal * Math.min(100, numericDiscountVal)) / 100)
    : Math.min(subtotal, numericDiscountVal);
  
  const grandTotal = Math.max(0, subtotal - calculatedDiscount);
  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  const numericPaid =
    paidAmountInput === ''
      ? paymentMethod === 'Due/Credit'
        ? 0
        : grandTotal
      : Math.max(0, Number(paidAmountInput));
  const remainingDue = Math.max(0, grandTotal - numericPaid);

  // Sync default paid amount when grandTotal or paymentMethod changes
  useEffect(() => {
    if (paymentMethod === 'Due/Credit') {
      setPaidAmountInput('0');
    } else {
      setPaidAmountInput(grandTotal > 0 ? grandTotal.toString() : '');
    }
  }, [grandTotal, paymentMethod]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    console.log('[QUICK SALE] button clicked', { cartCount: cart.length, isProcessing });
    if (isProcessing) return;
    if (cart.length === 0) {
      alert(t('cartEmpty') || 'Cart is empty. Select products to proceed.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiredItem = cart.find(
      (item) => item.product.expiryDate && item.product.expiryDate <= today
    );
    if (expiredItem) {
      alert(`"${expiredItem.product.name}" ${t('expiredProductWarning') || 'has expired and cannot be sold.'}`);
      return;
    }

    if (remainingDue > 0 && !selectedCustomerId) {
      alert(t('dueRequiresCustomer') || `A remaining due balance requires selecting a customer.`);
      return;
    }

    console.log('[QUICK SALE] cart validated', {
      itemCount: cart.length,
      subtotal,
      discount: calculatedDiscount,
      grandTotal,
      paid: numericPaid,
      due: remainingDue,
    });

    try {
      setIsProcessing(true);
      const sale = await checkoutPOS({
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomerObj ? selectedCustomerObj.name : (t('walkInCustomer') || 'Walk-in Customer'),
        customerPhone: selectedCustomerObj ? selectedCustomerObj.phone : undefined,
        discount: calculatedDiscount,
        tax: 0,
        paymentMethod: paymentMethod === 'Due/Credit' ? 'Due/Credit' : paymentMethod,
        cashReceived: numericPaid,
      });

      console.log('[QUICK SALE] opening success modal', { invoiceNo: sale.invoiceNo, total: sale.total });
      setCompletedSale(sale);
      setIsReceiptOpen(true);
      setDiscountInput('');
      setPaidAmountInput('');
      try {
        playSuccessSound();
      } catch (soundErr) {
        console.warn('Audio playback error (ignored):', soundErr);
      }
    } catch (err: any) {
      console.error('[QUICK SALE] Checkout execution failed:', err);
      alert(`Failed to complete transaction: ${err?.message || 'Database error occurred. Transaction was not saved.'}`);
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
    <div className="space-y-4">
      {/* Top Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {t('quickSaleTitle') || 'Quick Sale'}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-normal">
                ({filteredProducts.length} {t('itemsAvailable') || 'items available'})
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('quickSaleSubtitle') || 'Fast checkout for counter sales and walk-in customers.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Products (Left) + Cart & Checkout (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Product Grid */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  const currentStoreId = user?.id || user?.brandName || '';
                  const result = findProductWithStoreCheck(products, val, currentStoreId);
                  if (result.product) {
                    const matched = result.product;
                    const today = new Date().toISOString().split('T')[0];
                    if (
                      (!matched.expiryDate || matched.expiryDate > today) &&
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
                    alert(t('productNotFoundStore') || 'Product not found in this store.');
                  } else if (result.product) {
                    const matched = result.product;
                    const today = new Date().toISOString().split('T')[0];
                    if (matched.expiryDate && matched.expiryDate <= today) {
                      alert(`"${matched.name}" ${t('expiredProductWarning') || 'has expired and cannot be sold.'}`);
                    } else if (matched.currentStock <= 0 || matched.status === 'out_of_stock') {
                      alert(`"${matched.name}" ${t('outOfStock') || 'is out of stock!'}`);
                    } else {
                      addToCart(matched);
                      playBeepSound();
                      setSearchQuery('');
                    }
                  }
                }
              }}
              placeholder={t('searchProductPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:border-[#ff5c01] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Product Cards Grid with Real Uploaded Images & Restored Controls */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-semibold">{t('noProductsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
              {filteredProducts.map((prod) => {
                const isExpired = Boolean(prod.expiryDate && prod.expiryDate <= todayStr);
                const isOutOfStock = prod.currentStock <= 0 || prod.status === 'out_of_stock';
                const cartItem = cart.find((i) => i.product.id === prod.id);
                const productImg = prod.image || prod.imageUrl;

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (isExpired || isOutOfStock) return;
                      addToCart(prod);
                      playBeepSound();
                    }}
                    className={`group relative p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[200px] sm:min-h-[220px] ${
                      isExpired
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 opacity-70 cursor-not-allowed'
                        : isOutOfStock
                        ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed'
                        : cartItem
                        ? 'bg-[#ff5c01]/5 border-[#ff5c01] ring-2 ring-[#ff5c01]/20 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200/90 dark:border-slate-700/80 hover:border-[#ff5c01]/60 hover:shadow-sm'
                    }`}
                  >
                    {/* Badge: Expired, Out of Stock, or Cart Quantity */}
                    {isExpired ? (
                      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase shadow-xs">
                        {t('expired')}
                      </span>
                    ) : isOutOfStock ? (
                      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-slate-600 text-white font-black text-[9px] uppercase shadow-xs">
                        {t('outOfStock')}
                      </span>
                    ) : cartItem ? (
                      <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-lg bg-[#ff5c01] text-white font-black text-[11px] shadow-sm">
                        {cartItem.quantity}
                      </span>
                    ) : null}

                    {/* 1. Uploaded Product Image or Clean Default Placeholder */}
                    <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center mb-2 shrink-0">
                      {productImg ? (
                        <img
                          src={productImg}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <Package className="w-7 h-7 mb-1 opacity-50 text-slate-400" />
                          <span className="text-[9px] font-semibold text-slate-400 line-clamp-1">
                            {prod.category || 'Product'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Product Name & SKU / Category */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
                        #{prod.sku || prod.barcode || 'N/A'}
                      </p>
                    </div>

                    {/* 3. Price & Available Stock Info */}
                    <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between w-full">
                      <span className="font-black text-xs sm:text-sm text-[#ff5c01]">
                        {symbol} {(prod.sellingPrice || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {t('stock')}: {prod.currentStock} {prod.unit || ''}
                      </span>
                    </div>

                    {/* 4. Interactive Card Actions: Quantity Controls when in cart / Quick Add Button */}
                    <div className="mt-2 pt-1.5 w-full flex items-center justify-between gap-1">
                      {cartItem ? (
                        <div
                          className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-[#ff5c01]/40 rounded-xl p-1 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              updateCartQuantity(prod.id, cartItem.quantity - 1);
                              playBeepSound();
                            }}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-xs text-slate-900 dark:text-white px-1">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={cartItem.quantity >= prod.currentStock}
                            onClick={() => {
                              if (cartItem.quantity < prod.currentStock) {
                                updateCartQuantity(prod.id, cartItem.quantity + 1);
                                playBeepSound();
                              }
                            }}
                            className="w-6 h-6 rounded-lg bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isExpired || isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExpired || isOutOfStock) return;
                            addToCart(prod);
                            playBeepSound();
                          }}
                          className="w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-[#ff5c01] hover:text-white dark:hover:bg-[#ff5c01] text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('add') || 'Add'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Sale Cart & Checkout Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#ff5c01]" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {t('cart')} ({cart.length})
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                {t('clearCart')}
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div>
            <CustomerSelector
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={setSelectedCustomerId}
              onQuickAdd={() => setIsAddCustModalOpen(true)}
            />
          </div>

          {cart.length === 0 ? (
            /* Clean Empty Cart State */
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {t('cartIsEmpty') || 'Cart is empty'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {t('selectProductToStartSale') || 'Select a product to start a sale.'}
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto custom-scrollbar pr-1 min-h-[60px]">
                {cart.map((item) => {
                  const isItemExpired = Boolean(
                    item.product.expiryDate && item.product.expiryDate <= todayStr
                  );

                  return (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.product.name}
                          </h5>
                          <p className="text-[10px] text-slate-400">
                            {symbol}{item.product.sellingPrice} × {item.quantity} ={' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {symbol}{((item.product.sellingPrice || 0) * item.quantity).toLocaleString()}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={isItemExpired}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1. Discount Section: Toggle [ ৳ ] [ % ] on left, Input [ 0 ] on right */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('discount') || 'Discount'}:
                    </span>
                    <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          discountType === 'fixed'
                            ? 'bg-[#ff5c01] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        title={t('amount') || 'Amount'}
                      >
                        {symbol}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          discountType === 'percent'
                            ? 'bg-[#ff5c01] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        title={t('percentage') || 'Percentage'}
                      >
                        %
                      </button>
                    </div>
                  </div>

                  {/* Discount Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discountInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setDiscountInput(val);
                        }
                      }}
                      placeholder="0"
                      className="w-24 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-right font-black text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01] shadow-2xs"
                    />
                  </div>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="flex justify-end text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                    - {symbol}{(calculatedDiscount || 0).toLocaleString()}
                  </div>
                )}
              </div>

              {/* 2. Amount Paid Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('amountPaid') || 'Amount Paid'} ({symbol}):
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={paidAmountInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setPaidAmountInput(val);
                      }
                    }}
                    placeholder={grandTotal > 0 ? grandTotal.toString() : '0'}
                    className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-right font-black text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01] shadow-2xs"
                  />
                </div>

                {/* 3. Remaining Due (Credit) */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {t('remainingDueCredit') || 'Remaining Due (Credit)'}:
                  </span>
                  <span
                    className={`font-black text-xs ${
                      remainingDue > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {symbol}{(remainingDue || 0).toLocaleString()}
                  </span>
                </div>

                {remainingDue > 0 && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{t('dueRequiresCustomer') || 'A remaining due balance requires selecting a customer.'}</span>
                  </div>
                )}
              </div>

              {/* 4. Invoice Status */}
              <div className="flex items-center justify-between text-xs py-2 px-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t('invoiceStatus') || 'Invoice Status'}:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase border ${
                    remainingDue === 0
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : numericPaid > 0
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {remainingDue === 0
                    ? (t('paidInFull') || 'PAID IN FULL')
                    : numericPaid > 0
                    ? (t('partiallyPaidDue') || 'PARTIALLY PAID / DUE')
                    : (t('unpaid') || 'UNPAID / DUE')}
                </span>
              </div>

              {/* 5. Payment Method Selector (2-Column Grid) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t('paymentMethod') || 'Payment Method'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Cash', label: t('paymentCash') || 'Cash', icon: Banknote },
                    { id: 'bKash/Mobile', label: t('paymentQrMobile') || 'QR / Mobile', icon: QrCode },
                    { id: 'Card', label: t('paymentCard') || 'Card', icon: CreditCard },
                    { id: 'Due/Credit', label: t('paymentDueCredit') || 'Due / Credit', icon: Tag },
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
                            setIsQrModalOpen(true);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Grand Total Bar & Clear Cart */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    {t('totalAmount') || 'TOTAL AMOUNT'}
                  </span>
                  <span className="text-xl font-black text-[#ff5c01]">
                    {symbol}{(grandTotal || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {calculatedDiscount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">{t('discount') || 'Discount'}</span>
                      <span className="text-xs font-bold text-emerald-400">
                        - {symbol}{(calculatedDiscount || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      {t('clearCart') || 'Clear Cart'}
                    </button>
                  )}
                </div>
              </div>

              {/* 7. Complete Quick Sale Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className="w-full py-3.5 bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#ff5c01]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isProcessing ? (t('processing') || 'Processing Transaction...') : (t('completeQuickSale') || 'Complete Quick Sale')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#ff5c01]" />
                <span>{settings.paymentSettings?.qrProvider || 'QR'} Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
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
                  onClick={() => setIsQrModalOpen(false)}
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
                    setIsQrModalOpen(false);
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
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {t('addCustomer')}
            </h3>
            <form onSubmit={handleAddQuickCustomer} className="space-y-3">
              <input
                type="text"
                required
                placeholder={`${t('customerName')} *`}
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#ff5c01]"
              />
              <input
                type="text"
                placeholder={t('mobileNumber')}
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#ff5c01]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Successful Quick Receipt Modal */}
      <QuickReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        mode="quicksale"
        onClose={() => {
          setIsReceiptOpen(false);
          setCompletedSale(null);
          setSelectedCustomerId('');
          setSearchQuery('');
          setDiscountInput('');
          setPaidAmountInput('');
        }}
      />
    </div>
  );
};

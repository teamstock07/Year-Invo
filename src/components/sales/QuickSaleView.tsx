import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { QuickReceiptModal } from './QuickReceiptModal';
import { playSuccessSound } from '../../utils/audio';
import {
  Zap,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  User,
  Banknote,
  CreditCard,
  Tag,
} from 'lucide-react';

export const QuickSaleView: React.FC = () => {
  const {
    products,
    customers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkoutPOS,
    settings,
  } = useApp();

  const symbol = settings.currency || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Due/Credit'>('Cash');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filter available products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const calculatedDiscount = discountType === 'percent'
    ? Math.round((subtotal * discountValue) / 100)
    : Math.min(subtotal, discountValue);
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
      setPaidAmountInput(grandTotal.toString());
    }
  }, [grandTotal, paymentMethod]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Select products to proceed with Quick Sale.');
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
      alert(`A remaining due balance of ${symbol}${remainingDue.toLocaleString()} requires choosing a customer.`);
      return;
    }

    const sale = checkoutPOS({
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomerObj ? selectedCustomerObj.name : 'Walk-in Customer',
      customerPhone: selectedCustomerObj ? selectedCustomerObj.phone : undefined,
      discount: calculatedDiscount,
      tax: 0,
      paymentMethod: paymentMethod === 'Due/Credit' ? 'Due/Credit' : paymentMethod,
      cashReceived: numericPaid,
    });

    playSuccessSound();
    setCompletedSale(sale);
    setIsReceiptOpen(true);
    setDiscountValue(0);
    setPaidAmountInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Fast Product Selector */}
      <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ff5c01]" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              Quick Item Picker
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredProducts.length} Items Available
          </span>
        </div>

        {/* Search Field */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item by name or code..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-[#ff5c01]"
          />
        </div>

        {/* Simplified Product List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
          {filteredProducts.map((prod) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isExpired = Boolean(prod.expiryDate && prod.expiryDate <= todayStr);
            const cartItem = cart.find((i) => i.product.id === prod.id);

            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => {
                  if (isExpired) {
                    alert('This product has expired and cannot be sold.');
                    return;
                  }
                  addToCart(prod);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                  isExpired
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 opacity-80 cursor-not-allowed'
                    : cartItem
                    ? 'bg-[#ff5c01]/5 border-[#ff5c01] ring-1 ring-[#ff5c01]/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-[#ff5c01]/60'
                }`}
              >
                {isExpired && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] uppercase">
                    EXPIRED
                  </span>
                )}
                {cartItem && !isExpired && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#ff5c01] text-white font-black text-[10px]">
                    x{cartItem.quantity}
                  </span>
                )}

                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{prod.sku}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="font-black text-xs text-[#ff5c01]">
                    {symbol} {prod.sellingPrice}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Stock: {prod.currentStock}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Quick Sale Cart & Payment Options */}
      <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Customer Choice */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <User className="w-4 h-4 text-[#ff5c01]" />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="flex-1 text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone || 'No Phone'})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 min-h-36 max-h-48 pr-1 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              Click products on the left to add them to Quick Sale.
            </div>
          ) : (
            cart.map((item) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isItemExpired = Boolean(item.product.expiryDate && item.product.expiryDate <= todayStr);

              return (
                <div key={item.product.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.product.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {symbol}{item.product.sellingPrice} × {item.quantity} ={' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {symbol}{item.product.sellingPrice * item.quantity}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={isItemExpired}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Discount Row */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">Discount:</span>
              <div className="flex items-center rounded-md bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
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

            <input
              type="number"
              min="0"
              value={discountValue || ''}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              placeholder="0"
              className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-black text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
            />
          </div>

          {discountType === 'percent' && discountValue > 0 && (
            <div className="text-right text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Discount Amount: -{symbol}{calculatedDiscount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Due / Credit & Paid Amount Box (Placed ABOVE Payment Method) */}
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
              {symbol} {remainingDue.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-500">Invoice Status:</span>
            <span className={`px-2 py-0.2 rounded-full font-black text-[10px] ${
              remainingDue > 0
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            }`}>
              {remainingDue > 0 ? 'PARTIALLY PAID / DUE' : 'PAID IN FULL'}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'Card', label: 'Card', icon: CreditCard },
                { id: 'Due/Credit', label: 'Due / Credit', icon: Tag },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grand Total & Checkout */}
          <div className="p-3 rounded-xl bg-slate-950 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Amount</span>
              <span className="text-xl font-black text-[#ff5c01]">
                {symbol} {grandTotal.toLocaleString()}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-400 underline"
              >
                Clear Cart
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-[#ff5c01] hover:bg-[#e05100] disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg shadow-[#ff5c01]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Quick Sale</span>
          </button>
        </div>
      </div>

      {/* Compact Quick Receipt Modal */}
      <QuickReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

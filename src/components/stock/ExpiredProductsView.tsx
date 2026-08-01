import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  AlertTriangle,
  Calendar,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Boxes,
  DollarSign,
  Edit,
  X,
  Check,
  FileSpreadsheet
} from 'lucide-react';

export const ExpiredProductsView: React.FC = () => {
  const { products, updateProduct, deleteProduct, adjustStock, settings, t, language } = useApp();
  const symbol = settings.currency || '৳';
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [showWriteOffConfirm, setShowWriteOffConfirm] = useState<Product | null>(null);
  const [showWriteOffAllConfirm, setShowWriteOffAllConfirm] = useState(false);

  // Determine current ISO date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if a product is strictly expired
  const isProductExpired = (p: Product): boolean => {
    if (!p.expiryDate) return false;
    // Compare date string YYYY-MM-DD directly
    return p.expiryDate < todayStr;
  };

  // Strictly filter products to ONLY show expired products
  const allExpiredProducts = products.filter(isProductExpired);

  // Apply search query & category filter
  const filteredExpiredProducts = allExpiredProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate metrics for expired products
  const totalExpiredItems = allExpiredProducts.length;
  const totalExpiredStockQty = allExpiredProducts.reduce((acc, p) => acc + p.currentStock, 0);
  const totalCostLoss = allExpiredProducts.reduce((acc, p) => acc + p.buyingPrice * p.currentStock, 0);
  const totalRetailLoss = allExpiredProducts.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);

  // Extract unique categories from expired products
  const categories = Array.from(new Set(allExpiredProducts.map((p) => p.category).filter(Boolean)));

  // Calculate days expired
  const getDaysExpired = (expiryDate: string): number => {
    const expDate = new Date(expiryDate);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - expDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Actions
  const handleSingleWriteOff = (prod: Product) => {
    if (prod.currentStock > 0) {
      adjustStock(prod.id, -prod.currentStock, 'Expired product write-off', 'damage_writeoff');
    } else {
      updateProduct(prod.id, { status: 'out_of_stock' });
    }
    setShowWriteOffConfirm(null);
  };

  const handleWriteOffAll = () => {
    allExpiredProducts.forEach((prod) => {
      if (prod.currentStock > 0) {
        adjustStock(prod.id, -prod.currentStock, 'Bulk expired product write-off', 'damage_writeoff');
      }
    });
    setShowWriteOffAllConfirm(false);
  };

  const handleUpdateExpiryDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !newExpiryDate) return;

    updateProduct(editingProduct.id, { expiryDate: newExpiryDate });
    setEditingProduct(null);
    setNewExpiryDate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t('navExpired') || 'Expired Products'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'কেবলমাত্র মেয়াদোত্তীর্ণ পণ্য সমূহের আলাদা তালিকা, ক্ষতি হিসাব ও রাইট-অফ ব্যবস্থাপনা।'
                  : 'Dedicated module for tracking, writing off, and managing expired products only.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action: Write Off All Expired Stock */}
        {totalExpiredStockQty > 0 && (
          <button
            onClick={() => setShowWriteOffAllConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            {isBn ? 'সকল মেয়াদোত্তীর্ণ পণ্য রাইট-অফ করুন' : 'Write Off All Expired Stock'}
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expired Products Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isBn ? 'মেয়াদোত্তীর্ণ আইটেম সংখ্যা' : 'Expired Item Types'}
            </p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {totalExpiredItems}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isBn ? 'কেবলমাত্র এক্সপায়ার্ড প্রোডাক্টস' : 'Only expired catalog items'}
            </span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expired Stock Units */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট মেয়াদোত্তীর্ণ স্টক সংখ্যা' : 'Expired Stock Units'}
            </p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalExpiredStockQty}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isBn ? 'অবশিষ্ট স্টক যা মেয়াদি' : 'Units remaining in stock'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-600 dark:text-amber-400">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Buying Price Cost Loss */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isBn ? 'ক্রয়মূল্য ভিত্তিক ক্ষতি (Loss)' : 'Cost Value Lost'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {symbol}{totalCostLoss.toLocaleString()}
            </h3>
            <span className="text-[10px] text-rose-500 font-medium">
              {isBn ? 'কেনা দাম অনুযায়ী মোট ক্ষতি' : 'Based on buying price'}
            </span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Retail Value at Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isBn ? 'বিক্রয়মূল্য ভিত্তিক মূল্য' : 'Retail Value Lost'}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {symbol}{totalRetailLoss.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isBn ? 'বিক্রি দাম অনুযায়ী সম্ভাব্য রেভিনিউ' : 'Unrealized retail revenue'}
            </span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'মেয়াদোত্তীর্ণ পণ্য খুঁজুন (নাম, SKU)...' : 'Search expired products by name or SKU...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Expired Products */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">{t('productName')}</th>
              <th className="p-4">{t('category')}</th>
              <th className="p-4 text-center">{t('currentStock')}</th>
              <th className="p-4 text-center">{t('expiryDate')}</th>
              <th className="p-4 text-center">{isBn ? 'ক্রয়মূল্য ক্ষতি' : 'Cost Value'}</th>
              <th className="p-4 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredExpiredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 px-4">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {isBn ? 'কোন মেয়াদোত্তীর্ণ পণ্য নেই!' : 'No Expired Products Found'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {allExpiredProducts.length === 0
                          ? isBn
                            ? 'আপনার ইনভেন্টরির সকল পণ্য মেয়াদের মধ্যে রয়েছে। কোন এক্সপায়ার্ড আইটেম নেই।'
                            : 'All products in your inventory are fresh and within valid expiry limits.'
                          : isBn
                          ? 'সার্চ বা ফিল্টারের সাথে কোন মেয়াদোত্তীর্ণ পণ্য মেলেনি।'
                          : 'No expired products match your search or filter selection.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpiredProducts.map((p) => {
                const daysExp = getDaysExpired(p.expiryDate || '');
                const costValue = p.buyingPrice * p.currentStock;

                return (
                  <tr key={p.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-semibold">
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-black">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          p.currentStock > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.expiryDate}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                          {daysExp === 0
                            ? isBn ? 'আজকে মেয়াদ শেষ' : 'Expired Today'
                            : isBn ? `${daysExp} দিন আগে মেয়াদ শেষ` : `Expired ${daysExp} day(s) ago`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-800 dark:text-slate-100">
                      {symbol}{costValue.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Write Off Stock */}
                        <button
                          onClick={() => setShowWriteOffConfirm(p)}
                          title={isBn ? 'স্টক জিরো/রাইট-অফ করুন' : 'Write Off Expired Stock'}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Edit Expiry Date */}
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setNewExpiryDate(p.expiryDate || '');
                          }}
                          title={isBn ? 'মেয়াদ বা ব্যাচ তারিখ নতুন করুন' : 'Update Expiry Date'}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Permanent Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(isBn ? 'আপনি কি এই এক্সপায়ার্ড পণ্যটি পার্মানেন্টলি ডিলিট করতে চান?' : 'Are you sure you want to permanently delete this expired product?')) {
                              deleteProduct(p.id);
                            }
                          }}
                          title={isBn ? 'প্রোডাক্ট ডিলিট করুন' : 'Delete Product Record'}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-xl transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Edit Expiry Date */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                {isBn ? 'মেয়াদোত্তীর্ণ তারিখ আপডেট / পরিবর্তন' : 'Update Expiry Date'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">{editingProduct.name}</span>
                <br />
                {isBn
                  ? 'নতুন মেয়াদের পণ্য বা ব্যাচ পাওয়ার ক্ষেত্রে তারিখ আপডেট করুন:'
                  : 'Update the expiry date if fresh inventory batch has arrived:'}
              </p>
            </div>

            <form onSubmit={handleUpdateExpiryDate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'নতুন মেয়াদের তারিখ' : 'New Expiry Date'}
                </label>
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isBn ? 'সেভ করুন' : 'Save Expiry Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Single Product Write Off Confirmation */}
      {showWriteOffConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isBn ? 'স্টক রাইট-অফ নিশ্চিত করুন' : 'Confirm Stock Write-Off'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? `আপনি কি "${showWriteOffConfirm.name}"-এর ${showWriteOffConfirm.currentStock} ${showWriteOffConfirm.unit} স্টক জিরো/রাইট-অফ করতে চান?`
                  : `Are you sure you want to write off all ${showWriteOffConfirm.currentStock} ${showWriteOffConfirm.unit} of "${showWriteOffConfirm.name}"?`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowWriteOffConfirm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => handleSingleWriteOff(showWriteOffConfirm)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                {isBn ? 'হ্যাঁ, রাইট-অফ করুন' : 'Confirm Write-Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Write Off All Expired Products Confirmation */}
      {showWriteOffAllConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isBn ? 'সকল মেয়াদোত্তীর্ণ পণ্য রাইট-অফ করুন' : 'Write Off All Expired Inventory'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBn
                  ? `মোট ${totalExpiredItems}টি মেয়াদোত্তীর্ণ পণ্যের ${totalExpiredStockQty} ইউনিট স্টক একবারে রাইট-অফ করা হবে। (মোট ক্ষতি: ${symbol}${totalCostLoss.toLocaleString()})`
                  : `This will write off ${totalExpiredStockQty} stock units across ${totalExpiredItems} expired products (Total Cost Loss: ${symbol}${totalCostLoss.toLocaleString()}).`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowWriteOffAllConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleWriteOffAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                {isBn ? 'হ্যাঁ, সব রাইট-অফ করুন' : 'Yes, Write Off All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductModal } from './ProductModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Edit,
  Trash2,
  AlertTriangle,
  QrCode,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const ProductList: React.FC = () => {
  const { products, categories, brands, deleteProduct, clearAllProducts, settings, setActiveTab, t, language } = useApp();
  const symbol = settings.currency || '৳';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Multi-select state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal deletion state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;

    let matchesStatus = true;
    if (statusFilter === 'low') matchesStatus = p.currentStock <= p.minStockAlert && p.currentStock > 0;
    else if (statusFilter === 'out') matchesStatus = p.currentStock === 0;
    else if (statusFilter === 'active') matchesStatus = p.currentStock > p.minStockAlert;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      selectedProductIds.forEach((id) => deleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  // Calculate Summary
  const totalCost = filteredProducts.reduce((sum, p) => sum + p.buyingPrice * p.currentStock, 0);
  const totalSelling = filteredProducts.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0);
  const totalExpectedProfit = totalSelling - totalCost;

  const handleExportCSV = () => {
    const headers = 'ID,Name,SKU,Barcode,Category,Brand,BuyingPrice,SellingPrice,Stock,Unit\n';
    const rows = filteredProducts
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.sku}","${p.barcode}","${p.category}","${p.brand}",${p.buyingPrice},${p.sellingPrice},${p.currentStock},"${p.unit}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-[#ff5c01]" />
            {t('navProducts')} ({products.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'পণ্য তালিকা নিয়ন্ত্রণ, নতুন আইটেম যোগ এবং স্টকের হিসাব রাখুন'
              : 'Manage product catalog, pricing, SKU codes, barcodes, and inventory alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {products.length > 0 && (
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'সব প্রোডাক্ট মুছুন' : 'Clear All Products'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#ff5c01]" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ff5c01] hover:bg-[#e05100] rounded-xl shadow-md shadow-[#ff5c01]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </button>
        </div>
      </div>

      {/* Calculated Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('totalCostValue')}</span>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {symbol} {totalCost.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('totalSalesValue')}</span>
          <p className="text-xl font-black text-[#ff5c01] mt-1">
            {symbol} {totalSelling.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('expectedProfit')}</span>
          <p className="text-xl font-black text-emerald-500 mt-1">
            {symbol} {totalExpectedProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchProduct')}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-[#ff5c01]"
          >
            <option value="All">{t('filterCategory')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-[#ff5c01]"
          >
            <option value="All">{t('allBrands')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-[#ff5c01]"
          >
            <option value="All">All Statuses</option>
            <option value="active">Normal Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedProductIds.length > 0 && (
        <div className="p-3 bg-[#ff5c01]/10 dark:bg-[#ff5c01]/15 border border-[#ff5c01]/30 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold">
          <span className="text-[#ff5c01] flex items-center gap-2">
            <span>Selected {selectedProductIds.length} of {filteredProducts.length} products</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('pos');
              }}
              className="px-3 py-1.5 bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sell Selected in POS
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-[#E8EEF2] dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-[#ff5c01] focus:ring-[#ff5c01] cursor-pointer"
                />
              </th>
              <th className="p-4">{t('productName')}</th>
              <th className="p-4">{t('sku')} / {t('barcode')}</th>
              <th className="p-4">{t('category')}</th>
              <th className="p-4 text-right">{t('buyingPrice')}</th>
              <th className="p-4 text-right">{t('sellingPrice')}</th>
              <th className="p-4 text-center">{t('currentStock')}</th>
              <th className="p-4 text-center">{t('status')}</th>
              <th className="p-4 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EEF2] dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400">
                  {language === 'bn' ? 'কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No products match your search query or filters.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#ff5c01]/5 dark:bg-[#ff5c01]/10'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="rounded border-slate-300 text-[#ff5c01] focus:ring-[#ff5c01] cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=200'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{p.name}</h4>
                          <span className="text-[10px] text-slate-400">{p.brand} • {p.unit}</span>
                        </div>
                      </div>
                    </td>
                  <td className="p-4">
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-xs font-bold block">{p.sku}</span>
                    <span className="font-mono text-[10px] text-slate-400 block">{p.barcode}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-600 dark:text-slate-400">
                    {symbol} {p.buyingPrice}
                  </td>
                  <td className="p-4 text-right font-bold text-[#ff5c01]">
                    {symbol} {p.sellingPrice}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-800 dark:text-slate-100">
                    {p.currentStock} {p.unit}
                  </td>
                  <td className="p-4 text-center">
                    {p.currentStock === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3" /> {t('outOfStock')}
                      </span>
                    ) : p.currentStock <= p.minStockAlert ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" /> {t('lowStock')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3" /> {t('inStock')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setActiveTab('barcode')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#ff5c01] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Generate Barcode"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#ff5c01] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t('edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* Delete Single Product Confirm Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title={language === 'bn' ? 'প্রোডাক্ট মুছে ফেলুন' : 'Delete Product'}
        message={
          language === 'bn'
            ? `আপনি কি "${productToDelete?.name}" প্রোডাক্টটি মুছে ফেলতে চান?`
            : `Are you sure you want to delete "${productToDelete?.name}"?`
        }
        confirmText={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
        cancelText={language === 'bn' ? 'বাতিল' : 'Cancel'}
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Clear All Products Confirm Modal */}
      <ConfirmModal
        isOpen={isClearAllOpen}
        title={language === 'bn' ? 'সকল প্রোডাক্ট মুছুন' : 'Clear All Products'}
        message={
          language === 'bn'
            ? 'আপনি কি নিশ্চিত যে আপনার দোকানের সকল টেস্ট প্রোডাক্ট মুছে ফেলতে চান? এই অ্যাকশনটি ফেরানো যাবে না।'
            : 'Are you sure you want to delete ALL products from your shop inventory? This action cannot be undone.'
        }
        confirmText={language === 'bn' ? 'হ্যাঁ, সব মুছুন' : 'Yes, Clear All'}
        cancelText={language === 'bn' ? 'বাতিল' : 'Cancel'}
        onConfirm={() => {
          clearAllProducts();
          setIsClearAllOpen(false);
        }}
        onCancel={() => setIsClearAllOpen(false)}
      />
    </div>
  );
};

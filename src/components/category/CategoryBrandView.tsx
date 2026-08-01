import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { Product } from '../../types';
import { Tags, Plus, Trash2, Package, Layers, ShieldAlert } from 'lucide-react';

export const CategoryBrandView: React.FC = () => {
  const { categories, brands, products, deleteProduct, addCategory, deleteCategory, addBrand, deleteBrand, settings, language } = useApp();
  const symbol = settings.currency || '৳';

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isRemoveOutOfStockOpen, setIsRemoveOutOfStockOpen] = useState(false);

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory(newCatName, newCatDesc);
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    addBrand(newBrandName);
    setNewBrandName('');
  };

  // Filter products by selected category or all
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tags className="w-7 h-7 text-[#ff5c01]" />
            {language === 'bn' ? 'ক্যাটাগরি ও প্রোডাক্ট তালিকা' : 'Categories & Products Catalog'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'ক্যাটাগরি ভিত্তিক প্রোডাক্ট ফিল্টার করুন এবং স্টকের হিসাব রাখুন'
              : 'Filter products by category & manage category/brand structures'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-[#E8EEF2] dark:border-slate-800 hover:border-[#ff5c01]'
            }`}
          >
            {language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'} ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-[#E8EEF2] dark:border-slate-800 hover:border-[#ff5c01]'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Remaining Products List by Category */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8EEF2] dark:border-slate-800 pb-3 flex-wrap gap-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#ff5c01]" />
            <span>
              {selectedCategory === 'all'
                ? (language === 'bn' ? 'সকল অবশিষ্ঠ প্রোডাক্ট তালিকা' : 'All Products Catalog')
                : `${selectedCategory} (${filteredProducts.length} Products)`}
            </span>
          </h3>

          {outOfStockProducts.length > 0 && (
            <button
              onClick={() => setIsRemoveOutOfStockOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অনুপলব্ধ (Stock 0) প্রোডাক্ট মুছে ফেলুন' : 'Remove Out-of-Stock Items'}</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">
              {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No products found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-[#E8EEF2] dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-[#ff5c01]/40 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=200'}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{prod.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {prod.category} • SKU: {prod.sku}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-[#ff5c01]">{symbol} {prod.sellingPrice}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        prod.currentStock > 10
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : prod.currentStock > 0
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        Stock: {prod.currentStock} {prod.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Functioning Delete Product Button */}
                <button
                  onClick={() => setProductToDelete(prod)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all flex-shrink-0 border border-transparent hover:border-rose-500/20 cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Add & List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>Product Categories ({categories.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Manage Hierarchy</span>
          </h3>

          <form onSubmit={handleAddCat} className="space-y-2">
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Organic Honey)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Add Category
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {categories.map((c) => {
              const count = products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
              return (
                <div key={c.id} className="py-2.5 flex items-center justify-between group">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.name}</h4>
                    <p className="text-[10px] text-slate-400">{c.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff5c01]/10 text-[#ff5c01]">
                      {count} items
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteCategory(c.id)}
                      title="Delete category"
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brands Add & List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8EEF2] dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>Manufacturer Brands ({brands.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Brand Partners</span>
          </h3>

          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Brand Name (e.g. Sundarban Organic)"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-[#E8EEF2] dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add Brand
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {brands.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{b.name}</h4>
                <button
                  type="button"
                  onClick={() => deleteBrand(b.id)}
                  title="Delete brand"
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Product Delete Modal */}
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

      {/* Remove Out of Stock Items Modal */}
      <ConfirmModal
        isOpen={isRemoveOutOfStockOpen}
        title={language === 'bn' ? 'অনুপলব্ধ প্রোডাক্ট মুছুন' : 'Remove Out-of-Stock Items'}
        message={
          language === 'bn'
            ? `আপনি কি নিশ্চিত যে স্টক ০ থাকা ${outOfStockProducts.length} টি প্রোডাক্ট মুছে ফেলতে চান?`
            : `Are you sure you want to delete all ${outOfStockProducts.length} out-of-stock products?`
        }
        confirmText={language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Remove'}
        cancelText={language === 'bn' ? 'বাতিল' : 'Cancel'}
        onConfirm={() => {
          outOfStockProducts.forEach(p => deleteProduct(p.id));
          setIsRemoveOutOfStockOpen(false);
        }}
        onCancel={() => setIsRemoveOutOfStockOpen(false)}
      />
    </div>
  );
};



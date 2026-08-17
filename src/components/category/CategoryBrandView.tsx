import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { Product } from '../../types';
import { Tags, Plus, Trash2, Package, Layers, ShieldAlert, ArrowLeft, Folder, ChevronRight, Store } from 'lucide-react';

export const CategoryBrandView: React.FC = () => {
  const { categories, brands, products, deleteProduct, addCategory, deleteCategory, addBrand, deleteBrand, settings, language } = useApp();
  const symbol = settings.currency || '৳';

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // selectedCategory null means initially showing Category List Grid
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isRemoveOutOfStockOpen, setIsRemoveOutOfStockOpen] = useState(false);

  const isBn = language === 'bn';

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
    setIsCreateModalOpen(false);
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    await addBrand(newBrandName.trim());
    setNewBrandName('');
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : [];

  const outOfStockProducts = products.filter((p) => p.currentStock === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tags className="w-7 h-7 text-[#ff5c01]" />
            {isBn ? 'প্রোডাক্ট ক্যাটাগরি তালিকা' : 'Product Categories Catalog'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'ক্যাটাগরিতে ক্লিক করে নির্দিষ্ট পণ্যের তালিকা দেখুন ও ম্যানেজ করুন'
              : 'Click any category to view its specific products list.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? '← ক্যাটাগরি তালিকায় ফিরে যান' : '← Back to All Categories'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Create Category'}</span>
              </button>
              {products.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/20 hover:bg-[#ff5c01] hover:text-white transition-all cursor-pointer"
                >
                  {isBn ? 'সকল প্রোডাক্ট দেখুন' : 'View All Products'} ({products.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* STEP 1: Main View when NO category selected -> Category Cards Grid */}
      {!selectedCategory ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#ff5c01]" />
              <span>{isBn ? 'ক্যাটাগরি সমূহ' : 'Categories'} ({categories.length})</span>
            </h3>
            {categories.length > 0 && (
              <span className="text-xs text-slate-400">
                {isBn ? 'প্রোডাক্ট দেখতে ক্যাটাগরিতে ক্লিক করুন' : 'Click a category card to see its products'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center">
                  <Folder className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {isBn ? 'কোনো ক্যাটাগরি তৈরি করা হয়নি' : 'No Categories Created'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {isBn
                      ? 'আপনার স্টোরের জন্য নতুন ক্যাটাগরি তৈরি করতে "Create Category" বাটনে ক্লিক করুন।'
                      : 'You have not created any categories yet. Create your first category using the button below.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isBn ? 'ক্যাটাগরি তৈরি করুন' : 'Create Category'}</span>
                </button>
              </div>
            ) : (
              categories.map((cat) => {
                const catProducts = products.filter(
                  (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                );

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="p-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-[#ff5c01]/50 rounded-2xl shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#ff5c01] transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                            {cat.description || (isBn ? 'ক্যাটাগরি আইটেম সমূহ' : 'Category items catalog')}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ff5c01] transition-colors" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {catProducts.length} {isBn ? 'টি প্রোডাক্ট' : 'Products'}
                      </span>
                      <span className="text-xs font-bold text-[#ff5c01] flex items-center gap-1 group-hover:underline">
                        {isBn ? 'প্রোডাক্টস দেখুন' : 'View Products'} →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* STEP 2: When Category IS selected -> Display ONLY Products of that Category */
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#ff5c01]" />
                <span>
                  {selectedCategory === 'all'
                    ? (isBn ? 'সকল প্রোডাক্ট তালিকা' : 'All Products Catalog')
                    : `${selectedCategory} (${filteredProducts.length} ${isBn ? 'টি প্রোডাক্ট' : 'Products'})`}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? 'শুধু বাছাইকৃত ক্যাটাগরির প্রোডাক্ট দেখানো হচ্ছে' : 'Displaying products belonging exclusively to this category.'}
              </p>
            </div>

            {outOfStockProducts.length > 0 && (
              <button
                onClick={() => setIsRemoveOutOfStockOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isBn ? 'অনুপলব্ধ (Stock 0) প্রোডাক্ট মুছে ফেলুন' : 'Remove Out-of-Stock Items'}</span>
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-medium">
                {isBn ? 'এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No products found in this category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-[#ff5c01]/40 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=200'}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
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

                  <button
                    onClick={() => setProductToDelete(prod)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all shrink-0 border border-transparent hover:border-rose-500/20 cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Management Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Add & List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>{isBn ? 'ক্যাটাগরি সংযোজন ও ব্যবস্থাপনা' : 'Product Categories (' + categories.length + ')'}</span>
            <span className="text-[10px] text-slate-400 font-normal">Manage Hierarchy</span>
          </h3>

          <form onSubmit={handleAddCat} className="space-y-2">
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Organic Honey)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'ক্যাটাগরি যোগ করুন' : 'Add Category'}
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
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
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
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>{isBn ? 'ব্র্যান্ড সমূহের তালিকা' : 'Manufacturer Brands (' + brands.length + ')'}</span>
            <span className="text-[10px] text-slate-400 font-normal">Brand Partners</span>
          </h3>

          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Brand Name (e.g. Sundarban Organic)"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isBn ? 'ব্র্যান্ড যোগ করুন' : 'Add Brand'}
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {brands.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between group">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{b.name}</h4>
                <button
                  type="button"
                  onClick={() => deleteBrand(b.id)}
                  title="Delete brand"
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title={isBn ? 'প্রোডাক্ট মুছে ফেলার নিশ্চিতকরণ' : 'Delete Product Confirmation'}
        message={
          isBn
            ? `আপনি কি নিশ্চিত যে "${productToDelete?.name}" প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান?`
            : `Are you sure you want to delete product "${productToDelete?.name}"? This action cannot be undone.`
        }
        confirmText={isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Delete Product'}
        cancelText={isBn ? 'বাতিল' : 'Cancel'}
        type="danger"
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Delete Out of Stock Modal */}
      <ConfirmModal
        isOpen={isRemoveOutOfStockOpen}
        title={isBn ? 'অনুপলব্ধ (Stock 0) সকল পণ্য মুছে ফেলুন' : 'Remove Out-of-Stock Items'}
        message={
          isBn
            ? `মোট ${outOfStockProducts.length} টি স্টোক শূন্য (Stock = 0) পণ্য ডিলিট করা হবে। আপনি কি নিশ্চিত?`
            : `This will permanently delete ${outOfStockProducts.length} products that have zero remaining stock. Proceed?`
        }
        confirmText={isBn ? 'ডিলিট সম্পন্ন করুন' : 'Remove Out-of-Stock'}
        cancelText={isBn ? 'বাতিল' : 'Cancel'}
        type="danger"
        onConfirm={() => {
          outOfStockProducts.forEach((p) => deleteProduct(p.id));
          setIsRemoveOutOfStockOpen(false);
        }}
        onCancel={() => setIsRemoveOutOfStockOpen(false)}
      />

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center font-bold">
                  <Folder className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {isBn ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCat} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'ক্যাটাগরির নাম' : 'Category Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: গ্রোসারি, ইলেকট্রনিক্স ইত্যাদি' : 'e.g. Organic Honey, Electronics, Clothing'}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'সংক্ষিপ্ত বিবরণ লিখুন' : 'Short notes or category description'}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#ff5c01] hover:bg-[#e05100] disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isBn ? 'ক্যাটাগরি সেভ করুন' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

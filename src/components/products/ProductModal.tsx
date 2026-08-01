import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Upload, Sparkles, Image as ImageIcon, Check, Plus, FolderTree } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const PRESET_GALLERY_IMAGES = [
  { label: 'Honey & Organic', url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=400' },
  { label: 'Mustard Oil / Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
  { label: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400' },
  { label: 'Dairy & Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400' },
  { label: 'Tea & Coffee', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400' },
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
  { label: 'Fashion Clothing', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400' },
  { label: 'Cosmetics', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400' },
  { label: 'Bakery & Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { label: 'Medicine & Healthcare', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' },
  { label: 'Spices & Curry Powder', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Tools & Hardware', url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400' },
];

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, addCategory, addBrand, categories, brands, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: categories[0]?.name || 'General',
    secondaryCategories: [] as string[],
    brand: brands[0]?.name || 'Generic',
    buyingPrice: 100,
    sellingPrice: 150,
    currentStock: 20,
    minStockAlert: 5,
    unit: 'Piece',
    expiryDate: '',
    description: '',
    imageUrl: PRESET_GALLERY_IMAGES[0].url,
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showMultiCategory, setShowMultiCategory] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode,
        category: productToEdit.category,
        secondaryCategories: (productToEdit as any).secondaryCategories || [],
        brand: productToEdit.brand,
        buyingPrice: productToEdit.buyingPrice,
        sellingPrice: productToEdit.sellingPrice,
        currentStock: productToEdit.currentStock,
        minStockAlert: productToEdit.minStockAlert,
        unit: productToEdit.unit,
        expiryDate: productToEdit.expiryDate || '',
        description: productToEdit.description || '',
        imageUrl: productToEdit.imageUrl || PRESET_GALLERY_IMAGES[0].url,
      });
    } else {
      const randomSku = `SKU-${Math.floor(10000 + Math.random() * 90000)}`;
      const randomBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;
      setFormData({
        name: '',
        sku: randomSku,
        barcode: randomBarcode,
        category: categories[0]?.name || 'Grocery & Staples',
        secondaryCategories: [],
        brand: brands[0]?.name || 'Generic',
        buyingPrice: 100,
        sellingPrice: 150,
        currentStock: 25,
        minStockAlert: 5,
        unit: 'Piece',
        expiryDate: '',
        description: '',
        imageUrl: PRESET_GALLERY_IMAGES[0].url,
      });
    }
  }, [productToEdit, isOpen, categories, brands]);

  if (!isOpen) return null;

  const totalCost = formData.currentStock * formData.buyingPrice;
  const totalValue = formData.currentStock * formData.sellingPrice;
  const expectedProfit = totalValue - totalCost;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
          setIsGalleryOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSecondaryCategory = (catName: string) => {
    setFormData((prev) => {
      const exists = prev.secondaryCategories.includes(catName);
      if (exists) {
        return { ...prev, secondaryCategories: prev.secondaryCategories.filter((c) => c !== catName) };
      } else {
        return { ...prev, secondaryCategories: [...prev.secondaryCategories, catName] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Product name is required!');
      return;
    }

    if (formData.category) {
      addCategory(formData.category);
    }
    if (formData.brand) {
      addBrand(formData.brand);
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {productToEdit ? t('editProduct') : t('addProduct')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Automatic Calculation Highlight */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#ff5c01]/10 border border-[#ff5c01]/20 text-center">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">{t('totalCostValue')}</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{symbol} {totalCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">{t('totalSalesValue')}</span>
              <span className="text-sm font-black text-[#ff5c01]">{symbol} {totalValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">{t('expectedProfit')}</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{symbol} {expectedProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('productName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pure Wild Honey 500g"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100"
              />
            </div>



            {/* Category Selection & Custom Category Writing */}
            <div className="sm:col-span-2 space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-[#ff5c01]" />
                  Product Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowMultiCategory(!showMultiCategory)}
                  className="text-[11px] font-bold text-[#ff5c01] hover:underline cursor-pointer"
                >
                  {showMultiCategory ? 'Hide Extra Categories' : '+ Add Multiple Categories'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Select Existing Category:</span>
                  <select
                    value={categories.some((c) => c.name === formData.category) ? formData.category : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="custom">+ Write Custom Category...</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Or Write / Edit Category Name:</span>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Type category name..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                  />
                </div>
              </div>

              {showMultiCategory && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Select Additional Secondary Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => {
                      if (c.name === formData.category) return null; // skip primary
                      const isSelected = formData.secondaryCategories.includes(c.name);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleSecondaryCategory(c.name)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Selection & Custom Writing */}
            <div className="sm:col-span-2 space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Manufacturing Brand
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Select Manufacturer Brand:</span>
                  <select
                    value={brands.some((b) => b.name === formData.brand) ? formData.brand : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setFormData({ ...formData, brand: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="custom">+ Write Custom Brand...</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Or Write / Edit Brand Name:</span>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Type brand name..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('buyingPrice')} ({symbol})</label>
              <input
                type="number"
                min="0"
                value={formData.buyingPrice}
                onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('sellingPrice')} ({symbol})</label>
              <input
                type="number"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('currentStock')}</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('minStockAlert')}</label>
              <input
                type="number"
                min="0"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('unit')}</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
              >
                <option value="Piece">Piece (পিস)</option>
                <option value="KG">KG (কেজি)</option>
                <option value="Liter">Liter (লিটার)</option>
                <option value="Box">Box (বক্স)</option>
                <option value="Packet">Packet (প্যাকেট)</option>
                <option value="Jar">Jar (জার)</option>
                <option value="Bag">Bag (বস্তা)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('expiryDate')}</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Product Image Gallery Selector */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Image (Gallery Picker / Upload)
              </label>

              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400 absolute inset-0 m-auto" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#ff5c01] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#e05100] cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Select Photo from Gallery
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-700">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Upload from Device
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('description')}</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-md shadow-[#ff5c01]/30 transition-all cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Gallery Selector Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Select Product Photo Gallery</h3>
              </div>
              <button onClick={() => setIsGalleryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose from our curated photo library or upload custom images from your gallery:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
              {PRESET_GALLERY_IMAGES.map((img, idx) => {
                const isSelected = formData.imageUrl === img.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageUrl: img.url }));
                      setIsGalleryOpen(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square group transition-all cursor-pointer ${
                      isSelected ? 'border-[#ff5c01] ring-2 ring-[#ff5c01]/30 scale-95' : 'border-slate-200 dark:border-slate-800 hover:border-[#ff5c01]/60'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-white text-center truncate">
                      {img.label}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#ff5c01] text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-[#ff5c01] hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo from Device...
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


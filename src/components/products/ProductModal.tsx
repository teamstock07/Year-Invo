import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { isSkuUnique, generateUniqueSku, generateUniqueBarcode } from '../../utils/scanner';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Plus,
  FolderTree,
  RefreshCw,
  Trash2,
  Tag,
  Building2,
  DollarSign,
  Layers,
  Calendar,
  FileText,
} from 'lucide-react';

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
  const { addProduct, updateProduct, addCategory, addBrand, categories, brands, settings, t, products } = useApp();
  const symbol = settings.currency || '৳';

  // Controlled Form State with String Inputs for Numbers to avoid "0100" / "1000" typing bug
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [showBrand, setShowBrand] = useState(false);
  const [brand, setBrand] = useState('');
  const [buyingPriceInput, setBuyingPriceInput] = useState('100');
  const [sellingPriceInput, setSellingPriceInput] = useState('150');
  const [currentStockInput, setCurrentStockInput] = useState('25');
  const [minStockAlertInput, setMinStockAlertInput] = useState('5');
  const [unit, setUnit] = useState('Piece');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Modals inside Product Form
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setBarcode(productToEdit.barcode || productToEdit.sku || '');
      setCategory(productToEdit.category || (categories[0]?.name || 'General'));
      const hasBrand = Boolean(productToEdit.brand && productToEdit.brand !== 'Generic' && productToEdit.brand.trim() !== '');
      setShowBrand(hasBrand);
      setBrand(productToEdit.brand || '');
      setBuyingPriceInput(productToEdit.buyingPrice !== undefined ? String(productToEdit.buyingPrice) : '0');
      setSellingPriceInput(productToEdit.sellingPrice !== undefined ? String(productToEdit.sellingPrice) : '0');
      setCurrentStockInput(productToEdit.currentStock !== undefined ? String(productToEdit.currentStock) : '0');
      setMinStockAlertInput(productToEdit.minStockAlert !== undefined ? String(productToEdit.minStockAlert) : '5');
      setUnit(productToEdit.unit || 'Piece');
      setExpiryDate(productToEdit.expiryDate || '');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setFormError('');
    } else if (isOpen) {
      const stableSku = generateUniqueSku(products);
      const stableBarcode = generateUniqueBarcode(products);
      setName('');
      setSku(stableSku);
      setBarcode(stableBarcode);
      setCategory(categories[0]?.name || 'Grocery & Staples');
      setShowBrand(false);
      setBrand('');
      setBuyingPriceInput('100');
      setSellingPriceInput('150');
      setCurrentStockInput('25');
      setMinStockAlertInput('5');
      setUnit('Piece');
      setExpiryDate('');
      setDescription('');
      setImageUrl(PRESET_GALLERY_IMAGES[0]?.url || '');
      setFormError('');
    }
  }, [productToEdit, isOpen, categories, products]);

  if (!isOpen) return null;

  // Realtime calculated values
  const numericBuyingPrice = buyingPriceInput === '' ? 0 : Number(buyingPriceInput) || 0;
  const numericSellingPrice = sellingPriceInput === '' ? 0 : Number(sellingPriceInput) || 0;
  const numericStock = currentStockInput === '' ? 0 : Number(currentStockInput) || 0;
  const totalCost = numericStock * numericBuyingPrice;
  const totalSales = numericStock * numericSellingPrice;
  const expectedProfit = totalSales - totalCost;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setIsGalleryOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setCategory(trimmed);
    setNewCategoryInput('');
    setIsCreateCategoryModalOpen(false);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    addBrand(trimmed);
    setBrand(trimmed);
    setNewBrandInput('');
    setIsCreateBrandModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError(t('productNameRequired') || 'Product name is required.');
      return;
    }

    let finalSku = sku.trim();
    if (!finalSku) {
      finalSku = generateUniqueSku(products);
    }

    if (!isSkuUnique(products, finalSku, productToEdit?.id)) {
      setFormError(`The SKU "${finalSku}" is already assigned to another product. Please use a unique SKU.`);
      return;
    }

    let finalBarcode = barcode.trim();
    if (!finalBarcode) {
      finalBarcode = finalSku;
    }

    const finalCategory = category.trim() || 'General';
    const finalBrand = showBrand ? (brand.trim() || 'Generic') : 'Generic';

    const submissionData: Partial<Product> = {
      name: trimmedName,
      sku: finalSku,
      barcode: finalBarcode,
      category: finalCategory,
      brand: finalBrand,
      buyingPrice: buyingPriceInput === '' ? 0 : Math.max(0, Number(buyingPriceInput)),
      sellingPrice: sellingPriceInput === '' ? 0 : Math.max(0, Number(sellingPriceInput)),
      currentStock: currentStockInput === '' ? 0 : Math.max(0, Number(currentStockInput)),
      minStockAlert: minStockAlertInput === '' ? 0 : Math.max(0, Number(minStockAlertInput)),
      unit: unit || 'Piece',
      expiryDate: expiryDate || undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl || undefined,
    };

    if (finalCategory) {
      addCategory(finalCategory);
    }
    if (showBrand && finalBrand) {
      addBrand(finalBrand);
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, submissionData);
    } else {
      addProduct(submissionData as any);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                {productToEdit ? t('editProduct') : t('addProduct')}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                {t('storeBaseCurrencyNote')}: <strong className="text-slate-700 dark:text-slate-200">{symbol}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* 1. Product Image Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#ff5c01]" />
                {t('productImage')}
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('removeImage')}
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Image Preview Box */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[9px] font-medium">{t('productImagePreview')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#ff5c01]" />
                  {t('selectFromGallery')}
                </button>

                <label className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#ff5c01]/10 hover:bg-[#ff5c01]/20 text-[#ff5c01] text-xs font-bold rounded-xl border border-[#ff5c01]/30 shadow-xs transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {t('uploadFromDevice')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('productName')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Organic Honey Jar 500g"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
            />
          </div>

          {/* 3. Category Section (Select Category + Create Category) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-[#ff5c01]" />
                {t('category')} <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCreateCategoryModalOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#ff5c01] hover:text-[#e05100] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('createCategory')}
              </button>
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:border-[#ff5c01]"
              >
                <option value="" disabled>
                  -- {t('selectCategory')} --
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Manufacturer Brand Section with ON/OFF Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#ff5c01]" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('manufacturerBrand')}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setShowBrand(!showBrand)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  showBrand ? 'bg-[#ff5c01]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    showBrand ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Brand Select / Create (Shown only when toggle is ON) */}
            {showBrand && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t('selectBrand')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreateBrandModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#ff5c01] hover:text-[#e05100] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('createBrand')}
                  </button>
                </div>

                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:border-[#ff5c01]"
                >
                  <option value="">-- {t('selectBrand')} --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 5. Pricing, Stock & Calculation Section */}
          <div className="p-4 rounded-2xl bg-[#ff5c01]/5 border border-[#ff5c01]/20 space-y-4">
            
            {/* Live Financial Metrics Summary */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-center">
              <div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">
                  {t('totalCostValue')}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                  {symbol} {totalCost.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">
                  {t('totalSalesValue')}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#ff5c01]">
                  {symbol} {totalSales.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase">
                  {t('expectedProfit')}
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {symbol} {expectedProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Price and Stock Inputs (CRITICAL: Controlled Strings to prevent typing 0100 bug) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Purchase Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('purchasePrice')} ({symbol})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={buyingPriceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setBuyingPriceInput(val);
                    }
                  }}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('sellingPrice')} ({symbol})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sellingPriceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setSellingPriceInput(val);
                    }
                  }}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs font-black text-[#ff5c01] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01]"
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('currentStock')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={currentStockInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*$/.test(val)) {
                      setCurrentStockInput(val);
                    }
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                />
              </div>

              {/* Min Stock Alert */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('minStockAlert')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minStockAlertInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*$/.test(val)) {
                      setMinStockAlertInput(val);
                    }
                  }}
                  placeholder="5"
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#ff5c01]"
                />
              </div>
            </div>
          </div>

          {/* 6. Product Codes (SKU, Barcode) & Unit & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SKU Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('skuCode')}
                </label>
                <button
                  type="button"
                  onClick={() => setSku(generateUniqueSku(products))}
                  className="text-[10px] font-bold text-[#ff5c01] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Auto-generate SKU"
                >
                  <RefreshCw className="w-3 h-3" /> {t('autoSku')}
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-XXXXXX"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Barcode Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('barcodeCode')}
                </label>
                <button
                  type="button"
                  onClick={() => setBarcode(generateUniqueBarcode(products))}
                  className="text-[10px] font-bold text-[#ff5c01] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Auto-generate Barcode"
                >
                  <RefreshCw className="w-3 h-3" /> {t('autoBarcode')}
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="890123456789"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="Piece">{t('unitPiece')}</option>
                <option value="KG">{t('unitKg')}</option>
                <option value="Liter">{t('unitLiter')}</option>
                <option value="Box">{t('unitBox')}</option>
                <option value="Packet">{t('unitPacket')}</option>
                <option value="Jar">{t('unitJar')}</option>
                <option value="Bag">{t('unitBag')}</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('expiryDate')}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 resize-none font-medium"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white font-bold text-xs rounded-xl shadow-md shadow-[#ff5c01]/25 transition-all cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      {/* Preset Photo Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {t('selectFromGallery')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
              {PRESET_GALLERY_IMAGES.map((img, idx) => {
                const isSelected = imageUrl === img.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(img.url);
                      setIsGalleryOpen(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square group transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ff5c01] ring-2 ring-[#ff5c01]/30 scale-95'
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#ff5c01]/60'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[9px] font-bold text-white text-center truncate">
                      {img.label}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#ff5c01] text-white rounded-full p-0.5 shadow-sm">
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
                {t('uploadFromDevice')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Create Category Modal */}
      {isCreateCategoryModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {t('createCategory')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('newCategoryName')}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Dairy & Eggs"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {t('createCategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Create Brand Modal */}
      {isCreateBrandModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ff5c01]" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {t('createBrand')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('newBrandName')}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  placeholder="e.g. Nestlé, Unilever, Pran"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-[#ff5c01] text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateBrandModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {t('createBrand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

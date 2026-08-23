import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineProduct } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  ArrowUpDown,
  Upload,
  X,
} from 'lucide-react';

export const OnlineProductsView: React.FC = () => {
  const {
    onlineProducts,
    categories,
    createOnlineProduct,
    updateOnlineProduct,
    deleteOnlineProduct,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OnlineProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [buyingPrice, setBuyingPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>('');
  const [unit, setUnit] = useState('Piece');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const filteredProducts = useMemo(() => {
    const list = onlineProducts || [];
    return list.filter((prod) => {
      const matchSearch =
        (prod.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.sku && prod.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prod.barcode && prod.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prod.category && prod.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === 'All' || prod.category === selectedCategory;

      const matchStatus =
        statusFilter === 'All' || prod.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [onlineProducts, searchTerm, selectedCategory, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`ONL-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode('');
    setCategory((categories && categories[0]?.name) || 'General');
    setBuyingPrice('');
    setSellingPrice('');
    setStock(10);
    setMinStockAlert(3);
    setUnit('Piece');
    setDescription('');
    setImageUrl('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: OnlineProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setCategory(prod.category || 'General');
    setBuyingPrice(prod.buyingPrice || '');
    setSellingPrice(prod.sellingPrice);
    setStock(prod.stock);
    setMinStockAlert(prod.minStockAlert || 3);
    setUnit(prod.unit || 'Piece');
    setDescription(prod.description || '');
    setImageUrl(prod.imageUrl || '');
    setStatus(prod.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || sellingPrice === '') return;

    if (editingProduct) {
      await updateOnlineProduct({
        ...editingProduct,
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        category: category.trim() || 'General',
        buyingPrice: Number(buyingPrice) || 0,
        sellingPrice: Number(sellingPrice),
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        unit: unit.trim() || 'Piece',
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        status,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await createOnlineProduct({
        name: name.trim(),
        sku: sku.trim() || `ONL-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: barcode.trim() || undefined,
        category: category.trim() || 'General',
        buyingPrice: Number(buyingPrice) || 0,
        sellingPrice: Number(sellingPrice),
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        unit: unit.trim() || 'Piece',
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (typeof loadEvt.target?.result === 'string') {
        setImageUrl(loadEvt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t('onlineProductCatalog') || 'Online Product Catalog'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('onlineProductDesc') || 'Dedicated product catalog and independent inventory for your online store.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addOnlineProduct') || 'Add Online Product'}</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">{t('onlineProducts') || 'Online Products'}</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{onlineProducts.length} items</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">{t('stockAvailable') || 'Total Online Stock'}</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {onlineProducts.reduce((sum, p) => sum + (p.stock || 0), 0)} units
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">{t('lowStock') || 'Low Stock Alerts'}</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {onlineProducts.filter((p) => p.stock <= (p.minStockAlert || 3)).length} items
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchProduct') || 'Search online products by name, SKU, category...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">{t('all') || 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">{t('all') || 'All Statuses'}</option>
            <option value="active">{t('inStock') || 'Active'}</option>
            <option value="inactive">{t('outOfStock') || 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No online products found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your first online product to start accepting orders with independent online inventory.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addOnlineProduct') || 'Add Online Product'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Online Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-sm">
                            {prod.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {prod.sku && <span>SKU: {prod.sku}</span>}
                            {prod.barcode && <span>• Barcode: {prod.barcode}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {prod.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(prod.sellingPrice)}
                      </div>
                      {prod.buyingPrice > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Cost: {formatCurrency(prod.buyingPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-xs ${
                            prod.stock <= (prod.minStockAlert || 3)
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {prod.stock} {prod.unit || 'pcs'}
                        </span>
                        {prod.stock <= (prod.minStockAlert || 3) && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full ${
                          prod.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {prod.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>{editingProduct ? t('editOnlineProduct') || 'Edit Online Product' : t('addOnlineProduct') || 'Add Online Product'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Cotton Shirt"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. ONL-1001"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Online Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buying / Cost Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Online Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Piece"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="url"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="w-full px-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Features
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Online product specifications, warranty, or delivery notes..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
                >
                  {t('save') || 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('deleteOnlineProduct') || 'Delete Online Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this product from your online catalog? Existing orders will not be affected.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmId) {
                    await deleteOnlineProduct(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow"
              >
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

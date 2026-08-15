import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Boxes, AlertTriangle, CheckCircle, Calendar, Plus, Search } from 'lucide-react';

export const StockManagement: React.FC = () => {
  const { products, updateProduct, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddQty, setQuickAddQty] = useState<{ [id: string]: number }>({});

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'low') return matchesSearch && p.currentStock <= p.minStockAlert && p.currentStock > 0;
    if (filterType === 'out') return matchesSearch && p.currentStock === 0;
    return matchesSearch;
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStockUpdate = async (productId: string) => {
    const qtyToAdd = quickAddQty[productId] || 0;
    if (qtyToAdd <= 0) return;

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      try {
        setUpdatingId(productId);
        await updateProduct(productId, { currentStock: prod.currentStock + qtyToAdd });
        setQuickAddQty((prev) => ({ ...prev, [productId]: 0 }));
      } catch (err: any) {
        console.error('Failed to update stock:', err);
        alert(`Stock update failed: ${err?.message || 'Database error occurred'}`);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            {t('stockManagement')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor low stock thresholds, out of stock items, and quick restock updates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'low', label: t('lowStockProducts') },
            { id: 'out', label: t('outOfStock') },
            { id: 'all', label: 'All Stock' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === f.id ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-4">{t('productName')}</th>
              <th className="p-4">{t('category')}</th>
              <th className="p-4 text-center">{t('currentStock')}</th>
              <th className="p-4 text-center">{t('minStockAlert')}</th>
              <th className="p-4 text-center">{t('expiryDate')}</th>
              <th className="p-4 text-center">Quick Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No products found for selected filter condition.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 text-center font-black">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        p.currentStock === 0
                          ? 'bg-rose-100 text-rose-700'
                          : p.currentStock <= p.minStockAlert
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-500">
                    {p.minStockAlert} {p.unit}
                  </td>
                  <td className="p-4 text-center font-mono">
                    {p.expiryDate ? (
                      <span className={new Date(p.expiryDate) < new Date() ? 'text-rose-600 font-bold' : ''}>
                        {p.expiryDate}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={quickAddQty[p.id] || ''}
                        onChange={(e) => setQuickAddQty({ ...quickAddQty, [p.id]: Number(e.target.value) })}
                        placeholder="+ Qty"
                        className="w-16 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                      <button
                        onClick={() => handleStockUpdate(p.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

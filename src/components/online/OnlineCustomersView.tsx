import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineCustomer } from '../../types';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Mail,
} from 'lucide-react';

export const OnlineCustomersView: React.FC = () => {
  const {
    onlineCustomers,
    onlineOrders,
    createOnlineCustomer,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Inside City');

  const filteredCustomers = useMemo(() => {
    const list = onlineCustomers || [];
    return list.filter((cust) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        (cust.name || '').toLowerCase().includes(q) ||
        (cust.phone || '').includes(q) ||
        (cust.address && cust.address.toLowerCase().includes(q)) ||
        (cust.city && cust.city.toLowerCase().includes(q))
      );
    });
  }, [onlineCustomers, searchTerm]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    await createOnlineCustomer({
      name,
      phone,
      email,
      address,
      city,
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Online Customers Directory</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles, shipping addresses, order histories, and lifetime online spending.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Online Customer</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone number, address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No online customers found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Customers are automatically catalogued when online orders are created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Delivery Address</th>
                  <th className="px-4 py-3.5 text-center">Total Orders</th>
                  <th className="px-4 py-3.5 text-right">Lifetime Spent</th>
                  <th className="px-4 py-3.5 text-right">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {cust.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {cust.phone}
                        </span>
                        {cust.email && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {cust.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-[240px] truncate">
                      {cust.address || '—'} {cust.city ? `(${cust.city})` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400">
                        {cust.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cust.totalSpent)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-400 text-[11px]">
                      {cust.lastOrderDate ? formatDate(cust.lastOrderDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Online Customer
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711223344"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Police Station, District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

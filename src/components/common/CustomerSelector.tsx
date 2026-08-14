import React, { useState, useRef, useEffect } from 'react';
import { User, Search, Check, ChevronDown, UserPlus, X, Phone, Mail, MapPin } from 'lucide-react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';

interface CustomerSelectorProps {
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  onQuickAdd?: () => void;
  className?: string;
  placeholder?: string;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  onQuickAdd,
  className = '',
  placeholder = 'Select Customer',
}) => {
  const { customers, settings, t } = useApp();
  const symbol = settings.currency || '৳';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filter customers by search term
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSelectCustomer(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCustomer('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
            isOpen
              ? 'bg-white dark:bg-slate-900 border-[#ff5c01] shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`p-1.5 rounded-lg shrink-0 ${selectedCustomer ? 'bg-[#ff5c01] text-white' : 'bg-[#ff5c01]/10 dark:bg-[#ff5c01]/20 text-[#ff5c01]'}`}>
              <User className="w-3.5 h-3.5" />
            </div>

            {selectedCustomer ? (
              <div className="flex flex-col text-left truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs truncate">
                    {selectedCustomer.name}
                  </span>
                  {selectedCustomer.dueAmount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                      Due: {symbol}{selectedCustomer.dueAmount}
                    </span>
                  )}
                </div>
                {selectedCustomer.phone && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {selectedCustomer.phone}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {t('walkInCustomer') || 'Walk-in Customer'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t('defaultCounterSale') || 'Default Counter Sale'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {selectedCustomer && (
              <span
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Clear Selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-[#ff5c01]' : ''}`} />
          </div>
        </button>

        {/* Quick Add Customer Trigger Button */}
        {onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="p-2.5 bg-[#ff5c01]/10 hover:bg-[#ff5c01] text-[#ff5c01] hover:text-white rounded-xl transition-colors cursor-pointer shrink-0 border border-transparent dark:border-slate-800"
            title="Quick Add Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5c01] dark:focus:border-[#ff5c01]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Customer List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {/* Walk-in Customer Option */}
            <div
              onClick={() => handleSelect('')}
              className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                selectedCustomerId === ''
                  ? 'bg-[#ff5c01]/10 dark:bg-[#ff5c01]/20 text-[#ff5c01]'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Walk-in Customer
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Standard counter sale (No account linked)
                  </p>
                </div>
              </div>
              {selectedCustomerId === '' && (
                <Check className="w-4 h-4 text-[#ff5c01] shrink-0" />
              )}
            </div>

            {/* Customer List Items */}
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                const initial = c.name ? c.name[0].toUpperCase() : 'C';

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#ff5c01]/10 dark:bg-[#ff5c01]/20 border-l-4 border-[#ff5c01]'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#ff5c01] text-white border-[#ff5c01]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {c.name}
                          </span>
                          {c.dueAmount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 text-[9px] font-black shrink-0">
                              Due: {symbol}{c.dueAmount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{c.phone}</span>
                            </span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{c.email}</span>
                            </span>
                          )}
                          {c.address && (
                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{c.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#ff5c01] shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No customers found matching &quot;{searchQuery}&quot;
                </p>
                {onQuickAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onQuickAdd();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5c01] text-white font-bold text-xs rounded-xl hover:bg-[#e05100] transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add New Customer</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Info / Count */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Showing {filteredCustomers.length} of {customers.length} registered customers</span>
            {onQuickAdd && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onQuickAdd();
                }}
                className="text-[#ff5c01] hover:underline font-bold"
              >
                + Quick Add
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

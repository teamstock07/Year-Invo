import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Eye,
  Clock,
  User,
  X,
  CreditCard,
} from 'lucide-react';

export const SalesCalendarView: React.FC = () => {
  const { sales, formatMoney, formatCurrency, displayCurrency } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDaySales, setSelectedDaySales] = useState<{
    dateStr: string;
    sales: Sale[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in current month calculation
  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Map sales by date string (YYYY-MM-DD)
    const salesByDate: Record<string, { totalRevenue: number; orderCount: number; sales: Sale[] }> = {};

    sales.forEach((s) => {
      if (!s.date) return;
      const datePart = s.date.split('T')[0];
      if (!salesByDate[datePart]) {
        salesByDate[datePart] = { totalRevenue: 0, orderCount: 0, sales: [] };
      }
      salesByDate[datePart].totalRevenue += s.total;
      salesByDate[datePart].orderCount += 1;
      salesByDate[datePart].sales.push(s);
    });

    const days = [];

    // Empty padding slots for days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = salesByDate[dateStr] || { totalRevenue: 0, orderCount: 0, sales: [] };
      days.push({
        day,
        dateStr,
        ...dayData,
      });
    }

    return days;
  }, [year, month, sales]);

  // Current month aggregates
  const monthSales = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return sales.filter((s) => s.date.startsWith(prefix));
  }, [year, month, sales]);

  const monthTotalRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
  const monthTotalOrders = monthSales.length;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyAverageRevenue = monthTotalRevenue / daysInMonth;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5c01] bg-[#ff5c01]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>Sales Schedule & Timeline</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-[#ff5c01]" />
              <span>Sales Calendar</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect daily transaction volume, revenue spikes, and order histories on an interactive monthly calendar.
            </p>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-1.5 rounded-2xl self-start sm:self-auto">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white px-2">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-400">Monthly Revenue</p>
            <p className="text-xl font-bold text-white mt-0.5">{formatMoney(monthTotalRevenue)}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Total Invoices Issued</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{monthTotalOrders}</p>
          </div>
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-amber-400">Daily Average</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">
              {formatMoney(dailyAverageRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold uppercase text-slate-400">
          <div className="py-1 text-rose-400">Sun</div>
          <div className="py-1">Mon</div>
          <div className="py-1">Tue</div>
          <div className="py-1">Wed</div>
          <div className="py-1">Thu</div>
          <div className="py-1">Fri</div>
          <div className="py-1 text-blue-400">Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((item, idx) => {
            if (!item) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[85px] rounded-xl bg-slate-950/20 border border-transparent opacity-30"
                />
              );
            }

            const hasSales = item.orderCount > 0;
            const isToday = item.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={item.dateStr}
                onClick={() => hasSales && setSelectedDaySales({ dateStr: item.dateStr, sales: item.sales })}
                className={`min-h-[85px] p-2.5 rounded-xl border flex flex-col justify-between transition-all select-none ${
                  hasSales
                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 cursor-pointer shadow-xs hover:border-[#ff5c01]/60'
                    : 'bg-slate-900/50 border-slate-800/60 opacity-60'
                } ${isToday ? 'ring-1 ring-[#ff5c01] border-[#ff5c01]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'bg-[#ff5c01] text-white px-1.5 py-0.2 rounded-md'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.day}
                  </span>
                  {hasSales && (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {item.orderCount} orders
                    </span>
                  )}
                </div>

                {hasSales ? (
                  <div className="mt-2 text-right">
                    <p className="text-xs font-black text-emerald-400">
                      {formatMoney(item.totalRevenue)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-600 text-right">No sales</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY SALES MODAL / DRAWER */}
      {selectedDaySales && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#ff5c01]" />
                  <span>Invoices for {selectedDaySales.dateStr}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDaySales.sales.length} transactions • Total:{' '}
                  <span className="text-emerald-400 font-bold">
                    {formatMoney(
                      selectedDaySales.sales.reduce((sum, s) => sum + s.total, 0)
                    )}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDaySales(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoices List */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar divide-y divide-slate-800">
              {selectedDaySales.sales.map((sale) => (
                <div key={sale.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase">{sale.invoiceNo}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Customer: {sale.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {sale.items?.length || 0} items ({sale.items?.map((i) => i.productName).join(', ')})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">{formatMoney(sale.total)}</p>
                    {sale.dueAmount > 0 && (
                      <p className="text-[10px] text-amber-400">
                        Due: {formatMoney(sale.dueAmount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedDaySales(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
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

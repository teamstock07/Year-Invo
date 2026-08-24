import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  OnlineOrder,
  OnlineOrderStatus,
  OnlineOrderItem,
  DeliveryPayer,
  OnlineCustomer,
  Product,
} from '../../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  DollarSign,
  User,
  Users,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Send,
  Download,
  X,
  Check,
  Building,
  UserPlus,
} from 'lucide-react';

interface OnlineOrdersViewProps {
  initialFilter?: OnlineOrderStatus | 'All';
  onNavigateToTab?: (tab: string) => void;
}

export const OnlineOrdersView: React.FC<OnlineOrdersViewProps> = ({
  initialFilter = 'All',
  onNavigateToTab,
}) => {
  const {
    onlineOrders,
    onlineProducts,
    onlineCustomers,
    products,
    settings,
    createOnlineOrder,
    updateOnlineOrderStatus,
    deleteOnlineOrder,
    formatCurrency,
    formatDate,
    t,
  } = useApp();

  const availableProducts = useMemo(() => {
    const onl = onlineProducts || [];
    const pos = products || [];
    const map = new Map<string, any>();
    pos.forEach((p) => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        sellingPrice: Number(p.sellingPrice) || 0,
        buyingPrice: Number(p.buyingPrice) || 0,
        stock: p.currentStock !== undefined ? p.currentStock : (p.stock || 0),
        unit: p.unit || 'pcs',
        sku: p.sku || '',
        imageUrl: p.imageUrl,
      });
    });
    onl.forEach((p) => {
      const existing = map.get(p.id);
      map.set(p.id, {
        ...existing,
        id: p.id,
        name: p.name,
        sellingPrice: Number(p.sellingPrice) || (existing ? existing.sellingPrice : 0),
        buyingPrice: Number(p.buyingPrice) || (existing ? existing.buyingPrice : 0),
        stock: p.stock !== undefined ? p.stock : (existing ? existing.stock : 0),
        unit: p.unit || (existing ? existing.unit : 'pcs'),
        sku: p.sku || (existing ? existing.sku : ''),
        imageUrl: p.imageUrl || (existing ? existing.imageUrl : undefined),
      });
    });
    return Array.from(map.values());
  }, [onlineProducts, products]);

  const [activeStatusFilter, setActiveStatusFilter] = useState<OnlineOrderStatus | 'All'>(
    initialFilter
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OnlineOrder | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OnlineOrder | null>(null);
  const [statusUpdateModalOrder, setStatusUpdateModalOrder] = useState<OnlineOrder | null>(null);
  const [statusNoteOrReason, setStatusNoteOrReason] = useState('');
  const [targetStatusToSet, setTargetStatusToSet] = useState<OnlineOrderStatus>('Confirmed');
  const [incurredCourierCost, setIncurredCourierCost] = useState<number>(0);
  const [cancellationStage, setCancellationStage] = useState<string>('');

  // Customer Select & Search State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Form State for creating a new online order
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState<'Inside City' | 'Outside City'>('Inside City');
  const [deliveryPayer, setDeliveryPayer] = useState<DeliveryPayer>(
    settings.onlineBusiness?.delivery?.defaultPayer || 'Customer'
  );
  const [deliveryCharge, setDeliveryCharge] = useState<number>(
    settings.onlineBusiness?.delivery?.defaultInsideCityCharge || 80
  );
  const [courierCost, setCourierCost] = useState<number>(
    settings.onlineBusiness?.delivery?.defaultInsideCityCharge || 80
  );
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad' | 'Card' | 'Bank Transfer' | 'Prepaid'>('COD');
  const [courierName, setCourierName] = useState<string>('Steadfast');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Selected Order Items
  const [selectedItems, setSelectedItems] = useState<OnlineOrderItem[]>([]);
  const [itemSelectProductId, setItemSelectProductId] = useState('');
  const [itemSelectQty, setItemSelectQty] = useState(1);

  // Matching customers for search
  const filteredCustomerList = useMemo(() => {
    const list = onlineCustomers || [];
    if (!customerSearchQuery.trim()) return list.slice(0, 8);
    const q = customerSearchQuery.toLowerCase().trim();
    return list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [onlineCustomers, customerSearchQuery]);

  const handleSelectExistingCustomer = (cust: OnlineCustomer) => {
    setSelectedCustomerId(cust.id);
    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    setCustomerEmail(cust.email || '');
    setDeliveryAddress(cust.address || '');
    if (cust.city === 'Outside City' || cust.city === 'Inside City') {
      handleCityChange(cust.city);
    }
    setIsCustomerDropdownOpen(false);
    setCustomerSearchQuery('');
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryAddress('');
    setCustomerSearchQuery('');
  };

  // Update delivery charge and courier cost when city changes
  const handleCityChange = (city: 'Inside City' | 'Outside City') => {
    setDeliveryCity(city);
    const rate =
      city === 'Inside City'
        ? settings.onlineBusiness?.delivery?.defaultInsideCityCharge || 80
        : settings.onlineBusiness?.delivery?.defaultOutsideCityCharge || 150;
    setDeliveryCharge(rate);
    setCourierCost(rate);
  };

  // Add Item to Order Cart
  const handleAddItemToOrder = () => {
    if (!itemSelectProductId) return;
    const prod = availableProducts.find((p) => p.id === itemSelectProductId);
    if (!prod) return;

    const unitPrice = Number(prod.sellingPrice) || 0;
    const qty = Math.max(1, Number(itemSelectQty) || 1);

    const existingIdx = selectedItems.findIndex((i) => i.productId === prod.id);
    if (existingIdx >= 0) {
      const updated = [...selectedItems];
      const newQty = updated[existingIdx].quantity + qty;
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: newQty,
        total: newQty * unitPrice,
      };
      setSelectedItems(updated);
    } else {
      const newItem: OnlineOrderItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        buyingPrice: Number(prod.buyingPrice) || 0,
        sellingPrice: unitPrice,
        quantity: qty,
        unit: prod.unit || 'pcs',
        total: qty * unitPrice,
        imageUrl: prod.imageUrl,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    setItemSelectProductId('');
    setItemSelectQty(1);
  };

  const handleUpdateItemQty = (prodId: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === prodId
          ? { ...item, quantity: qty, total: qty * (Number(item.sellingPrice) || 0) }
          : item
      )
    );
  };

  const handleRemoveItemFromOrder = (prodId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.productId !== prodId));
  };

  const itemsSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (Number(item.total) || (Number(item.sellingPrice) || 0) * (Number(item.quantity) || 1)),
      0
    );
  }, [selectedItems]);

  const calculatedGrandTotal = useMemo(() => {
    const sub = Number(itemsSubtotal) || 0;
    const ship = Number(deliveryCharge) || 0;
    const disc = Number(discount) || 0;
    if (deliveryPayer === 'Customer') {
      return Math.max(0, sub + ship - disc);
    }
    // Owner absorbs delivery expense
    return Math.max(0, sub - disc);
  }, [itemsSubtotal, discount, deliveryCharge, deliveryPayer]);

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one product to the order.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter customer name and phone number.');
      return;
    }

    const sub = itemsSubtotal;
    const ship = Number(deliveryCharge) || 0;
    const disc = Number(discount) || 0;
    const finalGrandTotal = deliveryPayer === 'Customer'
      ? Math.max(0, sub + ship - disc)
      : Math.max(0, sub - disc);

    await createOnlineOrder({
      customerId: selectedCustomerId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      deliveryAddress: deliveryAddress.trim(),
      deliveryCity,
      deliveryPayer,
      deliveryCharge: ship,
      courierCost: Number(courierCost) || ship,
      discount: disc,
      subtotal: sub,
      grandTotal: finalGrandTotal,
      paymentMethod,
      courierName,
      trackingNumber: trackingNumber.trim() || undefined,
      notes: orderNotes.trim() || undefined,
      items: selectedItems,
    });

    // Reset Form
    setIsCreateModalOpen(false);
    setSelectedItems([]);
    setSelectedCustomerId(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryAddress('');
    setDiscount(0);
    setOrderNotes('');
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const list = onlineOrders || [];
    return list.filter((ord) => {
      // Status filter
      if (activeStatusFilter !== 'All') {
        if (ord.status !== activeStatusFilter) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNo = ord.orderNo?.toLowerCase().includes(q);
        const matchCust = ord.customerName?.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone?.toLowerCase().includes(q);
        const matchCourier = ord.courierName?.toLowerCase().includes(q);
        const matchTrack = ord.trackingNumber?.toLowerCase().includes(q);
        const matchCustId = ord.customerId?.toLowerCase().includes(q);
        if (!matchNo && !matchCust && !matchPhone && !matchCourier && !matchTrack && !matchCustId) {
          return false;
        }
      }
      return true;
    });
  }, [onlineOrders, activeStatusFilter, searchTerm]);

  // Order Counts by Status
  const counts = useMemo(() => {
    const list = onlineOrders || [];
    const map: Record<string, number> = {
      All: list.length,
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
    };
    list.forEach((o) => {
      if (map[o.status] !== undefined) {
        map[o.status]++;
      }
    });
    return map;
  }, [onlineOrders]);

  const getStatusBadge = (status: OnlineOrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Package className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <RotateCcw className="w-3 h-3" />
            <span>Returned</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleOpenStatusModal = (order: OnlineOrder, nextStatus: OnlineOrderStatus) => {
    setStatusUpdateModalOrder(order);
    setTargetStatusToSet(nextStatus);
    setStatusNoteOrReason(order.cancellationReason || '');
    setCancellationStage(order.status);
    const defaultCost = order.courierCost !== undefined
      ? order.courierCost
      : (order.deliveryCharge || (order.deliveryCity === 'Outside City' ? 150 : 80));
    setIncurredCourierCost(defaultCost);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusUpdateModalOrder) return;
    await updateOnlineOrderStatus(
      statusUpdateModalOrder.id,
      targetStatusToSet,
      {
        reason: statusNoteOrReason.trim() || undefined,
        cancellationStage: cancellationStage || statusUpdateModalOrder.status,
        courierCost: targetStatusToSet === 'Cancelled' || targetStatusToSet === 'Returned' ? incurredCourierCost : undefined,
      }
    );
    setStatusUpdateModalOrder(null);
    setStatusNoteOrReason('');
  };

  const selectedCustomerRecord = useMemo(() => {
    if (!selectedCustomerId) return null;
    return (onlineCustomers || []).find((c) => c.id === selectedCustomerId) || null;
  }, [onlineCustomers, selectedCustomerId]);

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Online Orders</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage incoming online orders, customer directory linkage, delivery charges, and courier tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              handleClearSelectedCustomer();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Online Order</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'All', label: 'All Orders', count: counts.All },
          { id: 'Pending', label: 'Pending', count: counts.Pending, color: 'text-amber-600' },
          { id: 'Confirmed', label: 'Confirmed', count: counts.Confirmed, color: 'text-blue-600' },
          { id: 'Processing', label: 'Processing', count: counts.Processing, color: 'text-indigo-600' },
          { id: 'Shipped', label: 'Shipped', count: counts.Shipped, color: 'text-purple-600' },
          { id: 'Delivered', label: 'Delivered', count: counts.Delivered, color: 'text-emerald-600' },
          { id: 'Cancelled', label: 'Cancelled', count: counts.Cancelled, color: 'text-rose-600' },
          { id: 'Returned', label: 'Returned', count: counts.Returned, color: 'text-slate-600' },
        ].map((tab) => {
          const isActive = activeStatusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatusFilter(tab.id as any)}
              className={`whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, courier or tracking #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No online orders found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Create an online order or adjust your status and search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Order Info</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Items</th>
                  <th className="px-4 py-3.5">Delivery Fee</th>
                  <th className="px-4 py-3.5">Grand Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                  const isCancelled = order.status === 'Cancelled';
                  const isReturned = order.status === 'Returned';
                  const isDelivered = order.status === 'Delivered';
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Order Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            #{order.orderNo}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </span>
                          {order.courierName && (
                            <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              🚚 {order.courierName}
                              {order.trackingNumber ? ` (${order.trackingNumber})` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {order.customerPhone}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate mt-0.5">
                            📍 {order.deliveryAddress || order.deliveryCity || 'Standard Delivery'}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* Delivery Charge & Payer */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(order.deliveryCharge)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-0.5 ${
                              order.deliveryPayer === 'Owner'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {order.deliveryPayer === 'Owner' ? 'Free (Owner Pays)' : 'Paid by Customer'}
                          </span>
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {formatCurrency(order.grandTotal)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {getStatusBadge(order.status)}
                          {isCancelled && order.financialImpact !== undefined && order.financialImpact < 0 && (
                            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Courier Loss: {formatCurrency(order.financialImpact)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Status Stepper Action */}
                          {order.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Confirmed')}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Cancelled')}
                                title="Cancel Order"
                                className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'Confirmed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Processing')}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
                              >
                                Pack / Process
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Cancelled')}
                                title="Cancel Order"
                                className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'Processing' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Shipped')}
                                className="px-2.5 py-1 text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-lg transition-colors"
                              >
                                Hand to Courier
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Cancelled')}
                                title="Cancel Order"
                                className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'Shipped' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Delivered')}
                                title="Delivery Successful"
                                className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                Delivered
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Cancelled')}
                                title="Cancel Order"
                                className="px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(order, 'Returned')}
                                title="Return Order"
                                className="px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-lg transition-colors"
                              >
                                Return
                              </button>
                            </>
                          )}
                          {order.status === 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(order, 'Returned')}
                              title="Mark as Returned / Refunded"
                              className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Return
                            </button>
                          )}

                          {/* Invoice Print Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForInvoice(order)}
                            title="Print Online Invoice"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetail(order)}
                            title="View Order Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ONLINE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create New Online Order
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select customer from directory or add new, configure delivery charge and items.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
              {/* CUSTOMER SELECTION SECTION */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Customer Selection (Online Directory)</span>
                  </div>
                  {selectedCustomerId ? (
                    <button
                      type="button"
                      onClick={handleClearSelectedCustomer}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Change Customer
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Search existing or type details below
                    </span>
                  )}
                </div>

                {!selectedCustomerId ? (
                  <div className="space-y-2 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search customer by name, phone number, customer ID or address..."
                        value={customerSearchQuery}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                      />
                      {customerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCustomerSearchQuery('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Customer Dropdown Results */}
                    {isCustomerDropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredCustomerList.length === 0 ? (
                          <div className="p-3 text-center text-slate-400">
                            No matching customer found. Enter details manually below to create new.
                          </div>
                        ) : (
                          filteredCustomerList.map((cust) => (
                            <button
                              key={cust.id}
                              type="button"
                              onClick={() => handleSelectExistingCustomer(cust)}
                              className="w-full text-left p-2.5 hover:bg-indigo-50/70 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                            >
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{cust.name}</span>
                                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                                    {cust.phone}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate max-w-sm">
                                  📍 {cust.address || 'No address saved'} {cust.city ? `(${cust.city})` : ''}
                                </div>
                              </div>
                              <div className="text-right text-[11px]">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                                  {cust.totalOrders || 0} orders
                                </span>
                                <span className="text-slate-400">
                                  {formatCurrency(cust.totalSpent || 0)}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-center">
                          <button
                            type="button"
                            onClick={() => setIsCustomerDropdownOpen(false)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            Close Search Dropdown
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selected Customer Card Preview */
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{customerName}</span>
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            📞 {customerPhone}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {deliveryAddress || 'Address loaded'} • {deliveryCity}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedCustomer}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50"
                    >
                      Clear Customer
                    </button>
                  </div>
                )}

                {/* Customer Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01712345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Delivery Address & City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Delivery Full Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House/Road/Area, Police Station, District"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Delivery Region
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => handleCityChange(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Inside City">Inside City (৳80 default)</option>
                      <option value="Outside City">Outside City (৳150 default)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Selector Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {t('addProductToOrder') || 'Add Products To Order'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {availableProducts.length} {t('stockAvailable') || 'products available'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={itemSelectProductId}
                    onChange={(e) => setItemSelectProductId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">{t('selectOnlineProduct') || '-- Choose Product --'}</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.sellingPrice)} ({t('stock') || 'Stock'}: {p.stock || 0})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={itemSelectQty}
                    onChange={(e) => setItemSelectQty(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    disabled={!itemSelectProductId}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Selected Items List */}
                {selectedItems.length > 0 ? (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Order Items ({selectedItems.length})
                    </div>
                    {selectedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-semibold text-slate-900 dark:text-white block truncate">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Unit Price: <strong>{formatCurrency(item.sellingPrice)}</strong>
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 font-bold hover:bg-slate-200 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(item.productId, Number(e.target.value) || 1)}
                            className="w-10 text-center text-xs font-bold bg-transparent border-0 text-slate-900 dark:text-white p-0 focus:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(item.productId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3 pl-3">
                          <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 min-w-[60px] text-right">
                            {formatCurrency(item.total)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(item.productId)}
                            title="Remove Item"
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quick Subtotal Indicator */}
                    <div className="flex justify-between items-center px-1 pt-1 text-xs">
                      <span className="font-medium text-slate-500">Products Subtotal:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(itemsSubtotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400">
                    No products added yet. Select a product above to add to this order.
                  </div>
                )}
              </div>

              {/* Delivery Charge & Payer Selection */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Delivery Charge & Who Pays
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryPayer"
                        checked={deliveryPayer === 'Customer'}
                        onChange={() => setDeliveryPayer('Customer')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">Customer Pays</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryPayer"
                        checked={deliveryPayer === 'Owner'}
                        onChange={() => setDeliveryPayer('Owner')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        Owner Pays (Free Delivery)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Delivery Charge ({settings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Courier Cost ({settings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={courierCost}
                      onChange={(e) => setCourierCost(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Discount ({settings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="COD">Cash On Delivery (COD)</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Prepaid">Prepaid</option>
                    </select>
                  </div>
                </div>

                {/* Clear Live Calculation Breakdown Card */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                    <span>Products Subtotal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Delivery Charge ({deliveryPayer === 'Customer' ? 'Customer' : 'Store Free Delivery'}):
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {deliveryPayer === 'Customer' ? `+ ${formatCurrency(deliveryCharge)}` : `(Store Paid: ${formatCurrency(deliveryCharge)})`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                      <span>Discount:</span>
                      <span className="font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Grand Total
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {deliveryPayer === 'Customer' ? 'Subtotal + Delivery - Discount' : 'Subtotal - Discount'}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Courier & Tracking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {(
                      settings.onlineBusiness?.delivery?.supportedCouriers || [
                        'Steadfast',
                        'Pathao',
                        'RedX',
                        'Paperfly',
                        'In-House Courier',
                      ]
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Courier Tracking # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STF-849202"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Delivery Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deliver after 4 PM, call before delivery"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS ADVANCE / CANCELLATION MODAL */}
      {statusUpdateModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Update Order Status: #{statusUpdateModalOrder.orderNo}
              </h3>
              <button
                type="button"
                onClick={() => setStatusUpdateModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-600 dark:text-slate-400">
                Customer: <strong>{statusUpdateModalOrder.customerName}</strong> ({statusUpdateModalOrder.customerPhone})
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Target Status:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'] as OnlineOrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTargetStatusToSet(st)}
                        className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                          targetStatusToSet === st
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {(targetStatusToSet === 'Cancelled' || targetStatusToSet === 'Returned') && (
                <div className="space-y-2.5 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                  <div>
                    <label className="block font-semibold text-rose-900 dark:text-rose-200 mb-1">
                      Reason for {targetStatusToSet} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Customer refused delivery, wrong phone number, order cancelled..."
                      value={statusNoteOrReason}
                      onChange={(e) => setStatusNoteOrReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Quick Reason Suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Customer cancelled order',
                      'Customer refused at doorstep',
                      'Customer phone unreachable',
                      'Wrong delivery address',
                      'Damaged in transit',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setStatusNoteOrReason(tag)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Courier Cost Incurred on Cancellation */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Incurred Courier Loss ({settings.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={incurredCourierCost}
                      onChange={(e) => setIncurredCourierCost(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      If the parcel was handed to courier or packaged, courier fee is recorded as a delivery loss.
                    </p>
                  </div>

                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    ✓ Ordered items will be automatically restocked into your store inventory.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusUpdateModalOrder(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE ONLINE ORDER INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Online Invoice & Delivery Slip</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl shadow hover:bg-indigo-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Layout */}
            <div className="space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-bold tracking-wide">
                  {settings.brandName || 'YearInvo Store'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {settings.receiptHeader || 'Online Order Receipt'}
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded bg-slate-100 font-bold text-xs">
                  ORDER: #{selectedOrderForInvoice.orderNo}
                </div>
              </div>

              {/* Customer Delivery Info */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold">{selectedOrderForInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-bold">{selectedOrderForInvoice.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-medium text-right max-w-[240px]">
                    {selectedOrderForInvoice.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier:</span>
                  <span className="font-bold">
                    {selectedOrderForInvoice.courierName || 'In-House'}
                    {selectedOrderForInvoice.trackingNumber
                      ? ` (${selectedOrderForInvoice.trackingNumber})`
                      : ''}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left">
                <thead className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-1.5">Item</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Price</th>
                    <th className="py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedOrderForInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5">{item.productName}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">{formatCurrency(item.sellingPrice)}</td>
                      <td className="py-1.5 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation */}
              <div className="pt-2 border-t border-slate-300 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrderForInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    Delivery Charge ({selectedOrderForInvoice.deliveryPayer === 'Owner' ? 'Paid by Store' : 'Customer'}):
                  </span>
                  <span>{formatCurrency(selectedOrderForInvoice.deliveryCharge)}</span>
                </div>
                {selectedOrderForInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrderForInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-slate-400 pt-1 text-slate-900">
                  <span>Amount to Pay / Collect:</span>
                  <span>{formatCurrency(selectedOrderForInvoice.grandTotal)}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[11px] text-slate-500 border-t border-dashed border-slate-300">
                <p>Payment: {selectedOrderForInvoice.paymentMethod} ({selectedOrderForInvoice.paymentStatus})</p>
                <p className="mt-1">{settings.receiptFooter || 'Thank you for shopping online with us!'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Details #{selectedOrderForDetail.orderNo}
                </h3>
                <span className="text-xs text-slate-400">
                  Placed on {formatDate(selectedOrderForDetail.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Current Status</span>
                <div>{getStatusBadge(selectedOrderForDetail.status)}</div>
              </div>

              {selectedOrderForDetail.status === 'Cancelled' && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1">
                  <div className="font-bold text-rose-800 dark:text-rose-200">
                    Cancelled: {selectedOrderForDetail.cancellationReason || 'No reason specified'}
                  </div>
                  {selectedOrderForDetail.cancelledBy && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400">
                      Cancelled By: {selectedOrderForDetail.cancelledBy} • Stage: {selectedOrderForDetail.cancellationStage || '—'}
                    </div>
                  )}
                  {selectedOrderForDetail.financialImpact !== undefined && selectedOrderForDetail.financialImpact < 0 && (
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                      Courier Delivery Loss: {formatCurrency(selectedOrderForDetail.financialImpact)}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedOrderForDetail.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold">{selectedOrderForDetail.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-medium text-right max-w-[220px]">
                    {selectedOrderForDetail.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier Partner:</span>
                  <span className="font-semibold">
                    {selectedOrderForDetail.courierName || 'In-House'}
                  </span>
                </div>
                {selectedOrderForDetail.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tracking Number:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedOrderForDetail.trackingNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Ordered Items ({selectedOrderForDetail.items.length})
                </span>
                {selectedOrderForDetail.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>
                      {i.productName} × {i.quantity}
                    </span>
                    <span className="font-bold">{formatCurrency(i.total)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrderForDetail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>
                    Delivery Charge (
                    {selectedOrderForDetail.deliveryPayer === 'Owner'
                      ? 'Paid by Store'
                      : 'Paid by Customer'}
                    ):
                  </span>
                  <span>{formatCurrency(selectedOrderForDetail.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-indigo-200 dark:border-indigo-800 pt-1 text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(selectedOrderForDetail.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const order = selectedOrderForDetail;
                  setSelectedOrderForDetail(null);
                  setSelectedOrderForInvoice(order);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

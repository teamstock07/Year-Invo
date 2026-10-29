import { supabase } from '../lib/supabase';
import {
  Product,
  Sale,
  Customer,
  Supplier,
  Expense,
  Purchase,
  OnlineOrder,
  UserProfile,
  Category,
  SubscriptionRequest,
} from '../types';

/**
 * Supabase Database Service
 * Provides complete CRUD operations for all business entities directly with Supabase PostgreSQL.
 * Fully replaces Firestore database calls.
 */

// ==================== USER & SETTINGS ====================

export async function getSupabaseUser(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase DB] Error getting user:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('[Supabase DB] Exception getting user:', e);
    return null;
  }
}

export async function upsertSupabaseUser(
  user: Partial<UserProfile> & { id: string; email: string }
): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      id: user.id,
      email: user.email,
      full_name: user.ownerName || (user as any).fullName || '',
      brand_name: user.brandName || (user as any).storeName || '',
      business_type: user.businessType || '',
      phone: user.mobile || (user as any).phone || '',
      role: (user.role || 'Owner').toString().toLowerCase(),
      plan: (user.subscriptionPlan || (user as any).plan || 'Free').toString().toLowerCase(),
      subscription_status: user.subscriptionStatus || 'active',
      currency: user.currency || 'BDT',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').upsert(payload);
    if (error) {
      console.warn('[Supabase DB] Error upserting user:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase DB] Exception upserting user:', e);
    return false;
  }
}

// ==================== CATEGORIES ====================

export async function getSupabaseCategories(userId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase DB] Error getting categories:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      productCount: Number(row.product_count) || 0,
    }));
  } catch (e) {
    console.warn('[Supabase DB] Exception getting categories:', e);
    return [];
  }
}

export async function saveSupabaseCategory(userId: string, category: Category): Promise<boolean> {
  try {
    const payload = {
      id: category.id,
      user_id: userId,
      name: category.name,
    };
    const { error } = await supabase.from('categories').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseCategory(categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== PRODUCTS ====================

export async function getSupabaseProducts(userId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase DB] Error getting products:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const stock = Number(row.stock) || 0;
      const minStock = Number(row.min_stock) || 5;
      let status: Product['status'] = 'active';
      if (stock <= 0) {
        status = 'out_of_stock';
      } else if (stock <= minStock) {
        status = 'low';
      }

      return {
        id: row.id,
        name: row.name,
        sku: row.sku || '',
        barcode: row.barcode || '',
        category: row.category || 'General',
        brand: row.brand || '',
        buyingPrice: Number(row.buy_price) || 0,
        sellingPrice: Number(row.sell_price) || 0,
        currentStock: stock,
        minStockAlert: minStock,
        unit: row.unit || 'pcs',
        imageUrl: row.image_url || '',
        description: row.notes || '',
        status,
        createdAt: row.created_at || new Date().toISOString(),
      };
    });
  } catch (e) {
    console.warn('[Supabase DB] Exception getting products:', e);
    return [];
  }
}

export async function saveSupabaseProduct(userId: string, product: Product): Promise<boolean> {
  try {
    const payload = {
      id: product.id,
      user_id: userId,
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category || 'General',
      buy_price: product.buyingPrice || (product as any).buyPrice || 0,
      sell_price: product.sellingPrice || (product as any).sellPrice || (product as any).price || 0,
      stock: product.currentStock ?? (product as any).stock ?? 0,
      unit: product.unit || 'pcs',
      min_stock: product.minStockAlert ?? (product as any).minStock ?? 5,
      image_url: product.imageUrl || '',
      notes: product.description || (product as any).notes || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').upsert(payload);
    if (error) {
      console.warn('[Supabase DB] Error saving product:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase DB] Exception saving product:', e);
    return false;
  }
}

export async function deleteSupabaseProduct(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== SALES ====================

export async function getSupabaseSales(userId: string): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase DB] Error getting sales:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const subtotal = Number(row.subtotal) || 0;
      const discount = Number(row.discount) || 0;
      const vat = Number(row.vat) || 0;
      const grandTotal = Number(row.grand_total) || subtotal - discount + vat;
      const paid = Number(row.paid_amount) || 0;
      const due = Number(row.due_amount) || Math.max(0, grandTotal - paid);
      const change = Math.max(0, paid - grandTotal);

      return {
        id: row.id,
        invoiceNo: row.invoice_no,
        customerId: row.customer_id,
        customerName: row.customer_name || 'Walk-in Customer',
        customerPhone: row.customer_phone || '',
        items: row.items || [],
        subtotal,
        discount,
        tax: vat,
        total: grandTotal,
        paidAmount: paid,
        dueAmount: due,
        changeAmount: change,
        paymentMethod: (row.payment_method || 'Cash') as any,
        cashierName: row.cashier_name || 'Staff',
        note: row.notes || '',
        date: row.created_at || new Date().toISOString(),
        syncStatus: 'SYNCED',
      };
    });
  } catch (e) {
    console.warn('[Supabase DB] Exception getting sales:', e);
    return [];
  }
}

export async function saveSupabaseSale(userId: string, sale: Sale): Promise<boolean> {
  try {
    const grandTotal = sale.total ?? (sale as any).grandTotal ?? 0;
    const vat = sale.tax ?? (sale as any).vat ?? 0;

    const payload = {
      id: sale.id,
      user_id: userId,
      invoice_no: sale.invoiceNo,
      customer_id: sale.customerId || null,
      customer_name: sale.customerName || 'Walk-in Customer',
      customer_phone: sale.customerPhone || '',
      items: sale.items || [],
      subtotal: sale.subtotal || 0,
      discount: sale.discount || 0,
      vat,
      grand_total: grandTotal,
      paid_amount: sale.paidAmount || 0,
      due_amount: sale.dueAmount || 0,
      payment_method: (sale.paymentMethod || 'cash').toString().toLowerCase(),
      cashier_name: sale.cashierName || 'Staff',
      notes: sale.note || '',
      created_at: sale.date || new Date().toISOString(),
    };

    const { error } = await supabase.from('sales').upsert(payload);
    if (error) {
      console.warn('[Supabase DB] Error saving sale:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase DB] Exception saving sale:', e);
    return false;
  }
}

export async function deleteSupabaseSale(saleId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sales').delete().eq('id', saleId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== CUSTOMERS ====================

export async function getSupabaseCustomers(userId: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone || '',
      email: row.email || '',
      address: row.address || '',
      totalSpent: Number(row.total_purchases) || 0,
      dueAmount: Number(row.total_due) || 0,
      lifetimePurchasesCount: Number(row.total_orders) || 0,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    return [];
  }
}

export async function saveSupabaseCustomer(userId: string, customer: Customer): Promise<boolean> {
  try {
    const payload = {
      id: customer.id,
      user_id: userId,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      total_purchases: customer.totalSpent ?? (customer as any).totalPurchases ?? 0,
      total_due: customer.dueAmount ?? (customer as any).totalDue ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('customers').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseCustomer(customerId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== SUPPLIERS ====================

export async function getSupabaseSuppliers(userId: string): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      company: row.company || '',
      mobile: row.phone || '',
      email: row.email || '',
      address: row.address || '',
      dueAmount: Number(row.total_due) || 0,
      totalPurchasesCount: Number(row.total_supplied) || 0,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    return [];
  }
}

export async function saveSupabaseSupplier(userId: string, supplier: Supplier): Promise<boolean> {
  try {
    const payload = {
      id: supplier.id,
      user_id: userId,
      name: supplier.name,
      company: supplier.company || '',
      phone: supplier.mobile || '',
      email: supplier.email || '',
      address: supplier.address || '',
      total_due: supplier.dueAmount || 0,
      total_supplied: supplier.totalPurchasesCount || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('suppliers').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseSupplier(supplierId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== EXPENSES ====================

export async function getSupabaseExpenses(userId: string): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category || 'General',
      amount: Number(row.amount) || 0,
      paymentMethod: row.payment_method || 'Cash',
      date: row.date || row.created_at || new Date().toISOString(),
      note: row.note || '',
    }));
  } catch (e) {
    return [];
  }
}

export async function saveSupabaseExpense(userId: string, expense: Expense): Promise<boolean> {
  try {
    const payload = {
      id: expense.id,
      user_id: userId,
      title: expense.title,
      category: expense.category || 'General',
      amount: expense.amount || 0,
      payment_method: expense.paymentMethod || 'cash',
      date: expense.date || new Date().toISOString(),
      note: expense.note || expense.description || '',
    };

    const { error } = await supabase.from('expenses').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseExpense(expenseId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== PURCHASES ====================

export async function getSupabasePurchases(userId: string): Promise<Purchase[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      purchaseNo: row.invoice_no,
      supplierId: row.supplier_id || '',
      supplierName: row.supplier_name || 'General Supplier',
      items: row.items || [],
      totalAmount: Number(row.total_amount) || 0,
      paidAmount: Number(row.paid_amount) || 0,
      dueAmount: Number(row.due_amount) || 0,
      paymentMethod: (row.payment_method || 'Cash') as any,
      date: row.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    return [];
  }
}

export async function saveSupabasePurchase(userId: string, purchase: Purchase): Promise<boolean> {
  try {
    const payload = {
      id: purchase.id,
      user_id: userId,
      invoice_no: purchase.purchaseNo,
      supplier_id: purchase.supplierId || null,
      supplier_name: purchase.supplierName || 'General Supplier',
      items: purchase.items || [],
      total_amount: purchase.totalAmount || 0,
      paid_amount: purchase.paidAmount || 0,
      due_amount: purchase.dueAmount || 0,
      payment_method: purchase.paymentMethod || 'cash',
      created_at: purchase.date || new Date().toISOString(),
    };

    const { error } = await supabase.from('purchases').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== ONLINE ORDERS ====================

export async function getSupabaseOnlineOrders(userId: string): Promise<OnlineOrder[]> {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => {
      const total = Number(row.total_amount) || 0;
      const status = (row.order_status || 'Pending') as OnlineOrder['status'];

      return {
        id: row.id,
        orderNo: row.order_no,
        userId: row.user_id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email || '',
        deliveryAddress: row.customer_address || '',
        items: row.items || [],
        subtotal: Number(row.subtotal) || 0,
        deliveryCharge: Number(row.delivery_charge) || 0,
        deliveryPayer: 'Customer',
        discount: Number(row.discount) || 0,
        grandTotal: total,
        ownerDeliveryExpense: 0,
        paymentMethod: row.payment_method || 'COD',
        paymentStatus: Number(row.paid_amount) >= total && total > 0 ? 'Paid' : 'Pending',
        status,
        courierName: row.courier_name || '',
        trackingNumber: row.tracking_code || '',
        codAmount: Number(row.due_amount) || total,
        codCollected: false,
        notes: row.notes || '',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
  } catch (e) {
    return [];
  }
}

export async function saveSupabaseOnlineOrder(userId: string, order: OnlineOrder): Promise<boolean> {
  try {
    const payload = {
      id: order.id,
      user_id: userId,
      order_no: order.orderNo,
      customer_id: order.customerId || null,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.deliveryAddress || '',
      items: order.items || [],
      subtotal: order.subtotal || 0,
      delivery_charge: order.deliveryCharge || 0,
      discount: order.discount || 0,
      total_amount: order.grandTotal || 0,
      paid_amount: order.paymentStatus === 'Paid' ? order.grandTotal : 0,
      due_amount: order.codAmount || (order.paymentStatus === 'Paid' ? 0 : order.grandTotal),
      payment_method: order.paymentMethod || 'COD',
      order_status: order.status || 'Pending',
      tracking_code: order.trackingNumber || '',
      courier_name: order.courierName || '',
      notes: order.notes || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('online_orders').upsert(payload);
    return !error;
  } catch (e) {
    return false;
  }
}

export async function deleteSupabaseOnlineOrder(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('online_orders').delete().eq('id', orderId);
    return !error;
  } catch (e) {
    return false;
  }
}

// ==================== SUBSCRIPTION REQUESTS ====================

export async function getSupabaseSubscriptionRequests(): Promise<SubscriptionRequest[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase DB] Error getting subscription requests:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name || 'Merchant',
      userEmail: row.email || '',
      brandName: row.brand_name || '',
      currentPlan: (row.current_plan || 'Free') as any,
      requestedPlan: (row.requested_plan || 'Pro') as any,
      billingCycle: (row.billing_cycle || 'monthly') as any,
      paymentMethod: row.payment_method || 'bKash',
      paymentProvider: row.payment_provider || row.payment_method || 'bKash',
      paymentRegion: (row.payment_region || 'bangladesh') as any,
      currency: row.currency || 'BDT',
      transactionId: row.transaction_id || '',
      amount: Number(row.amount) || 0,
      status: (row.status || 'pending') as any,
      requestDate: row.created_at || new Date().toISOString(),
      reviewedDate: row.updated_at || '',
      approvedBy: row.approved_by || '',
      startDate: row.start_date || undefined,
      expiryDate: row.expiry_date || undefined,
      billingPeriod: (row.billing_cycle || 'monthly') as any,
      notes: row.notes || '',
    }));
  } catch (e) {
    console.warn('[Supabase DB] Exception getting subscription requests:', e);
    return [];
  }
}

export async function createSupabaseSubscriptionRequest(
  req: Partial<SubscriptionRequest>
): Promise<string | null> {
  try {
    const payload = {
      id: req.id || undefined,
      user_id: req.userId || '',
      email: req.userEmail || '',
      requested_plan: req.requestedPlan || 'Pro',
      billing_cycle: req.billingCycle || 'monthly',
      payment_method: req.paymentMethod || 'Manual',
      payment_provider: req.paymentProvider || req.paymentMethod || 'Manual',
      payment_region: req.paymentRegion || 'bangladesh',
      transaction_id: req.transactionId || '',
      amount: req.amount || 0,
      currency: req.currency || 'BDT',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('subscription_requests')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase DB] Error creating subscription request:', error.message);
      return payload.id || null;
    }

    return data?.id || payload.id || null;
  } catch (e) {
    console.warn('[Supabase DB] Exception creating subscription request:', e);
    return null;
  }
}

export async function updateSupabaseSubscriptionRequestStatus(
  requestId: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  meta?: { approvedBy?: string; notes?: string }
): Promise<boolean> {
  try {
    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscription_requests')
      .update(payload)
      .eq('id', requestId);

    if (error) {
      console.warn('[Supabase DB] Error updating subscription request status:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase DB] Exception updating subscription request status:', e);
    return false;
  }
}

export async function updateSupabaseUserPlan(
  userId: string,
  plan: string,
  subscriptionStatus: string,
  expiryDate?: string
): Promise<boolean> {
  try {
    const payload: any = {
      plan: plan.toLowerCase(),
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId);

    return !error;
  } catch (e) {
    return false;
  }
}


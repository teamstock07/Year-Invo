import { doc, setDoc, writeBatch, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getSupabaseProducts,
  saveSupabaseProduct,
  getSupabaseSales,
  saveSupabaseSale,
  getSupabaseCustomers,
  saveSupabaseCustomer,
  getSupabaseSuppliers,
  saveSupabaseSupplier,
  getSupabaseExpenses,
  saveSupabaseExpense,
  getSupabasePurchases,
  saveSupabasePurchase,
  getSupabaseCategories,
  saveSupabaseCategory,
  getSupabaseOnlineOrders,
  saveSupabaseOnlineOrder,
} from './supabaseDbService';
import { supabase } from '../lib/supabase';
import { offlineDb } from './offlineDb';
import {
  Product,
  Category,
  Brand,
  Customer,
  Supplier,
  Expense,
  Sale,
  Purchase,
  StockAdjustment,
  DueCollection,
  Investment,
  CapitalWithdrawal,
  TeamMember,
  Employee,
  EmployeeDevice,
  PayrollPayment,
  SalaryAdjustment,
  AuditLogEntry,
  CustomerLoyaltySettings,
  BusinessSettings,
  AppNotification,
  OnlineOrder,
  OnlineCustomer,
  OnlineBusinessSettings,
  OnlineProduct,
  PersonalContact,
  PersonalTransaction,
} from '../types';

export interface CloudBusinessDataCallbacks {
  onProductsLoaded?: (products: Product[], fromCloud: boolean) => void;
  onCategoriesLoaded?: (categories: Category[], fromCloud: boolean) => void;
  onBrandsLoaded?: (brands: Brand[], fromCloud: boolean) => void;
  onCustomersLoaded?: (customers: Customer[], fromCloud: boolean) => void;
  onSuppliersLoaded?: (suppliers: Supplier[], fromCloud: boolean) => void;
  onExpensesLoaded?: (expenses: Expense[], fromCloud: boolean) => void;
  onSalesLoaded?: (sales: Sale[], fromCloud: boolean) => void;
  onPurchasesLoaded?: (purchases: Purchase[], fromCloud: boolean) => void;
  onAdjustmentsLoaded?: (adjustments: StockAdjustment[], fromCloud: boolean) => void;
  onDueCollectionsLoaded?: (dueCollections: DueCollection[], fromCloud: boolean) => void;
  onInvestmentsLoaded?: (investments: Investment[], fromCloud: boolean) => void;
  onCapitalWithdrawalsLoaded?: (withdrawals: CapitalWithdrawal[], fromCloud: boolean) => void;
  onPersonalContactsLoaded?: (contacts: PersonalContact[], fromCloud: boolean) => void;
  onPersonalTransactionsLoaded?: (transactions: PersonalTransaction[], fromCloud: boolean) => void;
  onTeamLoaded?: (team: TeamMember[], fromCloud: boolean) => void;
  onDevicesLoaded?: (devices: EmployeeDevice[], fromCloud: boolean) => void;
  onPayrollLoaded?: (payroll: { employees: Employee[]; payments: PayrollPayment[]; adjustments: SalaryAdjustment[] }, fromCloud: boolean) => void;
  onAuditLogsLoaded?: (logs: AuditLogEntry[], fromCloud: boolean) => void;
  onLoyaltyLoaded?: (loyalty: CustomerLoyaltySettings, fromCloud: boolean) => void;
  onQrTrackingLoaded?: (qr: { generatedCodes: string[]; productQRCounts: Record<string, number> }, fromCloud: boolean) => void;
  onSettingsLoaded?: (settings: Partial<BusinessSettings>, fromCloud: boolean) => void;
  onNotificationsLoaded?: (notifs: { manual: AppNotification[]; readMap: Record<string, boolean> }, fromCloud: boolean) => void;
  onOnlineProductsLoaded?: (products: OnlineProduct[], fromCloud: boolean) => void;
  onOnlineOrdersLoaded?: (orders: OnlineOrder[], fromCloud: boolean) => void;
  onOnlineCustomersLoaded?: (customers: OnlineCustomer[], fromCloud: boolean) => void;
  onOnlineSettingsLoaded?: (settings: OnlineBusinessSettings, fromCloud: boolean) => void;
  onSyncStatusChanged?: (status: 'synced' | 'syncing' | 'offline' | 'error') => void;
}

/**
 * Recursively removes all `undefined` values from objects and arrays so Firestore never throws unsupported field value errors.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result as T;
}

/**
 * Helper to write document in user's businessData subcollection in Firestore
 */
export async function saveUserCloudCollection(
  userId: string,
  collectionKey: string,
  data: Record<string, any>
): Promise<boolean> {
  if (!userId || !userId.trim()) {
    console.warn(`[CloudSync] Cannot save ${collectionKey}: User ID is missing.`);
    return false;
  }

  // 1. Primary persistence directly into Supabase PostgreSQL tables
  try {
    const items = data.items || [];
    if (collectionKey === 'products' && Array.isArray(items)) {
      for (const p of items) {
        await saveSupabaseProduct(userId, p);
      }
    } else if (collectionKey === 'categories' && Array.isArray(items)) {
      for (const c of items) {
        await saveSupabaseCategory(userId, c);
      }
    } else if (collectionKey === 'sales' && Array.isArray(items)) {
      for (const s of items) {
        await saveSupabaseSale(userId, s);
      }
    } else if (collectionKey === 'customers' && Array.isArray(items)) {
      for (const c of items) {
        await saveSupabaseCustomer(userId, c);
      }
    } else if (collectionKey === 'suppliers' && Array.isArray(items)) {
      for (const sp of items) {
        await saveSupabaseSupplier(userId, sp);
      }
    } else if (collectionKey === 'expenses' && Array.isArray(items)) {
      for (const exp of items) {
        await saveSupabaseExpense(userId, exp);
      }
    } else if (collectionKey === 'purchases' && Array.isArray(items)) {
      for (const pur of items) {
        await saveSupabasePurchase(userId, pur);
      }
    } else if (collectionKey === 'onlineOrders' && Array.isArray(items)) {
      for (const o of items) {
        await saveSupabaseOnlineOrder(userId, o);
      }
    }

    // Touch user updated_at in Supabase
    await supabase.from('users').upsert({
      id: userId,
      updated_at: new Date().toISOString(),
    });
    console.log(`[Supabase DB Sync] Successfully saved ${collectionKey} to Supabase.`);
  } catch (sbErr) {
    console.warn(`[Supabase DB Sync] Notice saving ${collectionKey}:`, sbErr);
  }

  // 2. Non-blocking Firestore save (failsafe, will not throw if Firestore is removed)
  try {
    const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
    const sanitizedData = sanitizeForFirestore(data);
    const payload = {
      ...sanitizedData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err: any) {
    console.warn(`[CloudSync] Firestore write bypassed for ${collectionKey}:`, err?.message || err);
  }

  // 3. Local offline DB storage
  try {
    if (Array.isArray(data.items)) {
      offlineDb.setCollection(userId, collectionKey, data.items).catch(() => {});
    }
  } catch (e) {}

  return true;
}

/**
 * Atomically writes multiple businessData collections into Supabase
 */
export async function saveUserCloudCollectionsBatch(
  userId: string,
  collections: Record<string, Record<string, any>>
): Promise<boolean> {
  if (!userId || !userId.trim()) {
    return false;
  }
  for (const [collectionKey, data] of Object.entries(collections)) {
    await saveUserCloudCollection(userId, collectionKey, data);
  }
  return true;
}

function extractItems<T = any>(data: any, fieldName: string): T[] {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data[fieldName])) return data[fieldName];
  if (Array.isArray(data.list)) return data.list;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * Subscribes to real-time updates for all store business collections under users/{userId}/businessData/*
 */
export function subscribeToUserBusinessData(
  userId: string,
  callbacks: CloudBusinessDataCallbacks
): () => void {
  if (!userId || !userId.trim()) return () => {};

  console.log(`[AUTH] Supabase dashboard data loading started: userId=${userId}`);

  // Load latest data directly from Supabase PostgreSQL
  (async () => {
    try {
      const [prods, cats, sales, custs, supps, exps, purs, orders] = await Promise.all([
        getSupabaseProducts(userId),
        getSupabaseCategories(userId),
        getSupabaseSales(userId),
        getSupabaseCustomers(userId),
        getSupabaseSuppliers(userId),
        getSupabaseExpenses(userId),
        getSupabasePurchases(userId),
        getSupabaseOnlineOrders(userId),
      ]);

      if (prods && prods.length > 0) callbacks.onProductsLoaded?.(prods, true);
      if (cats && cats.length > 0) callbacks.onCategoriesLoaded?.(cats, true);
      if (sales && sales.length > 0) callbacks.onSalesLoaded?.(sales, true);
      if (custs && custs.length > 0) callbacks.onCustomersLoaded?.(custs, true);
      if (supps && supps.length > 0) callbacks.onSuppliersLoaded?.(supps, true);
      if (exps && exps.length > 0) callbacks.onExpensesLoaded?.(exps, true);
      if (purs && purs.length > 0) callbacks.onPurchasesLoaded?.(purs, true);
      if (orders && orders.length > 0) callbacks.onOnlineOrdersLoaded?.(orders, true);

      callbacks.onSyncStatusChanged?.('synced');
    } catch (sbLoadErr) {
      console.warn('[Supabase DB Initial Load Notice]:', sbLoadErr);
    }
  })();

  const unsubscribers: Unsubscribe[] = [];

  const attachListener = (
    collectionKey: string,
    onData: (data: any, exists: boolean) => void
  ) => {
    try {
      const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
      const unsub = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onData(docSnap.data(), true);
          } else {
            onData(null, false);
          }
        },
        (error) => {
          // Non-fatal if Firestore is removed; Supabase is the primary store
          console.warn(`[CloudSync] Firestore listener notice for ${collectionKey}:`, error?.message);
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      console.warn(`[CloudSync] Firestore listener bypassed for ${collectionKey}:`, e);
    }
  };

  // 1. Products
  attachListener('products', (data, exists) => {
    const items = extractItems(data, 'products');
    if (exists && items.length > 0) {
      console.log(`[AUTH] dashboard data loading completed: products=${items.length}`);
      offlineDb.setCollection(userId, 'products', items).catch(() => {});
      callbacks.onProductsLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'products', items).catch(() => {});
      callbacks.onProductsLoaded?.(items, true);
    } else {
      callbacks.onProductsLoaded?.([], false);
    }
  });

  // 2. Categories
  attachListener('categories', (data, exists) => {
    const items = extractItems(data, 'categories');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'categories', items).catch(() => {});
      callbacks.onCategoriesLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'categories', items).catch(() => {});
      callbacks.onCategoriesLoaded?.(items, true);
    } else {
      callbacks.onCategoriesLoaded?.([], false);
    }
  });

  // 3. Brands
  attachListener('brands', (data, exists) => {
    const items = extractItems(data, 'brands');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'brands', items).catch(() => {});
      callbacks.onBrandsLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'brands', items).catch(() => {});
      callbacks.onBrandsLoaded?.(items, true);
    } else {
      callbacks.onBrandsLoaded?.([], false);
    }
  });

  // 4. Customers
  attachListener('customers', (data, exists) => {
    const items = extractItems(data, 'customers');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'customers', items).catch(() => {});
      callbacks.onCustomersLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'customers', items).catch(() => {});
      callbacks.onCustomersLoaded?.(items, true);
    } else {
      callbacks.onCustomersLoaded?.([], false);
    }
  });

  // 5. Suppliers
  attachListener('suppliers', (data, exists) => {
    const items = extractItems(data, 'suppliers');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'suppliers', items).catch(() => {});
      callbacks.onSuppliersLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'suppliers', items).catch(() => {});
      callbacks.onSuppliersLoaded?.(items, true);
    } else {
      callbacks.onSuppliersLoaded?.([], false);
    }
  });

  // 6. Expenses
  attachListener('expenses', (data, exists) => {
    const items = extractItems(data, 'expenses');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'expenses', items).catch(() => {});
      callbacks.onExpensesLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'expenses', items).catch(() => {});
      callbacks.onExpensesLoaded?.(items, true);
    } else {
      callbacks.onExpensesLoaded?.([], false);
    }
  });

  // 7. Sales
  attachListener('sales', (data, exists) => {
    const items = extractItems(data, 'sales');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'sales', items).catch(() => {});
      callbacks.onSalesLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'sales', items).catch(() => {});
      callbacks.onSalesLoaded?.(items, true);
    } else {
      callbacks.onSalesLoaded?.([], false);
    }
  });

  // 8. Purchases
  attachListener('purchases', (data, exists) => {
    const items = extractItems(data, 'purchases');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'purchases', items).catch(() => {});
      callbacks.onPurchasesLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'purchases', items).catch(() => {});
      callbacks.onPurchasesLoaded?.(items, true);
    } else {
      callbacks.onPurchasesLoaded?.([], false);
    }
  });

  // 9. Stock Adjustments
  attachListener('adjustments', (data, exists) => {
    const items = extractItems(data, 'adjustments');
    if (exists && items.length > 0) {
      callbacks.onAdjustmentsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onAdjustmentsLoaded?.(items, true);
    } else {
      callbacks.onAdjustmentsLoaded?.([], false);
    }
  });

  // 10. Due Collections
  attachListener('dueCollections', (data, exists) => {
    const items = extractItems(data, 'dueCollections');
    if (exists && items.length > 0) {
      callbacks.onDueCollectionsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onDueCollectionsLoaded?.(items, true);
    } else {
      callbacks.onDueCollectionsLoaded?.([], false);
    }
  });

  // 10b. Investments (Capital & Investment)
  attachListener('investments', (data, exists) => {
    const items = extractItems<Investment>(data, 'investments');
    if (exists && items.length > 0) {
      callbacks.onInvestmentsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onInvestmentsLoaded?.(items, true);
    } else {
      callbacks.onInvestmentsLoaded?.([], false);
    }
  });

  // 10c. Capital Withdrawals
  attachListener('capitalWithdrawals', (data, exists) => {
    const items = extractItems<CapitalWithdrawal>(data, 'capitalWithdrawals');
    if (exists && items.length > 0) {
      callbacks.onCapitalWithdrawalsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onCapitalWithdrawalsLoaded?.(items, true);
    } else {
      callbacks.onCapitalWithdrawalsLoaded?.([], false);
    }
  });

  // 11. Team Members
  attachListener('team', (data, exists) => {
    const items = extractItems(data, 'team');
    if (exists && items.length > 0) {
      callbacks.onTeamLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onTeamLoaded?.(items, true);
    } else {
      callbacks.onTeamLoaded?.([], false);
    }
  });

  // 11b. Employee Registered Devices
  attachListener('devices', (data, exists) => {
    const items = extractItems<EmployeeDevice>(data, 'devices');
    if (exists && items.length > 0) {
      callbacks.onDevicesLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onDevicesLoaded?.(items, true);
    } else {
      callbacks.onDevicesLoaded?.([], false);
    }
  });

  // 12. Payroll
  attachListener('payroll', (data, exists) => {
    if (exists && data) {
      callbacks.onPayrollLoaded?.(
        {
          employees: Array.isArray(data.employees) ? data.employees : [],
          payments: Array.isArray(data.payments) ? data.payments : [],
          adjustments: Array.isArray(data.adjustments) ? data.adjustments : [],
        },
        true
      );
    } else {
      callbacks.onPayrollLoaded?.({ employees: [], payments: [], adjustments: [] }, false);
    }
  });

  // 13. Audit Logs
  attachListener('auditLogs', (data, exists) => {
    const items = extractItems(data, 'auditLogs');
    if (exists && items.length > 0) {
      callbacks.onAuditLogsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onAuditLogsLoaded?.(items, true);
    } else {
      callbacks.onAuditLogsLoaded?.([], false);
    }
  });

  // 14. Loyalty
  attachListener('loyalty', (data, exists) => {
    if (exists && data && (data.settings || data.enabled !== undefined)) {
      const settingsObj = data.settings || data;
      callbacks.onLoyaltyLoaded?.(settingsObj, true);
    } else {
      callbacks.onLoyaltyLoaded?.(
        {
          enabled: true,
          pointsPerAmount: 1,
          spendingAmountUnit: 100,
          pointRedemptionValue: 1,
          minPointsToRedeem: 50,
        },
        false
      );
    }
  });

  // 15. QR Tracking
  attachListener('qrTracking', (data, exists) => {
    if (exists && data) {
      callbacks.onQrTrackingLoaded?.(
        {
          generatedCodes: Array.isArray(data.generatedCodes) ? data.generatedCodes : [],
          productQRCounts: (data.productQRCounts && typeof data.productQRCounts === 'object') ? data.productQRCounts : {},
        },
        true
      );
    } else {
      callbacks.onQrTrackingLoaded?.({ generatedCodes: [], productQRCounts: {} }, false);
    }
  });

  // 16. Business Settings
  attachListener('settings', (data, exists) => {
    if (exists && data && data.settings) {
      callbacks.onSettingsLoaded?.(data.settings, true);
    }
  });

  // 17. Notifications
  attachListener('notifications', (data, exists) => {
    if (exists && data) {
      callbacks.onNotificationsLoaded?.(
        {
          manual: Array.isArray(data.manual) ? data.manual : (Array.isArray(data.items) ? data.items : []),
          readMap: (data.readMap && typeof data.readMap === 'object') ? data.readMap : {},
        },
        true
      );
    }
  });

  // 18. Online Orders
  attachListener('onlineOrders', (data, exists) => {
    const items = extractItems<OnlineOrder>(data, 'onlineOrders');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'onlineOrders', items).catch(() => {});
      callbacks.onOnlineOrdersLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'onlineOrders', items).catch(() => {});
      callbacks.onOnlineOrdersLoaded?.(items, true);
    } else {
      callbacks.onOnlineOrdersLoaded?.([], false);
    }
  });

  // 19. Online Customers
  attachListener('onlineCustomers', (data, exists) => {
    const items = extractItems<OnlineCustomer>(data, 'onlineCustomers');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'onlineCustomers', items).catch(() => {});
      callbacks.onOnlineCustomersLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'onlineCustomers', items).catch(() => {});
      callbacks.onOnlineCustomersLoaded?.(items, true);
    } else {
      callbacks.onOnlineCustomersLoaded?.([], false);
    }
  });

  // 20. Online Products
  attachListener('onlineProducts', (data, exists) => {
    const items = extractItems<OnlineProduct>(data, 'onlineProducts');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'onlineProducts', items).catch(() => {});
      callbacks.onOnlineProductsLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'onlineProducts', items).catch(() => {});
      callbacks.onOnlineProductsLoaded?.(items, true);
    } else {
      callbacks.onOnlineProductsLoaded?.([], false);
    }
  });

  // 21. Online Business Settings
  attachListener('onlineSettings', (data, exists) => {
    if (exists && data && data.settings) {
      offlineDb.setCollection(userId, 'onlineSettings', [data.settings]).catch(() => {});
      callbacks.onOnlineSettingsLoaded?.(data.settings, true);
    } else if (exists && data && data.enabled !== undefined) {
      offlineDb.setCollection(userId, 'onlineSettings', [data as OnlineBusinessSettings]).catch(() => {});
      callbacks.onOnlineSettingsLoaded?.(data as OnlineBusinessSettings, true);
    }
  });

  // 22. Personal Ledger Contacts ("ব্যক্তিগত খাতা" পরিচিতি)
  attachListener('personalLedgerContacts', (data, exists) => {
    const items = extractItems<PersonalContact>(data, 'personalLedgerContacts');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'personalLedgerContacts', items).catch(() => {});
      callbacks.onPersonalContactsLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'personalLedgerContacts', items).catch(() => {});
      callbacks.onPersonalContactsLoaded?.(items, true);
    } else {
      callbacks.onPersonalContactsLoaded?.([], false);
    }
  });

  // 23. Personal Ledger Transactions ("ব্যক্তিগত খাতা" লেনদেন)
  attachListener('personalLedgerTransactions', (data, exists) => {
    const items = extractItems<PersonalTransaction>(data, 'personalLedgerTransactions');
    if (exists && items.length > 0) {
      offlineDb.setCollection(userId, 'personalLedgerTransactions', items).catch(() => {});
      callbacks.onPersonalTransactionsLoaded?.(items, true);
    } else if (exists && data) {
      offlineDb.setCollection(userId, 'personalLedgerTransactions', items).catch(() => {});
      callbacks.onPersonalTransactionsLoaded?.(items, true);
    } else {
      callbacks.onPersonalTransactionsLoaded?.([], false);
    }
  });

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {}
    });
  };
}

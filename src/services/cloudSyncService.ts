import { doc, setDoc, writeBatch, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  onTeamLoaded?: (team: TeamMember[], fromCloud: boolean) => void;
  onDevicesLoaded?: (devices: EmployeeDevice[], fromCloud: boolean) => void;
  onPayrollLoaded?: (payroll: { employees: Employee[]; payments: PayrollPayment[]; adjustments: SalaryAdjustment[] }, fromCloud: boolean) => void;
  onAuditLogsLoaded?: (logs: AuditLogEntry[], fromCloud: boolean) => void;
  onLoyaltyLoaded?: (loyalty: CustomerLoyaltySettings, fromCloud: boolean) => void;
  onQrTrackingLoaded?: (qr: { generatedCodes: string[]; productQRCounts: Record<string, number> }, fromCloud: boolean) => void;
  onSettingsLoaded?: (settings: Partial<BusinessSettings>, fromCloud: boolean) => void;
  onNotificationsLoaded?: (notifs: { manual: AppNotification[]; readMap: Record<string, boolean> }, fromCloud: boolean) => void;
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
    console.error(`[CloudSync] Cannot save ${collectionKey}: User ID is missing.`);
    throw new Error(`Authentication required to save ${collectionKey}.`);
  }
  try {
    const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
    const sanitizedData = sanitizeForFirestore(data);
    const payload = {
      ...sanitizedData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    console.log(`[CloudSync] Successfully saved ${collectionKey} for user ${userId} to Firestore.`);
    return true;
  } catch (err: any) {
    console.error(`[CloudSync] Error saving ${collectionKey} for user ${userId}:`, err);
    throw new Error(`Failed to persist ${collectionKey} in cloud database: ${err?.message || err}`);
  }
}

/**
 * Atomically writes multiple businessData collections in a single Firestore writeBatch
 */
export async function saveUserCloudCollectionsBatch(
  userId: string,
  collections: Record<string, Record<string, any>>
): Promise<boolean> {
  if (!userId || !userId.trim()) {
    console.error(`[CloudSync] Cannot commit batch: User ID is missing.`);
    throw new Error(`Authentication required to commit cloud database batch.`);
  }
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    for (const [collectionKey, data] of Object.entries(collections)) {
      const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
      const sanitizedData = sanitizeForFirestore(data);
      batch.set(
        docRef,
        {
          ...sanitizedData,
          updatedAt: now,
        },
        { merge: true }
      );
    }
    await batch.commit();
    console.log(`[CloudSync] Successfully committed batch (${Object.keys(collections).join(', ')}) for user ${userId} to Firestore.`);
    return true;
  } catch (err: any) {
    console.error(`[CloudSync] Error committing batch write for user ${userId}:`, err);
    throw new Error(`Failed to commit atomic batch to cloud database: ${err?.message || err}`);
  }
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

  console.log(`[AUTH] dashboard data loading started: userId=${userId}`);

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
          console.warn(`[CloudSync] Error listening to ${collectionKey}:`, error);
          if (callbacks.onSyncStatusChanged) {
            callbacks.onSyncStatusChanged('error');
          }
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      console.warn(`[CloudSync] Failed to attach listener for ${collectionKey}:`, e);
    }
  };

  // 1. Products
  attachListener('products', (data, exists) => {
    const items = extractItems(data, 'products');
    if (exists && items.length > 0) {
      console.log(`[AUTH] dashboard data loading completed: products=${items.length}`);
      callbacks.onProductsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onProductsLoaded?.(items, true);
    } else {
      callbacks.onProductsLoaded?.([], false);
    }
  });

  // 2. Categories
  attachListener('categories', (data, exists) => {
    const items = extractItems(data, 'categories');
    if (exists && items.length > 0) {
      callbacks.onCategoriesLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onCategoriesLoaded?.(items, true);
    } else {
      callbacks.onCategoriesLoaded?.([], false);
    }
  });

  // 3. Brands
  attachListener('brands', (data, exists) => {
    const items = extractItems(data, 'brands');
    if (exists && items.length > 0) {
      callbacks.onBrandsLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onBrandsLoaded?.(items, true);
    } else {
      callbacks.onBrandsLoaded?.([], false);
    }
  });

  // 4. Customers
  attachListener('customers', (data, exists) => {
    const items = extractItems(data, 'customers');
    if (exists && items.length > 0) {
      callbacks.onCustomersLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onCustomersLoaded?.(items, true);
    } else {
      callbacks.onCustomersLoaded?.([], false);
    }
  });

  // 5. Suppliers
  attachListener('suppliers', (data, exists) => {
    const items = extractItems(data, 'suppliers');
    if (exists && items.length > 0) {
      callbacks.onSuppliersLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onSuppliersLoaded?.(items, true);
    } else {
      callbacks.onSuppliersLoaded?.([], false);
    }
  });

  // 6. Expenses
  attachListener('expenses', (data, exists) => {
    const items = extractItems(data, 'expenses');
    if (exists && items.length > 0) {
      callbacks.onExpensesLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onExpensesLoaded?.(items, true);
    } else {
      callbacks.onExpensesLoaded?.([], false);
    }
  });

  // 7. Sales
  attachListener('sales', (data, exists) => {
    const items = extractItems(data, 'sales');
    if (exists && items.length > 0) {
      callbacks.onSalesLoaded?.(items, true);
    } else if (exists && data) {
      callbacks.onSalesLoaded?.(items, true);
    } else {
      callbacks.onSalesLoaded?.([], false);
    }
  });

  // 8. Purchases
  attachListener('purchases', (data, exists) => {
    const items = extractItems(data, 'purchases');
    if (exists && items.length > 0) {
      callbacks.onPurchasesLoaded?.(items, true);
    } else if (exists && data) {
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

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {}
    });
  };
}

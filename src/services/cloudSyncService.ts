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
  TeamMember,
  Employee,
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
  onTeamLoaded?: (team: TeamMember[], fromCloud: boolean) => void;
  onPayrollLoaded?: (payroll: { employees: Employee[]; payments: PayrollPayment[]; adjustments: SalaryAdjustment[] }, fromCloud: boolean) => void;
  onAuditLogsLoaded?: (logs: AuditLogEntry[], fromCloud: boolean) => void;
  onLoyaltyLoaded?: (loyalty: CustomerLoyaltySettings, fromCloud: boolean) => void;
  onQrTrackingLoaded?: (qr: { generatedCodes: string[]; productQRCounts: Record<string, number> }, fromCloud: boolean) => void;
  onSettingsLoaded?: (settings: Partial<BusinessSettings>, fromCloud: boolean) => void;
  onNotificationsLoaded?: (notifs: { manual: AppNotification[]; readMap: Record<string, boolean> }, fromCloud: boolean) => void;
  onSyncStatusChanged?: (status: 'synced' | 'syncing' | 'offline' | 'error') => void;
}

/**
 * Helper to write document in user's businessData subcollection in Firestore
 */
export async function saveUserCloudCollection(
  userId: string,
  collectionKey: string,
  data: Record<string, any>
): Promise<boolean> {
  if (!userId || !userId.trim()) return false;
  try {
    const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error(`[CloudSync] Error saving ${collectionKey} for user ${userId}:`, err);
    return false;
  }
}

/**
 * Atomically writes multiple businessData collections in a single Firestore writeBatch
 */
export async function saveUserCloudCollectionsBatch(
  userId: string,
  collections: Record<string, Record<string, any>>
): Promise<boolean> {
  if (!userId || !userId.trim()) return false;
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    for (const [collectionKey, data] of Object.entries(collections)) {
      const docRef = doc(db, 'users', userId, 'businessData', collectionKey);
      batch.set(
        docRef,
        {
          ...data,
          updatedAt: now,
        },
        { merge: true }
      );
    }
    await batch.commit();
    return true;
  } catch (err) {
    console.error(`[CloudSync] Error committing batch write for user ${userId}:`, err);
    return false;
  }
}

/**
 * Subscribes to real-time updates for all store business collections under users/{userId}/businessData/*
 */
export function subscribeToUserBusinessData(
  userId: string,
  callbacks: CloudBusinessDataCallbacks
): () => void {
  if (!userId || !userId.trim()) return () => {};

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
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onProductsLoaded?.(data.items, true);
    } else {
      callbacks.onProductsLoaded?.([], false);
    }
  });

  // 2. Categories
  attachListener('categories', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onCategoriesLoaded?.(data.items, true);
    } else {
      callbacks.onCategoriesLoaded?.([], false);
    }
  });

  // 3. Brands
  attachListener('brands', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onBrandsLoaded?.(data.items, true);
    } else {
      callbacks.onBrandsLoaded?.([], false);
    }
  });

  // 4. Customers
  attachListener('customers', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onCustomersLoaded?.(data.items, true);
    } else {
      callbacks.onCustomersLoaded?.([], false);
    }
  });

  // 5. Suppliers
  attachListener('suppliers', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onSuppliersLoaded?.(data.items, true);
    } else {
      callbacks.onSuppliersLoaded?.([], false);
    }
  });

  // 6. Expenses
  attachListener('expenses', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onExpensesLoaded?.(data.items, true);
    } else {
      callbacks.onExpensesLoaded?.([], false);
    }
  });

  // 7. Sales
  attachListener('sales', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onSalesLoaded?.(data.items, true);
    } else {
      callbacks.onSalesLoaded?.([], false);
    }
  });

  // 8. Purchases
  attachListener('purchases', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onPurchasesLoaded?.(data.items, true);
    } else {
      callbacks.onPurchasesLoaded?.([], false);
    }
  });

  // 9. Stock Adjustments
  attachListener('adjustments', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onAdjustmentsLoaded?.(data.items, true);
    } else {
      callbacks.onAdjustmentsLoaded?.([], false);
    }
  });

  // 10. Due Collections
  attachListener('dueCollections', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onDueCollectionsLoaded?.(data.items, true);
    } else {
      callbacks.onDueCollectionsLoaded?.([], false);
    }
  });

  // 11. Team Members
  attachListener('team', (data, exists) => {
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onTeamLoaded?.(data.items, true);
    } else {
      callbacks.onTeamLoaded?.([], false);
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
    if (exists && data && Array.isArray(data.items)) {
      callbacks.onAuditLogsLoaded?.(data.items, true);
    } else {
      callbacks.onAuditLogsLoaded?.([], false);
    }
  });

  // 14. Loyalty
  attachListener('loyalty', (data, exists) => {
    if (exists && data && data.settings) {
      callbacks.onLoyaltyLoaded?.(data.settings, true);
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
          manual: Array.isArray(data.manual) ? data.manual : [],
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

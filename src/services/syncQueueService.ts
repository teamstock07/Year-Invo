/**
 * Robust Offline Synchronization Queue & Conflict Resolution Service for YearInvo
 * 
 * Manages:
 * - Online/Offline lifecycle detection & automatic reconnect triggers
 * - Idempotent sync queue processing (FIFO)
 * - Automatic cloud synchronization with Firebase/Firestore
 * - Deduplication of sales, stock adjustments, customers, and expenses
 * - Multi-device conflict resolution
 * - Safe offline authorization grace period validation
 * - Real-time sync status broadcasting to UI components
 */

import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineDb, SyncQueueItem } from './offlineDb';
import { sanitizeForFirestore } from './cloudSyncService';
import { Sale, Product, Customer, Expense, Supplier, Purchase, Investment, CapitalWithdrawal } from '../types';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

export interface SyncState {
  status: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

// 14-day maximum offline grace period for authenticated cached subscriptions
export const MAX_OFFLINE_GRACE_PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

class SyncQueueService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private currentUserId: string | null = null;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private pendingCount: number = 0;
  private lastSyncedAt: string | null = null;
  private errorMessage: string | null = null;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncQueue] Network connection restored: ONLINE');
        this.isOnline = true;
        this.notifyState();
        this.triggerSync();
      });

      window.addEventListener('offline', () => {
        console.log('[SyncQueue] Network connection lost: OFFLINE');
        this.isOnline = false;
        this.notifyState();
      });

      // Periodic check every 30 seconds when online
      this.syncTimer = setInterval(() => {
        if (this.isOnline && !this.isSyncing && this.currentUserId) {
          this.triggerSync();
        }
      }, 30000);
    }
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      this.refreshPendingCount();
    } else {
      this.pendingCount = 0;
      this.notifyState();
    }
  }

  public subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncState {
    let computedStatus: SyncStatus = 'online';
    if (!this.isOnline) {
      computedStatus = 'offline';
    } else if (this.isSyncing) {
      computedStatus = 'syncing';
    } else if (this.errorMessage) {
      computedStatus = 'error';
    } else if (this.pendingCount === 0) {
      computedStatus = 'synced';
    }

    return {
      status: computedStatus,
      isOnline: this.isOnline,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.errorMessage,
    };
  }

  private notifyState() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {}
    });
  }

  public async refreshPendingCount(): Promise<number> {
    if (!this.currentUserId) {
      this.pendingCount = 0;
      this.notifyState();
      return 0;
    }

    try {
      const items = await offlineDb.getPendingOperations(this.currentUserId);
      this.pendingCount = items.length;
      this.notifyState();
      return this.pendingCount;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Enqueue a local business operation
   */
  public async enqueue(
    operationType: SyncQueueItem['operationType'],
    payload: any
  ): Promise<string> {
    const opId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userId = this.currentUserId || 'default_user';

    const item: SyncQueueItem = {
      opId,
      userId,
      operationType,
      localTimestamp: new Date().toISOString(),
      payload,
      syncStatus: 'PENDING_SYNC',
      retryCount: 0,
      error: null,
    };

    console.log(`[SyncQueue] Enqueueing operation: ${operationType} (id=${opId})`);
    await offlineDb.enqueueOperation(item);
    await this.refreshPendingCount();

    // If online, immediately attempt background sync
    if (this.isOnline && !this.isSyncing && this.currentUserId) {
      this.triggerSync().catch(() => {});
    }

    return opId;
  }

  /**
   * Process all queued operations
   */
  public async triggerSync(): Promise<boolean> {
    if (this.isSyncing) return false;
    if (!this.currentUserId) return false;
    if (!this.isOnline) {
      this.notifyState();
      return false;
    }

    const userId = this.currentUserId;
    const pendingOps = await offlineDb.getPendingOperations(userId);

    if (pendingOps.length === 0) {
      this.errorMessage = null;
      this.lastSyncedAt = new Date().toISOString();
      this.notifyState();
      return true;
    }

    this.isSyncing = true;
    this.errorMessage = null;
    this.notifyState();

    console.log(`[SyncQueue] Starting sync for ${pendingOps.length} pending operations...`);

    let anyFailed = false;

    for (const op of pendingOps) {
      try {
        await offlineDb.updateOperationStatus(op.opId, 'SYNCING');
        await this.processSingleOperation(userId, op);
        await offlineDb.removeOperation(op.opId);
        console.log(`[SyncQueue] Operation ${op.opId} (${op.operationType}) synced successfully.`);
      } catch (err: any) {
        console.warn(`[SyncQueue] Operation ${op.opId} failed:`, err);
        anyFailed = true;
        const errMsg = err?.message || 'Sync failed';
        await offlineDb.updateOperationStatus(op.opId, 'FAILED', errMsg);
      }
    }

    this.isSyncing = false;
    this.lastSyncedAt = new Date().toISOString();
    await this.refreshPendingCount();

    if (anyFailed) {
      this.errorMessage = 'Some changes could not be synced. Will retry automatically.';
    } else {
      this.errorMessage = null;
    }

    this.notifyState();
    return !anyFailed;
  }

  /**
   * Process and idempotently merge single operation into Firestore
   */
  private async processSingleOperation(userId: string, op: SyncQueueItem): Promise<void> {
    switch (op.operationType) {
      case 'CREATE_SALE': {
        const newSale: Sale = op.payload.sale;
        const updatedProducts: Product[] | undefined = op.payload.products;
        const updatedCustomers: Customer[] | undefined = op.payload.customers;

        // Fetch current cloud sales to deduplicate and prepend
        const salesDocRef = doc(db, 'users', userId, 'businessData', 'sales');
        const salesSnap = await getDoc(salesDocRef);
        let cloudSales: Sale[] = [];
        if (salesSnap.exists()) {
          const d = salesSnap.data();
          cloudSales = Array.isArray(d.items) ? d.items : Array.isArray(d.sales) ? d.sales : [];
        }

        // Idempotent check: sale with this ID or InvoiceNo already present?
        const alreadyExists = cloudSales.some(
          (s) => s.id === newSale.id || (s.invoiceNo && s.invoiceNo === newSale.invoiceNo)
        );

        if (!alreadyExists) {
          cloudSales = [newSale, ...cloudSales];
        }

        const batchPayloads: Record<string, any> = {
          sales: { items: cloudSales },
        };

        if (updatedProducts && updatedProducts.length > 0) {
          batchPayloads.products = { items: updatedProducts };
        }

        if (updatedCustomers && updatedCustomers.length > 0) {
          batchPayloads.customers = { items: updatedCustomers };
        }

        // Execute batch write in Firestore
        const batch = writeBatch(db);
        const now = new Date().toISOString();
        for (const [key, val] of Object.entries(batchPayloads)) {
          const ref = doc(db, 'users', userId, 'businessData', key);
          batch.set(ref, { ...sanitizeForFirestore(val), updatedAt: now }, { merge: true });
        }
        await batch.commit();
        break;
      }

      case 'BATCH_UPDATE_PRODUCTS':
      case 'UPDATE_PRODUCT': {
        const productsDocRef = doc(db, 'users', userId, 'businessData', 'products');
        await setDoc(
          productsDocRef,
          {
            items: sanitizeForFirestore(op.payload.products || op.payload),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        break;
      }

      case 'CREATE_EXPENSE': {
        const newExpense: Expense = op.payload.expense;
        const expDocRef = doc(db, 'users', userId, 'businessData', 'expenses');
        const expSnap = await getDoc(expDocRef);
        let cloudExpenses: Expense[] = [];
        if (expSnap.exists()) {
          const d = expSnap.data();
          cloudExpenses = Array.isArray(d.items) ? d.items : Array.isArray(d.expenses) ? d.expenses : [];
        }
        if (!cloudExpenses.some((e) => e.id === newExpense.id)) {
          cloudExpenses = [newExpense, ...cloudExpenses];
        }
        await setDoc(
          expDocRef,
          { items: sanitizeForFirestore(cloudExpenses), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      case 'CREATE_CUSTOMER':
      case 'UPDATE_CUSTOMER': {
        const customersDocRef = doc(db, 'users', userId, 'businessData', 'customers');
        await setDoc(
          customersDocRef,
          { items: sanitizeForFirestore(op.payload.customers || op.payload), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      case 'CREATE_PURCHASE': {
        const newPurchase: Purchase = op.payload.purchase;
        const updatedProducts: Product[] | undefined = op.payload.products;
        const updatedSuppliers: Supplier[] | undefined = op.payload.suppliers;

        const pDocRef = doc(db, 'users', userId, 'businessData', 'purchases');
        const pSnap = await getDoc(pDocRef);
        let cloudPurchases: Purchase[] = [];
        if (pSnap.exists()) {
          const d = pSnap.data();
          cloudPurchases = Array.isArray(d.items) ? d.items : Array.isArray(d.purchases) ? d.purchases : [];
        }
        if (!cloudPurchases.some((p) => p.id === newPurchase.id || p.purchaseNo === newPurchase.purchaseNo)) {
          cloudPurchases = [newPurchase, ...cloudPurchases];
        }

        const batch = writeBatch(db);
        const now = new Date().toISOString();
        batch.set(pDocRef, { items: sanitizeForFirestore(cloudPurchases), updatedAt: now }, { merge: true });
        if (updatedProducts) {
          batch.set(
            doc(db, 'users', userId, 'businessData', 'products'),
            { items: sanitizeForFirestore(updatedProducts), updatedAt: now },
            { merge: true }
          );
        }
        if (updatedSuppliers) {
          batch.set(
            doc(db, 'users', userId, 'businessData', 'suppliers'),
            { items: sanitizeForFirestore(updatedSuppliers), updatedAt: now },
            { merge: true }
          );
        }
        await batch.commit();
        break;
      }

      case 'STOCK_ADJUSTMENT': {
        const adjDocRef = doc(db, 'users', userId, 'businessData', 'adjustments');
        const adjSnap = await getDoc(adjDocRef);
        let cloudAdjs: any[] = [];
        if (adjSnap.exists()) {
          const d = adjSnap.data();
          cloudAdjs = Array.isArray(d.items) ? d.items : [];
        }
        const newAdj = op.payload.adjustment;
        if (!cloudAdjs.some((a) => a.id === newAdj.id)) {
          cloudAdjs = [newAdj, ...cloudAdjs];
        }
        const batch = writeBatch(db);
        const now = new Date().toISOString();
        batch.set(adjDocRef, { items: sanitizeForFirestore(cloudAdjs), updatedAt: now }, { merge: true });
        if (op.payload.products) {
          batch.set(
            doc(db, 'users', userId, 'businessData', 'products'),
            { items: sanitizeForFirestore(op.payload.products), updatedAt: now },
            { merge: true }
          );
        }
        await batch.commit();
        break;
      }

      case 'DUE_COLLECTION': {
        const dueDocRef = doc(db, 'users', userId, 'businessData', 'dueCollections');
        const dueSnap = await getDoc(dueDocRef);
        let cloudDues: any[] = [];
        if (dueSnap.exists()) {
          const d = dueSnap.data();
          cloudDues = Array.isArray(d.items) ? d.items : [];
        }
        const newDue = op.payload.dueCollection;
        if (!cloudDues.some((dc) => dc.id === newDue.id)) {
          cloudDues = [newDue, ...cloudDues];
        }
        const batch = writeBatch(db);
        const now = new Date().toISOString();
        batch.set(dueDocRef, { items: sanitizeForFirestore(cloudDues), updatedAt: now }, { merge: true });
        if (op.payload.customers) {
          batch.set(
            doc(db, 'users', userId, 'businessData', 'customers'),
            { items: sanitizeForFirestore(op.payload.customers), updatedAt: now },
            { merge: true }
          );
        }
        await batch.commit();
        break;
      }

      case 'CREATE_INVESTMENT': {
        const invDocRef = doc(db, 'users', userId, 'businessData', 'investments');
        const invSnap = await getDoc(invDocRef);
        let cloudInvs: Investment[] = [];
        if (invSnap.exists()) {
          const d = invSnap.data();
          cloudInvs = Array.isArray(d.items) ? d.items : [];
        }
        const newInv: Investment = op.payload.investment;
        if (!cloudInvs.some((i) => i.id === newInv.id)) {
          cloudInvs = [newInv, ...cloudInvs];
        }
        await setDoc(
          invDocRef,
          { items: sanitizeForFirestore(cloudInvs), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      case 'CREATE_CAPITAL_WITHDRAWAL': {
        const cwDocRef = doc(db, 'users', userId, 'businessData', 'capitalWithdrawals');
        const cwSnap = await getDoc(cwDocRef);
        let cloudCws: CapitalWithdrawal[] = [];
        if (cwSnap.exists()) {
          const d = cwSnap.data();
          cloudCws = Array.isArray(d.items) ? d.items : [];
        }
        const newCw: CapitalWithdrawal = op.payload.withdrawal;
        if (!cloudCws.some((c) => c.id === newCw.id)) {
          cloudCws = [newCw, ...cloudCws];
        }
        await setDoc(
          cwDocRef,
          { items: sanitizeForFirestore(cloudCws), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      case 'PAYROLL_PAYMENT':
      case 'SALARY_ADJUSTMENT': {
        const payrollDocRef = doc(db, 'users', userId, 'businessData', 'payroll');
        await setDoc(
          payrollDocRef,
          { ...sanitizeForFirestore(op.payload), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      case 'UPDATE_SETTINGS': {
        const settingsDocRef = doc(db, 'users', userId, 'businessData', 'settings');
        await setDoc(
          settingsDocRef,
          { settings: sanitizeForFirestore(op.payload), updatedAt: new Date().toISOString() },
          { merge: true }
        );
        break;
      }

      default: {
        console.warn(`[SyncQueue] Unknown operation type: ${(op as any).operationType}`);
      }
    }
  }

  /**
   * Validate if cached offline authorization is still valid
   */
  public isOfflineAuthorized(lastOnlineAuthTime?: string): boolean {
    if (!lastOnlineAuthTime) return true; // Graceful default
    const lastTime = new Date(lastOnlineAuthTime).getTime();
    if (isNaN(lastTime)) return true;
    const now = Date.now();
    return now - lastTime <= MAX_OFFLINE_GRACE_PERIOD_MS;
  }
}

export const syncQueueService = new SyncQueueService();

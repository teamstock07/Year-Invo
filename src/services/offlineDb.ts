/**
 * Offline-First IndexedDB Persistence Layer for YearInvo
 * 
 * Provides robust, non-volatile local database storage for:
 * - Products, Categories, Brands
 * - Inventory & Stock Adjustments
 * - Sales, POS Invoices & Cart
 * - Customers, Suppliers, Due Collections
 * - Expenses, Purchases, Investments, Capital Withdrawals
 * - Team Members, Registered Devices, Payroll, Audit Logs
 * - Pending Sync Operations (Sync Queue)
 * - Offline Authorization & Sync Metadata
 * 
 * Compatible across Web, Desktop (Electron/PWA), and Mobile (PWA/Capacitor/WebView).
 */

const DB_NAME = 'YearInvo_OfflineDB';
const DB_VERSION = 2;

export interface SyncQueueItem {
  opId: string;
  userId: string;
  storeId?: string;
  operationType:
    | 'CREATE_SALE'
    | 'UPDATE_PRODUCT'
    | 'BATCH_UPDATE_PRODUCTS'
    | 'CREATE_EXPENSE'
    | 'CREATE_CUSTOMER'
    | 'UPDATE_CUSTOMER'
    | 'CREATE_SUPPLIER'
    | 'UPDATE_SUPPLIER'
    | 'CREATE_PURCHASE'
    | 'STOCK_ADJUSTMENT'
    | 'DUE_COLLECTION'
    | 'CREATE_INVESTMENT'
    | 'CREATE_CAPITAL_WITHDRAWAL'
    | 'PAYROLL_PAYMENT'
    | 'SALARY_ADJUSTMENT'
    | 'UPDATE_SETTINGS';
  localTimestamp: string;
  payload: any;
  syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastSyncAttempt?: string;
  error?: string | null;
}

export interface SyncMetadata {
  userId: string;
  lastSyncedAt: string;
  lastAuthValidationAt: string;
  subscriptionPlan: string;
  subscriptionExpiryDate?: string;
  deviceId: string;
  totalPendingOperations: number;
}

class OfflineDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private openDB(): Promise<IDBDatabase> {
    if (!this.isSupported) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Object Stores for core business collections (scoped by userId or record id)
          const storeNames = [
            'products',
            'categories',
            'brands',
            'customers',
            'suppliers',
            'expenses',
            'sales',
            'purchases',
            'adjustments',
            'dueCollections',
            'investments',
            'capitalWithdrawals',
            'team',
            'devices',
            'payroll',
            'auditLogs',
            'loyalty',
            'settings',
            'syncQueue',
            'syncMetadata',
          ];

          for (const storeName of storeNames) {
            if (!db.objectStoreNames.contains(storeName)) {
              if (storeName === 'syncQueue') {
                const qStore = db.createObjectStore('syncQueue', { keyPath: 'opId' });
                qStore.createIndex('userId', 'userId', { unique: false });
                qStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                qStore.createIndex('localTimestamp', 'localTimestamp', { unique: false });
              } else if (storeName === 'syncMetadata') {
                db.createObjectStore('syncMetadata', { keyPath: 'userId' });
              } else {
                const store = db.createObjectStore(storeName, { keyPath: 'storeKey' });
                store.createIndex('userId', 'userId', { unique: false });
              }
            }
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[OfflineDB] Failed to open IndexedDB:', request.error);
          this.dbPromise = null;
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('[OfflineDB] IndexedDB open request blocked by another connection');
        };
      } catch (err) {
        console.warn('[OfflineDB] Exception initializing IndexedDB:', err);
        this.dbPromise = null;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Save a user-scoped collection to IndexedDB
   */
  async setCollection<T = any>(userId: string, collectionName: string, items: T[]): Promise<void> {
    if (!userId) return;
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(collectionName, 'readwrite');
          const store = tx.objectStore(collectionName);
          const record = {
            storeKey: `${userId}_${collectionName}`,
            userId,
            items,
            updatedAt: new Date().toISOString(),
          };
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    } catch (err) {
      // Fallback to localStorage
      try {
        localStorage.setItem(`idb_fallback_${collectionName}_${userId}`, JSON.stringify(items));
      } catch (e) {}
    }
  }

  /**
   * Read a user-scoped collection from IndexedDB
   */
  async getCollection<T = any>(userId: string, collectionName: string): Promise<T[] | null> {
    if (!userId) return null;
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(collectionName, 'readonly');
          const store = tx.objectStore(collectionName);
          const req = store.get(`${userId}_${collectionName}`);
          req.onsuccess = () => {
            if (req.result && Array.isArray(req.result.items)) {
              resolve(req.result.items);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => {
            resolve(null);
          };
        } catch (e) {
          resolve(null);
        }
      });
    } catch (err) {
      try {
        const fallback = localStorage.getItem(`idb_fallback_${collectionName}_${userId}`);
        return fallback ? JSON.parse(fallback) : null;
      } catch (e) {
        return null;
      }
    }
  }

  /**
   * Enqueue an offline operation into the sync queue
   */
  async enqueueOperation(item: SyncQueueItem): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          const req = store.put(item);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    } catch (err) {
      // LocalStorage fallback for sync queue
      try {
        const saved = localStorage.getItem(`biz_sync_queue_${item.userId}`);
        const list: SyncQueueItem[] = saved ? JSON.parse(saved) : [];
        const filtered = list.filter((i) => i.opId !== item.opId);
        filtered.push(item);
        localStorage.setItem(`biz_sync_queue_${item.userId}`, JSON.stringify(filtered));
      } catch (e) {}
    }
  }

  /**
   * Get all pending operations for a user
   */
  async getPendingOperations(userId: string): Promise<SyncQueueItem[]> {
    if (!userId) return [];
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('syncQueue', 'readonly');
          const store = tx.objectStore('syncQueue');
          const req = store.getAll();
          req.onsuccess = () => {
            const allItems: SyncQueueItem[] = req.result || [];
            const userPending = allItems
              .filter((item) => item.userId === userId && (item.syncStatus === 'PENDING_SYNC' || item.syncStatus === 'FAILED' || item.syncStatus === 'SYNCING'))
              .sort((a, b) => new Date(a.localTimestamp).getTime() - new Date(b.localTimestamp).getTime());
            resolve(userPending);
          };
          req.onerror = () => resolve([]);
        } catch (e) {
          resolve([]);
        }
      });
    } catch (err) {
      try {
        const saved = localStorage.getItem(`biz_sync_queue_${userId}`);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Update or remove a sync queue item
   */
  async updateOperationStatus(opId: string, status: SyncQueueItem['syncStatus'], error?: string | null): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          const req = store.get(opId);
          req.onsuccess = () => {
            if (req.result) {
              const updated: SyncQueueItem = {
                ...req.result,
                syncStatus: status,
                retryCount: status === 'FAILED' ? (req.result.retryCount || 0) + 1 : req.result.retryCount || 0,
                lastSyncAttempt: new Date().toISOString(),
                error: error !== undefined ? error : req.result.error,
              };
              store.put(updated);
            }
            resolve();
          };
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {}
  }

  /**
   * Remove a completed/synced operation from queue
   */
  async removeOperation(opId: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          const req = store.delete(opId);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    } catch (e) {}
  }

  /**
   * Save sync metadata
   */
  async setSyncMetadata(metadata: SyncMetadata): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('syncMetadata', 'readwrite');
          const store = tx.objectStore('syncMetadata');
          store.put(metadata);
          resolve();
        } catch (e) {
          resolve();
        }
      });
    } catch (e) {}
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(userId: string): Promise<SyncMetadata | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('syncMetadata', 'readonly');
          const store = tx.objectStore('syncMetadata');
          const req = store.get(userId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    } catch (e) {
      return null;
    }
  }
}

export const offlineDb = new OfflineDatabase();

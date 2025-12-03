/**
 * Operations Dashboard Offline Storage
 * IndexedDB-based caching for 100% offline capability
 * Syncs automatically when connection returns
 * 
 * ZERO COST - Browser-native IndexedDB API
 */

import { getApiUrl } from './api-config';

interface CachedData {
  id: string;
  type: 'agents' | 'properties' | 'hardware' | 'payments' | 'campaigns' | 'alerts' | 'compliance';
  data: unknown;
  timestamp: number;
  synced: boolean;
}

interface PendingAction {
  id: string;
  action: 'verify_property' | 'acknowledge_alert' | 'resolve_alert' | 'reconcile_payment';
  entityType: string;
  entityId: number;
  payload: unknown;
  timestamp: number;
  retries: number;
}

const DB_NAME = 'lemlem_operations';
const DB_VERSION = 1;

class OperationsOfflineStorage {
  private db: IDBDatabase | null = null;
  private onlineListeners: Array<() => void> = [];

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.setupOnlineDetection();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cached data store
        if (!db.objectStoreNames.contains('cached_data')) {
          const store = db.createObjectStore('cached_data', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Pending actions queue
        if (!db.objectStoreNames.contains('pending_actions')) {
          const store = db.createObjectStore('pending_actions', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Analytics data
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics', { keyPath: 'id' });
        }
      };
    });
  }

  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      console.log('📡 Connection restored - syncing offline data...');
      this.syncPendingActions();
      this.onlineListeners.forEach(listener => listener());
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline mode activated - caching locally');
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): void {
    this.onlineListeners.push(callback);
  }

  // Cache operations data
  async cacheData(type: CachedData['type'], data: unknown): Promise<void> {
    if (!this.db) await this.init();

    const cached: CachedData = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      synced: this.isOnline()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_data'], 'readwrite');
      const store = transaction.objectStore('cached_data');
      const request = store.put(cached);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data by type
  async getCachedData(type: CachedData['type']): Promise<unknown | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_data'], 'readonly');
      const store = transaction.objectStore('cached_data');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const results = request.result as CachedData[];
        if (results.length === 0) {
          resolve(null);
        } else {
          // Return most recent cached data
          const latest = results.sort((a, b) => b.timestamp - a.timestamp)[0];
          resolve(latest.data);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Queue action for offline execution
  async queueAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    if (!this.db) await this.init();

    const pendingAction: PendingAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.put(pendingAction);

      request.onsuccess = () => {
        console.log('📝 Action queued for sync:', action.action);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending actions
  async getPendingActions(): Promise<PendingAction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_actions'], 'readonly');
      const store = transaction.objectStore('pending_actions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync pending actions when online
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline()) {
      console.log('⚠️ Still offline - cannot sync');
      return;
    }

    const actions = await this.getPendingActions();
    console.log(`🔄 Syncing ${actions.length} pending actions...`);

    for (const action of actions) {
      try {
        // Execute the action via API
        const response = await fetch(getApiUrl(`/api/admin/operations/${action.action}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: action.entityType,
            entityId: action.entityId,
            payload: action.payload
          }),
          credentials: 'include'
        });

        if (response.ok) {
          // Remove from queue on success
          await this.removePendingAction(action.id);
          console.log(`✅ Synced action: ${action.action}`);
        } else {
          // Increment retry count
          await this.incrementRetry(action.id);
        }
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);
        await this.incrementRetry(action.id);
      }
    }
  }

  private async removePendingAction(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async incrementRetry(id: string): Promise<void> {
    if (!this.db) return;

    const actions = await this.getPendingActions();
    const action = actions.find(a => a.id === id);
    if (!action) return;

    action.retries += 1;

    // Remove after 5 failed retries
    if (action.retries >= 5) {
      console.warn(`⚠️ Action ${id} failed 5 times, removing from queue`);
      await this.removePendingAction(id);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.put(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear old cached data (older than 7 days)
  async clearOldCache(): Promise<void> {
    if (!this.db) await this.init();

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_data'], 'readwrite');
      const store = transaction.objectStore('cached_data');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(sevenDaysAgo));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store analytics snapshot for predictive analysis
  async storeAnalyticsSnapshot(snapshot: {
    agentCount: number;
    propertyCount: number;
    alertCount: number;
    paymentVolume: number;
    timestamp: number;
  }): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');
      const request = store.put({
        id: `snapshot_${snapshot.timestamp}`,
        ...snapshot
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get historical analytics for trend analysis
  async getAnalyticsHistory(days: number = 30): Promise<any[]> {
    if (!this.db) await this.init();

    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readonly');
      const store = transaction.objectStore('analytics');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const filtered = results.filter((r: any) => r.timestamp >= cutoff);
        resolve(filtered.sort((a, b) => a.timestamp - b.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const operationsOfflineStorage = new OperationsOfflineStorage();

// Initialize on module load
operationsOfflineStorage.init().catch(console.error);

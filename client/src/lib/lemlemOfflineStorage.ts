/**
 * Lemlem Offline Storage
 * 100% FREE browser-native IndexedDB for offline message caching
 * Works even with no/low internet connection
 */

interface LemlemMessage {
  id: string;
  text: string;
  isUser: boolean;
  usedTemplate?: boolean;
  cost?: number;
  timestamp: number;
  synced: boolean;
}

interface PendingMessage {
  id: string;
  message: string;
  propertyId?: number;
  bookingId?: number;
  language: string;
  timestamp: number;
  retryCount: number;
}

interface OfflineResponse {
  question: string;
  answer: string;
  language: string;
}

const DB_NAME = 'LemlemOfflineDB';
const DB_VERSION = 1;

// Stores for different data types
const STORES = {
  MESSAGES: 'messages',
  PENDING: 'pending_messages',
  RESPONSES: 'cached_responses',
};

class LemlemOfflineStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for chat messages (conversation history)
        if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
          const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          messagesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store for pending messages (failed to send, will retry)
        if (!db.objectStoreNames.contains(STORES.PENDING)) {
          const pendingStore = db.createObjectStore(STORES.PENDING, { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached responses (offline fallback answers)
        if (!db.objectStoreNames.contains(STORES.RESPONSES)) {
          const responsesStore = db.createObjectStore(STORES.RESPONSES, { keyPath: 'question' });
          responsesStore.createIndex('language', 'language', { unique: false });
        }
      };
    });
  }

  /**
   * Save message to local storage
   */
  async saveMessage(message: LemlemMessage): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.put(message);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all messages from storage
   */
  async getMessages(): Promise<LemlemMessage[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Clear old messages (keep last 100)
   */
  async clearOldMessages(): Promise<void> {
    const messages = await this.getMessages();
    if (messages.length <= 100) return;

    // Sort by timestamp and keep only last 100
    const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
    const toDelete = sortedMessages.slice(0, messages.length - 100);

    for (const msg of toDelete) {
      await this.deleteMessage(msg.id);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Add message to pending queue (for retry when online)
   */
  async addPendingMessage(pending: PendingMessage): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING);
      const request = store.put(pending);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all pending messages
   */
  async getPendingMessages(): Promise<PendingMessage[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING], 'readonly');
      const store = transaction.objectStore(STORES.PENDING);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Delete pending message after successful send
   */
  async deletePendingMessage(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Cache a response for offline use
   */
  async cacheResponse(response: OfflineResponse): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.RESPONSES], 'readwrite');
      const store = transaction.objectStore(STORES.RESPONSES);
      const request = store.put(response);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get cached response (offline fallback)
   */
  async getCachedResponse(question: string): Promise<OfflineResponse | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.RESPONSES], 'readonly');
      const store = transaction.objectStore(STORES.RESPONSES);
      const request = store.get(question.toLowerCase().trim());

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Preload common offline responses
   */
  async preloadOfflineResponses(language: string = 'en'): Promise<void> {
    const commonResponses: OfflineResponse[] = [
      {
        question: "what's the lockbox code?",
        answer: "I need an internet connection to fetch the lockbox code for you, dear. Please try again when you're online, or contact your host directly. 🙏",
        language,
      },
      {
        question: "what's the wifi password?",
        answer: "I need an internet connection to get the WiFi password for you. Please try again when you're online, or ask your host. 🙏",
        language,
      },
      {
        question: "when is check-out?",
        answer: "Check-out time is usually 11:00 AM, but I need an internet connection to confirm your specific property. Please try again when you're online. 🙏",
        language,
      },
      {
        question: "emergency contacts",
        answer: "🚨 **Ethiopia Emergency Numbers:**\n\n🚓 Police: 911\n🚑 Ambulance: 907\n🔥 Fire: 939\n👮 Tourist Police: +251-11-155-0202\n\nStay safe! I'll get you more details when I'm back online. 🙏",
        language,
      },
      {
        question: "where can i eat nearby?",
        answer: "I need an internet connection to give you restaurant recommendations, dear. When you're back online, I'll share the best local spots with you! 🙏",
        language,
      },
    ];

    for (const response of commonResponses) {
      await this.cacheResponse(response);
    }
  }
}

// Singleton instance
const lemlemOfflineStorage = new LemlemOfflineStorage();

// Network status helpers
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const onNetworkStatusChange = (callback: (online: boolean) => void): void => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

export default lemlemOfflineStorage;

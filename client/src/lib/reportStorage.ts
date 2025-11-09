/**
 * Weekly Report Storage System
 * IndexedDB-based storage for historical PDF reports
 * 
 * ZERO COST - Browser-native storage, 100% offline
 */

export interface StoredReport {
  id: string;
  weekEnding: string; // ISO date string
  generatedAt: string; // ISO timestamp
  pdfBlob: Blob;
  metadata: {
    totalAgents: number;
    totalProperties: number;
    criticalAlerts: number;
  };
}

const DB_NAME = 'lemlem_reports';
const DB_VERSION = 1;
const STORE_NAME = 'weekly_reports';

class ReportStorageSystem {
  private db: IDBDatabase | null = null;

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

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('weekEnding', 'weekEnding', { unique: false });
          store.createIndex('generatedAt', 'generatedAt', { unique: false });
        }
      };
    });
  }

  async saveReport(report: Omit<StoredReport, 'id'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedReport: StoredReport = { ...report, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(storedReport);

      request.onsuccess = () => {
        console.log(`📄 Report saved to IndexedDB: ${id}`);
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReports(): Promise<StoredReport[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as StoredReport[];
        // Sort by date descending (newest first)
        const sorted = results.sort((a, b) => 
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getReport(id: string): Promise<StoredReport | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReport(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Report deleted: ${id}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async downloadReport(report: StoredReport): Promise<void> {
    const url = URL.createObjectURL(report.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alga_Weekly_Report_${report.weekEnding}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`📥 Downloaded report: ${report.weekEnding}`);
  }

  // Get last report date to check if we need to generate this week
  async getLastReportDate(): Promise<Date | null> {
    const reports = await this.getAllReports();
    if (reports.length === 0) return null;
    return new Date(reports[0].weekEnding);
  }

  // Check if we should generate a report today
  async shouldGenerateToday(): Promise<boolean> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    // Only generate on Fridays
    if (dayOfWeek !== 5) return false;

    const lastReportDate = await this.getLastReportDate();
    if (!lastReportDate) return true; // No reports yet, generate

    // Check if we already generated this week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return lastReportDate < weekAgo;
  }

  // Clean up old reports (keep last 12 weeks only)
  async cleanupOldReports(): Promise<void> {
    const reports = await this.getAllReports();
    if (reports.length <= 12) return;

    const toDelete = reports.slice(12);
    for (const report of toDelete) {
      await this.deleteReport(report.id);
    }
    console.log(`🧹 Cleaned up ${toDelete.length} old reports`);
  }
}

export const reportStorage = new ReportStorageSystem();

// Initialize on module load
reportStorage.init().catch(console.error);

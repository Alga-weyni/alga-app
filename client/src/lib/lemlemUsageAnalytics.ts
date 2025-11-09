/**
 * Lemlem v3 Usage Analytics
 * Browser-native analytics for validation testing (100% FREE)
 * Tracks query patterns, user behavior, and feature adoption
 * Offline-capable with IndexedDB storage
 */

interface UsageEvent {
  id: string;
  timestamp: number;
  eventType: 'query' | 'voice_command' | 'pdf_export' | 'summary_view' | 'feedback';
  userId?: string;
  query?: string;
  queryCategory?: string;
  responseTime?: number;
  satisfied?: boolean;
  feedbackText?: string;
  metadata?: Record<string, any>;
}

interface UsageMetrics {
  totalQueries: number;
  uniqueUsers: number;
  avgResponseTime: number;
  voiceCommandUsage: number;
  pdfExports: number;
  topQueries: Array<{ query: string; count: number }>;
  queryCategoryBreakdown: Record<string, number>;
  userSatisfaction: number;
  dailyActiveUsers: number;
}

class LemlemUsageAnalytics {
  private dbName = 'lemlem-v3-analytics';
  private storeName = 'usage-events';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('eventType', 'eventType', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('queryCategory', 'queryCategory', { unique: false });
        }
      };
    });
  }

  // Track query usage
  async trackQuery(query: string, userId?: string, responseTime?: number): Promise<void> {
    const event: UsageEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      eventType: 'query',
      userId,
      query,
      queryCategory: this.categorizeQuery(query),
      responseTime,
    };

    await this.saveEvent(event);
  }

  // Track voice command usage
  async trackVoiceCommand(query: string, userId?: string): Promise<void> {
    const event: UsageEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      eventType: 'voice_command',
      userId,
      query,
      queryCategory: this.categorizeQuery(query),
    };

    await this.saveEvent(event);
  }

  // Track PDF exports
  async trackPdfExport(userId?: string): Promise<void> {
    const event: UsageEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      eventType: 'pdf_export',
      userId,
    };

    await this.saveEvent(event);
  }

  // Track summary views
  async trackSummaryView(userId?: string): Promise<void> {
    const event: UsageEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      eventType: 'summary_view',
      userId,
    };

    await this.saveEvent(event);
  }

  // Track user feedback
  async trackFeedback(
    query: string,
    satisfied: boolean,
    feedbackText?: string,
    userId?: string
  ): Promise<void> {
    const event: UsageEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      eventType: 'feedback',
      userId,
      query,
      satisfied,
      feedbackText,
      queryCategory: this.categorizeQuery(query),
    };

    await this.saveEvent(event);
  }

  // Categorize queries for pattern analysis
  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();

    // Agent-related queries
    if (lowerQuery.includes('agent') || lowerQuery.includes('delala')) {
      return 'agent_management';
    }

    // Commission-related queries
    if (lowerQuery.includes('commission') || lowerQuery.includes('payment')) {
      return 'commission_tracking';
    }

    // Property-related queries
    if (lowerQuery.includes('property') || lowerQuery.includes('verification')) {
      return 'property_management';
    }

    // Compliance-related queries
    if (lowerQuery.includes('overdue') || lowerQuery.includes('compliance') || lowerQuery.includes('tax')) {
      return 'compliance';
    }

    // Hardware-related queries
    if (lowerQuery.includes('hardware') || lowerQuery.includes('warranty') || lowerQuery.includes('device')) {
      return 'hardware_deployment';
    }

    // Financial queries
    if (lowerQuery.includes('revenue') || lowerQuery.includes('birr') || lowerQuery.includes('telebirr')) {
      return 'financial';
    }

    return 'general';
  }

  // Save event to IndexedDB
  private async saveEvent(event: UsageEvent): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all events
  private async getAllEvents(): Promise<UsageEvent[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get events within date range
  async getEventsByDateRange(startDate: number, endDate: number): Promise<UsageEvent[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.timestamp >= startDate && event.timestamp <= endDate);
  }

  // Calculate usage metrics
  async getMetrics(daysBack: number = 7): Promise<UsageMetrics> {
    const now = Date.now();
    const startDate = now - (daysBack * 24 * 60 * 60 * 1000);
    const events = await this.getEventsByDateRange(startDate, now);

    // Total queries
    const queryEvents = events.filter(e => e.eventType === 'query' || e.eventType === 'voice_command');
    const totalQueries = queryEvents.length;

    // Unique users
    const uniqueUserIds = new Set(events.filter(e => e.userId).map(e => e.userId));
    const uniqueUsers = uniqueUserIds.size;

    // Average response time
    const responseTimes = queryEvents.filter(e => e.responseTime).map(e => e.responseTime!);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Voice command usage
    const voiceCommandUsage = events.filter(e => e.eventType === 'voice_command').length;

    // PDF exports
    const pdfExports = events.filter(e => e.eventType === 'pdf_export').length;

    // Top queries
    const queryCount: Record<string, number> = {};
    queryEvents.forEach(e => {
      if (e.query) {
        queryCount[e.query] = (queryCount[e.query] || 0) + 1;
      }
    });
    const topQueries = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Query category breakdown
    const queryCategoryBreakdown: Record<string, number> = {};
    queryEvents.forEach(e => {
      if (e.queryCategory) {
        queryCategoryBreakdown[e.queryCategory] = (queryCategoryBreakdown[e.queryCategory] || 0) + 1;
      }
    });

    // User satisfaction
    const feedbackEvents = events.filter(e => e.eventType === 'feedback');
    const satisfiedCount = feedbackEvents.filter(e => e.satisfied).length;
    const userSatisfaction = feedbackEvents.length > 0
      ? (satisfiedCount / feedbackEvents.length) * 100
      : 0;

    // Daily active users (last 24 hours)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.timestamp >= oneDayAgo);
    const recentUsers = new Set(recentEvents.filter(e => e.userId).map(e => e.userId));
    const dailyActiveUsers = recentUsers.size;

    return {
      totalQueries,
      uniqueUsers,
      avgResponseTime: Math.round(avgResponseTime),
      voiceCommandUsage,
      pdfExports,
      topQueries,
      queryCategoryBreakdown,
      userSatisfaction: Math.round(userSatisfaction),
      dailyActiveUsers,
    };
  }

  // Get feedback summary
  async getFeedbackSummary(): Promise<Array<{ query: string; satisfied: boolean; feedback?: string; timestamp: number }>> {
    const allEvents = await this.getAllEvents();
    return allEvents
      .filter(e => e.eventType === 'feedback')
      .map(e => ({
        query: e.query || '',
        satisfied: e.satisfied || false,
        feedback: e.feedbackText,
        timestamp: e.timestamp,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Export analytics data for review
  async exportData(): Promise<string> {
    const events = await this.getAllEvents();
    const metrics = await this.getMetrics(30);
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalEvents: events.length,
      metrics,
      recentEvents: events.slice(-100), // Last 100 events
    }, null, 2);
  }

  // Clear all analytics data
  async clearData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const lemlemAnalytics = new LemlemUsageAnalytics();

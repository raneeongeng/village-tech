/**
 * Navigation Analytics and Performance Tracking for Village Management Platform
 * Provides navigation usage analytics and performance monitoring
 */

import type { NavigationItem, UserRole } from '@/types/navigation';

/**
 * Navigation analytics event types
 */
export type NavigationEventType =
  | 'navigation_render'
  | 'item_click'
  | 'group_toggle'
  | 'permission_check'
  | 'route_access'
  | 'error_occurred'
  | 'performance_metric';

/**
 * Navigation analytics event
 */
export interface NavigationAnalyticsEvent {
  type: NavigationEventType;
  timestamp: Date;
  userId?: string;
  userRole?: UserRole;
  tenantId?: string;
  sessionId?: string;
  data: Record<string, any>;
  metadata?: {
    userAgent?: string;
    viewport?: {
      width: number;
      height: number;
    };
    performance?: {
      renderTime?: number;
      loadTime?: number;
    };
  };
}

/**
 * Performance metrics for navigation operations
 */
export interface NavigationPerformanceMetrics {
  renderTime: number;
  filterTime: number;
  permissionCheckTime: number;
  totalItems: number;
  filteredItems: number;
  memoryUsage?: number;
}

/**
 * Navigation usage statistics
 */
export interface NavigationUsageStats {
  totalEvents: number;
  uniqueUsers: Set<string>;
  popularItems: Map<string, number>;
  errorRate: number;
  averageRenderTime: number;
  sessionDuration: number;
  bounceRate: number;
}

/**
 * Navigation analytics collector
 */
export class NavigationAnalytics {
  private events: NavigationAnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private isEnabled: boolean;

  constructor(options: {
    enabled?: boolean;
    maxEvents?: number;
    sessionId?: string;
  } = {}) {
    this.isEnabled = options.enabled ?? true;
    this.sessionId = options.sessionId ?? this.generateSessionId();
    this.startTime = Date.now();

    // Auto-cleanup old events to prevent memory leaks
    if (options.maxEvents) {
      this.setupEventCleanup(options.maxEvents);
    }
  }

  /**
   * Track navigation event
   */
  track(event: Omit<NavigationAnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: NavigationAnalyticsEvent = {
      ...event,
      timestamp: new Date(),
      sessionId: this.sessionId,
      metadata: {
        ...event.metadata,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight
        } : undefined
      }
    };

    this.events.push(analyticsEvent);

    // Send to analytics service (in real implementation)
    this.sendToAnalyticsService(analyticsEvent);
  }

  /**
   * Track navigation render performance
   */
  trackRenderPerformance(metrics: NavigationPerformanceMetrics, context: {
    userRole?: UserRole;
    userId?: string;
    tenantId?: string;
  }): void {
    this.track({
      type: 'performance_metric',
      userRole: context.userRole,
      userId: context.userId,
      tenantId: context.tenantId,
      data: {
        metrics,
        category: 'navigation_render'
      },
      metadata: {
        performance: {
          renderTime: metrics.renderTime,
          loadTime: metrics.filterTime + metrics.permissionCheckTime
        }
      }
    });
  }

  /**
   * Track navigation item click
   */
  trackItemClick(item: NavigationItem, context: {
    userRole?: UserRole;
    userId?: string;
    tenantId?: string;
    sourceLocation?: string;
  }): void {
    this.track({
      type: 'item_click',
      userRole: context.userRole,
      userId: context.userId,
      tenantId: context.tenantId,
      data: {
        itemId: item.id,
        itemLabel: item.label,
        itemHref: item.href,
        itemGroup: item.group,
        sourceLocation: context.sourceLocation,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Track group toggle event
   */
  trackGroupToggle(groupId: string, isExpanded: boolean, context: {
    userRole?: UserRole;
    userId?: string;
    tenantId?: string;
  }): void {
    this.track({
      type: 'group_toggle',
      userRole: context.userRole,
      userId: context.userId,
      tenantId: context.tenantId,
      data: {
        groupId,
        isExpanded,
        action: isExpanded ? 'expand' : 'collapse'
      }
    });
  }

  /**
   * Track permission check
   */
  trackPermissionCheck(itemId: string, allowed: boolean, context: {
    userRole?: UserRole;
    userId?: string;
    tenantId?: string;
    requiredPermission?: string;
  }): void {
    this.track({
      type: 'permission_check',
      userRole: context.userRole,
      userId: context.userId,
      tenantId: context.tenantId,
      data: {
        itemId,
        allowed,
        requiredPermission: context.requiredPermission,
        checkTime: Date.now()
      }
    });
  }

  /**
   * Track navigation error
   */
  trackError(error: {
    type: string;
    message: string;
    itemId?: string;
    code?: string;
  }, context: {
    userRole?: UserRole;
    userId?: string;
    tenantId?: string;
  }): void {
    this.track({
      type: 'error_occurred',
      userRole: context.userRole,
      userId: context.userId,
      tenantId: context.tenantId,
      data: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      }
    });
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): NavigationUsageStats {
    const uniqueUsers = new Set(
      this.events
        .filter(e => e.userId)
        .map(e => e.userId!)
    );

    const itemClicks = this.events.filter(e => e.type === 'item_click');
    const popularItems = new Map<string, number>();

    itemClicks.forEach(event => {
      const itemId = event.data.itemId;
      popularItems.set(itemId, (popularItems.get(itemId) || 0) + 1);
    });

    const errors = this.events.filter(e => e.type === 'error_occurred');
    const renderEvents = this.events.filter(e => e.type === 'performance_metric');
    const averageRenderTime = renderEvents.length > 0
      ? renderEvents.reduce((sum, e) => sum + (e.metadata?.performance?.renderTime || 0), 0) / renderEvents.length
      : 0;

    return {
      totalEvents: this.events.length,
      uniqueUsers,
      popularItems,
      errorRate: this.events.length > 0 ? errors.length / this.events.length : 0,
      averageRenderTime,
      sessionDuration: Date.now() - this.startTime,
      bounceRate: this.calculateBounceRate()
    };
  }

  /**
   * Get events by type
   */
  getEventsByType(type: NavigationEventType): NavigationAnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): NavigationAnalyticsEvent[] {
    return this.events.filter(event => event.userId === userId);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(startTime: Date, endTime: Date): NavigationAnalyticsEvent[] {
    return this.events.filter(event =>
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCsv();
    }
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clear analytics data
   */
  clear(): void {
    this.events = [];
    this.startTime = Date.now();
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Private methods

  private generateSessionId(): string {
    return `nav_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventCleanup(maxEvents: number): void {
    setInterval(() => {
      if (this.events.length > maxEvents) {
        this.events = this.events.slice(-maxEvents);
      }
    }, 60000); // Check every minute
  }

  private sendToAnalyticsService(event: NavigationAnalyticsEvent): void {
    // In a real implementation, this would send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Navigation Analytics:', event);
    }

    // Example integration points:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics API
    // - Local storage for offline support
  }

  private calculateBounceRate(): number {
    const sessions = new Map<string, NavigationAnalyticsEvent[]>();

    // Group events by session
    this.events.forEach(event => {
      if (!event.sessionId) return;
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, []);
      }
      sessions.get(event.sessionId)!.push(event);
    });

    if (sessions.size === 0) return 0;

    // Count sessions with only one interaction
    const bouncedSessions = Array.from(sessions.values())
      .filter(sessionEvents => sessionEvents.filter(e => e.type === 'item_click').length <= 1)
      .length;

    return bouncedSessions / sessions.size;
  }

  private exportToCsv(): string {
    if (this.events.length === 0) return '';

    const headers = [
      'timestamp',
      'type',
      'userId',
      'userRole',
      'tenantId',
      'sessionId',
      'data'
    ];

    const rows = this.events.map(event => [
      event.timestamp.toISOString(),
      event.type,
      event.userId || '',
      event.userRole || '',
      event.tenantId || '',
      event.sessionId || '',
      JSON.stringify(event.data)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

/**
 * Performance measurement utilities
 */
export const performanceUtils = {
  /**
   * Measure navigation render time
   */
  measureRenderTime<T>(fn: () => T): { result: T; time: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: end - start };
  },

  /**
   * Create performance observer for navigation
   */
  createNavigationObserver(callback: (metrics: NavigationPerformanceMetrics) => void): PerformanceObserver | null {
    if (typeof PerformanceObserver === 'undefined') return null;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes('navigation')) {
          callback({
            renderTime: entry.duration,
            filterTime: 0, // Would be measured separately
            permissionCheckTime: 0, // Would be measured separately
            totalItems: 0, // Would be passed from component
            filteredItems: 0 // Would be passed from component
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    return observer;
  },

  /**
   * Mark navigation performance milestones
   */
  markNavigation(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`navigation-${name}`);
    }
  },

  /**
   * Measure time between navigation marks
   */
  measureNavigation(startMark: string, endMark: string, measureName: string): void {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(
          `navigation-${measureName}`,
          `navigation-${startMark}`,
          `navigation-${endMark}`
        );
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }
};

/**
 * Global navigation analytics instance
 */
export const navigationAnalytics = new NavigationAnalytics({
  enabled: process.env.NODE_ENV !== 'test',
  maxEvents: 1000
});
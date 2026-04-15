/**
 * Webhook Analytics Service
 * Calculates and aggregates webhook metrics for dashboard visualization
 */

export interface WebhookMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  averageProcessingTime: number;
  eventsPerSecond: number;
}

export interface ProviderMetrics {
  provider: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  averageProcessingTime: number;
  lastEventTime?: Date;
}

export interface EventTypeMetrics {
  eventType: string;
  count: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageProcessingTime: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  events: number;
  successes: number;
  failures: number;
  successRate: number;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  queueSize: number;
  circuitBreakerStatus: string;
  lastError?: {
    timestamp: Date;
    message: string;
    type: string;
  };
  metrics: {
    cpuUsage?: number;
    memoryUsage?: number;
    responseTime?: number;
  };
}

export interface AnalyticsSnapshot {
  timestamp: Date;
  metrics: WebhookMetrics;
  providerMetrics: ProviderMetrics[];
  eventTypeMetrics: EventTypeMetrics[];
  systemHealth: SystemHealth;
  topErrors: Array<{
    error: string;
    count: number;
    lastOccurred: Date;
  }>;
}

/**
 * Webhook Analytics Service
 */
export class WebhookAnalyticsService {
  private snapshots: AnalyticsSnapshot[] = [];
  private maxSnapshots = 1440; // Keep 24 hours of data (1 per minute)

  /**
   * Calculate overall webhook metrics
   */
  calculateMetrics(events: any[]): WebhookMetrics {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        successRate: 0,
        averageProcessingTime: 0,
        eventsPerSecond: 0,
      };
    }

    const successfulEvents = events.filter((e) => e.status === "delivered" || e.status === "success").length;
    const failedEvents = events.length - successfulEvents;
    const processingTimes = events.map((e) => e.processingTime || 0);
    const averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / events.length;

    // Calculate events per second (assuming events span last hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentEvents = events.filter((e) => new Date(e.timestamp) > oneHourAgo);
    const eventsPerSecond = recentEvents.length / 3600;

    return {
      totalEvents: events.length,
      successfulEvents,
      failedEvents,
      successRate: Math.round((successfulEvents / events.length) * 100),
      averageProcessingTime: Math.round(averageProcessingTime),
      eventsPerSecond: Math.round(eventsPerSecond * 100) / 100,
    };
  }

  /**
   * Calculate metrics by provider
   */
  calculateProviderMetrics(events: any[]): ProviderMetrics[] {
    const providers = new Map<string, any[]>();

    // Group events by provider
    events.forEach((event) => {
      const provider = event.provider || "unknown";
      if (!providers.has(provider)) {
        providers.set(provider, []);
      }
      providers.get(provider)!.push(event);
    });

    // Calculate metrics for each provider
    return Array.from(providers.entries()).map(([provider, providerEvents]) => {
      const successfulEvents = providerEvents.filter((e) => e.status === "delivered" || e.status === "success").length;
      const failedEvents = providerEvents.length - successfulEvents;
      const processingTimes = providerEvents.map((e) => e.processingTime || 0);
      const averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / providerEvents.length;
      const lastEvent = providerEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return {
        provider,
        totalEvents: providerEvents.length,
        successfulEvents,
        failedEvents,
        successRate: Math.round((successfulEvents / providerEvents.length) * 100),
        averageProcessingTime: Math.round(averageProcessingTime),
        lastEventTime: lastEvent ? new Date(lastEvent.timestamp) : undefined,
      };
    });
  }

  /**
   * Calculate metrics by event type
   */
  calculateEventTypeMetrics(events: any[]): EventTypeMetrics[] {
    const eventTypes = new Map<string, any[]>();

    // Group events by type
    events.forEach((event) => {
      const eventType = event.eventType || "unknown";
      if (!eventTypes.has(eventType)) {
        eventTypes.set(eventType, []);
      }
      eventTypes.get(eventType)!.push(event);
    });

    // Calculate metrics for each event type
    return Array.from(eventTypes.entries()).map(([eventType, typeEvents]) => {
      const successCount = typeEvents.filter((e) => e.status === "delivered" || e.status === "success").length;
      const failureCount = typeEvents.length - successCount;
      const processingTimes = typeEvents.map((e) => e.processingTime || 0);
      const averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / typeEvents.length;

      return {
        eventType,
        count: typeEvents.length,
        successCount,
        failureCount,
        successRate: Math.round((successCount / typeEvents.length) * 100),
        averageProcessingTime: Math.round(averageProcessingTime),
      };
    });
  }

  /**
   * Generate time series data for charts
   */
  generateTimeSeries(events: any[], intervalMinutes: number = 5): TimeSeriesData[] {
    const timeSeries = new Map<number, TimeSeriesData>();

    events.forEach((event) => {
      const timestamp = new Date(event.timestamp);
      const intervalKey = Math.floor(timestamp.getTime() / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000);
      const key = intervalKey;

      if (!timeSeries.has(key)) {
        timeSeries.set(key, {
          timestamp: new Date(key),
          events: 0,
          successes: 0,
          failures: 0,
          successRate: 0,
        });
      }

      const data = timeSeries.get(key)!;
      data.events++;

      if (event.status === "delivered" || event.status === "success") {
        data.successes++;
      } else {
        data.failures++;
      }

      data.successRate = Math.round((data.successes / data.events) * 100);
    });

    return Array.from(timeSeries.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Calculate system health status
   */
  calculateSystemHealth(
    queueSize: number,
    circuitBreakerOpen: boolean,
    recentErrors: any[],
    uptime: number
  ): SystemHealth {
    let status: "healthy" | "degraded" | "critical" = "healthy";

    if (circuitBreakerOpen || queueSize > 1000 || recentErrors.length > 10) {
      status = "critical";
    } else if (queueSize > 500 || recentErrors.length > 5) {
      status = "degraded";
    }

    const lastError = recentErrors.length > 0 ? recentErrors[recentErrors.length - 1] : undefined;

    return {
      status,
      uptime,
      queueSize,
      circuitBreakerStatus: circuitBreakerOpen ? "open" : "closed",
      lastError: lastError
        ? {
            timestamp: new Date(lastError.timestamp),
            message: lastError.message,
            type: lastError.type,
          }
        : undefined,
      metrics: {
        cpuUsage: Math.random() * 80, // Placeholder
        memoryUsage: Math.random() * 70, // Placeholder
        responseTime: Math.random() * 500 + 50, // Placeholder
      },
    };
  }

  /**
   * Extract top errors from events
   */
  extractTopErrors(events: any[], limit: number = 5): Array<{
    error: string;
    count: number;
    lastOccurred: Date;
  }> {
    const errors = new Map<string, { count: number; lastOccurred: Date }>();

    events.forEach((event) => {
      if (event.error) {
        const errorKey = event.error;
        if (!errors.has(errorKey)) {
          errors.set(errorKey, { count: 0, lastOccurred: new Date() });
        }
        const errorData = errors.get(errorKey)!;
        errorData.count++;
        errorData.lastOccurred = new Date(event.timestamp);
      }
    });

    return Array.from(errors.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Create analytics snapshot
   */
  createSnapshot(
    events: any[],
    queueSize: number,
    circuitBreakerOpen: boolean,
    recentErrors: any[],
    uptime: number
  ): AnalyticsSnapshot {
    const snapshot: AnalyticsSnapshot = {
      timestamp: new Date(),
      metrics: this.calculateMetrics(events),
      providerMetrics: this.calculateProviderMetrics(events),
      eventTypeMetrics: this.calculateEventTypeMetrics(events),
      systemHealth: this.calculateSystemHealth(queueSize, circuitBreakerOpen, recentErrors, uptime),
      topErrors: this.extractTopErrors(events),
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(): AnalyticsSnapshot | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  /**
   * Get snapshots for time range
   */
  getSnapshotsForTimeRange(startTime: Date, endTime: Date): AnalyticsSnapshot[] {
    return this.snapshots.filter((s) => s.timestamp >= startTime && s.timestamp <= endTime);
  }

  /**
   * Calculate trend (comparing two time periods)
   */
  calculateTrend(
    currentPeriod: AnalyticsSnapshot[],
    previousPeriod: AnalyticsSnapshot[]
  ): {
    successRateTrend: number;
    eventsTrend: number;
    processingTimeTrend: number;
  } {
    const currentMetrics = this.aggregateMetrics(currentPeriod);
    const previousMetrics = this.aggregateMetrics(previousPeriod);

    return {
      successRateTrend: currentMetrics.successRate - previousMetrics.successRate,
      eventsTrend: currentMetrics.totalEvents - previousMetrics.totalEvents,
      processingTimeTrend: currentMetrics.averageProcessingTime - previousMetrics.averageProcessingTime,
    };
  }

  /**
   * Aggregate metrics from multiple snapshots
   */
  private aggregateMetrics(snapshots: AnalyticsSnapshot[]): WebhookMetrics {
    if (snapshots.length === 0) {
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        successRate: 0,
        averageProcessingTime: 0,
        eventsPerSecond: 0,
      };
    }

    const totalEvents = snapshots.reduce((sum, s) => sum + s.metrics.totalEvents, 0);
    const successfulEvents = snapshots.reduce((sum, s) => sum + s.metrics.successfulEvents, 0);
    const failedEvents = snapshots.reduce((sum, s) => sum + s.metrics.failedEvents, 0);
    const avgProcessingTime =
      snapshots.reduce((sum, s) => sum + s.metrics.averageProcessingTime, 0) / snapshots.length;

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      successRate: totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0,
      averageProcessingTime: Math.round(avgProcessingTime),
      eventsPerSecond: 0,
    };
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalSnapshots: number;
    dateRange: { start: Date; end: Date } | null;
    averageSuccessRate: number;
    peakEventCount: number;
  } {
    if (this.snapshots.length === 0) {
      return {
        totalSnapshots: 0,
        dateRange: null,
        averageSuccessRate: 0,
        peakEventCount: 0,
      };
    }

    const successRates = this.snapshots.map((s) => s.metrics.successRate);
    const eventCounts = this.snapshots.map((s) => s.metrics.totalEvents);

    return {
      totalSnapshots: this.snapshots.length,
      dateRange: {
        start: this.snapshots[0].timestamp,
        end: this.snapshots[this.snapshots.length - 1].timestamp,
      },
      averageSuccessRate: Math.round(successRates.reduce((a, b) => a + b, 0) / successRates.length),
      peakEventCount: Math.max(...eventCounts),
    };
  }

  /**
   * Clear old snapshots
   */
  clearOldSnapshots(olderThan: Date): number {
    const initialLength = this.snapshots.length;
    this.snapshots = this.snapshots.filter((s) => s.timestamp > olderThan);
    return initialLength - this.snapshots.length;
  }
}

/**
 * Global analytics service instance
 */
export const analyticsService = new WebhookAnalyticsService();

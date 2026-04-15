/**
 * Replay Analytics Service
 * Provides comprehensive analytics on webhook replay events
 */

export interface ReplayMetrics {
  totalReplays: number;
  successfulReplays: number;
  failedReplays: number;
  pendingReplays: number;
  successRate: number;
  failureRate: number;
  averageRetries: number;
  averageProcessingTime: number;
}

export interface EventTypeAnalytics {
  eventType: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageRetries: number;
  averageProcessingTime: number;
  lastReplayed: Date;
}

export interface ProviderAnalytics {
  provider: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageProcessingTime: number;
  eventTypes: EventTypeAnalytics[];
}

export interface TimeSeriesData {
  timestamp: Date;
  replays: number;
  successes: number;
  failures: number;
  successRate: number;
}

export interface ReplayTrend {
  period: "hourly" | "daily" | "weekly" | "monthly";
  data: TimeSeriesData[];
  trend: "increasing" | "decreasing" | "stable";
  trendPercentage: number;
}

export interface ErrorAnalytics {
  error: string;
  count: number;
  percentage: number;
  affectedProviders: string[];
  affectedEventTypes: string[];
  lastOccurrence: Date;
}

export interface ReplayReport {
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  metrics: ReplayMetrics;
  eventTypeAnalytics: EventTypeAnalytics[];
  providerAnalytics: ProviderAnalytics[];
  topErrors: ErrorAnalytics[];
  trends: {
    hourly: ReplayTrend;
    daily: ReplayTrend;
  };
  recommendations: string[];
}

export interface ReplayData {
  eventId: string;
  provider: string;
  eventType: string;
  status: "success" | "failed";
  timestamp: Date;
  processingTime: number;
  error?: string;
  retryCount: number;
}

/**
 * Replay Analytics Service
 */
export class ReplayAnalyticsService {
  private replayData: ReplayData[] = [];

  /**
   * Add replay data point
   */
  addReplayData(data: ReplayData): void {
    this.replayData.push(data);
  }

  /**
   * Add multiple replay data points
   */
  addReplayDataBatch(data: ReplayData[]): void {
    this.replayData.push(...data);
  }

  /**
   * Calculate overall metrics
   */
  calculateMetrics(startDate?: Date, endDate?: Date): ReplayMetrics {
    let filtered = this.replayData;

    if (startDate) {
      filtered = filtered.filter((d) => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((d) => d.timestamp <= endDate);
    }

    const totalReplays = filtered.length;
    const successfulReplays = filtered.filter((d) => d.status === "success").length;
    const failedReplays = filtered.filter((d) => d.status === "failed").length;
    const pendingReplays = 0; // Calculated separately if needed

    const retries = filtered.map((d) => d.retryCount);
    const averageRetries = retries.length > 0 ? retries.reduce((a, b) => a + b, 0) / retries.length : 0;

    const processingTimes = filtered.map((d) => d.processingTime);
    const averageProcessingTime =
      processingTimes.length > 0 ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 0;

    return {
      totalReplays,
      successfulReplays,
      failedReplays,
      pendingReplays,
      successRate: totalReplays > 0 ? Math.round((successfulReplays / totalReplays) * 100) : 0,
      failureRate: totalReplays > 0 ? Math.round((failedReplays / totalReplays) * 100) : 0,
      averageRetries: Math.round(averageRetries * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime),
    };
  }

  /**
   * Analyze by event type
   */
  analyzeByEventType(startDate?: Date, endDate?: Date): EventTypeAnalytics[] {
    let filtered = this.replayData;

    if (startDate) {
      filtered = filtered.filter((d) => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((d) => d.timestamp <= endDate);
    }

    const eventTypeMap = new Map<string, ReplayData[]>();

    filtered.forEach((data) => {
      if (!eventTypeMap.has(data.eventType)) {
        eventTypeMap.set(data.eventType, []);
      }
      eventTypeMap.get(data.eventType)!.push(data);
    });

    const analytics: EventTypeAnalytics[] = [];

    eventTypeMap.forEach((data, eventType) => {
      const totalCount = data.length;
      const successCount = data.filter((d) => d.status === "success").length;
      const failureCount = data.filter((d) => d.status === "failed").length;

      const retries = data.map((d) => d.retryCount);
      const averageRetries = retries.length > 0 ? retries.reduce((a, b) => a + b, 0) / retries.length : 0;

      const processingTimes = data.map((d) => d.processingTime);
      const averageProcessingTime =
        processingTimes.length > 0 ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 0;

      const lastReplayed = data.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      ).timestamp;

      analytics.push({
        eventType,
        totalCount,
        successCount,
        failureCount,
        successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
        averageRetries: Math.round(averageRetries * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime),
        lastReplayed,
      });
    });

    // Sort by total count descending
    return analytics.sort((a, b) => b.totalCount - a.totalCount);
  }

  /**
   * Analyze by provider
   */
  analyzeByProvider(startDate?: Date, endDate?: Date): ProviderAnalytics[] {
    let filtered = this.replayData;

    if (startDate) {
      filtered = filtered.filter((d) => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((d) => d.timestamp <= endDate);
    }

    const providerMap = new Map<string, ReplayData[]>();

    filtered.forEach((data) => {
      if (!providerMap.has(data.provider)) {
        providerMap.set(data.provider, []);
      }
      providerMap.get(data.provider)!.push(data);
    });

    const analytics: ProviderAnalytics[] = [];

    providerMap.forEach((data, provider) => {
      const totalCount = data.length;
      const successCount = data.filter((d) => d.status === "success").length;
      const failureCount = data.filter((d) => d.status === "failed").length;

      const processingTimes = data.map((d) => d.processingTime);
      const averageProcessingTime =
        processingTimes.length > 0 ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 0;

      // Get event types for this provider
      const eventTypes = this.analyzeByEventType(startDate, endDate).filter((et) =>
        data.some((d) => d.eventType === et.eventType)
      );

      analytics.push({
        provider,
        totalCount,
        successCount,
        failureCount,
        successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
        averageProcessingTime: Math.round(averageProcessingTime),
        eventTypes,
      });
    });

    return analytics.sort((a, b) => b.totalCount - a.totalCount);
  }

  /**
   * Analyze errors
   */
  analyzeErrors(startDate?: Date, endDate?: Date, limit: number = 10): ErrorAnalytics[] {
    let filtered = this.replayData.filter((d) => d.status === "failed" && d.error);

    if (startDate) {
      filtered = filtered.filter((d) => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((d) => d.timestamp <= endDate);
    }

    const errorMap = new Map<string, ReplayData[]>();

    filtered.forEach((data) => {
      if (!errorMap.has(data.error!)) {
        errorMap.set(data.error!, []);
      }
      errorMap.get(data.error!)!.push(data);
    });

    const analytics: ErrorAnalytics[] = [];
    const totalErrors = filtered.length;

    errorMap.forEach((data, error) => {
      const count = data.length;
      const affectedProviders = [...new Set(data.map((d) => d.provider))];
      const affectedEventTypes = [...new Set(data.map((d) => d.eventType))];
      const lastOccurrence = data.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      ).timestamp;

      analytics.push({
        error,
        count,
        percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
        affectedProviders,
        affectedEventTypes,
        lastOccurrence,
      });
    });

    return analytics.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  /**
   * Generate time series data
   */
  generateTimeSeries(
    period: "hourly" | "daily" | "weekly" = "daily",
    startDate?: Date,
    endDate?: Date
  ): TimeSeriesData[] {
    let filtered = this.replayData;

    if (startDate) {
      filtered = filtered.filter((d) => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((d) => d.timestamp <= endDate);
    }

    const timeMap = new Map<string, ReplayData[]>();
    const periodMs = this.getPeriodMs(period);

    filtered.forEach((data) => {
      const key = this.getTimeBucket(data.timestamp, period);
      if (!timeMap.has(key)) {
        timeMap.set(key, []);
      }
      timeMap.get(key)!.push(data);
    });

    const timeSeries: TimeSeriesData[] = [];

    timeMap.forEach((data, timeKey) => {
      const timestamp = this.parseTimeBucket(timeKey, period);
      const replays = data.length;
      const successes = data.filter((d) => d.status === "success").length;
      const failures = data.filter((d) => d.status === "failed").length;

      timeSeries.push({
        timestamp,
        replays,
        successes,
        failures,
        successRate: replays > 0 ? Math.round((successes / replays) * 100) : 0,
      });
    });

    return timeSeries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Calculate trend
   */
  calculateTrend(timeSeries: TimeSeriesData[]): ReplayTrend {
    if (timeSeries.length < 2) {
      return {
        period: "daily",
        data: timeSeries,
        trend: "stable",
        trendPercentage: 0,
      };
    }

    const firstHalf = timeSeries.slice(0, Math.floor(timeSeries.length / 2));
    const secondHalf = timeSeries.slice(Math.floor(timeSeries.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.replays, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.replays, 0) / secondHalf.length;

    const trendPercentage =
      firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

    let trend: "increasing" | "decreasing" | "stable";
    if (trendPercentage > 10) {
      trend = "increasing";
    } else if (trendPercentage < -10) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }

    return {
      period: "daily",
      data: timeSeries,
      trend,
      trendPercentage,
    };
  }

  /**
   * Generate comprehensive report
   */
  generateReport(startDate?: Date, endDate?: Date): ReplayReport {
    const metrics = this.calculateMetrics(startDate, endDate);
    const eventTypeAnalytics = this.analyzeByEventType(startDate, endDate);
    const providerAnalytics = this.analyzeByProvider(startDate, endDate);
    const topErrors = this.analyzeErrors(startDate, endDate, 5);

    const dailyTimeSeries = this.generateTimeSeries("daily", startDate, endDate);
    const hourlyTimeSeries = this.generateTimeSeries("hourly", startDate, endDate);

    const dailyTrend = this.calculateTrend(dailyTimeSeries);
    const hourlyTrend = this.calculateTrend(hourlyTimeSeries);

    const recommendations = this.generateRecommendations(
      metrics,
      eventTypeAnalytics,
      providerAnalytics,
      topErrors
    );

    return {
      generatedAt: new Date(),
      period: {
        start: startDate || new Date(0),
        end: endDate || new Date(),
      },
      metrics,
      eventTypeAnalytics,
      providerAnalytics,
      topErrors,
      trends: {
        hourly: hourlyTrend,
        daily: dailyTrend,
      },
      recommendations,
    };
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(
    metrics: ReplayMetrics,
    eventTypeAnalytics: EventTypeAnalytics[],
    providerAnalytics: ProviderAnalytics[],
    topErrors: ErrorAnalytics[]
  ): string[] {
    const recommendations: string[] = [];

    // Check success rate
    if (metrics.successRate < 80) {
      recommendations.push(
        `Success rate is ${metrics.successRate}%. Investigate root causes and implement fixes.`
      );
    }

    // Check event types with low success
    const lowSuccessTypes = eventTypeAnalytics.filter((et) => et.successRate < 70);
    if (lowSuccessTypes.length > 0) {
      recommendations.push(
        `Event types with low success rates: ${lowSuccessTypes.map((et) => et.eventType).join(", ")}. Review processing logic.`
      );
    }

    // Check provider performance
    const poorProviders = providerAnalytics.filter((p) => p.successRate < 80);
    if (poorProviders.length > 0) {
      recommendations.push(
        `Providers with low success rates: ${poorProviders.map((p) => p.provider).join(", ")}. Check provider health.`
      );
    }

    // Check processing time
    if (metrics.averageProcessingTime > 5000) {
      recommendations.push(
        `Average processing time is ${metrics.averageProcessingTime}ms. Optimize for performance.`
      );
    }

    // Check retry count
    if (metrics.averageRetries > 2) {
      recommendations.push(
        `Average retry count is ${metrics.averageRetries}. Consider implementing exponential backoff.`
      );
    }

    // Check top errors
    if (topErrors.length > 0) {
      recommendations.push(
        `Top error: "${topErrors[0].error}" (${topErrors[0].count} occurrences). Address this issue.`
      );
    }

    // Default recommendation if no issues
    if (recommendations.length === 0) {
      recommendations.push("System is performing well. Continue monitoring.");
    }

    return recommendations;
  }

  /**
   * Helper: Get period in milliseconds
   */
  private getPeriodMs(period: "hourly" | "daily" | "weekly"): number {
    switch (period) {
      case "hourly":
        return 3600000;
      case "daily":
        return 86400000;
      case "weekly":
        return 604800000;
      default:
        return 86400000;
    }
  }

  /**
   * Helper: Get time bucket key
   */
  private getTimeBucket(date: Date, period: "hourly" | "daily" | "weekly"): string {
    const d = new Date(date);

    switch (period) {
      case "hourly":
        return d.toISOString().slice(0, 13);
      case "daily":
        return d.toISOString().slice(0, 10);
      case "weekly":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().slice(0, 10);
      default:
        return d.toISOString().slice(0, 10);
    }
  }

  /**
   * Helper: Parse time bucket to date
   */
  private parseTimeBucket(bucket: string, period: "hourly" | "daily" | "weekly"): Date {
    if (period === "hourly") {
      return new Date(bucket + ":00:00Z");
    }
    return new Date(bucket + "T00:00:00Z");
  }

  /**
   * Export report as JSON
   */
  exportReportAsJSON(report: ReplayReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as CSV
   */
  exportReportAsCSV(report: ReplayReport): string {
    const lines: string[] = [];

    // Header
    lines.push("Replay Analytics Report");
    lines.push(`Generated: ${report.generatedAt.toISOString()}`);
    lines.push(`Period: ${report.period.start.toISOString()} to ${report.period.end.toISOString()}`);
    lines.push("");

    // Metrics
    lines.push("Overall Metrics");
    lines.push("Metric,Value");
    lines.push(`Total Replays,${report.metrics.totalReplays}`);
    lines.push(`Successful,${report.metrics.successfulReplays}`);
    lines.push(`Failed,${report.metrics.failedReplays}`);
    lines.push(`Success Rate,${report.metrics.successRate}%`);
    lines.push(`Average Retries,${report.metrics.averageRetries}`);
    lines.push(`Average Processing Time,${report.metrics.averageProcessingTime}ms`);
    lines.push("");

    // Event Type Analytics
    lines.push("Event Type Analytics");
    lines.push("Event Type,Total,Success,Failure,Success Rate,Avg Retries,Avg Processing Time");
    report.eventTypeAnalytics.forEach((et) => {
      lines.push(
        `${et.eventType},${et.totalCount},${et.successCount},${et.failureCount},${et.successRate}%,${et.averageRetries},${et.averageProcessingTime}ms`
      );
    });
    lines.push("");

    // Provider Analytics
    lines.push("Provider Analytics");
    lines.push("Provider,Total,Success,Failure,Success Rate,Avg Processing Time");
    report.providerAnalytics.forEach((p) => {
      lines.push(
        `${p.provider},${p.totalCount},${p.successCount},${p.failureCount},${p.successRate}%,${p.averageProcessingTime}ms`
      );
    });
    lines.push("");

    // Top Errors
    lines.push("Top Errors");
    lines.push("Error,Count,Percentage,Affected Providers,Affected Event Types");
    report.topErrors.forEach((e) => {
      lines.push(
        `"${e.error}",${e.count},${e.percentage}%,"${e.affectedProviders.join(", ")}","${e.affectedEventTypes.join(", ")}"`
      );
    });
    lines.push("");

    // Recommendations
    lines.push("Recommendations");
    report.recommendations.forEach((r, i) => {
      lines.push(`${i + 1}. ${r}`);
    });

    return lines.join("\n");
  }

  /**
   * Clear old data
   */
  clearOldData(olderThan: Date): number {
    const initialLength = this.replayData.length;
    this.replayData = this.replayData.filter((d) => d.timestamp > olderThan);
    return initialLength - this.replayData.length;
  }

  /**
   * Get data size
   */
  getDataSize(): number {
    return this.replayData.length;
  }
}

/**
 * Global analytics service instance
 */
export const analyticsService = new ReplayAnalyticsService();

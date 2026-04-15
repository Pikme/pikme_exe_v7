import { describe, it, expect, beforeEach } from "vitest";
import {
  WebhookAnalyticsService,
  ProviderMetrics,
  EventTypeMetrics,
  SystemHealth,
} from "./webhook-analytics-service";

/**
 * Webhook Analytics Tests
 */

describe("WebhookAnalyticsService", () => {
  let service: WebhookAnalyticsService;

  beforeEach(() => {
    service = new WebhookAnalyticsService();
  });

  describe("calculateMetrics", () => {
    it("should calculate metrics for empty events", () => {
      const metrics = service.calculateMetrics([]);

      expect(metrics.totalEvents).toBe(0);
      expect(metrics.successfulEvents).toBe(0);
      expect(metrics.failedEvents).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
      expect(metrics.eventsPerSecond).toBe(0);
    });

    it("should calculate metrics for successful events", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        processingTime: 100,
      }));

      const metrics = service.calculateMetrics(events);

      expect(metrics.totalEvents).toBe(100);
      expect(metrics.successfulEvents).toBe(100);
      expect(metrics.failedEvents).toBe(0);
      expect(metrics.successRate).toBe(100);
      expect(metrics.averageProcessingTime).toBe(100);
    });

    it("should calculate metrics with mixed success/failure", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        processingTime: 100,
      }));

      const metrics = service.calculateMetrics(events);

      expect(metrics.totalEvents).toBe(100);
      expect(metrics.successfulEvents).toBe(90);
      expect(metrics.failedEvents).toBe(10);
      expect(metrics.successRate).toBe(90);
    });

    it("should calculate events per second", () => {
      const now = Date.now();
      const events = Array.from({ length: 3600 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(now - 3600000 + i * 1000), // Spread over 1 hour
        processingTime: 100,
      }));

      const metrics = service.calculateMetrics(events);

      expect(metrics.eventsPerSecond).toBeGreaterThan(0);
    });
  });

  describe("calculateProviderMetrics", () => {
    it("should calculate metrics by provider", () => {
      const events = Array.from({ length: 300 }, (_, i) => ({
        id: i,
        provider: ["sendgrid", "ses", "mailgun"][i % 3],
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(),
        processingTime: 100 + Math.random() * 100,
      }));

      const providerMetrics = service.calculateProviderMetrics(events);

      expect(providerMetrics.length).toBe(3);
      expect(providerMetrics.every((p) => p.totalEvents > 0)).toBe(true);
      expect(providerMetrics.every((p) => p.successRate >= 0 && p.successRate <= 100)).toBe(true);
    });

    it("should track last event time per provider", () => {
      const now = new Date();
      const events = [
        {
          id: 1,
          provider: "sendgrid",
          status: "delivered",
          timestamp: new Date(now.getTime() - 10000),
          processingTime: 100,
        },
        {
          id: 2,
          provider: "sendgrid",
          status: "delivered",
          timestamp: new Date(now.getTime() - 5000),
          processingTime: 100,
        },
      ];

      const providerMetrics = service.calculateProviderMetrics(events);
      const sendgridMetrics = providerMetrics.find((p) => p.provider === "sendgrid");

      expect(sendgridMetrics?.lastEventTime).toBeDefined();
    });
  });

  describe("calculateEventTypeMetrics", () => {
    it("should calculate metrics by event type", () => {
      const events = Array.from({ length: 400 }, (_, i) => ({
        id: i,
        eventType: ["delivered", "open", "click", "bounce"][i % 4],
        status: i % 10 === 0 ? "failed" : "success",
        timestamp: new Date(),
        processingTime: 100 + Math.random() * 100,
      }));

      const eventTypeMetrics = service.calculateEventTypeMetrics(events);

      expect(eventTypeMetrics.length).toBe(4);
      expect(eventTypeMetrics.every((e) => e.count > 0)).toBe(true);
      expect(eventTypeMetrics.every((e) => e.successRate >= 0 && e.successRate <= 100)).toBe(true);
    });

    it("should track success and failure counts per event type", () => {
      const events = [
        { id: 1, eventType: "delivered", status: "success", timestamp: new Date(), processingTime: 100 },
        { id: 2, eventType: "delivered", status: "failed", timestamp: new Date(), processingTime: 100 },
        { id: 3, eventType: "delivered", status: "success", timestamp: new Date(), processingTime: 100 },
      ];

      const eventTypeMetrics = service.calculateEventTypeMetrics(events);
      const deliveredMetrics = eventTypeMetrics.find((e) => e.eventType === "delivered");

      expect(deliveredMetrics?.successCount).toBe(2);
      expect(deliveredMetrics?.failureCount).toBe(1);
    });
  });

  describe("generateTimeSeries", () => {
    it("should generate time series data", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(Date.now() - Math.random() * 86400000),
      }));

      const timeSeries = service.generateTimeSeries(events, 5);

      expect(Array.isArray(timeSeries)).toBe(true);
      expect(timeSeries.every((t) => t.events > 0)).toBe(true);
      expect(timeSeries.every((t) => t.successRate >= 0 && t.successRate <= 100)).toBe(true);
    });

    it("should aggregate events by interval", () => {
      const now = Date.now();
      const events = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(now - 60000 + i * 1000), // 1 event per second for 60 seconds
      }));

      const timeSeries = service.generateTimeSeries(events, 5); // 5-minute intervals

      expect(timeSeries.length).toBeGreaterThan(0);
      expect(timeSeries.every((t) => t.timestamp instanceof Date)).toBe(true);
    });
  });

  describe("calculateSystemHealth", () => {
    it("should determine healthy status", () => {
      const health = service.calculateSystemHealth(100, false, [], 86400);

      expect(health.status).toBe("healthy");
      expect(health.queueSize).toBe(100);
      expect(health.circuitBreakerStatus).toBe("closed");
    });

    it("should determine degraded status", () => {
      const errors = Array.from({ length: 6 }, (_, i) => ({
        timestamp: new Date(),
        message: "Error",
        type: "temporary",
      }));

      const health = service.calculateSystemHealth(600, false, errors, 86400);

      expect(health.status).toBe("degraded");
    });

    it("should determine critical status", () => {
      const errors = Array.from({ length: 11 }, (_, i) => ({
        timestamp: new Date(),
        message: "Error",
        type: "temporary",
      }));

      const health = service.calculateSystemHealth(1100, false, errors, 86400);

      expect(health.status).toBe("critical");
    });

    it("should mark critical when circuit breaker is open", () => {
      const health = service.calculateSystemHealth(100, true, [], 86400);

      expect(health.status).toBe("critical");
      expect(health.circuitBreakerStatus).toBe("open");
    });

    it("should track last error", () => {
      const lastError = {
        timestamp: new Date(),
        message: "Connection timeout",
        type: "temporary",
      };

      const health = service.calculateSystemHealth(100, false, [lastError], 86400);

      expect(health.lastError).toBeDefined();
      expect(health.lastError?.message).toBe("Connection timeout");
    });
  });

  describe("extractTopErrors", () => {
    it("should extract top errors", () => {
      const events = [
        { id: 1, error: "Connection timeout" },
        { id: 2, error: "Connection timeout" },
        { id: 3, error: "Invalid signature" },
        { id: 4, error: "Connection timeout" },
        { id: 5, error: "Database error" },
      ];

      const topErrors = service.extractTopErrors(events, 3);

      expect(topErrors.length).toBeLessThanOrEqual(3);
      expect(topErrors[0].error).toBe("Connection timeout");
      expect(topErrors[0].count).toBe(3);
    });

    it("should limit results to specified count", () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        error: `Error ${i % 5}`,
      }));

      const topErrors = service.extractTopErrors(events, 2);

      expect(topErrors.length).toBeLessThanOrEqual(2);
    });

    it("should track last occurrence of error", () => {
      const now = new Date();
      const events = [
        { id: 1, error: "Timeout", timestamp: new Date(now.getTime() - 10000) },
        { id: 2, error: "Timeout", timestamp: new Date(now.getTime() - 5000) },
      ];

      const topErrors = service.extractTopErrors(events, 5);

      expect(topErrors[0].lastOccurred).toBeDefined();
    });
  });

  describe("createSnapshot", () => {
    it("should create analytics snapshot", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        provider: "sendgrid",
        eventType: "delivered",
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      const snapshot = service.createSnapshot(events, 50, false, [], 86400);

      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.metrics).toBeDefined();
      expect(snapshot.providerMetrics).toBeDefined();
      expect(snapshot.eventTypeMetrics).toBeDefined();
      expect(snapshot.systemHealth).toBeDefined();
      expect(snapshot.topErrors).toBeDefined();
    });

    it("should maintain snapshot history", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      service.createSnapshot(events, 50, false, [], 86400);
      service.createSnapshot(events, 50, false, [], 86400);

      const latest = service.getLatestSnapshot();
      expect(latest).toBeDefined();
    });
  });

  describe("getLatestSnapshot", () => {
    it("should return latest snapshot", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      service.createSnapshot(events, 50, false, [], 86400);
      const latest = service.getLatestSnapshot();

      expect(latest).toBeDefined();
      expect(latest?.metrics.totalEvents).toBe(100);
    });

    it("should return undefined when no snapshots", () => {
      const latest = service.getLatestSnapshot();
      expect(latest).toBeUndefined();
    });
  });

  describe("getSnapshotsForTimeRange", () => {
    it("should filter snapshots by time range", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      const now = new Date();
      service.createSnapshot(events, 50, false, [], 86400);

      const startTime = new Date(now.getTime() - 60000);
      const endTime = new Date(now.getTime() + 60000);

      const snapshots = service.getSnapshotsForTimeRange(startTime, endTime);

      expect(snapshots.length).toBeGreaterThan(0);
    });
  });

  describe("getAnalyticsSummary", () => {
    it("should return empty summary when no snapshots", () => {
      const summary = service.getAnalyticsSummary();

      expect(summary.totalSnapshots).toBe(0);
      expect(summary.dateRange).toBeNull();
    });

    it("should return summary with snapshot data", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      service.createSnapshot(events, 50, false, [], 86400);

      const summary = service.getAnalyticsSummary();

      expect(summary.totalSnapshots).toBe(1);
      expect(summary.dateRange).toBeDefined();
      expect(summary.averageSuccessRate).toBeGreaterThan(0);
      expect(summary.peakEventCount).toBe(100);
    });
  });

  describe("clearOldSnapshots", () => {
    it("should clear snapshots older than specified date", () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        status: "delivered",
        timestamp: new Date(),
        processingTime: 100,
      }));

      service.createSnapshot(events, 50, false, [], 86400);

      const cleared = service.clearOldSnapshots(new Date());

      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { ReplayAnalyticsService, ReplayData } from "./replay-analytics-service";

describe("ReplayAnalyticsService", () => {
  let service: ReplayAnalyticsService;
  let sampleData: ReplayData[];

  beforeEach(() => {
    service = new ReplayAnalyticsService();

    // Create sample data
    const now = new Date();
    sampleData = [
      {
        eventId: "event-1",
        provider: "sendgrid",
        eventType: "delivered",
        status: "success",
        timestamp: new Date(now.getTime() - 86400000),
        processingTime: 100,
        retryCount: 1,
      },
      {
        eventId: "event-2",
        provider: "sendgrid",
        eventType: "delivered",
        status: "failed",
        timestamp: new Date(now.getTime() - 86400000),
        processingTime: 150,
        error: "Connection timeout",
        retryCount: 2,
      },
      {
        eventId: "event-3",
        provider: "ses",
        eventType: "open",
        status: "success",
        timestamp: new Date(now.getTime() - 172800000),
        processingTime: 80,
        retryCount: 0,
      },
      {
        eventId: "event-4",
        provider: "mailgun",
        eventType: "click",
        status: "failed",
        timestamp: new Date(now.getTime() - 172800000),
        processingTime: 200,
        error: "Invalid endpoint",
        retryCount: 3,
      },
      {
        eventId: "event-5",
        provider: "sendgrid",
        eventType: "open",
        status: "success",
        timestamp: now,
        processingTime: 120,
        retryCount: 1,
      },
    ];

    service.addReplayDataBatch(sampleData);
  });

  describe("addReplayData", () => {
    it("should add single replay data point", () => {
      const newData: ReplayData = {
        eventId: "event-new",
        provider: "sendgrid",
        eventType: "delivered",
        status: "success",
        timestamp: new Date(),
        processingTime: 100,
        retryCount: 1,
      };

      service.addReplayData(newData);
      expect(service.getDataSize()).toBe(sampleData.length + 1);
    });

    it("should add multiple replay data points", () => {
      const newData: ReplayData[] = [
        {
          eventId: "event-new-1",
          provider: "sendgrid",
          eventType: "delivered",
          status: "success",
          timestamp: new Date(),
          processingTime: 100,
          retryCount: 1,
        },
        {
          eventId: "event-new-2",
          provider: "ses",
          eventType: "open",
          status: "failed",
          timestamp: new Date(),
          processingTime: 150,
          error: "Timeout",
          retryCount: 2,
        },
      ];

      service.addReplayDataBatch(newData);
      expect(service.getDataSize()).toBe(sampleData.length + 2);
    });
  });

  describe("calculateMetrics", () => {
    it("should calculate overall metrics", () => {
      const metrics = service.calculateMetrics();

      expect(metrics.totalReplays).toBe(5);
      expect(metrics.successfulReplays).toBe(3);
      expect(metrics.failedReplays).toBe(2);
      expect(metrics.successRate).toBe(60);
      expect(metrics.failureRate).toBe(40);
      expect(metrics.averageRetries).toBeGreaterThan(0);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
    });

    it("should calculate metrics for date range", () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000);
      const endDate = new Date(now.getTime() + 86400000);

      const metrics = service.calculateMetrics(startDate, endDate);

      expect(metrics.totalReplays).toBeGreaterThan(0);
    });

    it("should return zero for empty date range", () => {
      const startDate = new Date(2020, 0, 1);
      const endDate = new Date(2020, 0, 2);

      const metrics = service.calculateMetrics(startDate, endDate);

      expect(metrics.totalReplays).toBe(0);
      expect(metrics.successRate).toBe(0);
    });
  });

  describe("analyzeByEventType", () => {
    it("should analyze by event type", () => {
      const analytics = service.analyzeByEventType();

      expect(analytics.length).toBeGreaterThan(0);
      expect(analytics[0].eventType).toBeDefined();
      expect(analytics[0].totalCount).toBeGreaterThan(0);
      expect(analytics[0].successRate).toBeGreaterThanOrEqual(0);
    });

    it("should sort by total count descending", () => {
      const analytics = service.analyzeByEventType();

      for (let i = 0; i < analytics.length - 1; i++) {
        expect(analytics[i].totalCount).toBeGreaterThanOrEqual(analytics[i + 1].totalCount);
      }
    });

    it("should include last replayed timestamp", () => {
      const analytics = service.analyzeByEventType();

      analytics.forEach((et) => {
        expect(et.lastReplayed).toBeDefined();
        expect(et.lastReplayed instanceof Date).toBe(true);
      });
    });
  });

  describe("analyzeByProvider", () => {
    it("should analyze by provider", () => {
      const analytics = service.analyzeByProvider();

      expect(analytics.length).toBeGreaterThan(0);
      expect(analytics[0].provider).toBeDefined();
      expect(analytics[0].totalCount).toBeGreaterThan(0);
    });

    it("should include event types for each provider", () => {
      const analytics = service.analyzeByProvider();

      analytics.forEach((p) => {
        expect(Array.isArray(p.eventTypes)).toBe(true);
      });
    });
  });

  describe("analyzeErrors", () => {
    it("should analyze errors", () => {
      const errors = service.analyzeErrors();

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].error).toBeDefined();
      expect(errors[0].count).toBeGreaterThan(0);
      expect(errors[0].percentage).toBeGreaterThan(0);
    });

    it("should include affected providers and event types", () => {
      const errors = service.analyzeErrors();

      errors.forEach((e) => {
        expect(Array.isArray(e.affectedProviders)).toBe(true);
        expect(Array.isArray(e.affectedEventTypes)).toBe(true);
      });
    });

    it("should respect limit parameter", () => {
      const errors = service.analyzeErrors(undefined, undefined, 2);

      expect(errors.length).toBeLessThanOrEqual(2);
    });
  });

  describe("generateTimeSeries", () => {
    it("should generate daily time series", () => {
      const timeSeries = service.generateTimeSeries("daily");

      expect(Array.isArray(timeSeries)).toBe(true);
      expect(timeSeries.length).toBeGreaterThan(0);

      timeSeries.forEach((ts) => {
        expect(ts.timestamp).toBeDefined();
        expect(ts.replays).toBeGreaterThanOrEqual(0);
        expect(ts.successRate).toBeGreaterThanOrEqual(0);
      });
    });

    it("should sort by timestamp ascending", () => {
      const timeSeries = service.generateTimeSeries("daily");

      for (let i = 0; i < timeSeries.length - 1; i++) {
        expect(timeSeries[i].timestamp.getTime()).toBeLessThanOrEqual(
          timeSeries[i + 1].timestamp.getTime()
        );
      }
    });

    it("should generate hourly time series", () => {
      const timeSeries = service.generateTimeSeries("hourly");

      expect(Array.isArray(timeSeries)).toBe(true);
    });

    it("should generate weekly time series", () => {
      const timeSeries = service.generateTimeSeries("weekly");

      expect(Array.isArray(timeSeries)).toBe(true);
    });
  });

  describe("calculateTrend", () => {
    it("should calculate trend from time series", () => {
      const timeSeries = service.generateTimeSeries("daily");
      const trend = service.calculateTrend(timeSeries);

      expect(trend.trend).toMatch(/^(increasing|decreasing|stable)$/);
      expect(trend.trendPercentage).toBeDefined();
      expect(trend.data).toEqual(timeSeries);
    });

    it("should return stable for short series", () => {
      const timeSeries = [
        {
          timestamp: new Date(),
          replays: 10,
          successes: 8,
          failures: 2,
          successRate: 80,
        },
      ];

      const trend = service.calculateTrend(timeSeries);

      expect(trend.trend).toBe("stable");
      expect(trend.trendPercentage).toBe(0);
    });
  });

  describe("generateReport", () => {
    it("should generate comprehensive report", () => {
      const report = service.generateReport();

      expect(report.generatedAt).toBeDefined();
      expect(report.period).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.eventTypeAnalytics).toBeDefined();
      expect(report.providerAnalytics).toBeDefined();
      expect(report.topErrors).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it("should include recommendations", () => {
      const report = service.generateReport();

      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should respect date range", () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000);
      const endDate = new Date(now.getTime() + 86400000);

      const report = service.generateReport(startDate, endDate);

      expect(report.period.start).toEqual(startDate);
      expect(report.period.end).toEqual(endDate);
    });
  });

  describe("exportReportAsJSON", () => {
    it("should export report as JSON", () => {
      const report = service.generateReport();
      const json = service.exportReportAsJSON(report);

      expect(typeof json).toBe("string");
      expect(json).toContain("metrics");
      expect(json).toContain("recommendations");

      const parsed = JSON.parse(json);
      expect(parsed.metrics).toBeDefined();
    });
  });

  describe("exportReportAsCSV", () => {
    it("should export report as CSV", () => {
      const report = service.generateReport();
      const csv = service.exportReportAsCSV(report);

      expect(typeof csv).toBe("string");
      expect(csv).toContain("Replay Analytics Report");
      expect(csv).toContain("Overall Metrics");
      expect(csv).toContain("Event Type Analytics");
      expect(csv).toContain("Provider Analytics");
    });

    it("should include all metrics in CSV", () => {
      const report = service.generateReport();
      const csv = service.exportReportAsCSV(report);

      expect(csv).toContain("Total Replays");
      expect(csv).toContain("Success Rate");
      expect(csv).toContain("Average Retries");
    });
  });

  describe("clearOldData", () => {
    it("should remove old data", () => {
      const initialSize = service.getDataSize();
      const olderThan = new Date(Date.now() - 1000);
      const removed = service.clearOldData(olderThan);

      expect(removed).toBeGreaterThanOrEqual(0);
      expect(service.getDataSize()).toBeLessThanOrEqual(initialSize);
    });

    it("should preserve recent data", () => {
      const initialSize = service.getDataSize();
      const pastDate = new Date(Date.now() - 1000);
      const removed = service.clearOldData(pastDate);

      expect(removed).toBeLessThanOrEqual(initialSize);
    });
  });

  describe("getDataSize", () => {
    it("should return correct data size", () => {
      expect(service.getDataSize()).toBe(sampleData.length);
    });
  });

  describe("Recommendations", () => {
    it("should recommend improvements for low success rate", () => {
      const report = service.generateReport();

      if (report.metrics.successRate < 80) {
        expect(
          report.recommendations.some((r) => r.toLowerCase().includes("success rate"))
        ).toBe(true);
      }
    });

    it("should recommend optimization for high processing time", () => {
      const report = service.generateReport();

      if (report.metrics.averageProcessingTime > 5000) {
        expect(
          report.recommendations.some((r) => r.toLowerCase().includes("processing"))
        ).toBe(true);
      }
    });

    it("should recommend retry strategy for high retry count", () => {
      const report = service.generateReport();

      if (report.metrics.averageRetries > 2) {
        expect(
          report.recommendations.some((r) => r.toLowerCase().includes("retry"))
        ).toBe(true);
      }
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { WebhookReplayService, WebhookEvent } from "./webhook-replay-service";

describe("WebhookReplayService", () => {
  let service: WebhookReplayService;

  beforeEach(() => {
    service = new WebhookReplayService();
  });

  describe("createReplayRequest", () => {
    it("should create a replay request with all parameters", () => {
      const request = service.createReplayRequest(
        ["event-1", "event-2"],
        "Provider was down",
        "admin@example.com",
        "high"
      );

      expect(request.eventIds).toEqual(["event-1", "event-2"]);
      expect(request.reason).toBe("Provider was down");
      expect(request.requestedBy).toBe("admin@example.com");
      expect(request.priority).toBe("high");
    });

    it("should default priority to normal", () => {
      const request = service.createReplayRequest(
        ["event-1"],
        "Retry",
        "admin@example.com"
      );

      expect(request.priority).toBe("normal");
    });
  });

  describe("queueForReplay", () => {
    it("should queue events for replay and return batch ID", () => {
      const batchId = service.queueForReplay(
        ["event-1", "event-2"],
        "Test replay",
        "admin@example.com"
      );

      expect(batchId).toBeDefined();
      expect(batchId).toMatch(/^replay-/);
    });

    it("should create batch with correct initial state", () => {
      const batchId = service.queueForReplay(
        ["event-1", "event-2", "event-3"],
        "Test replay",
        "admin@example.com",
        "high"
      );

      const batch = service.getBatchStatus(batchId);
      expect(batch).toBeDefined();
      expect(batch?.totalEvents).toBe(3);
      expect(batch?.successCount).toBe(0);
      expect(batch?.failureCount).toBe(0);
      expect(batch?.pendingCount).toBe(3);
      expect(batch?.status).toBe("pending");
      expect(batch?.priority).toBe("high");
    });
  });

  describe("processReplay", () => {
    it("should process a single event replay", () => {
      const event: WebhookEvent = {
        id: "event-1",
        provider: "sendgrid",
        eventType: "delivered",
        status: "failed",
        timestamp: new Date(),
        processingTime: 100,
        error: "Connection timeout",
        retryCount: 1,
      };

      const result = service.processReplay("event-1", event);

      expect(result.eventId).toBe("event-1");
      expect(result.originalStatus).toBe("failed");
      expect(result.replayStatus).toMatch(/^(success|failed|queued)$/);
      expect(result.newRetryCount).toBe(2);
      expect(event.retryCount).toBe(2);
    });
  });

  describe("processBatch", () => {
    it("should process a batch of events", () => {
      const batchId = service.queueForReplay(
        ["event-1", "event-2"],
        "Test batch",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            error: "Timeout",
            retryCount: 1,
          },
        ],
        [
          "event-2",
          {
            id: "event-2",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            error: "Timeout",
            retryCount: 1,
          },
        ],
      ]);

      const batch = service.processBatch(batchId, events);

      expect(batch.status).toBe("completed");
      expect(batch.successCount + batch.failureCount).toBe(batch.totalEvents);
      expect(batch.pendingCount).toBe(0);
    });
  });

  describe("getBatchStatus", () => {
    it("should return batch status", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const batch = service.getBatchStatus(batchId);

      expect(batch).toBeDefined();
      expect(batch?.id).toBe(batchId);
    });

    it("should return undefined for non-existent batch", () => {
      const batch = service.getBatchStatus("non-existent");
      expect(batch).toBeUndefined();
    });
  });

  describe("getAllBatches", () => {
    it("should return all batches", () => {
      service.queueForReplay(["event-1"], "Test 1", "admin@example.com");
      service.queueForReplay(["event-2"], "Test 2", "admin@example.com");
      service.queueForReplay(["event-3"], "Test 3", "admin@example.com");

      const batches = service.getAllBatches();

      expect(batches.length).toBe(3);
    });
  });

  describe("filterReplayableEvents", () => {
    it("should filter events by provider", () => {
      const events: WebhookEvent[] = [
        {
          id: "event-1",
          provider: "sendgrid",
          eventType: "delivered",
          status: "failed",
          timestamp: new Date(),
          processingTime: 100,
          retryCount: 0,
        },
        {
          id: "event-2",
          provider: "ses",
          eventType: "delivered",
          status: "failed",
          timestamp: new Date(),
          processingTime: 100,
          retryCount: 0,
        },
      ];

      const filtered = service.filterReplayableEvents(events, {
        provider: "sendgrid",
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].provider).toBe("sendgrid");
    });

    it("should only return failed events", () => {
      const events: WebhookEvent[] = [
        {
          id: "event-1",
          provider: "sendgrid",
          eventType: "delivered",
          status: "delivered",
          timestamp: new Date(),
          processingTime: 100,
          retryCount: 0,
        },
        {
          id: "event-2",
          provider: "sendgrid",
          eventType: "delivered",
          status: "failed",
          timestamp: new Date(),
          processingTime: 100,
          retryCount: 0,
        },
      ];

      const filtered = service.filterReplayableEvents(events, {});

      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe("failed");
    });
  });

  describe("getReplayStatistics", () => {
    it("should calculate replay statistics", () => {
      const batchId = service.queueForReplay(
        ["event-1", "event-2"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
        [
          "event-2",
          {
            id: "event-2",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const stats = service.getReplayStatistics();

      expect(stats.totalReplays).toBe(2);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });
  });

  describe("cancelBatch", () => {
    it("should cancel pending batch", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const cancelled = service.cancelBatch(batchId);

      expect(cancelled).toBe(true);
      const batch = service.getBatchStatus(batchId);
      expect(batch?.status).toBe("failed");
    });

    it("should not cancel non-existent batch", () => {
      const cancelled = service.cancelBatch("non-existent");
      expect(cancelled).toBe(false);
    });
  });

  describe("getQueueSize", () => {
    it("should return queue size", () => {
      const size = service.getQueueSize();
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe("exportReplayHistory", () => {
    it("should export history as JSON", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const json = service.exportReplayHistory("json");
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it("should export history as CSV", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const csv = service.exportReplayHistory("csv");

      expect(csv).toContain("EventID");
      expect(csv).toContain("event-1");
    });
  });

  describe("clearOldHistory", () => {
    it("should remove old history entries", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const cutoffDate = new Date(Date.now() + 1000);
      const removed = service.clearOldHistory(cutoffDate);

      expect(removed).toBeGreaterThan(0);
    });
  });

  describe("getBatchSummary", () => {
    it("should return batch summary with results", () => {
      const batchId = service.queueForReplay(
        ["event-1", "event-2"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
        [
          "event-2",
          {
            id: "event-2",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const summary = service.getBatchSummary(batchId);

      expect(summary.batch).toBeDefined();
      expect(summary.summary.total).toBe(2);
      expect(summary.results.length).toBe(2);
    });
  });

  describe("getReplayHistory", () => {
    it("should return replay history", () => {
      const batchId = service.queueForReplay(
        ["event-1"],
        "Test",
        "admin@example.com"
      );

      const events = new Map<string, WebhookEvent>([
        [
          "event-1",
          {
            id: "event-1",
            provider: "sendgrid",
            eventType: "delivered",
            status: "failed",
            timestamp: new Date(),
            processingTime: 100,
            retryCount: 1,
          },
        ],
      ]);

      service.processBatch(batchId, events);

      const history = service.getReplayHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });
  });
});

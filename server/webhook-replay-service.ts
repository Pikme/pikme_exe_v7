/**
 * Webhook Replay Service
 * Handles re-triggering and replaying of failed webhook events
 */

export interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  status: "delivered" | "failed" | "pending";
  timestamp: Date;
  processingTime: number;
  payload?: Record<string, any>;
  error?: string;
  retryCount: number;
  lastRetryTime?: Date;
}

export interface ReplayRequest {
  eventIds: string[];
  reason: string;
  requestedBy: string;
  priority?: "low" | "normal" | "high";
}

export interface ReplayResult {
  eventId: string;
  originalStatus: string;
  replayStatus: "queued" | "processing" | "success" | "failed";
  replayTime: Date;
  error?: string;
  newRetryCount: number;
}

export interface ReplayBatch {
  id: string;
  eventIds: string[];
  totalEvents: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  reason: string;
  requestedBy: string;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  completedAt?: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface ReplayFilter {
  provider?: string;
  eventType?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  errorPattern?: string;
  limit?: number;
  offset?: number;
}

export interface ReplayStatistics {
  totalReplays: number;
  successfulReplays: number;
  failedReplays: number;
  successRate: number;
  averageRetries: number;
  mostCommonError: string;
  averageTimeToSuccess: number;
}

/**
 * Webhook Replay Service
 */
export class WebhookReplayService {
  private replayBatches: Map<string, ReplayBatch> = new Map();
  private replayHistory: ReplayResult[] = [];
  private maxHistorySize = 10000;
  private processingQueue: ReplayRequest[] = [];

  /**
   * Create a replay request for failed events
   */
  createReplayRequest(
    eventIds: string[],
    reason: string,
    requestedBy: string,
    priority: "low" | "normal" | "high" = "normal"
  ): ReplayRequest {
    return {
      eventIds,
      reason,
      requestedBy,
      priority,
    };
  }

  /**
   * Queue events for replay
   */
  queueForReplay(
    eventIds: string[],
    reason: string,
    requestedBy: string,
    priority: "low" | "normal" | "high" = "normal"
  ): string {
    const batchId = `replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const batch: ReplayBatch = {
      id: batchId,
      eventIds: eventIds,
      totalEvents: eventIds.length,
      successCount: 0,
      failureCount: 0,
      pendingCount: eventIds.length,
      reason: reason,
      requestedBy: requestedBy,
      priority: priority,
      createdAt: new Date(),
      status: "pending",
    };

    this.replayBatches.set(batchId, batch);

    return batchId;
  }

  /**
   * Process a single event replay
   */
  processReplay(eventId: string, event: WebhookEvent): ReplayResult {
    const result: ReplayResult = {
      eventId,
      originalStatus: event.status,
      replayStatus: "queued",
      replayTime: new Date(),
      newRetryCount: event.retryCount + 1,
    };

    try {
      // Simulate replay processing
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        result.replayStatus = "success";
        event.status = "delivered";
        event.error = undefined;
      } else {
        result.replayStatus = "failed";
        result.error = "Replay processing failed";
        event.status = "failed";
      }

      event.retryCount++;
      event.lastRetryTime = new Date();

      this.addToHistory(result);

      return result;
    } catch (error) {
      result.replayStatus = "failed";
      result.error = error instanceof Error ? error.message : "Unknown error";
      this.addToHistory(result);
      return result;
    }
  }

  /**
   * Process replay batch
   */
  processBatch(batchId: string, events: Map<string, WebhookEvent>): ReplayBatch {
    const batch = this.replayBatches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    batch.status = "processing";

    batch.eventIds.forEach((eventId) => {
      const event = events.get(eventId);
      if (event) {
        const result = this.processReplay(eventId, event);

        if (result.replayStatus === "success") {
          batch.successCount++;
        } else if (result.replayStatus === "failed") {
          batch.failureCount++;
        }
      }
    });

    batch.pendingCount = 0;
    batch.completedAt = new Date();
    batch.status = batch.failureCount === 0 ? "completed" : "completed";

    return batch;
  }

  /**
   * Add result to history
   */
  private addToHistory(result: ReplayResult): void {
    this.replayHistory.push(result);

    // Keep history size manageable
    if (this.replayHistory.length > this.maxHistorySize) {
      this.replayHistory.shift();
    }
  }

  /**
   * Get replay batch status
   */
  getBatchStatus(batchId: string): ReplayBatch | undefined {
    return this.replayBatches.get(batchId);
  }

  /**
   * Get all replay batches
   */
  getAllBatches(): ReplayBatch[] {
    return Array.from(this.replayBatches.values());
  }

  /**
   * Get replay history with filtering
   */
  getReplayHistory(filter?: {
    batchId?: string;
    eventId?: string;
    status?: string;
    limit?: number;
  }): ReplayResult[] {
    let results = [...this.replayHistory];

    if (filter?.eventId) {
      results = results.filter((r) => r.eventId === filter.eventId);
    }

    if (filter?.status) {
      results = results.filter((r) => r.replayStatus === filter.status);
    }

    if (filter?.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  /**
   * Filter events for replay eligibility
   */
  filterReplayableEvents(events: WebhookEvent[], filter: ReplayFilter): WebhookEvent[] {
    let filtered = events.filter((e) => e.status === "failed");

    if (filter.provider) {
      filtered = filtered.filter((e) => e.provider === filter.provider);
    }

    if (filter.eventType) {
      filtered = filtered.filter((e) => e.eventType === filter.eventType);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(
        (e) => e.timestamp >= filter.dateRange!.start && e.timestamp <= filter.dateRange!.end
      );
    }

    if (filter.errorPattern) {
      const pattern = new RegExp(filter.errorPattern, "i");
      filtered = filtered.filter((e) => e.error && pattern.test(e.error));
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    if (filter.offset) {
      filtered = filtered.slice(filter.offset);
    }

    return filtered;
  }

  /**
   * Get replay statistics
   */
  getReplayStatistics(): ReplayStatistics {
    const totalReplays = this.replayHistory.length;
    const successfulReplays = this.replayHistory.filter((r) => r.replayStatus === "success").length;
    const failedReplays = this.replayHistory.filter((r) => r.replayStatus === "failed").length;

    const retries = this.replayHistory.map((r) => r.newRetryCount);
    const averageRetries = retries.length > 0 ? retries.reduce((a, b) => a + b, 0) / retries.length : 0;

    // Find most common error
    const errorCounts = new Map<string, number>();
    this.replayHistory.forEach((r) => {
      if (r.error) {
        errorCounts.set(r.error, (errorCounts.get(r.error) || 0) + 1);
      }
    });

    let mostCommonError = "None";
    let maxCount = 0;
    errorCounts.forEach((count, error) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonError = error;
      }
    });

    return {
      totalReplays,
      successfulReplays,
      failedReplays,
      successRate: totalReplays > 0 ? Math.round((successfulReplays / totalReplays) * 100) : 0,
      averageRetries: Math.round(averageRetries * 100) / 100,
      mostCommonError,
      averageTimeToSuccess: 0, // Placeholder
    };
  }

  /**
   * Cancel replay batch
   */
  cancelBatch(batchId: string): boolean {
    const batch = this.replayBatches.get(batchId);
    if (!batch) {
      return false;
    }

    if (batch.status === "processing") {
      return false; // Cannot cancel while processing
    }

    batch.status = "failed";
    batch.completedAt = new Date();

    return true;
  }

  /**
   * Retry failed replays
   */
  retryFailedReplays(batchId: string): string {
    const originalBatch = this.replayBatches.get(batchId);
    if (!originalBatch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const failedEventIds = this.replayHistory
      .filter((r) => r.replayStatus === "failed" && originalBatch.eventIds.includes(r.eventId))
      .map((r) => r.eventId);

    if (failedEventIds.length === 0) {
      throw new Error("No failed events to retry");
    }

    return this.queueForReplay(
      failedEventIds,
      `Retry of failed events from batch ${batchId}`,
      originalBatch.requestedBy,
      originalBatch.priority
    );
  }

  /**
   * Get batch summary
   */
  getBatchSummary(batchId: string): {
    batch: ReplayBatch | undefined;
    results: ReplayResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
      successRate: number;
    };
  } {
    const batch = this.replayBatches.get(batchId);
    const results = this.getReplayHistory({ batchId });

    return {
      batch,
      results,
      summary: {
        total: batch?.totalEvents || 0,
        successful: batch?.successCount || 0,
        failed: batch?.failureCount || 0,
        pending: batch?.pendingCount || 0,
        successRate: batch ? Math.round((batch.successCount / batch.totalEvents) * 100) : 0,
      },
    };
  }

  /**
   * Export replay history
   */
  exportReplayHistory(format: "json" | "csv" = "json"): string {
    if (format === "json") {
      return JSON.stringify(this.replayHistory, null, 2);
    } else {
      // CSV format
      const headers = ["EventID", "OriginalStatus", "ReplayStatus", "ReplayTime", "Error", "RetryCount"];
      const rows = this.replayHistory.map((r) => [
        r.eventId,
        r.originalStatus,
        r.replayStatus,
        r.replayTime.toISOString(),
        r.error || "",
        r.newRetryCount,
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      return csv;
    }
  }

  /**
   * Clear old replay history
   */
  clearOldHistory(olderThan: Date): number {
    const initialLength = this.replayHistory.length;
    this.replayHistory = this.replayHistory.filter((r) => r.replayTime > olderThan);
    return initialLength - this.replayHistory.length;
  }

  /**
   * Get processing queue size
   */
  getQueueSize(): number {
    return this.processingQueue.length;
  }

  /**
   * Get next request from queue
   */
  getNextRequest(): ReplayRequest | undefined {
    // Sort by priority
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.processingQueue.sort(
      (a, b) => priorityOrder[a.priority || "normal"] - priorityOrder[b.priority || "normal"]
    );

    return this.processingQueue.shift();
  }
}

/**
 * Global replay service instance
 */
export const replayService = new WebhookReplayService();

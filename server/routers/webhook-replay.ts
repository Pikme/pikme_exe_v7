import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { replayService } from "../webhook-replay-service";

/**
 * Webhook Replay Router
 * Provides procedures for replaying failed webhook events
 */

export const webhookReplayRouter = router({
  /**
   * Create a replay request for failed events
   */
  createReplayRequest: protectedProcedure
    .input(
      z.object({
        eventIds: z.array(z.string()),
        reason: z.string(),
        priority: z.enum(["low", "normal", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const batchId = replayService.queueForReplay(
        input.eventIds,
        input.reason,
        ctx.user?.id || "unknown",
        input.priority
      );

      return {
        batchId,
        totalEvents: input.eventIds.length,
        status: "queued",
        createdAt: new Date(),
      };
    }),

  /**
   * Get batch status
   */
  getBatchStatus: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }) => {
      const batch = replayService.getBatchStatus(input.batchId);

      if (!batch) {
        return null;
      }

      return {
        id: batch.id,
        totalEvents: batch.totalEvents,
        successCount: batch.successCount,
        failureCount: batch.failureCount,
        pendingCount: batch.pendingCount,
        reason: batch.reason,
        requestedBy: batch.requestedBy,
        priority: batch.priority,
        createdAt: batch.createdAt,
        completedAt: batch.completedAt,
        status: batch.status,
        successRate: batch.totalEvents > 0 ? Math.round((batch.successCount / batch.totalEvents) * 100) : 0,
      };
    }),

  /**
   * Get all replay batches
   */
  getAllBatches: protectedProcedure.query(async () => {
    const batches = replayService.getAllBatches();

    return batches.map((batch) => ({
      id: batch.id,
      totalEvents: batch.totalEvents,
      successCount: batch.successCount,
      failureCount: batch.failureCount,
      pendingCount: batch.pendingCount,
      reason: batch.reason,
      requestedBy: batch.requestedBy,
      priority: batch.priority,
      createdAt: batch.createdAt,
      completedAt: batch.completedAt,
      status: batch.status,
      successRate: batch.totalEvents > 0 ? Math.round((batch.successCount / batch.totalEvents) * 100) : 0,
    }));
  }),

  /**
   * Get replay history
   */
  getReplayHistory: protectedProcedure
    .input(
      z.object({
        batchId: z.string().optional(),
        eventId: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const history = replayService.getReplayHistory(input);

      return history.map((result) => ({
        eventId: result.eventId,
        originalStatus: result.originalStatus,
        replayStatus: result.replayStatus,
        replayTime: result.replayTime,
        error: result.error,
        newRetryCount: result.newRetryCount,
      }));
    }),

  /**
   * Get replay statistics
   */
  getReplayStatistics: protectedProcedure.query(async () => {
    const stats = replayService.getReplayStatistics();

    return {
      totalReplays: stats.totalReplays,
      successfulReplays: stats.successfulReplays,
      failedReplays: stats.failedReplays,
      successRate: stats.successRate,
      averageRetries: stats.averageRetries,
      mostCommonError: stats.mostCommonError,
    };
  }),

  /**
   * Cancel replay batch
   */
  cancelBatch: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .mutation(async ({ input }) => {
      const cancelled = replayService.cancelBatch(input.batchId);

      return {
        success: cancelled,
        message: cancelled ? "Batch cancelled successfully" : "Failed to cancel batch",
      };
    }),

  /**
   * Retry failed replays
   */
  retryFailedReplays: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const newBatchId = replayService.retryFailedReplays(input.batchId);

        return {
          success: true,
          newBatchId,
          message: "Failed events queued for retry",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get batch summary
   */
  getBatchSummary: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }) => {
      const summary = replayService.getBatchSummary(input.batchId);

      return {
        batch: summary.batch
          ? {
              id: summary.batch.id,
              totalEvents: summary.batch.totalEvents,
              reason: summary.batch.reason,
              requestedBy: summary.batch.requestedBy,
              priority: summary.batch.priority,
              createdAt: summary.batch.createdAt,
              completedAt: summary.batch.completedAt,
              status: summary.batch.status,
            }
          : null,
        summary: {
          total: summary.summary.total,
          successful: summary.summary.successful,
          failed: summary.summary.failed,
          pending: summary.summary.pending,
          successRate: summary.summary.successRate,
        },
        results: summary.results.map((r) => ({
          eventId: r.eventId,
          originalStatus: r.originalStatus,
          replayStatus: r.replayStatus,
          replayTime: r.replayTime,
          error: r.error,
          newRetryCount: r.newRetryCount,
        })),
      };
    }),

  /**
   * Export replay history
   */
  exportReplayHistory: protectedProcedure
    .input(z.object({ format: z.enum(["json", "csv"]).optional() }))
    .query(async ({ input }) => {
      const data = replayService.exportReplayHistory(input.format);

      return {
        data,
        format: input.format || "json",
        exportedAt: new Date(),
      };
    }),

  /**
   * Get queue size
   */
  getQueueSize: protectedProcedure.query(async () => {
    const size = replayService.getQueueSize();

    return {
      queueSize: size,
      status: size === 0 ? "empty" : size < 10 ? "low" : size < 50 ? "medium" : "high",
    };
  }),

  /**
   * Filter events for replay
   */
  filterReplayableEvents: protectedProcedure
    .input(
      z.object({
        provider: z.string().optional(),
        eventType: z.string().optional(),
        dateRange: z
          .object({
            start: z.date(),
            end: z.date(),
          })
          .optional(),
        errorPattern: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // Mock data - in production, fetch from database
      const mockEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
        eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
        status: i % 10 === 0 ? "failed" : "delivered",
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        processingTime: Math.random() * 1000 + 50,
        error: i % 10 === 0 ? "Connection timeout" : undefined,
        retryCount: Math.floor(Math.random() * 3),
        lastRetryTime: new Date(),
      }));

      const filtered = replayService.filterReplayableEvents(mockEvents, {
        provider: input.provider,
        eventType: input.eventType,
        dateRange: input.dateRange,
        errorPattern: input.errorPattern,
        limit: input.limit,
        offset: input.offset,
      });

      return {
        total: filtered.length,
        events: filtered.map((e) => ({
          id: e.id,
          provider: e.provider,
          eventType: e.eventType,
          status: e.status,
          timestamp: e.timestamp,
          error: e.error,
          retryCount: e.retryCount,
        })),
      };
    }),

  /**
   * Bulk replay events
   */
  bulkReplayEvents: protectedProcedure
    .input(
      z.object({
        eventIds: z.array(z.string()),
        reason: z.string(),
        priority: z.enum(["low", "normal", "high"]).optional(),
        dryRun: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.dryRun) {
        return {
          success: true,
          dryRun: true,
          message: `Would replay ${input.eventIds.length} events`,
          eventsToReplay: input.eventIds.length,
        };
      }

      const batchId = replayService.queueForReplay(
        input.eventIds,
        input.reason,
        ctx.user?.id || "unknown",
        input.priority
      );

      return {
        success: true,
        batchId,
        totalEvents: input.eventIds.length,
        status: "queued",
        message: `${input.eventIds.length} events queued for replay`,
      };
    }),

  /**
   * Get recent replay activity
   */
  getRecentActivity: protectedProcedure.query(async () => {
    const batches = replayService.getAllBatches().slice(-10);
    const stats = replayService.getReplayStatistics();

    return {
      recentBatches: batches.map((b) => ({
        id: b.id,
        totalEvents: b.totalEvents,
        successCount: b.successCount,
        failureCount: b.failureCount,
        status: b.status,
        createdAt: b.createdAt,
        completedAt: b.completedAt,
      })),
      statistics: {
        totalReplays: stats.totalReplays,
        successRate: stats.successRate,
        averageRetries: stats.averageRetries,
      },
      queueSize: replayService.getQueueSize(),
    };
  }),
});

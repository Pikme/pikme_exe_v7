import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { analyticsService, ReplayData } from "../replay-analytics-service";

/**
 * Replay Analytics Router
 * Provides tRPC procedures for analytics queries and report generation
 */
export const replayAnalyticsRouter = router({
  /**
   * Get overall metrics for a date range
   */
  getMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      return analyticsService.calculateMetrics(input.startDate, input.endDate);
    }),

  /**
   * Get event type analytics
   */
  getEventTypeAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(10),
      })
    )
    .query(({ input }) => {
      const analytics = analyticsService.analyzeByEventType(input.startDate, input.endDate);
      return analytics.slice(0, input.limit);
    }),

  /**
   * Get provider analytics
   */
  getProviderAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      return analyticsService.analyzeByProvider(input.startDate, input.endDate);
    }),

  /**
   * Get top errors
   */
  getTopErrors: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(10),
      })
    )
    .query(({ input }) => {
      return analyticsService.analyzeErrors(input.startDate, input.endDate, input.limit);
    }),

  /**
   * Get time series data
   */
  getTimeSeries: protectedProcedure
    .input(
      z.object({
        period: z.enum(["hourly", "daily", "weekly"]).default("daily"),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      return analyticsService.generateTimeSeries(input.period, input.startDate, input.endDate);
    }),

  /**
   * Calculate trend
   */
  calculateTrend: protectedProcedure
    .input(
      z.object({
        period: z.enum(["hourly", "daily", "weekly"]).default("daily"),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      const timeSeries = analyticsService.generateTimeSeries(input.period, input.startDate, input.endDate);
      return analyticsService.calculateTrend(timeSeries);
    }),

  /**
   * Generate comprehensive report
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      return analyticsService.generateReport(input.startDate, input.endDate);
    }),

  /**
   * Export report as JSON
   */
  exportReportJSON: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      const report = analyticsService.generateReport(input.startDate, input.endDate);
      return {
        content: analyticsService.exportReportAsJSON(report),
        filename: `replay-report-${new Date().toISOString().split("T")[0]}.json`,
      };
    }),

  /**
   * Export report as CSV
   */
  exportReportCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      const report = analyticsService.generateReport(input.startDate, input.endDate);
      return {
        content: analyticsService.exportReportAsCSV(report),
        filename: `replay-report-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

  /**
   * Add replay data point
   */
  addReplayData: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        provider: z.string(),
        eventType: z.string(),
        status: z.enum(["success", "failed"]),
        timestamp: z.date(),
        processingTime: z.number(),
        error: z.string().optional(),
        retryCount: z.number(),
      })
    )
    .mutation(({ input }) => {
      const data: ReplayData = {
        eventId: input.eventId,
        provider: input.provider,
        eventType: input.eventType,
        status: input.status,
        timestamp: input.timestamp,
        processingTime: input.processingTime,
        error: input.error,
        retryCount: input.retryCount,
      };

      analyticsService.addReplayData(data);

      return {
        success: true,
        message: "Replay data added successfully",
      };
    }),

  /**
   * Get most replayed event types
   */
  getMostReplayedEventTypes: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(5),
      })
    )
    .query(({ input }) => {
      const analytics = analyticsService.analyzeByEventType(input.startDate, input.endDate);
      return analytics.slice(0, input.limit).map((et) => ({
        eventType: et.eventType,
        totalCount: et.totalCount,
        successCount: et.successCount,
        failureCount: et.failureCount,
        successRate: et.successRate,
      }));
    }),

  /**
   * Get success rate by provider
   */
  getSuccessRateByProvider: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      const analytics = analyticsService.analyzeByProvider(input.startDate, input.endDate);
      return analytics.map((p) => ({
        provider: p.provider,
        successRate: p.successRate,
        totalCount: p.totalCount,
        successCount: p.successCount,
        failureCount: p.failureCount,
      }));
    }),

  /**
   * Get recommendations
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input }) => {
      const report = analyticsService.generateReport(input.startDate, input.endDate);
      return report.recommendations;
    }),

  /**
   * Get data size
   */
  getDataSize: protectedProcedure.query(() => {
    return {
      size: analyticsService.getDataSize(),
    };
  }),

  /**
   * Clear old data
   */
  clearOldData: protectedProcedure
    .input(
      z.object({
        olderThanDays: z.number().default(90),
      })
    )
    .mutation(({ input }) => {
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - input.olderThanDays);

      const removed = analyticsService.clearOldData(olderThan);

      return {
        success: true,
        message: `Removed ${removed} old data entries`,
        removed,
      };
    }),
});

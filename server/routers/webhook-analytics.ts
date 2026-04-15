import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { analyticsService } from "../webhook-analytics-service";

/**
 * Webhook Analytics Router
 * Provides procedures for webhook metrics and analytics
 */

export const webhookAnalyticsRouter = router({
  /**
   * Get current webhook metrics
   */
  getMetrics: protectedProcedure.query(async () => {
    // Mock data - in production, fetch from database
    const mockEvents = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce", "complaint"][Math.floor(Math.random() * 5)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
      error: Math.random() > 0.95 ? "Connection timeout" : undefined,
    }));

    const metrics = analyticsService.calculateMetrics(mockEvents);
    return metrics;
  }),

  /**
   * Get provider metrics
   */
  getProviderMetrics: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
    }));

    const providerMetrics = analyticsService.calculateProviderMetrics(mockEvents);
    return providerMetrics;
  }),

  /**
   * Get event type metrics
   */
  getEventTypeMetrics: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce", "complaint"][Math.floor(Math.random() * 5)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
    }));

    const eventTypeMetrics = analyticsService.calculateEventTypeMetrics(mockEvents);
    return eventTypeMetrics;
  }),

  /**
   * Get time series data for charts
   */
  getTimeSeries: protectedProcedure
    .input(
      z.object({
        intervalMinutes: z.number().default(5),
        hoursBack: z.number().default(24),
      })
    )
    .query(async ({ input }) => {
      const mockEvents = Array.from({ length: 2000 }, (_, i) => ({
        id: i,
        provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
        eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? "delivered" : "failed",
        timestamp: new Date(Date.now() - Math.random() * input.hoursBack * 3600000),
        processingTime: Math.random() * 1000 + 50,
      }));

      const timeSeries = analyticsService.generateTimeSeries(mockEvents, input.intervalMinutes);
      return timeSeries;
    }),

  /**
   * Get system health status
   */
  getSystemHealth: protectedProcedure.query(async () => {
    const mockErrors = Array.from({ length: 3 }, (_, i) => ({
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      message: ["Connection timeout", "Invalid signature", "Database error"][i],
      type: ["temporary", "permanent", "temporary"][i],
    }));

    const health = analyticsService.calculateSystemHealth(
      Math.floor(Math.random() * 200), // queue size
      Math.random() > 0.95, // circuit breaker open
      mockErrors,
      Math.random() * 30 * 24 * 3600 // uptime in seconds
    );

    return health;
  }),

  /**
   * Get analytics snapshot
   */
  getSnapshot: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce", "complaint"][Math.floor(Math.random() * 5)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
      error: Math.random() > 0.95 ? "Connection timeout" : undefined,
    }));

    const mockErrors = Array.from({ length: 2 }, (_, i) => ({
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      message: ["Connection timeout", "Invalid signature"][i],
      type: ["temporary", "permanent"][i],
    }));

    const snapshot = analyticsService.createSnapshot(
      mockEvents,
      Math.floor(Math.random() * 200),
      Math.random() > 0.95,
      mockErrors,
      Math.random() * 30 * 24 * 3600
    );

    return snapshot;
  }),

  /**
   * Get top errors
   */
  getTopErrors: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      const mockEvents = Array.from({ length: 500 }, (_, i) => ({
        id: i,
        provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
        eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.85 ? "failed" : "delivered",
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        processingTime: Math.random() * 1000 + 50,
        error: Math.random() > 0.85 ? ["Connection timeout", "Invalid signature", "Database error"][Math.floor(Math.random() * 3)] : undefined,
      }));

      const topErrors = analyticsService.extractTopErrors(mockEvents, input.limit);
      return topErrors;
    }),

  /**
   * Get analytics summary
   */
  getSummary: protectedProcedure.query(async () => {
    const summary = analyticsService.getAnalyticsSummary();
    return summary;
  }),

  /**
   * Get provider comparison
   */
  getProviderComparison: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 1500 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
    }));

    const providerMetrics = analyticsService.calculateProviderMetrics(mockEvents);

    return {
      providers: providerMetrics,
      comparison: {
        bestPerformer: providerMetrics.reduce((best, current) =>
          current.successRate > best.successRate ? current : best
        ),
        mostUsed: providerMetrics.reduce((most, current) =>
          current.totalEvents > most.totalEvents ? current : most
        ),
        fastestAverage: providerMetrics.reduce((fastest, current) =>
          current.averageProcessingTime < fastest.averageProcessingTime ? current : fastest
        ),
      },
    };
  }),

  /**
   * Get event type breakdown
   */
  getEventTypeBreakdown: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce", "complaint"][Math.floor(Math.random() * 5)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
    }));

    const eventTypeMetrics = analyticsService.calculateEventTypeMetrics(mockEvents);

    return {
      eventTypes: eventTypeMetrics,
      totalByType: Object.fromEntries(
        eventTypeMetrics.map((e) => [e.eventType, e.count])
      ),
      successRateByType: Object.fromEntries(
        eventTypeMetrics.map((e) => [e.eventType, e.successRate])
      ),
    };
  }),

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click"][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.05 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 60000), // Last minute
      processingTime: Math.random() * 500 + 10,
    }));

    const metrics = analyticsService.calculateMetrics(mockEvents);

    return {
      metrics,
      recentEvents: mockEvents.slice(0, 10),
      throughput: {
        eventsPerMinute: Math.floor(Math.random() * 50 + 10),
        eventsPerHour: Math.floor(Math.random() * 3000 + 600),
      },
    };
  }),

  /**
   * Get dashboard overview
   */
  getDashboardOverview: protectedProcedure.query(async () => {
    const mockEvents = Array.from({ length: 2000 }, (_, i) => ({
      id: i,
      provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
      eventType: ["delivered", "open", "click", "bounce", "complaint"][Math.floor(Math.random() * 5)],
      status: Math.random() > 0.1 ? "delivered" : "failed",
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      processingTime: Math.random() * 1000 + 50,
      error: Math.random() > 0.95 ? "Connection timeout" : undefined,
    }));

    const mockErrors = Array.from({ length: 3 }, (_, i) => ({
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      message: ["Connection timeout", "Invalid signature", "Database error"][i],
      type: ["temporary", "permanent", "temporary"][i],
    }));

    const metrics = analyticsService.calculateMetrics(mockEvents);
    const providerMetrics = analyticsService.calculateProviderMetrics(mockEvents);
    const eventTypeMetrics = analyticsService.calculateEventTypeMetrics(mockEvents);
    const timeSeries = analyticsService.generateTimeSeries(mockEvents, 5);
    const health = analyticsService.calculateSystemHealth(
      Math.floor(Math.random() * 200),
      Math.random() > 0.95,
      mockErrors,
      Math.random() * 30 * 24 * 3600
    );
    const topErrors = analyticsService.extractTopErrors(mockEvents, 5);

    return {
      metrics,
      providerMetrics,
      eventTypeMetrics,
      timeSeries,
      systemHealth: health,
      topErrors,
      timestamp: new Date(),
    };
  }),
});

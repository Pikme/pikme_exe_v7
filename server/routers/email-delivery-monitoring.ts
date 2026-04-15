import { router, adminProcedure } from './_base';
import { z } from 'zod';
import { EmailDeliveryAnalytics } from '../email-delivery-analytics';

export const emailDeliveryMonitoringRouter = router({
  /**
   * Get overall delivery metrics
   */
  getMetrics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return await EmailDeliveryAnalytics.getMetrics(input.startDate, input.endDate);
    }),

  /**
   * Get delivery trend over time
   */
  getDeliveryTrend: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      return await EmailDeliveryAnalytics.getDeliveryTrend(input.days);
    }),

  /**
   * Get failed deliveries for retry
   */
  getFailedDeliveries: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      return await EmailDeliveryAnalytics.getFailedDeliveries(input.limit);
    }),

  /**
   * Get bounce list
   */
  getBounceList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await EmailDeliveryAnalytics.getBounceList(input.limit, input.offset);
    }),

  /**
   * Get statistics by recipient domain
   */
  getStatsByDomain: adminProcedure.query(async () => {
    return await EmailDeliveryAnalytics.getStatsByDomain();
  }),

  /**
   * Get statistics for date range
   */
  getStatsRange: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await EmailDeliveryAnalytics.getStatsRange(input.startDate, input.endDate);
    }),

  /**
   * Remove email from bounce list (whitelist)
   */
  removeFromBounceList: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await EmailDeliveryAnalytics.removeFromBounceList(input.email);
    }),

  /**
   * Get delivery health score
   */
  getHealthScore: adminProcedure.query(async () => {
    return await EmailDeliveryAnalytics.getHealthScore();
  }),

  /**
   * Update daily statistics
   */
  updateDailyStats: adminProcedure
    .input(
      z.object({
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const date = input.date || new Date();
      await EmailDeliveryAnalytics.updateDailyStats(date);
      return { success: true };
    }),

  /**
   * Get delivery summary
   */
  getSummary: adminProcedure.query(async () => {
    const metrics = await EmailDeliveryAnalytics.getMetrics();
    const healthScore = await EmailDeliveryAnalytics.getHealthScore();
    const failedCount = (await EmailDeliveryAnalytics.getFailedDeliveries(1000)).length;
    const bounceCount = (await EmailDeliveryAnalytics.getBounceList(1000)).bounces.length;

    return {
      metrics,
      healthScore,
      failedCount,
      bounceCount,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
    };
  }),
});

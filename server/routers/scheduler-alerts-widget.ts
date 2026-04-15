import { router, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import { SchedulerAlertService } from '../scheduler-alert-service';

export const schedulerAlertsWidgetRouter = router({
  /**
   * Get critical alerts for dashboard widget
   */
  getCriticalAlerts: adminProcedure.query(async () => {
    try {
      const alerts = await SchedulerAlertService.getUnresolvedAlerts();

      // Filter for critical and high severity alerts
      const criticalAlerts = alerts
        .filter((a) => a.severity === 'critical' || a.severity === 'high')
        .slice(0, 5); // Limit to 5 for widget

      return {
        alerts: criticalAlerts,
        count: criticalAlerts.length,
        hasMore: alerts.length > 5,
        totalUnresolved: alerts.length,
      };
    } catch (error) {
      console.error('Error getting critical alerts:', error);
      return {
        alerts: [],
        count: 0,
        hasMore: false,
        totalUnresolved: 0,
      };
    }
  }),

  /**
   * Get alert summary for widget
   */
  getAlertSummary: adminProcedure.query(async () => {
    try {
      const stats = await SchedulerAlertService.getAlertStats();
      const unresolved = await SchedulerAlertService.getUnresolvedAlerts();

      const criticalCount = unresolved.filter((a) => a.severity === 'critical').length;
      const highCount = unresolved.filter((a) => a.severity === 'high').length;

      return {
        totalUnresolved: stats.unresolvedAlerts,
        totalUnacknowledged: stats.unacknowledgedAlerts,
        criticalCount,
        highCount,
        status: criticalCount > 0 ? 'critical' : highCount > 0 ? 'warning' : 'healthy',
      };
    } catch (error) {
      console.error('Error getting alert summary:', error);
      return {
        totalUnresolved: 0,
        totalUnacknowledged: 0,
        criticalCount: 0,
        highCount: 0,
        status: 'healthy',
      };
    }
  }),

  /**
   * Quick acknowledge alert from widget
   */
  quickAcknowledge: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await SchedulerAlertService.acknowledgeAlert(
          input.alertId,
          ctx.user?.id
        );
        return { success };
      } catch (error) {
        console.error('Error acknowledging alert:', error);
        return { success: false };
      }
    }),

  /**
   * Quick resolve alert from widget
   */
  quickResolve: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const success = await SchedulerAlertService.resolveAlert(input.alertId);
        return { success };
      } catch (error) {
        console.error('Error resolving alert:', error);
        return { success: false };
      }
    }),

  /**
   * Get alert trend (last 7 days)
   */
  getAlertTrend: adminProcedure.query(async () => {
    try {
      const alerts = await SchedulerAlertService.getAlertHistory(1000, 0);

      // Group by date
      const trend: Record<string, number> = {};
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      for (const alert of alerts.alerts) {
        const alertTime = new Date(alert.createdAt).getTime();
        if (alertTime < sevenDaysAgo) continue;

        const date = new Date(alert.createdAt).toLocaleDateString();
        trend[date] = (trend[date] || 0) + 1;
      }

      return trend;
    } catch (error) {
      console.error('Error getting alert trend:', error);
      return {};
    }
  }),
});

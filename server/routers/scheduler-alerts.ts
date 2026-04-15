import { router, adminProcedure } from './_base';
import { z } from 'zod';
import { SchedulerAlertService } from '../scheduler-alert-service';

export const schedulerAlertsRouter = router({
  /**
   * Get all alert configurations
   */
  getConfigs: adminProcedure.query(async () => {
    return await SchedulerAlertService.getAlertConfig();
  }),

  /**
   * Get specific alert configuration
   */
  getConfig: adminProcedure
    .input(z.object({ alertType: z.string() }))
    .query(async ({ input }) => {
      const configs = await SchedulerAlertService.getAlertConfig(input.alertType);
      return configs[0] || null;
    }),

  /**
   * Update alert configuration
   */
  updateConfig: adminProcedure
    .input(
      z.object({
        alertType: z.string(),
        enabled: z.boolean().optional(),
        threshold: z.number().optional(),
        notifyAdmins: z.boolean().optional(),
        notifyEmail: z.string().email().optional(),
        cooldownMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { alertType, ...updates } = input;
      const success = await SchedulerAlertService.updateAlertConfig(alertType, updates);
      return { success };
    }),

  /**
   * Get alert history
   */
  getHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        alertType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await SchedulerAlertService.getAlertHistory(
        input.limit,
        input.offset,
        input.alertType
      );
    }),

  /**
   * Get unresolved alerts
   */
  getUnresolved: adminProcedure.query(async () => {
    return await SchedulerAlertService.getUnresolvedAlerts();
  }),

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const success = await SchedulerAlertService.acknowledgeAlert(
        input.alertId,
        ctx.user?.id
      );
      return { success };
    }),

  /**
   * Resolve an alert
   */
  resolveAlert: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await SchedulerAlertService.resolveAlert(input.alertId);
      return { success };
    }),

  /**
   * Get alert statistics
   */
  getStats: adminProcedure.query(async () => {
    return await SchedulerAlertService.getAlertStats();
  }),

  /**
   * Initialize default alerts
   */
  initializeDefaults: adminProcedure.mutation(async () => {
    await SchedulerAlertService.initializeDefaultAlerts();
    return { success: true };
  }),
});

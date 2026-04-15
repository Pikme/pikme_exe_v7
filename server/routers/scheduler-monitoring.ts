import { router, adminProcedure } from '../_core/trpc';
import { KeyRotationScheduler } from '../key-rotation-scheduler';
import { z } from 'zod';

export const schedulerMonitoringRouter = router({
  /**
   * Get current scheduler status
   */
  getStatus: adminProcedure.query(async () => {
    const status = KeyRotationScheduler.getStatus();
    return {
      success: true,
      status,
    };
  }),

  /**
   * Get scheduler health information
   */
  getHealth: adminProcedure.query(async () => {
    const health = KeyRotationScheduler.getHealth();
    return {
      success: true,
      health,
    };
  }),

  /**
   * Manually trigger a rotation check
   */
  triggerCheck: adminProcedure.mutation(async () => {
    const result = await KeyRotationScheduler.triggerCheck();
    return {
      success: result.success,
      error: result.error,
    };
  }),

  /**
   * Stop the scheduler
   */
  stop: adminProcedure.mutation(async () => {
    KeyRotationScheduler.stop();
    return {
      success: true,
      message: 'Scheduler stopped',
    };
  }),

  /**
   * Resume the scheduler
   */
  resume: adminProcedure.mutation(async () => {
    KeyRotationScheduler.resume();
    return {
      success: true,
      message: 'Scheduler resumed',
    };
  }),

  /**
   * Reset scheduler statistics
   */
  resetStats: adminProcedure.mutation(async () => {
    KeyRotationScheduler.resetStats();
    return {
      success: true,
      message: 'Statistics reset',
    };
  }),

  /**
   * Get detailed scheduler information
   */
  getDetails: adminProcedure.query(async () => {
    const status = KeyRotationScheduler.getStatus();
    const health = KeyRotationScheduler.getHealth();

    return {
      success: true,
      status,
      health,
      lastCheckTime: status.lastCheckTime ? new Date(status.lastCheckTime).toISOString() : null,
      nextCheckTime: status.nextCheckTime ? new Date(status.nextCheckTime).toISOString() : null,
      lastErrorTime: status.lastErrorTime ? new Date(status.lastErrorTime).toISOString() : null,
    };
  }),
});

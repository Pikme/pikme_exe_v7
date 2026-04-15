import { router, adminProcedure } from '../_core/trpc';
import { KeyRotationScheduler } from '../key-rotation-scheduler';
import { KeyRotationService } from '../key-rotation-service';
import { z } from 'zod';

export const schedulerLogsRouter = router({
  /**
   * Get scheduler execution logs with filtering
   */
  getExecutionLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50).max(200),
        offset: z.number().default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const status = KeyRotationScheduler.getStatus();
        const health = KeyRotationScheduler.getHealth();

        // Build logs array from scheduler status
        const logs = [];

        if (status.lastCheckTime) {
          logs.push({
            id: 'last-check',
            timestamp: new Date(status.lastCheckTime),
            type: 'check_completed',
            status: 'success',
            message: `Rotation check completed. ${status.checksWithRotation} rotations initiated.`,
            details: {
              checksCompleted: status.checksCompleted,
              checksWithRotation: status.checksWithRotation,
            },
          });
        }

        if (status.lastError && status.lastErrorTime) {
          logs.push({
            id: 'last-error',
            timestamp: new Date(status.lastErrorTime),
            type: 'error',
            status: 'error',
            message: `Error: ${status.lastError}`,
            details: {
              error: status.lastError,
            },
          });
        }

        // Filter by date range if provided
        let filtered = logs;
        if (input.startDate || input.endDate) {
          filtered = logs.filter((log) => {
            if (input.startDate && log.timestamp < input.startDate) return false;
            if (input.endDate && log.timestamp > input.endDate) return false;
            return true;
          });
        }

        // Sort by timestamp descending
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          success: true,
          logs: paginated,
          total: filtered.length,
          hasMore: input.offset + input.limit < filtered.length,
        };
      } catch (error) {
        return {
          success: false,
          logs: [],
          total: 0,
          hasMore: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get key rotation events
   */
  getRotationEvents: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50).max(200),
        offset: z.number().default(0),
        eventType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await KeyRotationService.getKeyRotationEventHistory(
          input.limit + input.offset,
          0
        );

        if (!result.success || !result.events) {
          return {
            success: false,
            events: [],
            total: 0,
            hasMore: false,
            error: result.error,
          };
        }

        let events = result.events;

        // Filter by event type
        if (input.eventType) {
          events = events.filter((e) => e.eventType === input.eventType);
        }

        // Filter by date range
        if (input.startDate || input.endDate) {
          events = events.filter((e) => {
            const eventDate = new Date(e.createdAt);
            if (input.startDate && eventDate < input.startDate) return false;
            if (input.endDate && eventDate > input.endDate) return false;
            return true;
          });
        }

        // Apply pagination
        const paginated = events.slice(input.offset, input.offset + input.limit);

        return {
          success: true,
          events: paginated,
          total: events.length,
          hasMore: input.offset + input.limit < events.length,
        };
      } catch (error) {
        return {
          success: false,
          events: [],
          total: 0,
          hasMore: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get error history
   */
  getErrorHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50).max(200),
        offset: z.number().default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await KeyRotationService.getKeyRotationEventHistory(100, 0);

        if (!result.success || !result.events) {
          return {
            success: true,
            errors: [],
            total: 0,
            hasMore: false,
          };
        }

        // Filter for error events
        let errors = result.events.filter((e) =>
          ['error', 'rotation_failed', 'job_failed'].includes(e.eventType)
        );

        // Filter by date range
        if (input.startDate || input.endDate) {
          errors = errors.filter((e) => {
            const eventDate = new Date(e.createdAt);
            if (input.startDate && eventDate < input.startDate) return false;
            if (input.endDate && eventDate > input.endDate) return false;
            return true;
          });
        }

        // Apply pagination
        const paginated = errors.slice(input.offset, input.offset + input.limit);

        return {
          success: true,
          errors: paginated,
          total: errors.length,
          hasMore: input.offset + input.limit < errors.length,
        };
      } catch (error) {
        return {
          success: false,
          errors: [],
          total: 0,
          hasMore: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get scheduler statistics and summary
   */
  getSummary: adminProcedure.query(async () => {
    try {
      const status = KeyRotationScheduler.getStatus();
      const health = KeyRotationScheduler.getHealth();
      const rotationStats = await KeyRotationService.getKeyRotationStats();

      return {
        success: true,
        summary: {
          schedulerStatus: status.isRunning ? 'running' : 'stopped',
          schedulerHealth: health.healthy ? 'healthy' : 'unhealthy',
          totalChecks: status.checksCompleted,
          totalRotations: status.checksWithRotation,
          lastCheckTime: status.lastCheckTime ? new Date(status.lastCheckTime) : null,
          nextCheckTime: status.nextCheckTime ? new Date(status.nextCheckTime) : null,
          hasErrors: !!status.lastError,
          lastError: status.lastError,
          keyStats: rotationStats.stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        summary: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),

  /**
   * Export logs to JSON
   */
  exportLogs: adminProcedure
    .input(
      z.object({
        format: z.enum(['json', 'csv']).default('json'),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const status = KeyRotationScheduler.getStatus();
        const rotationResult = await KeyRotationService.getKeyRotationEventHistory(1000, 0);

        const logs = {
          exportedAt: new Date().toISOString(),
          schedulerStatus: status,
          rotationEvents: rotationResult.events || [],
        };

        if (input.format === 'json') {
          return {
            success: true,
            data: JSON.stringify(logs, null, 2),
            filename: `scheduler-logs-${Date.now()}.json`,
            mimeType: 'application/json',
          };
        } else {
          // CSV format
          const csv = convertToCSV(logs);
          return {
            success: true,
            data: csv,
            filename: `scheduler-logs-${Date.now()}.csv`,
            mimeType: 'text/csv',
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});

/**
 * Helper function to convert logs to CSV format
 */
function convertToCSV(logs: any): string {
  const headers = ['Timestamp', 'Event Type', 'Key ID', 'Status', 'Details'];
  const rows = logs.rotationEvents.map((event: any) => [
    new Date(event.createdAt).toISOString(),
    event.eventType,
    event.keyId || 'N/A',
    'completed',
    JSON.stringify(event.details || {}),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

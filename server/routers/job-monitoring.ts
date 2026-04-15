import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getJobLoggingService } from "../job-logging-service";
import { getScheduleExecutorService } from "../schedule-executor-service";
import { getJobQueueService } from "../job-queue-service";

/**
 * Job Monitoring Router
 * Provides procedures for monitoring job execution, performance, and errors
 */
export const jobMonitoringRouter = router({
  /**
   * Get job execution logs with filtering
   */
  getJobLogs: protectedProcedure
    .input(
      z.object({
        queueName: z.string().optional(),
        jobType: z.string().optional(),
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      return loggingService.getJobLogs(input);
    }),

  /**
   * Get job log by ID
   */
  getJobLogById: protectedProcedure
    .input(z.object({ logId: z.string() }))
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      return loggingService.getJobLogById(input.logId);
    }),

  /**
   * Get performance metrics for a queue and job type
   */
  getPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        queueName: z.string(),
        jobType: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      return loggingService.calculatePerformanceMetrics(
        input.queueName,
        input.jobType,
        input.startDate,
        input.endDate
      );
    }),

  /**
   * Get error diagnostics with filtering
   */
  getErrorDiagnostics: protectedProcedure
    .input(
      z.object({
        jobLogId: z.string().optional(),
        errorCode: z.string().optional(),
        severity: z.string().optional(),
        isResolved: z.boolean().optional(),
        limit: z.number().int().min(1).max(1000).default(100),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      return loggingService.getErrorDiagnostics(input);
    }),

  /**
   * Get queue statistics
   */
  getQueueStats: protectedProcedure.query(async () => {
    const jobQueueService = getJobQueueService();
    return jobQueueService.getQueueStats();
  }),

  /**
   * Get failed jobs for a queue
   */
  getFailedJobs: protectedProcedure
    .input(
      z.object({
        queueName: z.enum(["report-generation", "email-delivery", "schedule-executor"]),
      })
    )
    .query(async ({ input }) => {
      const jobQueueService = getJobQueueService();
      return jobQueueService.getFailedJobs(input.queueName);
    }),

  /**
   * Retry a failed job
   */
  retryFailedJob: protectedProcedure
    .input(
      z.object({
        queueName: z.enum(["report-generation", "email-delivery", "schedule-executor"]),
        jobId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const jobQueueService = getJobQueueService();
      return jobQueueService.retryFailedJob(input.queueName, input.jobId);
    }),

  /**
   * Get executor status
   */
  getExecutorStatus: protectedProcedure.query(async () => {
    const executorService = getScheduleExecutorService();
    return executorService.getStatus();
  }),

  /**
   * Start the schedule executor
   */
  startExecutor: protectedProcedure.mutation(async () => {
    const executorService = getScheduleExecutorService();
    await executorService.start();
    return { success: true, message: "Executor started" };
  }),

  /**
   * Stop the schedule executor
   */
  stopExecutor: protectedProcedure.mutation(async () => {
    const executorService = getScheduleExecutorService();
    executorService.stop();
    return { success: true, message: "Executor stopped" };
  }),

  /**
   * Clean up old job logs
   */
  cleanupOldLogs: protectedProcedure
    .input(z.object({ daysOld: z.number().int().min(1).default(30) }))
    .mutation(async ({ input }) => {
      const loggingService = getJobLoggingService();
      await loggingService.cleanupOldLogs(input.daysOld);
      return { success: true, message: `Cleaned up logs older than ${input.daysOld} days` };
    }),

  /**
   * Get job statistics summary
   */
  getJobStatisticsSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();

      // Get metrics for all queue/job type combinations
      const queues = ["report-generation", "email-delivery", "schedule-executor"];
      const jobTypes = ["full", "summary", "metrics", "events", "providers", "errors"];

      const metrics = await Promise.all(
        queues.flatMap((queue) =>
          jobTypes.map((jobType) =>
            loggingService.calculatePerformanceMetrics(queue, jobType, input.startDate, input.endDate)
          )
        )
      );

      // Aggregate statistics
      const totalJobs = metrics.reduce((sum, m) => sum + (m.totalJobs || 0), 0);
      const successfulJobs = metrics.reduce((sum, m) => sum + (m.successfulJobs || 0), 0);
      const failedJobs = metrics.reduce((sum, m) => sum + (m.failedJobs || 0), 0);

      return {
        period: { startDate: input.startDate, endDate: input.endDate },
        totalJobs,
        successfulJobs,
        failedJobs,
        successRate: totalJobs > 0 ? ((successfulJobs / totalJobs) * 100).toFixed(2) : 0,
        failureRate: totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(2) : 0,
        averageMetrics: {
          duration: Math.round(metrics.reduce((sum, m) => sum + (m.averageDuration || 0), 0) / metrics.length),
          processingTime: Math.round(
            metrics.reduce((sum, m) => sum + (m.averageProcessingTime || 0), 0) / metrics.length
          ),
          queueWaitTime: Math.round(
            metrics.reduce((sum, m) => sum + (m.averageQueueWaitTime || 0), 0) / metrics.length
          ),
        },
      };
    }),

  /**
   * Get recent errors
   */
  getRecentErrors: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        severity: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      return loggingService.getErrorDiagnostics({
        severity: input.severity,
        isResolved: false,
        limit: input.limit,
      });
    }),

  /**
   * Get job type distribution
   */
  getJobTypeDistribution: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      const logs = await loggingService.getJobLogs({
        startDate: input.startDate,
        endDate: input.endDate,
        limit: 10000,
      });

      // Group by job type
      const distribution: Record<string, number> = {};
      logs.forEach((log: any) => {
        distribution[log.jobType] = (distribution[log.jobType] || 0) + 1;
      });

      return distribution;
    }),

  /**
   * Get queue performance comparison
   */
  getQueuePerformanceComparison: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const loggingService = getJobLoggingService();
      const queues = ["report-generation", "email-delivery", "schedule-executor"];

      const comparison = await Promise.all(
        queues.map(async (queue) => {
          const metrics = await loggingService.calculatePerformanceMetrics(
            queue,
            "all",
            input.startDate,
            input.endDate
          );
          return {
            queue,
            ...metrics,
          };
        })
      );

      return comparison;
    }),
});

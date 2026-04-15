import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { jobExecutionLogs, jobPerformanceMetrics, jobErrorDiagnostics } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Job Logging Service
 * Tracks job execution history, performance metrics, and error diagnostics
 */
export class JobLoggingService {
  /**
   * Create a new job execution log
   */
  async createJobLog(data: {
    jobId: string;
    queueName: string;
    jobType: string;
    jobData: any;
    userId?: number;
    scheduleId?: string;
    deliveryId?: string;
  }) {
    try {
      const db = await getDb();
      const logId = uuidv4();

      await db.insert(jobExecutionLogs).values({
        id: logId,
        jobId: data.jobId,
        queueName: data.queueName,
        jobType: data.jobType,
        status: "pending",
        jobData: data.jobData,
        userId: data.userId,
        scheduleId: data.scheduleId,
        deliveryId: data.deliveryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return logId;
    } catch (error) {
      console.error("[JobLoggingService] Error creating job log:", error);
      throw error;
    }
  }

  /**
   * Update job log with execution details
   */
  async updateJobLog(
    logId: string,
    data: {
      status: string;
      startedAt?: Date;
      completedAt?: Date;
      duration?: number;
      processingTime?: number;
      queueWaitTime?: number;
      result?: any;
      errorMessage?: string;
      errorStack?: string;
      errorCode?: string;
      attemptNumber?: number;
      maxAttempts?: number;
      nextRetryAt?: Date;
      memoryUsed?: number;
      cpuUsed?: number;
    }
  ) {
    try {
      const db = await getDb();

      const updates: any = {
        status: data.status,
        updatedAt: new Date(),
      };

      if (data.startedAt) updates.startedAt = data.startedAt;
      if (data.completedAt) updates.completedAt = data.completedAt;
      if (data.duration !== undefined) updates.duration = data.duration;
      if (data.processingTime !== undefined) updates.processingTime = data.processingTime;
      if (data.queueWaitTime !== undefined) updates.queueWaitTime = data.queueWaitTime;
      if (data.result) updates.result = data.result;
      if (data.errorMessage) updates.errorMessage = data.errorMessage;
      if (data.errorStack) updates.errorStack = data.errorStack;
      if (data.errorCode) updates.errorCode = data.errorCode;
      if (data.attemptNumber !== undefined) updates.attemptNumber = data.attemptNumber;
      if (data.maxAttempts !== undefined) updates.maxAttempts = data.maxAttempts;
      if (data.nextRetryAt) updates.nextRetryAt = data.nextRetryAt;
      if (data.memoryUsed !== undefined) updates.memoryUsed = data.memoryUsed;
      if (data.cpuUsed !== undefined) updates.cpuUsed = data.cpuUsed;

      await db.update(jobExecutionLogs).set(updates).where(eq(jobExecutionLogs.id, logId));
    } catch (error) {
      console.error("[JobLoggingService] Error updating job log:", error);
      throw error;
    }
  }

  /**
   * Create error diagnostic record
   */
  async createErrorDiagnostic(data: {
    jobLogId: string;
    errorCode: string;
    errorMessage: string;
    errorStack?: string;
    context?: any;
    severity?: string;
  }) {
    try {
      const db = await getDb();
      const diagnosticId = uuidv4();

      await db.insert(jobErrorDiagnostics).values({
        id: diagnosticId,
        jobLogId: data.jobLogId,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        errorStack: data.errorStack,
        context: data.context,
        severity: (data.severity as any) || "medium",
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return diagnosticId;
    } catch (error) {
      console.error("[JobLoggingService] Error creating error diagnostic:", error);
      throw error;
    }
  }

  /**
   * Get job execution logs with filtering
   */
  async getJobLogs(filters: {
    queueName?: string;
    jobType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const db = await getDb();
      const conditions: any[] = [];

      if (filters.queueName) conditions.push(eq(jobExecutionLogs.queueName, filters.queueName));
      if (filters.jobType) conditions.push(eq(jobExecutionLogs.jobType, filters.jobType));
      if (filters.status) conditions.push(eq(jobExecutionLogs.status, filters.status));

      if (filters.startDate) {
        conditions.push(gte(jobExecutionLogs.createdAt, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(jobExecutionLogs.createdAt, filters.endDate));
      }

      const query = db
        .select()
        .from(jobExecutionLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(jobExecutionLogs.createdAt))
        .limit(filters.limit || 100)
        .offset(filters.offset || 0);

      return query;
    } catch (error) {
      console.error("[JobLoggingService] Error getting job logs:", error);
      throw error;
    }
  }

  /**
   * Get job log by ID
   */
  async getJobLogById(logId: string) {
    try {
      const db = await getDb();
      const result = await db.select().from(jobExecutionLogs).where(eq(jobExecutionLogs.id, logId));
      return result[0] || null;
    } catch (error) {
      console.error("[JobLoggingService] Error getting job log:", error);
      throw error;
    }
  }

  /**
   * Calculate performance metrics for a time period
   */
  async calculatePerformanceMetrics(queueName: string, jobType: string, startDate: Date, endDate: Date) {
    try {
      const db = await getDb();

      const logs = await db
        .select()
        .from(jobExecutionLogs)
        .where(
          and(
            eq(jobExecutionLogs.queueName, queueName),
            eq(jobExecutionLogs.jobType, jobType),
            gte(jobExecutionLogs.createdAt, startDate),
            lte(jobExecutionLogs.createdAt, endDate)
          )
        );

      const totalJobs = logs.length;
      const successfulJobs = logs.filter((l) => l.status === "completed").length;
      const failedJobs = logs.filter((l) => l.status === "failed").length;
      const retriedJobs = logs.filter((l) => l.status === "retried").length;

      const durations = logs.filter((l) => l.duration).map((l) => l.duration || 0);
      const processingTimes = logs.filter((l) => l.processingTime).map((l) => l.processingTime || 0);
      const queueWaitTimes = logs.filter((l) => l.queueWaitTime).map((l) => l.queueWaitTime || 0);
      const memoryUsages = logs.filter((l) => l.memoryUsed).map((l) => l.memoryUsed || 0);
      const cpuUsages = logs.filter((l) => l.cpuUsed).map((l) => parseFloat(l.cpuUsed?.toString() || "0"));

      return {
        totalJobs,
        successfulJobs,
        failedJobs,
        retriedJobs,
        successRate: totalJobs > 0 ? ((successfulJobs / totalJobs) * 100).toFixed(2) : 0,
        failureRate: totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(2) : 0,
        averageDuration: this.calculateAverage(durations),
        minDuration: Math.min(...durations, Infinity),
        maxDuration: Math.max(...durations, -Infinity),
        averageProcessingTime: this.calculateAverage(processingTimes),
        averageQueueWaitTime: this.calculateAverage(queueWaitTimes),
        averageMemoryUsed: this.calculateAverage(memoryUsages),
        averageCpuUsed: this.calculateAverage(cpuUsages),
      };
    } catch (error) {
      console.error("[JobLoggingService] Error calculating performance metrics:", error);
      throw error;
    }
  }

  /**
   * Store performance metrics
   */
  async storePerformanceMetrics(data: {
    queueName: string;
    jobType: string;
    date: Date;
    hour?: number;
    metrics: any;
  }) {
    try {
      const db = await getDb();
      const metricId = uuidv4();

      await db.insert(jobPerformanceMetrics).values({
        id: metricId,
        queueName: data.queueName,
        jobType: data.jobType,
        date: data.date,
        hour: data.hour,
        totalJobs: data.metrics.totalJobs,
        successfulJobs: data.metrics.successfulJobs,
        failedJobs: data.metrics.failedJobs,
        retriedJobs: data.metrics.retriedJobs,
        averageDuration: parseFloat(data.metrics.averageDuration),
        minDuration: data.metrics.minDuration,
        maxDuration: data.metrics.maxDuration,
        averageProcessingTime: parseFloat(data.metrics.averageProcessingTime),
        averageQueueWaitTime: parseFloat(data.metrics.averageQueueWaitTime),
        successRate: parseFloat(data.metrics.successRate),
        failureRate: parseFloat(data.metrics.failureRate),
        averageMemoryUsed: parseFloat(data.metrics.averageMemoryUsed),
        averageCpuUsed: parseFloat(data.metrics.averageCpuUsed),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return metricId;
    } catch (error) {
      console.error("[JobLoggingService] Error storing performance metrics:", error);
      throw error;
    }
  }

  /**
   * Get error diagnostics
   */
  async getErrorDiagnostics(filters: {
    jobLogId?: string;
    errorCode?: string;
    severity?: string;
    isResolved?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const db = await getDb();
      const conditions: any[] = [];

      if (filters.jobLogId) conditions.push(eq(jobErrorDiagnostics.jobLogId, filters.jobLogId));
      if (filters.errorCode) conditions.push(eq(jobErrorDiagnostics.errorCode, filters.errorCode));
      if (filters.severity) conditions.push(eq(jobErrorDiagnostics.severity, filters.severity));
      if (filters.isResolved !== undefined) conditions.push(eq(jobErrorDiagnostics.isResolved, filters.isResolved));

      const query = db
        .select()
        .from(jobErrorDiagnostics)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(jobErrorDiagnostics.createdAt))
        .limit(filters.limit || 100)
        .offset(filters.offset || 0);

      return query;
    } catch (error) {
      console.error("[JobLoggingService] Error getting error diagnostics:", error);
      throw error;
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs(daysOld: number = 30) {
    try {
      const db = await getDb();
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      await db.delete(jobExecutionLogs).where(lte(jobExecutionLogs.createdAt, cutoffDate));

      await db.delete(jobPerformanceMetrics).where(lte(jobPerformanceMetrics.createdAt, cutoffDate));

      console.log(`[JobLoggingService] Cleaned up logs older than ${daysOld} days`);
    } catch (error) {
      console.error("[JobLoggingService] Error cleaning up old logs:", error);
      throw error;
    }
  }

  /**
   * Helper: Calculate average of array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }
}

// Singleton instance
let jobLoggingService: JobLoggingService;

export function getJobLoggingService(): JobLoggingService {
  if (!jobLoggingService) {
    jobLoggingService = new JobLoggingService();
  }
  return jobLoggingService;
}

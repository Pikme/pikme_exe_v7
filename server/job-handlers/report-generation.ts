import Queue from "bull";
import { getJobQueueService } from "../job-queue-service";
import { reportSchedulingService } from "../report-scheduling-service";
import { getDb } from "../db";
import { replayAnalyticsService } from "../replay-analytics-service";
import { getJobLoggingService } from "../job-logging-service";
import { eq } from "drizzle-orm";
import { reportDeliveries } from "../../drizzle/schema";

/**
 * Report Generation Job Handler
 * Processes report generation jobs from the queue with logging
 */
export class ReportGenerationJobHandler {
  private queue: Queue.Queue;

  constructor() {
    this.queue = getJobQueueService().getReportGenerationQueue();
    this.setupProcessor();
  }

  /**
   * Set up the job processor
   */
  private setupProcessor() {
    this.queue.process(5, async (job) => {
      console.log(`[Report Generation] Processing job ${job.id}:`, job.data);
      const loggingService = getJobLoggingService();
      const startTime = Date.now();
      let logId: string | null = null;

      try {
        // Create job execution log
        logId = await loggingService.createJobLog({
          jobId: job.id,
          queueName: "report-generation",
          jobType: job.data.reportType,
          jobData: job.data,
          scheduleId: job.data.scheduleId,
          deliveryId: job.data.deliveryId,
        });

        // Update log status to processing
        await loggingService.updateJobLog(logId, {
          status: "processing",
          startedAt: new Date(),
        });

        const { scheduleId, reportType, dateRangeType, customDaysBack, deliveryId } = job.data;

        // Get schedule details
        const schedule = await reportSchedulingService.getScheduleById(scheduleId);
        if (!schedule) {
          throw new Error(`Schedule ${scheduleId} not found`);
        }

        // Generate report data based on type
        const reportData = await this.generateReport(reportType, dateRangeType, customDaysBack);

        // Update delivery status to processing
        await this.updateDeliveryStatus(deliveryId, "processing", null);

        // Queue email delivery job
        await getJobQueueService().addEmailDeliveryJob({
          deliveryId,
          recipients: schedule.recipients as string[],
          subject: `${schedule.name} - ${new Date().toLocaleDateString()}`,
          reportData,
          attachmentFormat: schedule.attachmentFormat as string,
        });

        // Update log status to completed
        const duration = Date.now() - startTime;
        if (logId) {
          await loggingService.updateJobLog(logId, {
            status: "completed",
            completedAt: new Date(),
            duration,
            result: { success: true, deliveryId },
          });
        }

        job.progress(100);
        return {
          success: true,
          reportData,
          deliveryId,
        };
      } catch (error: any) {
        console.error(`[Report Generation] Job ${job.id} error:`, error);

        // Update delivery status to failed
        if (job.data.deliveryId) {
          await this.updateDeliveryStatus(job.data.deliveryId, "failed", error.message);
        }

        // Update log status to failed
        const duration = Date.now() - startTime;
        if (logId) {
          await loggingService.updateJobLog(logId, {
            status: "failed",
            completedAt: new Date(),
            duration,
            errorMessage: error.message,
            errorStack: error.stack,
            errorCode: error.code || "UNKNOWN_ERROR",
          });

          // Create error diagnostic
          await loggingService.createErrorDiagnostic({
            jobLogId: logId,
            errorCode: error.code || "UNKNOWN_ERROR",
            errorMessage: error.message,
            errorStack: error.stack,
            severity: "high",
          });
        }

        throw error;
      }
    });
  }

  /**
   * Generate report data based on type
   */
  private async generateReport(
    reportType: string,
    dateRangeType: string,
    customDaysBack?: number
  ): Promise<any> {
    const daysBack = this.getDaysBack(dateRangeType, customDaysBack);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    switch (reportType) {
      case "full":
        return this.generateFullReport(startDate, endDate);
      case "summary":
        return this.generateSummaryReport(startDate, endDate);
      case "metrics":
        return this.generateMetricsReport(startDate, endDate);
      case "events":
        return this.generateEventsReport(startDate, endDate);
      case "providers":
        return this.generateProvidersReport(startDate, endDate);
      case "errors":
        return this.generateErrorsReport(startDate, endDate);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Generate full report
   */
  private async generateFullReport(startDate: Date, endDate: Date): Promise<any> {
    const summary = await this.generateSummaryReport(startDate, endDate);
    const metrics = await this.generateMetricsReport(startDate, endDate);
    const events = await this.generateEventsReport(startDate, endDate);

    return {
      type: "full",
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary,
      metrics,
      events,
    };
  }

  /**
   * Generate summary report
   */
  private async generateSummaryReport(startDate: Date, endDate: Date): Promise<any> {
    const analytics = await replayAnalyticsService.getAnalyticsSummary(startDate, endDate);

    return {
      type: "summary",
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalReplays: analytics.totalReplays || 0,
      successfulReplays: analytics.successfulReplays || 0,
      failedReplays: analytics.failedReplays || 0,
      successRate: analytics.successRate || 0,
      averageProcessingTime: analytics.averageProcessingTime || 0,
    };
  }

  /**
   * Generate metrics report
   */
  private async generateMetricsReport(startDate: Date, endDate: Date): Promise<any> {
    const analytics = await replayAnalyticsService.getAnalyticsSummary(startDate, endDate);

    return {
      type: "metrics",
      generatedAt: new Date(),
      period: { startDate, endDate },
      metrics: {
        totalEvents: analytics.totalReplays || 0,
        successRate: analytics.successRate || 0,
        averageResponseTime: analytics.averageProcessingTime || 0,
        peakHour: analytics.peakHour || null,
        slowestProvider: analytics.slowestProvider || null,
      },
    };
  }

  /**
   * Generate events report
   */
  private async generateEventsReport(startDate: Date, endDate: Date): Promise<any> {
    const analytics = await replayAnalyticsService.getEventTypeBreakdown(startDate, endDate);

    return {
      type: "events",
      generatedAt: new Date(),
      period: { startDate, endDate },
      eventTypes: analytics || [],
    };
  }

  /**
   * Generate providers report
   */
  private async generateProvidersReport(startDate: Date, endDate: Date): Promise<any> {
    const analytics = await replayAnalyticsService.getProviderPerformance(startDate, endDate);

    return {
      type: "providers",
      generatedAt: new Date(),
      period: { startDate, endDate },
      providers: analytics || [],
    };
  }

  /**
   * Generate errors report
   */
  private async generateErrorsReport(startDate: Date, endDate: Date): Promise<any> {
    const analytics = await replayAnalyticsService.getErrorAnalysis(startDate, endDate);

    return {
      type: "errors",
      generatedAt: new Date(),
      period: { startDate, endDate },
      errors: analytics || [],
    };
  }

  /**
   * Get days back from date range type
   */
  private getDaysBack(dateRangeType: string, customDaysBack?: number): number {
    switch (dateRangeType) {
      case "last7days":
        return 7;
      case "last30days":
        return 30;
      case "last90days":
        return 90;
      case "custom":
        return customDaysBack || 7;
      default:
        return 7;
    }
  }

  /**
   * Update delivery status in database
   */
  private async updateDeliveryStatus(deliveryId: string, status: string, errorMessage: string | null) {
    try {
      const db = await getDb();
      const updates: any = { status };

      if (status === "processing") {
        updates.startedAt = new Date();
      }

      if (errorMessage) {
        updates.errorMessage = errorMessage;
      }

      await db.update(reportDeliveries).set(updates).where(eq(reportDeliveries.id, deliveryId));
    } catch (error) {
      console.error(`Failed to update delivery status: ${error}`);
    }
  }
}

// Initialize handler
export function initReportGenerationHandler() {
  return new ReportGenerationJobHandler();
}

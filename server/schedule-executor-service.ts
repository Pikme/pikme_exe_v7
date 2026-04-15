import { reportSchedulingService } from "./report-scheduling-service";
import { getJobQueueService } from "./job-queue-service";
import { getDb } from "./db";
import { reportDeliveries } from "../drizzle/schema";

/**
 * Schedule Executor Service
 * Manages the execution of scheduled reports
 */
export class ScheduleExecutorService {
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Start the schedule executor
   */
  async start() {
    if (this.isRunning) {
      console.log("[Schedule Executor] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[Schedule Executor] Starting...");

    // Check for due schedules every minute
    this.checkInterval = setInterval(() => {
      this.executeDueSchedules().catch((error) => {
        console.error("[Schedule Executor] Error executing schedules:", error);
      });
    }, 60000); // Check every minute

    // Run immediately on start
    await this.executeDueSchedules();
  }

  /**
   * Stop the schedule executor
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log("[Schedule Executor] Stopped");
  }

  /**
   * Execute all due schedules
   */
  private async executeDueSchedules() {
    try {
      const schedules = await reportSchedulingService.getSchedulesDueForExecution();

      if (schedules.length === 0) {
        return;
      }

      console.log(`[Schedule Executor] Found ${schedules.length} due schedules`);

      for (const schedule of schedules) {
        await this.executeSchedule(schedule);
      }
    } catch (error) {
      console.error("[Schedule Executor] Error getting due schedules:", error);
    }
  }

  /**
   * Execute a single schedule
   */
  private async executeSchedule(schedule: any) {
    try {
      console.log(`[Schedule Executor] Executing schedule: ${schedule.id}`);

      // Create delivery record
      const delivery = await this.createDeliveryRecord(schedule);

      // Queue report generation job
      await getJobQueueService().addReportGenerationJob({
        scheduleId: schedule.id,
        reportType: schedule.reportType,
        dateRangeType: schedule.dateRangeType,
        customDaysBack: schedule.customDaysBack,
        deliveryId: delivery.id,
      });

      // Update schedule's next run time
      await reportSchedulingService.updateScheduleAfterExecution(schedule.id);

      console.log(`[Schedule Executor] Schedule ${schedule.id} queued for execution`);
    } catch (error) {
      console.error(`[Schedule Executor] Error executing schedule ${schedule.id}:`, error);
    }
  }

  /**
   * Create a delivery record for the schedule
   */
  private async createDeliveryRecord(schedule: any) {
    return reportSchedulingService.createDeliveryRecord({
      scheduleId: schedule.id,
      recipients: schedule.recipients as string[],
      subject: `${schedule.name} - ${new Date().toLocaleDateString()}`,
      status: "pending",
    });
  }

  /**
   * Manually trigger a schedule
   */
  async triggerScheduleNow(scheduleId: string) {
    try {
      const schedule = await reportSchedulingService.getScheduleById(scheduleId);

      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      console.log(`[Schedule Executor] Manually triggering schedule: ${scheduleId}`);

      // Create delivery record
      const delivery = await this.createDeliveryRecord(schedule);

      // Queue report generation job
      await getJobQueueService().addReportGenerationJob({
        scheduleId: schedule.id,
        reportType: schedule.reportType,
        dateRangeType: schedule.dateRangeType,
        customDaysBack: schedule.customDaysBack,
        deliveryId: delivery.id,
      });

      return delivery;
    } catch (error) {
      console.error(`[Schedule Executor] Error triggering schedule ${scheduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get executor status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval ? "active" : "inactive",
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return getJobQueueService().getQueueStats();
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(queueName: "report-generation" | "email-delivery" | "schedule-executor") {
    return getJobQueueService().getFailedJobs(queueName);
  }

  /**
   * Retry a failed job
   */
  async retryFailedJob(queueName: "report-generation" | "email-delivery" | "schedule-executor", jobId: string) {
    return getJobQueueService().retryFailedJob(queueName, jobId);
  }

  /**
   * Clean up old jobs
   */
  async cleanupOldJobs() {
    return getJobQueueService().cleanupOldJobs();
  }
}

// Singleton instance
let scheduleExecutorService: ScheduleExecutorService;

export function getScheduleExecutorService(): ScheduleExecutorService {
  if (!scheduleExecutorService) {
    scheduleExecutorService = new ScheduleExecutorService();
  }
  return scheduleExecutorService;
}

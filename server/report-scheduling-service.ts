import { eq, and, lt, gte, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { reportSchedules, reportDeliveries } from "../drizzle/schema";
import type { ReportSchedule, InsertReportSchedule } from "../drizzle/schema";

/**
 * Report Scheduling Service
 * Manages scheduled analytics report generation and email delivery
 */
export class ReportSchedulingService {
  private db: any;

  async initDb() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  /**
   * Create a new report schedule
   */
  async createSchedule(data: InsertReportSchedule): Promise<ReportSchedule> {
    const db = await this.initDb();
    const nextRunAt = this.calculateNextRunTime(
      data.frequency as string,
      data.time,
      data.dayOfWeek,
      data.dayOfMonth,
      data.timezone
    );

    const result = await db.insert(reportSchedules).values({
      ...data,
      nextRunAt,
    });

    return this.getScheduleById(data.id || "");
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: string): Promise<ReportSchedule | null> {
    const db = await this.initDb();
    const result = await db.select().from(reportSchedules).where(eq(reportSchedules.id, id)).limit(1);
    return result[0] || null;
  }

  /**
   * Get all schedules for a user
   */
  async getUserSchedules(userId: number): Promise<ReportSchedule[]> {
    const db = await this.initDb();
    return db.select().from(reportSchedules).where(eq(reportSchedules.userId, userId));
  }

  /**
   * Get active schedules
   */
  async getActiveSchedules(): Promise<ReportSchedule[]> {
    const db = await this.initDb();
    return db.select().from(reportSchedules).where(eq(reportSchedules.isActive, true));
  }

  /**
   * Get schedules due for execution
   */
  async getSchedulesDueForExecution(): Promise<ReportSchedule[]> {
    const db = await this.initDb();
    const now = new Date();
    return db
      .select()
      .from(reportSchedules)
      .where(
        and(
          eq(reportSchedules.isActive, true),
          lt(reportSchedules.nextRunAt, now)
        )
      );
  }

  /**
   * Update a schedule
   */
  async updateSchedule(id: string, data: Partial<InsertReportSchedule>): Promise<ReportSchedule | null> {
    const db = await this.initDb();
    await db.update(reportSchedules).set(data).where(eq(reportSchedules.id, id));
    return this.getScheduleById(id);
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(id: string): Promise<boolean> {
    const db = await this.initDb();
    const result = await db.delete(reportSchedules).where(eq(reportSchedules.id, id));
    return result.rowsAffected > 0;
  }

  /**
   * Update schedule after execution
   */
  async updateScheduleAfterExecution(id: string): Promise<void> {
    const db = await this.initDb();
    const schedule = await this.getScheduleById(id);
    if (!schedule) return;

    const nextRunAt = this.calculateNextRunTime(
      schedule.frequency,
      schedule.time,
      schedule.dayOfWeek,
      schedule.dayOfMonth,
      schedule.timezone
    );

    await db
      .update(reportSchedules)
      .set({
        lastRunAt: new Date(),
        nextRunAt,
      })
      .where(eq(reportSchedules.id, id));
  }

  /**
   * Calculate next run time based on schedule frequency
   */
  calculateNextRunTime(
    frequency: string,
    time: string,
    dayOfWeek?: number | null,
    dayOfMonth?: number | null,
    timezone: string = "UTC"
  ): Date {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);

    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, move to next period
    if (nextRun <= now) {
      switch (frequency) {
        case "daily":
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case "weekly":
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case "monthly":
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    } else {
      // Time hasn't passed yet today, but adjust for weekly/monthly
      if (frequency === "weekly" && dayOfWeek !== undefined && dayOfWeek !== null) {
        const currentDay = nextRun.getDay();
        let daysUntil = dayOfWeek - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        nextRun.setDate(nextRun.getDate() + daysUntil);
      } else if (frequency === "monthly" && dayOfMonth !== undefined && dayOfMonth !== null) {
        if (nextRun.getDate() > dayOfMonth) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        nextRun.setDate(dayOfMonth);
      }
    }

    return nextRun;
  }

  /**
   * Get delivery history for a schedule
   */
  async getDeliveryHistory(scheduleId: string, limit: number = 10): Promise<any[]> {
    const db = await this.initDb();
    return db
      .select()
      .from(reportDeliveries)
      .where(eq(reportDeliveries.scheduleId, scheduleId))
      .orderBy(reportDeliveries.createdAt)
      .limit(limit);
  }

  /**
   * Get failed deliveries for retry
   */
  async getFailedDeliveries(): Promise<any[]> {
    const db = await this.initDb();
    return db
      .select()
      .from(reportDeliveries)
      .where(
        and(
          eq(reportDeliveries.status, "failed"),
          lt(reportDeliveries.retryCount, 3)
        )
      )
      .orderBy(reportDeliveries.createdAt);
  }

  /**
   * Create delivery record
   */
  async createDeliveryRecord(data: {
    scheduleId: string;
    recipients: string[];
    subject: string;
    status: "pending" | "sent" | "failed" | "bounced";
    reportData?: any;
    attachmentUrl?: string;
    attachmentFormat?: string;
    errorMessage?: string;
  }): Promise<{ id: string }> {
    const db = await this.initDb();
    const deliveryId = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(reportDeliveries).values({
      id: deliveryId,
      scheduleId: data.scheduleId,
      recipients: data.recipients,
      subject: data.subject,
      status: data.status,
      reportData: data.reportData,
      attachmentUrl: data.attachmentUrl,
      attachmentFormat: data.attachmentFormat,
      errorMessage: data.errorMessage,
    });

    return { id: deliveryId };
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: "pending" | "sent" | "failed" | "bounced",
    errorMessage?: string
  ): Promise<void> {
    const db = await this.initDb();
    const updates: any = {
      status,
    };

    if (status === "sent") {
      updates.sentAt = new Date();
    }

    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }

    await db.update(reportDeliveries).set(updates).where(eq(reportDeliveries.id, deliveryId));
  }

  /**
   * Increment retry count
   */
  async incrementRetryCount(deliveryId: string): Promise<void> {
    const db = await this.initDb();
    const delivery = await db
      .select()
      .from(reportDeliveries)
      .where(eq(reportDeliveries.id, deliveryId))
      .limit(1);

    if (delivery[0]) {
      await db
        .update(reportDeliveries)
        .set({
          retryCount: (delivery[0].retryCount || 0) + 1,
          lastRetryAt: new Date(),
        })
        .where(eq(reportDeliveries.id, deliveryId));
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStatistics(scheduleId: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    bounced: number;
    pending: number;
    successRate: number;
  }> {
    const db = await this.initDb();
    const deliveries = await db
      .select()
      .from(reportDeliveries)
      .where(eq(reportDeliveries.scheduleId, scheduleId));

    const total = deliveries.length;
    const sent = deliveries.filter((d) => d.status === "sent").length;
    const failed = deliveries.filter((d) => d.status === "failed").length;
    const bounced = deliveries.filter((d) => d.status === "bounced").length;
    const pending = deliveries.filter((d) => d.status === "pending").length;

    return {
      total,
      sent,
      failed,
      bounced,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }

  /**
   * Validate schedule configuration
   */
  validateScheduleConfig(data: InsertReportSchedule): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Schedule name is required");
    }

    if (!data.frequency || !["daily", "weekly", "monthly", "custom"].includes(data.frequency)) {
      errors.push("Invalid frequency");
    }

    if (!data.time || !/^\d{2}:\d{2}$/.test(data.time)) {
      errors.push("Invalid time format (use HH:mm)");
    }

    if (data.frequency === "weekly" && (data.dayOfWeek === undefined || data.dayOfWeek === null)) {
      errors.push("Day of week is required for weekly schedules");
    }

    if (data.frequency === "monthly" && (data.dayOfMonth === undefined || data.dayOfMonth === null)) {
      errors.push("Day of month is required for monthly schedules");
    }

    if (!data.recipients || (Array.isArray(data.recipients) && data.recipients.length === 0)) {
      errors.push("At least one recipient is required");
    }

    if (!data.reportType || !["full", "summary", "metrics", "events", "providers", "errors"].includes(data.reportType)) {
      errors.push("Invalid report type");
    }

    if (!data.dateRangeType || !["last7days", "last30days", "last90days", "custom"].includes(data.dateRangeType)) {
      errors.push("Invalid date range type");
    }

    return errors;
  }

  /**
   * Generate cron expression from schedule
   */
  generateCronExpression(schedule: ReportSchedule): string {
    const [hours, minutes] = schedule.time.split(":").map(Number);

    switch (schedule.frequency) {
      case "daily":
        return `${minutes} ${hours} * * *`;
      case "weekly":
        return `${minutes} ${hours} * * ${schedule.dayOfWeek}`;
      case "monthly":
        return `${minutes} ${hours} ${schedule.dayOfMonth} * *`;
      default:
        return "";
    }
  }

  /**
   * Parse cron expression
   */
  parseCronExpression(cron: string): {
    minute: number;
    hour: number;
    dayOfMonth?: number;
    dayOfWeek?: number;
  } {
    const parts = cron.split(" ");
    return {
      minute: parseInt(parts[0]),
      hour: parseInt(parts[1]),
      dayOfMonth: parts[2] !== "*" ? parseInt(parts[2]) : undefined,
      dayOfWeek: parts[4] !== "*" ? parseInt(parts[4]) : undefined,
    };
  }
}

export const reportSchedulingService = new ReportSchedulingService();

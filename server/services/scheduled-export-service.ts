/**
 * Scheduled Export Service
 * Manages scheduled exports with email delivery to stakeholders
 */

export interface ScheduledExportConfig {
  name: string;
  description?: string;
  exportType: "summary" | "metrics" | "trends" | "recipients" | "emails" | "comprehensive";
  exportFormat: "csv" | "json";
  scheduleType: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone?: string;
  recipients: Array<{ email: string; name?: string }>;
}

export interface ScheduledExport extends ScheduledExportConfig {
  id: number;
  isActive: boolean;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportHistory {
  id: number;
  scheduledExportId: number;
  executionTime: Date;
  status: "pending" | "processing" | "completed" | "failed";
  recordCount?: number;
  fileSize?: number;
  errorMessage?: string;
  sentAt?: Date;
  deliveryStatus: "pending" | "sent" | "failed" | "bounced";
  createdAt: Date;
}

export class ScheduledExportService {
  private db: any;
  private schedules: Map<number, ScheduledExport> = new Map();
  private history: Map<number, ExportHistory[]> = new Map();
  private nextId: number = 1;

  constructor(db?: any) {
    this.db = db || null;
  }

  /**
   * Create a new scheduled export
   */
  async createScheduledExport(config: ScheduledExportConfig): Promise<ScheduledExport> {
    const id = this.nextId++;
    const nextExecutionAt = this.calculateNextExecution(
      config.scheduleType,
      config.timeOfDay,
      config.dayOfWeek,
      config.dayOfMonth,
      config.timezone
    );

    const scheduled: ScheduledExport = {
      id,
      ...config,
      isActive: true,
      nextExecutionAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.schedules.set(id, scheduled);
    this.history.set(id, []);

    return scheduled;
  }

  /**
   * Get all scheduled exports
   */
  async listScheduledExports(activeOnly: boolean = true): Promise<ScheduledExport[]> {
    const exports = Array.from(this.schedules.values());
    return activeOnly ? exports.filter((e) => e.isActive) : exports;
  }

  /**
   * Get scheduled export by ID
   */
  async getScheduledExport(id: number): Promise<ScheduledExport | null> {
    return this.schedules.get(id) || null;
  }

  /**
   * Update scheduled export
   */
  async updateScheduledExport(
    id: number,
    updates: Partial<ScheduledExportConfig>
  ): Promise<ScheduledExport> {
    const existing = this.schedules.get(id);
    if (!existing) throw new Error("Scheduled export not found");

    const nextExecutionAt = updates.scheduleType || updates.timeOfDay
      ? this.calculateNextExecution(
          updates.scheduleType || existing.scheduleType,
          updates.timeOfDay || existing.timeOfDay,
          updates.dayOfWeek !== undefined ? updates.dayOfWeek : existing.dayOfWeek,
          updates.dayOfMonth !== undefined ? updates.dayOfMonth : existing.dayOfMonth,
          updates.timezone || existing.timezone
        )
      : existing.nextExecutionAt;

    const updated: ScheduledExport = {
      ...existing,
      ...updates,
      nextExecutionAt,
      updatedAt: new Date(),
    };

    this.schedules.set(id, updated);
    return updated;
  }

  /**
   * Delete scheduled export
   */
  async deleteScheduledExport(id: number): Promise<void> {
    this.schedules.delete(id);
    this.history.delete(id);
  }

  /**
   * Get recipients for a scheduled export
   */
  async getExportRecipients(
    scheduledExportId: number
  ): Promise<Array<{ email: string; name?: string }>> {
    const scheduled = this.schedules.get(scheduledExportId);
    return scheduled?.recipients || [];
  }

  /**
   * Record export execution
   */
  async recordExportExecution(
    scheduledExportId: number,
    status: "pending" | "processing" | "completed" | "failed",
    recordCount?: number,
    fileSize?: number,
    errorMessage?: string
  ): Promise<ExportHistory> {
    const historyId = Math.floor(Math.random() * 100000);
    const executionTime = new Date();

    const record: ExportHistory = {
      id: historyId,
      scheduledExportId,
      executionTime,
      status,
      recordCount,
      fileSize,
      errorMessage,
      deliveryStatus: "pending",
      createdAt: new Date(),
    };

    const histories = this.history.get(scheduledExportId) || [];
    histories.push(record);
    this.history.set(scheduledExportId, histories);

    // Update next execution
    const scheduled = this.schedules.get(scheduledExportId);
    if (scheduled) {
      const nextExecutionAt = this.calculateNextExecutionFromNow(scheduled);
      scheduled.lastExecutedAt = executionTime;
      scheduled.nextExecutionAt = nextExecutionAt;
      this.schedules.set(scheduledExportId, scheduled);
    }

    return record;
  }

  /**
   * Update export delivery status
   */
  async updateDeliveryStatus(
    historyId: number,
    deliveryStatus: "pending" | "sent" | "failed" | "bounced",
    sentAt?: Date
  ): Promise<void> {
    for (const histories of this.history.values()) {
      const record = histories.find((h) => h.id === historyId);
      if (record) {
        record.deliveryStatus = deliveryStatus;
        record.sentAt = sentAt || new Date();
        break;
      }
    }
  }

  /**
   * Get export history
   */
  async getExportHistory(
    scheduledExportId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ExportHistory[]> {
    const histories = this.history.get(scheduledExportId) || [];
    return histories.slice(offset, offset + limit);
  }

  /**
   * Get pending exports for execution
   */
  async getPendingExports(): Promise<ScheduledExport[]> {
    const now = new Date();
    return Array.from(this.schedules.values()).filter(
      (exp) => exp.isActive && exp.nextExecutionAt && exp.nextExecutionAt <= now
    );
  }

  /**
   * Calculate next execution time
   */
  private calculateNextExecution(
    scheduleType: "daily" | "weekly" | "monthly",
    timeOfDay: string,
    dayOfWeek?: number,
    dayOfMonth?: number,
    timezone: string = "UTC"
  ): Date {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(":").map(Number);

    let nextExecution = new Date(now);
    nextExecution.setHours(hours, minutes, 0, 0);

    if (nextExecution <= now) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }

    if (scheduleType === "weekly" && dayOfWeek !== undefined) {
      const currentDay = nextExecution.getDay();
      let daysUntilTarget = dayOfWeek - currentDay;

      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }

      nextExecution.setDate(nextExecution.getDate() + daysUntilTarget);
    } else if (scheduleType === "monthly" && dayOfMonth !== undefined) {
      nextExecution.setDate(dayOfMonth);

      if (nextExecution <= now) {
        nextExecution.setMonth(nextExecution.getMonth() + 1);
        nextExecution.setDate(dayOfMonth);
      }
    }

    return nextExecution;
  }

  /**
   * Calculate next execution from current scheduled export
   */
  private calculateNextExecutionFromNow(scheduled: ScheduledExport): Date {
    return this.calculateNextExecution(
      scheduled.scheduleType,
      scheduled.timeOfDay,
      scheduled.dayOfWeek,
      scheduled.dayOfMonth,
      scheduled.timezone
    );
  }

  /**
   * Notify about scheduled export
   */
  async notifyExportExecution(
    scheduledExportId: number,
    status: "completed" | "failed",
    details?: Record<string, any>
  ): Promise<boolean> {
    const export_ = await this.getScheduledExport(scheduledExportId);
    if (!export_) return false;

    const title = status === "completed"
      ? `✅ Export Completed: ${export_.name}`
      : `❌ Export Failed: ${export_.name}`;

    const content = status === "completed"
      ? `Your scheduled export "${export_.name}" has been completed and emailed to ${export_.recipients?.length || 0} recipients.`
      : `Your scheduled export "${export_.name}" failed to execute. Error: ${details?.errorMessage || "Unknown error"}`;

    console.log(`[Notification] ${title}: ${content}`);
    return true;
  }
}

export default ScheduledExportService;

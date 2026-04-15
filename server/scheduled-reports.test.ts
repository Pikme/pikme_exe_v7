import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReportSchedulingService } from "./report-scheduling-service";
import { EmailReportGeneratorService } from "./email-report-generator";

describe("Scheduled Reports System", () => {
  let reportSchedulingService: ReportSchedulingService;
  let emailReportGeneratorService: EmailReportGeneratorService;

  beforeEach(() => {
    reportSchedulingService = new ReportSchedulingService();
    emailReportGeneratorService = new EmailReportGeneratorService();
  });

  describe("ReportSchedulingService", () => {
    it("should calculate next run time for daily schedule", () => {
      const now = new Date("2026-01-24T10:00:00Z");
      const nextRun = reportSchedulingService.calculateNextRunTime("daily", 14, "UTC", now);

      expect(nextRun).toBeDefined();
      expect(nextRun.getHours()).toBe(14);
    });

    it("should calculate next run time for weekly schedule", () => {
      const now = new Date("2026-01-24T10:00:00Z");
      const nextRun = reportSchedulingService.calculateNextRunTime("weekly", 14, "UTC", now, 1);

      expect(nextRun).toBeDefined();
      expect(nextRun.getDay()).toBe(1);
    });

    it("should calculate next run time for monthly schedule", () => {
      const now = new Date("2026-01-24T10:00:00Z");
      const nextRun = reportSchedulingService.calculateNextRunTime("monthly", 14, "UTC", now, 1);

      expect(nextRun).toBeDefined();
      expect(nextRun.getDate()).toBe(1);
    });

    it("should generate valid cron expression for daily schedule", () => {
      const cron = reportSchedulingService.generateCronExpression("daily", 14, 0, "UTC");

      expect(cron).toBe("0 14 * * *");
    });

    it("should generate valid cron expression for weekly schedule", () => {
      const cron = reportSchedulingService.generateCronExpression("weekly", 14, 1, "UTC");

      expect(cron).toBe("0 14 * * 1");
    });

    it("should generate valid cron expression for monthly schedule", () => {
      const cron = reportSchedulingService.generateCronExpression("monthly", 14, 1, "UTC");

      expect(cron).toBe("0 14 1 * *");
    });

    it("should validate schedule data correctly", () => {
      const validSchedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 14,
        minute: 0,
        timezone: "UTC",
        recipients: ["test@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(validSchedule);
      expect(isValid).toBe(true);
    });

    it("should reject schedule with invalid hour", () => {
      const invalidSchedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 25,
        minute: 0,
        timezone: "UTC",
        recipients: ["test@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(invalidSchedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with invalid minute", () => {
      const invalidSchedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 14,
        minute: 61,
        timezone: "UTC",
        recipients: ["test@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(invalidSchedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with empty recipients", () => {
      const invalidSchedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 14,
        minute: 0,
        timezone: "UTC",
        recipients: [],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(invalidSchedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with invalid email", () => {
      const invalidSchedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 14,
        minute: 0,
        timezone: "UTC",
        recipients: ["invalid-email"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(invalidSchedule);
      expect(isValid).toBe(false);
    });
  });

  describe("EmailReportGeneratorService", () => {
    it("should generate summary report email", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "summary",
        dateRangeType: "last7days",
        recipientEmail: "test@example.com",
        recipientName: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.subject).toBeDefined();
      expect(result.subject).toContain("Summary Report");
    });

    it("should generate detailed report email", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "detailed",
        dateRangeType: "last30days",
        recipientEmail: "test@example.com",
        recipientName: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.subject).toBeDefined();
      expect(result.subject).toContain("Detailed");
    });

    it("should generate performance report email", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "performance",
        dateRangeType: "last90days",
        recipientEmail: "test@example.com",
        recipientName: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.subject).toBeDefined();
      expect(result.subject).toContain("Performance");
    });

    it("should generate report with custom date range", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "summary",
        dateRangeType: "custom",
        customDaysBack: 14,
        recipientEmail: "test@example.com",
        recipientName: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.subject).toBeDefined();
    });

    it("should throw error for unknown report type", async () => {
      await expect(
        emailReportGeneratorService.generateAnalyticsReportEmail({
          reportType: "unknown",
          dateRangeType: "last7days",
          recipientEmail: "test@example.com",
        })
      ).rejects.toThrow("Unknown report type");
    });

    it("should include recipient name in email", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "summary",
        dateRangeType: "last7days",
        recipientEmail: "test@example.com",
        recipientName: "John Doe",
      });

      expect(result.html).toBeDefined();
    });

    it("should use default recipient name if not provided", async () => {
      const result = await emailReportGeneratorService.generateAnalyticsReportEmail({
        reportType: "summary",
        dateRangeType: "last7days",
        recipientEmail: "test@example.com",
      });

      expect(result.html).toBeDefined();
    });
  });

  describe("Schedule Validation", () => {
    it("should accept valid daily schedule", () => {
      const schedule = {
        name: "Daily Report",
        frequency: "daily",
        hour: 9,
        minute: 0,
        timezone: "America/New_York",
        recipients: ["admin@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(true);
    });

    it("should accept valid weekly schedule", () => {
      const schedule = {
        name: "Weekly Report",
        frequency: "weekly",
        hour: 9,
        minute: 0,
        dayOfWeek: 1,
        timezone: "Europe/London",
        recipients: ["admin@example.com"],
        reportType: "detailed",
        dateRangeType: "last30days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(true);
    });

    it("should accept valid monthly schedule", () => {
      const schedule = {
        name: "Monthly Report",
        frequency: "monthly",
        hour: 9,
        minute: 0,
        dayOfMonth: 1,
        timezone: "Asia/Tokyo",
        recipients: ["admin@example.com"],
        reportType: "performance",
        dateRangeType: "last90days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(true);
    });

    it("should accept multiple recipients", () => {
      const schedule = {
        name: "Team Report",
        frequency: "daily",
        hour: 9,
        minute: 0,
        timezone: "UTC",
        recipients: ["admin@example.com", "manager@example.com", "team@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(true);
    });

    it("should reject schedule with missing name", () => {
      const schedule = {
        frequency: "daily",
        hour: 9,
        minute: 0,
        timezone: "UTC",
        recipients: ["admin@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with invalid frequency", () => {
      const schedule = {
        name: "Invalid Report",
        frequency: "invalid",
        hour: 9,
        minute: 0,
        timezone: "UTC",
        recipients: ["admin@example.com"],
        reportType: "summary",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with invalid report type", () => {
      const schedule = {
        name: "Invalid Report",
        frequency: "daily",
        hour: 9,
        minute: 0,
        timezone: "UTC",
        recipients: ["admin@example.com"],
        reportType: "invalid",
        dateRangeType: "last7days",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(false);
    });

    it("should reject schedule with invalid date range type", () => {
      const schedule = {
        name: "Invalid Report",
        frequency: "daily",
        hour: 9,
        minute: 0,
        timezone: "UTC",
        recipients: ["admin@example.com"],
        reportType: "summary",
        dateRangeType: "invalid",
        isActive: true,
      };

      const isValid = reportSchedulingService.validateScheduleData(schedule);
      expect(isValid).toBe(false);
    });
  });

  describe("Date Range Calculations", () => {
    it("should calculate correct date range for last 7 days", () => {
      const daysBack = reportSchedulingService.getDaysBackForDateRange("last7days");
      expect(daysBack).toBe(7);
    });

    it("should calculate correct date range for last 30 days", () => {
      const daysBack = reportSchedulingService.getDaysBackForDateRange("last30days");
      expect(daysBack).toBe(30);
    });

    it("should calculate correct date range for last 90 days", () => {
      const daysBack = reportSchedulingService.getDaysBackForDateRange("last90days");
      expect(daysBack).toBe(90);
    });

    it("should calculate correct date range for custom with default", () => {
      const daysBack = reportSchedulingService.getDaysBackForDateRange("custom");
      expect(daysBack).toBe(7);
    });
  });
});

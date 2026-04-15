/**
 * Tests for Scheduled Exports Router
 * Vitest tests for all tRPC procedures
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { schedulesRouter } from "./schedules";

// Mock the ScheduledExportService
vi.mock("../services/scheduled-export-service", () => ({
  default: class MockScheduledExportService {
    async createScheduledExport(data: any) {
      return {
        id: 1,
        ...data,
        createdAt: new Date(),
        isActive: true,
      };
    }

    async listScheduledExports(activeOnly: boolean) {
      return [
        {
          id: 1,
          name: "Daily Report",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "09:00",
          isActive: true,
          recipients: [{ email: "test@example.com", name: "Test User" }],
        },
      ];
    }

    async getScheduledExport(id: number) {
      if (id === 1) {
        return {
          id: 1,
          name: "Daily Report",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "09:00",
          isActive: true,
        };
      }
      return null;
    }

    async updateScheduledExport(id: number, data: any) {
      return {
        id,
        name: data.name || "Daily Report",
        ...data,
      };
    }

    async deleteScheduledExport(id: number) {
      return true;
    }

    async getExportRecipients(scheduleId: number) {
      return [{ email: "test@example.com", name: "Test User" }];
    }

    async getExportHistory(scheduleId: number, limit: number, offset: number) {
      return [
        {
          id: 1,
          scheduleId,
          status: "completed",
          recordCount: 150,
          fileSize: 7500,
          executionTime: new Date(),
        },
      ];
    }

    async recordExportExecution(
      scheduleId: number,
      status: string,
      recordCount?: number,
      fileSize?: number,
      error?: string
    ) {
      return {
        id: 1,
        scheduleId,
        status,
        recordCount,
        fileSize,
        error,
      };
    }

    async updateDeliveryStatus(executionId: number, status: string) {
      return true;
    }

    async getPendingExports() {
      return [
        {
          id: 1,
          name: "Daily Report",
          scheduleType: "daily",
          nextExecutionAt: new Date(),
        },
      ];
    }
  },
}));

describe("Scheduled Exports Router", () => {
  describe("schedules.list", () => {
    it("should list all active schedules", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.list({ activeOnly: true });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Daily Report");
      expect(result.count).toBe(1);
    });
  });

  describe("schedules.get", () => {
    it("should get a specific schedule", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.get({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe("Daily Report");
    });

    it("should throw error for non-existent schedule", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(caller.get({ id: 999 })).rejects.toThrow(
        "Failed to get scheduled export"
      );
    });
  });

  describe("schedules.create", () => {
    it("should create a new schedule with valid data", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.create({
        name: "Weekly Report",
        description: "Weekly engagement report",
        exportType: "summary",
        exportFormat: "csv",
        scheduleType: "weekly",
        timeOfDay: "10:00",
        dayOfWeek: 1,
        recipients: [{ email: "admin@example.com", name: "Admin" }],
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Weekly Report");
      expect(result.message).toBe("Scheduled export created successfully");
    });

    it("should validate required fields", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.create({
          name: "",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "10:00",
          recipients: [],
        })
      ).rejects.toThrow();
    });

    it("should require at least one recipient", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.create({
          name: "Test Schedule",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "10:00",
          recipients: [],
        })
      ).rejects.toThrow("At least one recipient is required");
    });

    it("should validate email format", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.create({
          name: "Test Schedule",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "10:00",
          recipients: [{ email: "invalid-email", name: "Test" }],
        })
      ).rejects.toThrow();
    });

    it("should validate time format", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.create({
          name: "Test Schedule",
          exportType: "summary",
          exportFormat: "csv",
          scheduleType: "daily",
          timeOfDay: "25:00",
          recipients: [{ email: "test@example.com", name: "Test" }],
        })
      ).rejects.toThrow();
    });
  });

  describe("schedules.update", () => {
    it("should update a schedule", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.update({
        id: 1,
        data: {
          name: "Updated Report",
          timeOfDay: "14:00",
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Updated Report");
      expect(result.message).toBe("Scheduled export updated successfully");
    });
  });

  describe("schedules.delete", () => {
    it("should delete a schedule", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Scheduled export deleted successfully");
    });
  });

  describe("schedules.toggle", () => {
    it("should toggle schedule active status", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.toggle({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toMatch(/paused|resumed/);
    });
  });

  describe("schedules.getHistory", () => {
    it("should get execution history", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getHistory({ id: 1, limit: 50, offset: 0 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("completed");
      expect(result.count).toBe(1);
    });
  });

  describe("schedules.getStats", () => {
    it("should calculate statistics", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getStats({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalExecutions");
      expect(result.data).toHaveProperty("successfulExecutions");
      expect(result.data).toHaveProperty("failedExecutions");
      expect(result.data).toHaveProperty("successRate");
      expect(result.data).toHaveProperty("totalRecords");
      expect(result.data).toHaveProperty("lastExecution");
      expect(result.data).toHaveProperty("averageRecords");
    });
  });

  describe("schedules.executeNow", () => {
    it("should execute a schedule immediately", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.executeNow({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("executionId");
      expect(result.data).toHaveProperty("recordCount");
      expect(result.data).toHaveProperty("fileSize");
      expect(result.data.message).toBe("Export executed and delivered successfully");
    });
  });

  describe("schedules.testEmail", () => {
    it("should send a test email", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
        notifyOwner: vi.fn(),
      } as any);

      const result = await caller.testEmail({
        id: 1,
        testEmail: "test@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("test@example.com");
    });

    it("should validate email format", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(
        caller.testEmail({
          id: 1,
          testEmail: "invalid-email",
        })
      ).rejects.toThrow();
    });
  });

  describe("schedules.getPending", () => {
    it("should get pending exports", async () => {
      const caller = schedulesRouter.createCaller({
        user: { id: "1", role: "admin" },
        req: {} as any,
        res: {} as any,
      } as any);

      const result = await caller.getPending();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  describe("Authentication", () => {
    it("should require authentication for all procedures", async () => {
      const caller = schedulesRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      } as any);

      await expect(caller.list({ activeOnly: true })).rejects.toThrow();
    });
  });
});

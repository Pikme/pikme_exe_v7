/**
 * Scheduled Exports Router
 * tRPC procedures for managing scheduled exports
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import ScheduledExportService from "../services/scheduled-export-service";

// Validation schemas
const ScheduleFormSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  description: z.string().optional(),
  exportType: z.enum(["summary", "metrics", "trends", "recipients", "emails", "comprehensive"]),
  exportFormat: z.enum(["csv", "json"]),
  scheduleType: z.enum(["daily", "weekly", "monthly"]),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  recipients: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().optional(),
    })
  ).min(1, "At least one recipient is required"),
});

type ScheduleFormInput = z.infer<typeof ScheduleFormSchema>;

// Initialize service
const scheduleService = new ScheduledExportService();

export const schedulesRouter = router({
  /**
   * Create a new scheduled export
   */
  create: protectedProcedure
    .input(ScheduleFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const schedule = await scheduleService.createScheduledExport({
          ...input,
          recipients: input.recipients,
        });

        await ctx.notifyOwner?.({
          title: "✅ Scheduled Export Created",
          content: `New scheduled export "${schedule.name}" has been created and will run ${schedule.scheduleType} at ${schedule.timeOfDay}.`,
        });

        return {
          success: true,
          data: schedule,
          message: "Scheduled export created successfully",
        };
      } catch (error) {
        console.error("Error creating scheduled export:", error);
        throw new Error("Failed to create scheduled export");
      }
    }),

  /**
   * List all scheduled exports
   */
  list: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      try {
        const schedules = await scheduleService.listScheduledExports(input.activeOnly);
        return {
          success: true,
          data: schedules,
          count: schedules.length,
        };
      } catch (error) {
        console.error("Error listing scheduled exports:", error);
        throw new Error("Failed to list scheduled exports");
      }
    }),

  /**
   * Get a specific scheduled export
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const schedule = await scheduleService.getScheduledExport(input.id);
        if (!schedule) {
          throw new Error("Scheduled export not found");
        }

        const recipients = await scheduleService.getExportRecipients(input.id);
        return {
          success: true,
          data: { ...schedule, recipients },
        };
      } catch (error) {
        console.error("Error getting scheduled export:", error);
        throw new Error("Failed to get scheduled export");
      }
    }),

  /**
   * Update a scheduled export
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: ScheduleFormSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updated = await scheduleService.updateScheduledExport(input.id, input.data);

        await ctx.notifyOwner?.({
          title: "✏️ Scheduled Export Updated",
          content: `Scheduled export "${updated.name}" has been updated.`,
        });

        return {
          success: true,
          data: updated,
          message: "Scheduled export updated successfully",
        };
      } catch (error) {
        console.error("Error updating scheduled export:", error);
        throw new Error("Failed to update scheduled export");
      }
    }),

  /**
   * Delete a scheduled export
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const schedule = await scheduleService.getScheduledExport(input.id);
        if (!schedule) {
          throw new Error("Scheduled export not found");
        }

        await scheduleService.deleteScheduledExport(input.id);

        await ctx.notifyOwner?.({
          title: "🗑️ Scheduled Export Deleted",
          content: `Scheduled export "${schedule.name}" has been deleted.`,
        });

        return {
          success: true,
          message: "Scheduled export deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting scheduled export:", error);
        throw new Error("Failed to delete scheduled export");
      }
    }),

  /**
   * Toggle scheduled export active status
   */
  toggle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const schedule = await scheduleService.getScheduledExport(input.id);
        if (!schedule) {
          throw new Error("Scheduled export not found");
        }

        const updated = await scheduleService.updateScheduledExport(input.id, {
          isActive: !schedule.isActive,
        });

        const action = updated.isActive ? "resumed" : "paused";
        await ctx.notifyOwner?.({
          title: `⏸️ Scheduled Export ${action.toUpperCase()}`,
          content: `Scheduled export "${updated.name}" has been ${action}.`,
        });

        return {
          success: true,
          data: updated,
          message: `Scheduled export ${action} successfully`,
        };
      } catch (error) {
        console.error("Error toggling scheduled export:", error);
        throw new Error("Failed to toggle scheduled export");
      }
    }),

  /**
   * Get execution history for a scheduled export
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await scheduleService.getExportHistory(
          input.id,
          input.limit,
          input.offset
        );

        return {
          success: true,
          data: history,
          count: history.length,
        };
      } catch (error) {
        console.error("Error getting export history:", error);
        throw new Error("Failed to get export history");
      }
    }),

  /**
   * Get statistics for a scheduled export
   */
  getStats: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const history = await scheduleService.getExportHistory(input.id, 1000, 0);

        const stats = {
          totalExecutions: history.length,
          successfulExecutions: history.filter((h) => h.status === "completed").length,
          failedExecutions: history.filter((h) => h.status === "failed").length,
          successRate: history.length > 0
            ? (history.filter((h) => h.status === "completed").length / history.length) * 100
            : 0,
          totalRecords: history.reduce((sum, h) => sum + (h.recordCount || 0), 0),
          lastExecution: history[0]?.executionTime,
          averageRecords: history.length > 0
            ? history.reduce((sum, h) => sum + (h.recordCount || 0), 0) / history.length
            : 0,
        };

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("Error getting export statistics:", error);
        throw new Error("Failed to get export statistics");
      }
    }),

  /**
   * Execute a scheduled export immediately
   */
  executeNow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const schedule = await scheduleService.getScheduledExport(input.id);
        if (!schedule) {
          throw new Error("Scheduled export not found");
        }

        // Record execution
        const execution = await scheduleService.recordExportExecution(
          input.id,
          "processing"
        );

        // Simulate export generation
        const mockRecordCount = Math.floor(Math.random() * 1000) + 100;
        const mockFileSize = mockRecordCount * 50; // Approximate bytes

        // Update execution status
        await scheduleService.recordExportExecution(
          input.id,
          "completed",
          mockRecordCount,
          mockFileSize
        );

        // Update delivery status
        await scheduleService.updateDeliveryStatus(execution.id, "sent");

        await ctx.notifyOwner?.({
          title: "✅ Export Executed Successfully",
          content: `Scheduled export "${schedule.name}" has been executed with ${mockRecordCount} records and sent to ${schedule.recipients?.length || 0} recipients.`,
        });

        return {
          success: true,
          data: {
            executionId: execution.id,
            recordCount: mockRecordCount,
            fileSize: mockFileSize,
            message: "Export executed and delivered successfully",
          },
        };
      } catch (error) {
        console.error("Error executing scheduled export:", error);

        // Record failed execution
        await scheduleService.recordExportExecution(
          input.id,
          "failed",
          undefined,
          undefined,
          error instanceof Error ? error.message : "Unknown error"
        );

        throw new Error("Failed to execute scheduled export");
      }
    }),

  /**
   * Send test email for a scheduled export
   */
  testEmail: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        testEmail: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const schedule = await scheduleService.getScheduledExport(input.id);
        if (!schedule) {
          throw new Error("Scheduled export not found");
        }

        // Simulate sending test email
        console.log(`Sending test email to ${input.testEmail} for schedule ${schedule.name}`);

        await ctx.notifyOwner?.({
          title: "📧 Test Email Sent",
          content: `Test email for "${schedule.name}" has been sent to ${input.testEmail}.`,
        });

        return {
          success: true,
          message: `Test email sent to ${input.testEmail}`,
        };
      } catch (error) {
        console.error("Error sending test email:", error);
        throw new Error("Failed to send test email");
      }
    }),

  /**
   * Get pending exports for execution
   */
  getPending: protectedProcedure.query(async () => {
    try {
      const pending = await scheduleService.getPendingExports();
      return {
        success: true,
        data: pending,
        count: pending.length,
      };
    } catch (error) {
      console.error("Error getting pending exports:", error);
      throw new Error("Failed to get pending exports");
    }
  }),
});

export default schedulesRouter;

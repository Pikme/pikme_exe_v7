import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { reportSchedulingService } from "../report-scheduling-service";
import { TRPCError } from "@trpc/server";

const reportScheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  timezone: z.string().default("UTC"),
  reportType: z.enum(["full", "summary", "metrics", "events", "providers", "errors"]),
  dateRangeType: z.enum(["last7days", "last30days", "last90days", "custom"]),
  customDaysBack: z.number().min(1).optional(),
  recipients: z.array(z.string().email()).min(1, "At least one recipient is required"),
  includeAttachment: z.boolean().default(true),
  attachmentFormat: z.enum(["json", "csv", "pdf"]).default("csv"),
  isActive: z.boolean().default(true),
});

export const reportSchedulesRouter = router({
  /**
   * Create a new report schedule
   */
  create: protectedProcedure
    .input(reportScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate schedule configuration
      const errors = reportSchedulingService.validateScheduleConfig({
        ...input,
        userId: ctx.user.id,
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      if (errors.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errors.join(", "),
        });
      }

      try {
        const schedule = await reportSchedulingService.createSchedule({
          ...input,
          userId: ctx.user.id,
          id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });

        return {
          success: true,
          schedule,
          message: "Report schedule created successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create report schedule",
        });
      }
    }),

  /**
   * Get all schedules for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const schedules = await reportSchedulingService.getUserSchedules(ctx.user.id);
      return {
        success: true,
        schedules,
        count: schedules.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch schedules",
      });
    }
  }),

  /**
   * Get a specific schedule by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.id);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this schedule",
          });
        }

        return {
          success: true,
          schedule,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch schedule",
        });
      }
    }),

  /**
   * Update a report schedule
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: reportScheduleSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.id);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to update this schedule",
          });
        }

        const updated = await reportSchedulingService.updateSchedule(input.id, input.data);

        return {
          success: true,
          schedule: updated,
          message: "Report schedule updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update schedule",
        });
      }
    }),

  /**
   * Delete a report schedule
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.id);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this schedule",
          });
        }

        await reportSchedulingService.deleteSchedule(input.id);

        return {
          success: true,
          message: "Report schedule deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete schedule",
        });
      }
    }),

  /**
   * Toggle schedule active status
   */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.id);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to modify this schedule",
          });
        }

        const updated = await reportSchedulingService.updateSchedule(input.id, {
          isActive: input.isActive,
        });

        return {
          success: true,
          schedule: updated,
          message: `Schedule ${input.isActive ? "activated" : "deactivated"} successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle schedule status",
        });
      }
    }),

  /**
   * Get delivery history for a schedule
   */
  getDeliveryHistory: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.scheduleId);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this schedule",
          });
        }

        const history = await reportSchedulingService.getDeliveryHistory(input.scheduleId, input.limit);

        return {
          success: true,
          deliveries: history,
          count: history.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch delivery history",
        });
      }
    }),

  /**
   * Get delivery statistics for a schedule
   */
  getDeliveryStats: protectedProcedure
    .input(z.object({ scheduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.scheduleId);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this schedule",
          });
        }

        const stats = await reportSchedulingService.getDeliveryStatistics(input.scheduleId);

        return {
          success: true,
          stats,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch delivery statistics",
        });
      }
    }),

  /**
   * Manually trigger a report generation and delivery
   */
  triggerNow: protectedProcedure
    .input(z.object({ scheduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.scheduleId);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to trigger this schedule",
          });
        }

        // Create delivery record
        const delivery = await reportSchedulingService.createDeliveryRecord({
          scheduleId: input.scheduleId,
          recipients: schedule.recipients as string[],
          subject: `${schedule.name} - Manual Trigger`,
          status: "pending",
        });

        // TODO: Queue report generation job
        // This would typically integrate with a job queue like Bull or RabbitMQ

        return {
          success: true,
          deliveryId: delivery.id,
          message: "Report generation triggered successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger report generation",
        });
      }
    }),

  /**
   * Get next scheduled run time
   */
  getNextRunTime: protectedProcedure
    .input(z.object({ scheduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const schedule = await reportSchedulingService.getScheduleById(input.scheduleId);

        if (!schedule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Schedule not found",
          });
        }

        // Verify ownership
        if (schedule.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this schedule",
          });
        }

        return {
          success: true,
          nextRunAt: schedule.nextRunAt,
          lastRunAt: schedule.lastRunAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch next run time",
        });
      }
    }),

  /**
   * Validate schedule configuration
   */
  validate: protectedProcedure
    .input(reportScheduleSchema)
    .query(({ input }) => {
      const errors = reportSchedulingService.validateScheduleConfig({
        ...input,
        userId: 0,
        id: "temp",
      });

      return {
        success: errors.length === 0,
        errors,
      };
    }),
});

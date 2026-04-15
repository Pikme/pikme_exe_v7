import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { sendRollbackNotification, sendRollbackStartedNotification } from "../_core/rollback-notification-service";

// ============ Admin Procedure ============
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const rollbackRouter = router({
  // ============ Get Rollback Info ============
  getByImportLog: adminProcedure
    .input(z.object({
      importLogId: z.number(),
    }))
    .query(async ({ input }) => {
      const rollbacks = await db.getRollbacksByImportLog(input.importLogId);
      return rollbacks;
    }),

  getRollbackById: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const rollback = await db.getRollbackById(input.id);
      if (!rollback) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Rollback not found" });
      }
      return rollback;
    }),

  // ============ List Rollback Logs ============
  listLogs: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      userId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listRollbackLogs({
        status: input.status,
        userId: input.userId,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  countLogs: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.countRollbackLogs({
        status: input.status,
        userId: input.userId,
      });
    }),

  // ============ Get Statistics ============
  getStatistics: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const stats = await db.getRollbackStatistics(input.userId);
      if (!stats) {
        return {
          totalRollbacks: 0,
          totalRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
        };
      }
      return {
        totalRollbacks: stats.totalRollbacks || 0,
        totalRecords: Number(stats.totalRecords) || 0,
        successfulRecords: Number(stats.successfulRecords) || 0,
        failedRecords: Number(stats.failedRecords) || 0,
      };
    }),

  // ============ Get Rollback Log Details ============
  getLogById: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const log = await db.getRollbackLog(input.id);
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Rollback log not found" });
      }
      return log;
    }),

  getLogsByImportLog: adminProcedure
    .input(z.object({
      importLogId: z.number(),
    }))
    .query(async ({ input }) => {
      return db.getRollbackLogsByImportLog(input.importLogId);
    }),

  // ============ Execute Rollback ============
  executeRollback: adminProcedure
    .input(z.object({
      importLogId: z.number(),
      reason: z.string().optional(),
      notifyAdmin: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
      }

      try {
        // Get all rollbacks for this import
        const rollbacks = await db.getRollbacksByImportLog(input.importLogId);
        
        if (rollbacks.length === 0) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "No rollbacks found for this import" 
          });
        }

        let successCount = 0;
        let failureCount = 0;
        const errors: any[] = [];

        // Execute each rollback
        for (const rollback of rollbacks) {
          try {
            if (rollback.action === "create" && rollback.recordId) {
              // Delete created records
              await db.deleteAttractionById(rollback.recordId);
              successCount++;
              await db.updateRollbackStatus(rollback.id, "completed");
            } else if (rollback.action === "update" && rollback.previousData) {
              // Restore previous data
              await db.restoreAttractionData(rollback.recordId, rollback.previousData);
              successCount++;
              await db.updateRollbackStatus(rollback.id, "completed");
            } else if (rollback.action === "delete" && rollback.newData) {
              // Restore deleted records (if we have the data)
              // This would require re-inserting, which we skip for now
              failureCount++;
              await db.updateRollbackStatus(rollback.id, "failed");
              errors.push({
                rollbackId: rollback.id,
                message: "Cannot restore deleted records without full data",
              });
            }
          } catch (error: any) {
            failureCount++;
            await db.updateRollbackStatus(rollback.id, "failed");
            errors.push({
              rollbackId: rollback.id,
              message: error.message,
            });
          }
        }

        // Create rollback log
        await db.createRollbackLog({
          importLogId: input.importLogId,
          userId: ctx.user.id,
          totalRollbacks: rollbacks.length,
          successfulRollbacks: successCount,
          failedRollbacks: failureCount,
          errors: errors.length > 0 ? errors : undefined,
          reason: input.reason,
        });

        // Send completion notification
        if (input.notifyAdmin && ctx.user.email) {
          await sendRollbackNotification(
            ctx.user.email,
            ctx.user.name || "Admin",
            {
              importLogId: input.importLogId,
              totalRollbacks: rollbacks.length,
              successfulRollbacks: successCount,
              failedRollbacks: failureCount,
              errors: errors.length > 0 ? errors : undefined,
              reason: input.reason,
            }
          );
        }

        return {
          success: true,
          totalRollbacks: rollbacks.length,
          successfulRollbacks: successCount,
          failedRollbacks: failureCount,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to execute rollback",
        });
      }
    }),

  // ============ Preview Rollback ============
  previewRollback: adminProcedure
    .input(z.object({
      importLogId: z.number(),
    }))
    .query(async ({ input }) => {
      const rollbacks = await db.getRollbacksByImportLog(input.importLogId);
      
      const preview = {
        totalRecords: rollbacks.length,
        toDelete: rollbacks.filter(r => r.action === "create").length,
        toRestore: rollbacks.filter(r => r.action === "update").length,
        cannotRestore: rollbacks.filter(r => r.action === "delete").length,
        details: rollbacks.map(r => ({
          id: r.id,
          recordId: r.recordId,
          action: r.action,
          entityType: r.entityType,
          previousData: r.previousData,
          newData: r.newData,
        })),
      };

      return preview;
    }),

  // ============ Delete Rollback Log ============
  deleteLog: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const log = await db.getRollbackLog(input.id);
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Rollback log not found" });
      }

      return db.deleteRollbackLog(input.id);
    }),

  // ============ Export Rollback History ============
  exportHistory: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
    }))
    .query(async ({ input }) => {
      const logs = await db.listRollbackLogs({
        status: input.status,
        limit: 1000,
      });

      return {
        data: logs,
        count: logs.length,
        exportedAt: new Date().toISOString(),
      };
    }),
});

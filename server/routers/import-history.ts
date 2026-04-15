import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// ============ Admin Procedure ============
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const importHistoryRouter = router({
  // ============ List and Search ============
  listAll: adminProcedure
    .input(z.object({
      importType: z.enum(["tours", "locations", "flights", "activities", "attractions"]).optional(),
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      userId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listImportLogs({
        importType: input.importType,
        status: input.status,
        userId: input.userId,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  countAll: adminProcedure
    .input(z.object({
      importType: z.enum(["tours", "locations", "flights", "activities", "attractions"]).optional(),
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.countImportLogs({
        importType: input.importType,
        status: input.status,
        userId: input.userId,
      });
    }),

  // ============ Get Details ============
  getById: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const log = await db.getImportLogById(input.id);
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import log not found" });
      }
      return log;
    }),

  // ============ Create ============
  create: adminProcedure
    .input(z.object({
      fileName: z.string(),
      importType: z.enum(["tours", "locations", "flights", "activities", "attractions"]),
      totalRecords: z.number(),
      successfulRecords: z.number(),
      failedRecords: z.number(),
      errors: z.array(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
      }

      return db.createImportLogEntry({
        userId: ctx.user.id,
        fileName: input.fileName,
        importType: input.importType,
        totalRecords: input.totalRecords,
        successfulRecords: input.successfulRecords,
        failedRecords: input.failedRecords,
        errors: input.errors,
        status: "completed",
      });
    }),

  // ============ Update Status ============
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "completed", "failed"]),
    }))
    .mutation(async ({ input }) => {
      const log = await db.getImportLogById(input.id);
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import log not found" });
      }

      return db.updateImportLogStatus(input.id, input.status);
    }),

  // ============ Statistics ============
  getStatistics: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const stats = await db.getImportStatistics(input.userId);
      if (!stats) {
        return {
          totalImports: 0,
          totalRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
        };
      }
      return {
        totalImports: stats.totalImports || 0,
        totalRecords: Number(stats.totalRecords) || 0,
        successfulRecords: Number(stats.successfulRecords) || 0,
        failedRecords: Number(stats.failedRecords) || 0,
      };
    }),

  // ============ Get by Type ============
  getByType: adminProcedure
    .input(z.object({
      importType: z.enum(["tours", "locations", "flights", "activities", "attractions"]),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return db.getImportLogsByType(input.importType, input.limit);
    }),

  // ============ Recent Imports ============
  getRecent: adminProcedure
    .input(z.object({
      days: z.number().default(7),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      return db.getRecentImports(input.days, input.limit);
    }),

  // ============ Delete ============
  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const log = await db.getImportLogById(input.id);
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Import log not found" });
      }

      return db.deleteImportLog(input.id);
    }),

  // ============ Export ============
  exportAsJSON: adminProcedure
    .input(z.object({
      importType: z.enum(["tours", "locations", "flights", "activities", "attractions"]).optional(),
      status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
    }))
    .query(async ({ input }) => {
      const logs = await db.listImportLogs({
        importType: input.importType,
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

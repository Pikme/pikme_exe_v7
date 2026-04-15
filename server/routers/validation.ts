import { router, adminProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  listValidationLogs,
  getValidationIssues,
  getValidationStatistics,
} from "../db";
import {
  runValidationJob,
  getValidationStats,
} from "../_core/validation-scheduler";

export const validationRouter = router({
  /**
   * Get validation logs with pagination and filtering
   */
  listLogs: adminProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
        validationType: z.enum(["attractions", "tours", "locations", "all"]).optional(),
        status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return listValidationLogs(input.page, input.limit, {
        validationType: input.validationType,
        status: input.status,
      });
    }),

  /**
   * Get validation issues for a specific log
   */
  getIssues: adminProcedure
    .input(
      z.object({
        logId: z.number().int().positive(),
        severity: z.enum(["info", "warning", "error"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return getValidationIssues(input.logId, input.severity);
    }),

  /**
   * Get validation statistics
   */
  getStatistics: adminProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getValidationStatistics(input.days);
    }),

  /**
   * Run validation job manually
   */
  runValidation: adminProcedure
    .input(
      z.object({
        validationTypes: z.array(z.enum(["attractions", "tours", "locations", "all"])).default(["attractions", "tours", "locations"]),
        notifyOnFailure: z.boolean().default(true),
        notifyOnAnomalies: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return runValidationJob({
        enabled: true,
        schedule: "0 2 * * *",
        validationTypes: input.validationTypes,
        notifyOnFailure: input.notifyOnFailure,
        notifyOnAnomalies: input.notifyOnAnomalies,
      });
    }),

  /**
   * Get validation stats
   */
  getStats: adminProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getValidationStats(input.days);
    }),

  /**
   * Export validation report as JSON
   */
  exportReport: adminProcedure
    .input(
      z.object({
        logId: z.number().int().positive(),
        format: z.enum(["json", "csv"]).default("json"),
      })
    )
    .query(async ({ input }) => {
      const issues = await getValidationIssues(input.logId);

      if (input.format === "json") {
        return {
          format: "json",
          data: JSON.stringify(issues, null, 2),
          filename: `validation-report-${input.logId}.json`,
        };
      } else {
        // CSV format
        const headers = ["ID", "Entity Type", "Entity ID", "Field", "Severity", "Message"];
        const rows = issues.map((issue: any) => [
          issue.id,
          issue.entityType,
          issue.entityId,
          issue.field || "N/A",
          issue.severity,
          issue.message,
        ]);

        const csv = [headers, ...rows]
          .map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))
          .join("\n");

        return {
          format: "csv",
          data: csv,
          filename: `validation-report-${input.logId}.csv`,
        };
      }
    }),
});

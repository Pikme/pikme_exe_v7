import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getEmailHistory,
  getEmailHistoryCount,
  getEmailById,
  getEmailHistoryStats,
  getRecentEmailHistory,
  getEmailHistoryByTemplateType,
  getEmailHistoryBySender,
  getEmailHistoryByRecipient,
  deleteOldEmailHistory,
  getDeliveryTracking,
} from "../email-history-service";

/**
 * Email History Router
 * Provides procedures for accessing and analyzing email history
 */

export const emailHistoryRouter = router({
  /**
   * Get email history with filtering and pagination
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        templateType: z.string().optional(),
        scenario: z.string().optional(),
        recipientEmail: z.string().email().optional(),
        senderUserId: z.number().optional(),
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const [history, total] = await Promise.all([
          getEmailHistory(input),
          getEmailHistoryCount(input),
        ]);

        return {
          success: true,
          data: history,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch email history",
        };
      }
    }),

  /**
   * Get email by ID
   */
  getEmailById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const email = await getEmailById(input.id);

        if (!email) {
          return {
            success: false,
            error: "Email not found",
          };
        }

        return {
          success: true,
          data: email,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch email",
        };
      }
    }),

  /**
   * Get email history statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        templateType: z.string().optional(),
        scenario: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = await getEmailHistoryStats(input);

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch statistics",
        };
      }
    }),

  /**
   * Get recent email history
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        const history = await getRecentEmailHistory(input.limit);

        return {
          success: true,
          data: history,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch recent emails",
        };
      }
    }),

  /**
   * Get email history by template type
   */
  getByTemplateType: protectedProcedure
    .input(
      z.object({
        templateType: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getEmailHistoryByTemplateType(input.templateType, input.limit);

        return {
          success: true,
          data: history,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch emails",
        };
      }
    }),

  /**
   * Get email history by sender
   */
  getBySender: protectedProcedure
    .input(
      z.object({
        senderUserId: z.number(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Only allow users to view their own history or admins to view all
        if (ctx.user.role !== "admin" && ctx.user.id !== input.senderUserId) {
          return {
            success: false,
            error: "Unauthorized",
          };
        }

        const history = await getEmailHistoryBySender(input.senderUserId, input.limit);

        return {
          success: true,
          data: history,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch emails",
        };
      }
    }),

  /**
   * Get email history by recipient
   */
  getByRecipient: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getEmailHistoryByRecipient(input.recipientEmail, input.limit);

        return {
          success: true,
          data: history,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch emails",
        };
      }
    }),

  /**
   * Get delivery tracking for email
   */
  getDeliveryTracking: protectedProcedure
    .input(z.object({ emailHistoryId: z.number() }))
    .query(async ({ input }) => {
      try {
        const tracking = await getDeliveryTracking(input.emailHistoryId);

        if (!tracking) {
          return {
            success: true,
            data: null,
            message: "No delivery tracking data available",
          };
        }

        return {
          success: true,
          data: tracking,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch delivery tracking",
        };
      }
    }),

  /**
   * Delete old email history (admin only)
   */
  deleteOldHistory: protectedProcedure
    .input(z.object({ daysOld: z.number().min(1).max(365) }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Only admins can delete history
        if (ctx.user.role !== "admin") {
          return {
            success: false,
            error: "Unauthorized - admin access required",
          };
        }

        const deleted = await deleteOldEmailHistory(input.daysOld);

        return {
          success: true,
          message: `Deleted ${deleted} email history records older than ${input.daysOld} days`,
          deleted,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete history",
        };
      }
    }),

  /**
   * Get email history summary
   */
  getSummary: protectedProcedure.query(async () => {
    try {
      const [recent, stats] = await Promise.all([
        getRecentEmailHistory(5),
        getEmailHistoryStats({}),
      ]);

      return {
        success: true,
        data: {
          recentEmails: recent,
          statistics: stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch summary",
      };
    }
  }),

  /**
   * Export email history as CSV (stub for future implementation)
   */
  exportAsCSV: protectedProcedure
    .input(
      z.object({
        templateType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getEmailHistory({
          templateType: input.templateType,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: 10000,
        });

        // Generate CSV headers
        const headers = [
          "ID",
          "Template Type",
          "Scenario",
          "Subject",
          "Recipient Email",
          "Recipient Name",
          "Status",
          "Sent At",
          "HTML Size",
          "Text Size",
        ];

        // Generate CSV rows
        const rows = history.map((email) => [
          email.id,
          email.templateType,
          email.scenario || "",
          `"${email.subject}"`,
          email.recipientEmail,
          email.recipientName || "",
          email.status,
          email.sentAt?.toISOString() || "",
          email.htmlSize || 0,
          email.textSize || 0,
        ]);

        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

        return {
          success: true,
          data: csv,
          filename: `email-history-${new Date().toISOString().split("T")[0]}.csv`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to export history",
        };
      }
    }),
});

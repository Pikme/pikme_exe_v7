import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { renderEmailByType, validateTemplateData } from "../email-template-service";
import { notifyOwner } from "../_core/notification";
import { logEmail, getEmailHistoryStats, updateEmailStatistics } from "../email-history-service";

/**
 * Email Test Router
 * Provides procedures for testing email sending
 */

export const emailTestRouter = router({
  /**
   * Send test email to owner
   */
  sendTestEmail: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        data: z.record(z.any()),
        scenario: z.string().optional(),
        recipientEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate data
        const validation = validateTemplateData(input.type, input.data);
        if (!validation.valid) {
          // Log failed email
          await logEmail({
            templateType: input.type,
            scenario: input.scenario,
            subject: "[VALIDATION FAILED]",
            recipientEmail: input.recipientEmail || ctx.user.email || "unknown@example.com",
            recipientName: ctx.user.name,
            senderUserId: ctx.user.id,
            status: "failed",
            errorMessage: `Validation failed: ${validation.errors.join(", ")}`,
            templateData: input.data,
          });

          return {
            success: false,
            error: `Template validation failed: ${validation.errors.join(", ")}`,
          };
        }

        // Render email
        const email = renderEmailByType(input.type, input.data);

        // Send test email via notification system
        const result = await notifyOwner({
          title: `[TEST] ${email.subject}`,
          content: email.html,
        });

        // Log email to history
        const emailHistoryId = await logEmail({
          templateType: input.type,
          scenario: input.scenario,
          subject: email.subject,
          recipientEmail: input.recipientEmail || ctx.user.email || "unknown@example.com",
          recipientName: ctx.user.name,
          senderUserId: ctx.user.id,
          status: result ? "sent" : "failed",
          errorMessage: result ? undefined : "Failed to send via notification system",
          htmlSize: email.html.length,
          textSize: email.text.length,
          templateData: input.data,
          metadata: {
            userAgent: ctx.user.name,
            timestamp: new Date().toISOString(),
          },
        });

        // Update statistics
        await updateEmailStatistics(input.type);

        if (result) {
          return {
            success: true,
            message: "Test email sent successfully",
            emailHistoryId,
            email: {
              subject: email.subject,
              htmlLength: email.html.length,
              textLength: email.text.length,
            },
          };
        } else {
          return {
            success: false,
            error: "Failed to send test email - notification service unavailable",
            emailHistoryId,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }),

  /**
   * Get email statistics
   */
  getEmailStats: protectedProcedure
    .input(
      z.object({
        templateType: z.string().optional(),
        scenario: z.string().optional(),
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
   * Validate email before sending
   */
  validateBeforeSending: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        data: z.record(z.any()),
      })
    )
    .query(({ input }) => {
      try {
        // Validate data
        const validation = validateTemplateData(input.type, input.data);

        // Render email to check for runtime errors
        let renderError: string | null = null;
        try {
          renderEmailByType(input.type, input.data);
        } catch (error) {
          renderError = error instanceof Error ? error.message : "Unknown rendering error";
        }

        return {
          valid: validation.valid && !renderError,
          validationErrors: validation.errors,
          renderError,
          allErrors: [...validation.errors, ...(renderError ? [renderError] : [])],
        };
      } catch (error) {
        return {
          valid: false,
          validationErrors: [],
          renderError: error instanceof Error ? error.message : "Unknown error",
          allErrors: [error instanceof Error ? error.message : "Unknown error"],
        };
      }
    }),


});

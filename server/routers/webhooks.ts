import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  handleWebhookEvent,
  webhookQueue,
  WebhookEvent,
} from "../webhooks/email-provider-webhook";

/**
 * Webhooks Router
 * Handles incoming webhooks from email service providers
 */

export const webhooksRouter = router({
  /**
   * Handle SendGrid webhooks
   */
  sendgrid: publicProcedure
    .input(
      z.object({
        events: z.array(z.record(z.any())),
        signature: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const events = input.events || [];

        if (events.length === 0) {
          return {
            success: false,
            error: "No events provided",
          };
        }

        // Process each event
        const processed = [];
        for (const event of events) {
          const webhookEvent: WebhookEvent = {
            type: event.event || "unknown",
            timestamp: (event.timestamp || 0) * 1000,
            messageId: event.sg_message_id,
            email: event.email,
            event: event.event,
            reason: event.reason,
            status: event.status,
            url: event.url,
            useragent: event.useragent,
            ip: event.ip,
          };

          await webhookQueue.enqueue(webhookEvent);
          processed.push(webhookEvent.type);
        }

        return {
          success: true,
          processed: processed.length,
          events: processed,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to process webhook",
        };
      }
    }),

  /**
   * Handle AWS SES webhooks
   */
  ses: publicProcedure
    .input(
      z.object({
        Message: z.string(),
        MessageId: z.string().optional(),
        Type: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message = JSON.parse(input.Message);
        const eventType = message.eventType || "unknown";

        const webhookEvent: WebhookEvent = {
          type: eventType,
          timestamp: new Date(message.mail?.timestamp || Date.now()).getTime(),
          messageId: message.mail?.messageId,
          email: message.mail?.destination?.[0],
          event: eventType,
          reason: message.bounce?.bounceSubType || message.complaint?.complaintFeedbackType,
          status: message.delivery?.status,
        };

        await webhookQueue.enqueue(webhookEvent);

        return {
          success: true,
          processed: 1,
          event: webhookEvent.type,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to process SES webhook",
        };
      }
    }),

  /**
   * Handle Mailgun webhooks
   */
  mailgun: publicProcedure
    .input(
      z.object({
        "event-data": z.record(z.any()),
        signature: z.object({
          token: z.string(),
          timestamp: z.string(),
          signature: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = input["event-data"] || {};

        const webhookEvent: WebhookEvent = {
          type: event.event || "unknown",
          timestamp: new Date((event.timestamp || 0) * 1000).getTime(),
          messageId: event.message?.headers?.["message-id"],
          email: event.recipient,
          event: event.event,
          reason: event.reason,
          status: event.severity,
          url: event.url,
          useragent: event["user-agent"],
          ip: event.ip,
        };

        await webhookQueue.enqueue(webhookEvent);

        return {
          success: true,
          processed: 1,
          event: webhookEvent.type,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to process Mailgun webhook",
        };
      }
    }),

  /**
   * Get webhook queue status
   */
  getQueueStatus: publicProcedure.query(() => {
    return {
      queueSize: webhookQueue.getQueueSize(),
      retryCount: webhookQueue.getRetryCount(),
      status: webhookQueue.getQueueSize() === 0 ? "idle" : "processing",
    };
  }),

  /**
   * Generic webhook handler for custom providers
   */
  handleCustom: publicProcedure
    .input(
      z.object({
        provider: z.string(),
        eventType: z.string(),
        data: z.record(z.any()),
        messageId: z.string().optional(),
        email: z.string().optional(),
        timestamp: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const webhookEvent: WebhookEvent = {
          type: input.eventType,
          timestamp: input.timestamp || Date.now(),
          messageId: input.messageId,
          email: input.email,
          event: input.eventType,
          ...input.data,
        };

        await webhookQueue.enqueue(webhookEvent);

        return {
          success: true,
          processed: 1,
          event: webhookEvent.type,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to process webhook",
        };
      }
    }),

  /**
   * Simulate webhook events for testing
   */
  simulateEvent: publicProcedure
    .input(
      z.object({
        provider: z.enum(["sendgrid", "ses", "mailgun"]),
        eventType: z.enum(["sent", "delivered", "open", "click", "bounce", "complaint"]),
        emailHistoryId: z.number(),
        recipientEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const webhookEvent: WebhookEvent = {
          type: input.eventType,
          timestamp: Date.now(),
          messageId: input.emailHistoryId.toString(),
          email: input.recipientEmail,
          event: input.eventType,
        };

        const success = await handleWebhookEvent(webhookEvent);

        return {
          success,
          message: success ? "Event processed successfully" : "Failed to process event",
          event: webhookEvent,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to simulate event",
        };
      }
    }),
});

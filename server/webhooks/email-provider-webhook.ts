import crypto from "crypto";
import { Request, Response } from "express";
import { getDb } from "../db";
import { emailDeliveryTracking, emailHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Email Provider Webhook Handler
 * Handles webhooks from email service providers (e.g., SendGrid, AWS SES, Mailgun)
 */

export interface WebhookEvent {
  type: string;
  timestamp: number;
  messageId?: string;
  email?: string;
  event?: string;
  reason?: string;
  status?: string;
  [key: string]: any;
}

export interface WebhookConfig {
  provider: "sendgrid" | "ses" | "mailgun" | "custom";
  signingKey: string;
  webhookUrl: string;
  enabled: boolean;
}

/**
 * Verify webhook signature based on provider
 */
export function verifyWebhookSignature(
  provider: string,
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  try {
    switch (provider) {
      case "sendgrid":
        return verifySendGridSignature(payload, signature, signingKey);
      case "ses":
        return verifySESSignature(payload, signature, signingKey);
      case "mailgun":
        return verifyMailgunSignature(payload, signature, signingKey);
      default:
        return false;
    }
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Verify SendGrid webhook signature
 * https://docs.sendgrid.com/for-developers/tracking/signed-webhooks
 */
function verifySendGridSignature(payload: string, signature: string, signingKey: string): boolean {
  const timestamp = payload.split("\r\n")[0];
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(timestamp + payload);
  const hash = hmac.digest("base64");
  return hash === signature;
}

/**
 * Verify AWS SES webhook signature
 * https://docs.aws.amazon.com/ses/latest/dg/event-publishing-verify-signature.html
 */
function verifySESSignature(payload: string, signature: string, signingKey: string): boolean {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(payload);
  const hash = hmac.digest("base64");
  return hash === signature;
}

/**
 * Verify Mailgun webhook signature
 * https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
 */
function verifyMailgunSignature(payload: string, signature: string, signingKey: string): boolean {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(payload);
  const hash = hmac.digest("hex");
  return hash === signature;
}

/**
 * Parse webhook payload based on provider
 */
export function parseWebhookPayload(provider: string, body: any): WebhookEvent[] {
  try {
    switch (provider) {
      case "sendgrid":
        return parseSendGridPayload(body);
      case "ses":
        return parseSESPayload(body);
      case "mailgun":
        return parseMailgunPayload(body);
      default:
        return [];
    }
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    return [];
  }
}

/**
 * Parse SendGrid webhook payload
 */
function parseSendGridPayload(body: any): WebhookEvent[] {
  if (!Array.isArray(body)) {
    return [];
  }

  return body.map((event) => ({
    type: event.event || "unknown",
    timestamp: event.timestamp * 1000, // Convert to milliseconds
    messageId: event.sg_message_id,
    email: event.email,
    event: event.event,
    reason: event.reason,
    status: event.status,
    url: event.url,
    useragent: event.useragent,
    ip: event.ip,
  }));
}

/**
 * Parse AWS SES webhook payload
 */
function parseSESPayload(body: any): WebhookEvent[] {
  const message = JSON.parse(body.Message || "{}");
  const eventType = message.eventType || "unknown";

  return [
    {
      type: eventType,
      timestamp: new Date(message.mail?.timestamp || Date.now()).getTime(),
      messageId: message.mail?.messageId,
      email: message.mail?.destination?.[0],
      event: eventType,
      reason: message.bounce?.bounceSubType || message.complaint?.complaintFeedbackType,
      status: message.delivery?.status,
    },
  ];
}

/**
 * Parse Mailgun webhook payload
 */
function parseMailgunPayload(body: any): WebhookEvent[] {
  const event = body["event-data"] || {};

  return [
    {
      type: event.event || "unknown",
      timestamp: new Date(event.timestamp * 1000).getTime(),
      messageId: event["message"]["headers"]["message-id"],
      email: event.recipient,
      event: event.event,
      reason: event.reason,
      status: event.severity,
      url: event.url,
      useragent: event["user-agent"],
      ip: event.ip,
    },
  ];
}

/**
 * Map webhook event to delivery tracking update
 */
export async function handleWebhookEvent(event: WebhookEvent): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }

    // Find email history record by message ID or email
    let emailRecord: typeof emailHistory.$inferSelect | null = null;

    if (event.messageId) {
      const records = await db
        .select()
        .from(emailHistory)
        .where(eq(emailHistory.id, parseInt(event.messageId)));
      emailRecord = records[0] || null;
    }

    if (!emailRecord && event.email) {
      const records = await db
        .select()
        .from(emailHistory)
        .where(eq(emailHistory.recipientEmail, event.email));
      emailRecord = records.length > 0 ? records[records.length - 1] : null; // Get most recent
    }

    if (!emailRecord) {
      console.warn(`No email record found for webhook event: ${JSON.stringify(event)}`);
      return false;
    }

    // Get or create delivery tracking record
    const trackingRecords = await db
      .select()
      .from(emailDeliveryTracking)
      .where(eq(emailDeliveryTracking.emailHistoryId, emailRecord.id));

    let tracking = trackingRecords[0];

    // Map webhook event type to delivery status
    const deliveryStatus = mapEventTypeToStatus(event.type);

    if (!tracking) {
      // Create new tracking record
      await db.insert(emailDeliveryTracking).values({
        emailHistoryId: emailRecord.id,
        deliveryStatus,
        trackingData: event,
      });
    } else {
      // Update existing tracking record
      const updates: any = {
        deliveryStatus,
        trackingData: event,
        updatedAt: new Date(),
      };

      // Update specific metrics based on event type
      if (event.type === "open" || event.type === "opened") {
        updates.opens = (tracking.opens || 0) + 1;
        if (!tracking.firstOpenedAt) {
          updates.firstOpenedAt = new Date(event.timestamp);
        }
        updates.lastOpenedAt = new Date(event.timestamp);
      } else if (event.type === "click" || event.type === "clicked") {
        updates.clicks = (tracking.clicks || 0) + 1;
        if (!tracking.firstClickedAt) {
          updates.firstClickedAt = new Date(event.timestamp);
        }
        updates.lastClickedAt = new Date(event.timestamp);
      } else if (event.type === "bounce" || event.type === "bounced") {
        updates.bounceType = event.reason?.includes("permanent") ? "permanent" : "temporary";
        updates.bounceSubType = event.reason;
      } else if (event.type === "complaint" || event.type === "complained") {
        updates.complaintType = event.reason;
      }

      await db.update(emailDeliveryTracking).set(updates).where(eq(emailDeliveryTracking.id, tracking.id));
    }

    return true;
  } catch (error) {
    console.error("Failed to handle webhook event:", error);
    return false;
  }
}

/**
 * Map webhook event type to delivery status
 */
function mapEventTypeToStatus(eventType: string): "sent" | "queued" | "delivered" | "bounced" | "complained" | "suppressed" {
  const statusMap: Record<string, "sent" | "queued" | "delivered" | "bounced" | "complained" | "suppressed"> = {
    sent: "sent",
    delivered: "delivered",
    bounce: "bounced",
    bounced: "bounced",
    complaint: "complained",
    complained: "complained",
    open: "delivered",
    opened: "delivered",
    click: "delivered",
    clicked: "delivered",
    dropped: "suppressed",
    deferred: "queued",
    processed: "queued",
  };

  return statusMap[eventType.toLowerCase()] || "sent";
}

/**
 * Express middleware for webhook handling
 */
export function createWebhookMiddleware(
  provider: string,
  signingKey: string,
  onEvent: (event: WebhookEvent) => Promise<void>
) {
  return async (req: Request, res: Response) => {
    try {
      // Get signature from headers
      const signature =
        req.headers["x-sendgrid-signature"] ||
        req.headers["x-amzn-sns-message-signature"] ||
        req.headers["x-mailgun-signature"] ||
        req.headers["x-webhook-signature"];

      if (!signature) {
        console.warn("Missing webhook signature");
        return res.status(401).json({ error: "Missing signature" });
      }

      // Get raw body for signature verification
      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

      // Verify signature
      if (!verifyWebhookSignature(provider, rawBody, signature as string, signingKey)) {
        console.warn("Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Parse payload
      const events = parseWebhookPayload(provider, req.body);

      if (events.length === 0) {
        return res.status(400).json({ error: "No events in payload" });
      }

      // Process each event
      for (const event of events) {
        try {
          await onEvent(event);
        } catch (error) {
          console.error("Failed to process webhook event:", error);
        }
      }

      // Return success
      res.status(200).json({ success: true, processed: events.length });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Webhook event queue for processing
 */
export class WebhookEventQueue {
  private queue: WebhookEvent[] = [];
  private processing = false;
  private retries: Map<string, number> = new Map();
  private maxRetries = 3;

  async enqueue(event: WebhookEvent): Promise<void> {
    this.queue.push(event);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (!event) break;

      const eventKey = `${event.messageId}-${event.type}`;

      try {
        const success = await handleWebhookEvent(event);

        if (!success) {
          const retryCount = (this.retries.get(eventKey) || 0) + 1;

          if (retryCount < this.maxRetries) {
            this.retries.set(eventKey, retryCount);
            this.queue.push(event); // Re-queue for retry
          } else {
            console.error(`Failed to process webhook event after ${this.maxRetries} retries:`, event);
            this.retries.delete(eventKey);
          }
        } else {
          this.retries.delete(eventKey);
        }
      } catch (error) {
        console.error("Error processing webhook event:", error);
        const retryCount = (this.retries.get(eventKey) || 0) + 1;

        if (retryCount < this.maxRetries) {
          this.retries.set(eventKey, retryCount);
          this.queue.push(event);
        } else {
          this.retries.delete(eventKey);
        }
      }

      // Small delay between processing events
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getRetryCount(): number {
    return this.retries.size;
  }
}

// Global webhook queue instance
export const webhookQueue = new WebhookEventQueue();

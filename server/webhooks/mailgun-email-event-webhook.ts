import { getDb } from "../db";
import { emailEventTracking } from "../../drizzle/schema";

/**
 * Mailgun Email Event Webhook Handler
 * Processes email engagement events from Mailgun (opens, clicks, bounces, complaints)
 * 
 * Mailgun sends events as POST requests with form data
 */
export async function handleMailgunEmailEvent(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    // Mailgun event structure
    const {
      "event-data": eventData,
    } = event;

    if (!eventData) {
      console.warn("No event-data found in Mailgun webhook");
      return;
    }

    const {
      event: eventType,
      timestamp,
      recipient,
      "user-variables": userVariables,
      "client-info": clientInfo,
      "geolocation": geolocation,
      "delivery-status": deliveryStatus,
      reason,
      code,
      description,
      url,
      "user-agent": userAgent,
      ip,
      "message-id": messageId,
    } = eventData;

    // Map Mailgun event types to our event types
    const eventTypeMap: Record<string, string> = {
      opened: "open",
      clicked: "click",
      bounced: "bounce",
      dropped: "dropped",
      delivered: "delivery",
      failed: "dropped",
      complained: "complaint",
      unsubscribed: "complaint",
      accepted: "processed",
    };

    const mappedEventType = eventTypeMap[eventType] || eventType;

    // Extract email history ID from user variables or message ID
    const emailHistoryId = parseInt(
      userVariables?.emailHistoryId || messageId?.split("-")[0] || "0",
      10
    ) || 0;

    if (emailHistoryId === 0) {
      console.warn(`Could not find emailHistoryId for Mailgun event: ${messageId}`);
      return;
    }

    // Determine bounce type
    let bounceType: "permanent" | "temporary" | "undetermined" = "undetermined";
    if (eventType === "bounced") {
      if (code === "550" || code === "551" || code === "552" || code === "553" || code === "554") {
        bounceType = "permanent";
      } else if (code === "421" || code === "450" || code === "451") {
        bounceType = "temporary";
      }
    }

    // Insert the event
    await db.insert(emailEventTracking).values({
      emailHistoryId,
      eventType: mappedEventType as any,
      recipientEmail: recipient,
      userAgent: userAgent || clientInfo?.user_agent,
      ipAddress: ip || clientInfo?.ip,
      linkUrl: url,
      bounceType: eventType === "bounced" ? bounceType : undefined,
      bounceSubType: reason,
      complaintType: eventType === "complained" ? "abuse" : undefined,
      rawEventData: eventData,
      eventTimestamp: new Date(timestamp * 1000), // Mailgun uses Unix timestamp
    });

    console.log(`✅ Processed Mailgun ${eventType} event for ${recipient}`);
  } catch (error) {
    console.error("❌ Error processing Mailgun email event:", error);
    throw error;
  }
}

/**
 * Validate Mailgun webhook signature
 * Mailgun signs webhooks with HMAC-SHA256
 */
export async function validateMailgunSignature(
  timestamp: string,
  token: string,
  signature: string,
  apiKey: string
): Promise<boolean> {
  try {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", apiKey);
    hmac.update(`${timestamp}${token}`);
    const expectedSignature = hmac.digest("hex");
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error validating Mailgun signature:", error);
    return false;
  }
}

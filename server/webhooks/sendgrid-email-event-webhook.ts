import { getDb } from "../db";
import { emailEventTracking } from "../../drizzle/schema";

/**
 * SendGrid Email Event Webhook Handler
 * Processes email engagement events from SendGrid (opens, clicks, bounces, complaints)
 * 
 * SendGrid sends events as POST requests with JSON payload
 * Each request can contain multiple events
 */
export async function handleSendGridEmailEvent(event: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    // SendGrid event structure
    const {
      email,
      event: eventType,
      timestamp,
      "user-id": userId,
      "email-id": emailId,
      url,
      "user-agent": userAgent,
      ip,
      sg_event_id: sgEventId,
      sg_message_id: sgMessageId,
      reason,
      status,
      "bounce-classification": bounceClassification,
      "complaint-feedback-type": complaintFeedbackType,
    } = event;

    // Map SendGrid event types to our event types
    const eventTypeMap: Record<string, string> = {
      open: "open",
      click: "click",
      bounce: "bounce",
      dropped: "dropped",
      delivered: "delivery",
      deferred: "deferred",
      processed: "processed",
      sent: "sent",
      spamreport: "complaint",
      unsubscribe: "complaint",
    };

    const mappedEventType = eventTypeMap[eventType] || eventType;

    // Extract bounce type from SendGrid bounce classification
    let bounceType: "permanent" | "temporary" | "undetermined" = "undetermined";
    if (bounceClassification === "Permanent Failure") {
      bounceType = "permanent";
    } else if (bounceClassification === "Transient Failure") {
      bounceType = "temporary";
    }

    // Find email history ID from SendGrid message ID or email address
    // For now, we'll use a placeholder - in production, you'd need to store SendGrid message IDs
    const emailHistoryId = parseInt(sgMessageId?.split("-")[0] || "0", 10) || 0;

    if (emailHistoryId === 0) {
      console.warn(`Could not find emailHistoryId for SendGrid event: ${sgEventId}`);
      return;
    }

    // Insert the event
    await db.insert(emailEventTracking).values({
      emailHistoryId,
      eventType: mappedEventType as any,
      recipientEmail: email,
      userAgent: userAgent,
      ipAddress: ip,
      linkUrl: url,
      bounceType: mappedEventType === "bounce" ? bounceType : undefined,
      complaintType: mappedEventType === "complaint" ? eventType : undefined,
      complaintFeedbackType: complaintFeedbackType,
      rawEventData: event,
      eventTimestamp: new Date(timestamp * 1000), // SendGrid uses Unix timestamp
    });

    console.log(`✅ Processed SendGrid ${eventType} event for ${email}`);
  } catch (error) {
    console.error("❌ Error processing SendGrid email event:", error);
    throw error;
  }
}

/**
 * Process batch of SendGrid events
 * SendGrid sends events in batches
 */
export async function handleSendGridEmailEventBatch(events: any[]): Promise<void> {
  for (const event of events) {
    await handleSendGridEmailEvent(event);
  }
}

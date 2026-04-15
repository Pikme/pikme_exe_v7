import { getDb } from "../db";
import { emailEventTracking } from "../../drizzle/schema";

/**
 * AWS SES Email Event Webhook Handler
 * Processes email engagement events from AWS SES (opens, clicks, bounces, complaints)
 * 
 * AWS SES sends events via SNS notifications
 * Each notification contains a single event
 */
export async function handleAwsSESEmailEvent(snsMessage: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    // Parse SNS message
    const message = typeof snsMessage === "string" ? JSON.parse(snsMessage) : snsMessage;
    
    const {
      eventType,
      mail,
      bounce,
      complaint,
      delivery,
      open,
      click,
      send,
      reject,
    } = message;

    // Extract common fields
    const recipientEmail = mail?.destination?.[0];
    const timestamp = new Date(message.mail?.timestamp || Date.now());
    const messageId = mail?.messageId;

    if (!recipientEmail) {
      console.warn("No recipient email found in AWS SES event");
      return;
    }

    // Find email history ID from message ID
    // In production, you'd need to store AWS SES message IDs
    const emailHistoryId = parseInt(messageId?.split("-")[0] || "0", 10) || 0;

    if (emailHistoryId === 0) {
      console.warn(`Could not find emailHistoryId for AWS SES event: ${messageId}`);
      return;
    }

    let mappedEventType = eventType;
    let bounceType: "permanent" | "temporary" | "undetermined" = "undetermined";
    let complaintType: string | undefined;

    // Handle bounce events
    if (eventType === "Bounce" && bounce) {
      const bounceSubType = bounce.bounceSubType;
      if (bounceSubType === "Permanent") {
        bounceType = "permanent";
      } else if (bounceSubType === "Transient") {
        bounceType = "temporary";
      }
      mappedEventType = "bounce";
    }

    // Handle complaint events
    if (eventType === "Complaint" && complaint) {
      complaintType = complaint.complaintFeedbackType || "unknown";
      mappedEventType = "complaint";
    }

    // Handle delivery events
    if (eventType === "Delivery") {
      mappedEventType = "delivery";
    }

    // Handle open events
    if (eventType === "Open") {
      mappedEventType = "open";
    }

    // Handle click events
    if (eventType === "Click") {
      mappedEventType = "click";
    }

    // Handle send events
    if (eventType === "Send") {
      mappedEventType = "sent";
    }

    // Handle reject events
    if (eventType === "Reject") {
      mappedEventType = "dropped";
    }

    // Insert the event
    await db.insert(emailEventTracking).values({
      emailHistoryId,
      eventType: mappedEventType as any,
      recipientEmail,
      userAgent: open?.userAgent,
      ipAddress: open?.ip || click?.ip,
      linkUrl: click?.link,
      bounceType: eventType === "Bounce" ? bounceType : undefined,
      complaintType,
      rawEventData: message,
      eventTimestamp: timestamp,
    });

    console.log(`✅ Processed AWS SES ${eventType} event for ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Error processing AWS SES email event:", error);
    throw error;
  }
}

/**
 * Validate AWS SNS message signature
 * AWS SNS signs messages with a certificate
 */
export async function validateAwsSNSSignature(message: any, signature: string, certificate: string): Promise<boolean> {
  // In production, you would verify the SNS signature here
  // For now, we'll skip validation
  return true;
}

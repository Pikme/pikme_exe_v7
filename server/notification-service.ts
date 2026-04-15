import {
  createNotification,
  getUnreadNotifications,
  shouldSendNotification,
} from "./db-notifications";
import { notifyOwner } from "./_core/notification";
import { InsertNotification } from "../drizzle/schema";
import {
  renderEmailByType,
  prepareEmailData,
  createEmailActionUrls,
  formatEmailDate,
  formatEmailCurrency,
} from "./email-template-service";

/**
 * Real-time notification service
 * Handles creation and delivery of notifications to team members
 */

// In-memory store for active connections (for future WebSocket support)
const activeConnections = new Map<number, Set<string>>();

/**
 * Send enquiry assignment notification to team member
 */
export async function notifyEnquiryAssignment(
  userId: number,
  enquiryId: number,
  enquiryDetails: {
    customerName: string;
    tourName: string;
    numberOfTravelers: number;
    email: string;
    phone: string;
  }
): Promise<void> {
  try {
    // Check if user has enabled enquiry assignment notifications
    const shouldSendEmail = await shouldSendNotification(userId, "enquiry_assigned", "email");
    const shouldSendInApp = await shouldSendNotification(userId, "enquiry_assigned", "inApp");

    if (!shouldSendEmail && !shouldSendInApp) {
      console.log(`[NOTIFICATION] Skipping notification for user ${userId} (disabled)`);
      return;
    }

    // Create in-app notification
    if (shouldSendInApp) {
      const notification = await createNotification({
        userId,
        type: "enquiry_assigned",
        title: `New Enquiry: ${enquiryDetails.tourName}`,
        message: `${enquiryDetails.customerName} has been assigned to you for ${enquiryDetails.numberOfTravelers} traveler(s).`,
        enquiryId,
        actionUrl: `/admin/bookings/${enquiryId}`,
        actionLabel: "View Enquiry",
        metadata: {
          customerName: enquiryDetails.customerName,
          tourName: enquiryDetails.tourName,
          numberOfTravelers: enquiryDetails.numberOfTravelers,
          email: enquiryDetails.email,
          phone: enquiryDetails.phone,
        },
      });

      console.log(`[NOTIFICATION] Created in-app notification ${notification.id} for user ${userId}`);

      // Broadcast to active connections (for future real-time updates)
      broadcastToUser(userId, {
        type: "notification_created",
        notification,
      });
    }

    // Send email notification
    if (shouldSendEmail) {
      await sendEnquiryAssignmentEmail(userId, enquiryDetails);
    }
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to notify user ${userId}:`, error);
    // Don't throw - notification failure shouldn't block enquiry creation
  }
}

/**
 * Send enquiry update notification
 */
export async function notifyEnquiryUpdate(
  userId: number,
  enquiryId: number,
  updateDetails: {
    customerName: string;
    updateType: string;
    updateMessage: string;
    customerEmail?: string;
    customerPhone?: string;
  },
  teamMemberName?: string
): Promise<void> {
  try {
    const shouldSendEmail = await shouldSendNotification(userId, "enquiry_updated", "email");
    const shouldSendInApp = await shouldSendNotification(userId, "enquiry_updated", "inApp");

    if (!shouldSendEmail && !shouldSendInApp) {
      return;
    }

    if (shouldSendInApp) {
      const notification = await createNotification({
        userId,
        type: "enquiry_updated",
        title: `Enquiry Update: ${updateDetails.customerName}`,
        message: updateDetails.updateMessage,
        enquiryId,
        actionUrl: `/admin/bookings/${enquiryId}`,
        actionLabel: "View Enquiry",
        metadata: updateDetails,
      });

      console.log(`[NOTIFICATION] Created update notification ${notification.id} for user ${userId}`);

      broadcastToUser(userId, {
        type: "notification_created",
        notification,
      });
    }

    if (shouldSendEmail) {
      await sendEnquiryUpdateEmail(userId, updateDetails, teamMemberName);
    }
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send update notification:`, error);
  }
}

/**
 * Send enquiry completion notification
 */
export async function notifyEnquiryCompleted(
  userId: number,
  enquiryId: number,
  completionDetails: {
    customerName: string;
    tourName: string;
    numberOfTravelers?: number;
    startDate?: string;
    endDate?: string;
    bookingValue?: number;
    bookingId?: string;
    conversionRate?: number;
  },
  teamMemberName?: string
): Promise<void> {
  try {
    const shouldSendEmail = await shouldSendNotification(userId, "enquiry_completed", "email");
    const shouldSendInApp = await shouldSendNotification(userId, "enquiry_completed", "inApp");

    if (!shouldSendEmail && !shouldSendInApp) {
      return;
    }

    if (shouldSendInApp) {
      const notification = await createNotification({
        userId,
        type: "enquiry_completed",
        title: `Booking Confirmed: ${completionDetails.customerName}`,
        message: `${completionDetails.customerName} has confirmed their booking for ${completionDetails.tourName}.`,
        enquiryId,
        actionUrl: `/admin/bookings/${enquiryId}`,
        actionLabel: "View Booking",
        metadata: completionDetails,
      });

      console.log(`[NOTIFICATION] Created completion notification ${notification.id} for user ${userId}`);

      broadcastToUser(userId, {
        type: "notification_created",
        notification,
      });
    }

    if (shouldSendEmail) {
      await sendEnquiryCompletionEmail(userId, completionDetails, teamMemberName);
    }
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send completion notification:`, error);
  }
}

/**
 * Send team message notification
 */
export async function notifyTeamMessage(
  userIds: number[],
  messageDetails: {
    senderName: string;
    message: string;
    channel?: string;
  }
): Promise<void> {
  try {
    for (const userId of userIds) {
      const shouldSendInApp = await shouldSendNotification(userId, "team_message", "inApp");

      if (!shouldSendInApp) {
        continue;
      }

      const notification = await createNotification({
        userId,
        type: "team_message",
        title: `Message from ${messageDetails.senderName}`,
        message: messageDetails.message,
        actionLabel: "View Message",
        metadata: messageDetails,
      });

      broadcastToUser(userId, {
        type: "notification_created",
        notification,
      });
    }
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send team message:`, error);
  }
}

/**
 * Send system alert notification
 */
export async function notifySystemAlert(
  userIds: number[],
  alertDetails: {
    title: string;
    message: string;
    severity?: "info" | "warning" | "error";
  }
): Promise<void> {
  try {
    for (const userId of userIds) {
      const shouldSendInApp = await shouldSendNotification(userId, "system_alert", "inApp");

      if (!shouldSendInApp) {
        continue;
      }

      const notification = await createNotification({
        userId,
        type: "system_alert",
        title: alertDetails.title,
        message: alertDetails.message,
        metadata: alertDetails,
      });

      broadcastToUser(userId, {
        type: "notification_created",
        notification,
      });
    }
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send system alert:`, error);
  }
}

/**
 * Send enquiry assignment email with branded template
 */
async function sendEnquiryAssignmentEmail(
  userId: number,
  enquiryDetails: {
    customerName: string;
    tourName: string;
    numberOfTravelers: number;
    email: string;
    phone: string;
    country?: string;
    preferredStartDate?: string;
    preferredEndDate?: string;
    specialRequests?: string;
    tourCategory?: string;
    matchingScore?: number;
  },
  teamMemberName: string = "Team Member",
  baseUrl: string = process.env.VITE_FRONTEND_FORGE_API_URL || "https://app.pikmeusa.com"
): Promise<void> {
  try {
    // Prepare email data
    const emailData = prepareEmailData(
      "enquiry_assigned",
      {
        teamMemberName,
        customerName: enquiryDetails.customerName,
        customerEmail: enquiryDetails.email,
        customerPhone: enquiryDetails.phone,
        customerCountry: enquiryDetails.country || "Not specified",
        tourName: enquiryDetails.tourName,
        numberOfTravelers: enquiryDetails.numberOfTravelers,
        preferredStartDate: enquiryDetails.preferredStartDate,
        preferredEndDate: enquiryDetails.preferredEndDate,
        specialRequests: enquiryDetails.specialRequests,
        tourCategory: enquiryDetails.tourCategory || "General",
        matchingScore: enquiryDetails.matchingScore || 85,
        ...createEmailActionUrls(baseUrl, userId),
      },
      baseUrl
    );

    // Render email template
    const emailContent = renderEmailByType("enquiry_assigned", emailData);

    // Send email using the built-in notification system
    await notifyOwner({
      title: emailContent.subject,
      content: emailContent.html,
    });

    console.log(`[NOTIFICATION] Sent branded email notification for user ${userId}`);
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send email:`, error);
  }
}

/**
 * Send enquiry update email with branded template
 */
async function sendEnquiryUpdateEmail(
  userId: number,
  updateDetails: {
    customerName: string;
    updateType: string;
    updateMessage: string;
    customerEmail?: string;
    customerPhone?: string;
  },
  teamMemberName: string = "Team Member",
  baseUrl: string = process.env.VITE_FRONTEND_FORGE_API_URL || "https://app.pikmeusa.com"
): Promise<void> {
  try {
    const emailData = prepareEmailData(
      "enquiry_updated",
      {
        teamMemberName,
        customerName: updateDetails.customerName,
        customerEmail: updateDetails.customerEmail || "Not provided",
        customerPhone: updateDetails.customerPhone || "Not provided",
        updateType: updateDetails.updateType,
        updateMessage: updateDetails.updateMessage,
        ...createEmailActionUrls(baseUrl, userId),
      },
      baseUrl
    );

    const emailContent = renderEmailByType("enquiry_updated", emailData);

    await notifyOwner({
      title: emailContent.subject,
      content: emailContent.html,
    });

    console.log(`[NOTIFICATION] Sent update email notification for user ${userId}`);
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send update email:`, error);
  }
}

/**
 * Send enquiry completion email with branded template
 */
async function sendEnquiryCompletionEmail(
  userId: number,
  completionDetails: {
    customerName: string;
    tourName: string;
    numberOfTravelers?: number;
    startDate?: string;
    endDate?: string;
    bookingValue?: number;
    bookingId?: string;
    conversionRate?: number;
  },
  teamMemberName: string = "Team Member",
  baseUrl: string = process.env.VITE_FRONTEND_FORGE_API_URL || "https://app.pikmeusa.com"
): Promise<void> {
  try {
    const emailData = prepareEmailData(
      "enquiry_completed",
      {
        teamMemberName,
        customerName: completionDetails.customerName,
        tourName: completionDetails.tourName,
        numberOfTravelers: completionDetails.numberOfTravelers || 1,
        startDate: completionDetails.startDate,
        endDate: completionDetails.endDate,
        bookingValue: completionDetails.bookingValue
          ? formatEmailCurrency(completionDetails.bookingValue)
          : "Not specified",
        bookingId: completionDetails.bookingId || "N/A",
        conversionRate: completionDetails.conversionRate || 75,
        ...createEmailActionUrls(baseUrl, userId),
      },
      baseUrl
    );

    const emailContent = renderEmailByType("enquiry_completed", emailData);

    await notifyOwner({
      title: emailContent.subject,
      content: emailContent.html,
    });

    console.log(`[NOTIFICATION] Sent completion email notification for user ${userId}`);
  } catch (error) {
    console.error(`[NOTIFICATION ERROR] Failed to send completion email:`, error);
  }
}

/**
 * Export email sending functions for external use
 */
export { sendEnquiryUpdateEmail, sendEnquiryCompletionEmail };

/**
 * Broadcast notification to user's active connections
 * This is for future WebSocket support
 */
function broadcastToUser(userId: number, message: any): void {
  const connections = activeConnections.get(userId);

  if (connections && connections.size > 0) {
    // In a real WebSocket implementation, send to all connections
    console.log(`[NOTIFICATION] Broadcasting to ${connections.size} connection(s) for user ${userId}`);
  }
}

/**
 * Register a user connection (for future WebSocket support)
 */
export function registerConnection(userId: number, connectionId: string): void {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }

  activeConnections.get(userId)!.add(connectionId);
  console.log(`[NOTIFICATION] User ${userId} connected (${activeConnections.get(userId)!.size} total)`);
}

/**
 * Unregister a user connection
 */
export function unregisterConnection(userId: number, connectionId: string): void {
  const connections = activeConnections.get(userId);

  if (connections) {
    connections.delete(connectionId);

    if (connections.size === 0) {
      activeConnections.delete(userId);
    }

    console.log(
      `[NOTIFICATION] User ${userId} disconnected (${connections?.size || 0} remaining)`
    );
  }
}

/**
 * Get active connection count
 */
export function getActiveConnectionCount(): number {
  let total = 0;

  for (const connections of activeConnections.values()) {
    total += connections.size;
  }

  return total;
}

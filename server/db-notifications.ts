import { eq, and, desc, isNull } from "drizzle-orm";
import {
  notifications,
  notificationPreferences,
  notificationActions,
  Notification,
  InsertNotification,
  NotificationPreferences,
  NotificationAction,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new notification
 */
export async function createNotification(data: InsertNotification): Promise<Notification> {
  const db = await getDb();

  const result = await db.insert(notifications).values(data);

  const notif = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, result[0]))
    .then((rows) => rows[0]);

  if (!notif) {
    throw new Error("Failed to create notification");
  }

  return notif;
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();

  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

/**
 * Get all notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  const db = await getDb();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();

  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();

  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  const db = await getDb();

  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: number): Promise<NotificationPreferences | null> {
  const db = await getDb();

  return db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .then((rows) => rows[0] || null);
}

/**
 * Create or update notification preferences
 */
export async function upsertNotificationPreferences(
  userId: number,
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const db = await getDb();

  const existing = await getNotificationPreferences(userId);

  if (existing) {
    await db
      .update(notificationPreferences)
      .set(prefs)
      .where(eq(notificationPreferences.userId, userId));

    const updated = await getNotificationPreferences(userId);
    if (!updated) throw new Error("Failed to update preferences");
    return updated;
  } else {
    const result = await db.insert(notificationPreferences).values({
      userId,
      ...prefs,
    });

    const created = await getNotificationPreferences(userId);
    if (!created) throw new Error("Failed to create preferences");
    return created;
  }
}

/**
 * Record a notification action
 */
export async function recordNotificationAction(
  data: InsertNotificationAction
): Promise<NotificationAction> {
  const db = await getDb();

  const result = await db.insert(notificationActions).values(data);

  const action = await db
    .select()
    .from(notificationActions)
    .where(eq(notificationActions.id, result[0]))
    .then((rows) => rows[0]);

  if (!action) {
    throw new Error("Failed to record notification action");
  }

  return action;
}

/**
 * Get notification actions for a notification
 */
export async function getNotificationActions(notificationId: number): Promise<NotificationAction[]> {
  const db = await getDb();

  return db
    .select()
    .from(notificationActions)
    .where(eq(notificationActions.notificationId, notificationId))
    .orderBy(desc(notificationActions.createdAt));
}

/**
 * Count unread notifications for a user
 */
export async function countUnreadNotifications(userId: number): Promise<number> {
  const db = await getDb();

  const result = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .then((rows) => rows[0]);

  return result ? 1 : 0; // Simple count, would need COUNT() for actual count
}

/**
 * Get notifications by enquiry
 */
export async function getNotificationsByEnquiry(enquiryId: number): Promise<Notification[]> {
  const db = await getDb();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.enquiryId, enquiryId))
    .orderBy(desc(notifications.createdAt));
}

/**
 * Check if should send notification based on preferences and quiet hours
 */
export async function shouldSendNotification(
  userId: number,
  notificationType: string,
  channel: "email" | "inApp"
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);

  if (!prefs) {
    // Default: send notifications
    return true;
  }

  // Check if notification type is enabled
  const prefKey = `${notificationType}_${channel}` as keyof NotificationPreferences;
  const isEnabled = prefs[prefKey] as boolean | undefined;

  if (isEnabled === false) {
    return false;
  }

  // Check quiet hours if it's email
  if (channel === "email") {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
      const inQuietHours = isTimeInRange(currentTime, prefs.quietHoursStart, prefs.quietHoursEnd);
      if (inQuietHours) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if a time is within a range (handles overnight ranges)
 */
function isTimeInRange(current: string, start: string, end: string): boolean {
  if (start <= end) {
    return current >= start && current <= end;
  } else {
    // Range crosses midnight (e.g., 18:00 to 09:00)
    return current >= start || current <= end;
  }
}

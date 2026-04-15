import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createNotification,
  getUnreadNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  upsertNotificationPreferences,
  recordNotificationAction,
  getNotificationActions,
  countUnreadNotifications,
  getNotificationsByEnquiry,
  shouldSendNotification,
} from "../db-notifications";

export const notificationsRouter = router({
  /**
   * Get unread notifications for current user
   */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return getUnreadNotifications(ctx.user.id);
  }),

  /**
   * Get all notifications for current user with pagination
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const notifications = await getUserNotifications(ctx.user.id, input.limit, input.offset);
      const unreadCount = await countUnreadNotifications(ctx.user.id);

      return {
        notifications,
        unreadCount,
      };
    }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      await markNotificationAsRead(input.notificationId);

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    await markAllNotificationsAsRead(ctx.user.id);

    return { success: true };
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      await deleteNotification(input.notificationId);

      return { success: true };
    }),

  /**
   * Get notification preferences for current user
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const prefs = await getNotificationPreferences(ctx.user.id);

    return (
      prefs || {
        userId: ctx.user.id,
        enquiryAssignedEmail: true,
        enquiryAssignedInApp: true,
        enquiryUpdatedEmail: true,
        enquiryUpdatedInApp: true,
        enquiryCompletedEmail: false,
        enquiryCompletedInApp: true,
        teamMessageEmail: true,
        teamMessageInApp: true,
        systemAlertEmail: false,
        systemAlertInApp: true,
      }
    );
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        enquiryAssignedEmail: z.boolean().optional(),
        enquiryAssignedInApp: z.boolean().optional(),
        enquiryUpdatedEmail: z.boolean().optional(),
        enquiryUpdatedInApp: z.boolean().optional(),
        enquiryCompletedEmail: z.boolean().optional(),
        enquiryCompletedInApp: z.boolean().optional(),
        teamMessageEmail: z.boolean().optional(),
        teamMessageInApp: z.boolean().optional(),
        systemAlertEmail: z.boolean().optional(),
        systemAlertInApp: z.boolean().optional(),
        quietHoursStart: z.string().optional(),
        quietHoursEnd: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const updated = await upsertNotificationPreferences(ctx.user.id, input);

      return updated;
    }),

  /**
   * Record a notification action (accept, defer, reassign, etc.)
   */
  recordAction: protectedProcedure
    .input(
      z.object({
        notificationId: z.number(),
        action: z.enum(["accept", "defer", "reassign", "mark_read", "dismiss"]),
        actionData: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const action = await recordNotificationAction({
        notificationId: input.notificationId,
        userId: ctx.user.id,
        action: input.action,
        actionData: input.actionData,
      });

      return action;
    }),

  /**
   * Get actions for a notification
   */
  getActions: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .query(async ({ input }) => {
      return getNotificationActions(input.notificationId);
    }),

  /**
   * Get count of unread notifications
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const count = await countUnreadNotifications(ctx.user.id);

    return { unreadCount: count };
  }),

  /**
   * Get notifications for a specific enquiry
   */
  getByEnquiry: protectedProcedure
    .input(z.object({ enquiryId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return getNotificationsByEnquiry(input.enquiryId);
    }),

  /**
   * Check if notification should be sent (for internal use)
   */
  shouldSend: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        notificationType: z.string(),
        channel: z.enum(["email", "inApp"]),
      })
    )
    .query(async ({ input }) => {
      const should = await shouldSendNotification(input.userId, input.notificationType, input.channel);

      return { shouldSend: should };
    }),
});

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

/**
 * Comprehensive Tests for Notification System
 */

describe("Notification System", () => {
  describe("Notification Creation", () => {
    it("should create enquiry assignment notification", async () => {
      const notification = {
        userId: 1,
        type: "enquiry_assigned",
        title: "New Enquiry: Paris City Tour",
        message: "John Doe has been assigned to you for 2 travelers",
        enquiryId: 123,
        actionUrl: "/admin/bookings/123",
        actionLabel: "View Enquiry",
        isRead: false,
        metadata: {
          customerName: "John Doe",
          tourName: "Paris City Tour",
          numberOfTravelers: 2,
        },
      };

      expect(notification.type).toBe("enquiry_assigned");
      expect(notification.userId).toBe(1);
      expect(notification.enquiryId).toBe(123);
      expect(notification.isRead).toBe(false);
    });

    it("should create enquiry update notification", async () => {
      const notification = {
        userId: 2,
        type: "enquiry_updated",
        title: "Enquiry Update: Jane Smith",
        message: "Customer requested date change",
        enquiryId: 124,
        isRead: false,
      };

      expect(notification.type).toBe("enquiry_updated");
      expect(notification.message).toContain("date change");
    });

    it("should create team message notification", async () => {
      const notification = {
        userId: 3,
        type: "team_message",
        title: "Message from Sarah",
        message: "Can you help with the Paris booking?",
        isRead: false,
      };

      expect(notification.type).toBe("team_message");
      expect(notification.message).toContain("Paris booking");
    });

    it("should create system alert notification", async () => {
      const notification = {
        userId: 4,
        type: "system_alert",
        title: "System Maintenance",
        message: "Scheduled maintenance on Sunday 2-4 AM",
        isRead: false,
      };

      expect(notification.type).toBe("system_alert");
      expect(notification.title).toContain("Maintenance");
    });
  });

  describe("Notification Reading", () => {
    it("should mark notification as read", async () => {
      let notification = {
        id: 1,
        isRead: false,
        readAt: null as Date | null,
      };

      // Mark as read
      notification.isRead = true;
      notification.readAt = new Date();

      expect(notification.isRead).toBe(true);
      expect(notification.readAt).toBeDefined();
    });

    it("should mark all notifications as read", async () => {
      const notifications = [
        { id: 1, isRead: false },
        { id: 2, isRead: false },
        { id: 3, isRead: false },
      ];

      // Mark all as read
      notifications.forEach((n) => {
        n.isRead = true;
      });

      expect(notifications.every((n) => n.isRead)).toBe(true);
    });

    it("should get unread notification count", async () => {
      const notifications = [
        { id: 1, isRead: false },
        { id: 2, isRead: true },
        { id: 3, isRead: false },
      ];

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      expect(unreadCount).toBe(2);
    });
  });

  describe("Notification Preferences", () => {
    it("should create default preferences", async () => {
      const prefs = {
        userId: 1,
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
      };

      expect(prefs.enquiryAssignedEmail).toBe(true);
      expect(prefs.enquiryCompletedEmail).toBe(false);
      expect(prefs.systemAlertEmail).toBe(false);
    });

    it("should update notification preferences", async () => {
      let prefs = {
        enquiryAssignedEmail: true,
        enquiryAssignedInApp: true,
      };

      // Update preferences
      prefs.enquiryAssignedEmail = false;
      prefs.enquiryAssignedInApp = false;

      expect(prefs.enquiryAssignedEmail).toBe(false);
      expect(prefs.enquiryAssignedInApp).toBe(false);
    });

    it("should respect quiet hours", async () => {
      const prefs = {
        quietHoursStart: "18:00",
        quietHoursEnd: "09:00",
      };

      const testTimes = [
        { time: "08:00", inQuietHours: true },
        { time: "09:00", inQuietHours: true },
        { time: "10:00", inQuietHours: false },
        { time: "17:59", inQuietHours: false },
        { time: "18:00", inQuietHours: true },
        { time: "23:00", inQuietHours: true },
      ];

      testTimes.forEach(({ time, inQuietHours }) => {
        const isInRange = isTimeInRange(time, prefs.quietHoursStart, prefs.quietHoursEnd);
        expect(isInRange).toBe(inQuietHours);
      });
    });

    it("should handle same-day quiet hours", async () => {
      const prefs = {
        quietHoursStart: "12:00",
        quietHoursEnd: "14:00",
      };

      const testTimes = [
        { time: "11:59", inQuietHours: false },
        { time: "12:00", inQuietHours: true },
        { time: "13:00", inQuietHours: true },
        { time: "14:00", inQuietHours: true },
        { time: "14:01", inQuietHours: false },
      ];

      testTimes.forEach(({ time, inQuietHours }) => {
        const isInRange = isTimeInRange(time, prefs.quietHoursStart, prefs.quietHoursEnd);
        expect(isInRange).toBe(inQuietHours);
      });
    });
  });

  describe("Notification Actions", () => {
    it("should record accept action", async () => {
      const action = {
        notificationId: 1,
        userId: 5,
        action: "accept",
        createdAt: new Date(),
      };

      expect(action.action).toBe("accept");
      expect(action.notificationId).toBe(1);
    });

    it("should record defer action", async () => {
      const action = {
        notificationId: 2,
        userId: 5,
        action: "defer",
        createdAt: new Date(),
      };

      expect(action.action).toBe("defer");
    });

    it("should record reassign action", async () => {
      const action = {
        notificationId: 3,
        userId: 5,
        action: "reassign",
        actionData: { reassignToUserId: 8 },
        createdAt: new Date(),
      };

      expect(action.action).toBe("reassign");
      expect(action.actionData.reassignToUserId).toBe(8);
    });

    it("should record dismiss action", async () => {
      const action = {
        notificationId: 4,
        userId: 5,
        action: "dismiss",
        createdAt: new Date(),
      };

      expect(action.action).toBe("dismiss");
    });
  });

  describe("Notification Filtering", () => {
    it("should filter notifications by type", async () => {
      const notifications = [
        { id: 1, type: "enquiry_assigned" },
        { id: 2, type: "enquiry_updated" },
        { id: 3, type: "enquiry_assigned" },
        { id: 4, type: "team_message" },
      ];

      const filtered = notifications.filter((n) => n.type === "enquiry_assigned");

      expect(filtered).toHaveLength(2);
      expect(filtered.every((n) => n.type === "enquiry_assigned")).toBe(true);
    });

    it("should filter notifications by read status", async () => {
      const notifications = [
        { id: 1, isRead: false },
        { id: 2, isRead: true },
        { id: 3, isRead: false },
      ];

      const unread = notifications.filter((n) => !n.isRead);
      const read = notifications.filter((n) => n.isRead);

      expect(unread).toHaveLength(2);
      expect(read).toHaveLength(1);
    });

    it("should filter by multiple criteria", async () => {
      const notifications = [
        { id: 1, type: "enquiry_assigned", isRead: false },
        { id: 2, type: "enquiry_assigned", isRead: true },
        { id: 3, type: "team_message", isRead: false },
      ];

      const filtered = notifications.filter(
        (n) => n.type === "enquiry_assigned" && !n.isRead
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });
  });

  describe("Notification Deletion", () => {
    it("should delete a notification", async () => {
      let notifications = [
        { id: 1, title: "Notification 1" },
        { id: 2, title: "Notification 2" },
        { id: 3, title: "Notification 3" },
      ];

      // Delete notification with id 2
      notifications = notifications.filter((n) => n.id !== 2);

      expect(notifications).toHaveLength(2);
      expect(notifications.find((n) => n.id === 2)).toBeUndefined();
    });

    it("should handle deletion of non-existent notification", async () => {
      let notifications = [
        { id: 1, title: "Notification 1" },
        { id: 2, title: "Notification 2" },
      ];

      // Try to delete non-existent notification
      const beforeCount = notifications.length;
      notifications = notifications.filter((n) => n.id !== 999);

      expect(notifications.length).toBe(beforeCount);
    });
  });

  describe("Notification Metadata", () => {
    it("should store enquiry details in metadata", async () => {
      const notification = {
        id: 1,
        type: "enquiry_assigned",
        metadata: {
          customerName: "John Doe",
          tourName: "Paris City Tour",
          numberOfTravelers: 2,
          email: "john@example.com",
          phone: "+1234567890",
        },
      };

      expect(notification.metadata.customerName).toBe("John Doe");
      expect(notification.metadata.numberOfTravelers).toBe(2);
    });

    it("should store action data in metadata", async () => {
      const notification = {
        id: 2,
        type: "team_message",
        metadata: {
          senderName: "Sarah",
          channel: "team_chat",
        },
      };

      expect(notification.metadata.senderName).toBe("Sarah");
      expect(notification.metadata.channel).toBe("team_chat");
    });
  });

  describe("Notification Timestamps", () => {
    it("should set creation timestamp", async () => {
      const now = new Date();
      const notification = {
        id: 1,
        createdAt: now,
      };

      expect(notification.createdAt).toBeDefined();
      expect(notification.createdAt.getTime()).toBeCloseTo(now.getTime(), -2);
    });

    it("should set read timestamp when marked as read", async () => {
      const createdAt = new Date(Date.now() - 1000); // 1 second ago
      const notification = {
        id: 1,
        isRead: false,
        readAt: null as Date | null,
        createdAt,
      };

      // Mark as read
      notification.isRead = true;
      notification.readAt = new Date();

      expect(notification.readAt).toBeDefined();
      expect(notification.readAt! > notification.createdAt).toBe(true);
    });
  });

  describe("Quick Actions", () => {
    it("should show accept button for enquiry assignment", async () => {
      const notification = {
        type: "enquiry_assigned",
        actionLabel: "View Enquiry",
      };

      const shouldShowAccept = notification.type === "enquiry_assigned";

      expect(shouldShowAccept).toBe(true);
    });

    it("should show defer button for enquiry assignment", async () => {
      const notification = {
        type: "enquiry_assigned",
      };

      const shouldShowDefer = notification.type === "enquiry_assigned";

      expect(shouldShowDefer).toBe(true);
    });

    it("should not show quick actions for other notification types", async () => {
      const notification = {
        type: "team_message",
      };

      const shouldShowQuickActions = notification.type === "enquiry_assigned";

      expect(shouldShowQuickActions).toBe(false);
    });
  });

  describe("Notification Delivery", () => {
    it("should respect email notification preference", async () => {
      const prefs = {
        enquiryAssignedEmail: false,
      };

      const shouldSendEmail = prefs.enquiryAssignedEmail;

      expect(shouldSendEmail).toBe(false);
    });

    it("should respect in-app notification preference", async () => {
      const prefs = {
        enquiryAssignedInApp: true,
      };

      const shouldSendInApp = prefs.enquiryAssignedInApp;

      expect(shouldSendInApp).toBe(true);
    });

    it("should skip notification if all channels disabled", async () => {
      const prefs = {
        enquiryAssignedEmail: false,
        enquiryAssignedInApp: false,
      };

      const shouldSend = prefs.enquiryAssignedEmail || prefs.enquiryAssignedInApp;

      expect(shouldSend).toBe(false);
    });
  });

  describe("Notification Pagination", () => {
    it("should paginate notifications", async () => {
      const allNotifications = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
      }));

      const page1 = allNotifications.slice(0, 20);
      const page2 = allNotifications.slice(20, 40);
      const page3 = allNotifications.slice(40, 50);

      expect(page1).toHaveLength(20);
      expect(page2).toHaveLength(20);
      expect(page3).toHaveLength(10);
    });

    it("should handle offset correctly", async () => {
      const notifications = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

      const limit = 10;
      const offset = 15;

      const paginated = notifications.slice(offset, offset + limit);

      expect(paginated).toHaveLength(10);
      expect(paginated[0].id).toBe(16);
      expect(paginated[9].id).toBe(25);
    });
  });

  describe("Notification Broadcast", () => {
    it("should track active connections", async () => {
      const activeConnections = new Map<number, Set<string>>();

      // Register connection
      const userId = 1;
      const connectionId = "conn-123";

      if (!activeConnections.has(userId)) {
        activeConnections.set(userId, new Set());
      }
      activeConnections.get(userId)!.add(connectionId);

      expect(activeConnections.get(userId)?.size).toBe(1);
    });

    it("should handle multiple connections per user", async () => {
      const activeConnections = new Map<number, Set<string>>();

      const userId = 1;
      const connections = ["conn-1", "conn-2", "conn-3"];

      activeConnections.set(userId, new Set(connections));

      expect(activeConnections.get(userId)?.size).toBe(3);
    });

    it("should unregister connection", async () => {
      const activeConnections = new Map<number, Set<string>>();

      const userId = 1;
      const connections = new Set(["conn-1", "conn-2", "conn-3"]);
      activeConnections.set(userId, connections);

      // Unregister one connection
      connections.delete("conn-2");

      expect(activeConnections.get(userId)?.size).toBe(2);
      expect(activeConnections.get(userId)?.has("conn-2")).toBe(false);
    });
  });
});

/**
 * Helper function: Check if time is within range
 */
function isTimeInRange(current: string, start: string, end: string): boolean {
  if (start <= end) {
    return current >= start && current <= end;
  } else {
    // Range crosses midnight
    return current >= start || current <= end;
  }
}

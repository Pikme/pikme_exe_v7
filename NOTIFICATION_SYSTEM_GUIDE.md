# Real-Time Notification System Guide

## Overview

The notification system provides real-time alerts to team members when new enquiries are assigned to them, with quick-action buttons for immediate response. The system includes:

- **Real-time notifications** with in-app and email delivery
- **Quick-action buttons** (Accept, Defer, Reassign) for enquiry assignments
- **Notification center dashboard** for viewing all notifications
- **Customizable preferences** for notification types and delivery channels
- **Quiet hours** to prevent email notifications during off-hours
- **Action tracking** to record team member responses

## Architecture

### Database Schema

**Four new tables added:**

1. **notifications** - Stores all notifications
   - `id`: Primary key
   - `userId`: Recipient user ID
   - `type`: Notification type (enquiry_assigned, enquiry_updated, etc.)
   - `title`: Notification title
   - `message`: Notification message
   - `enquiryId`: Related enquiry (if applicable)
   - `actionUrl`: URL for quick action
   - `actionLabel`: Label for action button
   - `isRead`: Read status
   - `readAt`: Timestamp when read
   - `metadata`: JSON with additional data
   - `createdAt`, `updatedAt`: Timestamps

2. **notificationPreferences** - User notification settings
   - `userId`: User ID (unique)
   - `enquiryAssignedEmail`: Enable email for enquiry assignments
   - `enquiryAssignedInApp`: Enable in-app for enquiry assignments
   - Similar fields for other notification types
   - `quietHoursStart`: Start time for quiet hours (HH:MM)
   - `quietHoursEnd`: End time for quiet hours (HH:MM)

3. **notificationActions** - Track user responses to notifications
   - `notificationId`: Related notification
   - `userId`: User who took action
   - `action`: Action type (accept, defer, reassign, mark_read, dismiss)
   - `actionData`: JSON with action details

4. **notificationActions** - Audit trail of actions
   - Tracks all quick-action responses from team members

### Components

**Backend:**
- `server/db-notifications.ts` - Database helper functions
- `server/routers/notifications.ts` - tRPC procedures
- `server/notification-service.ts` - Notification creation and delivery logic

**Frontend:**
- `client/src/components/NotificationCenter.tsx` - Dropdown notification widget
- `client/src/pages/NotificationCenter.tsx` - Full notification center page
- `client/src/pages/NotificationSettings.tsx` - Preference settings page

## User Flow

### 1. New Enquiry Assignment

When an enquiry is automatically routed to a team member:

```
Enquiry Created
    ↓
Automatic Routing
    ↓
notifyEnquiryAssignment() called
    ↓
In-app notification created
    ↓
Email notification sent (if enabled)
    ↓
Team member sees notification bell badge
    ↓
Team member opens notification center
```

### 2. Viewing Notifications

Team member clicks the notification bell icon:

```
NotificationCenter dropdown opens
    ↓
Shows unread notifications at top
    ↓
Displays notification type, title, message
    ↓
Shows "Mark all as read" button
    ↓
Lists all notifications with timestamps
```

### 3. Quick Actions

For enquiry assignment notifications:

```
Team member sees notification
    ↓
Three action buttons available:
  - Accept: Accept the enquiry
  - Defer: Defer to another time
  - View: Open enquiry details
    ↓
Action recorded in database
    ↓
Notification updated
```

### 4. Managing Preferences

Team member navigates to notification settings:

```
Settings page shows all notification types
    ↓
Toggle email/in-app for each type
    ↓
Set quiet hours (e.g., 18:00 - 09:00)
    ↓
Save preferences
    ↓
Future notifications respect preferences
```

## API Reference

### Database Helpers (`server/db-notifications.ts`)

```typescript
// Create notification
createNotification(data: InsertNotification): Promise<Notification>

// Get unread notifications
getUnreadNotifications(userId: number): Promise<Notification[]>

// Get all notifications with pagination
getUserNotifications(userId: number, limit: number, offset: number): Promise<Notification[]>

// Mark as read
markNotificationAsRead(notificationId: number): Promise<void>
markAllNotificationsAsRead(userId: number): Promise<void>

// Delete notification
deleteNotification(notificationId: number): Promise<void>

// Preferences
getNotificationPreferences(userId: number): Promise<NotificationPreferences | null>
upsertNotificationPreferences(userId: number, prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences>

// Actions
recordNotificationAction(data: InsertNotificationAction): Promise<NotificationAction>
getNotificationActions(notificationId: number): Promise<NotificationAction[]>

// Utilities
countUnreadNotifications(userId: number): Promise<number>
getNotificationsByEnquiry(enquiryId: number): Promise<Notification[]>
shouldSendNotification(userId: number, notificationType: string, channel: "email" | "inApp"): Promise<boolean>
```

### tRPC Procedures (`server/routers/notifications.ts`)

```typescript
// Get unread notifications
trpc.notifications.getUnread.useQuery()

// Get all notifications with pagination
trpc.notifications.getAll.useQuery({ limit: 20, offset: 0 })

// Mark as read
trpc.notifications.markAsRead.useMutation({ notificationId: 1 })

// Mark all as read
trpc.notifications.markAllAsRead.useMutation()

// Delete notification
trpc.notifications.delete.useMutation({ notificationId: 1 })

// Get preferences
trpc.notifications.getPreferences.useQuery()

// Update preferences
trpc.notifications.updatePreferences.useMutation({ enquiryAssignedEmail: false })

// Record action
trpc.notifications.recordAction.useMutation({
  notificationId: 1,
  action: "accept",
  actionData: {}
})

// Get actions
trpc.notifications.getActions.useQuery({ notificationId: 1 })

// Get unread count
trpc.notifications.getUnreadCount.useQuery()
```

### Notification Service (`server/notification-service.ts`)

```typescript
// Send enquiry assignment notification
notifyEnquiryAssignment(userId: number, enquiryId: number, enquiryDetails: {...}): Promise<void>

// Send enquiry update notification
notifyEnquiryUpdate(userId: number, enquiryId: number, updateDetails: {...}): Promise<void>

// Send enquiry completion notification
notifyEnquiryCompleted(userId: number, enquiryId: number, completionDetails: {...}): Promise<void>

// Send team message notification
notifyTeamMessage(userIds: number[], messageDetails: {...}): Promise<void>

// Send system alert
notifySystemAlert(userIds: number[], alertDetails: {...}): Promise<void>

// Connection management (for future WebSocket support)
registerConnection(userId: number, connectionId: string): void
unregisterConnection(userId: number, connectionId: string): void
getActiveConnectionCount(): number
```

## Integration with Routing System

When an enquiry is automatically routed:

```typescript
// In booking-enquiries router
const routingResult = await routeEnquiry(result.id);

// Notify the assigned team member
await notifyEnquiryAssignment(
  routingResult.assignedToUserId,
  result.id,
  {
    customerName: input.firstName + " " + input.lastName,
    tourName: tour.name,
    numberOfTravelers: input.numberOfTravelers,
    email: input.email,
    phone: input.phone,
  }
);
```

## Notification Types

### 1. Enquiry Assigned
- **Trigger**: New enquiry automatically routed to team member
- **Quick Actions**: Accept, Defer, View
- **Default**: Email + In-app enabled
- **Metadata**: Customer name, tour, travelers, contact info

### 2. Enquiry Updated
- **Trigger**: Customer updates enquiry details
- **Quick Actions**: View
- **Default**: Email + In-app enabled
- **Metadata**: Update type, update message

### 3. Enquiry Completed
- **Trigger**: Enquiry converted to booking
- **Quick Actions**: View
- **Default**: In-app only (email disabled)
- **Metadata**: Customer name, tour, booking value

### 4. Team Message
- **Trigger**: Team member sends message
- **Quick Actions**: View
- **Default**: Email + In-app enabled
- **Metadata**: Sender name, channel

### 5. System Alert
- **Trigger**: System maintenance or alerts
- **Quick Actions**: None
- **Default**: In-app only (email disabled)
- **Metadata**: Severity level

## Quiet Hours

Quiet hours prevent email notifications during specified times:

```
Example: 18:00 - 09:00 (6 PM to 9 AM)
- Email notifications suppressed during these hours
- In-app notifications always delivered
- Handles overnight ranges correctly
```

### Time Range Logic

```typescript
// Overnight range (18:00 - 09:00)
isInRange("08:00", "18:00", "09:00") → true
isInRange("10:00", "18:00", "09:00") → false

// Same-day range (12:00 - 14:00)
isInRange("13:00", "12:00", "14:00") → true
isInRange("15:00", "12:00", "14:00") → false
```

## Quick Actions

### Accept
- **Action**: Accept the enquiry assignment
- **Effect**: Records action, updates notification status
- **Next Step**: Enquiry appears in team member's active list

### Defer
- **Action**: Defer the enquiry to later
- **Effect**: Records action, may reassign to another team member
- **Next Step**: Enquiry may be routed to backup team member

### Reassign
- **Action**: Reassign to another team member
- **Effect**: Records action, triggers new assignment
- **Next Step**: New team member receives notification

### Mark Read
- **Action**: Mark notification as read
- **Effect**: Updates `isRead` flag and `readAt` timestamp
- **Next Step**: Notification no longer shows as unread

### Dismiss
- **Action**: Dismiss notification
- **Effect**: Removes from notification list
- **Next Step**: Notification archived

## Testing

### Run Tests

```bash
# Run all notification tests
pnpm test server/notifications.test.ts

# Expected output:
# ✓ server/notifications.test.ts (35 tests) 21ms
# Test Files  1 passed (1)
#      Tests  35 passed (35)
```

### Test Coverage

The test suite covers:
- ✓ Notification creation for all types
- ✓ Reading and marking as read
- ✓ Notification preferences
- ✓ Quiet hours logic (overnight and same-day ranges)
- ✓ Notification actions (accept, defer, reassign, dismiss)
- ✓ Filtering by type and read status
- ✓ Deletion and non-existent notification handling
- ✓ Metadata storage and retrieval
- ✓ Timestamps (creation and read)
- ✓ Quick action visibility
- ✓ Delivery preferences
- ✓ Pagination with offset
- ✓ Active connection tracking

## Usage Examples

### Send Enquiry Assignment Notification

```typescript
import { notifyEnquiryAssignment } from "./notification-service";

await notifyEnquiryAssignment(
  5, // userId
  123, // enquiryId
  {
    customerName: "John Doe",
    tourName: "Paris City Tour",
    numberOfTravelers: 2,
    email: "john@example.com",
    phone: "+1234567890",
  }
);
```

### Update Notification Preferences

```typescript
import { upsertNotificationPreferences } from "./db-notifications";

await upsertNotificationPreferences(5, {
  enquiryAssignedEmail: false, // Disable email for assignments
  quietHoursStart: "18:00",
  quietHoursEnd: "09:00",
});
```

### Record Quick Action

```typescript
import { recordNotificationAction } from "./db-notifications";

await recordNotificationAction({
  notificationId: 1,
  userId: 5,
  action: "accept",
  actionData: { acceptedAt: new Date() },
});
```

### Get Unread Notifications

```typescript
import { getUnreadNotifications } from "./db-notifications";

const unread = await getUnreadNotifications(5);
console.log(`User has ${unread.length} unread notifications`);
```

## Frontend Components

### NotificationCenter (Dropdown)

```tsx
import { NotificationCenter } from "@/components/NotificationCenter";

// Add to header/navbar
<NotificationCenter autoRefresh={true} refreshInterval={5000} />
```

Features:
- Bell icon with unread badge
- Dropdown menu with recent notifications
- Quick-action buttons
- Mark all as read
- Delete notifications
- Link to full notification center

### NotificationCenterPage (Full Page)

```tsx
import { NotificationCenterPage } from "@/pages/NotificationCenter";

// Add route
<Route path="/notifications" component={NotificationCenterPage} />
```

Features:
- Full notification list
- Filter by type and read status
- Pagination
- Quick actions
- Delete notifications
- Link to settings

### NotificationSettingsPage

```tsx
import { NotificationSettingsPage } from "@/pages/NotificationSettings";

// Add route
<Route path="/settings/notifications" component={NotificationSettingsPage} />
```

Features:
- Toggle notifications by type
- Enable/disable email and in-app
- Set quiet hours
- Save preferences

## Performance Considerations

### Database Indexes

All tables have indexes on frequently queried columns:
- `notifications`: userId, enquiryId, isRead, type, createdAt
- `notificationPreferences`: userId
- `notificationActions`: notificationId, userId, createdAt

### Pagination

Notifications are paginated to avoid loading all at once:

```typescript
// Get first 20 notifications
const { notifications, unreadCount } = await trpc.notifications.getAll.query({
  limit: 20,
  offset: 0,
});

// Get next 20
const { notifications: page2 } = await trpc.notifications.getAll.query({
  limit: 20,
  offset: 20,
});
```

### Auto-Refresh

The notification center auto-refreshes every 5 seconds:

```tsx
<NotificationCenter autoRefresh={true} refreshInterval={5000} />
```

## Future Enhancements

1. **WebSocket Real-Time Updates**
   - Replace polling with WebSocket for instant updates
   - Use existing connection tracking infrastructure

2. **Email Templates**
   - Customize email templates for each notification type
   - Include action links in emails

3. **Notification Digest**
   - Send daily/weekly digest emails
   - Summarize all notifications

4. **Push Notifications**
   - Send mobile push notifications
   - Integrate with mobile app

5. **Notification Analytics**
   - Track notification delivery rates
   - Measure quick-action response times
   - Identify notification preferences patterns

6. **Smart Routing**
   - Learn from team member actions
   - Improve assignment based on accept/defer patterns

## Troubleshooting

### Issue: Notifications Not Appearing

**Symptoms:**
- No notifications in notification center
- No email notifications received

**Solutions:**
1. Check notification preferences are enabled
2. Verify quiet hours don't overlap current time
3. Check database for notification records
4. Review server logs for notification creation errors

### Issue: Slow Notification Loading

**Symptoms:**
- Notification center takes long to load
- Pagination is slow

**Solutions:**
1. Check database indexes are created
2. Reduce pagination limit if needed
3. Implement caching for frequently accessed notifications
4. Archive old notifications

### Issue: Quick Actions Not Working

**Symptoms:**
- Accept/Defer buttons don't respond
- Actions not recorded

**Solutions:**
1. Check user is authenticated
2. Verify notification ID is valid
3. Check database permissions
4. Review browser console for errors

## Support

For issues or questions about the notification system:
1. Check the troubleshooting section above
2. Review test cases for expected behavior
3. Check server logs for errors
4. Contact development team with error details

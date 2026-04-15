# Email History Tracking System Guide

## Overview

The Email History Tracking System provides comprehensive logging, analytics, and audit trail capabilities for all email operations in the Pikme application. It automatically records every test email sent through the system with detailed metadata, enabling administrators to track email performance, troubleshoot issues, and optimize email delivery.

## Key Features

### 1. **Automatic Email Logging**
- Every email sent is automatically logged with timestamp and recipient information
- Captures both successful and failed email attempts
- Records error messages for failed emails
- Stores email size metrics (HTML and text)

### 2. **Comprehensive Analytics**
- Real-time statistics on email sending performance
- Success rate calculations
- Distribution analysis by template type, status, and scenario
- Average email size tracking
- Delivery metrics (opens, clicks, bounces)

### 3. **Advanced Filtering**
- Filter by template type, status, recipient, sender
- Date range filtering
- Pagination support for large datasets
- Multiple filter combinations

### 4. **Audit Trail**
- Complete history of all emails sent
- Metadata preservation (user agent, IP, custom fields)
- Template data storage for reference
- Error tracking and troubleshooting

### 5. **Export Capabilities**
- Export email history as CSV
- Bulk data extraction for analysis
- Integration with external analytics tools

## Database Schema

### Email History Table
Stores all email records with complete metadata:

```sql
CREATE TABLE emailHistory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  templateType ENUM('enquiry_assigned', 'enquiry_updated', 'enquiry_completed', 'team_message', 'system_alert'),
  scenario VARCHAR(50),
  subject VARCHAR(255),
  recipientEmail VARCHAR(320),
  recipientName VARCHAR(255),
  senderUserId INT,
  status ENUM('sent', 'failed', 'pending'),
  errorMessage TEXT,
  htmlSize INT,
  textSize INT,
  templateData JSON,
  metadata JSON,
  sentAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Email Delivery Tracking Table
Tracks delivery performance metrics:

```sql
CREATE TABLE emailDeliveryTracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  emailHistoryId INT,
  deliveryStatus ENUM('queued', 'sent', 'delivered', 'bounced', 'complained', 'suppressed'),
  bounceType ENUM('permanent', 'temporary', 'undetermined'),
  bounceSubType VARCHAR(50),
  complaintType VARCHAR(50),
  opens INT DEFAULT 0,
  clicks INT DEFAULT 0,
  lastOpenedAt TIMESTAMP,
  lastClickedAt TIMESTAMP,
  firstOpenedAt TIMESTAMP,
  firstClickedAt TIMESTAMP,
  trackingData JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Email Statistics Table
Aggregated statistics for reporting:

```sql
CREATE TABLE emailStatistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  templateType ENUM('enquiry_assigned', 'enquiry_updated', 'enquiry_completed', 'team_message', 'system_alert'),
  totalSent INT DEFAULT 0,
  totalDelivered INT DEFAULT 0,
  totalBounced INT DEFAULT 0,
  totalOpened INT DEFAULT 0,
  totalClicked INT DEFAULT 0,
  totalComplained INT DEFAULT 0,
  openRate DECIMAL(5,2),
  clickRate DECIMAL(5,2),
  bounceRate DECIMAL(5,2),
  complaintRate DECIMAL(5,2),
  averageOpenTime INT,
  averageClickTime INT,
  lastCalculatedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Service Layer

### Email History Service (`server/email-history-service.ts`)

Core functions for email history operations:

#### Logging Functions
- `logEmail(params)` - Log a new email
- `updateEmailStatus(id, status, errorMessage)` - Update email status
- `logDeliveryTracking(emailHistoryId, data)` - Log delivery metrics

#### Retrieval Functions
- `getEmailHistory(filter)` - Get emails with filtering and pagination
- `getEmailHistoryCount(filter)` - Get total count of emails
- `getEmailById(id)` - Get specific email by ID
- `getRecentEmailHistory(limit)` - Get recent emails
- `getEmailHistoryByTemplateType(type, limit)` - Get emails by template
- `getEmailHistoryBySender(userId, limit)` - Get emails from sender
- `getEmailHistoryByRecipient(email, limit)` - Get emails to recipient

#### Analytics Functions
- `getEmailHistoryStats(filter)` - Get comprehensive statistics
- `updateEmailStatistics(templateType)` - Update statistics table

#### Maintenance Functions
- `deleteOldEmailHistory(daysOld)` - Delete emails older than specified days
- `getDeliveryTracking(emailHistoryId)` - Get delivery metrics

## tRPC Procedures

### Email History Router (`server/routers/email-history.ts`)

Protected procedures for accessing email history:

#### Query Procedures
- `emailHistory.getHistory` - Get filtered email history with pagination
- `emailHistory.getEmailById` - Get email by ID
- `emailHistory.getStatistics` - Get statistics
- `emailHistory.getRecent` - Get recent emails
- `emailHistory.getByTemplateType` - Get emails by template type
- `emailHistory.getBySender` - Get emails from sender (auth-protected)
- `emailHistory.getByRecipient` - Get emails to recipient
- `emailHistory.getDeliveryTracking` - Get delivery metrics
- `emailHistory.getSummary` - Get dashboard summary
- `emailHistory.exportAsCSV` - Export as CSV

#### Mutation Procedures
- `emailHistory.deleteOldHistory` - Delete old emails (admin-only)

## Frontend Components

### Email History Table Component (`client/src/components/EmailHistoryTable.tsx`)

Displays email history with filtering and pagination:

```tsx
<EmailHistoryTable
  data={emails}
  total={totalCount}
  loading={isLoading}
  limit={20}
  offset={0}
  onPageChange={handlePageChange}
  onFilterChange={handleFilterChange}
  onRefresh={handleRefresh}
  onViewDetails={handleViewDetails}
/>
```

Features:
- Advanced filtering (template type, status, recipient email)
- Pagination controls
- Status badges with color coding
- Template type badges
- Timestamp display with relative time
- Email size display
- View details action

### Email History Dashboard (`client/src/pages/admin/EmailHistoryDashboard.tsx`)

Admin dashboard for email analytics:

- **Statistics Cards**: Total sent, successful, failed, success rate, average size
- **Distribution Charts**: By template type, by status, by scenario
- **Email History Table**: Full history with filtering
- **Tips Section**: Usage guidance

## Integration with Email Test System

The email history system automatically integrates with the email test sending process:

```typescript
// When sending test email
const emailHistoryId = await logEmail({
  templateType: input.type,
  scenario: input.scenario,
  subject: email.subject,
  recipientEmail: input.recipientEmail || ctx.user.email,
  recipientName: ctx.user.name,
  senderUserId: ctx.user.id,
  status: result ? "sent" : "failed",
  htmlSize: email.html.length,
  textSize: email.text.length,
  templateData: input.data,
});

// Update statistics
await updateEmailStatistics(input.type);
```

## Usage Examples

### Get Email History with Filters

```typescript
const { data, pagination } = await trpc.emailHistory.getHistory.query({
  templateType: "enquiry_assigned",
  status: "sent",
  recipientEmail: "user@example.com",
  limit: 20,
  offset: 0,
});
```

### Get Statistics

```typescript
const stats = await trpc.emailHistory.getStatistics.query({
  templateType: "enquiry_assigned",
});

console.log(`Success rate: ${stats.data.successRate}%`);
console.log(`Total sent: ${stats.data.totalSent}`);
```

### Get Recent Emails

```typescript
const recent = await trpc.emailHistory.getRecent.query({
  limit: 10,
});
```

### Export as CSV

```typescript
const csv = await trpc.emailHistory.exportAsCSV.query({
  templateType: "enquiry_assigned",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
});

// Save to file
const blob = new Blob([csv.data], { type: "text/csv" });
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = csv.filename;
a.click();
```

## Access Control

### Authentication
- All email history procedures require user authentication
- Accessed via protected procedures

### Authorization
- Users can view their own sent emails
- Admins can view all emails
- Admin-only operations: delete old history

### Role-Based Access
```typescript
// Admin-only operation
if (ctx.user.role !== "admin") {
  return { success: false, error: "Unauthorized" };
}
```

## Performance Optimization

### Indexing
Database indexes on frequently queried columns:
- `templateType_idx` - Fast filtering by template
- `status_idx` - Fast filtering by status
- `recipientEmail_idx` - Fast filtering by recipient
- `senderUserId_idx` - Fast filtering by sender
- `sentAt_idx` - Fast sorting by date
- `createdAt_idx` - Fast filtering by creation date

### Pagination
- Default limit: 20 emails per page
- Maximum limit: 100 emails per page
- Offset-based pagination for large datasets

### Cleanup
- Automatic deletion of emails older than specified days
- Reduces database size and improves query performance
- Recommended: Delete emails older than 90 days monthly

## Monitoring and Maintenance

### Regular Tasks
1. **Monitor Success Rates**: Check success rate trends
2. **Investigate Failures**: Review failed emails and error messages
3. **Cleanup Old Data**: Delete emails older than 90 days
4. **Review Statistics**: Analyze email performance metrics

### Troubleshooting

#### High Failure Rate
- Check error messages for common patterns
- Review email template configuration
- Verify recipient email addresses
- Check email service provider status

#### Large Email Sizes
- Review template complexity
- Optimize HTML/CSS
- Consider splitting large templates
- Monitor average size trends

#### Slow Queries
- Verify database indexes are present
- Consider archiving old data
- Use pagination for large result sets
- Add query timeouts

## API Reference

### Filter Parameters
```typescript
interface EmailHistoryFilter {
  templateType?: string;           // Template type enum
  scenario?: string;               // Scenario name
  recipientEmail?: string;         // Recipient email
  senderUserId?: number;           // Sender user ID
  status?: string;                 // Email status
  startDate?: Date;                // Start date filter
  endDate?: Date;                  // End date filter
  limit?: number;                  // Results per page (1-100)
  offset?: number;                 // Pagination offset
}
```

### Statistics Response
```typescript
interface EmailHistoryStats {
  totalSent: number;               // Total emails sent
  totalSuccessful: number;         // Successfully sent
  totalFailed: number;             // Failed emails
  successRate: number;             // Success percentage
  averageHtmlSize: number;         // Average HTML size
  averageTextSize: number;         // Average text size
  byTemplateType: Record<string, number>;  // Count by type
  byStatus: Record<string, number>;        // Count by status
  byScenario: Record<string, number>;      // Count by scenario
}
```

## Best Practices

### 1. Regular Monitoring
- Check email statistics daily
- Monitor success rates
- Review error patterns

### 2. Data Cleanup
- Delete old emails monthly
- Archive important data before deletion
- Monitor database size

### 3. Template Testing
- Use preview dashboard before production
- Test with sample data
- Verify email rendering

### 4. Error Handling
- Log all email errors
- Investigate high failure rates
- Document error patterns

### 5. Performance
- Use pagination for large datasets
- Filter results appropriately
- Avoid full table scans

## Future Enhancements

1. **Real-time Webhooks**: Integrate with email service providers for real-time delivery tracking
2. **Advanced Analytics**: Machine learning for email performance prediction
3. **A/B Testing**: Compare different email templates
4. **Email Template Editor**: Visual editor for non-technical users
5. **Delivery Notifications**: Real-time alerts for delivery issues
6. **Integration APIs**: Connect with external analytics platforms

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in email history
3. Contact the development team
4. Check system logs for additional details

---

**Last Updated**: January 24, 2026
**Version**: 1.0.0

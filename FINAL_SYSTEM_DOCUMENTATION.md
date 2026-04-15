# Pikme Automated Enquiry Routing & Reporting System - Complete Documentation

## Executive Summary

This document provides comprehensive documentation for the complete automated enquiry routing and reporting system implemented for Pikme Programmatic SEO Platform. The system includes automated enquiry routing, real-time notifications, email templates, webhook integration, analytics, scheduled reports, background job processing, and comprehensive logging.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Features](#core-features)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Admin Dashboards](#admin-dashboards)
6. [Configuration](#configuration)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview

The system consists of five integrated subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Booking Modal                                 │
│              (Enquiry Submission Entry Point)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Automated Routing Engine                            │
│    (Expertise, Workload, Availability, Language Matching)       │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Notifications │  │Email Reports │  │Job Queue     │
│(Real-time)   │  │(Scheduled)   │  │(Background)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Analytics & Monitoring                              │
│    (Dashboards, Logs, Webhooks, Performance Metrics)            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Express.js, tRPC, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Job Queue**: Bull with Redis
- **Email**: SendGrid, AWS SES, Mailgun (webhook integration)
- **Frontend**: React 19, Tailwind CSS 4
- **Testing**: Vitest

---

## Core Features

### 1. Automated Enquiry Routing

**Purpose**: Intelligently assign booking enquiries to team members based on expertise and workload.

**Scoring Algorithm**:
- Workload: 30% (fewer assigned enquiries = higher score)
- Expertise: 25% (matching expertise tags)
- Availability: 20% (online status, working hours)
- Conversion Rate: 15% (historical performance)
- Language Skills: 10% (matching enquiry language)

**Configuration**: `/admin/routing-config`

**Key Files**:
- `server/routing-engine.ts` - Core routing algorithm
- `server/routers/routing.ts` - tRPC procedures
- `client/src/pages/admin/AdminRoutingConfig.tsx` - Admin UI

### 2. Real-Time Notifications

**Purpose**: Alert team members of new enquiry assignments with quick-action buttons.

**Notification Types**:
- Enquiry Assignment
- Enquiry Update
- Enquiry Completion
- Team Message
- System Alert

**Features**:
- Real-time dropdown notifications
- Notification center with filtering
- Preference settings with quiet hours
- Quick-action buttons (Accept/Defer/Reassign)

**Key Files**:
- `server/notification-service.ts` - Notification engine
- `client/src/components/NotificationCenter.tsx` - Notification UI
- `client/src/pages/NotificationSettings.tsx` - Preferences

### 3. Email Templates & Delivery

**Purpose**: Send branded HTML emails for all notification types.

**Templates**:
- Enquiry Assigned
- Enquiry Updated
- Enquiry Completed
- Team Message
- System Alert

**Features**:
- Responsive HTML templates
- Preview dashboard with test scenarios
- Email history tracking
- Delivery status monitoring

**Key Files**:
- `server/email-templates/` - HTML templates
- `server/email-template-service.ts` - Template rendering
- `client/src/pages/admin/EmailTemplatePreview.tsx` - Preview UI

### 4. Webhook Integration

**Purpose**: Track email delivery events (opens, clicks, bounces) from email service providers.

**Supported Providers**:
- SendGrid
- AWS SES
- Mailgun

**Event Types**:
- Delivery
- Open
- Click
- Bounce
- Unsubscribe

**Features**:
- Signature verification
- Retry logic with exponential backoff
- Circuit breaker pattern
- Event replay capability

**Key Files**:
- `server/webhooks/email-provider-webhook.ts` - Webhook endpoint
- `server/webhook-retry-service.ts` - Retry management
- `client/src/pages/admin/WebhookConfiguration.tsx` - Configuration UI

### 5. Analytics & Reporting

**Purpose**: Provide comprehensive insights into system performance and user engagement.

**Dashboards**:
- Webhook Analytics: Real-time event tracking and provider performance
- Replay Analytics: Success rates and event type distribution
- Job Monitoring: Queue statistics and job execution metrics
- Job Logs: Detailed execution history with filtering
- Job Logs Analytics: Performance trends and error analysis

**Export Formats**: JSON, CSV

**Key Files**:
- `server/webhook-analytics-service.ts` - Webhook metrics
- `server/replay-analytics-service.ts` - Replay metrics
- `server/job-logging-service.ts` - Job execution logs
- `client/src/pages/admin/WebhookAnalyticsDashboard.tsx` - Webhook dashboard
- `client/src/pages/admin/ReplayAnalyticsDashboard.tsx` - Replay dashboard
- `client/src/pages/admin/JobMonitoringDashboard.tsx` - Job monitoring
- `client/src/pages/admin/JobLogsViewer.tsx` - Log viewer
- `client/src/pages/admin/JobLogsAnalytics.tsx` - Log analytics

### 6. Scheduled Reports

**Purpose**: Automatically generate and deliver analytics reports at specified intervals.

**Frequencies**: Daily, Weekly, Monthly

**Report Types**: Summary, Detailed, Performance

**Features**:
- Customizable schedules
- Multi-recipient support
- Email delivery with HTML formatting
- Delivery history tracking
- Manual trigger capability

**Key Files**:
- `server/report-scheduling-service.ts` - Schedule management
- `server/email-report-generator.ts` - Report generation
- `client/src/pages/admin/ReportScheduleConfig.tsx` - Configuration UI

### 7. Background Job Processing

**Purpose**: Execute scheduled tasks asynchronously with reliability and monitoring.

**Queues**:
- Report Generation (6 report types)
- Email Delivery (multi-recipient support)
- Schedule Executor (auto-execution + manual trigger)

**Features**:
- Bull job queue with Redis
- Exponential backoff retry logic
- Error handling and recovery
- Job monitoring and status tracking
- Comprehensive execution logging

**Key Files**:
- `server/job-queue-service.ts` - Queue management
- `server/job-handlers/report-generation.ts` - Report generation handler
- `server/job-handlers/email-delivery.ts` - Email delivery handler
- `server/schedule-executor-service.ts` - Schedule execution

### 8. Comprehensive Logging

**Purpose**: Track all job executions with detailed metrics and error diagnostics.

**Logged Information**:
- Job ID, Queue, Type, Status
- Start/End Times, Duration
- Error Details and Stack Traces
- Performance Metrics
- Retry Count and Next Retry Time

**Features**:
- Automatic log cleanup (configurable retention)
- Performance metrics calculation
- Error diagnostics and severity tracking
- Export to CSV
- Real-time log viewer with filtering

**Key Files**:
- `server/job-logging-service.ts` - Logging engine
- `client/src/pages/admin/JobLogsViewer.tsx` - Log viewer
- `client/src/pages/admin/JobLogsAnalytics.tsx` - Analytics

---

## Database Schema

### Core Tables

#### `teamMembers`
Stores team member information and expertise.

```sql
- id (PK)
- userId (FK)
- name
- email
- expertise (JSON array of tags)
- languages (JSON array)
- isAvailable
- workloadCapacity
- currentWorkload
- conversionRate
- createdAt
- updatedAt
```

#### `teamMemberExpertise`
Maps expertise tags to team members.

```sql
- id (PK)
- teamMemberId (FK)
- expertiseTag
- proficiencyLevel (beginner/intermediate/expert)
- createdAt
```

#### `routingRules`
Defines routing configuration and rules.

```sql
- id (PK)
- name
- description
- scoringWeights (JSON)
- isActive
- createdAt
- updatedAt
```

#### `bookingEnquiries`
Stores booking enquiry information.

```sql
- id (PK)
- customerName
- customerEmail
- enquiryDetails
- assignedTeamMemberId (FK)
- routingScore
- status
- createdAt
- updatedAt
```

#### `notifications`
Stores notification records.

```sql
- id (PK)
- userId (FK)
- type
- title
- content
- actionUrl
- isRead
- readAt
- createdAt
```

#### `emailHistory`
Tracks all sent emails.

```sql
- id (PK)
- templateType
- recipients (JSON)
- subject
- status
- sentAt
- errorMessage
- createdAt
```

#### `jobExecutionLogs`
Logs all job executions.

```sql
- id (PK)
- jobId
- queue
- jobType
- status
- startedAt
- completedAt
- duration
- errorMessage
- errorCode
- metadata (JSON)
- createdAt
```

#### `reportSchedules`
Stores scheduled report configurations.

```sql
- id (PK)
- name
- frequency (daily/weekly/monthly)
- hour
- minute
- timezone
- recipients (JSON)
- reportType
- dateRangeType
- isActive
- nextRunAt
- lastRunAt
- createdAt
- updatedAt
```

---

## API Reference

### Routing Procedures

```typescript
// Get available team members for routing
trpc.routing.getAvailableTeamMembers.query()

// Calculate routing score for a team member
trpc.routing.calculateRoutingScore.query({ teamMemberId, enquiryData })

// Route an enquiry to best team member
trpc.routing.routeEnquiry.mutation({ enquiryId })

// Get routing configuration
trpc.routing.getRoutingConfig.query()

// Update routing configuration
trpc.routing.updateRoutingConfig.mutation({ config })
```

### Notification Procedures

```typescript
// Get user notifications
trpc.notifications.getNotifications.query({ limit, offset })

// Mark notification as read
trpc.notifications.markAsRead.mutation({ notificationId })

// Get notification preferences
trpc.notifications.getPreferences.query()

// Update notification preferences
trpc.notifications.updatePreferences.mutation({ preferences })
```

### Job Monitoring Procedures

```typescript
// Get queue statistics
trpc.jobMonitoring.getQueueStats.query()

// Get job execution logs
trpc.jobMonitoring.getJobLogs.query({ page, limit, status, queue })

// Get performance metrics
trpc.jobMonitoring.getPerformanceMetrics.query({ startDate, endDate })

// Get error diagnostics
trpc.jobMonitoring.getErrorDiagnostics.query({ startDate, endDate })

// Start/stop schedule executor
trpc.jobMonitoring.startExecutor.mutation()
trpc.jobMonitoring.stopExecutor.mutation()
```

### Report Schedule Procedures

```typescript
// Create scheduled report
trpc.reportSchedules.createSchedule.mutation({ schedule })

// Get all schedules
trpc.reportSchedules.getSchedules.query()

// Update schedule
trpc.reportSchedules.updateSchedule.mutation({ scheduleId, updates })

// Delete schedule
trpc.reportSchedules.deleteSchedule.mutation({ scheduleId })

// Trigger manual report generation
trpc.reportSchedules.triggerManualReport.mutation({ scheduleId })
```

---

## Admin Dashboards

### 1. Routing Configuration
**Path**: `/admin/routing-config`

Configure team member expertise, workload capacity, and routing rules.

### 2. Notification Center
**Path**: `/notifications`

View and manage notifications with quick-action buttons.

### 3. Email Template Preview
**Path**: `/admin/email-template-preview`

Preview and test email templates with sample data.

### 4. Webhook Configuration
**Path**: `/admin/webhook-configuration`

Configure email service provider webhooks (SendGrid, AWS SES, Mailgun).

### 5. Webhook Analytics
**Path**: `/admin/webhook-analytics`

Monitor email delivery events, provider performance, and engagement metrics.

### 6. Replay Analytics
**Path**: `/admin/replay-analytics`

Analyze webhook event replay success rates and patterns.

### 7. Job Monitoring
**Path**: `/admin/job-monitoring`

Real-time monitoring of job queues and execution status.

### 8. Job Logs Viewer
**Path**: `/admin/job-logs`

View and filter detailed job execution logs with export capability.

### 9. Job Logs Analytics
**Path**: `/admin/job-logs-analytics`

Analyze job execution patterns and performance trends.

### 10. Report Schedule Configuration
**Path**: `/admin/report-schedule-config`

Create and manage scheduled report delivery.

---

## Configuration

### Environment Variables

```bash
# Email Service Providers
SENDGRID_API_KEY=your_sendgrid_key
AWS_SES_REGION=us-east-1
MAILGUN_API_KEY=your_mailgun_key

# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=mysql://user:password@host/database

# JWT
JWT_SECRET=your_jwt_secret

# OAuth
OAUTH_SERVER_URL=https://oauth.example.com
VITE_OAUTH_PORTAL_URL=https://portal.example.com
```

### Routing Configuration

```typescript
const routingConfig = {
  scoringWeights: {
    workload: 0.30,
    expertise: 0.25,
    availability: 0.20,
    conversionRate: 0.15,
    language: 0.10,
  },
  workloadThresholds: {
    low: 5,
    medium: 10,
    high: 15,
  },
  enableAutoRouting: true,
  enableManualOverride: true,
};
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Routing Accuracy**: % of enquiries routed to correct team member
2. **Assignment Time**: Time from enquiry to assignment
3. **Email Delivery Rate**: % of emails successfully delivered
4. **Job Success Rate**: % of background jobs completed successfully
5. **Average Job Duration**: Time to process jobs
6. **Error Rate**: % of failed jobs
7. **Queue Depth**: Number of pending jobs

### Alert Thresholds

```typescript
const alertThresholds = {
  jobSuccessRate: 0.95, // Alert if < 95%
  emailDeliveryRate: 0.98, // Alert if < 98%
  averageJobDuration: 30000, // Alert if > 30s
  queueDepth: 1000, // Alert if > 1000 pending
  errorRate: 0.05, // Alert if > 5%
};
```

### Recommended Monitoring Tools

- **Job Queue**: Bull Board (built-in monitoring)
- **Logs**: ELK Stack or CloudWatch
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty or Opsgenie

---

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending

**Symptoms**: Email delivery shows "failed" status

**Solutions**:
1. Verify webhook configuration for email provider
2. Check email service provider API keys
3. Review error logs in Job Logs Viewer
4. Test with Email Template Preview dashboard
5. Check email recipient validity

#### 2. Jobs Not Processing

**Symptoms**: Jobs stuck in "pending" status

**Solutions**:
1. Check Redis connection: `redis-cli ping`
2. Verify job queue service is running
3. Check Job Monitoring dashboard for executor status
4. Review error logs for specific error codes
5. Restart schedule executor from Job Monitoring dashboard

#### 3. Routing Not Working

**Symptoms**: Enquiries not assigned to team members

**Solutions**:
1. Verify team members are marked as available
2. Check routing configuration in Admin UI
3. Ensure team members have expertise tags
4. Review routing logs for scoring details
5. Test manual routing to verify system

#### 4. High Job Failure Rate

**Symptoms**: Many jobs showing "failed" status

**Solutions**:
1. Check Job Logs Analytics for error patterns
2. Review error diagnostics for common error codes
3. Verify external service connectivity (email, webhooks)
4. Check system resources (CPU, memory, disk)
5. Review retry policy configuration

#### 5. Webhook Events Not Tracked

**Symptoms**: Email events not appearing in analytics

**Solutions**:
1. Verify webhook endpoint is publicly accessible
2. Check webhook configuration for correct provider
3. Verify webhook signature verification is working
4. Review webhook logs for delivery errors
5. Test webhook with simulation tool

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_enquiry_assigned_member ON bookingEnquiries(assignedTeamMemberId);
CREATE INDEX idx_notification_user ON notifications(userId, isRead);
CREATE INDEX idx_job_logs_status ON jobExecutionLogs(status, createdAt);
CREATE INDEX idx_email_history_status ON emailHistory(status, sentAt);
```

### Job Queue Optimization

```typescript
// Configure job concurrency
const jobQueue = new Queue('report-generation', {
  concurrency: 5, // Process 5 jobs simultaneously
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});
```

### Caching Strategy

```typescript
// Cache routing configuration
const cachedConfig = await cache.get('routing-config');
if (!cachedConfig) {
  const config = await fetchRoutingConfig();
  await cache.set('routing-config', config, 3600); // 1 hour TTL
}
```

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Daily**: Monitor job queue depth and error rates
2. **Weekly**: Review email delivery metrics and webhook events
3. **Monthly**: Analyze routing accuracy and team member performance
4. **Quarterly**: Optimize database indexes and clean up old logs

### Backup Strategy

```bash
# Backup database daily
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# Backup Redis data
redis-cli BGSAVE
```

### Log Retention Policy

```typescript
// Automatically clean up logs older than 30 days
trpc.jobMonitoring.cleanupOldLogs.mutation({ daysOld: 30 });
```

---

## Conclusion

This comprehensive system provides automated enquiry routing, real-time notifications, email delivery, webhook integration, and detailed analytics for the Pikme platform. The modular architecture allows for easy extension and customization based on specific business requirements.

For questions or issues, refer to the troubleshooting section or contact the development team.

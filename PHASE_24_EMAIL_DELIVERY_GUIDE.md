# Phase 24: Email Report Generation and Delivery Guide

## Overview

Phase 24 implements comprehensive email report generation and delivery for scheduled analytics reports. The system supports multiple email providers (SendGrid, AWS SES, Mailgun) with intelligent retry logic, error handling, and delivery tracking.

## Architecture

### Components

1. **EmailReportGeneratorEnhanced** - Generates formatted HTML/text reports
2. **ReportDeliveryService** - Manages report delivery via email providers
3. **ReportDeliveryRetryService** - Handles retry logic with exponential backoff
4. **ReportDeliveryHistory** - UI component for viewing delivery history

### Data Flow

```
Scheduled Report Trigger
    ↓
Generate Report (EmailReportGeneratorEnhanced)
    ↓
Send via Provider (ReportDeliveryService)
    ↓
Log Delivery (emailHistoryService)
    ↓
On Failure → Register Retry (ReportDeliveryRetryService)
    ↓
Exponential Backoff → Retry Delivery
```

## Services

### EmailReportGeneratorEnhanced

Generates formatted reports in HTML and text formats.

**Supported Report Types:**
- `replay` - Webhook replay analytics
- `webhook` - Webhook delivery metrics
- `job` - Background job execution statistics
- `summary` - Overall system summary

**Methods:**

```typescript
// Generate specific report type
await emailReportGeneratorEnhanced.generateReplayReport(options);
await emailReportGeneratorEnhanced.generateWebhookReport(options);
await emailReportGeneratorEnhanced.generateJobReport(options);
await emailReportGeneratorEnhanced.generateSummaryReport(options);

// Generate all reports
await emailReportGeneratorEnhanced.generateAllReports(options);
```

**Report Options:**

```typescript
interface ReportGenerationOptions {
  scheduleId?: number;
  reportType: 'replay' | 'webhook' | 'job' | 'summary';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  recipients: string[];
  includeCharts?: boolean;
  includeMetrics?: boolean;
}
```

### ReportDeliveryService

Handles delivery of reports via configured email providers.

**Methods:**

```typescript
// Register email provider
ReportDeliveryService.registerProvider({
  name: 'sendgrid',
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'reports@pikme.com',
  fromName: 'Pikme Reports',
});

// Generate and deliver report
const result = await ReportDeliveryService.generateAndDeliver(options, provider);

// Deliver pre-generated report
const result = await ReportDeliveryService.deliverReport(report, provider, scheduleId);

// Retry failed delivery
const result = await ReportDeliveryService.retryFailedDelivery(
  scheduleId,
  recipients,
  provider
);

// Get delivery status
const status = await ReportDeliveryService.getDeliveryStatus(scheduleId);
```

**Delivery Result:**

```typescript
interface DeliveryResult {
  scheduleId: number;
  recipients: string[];
  status: 'pending' | 'sent' | 'failed' | 'partial';
  sentCount: number;
  failedCount: number;
  errors: Array<{ recipient: string; error: string }>;
  timestamp: Date;
  messageId?: string;
}
```

### ReportDeliveryRetryService

Implements intelligent retry logic with exponential backoff.

**Retry Policy:**

```typescript
interface RetryPolicy {
  maxRetries: number;           // Maximum retry attempts
  initialDelayMs: number;       // Initial retry delay in ms
  maxDelayMs: number;           // Maximum retry delay in ms
  backoffMultiplier: number;    // Exponential backoff multiplier
  jitterFactor: number;         // Jitter to prevent thundering herd
}

// Default policy
{
  maxRetries: 3,
  initialDelayMs: 5000,
  maxDelayMs: 300000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
}
```

**Methods:**

```typescript
// Register failed delivery for retry
await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

// Get pending retries
const pending = ReportDeliveryRetryService.getPendingRetries();

// Mark attempt as successful/failed
ReportDeliveryRetryService.markAsSuccessful(scheduleId, attemptNumber);
ReportDeliveryRetryService.markAsFailed(scheduleId, attemptNumber, error);

// Get retry history
const history = ReportDeliveryRetryService.getRetryHistory(scheduleId);

// Get retry statistics
const stats = ReportDeliveryRetryService.getRetryStatistics();

// Handle delivery error with automatic retry decision
const { shouldRetry, nextRetryTime } = await ReportDeliveryRetryService.handleDeliveryError(
  scheduleId,
  error,
  attemptNumber,
  policy
);

// Get circuit breaker status
const status = ReportDeliveryRetryService.getCircuitBreakerStatus();
```

## Email Providers

### SendGrid

**Configuration:**

```typescript
ReportDeliveryService.registerProvider({
  name: 'sendgrid',
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: 'reports@pikme.com',
  fromName: 'Pikme Reports',
});
```

**Features:**
- Reliable delivery tracking
- Webhook support for delivery events
- High throughput
- Good documentation

### AWS SES

**Configuration:**

```typescript
ReportDeliveryService.registerProvider({
  name: 'aws-ses',
  apiKey: process.env.AWS_SES_API_KEY,
  fromEmail: 'reports@pikme.com',
  fromName: 'Pikme Reports',
});
```

**Features:**
- Cost-effective for high volume
- Integrated with AWS ecosystem
- Bounce/complaint handling
- Configuration sets for tracking

### Mailgun

**Configuration:**

```typescript
ReportDeliveryService.registerProvider({
  name: 'mailgun',
  apiKey: process.env.MAILGUN_API_KEY,
  fromEmail: 'reports@pikme.com',
  fromName: 'Pikme Reports',
});
```

**Features:**
- Flexible routing
- Advanced tracking
- Webhook support
- Good API documentation

## Retry Logic

### Exponential Backoff Algorithm

The retry service implements exponential backoff with jitter:

```
delay = min(initialDelay * (multiplier ^ attempt), maxDelay)
delay = delay + jitter(±10%)
nextRetryTime = now + delay
```

**Example Retry Schedule (default policy):**
- Attempt 1: 5 seconds
- Attempt 2: 10 seconds
- Attempt 3: 20 seconds
- Attempt 4+: Capped at 5 minutes

### Retryable vs Non-Retryable Errors

**Retryable:**
- Network timeouts
- Connection refused
- Rate limit exceeded
- Server errors (5xx)
- Temporary failures

**Non-Retryable:**
- Invalid email address
- Authentication failed
- Forbidden (403)
- Not found (404)
- Bad request (400)

## UI Components

### ReportDeliveryHistory

Displays delivery history with filtering, search, and export capabilities.

**Props:**

```typescript
interface ReportDeliveryHistoryProps {
  scheduleId?: number;           // Optional schedule filter
  onRetry?: (recordId: number) => void;  // Retry callback
}
```

**Features:**
- Search by recipient, subject, or message ID
- Filter by status (Sent, Failed, Pending)
- Filter by provider (SendGrid, AWS SES, Mailgun)
- Export to CSV
- Pagination
- Statistics cards
- Retry failed deliveries

**Usage:**

```tsx
import { ReportDeliveryHistory } from '@/components/ReportDeliveryHistory';

export function DeliveryDashboard() {
  const handleRetry = async (recordId: number) => {
    // Call retry API
  };

  return (
    <ReportDeliveryHistory
      scheduleId={1}
      onRetry={handleRetry}
    />
  );
}
```

## Testing

### Test Coverage

- **Exponential Backoff Calculation** - Verify delay calculations
- **Retry Registration** - Test retry queue management
- **Pending Retries** - Check retry eligibility
- **Attempt Status Tracking** - Verify success/failure marking
- **Error Handling** - Test retryable vs non-retryable errors
- **Retry Statistics** - Validate statistics calculation
- **Circuit Breaker** - Test circuit breaker logic

### Running Tests

```bash
# Run all delivery tests
pnpm test server/report-delivery.test.ts

# Run specific test suite
pnpm test server/report-delivery.test.ts -t "Exponential Backoff"

# Run with coverage
pnpm test server/report-delivery.test.ts --coverage
```

## Integration

### With Scheduled Reports

```typescript
// In schedule executor
const report = await emailReportGeneratorEnhanced.generateReplayReport(options);
const result = await ReportDeliveryService.deliverReport(report, provider, scheduleId);

if (result.status === 'failed' || result.status === 'partial') {
  await ReportDeliveryRetryService.registerForRetry(scheduleId, result);
}
```

### With Job Queue

```typescript
// In email delivery job handler
const result = await ReportDeliveryService.generateAndDeliver(options, provider);

// Log delivery
await emailHistoryService.logEmailDelivery({
  scheduleId: options.scheduleId,
  recipient: result.recipients[0],
  status: result.status,
  provider: provider.name,
  timestamp: new Date(),
});

// Register retry if failed
if (result.status === 'failed' || result.status === 'partial') {
  await ReportDeliveryRetryService.registerForRetry(options.scheduleId, result);
}
```

## Environment Variables

```bash
# SendGrid
SENDGRID_API_KEY=your_sendgrid_key

# AWS SES
AWS_SES_API_KEY=your_aws_key

# Mailgun
MAILGUN_API_KEY=your_mailgun_key

# Report Configuration
REPORT_FROM_EMAIL=reports@pikme.com
REPORT_FROM_NAME="Pikme Reports"
```

## Troubleshooting

### Delivery Failures

**Issue:** Emails not being delivered

**Solutions:**
1. Verify email provider API key is correct
2. Check email address validity
3. Review error logs in delivery history
4. Check provider's spam folder
5. Verify sender email is verified with provider

### Retry Loop Issues

**Issue:** Retries not executing

**Solutions:**
1. Check circuit breaker status
2. Verify retry policy configuration
3. Check system clock for time drift
4. Review retry history for stuck attempts

### Provider Integration Issues

**Issue:** Provider-specific errors

**Solutions:**
1. Verify API endpoint URLs
2. Check authentication headers
3. Review provider documentation
4. Test with provider's sandbox environment

## Performance Considerations

- **Batch Delivery:** Send to multiple recipients in single API call
- **Rate Limiting:** Respect provider rate limits
- **Retry Backoff:** Prevents overwhelming failed services
- **Circuit Breaker:** Stops delivery attempts during outages
- **Jitter:** Prevents thundering herd problem

## Security

- **API Keys:** Store in environment variables, never commit
- **Email Validation:** Validate recipient addresses
- **Content Sanitization:** Sanitize report content
- **HTTPS:** All provider communications use HTTPS
- **Authentication:** Use provider-specific auth mechanisms

## Future Enhancements

1. **Webhook Event Tracking** - Track opens, clicks, bounces
2. **A/B Testing** - Compare different report formats
3. **Delivery Analytics** - Detailed performance metrics
4. **Custom Templates** - User-defined report templates
5. **Scheduled Digests** - Batch multiple reports
6. **Unsubscribe Management** - Handle unsubscribe requests

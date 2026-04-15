# Email Service Provider Webhook Integration Guide

## Overview

The Webhook Integration System enables real-time tracking of email delivery status, opens, clicks, bounces, and complaints from major email service providers. This guide covers setup, configuration, and usage.

## Supported Email Providers

| Provider | Status | Events | Documentation |
|----------|--------|--------|---|
| SendGrid | ✅ Supported | Sent, Delivered, Open, Click, Bounce, Complaint | [SendGrid Docs](https://docs.sendgrid.com/for-developers/tracking/signed-webhooks) |
| AWS SES | ✅ Supported | Send, Delivery, Bounce, Complaint, Open, Click | [SES Docs](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-verify-signature.html) |
| Mailgun | ✅ Supported | Delivered, Opened, Clicked, Bounced, Complained | [Mailgun Docs](https://documentation.mailgun.com/en/latest/user_manual.html#webhooks) |

## Quick Start

### 1. Access Webhook Configuration

Navigate to Admin → Webhook Configuration in the Pikme dashboard.

### 2. Select Email Provider

Choose your email service provider (SendGrid, AWS SES, or Mailgun).

### 3. Copy Webhook URL

Click the copy button to copy your unique webhook URL:
```
https://your-domain.com/api/webhooks/{provider}
```

### 4. Configure Provider

Log in to your email service provider account and add the webhook URL to their webhook settings.

### 5. Add Signing Key

Copy your API key or signing key from the provider and paste it into the configuration form.

### 6. Test Connection

Click "Test Webhook" to verify the connection is working correctly.

## Configuration Details

### SendGrid Setup

1. Log in to SendGrid dashboard
2. Go to Settings → Mail Send Settings → Event Webhook
3. Enable Event Webhook
4. Paste the webhook URL
5. Select events to track:
   - Processed
   - Dropped
   - Delivered
   - Deferred
   - Bounce
   - Open
   - Click
   - Spam Report
   - Unsubscribe
6. Copy your Signing Public Key
7. Paste the key in Pikme webhook configuration

### AWS SES Setup

1. Log in to AWS Console
2. Go to SES → Configuration Sets
3. Create or select a configuration set
4. Add Event Destination
5. Select SNS as destination type
6. Create SNS topic for webhooks
7. Subscribe to SNS topic with HTTPS endpoint
8. Use your webhook URL as the endpoint
9. Copy your SNS topic ARN
10. Configure in Pikme with SNS credentials

### Mailgun Setup

1. Log in to Mailgun dashboard
2. Go to Sending → Webhooks
3. Add webhook for your domain
4. Paste the webhook URL
5. Select events:
   - Delivered
   - Opened
   - Clicked
   - Bounced
   - Complained
6. Copy your API key
7. Paste in Pikme webhook configuration

## Architecture

### Webhook Flow

```
Email Provider
    ↓
Webhook Endpoint (/api/webhooks/{provider})
    ↓
Signature Verification
    ↓
Payload Parsing
    ↓
Event Queue
    ↓
Retry Manager (with exponential backoff)
    ↓
Database Update
    ↓
Delivery Tracking Record
```

### Components

#### 1. Webhook Endpoint (`server/webhooks/email-provider-webhook.ts`)
- Receives webhook payloads from email providers
- Verifies webhook signatures for security
- Parses provider-specific payload formats
- Routes events to processing queue

#### 2. Configuration Service (`server/webhook-config-service.ts`)
- Manages webhook configurations per provider
- Validates configuration settings
- Enables/disables webhooks
- Logs webhook events for debugging

#### 3. Retry Manager (`server/webhook-retry-service.ts`)
- Implements exponential backoff retry logic
- Classifies errors (temporary vs permanent)
- Manages retry queue
- Provides circuit breaker pattern

#### 4. Test Simulator (`server/webhook-test-simulator.ts`)
- Generates realistic webhook events
- Simulates complete email journeys
- Provides test scenarios (bounce, complaint, high engagement)
- Supports all provider formats

#### 5. tRPC Router (`server/routers/webhooks.ts`)
- Exposes webhook procedures
- Handles provider-specific payloads
- Manages event simulation
- Provides queue status monitoring

## Event Types and Tracking

### Delivery Events

| Event | Status | Description |
|-------|--------|---|
| Sent | sent | Email accepted by provider |
| Delivered | delivered | Email successfully delivered |
| Deferred | queued | Delivery temporarily delayed |
| Bounced | bounced | Email bounced (permanent/temporary) |
| Complained | complained | Recipient marked as spam |

### Engagement Events

| Event | Tracking | Description |
|-------|----------|---|
| Opened | open_count, first_opened_at, last_opened_at | Recipient opened email |
| Clicked | click_count, first_clicked_at, last_clicked_at | Recipient clicked link |
| URL | url | Specific link clicked |

### Data Stored

```typescript
{
  emailHistoryId: number;
  deliveryStatus: string;
  bounceType?: string;
  bounceSubType?: string;
  complaintType?: string;
  opens: number;
  clicks: number;
  lastOpenedAt?: Date;
  lastClickedAt?: Date;
  firstOpenedAt?: Date;
  firstClickedAt?: Date;
  trackingData: Record<string, any>;
}
```

## Retry Logic

### Exponential Backoff Configuration

```typescript
{
  maxRetries: 5,              // Maximum retry attempts
  initialDelayMs: 1000,       // Initial delay: 1 second
  maxDelayMs: 300000,         // Maximum delay: 5 minutes
  backoffMultiplier: 2,       // Double delay each retry
  jitterFactor: 0.1,          // Add 10% random jitter
}
```

### Retry Delays

- Attempt 1: ~1 second
- Attempt 2: ~2 seconds
- Attempt 3: ~4 seconds
- Attempt 4: ~8 seconds
- Attempt 5: ~16 seconds

### Error Classification

**Temporary Errors (Retry)**
- Connection timeouts
- Connection refused
- Service temporarily unavailable
- Gateway timeouts
- Network unreachable

**Permanent Errors (No Retry)**
- Invalid request format
- Authentication failed
- Unauthorized access
- Malformed payload
- Syntax errors

## Circuit Breaker Pattern

Prevents cascading failures with three states:

| State | Behavior | Transition |
|-------|----------|---|
| Closed | Process normally | Open after 5 failures |
| Open | Reject requests | Half-open after 1 minute |
| Half-open | Test recovery | Closed after 2 successes |

## Testing

### Simulate Events

Use the webhook simulation endpoint to test without actual provider:

```typescript
await trpc.webhooks.simulateEvent.mutate({
  provider: "sendgrid",
  eventType: "delivered",
  emailHistoryId: 123,
  recipientEmail: "test@example.com",
});
```

### Test Scenarios

1. **Complete Email Journey** - sent → delivered → open → click
2. **Email Bounce** - sent → bounce
3. **Spam Complaint** - sent → delivered → complaint
4. **High Engagement** - multiple opens and clicks
5. **No Engagement** - sent → delivered (no opens)
6. **Deferred Delivery** - sent → deferred → delivered

### Run Tests

```bash
pnpm test server/webhooks.test.ts
```

All 49 tests verify:
- Signature verification
- Payload parsing
- Event type mapping
- Retry logic
- Error handling
- Circuit breaker
- Configuration management
- Simulation tools

## Monitoring and Debugging

### Webhook Status

Check webhook queue status:

```typescript
const status = await trpc.webhooks.getQueueStatus.query();
// Returns: { queueSize, retryCount, status }
```

### Event Logs

View webhook event logs in admin dashboard:

```typescript
const logs = await trpc.webhooks.getLogs.query({
  provider: "sendgrid",
  status: "failed",
  limit: 20,
});
```

### Statistics

Get webhook statistics:

```typescript
const stats = await trpc.webhooks.getStatistics.query();
// Returns: { totalEvents, successRate, byProvider, byEventType }
```

## Security Considerations

### Signature Verification

All webhooks are cryptographically verified using provider-specific signing keys:

- **SendGrid**: HMAC-SHA256 with timestamp
- **AWS SES**: HMAC-SHA256 with SNS certificate
- **Mailgun**: HMAC-SHA256 with timestamp

### Best Practices

1. **Store Keys Securely**: Keep signing keys in environment variables
2. **Verify Signatures**: Always verify webhook signatures before processing
3. **Use HTTPS**: Ensure webhook URLs use HTTPS
4. **Validate Data**: Sanitize and validate all webhook data
5. **Rate Limiting**: Implement rate limiting on webhook endpoints
6. **Monitoring**: Monitor webhook processing for anomalies

## Troubleshooting

### Webhooks Not Received

1. Check webhook URL is publicly accessible
2. Verify HTTPS certificate is valid
3. Check firewall/network settings
4. Verify webhook is enabled in provider settings
5. Check event types are selected in provider

### Failed Signature Verification

1. Verify signing key is correct
2. Check key hasn't been rotated
3. Ensure correct provider is configured
4. Verify webhook payload format

### High Retry Count

1. Check database connectivity
2. Verify email history records exist
3. Check for temporary service issues
4. Review error logs for patterns

### Missing Events

1. Verify all event types are enabled
2. Check webhook configuration is active
3. Verify email history records are created
4. Check delivery tracking table for records

## API Reference

### Webhook Router Procedures

#### `webhooks.sendgrid`
Handle SendGrid webhook events

#### `webhooks.ses`
Handle AWS SES webhook events

#### `webhooks.mailgun`
Handle Mailgun webhook events

#### `webhooks.handleCustom`
Handle custom provider webhooks

#### `webhooks.simulateEvent`
Simulate webhook event for testing

#### `webhooks.getQueueStatus`
Get webhook processing queue status

### Configuration Service

#### `getWebhookConfig(provider)`
Get configuration for provider

#### `setWebhookConfig(provider, config)`
Set configuration for provider

#### `validateWebhookConfig(config)`
Validate configuration settings

#### `testWebhookConfig(provider)`
Test webhook connection

## Performance Optimization

### Database Indexes

Recommended indexes for webhook tables:

```sql
CREATE INDEX idx_email_history_id ON emailDeliveryTracking(emailHistoryId);
CREATE INDEX idx_delivery_status ON emailDeliveryTracking(deliveryStatus);
CREATE INDEX idx_created_at ON emailDeliveryTracking(createdAt);
```

### Queue Processing

- Process events in batches
- Implement backpressure handling
- Monitor queue size
- Archive old events

### Caching

- Cache webhook configurations
- Cache provider settings
- Cache statistics (refresh every 5 minutes)

## Integration with Email History

Webhooks automatically update the email delivery tracking records:

```typescript
// Email sent
await logEmail({
  templateType: "enquiry_assigned",
  recipientEmail: "user@example.com",
  status: "sent",
});

// Webhook received - automatically updates tracking
await updateEmailStatus(emailId, "delivered");
```

## Future Enhancements

1. **Real-time Notifications** - Push notifications for delivery events
2. **Advanced Analytics** - ML-based engagement prediction
3. **Custom Webhooks** - Support for additional providers
4. **Webhook Replay** - Replay failed webhooks
5. **Batch Processing** - Process multiple webhooks in parallel
6. **Data Export** - Export webhook data for analysis

## Support and Resources

- [SendGrid Webhook Documentation](https://docs.sendgrid.com/for-developers/tracking/signed-webhooks)
- [AWS SES Event Publishing](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-verify-signature.html)
- [Mailgun Webhooks](https://documentation.mailgun.com/en/latest/user_manual.html#webhooks)

## Changelog

### Version 1.0.0 (January 24, 2026)
- Initial webhook integration
- Support for SendGrid, AWS SES, Mailgun
- Signature verification
- Retry logic with exponential backoff
- Circuit breaker pattern
- Comprehensive testing
- Admin configuration UI
- Event simulation tools

---

**Last Updated**: January 24, 2026
**Version**: 1.0.0

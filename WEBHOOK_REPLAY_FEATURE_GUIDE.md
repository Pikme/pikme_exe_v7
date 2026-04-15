# Webhook Event Replay Feature Guide

## Overview

The Webhook Event Replay feature enables administrators to manually re-trigger failed webhook events with comprehensive filtering, monitoring, and audit trail capabilities. This is essential for recovering from temporary service failures, configuration issues, or network problems without losing critical webhook data.

## Architecture

### Core Components

**1. Replay Service** (`server/webhook-replay-service.ts`)
- Manages replay requests and batch processing
- Tracks replay history and statistics
- Handles event filtering and prioritization
- Provides export capabilities

**2. tRPC Procedures** (`server/routers/webhook-replay.ts`)
- `createReplayRequest` - Queue events for replay
- `getBatchStatus` - Get status of a replay batch
- `getAllBatches` - List all replay batches
- `getReplayHistory` - Retrieve replay history with filtering
- `getReplayStatistics` - Get aggregate replay metrics
- `cancelBatch` - Cancel pending replay batch
- `retryFailedReplays` - Retry failed events from a batch
- `filterReplayableEvents` - Find events eligible for replay
- `bulkReplayEvents` - Replay multiple events at once
- `getRecentActivity` - Get recent replay activity

**3. UI Components**
- `WebhookEventHistory.tsx` - Event history table with filtering
- `WebhookReplayModal.tsx` - Replay confirmation dialog
- `WebhookReplayStatus.tsx` - Batch status and monitoring

## Data Models

### WebhookEvent
```typescript
interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  status: "delivered" | "failed" | "pending";
  timestamp: Date;
  processingTime: number;
  payload?: Record<string, any>;
  error?: string;
  retryCount: number;
  lastRetryTime?: Date;
}
```

### ReplayBatch
```typescript
interface ReplayBatch {
  id: string;
  eventIds: string[];
  totalEvents: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  reason: string;
  requestedBy: string;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  completedAt?: Date;
  status: "pending" | "processing" | "completed" | "failed";
}
```

### ReplayResult
```typescript
interface ReplayResult {
  eventId: string;
  originalStatus: string;
  replayStatus: "queued" | "processing" | "success" | "failed";
  replayTime: Date;
  error?: string;
  newRetryCount: number;
}
```

## Usage Guide

### Replaying Failed Events

1. **Navigate to Webhook Replay** - Access the webhook replay section in admin dashboard
2. **Filter Events** - Use filters to find failed events:
   - By provider (SendGrid, AWS SES, Mailgun)
   - By event type (delivered, open, click, bounce)
   - By date range
   - By error pattern
3. **Select Events** - Check events to replay or use "Select All"
4. **Open Replay Modal** - Click "Replay" button
5. **Provide Reason** - Enter reason for replay (required)
6. **Set Priority** - Choose priority (low/normal/high)
7. **Confirm** - Submit replay request

### Monitoring Replay Batches

The replay status dashboard shows:
- **Summary Cards** - Total batches, processing, completed, failed
- **Batch Table** - All replay batches with status and success rates
- **Batch Details** - Detailed view of selected batch with event results
- **Auto-refresh** - Real-time updates every 5 seconds

### Replay Statistics

Get insights into replay performance:
```typescript
const stats = service.getReplayStatistics();
// Returns:
// - totalReplays: Total number of replayed events
// - successfulReplays: Successfully processed events
// - failedReplays: Events that failed again
// - successRate: Percentage of successful replays
// - averageRetries: Average retry count
// - mostCommonError: Most frequent error type
```

## Features

### Event Filtering

Filter events by multiple criteria:
```typescript
const filtered = service.filterReplayableEvents(events, {
  provider: "sendgrid",
  eventType: "delivered",
  dateRange: {
    start: new Date("2026-01-01"),
    end: new Date("2026-01-31")
  },
  errorPattern: "timeout",
  limit: 100,
  offset: 0
});
```

### Batch Processing

Process events in batches for efficiency:
```typescript
const batchId = service.queueForReplay(
  ["event-1", "event-2", "event-3"],
  "Provider was temporarily down",
  "admin@example.com",
  "high"
);

// Monitor batch progress
const batch = service.getBatchStatus(batchId);
```

### Priority Handling

Events are processed by priority:
- **High** - Processed immediately
- **Normal** - Standard processing queue
- **Low** - Processed when resources available

### Dry Run Mode

Test replay without actually processing:
```typescript
// In replay modal, enable "Dry Run"
// Shows what would happen without making changes
```

### Export Capabilities

Export replay history for analysis:
```typescript
// JSON format
const json = service.exportReplayHistory("json");

// CSV format
const csv = service.exportReplayHistory("csv");
```

### Retry Failed Replays

Automatically retry events that failed during replay:
```typescript
const newBatchId = service.retryFailedReplays(originalBatchId);
```

## API Endpoints

### Create Replay Request
```
POST /api/trpc/webhookReplay.createReplayRequest
{
  "eventIds": ["event-1", "event-2"],
  "reason": "Provider was down",
  "priority": "high"
}
```

### Get Batch Status
```
GET /api/trpc/webhookReplay.getBatchStatus?batchId=batch-123
```

### Get All Batches
```
GET /api/trpc/webhookReplay.getAllBatches
```

### Get Replay History
```
GET /api/trpc/webhookReplay.getReplayHistory?status=success&limit=50
```

### Get Statistics
```
GET /api/trpc/webhookReplay.getReplayStatistics
```

## Best Practices

### 1. Provide Clear Reasons
Always provide a descriptive reason for replay:
- ✓ "Provider was temporarily down (2026-01-24 10:00-10:15 UTC)"
- ✓ "Configuration fix applied, retrying failed events"
- ✗ "Retry"
- ✗ "Test"

### 2. Use Appropriate Priority
- **High** - Critical business events, time-sensitive
- **Normal** - Regular operational replays
- **Low** - Bulk historical replays, non-urgent

### 3. Filter Before Replay
Always filter events to target specific issues:
- Avoid replaying all events unnecessarily
- Use date ranges to limit scope
- Filter by error type when possible

### 4. Monitor Batch Progress
Watch batch processing in real-time:
- Check success rates regularly
- Investigate failures promptly
- Use auto-refresh for live updates

### 5. Document Replay Actions
Keep audit trail of replay requests:
- Reason is automatically recorded
- Timestamp and user tracked
- Results stored for analysis

## Troubleshooting

### High Failure Rate in Replay

**Symptoms**: Many events failing during replay

**Solutions**:
1. Check if underlying issue is resolved
2. Verify webhook endpoint is healthy
3. Review error messages for patterns
4. Consider retrying with different priority
5. Check network connectivity

### Batch Not Processing

**Symptoms**: Batch stuck in "processing" state

**Solutions**:
1. Check system resources
2. Review server logs for errors
3. Verify webhook endpoint availability
4. Try canceling and re-queuing batch
5. Contact support if issue persists

### Missing Events in History

**Symptoms**: Cannot find events to replay

**Solutions**:
1. Adjust date range filter
2. Check provider filter
3. Verify event type selection
4. Use error pattern search
5. Check if events were already replayed

## Performance Considerations

### Batch Size
- Recommended: 50-500 events per batch
- Maximum: 10,000 events per batch
- Larger batches may impact performance

### Frequency
- Avoid replaying same events multiple times
- Space out large replay batches
- Monitor system load during replays

### Storage
- Replay history limited to 10,000 entries
- Old entries automatically cleaned up
- Export history before cleanup if needed

## Security

### Access Control
- Only admins can access replay feature
- All replay actions logged with user ID
- Audit trail maintained for compliance

### Data Protection
- Event payloads not stored in history
- Sensitive data not logged
- HTTPS encryption for all API calls

### Rate Limiting
- Replay requests rate-limited per user
- Batch size limits enforced
- Concurrent batch limits applied

## Testing

### Unit Tests
```bash
pnpm test server/webhook-replay.test.ts
```

20 comprehensive tests covering:
- Batch creation and management
- Event processing and filtering
- Statistics calculation
- History export
- Error handling

### Manual Testing
1. Create test webhook events
2. Mark some as failed
3. Use replay feature to re-trigger
4. Verify events processed correctly
5. Check history and statistics

## Integration Points

### Email Service Providers
- SendGrid webhook events
- AWS SES bounce/complaint events
- Mailgun delivery tracking

### Database
- Event history storage
- Batch tracking
- Replay audit trail

### Notifications
- Replay completion notifications
- Failure alerts
- Statistics reports

## Future Enhancements

1. **Scheduled Replays** - Schedule replays for specific times
2. **Conditional Replays** - Replay based on conditions
3. **Webhook Forwarding** - Forward replayed events to alternate endpoints
4. **Performance Analytics** - Detailed performance metrics per provider
5. **Machine Learning** - Predict replay success based on patterns
6. **Integration with Slack** - Send replay notifications to Slack

## Support

For issues or questions:
1. Check this documentation
2. Review webhook replay logs
3. Contact support team
4. Submit bug reports with batch IDs

---

**Last Updated**: 2026-01-24
**Version**: 1.0.0

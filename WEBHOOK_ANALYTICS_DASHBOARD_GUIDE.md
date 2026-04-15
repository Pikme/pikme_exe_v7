# Webhook Analytics Dashboard Guide

## Overview

The Webhook Analytics Dashboard provides comprehensive real-time monitoring and visualization of email webhook delivery metrics, system health, and performance trends. It enables admins to track delivery success rates, identify issues, and optimize email service provider performance.

## Features

### 1. Real-Time Metrics
- **Total Events**: Count of all webhook events processed
- **Success Rate**: Percentage of successfully delivered events
- **Average Processing Time**: Mean time to process each webhook
- **Events Per Second**: Current throughput rate
- **System Status**: Overall health indicator (Healthy/Degraded/Critical)

### 2. Dashboard Tabs

#### Overview Tab
- **Events Over Time**: 24-hour line chart showing event trends
- **Success/Failure Distribution**: Visual representation of delivery outcomes
- **Top Errors**: List of most common webhook errors with frequency

#### Providers Tab
- **Provider Metrics Cards**: Individual performance cards for each provider (SendGrid, AWS SES, Mailgun)
- **Success Rate**: Per-provider delivery success percentage
- **Processing Time**: Average latency for each provider
- **Provider Comparison**: Bar chart comparing successful vs failed events by provider

#### Event Types Tab
- **Event Type Distribution**: Pie chart showing breakdown of event types (Delivered, Opened, Clicked, Bounced)
- **Event Type Metrics**: Detailed table with success rates and processing times per event type

#### System Health Tab
- **CPU Usage**: System CPU utilization percentage
- **Memory Usage**: System memory consumption
- **Response Time**: Average API response latency
- **System Information**: Status, uptime, queue size, circuit breaker state

## Architecture

### Analytics Service (`webhook-analytics-service.ts`)

The core analytics engine provides:

```typescript
// Calculate overall metrics
calculateMetrics(events: any[]): WebhookMetrics

// Get metrics by provider
calculateProviderMetrics(events: any[]): ProviderMetrics[]

// Get metrics by event type
calculateEventTypeMetrics(events: any[]): EventTypeMetrics[]

// Generate time series data for charts
generateTimeSeries(events: any[], intervalMinutes: number): TimeSeriesData[]

// Calculate system health
calculateSystemHealth(queueSize, circuitBreakerOpen, errors, uptime): SystemHealth

// Extract top errors
extractTopErrors(events: any[], limit: number): TopError[]

// Create snapshot
createSnapshot(...): AnalyticsSnapshot
```

### tRPC Procedures (`routers/webhook-analytics.ts`)

Available endpoints:

- `getMetrics()` - Current webhook metrics
- `getProviderMetrics()` - Metrics by provider
- `getEventTypeMetrics()` - Metrics by event type
- `getTimeSeries(intervalMinutes, hoursBack)` - Time series data
- `getSystemHealth()` - System health status
- `getSnapshot()` - Complete analytics snapshot
- `getTopErrors(limit)` - Top errors list
- `getSummary()` - Analytics summary
- `getProviderComparison()` - Provider performance comparison
- `getEventTypeBreakdown()` - Event type distribution
- `getRealTimeMetrics()` - Real-time metrics (last minute)
- `getDashboardOverview()` - Complete dashboard data

### UI Component (`pages/admin/WebhookAnalyticsDashboard.tsx`)

React component featuring:
- Responsive layout with metric cards
- Interactive charts using Recharts
- Real-time data refresh (30-second intervals)
- Tabbed interface for different views
- Status badges and progress indicators
- Error alerts and system health warnings

## Data Models

### WebhookMetrics
```typescript
{
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;        // 0-100
  averageProcessingTime: number; // milliseconds
  eventsPerSecond: number;
}
```

### ProviderMetrics
```typescript
{
  provider: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  averageProcessingTime: number;
  lastEventTime?: Date;
}
```

### EventTypeMetrics
```typescript
{
  eventType: string;
  count: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageProcessingTime: number;
}
```

### SystemHealth
```typescript
{
  status: "healthy" | "degraded" | "critical";
  uptime: number;              // seconds
  queueSize: number;
  circuitBreakerStatus: string;
  lastError?: {
    timestamp: Date;
    message: string;
    type: string;
  };
  metrics: {
    cpuUsage?: number;
    memoryUsage?: number;
    responseTime?: number;
  };
}
```

## Usage

### Accessing the Dashboard

Navigate to `/admin/webhook-analytics` to view the dashboard.

### Interpreting Metrics

**Success Rate**: Target 95%+ success rate. Rates below 90% indicate potential issues.

**Processing Time**: Typical range 50-500ms. Spikes may indicate provider issues or network latency.

**Events Per Second**: Baseline metric for normal operations. Sudden drops may indicate delivery problems.

**System Status**:
- **Healthy**: All metrics normal, no errors
- **Degraded**: Queue size >500 or recent errors
- **Critical**: Queue size >1000, circuit breaker open, or >10 recent errors

### Identifying Issues

1. **High Failure Rate**: Check top errors and provider metrics
2. **Slow Processing**: Compare providers to identify bottlenecks
3. **Queue Buildup**: Indicates webhook processing delays
4. **Circuit Breaker Open**: Indicates repeated failures, check provider configuration

## Integration with Webhook System

The analytics dashboard integrates with:

1. **Webhook Event Handler**: Captures all webhook events
2. **Email History Tracking**: Correlates with email delivery records
3. **Retry Manager**: Tracks retry attempts and outcomes
4. **Provider Configuration**: Monitors per-provider performance

## Performance Considerations

- Dashboard refreshes every 30 seconds
- Snapshots are stored in memory (max 1440 = 24 hours)
- Time series data aggregated by 5-minute intervals
- Charts render efficiently with Recharts library

## Testing

Comprehensive test suite with 26 tests covering:

- Metrics calculation accuracy
- Provider metrics aggregation
- Event type breakdown
- System health determination
- Error extraction
- Snapshot creation and retrieval
- Time series generation
- Data filtering and aggregation

Run tests:
```bash
pnpm test server/webhook-analytics.test.ts
```

## Future Enhancements

1. **Webhook Event Replay**: Manually replay failed events
2. **Performance Alerts**: Threshold-based notifications
3. **Custom Reports**: Generate PDF/CSV reports
4. **Predictive Analytics**: Forecast delivery issues
5. **Provider Optimization**: Recommendations based on performance data
6. **Historical Analysis**: Long-term trend analysis

## Troubleshooting

### Dashboard Not Loading
- Check browser console for errors
- Verify tRPC procedures are registered
- Ensure user has admin role

### Missing Data
- Verify webhook events are being captured
- Check database connectivity
- Review webhook configuration

### Inaccurate Metrics
- Verify event timestamps are in UTC
- Check for duplicate event processing
- Review retry logic for accuracy

## Related Documentation

- [Webhook Integration Guide](./WEBHOOK_INTEGRATION_GUIDE.md)
- [Email History Tracking Guide](./EMAIL_HISTORY_TRACKING_GUIDE.md)
- [Notification System Guide](./NOTIFICATION_SYSTEM_GUIDE.md)

# Replay Analytics Reports Guide

## Overview

The Replay Analytics system provides comprehensive insights into webhook replay success rates, event type patterns, and performance trends. Generate detailed reports to identify optimization opportunities and monitor system health.

## Features

### 1. Overall Metrics Dashboard
- **Total Replays** - Total number of replayed events
- **Success Rate** - Percentage of successful replays
- **Failure Rate** - Percentage of failed replays
- **Average Retries** - Average retry count per event
- **Average Processing Time** - Average time to process each event

### 2. Event Type Analytics
- Most replayed event types by volume
- Success rates per event type
- Processing time analysis
- Retry patterns by event type
- Last replayed timestamp

### 3. Provider Performance
- Success rates by email provider (SendGrid, AWS SES, Mailgun)
- Event volume per provider
- Processing time comparison
- Event type breakdown per provider

### 4. Error Analysis
- Top errors by frequency
- Error percentage distribution
- Affected providers per error
- Affected event types per error
- Last occurrence timestamp

### 5. Trend Analysis
- Daily replay trends
- Hourly replay trends
- Trend direction (increasing/decreasing/stable)
- Trend percentage change

### 6. Intelligent Recommendations
- Automated recommendations based on metrics
- Success rate optimization suggestions
- Performance improvement tips
- Error resolution guidance

## Accessing Analytics

### Dashboard Navigation
1. Go to Admin Panel → Analytics
2. Select "Replay Analytics" from the menu
3. Choose date range (Last 7 days, 30 days, 90 days, or custom)
4. Navigate between tabs: Overview, Event Types, Providers, Errors, Full Report

### Date Range Selection
- **Last 7 days** - Recent performance snapshot
- **Last 30 days** - Monthly performance analysis
- **Last 90 days** - Quarterly trends
- **Custom** - Specific date range analysis

## Key Metrics Explained

### Success Rate
```
Success Rate = (Successful Replays / Total Replays) × 100
```
- **Excellent**: > 95%
- **Good**: 80-95%
- **Fair**: 60-80%
- **Poor**: < 60%

### Average Retries
- Indicates how many attempts needed per event
- Lower is better (target: < 1.5)
- High values suggest underlying issues

### Average Processing Time
- Time in milliseconds to process each event
- Lower is better (target: < 200ms)
- Spikes may indicate provider issues

### Failure Rate
```
Failure Rate = (Failed Replays / Total Replays) × 100
```
- Inverse of success rate
- Used to identify problem areas

## Report Types

### Overview Tab
Comprehensive dashboard with:
- Key metrics cards
- Replay trend chart (daily volume and success rate)
- Success vs failure pie chart
- Real-time statistics

### Event Types Tab
Detailed analysis of most replayed event types:
- Bar chart comparing volume, success, and failures
- Individual event type cards with metrics
- Success rate per type
- Processing time analysis

### Providers Tab
Email provider performance comparison:
- Bar chart of success rates by provider
- Individual provider cards
- Volume and success metrics
- Performance comparison

### Errors Tab
Top errors and failure analysis:
- Error frequency ranking
- Affected providers and event types
- Error percentage distribution
- Last occurrence tracking

### Full Report Tab
Comprehensive report with:
- All metrics and analytics
- Trend analysis
- Recommendations
- Export options (JSON/CSV)

## Interpreting Analytics

### High Success Rate (> 90%)
- System is performing well
- Continue monitoring for anomalies
- Focus on optimization rather than fixes

### Declining Success Rate
- Investigate recent changes
- Check provider status pages
- Review error logs for patterns
- Consider increasing retry limits

### High Retry Count
- Events require multiple attempts to succeed
- May indicate provider issues
- Consider implementing exponential backoff
- Review error types for patterns

### Slow Processing Times
- Events taking longer than expected
- Check network connectivity
- Verify provider API health
- Consider caching strategies

### Concentrated Errors
- Few error types causing most failures
- Focus remediation efforts
- Implement targeted fixes
- Monitor for resolution

## Recommendations

The system automatically generates recommendations based on:

1. **Success Rate Analysis**
   - If < 80%: Investigate root causes
   - If < 60%: Urgent action required

2. **Event Type Performance**
   - Identify underperforming types
   - Review processing logic
   - Check provider support

3. **Provider Comparison**
   - Compare success rates
   - Identify problematic providers
   - Consider provider switching

4. **Error Patterns**
   - Address top errors first
   - Implement preventive measures
   - Monitor for improvements

5. **Performance Optimization**
   - Reduce processing time
   - Optimize retry strategies
   - Improve resource allocation

## Exporting Reports

### JSON Export
- Complete data structure
- Machine-readable format
- Suitable for integration
- Preserves all metrics

### CSV Export
- Spreadsheet-compatible format
- Easy to analyze in Excel
- Suitable for sharing
- Includes all sections

### Export Steps
1. Open Full Report tab
2. Click "Export" button
3. Select format (JSON or CSV)
4. File downloads automatically
5. Open in preferred application

## Best Practices

### 1. Regular Monitoring
- Check analytics weekly
- Monitor trends over time
- Set up alerts for anomalies
- Review recommendations

### 2. Trend Analysis
- Compare week-over-week
- Identify seasonal patterns
- Track improvement progress
- Validate fixes

### 3. Provider Management
- Monitor provider performance
- Compare success rates
- Consider redundancy
- Plan migrations if needed

### 4. Error Resolution
- Address top errors first
- Implement fixes systematically
- Verify improvements
- Document solutions

### 5. Performance Optimization
- Optimize processing time
- Reduce retry count
- Improve success rate
- Monitor resource usage

## Troubleshooting

### No Data Available
- Check date range
- Verify replay events exist
- Ensure sufficient time has passed
- Check system logs

### Unexpected Low Success Rate
- Review recent changes
- Check provider status
- Verify webhook endpoints
- Review error logs

### High Processing Times
- Check network connectivity
- Verify provider API health
- Review server resources
- Consider caching

### Missing Event Types
- Verify events are being replayed
- Check date range
- Confirm event type names
- Review webhook configuration

## API Reference

### Get Metrics
```typescript
trpc.replayAnalytics.getMetrics.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
})
```

### Get Event Type Analytics
```typescript
trpc.replayAnalytics.getEventTypeAnalytics.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
  limit: 10,
})
```

### Get Provider Analytics
```typescript
trpc.replayAnalytics.getProviderAnalytics.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
})
```

### Get Top Errors
```typescript
trpc.replayAnalytics.getTopErrors.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
  limit: 5,
})
```

### Generate Report
```typescript
trpc.replayAnalytics.generateReport.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
})
```

### Export Report
```typescript
// JSON
trpc.replayAnalytics.exportReportJSON.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
})

// CSV
trpc.replayAnalytics.exportReportCSV.useQuery({
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
})
```

## Performance Considerations

### Data Size
- Analytics service stores replay data in memory
- Large datasets may impact performance
- Consider archiving old data
- Use date ranges to limit queries

### Query Performance
- Metrics calculation: O(n) where n = replay events
- Trend analysis: O(n log n) for sorting
- Report generation: O(n) for all calculations
- Optimize by limiting date ranges

### Storage
- No persistent storage by default
- Data lost on server restart
- Consider database integration
- Implement data archival

## Future Enhancements

1. **Predictive Analytics** - Forecast success rates
2. **Machine Learning** - Identify patterns automatically
3. **Custom Alerts** - Threshold-based notifications
4. **Scheduled Reports** - Automated report generation
5. **Comparative Analysis** - Provider benchmarking
6. **Drill-down Analysis** - Detailed event inspection
7. **Custom Metrics** - User-defined KPIs
8. **Integration** - Slack, email notifications

## Support

For issues or questions:
1. Review this documentation
2. Check analytics dashboard
3. Review system logs
4. Contact support team

---

**Last Updated**: 2026-01-24
**Version**: 1.0.0

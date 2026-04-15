# Anomaly Detection System Guide

## Overview

The Anomaly Detection System automatically monitors job metrics and system health, detecting unusual patterns that indicate performance degradation or system issues. It uses statistical analysis to identify anomalies and sends configurable alerts to admins.

## Features

### 1. **Automatic Anomaly Detection**
- **Success Rate Monitoring**: Alerts when job success rate drops below threshold
- **Duration Spike Detection**: Alerts when average job processing time increases significantly
- **Error Rate Monitoring**: Alerts when error rate exceeds acceptable threshold
- **Queue Depth Monitoring**: Alerts when job queue grows unexpectedly
- **Throughput Monitoring**: Alerts when job processing throughput decreases

### 2. **Statistical Analysis**
- Calculates baseline metrics from historical data (mean, standard deviation, percentiles)
- Uses Z-score calculation to identify statistical outliers
- Configurable sensitivity via standard deviation multiplier
- Automatic baseline recalculation based on configurable time window

### 3. **Alert Management**
- Multiple severity levels: Low, Medium, High, Critical
- Configurable severity thresholds for each metric
- Alert deduplication to prevent notification spam
- Priority-based alert sorting for efficient triage

### 4. **Notification System**
- In-app notifications for real-time visibility
- Email notifications with formatted HTML content
- Webhook support for integration with external systems
- Configurable notification methods per alert type

### 5. **Dashboard & Configuration**
- Real-time anomaly alerts dashboard with filtering
- Alert configuration interface with sliders for easy threshold adjustment
- Alert history and tracking
- Recommended actions for each anomaly type

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                  Anomaly Detection System                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Metrics Collection                                  │  │
│  │  - Job execution logs                               │  │
│  │  - Performance metrics                              │  │
│  │  - Queue statistics                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Statistical Analysis                               │  │
│  │  - Baseline calculation                             │  │
│  │  - Z-score calculation                              │  │
│  │  - Anomaly detection                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Alert Generation                                   │  │
│  │  - Severity assignment                              │  │
│  │  - Alert deduplication                              │  │
│  │  - Priority calculation                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Notification Delivery                              │  │
│  │  - In-app notifications                             │  │
│  │  - Email notifications                              │  │
│  │  - Webhook notifications                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Services

#### 1. **AnomalyDetectionService** (`server/anomaly-detection-service.ts`)
- Detects anomalies using statistical analysis
- Calculates baselines from historical data
- Provides methods for each anomaly type
- Configurable thresholds and sensitivity

#### 2. **AlertNotificationService** (`server/alert-notification-service.ts`)
- Sends notifications via multiple channels
- Formats alerts for email delivery
- Deduplicates alerts to prevent spam
- Prioritizes alerts for efficient handling

#### 3. **AnomalyDetectionRouter** (`server/routers/anomaly-detection.ts`)
- tRPC procedures for anomaly detection
- Configuration management
- Alert formatting and severity assignment
- Recommended actions for each anomaly type

## Configuration

### Default Configuration

```typescript
{
  successRateThreshold: 0.95,        // 95% - Alert if success rate drops below this
  durationSpikeThreshold: 0.5,       // 50% - Alert if duration increases by this %
  errorRateThreshold: 0.05,          // 5% - Alert if error rate exceeds this
  queueDepthThreshold: 1000,         // Alert if queue depth exceeds this
  throughputDropThreshold: 0.3,      // 30% - Alert if throughput drops by this %
  stdDevMultiplier: 2.5,             // 2.5σ - Number of standard deviations
  baselineWindowHours: 24,           // Use 24 hours of historical data
  checkIntervalMinutes: 5,           // Check every 5 minutes
}
```

### Adjusting Thresholds

Use the **Anomaly Alert Configuration** page to adjust thresholds:

1. **Success Rate Threshold**: Lower values = more sensitive
   - Recommended: 0.90-0.95 (90-95%)
   - Adjust based on acceptable downtime

2. **Duration Spike Threshold**: Lower values = more sensitive
   - Recommended: 0.30-0.50 (30-50% increase)
   - Adjust based on normal job duration variance

3. **Error Rate Threshold**: Lower values = more sensitive
   - Recommended: 0.03-0.05 (3-5%)
   - Adjust based on acceptable error tolerance

4. **Standard Deviation Multiplier**: Higher values = less sensitive
   - Recommended: 2.0-3.0 (2-3σ)
   - 2.5σ catches ~98% of normal variations

5. **Baseline Window**: Longer = more stable baselines
   - Recommended: 24-48 hours
   - Must be longer than expected seasonal patterns

## Usage

### Accessing the Anomaly Detection Dashboard

1. Navigate to **Admin** → **Anomaly Alerts**
2. View real-time alerts with severity indicators
3. Filter by severity level (Critical, High, Medium, Low)
4. Enable/disable auto-refresh (30-second intervals)

### Configuring Alerts

1. Navigate to **Admin** → **Anomaly Alert Configuration**
2. Adjust thresholds using sliders
3. Review recommended values in info box
4. Click **Save Configuration**

### Interpreting Alerts

Each alert shows:
- **Alert Type**: What kind of anomaly was detected
- **Severity**: Urgency level (Critical/High/Medium/Low)
- **Metric**: Which metric triggered the alert
- **Current Value**: Actual metric value
- **Expected Value**: Baseline metric value
- **Deviation**: Difference from baseline
- **Deviation %**: Percentage change from baseline
- **Timestamp**: When the anomaly was detected

### Recommended Actions

Each anomaly type has recommended actions:

**Success Rate Drop**:
- Check job logs for error patterns
- Review recent code changes
- Verify external service connectivity
- Increase job retry attempts

**Duration Spike**:
- Check system resource usage (CPU, memory)
- Review database query performance
- Check for network latency issues
- Verify external service response times

**Error Rate Increase**:
- Review error logs for common error codes
- Check external service status
- Verify database connectivity
- Review recent configuration changes

**Queue Buildup**:
- Increase job queue concurrency
- Check for stuck/hanging jobs
- Verify job handler performance
- Monitor system resources

**Throughput Drop**:
- Check job handler performance
- Verify queue concurrency settings
- Review system resource usage
- Check for network bottlenecks

## API Reference

### tRPC Procedures

#### `anomalyDetection.detectAllAnomalies`
Detects all types of anomalies

```typescript
const result = await trpc.anomalyDetection.detectAllAnomalies.useQuery({
  successRateThreshold: 0.95,
  durationSpikeThreshold: 0.5,
  errorRateThreshold: 0.05,
});

// Returns:
{
  alerts: AnomalyAlert[],
  count: number,
  criticalCount: number,
  highCount: number,
}
```

#### `anomalyDetection.detectSuccessRateAnomaly`
Detects success rate anomalies

```typescript
const alert = await trpc.anomalyDetection.detectSuccessRateAnomaly.useQuery({
  threshold: 0.95,
});
```

#### `anomalyDetection.detectDurationSpikeAnomaly`
Detects duration spike anomalies

```typescript
const alert = await trpc.anomalyDetection.detectDurationSpikeAnomaly.useQuery({
  threshold: 0.5,
});
```

#### `anomalyDetection.detectErrorRateAnomaly`
Detects error rate anomalies

```typescript
const alert = await trpc.anomalyDetection.detectErrorRateAnomaly.useQuery({
  threshold: 0.05,
});
```

#### `anomalyDetection.getDefaultConfig`
Gets default configuration

```typescript
const config = await trpc.anomalyDetection.getDefaultConfig.useQuery();
```

## Statistical Methods

### Baseline Calculation

The system calculates baseline metrics from historical data:

```
Baseline = {
  mean: Average of all values
  stdDev: Standard deviation
  min: Minimum value
  max: Maximum value
  p25, p50, p75, p95: Percentiles
}
```

### Z-Score Calculation

Anomalies are detected using Z-score:

```
Z = (value - mean) / stdDev

If |Z| > threshold (default 2.5):
  → Anomaly detected
```

### Interpretation

- Z = 0: Value equals mean
- Z = 1: Value is 1 standard deviation from mean
- Z = 2.5: Value is 2.5 standard deviations from mean (~99% confidence)
- Z = 3: Value is 3 standard deviations from mean (~99.7% confidence)

## Best Practices

### 1. **Baseline Establishment**
- Allow 24-48 hours of data collection before enabling alerts
- Use longer baseline windows (24+ hours) for stable thresholds
- Recalculate baselines after major system changes

### 2. **Threshold Tuning**
- Start with default thresholds
- Monitor alert frequency for 1-2 weeks
- Adjust thresholds based on false positive rate
- Document threshold changes and reasons

### 3. **Alert Response**
- Establish alert response procedures
- Assign alert ownership to team members
- Track alert resolution times
- Review patterns in alert history

### 4. **Monitoring**
- Check anomaly dashboard daily
- Review alert trends weekly
- Adjust thresholds monthly based on patterns
- Archive resolved alerts for historical analysis

## Troubleshooting

### Too Many Alerts

**Problem**: Receiving too many low-priority alerts

**Solutions**:
1. Increase threshold values (make less sensitive)
2. Increase standard deviation multiplier
3. Filter dashboard to show only High/Critical alerts
4. Disable notifications for Low/Medium severity

### Missing Alerts

**Problem**: Not detecting expected anomalies

**Solutions**:
1. Decrease threshold values (make more sensitive)
2. Decrease standard deviation multiplier
3. Verify baseline has enough data (24+ hours)
4. Check if anomaly type is enabled in configuration

### Inaccurate Baselines

**Problem**: Baselines not reflecting actual system behavior

**Solutions**:
1. Increase baseline window to 48-72 hours
2. Exclude known anomalies from baseline calculation
3. Recalculate baseline after major system changes
4. Review baseline metrics in dashboard

## Testing

Run comprehensive tests:

```bash
pnpm test server/anomaly-detection.test.ts
```

Tests cover:
- Baseline calculation
- Z-score calculation
- Anomaly detection
- Alert formatting
- Notification deduplication
- Priority sorting

## Performance Considerations

- **Memory**: Stores baseline metrics in memory (minimal overhead)
- **CPU**: Statistical calculations are lightweight
- **Database**: Queries job execution logs (indexed by date)
- **Network**: Webhook notifications are asynchronous

## Future Enhancements

1. **Machine Learning**: Use ML models for better anomaly detection
2. **Predictive Alerts**: Predict anomalies before they occur
3. **Custom Rules**: Allow users to define custom anomaly rules
4. **Alert Escalation**: Automatic escalation for unacknowledged alerts
5. **Correlation Analysis**: Detect correlated anomalies across metrics
6. **Seasonal Adjustment**: Account for seasonal patterns in data

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review alert logs and recommendations
3. Contact the system administrator
4. File a bug report with alert details and configuration

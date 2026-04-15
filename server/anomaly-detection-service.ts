import { db } from "./db";
import { jobExecutionLogs } from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Anomaly Detection Service
 * Detects unusual patterns in job metrics using statistical analysis
 */

export interface AnomalyAlert {
  id: string;
  type: "success_rate_drop" | "duration_spike" | "error_rate_increase" | "queue_buildup" | "throughput_drop";
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  deviationPercent: number;
  threshold: number;
  message: string;
  detectedAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

export interface MetricsBaseline {
  metric: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  dataPoints: number;
  lastUpdated: Date;
}

export interface AnomalyConfig {
  successRateThreshold: number; // Alert if success rate drops below this %
  durationSpikeThreshold: number; // Alert if avg duration increases by this %
  errorRateThreshold: number; // Alert if error rate exceeds this %
  queueDepthThreshold: number; // Alert if queue depth exceeds this
  throughputDropThreshold: number; // Alert if throughput drops by this %
  stdDevMultiplier: number; // Number of standard deviations for anomaly detection
  baselineWindowHours: number; // Hours to use for baseline calculation
  checkIntervalMinutes: number; // How often to check for anomalies
}

const defaultConfig: AnomalyConfig = {
  successRateThreshold: 0.95, // 95%
  durationSpikeThreshold: 0.5, // 50% increase
  errorRateThreshold: 0.05, // 5%
  queueDepthThreshold: 1000,
  throughputDropThreshold: 0.3, // 30% drop
  stdDevMultiplier: 2.5, // 2.5 standard deviations
  baselineWindowHours: 24,
  checkIntervalMinutes: 5,
};

/**
 * Calculate statistical metrics from data
 */
export function calculateBaseline(values: number[]): Omit<MetricsBaseline, "metric" | "lastUpdated"> {
  if (values.length === 0) {
    return {
      mean: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p95: 0,
      dataPoints: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };

  return {
    mean,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p25: getPercentile(25),
    p50: getPercentile(50),
    p75: getPercentile(75),
    p95: getPercentile(95),
    dataPoints: values.length,
  };
}

/**
 * Detect if value is anomalous based on baseline
 */
export function isAnomaly(value: number, baseline: MetricsBaseline, multiplier: number = 2.5): boolean {
  const zScore = Math.abs((value - baseline.mean) / (baseline.stdDev || 1));
  return zScore > multiplier;
}

/**
 * Calculate Z-score for a value
 */
export function calculateZScore(value: number, baseline: MetricsBaseline): number {
  if (baseline.stdDev === 0) return 0;
  return (value - baseline.mean) / baseline.stdDev;
}

/**
 * Get recent job metrics for anomaly detection
 */
export async function getRecentMetrics(hoursBack: number = 24) {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  if (!db) throw new Error("Database not initialized");

  const logs = await db
    .select({
      id: jobExecutionLogs.id,
      status: jobExecutionLogs.status,
      duration: jobExecutionLogs.duration,
      queue: jobExecutionLogs.queue,
      createdAt: jobExecutionLogs.createdAt,
    })
    .from(jobExecutionLogs)
    .where(sql`${jobExecutionLogs.createdAt} > ${cutoffTime}`)
    .orderBy(jobExecutionLogs.createdAt);

  return logs;
}

/**
 * Calculate success rate anomaly
 */
export async function detectSuccessRateAnomaly(
  config: AnomalyConfig = defaultConfig
): Promise<AnomalyAlert | null> {
  const metrics = await getRecentMetrics(config.baselineWindowHours);

  if (metrics.length === 0) return null;

  const totalJobs = metrics.length;
  const successfulJobs = metrics.filter((m) => m.status === "completed").length;
  const currentSuccessRate = successfulJobs / totalJobs;

  // Compare to baseline (last 48 hours)
  const baselineMetrics = await getRecentMetrics(config.baselineWindowHours * 2);
  const baselineSuccessful = baselineMetrics.filter((m) => m.status === "completed").length;
  const baselineSuccessRate = baselineMetrics.length > 0 ? baselineSuccessful / baselineMetrics.length : 1;

  if (currentSuccessRate < config.successRateThreshold && currentSuccessRate < baselineSuccessRate * 0.9) {
    return {
      id: `anomaly-${Date.now()}`,
      type: "success_rate_drop",
      severity: currentSuccessRate < 0.8 ? "critical" : currentSuccessRate < 0.9 ? "high" : "medium",
      metric: "success_rate",
      currentValue: currentSuccessRate * 100,
      expectedValue: baselineSuccessRate * 100,
      deviation: (currentSuccessRate - baselineSuccessRate) * 100,
      deviationPercent: ((currentSuccessRate - baselineSuccessRate) / baselineSuccessRate) * 100,
      threshold: config.successRateThreshold * 100,
      message: `Success rate dropped to ${(currentSuccessRate * 100).toFixed(1)}% (expected ~${(baselineSuccessRate * 100).toFixed(1)}%)`,
      detectedAt: new Date(),
      isResolved: false,
    };
  }

  return null;
}

/**
 * Calculate duration spike anomaly
 */
export async function detectDurationSpikeAnomaly(
  config: AnomalyConfig = defaultConfig
): Promise<AnomalyAlert | null> {
  const metrics = await getRecentMetrics(config.baselineWindowHours);
  const completedJobs = metrics.filter((m) => m.status === "completed" && m.duration);

  if (completedJobs.length === 0) return null;

  const durations = completedJobs.map((m) => m.duration || 0);
  const currentAvgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // Get baseline from previous period
  const baselineMetrics = await getRecentMetrics(config.baselineWindowHours * 2);
  const baselineCompleted = baselineMetrics.filter((m) => m.status === "completed" && m.duration);
  const baselineDurations = baselineCompleted.map((m) => m.duration || 0);
  const baselineAvgDuration = baselineDurations.reduce((a, b) => a + b, 0) / (baselineDurations.length || 1);

  const durationIncrease = (currentAvgDuration - baselineAvgDuration) / baselineAvgDuration;

  if (durationIncrease > config.durationSpikeThreshold) {
    return {
      id: `anomaly-${Date.now()}`,
      type: "duration_spike",
      severity: durationIncrease > 1 ? "critical" : durationIncrease > 0.75 ? "high" : "medium",
      metric: "avg_duration",
      currentValue: currentAvgDuration,
      expectedValue: baselineAvgDuration,
      deviation: currentAvgDuration - baselineAvgDuration,
      deviationPercent: durationIncrease * 100,
      threshold: (config.durationSpikeThreshold * 100),
      message: `Average job duration spiked to ${currentAvgDuration.toFixed(0)}ms (expected ~${baselineAvgDuration.toFixed(0)}ms, +${(durationIncrease * 100).toFixed(1)}%)`,
      detectedAt: new Date(),
      isResolved: false,
    };
  }

  return null;
}

/**
 * Calculate error rate anomaly
 */
export async function detectErrorRateAnomaly(
  config: AnomalyConfig = defaultConfig
): Promise<AnomalyAlert | null> {
  const metrics = await getRecentMetrics(config.baselineWindowHours);

  if (metrics.length === 0) return null;

  const totalJobs = metrics.length;
  const failedJobs = metrics.filter((m) => m.status === "failed").length;
  const currentErrorRate = failedJobs / totalJobs;

  // Compare to baseline
  const baselineMetrics = await getRecentMetrics(config.baselineWindowHours * 2);
  const baselineFailedJobs = baselineMetrics.filter((m) => m.status === "failed").length;
  const baselineErrorRate = baselineMetrics.length > 0 ? baselineFailedJobs / baselineMetrics.length : 0;

  if (currentErrorRate > config.errorRateThreshold) {
    return {
      id: `anomaly-${Date.now()}`,
      type: "error_rate_increase",
      severity: currentErrorRate > 0.1 ? "critical" : currentErrorRate > 0.075 ? "high" : "medium",
      metric: "error_rate",
      currentValue: currentErrorRate * 100,
      expectedValue: baselineErrorRate * 100,
      deviation: (currentErrorRate - baselineErrorRate) * 100,
      deviationPercent: baselineErrorRate > 0 ? ((currentErrorRate - baselineErrorRate) / baselineErrorRate) * 100 : 100,
      threshold: config.errorRateThreshold * 100,
      message: `Error rate increased to ${(currentErrorRate * 100).toFixed(1)}% (threshold: ${(config.errorRateThreshold * 100).toFixed(1)}%)`,
      detectedAt: new Date(),
      isResolved: false,
    };
  }

  return null;
}

/**
 * Detect all anomalies
 */
export async function detectAllAnomalies(config: AnomalyConfig = defaultConfig): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];

  const successRateAnomaly = await detectSuccessRateAnomaly(config);
  if (successRateAnomaly) alerts.push(successRateAnomaly);

  const durationAnomaly = await detectDurationSpikeAnomaly(config);
  if (durationAnomaly) alerts.push(durationAnomaly);

  const errorRateAnomaly = await detectErrorRateAnomaly(config);
  if (errorRateAnomaly) alerts.push(errorRateAnomaly);

  return alerts;
}

/**
 * Format anomaly alert for notification
 */
export function formatAnomalyAlert(alert: AnomalyAlert): string {
  const severityEmoji = {
    low: "⚠️",
    medium: "⚠️⚠️",
    high: "🔴",
    critical: "🚨",
  };

  return `${severityEmoji[alert.severity]} ${alert.type.replace(/_/g, " ").toUpperCase()}\n${alert.message}`;
}

/**
 * Get anomaly detection configuration
 */
export function getDefaultConfig(): AnomalyConfig {
  return defaultConfig;
}

/**
 * Update anomaly detection configuration
 */
export function updateConfig(updates: Partial<AnomalyConfig>): AnomalyConfig {
  return { ...defaultConfig, ...updates };
}

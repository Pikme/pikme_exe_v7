import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  detectAllAnomalies,
  detectSuccessRateAnomaly,
  detectDurationSpikeAnomaly,
  detectErrorRateAnomaly,
  formatAnomalyAlert,
  getDefaultConfig,
  updateConfig,
  type AnomalyAlert,
  type AnomalyConfig,
} from "../anomaly-detection-service";

/**
 * Anomaly Detection Router
 * Procedures for detecting and managing anomalies
 */

export const anomalyDetectionRouter = router({
  /**
   * Detect all anomalies
   */
  detectAllAnomalies: protectedProcedure
    .input(
      z.object({
        successRateThreshold: z.number().optional(),
        durationSpikeThreshold: z.number().optional(),
        errorRateThreshold: z.number().optional(),
        queueDepthThreshold: z.number().optional(),
        throughputDropThreshold: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const config = updateConfig({
        successRateThreshold: input.successRateThreshold,
        durationSpikeThreshold: input.durationSpikeThreshold,
        errorRateThreshold: input.errorRateThreshold,
        queueDepthThreshold: input.queueDepthThreshold,
        throughputDropThreshold: input.throughputDropThreshold,
      });

      const alerts = await detectAllAnomalies(config);
      return {
        alerts,
        count: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === "critical").length,
        highCount: alerts.filter((a) => a.severity === "high").length,
      };
    }),

  /**
   * Detect success rate anomaly
   */
  detectSuccessRateAnomaly: protectedProcedure
    .input(
      z.object({
        threshold: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const config = updateConfig({
        successRateThreshold: input.threshold,
      });

      const alert = await detectSuccessRateAnomaly(config);
      return alert;
    }),

  /**
   * Detect duration spike anomaly
   */
  detectDurationSpikeAnomaly: protectedProcedure
    .input(
      z.object({
        threshold: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const config = updateConfig({
        durationSpikeThreshold: input.threshold,
      });

      const alert = await detectDurationSpikeAnomaly(config);
      return alert;
    }),

  /**
   * Detect error rate anomaly
   */
  detectErrorRateAnomaly: protectedProcedure
    .input(
      z.object({
        threshold: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const config = updateConfig({
        errorRateThreshold: input.threshold,
      });

      const alert = await detectErrorRateAnomaly(config);
      return alert;
    }),

  /**
   * Get default anomaly detection config
   */
  getDefaultConfig: protectedProcedure.query(() => {
    return getDefaultConfig();
  }),

  /**
   * Format anomaly alert for display
   */
  formatAlert: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "success_rate_drop",
          "duration_spike",
          "error_rate_increase",
          "queue_buildup",
          "throughput_drop",
        ]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        metric: z.string(),
        currentValue: z.number(),
        expectedValue: z.number(),
        deviation: z.number(),
        deviationPercent: z.number(),
        threshold: z.number(),
        message: z.string(),
      })
    )
    .query(({ input }) => {
      const alert: AnomalyAlert = {
        id: `anomaly-${Date.now()}`,
        type: input.type,
        severity: input.severity,
        metric: input.metric,
        currentValue: input.currentValue,
        expectedValue: input.expectedValue,
        deviation: input.deviation,
        deviationPercent: input.deviationPercent,
        threshold: input.threshold,
        message: input.message,
        detectedAt: new Date(),
        isResolved: false,
      };

      return formatAnomalyAlert(alert);
    }),

  /**
   * Get anomaly severity badge
   */
  getSeverityBadge: protectedProcedure
    .input(
      z.object({
        severity: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .query(({ input }) => {
      const badges = {
        low: { color: "yellow", icon: "⚠️", label: "Low" },
        medium: { color: "orange", icon: "⚠️⚠️", label: "Medium" },
        high: { color: "red", icon: "🔴", label: "High" },
        critical: { color: "darkred", icon: "🚨", label: "Critical" },
      };

      return badges[input.severity];
    }),

  /**
   * Get anomaly type description
   */
  getAnomalyTypeDescription: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "success_rate_drop",
          "duration_spike",
          "error_rate_increase",
          "queue_buildup",
          "throughput_drop",
        ]),
      })
    )
    .query(({ input }) => {
      const descriptions = {
        success_rate_drop: "Job success rate has dropped below expected threshold",
        duration_spike: "Average job processing time has increased significantly",
        error_rate_increase: "Error rate has exceeded acceptable threshold",
        queue_buildup: "Job queue depth has grown unexpectedly",
        throughput_drop: "Job processing throughput has decreased",
      };

      return descriptions[input.type];
    }),

  /**
   * Get recommended actions for anomaly
   */
  getRecommendedActions: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "success_rate_drop",
          "duration_spike",
          "error_rate_increase",
          "queue_buildup",
          "throughput_drop",
        ]),
      })
    )
    .query(({ input }) => {
      const actions = {
        success_rate_drop: [
          "Check job logs for error patterns",
          "Review recent code changes",
          "Verify external service connectivity",
          "Increase job retry attempts",
        ],
        duration_spike: [
          "Check system resource usage (CPU, memory)",
          "Review database query performance",
          "Check for network latency issues",
          "Verify external service response times",
        ],
        error_rate_increase: [
          "Review error logs for common error codes",
          "Check external service status",
          "Verify database connectivity",
          "Review recent configuration changes",
        ],
        queue_buildup: [
          "Increase job queue concurrency",
          "Check for stuck/hanging jobs",
          "Verify job handler performance",
          "Monitor system resources",
        ],
        throughput_drop: [
          "Check job handler performance",
          "Verify queue concurrency settings",
          "Review system resource usage",
          "Check for network bottlenecks",
        ],
      };

      return actions[input.type];
    }),
});

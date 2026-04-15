import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateBaseline,
  isAnomaly,
  calculateZScore,
  formatAnomalyAlert,
  getDefaultConfig,
  updateConfig,
  type AnomalyAlert,
  type MetricsBaseline,
} from "./anomaly-detection-service";
import {
  formatAlertForEmail,
  shouldSendAlert,
  deduplicateAlerts,
  getAlertPriority,
  sortAlertsByPriority,
} from "./alert-notification-service";

describe("Anomaly Detection Service", () => {
  describe("calculateBaseline", () => {
    it("should calculate baseline metrics from values", () => {
      const values = [10, 20, 30, 40, 50];
      const baseline = calculateBaseline(values);

      expect(baseline.mean).toBe(30);
      expect(baseline.min).toBe(10);
      expect(baseline.max).toBe(50);
      expect(baseline.dataPoints).toBe(5);
    });

    it("should handle empty array", () => {
      const baseline = calculateBaseline([]);

      expect(baseline.mean).toBe(0);
      expect(baseline.stdDev).toBe(0);
      expect(baseline.dataPoints).toBe(0);
    });

    it("should calculate percentiles correctly", () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      const baseline = calculateBaseline(values);

      expect(baseline.p25).toBeGreaterThan(0);
      expect(baseline.p50).toBeGreaterThan(baseline.p25);
      expect(baseline.p75).toBeGreaterThan(baseline.p50);
      expect(baseline.p95).toBeGreaterThan(baseline.p75);
    });

    it("should calculate standard deviation", () => {
      const values = [1, 2, 3, 4, 5];
      const baseline = calculateBaseline(values);

      expect(baseline.stdDev).toBeGreaterThan(0);
      expect(baseline.stdDev).toBeLessThan(10);
    });
  });

  describe("isAnomaly", () => {
    let baseline: MetricsBaseline;

    beforeEach(() => {
      baseline = {
        metric: "test",
        mean: 100,
        stdDev: 10,
        min: 80,
        max: 120,
        p25: 90,
        p50: 100,
        p75: 110,
        p95: 115,
        dataPoints: 100,
        lastUpdated: new Date(),
      };
    });

    it("should detect anomaly when value is far from mean", () => {
      const anomalous = isAnomaly(150, baseline, 2.5);
      expect(anomalous).toBe(true);
    });

    it("should not detect anomaly for normal values", () => {
      const normal = isAnomaly(105, baseline, 2.5);
      expect(normal).toBe(false);
    });

    it("should respect multiplier parameter", () => {
      const value = 130; // 3 standard deviations away
      expect(isAnomaly(value, baseline, 2)).toBe(true);
      expect(isAnomaly(value, baseline, 4)).toBe(false);
    });
  });

  describe("calculateZScore", () => {
    let baseline: MetricsBaseline;

    beforeEach(() => {
      baseline = {
        metric: "test",
        mean: 100,
        stdDev: 10,
        min: 80,
        max: 120,
        p25: 90,
        p50: 100,
        p75: 110,
        p95: 115,
        dataPoints: 100,
        lastUpdated: new Date(),
      };
    });

    it("should calculate Z-score correctly", () => {
      const zScore = calculateZScore(110, baseline);
      expect(zScore).toBe(1);
    });

    it("should handle zero standard deviation", () => {
      const zeroStdDevBaseline = { ...baseline, stdDev: 0 };
      const zScore = calculateZScore(110, zeroStdDevBaseline);
      expect(zScore).toBe(0);
    });

    it("should calculate negative Z-scores", () => {
      const zScore = calculateZScore(90, baseline);
      expect(zScore).toBe(-1);
    });
  });

  describe("formatAnomalyAlert", () => {
    it("should format alert with correct severity emoji", () => {
      const alert: AnomalyAlert = {
        id: "test-1",
        type: "success_rate_drop",
        severity: "critical",
        metric: "success_rate",
        currentValue: 80,
        expectedValue: 95,
        deviation: -15,
        deviationPercent: -15.8,
        threshold: 95,
        message: "Success rate dropped to 80%",
        detectedAt: new Date(),
        isResolved: false,
      };

      const formatted = formatAnomalyAlert(alert);
      expect(formatted).toContain("SUCCESS_RATE_DROP");
      expect(formatted).toContain("Success rate dropped to 80%");
    });

    it("should include severity in formatted message", () => {
      const alert: AnomalyAlert = {
        id: "test-1",
        type: "error_rate_increase",
        severity: "high",
        metric: "error_rate",
        currentValue: 8,
        expectedValue: 2,
        deviation: 6,
        deviationPercent: 300,
        threshold: 5,
        message: "Error rate increased",
        detectedAt: new Date(),
        isResolved: false,
      };

      const formatted = formatAnomalyAlert(alert);
      expect(formatted).toContain("ERROR_RATE_INCREASE");
    });
  });

  describe("Configuration", () => {
    it("should return default config", () => {
      const config = getDefaultConfig();

      expect(config.successRateThreshold).toBe(0.95);
      expect(config.errorRateThreshold).toBe(0.05);
      expect(config.stdDevMultiplier).toBe(2.5);
    });

    it("should update config with partial updates", () => {
      const config = updateConfig({
        successRateThreshold: 0.9,
        errorRateThreshold: 0.1,
      });

      expect(config.successRateThreshold).toBe(0.9);
      expect(config.errorRateThreshold).toBe(0.1);
      expect(config.stdDevMultiplier).toBe(2.5); // Unchanged
    });
  });
});

describe("Alert Notification Service", () => {
  describe("formatAlertForEmail", () => {
    it("should format alert as HTML email", () => {
      const alert: AnomalyAlert = {
        id: "test-1",
        type: "duration_spike",
        severity: "high",
        metric: "avg_duration",
        currentValue: 5000,
        expectedValue: 2000,
        deviation: 3000,
        deviationPercent: 150,
        threshold: 3000,
        message: "Average job duration spiked",
        detectedAt: new Date(),
        isResolved: false,
      };

      const html = formatAlertForEmail(alert);

      expect(html).toContain("<div");
      expect(html).toContain("DURATION_SPIKE");
      expect(html).toContain("5000");
      expect(html).toContain("2000");
    });

    it("should include severity color in email", () => {
      const criticalAlert: AnomalyAlert = {
        id: "test-1",
        type: "success_rate_drop",
        severity: "critical",
        metric: "success_rate",
        currentValue: 50,
        expectedValue: 95,
        deviation: -45,
        deviationPercent: -47.4,
        threshold: 95,
        message: "Critical success rate drop",
        detectedAt: new Date(),
        isResolved: false,
      };

      const html = formatAlertForEmail(criticalAlert);
      expect(html).toContain("8B0000"); // Dark red color for critical
    });
  });

  describe("shouldSendAlert", () => {
    const alert: AnomalyAlert = {
      id: "test-1",
      type: "success_rate_drop",
      severity: "high",
      metric: "success_rate",
      currentValue: 80,
      expectedValue: 95,
      deviation: -15,
      deviationPercent: -15.8,
      threshold: 95,
      message: "Success rate dropped",
      detectedAt: new Date(),
      isResolved: false,
    };

    it("should send alert when severity meets threshold", () => {
      expect(shouldSendAlert(alert, "low")).toBe(true);
      expect(shouldSendAlert(alert, "medium")).toBe(true);
      expect(shouldSendAlert(alert, "high")).toBe(true);
    });

    it("should not send alert when severity is below threshold", () => {
      expect(shouldSendAlert(alert, "critical")).toBe(false);
    });
  });

  describe("deduplicateAlerts", () => {
    it("should remove duplicate alerts within time window", () => {
      const now = new Date();
      const alerts: AnomalyAlert[] = [
        {
          id: "1",
          type: "success_rate_drop",
          severity: "high",
          metric: "success_rate",
          currentValue: 80,
          expectedValue: 95,
          deviation: -15,
          deviationPercent: -15.8,
          threshold: 95,
          message: "Drop 1",
          detectedAt: now,
          isResolved: false,
        },
        {
          id: "2",
          type: "success_rate_drop",
          severity: "high",
          metric: "success_rate",
          currentValue: 75,
          expectedValue: 95,
          deviation: -20,
          deviationPercent: -21.1,
          threshold: 95,
          message: "Drop 2",
          detectedAt: new Date(now.getTime() + 1000),
          isResolved: false,
        },
      ];

      const deduped = deduplicateAlerts(alerts, 5);
      expect(deduped.length).toBe(1);
    });

    it("should keep alerts outside time window", () => {
      const now = new Date();
      const alerts: AnomalyAlert[] = [
        {
          id: "1",
          type: "success_rate_drop",
          severity: "high",
          metric: "success_rate",
          currentValue: 80,
          expectedValue: 95,
          deviation: -15,
          deviationPercent: -15.8,
          threshold: 95,
          message: "Drop 1",
          detectedAt: now,
          isResolved: false,
        },
        {
          id: "2",
          type: "success_rate_drop",
          severity: "high",
          metric: "success_rate",
          currentValue: 75,
          expectedValue: 95,
          deviation: -20,
          deviationPercent: -21.1,
          threshold: 95,
          message: "Drop 2",
          detectedAt: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes later
          isResolved: false,
        },
      ];

      const deduped = deduplicateAlerts(alerts, 5); // 5 minute window
      expect(deduped.length).toBe(2);
    });
  });

  describe("getAlertPriority", () => {
    it("should assign higher priority to critical alerts", () => {
      const criticalAlert: AnomalyAlert = {
        id: "1",
        type: "success_rate_drop",
        severity: "critical",
        metric: "success_rate",
        currentValue: 50,
        expectedValue: 95,
        deviation: -45,
        deviationPercent: -47.4,
        threshold: 95,
        message: "Critical drop",
        detectedAt: new Date(),
        isResolved: false,
      };

      const lowAlert: AnomalyAlert = {
        id: "2",
        type: "throughput_drop",
        severity: "low",
        metric: "throughput",
        currentValue: 90,
        expectedValue: 100,
        deviation: -10,
        deviationPercent: -10,
        threshold: 70,
        message: "Low drop",
        detectedAt: new Date(),
        isResolved: false,
      };

      expect(getAlertPriority(criticalAlert)).toBeGreaterThan(getAlertPriority(lowAlert));
    });

    it("should assign higher priority to success_rate_drop", () => {
      const successRateDrop: AnomalyAlert = {
        id: "1",
        type: "success_rate_drop",
        severity: "medium",
        metric: "success_rate",
        currentValue: 80,
        expectedValue: 95,
        deviation: -15,
        deviationPercent: -15.8,
        threshold: 95,
        message: "Drop",
        detectedAt: new Date(),
        isResolved: false,
      };

      const throughputDrop: AnomalyAlert = {
        id: "2",
        type: "throughput_drop",
        severity: "medium",
        metric: "throughput",
        currentValue: 90,
        expectedValue: 100,
        deviation: -10,
        deviationPercent: -10,
        threshold: 70,
        message: "Drop",
        detectedAt: new Date(),
        isResolved: false,
      };

      expect(getAlertPriority(successRateDrop)).toBeGreaterThan(getAlertPriority(throughputDrop));
    });
  });

  describe("sortAlertsByPriority", () => {
    it("should sort alerts by priority descending", () => {
      const alerts: AnomalyAlert[] = [
        {
          id: "1",
          type: "throughput_drop",
          severity: "low",
          metric: "throughput",
          currentValue: 90,
          expectedValue: 100,
          deviation: -10,
          deviationPercent: -10,
          threshold: 70,
          message: "Low priority",
          detectedAt: new Date(),
          isResolved: false,
        },
        {
          id: "2",
          type: "success_rate_drop",
          severity: "critical",
          metric: "success_rate",
          currentValue: 50,
          expectedValue: 95,
          deviation: -45,
          deviationPercent: -47.4,
          threshold: 95,
          message: "Critical priority",
          detectedAt: new Date(),
          isResolved: false,
        },
      ];

      const sorted = sortAlertsByPriority(alerts);
      expect(sorted[0].severity).toBe("critical");
      expect(sorted[1].severity).toBe("low");
    });
  });
});

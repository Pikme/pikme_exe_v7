import { describe, it, expect } from "vitest";
import {
  calculateChiSquare,
  calculateRequiredSampleSize,
  calculateConfidenceInterval,
  analyzeMultipleVariants,
} from "./services/statistical-analysis";
import type { ExperimentMetrics } from "./services/statistical-analysis";

describe("Statistical Analysis", () => {
  describe("calculateChiSquare", () => {
    it("should detect significant difference with sufficient samples", () => {
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 1000,
        conversions: 100,
        clicks: 500,
        impressions: 1000,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 1000,
        conversions: 150, // 50% improvement
        clicks: 600,
        impressions: 1000,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("treatment");
      expect(result.pValue).toBeLessThan(0.05);
    });

    it("should not detect significance with insufficient samples", () => {
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 50,
        conversions: 5,
        clicks: 25,
        impressions: 50,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 50,
        conversions: 7,
        clicks: 30,
        impressions: 50,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.isSignificant).toBe(false);
      expect(result.winner).toBeUndefined();
    });

    it("should identify control as winner when it performs better", () => {
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 1000,
        conversions: 150,
        clicks: 600,
        impressions: 1000,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 1000,
        conversions: 100, // Worse than control
        clicks: 500,
        impressions: 1000,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.isSignificant).toBe(true);
      expect(result.winner).toBe("control");
    });

    it("should calculate effect size correctly", () => {
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 1000,
        conversions: 100,
        clicks: 500,
        impressions: 1000,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 1000,
        conversions: 150,
        clicks: 600,
        impressions: 1000,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.effectSize).toBeGreaterThan(0);
      expect(result.effectSize).toBeLessThan(1); // Cohen's h is typically < 1
    });
  });

  describe("calculateRequiredSampleSize", () => {
    it("should calculate sample size for given conversion rates", () => {
      const controlRate = 0.1; // 10%
      const treatmentRate = 0.12; // 12%

      const sampleSize = calculateRequiredSampleSize(controlRate, treatmentRate);

      expect(sampleSize).toBeGreaterThan(0);
      expect(sampleSize).toBeLessThan(100000); // Reasonable upper bound
    });

    it("should require more samples for smaller effect sizes", () => {
      const smallEffect = calculateRequiredSampleSize(0.1, 0.101); // 0.1% improvement
      const largeEffect = calculateRequiredSampleSize(0.1, 0.15); // 5% improvement

      expect(smallEffect).toBeGreaterThan(largeEffect);
    });

    it("should handle edge cases", () => {
      // Same conversion rates
      const sampleSize1 = calculateRequiredSampleSize(0.1, 0.1);
      expect(sampleSize1).toBeGreaterThan(0);

      // Very small rates
      const sampleSize2 = calculateRequiredSampleSize(0.01, 0.02);
      expect(sampleSize2).toBeGreaterThan(0);
    });
  });

  describe("calculateConfidenceInterval", () => {
    it("should calculate confidence interval for conversion rate", () => {
      const conversions = 100;
      const sampleSize = 1000;

      const interval = calculateConfidenceInterval(conversions, sampleSize);

      expect(interval.rate).toBe(0.1);
      expect(interval.lower).toBeLessThan(interval.rate);
      expect(interval.upper).toBeGreaterThan(interval.rate);
      expect(interval.lower).toBeGreaterThanOrEqual(0);
      expect(interval.upper).toBeLessThanOrEqual(1);
    });

    it("should have wider intervals for smaller samples", () => {
      const largeInterval = calculateConfidenceInterval(100, 1000);
      const smallInterval = calculateConfidenceInterval(10, 100);

      const largeWidth = largeInterval.upper - largeInterval.lower;
      const smallWidth = smallInterval.upper - smallInterval.lower;

      expect(smallWidth).toBeGreaterThan(largeWidth);
    });

    it("should support different confidence levels", () => {
      const ci95 = calculateConfidenceInterval(100, 1000, 0.95);
      const ci99 = calculateConfidenceInterval(100, 1000, 0.99);

      const width95 = ci95.upper - ci95.lower;
      const width99 = ci99.upper - ci99.lower;

      expect(width99).toBeGreaterThan(width95);
    });
  });

  describe("analyzeMultipleVariants", () => {
    it("should identify best variant among multiple", () => {
      const variants: ExperimentMetrics[] = [
        {
          variantName: "control",
          sampleSize: 1000,
          conversions: 100,
          clicks: 500,
          impressions: 1000,
        },
        {
          variantName: "variant_a",
          sampleSize: 1000,
          conversions: 120,
          clicks: 550,
          impressions: 1000,
        },
        {
          variantName: "variant_b",
          sampleSize: 1000,
          conversions: 110,
          clicks: 520,
          impressions: 1000,
        },
      ];

      const result = analyzeMultipleVariants(variants);

      expect(result.bestVariant).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });

    it("should handle single variant", () => {
      const variants: ExperimentMetrics[] = [
        {
          variantName: "control",
          sampleSize: 1000,
          conversions: 100,
          clicks: 500,
          impressions: 1000,
        },
      ];

      const result = analyzeMultipleVariants(variants);

      expect(result.bestVariant).toBe("control");
      expect(result.isSignificant).toBe(false);
    });

    it("should handle empty variants", () => {
      const result = analyzeMultipleVariants([]);

      expect(result.recommendation).toContain("at least 2 variants");
    });
  });

  describe("Statistical Significance Thresholds", () => {
    it("should correctly identify p-value thresholds", () => {
      // Test with chi-square values at known thresholds
      // χ² = 3.841 corresponds to p = 0.05 (95% confidence)
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 1000,
        conversions: 100,
        clicks: 500,
        impressions: 1000,
      };

      // Create treatment that should be just barely significant
      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 1000,
        conversions: 130, // Approximately 30% improvement
        clicks: 550,
        impressions: 1000,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.pValue).toBeLessThan(0.05);
      expect(result.isSignificant).toBe(true);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle typical e-commerce conversion rates", () => {
      // Typical e-commerce: 2-3% conversion rate
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 5000,
        conversions: 100, // 2%
        clicks: 2500,
        impressions: 5000,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 5000,
        conversions: 130, // 2.6%
        clicks: 2750,
        impressions: 5000,
      };

      const result = calculateChiSquare(control, treatment);

      expect(result.recommendation).toBeDefined();
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
    });

    it("should handle high-volume traffic scenarios", () => {
      const control: ExperimentMetrics = {
        variantName: "control",
        sampleSize: 100000,
        conversions: 1000,
        clicks: 50000,
        impressions: 100000,
      };

      const treatment: ExperimentMetrics = {
        variantName: "treatment",
        sampleSize: 100000,
        conversions: 1050, // 0.5% improvement
        clicks: 52000,
        impressions: 100000,
      };

      const result = calculateChiSquare(control, treatment);

      // With large samples, even small improvements become significant
      expect(result.isSignificant).toBe(true);
    });
  });
});

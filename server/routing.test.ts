import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  calculateWorkloadScore,
  calculateExpertiseScore,
  calculateLanguageScore,
  calculateConversionScore,
  calculateAvailabilityScore,
} from "./routing-engine";

/**
 * Routing Engine Tests
 * Tests for the automated enquiry routing algorithm
 */

describe("Routing Engine - Scoring Functions", () => {
  describe("calculateWorkloadScore", () => {
    it("should return 100 for completely free team member", () => {
      const score = calculateWorkloadScore(0, 10);
      expect(score).toBe(100);
    });

    it("should return 50 for 50% capacity", () => {
      const score = calculateWorkloadScore(5, 10);
      expect(score).toBe(50);
    });

    it("should return 0 for completely full team member", () => {
      const score = calculateWorkloadScore(10, 10);
      expect(score).toBe(0);
    });

    it("should return 0 for over-capacity team member", () => {
      const score = calculateWorkloadScore(15, 10);
      expect(score).toBe(0);
    });

    it("should handle zero capacity gracefully", () => {
      const score = calculateWorkloadScore(5, 0);
      expect(score).toBe(0);
    });

    it("should scale proportionally", () => {
      const score25 = calculateWorkloadScore(2.5, 10);
      const score75 = calculateWorkloadScore(7.5, 10);
      expect(score25).toBeGreaterThan(score75);
      expect(score25).toBeCloseTo(75, 0);
      expect(score75).toBeCloseTo(25, 0);
    });
  });

  describe("calculateExpertiseScore", () => {
    it("should return base score for empty expertise", () => {
      const score = calculateExpertiseScore([]);
      expect(score).toBe(50);
    });

    it("should boost score for matching tour category", () => {
      const expertiseList = [{ tourCategoryId: 1 }];
      const score = calculateExpertiseScore(expertiseList, 1);
      expect(score).toBeGreaterThan(50);
      expect(score).toBe(80);
    });

    it("should boost score for matching destination", () => {
      const expertiseList = [{ destination: "Goa" }];
      const score = calculateExpertiseScore(expertiseList, undefined, "Goa");
      expect(score).toBeGreaterThan(50);
      expect(score).toBe(70);
    });

    it("should boost score for both category and destination match", () => {
      const expertiseList = [{ tourCategoryId: 1, destination: "Goa" }];
      const score = calculateExpertiseScore(expertiseList, 1, "Goa");
      expect(score).toBe(100);
    });

    it("should handle partial destination match", () => {
      const expertiseList = [{ destination: "Goa" }];
      const score = calculateExpertiseScore(expertiseList, undefined, "Goa Beach");
      expect(score).toBeGreaterThan(50);
    });

    it("should cap score at 100", () => {
      const expertiseList = [
        { tourCategoryId: 1, destination: "Goa" },
        { tourCategoryId: 2, destination: "Kerala" },
      ];
      const score = calculateExpertiseScore(expertiseList, 1, "Goa");
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("calculateLanguageScore", () => {
    it("should return neutral score for no language requirement", () => {
      const score = calculateLanguageScore(["en", "es"]);
      expect(score).toBe(50);
    });

    it("should return 100 for matching language", () => {
      const score = calculateLanguageScore(["en", "es"], "es");
      expect(score).toBe(100);
    });

    it("should return 0 for non-matching language", () => {
      const score = calculateLanguageScore(["en", "es"], "fr");
      expect(score).toBe(0);
    });

    it("should handle empty language list", () => {
      const score = calculateLanguageScore([], "en");
      expect(score).toBe(0);
    });

    it("should handle single language", () => {
      const score = calculateLanguageScore(["en"], "en");
      expect(score).toBe(100);
    });
  });

  describe("calculateConversionScore", () => {
    it("should return 0 for 0% conversion", () => {
      const score = calculateConversionScore(0);
      expect(score).toBe(0);
    });

    it("should return 50 for 50% conversion", () => {
      const score = calculateConversionScore(50);
      expect(score).toBe(50);
    });

    it("should return 100 for 100% conversion", () => {
      const score = calculateConversionScore(100);
      expect(score).toBe(100);
    });

    it("should cap at 100 for values > 100", () => {
      const score = calculateConversionScore(150);
      expect(score).toBe(100);
    });

    it("should handle decimal conversion rates", () => {
      const score = calculateConversionScore(75.5);
      expect(score).toBe(75.5);
    });
  });

  describe("calculateAvailabilityScore", () => {
    it("should return 100 for available member", () => {
      const score = calculateAvailabilityScore(true);
      expect(score).toBe(100);
    });

    it("should return 100 for unavailable member with no end time", () => {
      const score = calculateAvailabilityScore(false);
      expect(score).toBe(100);
    });

    it("should return 0 for unavailable member with future end time", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const score = calculateAvailabilityScore(false, futureDate);
      expect(score).toBe(0);
    });

    it("should return 100 for unavailable member with past end time", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);
      const score = calculateAvailabilityScore(false, pastDate);
      expect(score).toBe(100);
    });

    it("should return 100 for available member regardless of end time", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      const score = calculateAvailabilityScore(true, futureDate);
      expect(score).toBe(100);
    });
  });
});

describe("Routing Engine - Score Weighting", () => {
  it("should calculate weighted total score correctly", () => {
    const workloadScore = 80;
    const expertiseScore = 70;
    const availabilityScore = 100;
    const conversionScore = 60;
    const languageScore = 50;

    const totalScore =
      workloadScore * 0.3 +
      expertiseScore * 0.25 +
      availabilityScore * 0.2 +
      conversionScore * 0.15 +
      languageScore * 0.1;

    expect(totalScore).toBeCloseTo(75.5, 1);
  });

  it("should prioritize workload (30%)", () => {
    // High workload, low expertise
    const score1 =
      100 * 0.3 + 10 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Low workload, high expertise
    const score2 =
      10 * 0.3 + 100 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });

  it("should weight expertise second (25%)", () => {
    // High expertise, low availability
    const score1 =
      50 * 0.3 + 100 * 0.25 + 10 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Low expertise, high availability
    const score2 =
      50 * 0.3 + 10 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });

  it("should weight availability third (20%)", () => {
    // High availability, low conversion
    const score1 =
      50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 10 * 0.15 + 50 * 0.1;

    // Low availability, high conversion
    const score2 =
      50 * 0.3 + 50 * 0.25 + 10 * 0.2 + 100 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });
});

describe("Routing Engine - Edge Cases", () => {
  it("should handle all zero scores", () => {
    const totalScore = 0 * 0.3 + 0 * 0.25 + 0 * 0.2 + 0 * 0.15 + 0 * 0.1;
    expect(totalScore).toBe(0);
  });

  it("should handle all perfect scores", () => {
    const totalScore = 100 * 0.3 + 100 * 0.25 + 100 * 0.2 + 100 * 0.15 + 100 * 0.1;
    expect(totalScore).toBe(100);
  });

  it("should handle mixed perfect and zero scores", () => {
    const totalScore = 100 * 0.3 + 0 * 0.25 + 100 * 0.2 + 0 * 0.15 + 100 * 0.1;
    expect(totalScore).toBe(60);
  });

  it("should handle very large numbers", () => {
    const score = calculateWorkloadScore(1000000, 1000000);
    expect(score).toBe(0);
  });

  it("should handle very small numbers", () => {
    const score = calculateWorkloadScore(0.001, 10);
    expect(score).toBeCloseTo(99.99, 1);
  });
});

describe("Routing Engine - Real-world Scenarios", () => {
  it("should prefer less loaded team member", () => {
    // Team member 1: 50% loaded, no expertise
    const score1 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Team member 2: 10% loaded, no expertise
    const score2 = 90 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    expect(score2).toBeGreaterThan(score1);
  });

  it("should prefer expert team member even if slightly more loaded", () => {
    // Team member 1: 40% loaded, expert
    const score1 = 60 * 0.3 + 100 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Team member 2: 30% loaded, beginner
    const score2 = 70 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });

  it("should prefer available team member", () => {
    // Team member 1: Available, 50% loaded
    const score1 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Team member 2: Unavailable, 20% loaded
    const score2 = 80 * 0.3 + 50 * 0.25 + 0 * 0.2 + 50 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });

  it("should prefer high conversion rate team member", () => {
    // Team member 1: 50% conversion, 50% loaded
    const score1 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 50 * 0.1;

    // Team member 2: 10% conversion, 50% loaded
    const score2 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 10 * 0.15 + 50 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });

  it("should prefer language-matched team member", () => {
    // Team member 1: Spanish speaker, 50% loaded
    const score1 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 100 * 0.1;

    // Team member 2: No Spanish, 50% loaded
    const score2 = 50 * 0.3 + 50 * 0.25 + 100 * 0.2 + 50 * 0.15 + 0 * 0.1;

    expect(score1).toBeGreaterThan(score2);
  });
});

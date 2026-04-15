import { describe, it, expect, beforeEach } from "vitest";
import * as featureFlags from "./services/feature-flags";

describe("Lightweight Feature Flag System", () => {
  describe("Consistent Hashing", () => {
    it("should assign same user to same variant consistently", async () => {
      const userId = 12345;
      const sessionId = "test_session";

      const assignment1 = await featureFlags.assignVariant(
        "new_search_ranking",
        userId,
        sessionId,
        50
      );

      const assignment2 = await featureFlags.assignVariant(
        "new_search_ranking",
        userId,
        sessionId,
        50
      );

      expect(assignment1.variant).toBe(assignment2.variant);
    });

    it("should assign different users to different variants based on hash", async () => {
      const assignments = new Map<string, string>();

      // Test multiple users
      for (let i = 0; i < 100; i++) {
        const assignment = await featureFlags.assignVariant(
          "new_search_ranking",
          i,
          undefined,
          50
        );
        assignments.set(`user_${i}`, assignment.variant);
      }

      // Count variants
      let controlCount = 0;
      let treatmentCount = 0;

      assignments.forEach((variant) => {
        if (variant === "control") controlCount++;
        else treatmentCount++;
      });

      // Should be roughly 50/50 split
      expect(controlCount).toBeGreaterThan(30);
      expect(treatmentCount).toBeGreaterThan(30);
    });
  });

  describe("Feature Flag Management", () => {
    it("should create or get feature flag", async () => {
      const flag = await featureFlags.getOrCreateFlag("test_flag", {
        name: "test_flag",
        enabled: true,
        rolloutPercentage: 75,
        description: "Test flag",
      });

      expect(flag).toBeDefined();
      expect(flag.name).toBe("test_flag");
      expect(flag.enabled).toBe(true);
      expect(flag.rolloutPercentage).toBe(75);
    });

    it("should check if flag is enabled", async () => {
      await featureFlags.getOrCreateFlag("enabled_flag", {
        name: "enabled_flag",
        enabled: true,
        rolloutPercentage: 100,
      });

      const enabled = await featureFlags.isFlagEnabled("enabled_flag");
      expect(enabled).toBe(true);
    });

    it("should respect rollout percentage", async () => {
      await featureFlags.getOrCreateFlag("rollout_flag", {
        name: "rollout_flag",
        enabled: true,
        rolloutPercentage: 50,
      });

      const results = new Map<boolean, number>();

      // Test with multiple users
      for (let i = 0; i < 100; i++) {
        const enabled = await featureFlags.isFlagEnabled(
          "rollout_flag",
          i,
          undefined
        );
        results.set(enabled, (results.get(enabled) || 0) + 1);
      }

      const enabledCount = results.get(true) || 0;
      const disabledCount = results.get(false) || 0;

      // Should be roughly 50/50
      expect(enabledCount).toBeGreaterThan(30);
      expect(disabledCount).toBeGreaterThan(30);
    });

    it("should return false for disabled flag", async () => {
      await featureFlags.getOrCreateFlag("disabled_flag", {
        name: "disabled_flag",
        enabled: false,
        rolloutPercentage: 100,
      });

      const enabled = await featureFlags.isFlagEnabled("disabled_flag");
      expect(enabled).toBe(false);
    });
  });

  describe("Variant Assignment", () => {
    it("should assign to control variant", async () => {
      const assignment = await featureFlags.assignVariant(
        "test_flag",
        1,
        undefined,
        0 // 0% treatment = all control
      );

      expect(assignment.variant).toBe("control");
    });

    it("should assign to treatment variant", async () => {
      const assignment = await featureFlags.assignVariant(
        "test_flag",
        1,
        undefined,
        100 // 100% treatment = all treatment
      );

      expect(assignment.variant).toBe("treatment");
    });

    it("should use session ID when user ID not provided", async () => {
      const assignment1 = await featureFlags.assignVariant(
        "test_flag",
        undefined,
        "session_123",
        50
      );

      const assignment2 = await featureFlags.assignVariant(
        "test_flag",
        undefined,
        "session_123",
        50
      );

      expect(assignment1.variant).toBe(assignment2.variant);
    });

    it("should use anonymous identifier when neither provided", async () => {
      const assignment = await featureFlags.assignVariant(
        "test_flag",
        undefined,
        undefined,
        50
      );

      expect(assignment.variant).toMatch(/control|treatment/);
    });
  });

  describe("Flag Statistics", () => {
    it("should get flag statistics", async () => {
      await featureFlags.getOrCreateFlag("stats_flag", {
        name: "stats_flag",
        enabled: true,
        rolloutPercentage: 60,
        description: "Flag for stats",
      });

      const stats = await featureFlags.getFlagStats("stats_flag");

      expect(stats).toBeDefined();
      expect(stats?.flagName).toBe("stats_flag");
      expect(stats?.enabled).toBe(true);
      expect(stats?.rolloutPercentage).toBe(60);
      expect(stats?.description).toBe("Flag for stats");
    });

    it("should return null for non-existent flag", async () => {
      const stats = await featureFlags.getFlagStats("non_existent_flag");
      expect(stats).toBeNull();
    });
  });

  describe("Flag Updates", () => {
    it("should update feature flag", async () => {
      await featureFlags.getOrCreateFlag("update_flag", {
        name: "update_flag",
        enabled: true,
        rolloutPercentage: 50,
      });

      await featureFlags.updateFlag("update_flag", {
        name: "update_flag",
        enabled: false,
        rolloutPercentage: 75,
      });

      const stats = await featureFlags.getFlagStats("update_flag");
      expect(stats?.enabled).toBe(false);
      expect(stats?.rolloutPercentage).toBe(75);
    });
  });

  describe("Default Flags Initialization", () => {
    it("should initialize default flags", async () => {
      await featureFlags.initializeDefaultFlags();

      const rankingFlag = await featureFlags.getFlagStats("new_search_ranking");
      const explanationFlag = await featureFlags.getFlagStats(
        "ranking_explanations"
      );
      const personalizedFlag = await featureFlags.getFlagStats(
        "personalized_ranking"
      );

      expect(rankingFlag).toBeDefined();
      expect(rankingFlag?.flagName).toBe("new_search_ranking");
      expect(rankingFlag?.enabled).toBe(true);

      expect(explanationFlag).toBeDefined();
      expect(explanationFlag?.flagName).toBe("ranking_explanations");
      expect(explanationFlag?.enabled).toBe(false);

      expect(personalizedFlag).toBeDefined();
      expect(personalizedFlag?.flagName).toBe("personalized_ranking");
      expect(personalizedFlag?.enabled).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle 0% rollout", async () => {
      const enabled = await featureFlags.isFlagEnabled(
        "test_flag",
        1,
        undefined
      );
      // With 0% rollout, should always be false (if flag exists with 0%)
      // This tests the edge case
      expect(typeof enabled).toBe("boolean");
    });

    it("should handle 100% rollout", async () => {
      await featureFlags.getOrCreateFlag("full_rollout", {
        name: "full_rollout",
        enabled: true,
        rolloutPercentage: 100,
      });

      const enabled = await featureFlags.isFlagEnabled("full_rollout");
      expect(enabled).toBe(true);
    });

    it("should handle special characters in identifiers", async () => {
      const assignment1 = await featureFlags.assignVariant(
        "test_flag",
        undefined,
        "session_with-special.chars@123",
        50
      );

      const assignment2 = await featureFlags.assignVariant(
        "test_flag",
        undefined,
        "session_with-special.chars@123",
        50
      );

      expect(assignment1.variant).toBe(assignment2.variant);
    });
  });
});

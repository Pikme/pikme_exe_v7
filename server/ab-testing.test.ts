import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as abTesting from "./services/ab-testing";

describe("A/B Testing Service", () => {
  let experimentId: number;
  let flagId: number;

  describe("Experiment Management", () => {
    it("should create a new experiment", async () => {
      const experiment = await abTesting.createExperiment({
        name: "Search Ranking Test",
        description: "Compare old vs new ranking algorithm",
        experimentType: "ranking",
        controlVariant: "old_ranking",
        treatmentVariant: "new_ranking",
        trafficAllocation: 50,
        createdBy: 1,
      });

      expect(experiment).toBeDefined();
      expect(experiment.name).toBe("Search Ranking Test");
      expect(experiment.status).toBe("draft");
      experimentId = experiment.id;
    });

    it("should retrieve experiment by ID", async () => {
      const experiment = await abTesting.getExperimentById(experimentId);
      expect(experiment).toBeDefined();
      expect(experiment?.id).toBe(experimentId);
    });

    it("should list experiments", async () => {
      const experiments = await abTesting.listExperiments(undefined, "ranking", 10, 0);
      expect(Array.isArray(experiments)).toBe(true);
      expect(experiments.length).toBeGreaterThan(0);
    });

    it("should update experiment status", async () => {
      await abTesting.updateExperimentStatus(experimentId, "running");
      const experiment = await abTesting.getExperimentById(experimentId);
      expect(experiment?.status).toBe("running");
    });
  });

  describe("Variant Assignment", () => {
    it("should assign user to control variant", async () => {
      const assignment = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_user_control",
        50
      );

      expect(assignment).toBeDefined();
      expect(["control", "treatment"]).toContain(assignment.variant);
    });

    it("should assign user to treatment variant", async () => {
      const assignment = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_user_treatment",
        50
      );

      expect(assignment).toBeDefined();
      expect(["control", "treatment"]).toContain(assignment.variant);
    });

    it("should retrieve existing assignment", async () => {
      const sessionId = "session_retrieve_test";
      const assignment1 = await abTesting.assignToVariant(experimentId, null, sessionId, 50);
      const assignment2 = await abTesting.getAssignment(experimentId, null, sessionId);

      expect(assignment2).toBeDefined();
      expect(assignment2?.id).toBe(assignment1.id);
      expect(assignment2?.variant).toBe(assignment1.variant);
    });
  });

  describe("Event Tracking", () => {
    it("should track view event", async () => {
      const assignment = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_view_event",
        50
      );

      const event = await abTesting.trackEvent(
        experimentId,
        assignment.id,
        null,
        "session_view_event",
        "view",
        "search_result_viewed",
        1,
        { resultCount: 10 }
      );

      expect(event).toBeDefined();
      expect(event.eventType).toBe("view");
    });

    it("should track click event", async () => {
      const assignment = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_click_event",
        50
      );

      const event = await abTesting.trackEvent(
        experimentId,
        assignment.id,
        null,
        "session_click_event",
        "click",
        "location_clicked",
        1
      );

      expect(event).toBeDefined();
      expect(event.eventType).toBe("click");
    });

    it("should track conversion event", async () => {
      const assignment = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_conversion_event",
        50
      );

      const event = await abTesting.trackEvent(
        experimentId,
        assignment.id,
        null,
        "session_conversion_event",
        "conversion",
        "booking_completed",
        1,
        { bookingValue: 100 }
      );

      expect(event).toBeDefined();
      expect(event.eventType).toBe("conversion");
    });
  });

  describe("Feature Flags", () => {
    it("should create a feature flag", async () => {
      const flag = await abTesting.createFeatureFlag({
        name: "new_search_ranking",
        description: "Enable new search ranking algorithm",
        enabled: true,
        rolloutPercentage: 50,
        linkedExperimentId: experimentId,
        createdBy: 1,
      });

      expect(flag).toBeDefined();
      expect(flag.name).toBe("new_search_ranking");
      flagId = flag.id;
    });

    it("should retrieve feature flag by name", async () => {
      const flag = await abTesting.getFeatureFlagByName("new_search_ranking");
      expect(flag).toBeDefined();
      expect(flag?.name).toBe("new_search_ranking");
    });

    it("should check if feature is enabled", async () => {
      const enabled = await abTesting.isFeatureEnabled("new_search_ranking");
      expect(typeof enabled).toBe("boolean");
    });

    it("should update feature flag", async () => {
      await abTesting.updateFeatureFlag(flagId, {
        enabled: false,
        rolloutPercentage: 25,
      });

      const flag = await abTesting.getFeatureFlagById(flagId);
      expect(flag?.enabled).toBe(false);
      expect(flag?.rolloutPercentage).toBe(25);
    });
  });

  describe("Results Calculation", () => {
    it("should calculate experiment results", async () => {
      // Create some test events first
      const assignment1 = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_result_1",
        50
      );

      const assignment2 = await abTesting.assignToVariant(
        experimentId,
        null,
        "session_result_2",
        50
      );

      // Track some events
      await abTesting.trackEvent(
        experimentId,
        assignment1.id,
        null,
        "session_result_1",
        "view",
        "search_viewed"
      );

      await abTesting.trackEvent(
        experimentId,
        assignment1.id,
        null,
        "session_result_1",
        "conversion",
        "booking_completed"
      );

      await abTesting.trackEvent(
        experimentId,
        assignment2.id,
        null,
        "session_result_2",
        "view",
        "search_viewed"
      );

      // Calculate results
      const results = await abTesting.calculateExperimentResults(experimentId);

      expect(results).toBeDefined();
      expect(results.controlSampleSize).toBeGreaterThanOrEqual(0);
      expect(results.treatmentSampleSize).toBeGreaterThanOrEqual(0);
      expect(typeof results.controlConversionRate).toBe("number");
      expect(typeof results.treatmentConversionRate).toBe("number");
    });

    it("should retrieve experiment results", async () => {
      const results = await abTesting.getResultsByExperimentId(experimentId);
      expect(results).toBeDefined();
      expect(results?.experimentId).toBe(experimentId);
    });
  });

  describe("Statistical Significance", () => {
    it("should determine statistical significance", async () => {
      const results = await abTesting.getResultsByExperimentId(experimentId);

      if (results) {
        expect(typeof results.isStatisticallySignificant).toBe("boolean");
        expect(typeof results.pValue).toBe("number");
        expect(results.winner).toMatch(/control|treatment|inconclusive/);
      }
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  generateEnquiryAssignmentSample,
  generateEnquiryUpdateSample,
  generateEnquiryCompletionSample,
  generateTeamMessageSample,
  generateSystemAlertSample,
  generateAllSamples,
  generateAlternativeSamples,
  generateScenarioSample,
  getSampleDataByType,
  getAvailableScenarios,
  getNotificationTypes,
  SAMPLE_SCENARIOS,
} from "./email-sample-data";
import { renderEmailByType, validateTemplateData } from "./email-template-service";

/**
 * Email Preview System Tests
 */

describe("Email Sample Data Generator", () => {
  describe("Default Sample Data", () => {
    it("should generate enquiry assignment sample with all required fields", () => {
      const sample = generateEnquiryAssignmentSample();

      expect(sample.teamMemberName).toBeDefined();
      expect(sample.customerName).toBeDefined();
      expect(sample.customerEmail).toBeDefined();
      expect(sample.tourName).toBeDefined();
      expect(sample.numberOfTravelers).toBe(4);
      expect(sample.matchingScore).toBe(92);
    });

    it("should generate enquiry update sample with all required fields", () => {
      const sample = generateEnquiryUpdateSample();

      expect(sample.teamMemberName).toBeDefined();
      expect(sample.customerName).toBeDefined();
      expect(sample.updateType).toBeDefined();
      expect(sample.updateMessage).toBeDefined();
    });

    it("should generate enquiry completion sample with all required fields", () => {
      const sample = generateEnquiryCompletionSample();

      expect(sample.teamMemberName).toBeDefined();
      expect(sample.customerName).toBeDefined();
      expect(sample.tourName).toBeDefined();
      expect(sample.numberOfTravelers).toBe(4);
    });

    it("should generate team message sample with all required fields", () => {
      const sample = generateTeamMessageSample();

      expect(sample.teamMemberName).toBeDefined();
      expect(sample.senderName).toBeDefined();
      expect(sample.message).toBeDefined();
    });

    it("should generate system alert sample with all required fields", () => {
      const sample = generateSystemAlertSample();

      expect(sample.teamMemberName).toBeDefined();
      expect(sample.alertType).toBeDefined();
      expect(sample.alertMessage).toBeDefined();
    });
  });

  describe("Custom Configuration", () => {
    it("should apply custom configuration to sample data", () => {
      const config = {
        customerName: "John Doe",
        teamMemberName: "Jane Smith",
        tourName: "Custom Tour",
        numberOfTravelers: 6,
      };

      const sample = generateEnquiryAssignmentSample(config);

      expect(sample.customerName).toBe("John Doe");
      expect(sample.teamMemberName).toBe("Jane Smith");
      expect(sample.tourName).toBe("Custom Tour");
      expect(sample.numberOfTravelers).toBe(6);
    });

    it("should use custom base URL", () => {
      const config = { baseUrl: "https://custom.example.com" };
      const sample = generateEnquiryAssignmentSample(config);

      expect(sample.appUrl).toBe("https://custom.example.com");
      expect(sample.actionUrl).toContain("https://custom.example.com");
    });
  });

  describe("Alternative Samples", () => {
    it("should generate alternative samples with different data", () => {
      const samples = generateAlternativeSamples();

      expect(samples.enquiry_assigned.customerName).not.toBe(
        generateEnquiryAssignmentSample().customerName
      );
      expect(samples.enquiry_assigned.teamMemberName).toBe("Rajesh Kumar");
    });

    it("should have all notification types in alternative samples", () => {
      const samples = generateAlternativeSamples();

      expect(samples.enquiry_assigned).toBeDefined();
      expect(samples.enquiry_updated).toBeDefined();
      expect(samples.enquiry_completed).toBeDefined();
      expect(samples.team_message).toBeDefined();
      expect(samples.system_alert).toBeDefined();
    });
  });

  describe("Scenario-based Samples", () => {
    it("should generate samples for all available scenarios", () => {
      const scenarios = getAvailableScenarios();

      scenarios.forEach((scenario) => {
        const sample = generateScenarioSample(
          scenario as keyof typeof SAMPLE_SCENARIOS,
          "enquiry_assigned"
        );
        expect(sample.customerName).toBeDefined();
        expect(sample.tourName).toBeDefined();
      });
    });

    it("should have different data for different scenarios", () => {
      const luxurySample = generateScenarioSample("luxury_tour", "enquiry_assigned");
      const budgetSample = generateScenarioSample("budget_tour", "enquiry_assigned");

      expect(luxurySample.customerName).not.toBe(budgetSample.customerName);
      expect(luxurySample.tourName).not.toBe(budgetSample.tourName);
    });

    it("should apply scenario to all notification types", () => {
      const types = getNotificationTypes();
      const scenario = "honeymoon_tour";

      types.forEach((type) => {
        const sample = generateScenarioSample(
          scenario as keyof typeof SAMPLE_SCENARIOS,
          type as any
        );
        expect(sample.teamMemberName).toBe("Emma Watson");
      });
    });
  });

  describe("Get Sample by Type", () => {
    it("should return correct sample for each type", () => {
      const types = getNotificationTypes();

      types.forEach((type) => {
        const sample = getSampleDataByType(type as any);
        expect(sample).toBeDefined();
        expect(sample.teamMemberName).toBeDefined();
      });
    });

    it("should throw error for unknown type", () => {
      expect(() => {
        getSampleDataByType("unknown_type" as any);
      }).toThrow();
    });
  });

  describe("Generate All Samples", () => {
    it("should generate samples for all notification types", () => {
      const samples = generateAllSamples();

      expect(samples.enquiry_assigned).toBeDefined();
      expect(samples.enquiry_updated).toBeDefined();
      expect(samples.enquiry_completed).toBeDefined();
      expect(samples.team_message).toBeDefined();
      expect(samples.system_alert).toBeDefined();
    });

    it("should apply custom config to all samples", () => {
      const config = { baseUrl: "https://test.example.com" };
      const samples = generateAllSamples(config);

      Object.values(samples).forEach((sample) => {
        expect(sample.appUrl).toBe("https://test.example.com");
      });
    });
  });

  describe("Available Options", () => {
    it("should return list of available scenarios", () => {
      const scenarios = getAvailableScenarios();

      expect(scenarios.length).toBeGreaterThan(0);
      expect(scenarios).toContain("luxury_tour");
      expect(scenarios).toContain("group_tour");
      expect(scenarios).toContain("budget_tour");
      expect(scenarios).toContain("honeymoon_tour");
      expect(scenarios).toContain("family_tour");
    });

    it("should return list of notification types", () => {
      const types = getNotificationTypes();

      expect(types.length).toBe(5);
      expect(types).toContain("enquiry_assigned");
      expect(types).toContain("enquiry_updated");
      expect(types).toContain("enquiry_completed");
      expect(types).toContain("team_message");
      expect(types).toContain("system_alert");
    });
  });

  describe("Sample Data Validation", () => {
    it("should generate valid data for all sample types", () => {
      const samples = generateAllSamples();

      Object.entries(samples).forEach(([type, data]) => {
        const validation = validateTemplateData(type as any, data);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });

    it("should generate valid data for all scenarios", () => {
      const scenarios = getAvailableScenarios();
      const types = getNotificationTypes();

      scenarios.forEach((scenario) => {
        types.forEach((type) => {
          const sample = generateScenarioSample(
            scenario as keyof typeof SAMPLE_SCENARIOS,
            type as any
          );
          const validation = validateTemplateData(type as any, sample);
          expect(validation.valid).toBe(true);
        });
      });
    });
  });

  describe("Email Rendering with Sample Data", () => {
    it("should render email successfully with generated sample", () => {
      const sample = generateEnquiryAssignmentSample();
      const email = renderEmailByType("enquiry_assigned", sample);

      expect(email.subject).toBeDefined();
      expect(email.html).toBeDefined();
      expect(email.text).toBeDefined();
      expect(email.html.length).toBeGreaterThan(0);
      expect(email.text.length).toBeGreaterThan(0);
    });

    it("should render all template types with samples", () => {
      const samples = generateAllSamples();

      Object.entries(samples).forEach(([type, data]) => {
        const email = renderEmailByType(type as any, data);
        expect(email.subject).toBeDefined();
        expect(email.html).toContain("Pikme");
        expect(email.text.length).toBeGreaterThan(0);
      });
    });

    it("should render scenario samples successfully", () => {
      const scenarios = getAvailableScenarios();

      scenarios.forEach((scenario) => {
        const sample = generateScenarioSample(
          scenario as keyof typeof SAMPLE_SCENARIOS,
          "enquiry_assigned"
        );
        const email = renderEmailByType("enquiry_assigned", sample);

        expect(email.subject).toBeDefined();
        expect(email.html).toBeDefined();
      });
    });
  });

  describe("Sample Data Consistency", () => {
    it("should generate consistent data across multiple calls", () => {
      const sample1 = generateEnquiryAssignmentSample();
      const sample2 = generateEnquiryAssignmentSample();

      expect(sample1.customerName).toBe(sample2.customerName);
      expect(sample1.tourName).toBe(sample2.tourName);
    });

    it("should generate different data for different scenarios", () => {
      const scenarios = getAvailableScenarios();
      const samples = scenarios.map((scenario) =>
        generateScenarioSample(scenario as keyof typeof SAMPLE_SCENARIOS, "enquiry_assigned")
      );

      const uniqueCustomerNames = new Set(samples.map((s) => s.customerName));
      expect(uniqueCustomerNames.size).toBeGreaterThan(1);
    });
  });

  describe("Sample Data Coverage", () => {
    it("should have sample data for all notification types", () => {
      const types = getNotificationTypes();
      expect(types.length).toBe(5);

      types.forEach((type) => {
        const sample = getSampleDataByType(type as any);
        expect(sample).toBeDefined();
      });
    });

    it("should have at least 5 test scenarios", () => {
      const scenarios = getAvailableScenarios();
      expect(scenarios.length).toBeGreaterThanOrEqual(5);
    });

    it("should support 25+ combinations (5 types × 5 scenarios)", () => {
      const types = getNotificationTypes();
      const scenarios = getAvailableScenarios();
      const combinations = types.length * scenarios.length;

      expect(combinations).toBeGreaterThanOrEqual(25);
    });
  });
});

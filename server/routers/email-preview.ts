import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  renderEmailByType,
  validateTemplateData,
  prepareEmailData,
  EmailTemplateData,
} from "../email-template-service";
import {
  getSampleDataByType,
  generateScenarioSample,
  getAvailableScenarios,
  getNotificationTypes,
  SAMPLE_SCENARIOS,
} from "../email-sample-data";

/**
 * Email Preview Router
 * Provides procedures for previewing and testing email templates
 */

export const emailPreviewRouter = router({
  /**
   * Get preview of email by type with sample data
   */
  getPreview: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        scenario: z.string().optional(),
        customData: z.record(z.any()).optional(),
      })
    )
    .query(({ input }) => {
      try {
        let sampleData: EmailTemplateData;

        if (input.customData) {
          // Use custom data if provided
          sampleData = input.customData as EmailTemplateData;
        } else if (input.scenario) {
          // Use scenario-based sample data
          sampleData = generateScenarioSample(
            input.scenario as keyof typeof SAMPLE_SCENARIOS,
            input.type
          );
        } else {
          // Use default sample data
          sampleData = getSampleDataByType(input.type);
        }

        // Validate data
        const validation = validateTemplateData(input.type, sampleData);
        if (!validation.valid) {
          return {
            success: false,
            error: `Template validation failed: ${validation.errors.join(", ")}`,
          };
        }

        // Render email
        const email = renderEmailByType(input.type, sampleData);

        return {
          success: true,
          email: {
            subject: email.subject,
            html: email.html,
            text: email.text,
          },
          data: sampleData,
          validation: {
            valid: true,
            errors: [],
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get all available scenarios
   */
  getScenarios: protectedProcedure.query(() => {
    return {
      scenarios: getAvailableScenarios(),
      details: SAMPLE_SCENARIOS,
    };
  }),

  /**
   * Get all notification types
   */
  getNotificationTypes: protectedProcedure.query(() => {
    return {
      types: getNotificationTypes(),
    };
  }),

  /**
   * Validate custom email data
   */
  validateData: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        data: z.record(z.any()),
      })
    )
    .query(({ input }) => {
      const validation = validateTemplateData(input.type, input.data);

      return {
        valid: validation.valid,
        errors: validation.errors,
      };
    }),

  /**
   * Render email with custom data
   */
  renderCustom: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        data: z.record(z.any()),
      })
    )
    .query(({ input }) => {
      try {
        // Validate data first
        const validation = validateTemplateData(input.type, input.data);
        if (!validation.valid) {
          return {
            success: false,
            error: `Template validation failed: ${validation.errors.join(", ")}`,
            validation: {
              valid: false,
              errors: validation.errors,
            },
          };
        }

        // Render email
        const email = renderEmailByType(input.type, input.data);

        return {
          success: true,
          email: {
            subject: email.subject,
            html: email.html,
            text: email.text,
          },
          validation: {
            valid: true,
            errors: [],
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          validation: {
            valid: false,
            errors: [error instanceof Error ? error.message : "Unknown error"],
          },
        };
      }
    }),

  /**
   * Get sample data for a specific type
   */
  getSampleData: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        scenario: z.string().optional(),
      })
    )
    .query(({ input }) => {
      try {
        let sampleData: EmailTemplateData;

        if (input.scenario) {
          sampleData = generateScenarioSample(
            input.scenario as keyof typeof SAMPLE_SCENARIOS,
            input.type
          );
        } else {
          sampleData = getSampleDataByType(input.type);
        }

        return {
          success: true,
          data: sampleData,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get template fields for a specific type
   */
  getTemplateFields: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
      })
    )
    .query(({ input }) => {
      const fieldMap: Record<string, string[]> = {
        enquiry_assigned: [
          "teamMemberName",
          "customerName",
          "customerEmail",
          "customerPhone",
          "customerCountry",
          "tourName",
          "numberOfTravelers",
          "preferredStartDate",
          "preferredEndDate",
          "specialRequests",
          "tourCategory",
          "matchingScore",
          "actionUrl",
          "acceptUrl",
          "deferUrl",
          "viewUrl",
          "settingsUrl",
          "appUrl",
          "enquiryId",
          "assignedAt",
        ],
        enquiry_updated: [
          "teamMemberName",
          "customerName",
          "customerEmail",
          "customerPhone",
          "updateType",
          "updateMessage",
          "actionUrl",
          "appUrl",
          "settingsUrl",
          "enquiryId",
          "updatedAt",
        ],
        enquiry_completed: [
          "teamMemberName",
          "customerName",
          "tourName",
          "numberOfTravelers",
          "startDate",
          "endDate",
          "bookingValue",
          "bookingId",
          "conversionRate",
          "actionUrl",
          "settingsUrl",
          "appUrl",
          "enquiryId",
          "confirmedAt",
        ],
        team_message: [
          "teamMemberName",
          "senderName",
          "message",
          "channel",
          "actionUrl",
          "appUrl",
          "settingsUrl",
          "sentAt",
        ],
        system_alert: [
          "teamMemberName",
          "alertType",
          "alertMessage",
          "alertColor",
          "startTime",
          "endTime",
          "duration",
          "affectedServices",
          "impact",
          "actionUrl",
          "appUrl",
          "settingsUrl",
          "alertId",
          "sentAt",
        ],
      };

      return {
        fields: fieldMap[input.type] || [],
      };
    }),

  /**
   * Compare email templates side by side
   */
  compareTemplates: protectedProcedure
    .input(
      z.object({
        type1: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        type2: z.enum([
          "enquiry_assigned",
          "enquiry_updated",
          "enquiry_completed",
          "team_message",
          "system_alert",
        ]),
        scenario: z.string().optional(),
      })
    )
    .query(({ input }) => {
      try {
        const data1 = input.scenario
          ? generateScenarioSample(
              input.scenario as keyof typeof SAMPLE_SCENARIOS,
              input.type1
            )
          : getSampleDataByType(input.type1);

        const data2 = input.scenario
          ? generateScenarioSample(
              input.scenario as keyof typeof SAMPLE_SCENARIOS,
              input.type2
            )
          : getSampleDataByType(input.type2);

        const email1 = renderEmailByType(input.type1, data1);
        const email2 = renderEmailByType(input.type2, data2);

        return {
          success: true,
          templates: [
            {
              type: input.type1,
              subject: email1.subject,
              html: email1.html,
              text: email1.text,
              data: data1,
            },
            {
              type: input.type2,
              subject: email2.subject,
              html: email2.html,
              text: email2.text,
              data: data2,
            },
          ],
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get email statistics
   */
  getStatistics: protectedProcedure.query(() => {
    const types = getNotificationTypes();
    const scenarios = getAvailableScenarios();

    return {
      totalTemplateTypes: types.length,
      totalScenarios: scenarios.length,
      templateTypes: types,
      scenarios: scenarios,
      totalCombinations: types.length * scenarios.length,
    };
  }),
});

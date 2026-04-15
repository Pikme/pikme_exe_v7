import { EmailTemplateData } from "./email-template-service";
import { formatEmailDate, formatEmailCurrency } from "./email-template-service";

/**
 * Sample Data Generator for Email Templates
 * Provides realistic sample data for previewing and testing all email template types
 */

export interface SampleDataConfig {
  customerName?: string;
  teamMemberName?: string;
  tourName?: string;
  numberOfTravelers?: number;
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "https://app.pikmeusa.com";

/**
 * Generate sample data for enquiry assignment email
 */
export function generateEnquiryAssignmentSample(
  config: SampleDataConfig = {}
): EmailTemplateData {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const now = new Date();

  return {
    teamMemberName: config.teamMemberName || "Sarah Johnson",
    customerName: config.customerName || "Michael Chen",
    customerEmail: "michael.chen@example.com",
    customerPhone: "+1 (555) 123-4567",
    customerCountry: "United States",
    tourName: config.tourName || "Taj Mahal & Golden Triangle Tour",
    numberOfTravelers: config.numberOfTravelers || 4,
    preferredStartDate: "March 15, 2026",
    preferredEndDate: "March 22, 2026",
    specialRequests: "Vegetarian meals required, prefer luxury hotels, private transportation",
    tourCategory: "Cultural Heritage Tours",
    matchingScore: 92,
    actionUrl: `${baseUrl}/admin/bookings/1001`,
    acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
    deferUrl: `${baseUrl}/admin/notifications/1/defer`,
    viewUrl: `${baseUrl}/admin/bookings/1001`,
    settingsUrl: `${baseUrl}/settings/notifications`,
    appUrl: baseUrl,
    enquiryId: 1001,
    assignedAt: formatEmailDate(now),
  };
}

/**
 * Generate sample data for enquiry update email
 */
export function generateEnquiryUpdateSample(
  config: SampleDataConfig = {}
): EmailTemplateData {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const now = new Date();

  return {
    teamMemberName: config.teamMemberName || "Sarah Johnson",
    customerName: config.customerName || "Michael Chen",
    customerEmail: "michael.chen@example.com",
    customerPhone: "+1 (555) 123-4567",
    updateType: "Date Change Request",
    updateMessage:
      "Customer would like to change the tour dates from March 15-22 to April 10-17 due to a schedule conflict. They mentioned they are flexible with the exact dates but prefer mid-April.",
    actionUrl: `${baseUrl}/admin/bookings/1001`,
    appUrl: baseUrl,
    settingsUrl: `${baseUrl}/settings/notifications`,
    enquiryId: 1001,
    updatedAt: formatEmailDate(now),
  };
}

/**
 * Generate sample data for enquiry completion email
 */
export function generateEnquiryCompletionSample(
  config: SampleDataConfig = {}
): EmailTemplateData {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const now = new Date();

  return {
    teamMemberName: config.teamMemberName || "Sarah Johnson",
    customerName: config.customerName || "Michael Chen",
    tourName: config.tourName || "Taj Mahal & Golden Triangle Tour",
    numberOfTravelers: config.numberOfTravelers || 4,
    startDate: "March 15, 2026",
    endDate: "March 22, 2026",
    bookingValue: formatEmailCurrency(12500, "USD"),
    bookingId: "BK-2026-0001",
    conversionRate: 78,
    actionUrl: `${baseUrl}/admin/bookings/1001`,
    settingsUrl: `${baseUrl}/settings/notifications`,
    appUrl: baseUrl,
    enquiryId: 1001,
    confirmedAt: formatEmailDate(now),
  };
}

/**
 * Generate sample data for team message email
 */
export function generateTeamMessageSample(
  config: SampleDataConfig = {}
): EmailTemplateData {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const now = new Date();

  return {
    teamMemberName: config.teamMemberName || "Sarah Johnson",
    senderName: "David Patel",
    message:
      "Hi Sarah, can you help with the Chen family booking? They're interested in the Taj Mahal tour but have some specific requirements. Let me know when you have a moment to discuss. Thanks!",
    channel: "Team Chat",
    actionUrl: `${baseUrl}/admin/messages/456`,
    appUrl: baseUrl,
    settingsUrl: `${baseUrl}/settings/notifications`,
    sentAt: formatEmailDate(now),
  };
}

/**
 * Generate sample data for system alert email
 */
export function generateSystemAlertSample(
  config: SampleDataConfig = {}
): EmailTemplateData {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const now = new Date();

  return {
    teamMemberName: config.teamMemberName || "Sarah Johnson",
    alertType: "Scheduled Maintenance",
    alertMessage:
      "We will be performing scheduled maintenance on our booking system on Sunday, January 26, 2026 from 2:00 AM to 4:00 AM UTC.",
    alertColor: "#ffc107",
    startTime: "Sunday, January 26, 2026 at 2:00 AM UTC",
    endTime: "Sunday, January 26, 2026 at 4:00 AM UTC",
    duration: "2 hours",
    affectedServices: "Booking System, Admin Dashboard, Customer Portal",
    impact:
      "During this time, customers will not be able to submit new bookings or make changes to existing bookings. The website will remain accessible for browsing.",
    actionUrl: `${baseUrl}/admin/system-status`,
    appUrl: baseUrl,
    settingsUrl: `${baseUrl}/settings/notifications`,
    alertId: "ALERT-2026-001",
    sentAt: formatEmailDate(now),
  };
}

/**
 * Generate multiple sample data sets for testing
 */
export function generateAllSamples(
  config: SampleDataConfig = {}
): Record<string, EmailTemplateData> {
  return {
    enquiry_assigned: generateEnquiryAssignmentSample(config),
    enquiry_updated: generateEnquiryUpdateSample(config),
    enquiry_completed: generateEnquiryCompletionSample(config),
    team_message: generateTeamMessageSample(config),
    system_alert: generateSystemAlertSample(config),
  };
}

/**
 * Generate alternative sample data with different values
 */
export function generateAlternativeSamples(): Record<string, EmailTemplateData> {
  return {
    enquiry_assigned: generateEnquiryAssignmentSample({
      customerName: "Priya Sharma",
      teamMemberName: "Rajesh Kumar",
      tourName: "Kerala Backwaters & Spice Route",
      numberOfTravelers: 2,
    }),
    enquiry_updated: generateEnquiryUpdateSample({
      customerName: "Priya Sharma",
      teamMemberName: "Rajesh Kumar",
    }),
    enquiry_completed: generateEnquiryCompletionSample({
      customerName: "Priya Sharma",
      teamMemberName: "Rajesh Kumar",
      tourName: "Kerala Backwaters & Spice Route",
      numberOfTravelers: 2,
    }),
    team_message: generateTeamMessageSample({
      teamMemberName: "Rajesh Kumar",
    }),
    system_alert: generateSystemAlertSample({
      teamMemberName: "Rajesh Kumar",
    }),
  };
}

/**
 * Get sample data by notification type
 */
export function getSampleDataByType(
  type: "enquiry_assigned" | "enquiry_updated" | "enquiry_completed" | "team_message" | "system_alert",
  config: SampleDataConfig = {}
): EmailTemplateData {
  switch (type) {
    case "enquiry_assigned":
      return generateEnquiryAssignmentSample(config);
    case "enquiry_updated":
      return generateEnquiryUpdateSample(config);
    case "enquiry_completed":
      return generateEnquiryCompletionSample(config);
    case "team_message":
      return generateTeamMessageSample(config);
    case "system_alert":
      return generateSystemAlertSample(config);
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * Sample data templates for different scenarios
 */
export const SAMPLE_SCENARIOS = {
  // Luxury tour scenario
  luxury_tour: {
    customerName: "Elizabeth & Robert Thompson",
    teamMemberName: "Victoria Sterling",
    tourName: "Luxury Rajasthan Palace Tour",
    numberOfTravelers: 2,
  },

  // Group tour scenario
  group_tour: {
    customerName: "Adventure Club Group",
    teamMemberName: "Marcus Johnson",
    tourName: "Himalayan Trekking Expedition",
    numberOfTravelers: 12,
  },

  // Budget tour scenario
  budget_tour: {
    customerName: "College Friends",
    teamMemberName: "Aisha Patel",
    tourName: "Backpacker's India Circuit",
    numberOfTravelers: 5,
  },

  // Honeymoon scenario
  honeymoon_tour: {
    customerName: "James & Sophie Mitchell",
    teamMemberName: "Emma Watson",
    tourName: "Romantic Kerala Honeymoon",
    numberOfTravelers: 2,
  },

  // Family scenario
  family_tour: {
    customerName: "The Anderson Family",
    teamMemberName: "Priya Sharma",
    tourName: "Family-Friendly India Adventure",
    numberOfTravelers: 4,
  },
};

/**
 * Generate sample data for a specific scenario
 */
export function generateScenarioSample(
  scenario: keyof typeof SAMPLE_SCENARIOS,
  type: "enquiry_assigned" | "enquiry_updated" | "enquiry_completed" | "team_message" | "system_alert"
): EmailTemplateData {
  const scenarioConfig = SAMPLE_SCENARIOS[scenario];
  return getSampleDataByType(type, scenarioConfig);
}

/**
 * Generate realistic sample data with variations
 */
export function generateVariedSamples(): Record<string, EmailTemplateData[]> {
  const scenarios = Object.keys(SAMPLE_SCENARIOS) as Array<keyof typeof SAMPLE_SCENARIOS>;

  return {
    enquiry_assigned: scenarios.map((scenario) =>
      generateScenarioSample(scenario, "enquiry_assigned")
    ),
    enquiry_updated: scenarios.map((scenario) =>
      generateScenarioSample(scenario, "enquiry_updated")
    ),
    enquiry_completed: scenarios.map((scenario) =>
      generateScenarioSample(scenario, "enquiry_completed")
    ),
    team_message: scenarios.map((scenario) =>
      generateScenarioSample(scenario, "team_message")
    ),
    system_alert: scenarios.map((scenario) =>
      generateScenarioSample(scenario, "system_alert")
    ),
  };
}

/**
 * Get list of all available sample scenarios
 */
export function getAvailableScenarios(): string[] {
  return Object.keys(SAMPLE_SCENARIOS);
}

/**
 * Get list of all notification types
 */
export function getNotificationTypes(): string[] {
  return ["enquiry_assigned", "enquiry_updated", "enquiry_completed", "team_message", "system_alert"];
}

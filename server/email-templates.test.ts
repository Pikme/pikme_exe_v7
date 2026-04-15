import { describe, it, expect } from "vitest";
import {
  renderEnquiryAssignmentEmail,
  renderEnquiryUpdateEmail,
  renderEnquiryCompletionEmail,
  renderTeamMessageEmail,
  renderSystemAlertEmail,
  renderEmailByType,
  validateTemplateData,
  formatEmailDate,
  formatEmailCurrency,
  createEmailActionUrls,
  prepareEmailData,
} from "./email-template-service";

/**
 * Email Template Rendering Tests
 */

describe("Email Template Service", () => {
  const baseUrl = "https://app.pikmeusa.com";

  describe("Enquiry Assignment Email", () => {
    it("should render enquiry assignment email with all details", () => {
      const data = {
        teamMemberName: "John Smith",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+1234567890",
        customerCountry: "USA",
        tourName: "Paris City Tour",
        numberOfTravelers: 2,
        preferredStartDate: "2026-03-15",
        preferredEndDate: "2026-03-22",
        specialRequests: "Vegetarian meals required",
        tourCategory: "European Tours",
        matchingScore: 92,
        actionUrl: `${baseUrl}/admin/bookings/123`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/123`,
        settingsUrl: `${baseUrl}/settings/notifications`,
        appUrl: baseUrl,
        enquiryId: 123,
        assignedAt: formatEmailDate(new Date()),
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.subject).toContain("Paris City Tour");
      expect(email.html).toContain("Jane Doe");
      expect(email.html).toContain("jane@example.com");
      expect(email.html).toContain("2");
      expect(email.html).toContain("92%");
      expect(email.html).toContain("Paris City Tour");
      expect(email.text).toContain("Jane Doe");
    });

    it("should include action links in enquiry assignment email", () => {
      const data = {
        teamMemberName: "John Smith",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+1234567890",
        tourName: "Paris City Tour",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/123`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/123`,
        settingsUrl: `${baseUrl}/settings/notifications`,
        appUrl: baseUrl,
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.html).toContain("View Full Enquiry");
      expect(email.html).toContain("Accept");
      expect(email.html).toContain("Defer");
      expect(email.html).toContain(data.actionUrl);
    });
  });

  describe("Enquiry Update Email", () => {
    it("should render enquiry update email", () => {
      const data = {
        teamMemberName: "John Smith",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+1234567890",
        updateType: "Date Change",
        updateMessage: "Customer requested to change the tour dates to April instead of March",
        actionUrl: `${baseUrl}/admin/bookings/123`,
        appUrl: baseUrl,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryUpdateEmail(data);

      expect(email.subject).toContain("Jane Doe");
      expect(email.html).toContain("Date Change");
      expect(email.html).toContain("Customer requested to change");
      expect(email.text).toContain("Jane Doe");
    });
  });

  describe("Enquiry Completion Email", () => {
    it("should render enquiry completion email with booking details", () => {
      const data = {
        teamMemberName: "John Smith",
        customerName: "Jane Doe",
        tourName: "Paris City Tour",
        numberOfTravelers: 2,
        startDate: "2026-03-15",
        endDate: "2026-03-22",
        bookingValue: "2500.00",
        bookingId: "BK-2026-001",
        conversionRate: 78,
        actionUrl: `${baseUrl}/admin/bookings/123`,
        appUrl: baseUrl,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryCompletionEmail(data);

      expect(email.subject).toContain("Booking Confirmed");
      expect(email.html).toContain("Jane Doe");
      expect(email.html).toContain("Paris City Tour");
      expect(email.html).toContain("2");
      expect(email.html).toContain("78%");
    });
  });

  describe("Team Message Email", () => {
    it("should render team message email", () => {
      const data = {
        teamMemberName: "John Smith",
        senderName: "Sarah Johnson",
        message: "Can you help with the Paris booking for the Doe family?",
        channel: "Team Chat",
        actionUrl: `${baseUrl}/admin/messages/456`,
        appUrl: baseUrl,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderTeamMessageEmail(data);

      expect(email.subject).toContain("Sarah Johnson");
      expect(email.html).toContain("Can you help");
      expect(email.html).toContain("Team Chat");
    });
  });

  describe("System Alert Email", () => {
    it("should render system alert email", () => {
      const data = {
        teamMemberName: "John Smith",
        alertType: "Maintenance",
        alertMessage: "Scheduled maintenance on Sunday 2-4 AM UTC",
        alertColor: "#ff9800",
        appUrl: baseUrl,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderSystemAlertEmail(data);

      expect(email.subject).toContain("Maintenance");
      expect(email.html).toContain("Scheduled maintenance");
    });
  });

  describe("Template Data Validation", () => {
    it("should validate enquiry assignment email data", () => {
      const validData = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        customerEmail: "jane@example.com",
        tourName: "Paris",
        actionUrl: `${baseUrl}/admin/bookings/1`,
      };

      const result = validateTemplateData("enquiry_assigned", validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const incompleteData = {
        teamMemberName: "John",
        // Missing appUrl and other required fields
      };

      const result = validateTemplateData("enquiry_assigned", incompleteData);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate enquiry update email data", () => {
      const validData = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        updateMessage: "Date change requested",
        actionUrl: `${baseUrl}/admin/bookings/1`,
      };

      const result = validateTemplateData("enquiry_updated", validData);

      expect(result.valid).toBe(true);
    });

    it("should validate system alert data", () => {
      const validData = {
        teamMemberName: "John",
        appUrl: baseUrl,
        alertType: "Maintenance",
        alertMessage: "System maintenance scheduled",
      };

      const result = validateTemplateData("system_alert", validData);

      expect(result.valid).toBe(true);
    });
  });

  describe("Email Formatting Utilities", () => {
    it("should format date correctly", () => {
      const date = new Date("2026-03-15T10:30:00Z");
      const formatted = formatEmailDate(date);

      expect(formatted).toContain("2026");
      expect(formatted).toContain("March");
      expect(formatted).toContain("15");
    });

    it("should format currency correctly", () => {
      const formatted = formatEmailCurrency(2500.5, "USD");

      expect(formatted).toContain("$");
      expect(formatted).toContain("2,500");
    });

    it("should format currency in different currencies", () => {
      const usd = formatEmailCurrency(1000, "USD");
      const eur = formatEmailCurrency(1000, "EUR");

      expect(usd).toContain("$");
      expect(eur).toContain("€");
    });
  });

  describe("Email Action URLs", () => {
    it("should create correct action URLs", () => {
      const urls = createEmailActionUrls(baseUrl, 1, 123);

      expect(urls.actionUrl).toBe(`${baseUrl}/admin/notifications/1`);
      expect(urls.acceptUrl).toBe(`${baseUrl}/admin/notifications/1/accept`);
      expect(urls.deferUrl).toBe(`${baseUrl}/admin/notifications/1/defer`);
      expect(urls.viewUrl).toBe(`${baseUrl}/admin/bookings/123`);
      expect(urls.settingsUrl).toBe(`${baseUrl}/settings/notifications`);
    });

    it("should use base URL for view when no enquiry ID", () => {
      const urls = createEmailActionUrls(baseUrl, 1);

      expect(urls.viewUrl).toBe(baseUrl);
    });
  });

  describe("Email Data Preparation", () => {
    it("should prepare email data with default values", () => {
      const baseData = {
        teamMemberName: "John",
        customerName: "Jane",
      };

      const prepared = prepareEmailData("enquiry_assigned", baseData, baseUrl);

      expect(prepared.teamMemberName).toBe("John");
      expect(prepared.customerName).toBe("Jane");
      expect(prepared.appUrl).toBe(baseUrl);
      expect(prepared.matchingScore).toBe(85);
      expect(prepared.conversionRate).toBe(75);
      expect(prepared.assignedAt).toBeDefined();
      expect(prepared.settingsUrl).toBe(`${baseUrl}/settings/notifications`);
    });

    it("should preserve provided values over defaults", () => {
      const baseData = {
        teamMemberName: "John",
        customerName: "Jane",
        matchingScore: 95,
      };

      const prepared = prepareEmailData("enquiry_assigned", baseData, baseUrl);

      expect(prepared.matchingScore).toBe(95);
    });
  });

  describe("Email Rendering by Type", () => {
    it("should render email by notification type", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        customerEmail: "jane@example.com",
        tourName: "Paris",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEmailByType("enquiry_assigned", data);

      expect(email.subject).toBeDefined();
      expect(email.html).toBeDefined();
      expect(email.text).toBeDefined();
      expect(email.html).toContain("Jane");
    });

    it("should throw error for unknown notification type", () => {
      const data = { teamMemberName: "John", appUrl: baseUrl };

      expect(() => {
        renderEmailByType("unknown_type" as any, data);
      }).toThrow();
    });
  });

  describe("HTML to Plain Text Conversion", () => {
    it("should convert HTML email to plain text", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        tourName: "Paris",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.text).toBeDefined();
      expect(email.text).not.toContain("<");
      expect(email.text).not.toContain(">");
      expect(email.text).toContain("Jane Doe");
    });
  });

  describe("Email Subject Lines", () => {
    it("should generate appropriate subject for enquiry assignment", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        customerEmail: "jane@example.com",
        tourName: "Paris City Tour",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.subject).toContain("Paris City Tour");
    });

    it("should generate appropriate subject for completion", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        tourName: "Paris City Tour",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryCompletionEmail(data);

      expect(email.subject).toContain("Booking Confirmed");
      expect(email.subject).toContain("Paris City Tour");
    });
  });

  describe("Email Template Branding", () => {
    it("should include Pikme branding in email", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        customerEmail: "jane@example.com",
        tourName: "Paris",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.html).toContain("Pikme");
      expect(email.html).toContain("©");
    });

    it("should include footer with links", () => {
      const data = {
        teamMemberName: "John",
        appUrl: baseUrl,
        customerName: "Jane",
        customerEmail: "jane@example.com",
        tourName: "Paris",
        numberOfTravelers: 2,
        actionUrl: `${baseUrl}/admin/bookings/1`,
        acceptUrl: `${baseUrl}/admin/notifications/1/accept`,
        deferUrl: `${baseUrl}/admin/notifications/1/defer`,
        viewUrl: `${baseUrl}/admin/bookings/1`,
        settingsUrl: `${baseUrl}/settings/notifications`,
      };

      const email = renderEnquiryAssignmentEmail(data);

      expect(email.html).toContain("Notification Settings");
      expect(email.html).toContain("Help Center");
      expect(email.html).toContain("Contact Support");
    });
  });
});

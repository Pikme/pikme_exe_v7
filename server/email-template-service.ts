import fs from "fs";
import path from "path";

/**
 * Email Template Service
 * Handles rendering and sending of branded HTML email templates
 */

export type NotificationType =
  | "enquiry_assigned"
  | "enquiry_updated"
  | "enquiry_completed"
  | "team_message"
  | "system_alert";

export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined | null;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Get the path to email templates directory
 */
function getTemplatesDir(): string {
  return path.join(process.cwd(), "server", "email-templates");
}

/**
 * Read a template file
 */
function readTemplate(filename: string): string {
  const templatePath = path.join(getTemplatesDir(), filename);
  return fs.readFileSync(templatePath, "utf-8");
}

/**
 * Render template with data using simple mustache-like syntax
 */
function renderTemplate(template: string, data: EmailTemplateData): string {
  let rendered = template;

  // Replace simple variables {{key}}
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(regex, String(value));
    }
  });

  // Remove conditional blocks {{#key}}...{{/key}} if value is falsy
  Object.entries(data).forEach(([key]) => {
    const conditionalRegex = new RegExp(
      `{{#${key}}}([\\s\\S]*?){{/${key}}}`,
      "g"
    );
    const value = data[key];

    if (!value) {
      rendered = rendered.replace(conditionalRegex, "");
    } else {
      rendered = rendered.replace(conditionalRegex, "$1");
    }
  });

  return rendered;
}

/**
 * Convert HTML to plain text
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n\n+/g, "\n\n") // Remove excessive newlines
    .trim();
}

/**
 * Render enquiry assignment email
 */
export function renderEnquiryAssignmentEmail(
  data: EmailTemplateData
): EmailContent {
  const contentTemplate = readTemplate("enquiry-assigned.html");
  const baseTemplate = readTemplate("base.html");

  const content = renderTemplate(contentTemplate, data);
  const html = renderTemplate(baseTemplate, {
    ...data,
    title: "New Enquiry Assigned",
    content,
  });

  return {
    subject: `New Enquiry: ${data.tourName || "Tour Assignment"}`,
    html,
    text: htmlToPlainText(content),
  };
}

/**
 * Render enquiry update email
 */
export function renderEnquiryUpdateEmail(
  data: EmailTemplateData
): EmailContent {
  const contentTemplate = readTemplate("enquiry-updated.html");
  const baseTemplate = readTemplate("base.html");

  const content = renderTemplate(contentTemplate, data);
  const html = renderTemplate(baseTemplate, {
    ...data,
    title: "Enquiry Update",
    content,
  });

  return {
    subject: `Update: ${data.customerName || "Enquiry"} - ${data.updateType || "Update"}`,
    html,
    text: htmlToPlainText(content),
  };
}

/**
 * Render enquiry completion email
 */
export function renderEnquiryCompletionEmail(
  data: EmailTemplateData
): EmailContent {
  const contentTemplate = readTemplate("enquiry-completed.html");
  const baseTemplate = readTemplate("base.html");

  const content = renderTemplate(contentTemplate, data);
  const html = renderTemplate(baseTemplate, {
    ...data,
    title: "Booking Confirmed",
    content,
  });

  return {
    subject: `Booking Confirmed: ${data.tourName || "Tour"}`,
    html,
    text: htmlToPlainText(content),
  };
}

/**
 * Render team message email
 */
export function renderTeamMessageEmail(data: EmailTemplateData): EmailContent {
  const contentTemplate = readTemplate("team-message.html");
  const baseTemplate = readTemplate("base.html");

  const content = renderTemplate(contentTemplate, data);
  const html = renderTemplate(baseTemplate, {
    ...data,
    title: "Team Message",
    content,
  });

  return {
    subject: `Message from ${data.senderName || "Team Member"}`,
    html,
    text: htmlToPlainText(content),
  };
}

/**
 * Render system alert email
 */
export function renderSystemAlertEmail(data: EmailTemplateData): EmailContent {
  const contentTemplate = readTemplate("system-alert.html");
  const baseTemplate = readTemplate("base.html");

  const content = renderTemplate(contentTemplate, data);
  const html = renderTemplate(baseTemplate, {
    ...data,
    title: "System Alert",
    content,
  });

  return {
    subject: `[Alert] ${data.alertType || "System Notification"}`,
    html,
    text: htmlToPlainText(content),
  };
}

/**
 * Render email based on notification type
 */
export function renderEmailByType(
  notificationType: NotificationType,
  data: EmailTemplateData
): EmailContent {
  switch (notificationType) {
    case "enquiry_assigned":
      return renderEnquiryAssignmentEmail(data);
    case "enquiry_updated":
      return renderEnquiryUpdateEmail(data);
    case "enquiry_completed":
      return renderEnquiryCompletionEmail(data);
    case "team_message":
      return renderTeamMessageEmail(data);
    case "system_alert":
      return renderSystemAlertEmail(data);
    default:
      throw new Error(`Unknown notification type: ${notificationType}`);
  }
}

/**
 * Get email subject for notification type
 */
export function getEmailSubject(
  notificationType: NotificationType,
  data: EmailTemplateData
): string {
  const email = renderEmailByType(notificationType, data);
  return email.subject;
}

/**
 * Validate template data has required fields
 */
export function validateTemplateData(
  notificationType: NotificationType,
  data: EmailTemplateData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Common required fields
  const commonRequired = ["teamMemberName", "appUrl"];
  commonRequired.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Type-specific required fields
  switch (notificationType) {
    case "enquiry_assigned":
      ["customerName", "customerEmail", "tourName", "actionUrl"].forEach(
        (field) => {
          if (!data[field]) {
            errors.push(`Missing required field for enquiry_assigned: ${field}`);
          }
        }
      );
      break;

    case "enquiry_updated":
      ["customerName", "updateMessage", "actionUrl"].forEach((field) => {
        if (!data[field]) {
          errors.push(`Missing required field for enquiry_updated: ${field}`);
        }
      });
      break;

    case "enquiry_completed":
      ["customerName", "tourName", "actionUrl"].forEach((field) => {
        if (!data[field]) {
          errors.push(`Missing required field for enquiry_completed: ${field}`);
        }
      });
      break;

    case "team_message":
      ["senderName", "message", "actionUrl"].forEach((field) => {
        if (!data[field]) {
          errors.push(`Missing required field for team_message: ${field}`);
        }
      });
      break;

    case "system_alert":
      ["alertType", "alertMessage"].forEach((field) => {
        if (!data[field]) {
          errors.push(`Missing required field for system_alert: ${field}`);
        }
      });
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format currency for email display
 */
export function formatEmailCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Create action URLs for email
 */
export function createEmailActionUrls(
  baseUrl: string,
  notificationId: number,
  enquiryId?: number
): {
  actionUrl: string;
  acceptUrl: string;
  deferUrl: string;
  viewUrl: string;
  settingsUrl: string;
} {
  return {
    actionUrl: `${baseUrl}/admin/notifications/${notificationId}`,
    acceptUrl: `${baseUrl}/admin/notifications/${notificationId}/accept`,
    deferUrl: `${baseUrl}/admin/notifications/${notificationId}/defer`,
    viewUrl: enquiryId ? `${baseUrl}/admin/bookings/${enquiryId}` : baseUrl,
    settingsUrl: `${baseUrl}/settings/notifications`,
  };
}

/**
 * Prepare email data with all required fields
 */
export function prepareEmailData(
  notificationType: NotificationType,
  baseData: EmailTemplateData,
  baseUrl: string
): EmailTemplateData {
  const now = new Date();

  return {
    // Add timestamps
    assignedAt: formatEmailDate(now),
    updatedAt: formatEmailDate(now),
    confirmedAt: formatEmailDate(now),
    sentAt: formatEmailDate(now),

    // Add URLs
    appUrl: baseUrl,
    settingsUrl: `${baseUrl}/settings/notifications`,

    // Add default values
    matchingScore: 85,
    conversionRate: 75,

    // Merge with provided data
    ...baseData,
  };
}

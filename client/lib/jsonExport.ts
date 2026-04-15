/**
 * JSON Export Utilities
 * Provides functions for generating and downloading JSON files with schema support
 */

/**
 * JSON Export Metadata
 */
export interface ExportMetadata {
  exportedAt: string;
  exportedBy?: string;
  version: string;
  schema: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Base JSON export structure
 */
export interface JSONExportBase<T> {
  metadata: ExportMetadata;
  data: T;
}

/**
 * Summary Report JSON Schema
 */
export interface SummaryReportJSON extends JSONExportBase<{
  dateRange: string;
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  totalBounces: number;
  totalComplaints: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageEngagementScore: number;
}> {}

/**
 * Engagement Metrics JSON Schema
 */
export interface EngagementMetricsJSON extends JSONExportBase<{
  metrics: Array<{
    name: string;
    value: number;
    percentage?: number;
    trend?: "up" | "down" | "neutral";
  }>;
}> {}

/**
 * Engagement Trends JSON Schema
 */
export interface EngagementTrendsJSON extends JSONExportBase<{
  trends: Array<{
    date: string;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageEngagementScore: number;
  }>;
}> {}

/**
 * Recipient Profiles JSON Schema
 */
export interface RecipientProfilesJSON extends JSONExportBase<{
  recipients: Array<{
    email: string;
    name: string;
    totalEmails: number;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    openRate: number;
    clickRate: number;
    engagementScore: number;
    lastEngagement: string;
    status: "active" | "inactive" | "bounced" | "complained";
  }>;
}> {}

/**
 * Email Performance JSON Schema
 */
export interface EmailPerformanceJSON extends JSONExportBase<{
  emails: Array<{
    id: string;
    subject: string;
    sentDate: string;
    recipients: number;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    engagementScore: number;
  }>;
}> {}

/**
 * Comprehensive Report JSON Schema
 */
export interface ComprehensiveReportJSON extends JSONExportBase<{
  summary: {
    dateRange: string;
    totalEmails: number;
    totalOpens: number;
    totalClicks: number;
    totalBounces: number;
    totalComplaints: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageEngagementScore: number;
  };
  metrics: Array<{
    name: string;
    value: number;
    percentage?: number;
    trend?: "up" | "down" | "neutral";
  }>;
  trends: Array<{
    date: string;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageEngagementScore: number;
  }>;
  recipients?: Array<{
    email: string;
    name: string;
    totalEmails: number;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    openRate: number;
    clickRate: number;
    engagementScore: number;
    lastEngagement: string;
    status: "active" | "inactive" | "bounced" | "complained";
  }>;
  emails?: Array<{
    id: string;
    subject: string;
    sentDate: string;
    recipients: number;
    opens: number;
    clicks: number;
    bounces: number;
    complaints: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    engagementScore: number;
  }>;
}> {}

/**
 * Create export metadata
 */
export function createMetadata(
  schema: string,
  startDate?: Date,
  endDate?: Date
): ExportMetadata {
  return {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    schema,
    dateRange: startDate && endDate ? {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    } : undefined,
  };
}

/**
 * Convert object to JSON string with formatting
 */
export function convertToJSON<T>(data: T, pretty: boolean = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Download JSON file
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export summary report as JSON
 */
export function exportSummaryReportJSON(
  data: SummaryReportJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: SummaryReportJSON = {
    metadata: createMetadata("summary_report", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `summary-report-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Export engagement metrics as JSON
 */
export function exportEngagementMetricsJSON(
  data: EngagementMetricsJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: EngagementMetricsJSON = {
    metadata: createMetadata("engagement_metrics", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `engagement-metrics-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Export engagement trends as JSON
 */
export function exportEngagementTrendsJSON(
  data: EngagementTrendsJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: EngagementTrendsJSON = {
    metadata: createMetadata("engagement_trends", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `engagement-trends-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Export recipient profiles as JSON
 */
export function exportRecipientProfilesJSON(
  data: RecipientProfilesJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: RecipientProfilesJSON = {
    metadata: createMetadata("recipient_profiles", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `recipient-profiles-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Export email performance as JSON
 */
export function exportEmailPerformanceJSON(
  data: EmailPerformanceJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: EmailPerformanceJSON = {
    metadata: createMetadata("email_performance", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `email-performance-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Export comprehensive report as JSON
 */
export function exportComprehensiveReportJSON(
  data: ComprehensiveReportJSON["data"],
  dateRange: string,
  startDate?: Date,
  endDate?: Date
): void {
  const exportData: ComprehensiveReportJSON = {
    metadata: createMetadata("comprehensive_report", startDate, endDate),
    data,
  };

  const json = convertToJSON(exportData);
  const filename = `comprehensive-report-${dateRange}.json`;
  downloadJSON(json, filename);
}

/**
 * Validate JSON export structure
 */
export function validateJSONExport<T extends JSONExportBase<any>>(data: T): boolean {
  if (!data.metadata) return false;
  if (!data.metadata.exportedAt) return false;
  if (!data.metadata.version) return false;
  if (!data.metadata.schema) return false;
  if (!data.data) return false;
  return true;
}

/**
 * Get JSON schema for a specific export type
 */
export function getJSONSchema(schemaType: string): Record<string, any> {
  const schemas: Record<string, Record<string, any>> = {
    summary_report: {
      type: "object",
      properties: {
        metadata: {
          type: "object",
          properties: {
            exportedAt: { type: "string", format: "date-time" },
            version: { type: "string" },
            schema: { type: "string" },
            dateRange: {
              type: "object",
              properties: {
                startDate: { type: "string", format: "date" },
                endDate: { type: "string", format: "date" },
              },
            },
          },
        },
        data: {
          type: "object",
          properties: {
            dateRange: { type: "string" },
            totalEmails: { type: "number" },
            totalOpens: { type: "number" },
            totalClicks: { type: "number" },
            totalBounces: { type: "number" },
            totalComplaints: { type: "number" },
            averageOpenRate: { type: "number" },
            averageClickRate: { type: "number" },
            averageEngagementScore: { type: "number" },
          },
        },
      },
    },
    engagement_metrics: {
      type: "object",
      properties: {
        metadata: { type: "object" },
        data: {
          type: "object",
          properties: {
            metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "number" },
                  percentage: { type: "number" },
                  trend: { type: "string", enum: ["up", "down", "neutral"] },
                },
              },
            },
          },
        },
      },
    },
    engagement_trends: {
      type: "object",
      properties: {
        metadata: { type: "object" },
        data: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date" },
                  opens: { type: "number" },
                  clicks: { type: "number" },
                  bounces: { type: "number" },
                  complaints: { type: "number" },
                  averageOpenRate: { type: "number" },
                  averageClickRate: { type: "number" },
                  averageEngagementScore: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    recipient_profiles: {
      type: "object",
      properties: {
        metadata: { type: "object" },
        data: {
          type: "object",
          properties: {
            recipients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  totalEmails: { type: "number" },
                  opens: { type: "number" },
                  clicks: { type: "number" },
                  bounces: { type: "number" },
                  complaints: { type: "number" },
                  openRate: { type: "number" },
                  clickRate: { type: "number" },
                  engagementScore: { type: "number" },
                  lastEngagement: { type: "string" },
                  status: { type: "string", enum: ["active", "inactive", "bounced", "complained"] },
                },
              },
            },
          },
        },
      },
    },
    email_performance: {
      type: "object",
      properties: {
        metadata: { type: "object" },
        data: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  subject: { type: "string" },
                  sentDate: { type: "string", format: "date" },
                  recipients: { type: "number" },
                  opens: { type: "number" },
                  clicks: { type: "number" },
                  bounces: { type: "number" },
                  complaints: { type: "number" },
                  openRate: { type: "number" },
                  clickRate: { type: "number" },
                  conversionRate: { type: "number" },
                  engagementScore: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  };

  return schemas[schemaType] || {};
}

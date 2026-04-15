/**
 * CSV Export Utilities
 * Provides functions for generating and downloading CSV files
 */

/**
 * Escape CSV field value
 * Handles special characters, quotes, and line breaks
 */
export function escapeCSVField(field: string | number | boolean | null | undefined): string {
  if (field === null || field === undefined) {
    return "";
  }

  const stringValue = String(field);

  // Check if field needs to be quoted
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: (keyof T)[]
): string {
  if (data.length === 0) {
    return "";
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || (Object.keys(data[0]) as (keyof T)[]);

  // Create header row
  const headerRow = csvHeaders.map((h) => escapeCSVField(String(h))).join(",");

  // Create data rows
  const dataRows = data.map((row) =>
    csvHeaders.map((header) => escapeCSVField(row[header])).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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
 * Export engagement metrics to CSV
 */
export interface EngagementMetricsExport {
  metric: string;
  value: number | string;
  percentage?: string;
  trend?: string;
}

export function exportEngagementMetricsCSV(
  metrics: EngagementMetricsExport[],
  dateRange: string
): void {
  const csv = convertToCSV(metrics);
  const filename = `engagement-metrics-${dateRange.replace(/\s/g, "-")}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export recipient profiles to CSV
 */
export interface RecipientProfileExport {
  email: string;
  name: string;
  totalEmails: number;
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  openRate: string;
  clickRate: string;
  engagementScore: string;
  lastEngagement: string;
  status: string;
}

export function exportRecipientProfilesCSV(
  recipients: RecipientProfileExport[],
  dateRange: string
): void {
  const csv = convertToCSV(recipients);
  const filename = `recipient-profiles-${dateRange.replace(/\s/g, "-")}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export email performance to CSV
 */
export interface EmailPerformanceExport {
  emailId: string;
  subject: string;
  sentDate: string;
  recipients: number;
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  openRate: string;
  clickRate: string;
  conversionRate: string;
  engagementScore: string;
}

export function exportEmailPerformanceCSV(
  emails: EmailPerformanceExport[],
  dateRange: string
): void {
  const csv = convertToCSV(emails);
  const filename = `email-performance-${dateRange.replace(/\s/g, "-")}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export engagement trends to CSV
 */
export interface EngagementTrendExport {
  date: string;
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  averageOpenRate: string;
  averageClickRate: string;
  averageEngagementScore: string;
}

export function exportEngagementTrendsCSV(
  trends: EngagementTrendExport[],
  dateRange: string
): void {
  const csv = convertToCSV(trends);
  const filename = `engagement-trends-${dateRange.replace(/\s/g, "-")}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Generate summary report CSV
 */
export interface SummaryReportExport {
  [key: string]: string | number;
}

export function exportSummaryReportCSV(
  summary: SummaryReportExport,
  dateRange: string
): void {
  // Convert object to array format for CSV
  const data = Object.entries(summary).map(([key, value]) => ({
    metric: key,
    value: value,
  }));

  const csv = convertToCSV(data);
  const filename = `summary-report-${dateRange.replace(/\s/g, "-")}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Create a comprehensive export with multiple sheets (as separate files)
 */
export interface ComprehensiveExportData {
  summary: SummaryReportExport;
  metrics: EngagementMetricsExport[];
  trends: EngagementTrendExport[];
  recipients?: RecipientProfileExport[];
  emails?: EmailPerformanceExport[];
}

export function exportComprehensiveReport(
  data: ComprehensiveExportData,
  dateRange: string
): void {
  // Export summary
  exportSummaryReportCSV(data.summary, `${dateRange}-summary`);

  // Export metrics
  exportEngagementMetricsCSV(data.metrics, `${dateRange}-metrics`);

  // Export trends
  exportEngagementTrendsCSV(data.trends, `${dateRange}-trends`);

  // Export recipients if provided
  if (data.recipients && data.recipients.length > 0) {
    exportRecipientProfilesCSV(data.recipients, `${dateRange}-recipients`);
  }

  // Export emails if provided
  if (data.emails && data.emails.length > 0) {
    exportEmailPerformanceCSV(data.emails, `${dateRange}-emails`);
  }
}

/**
 * Format number as percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Format date range for filename
 */
export function formatDateRangeForFilename(startDate: Date, endDate: Date): string {
  const start = formatDateForCSV(startDate);
  const end = formatDateForCSV(endDate);
  return `${start}-to-${end}`;
}


/**
 * Export tours data to CSV
 */
export function exportToursToCSV(tours: any[], filename: string = "tours.csv"): void {
  const columns = ["id", "name", "slug", "category", "difficulty", "duration", "price", "description"];
  const csv = convertToCSV(tours, columns as any);
  downloadCSV(csv, filename);
}

/**
 * Export locations data to CSV
 */
export function exportLocationsToCSV(locations: any[], filename: string = "locations.csv"): void {
  const columns = ["id", "name", "slug", "description", "country", "latitude", "longitude"];
  const csv = convertToCSV(locations, columns as any);
  downloadCSV(csv, filename);
}

/**
 * Export states data to CSV
 */
export function exportStatesToCSV(states: any[], filename: string = "states.csv"): void {
  const columns = ["id", "name", "slug", "country", "description", "metaTitle", "metaDescription"];
  const csv = convertToCSV(states, columns as any);
  downloadCSV(csv, filename);
}

/**
 * Export categories data to CSV
 */
export function exportCategoriesToCSV(categories: any[], filename: string = "categories.csv"): void {
  const columns = ["id", "name", "slug", "description", "icon", "metaTitle", "metaDescription"];
  const csv = convertToCSV(categories, columns as any);
  downloadCSV(csv, filename);
}

/**
 * Generic export function with custom columns
 */
export function exportToCSV(
  data: any[],
  columns: string[],
  filename: string = "export.csv"
): void {
  const csv = convertToCSV(data, columns as any);
  downloadCSV(csv, filename);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${prefix}-${timestamp}.csv`;
}

import { useCallback } from "react";
import {
  ExportFormat,
  ExportType,
  exportEngagementMetricsCSV,
  exportRecipientProfilesCSV,
  exportEmailPerformanceCSV,
  exportEngagementTrendsCSV,
  exportSummaryReportCSV,
  exportComprehensiveReport,
  formatDateRangeForFilename,
  formatPercentage,
  EngagementMetricsExport,
  RecipientProfileExport,
  EmailPerformanceExport,
  EngagementTrendExport,
  SummaryReportExport,
  ComprehensiveExportData,
} from "@/lib/csvExport";
import {
  exportSummaryReportJSON,
  exportEngagementMetricsJSON,
  exportEngagementTrendsJSON,
  exportRecipientProfilesJSON,
  exportEmailPerformanceJSON,
  exportComprehensiveReportJSON,
} from "@/lib/jsonExport";

interface DashboardExportOptions {
  startDate: Date;
  endDate: Date;
  summary?: any;
  metrics?: any[];
  trends?: any[];
  recipients?: any[];
  emails?: any[];
}

/**
 * Hook for exporting dashboard data
 */
export function useDashboardExport() {
  const formatDateRange = useCallback((startDate: Date, endDate: Date) => {
    return formatDateRangeForFilename(startDate, endDate);
  }, []);

  const exportData = useCallback(
    async (
      format: ExportFormat,
      type: ExportType,
      options: DashboardExportOptions
    ) => {
      const { startDate, endDate, summary, metrics, trends, recipients, emails } = options;
      const dateRange = formatDateRange(startDate, endDate);

      try {
        // Handle JSON format
        if (format === "json") {
          switch (type) {
            case "summary": {
              if (!summary) throw new Error("Summary data not available");
              const summaryData = {
                dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                totalEmails: summary.totalEmails || 0,
                totalOpens: summary.totalOpens || 0,
                totalClicks: summary.totalClicks || 0,
                totalBounces: summary.totalBounces || 0,
                totalComplaints: summary.totalComplaints || 0,
                averageOpenRate: summary.averageOpenRate || 0,
                averageClickRate: summary.averageClickRate || 0,
                averageEngagementScore: summary.averageEngagementScore || 0,
              };
              exportSummaryReportJSON(summaryData, dateRange, startDate, endDate);
              break;
            }

            case "metrics": {
              if (!metrics || metrics.length === 0) throw new Error("Metrics data not available");
              const metricsData = {
                metrics: metrics.map((m) => ({
                  name: m.name || "Unknown",
                  value: m.value || 0,
                  percentage: m.percentage,
                  trend: m.trend || "neutral",
                })),
              };
              exportEngagementMetricsJSON(metricsData, dateRange, startDate, endDate);
              break;
            }

            case "trends": {
              if (!trends || trends.length === 0) throw new Error("Trends data not available");
              const trendsData = {
                trends: trends.map((t) => ({
                  date: t.date || new Date().toISOString().split("T")[0],
                  opens: t.opens || 0,
                  clicks: t.clicks || 0,
                  bounces: t.bounces || 0,
                  complaints: t.complaints || 0,
                  averageOpenRate: t.averageOpenRate || 0,
                  averageClickRate: t.averageClickRate || 0,
                  averageEngagementScore: t.averageEngagementScore || 0,
                })),
              };
              exportEngagementTrendsJSON(trendsData, dateRange, startDate, endDate);
              break;
            }

            case "recipients": {
              if (!recipients || recipients.length === 0) throw new Error("Recipients data not available");
              const recipientsData = {
                recipients: recipients.map((r) => ({
                  email: r.email || "",
                  name: r.name || "",
                  totalEmails: r.totalEmails || 0,
                  opens: r.opens || 0,
                  clicks: r.clicks || 0,
                  bounces: r.bounces || 0,
                  complaints: r.complaints || 0,
                  openRate: r.openRate || 0,
                  clickRate: r.clickRate || 0,
                  engagementScore: r.engagementScore || 0,
                  lastEngagement: r.lastEngagement || "Never",
                  status: r.status || "active",
                })),
              };
              exportRecipientProfilesJSON(recipientsData, dateRange, startDate, endDate);
              break;
            }

            case "emails": {
              if (!emails || emails.length === 0) throw new Error("Email data not available");
              const emailsData = {
                emails: emails.map((e) => ({
                  id: e.id || "",
                  subject: e.subject || "",
                  sentDate: e.sentDate || new Date().toISOString().split("T")[0],
                  recipients: e.recipients || 0,
                  opens: e.opens || 0,
                  clicks: e.clicks || 0,
                  bounces: e.bounces || 0,
                  complaints: e.complaints || 0,
                  openRate: e.openRate || 0,
                  clickRate: e.clickRate || 0,
                  conversionRate: e.conversionRate || 0,
                  engagementScore: e.engagementScore || 0,
                })),
              };
              exportEmailPerformanceJSON(emailsData, dateRange, startDate, endDate);
              break;
            }

            case "comprehensive": {
              const comprehensiveData = {
                summary: {
                  dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                  totalEmails: summary?.totalEmails || 0,
                  totalOpens: summary?.totalOpens || 0,
                  totalClicks: summary?.totalClicks || 0,
                  totalBounces: summary?.totalBounces || 0,
                  totalComplaints: summary?.totalComplaints || 0,
                  averageOpenRate: summary?.averageOpenRate || 0,
                  averageClickRate: summary?.averageClickRate || 0,
                  averageEngagementScore: summary?.averageEngagementScore || 0,
                },
                metrics: metrics
                  ? metrics.map((m) => ({
                      name: m.name || "Unknown",
                      value: m.value || 0,
                      percentage: m.percentage,
                      trend: m.trend || "neutral",
                    }))
                  : [],
                trends: trends
                  ? trends.map((t) => ({
                      date: t.date || new Date().toISOString().split("T")[0],
                      opens: t.opens || 0,
                      clicks: t.clicks || 0,
                      bounces: t.bounces || 0,
                      complaints: t.complaints || 0,
                      averageOpenRate: t.averageOpenRate || 0,
                      averageClickRate: t.averageClickRate || 0,
                      averageEngagementScore: t.averageEngagementScore || 0,
                    }))
                  : [],
                recipients: recipients
                  ? recipients.map((r) => ({
                      email: r.email || "",
                      name: r.name || "",
                      totalEmails: r.totalEmails || 0,
                      opens: r.opens || 0,
                      clicks: r.clicks || 0,
                      bounces: r.bounces || 0,
                      complaints: r.complaints || 0,
                      openRate: r.openRate || 0,
                      clickRate: r.clickRate || 0,
                      engagementScore: r.engagementScore || 0,
                      lastEngagement: r.lastEngagement || "Never",
                      status: r.status || "active",
                    }))
                  : [],
                emails: emails
                  ? emails.map((e) => ({
                      id: e.id || "",
                      subject: e.subject || "",
                      sentDate: e.sentDate || new Date().toISOString().split("T")[0],
                      recipients: e.recipients || 0,
                      opens: e.opens || 0,
                      clicks: e.clicks || 0,
                      bounces: e.bounces || 0,
                      complaints: e.complaints || 0,
                      openRate: e.openRate || 0,
                      clickRate: e.clickRate || 0,
                      conversionRate: e.conversionRate || 0,
                      engagementScore: e.engagementScore || 0,
                    }))
                  : [],
              };
              exportComprehensiveReportJSON(comprehensiveData, dateRange, startDate, endDate);
              break;
            }

            default:
              throw new Error(`Unknown export type: ${type}`);
          }
          return;
        }

        // Handle CSV format (existing logic)
        switch (type) {
          case "summary": {
            if (!summary) throw new Error("Summary data not available");
            const summaryData: SummaryReportExport = {
              "Date Range": `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
              "Total Emails": summary.totalEmails || 0,
              "Total Opens": summary.totalOpens || 0,
              "Total Clicks": summary.totalClicks || 0,
              "Total Bounces": summary.totalBounces || 0,
              "Total Complaints": summary.totalComplaints || 0,
              "Average Open Rate": formatPercentage(summary.averageOpenRate || 0),
              "Average Click Rate": formatPercentage(summary.averageClickRate || 0),
              "Average Engagement Score": (summary.averageEngagementScore || 0).toFixed(2),
            };
            exportSummaryReportCSV(summaryData, dateRange);
            break;
          }

          case "metrics": {
            if (!metrics || metrics.length === 0) throw new Error("Metrics data not available");
            const metricsData: EngagementMetricsExport[] = metrics.map((m) => ({
              metric: m.name || "Unknown",
              value: m.value || 0,
              percentage: m.percentage ? formatPercentage(m.percentage) : undefined,
              trend: m.trend || "neutral",
            }));
            exportEngagementMetricsCSV(metricsData, dateRange);
            break;
          }

          case "trends": {
            if (!trends || trends.length === 0) throw new Error("Trends data not available");
            const trendsData: EngagementTrendExport[] = trends.map((t) => ({
              date: t.date || new Date().toISOString().split("T")[0],
              opens: t.opens || 0,
              clicks: t.clicks || 0,
              bounces: t.bounces || 0,
              complaints: t.complaints || 0,
              averageOpenRate: formatPercentage(t.averageOpenRate || 0),
              averageClickRate: formatPercentage(t.averageClickRate || 0),
              averageEngagementScore: (t.averageEngagementScore || 0).toFixed(2),
            }));
            exportEngagementTrendsCSV(trendsData, dateRange);
            break;
          }

          case "recipients": {
            if (!recipients || recipients.length === 0) throw new Error("Recipients data not available");
            const recipientsData: RecipientProfileExport[] = recipients.map((r) => ({
              email: r.email || "",
              name: r.name || "",
              totalEmails: r.totalEmails || 0,
              opens: r.opens || 0,
              clicks: r.clicks || 0,
              bounces: r.bounces || 0,
              complaints: r.complaints || 0,
              openRate: formatPercentage(r.openRate || 0),
              clickRate: formatPercentage(r.clickRate || 0),
              engagementScore: (r.engagementScore || 0).toFixed(2),
              lastEngagement: r.lastEngagement || "Never",
              status: r.status || "active",
            }));
            exportRecipientProfilesCSV(recipientsData, dateRange);
            break;
          }

          case "emails": {
            if (!emails || emails.length === 0) throw new Error("Email data not available");
            const emailsData: EmailPerformanceExport[] = emails.map((e) => ({
              emailId: e.id || "",
              subject: e.subject || "",
              sentDate: e.sentDate || new Date().toISOString().split("T")[0],
              recipients: e.recipients || 0,
              opens: e.opens || 0,
              clicks: e.clicks || 0,
              bounces: e.bounces || 0,
              complaints: e.complaints || 0,
              openRate: formatPercentage(e.openRate || 0),
              clickRate: formatPercentage(e.clickRate || 0),
              conversionRate: formatPercentage(e.conversionRate || 0),
              engagementScore: (e.engagementScore || 0).toFixed(2),
            }));
            exportEmailPerformanceCSV(emailsData, dateRange);
            break;
          }

          case "comprehensive": {
            const comprehensiveData: ComprehensiveExportData = {
              summary: {
                "Date Range": `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                "Total Emails": summary?.totalEmails || 0,
                "Total Opens": summary?.totalOpens || 0,
                "Total Clicks": summary?.totalClicks || 0,
                "Average Open Rate": formatPercentage(summary?.averageOpenRate || 0),
                "Average Click Rate": formatPercentage(summary?.averageClickRate || 0),
              },
              metrics: metrics
                ? metrics.map((m) => ({
                    metric: m.name || "Unknown",
                    value: m.value || 0,
                    percentage: m.percentage ? formatPercentage(m.percentage) : undefined,
                    trend: m.trend || "neutral",
                  }))
                : [],
              trends: trends
                ? trends.map((t) => ({
                    date: t.date || new Date().toISOString().split("T")[0],
                    opens: t.opens || 0,
                    clicks: t.clicks || 0,
                    bounces: t.bounces || 0,
                    complaints: t.complaints || 0,
                    averageOpenRate: formatPercentage(t.averageOpenRate || 0),
                    averageClickRate: formatPercentage(t.averageClickRate || 0),
                    averageEngagementScore: (t.averageEngagementScore || 0).toFixed(2),
                  }))
                : [],
              recipients: recipients
                ? recipients.map((r) => ({
                    email: r.email || "",
                    name: r.name || "",
                    totalEmails: r.totalEmails || 0,
                    opens: r.opens || 0,
                    clicks: r.clicks || 0,
                    bounces: r.bounces || 0,
                    complaints: r.complaints || 0,
                    openRate: formatPercentage(r.openRate || 0),
                    clickRate: formatPercentage(r.clickRate || 0),
                    engagementScore: (r.engagementScore || 0).toFixed(2),
                    lastEngagement: r.lastEngagement || "Never",
                    status: r.status || "active",
                  }))
                : [],
              emails: emails
                ? emails.map((e) => ({
                    emailId: e.id || "",
                    subject: e.subject || "",
                    sentDate: e.sentDate || new Date().toISOString().split("T")[0],
                    recipients: e.recipients || 0,
                    opens: e.opens || 0,
                    clicks: e.clicks || 0,
                    bounces: e.bounces || 0,
                    complaints: e.complaints || 0,
                    openRate: formatPercentage(e.openRate || 0),
                    clickRate: formatPercentage(e.clickRate || 0),
                    conversionRate: formatPercentage(e.conversionRate || 0),
                    engagementScore: (e.engagementScore || 0).toFixed(2),
                  }))
                : [],
            };
            exportComprehensiveReport(comprehensiveData, dateRange);
            break;
          }

          default:
            throw new Error(`Unknown export type: ${type}`);
        }
      } catch (error) {
        console.error("Export error:", error);
        throw error;
      }
    },
    [formatDateRange]
  );

  return { exportData };
}

import { renderEmailTemplate } from "./email-template-service";
import { getJobLoggingService } from "./job-logging-service";
import { replayAnalyticsService } from "./replay-analytics-service";
import { getDb } from "./db";
import { reportDeliveries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Email Report Generator Service
 * Generates formatted email reports with analytics data
 */
export class EmailReportGeneratorService {
  /**
   * Generate analytics report email
   */
  async generateAnalyticsReportEmail(data: {
    reportType: string;
    dateRangeType: string;
    customDaysBack?: number;
    recipientEmail: string;
    recipientName?: string;
  }): Promise<{ html: string; subject: string; attachments?: any[] }> {
    const daysBack = this.getDaysBack(data.dateRangeType, data.customDaysBack);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    let reportContent = "";
    let subject = "";

    switch (data.reportType) {
      case "summary":
        reportContent = await this.generateSummaryReportContent(startDate, endDate);
        subject = `Analytics Summary Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
        break;
      case "detailed":
        reportContent = await this.generateDetailedReportContent(startDate, endDate);
        subject = `Detailed Analytics Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
        break;
      case "performance":
        reportContent = await this.generatePerformanceReportContent(startDate, endDate);
        subject = `Performance Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
        break;
      default:
        throw new Error(`Unknown report type: ${data.reportType}`);
    }

    const html = await renderEmailTemplate("analytics-report", {
      recipientName: data.recipientName || "Team Member",
      reportType: data.reportType,
      reportContent,
      generatedAt: new Date().toLocaleString(),
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
    });

    return {
      html,
      subject,
    };
  }

  /**
   * Generate summary report content
   */
  private async generateSummaryReportContent(startDate: Date, endDate: Date): Promise<string> {
    const analytics = await replayAnalyticsService.getAnalyticsSummary(startDate, endDate);

    return `
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-top: 0;">Summary Statistics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Total Replays</td>
            <td style="padding: 10px; text-align: right;">${analytics.totalReplays || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Successful</td>
            <td style="padding: 10px; text-align: right; color: #28a745;">${analytics.successfulReplays || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Failed</td>
            <td style="padding: 10px; text-align: right; color: #dc3545;">${analytics.failedReplays || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Success Rate</td>
            <td style="padding: 10px; text-align: right;">${(analytics.successRate || 0).toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Avg Processing Time</td>
            <td style="padding: 10px; text-align: right;">${(analytics.averageProcessingTime || 0).toFixed(2)}ms</td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Generate detailed report content
   */
  private async generateDetailedReportContent(startDate: Date, endDate: Date): Promise<string> {
    const loggingService = getJobLoggingService();
    const logs = await loggingService.getJobLogs({
      startDate,
      endDate,
      limit: 1000,
    });

    const eventBreakdown = await replayAnalyticsService.getEventTypeBreakdown(startDate, endDate);
    const providerPerformance = await replayAnalyticsService.getProviderPerformance(startDate, endDate);

    let content = `
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-top: 0;">Event Type Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef; border-bottom: 1px solid #ddd;">
            <th style="padding: 10px; text-align: left;">Event Type</th>
            <th style="padding: 10px; text-align: right;">Count</th>
            <th style="padding: 10px; text-align: right;">Success Rate</th>
          </tr>
    `;

    eventBreakdown.forEach((event: any) => {
      content += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;">${event.eventType}</td>
          <td style="padding: 10px; text-align: right;">${event.count}</td>
          <td style="padding: 10px; text-align: right;">${(event.successRate || 0).toFixed(2)}%</td>
        </tr>
      `;
    });

    content += `
        </table>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-top: 0;">Provider Performance</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #e9ecef; border-bottom: 1px solid #ddd;">
            <th style="padding: 10px; text-align: left;">Provider</th>
            <th style="padding: 10px; text-align: right;">Events</th>
            <th style="padding: 10px; text-align: right;">Success Rate</th>
            <th style="padding: 10px; text-align: right;">Avg Response Time</th>
          </tr>
    `;

    providerPerformance.forEach((provider: any) => {
      content += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;">${provider.provider}</td>
          <td style="padding: 10px; text-align: right;">${provider.totalEvents}</td>
          <td style="padding: 10px; text-align: right;">${(provider.successRate || 0).toFixed(2)}%</td>
          <td style="padding: 10px; text-align: right;">${(provider.averageResponseTime || 0).toFixed(2)}ms</td>
        </tr>
      `;
    });

    content += `
        </table>
      </div>
    `;

    return content;
  }

  /**
   * Generate performance report content
   */
  private async generatePerformanceReportContent(startDate: Date, endDate: Date): Promise<string> {
    const loggingService = getJobLoggingService();
    const metrics = await loggingService.calculatePerformanceMetrics(
      "all",
      "all",
      startDate,
      endDate
    );

    return `
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-top: 0;">Performance Metrics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Total Jobs</td>
            <td style="padding: 10px; text-align: right;">${metrics.totalJobs || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Successful Jobs</td>
            <td style="padding: 10px; text-align: right; color: #28a745;">${metrics.successfulJobs || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Failed Jobs</td>
            <td style="padding: 10px; text-align: right; color: #dc3545;">${metrics.failedJobs || 0}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Success Rate</td>
            <td style="padding: 10px; text-align: right;">${(metrics.successRate || 0).toFixed(2)}%</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Average Duration</td>
            <td style="padding: 10px; text-align: right;">${(metrics.averageDuration || 0).toFixed(2)}ms</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Min Duration</td>
            <td style="padding: 10px; text-align: right;">${(metrics.minDuration || 0).toFixed(2)}ms</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Max Duration</td>
            <td style="padding: 10px; text-align: right;">${(metrics.maxDuration || 0).toFixed(2)}ms</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">Average Processing Time</td>
            <td style="padding: 10px; text-align: right;">${(metrics.averageProcessingTime || 0).toFixed(2)}ms</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Average Queue Wait Time</td>
            <td style="padding: 10px; text-align: right;">${(metrics.averageQueueWaitTime || 0).toFixed(2)}ms</td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Get days back from date range type
   */
  private getDaysBack(dateRangeType: string, customDaysBack?: number): number {
    switch (dateRangeType) {
      case "last7days":
        return 7;
      case "last30days":
        return 30;
      case "last90days":
        return 90;
      case "custom":
        return customDaysBack || 7;
      default:
        return 7;
    }
  }

  /**
   * Update report delivery status
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    errorMessage?: string,
    sentAt?: Date
  ) {
    try {
      const db = await getDb();
      const updates: any = { status };

      if (sentAt) updates.sentAt = sentAt;
      if (errorMessage) updates.errorMessage = errorMessage;

      await db.update(reportDeliveries).set(updates).where(eq(reportDeliveries.id, deliveryId));
    } catch (error) {
      console.error(`Failed to update delivery status: ${error}`);
    }
  }
}

// Singleton instance
let emailReportGeneratorService: EmailReportGeneratorService;

export function getEmailReportGeneratorService(): EmailReportGeneratorService {
  if (!emailReportGeneratorService) {
    emailReportGeneratorService = new EmailReportGeneratorService();
  }
  return emailReportGeneratorService;
}

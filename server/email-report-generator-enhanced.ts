import { renderToString } from 'react-dom/server';
import { emailTemplateService } from './email-template-service';
import { replayAnalyticsService } from './replay-analytics-service';
import { webhookAnalyticsService } from './webhook-analytics-service';
import { jobLoggingService } from './job-logging-service';

export interface ReportGenerationOptions {
  scheduleId: number;
  reportType: 'replay' | 'webhook' | 'job' | 'summary' | 'performance' | 'anomaly';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  recipients: string[];
  includeCharts?: boolean;
  includeRawData?: boolean;
  timezone?: string;
}

export interface GeneratedReport {
  htmlContent: string;
  textContent: string;
  subject: string;
  recipients: string[];
  reportType: string;
  generatedAt: Date;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * Enhanced Email Report Generator
 * Generates formatted HTML reports for scheduled delivery
 */
export class EmailReportGeneratorEnhanced {
  /**
   * Generate a replay analytics report
   */
  static async generateReplayReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    const { dateRange, recipients, timezone = 'UTC' } = options;

    // Fetch replay analytics data
    const analytics = await replayAnalyticsService.getAnalyticsSummary(
      dateRange.startDate,
      dateRange.endDate
    );

    const successRates = await replayAnalyticsService.getSuccessRatesTrend(
      dateRange.startDate,
      dateRange.endDate,
      'daily'
    );

    const eventTypeDistribution = await replayAnalyticsService.getEventTypeDistribution(
      dateRange.startDate,
      dateRange.endDate
    );

    // Generate HTML content
    const htmlContent = this.generateReplayReportHTML({
      analytics,
      successRates,
      eventTypeDistribution,
      dateRange,
      timezone,
    });

    // Generate text version
    const textContent = this.generateReplayReportText({
      analytics,
      successRates,
      eventTypeDistribution,
      dateRange,
    });

    return {
      htmlContent,
      textContent,
      subject: `Replay Analytics Report - ${this.formatDateRange(dateRange)}`,
      recipients,
      reportType: 'replay',
      generatedAt: new Date(),
      dateRange,
    };
  }

  /**
   * Generate a webhook analytics report
   */
  static async generateWebhookReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    const { dateRange, recipients, timezone = 'UTC' } = options;

    // Fetch webhook analytics data
    const metrics = await webhookAnalyticsService.getMetrics(
      dateRange.startDate,
      dateRange.endDate
    );

    const providerComparison = await webhookAnalyticsService.getProviderComparison(
      dateRange.startDate,
      dateRange.endDate
    );

    const eventBreakdown = await webhookAnalyticsService.getEventTypeBreakdown(
      dateRange.startDate,
      dateRange.endDate
    );

    // Generate HTML content
    const htmlContent = this.generateWebhookReportHTML({
      metrics,
      providerComparison,
      eventBreakdown,
      dateRange,
      timezone,
    });

    // Generate text version
    const textContent = this.generateWebhookReportText({
      metrics,
      providerComparison,
      eventBreakdown,
      dateRange,
    });

    return {
      htmlContent,
      textContent,
      subject: `Webhook Analytics Report - ${this.formatDateRange(dateRange)}`,
      recipients,
      reportType: 'webhook',
      generatedAt: new Date(),
      dateRange,
    };
  }

  /**
   * Generate a job execution report
   */
  static async generateJobReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    const { dateRange, recipients, timezone = 'UTC' } = options;

    // Fetch job execution data
    const executionStats = await jobLoggingService.getExecutionStatistics(
      dateRange.startDate,
      dateRange.endDate
    );

    const performanceMetrics = await jobLoggingService.getPerformanceMetrics(
      dateRange.startDate,
      dateRange.endDate
    );

    const errorSummary = await jobLoggingService.getErrorSummary(
      dateRange.startDate,
      dateRange.endDate
    );

    // Generate HTML content
    const htmlContent = this.generateJobReportHTML({
      executionStats,
      performanceMetrics,
      errorSummary,
      dateRange,
      timezone,
    });

    // Generate text version
    const textContent = this.generateJobReportText({
      executionStats,
      performanceMetrics,
      errorSummary,
      dateRange,
    });

    return {
      htmlContent,
      textContent,
      subject: `Job Execution Report - ${this.formatDateRange(dateRange)}`,
      recipients,
      reportType: 'job',
      generatedAt: new Date(),
      dateRange,
    };
  }

  /**
   * Generate comprehensive summary report
   */
  static async generateSummaryReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    const { dateRange, recipients, timezone = 'UTC' } = options;

    // Fetch all analytics data
    const replayAnalytics = await replayAnalyticsService.getAnalyticsSummary(
      dateRange.startDate,
      dateRange.endDate
    );

    const webhookMetrics = await webhookAnalyticsService.getMetrics(
      dateRange.startDate,
      dateRange.endDate
    );

    const jobStats = await jobLoggingService.getExecutionStatistics(
      dateRange.startDate,
      dateRange.endDate
    );

    // Generate HTML content
    const htmlContent = this.generateSummaryReportHTML({
      replayAnalytics,
      webhookMetrics,
      jobStats,
      dateRange,
      timezone,
    });

    // Generate text version
    const textContent = this.generateSummaryReportText({
      replayAnalytics,
      webhookMetrics,
      jobStats,
      dateRange,
    });

    return {
      htmlContent,
      textContent,
      subject: `System Summary Report - ${this.formatDateRange(dateRange)}`,
      recipients,
      reportType: 'summary',
      generatedAt: new Date(),
      dateRange,
    };
  }

  /**
   * Generate replay report HTML
   */
  private static generateReplayReportHTML(data: any): string {
    const { analytics, successRates, eventTypeDistribution, dateRange, timezone } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .section h2 { margin-top: 0; color: #667eea; font-size: 18px; }
    .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .metric:last-child { border-bottom: none; }
    .metric-label { font-weight: 600; }
    .metric-value { color: #667eea; font-weight: 700; }
    .success { color: #10b981; }
    .warning { color: #f59e0b; }
    .error { color: #ef4444; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-value { font-size: 24px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Replay Analytics Report</h1>
      <p>Period: ${this.formatDateRange(dateRange)} (${timezone})</p>
    </div>

    <div class="section">
      <h2>Executive Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${analytics?.totalReplays || 0}</div>
          <div class="stat-label">Total Replays</div>
        </div>
        <div class="stat-card">
          <div class="stat-value ${analytics?.successRate >= 95 ? 'success' : analytics?.successRate >= 80 ? 'warning' : 'error'}">
            ${(analytics?.successRate || 0).toFixed(1)}%
          </div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
      <div class="metric">
        <span class="metric-label">Successful Replays:</span>
        <span class="metric-value success">${analytics?.successfulReplays || 0}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Failed Replays:</span>
        <span class="metric-value error">${analytics?.failedReplays || 0}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Average Processing Time:</span>
        <span class="metric-value">${(analytics?.avgProcessingTime || 0).toFixed(2)}ms</span>
      </div>
    </div>

    <div class="section">
      <h2>Event Type Distribution</h2>
      <table>
        <thead>
          <tr>
            <th>Event Type</th>
            <th>Count</th>
            <th>Success Rate</th>
          </tr>
        </thead>
        <tbody>
          ${eventTypeDistribution?.map((et: any) => `
            <tr>
              <td>${et.eventType}</td>
              <td>${et.count}</td>
              <td class="${et.successRate >= 95 ? 'success' : et.successRate >= 80 ? 'warning' : 'error'}">
                ${et.successRate.toFixed(1)}%
              </td>
            </tr>
          `).join('') || '<tr><td colspan="3">No data available</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Trend Analysis</h2>
      <p>Success rate trend over the reporting period shows ${successRates?.trend || 'stable'} performance.</p>
      <div class="metric">
        <span class="metric-label">Peak Success Rate:</span>
        <span class="metric-value success">${(successRates?.peak || 0).toFixed(1)}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">Lowest Success Rate:</span>
        <span class="metric-value ${successRates?.low >= 80 ? 'warning' : 'error'}">${(successRates?.low || 0).toFixed(1)}%</span>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated report generated by Pikme Analytics System</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate replay report text version
   */
  private static generateReplayReportText(data: any): string {
    const { analytics, successRates, eventTypeDistribution, dateRange } = data;

    return `
REPLAY ANALYTICS REPORT
${this.formatDateRange(dateRange)}

EXECUTIVE SUMMARY
Total Replays: ${analytics?.totalReplays || 0}
Successful: ${analytics?.successfulReplays || 0}
Failed: ${analytics?.failedReplays || 0}
Success Rate: ${(analytics?.successRate || 0).toFixed(1)}%
Avg Processing Time: ${(analytics?.avgProcessingTime || 0).toFixed(2)}ms

EVENT TYPE DISTRIBUTION
${eventTypeDistribution?.map((et: any) => `${et.eventType}: ${et.count} (${et.successRate.toFixed(1)}%)`).join('\n') || 'No data available'}

TREND ANALYSIS
Peak Success Rate: ${(successRates?.peak || 0).toFixed(1)}%
Lowest Success Rate: ${(successRates?.low || 0).toFixed(1)}%
Trend: ${successRates?.trend || 'stable'}

---
This is an automated report generated by Pikme Analytics System
Generated: ${new Date().toLocaleString()}
    `;
  }

  /**
   * Generate webhook report HTML
   */
  private static generateWebhookReportHTML(data: any): string {
    const { metrics, providerComparison, eventBreakdown, dateRange, timezone } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-value { font-size: 24px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔗 Webhook Analytics Report</h1>
      <p>Period: ${this.formatDateRange(dateRange)} (${timezone})</p>
    </div>

    <div class="section">
      <h2>Webhook Delivery Metrics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${metrics?.totalWebhooks || 0}</div>
          <div class="stat-label">Total Webhooks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(metrics?.deliveryRate || 0).toFixed(1)}%</div>
          <div class="stat-label">Delivery Rate</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Provider Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Delivered</th>
            <th>Failed</th>
            <th>Success Rate</th>
          </tr>
        </thead>
        <tbody>
          ${providerComparison?.map((p: any) => `
            <tr>
              <td>${p.provider}</td>
              <td>${p.delivered}</td>
              <td>${p.failed}</td>
              <td>${(p.successRate || 0).toFixed(1)}%</td>
            </tr>
          `).join('') || '<tr><td colspan="4">No data available</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>This is an automated report generated by Pikme Analytics System</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate webhook report text version
   */
  private static generateWebhookReportText(data: any): string {
    const { metrics, providerComparison, dateRange } = data;

    return `
WEBHOOK ANALYTICS REPORT
${this.formatDateRange(dateRange)}

DELIVERY METRICS
Total Webhooks: ${metrics?.totalWebhooks || 0}
Delivery Rate: ${(metrics?.deliveryRate || 0).toFixed(1)}%

PROVIDER PERFORMANCE
${providerComparison?.map((p: any) => `${p.provider}: ${p.delivered} delivered, ${p.failed} failed (${(p.successRate || 0).toFixed(1)}%)`).join('\n') || 'No data available'}

---
Generated: ${new Date().toLocaleString()}
    `;
  }

  /**
   * Generate job report HTML
   */
  private static generateJobReportHTML(data: any): string {
    const { executionStats, performanceMetrics, errorSummary, dateRange, timezone } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-value { font-size: 24px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚙️ Job Execution Report</h1>
      <p>Period: ${this.formatDateRange(dateRange)} (${timezone})</p>
    </div>

    <div class="section">
      <h2>Execution Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${executionStats?.totalJobs || 0}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(executionStats?.successRate || 0).toFixed(1)}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Performance Metrics</h2>
      <p>Avg Duration: ${(performanceMetrics?.avgDuration || 0).toFixed(2)}ms</p>
      <p>Max Duration: ${(performanceMetrics?.maxDuration || 0).toFixed(2)}ms</p>
      <p>Min Duration: ${(performanceMetrics?.minDuration || 0).toFixed(2)}ms</p>
    </div>

    <div class="footer">
      <p>This is an automated report generated by Pikme Analytics System</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate job report text version
   */
  private static generateJobReportText(data: any): string {
    const { executionStats, performanceMetrics, dateRange } = data;

    return `
JOB EXECUTION REPORT
${this.formatDateRange(dateRange)}

EXECUTION SUMMARY
Total Jobs: ${executionStats?.totalJobs || 0}
Success Rate: ${(executionStats?.successRate || 0).toFixed(1)}%

PERFORMANCE METRICS
Avg Duration: ${(performanceMetrics?.avgDuration || 0).toFixed(2)}ms
Max Duration: ${(performanceMetrics?.maxDuration || 0).toFixed(2)}ms
Min Duration: ${(performanceMetrics?.minDuration || 0).toFixed(2)}ms

---
Generated: ${new Date().toLocaleString()}
    `;
  }

  /**
   * Generate summary report HTML
   */
  private static generateSummaryReportHTML(data: any): string {
    const { replayAnalytics, webhookMetrics, jobStats, dateRange, timezone } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-value { font-size: 20px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
    .footer { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 System Summary Report</h1>
      <p>Period: ${this.formatDateRange(dateRange)} (${timezone})</p>
    </div>

    <div class="section">
      <h2>Replay Analytics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${replayAnalytics?.totalReplays || 0}</div>
          <div class="stat-label">Total Replays</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(replayAnalytics?.successRate || 0).toFixed(1)}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Webhook Metrics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${webhookMetrics?.totalWebhooks || 0}</div>
          <div class="stat-label">Total Webhooks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(webhookMetrics?.deliveryRate || 0).toFixed(1)}%</div>
          <div class="stat-label">Delivery Rate</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Job Execution</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${jobStats?.totalJobs || 0}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${(jobStats?.successRate || 0).toFixed(1)}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated report generated by Pikme Analytics System</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate summary report text version
   */
  private static generateSummaryReportText(data: any): string {
    const { replayAnalytics, webhookMetrics, jobStats, dateRange } = data;

    return `
SYSTEM SUMMARY REPORT
${this.formatDateRange(dateRange)}

REPLAY ANALYTICS
Total Replays: ${replayAnalytics?.totalReplays || 0}
Success Rate: ${(replayAnalytics?.successRate || 0).toFixed(1)}%

WEBHOOK METRICS
Total Webhooks: ${webhookMetrics?.totalWebhooks || 0}
Delivery Rate: ${(webhookMetrics?.deliveryRate || 0).toFixed(1)}%

JOB EXECUTION
Total Jobs: ${jobStats?.totalJobs || 0}
Success Rate: ${(jobStats?.successRate || 0).toFixed(1)}%

---
Generated: ${new Date().toLocaleString()}
    `;
  }

  /**
   * Format date range for display
   */
  private static formatDateRange(dateRange: { startDate: Date; endDate: Date }): string {
    const start = new Date(dateRange.startDate).toLocaleDateString();
    const end = new Date(dateRange.endDate).toLocaleDateString();
    return `${start} to ${end}`;
  }
}

export const emailReportGeneratorEnhanced = EmailReportGeneratorEnhanced;

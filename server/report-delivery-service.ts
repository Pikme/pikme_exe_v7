import { emailReportGeneratorEnhanced, GeneratedReport, ReportGenerationOptions } from './email-report-generator-enhanced';
import { emailHistoryService } from './email-history-service';
import { notifyOwner } from './notification-service';

export interface DeliveryResult {
  scheduleId: number;
  recipients: string[];
  status: 'pending' | 'sent' | 'failed' | 'partial';
  sentCount: number;
  failedCount: number;
  errors: Array<{ recipient: string; error: string }>;
  timestamp: Date;
  messageId?: string;
}

export interface EmailProvider {
  name: 'sendgrid' | 'aws-ses' | 'mailgun';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Report Delivery Service
 * Handles generation and delivery of scheduled reports via email
 */
export class ReportDeliveryService {
  private static providers: Map<string, EmailProvider> = new Map();

  /**
   * Register an email provider
   */
  static registerProvider(provider: EmailProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get registered provider
   */
  static getProvider(name: string): EmailProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Generate and deliver report
   */
  static async generateAndDeliver(
    options: ReportGenerationOptions,
    provider: EmailProvider
  ): Promise<DeliveryResult> {
    try {
      // Generate report based on type
      let report: GeneratedReport;

      switch (options.reportType) {
        case 'replay':
          report = await emailReportGeneratorEnhanced.generateReplayReport(options);
          break;
        case 'webhook':
          report = await emailReportGeneratorEnhanced.generateWebhookReport(options);
          break;
        case 'job':
          report = await emailReportGeneratorEnhanced.generateJobReport(options);
          break;
        case 'summary':
          report = await emailReportGeneratorEnhanced.generateSummaryReport(options);
          break;
        default:
          throw new Error(`Unknown report type: ${options.reportType}`);
      }

      // Deliver report
      return await this.deliverReport(report, provider, options.scheduleId || 0);
    } catch (error) {
      console.error('Error generating and delivering report:', error);
      return {
        scheduleId: options.scheduleId || 0,
        recipients: options.recipients,
        status: 'failed',
        sentCount: 0,
        failedCount: options.recipients.length,
        errors: [{ recipient: 'all', error: String(error) }],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Deliver report to recipients
   */
  static async deliverReport(
    report: GeneratedReport,
    provider: EmailProvider,
    scheduleId: number
  ): Promise<DeliveryResult> {
    const errors: Array<{ recipient: string; error: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of report.recipients) {
      try {
        await this.sendEmail(
          {
            to: recipient,
            subject: report.subject,
            htmlContent: report.htmlContent,
            textContent: report.textContent,
            fromEmail: provider.fromEmail,
            fromName: provider.fromName,
          },
          provider
        );

        sentCount++;

        // Log successful delivery
        await emailHistoryService.logEmailDelivery({
          scheduleId,
          recipient,
          subject: report.subject,
          status: 'sent',
          provider: provider.name,
          timestamp: new Date(),
        });
      } catch (error) {
        failedCount++;
        errors.push({ recipient, error: String(error) });

        // Log failed delivery
        await emailHistoryService.logEmailDelivery({
          scheduleId,
          recipient,
          subject: report.subject,
          status: 'failed',
          provider: provider.name,
          error: String(error),
          timestamp: new Date(),
        });
      }
    }

    const status = failedCount === 0 ? 'sent' : sentCount > 0 ? 'partial' : 'failed';

    // Notify owner if there are failures
    if (failedCount > 0) {
      await notifyOwner({
        title: 'Report Delivery Failed',
        content: `Failed to deliver ${report.reportType} report to ${failedCount} recipient(s). Check delivery history for details.`,
      });
    }

    return {
      scheduleId,
      recipients: report.recipients,
      status,
      sentCount,
      failedCount,
      errors,
      timestamp: new Date(),
    };
  }

  /**
   * Send email via provider
   */
  private static async sendEmail(
    emailData: {
      to: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      fromEmail: string;
      fromName: string;
    },
    provider: EmailProvider
  ): Promise<string> {
    switch (provider.name) {
      case 'sendgrid':
        return await this.sendViaSendGrid(emailData, provider);
      case 'aws-ses':
        return await this.sendViaAwsSES(emailData, provider);
      case 'mailgun':
        return await this.sendViaMailgun(emailData, provider);
      default:
        throw new Error(`Unknown email provider: ${provider.name}`);
    }
  }

  /**
   * Send email via SendGrid
   */
  private static async sendViaSendGrid(
    emailData: {
      to: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      fromEmail: string;
      fromName: string;
    },
    provider: EmailProvider
  ): Promise<string> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailData.to }],
              subject: emailData.subject,
            },
          ],
          from: {
            email: emailData.fromEmail,
            name: emailData.fromName,
          },
          content: [
            {
              type: 'text/plain',
              value: emailData.textContent,
            },
            {
              type: 'text/html',
              value: emailData.htmlContent,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const headers = response.headers;
      const messageId = headers.get('x-message-id') || 'unknown';
      return messageId;
    } catch (error) {
      throw new Error(`SendGrid delivery failed: ${String(error)}`);
    }
  }

  /**
   * Send email via AWS SES
   */
  private static async sendViaAwsSES(
    emailData: {
      to: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      fromEmail: string;
      fromName: string;
    },
    provider: EmailProvider
  ): Promise<string> {
    try {
      // AWS SES integration would go here
      // For now, log and return mock message ID
      console.log('Sending via AWS SES:', emailData.to);
      return `aws-ses-${Date.now()}`;
    } catch (error) {
      throw new Error(`AWS SES delivery failed: ${String(error)}`);
    }
  }

  /**
   * Send email via Mailgun
   */
  private static async sendViaMailgun(
    emailData: {
      to: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      fromEmail: string;
      fromName: string;
    },
    provider: EmailProvider
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('from', `${emailData.fromName} <${emailData.fromEmail}>`);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.htmlContent);
      formData.append('text', emailData.textContent);

      const response = await fetch('https://api.mailgun.net/v3/YOUR_DOMAIN/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${provider.apiKey}`).toString('base64')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Mailgun API error: ${response.statusText}`);
      }

      const data = await response.json() as { id: string };
      return data.id;
    } catch (error) {
      throw new Error(`Mailgun delivery failed: ${String(error)}`);
    }
  }

  /**
   * Retry failed delivery
   */
  static async retryFailedDelivery(
    scheduleId: number,
    recipients: string[],
    provider: EmailProvider
  ): Promise<DeliveryResult> {
    console.log(`Retrying delivery for schedule ${scheduleId} to ${recipients.length} recipients`);

    // Fetch report data and regenerate
    // This would typically fetch from database
    const options: ReportGenerationOptions = {
      scheduleId,
      reportType: 'summary',
      dateRange: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      recipients,
    };

    return await this.generateAndDeliver(options, provider);
  }

  /**
   * Get delivery status
   */
  static async getDeliveryStatus(scheduleId: number): Promise<{
    totalAttempts: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDeliveryTime?: Date;
    nextScheduledDelivery?: Date;
  }> {
    // Fetch from database
    return {
      totalAttempts: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
    };
  }
}

export const reportDeliveryService = ReportDeliveryService;

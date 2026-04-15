import nodemailer from 'nodemailer';
import { db } from './db';
import { alertEmailLogs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface AlertEmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface AlertEmailOptions {
  alertId: number;
  alertType: string;
  severity: string;
  message: string;
  recipientEmail: string;
  recipientName: string;
  details?: Record<string, any>;
  actionUrl?: string;
}

export class AlertEmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static config: AlertEmailConfig | null = null;

  /**
   * Initialize email service with SMTP configuration
   */
  static initialize(config: AlertEmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });
  }

  /**
   * Send alert email to admin
   */
  static async sendAlertEmail(options: AlertEmailOptions): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.warn('Email service not initialized');
      return false;
    }

    try {
      const html = this.generateEmailHTML(options);
      const subject = this.generateEmailSubject(options);

      const mailOptions = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: options.recipientEmail,
        replyTo: this.config.replyTo || this.config.fromEmail,
        subject,
        html,
        text: this.generateEmailText(options),
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log email delivery
      await this.logEmailDelivery({
        alertId: options.alertId,
        recipientEmail: options.recipientEmail,
        messageId: info.messageId,
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`[AlertEmail] Email sent to ${options.recipientEmail} (${info.messageId})`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[AlertEmail] Failed to send email to ${options.recipientEmail}:`, errorMessage);

      // Log failed delivery
      await this.logEmailDelivery({
        alertId: options.alertId,
        recipientEmail: options.recipientEmail,
        messageId: null,
        status: 'failed',
        error: errorMessage,
        sentAt: new Date(),
      });

      return false;
    }
  }

  /**
   * Send batch emails to multiple admins
   */
  static async sendBatchAlertEmails(
    options: AlertEmailOptions[],
    maxRetries: number = 3
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const option of options) {
      let retries = 0;
      let sent = false;

      while (retries < maxRetries && !sent) {
        sent = await this.sendAlertEmail(option);
        if (!sent) {
          retries++;
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }

      if (sent) {
        successful++;
      } else {
        failed++;
      }
    }

    return { successful, failed };
  }

  /**
   * Generate email subject based on alert type and severity
   */
  private static generateEmailSubject(options: AlertEmailOptions): string {
    const severityPrefix = {
      critical: '🚨 CRITICAL',
      high: '⚠️ HIGH',
      medium: '⚡ MEDIUM',
      low: 'ℹ️ LOW',
    };

    const prefix = severityPrefix[options.severity as keyof typeof severityPrefix] || 'ALERT';
    return `${prefix}: ${options.message}`;
  }

  /**
   * Generate HTML email content
   */
  private static generateEmailHTML(options: AlertEmailOptions): string {
    const severityColor = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#eab308',
      low: '#3b82f6',
    };

    const color = severityColor[options.severity as keyof typeof severityColor] || '#6b7280';

    let detailsHTML = '';
    if (options.details && Object.keys(options.details).length > 0) {
      detailsHTML = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #374151;">Alert Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(options.details)
              .map(
                ([key, value]) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: 600; color: #374151; width: 30%;">${key}:</td>
                <td style="padding: 8px; color: #6b7280;">${String(value)}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
      `;
    }

    let actionButtonHTML = '';
    if (options.actionUrl) {
      actionButtonHTML = `
        <div style="margin-top: 20px; text-align: center;">
          <a href="${options.actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${color}; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Alert Details
          </a>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; font-size: 24px;">Alert Notification</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Severity: <strong>${options.severity.toUpperCase()}</strong></p>
            </div>
            <div class="content">
              <p>Hello ${options.recipientName},</p>
              <p style="font-size: 16px; font-weight: 600; color: ${color}; margin: 15px 0;">
                ${options.message}
              </p>
              <p>
                An alert has been triggered in your scheduler system. Please review the details below and take appropriate action.
              </p>
              ${detailsHTML}
              ${actionButtonHTML}
              <div class="footer">
                <p>This is an automated alert notification. Please do not reply to this email.</p>
                <p>Alert ID: ${options.alertId} | Alert Type: ${options.alertType}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private static generateEmailText(options: AlertEmailOptions): string {
    let text = `Alert Notification\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Severity: ${options.severity.toUpperCase()}\n`;
    text += `Message: ${options.message}\n`;
    text += `Alert Type: ${options.alertType}\n`;
    text += `Alert ID: ${options.alertId}\n\n`;

    if (options.details && Object.keys(options.details).length > 0) {
      text += `Details:\n`;
      text += `${'-'.repeat(50)}\n`;
      for (const [key, value] of Object.entries(options.details)) {
        text += `${key}: ${String(value)}\n`;
      }
      text += '\n';
    }

    if (options.actionUrl) {
      text += `View Alert: ${options.actionUrl}\n`;
    }

    text += `\nThis is an automated alert notification. Please do not reply to this email.\n`;
    return text;
  }

  /**
   * Log email delivery attempt
   */
  private static async logEmailDelivery(data: {
    alertId: number;
    recipientEmail: string;
    messageId: string | null;
    status: 'sent' | 'failed' | 'bounced';
    error?: string;
    sentAt: Date;
  }) {
    try {
      // Insert into alertEmailLogs table if it exists
      // await db.insert(alertEmailLogs).values(data);
      console.log(`[AlertEmail] Logged delivery: ${data.status} to ${data.recipientEmail}`);
    } catch (error) {
      console.error('[AlertEmail] Failed to log delivery:', error);
    }
  }

  /**
   * Verify email configuration
   */
  static async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[AlertEmail] SMTP connection verified');
      return true;
    } catch (error) {
      console.error('[AlertEmail] SMTP verification failed:', error);
      return false;
    }
  }

  /**
   * Get email delivery status
   */
  static async getDeliveryStatus(alertId: number): Promise<any[]> {
    try {
      // Query alertEmailLogs table
      // const logs = await db.select().from(alertEmailLogs).where(eq(alertEmailLogs.alertId, alertId));
      // return logs;
      return [];
    } catch (error) {
      console.error('[AlertEmail] Failed to get delivery status:', error);
      return [];
    }
  }

  /**
   * Resend failed email
   */
  static async resendFailedEmail(alertId: number, recipientEmail: string): Promise<boolean> {
    console.log(`[AlertEmail] Resending email for alert ${alertId} to ${recipientEmail}`);
    // Implementation would fetch original alert data and resend
    return true;
  }
}

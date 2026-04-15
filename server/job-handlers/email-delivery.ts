import Queue from "bull";
import { getJobQueueService } from "../job-queue-service";
import { getDb } from "../db";
import { emailTemplateService } from "../email-template-service";
import { eq } from "drizzle-orm";
import { reportDeliveries } from "../../drizzle/schema";

/**
 * Email Delivery Job Handler
 * Processes email delivery jobs from the queue
 */
export class EmailDeliveryJobHandler {
  private queue: Queue.Queue;

  constructor() {
    this.queue = getJobQueueService().getEmailDeliveryQueue();
    this.setupProcessor();
  }

  /**
   * Set up the job processor
   */
  private setupProcessor() {
    this.queue.process(10, async (job) => {
      console.log(`[Email Delivery] Processing job ${job.id}:`, job.data);

      try {
        const { deliveryId, recipients, subject, reportData, attachmentFormat } = job.data;

        // Generate email HTML
        const emailHtml = await this.generateEmailHtml(reportData, attachmentFormat);

        // Send emails to all recipients
        const results = await Promise.allSettled(
          recipients.map((recipient) => this.sendEmail(recipient, subject, emailHtml))
        );

        // Check if all emails were sent successfully
        const failedCount = results.filter((r) => r.status === "rejected").length;
        const successCount = results.length - failedCount;

        // Update delivery status
        if (failedCount === 0) {
          await this.updateDeliveryStatus(deliveryId, "sent", null);
        } else if (successCount > 0) {
          await this.updateDeliveryStatus(
            deliveryId,
            "partial",
            `Sent to ${successCount}/${results.length} recipients`
          );
        } else {
          await this.updateDeliveryStatus(deliveryId, "failed", "Failed to send to all recipients");
        }

        job.progress(100);
        return {
          success: failedCount === 0,
          sent: successCount,
          failed: failedCount,
          total: results.length,
        };
      } catch (error: any) {
        console.error(`[Email Delivery] Job ${job.id} error:`, error);

        // Update delivery status to failed
        if (job.data.deliveryId) {
          await this.updateDeliveryStatus(job.data.deliveryId, "failed", error.message);
        }

        throw error;
      }
    });
  }

  /**
   * Generate email HTML from report data
   */
  private async generateEmailHtml(reportData: any, attachmentFormat?: string): Promise<string> {
    // Use email template service to render the report
    const template = await emailTemplateService.renderTemplate("report-delivery", {
      reportType: reportData.type,
      generatedAt: reportData.generatedAt,
      period: reportData.period,
      summary: reportData.summary || reportData,
      metrics: reportData.metrics,
      events: reportData.events,
      providers: reportData.providers,
      errors: reportData.errors,
      attachmentFormat,
    });

    return template;
  }

  /**
   * Send email to a single recipient
   */
  private async sendEmail(recipient: string, subject: string, htmlContent: string): Promise<void> {
    // TODO: Integrate with email service provider (SendGrid, AWS SES, etc.)
    // For now, we'll just log the email
    console.log(`[Email Delivery] Sending email to ${recipient}:`, {
      subject,
      contentLength: htmlContent.length,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In production, this would call the actual email service
    // Example:
    // await sendGridClient.send({
    //   to: recipient,
    //   from: 'reports@pikmeusa.com',
    //   subject,
    //   html: htmlContent,
    // });
  }

  /**
   * Update delivery status in database
   */
  private async updateDeliveryStatus(deliveryId: string, status: string, errorMessage: string | null) {
    try {
      const db = await getDb();
      const updates: any = { status };

      if (status === "sent") {
        updates.sentAt = new Date();
      }

      if (errorMessage) {
        updates.errorMessage = errorMessage;
      }

      await db.update(reportDeliveries).set(updates).where(eq(reportDeliveries.id, deliveryId));
    } catch (error) {
      console.error(`Failed to update delivery status: ${error}`);
    }
  }
}

// Initialize handler
export function initEmailDeliveryHandler() {
  return new EmailDeliveryJobHandler();
}

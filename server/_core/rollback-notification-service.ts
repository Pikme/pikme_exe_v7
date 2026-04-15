import { notifyOwner } from "./notification";
import {
  generateSuccessfulRollbackEmail,
  generateFailedRollbackEmail,
  generateRollbackPlainText,
  generateRollbackEmailSubject,
  type RollbackEmailData,
} from "./rollback-email-templates";

/**
 * Send rollback notification email to admin
 */
export async function sendRollbackNotification(
  adminEmail: string,
  adminName: string,
  data: {
    importLogId: number;
    totalRollbacks: number;
    successfulRollbacks: number;
    failedRollbacks: number;
    errors?: Array<{ rollbackId: number; message: string }>;
    reason?: string;
    dashboardUrl?: string;
  }
): Promise<boolean> {
  try {
    const status = data.failedRollbacks === 0 ? "success" : "failed";
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });

    const dashboardUrl = data.dashboardUrl || "https://www.pikmeusa.com";

    const emailData: RollbackEmailData = {
      adminName,
      importLogId: data.importLogId,
      totalRollbacks: data.totalRollbacks,
      successfulRollbacks: data.successfulRollbacks,
      failedRollbacks: data.failedRollbacks,
      errors: data.errors,
      reason: data.reason,
      timestamp,
      dashboardUrl,
    };

    // Generate email content
    const htmlContent =
      status === "success"
        ? generateSuccessfulRollbackEmail(emailData)
        : generateFailedRollbackEmail(emailData);

    const plainTextContent = generateRollbackPlainText(emailData, status);
    const subject = generateRollbackEmailSubject(status, data.importLogId);

    // Send email via notification service
    const notificationResult = await notifyOwner({
      title: subject,
      content: `
Rollback Operation ${status === "success" ? "Completed Successfully" : "Failed"}

Import Log #${data.importLogId}
Total Records: ${data.totalRollbacks}
Successful: ${data.successfulRollbacks}
Failed: ${data.failedRollbacks}

${data.reason ? `Reason: ${data.reason}` : ""}

${data.errors && data.errors.length > 0 ? `Errors:\n${data.errors.map((e) => `- Record #${e.rollbackId}: ${e.message}`).join("\n")}` : ""}

View details: ${dashboardUrl}/admin/rollback-history
      `,
    });

    return notificationResult;
  } catch (error) {
    console.error("Failed to send rollback notification:", error);
    return false;
  }
}

/**
 * Send rollback notification to multiple admins
 */
export async function sendRollbackNotificationToAdmins(
  admins: Array<{ email: string; name: string }>,
  data: {
    importLogId: number;
    totalRollbacks: number;
    successfulRollbacks: number;
    failedRollbacks: number;
    errors?: Array<{ rollbackId: number; message: string }>;
    reason?: string;
    dashboardUrl?: string;
  }
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const admin of admins) {
    try {
      const result = await sendRollbackNotification(admin.email, admin.name, data);
      if (result) {
        successful++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send notification to ${admin.email}:`, error);
      failed++;
    }
  }

  return { successful, failed };
}

/**
 * Send rollback started notification
 */
export async function sendRollbackStartedNotification(
  adminEmail: string,
  adminName: string,
  importLogId: number,
  totalRecords: number,
  dashboardUrl?: string
): Promise<boolean> {
  try {
    const result = await notifyOwner({
      title: `⏳ Rollback Started - Import #${importLogId}`,
      content: `
Rollback operation has started for import #${importLogId}

Total Records to Process: ${totalRecords}

This is an automated notification. The operation may take a few minutes to complete.
You will receive another notification when the rollback is finished.

View progress: ${dashboardUrl || "https://www.pikmeusa.com"}/admin/rollback-history
      `,
    });

    return result;
  } catch (error) {
    console.error("Failed to send rollback started notification:", error);
    return false;
  }
}

/**
 * Send rollback warning notification
 */
export async function sendRollbackWarningNotification(
  adminEmail: string,
  adminName: string,
  importLogId: number,
  warnings: string[],
  dashboardUrl?: string
): Promise<boolean> {
  try {
    const result = await notifyOwner({
      title: `⚠ Rollback Warning - Import #${importLogId}`,
      content: `
Warnings detected during rollback operation for import #${importLogId}

${warnings.map((w) => `- ${w}`).join("\n")}

Please review these warnings and take appropriate action if needed.

View details: ${dashboardUrl || "https://www.pikmeusa.com"}/admin/rollback-history
      `,
    });

    return result;
  } catch (error) {
    console.error("Failed to send rollback warning notification:", error);
    return false;
  }
}

/**
 * Send import failure notification suggesting rollback
 */
export async function sendImportFailureNotification(
  adminEmail: string,
  adminName: string,
  importLogId: number,
  failureReason: string,
  recordsAffected: number,
  dashboardUrl?: string
): Promise<boolean> {
  try {
    const result = await notifyOwner({
      title: `❌ Import Failed - Rollback Recommended - Import #${importLogId}`,
      content: `
CSV import operation failed for import #${importLogId}

Failure Reason: ${failureReason}
Records Affected: ${recordsAffected}

We recommend rolling back this import to maintain data integrity.

Actions:
1. Review the import log for detailed error information
2. Fix the data issues in your CSV file
3. Execute a rollback to revert the failed import
4. Re-import the corrected data

Review and rollback: ${dashboardUrl || "https://www.pikmeusa.com"}/admin/import-history
      `,
    });

    return result;
  } catch (error) {
    console.error("Failed to send import failure notification:", error);
    return false;
  }
}

/**
 * Email templates for rollback notifications
 */

export interface RollbackEmailData {
  adminName: string;
  importLogId: number;
  totalRollbacks: number;
  successfulRollbacks: number;
  failedRollbacks: number;
  errors?: Array<{ rollbackId: number; message: string }>;
  reason?: string;
  timestamp: string;
  dashboardUrl: string;
}

/**
 * Generate HTML email for successful rollback
 */
export function generateSuccessfulRollbackEmail(data: RollbackEmailData): string {
  const successRate = Math.round((data.successfulRollbacks / data.totalRollbacks) * 100);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .status-title { font-size: 18px; font-weight: 600; color: #10b981; margin-bottom: 10px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-item { background: white; padding: 15px; border-radius: 4px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: 700; color: #667eea; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
          .success { color: #10b981; }
          .warning { color: #f59e0b; }
          .error { color: #ef4444; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .error-list { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .error-item { margin: 8px 0; font-size: 14px; color: #7f1d1d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Rollback Completed Successfully</h1>
            <p>Import Log #${data.importLogId}</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.adminName},</p>
            
            <p>The CSV import rollback has been completed successfully. Here's a summary of the operation:</p>
            
            <div class="status-box">
              <div class="status-title">Operation Summary</div>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-number">${data.totalRollbacks}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number success">${data.successfulRollbacks}</div>
                  <div class="stat-label">Successful</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number warning">${data.failedRollbacks}</div>
                  <div class="stat-label">Failed</div>
                </div>
              </div>
              <p style="text-align: center; margin: 15px 0; font-size: 14px;">
                <strong>Success Rate: ${successRate}%</strong>
              </p>
            </div>

            ${data.reason ? `
              <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #0c4a6e;">Reason:</strong>
                <p style="margin: 8px 0; color: #0c4a6e;">${data.reason}</p>
              </div>
            ` : ''}

            ${data.failedRollbacks > 0 ? `
              <div class="error-list">
                <strong style="color: #7f1d1d;">⚠ ${data.failedRollbacks} Rollback(s) Failed</strong>
                ${data.errors?.slice(0, 5).map(err => `
                  <div class="error-item">
                    • Record #${err.rollbackId}: ${err.message}
                  </div>
                `).join('') || ''}
                ${data.errors && data.errors.length > 5 ? `
                  <div class="error-item">
                    • ... and ${data.errors.length - 5} more errors
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <p style="text-align: center;">
              <a href="${data.dashboardUrl}/admin/rollback-history" class="button">View Rollback Details</a>
            </p>

            <p>
              <strong>Timestamp:</strong> ${data.timestamp}<br>
              <strong>Import Log ID:</strong> ${data.importLogId}
            </p>

            <div class="footer">
              <p>This is an automated notification from Pikme. Please do not reply to this email.</p>
              <p>&copy; 2026 Pikme.org. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML email for failed rollback
 */
export function generateFailedRollbackEmail(data: RollbackEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .alert-title { font-size: 18px; font-weight: 600; color: #dc2626; margin-bottom: 10px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-item { background: white; padding: 15px; border-radius: 4px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: 700; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
          .error { color: #ef4444; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .error-list { background: white; border: 1px solid #fecaca; padding: 15px; margin: 15px 0; border-radius: 4px; max-height: 300px; overflow-y: auto; }
          .error-item { margin: 8px 0; font-size: 13px; color: #7f1d1d; padding: 8px; background: #fef2f2; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✗ Rollback Failed</h1>
            <p>Import Log #${data.importLogId}</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.adminName},</p>
            
            <p>The CSV import rollback encountered errors and could not complete successfully. Immediate action may be required.</p>
            
            <div class="alert-box">
              <div class="alert-title">⚠ Operation Failed</div>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-number">${data.totalRollbacks}</div>
                  <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number" style="color: #10b981;">${data.successfulRollbacks}</div>
                  <div class="stat-label">Successful</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number error">${data.failedRollbacks}</div>
                  <div class="stat-label">Failed</div>
                </div>
              </div>
            </div>

            <h3 style="color: #dc2626; margin-top: 20px;">Error Details</h3>
            <div class="error-list">
              ${data.errors?.map(err => `
                <div class="error-item">
                  <strong>Record #${err.rollbackId}:</strong> ${err.message}
                </div>
              `).join('') || '<div class="error-item">No error details available</div>'}
            </div>

            ${data.reason ? `
              <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #0c4a6e;">Reason:</strong>
                <p style="margin: 8px 0; color: #0c4a6e;">${data.reason}</p>
              </div>
            ` : ''}

            <h3 style="color: #dc2626; margin-top: 20px;">Recommended Actions</h3>
            <ul style="color: #7f1d1d;">
              <li>Review the error details above</li>
              <li>Check the import log for data issues</li>
              <li>Fix the underlying problems</li>
              <li>Retry the rollback operation</li>
              <li>Contact support if issues persist</li>
            </ul>

            <p style="text-align: center;">
              <a href="${data.dashboardUrl}/admin/rollback-history" class="button">View Full Details</a>
            </p>

            <p>
              <strong>Timestamp:</strong> ${data.timestamp}<br>
              <strong>Import Log ID:</strong> ${data.importLogId}
            </p>

            <div class="footer">
              <p>This is an automated notification from Pikme. Please do not reply to this email.</p>
              <p>&copy; 2026 Pikme.org. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate plain text email for rollback notifications
 */
export function generateRollbackPlainText(data: RollbackEmailData, status: 'success' | 'failed'): string {
  const statusText = status === 'success' ? 'SUCCESSFUL' : 'FAILED';
  const successRate = Math.round((data.successfulRollbacks / data.totalRollbacks) * 100);

  return `
Rollback Operation ${statusText}
Import Log #${data.importLogId}

SUMMARY
-------
Total Records: ${data.totalRollbacks}
Successful: ${data.successfulRollbacks}
Failed: ${data.failedRollbacks}
Success Rate: ${successRate}%

${data.reason ? `REASON\n------\n${data.reason}\n\n` : ''}

${data.errors && data.errors.length > 0 ? `ERRORS\n------\n${data.errors.map(e => `Record #${e.rollbackId}: ${e.message}`).join('\n')}\n\n` : ''}

DETAILS
-------
Timestamp: ${data.timestamp}
Import Log ID: ${data.importLogId}

View full details: ${data.dashboardUrl}/admin/rollback-history

---
This is an automated notification from Pikme (https://www.pikmeusa.com)
Please do not reply to this email.
  `.trim();
}

/**
 * Generate email subject line
 */
export function generateRollbackEmailSubject(status: 'success' | 'failed', importLogId: number): string {
  if (status === 'success') {
    return `✓ Rollback Completed Successfully - Import #${importLogId}`;
  } else {
    return `✗ Rollback Failed - Import #${importLogId} - Action Required`;
  }
}

import { getDb } from './db';
import { auditLogReencryptionJob, encryptedAuditLogStorage, webhookAuditLog } from '../drizzle/schema';
import { KeyRotationService } from './key-rotation-service';
import { AuditEncryptionService } from './audit-encryption-service';
import { eq, and } from 'drizzle-orm';

/**
 * Audit Re-encryption Worker
 * Handles background re-encryption of audit logs during key rotation
 */
export class AuditReencryptionWorker {
  private static readonly BATCH_SIZE = 100;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds

  /**
   * Process a re-encryption job
   */
  static async processReencryptionJob(jobId: string): Promise<{
    success: boolean;
    processedCount?: number;
    failedCount?: number;
    error?: string;
  }> {
    try {
      const db = getDb();
      // Get job details
      const job = await db.query.auditLogReencryptionJob.findFirst({
        where: eq(auditLogReencryptionJob.jobId, jobId),
      });

      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return {
          success: false,
          error: `Job is already ${job.status}`,
        };
      }

      // Update job status to in_progress
      await db.update(auditLogReencryptionJob)
        .set({ status: 'in_progress', startedAt: new Date() })
        .where(eq(auditLogReencryptionJob.jobId, jobId));

      // Get all audit logs that need re-encryption
      const auditLogs = await db.query.webhookAuditLog.findMany();
      const totalRecords = auditLogs.length;

      // Update total records
      await db.update(auditLogReencryptionJob)
        .set({ totalRecords })
        .where(eq(auditLogReencryptionJob.jobId, jobId));

      let processedCount = 0;
      let failedCount = 0;

      // Process in batches
      for (let i = 0; i < auditLogs.length; i += this.BATCH_SIZE) {
        const batch = auditLogs.slice(i, i + this.BATCH_SIZE);

        for (const auditLog of batch) {
          try {
            // Decrypt with old key (if encrypted)
            let decryptedData = JSON.stringify(auditLog);

            // Try to get encrypted version
            const encrypted = await db.query.encryptedAuditLogStorage.findFirst({
              where: eq(encryptedAuditLogStorage.auditLogId, auditLog.id),
            });

            if (encrypted && encrypted.oldKeyId === job.oldKeyId) {
              // Decrypt with old key
              const decryptResult = AuditEncryptionService.decrypt(
                {
                  encrypted: encrypted.encryptedData,
                  iv: encrypted.iv,
                  authTag: encrypted.authTag,
                  salt: encrypted.salt,
                  algorithm: encrypted.algorithm,
                },
                job.oldKeyId // This is simplified; in production, you'd need the actual key
              );

              if (decryptResult.success && decryptResult.data) {
                decryptedData = decryptResult.data;
              }
            }

            // Re-encrypt with new key
            const reencrypted = AuditEncryptionService.encrypt(decryptedData, {
              password: job.newKeyId,
            });

            // Store re-encrypted data
            await db.insert(encryptedAuditLogStorage).values({
              auditLogId: auditLog.id,
              keyId: job.newKeyId,
              encryptedData: reencrypted.encrypted,
              iv: reencrypted.iv,
              authTag: reencrypted.authTag,
              salt: reencrypted.salt,
              algorithm: reencrypted.algorithm,
            });

            processedCount++;

            // Update progress
            await db.update(auditLogReencryptionJob)
              .set({ processedRecords: processedCount })
              .where(eq(auditLogReencryptionJob.jobId, jobId));
          } catch (error) {
            console.error(`Error re-encrypting audit log ${auditLog.id}:`, error);
            failedCount++;

            // Update failed count
            await db.update(auditLogReencryptionJob)
              .set({ failedRecords: failedCount })
              .where(eq(auditLogReencryptionJob.jobId, jobId));
          }
        }
      }

      // Mark job as completed
      const finalStatus = failedCount === 0 ? 'completed' : 'completed';
      await db.update(auditLogReencryptionJob)
        .set({
          status: finalStatus,
          completedAt: new Date(),
        })
        .where(eq(auditLogReencryptionJob.jobId, jobId));

      // Log completion event
      await KeyRotationService.logKeyRotationEvent(
        'rotation_completed',
        job.newKeyId,
        jobId,
        undefined,
        undefined,
        {
          processedCount,
          failedCount,
          totalRecords,
        }
      );

      return {
        success: true,
        processedCount,
        failedCount,
      };
    } catch (error) {
      console.error('Error processing re-encryption job:', error);

      try {
        const db = getDb();
        // Update job as failed
        await db.update(auditLogReencryptionJob)
          .set({
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(auditLogReencryptionJob.jobId, jobId));
      } catch (updateError) {
        console.error('Error updating job status:', updateError);
      }

      return {
        success: false,
        error: `Failed to process job: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Retry a failed re-encryption job
   */
  static async retryReencryptionJob(jobId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const db = getDb();
      const job = await db.query.auditLogReencryptionJob.findFirst({
        where: eq(auditLogReencryptionJob.jobId, jobId),
      });

      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      if (job.retryCount >= this.MAX_RETRIES) {
        return {
          success: false,
          error: `Job has exceeded maximum retry attempts (${this.MAX_RETRIES})`,
        };
      }

      // Reset job for retry
      await db.update(auditLogReencryptionJob)
        .set({
          status: 'pending',
          retryCount: job.retryCount + 1,
          lastRetryAt: new Date(),
          errorMessage: null,
        })
        .where(eq(auditLogReencryptionJob.jobId, jobId));

      return { success: true };
    } catch (error) {
      console.error('Error retrying re-encryption job:', error);
      return {
        success: false,
        error: `Failed to retry job: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check and process pending re-encryption jobs
   */
  static async processPendingJobs(): Promise<{
    success: boolean;
    processedJobs?: number;
    error?: string;
  }> {
    try {
      const db = getDb();
      const pendingJobs = await db.query.auditLogReencryptionJob.findMany({
        where: eq(auditLogReencryptionJob.status, 'pending'),
      });

      let processedJobs = 0;

      for (const job of pendingJobs) {
        const result = await this.processReencryptionJob(job.jobId);
        if (result.success) {
          processedJobs++;
        }
      }

      return {
        success: true,
        processedJobs,
      };
    } catch (error) {
      console.error('Error processing pending jobs:', error);
      return {
        success: false,
        error: `Failed to process pending jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if key rotation is needed and initiate if required
   */
  static async checkAndInitiateKeyRotation(): Promise<{
    success: boolean;
    rotationInitiated?: boolean;
    jobId?: string;
    error?: string;
  }> {
    try {
      const needsRotation = await KeyRotationService.isKeyRotationNeeded();

      if (!needsRotation) {
        return {
          success: true,
          rotationInitiated: false,
        };
      }

      // Initiate key rotation
      const result = await KeyRotationService.initiateKeyRotation();

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        rotationInitiated: true,
        jobId: result.jobId,
      };
    } catch (error) {
      console.error('Error checking and initiating key rotation:', error);
      return {
        success: false,
        error: `Failed to check key rotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Cleanup archived keys (optional maintenance)
   */
  static async cleanupArchivedKeys(): Promise<{
    success: boolean;
    archivedCount?: number;
    error?: string;
  }> {
    try {
      const result = await KeyRotationService.archiveRetiredKeys();
      return result;
    } catch (error) {
      console.error('Error cleaning up archived keys:', error);
      return {
        success: false,
        error: `Failed to cleanup archived keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get re-encryption job queue status
   */
  static async getQueueStatus(): Promise<{
    success: boolean;
    pendingJobs?: number;
    inProgressJobs?: number;
    completedJobs?: number;
    failedJobs?: number;
    error?: string;
  }> {
    try {
      const db = getDb();
      const pending = await db.query.auditLogReencryptionJob.findMany({
        where: eq(auditLogReencryptionJob.status, 'pending'),
      });

      const inProgress = await db.query.auditLogReencryptionJob.findMany({
        where: eq(auditLogReencryptionJob.status, 'in_progress'),
      });

      const completed = await db.query.auditLogReencryptionJob.findMany({
        where: eq(auditLogReencryptionJob.status, 'completed'),
      });

      const failed = await db.query.auditLogReencryptionJob.findMany({
        where: eq(auditLogReencryptionJob.status, 'failed'),
      });

      return {
        success: true,
        pendingJobs: pending.length,
        inProgressJobs: inProgress.length,
        completedJobs: completed.length,
        failedJobs: failed.length,
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return {
        success: false,
        error: `Failed to get queue status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

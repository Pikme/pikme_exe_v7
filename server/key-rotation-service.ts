import crypto from 'crypto';
import { getDb } from './db';
import { encryptionKeyRotation, keyRotationEventLog, auditLogReencryptionJob, encryptedAuditLogStorage } from '../drizzle/schema';
import { AuditEncryptionService } from './audit-encryption-service';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';

/**
 * Key Rotation Service
 * Manages encryption key lifecycle, rotation scheduling, and re-encryption of audit logs
 */
export class KeyRotationService {
  // 90 days in milliseconds
  private static readonly KEY_ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000;
  // 1 year in milliseconds (archive after retirement)
  private static readonly KEY_ARCHIVE_INTERVAL = 365 * 24 * 60 * 60 * 1000;
  // Batch size for re-encryption jobs
  private static readonly REENCRYPTION_BATCH_SIZE = 100;

  /**
   * Generate a new encryption key
   */
  static generateNewKey(algorithm: string = 'aes-256-gcm'): {
    keyId: string;
    keyHash: string;
  } {
    const keyId = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(keyId).digest('hex');

    return { keyId, keyHash };
  }

  /**
   * Create and activate a new key
   */
  static async createNewKey(
    algorithm: string = 'aes-256-gcm',
    userId?: number,
    userName?: string
  ): Promise<{
    success: boolean;
    keyId?: string;
    error?: string;
  }> {
    try {
      const { keyId, keyHash } = this.generateNewKey(algorithm);
      const db = getDb();

      // Insert new key
      await db.insert(encryptionKeyRotation).values({
        keyId,
        keyHash,
        algorithm,
        status: 'active',
        activatedAt: new Date(),
        createdBy: userId,
        metadata: {
          generatedAt: new Date().toISOString(),
          algorithm,
        },
      });

      // Log key generation event
      await this.logKeyRotationEvent('key_generated', keyId, undefined, userId, userName, {
        algorithm,
      });

      return { success: true, keyId };
    } catch (error) {
      console.error('Error creating new key:', error);
      return {
        success: false,
        error: `Failed to create new key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get the current active key
   */
  static async getActiveKey(): Promise<{
    success: boolean;
    key?: any;
    error?: string;
  }> {
    try {
      const db = getDb();
      const key = await db.query.encryptionKeyRotation.findFirst({
        where: eq(encryptionKeyRotation.status, 'active'),
      });

      if (!key) {
        return {
          success: false,
          error: 'No active key found',
        };
      }

      return { success: true, key };
    } catch (error) {
      console.error('Error getting active key:', error);
      return {
        success: false,
        error: `Failed to get active key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if key rotation is needed (90 days since activation)
   */
  static async isKeyRotationNeeded(): Promise<boolean> {
    try {
      const activeKey = await this.getActiveKey();
      if (!activeKey.success || !activeKey.key) {
        return false;
      }

      const activatedAt = new Date(activeKey.key.activatedAt).getTime();
      const now = Date.now();
      const daysSinceActivation = (now - activatedAt) / (1000 * 60 * 60 * 24);

      return daysSinceActivation >= 90;
    } catch (error) {
      console.error('Error checking key rotation need:', error);
      return false;
    }
  }

  /**
   * Initiate key rotation (retire old key and activate new one)
   */
  static async initiateKeyRotation(
    userId?: number,
    userName?: string
  ): Promise<{
    success: boolean;
    oldKeyId?: string;
    newKeyId?: string;
    jobId?: string;
    error?: string;
  }> {
    try {
      const db = getDb();
      // Get current active key
      const activeKeyResult = await this.getActiveKey();
      if (!activeKeyResult.success || !activeKeyResult.key) {
        return {
          success: false,
          error: 'No active key to rotate',
        };
      }

      const oldKeyId = activeKeyResult.key.keyId;

      // Create new key
      const newKeyResult = await this.createNewKey('aes-256-gcm', userId, userName);
      if (!newKeyResult.success || !newKeyResult.keyId) {
        return {
          success: false,
          error: newKeyResult.error,
        };
      }

      const newKeyId = newKeyResult.keyId;

      // Retire old key
      await db.update(encryptionKeyRotation)
        .set({
          status: 'rotating',
          retiredAt: new Date(),
        })
        .where(eq(encryptionKeyRotation.keyId, oldKeyId));

      // Create re-encryption job
      const jobId = crypto.randomBytes(32).toString('hex');
      await db.insert(auditLogReencryptionJob).values({
        jobId,
        status: 'pending',
        oldKeyId,
        newKeyId,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
      });

      // Log rotation initiation
      await this.logKeyRotationEvent('rotation_started', newKeyId, jobId, userId, userName, {
        oldKeyId,
        newKeyId,
      });

      return {
        success: true,
        oldKeyId,
        newKeyId,
        jobId,
      };
    } catch (error) {
      console.error('Error initiating key rotation:', error);
      return {
        success: false,
        error: `Failed to initiate key rotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get key rotation status
   */
  static async getKeyRotationStatus(): Promise<{
    success: boolean;
    activeKey?: any;
    rotatingKey?: any;
    retiredKeys?: any[];
    nextRotationDue?: Date;
    error?: string;
  }> {
    try {
      const db = getDb();
      const activeKey = await db.query.encryptionKeyRotation.findFirst({
        where: eq(encryptionKeyRotation.status, 'active'),
      });

      const rotatingKey = await db.query.encryptionKeyRotation.findFirst({
        where: eq(encryptionKeyRotation.status, 'rotating'),
      });

      const retiredKeys = await db.query.encryptionKeyRotation.findMany({
        where: eq(encryptionKeyRotation.status, 'retired'),
      });

      let nextRotationDue: Date | undefined;
      if (activeKey && activeKey.activatedAt) {
        nextRotationDue = new Date(
          new Date(activeKey.activatedAt).getTime() + this.KEY_ROTATION_INTERVAL
        );
      }

      return {
        success: true,
        activeKey,
        rotatingKey,
        retiredKeys,
        nextRotationDue,
      };
    } catch (error) {
      console.error('Error getting key rotation status:', error);
      return {
        success: false,
        error: `Failed to get key rotation status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Log key rotation event for compliance
   */
  static async logKeyRotationEvent(
    eventType: string,
    keyId?: string,
    jobId?: string,
    userId?: number,
    userName?: string,
    details?: any
  ): Promise<void> {
    try {
      const db = getDb();
      await db.insert(keyRotationEventLog).values({
        eventType: eventType as any,
        keyId,
        jobId,
        userId,
        userName,
        details,
      });
    } catch (error) {
      console.error('Error logging key rotation event:', error);
    }
  }

  /**
   * Get key rotation event history
   */
  static async getKeyRotationEventHistory(
    limit: number = 100,
    offset: number = 0
  ): Promise<{
    success: boolean;
    events?: any[];
    total?: number;
    error?: string;
  }> {
    try {
      const db = getDb();
      const events = await db.query.keyRotationEventLog.findMany({
        limit,
        offset,
        orderBy: (table) => [table.createdAt],
      });

      return { success: true, events };
    } catch (error) {
      console.error('Error getting key rotation event history:', error);
      return {
        success: false,
        error: `Failed to get event history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get re-encryption job status
   */
  static async getReencryptionJobStatus(jobId: string): Promise<{
    success: boolean;
    job?: any;
    progress?: number;
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

      const progress = job.totalRecords > 0 ? (job.processedRecords / job.totalRecords) * 100 : 0;

      return {
        success: true,
        job,
        progress,
      };
    } catch (error) {
      console.error('Error getting re-encryption job status:', error);
      return {
        success: false,
        error: `Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Archive retired keys (1 year after retirement)
   */
  static async archiveRetiredKeys(): Promise<{
    success: boolean;
    archivedCount?: number;
    error?: string;
  }> {
    try {
      const db = getDb();
      const oneYearAgo = new Date(Date.now() - this.KEY_ARCHIVE_INTERVAL);

      const result = await db.update(encryptionKeyRotation)
        .set({
          status: 'archived',
          archivedAt: new Date(),
        })
        .where(
          and(
            eq(encryptionKeyRotation.status, 'retired'),
            lte(encryptionKeyRotation.retiredAt, oneYearAgo)
          )
        );

      return {
        success: true,
        archivedCount: result.rowsAffected,
      };
    } catch (error) {
      console.error('Error archiving retired keys:', error);
      return {
        success: false,
        error: `Failed to archive retired keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

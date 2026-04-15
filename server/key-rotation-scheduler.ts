import { CronJob } from 'cron';
import { KeyRotationService } from './key-rotation-service';
import { AuditReencryptionWorker } from './audit-reencryption-worker';
import { notifyOwner } from './_core/notification';
import { SchedulerAlertService } from './scheduler-alert-service';

export interface SchedulerStatus {
  isRunning: boolean;
  lastCheckTime: number | null;
  nextCheckTime: number | null;
  checksCompleted: number;
  checksWithRotation: number;
  lastError: string | null;
  lastErrorTime: number | null;
}

export class KeyRotationScheduler {
  private static job: CronJob | null = null;
  private static failureCount = 0;
  private static lastCheckTime = 0;
  private static status: SchedulerStatus = {
    isRunning: false,
    lastCheckTime: null,
    nextCheckTime: null,
    checksCompleted: 0,
    checksWithRotation: 0,
    lastError: null,
    lastErrorTime: null,
  };

  /**
   * Initialize the scheduler with 24-hour interval
   * Runs at 2 AM UTC daily
   */
  static initialize(): void {
    if (this.job) {
      console.log('[KeyRotationScheduler] Scheduler already initialized');
      return;
    }

    try {
      // Run at 2 AM UTC every day (0 2 * * *)
      this.job = new CronJob('0 2 * * *', async () => {
        await this.executeRotationCheck();
      });

      this.job.start();
      this.status.isRunning = true;
      const nextDate = this.job.nextDate();
      this.status.nextCheckTime = nextDate ? nextDate.getTime() : Date.now() + 86400000;

      console.log('[KeyRotationScheduler] Scheduler initialized successfully');
      console.log(`[KeyRotationScheduler] Next check scheduled for: ${new Date(this.status.nextCheckTime).toISOString()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.status.lastError = errorMessage;
      this.status.lastErrorTime = Date.now();
      console.error('[KeyRotationScheduler] Failed to initialize scheduler:', errorMessage);
      throw error;
    }
  }

  /**
   * Execute the key rotation check
   */
  private static async executeRotationCheck(): Promise<void> {
    try {
      console.log('[KeyRotationScheduler] Starting key rotation check...');
      this.status.lastCheckTime = Date.now();

      // Check if key rotation is needed
      const rotationResult = await AuditReencryptionWorker.checkAndInitiateKeyRotation();

      if (rotationResult.success) {
        console.log('[KeyRotationScheduler] Key rotation check completed successfully');

        // Reset failure count on success
        this.failureCount = 0;

        if (rotationResult.rotationInitiated) {
          this.status.checksWithRotation++;
          console.log('[KeyRotationScheduler] New key rotation initiated');

          // Notify owner of rotation
          await notifyOwner({
            title: 'Key Rotation Initiated',
            content: `Automatic key rotation has been initiated. New key ID: ${rotationResult.newKeyId || 'N/A'}. Re-encryption jobs queued for audit logs.`,
          });
        }

        // Process pending re-encryption jobs
        const jobResult = await AuditReencryptionWorker.processPendingJobs();
        if (jobResult.success) {
          console.log(`[KeyRotationScheduler] Processed ${jobResult.jobsProcessed || 0} re-encryption jobs`);
        }

        this.status.checksCompleted++;
        this.status.lastError = null;
        this.status.lastErrorTime = null;
      } else {
        throw new Error(rotationResult.error || 'Unknown error during rotation check');
      }

      // Update next check time
      if (this.job) {
        this.status.nextCheckTime = this.job.nextDate().getTime();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.status.lastError = errorMessage;
      this.status.lastErrorTime = Date.now();
      this.failureCount++;
      console.error('[KeyRotationScheduler] Error during rotation check:', errorMessage);

      // Check alert thresholds for consecutive failures
      await SchedulerAlertService.checkAlertThreshold('check_failure', this.failureCount, {
        error: errorMessage,
        failureCount: this.failureCount,
      });

      // Notify owner of error
      await notifyOwner({
        title: 'Key Rotation Check Failed',
        content: `Automatic key rotation check encountered an error: ${errorMessage}. Manual intervention may be required.`,
      });
    }
  }

  /**
   * Get current scheduler status
   */
  static getStatus(): SchedulerStatus {
    return {
      ...this.status,
      nextCheckTime: this.job ? (this.job.nextDate() as any)?.getTime?.() : null,
    };
  }

  /**
   * Manually trigger a rotation check
   */
  static async triggerCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.executeRotationCheck();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Stop the scheduler
   */
  static stop(): void {
    if (this.job) {
      this.job.stop();
      this.status.isRunning = false;
      console.log('[KeyRotationScheduler] Scheduler stopped');
    }
  }

  /**
   * Resume the scheduler
   */
  static resume(): void {
    if (this.job) {
      this.job.start();
      this.status.isRunning = true;
      const nextDate = this.job.nextDate();
      this.status.nextCheckTime = nextDate ? nextDate.getTime() : Date.now() + 86400000;
      console.log('[KeyRotationScheduler] Scheduler resumed');
    } else {
      this.initialize();
    }
  }

  /**
   * Reset scheduler statistics
   */
  static resetStats(): void {
    this.status.checksCompleted = 0;
    this.status.checksWithRotation = 0;
    this.status.lastError = null;
    this.status.lastErrorTime = null;
    console.log('[KeyRotationScheduler] Statistics reset');
  }

  /**
   * Get scheduler health status
   */
  static getHealth(): {
    healthy: boolean;
    lastCheckAge: number | null;
    consecutiveErrors: number;
    message: string;
  } {
    const now = Date.now();
    const lastCheckAge = this.status.lastCheckTime ? now - this.status.lastCheckTime : null;
    const consecutiveErrors = this.status.lastError ? 1 : 0;

    // Consider unhealthy if last check was more than 26 hours ago
    const healthy = !this.status.lastError && (!lastCheckAge || lastCheckAge < 26 * 60 * 60 * 1000);

    let message = 'Scheduler is running normally';
    if (!this.status.isRunning) {
      message = 'Scheduler is not running';
    } else if (this.status.lastError) {
      message = `Last error: ${this.status.lastError}`;
    } else if (lastCheckAge && lastCheckAge > 24 * 60 * 60 * 1000) {
      message = `No check in the last 24 hours (last check: ${Math.round(lastCheckAge / (60 * 60 * 1000))} hours ago)`;
    }

    return {
      healthy,
      lastCheckAge,
      consecutiveErrors,
      message,
    };
  }
}

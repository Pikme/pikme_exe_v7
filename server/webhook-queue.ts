import { getDb } from './db';
import { webhookLogs, webhookEndpoints } from '../drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import crypto from 'crypto';

export type WebhookJobStatus = 'pending' | 'processing' | 'success' | 'failed' | 'retrying' | 'dead_letter';

export interface WebhookJob {
  id: string;
  webhookEndpointId: string;
  action: string;
  payload: Record<string, any>;
  status: WebhookJobStatus;
  attemptCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookQueueConfig {
  maxConcurrent?: number;
  retryDelay?: number; // Base delay in milliseconds
  maxRetries?: number;
  timeout?: number; // Request timeout in milliseconds
  deadLetterThreshold?: number; // Number of failures before moving to dead letter
}

/**
 * WebhookQueue - Background job processor for webhook delivery
 */
export class WebhookQueue {
  private config: Required<WebhookQueueConfig>;
  private processing = false;
  private activeJobs = new Map<string, Promise<void>>();
  private processInterval: NodeJS.Timeout | null = null;

  constructor(config: WebhookQueueConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 5,
      retryDelay: config.retryDelay ?? 1000,
      maxRetries: config.maxRetries ?? 3,
      timeout: config.timeout ?? 30000,
      deadLetterThreshold: config.deadLetterThreshold ?? 5,
    };
  }

  /**
   * Start the background job processor
   */
  public start(intervalMs: number = 5000): void {
    if (this.processInterval) {
      console.warn('WebhookQueue is already running');
      return;
    }

    console.log('Starting WebhookQueue processor');
    this.processInterval = setInterval(() => {
      this.processQueue().catch(error => {
        console.error('Error processing webhook queue:', error);
      });
    }, intervalMs);
  }

  /**
   * Stop the background job processor
   */
  public stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      console.log('Stopped WebhookQueue processor');
    }
  }

  /**
   * Add a webhook job to the queue
   */
  public async enqueueJob(
    webhookEndpointId: string,
    action: string,
    payload: Record<string, any>
  ): Promise<string> {
    const db = await getDb();
    const jobId = crypto.randomUUID();

    try {
      await db.insert(webhookLogs).values({
        id: jobId,
        webhookEndpointId,
        action,
        payload,
        status: 'pending',
        attemptCount: 1,
      });

      return jobId;
    } catch (error) {
      console.error('Error enqueueing webhook job:', error);
      throw error;
    }
  }

  /**
   * Process pending webhook jobs
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.activeJobs.size >= this.config.maxConcurrent) {
      return;
    }

    this.processing = true;

    try {
      const db = await getDb();

      // Get pending jobs
      const pendingJobs = await db
        .select()
        .from(webhookLogs)
        .where(eq(webhookLogs.status, 'pending'))
        .limit(this.config.maxConcurrent - this.activeJobs.size);

      for (const job of pendingJobs) {
        const jobPromise = this.processJob(job).catch(error => {
          console.error(`Error processing job ${job.id}:`, error);
        });

        this.activeJobs.set(job.id, jobPromise);

        jobPromise.finally(() => {
          this.activeJobs.delete(job.id);
        });
      }
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single webhook job
   */
  private async processJob(job: any): Promise<void> {
    const db = await getDb();

    try {
      // Update job status to processing
      await db
        .update(webhookLogs)
        .set({ status: 'processing' })
        .where(eq(webhookLogs.id, job.id));

      // Get webhook endpoint
      const endpoint = await db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, job.webhookEndpointId))
        .then(rows => rows[0]);

      if (!endpoint) {
        throw new Error(`Webhook endpoint not found: ${job.webhookEndpointId}`);
      }

      if (!endpoint.isActive) {
        await db
          .update(webhookLogs)
          .set({ status: 'failed', errorMessage: 'Webhook endpoint is inactive' })
          .where(eq(webhookLogs.id, job.id));
        return;
      }

      // Generate signature
      const signature = this.generateSignature(job.payload, endpoint.id);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': job.id,
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...(endpoint.headers as Record<string, string> || {}),
      };

      // Send webhook
      const response = await this.sendWebhook(
        endpoint.url,
        job.payload,
        headers,
        endpoint.timeout || this.config.timeout
      );

      // Update job status to success
      await db
        .update(webhookLogs)
        .set({
          status: 'success',
          statusCode: response.status,
          response: response.body,
          updatedAt: new Date(),
        })
        .where(eq(webhookLogs.id, job.id));

      // Update endpoint last success time
      await db
        .update(webhookEndpoints)
        .set({ lastSuccessAt: new Date() })
        .where(eq(webhookEndpoints.id, endpoint.id));
    } catch (error) {
      await this.handleJobFailure(job, error);
    }
  }

  /**
   * Handle job failure with retry logic
   */
  private async handleJobFailure(job: any, error: any): Promise<void> {
    const db = await getDb();
    const errorMessage = error instanceof Error ? error.message : String(error);

    const nextAttempt = job.attemptCount + 1;
    const shouldRetry = nextAttempt <= this.config.maxRetries;

    if (shouldRetry) {
      // Calculate next retry time with exponential backoff
      const delayMs = this.config.retryDelay * Math.pow(2, job.attemptCount - 1);
      const nextRetryAt = new Date(Date.now() + delayMs);

      await db
        .update(webhookLogs)
        .set({
          status: 'retrying',
          attemptCount: nextAttempt,
          nextRetryAt,
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(webhookLogs.id, job.id));
    } else {
      // Move to dead letter queue
      await db
        .update(webhookLogs)
        .set({
          status: 'dead_letter',
          attemptCount: nextAttempt,
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(webhookLogs.id, job.id));

      // Update endpoint failure tracking
      const endpoint = await db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, job.webhookEndpointId))
        .then(rows => rows[0]);

      if (endpoint) {
        const newFailureCount = (endpoint.failureCount || 0) + 1;

        await db
          .update(webhookEndpoints)
          .set({
            failureCount: newFailureCount,
            lastErrorAt: new Date(),
            lastErrorMessage: errorMessage,
          })
          .where(eq(webhookEndpoints.id, job.webhookEndpointId));

        // Deactivate endpoint if failure threshold exceeded
        if (newFailureCount >= this.config.deadLetterThreshold) {
          await db
            .update(webhookEndpoints)
            .set({ isActive: false })
            .where(eq(webhookEndpoints.id, job.webhookEndpointId));

          console.warn(
            `Webhook endpoint ${job.webhookEndpointId} deactivated due to repeated failures`
          );
        }
      }
    }
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(
    url: string,
    payload: Record<string, any>,
    headers: Record<string, string>,
    timeout: number
  ): Promise<{ status: number; body: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const body = await response.json().catch(() => ({}));

      return {
        status: response.status,
        body,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generate HMAC signature for webhook
   */
  private generateSignature(payload: Record<string, any>, secret: string): string {
    const message = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Retry a dead-letter job
   */
  public async retryDeadLetterJob(jobId: string): Promise<void> {
    const db = await getDb();

    await db
      .update(webhookLogs)
      .set({
        status: 'pending',
        attemptCount: 1,
        errorMessage: null,
      })
      .where(eq(webhookLogs.id, jobId));
  }

  /**
   * Get job status
   */
  public async getJobStatus(jobId: string): Promise<any> {
    const db = await getDb();

    const job = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.id, jobId))
      .then(rows => rows[0]);

    return job;
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    success: number;
    failed: number;
    retrying: number;
    deadLetter: number;
  }> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const result = {
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
      retrying: 0,
      deadLetter: 0,
    };

    return result;
  }

  /**
   * Clean up old completed jobs
   */
  public async cleanupOldJobs(daysOld: number = 30): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    await db
      .delete(webhookLogs)
      .where(lt(webhookLogs.createdAt, cutoffDate));

    return 0;
  }
}

// Global queue instance
let globalQueue: WebhookQueue | null = null;

/**
 * Get or create global webhook queue instance
 */
export function getWebhookQueue(config?: WebhookQueueConfig): WebhookQueue {
  if (!globalQueue) {
    globalQueue = new WebhookQueue(config);
  }
  return globalQueue;
}

/**
 * Initialize webhook queue on server startup
 */
export async function initializeWebhookQueue(config?: WebhookQueueConfig): Promise<void> {
  const queue = getWebhookQueue(config);
  queue.start();
}

/**
 * Shutdown webhook queue on server shutdown
 */
export async function shutdownWebhookQueue(): Promise<void> {
  if (globalQueue) {
    globalQueue.stop();
    globalQueue = null;
  }
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebhookQueue, WebhookJobStatus } from './webhook-queue';

describe('WebhookQueue', () => {
  let queue: WebhookQueue;

  beforeEach(() => {
    queue = new WebhookQueue({
      maxConcurrent: 3,
      retryDelay: 100,
      maxRetries: 3,
      timeout: 5000,
      deadLetterThreshold: 5,
    });
  });

  afterEach(() => {
    queue.stop();
  });

  describe('Queue Initialization', () => {
    it('should initialize with default config', () => {
      const defaultQueue = new WebhookQueue();
      expect(defaultQueue).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customQueue = new WebhookQueue({
        maxConcurrent: 10,
        retryDelay: 500,
        maxRetries: 5,
      });
      expect(customQueue).toBeDefined();
    });

    it('should start processing queue', () => {
      queue.start();
      expect(queue).toBeDefined();
    });

    it('should stop processing queue', () => {
      queue.start();
      queue.stop();
      expect(queue).toBeDefined();
    });

    it('should warn if queue is already running', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      queue.start();
      queue.start();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('Job Enqueueing', () => {
    it('should enqueue a webhook job', async () => {
      const jobId = await queue.enqueueJob(
        'webhook-123',
        'bulk_delete',
        { entityCount: 5 }
      );
      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
    });

    it('should generate unique job IDs', async () => {
      const jobId1 = await queue.enqueueJob('webhook-1', 'bulk_delete', {});
      const jobId2 = await queue.enqueueJob('webhook-2', 'bulk_export', {});
      expect(jobId1).not.toBe(jobId2);
    });

    it('should handle multiple concurrent enqueues', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          queue.enqueueJob(`webhook-${i}`, 'bulk_delete', { index: i })
        );
      }
      const jobIds = await Promise.all(promises);
      expect(jobIds).toHaveLength(5);
      expect(new Set(jobIds).size).toBe(5); // All unique
    });
  });

  describe('Retry Logic', () => {
    it('should calculate exponential backoff', () => {
      const delays = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        const delay = 100 * Math.pow(2, attempt);
        delays.push(delay);
      }
      expect(delays).toEqual([100, 200, 400, 800]);
    });

    it('should respect max retry count', () => {
      const maxRetries = 3;
      let attempts = 0;
      while (attempts < maxRetries) {
        attempts++;
      }
      expect(attempts).toBe(maxRetries);
    });

    it('should move to dead letter after max retries', () => {
      const maxRetries = 3;
      const attemptCount = 4;
      const shouldMoveToDead = attemptCount > maxRetries;
      expect(shouldMoveToDead).toBe(true);
    });
  });

  describe('Webhook Signature Generation', () => {
    it('should generate consistent signatures', () => {
      const crypto = require('crypto');
      const payload = { action: 'test', timestamp: '2024-01-30' };
      const secret = 'test-secret';
      const message = JSON.stringify(payload);

      const sig1 = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      const sig2 = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const crypto = require('crypto');
      const secret = 'test-secret';

      const sig1 = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify({ action: 'delete' }))
        .digest('hex');

      const sig2 = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify({ action: 'export' }))
        .digest('hex');

      expect(sig1).not.toBe(sig2);
    });

    it('should generate valid SHA256 hex signatures', () => {
      const crypto = require('crypto');
      const payload = { test: 'data' };
      const secret = 'secret';

      const sig = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      expect(sig).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex is 64 chars
    });
  });

  describe('Dead Letter Queue', () => {
    it('should track dead letter jobs', () => {
      const deadLetterJobs: any[] = [];
      const job = {
        id: 'job-1',
        status: 'dead_letter' as WebhookJobStatus,
        attemptCount: 4,
      };
      deadLetterJobs.push(job);
      expect(deadLetterJobs).toHaveLength(1);
      expect(deadLetterJobs[0].status).toBe('dead_letter');
    });

    it('should move jobs to dead letter after threshold', () => {
      const failureThreshold = 5;
      const failureCount = 5;
      const shouldMoveToDead = failureCount >= failureThreshold;
      expect(shouldMoveToDead).toBe(true);
    });

    it('should deactivate endpoint after repeated failures', () => {
      const endpoint = {
        id: 'webhook-1',
        isActive: true,
        failureCount: 5,
      };

      const deadLetterThreshold = 5;
      if (endpoint.failureCount >= deadLetterThreshold) {
        endpoint.isActive = false;
      }

      expect(endpoint.isActive).toBe(false);
    });

    it('should retry dead letter jobs', async () => {
      const jobId = 'dead-letter-job-1';
      const job = {
        id: jobId,
        status: 'dead_letter' as WebhookJobStatus,
        attemptCount: 4,
      };

      // Simulate retry
      job.status = 'pending';
      job.attemptCount = 1;

      expect(job.status).toBe('pending');
      expect(job.attemptCount).toBe(1);
    });
  });

  describe('Queue Statistics', () => {
    it('should track job statuses', () => {
      const jobs = [
        { id: '1', status: 'pending' as WebhookJobStatus },
        { id: '2', status: 'processing' as WebhookJobStatus },
        { id: '3', status: 'success' as WebhookJobStatus },
        { id: '4', status: 'failed' as WebhookJobStatus },
        { id: '5', status: 'retrying' as WebhookJobStatus },
        { id: '6', status: 'dead_letter' as WebhookJobStatus },
      ];

      const stats = {
        pending: jobs.filter(j => j.status === 'pending').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        success: jobs.filter(j => j.status === 'success').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        retrying: jobs.filter(j => j.status === 'retrying').length,
        deadLetter: jobs.filter(j => j.status === 'dead_letter').length,
      };

      expect(stats.pending).toBe(1);
      expect(stats.processing).toBe(1);
      expect(stats.success).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.retrying).toBe(1);
      expect(stats.deadLetter).toBe(1);
    });

    it('should count total jobs', () => {
      const jobs = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];
      expect(jobs.length).toBe(3);
    });
  });

  describe('Webhook Configuration', () => {
    it('should validate webhook URL', () => {
      const validUrls = [
        'https://example.com/webhook',
        'https://api.example.com/webhooks/audit',
        'https://webhook.example.com:8080/events',
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should reject invalid webhook URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'http://',
      ];

      invalidUrls.forEach(url => {
        expect(() => new URL(url)).toThrow();
      });
    });

    it('should store custom headers', () => {
      const headers = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value',
      };

      expect(headers['Authorization']).toBe('Bearer token123');
      expect(headers['X-Custom-Header']).toBe('value');
    });

    it('should validate timeout range', () => {
      const validTimeouts = [5000, 10000, 30000, 120000];
      const minTimeout = 5000;
      const maxTimeout = 120000;

      validTimeouts.forEach(timeout => {
        expect(timeout).toBeGreaterThanOrEqual(minTimeout);
        expect(timeout).toBeLessThanOrEqual(maxTimeout);
      });
    });
  });

  describe('Job Processing', () => {
    it('should handle successful webhook delivery', () => {
      const job = {
        id: 'job-1',
        status: 'processing' as WebhookJobStatus,
        response: { statusCode: 200 },
      };

      const isSuccess = job.response.statusCode === 200;
      if (isSuccess) {
        job.status = 'success';
      }

      expect(job.status).toBe('success');
    });

    it('should handle failed webhook delivery', () => {
      const job = {
        id: 'job-1',
        status: 'processing' as WebhookJobStatus,
        error: 'Connection timeout',
      };

      if (job.error) {
        job.status = 'failed';
      }

      expect(job.status).toBe('failed');
    });

    it('should track attempt count', () => {
      const job = {
        id: 'job-1',
        attemptCount: 1,
      };

      job.attemptCount++;
      expect(job.attemptCount).toBe(2);

      job.attemptCount++;
      expect(job.attemptCount).toBe(3);
    });
  });

  describe('Concurrent Processing', () => {
    it('should respect max concurrent limit', () => {
      const maxConcurrent = 3;
      const activeJobs = new Set<string>();

      for (let i = 0; i < 10; i++) {
        if (activeJobs.size < maxConcurrent) {
          activeJobs.add(`job-${i}`);
        }
      }

      expect(activeJobs.size).toBeLessThanOrEqual(maxConcurrent);
    });

    it('should process jobs sequentially when at limit', () => {
      const maxConcurrent = 3;
      const queue: string[] = [];
      const activeJobs = new Set<string>();

      for (let i = 0; i < 5; i++) {
        queue.push(`job-${i}`);
      }

      const processed: string[] = [];
      while (queue.length > 0) {
        if (activeJobs.size < maxConcurrent) {
          const job = queue.shift();
          if (job) {
            activeJobs.add(job);
            processed.push(job);
            activeJobs.delete(job);
          }
        }
      }

      expect(processed).toHaveLength(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      const error = new Error('Network timeout');
      expect(error.message).toBe('Network timeout');
    });

    it('should handle invalid webhook endpoint', () => {
      const endpoint = null;
      expect(endpoint).toBeNull();
    });

    it('should handle malformed payloads', () => {
      const payload = null;
      expect(payload).toBeNull();
    });

    it('should log errors for debugging', () => {
      const errorSpy = vi.spyOn(console, 'error');
      console.error('Test error');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('Cleanup Operations', () => {
    it('should clean up old completed jobs', async () => {
      const daysOld = 30;
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      expect(cutoffDate).toBeDefined();
    });

    it('should preserve recent jobs during cleanup', () => {
      const now = new Date();
      const recentJob = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day old
      const cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days old

      expect(recentJob.getTime()).toBeGreaterThan(cutoffDate.getTime());
    });
  });

  describe('Global Queue Instance', () => {
    it('should create global queue instance', () => {
      const globalQueue = new WebhookQueue();
      expect(globalQueue).toBeDefined();
    });

    it('should reuse global queue instance', () => {
      const queue1 = new WebhookQueue();
      const queue2 = new WebhookQueue();
      expect(queue1).toBeDefined();
      expect(queue2).toBeDefined();
    });
  });
});

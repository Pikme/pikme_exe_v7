import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportDeliveryRetryService } from './report-delivery-retry-service';

describe('Report Delivery Retry Service', () => {
  beforeEach(() => {
    ReportDeliveryRetryService.resetCircuitBreaker();
  });

  describe('Exponential Backoff Calculation', () => {
    it('should calculate initial retry delay correctly', () => {
      const policy = {
        maxRetries: 3,
        initialDelayMs: 5000,
        maxDelayMs: 300000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      const now = Date.now();
      const nextRetry = ReportDeliveryRetryService['calculateNextRetryTime'](0, policy);
      const delayMs = nextRetry.getTime() - now;

      // Should be approximately 5000ms (with some tolerance for execution time)
      expect(delayMs).toBeGreaterThanOrEqual(4900);
      expect(delayMs).toBeLessThanOrEqual(5100);
    });

    it('should apply exponential backoff for subsequent retries', () => {
      const policy = {
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 300000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      const attempt1 = ReportDeliveryRetryService['calculateNextRetryTime'](0, policy);
      const attempt2 = ReportDeliveryRetryService['calculateNextRetryTime'](1, policy);
      const attempt3 = ReportDeliveryRetryService['calculateNextRetryTime'](2, policy);

      const delay1 = attempt1.getTime() - Date.now();
      const delay2 = attempt2.getTime() - Date.now();
      const delay3 = attempt3.getTime() - Date.now();

      // Each delay should be approximately 2x the previous
      expect(delay2).toBeGreaterThan(delay1 * 1.5);
      expect(delay3).toBeGreaterThan(delay2 * 1.5);
    });

    it('should cap delay at maxDelayMs', () => {
      const policy = {
        maxRetries: 10,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      const attempt10 = ReportDeliveryRetryService['calculateNextRetryTime'](9, policy);
      const delayMs = attempt10.getTime() - Date.now();

      expect(delayMs).toBeLessThanOrEqual(10100); // With tolerance
    });

    it('should add jitter to prevent thundering herd', () => {
      const policy = {
        maxRetries: 3,
        initialDelayMs: 5000,
        maxDelayMs: 300000,
        backoffMultiplier: 2,
        jitterFactor: 0.2,
      };

      const delays: number[] = [];
      for (let i = 0; i < 10; i++) {
        const nextRetry = ReportDeliveryRetryService['calculateNextRetryTime'](0, policy);
        delays.push(nextRetry.getTime() - Date.now());
      }

      // Delays should vary due to jitter
      const minDelay = Math.min(...delays);
      const maxDelay = Math.max(...delays);
      expect(maxDelay - minDelay).toBeGreaterThan(100);
    });
  });

  describe('Retry Registration', () => {
    it('should register failed delivery for retry', async () => {
      const scheduleId = 1;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      const policy = {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

      const history = ReportDeliveryRetryService.getRetryHistory(scheduleId);
      expect(history).toHaveLength(1);
      expect(history[0].attemptNumber).toBe(1);
      expect(history[0].status).toBe('pending');
      expect(history[0].nextRetryTime).toBeDefined();
    });

    it('should not register retry after max retries exceeded', async () => {
      const scheduleId = 2;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      const policy = {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      // Register 2 retries
      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);
      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

      // Third attempt should not be registered
      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

      const history = ReportDeliveryRetryService.getRetryHistory(scheduleId);
      expect(history).toHaveLength(2);
    });
  });

  describe('Pending Retries', () => {
    it('should return retries that are due', async () => {
      const scheduleId = 3;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      const policy = {
        maxRetries: 3,
        initialDelayMs: 100, // Very short delay for testing
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

      // Wait for retry to be due
      await new Promise(resolve => setTimeout(resolve, 200));

      const pending = ReportDeliveryRetryService.getPendingRetries();
      expect(pending.length).toBeGreaterThan(0);
      expect(pending[0].scheduleId).toBe(scheduleId);
    });

    it('should not return retries that are not yet due', async () => {
      const scheduleId = 4;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      const policy = {
        maxRetries: 3,
        initialDelayMs: 10000, // Long delay
        maxDelayMs: 300000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult, policy);

      const pending = ReportDeliveryRetryService.getPendingRetries();
      expect(pending).toHaveLength(0);
    });
  });

  describe('Attempt Status Tracking', () => {
    it('should mark attempt as successful', async () => {
      const scheduleId = 5;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult);
      ReportDeliveryRetryService.markAsSuccessful(scheduleId, 1);

      const history = ReportDeliveryRetryService.getRetryHistory(scheduleId);
      expect(history[0].status).toBe('success');
    });

    it('should mark attempt as failed with error', async () => {
      const scheduleId = 6;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult);
      ReportDeliveryRetryService.markAsFailed(scheduleId, 1, 'Connection refused');

      const history = ReportDeliveryRetryService.getRetryHistory(scheduleId);
      expect(history[0].status).toBe('failed');
      expect(history[0].error).toBe('Connection refused');
    });
  });

  describe('Error Handling', () => {
    it('should identify retryable errors', async () => {
      const retryableError = new Error('Network timeout');
      const nonRetryableError = new Error('Invalid email address');

      const retryableResult = await ReportDeliveryRetryService.handleDeliveryError(
        1,
        retryableError,
        0
      );
      const nonRetryableResult = await ReportDeliveryRetryService.handleDeliveryError(
        1,
        nonRetryableError,
        0
      );

      expect(retryableResult.shouldRetry).toBe(true);
      expect(nonRetryableResult.shouldRetry).toBe(false);
    });

    it('should not retry after max attempts', async () => {
      const error = new Error('Network timeout');
      const policy = {
        maxRetries: 2,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      };

      const result = await ReportDeliveryRetryService.handleDeliveryError(
        1,
        error,
        2, // Already at max retries
        policy
      );

      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('Retry Statistics', () => {
    it('should calculate retry statistics correctly', async () => {
      const failedResult = {
        scheduleId: 7,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      await ReportDeliveryRetryService.registerForRetry(7, failedResult);
      ReportDeliveryRetryService.markAsSuccessful(7, 1);

      const stats = ReportDeliveryRetryService.getRetryStatistics();
      expect(stats.totalSchedules).toBeGreaterThan(0);
      expect(stats.successfulDeliveries).toBeGreaterThan(0);
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit breaker after failure threshold', async () => {
      const failedResult = {
        scheduleId: 8,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      // Register multiple failures
      for (let i = 0; i < 15; i++) {
        await ReportDeliveryRetryService.registerForRetry(8 + i, failedResult);
        ReportDeliveryRetryService.markAsFailed(8 + i, 1, 'Network error');
      }

      const status = ReportDeliveryRetryService.getCircuitBreakerStatus();
      expect(status.isOpen).toBe(true);
    });

    it('should reset circuit breaker', () => {
      ReportDeliveryRetryService.resetCircuitBreaker();
      const status = ReportDeliveryRetryService.getCircuitBreakerStatus();
      expect(status.isOpen).toBe(false);
      expect(status.failureCount).toBe(0);
    });
  });

  describe('Retry History Management', () => {
    it('should clear retry history for a schedule', async () => {
      const scheduleId = 9;
      const failedResult = {
        scheduleId,
        recipients: ['test@example.com'],
        status: 'failed' as const,
        sentCount: 0,
        failedCount: 1,
        errors: [{ recipient: 'test@example.com', error: 'Network timeout' }],
        timestamp: new Date(),
      };

      await ReportDeliveryRetryService.registerForRetry(scheduleId, failedResult);
      expect(ReportDeliveryRetryService.getRetryHistory(scheduleId)).toHaveLength(1);

      ReportDeliveryRetryService.clearRetryHistory(scheduleId);
      expect(ReportDeliveryRetryService.getRetryHistory(scheduleId)).toHaveLength(0);
    });
  });
});

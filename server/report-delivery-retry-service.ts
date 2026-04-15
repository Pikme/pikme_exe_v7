import { DeliveryResult } from './report-delivery-service';

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface DeliveryAttempt {
  scheduleId: number;
  attemptNumber: number;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  nextRetryTime?: Date;
}

/**
 * Report Delivery Retry Service
 * Handles retry logic and error recovery for failed report deliveries
 */
export class ReportDeliveryRetryService {
  private static readonly DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxRetries: 3,
    initialDelayMs: 5000, // 5 seconds
    maxDelayMs: 300000, // 5 minutes
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  };

  private static retryQueue: Map<number, DeliveryAttempt[]> = new Map();

  /**
   * Register a failed delivery for retry
   */
  static async registerForRetry(
    scheduleId: number,
    failedResult: DeliveryResult,
    policy: RetryPolicy = this.DEFAULT_RETRY_POLICY
  ): Promise<void> {
    const attempts = this.retryQueue.get(scheduleId) || [];

    // Check if we've exceeded max retries
    const failedAttempts = attempts.filter(a => a.status === 'failed').length;
    if (failedAttempts >= policy.maxRetries) {
      console.log(`Max retries exceeded for schedule ${scheduleId}`);
      return;
    }

    // Calculate next retry time
    const nextRetryTime = this.calculateNextRetryTime(
      failedAttempts,
      policy
    );

    const attempt: DeliveryAttempt = {
      scheduleId,
      attemptNumber: failedAttempts + 1,
      timestamp: new Date(),
      status: 'pending',
      nextRetryTime,
    };

    attempts.push(attempt);
    this.retryQueue.set(scheduleId, attempts);

    console.log(
      `Registered retry for schedule ${scheduleId}, attempt ${attempt.attemptNumber}, ` +
      `next retry at ${nextRetryTime.toISOString()}`
    );
  }

  /**
   * Calculate next retry time using exponential backoff with jitter
   */
  private static calculateNextRetryTime(
    attemptNumber: number,
    policy: RetryPolicy
  ): Date {
    // Exponential backoff: initialDelay * (backoffMultiplier ^ attemptNumber)
    let delayMs = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attemptNumber);

    // Cap at max delay
    delayMs = Math.min(delayMs, policy.maxDelayMs);

    // Add jitter to prevent thundering herd
    const jitter = delayMs * policy.jitterFactor * (Math.random() - 0.5);
    delayMs = Math.max(delayMs + jitter, 0);

    const nextRetryTime = new Date(Date.now() + delayMs);
    return nextRetryTime;
  }

  /**
   * Get pending retries
   */
  static getPendingRetries(): DeliveryAttempt[] {
    const now = new Date();
    const pending: DeliveryAttempt[] = [];

    for (const [, attempts] of this.retryQueue) {
      for (const attempt of attempts) {
        if (
          attempt.status === 'pending' &&
          attempt.nextRetryTime &&
          attempt.nextRetryTime <= now
        ) {
          pending.push(attempt);
        }
      }
    }

    return pending;
  }

  /**
   * Mark delivery attempt as successful
   */
  static markAsSuccessful(scheduleId: number, attemptNumber: number): void {
    const attempts = this.retryQueue.get(scheduleId);
    if (!attempts) return;

    const attempt = attempts.find(a => a.attemptNumber === attemptNumber);
    if (attempt) {
      attempt.status = 'success';
      console.log(`Marked schedule ${scheduleId} attempt ${attemptNumber} as successful`);
    }
  }

  /**
   * Mark delivery attempt as failed
   */
  static markAsFailed(
    scheduleId: number,
    attemptNumber: number,
    error: string
  ): void {
    const attempts = this.retryQueue.get(scheduleId);
    if (!attempts) return;

    const attempt = attempts.find(a => a.attemptNumber === attemptNumber);
    if (attempt) {
      attempt.status = 'failed';
      attempt.error = error;
      console.log(`Marked schedule ${scheduleId} attempt ${attemptNumber} as failed: ${error}`);
    }
  }

  /**
   * Get retry history for a schedule
   */
  static getRetryHistory(scheduleId: number): DeliveryAttempt[] {
    return this.retryQueue.get(scheduleId) || [];
  }

  /**
   * Clear retry history for a schedule
   */
  static clearRetryHistory(scheduleId: number): void {
    this.retryQueue.delete(scheduleId);
  }

  /**
   * Get retry statistics
   */
  static getRetryStatistics(): {
    totalSchedules: number;
    pendingRetries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
  } {
    let pendingRetries = 0;
    let successfulDeliveries = 0;
    let failedDeliveries = 0;

    for (const [, attempts] of this.retryQueue) {
      for (const attempt of attempts) {
        if (attempt.status === 'pending') {
          pendingRetries++;
        } else if (attempt.status === 'success') {
          successfulDeliveries++;
        } else if (attempt.status === 'failed') {
          failedDeliveries++;
        }
      }
    }

    return {
      totalSchedules: this.retryQueue.size,
      pendingRetries,
      successfulDeliveries,
      failedDeliveries,
    };
  }

  /**
   * Handle delivery error with automatic retry decision
   */
  static async handleDeliveryError(
    scheduleId: number,
    error: Error,
    attemptNumber: number,
    policy: RetryPolicy = this.DEFAULT_RETRY_POLICY
  ): Promise<{ shouldRetry: boolean; nextRetryTime?: Date }> {
    // Determine if error is retryable
    const isRetryable = this.isRetryableError(error);

    if (!isRetryable) {
      console.log(`Non-retryable error for schedule ${scheduleId}: ${error.message}`);
      return { shouldRetry: false };
    }

    // Check if we've exceeded max retries
    if (attemptNumber >= policy.maxRetries) {
      console.log(`Max retries exceeded for schedule ${scheduleId}`);
      return { shouldRetry: false };
    }

    // Calculate next retry time
    const nextRetryTime = this.calculateNextRetryTime(attemptNumber, policy);

    return {
      shouldRetry: true,
      nextRetryTime,
    };
  }

  /**
   * Determine if an error is retryable
   */
  private static isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Non-retryable errors
    const nonRetryablePatterns = [
      'invalid email',
      'unauthorized',
      'forbidden',
      'not found',
      'bad request',
      'authentication failed',
    ];

    for (const pattern of nonRetryablePatterns) {
      if (message.includes(pattern)) {
        return false;
      }
    }

    // Retryable errors (network, timeout, rate limit, etc.)
    return true;
  }

  /**
   * Get circuit breaker status
   */
  static getCircuitBreakerStatus(): {
    isOpen: boolean;
    failureCount: number;
    failureThreshold: number;
    resetTime?: Date;
  } {
    // This would typically track failure rates and open circuit if threshold exceeded
    const stats = this.getRetryStatistics();
    const failureCount = stats.failedDeliveries;
    const failureThreshold = 10; // Open circuit after 10 failures

    return {
      isOpen: failureCount >= failureThreshold,
      failureCount,
      failureThreshold,
    };
  }

  /**
   * Reset circuit breaker
   */
  static resetCircuitBreaker(): void {
    console.log('Resetting circuit breaker');
    this.retryQueue.clear();
  }
}

export const reportDeliveryRetryService = ReportDeliveryRetryService;

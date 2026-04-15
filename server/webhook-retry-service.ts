import { WebhookEvent } from "./webhooks/email-provider-webhook";

/**
 * Webhook Retry and Error Handling Service
 * Manages retries, exponential backoff, and error recovery
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface RetryableEvent {
  event: WebhookEvent;
  attempt: number;
  lastError?: Error;
  nextRetryTime?: Date;
}

export class WebhookRetryManager {
  private queue: Map<string, RetryableEvent> = new Map();
  private config: RetryConfig;
  private processing = false;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries || 5,
      initialDelayMs: config.initialDelayMs || 1000,
      maxDelayMs: config.maxDelayMs || 300000, // 5 minutes
      backoffMultiplier: config.backoffMultiplier || 2,
      jitterFactor: config.jitterFactor || 0.1,
    };
  }

  /**
   * Calculate delay for next retry with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1),
      this.config.maxDelayMs
    );

    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * this.config.jitterFactor * (Math.random() - 0.5);
    return Math.max(0, exponentialDelay + jitter);
  }

  /**
   * Generate unique key for event
   */
  private getEventKey(event: WebhookEvent): string {
    return `${event.messageId || event.email}-${event.type}-${event.timestamp}`;
  }

  /**
   * Add event to retry queue
   */
  async enqueueForRetry(event: WebhookEvent, error: Error): Promise<void> {
    const key = this.getEventKey(event);
    const existing = this.queue.get(key);

    const attempt = (existing?.attempt || 0) + 1;

    if (attempt > this.config.maxRetries) {
      console.error(
        `Event ${key} exceeded max retries (${this.config.maxRetries}). Giving up.`,
        error
      );
      this.queue.delete(key);
      return;
    }

    const delay = this.calculateDelay(attempt);
    const nextRetryTime = new Date(Date.now() + delay);

    const retryableEvent: RetryableEvent = {
      event,
      attempt,
      lastError: error,
      nextRetryTime,
    };

    this.queue.set(key, retryableEvent);

    console.log(
      `Event ${key} queued for retry ${attempt}/${this.config.maxRetries} in ${delay}ms`
    );

    // Schedule retry
    this.scheduleRetry(key, delay);
  }

  /**
   * Schedule retry for specific event
   */
  private scheduleRetry(key: string, delayMs: number): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new retry
    const timer = setTimeout(() => {
      this.timers.delete(key);
      this.processRetry(key);
    }, delayMs);

    this.timers.set(key, timer);
  }

  /**
   * Process retry for specific event
   */
  private async processRetry(key: string): Promise<void> {
    const retryableEvent = this.queue.get(key);
    if (!retryableEvent) {
      return;
    }

    console.log(
      `Processing retry ${retryableEvent.attempt}/${this.config.maxRetries} for event ${key}`
    );

    // Event will be picked up by main processing loop
    // This is just to trigger processing
    if (!this.processing) {
      this.process();
    }
  }

  /**
   * Get all events pending retry
   */
  getPendingRetries(): RetryableEvent[] {
    return Array.from(this.queue.values()).sort(
      (a, b) => (a.nextRetryTime?.getTime() || 0) - (b.nextRetryTime?.getTime() || 0)
    );
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    totalPending: number;
    byAttempt: Record<number, number>;
    oldestRetry?: Date;
    newestRetry?: Date;
  } {
    const stats = {
      totalPending: this.queue.size,
      byAttempt: {} as Record<number, number>,
      oldestRetry: undefined as Date | undefined,
      newestRetry: undefined as Date | undefined,
    };

    this.queue.forEach((retryable) => {
      stats.byAttempt[retryable.attempt] = (stats.byAttempt[retryable.attempt] || 0) + 1;

      if (retryable.nextRetryTime) {
        if (!stats.oldestRetry || retryable.nextRetryTime < stats.oldestRetry) {
          stats.oldestRetry = retryable.nextRetryTime;
        }
        if (!stats.newestRetry || retryable.nextRetryTime > stats.newestRetry) {
          stats.newestRetry = retryable.nextRetryTime;
        }
      }
    });

    return stats;
  }

  /**
   * Clear all pending retries
   */
  clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.queue.clear();
  }

  /**
   * Remove specific event from retry queue
   */
  remove(event: WebhookEvent): boolean {
    const key = this.getEventKey(event);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    return this.queue.delete(key);
  }

  /**
   * Process method to be implemented by subclass
   */
  protected async process(): Promise<void> {
    // Override in subclass
  }
}

/**
 * Error classification for webhook processing
 */
export enum ErrorType {
  TEMPORARY = "temporary", // Retry-able errors
  PERMANENT = "permanent", // Non-retry-able errors
  UNKNOWN = "unknown",
}

/**
 * Classify error type for retry decision
 */
export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  // Temporary errors - should retry
  const temporaryPatterns = [
    "timeout",
    "econnrefused",
    "econnreset",
    "ehostunreach",
    "enetunreach",
    "temporarily unavailable",
    "try again",
    "service unavailable",
    "gateway timeout",
    "connection reset",
  ];

  for (const pattern of temporaryPatterns) {
    if (message.includes(pattern)) {
      return ErrorType.TEMPORARY;
    }
  }

  // Permanent errors - don't retry
  const permanentPatterns = [
    "invalid",
    "not found",
    "unauthorized",
    "forbidden",
    "bad request",
    "malformed",
    "syntax error",
    "authentication failed",
  ];

  for (const pattern of permanentPatterns) {
    if (message.includes(pattern)) {
      return ErrorType.PERMANENT;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Webhook error handler with recovery strategies
 */
export class WebhookErrorHandler {
  private errorLog: Array<{
    timestamp: Date;
    error: Error;
    errorType: ErrorType;
    context?: Record<string, any>;
  }> = [];

  private maxLogSize = 1000;

  /**
   * Handle webhook processing error
   */
  async handleError(
    error: Error,
    context?: Record<string, any>
  ): Promise<{
    shouldRetry: boolean;
    errorType: ErrorType;
    message: string;
  }> {
    const errorType = classifyError(error);

    // Log error
    this.logError(error, errorType, context);

    // Determine retry strategy
    const shouldRetry = errorType === ErrorType.TEMPORARY;

    return {
      shouldRetry,
      errorType,
      message: this.getErrorMessage(error, errorType),
    };
  }

  /**
   * Log error for monitoring
   */
  private logError(error: Error, errorType: ErrorType, context?: Record<string, any>): void {
    this.errorLog.push({
      timestamp: new Date(),
      error,
      errorType,
      context,
    });

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    console.error(`[${errorType}] Webhook error:`, error.message, context);
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: Error, errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.TEMPORARY:
        return "Temporary error - will retry automatically";
      case ErrorType.PERMANENT:
        return "Permanent error - manual intervention required";
      default:
        return `Error: ${error.message}`;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    temporaryErrors: number;
    permanentErrors: number;
    unknownErrors: number;
    recentErrors: Array<{
      timestamp: Date;
      message: string;
      type: ErrorType;
    }>;
  } {
    const stats = {
      totalErrors: this.errorLog.length,
      temporaryErrors: 0,
      permanentErrors: 0,
      unknownErrors: 0,
      recentErrors: [] as Array<{
        timestamp: Date;
        message: string;
        type: ErrorType;
      }>,
    };

    this.errorLog.forEach((log) => {
      if (log.errorType === ErrorType.TEMPORARY) stats.temporaryErrors++;
      else if (log.errorType === ErrorType.PERMANENT) stats.permanentErrors++;
      else stats.unknownErrors++;
    });

    // Get last 10 errors
    stats.recentErrors = this.errorLog
      .slice(-10)
      .map((log) => ({
        timestamp: log.timestamp,
        message: log.error.message,
        type: log.errorType,
      }));

    return stats;
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }
}

/**
 * Webhook circuit breaker for handling cascading failures
 */
export class WebhookCircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private readonly failureThreshold = 5;
  private readonly successThreshold = 2;
  private readonly resetTimeoutMs = 60000; // 1 minute

  /**
   * Record successful webhook processing
   */
  recordSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "closed";
        this.failureCount = 0;
        this.successCount = 0;
        console.log("Circuit breaker closed - service recovered");
      }
    } else if (this.state === "closed") {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  /**
   * Record failed webhook processing
   */
  recordFailure(): void {
    this.lastFailureTime = new Date();
    this.failureCount++;

    if (this.state === "closed" && this.failureCount >= this.failureThreshold) {
      this.state = "open";
      console.warn("Circuit breaker opened - too many failures");
      this.scheduleReset();
    } else if (this.state === "half-open") {
      this.state = "open";
      this.successCount = 0;
      this.scheduleReset();
    }
  }

  /**
   * Check if requests should be allowed
   */
  isOpen(): boolean {
    return this.state === "open";
  }

  /**
   * Get circuit breaker status
   */
  getStatus(): {
    state: string;
    failureCount: number;
    successCount: number;
    lastFailureTime?: Date;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Schedule circuit breaker reset
   */
  private scheduleReset(): void {
    setTimeout(() => {
      if (this.state === "open") {
        this.state = "half-open";
        this.successCount = 0;
        console.log("Circuit breaker half-open - testing recovery");
      }
    }, this.resetTimeoutMs);
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    console.log("Circuit breaker manually reset");
  }
}

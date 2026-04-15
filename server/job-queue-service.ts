import Queue from "bull";
import Redis from "ioredis";

/**
 * Job Queue Service
 * Manages background jobs for report generation and delivery
 */
export class JobQueueService {
  private redis: Redis;
  private reportGenerationQueue: Queue.Queue;
  private emailDeliveryQueue: Queue.Queue;
  private scheduleExecutorQueue: Queue.Queue;

  constructor() {
    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Initialize job queues
    this.reportGenerationQueue = new Queue("report-generation", {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
    });

    this.emailDeliveryQueue = new Queue("email-delivery", {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
    });

    this.scheduleExecutorQueue = new Queue("schedule-executor", {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
    });

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for all queues
   */
  private setupEventHandlers() {
    // Report generation queue events
    this.reportGenerationQueue.on("completed", (job) => {
      console.log(`[Report Generation] Job ${job.id} completed`);
    });

    this.reportGenerationQueue.on("failed", (job, err) => {
      console.error(`[Report Generation] Job ${job.id} failed:`, err.message);
    });

    // Email delivery queue events
    this.emailDeliveryQueue.on("completed", (job) => {
      console.log(`[Email Delivery] Job ${job.id} completed`);
    });

    this.emailDeliveryQueue.on("failed", (job, err) => {
      console.error(`[Email Delivery] Job ${job.id} failed:`, err.message);
    });

    // Schedule executor queue events
    this.scheduleExecutorQueue.on("completed", (job) => {
      console.log(`[Schedule Executor] Job ${job.id} completed`);
    });

    this.scheduleExecutorQueue.on("failed", (job, err) => {
      console.error(`[Schedule Executor] Job ${job.id} failed:`, err.message);
    });
  }

  /**
   * Add a report generation job to the queue
   */
  async addReportGenerationJob(data: {
    scheduleId: string;
    reportType: string;
    dateRangeType: string;
    customDaysBack?: number;
    deliveryId: string;
  }) {
    return this.reportGenerationQueue.add(data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `report-${data.scheduleId}-${Date.now()}`,
    });
  }

  /**
   * Add an email delivery job to the queue
   */
  async addEmailDeliveryJob(data: {
    deliveryId: string;
    recipients: string[];
    subject: string;
    reportData: any;
    attachmentUrl?: string;
    attachmentFormat?: string;
  }) {
    return this.emailDeliveryQueue.add(data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `email-${data.deliveryId}-${Date.now()}`,
    });
  }

  /**
   * Add a schedule executor job to the queue
   */
  async addScheduleExecutorJob(data: {
    scheduleId: string;
    nextRunAt: Date;
  }) {
    const delayMs = Math.max(0, data.nextRunAt.getTime() - Date.now());

    return this.scheduleExecutorQueue.add(data, {
      delay: delayMs,
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `schedule-${data.scheduleId}-${data.nextRunAt.getTime()}`,
    });
  }

  /**
   * Get report generation queue
   */
  getReportGenerationQueue(): Queue.Queue {
    return this.reportGenerationQueue;
  }

  /**
   * Get email delivery queue
   */
  getEmailDeliveryQueue(): Queue.Queue {
    return this.emailDeliveryQueue;
  }

  /**
   * Get schedule executor queue
   */
  getScheduleExecutorQueue(): Queue.Queue {
    return this.scheduleExecutorQueue;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const reportGenStats = await this.reportGenerationQueue.getJobCounts();
    const emailDeliveryStats = await this.emailDeliveryQueue.getJobCounts();
    const scheduleExecutorStats = await this.scheduleExecutorQueue.getJobCounts();

    return {
      reportGeneration: reportGenStats,
      emailDelivery: emailDeliveryStats,
      scheduleExecutor: scheduleExecutorStats,
    };
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(queueName: "report-generation" | "email-delivery" | "schedule-executor") {
    const queue = this.getQueueByName(queueName);
    return queue.getFailed(0, -1);
  }

  /**
   * Retry a failed job
   */
  async retryFailedJob(queueName: "report-generation" | "email-delivery" | "schedule-executor", jobId: string) {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.isFailed()) {
      await job.retry();
      return true;
    }

    return false;
  }

  /**
   * Get queue by name
   */
  private getQueueByName(name: "report-generation" | "email-delivery" | "schedule-executor"): Queue.Queue {
    switch (name) {
      case "report-generation":
        return this.reportGenerationQueue;
      case "email-delivery":
        return this.emailDeliveryQueue;
      case "schedule-executor":
        return this.scheduleExecutorQueue;
      default:
        throw new Error(`Unknown queue: ${name}`);
    }
  }

  /**
   * Clean up old jobs
   */
  async cleanupOldJobs() {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    await this.reportGenerationQueue.clean(oneWeekAgo, "completed");
    await this.reportGenerationQueue.clean(oneWeekAgo, "failed");

    await this.emailDeliveryQueue.clean(oneWeekAgo, "completed");
    await this.emailDeliveryQueue.clean(oneWeekAgo, "failed");

    await this.scheduleExecutorQueue.clean(oneWeekAgo, "completed");
    await this.scheduleExecutorQueue.clean(oneWeekAgo, "failed");
  }

  /**
   * Close all queues and Redis connection
   */
  async close() {
    await this.reportGenerationQueue.close();
    await this.emailDeliveryQueue.close();
    await this.scheduleExecutorQueue.close();
    await this.redis.quit();
  }
}

// Singleton instance
let jobQueueService: JobQueueService;

export function getJobQueueService(): JobQueueService {
  if (!jobQueueService) {
    jobQueueService = new JobQueueService();
  }
  return jobQueueService;
}

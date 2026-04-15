/**
 * Promotion Scheduler
 * Runs periodic checks to promote winning variants automatically
 */

import { CronJob } from "cron";
import { checkAllExperimentsForPromotion } from "../services/automatic-promotion";

let promotionJob: CronJob | null = null;

/**
 * Initialize the promotion scheduler
 * Runs every 6 hours to check for statistical significance
 */
export function initializePromotionScheduler() {
  try {
    // Run every 6 hours at minute 0
    // Format: second minute hour day month day-of-week
    promotionJob = new CronJob("0 0 */6 * * *", async () => {
      await runPromotionCheck();
    });

    promotionJob.start();
    console.log("[PromotionScheduler] Initialized - checks run every 6 hours");
  } catch (error) {
    console.error("[PromotionScheduler] Failed to initialize:", error);
  }
}

/**
 * Run promotion check manually
 */
export async function runPromotionCheck(minSampleSize: number = 100) {
  try {
    console.log("[PromotionScheduler] Starting promotion check...");
    const results = await checkAllExperimentsForPromotion(minSampleSize);

    let successCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.success) {
        successCount++;
        console.log(`[PromotionScheduler] ✓ ${result.message}`);
      } else {
        failureCount++;
        console.log(`[PromotionScheduler] ✗ ${result.message}`);
      }
    }

    console.log(
      `[PromotionScheduler] Check completed: ${successCount} promotions, ${failureCount} no-ops/errors`
    );

    return {
      successCount,
      failureCount,
      results,
    };
  } catch (error) {
    console.error("[PromotionScheduler] Error during promotion check:", error);
    return {
      successCount: 0,
      failureCount: 1,
      results: [
        {
          success: false,
          message: `Scheduler error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

/**
 * Stop the promotion scheduler
 */
export function stopPromotionScheduler() {
  if (promotionJob) {
    promotionJob.stop();
    promotionJob = null;
    console.log("[PromotionScheduler] Stopped");
  }
}

/**
 * Check if scheduler is running
 */
export function isPromotionSchedulerRunning(): boolean {
  return promotionJob !== null && promotionJob.running;
}

/**
 * Get next run time
 */
export function getNextPromotionCheckTime(): Date | null {
  if (!promotionJob) return null;
  return promotionJob.nextDate().toDate();
}

/**
 * Restart the scheduler
 */
export function restartPromotionScheduler() {
  stopPromotionScheduler();
  initializePromotionScheduler();
}

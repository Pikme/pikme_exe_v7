import cron from "node-cron";
import { generateAllSitemaps } from "./sitemap-generator";

let scheduledTask: cron.ScheduledTask | null = null;

/**
 * Start the sitemap generation scheduler
 * Runs daily at 2:00 AM
 */
export function startSitemapScheduler(): void {
  if (scheduledTask) {
    console.log("[Scheduler] Sitemap scheduler already running");
    return;
  }

  try {
    // Schedule for 2:00 AM daily (02:00 in 24-hour format)
    // Cron format: minute hour day month dayOfWeek
    scheduledTask = cron.schedule("0 2 * * *", async () => {
      console.log("[Scheduler] Running scheduled sitemap generation...");
      try {
        await generateAllSitemaps();
        console.log("[Scheduler] ✅ Scheduled sitemap generation completed successfully");
      } catch (error) {
        console.error("[Scheduler] ❌ Error during scheduled sitemap generation:", error);
      }
    });

    console.log("[Scheduler] ✅ Sitemap scheduler started (runs daily at 2:00 AM)");

    // Also run immediately on startup
    console.log("[Scheduler] Running initial sitemap generation...");
    generateAllSitemaps().catch((error) => {
      console.error("[Scheduler] ❌ Error during initial sitemap generation:", error);
    });
  } catch (error) {
    console.error("[Scheduler] ❌ Failed to start sitemap scheduler:", error);
  }
}

/**
 * Stop the sitemap generation scheduler
 */
export function stopSitemapScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("[Scheduler] Sitemap scheduler stopped");
  }
}

/**
 * Manually trigger sitemap generation
 */
export async function triggerSitemapGeneration(): Promise<void> {
  console.log("[Scheduler] Manually triggering sitemap generation...");
  try {
    await generateAllSitemaps();
    console.log("[Scheduler] ✅ Manual sitemap generation completed successfully");
  } catch (error) {
    console.error("[Scheduler] ❌ Error during manual sitemap generation:", error);
    throw error;
  }
}

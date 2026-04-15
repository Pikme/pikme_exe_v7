import cron from "node-cron";
import {
  createValidationLog,
  updateValidationLog,
  createValidationIssue,
  validateAttractions,
  validateTours,
  validateLocations,
  getValidationStatistics,
} from "../db";
import { notifyOwner } from "./notification";

/**
 * Validation job configuration
 */
export interface ValidationJobConfig {
  enabled: boolean;
  schedule: string; // Cron expression (default: daily at 2 AM)
  validationTypes: ("attractions" | "tours" | "locations" | "all")[];
  notifyOnFailure: boolean;
  notifyOnAnomalies: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ValidationJobConfig = {
  enabled: true,
  schedule: "0 2 * * *", // Daily at 2 AM
  validationTypes: ["attractions", "tours", "locations"],
  notifyOnFailure: true,
  notifyOnAnomalies: true,
};

let validationJob: cron.ScheduledTask | null = null;

/**
 * Start the validation scheduler
 */
export function startValidationScheduler(config: Partial<ValidationJobConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.enabled) {
    console.log("[Validation Scheduler] Disabled");
    return;
  }

  if (validationJob) {
    console.log("[Validation Scheduler] Already running");
    return;
  }

  validationJob = cron.schedule(finalConfig.schedule, async () => {
    console.log("[Validation Scheduler] Starting validation job...");
    await runValidationJob(finalConfig);
  });

  console.log(`[Validation Scheduler] Started with schedule: ${finalConfig.schedule}`);
}

/**
 * Stop the validation scheduler
 */
export function stopValidationScheduler() {
  if (validationJob) {
    validationJob.stop();
    validationJob = null;
    console.log("[Validation Scheduler] Stopped");
  }
}

/**
 * Run validation job manually
 */
export async function runValidationJob(config: ValidationJobConfig = DEFAULT_CONFIG) {
  const startTime = Date.now();

  try {
    // Create validation log
    const logId = await createValidationLog({
      validationType: config.validationTypes.includes("all") ? "all" : config.validationTypes[0],
      status: "processing",
      totalRecords: 0,
    });

    let totalRecords = 0;
    let totalValidRecords = 0;
    let totalInvalidRecords = 0;
    let totalWarnings = 0;
    const allIssues: any[] = [];
    const allAnomalies: any[] = [];
    const suggestedActions: any[] = [];

    // Validate attractions
    if (config.validationTypes.includes("attractions") || config.validationTypes.includes("all")) {
      console.log("[Validation] Validating attractions...");
      const result = await validateAttractions();
      totalRecords += result.validCount;
      totalValidRecords += result.validCount;
      totalInvalidRecords += result.issues.length;
      totalWarnings += result.issues.filter((i) => i.severity === "warning").length;
      allIssues.push(...result.issues);
      allAnomalies.push(...result.anomalies);
    }

    // Validate tours
    if (config.validationTypes.includes("tours") || config.validationTypes.includes("all")) {
      console.log("[Validation] Validating tours...");
      const result = await validateTours();
      totalRecords += result.validCount;
      totalValidRecords += result.validCount;
      totalInvalidRecords += result.issues.length;
      totalWarnings += result.issues.filter((i) => i.severity === "warning").length;
      allIssues.push(...result.issues);
      allAnomalies.push(...result.anomalies);
    }

    // Validate locations
    if (config.validationTypes.includes("locations") || config.validationTypes.includes("all")) {
      console.log("[Validation] Validating locations...");
      const result = await validateLocations();
      totalRecords += result.validCount;
      totalValidRecords += result.validCount;
      totalInvalidRecords += result.issues.length;
      totalWarnings += result.issues.filter((i) => i.severity === "warning").length;
      allIssues.push(...result.issues);
      allAnomalies.push(...result.anomalies);
    }

    // Generate suggested actions
    if (totalInvalidRecords > 0) {
      suggestedActions.push({
        action: "review_issues",
        priority: "high",
        message: `${totalInvalidRecords} validation issues found. Review and fix them immediately.`,
      });
    }

    if (allAnomalies.length > 0) {
      suggestedActions.push({
        action: "review_anomalies",
        priority: "medium",
        message: `${allAnomalies.length} data anomalies detected. Review for potential data quality issues.`,
      });
    }

    const executionTime = Date.now() - startTime;

    // Update validation log
    await updateValidationLog(logId, {
      status: totalInvalidRecords > 0 ? "completed" : "completed",
      validRecords: totalValidRecords,
      invalidRecords: totalInvalidRecords,
      warnings: totalWarnings,
      errors: allIssues,
      anomalies: allAnomalies,
      suggestedActions,
      executionTime,
      completedAt: new Date(),
    });

    console.log(
      `[Validation] Completed in ${executionTime}ms. Valid: ${totalValidRecords}, Invalid: ${totalInvalidRecords}, Warnings: ${totalWarnings}`
    );

    // Send notifications
    if (config.notifyOnFailure && totalInvalidRecords > 0) {
      await notifyOwner({
        title: "🚨 Data Validation Failed",
        content: `Validation job completed with ${totalInvalidRecords} issues found.\n\nWarnings: ${totalWarnings}\nAnomalies: ${allAnomalies.length}\n\nPlease review the validation dashboard for details.`,
      });
    }

    if (config.notifyOnAnomalies && allAnomalies.length > 0) {
      await notifyOwner({
        title: "⚠️ Data Anomalies Detected",
        content: `${allAnomalies.length} data anomalies were detected during validation.\n\nReview the validation dashboard to investigate these anomalies and take corrective action.`,
      });
    }

    return {
      success: true,
      logId,
      totalRecords,
      validRecords: totalValidRecords,
      invalidRecords: totalInvalidRecords,
      warnings: totalWarnings,
      anomalies: allAnomalies.length,
      executionTime,
    };
  } catch (error) {
    console.error("[Validation] Job failed:", error);

    // Send failure notification
    if (config.notifyOnFailure) {
      await notifyOwner({
        title: "❌ Data Validation Job Failed",
        content: `The scheduled validation job failed with error:\n\n${error instanceof Error ? error.message : String(error)}\n\nPlease check the server logs for details.`,
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get validation statistics
 */
export async function getValidationStats(days: number = 30) {
  return getValidationStatistics(days);
}

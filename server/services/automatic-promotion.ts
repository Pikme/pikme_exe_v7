/**
 * Automatic Promotion Service
 * Handles automatic promotion of winning variants when statistical significance is reached
 */

import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { featureFlags, abTestingExperiments } from "../../drizzle/schema";
import { aggregateExperimentMetrics } from "./experiment-metrics";
import { calculateChiSquare } from "./statistical-analysis";
import { notifyOwner } from "../_core/notification";

export interface PromotionResult {
  success: boolean;
  message: string;
  flagId?: number;
  flagName?: string;
  winningVariant?: string;
  rolloutPercentage?: number;
  pValue?: number;
}

/**
 * Check if an experiment has achieved statistical significance
 * and automatically promote the winner
 */
export async function checkAndPromoteWinner(
  experimentId: number,
  minSampleSize: number = 100
): Promise<PromotionResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Database not available",
      };
    }

    // Get experiment metrics
    const summary = await aggregateExperimentMetrics(experimentId);
    if (!summary) {
      return {
        success: false,
        message: `Experiment ${experimentId} not found`,
      };
    }

    // Check if we have enough samples
    if (summary.totalSamples < minSampleSize) {
      return {
        success: false,
        message: `Insufficient samples. Have ${summary.totalSamples}, need ${minSampleSize}`,
      };
    }

    // Need at least 2 variants for comparison
    if (summary.variants.length < 2) {
      return {
        success: false,
        message: "Need at least 2 variants for comparison",
      };
    }

    // Compare control (first variant) with treatment (second variant)
    const control = summary.variants[0];
    const treatment = summary.variants[1];

    const result = calculateChiSquare(control, treatment);

    // Check if statistically significant
    if (!result.isSignificant) {
      return {
        success: false,
        message: `Not statistically significant yet (p-value: ${result.pValue.toFixed(4)}). ${result.recommendation}`,
      };
    }

    // Determine winner
    const controlRate = control.conversions / control.sampleSize;
    const treatmentRate = treatment.conversions / treatment.sampleSize;
    const winningVariant = treatmentRate > controlRate ? treatment.variantName : control.variantName;

    // Update feature flag to 100% rollout for winner
    const flagUpdate = await db
      .update(featureFlags)
      .set({
        rolloutPercentage: 100,
        enabled: true,
        updatedAt: new Date(),
      })
      .where(eq(featureFlags.id, summary.flagId))
      .returning();

    if (!flagUpdate.length) {
      return {
        success: false,
        message: `Failed to update feature flag ${summary.flagId}`,
      };
    }

    // Mark experiment as completed
    await db
      .update(abTestingExperiments)
      .set({
        status: "completed",
        winner: winningVariant,
        completedAt: new Date(),
      })
      .where(eq(abTestingExperiments.id, experimentId));

    // Send notification to owner
    const improvement = ((Math.abs(treatmentRate - controlRate) / controlRate) * 100).toFixed(2);
    const notificationResult = await notifyOwner({
      title: `🎉 Experiment Winner: ${summary.flagName}`,
      content: `The ${winningVariant} variant has achieved statistical significance (p < 0.05) with a ${improvement}% improvement over control. It has been automatically promoted to 100% rollout.`,
    });

    return {
      success: true,
      message: `Successfully promoted ${winningVariant} to 100% rollout`,
      flagId: summary.flagId,
      flagName: summary.flagName,
      winningVariant,
      rolloutPercentage: 100,
      pValue: result.pValue,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Error checking and promoting winner: ${message}`,
    };
  }
}

/**
 * Batch check all active experiments for promotion
 */
export async function checkAllExperimentsForPromotion(
  minSampleSize: number = 100
): Promise<PromotionResult[]> {
  try {
    const db = await getDb();
    if (!db) {
      return [
        {
          success: false,
          message: "Database not available",
        },
      ];
    }

    // Get all active experiments
    const activeExperiments = await db
      .select()
      .from(abTestingExperiments)
      .where(eq(abTestingExperiments.status, "active"));

    const results: PromotionResult[] = [];

    for (const experiment of activeExperiments) {
      const result = await checkAndPromoteWinner(experiment.id, minSampleSize);
      results.push(result);
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return [
      {
        success: false,
        message: `Error checking experiments: ${message}`,
      },
    ];
  }
}

/**
 * Manually promote a variant to 100% (admin action)
 */
export async function manuallyPromoteVariant(
  flagId: number,
  variant: string
): Promise<PromotionResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Database not available",
      };
    }

    // Get the flag
    const flag = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, flagId))
      .limit(1);

    if (!flag.length) {
      return {
        success: false,
        message: `Feature flag ${flagId} not found`,
      };
    }

    // Update to 100% rollout
    const updated = await db
      .update(featureFlags)
      .set({
        rolloutPercentage: 100,
        enabled: true,
        updatedAt: new Date(),
      })
      .where(eq(featureFlags.id, flagId))
      .returning();

    if (!updated.length) {
      return {
        success: false,
        message: `Failed to update feature flag`,
      };
    }

    // Send notification
    await notifyOwner({
      title: `🚀 Manual Promotion: ${flag[0].name}`,
      content: `Admin manually promoted variant "${variant}" to 100% rollout for flag "${flag[0].name}".`,
    });

    return {
      success: true,
      message: `Successfully promoted ${variant} to 100% rollout`,
      flagId,
      flagName: flag[0].name,
      winningVariant: variant,
      rolloutPercentage: 100,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Error promoting variant: ${message}`,
    };
  }
}

/**
 * Rollback a variant (revert to previous rollout percentage)
 */
export async function rollbackVariant(
  flagId: number,
  previousRolloutPercentage: number = 50
): Promise<PromotionResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Database not available",
      };
    }

    // Get the flag
    const flag = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.id, flagId))
      .limit(1);

    if (!flag.length) {
      return {
        success: false,
        message: `Feature flag ${flagId} not found`,
      };
    }

    // Rollback to previous percentage
    const updated = await db
      .update(featureFlags)
      .set({
        rolloutPercentage: previousRolloutPercentage,
        updatedAt: new Date(),
      })
      .where(eq(featureFlags.id, flagId))
      .returning();

    if (!updated.length) {
      return {
        success: false,
        message: `Failed to rollback feature flag`,
      };
    }

    // Send notification
    await notifyOwner({
      title: `⚠️ Rollback: ${flag[0].name}`,
      content: `Flag "${flag[0].name}" has been rolled back to ${previousRolloutPercentage}% rollout.`,
    });

    return {
      success: true,
      message: `Successfully rolled back to ${previousRolloutPercentage}% rollout`,
      flagId,
      flagName: flag[0].name,
      rolloutPercentage: previousRolloutPercentage,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Error rolling back variant: ${message}`,
    };
  }
}

/**
 * Experiment Metrics Aggregation Service
 * Collects and aggregates metrics for A/B test variants
 */

import { getDb } from "../db";
import { eq, and, gte } from "drizzle-orm";
import { abTestingEvents, featureFlags } from "../../drizzle/schema";
import { ExperimentMetrics } from "./statistical-analysis";

export interface ExperimentSummary {
  experimentId: number;
  flagName: string;
  flagId: number;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "paused";
  variants: ExperimentMetrics[];
  totalSamples: number;
  totalConversions: number;
}

/**
 * Aggregate metrics for all variants in an experiment
 */
export async function aggregateExperimentMetrics(
  experimentId: number
): Promise<ExperimentSummary | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get experiment details
  const experiment = await db
    .select()
    .from(abTestingEvents)
    .where(eq(abTestingEvents.experimentId, experimentId))
    .limit(1);

  if (!experiment.length) {
    return null;
  }

  // Get all events for this experiment
  const events = await db
    .select()
    .from(abTestingEvents)
    .where(eq(abTestingEvents.experimentId, experimentId));

  // Group by variant
  const variantMetrics: Map<string, ExperimentMetrics> = new Map();

  for (const event of events) {
    const variantName = event.variant || "control";
    if (!variantMetrics.has(variantName)) {
      variantMetrics.set(variantName, {
        variantName,
        sampleSize: 0,
        conversions: 0,
        clicks: 0,
        impressions: 0,
      });
    }

    const metrics = variantMetrics.get(variantName)!;
    metrics.sampleSize++;

    if (event.eventType === "impression") {
      metrics.impressions++;
    } else if (event.eventType === "click") {
      metrics.clicks++;
    } else if (event.eventType === "conversion") {
      metrics.conversions++;
    }
  }

  // Calculate totals
  let totalSamples = 0;
  let totalConversions = 0;

  const variants = Array.from(variantMetrics.values());
  for (const variant of variants) {
    totalSamples += variant.sampleSize;
    totalConversions += variant.conversions;
  }

  // Get feature flag info
  const flagInfo = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.linkedExperimentId, experimentId))
    .limit(1);

  return {
    experimentId,
    flagName: flagInfo.length > 0 ? flagInfo[0].name : "unknown",
    flagId: flagInfo.length > 0 ? flagInfo[0].id : 0,
    startDate: experiment[0].createdAt,
    endDate: undefined,
    status: "active",
    variants,
    totalSamples,
    totalConversions,
  };
}

/**
 * Get metrics for a specific variant
 */
export async function getVariantMetrics(
  experimentId: number,
  variant: string
): Promise<ExperimentMetrics | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const events = await db
    .select()
    .from(abTestingEvents)
    .where(
      and(
        eq(abTestingEvents.experimentId, experimentId),
        eq(abTestingEvents.variant, variant)
      )
    );

  if (!events.length) {
    return null;
  }

  let conversions = 0;
  let clicks = 0;
  let impressions = 0;

  for (const event of events) {
    if (event.eventType === "impression") {
      impressions++;
    } else if (event.eventType === "click") {
      clicks++;
    } else if (event.eventType === "conversion") {
      conversions++;
    }
  }

  return {
    variantName: variant,
    sampleSize: events.length,
    conversions,
    clicks,
    impressions,
  };
}

/**
 * Calculate conversion rate for a variant
 */
export async function getConversionRate(
  experimentId: number,
  variant: string
): Promise<number> {
  const metrics = await getVariantMetrics(experimentId, variant);
  if (!metrics || metrics.sampleSize === 0) {
    return 0;
  }
  return metrics.conversions / metrics.sampleSize;
}

/**
 * Calculate click-through rate for a variant
 */
export async function getClickThroughRate(
  experimentId: number,
  variant: string
): Promise<number> {
  const metrics = await getVariantMetrics(experimentId, variant);
  if (!metrics || metrics.impressions === 0) {
    return 0;
  }
  return metrics.clicks / metrics.impressions;
}

/**
 * Get recent metrics for an experiment (last N days)
 */
export async function getRecentExperimentMetrics(
  experimentId: number,
  daysBack: number = 7
): Promise<ExperimentSummary | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Get recent events
  const events = await db
    .select()
    .from(abTestingEvents)
    .where(
      and(
        eq(abTestingEvents.experimentId, experimentId),
        gte(abTestingEvents.createdAt, cutoffDate)
      )
    );

  if (!events.length) {
    return null;
  }

  // Group by variant
  const variantMetrics: Map<string, ExperimentMetrics> = new Map();

  for (const event of events) {
    const variantName = event.variant || "control";
    if (!variantMetrics.has(variantName)) {
      variantMetrics.set(variantName, {
        variantName,
        sampleSize: 0,
        conversions: 0,
        clicks: 0,
        impressions: 0,
      });
    }

    const metrics = variantMetrics.get(variantName)!;
    metrics.sampleSize++;

    if (event.eventType === "impression") {
      metrics.impressions++;
    } else if (event.eventType === "click") {
      metrics.clicks++;
    } else if (event.eventType === "conversion") {
      metrics.conversions++;
    }
  }

  // Calculate totals
  let totalSamples = 0;
  let totalConversions = 0;

  const variants = Array.from(variantMetrics.values());
  for (const variant of variants) {
    totalSamples += variant.sampleSize;
    totalConversions += variant.conversions;
  }

  // Get feature flag info
  const flagInfo = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.linkedExperimentId, experimentId))
    .limit(1);

  return {
    experimentId,
    flagName: flagInfo.length > 0 ? flagInfo[0].name : "unknown",
    flagId: flagInfo.length > 0 ? flagInfo[0].id : 0,
    startDate: events[0].createdAt,
    endDate: new Date(),
    status: "active",
    variants,
    totalSamples,
    totalConversions,
  };
}

/**
 * Compare two variants
 */
export async function compareVariants(
  experimentId: number,
  variant1: string,
  variant2: string
): Promise<{
  variant1Metrics: ExperimentMetrics | null;
  variant2Metrics: ExperimentMetrics | null;
  conversionRateDifference: number;
  clickRateDifference: number;
}> {
  const metrics1 = await getVariantMetrics(experimentId, variant1);
  const metrics2 = await getVariantMetrics(experimentId, variant2);

  const rate1 = metrics1 ? metrics1.conversions / metrics1.sampleSize : 0;
  const rate2 = metrics2 ? metrics2.conversions / metrics2.sampleSize : 0;

  const clickRate1 = metrics1 ? metrics1.clicks / metrics1.impressions : 0;
  const clickRate2 = metrics2 ? metrics2.clicks / metrics2.impressions : 0;

  return {
    variant1Metrics: metrics1,
    variant2Metrics: metrics2,
    conversionRateDifference: rate2 - rate1,
    clickRateDifference: clickRate2 - clickRate1,
  };
}

/**
 * Lightweight Feature Flag System for Backend-Only A/B Testing
 * 
 * This system provides:
 * - Simple feature flag management (enable/disable)
 * - Variant assignment based on user/session ID
 * - Consistent hashing for stable variant assignment
 * - Event tracking for A/B test metrics
 */

import { getDb } from "../db";
import { featureFlags, abExperiments, abAssignments, abEvents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type Variant = "control" | "treatment";

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  description?: string;
}

interface VariantAssignment {
  variant: Variant;
  experimentId?: number;
  flagName: string;
}

/**
 * Hash function for consistent variant assignment
 * Uses simple hash to ensure same user always gets same variant
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get or create a feature flag
 */
export async function getOrCreateFlag(flagName: string, config: FeatureFlag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to get existing flag
  const existing = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, flagName))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new flag
  const [result] = await db
    .insert(featureFlags)
    .values({
      name: flagName,
      enabled: config.enabled,
      rolloutPercentage: config.rolloutPercentage,
      description: config.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  return {
    id: result.insertId as number,
    name: flagName,
    enabled: config.enabled,
    rolloutPercentage: config.rolloutPercentage,
    description: config.description,
  };
}

/**
 * Check if a feature flag is enabled for a user/session
 */
export async function isFlagEnabled(
  flagName: string,
  userId?: number,
  sessionId?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const flags = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, flagName))
    .limit(1);

  if (flags.length === 0) return false;

  const flag = flags[0];
  if (!flag.enabled) return false;

  // If rollout is 100%, always enabled
  if (flag.rolloutPercentage === 100) return true;

  // Hash-based rollout: use user ID or session ID
  const identifier = userId?.toString() || sessionId || "anonymous";
  const hash = hashString(identifier);
  const rolloutBucket = hash % 100;

  return rolloutBucket < flag.rolloutPercentage;
}

/**
 * Assign user to variant (control or treatment)
 * Uses consistent hashing to ensure same user always gets same variant
 */
export async function assignVariant(
  flagName: string,
  userId?: number,
  sessionId?: string,
  treatmentPercentage: number = 50
): Promise<VariantAssignment> {
  const identifier = userId?.toString() || sessionId || "anonymous";
  const hash = hashString(identifier);
  const bucket = hash % 100;

  const variant: Variant = bucket < treatmentPercentage ? "treatment" : "control";

  // Get experiment ID if linked
  const db = await getDb();
  if (!db) {
    return { variant, flagName };
  }

  const flags = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, flagName))
    .limit(1);

  if (flags.length === 0) {
    return { variant, flagName };
  }

  const flag = flags[0];

  return {
    variant,
    flagName,
    experimentId: flag.linkedExperimentId || undefined,
  };
}

/**
 * Track an event for A/B testing
 */
export async function trackEvent(
  flagName: string,
  eventType: "view" | "click" | "conversion",
  userId?: number,
  sessionId?: string,
  metadata?: Record<string, any>
) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get the variant for this user
    const assignment = await assignVariant(flagName, userId, sessionId);

    // Get experiment ID from flag
    const flags = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, flagName))
      .limit(1);

    if (flags.length === 0) return;

    const flag = flags[0];
    const experimentId = flag.linkedExperimentId;

    if (!experimentId) return;

    // Record the event
    await db.insert(abEvents).values({
      experimentId,
      assignmentId: 0, // Simplified: not tracking assignment ID
      eventType,
      eventName: `${flagName}_${eventType}`,
      metadata: JSON.stringify(metadata || {}),
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to track feature flag event:", error);
  }
}

/**
 * Get flag statistics
 */
export async function getFlagStats(flagName: string) {
  const db = await getDb();
  if (!db) return null;

  const flags = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, flagName))
    .limit(1);

  if (flags.length === 0) return null;

  const flag = flags[0];

  // Get experiment stats if linked
  if (!flag.linkedExperimentId) {
    return {
      flagName,
      enabled: flag.enabled,
      rolloutPercentage: flag.rolloutPercentage,
      description: flag.description,
    };
  }

  // Get experiment data
  const experiments = await db
    .select()
    .from(abExperiments)
    .where(eq(abExperiments.id, flag.linkedExperimentId))
    .limit(1);

  if (experiments.length === 0) {
    return {
      flagName,
      enabled: flag.enabled,
      rolloutPercentage: flag.rolloutPercentage,
      description: flag.description,
    };
  }

  const experiment = experiments[0];

  return {
    flagName,
    enabled: flag.enabled,
    rolloutPercentage: flag.rolloutPercentage,
    description: flag.description,
    experimentId: experiment.id,
    experimentName: experiment.name,
    experimentStatus: experiment.status,
  };
}

/**
 * Update feature flag
 */
export async function updateFlag(
  flagName: string,
  updates: Partial<FeatureFlag>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(featureFlags)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(featureFlags.name, flagName));
}

/**
 * Initialize default feature flags for ranking system
 */
export async function initializeDefaultFlags() {
  // Feature flag for new ranking algorithm
  await getOrCreateFlag("new_search_ranking", {
    name: "new_search_ranking",
    enabled: true,
    rolloutPercentage: 50, // 50% of users get new ranking
    description: "Enable new engagement-based search ranking algorithm",
  });

  // Feature flag for ranking explanations
  await getOrCreateFlag("ranking_explanations", {
    name: "ranking_explanations",
    enabled: false,
    rolloutPercentage: 0,
    description: "Show why results rank high with explanations",
  });

  // Feature flag for personalized ranking
  await getOrCreateFlag("personalized_ranking", {
    name: "personalized_ranking",
    enabled: false,
    rolloutPercentage: 0,
    description: "Enable personalized ranking based on user history",
  });
}

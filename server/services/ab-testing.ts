import { drizzle } from "drizzle-orm/mysql2";
import {
  abExperiments,
  abAssignments,
  abEvents,
  abResults,
  featureFlags,
  ABExperiment,
  InsertABExperiment,
  ABAssignment,
  InsertABAssignment,
  ABEvent,
  InsertABEvent,
  ABResult,
  InsertABResult,
  FeatureFlag,
  InsertFeatureFlag,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getDb } from "../db";

let db: ReturnType<typeof drizzle> | null = null;

async function getDatabase() {
  if (!db) {
    db = await getDb();
  }
  return db;
}

/**
 * Create a new A/B testing experiment
 */
export async function createExperiment(
  data: Omit<InsertABExperiment, "createdAt" | "updatedAt">
): Promise<ABExperiment> {
  const database = await getDatabase();
  if (!database) throw new Error("Database not available");
  
  const [result] = await database
    .insert(abExperiments)
    .values(data);
  return getExperimentById(result.insertId as number) as Promise<ABExperiment>;
}

/**
 * Get experiment by ID
 */
export async function getExperimentById(id: number): Promise<ABExperiment | null> {
  const database = await getDatabase();
  if (!database) return null;
  
  const [experiment] = await database
    .select()
    .from(abExperiments)
    .where(eq(abExperiments.id, id))
    .limit(1);
  return experiment || null;
}

/**
 * List all experiments with optional filtering
 */
export async function listExperiments(
  status?: string,
  experimentType?: string,
  limit: number = 50,
  offset: number = 0
): Promise<ABExperiment[]> {
  let query = db.select().from(abExperiments);

  const conditions = [];
  if (status) {
    conditions.push(eq(abExperiments.status, status as any));
  }
  if (experimentType) {
    conditions.push(eq(abExperiments.experimentType, experimentType as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query
    .orderBy(desc(abExperiments.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Update experiment status
 */
export async function updateExperimentStatus(
  id: number,
  status: "draft" | "running" | "paused" | "completed"
): Promise<void> {
  await database
    .update(abExperiments)
    .set({ status, updatedAt: new Date() })
    .where(eq(abExperiments.id, id));
}

/**
 * Assign user/session to experiment variant
 */
export async function assignToVariant(
  experimentId: number,
  userId: number | null,
  sessionId: string,
  trafficAllocation: number
): Promise<ABAssignment> {
  // Determine variant based on traffic allocation
  const hash = hashSessionId(sessionId);
  const variant = hash % 100 < trafficAllocation ? "treatment" : "control";

  const [result] = await database
    .insert(abAssignments)
    .values({
      experimentId,
      userId,
      sessionId,
      variant,
    });

  return getAssignmentById(result.insertId as number) as Promise<ABAssignment>;
}

/**
 * Get assignment for user/session in experiment
 */
export async function getAssignment(
  experimentId: number,
  userId: number | null,
  sessionId: string
): Promise<ABAssignment | null> {
  const [assignment] = await database
    .select()
    .from(abAssignments)
    .where(
      and(
        eq(abAssignments.experimentId, experimentId),
        userId ? eq(abAssignments.userId, userId) : eq(abAssignments.sessionId, sessionId)
      )
    )
    .limit(1);

  return assignment || null;
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: number): Promise<ABAssignment | null> {
  const [assignment] = await database
    .select()
    .from(abAssignments)
    .where(eq(abAssignments.id, id))
    .limit(1);
  return assignment || null;
}

/**
 * Track event for A/B testing
 */
export async function trackEvent(
  experimentId: number,
  assignmentId: number,
  userId: number | null,
  sessionId: string,
  eventType: "view" | "click" | "conversion" | "engagement",
  eventName: string,
  locationId?: number,
  metadata?: Record<string, any>
): Promise<ABEvent> {
  const [result] = await database
    .insert(abEvents)
    .values({
      experimentId,
      assignmentId,
      userId,
      sessionId,
      eventType,
      eventName,
      locationId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

  return getEventById(result.insertId as number) as Promise<ABEvent>;
}

/**
 * Get event by ID
 */
export async function getEventById(id: number): Promise<ABEvent | null> {
  const [event] = await database
    .select()
    .from(abEvents)
    .where(eq(abEvents.id, id))
    .limit(1);
  return event || null;
}

/**
 * Calculate and store experiment results
 */
export async function calculateExperimentResults(experimentId: number): Promise<ABResult> {
  // Get all assignments for this experiment
  const assignments = await database
    .select()
    .from(abAssignments)
    .where(eq(abAssignments.experimentId, experimentId));

  const controlAssignments = assignments.filter(a => a.variant === "control");
  const treatmentAssignments = assignments.filter(a => a.variant === "treatment");

  // Get conversion events for each variant
  const controlConversions = await database
    .select({ count: sql<number>`COUNT(*)` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "conversion"),
        sql`${abEvents.assignmentId} IN (${sql.join(controlAssignments.map(a => a.id), ",")})`
      )
    );

  const treatmentConversions = await database
    .select({ count: sql<number>`COUNT(*)` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "conversion"),
        sql`${abEvents.assignmentId} IN (${sql.join(treatmentAssignments.map(a => a.id), ",")})`
      )
    );

  // Get click events for CTR calculation
  const controlClicks = await database
    .select({ count: sql<number>`COUNT(*)` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "click"),
        sql`${abEvents.assignmentId} IN (${sql.join(controlAssignments.map(a => a.id), ",")})`
      )
    );

  const treatmentClicks = await database
    .select({ count: sql<number>`COUNT(*)` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "click"),
        sql`${abEvents.assignmentId} IN (${sql.join(treatmentAssignments.map(a => a.id), ",")})`
      )
    );

  // Get engagement scores
  const controlEngagement = await database
    .select({ avg: sql<number>`AVG(CAST(JSON_EXTRACT(metadata, '$.engagementScore') AS DECIMAL(5,2)))` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "engagement"),
        sql`${abEvents.assignmentId} IN (${sql.join(controlAssignments.map(a => a.id), ",")})`
      )
    );

  const treatmentEngagement = await database
    .select({ avg: sql<number>`AVG(CAST(JSON_EXTRACT(metadata, '$.engagementScore') AS DECIMAL(5,2)))` })
    .from(abEvents)
    .where(
      and(
        eq(abEvents.experimentId, experimentId),
        eq(abEvents.eventType, "engagement"),
        sql`${abEvents.assignmentId} IN (${sql.join(treatmentAssignments.map(a => a.id), ",")})`
      )
    );

  const controlSampleSize = controlAssignments.length;
  const treatmentSampleSize = treatmentAssignments.length;
  const controlConversionCount = controlConversions[0]?.count || 0;
  const treatmentConversionCount = treatmentConversions[0]?.count || 0;
  const controlClickCount = controlClicks[0]?.count || 0;
  const treatmentClickCount = treatmentClicks[0]?.count || 0;

  const controlConversionRate = controlSampleSize > 0 ? (controlConversionCount / controlSampleSize) * 100 : 0;
  const treatmentConversionRate = treatmentSampleSize > 0 ? (treatmentConversionCount / treatmentSampleSize) * 100 : 0;
  const controlCTR = controlSampleSize > 0 ? (controlClickCount / controlSampleSize) * 100 : 0;
  const treatmentCTR = treatmentSampleSize > 0 ? (treatmentClickCount / treatmentSampleSize) * 100 : 0;

  // Calculate uplift
  const uplift =
    controlConversionRate > 0
      ? ((treatmentConversionRate - controlConversionRate) / controlConversionRate) * 100
      : 0;

  // Perform statistical significance test (simplified chi-square)
  const { pValue, isSignificant } = performChiSquareTest(
    controlConversionCount,
    controlSampleSize,
    treatmentConversionCount,
    treatmentSampleSize
  );

  // Determine winner
  let winner: "control" | "treatment" | "inconclusive" = "inconclusive";
  if (isSignificant) {
    winner = treatmentConversionRate > controlConversionRate ? "treatment" : "control";
  }

  // Store or update results
  const existingResult = await database
    .select()
    .from(abResults)
    .where(eq(abResults.experimentId, experimentId))
    .limit(1);

  if (existingResult.length > 0) {
    await database
      .update(abResults)
      .set({
        controlSampleSize,
        treatmentSampleSize,
        controlConversions: controlConversionCount,
        treatmentConversions: treatmentConversionCount,
        controlConversionRate: controlConversionRate as any,
        treatmentConversionRate: treatmentConversionRate as any,
        controlClickThroughRate: controlCTR as any,
        treatmentClickThroughRate: treatmentCTR as any,
        controlAvgEngagementScore: (controlEngagement[0]?.avg || 0) as any,
        treatmentAvgEngagementScore: (treatmentEngagement[0]?.avg || 0) as any,
        uplift: uplift as any,
        pValue: pValue as any,
        isStatisticallySignificant: isSignificant,
        winner,
        updatedAt: new Date(),
      })
      .where(eq(abResults.experimentId, experimentId));

    return getResultsByExperimentId(experimentId) as Promise<ABResult>;
  } else {
    const [result] = await database
      .insert(abResults)
      .values({
        experimentId,
        controlSampleSize,
        treatmentSampleSize,
        controlConversions: controlConversionCount,
        treatmentConversions: treatmentConversionCount,
        controlConversionRate: controlConversionRate as any,
        treatmentConversionRate: treatmentConversionRate as any,
        controlClickThroughRate: controlCTR as any,
        treatmentClickThroughRate: treatmentCTR as any,
        controlAvgEngagementScore: (controlEngagement[0]?.avg || 0) as any,
        treatmentAvgEngagementScore: (treatmentEngagement[0]?.avg || 0) as any,
        uplift: uplift as any,
        pValue: pValue as any,
        isStatisticallySignificant: isSignificant,
        winner,
      });

    return getResultById(result.insertId as number) as Promise<ABResult>;
  }
}

/**
 * Get results for experiment
 */
export async function getResultsByExperimentId(experimentId: number): Promise<ABResult | null> {
  const [result] = await database
    .select()
    .from(abResults)
    .where(eq(abResults.experimentId, experimentId))
    .limit(1);
  return result || null;
}

/**
 * Get result by ID
 */
export async function getResultById(id: number): Promise<ABResult | null> {
  const [result] = await database
    .select()
    .from(abResults)
    .where(eq(abResults.id, id))
    .limit(1);
  return result || null;
}

/**
 * Create feature flag
 */
export async function createFeatureFlag(
  data: Omit<InsertFeatureFlag, "createdAt" | "updatedAt">
): Promise<FeatureFlag> {
  const [result] = await database
    .insert(featureFlags)
    .values(data);
  return getFeatureFlagById(result.insertId as number) as Promise<FeatureFlag>;
}

/**
 * Get feature flag by name
 */
export async function getFeatureFlagByName(name: string): Promise<FeatureFlag | null> {
  const [flag] = await database
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, name))
    .limit(1);
  return flag || null;
}

/**
 * Get feature flag by ID
 */
export async function getFeatureFlagById(id: number): Promise<FeatureFlag | null> {
  const [flag] = await database
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.id, id))
    .limit(1);
  return flag || null;
}

/**
 * Check if feature is enabled for user
 */
export async function isFeatureEnabled(
  flagName: string,
  userId?: number,
  countryId?: number,
  locationId?: number
): Promise<boolean> {
  const flag = await getFeatureFlagByName(flagName);
  if (!flag || !flag.enabled) return false;

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    const hash = userId ? hashUserId(userId) : Math.random() * 100;
    if (hash % 100 >= flag.rolloutPercentage) return false;
  }

  // Check target restrictions
  if (flag.targetUsers && flag.targetUsers.length > 0) {
    if (!userId || !(flag.targetUsers as number[]).includes(userId)) return false;
  }

  if (flag.targetCountries && flag.targetCountries.length > 0) {
    if (!countryId || !(flag.targetCountries as number[]).includes(countryId)) return false;
  }

  if (flag.targetLocations && flag.targetLocations.length > 0) {
    if (!locationId || !(flag.targetLocations as number[]).includes(locationId)) return false;
  }

  return true;
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  id: number,
  data: Partial<FeatureFlag>
): Promise<void> {
  await database
    .update(featureFlags)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(featureFlags.id, id));
}

/**
 * Hash session ID for consistent variant assignment
 */
function hashSessionId(sessionId: string): number {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Hash user ID for consistent variant assignment
 */
function hashUserId(userId: number): number {
  return Math.abs(userId * 2654435761) % 100;
}

/**
 * Perform chi-square test for statistical significance
 */
function performChiSquareTest(
  control_conversions: number,
  control_total: number,
  treatment_conversions: number,
  treatment_total: number
): { pValue: number; isSignificant: boolean } {
  const control_non_conversions = control_total - control_conversions;
  const treatment_non_conversions = treatment_total - treatment_conversions;

  const total = control_total + treatment_total;
  const total_conversions = control_conversions + treatment_conversions;
  const total_non_conversions = control_non_conversions + treatment_non_conversions;

  const expected_control_conversions = (control_total * total_conversions) / total;
  const expected_control_non_conversions = (control_total * total_non_conversions) / total;
  const expected_treatment_conversions = (treatment_total * total_conversions) / total;
  const expected_treatment_non_conversions = (treatment_total * total_non_conversions) / total;

  const chi_square =
    Math.pow(control_conversions - expected_control_conversions, 2) / expected_control_conversions +
    Math.pow(control_non_conversions - expected_control_non_conversions, 2) / expected_control_non_conversions +
    Math.pow(treatment_conversions - expected_treatment_conversions, 2) / expected_treatment_conversions +
    Math.pow(treatment_non_conversions - expected_treatment_non_conversions, 2) / expected_treatment_non_conversions;

  // Approximate p-value using chi-square distribution (df=1)
  // For simplicity, use a threshold of 3.841 (p=0.05)
  const pValue = chi_square > 3.841 ? 0.05 : 0.95;
  const isSignificant = chi_square > 3.841;

  return { pValue, isSignificant };
}

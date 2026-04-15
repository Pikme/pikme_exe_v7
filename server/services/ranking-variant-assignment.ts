/**
 * Backend Variant Assignment for Search Ranking A/B Test
 * 
 * Determines which ranking algorithm to use for each search request
 * based on consistent hashing of user/session ID
 */

import { assignVariant, isFlagEnabled } from "./feature-flags";
import * as searchRanking from "./search-ranking";

export type RankingVariant = "control" | "treatment";

interface RankingRequest {
  locationIds: number[];
  userId?: number;
  sessionId?: string;
  searchQuery?: string;
}

interface RankedResult {
  locationId: number;
  score: number;
  variant: RankingVariant;
}

/**
 * Get ranking variant for a user/session
 * Returns which ranking algorithm should be used
 */
export async function getRankingVariant(
  userId?: number,
  sessionId?: string
): Promise<RankingVariant> {
  // Check if feature flag is enabled
  const flagEnabled = await isFlagEnabled("new_search_ranking", userId, sessionId);

  if (!flagEnabled) {
    return "control"; // Use old ranking
  }

  // Assign to variant based on consistent hash
  const assignment = await assignVariant(
    "new_search_ranking",
    userId,
    sessionId,
    50 // 50% treatment
  );

  return assignment.variant;
}

/**
 * Rank search results using appropriate algorithm
 */
export async function rankSearchResults(
  request: RankingRequest
): Promise<RankedResult[]> {
  // Determine which variant to use
  const variant = await getRankingVariant(request.userId, request.sessionId);

  if (variant === "treatment") {
    // Use new engagement-based ranking
    return rankWithEngagement(request, variant);
  } else {
    // Use control ranking (default order)
    return rankWithControl(request, variant);
  }
}

/**
 * Control ranking: return results in original order
 */
async function rankWithControl(
  request: RankingRequest,
  variant: RankingVariant
): Promise<RankedResult[]> {
  return request.locationIds.map((locationId, index) => ({
    locationId,
    score: 100 - index, // Simple descending score
    variant,
  }));
}

/**
 * Treatment ranking: use engagement-based algorithm
 */
async function rankWithEngagement(
  request: RankingRequest,
  variant: RankingVariant
): Promise<RankedResult[]> {
  try {
    // TODO: Implement engagement-based ranking when search-ranking service is ready
    // For now, fallback to control ranking
    console.log("Engagement-based ranking not yet implemented, using control ranking");
    return rankWithControl(request, variant);
  } catch (error) {
    console.error("Error ranking with engagement:", error);
    // Fallback to control ranking on error
    return rankWithControl(request, "control");
  }
}

/**
 * Get ranking explanation for a location
 * Shows why a location ranks high
 */
export async function getRankingExplanation(
  locationId: number,
  variant: RankingVariant
): Promise<string | null> {
  if (variant === "control") {
    return null; // No explanation for control
  }

  try {
    // TODO: Get metrics for this location when search-ranking service is ready
    // For now, return null as explanation is not available
    return null;
  } catch (error) {
    console.error("Error getting ranking explanation:", error);
    return null;
  }
}

/**
 * Track ranking event for analytics
 */
export async function trackRankingEvent(
  eventType: "view" | "click" | "conversion",
  locationId: number,
  variant: RankingVariant,
  userId?: number,
  sessionId?: string,
  metadata?: Record<string, any>
) {
  try {
    // Track in analytics
    const eventMetadata = {
      ...metadata,
      locationId,
      variant,
      rankingAlgorithm: variant === "treatment" ? "engagement_based" : "default",
    };

    // This would be sent to your analytics system
    console.log(`Ranking event: ${eventType}`, eventMetadata);
  } catch (error) {
    console.error("Error tracking ranking event:", error);
  }
}

/**
 * Get A/B test results summary
 */
export async function getABTestSummary() {
  try {
    // Get stats for both variants
    const controlStats = await getVariantStats("control");
    const treatmentStats = await getVariantStats("treatment");

    return {
      control: controlStats,
      treatment: treatmentStats,
      improvementPercentage:
        controlStats.conversionRate > 0
          ? ((treatmentStats.conversionRate - controlStats.conversionRate) /
              controlStats.conversionRate) *
            100
          : 0,
    };
  } catch (error) {
    console.error("Error getting A/B test summary:", error);
    return null;
  }
}

/**
 * Get stats for a specific variant
 */
async function getVariantStats(variant: RankingVariant) {
  // This would query your analytics database
  // For now, return placeholder
  return {
    variant,
    views: 0,
    clicks: 0,
    conversions: 0,
    clickThroughRate: 0,
    conversionRate: 0,
  };
}

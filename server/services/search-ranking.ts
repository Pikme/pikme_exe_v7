import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface RankingMetrics {
  locationId: number;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  clickThroughRate: number;
  conversionRate: number;
  recentActivityScore: number;
  engagementScore: number;
  finalRankingScore: number;
}

export interface RankingConfig {
  viewWeight: number;
  ctrWeight: number;
  conversionWeight: number;
  recencyWeight: number;
  decayDays: number;
}

const DEFAULT_CONFIG: RankingConfig = {
  viewWeight: 0.2,
  ctrWeight: 0.3,
  conversionWeight: 0.3,
  recencyWeight: 0.2,
  decayDays: 30,
};

/**
 * Calculate engagement score for a location based on multiple metrics
 */
function calculateEngagementScore(metrics: {
  viewCount: number;
  clickThroughRate: number;
  conversionRate: number;
}): number {
  // Normalize metrics to 0-100 scale
  const viewScore = Math.min(metrics.viewCount / 100, 100);
  const ctrScore = metrics.clickThroughRate || 0;
  const conversionScore = metrics.conversionRate || 0;

  // Weighted average
  return (viewScore * 0.2 + ctrScore * 0.4 + conversionScore * 0.4);
}

/**
 * Calculate recency score based on last activity
 */
function calculateRecencyScore(lastActivityDate: Date, decayDays: number = 30): number {
  const now = new Date();
  const daysSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceActivity > decayDays) {
    return 0;
  }

  // Exponential decay: score decreases as time passes
  return 100 * Math.exp(-daysSinceActivity / decayDays);
}

/**
 * Get engagement metrics for locations
 */
export async function getLocationEngagementMetrics(locationIds: number[]) {
  const db = getDb();

  if (locationIds.length === 0) {
    return [];
  }

  const placeholders = locationIds.map(() => '?').join(',');

  const result = await db.execute(
    sql.raw(`
      SELECT 
        l.id as locationId,
        l.name,
        l.description,
        l.image,
        l.slug,
        COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END), 0) as clickCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END), 0) as conversionCount,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as clickThroughRate,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as conversionRate,
        MAX(e.createdAt) as lastActivityDate
      FROM locations l
      LEFT JOIN tagEngagementEvents e ON l.id = e.locationId
      WHERE l.id IN (${placeholders})
      GROUP BY l.id, l.name, l.description, l.image, l.slug
    `)
  );

  return result.rows || [];
}

/**
 * Get top locations by engagement score
 */
export async function getTopLocationsByEngagement(
  limit: number = 10,
  config: RankingConfig = DEFAULT_CONFIG
) {
  const db = getDb();

  const result = await db.execute(
    sql.raw(`
      SELECT 
        l.id as locationId,
        l.name,
        l.description,
        l.image,
        l.slug,
        COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END), 0) as clickCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END), 0) as conversionCount,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as clickThroughRate,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as conversionRate,
        MAX(e.createdAt) as lastActivityDate
      FROM locations l
      LEFT JOIN tagEngagementEvents e ON l.id = e.locationId
      GROUP BY l.id, l.name, l.description, l.image, l.slug
      HAVING viewCount > 0 OR clickCount > 0 OR conversionCount > 0
      ORDER BY (
        (COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) / 100) * ${config.viewWeight} +
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) * ${config.ctrWeight} +
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) * ${config.conversionWeight}
      ) DESC
      LIMIT ${limit}
    `)
  );

  return result.rows || [];
}

/**
 * Rank search results based on engagement metrics
 * Optionally uses feature flags to determine ranking algorithm
 */
export async function rankSearchResults(
  locationIds: number[],
  config: RankingConfig = DEFAULT_CONFIG,
  userId?: number,
  sessionId?: string
): Promise<RankingMetrics[]> {
  // Check if user should use new ranking via feature flag
  if (userId || sessionId) {
    try {
      const { getRankingVariant } = await import('./ranking-variant-assignment');
      const variant = await getRankingVariant(userId, sessionId);
      if (variant === 'control') {
        // Return results in original order (control group)
        return locationIds.map((id, index) => ({
          locationId: id,
          name: '',
          slug: '',
          viewCount: 0,
          clickCount: 0,
          conversionCount: 0,
          clickThroughRate: 0,
          conversionRate: 0,
          recentActivityScore: 0,
          engagementScore: 0,
          finalRankingScore: 100 - index,
        }));
      }
    } catch (error) {
      console.error('Error checking feature flag:', error);
      // Continue with normal ranking on error
    }
  }
  if (locationIds.length === 0) {
    return [];
  }

  const metrics = await getLocationEngagementMetrics(locationIds);

  // Sort by final score descending
  const sorted = metrics.sort((a: any, b: any) => {
    const scoreA = a.finalRankingScore || 0;
    const scoreB = b.finalRankingScore || 0;
    return scoreB - scoreA;
  });

  const rankedResults: RankingMetrics[] = sorted.map((m: any) => {
    const engagementScore = calculateEngagementScore({
      viewCount: m.viewCount || 0,
      clickThroughRate: m.clickThroughRate || 0,
      conversionRate: m.conversionRate || 0,
    });

    const recencyScore = m.lastActivityDate
      ? calculateRecencyScore(new Date(m.lastActivityDate), config.decayDays)
      : 0;

    const finalScore =
      engagementScore * (config.viewWeight + config.ctrWeight + config.conversionWeight) +
      recencyScore * config.recencyWeight;

    return {
      locationId: m.locationId,
      name: m.name,
      description: m.description,
      image: m.image,
      slug: m.slug,
      viewCount: m.viewCount || 0,
      clickCount: m.clickCount || 0,
      conversionCount: m.conversionCount || 0,
      clickThroughRate: m.clickThroughRate || 0,
      conversionRate: m.conversionRate || 0,
      recentActivityScore: recencyScore,
      engagementScore,
      finalRankingScore: finalScore,
    };
  });

  // Sort by final ranking score
  return rankedResults.sort((a, b) => b.finalRankingScore - a.finalRankingScore);
}

/**
 * Get trending locations (high recent activity)
 */
export async function getTrendingLocations(
  limit: number = 10,
  daysBack: number = 7
) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const result = await db.execute(
    sql.raw(`
      SELECT 
        l.id as locationId,
        l.name,
        l.description,
        l.image,
        l.slug,
        COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END), 0) as clickCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END), 0) as conversionCount,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as clickThroughRate,
        COUNT(DISTINCT DATE(e.createdAt)) as activeDays
      FROM locations l
      LEFT JOIN tagEngagementEvents e ON l.id = e.locationId 
        AND e.createdAt >= '${startDate.toISOString().split('T')[0]}'
      GROUP BY l.id, l.name, l.description, l.image, l.slug
      HAVING viewCount > 0
      ORDER BY viewCount DESC, clickThroughRate DESC
      LIMIT ${limit}
    `)
  );

  return result.rows || [];
}

/**
 * Get locations with high conversion potential
 */
export async function getHighConversionLocations(
  limit: number = 10,
  minConversionRate: number = 5
) {
  const db = getDb();

  const result = await db.execute(
    sql.raw(`
      SELECT 
        l.id as locationId,
        l.name,
        l.description,
        l.image,
        l.slug,
        COALESCE(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) as viewCount,
        COALESCE(SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END), 0) as conversionCount,
        COALESCE(
          ROUND(
            (SUM(CASE WHEN e.eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN e.eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ), 0
        ) as conversionRate
      FROM locations l
      LEFT JOIN tagEngagementEvents e ON l.id = e.locationId
      GROUP BY l.id, l.name, l.description, l.image, l.slug
      HAVING conversionRate >= ${minConversionRate} AND viewCount >= 10
      ORDER BY conversionRate DESC, viewCount DESC
      LIMIT ${limit}
    `)
  );

  return result.rows || [];
}

/**
 * Compare ranking before and after optimization
 */
export async function compareRankings(
  locationIds: number[],
  config: RankingConfig = DEFAULT_CONFIG
) {
  const rankedResults = await rankSearchResults(locationIds, config);

  return {
    totalLocations: locationIds.length,
    rankedLocations: rankedResults,
    topPerformers: rankedResults.slice(0, 5),
    averageEngagementScore: rankedResults.reduce((sum, r) => sum + r.engagementScore, 0) / rankedResults.length,
    averageRankingScore: rankedResults.reduce((sum, r) => sum + r.finalRankingScore, 0) / rankedResults.length,
  };
}

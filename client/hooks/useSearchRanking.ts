import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export interface RankedLocation {
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
  viewWeight?: number;
  ctrWeight?: number;
  conversionWeight?: number;
  recencyWeight?: number;
  decayDays?: number;
}

/**
 * Hook to rank search results based on engagement metrics
 */
export function useSearchRanking(locationIds: number[], config?: RankingConfig) {
  const { data: rankedResults, isLoading, error } = trpc.locations.rankSearchResults.useQuery(
    {
      locationIds,
      viewWeight: config?.viewWeight ?? 0.2,
      ctrWeight: config?.ctrWeight ?? 0.3,
      conversionWeight: config?.conversionWeight ?? 0.3,
      recencyWeight: config?.recencyWeight ?? 0.2,
      decayDays: config?.decayDays ?? 30,
    },
    { enabled: locationIds.length > 0 }
  );

  return {
    rankedResults: rankedResults || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get top locations by engagement
 */
export function useTopLocationsByEngagement(limit: number = 10) {
  const { data: topLocations, isLoading, error } = trpc.locations.getTopLocationsByEngagement.useQuery(
    { limit },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  return {
    topLocations: topLocations || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get trending locations
 */
export function useTrendingLocations(limit: number = 10, daysBack: number = 7) {
  const { data: trendingLocations, isLoading, error } = trpc.locations.getTrendingLocations.useQuery(
    { limit, daysBack },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  return {
    trendingLocations: trendingLocations || [],
    isLoading,
    error,
  };
}

/**
 * Hook to get high conversion locations
 */
export function useHighConversionLocations(limit: number = 10, minConversionRate: number = 5) {
  const { data: highConversionLocations, isLoading, error } = trpc.locations.getHighConversionLocations.useQuery(
    { limit, minConversionRate },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  return {
    highConversionLocations: highConversionLocations || [],
    isLoading,
    error,
  };
}

/**
 * Hook to compare rankings
 */
export function useCompareRankings(locationIds: number[]) {
  const { data: comparison, isLoading, error } = trpc.locations.compareRankings.useQuery(
    { locationIds },
    { enabled: locationIds.length > 0 }
  );

  return {
    comparison,
    isLoading,
    error,
  };
}

/**
 * Hook to get engagement metrics for locations
 */
export function useLocationEngagementMetrics(locationIds: number[]) {
  const { rankedResults, isLoading, error } = useSearchRanking(locationIds);

  const metrics = useMemo(() => {
    if (!rankedResults) return {};

    return Object.fromEntries(
      rankedResults.map((result) => [
        result.locationId,
        {
          viewCount: result.viewCount,
          clickCount: result.clickCount,
          conversionCount: result.conversionCount,
          clickThroughRate: result.clickThroughRate,
          conversionRate: result.conversionRate,
          engagementScore: result.engagementScore,
          rankingScore: result.finalRankingScore,
        },
      ])
    );
  }, [rankedResults]);

  return {
    metrics,
    isLoading,
    error,
  };
}

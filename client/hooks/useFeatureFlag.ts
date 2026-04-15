import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export type FeatureFlagName = 
  | "new_search_ranking" 
  | "ranking_explanations" 
  | "personalized_ranking";

interface UseFeatureFlagResult {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
  variant?: "control" | "treatment";
}

/**
 * Hook to check if a feature flag is enabled for the current user
 * Automatically caches results to avoid repeated queries
 */
export function useFeatureFlag(flagName: FeatureFlagName): UseFeatureFlagResult {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [variant, setVariant] = useState<"control" | "treatment">();

  // Query if flag is enabled
  const { data: flagData, isLoading: flagLoading, error: flagError } = trpc.featureFlags.isEnabled.useQuery(
    { flagName },
    { staleTime: 1000 * 60 * 5 } // Cache for 5 minutes
  );

  // Query variant assignment
  const { data: variantData, isLoading: variantLoading } = trpc.featureFlags.getVariant.useQuery(
    { flagName },
    { staleTime: 1000 * 60 * 5 } // Cache for 5 minutes
  );

  useEffect(() => {
    if (flagData) {
      setEnabled(flagData.enabled);
    }
    if (variantData) {
      setVariant(variantData.variant);
    }
    setLoading(flagLoading || variantLoading);
    if (flagError) {
      setError(flagError as Error);
    }
  }, [flagData, variantData, flagLoading, variantLoading, flagError]);

  return { enabled, loading, error, variant };
}

/**
 * Hook to get variant assignment for A/B testing
 */
export function useVariant(flagName: FeatureFlagName) {
  const { data, isLoading, error } = trpc.featureFlags.getVariant.useQuery(
    { flagName },
    { staleTime: 1000 * 60 * 5 }
  );

  return {
    variant: data?.variant || "control",
    loading: isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to get ranking variant specifically
 */
export function useRankingVariant() {
  const { data, isLoading, error } = trpc.featureFlags.getRankingVariant.useQuery(
    {},
    { staleTime: 1000 * 60 * 5 }
  );

  return {
    variant: data?.variant || "control",
    loading: isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to track feature flag events
 */
export function useTrackFeatureFlagEvent(flagName: FeatureFlagName) {
  const trackEventMutation = trpc.featureFlags.trackEvent.useMutation();

  const trackEvent = (
    eventType: "view" | "click" | "conversion",
    locationId: number,
    metadata?: Record<string, any>
  ) => {
    const { variant } = useVariant(flagName);
    
    trackEventMutation.mutate({
      eventType,
      locationId,
      variant,
      metadata,
    });
  };

  return { trackEvent, isTracking: trackEventMutation.isPending };
}

/**
 * Hook to get ranking explanation for a location
 */
export function useRankingExplanation(locationId: number, variant: "control" | "treatment") {
  const { data, isLoading, error } = trpc.featureFlags.getRankingExplanation.useQuery(
    { locationId, variant },
    { staleTime: 1000 * 60 * 60 } // Cache for 1 hour
  );

  return {
    explanation: data?.explanation || null,
    loading: isLoading,
    error: error as Error | null,
  };
}

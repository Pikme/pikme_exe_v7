import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export type FeatureFlagName = 
  | "new_search_ranking" 
  | "ranking_explanations" 
  | "personalized_ranking";

interface FeatureFlagState {
  enabled: boolean;
  variant?: "control" | "treatment";
}

interface FeatureFlagContextType {
  flags: Map<FeatureFlagName, FeatureFlagState>;
  isLoading: boolean;
  error: Error | null;
  checkFlag: (flagName: FeatureFlagName) => boolean;
  getVariant: (flagName: FeatureFlagName) => "control" | "treatment";
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages feature flags for the entire app
 * Caches flag states and provides convenient access methods
 */
export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Map<FeatureFlagName, FeatureFlagState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Query all default flags
  const defaultFlags: FeatureFlagName[] = [
    "new_search_ranking",
    "ranking_explanations",
    "personalized_ranking",
  ];

  // Fetch all flags in parallel
  const flagQueries = defaultFlags.map((flagName) =>
    trpc.featureFlags.isEnabled.useQuery(
      { flagName },
      { staleTime: 1000 * 60 * 5 }
    )
  );

  const variantQueries = defaultFlags.map((flagName) =>
    trpc.featureFlags.getVariant.useQuery(
      { flagName },
      { staleTime: 1000 * 60 * 5 }
    )
  );

  // Update flags when queries complete
  useEffect(() => {
    const allLoading = flagQueries.some((q) => q.isLoading) || variantQueries.some((q) => q.isLoading);
    const anyError = flagQueries.find((q) => q.error) || variantQueries.find((q) => q.error);

    if (anyError) {
      setError(anyError.error as Error);
    }

    if (!allLoading) {
      const newFlags = new Map<FeatureFlagName, FeatureFlagState>();

      defaultFlags.forEach((flagName, index) => {
        const flagData = flagQueries[index].data;
        const variantData = variantQueries[index].data;

        newFlags.set(flagName, {
          enabled: flagData?.enabled || false,
          variant: variantData?.variant || "control",
        });
      });

      setFlags(newFlags);
      setIsLoading(false);
    }
  }, [flagQueries, variantQueries]);

  const checkFlag = (flagName: FeatureFlagName): boolean => {
    return flags.get(flagName)?.enabled || false;
  };

  const getVariant = (flagName: FeatureFlagName): "control" | "treatment" => {
    return flags.get(flagName)?.variant || "control";
  };

  const value: FeatureFlagContextType = {
    flags,
    isLoading,
    error,
    checkFlag,
    getVariant,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to use feature flag context
 */
export function useFeatureFlagContext(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlagContext must be used within FeatureFlagProvider");
  }
  return context;
}

/**
 * Hook to check a specific flag
 */
export function useFlag(flagName: FeatureFlagName): boolean {
  const { checkFlag } = useFeatureFlagContext();
  return checkFlag(flagName);
}

/**
 * Hook to get variant for a specific flag
 */
export function useFlagVariant(flagName: FeatureFlagName): "control" | "treatment" {
  const { getVariant } = useFeatureFlagContext();
  return getVariant(flagName);
}

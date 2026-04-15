import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface ABTestingContextType {
  experimentId: number | null;
  variant: "control" | "treatment" | null;
  isLoading: boolean;
  trackEvent: (eventType: string, eventName: string, metadata?: Record<string, any>) => void;
  trackConversion: (metadata?: Record<string, any>) => void;
  trackEngagement: (score: number, metadata?: Record<string, any>) => void;
}

const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined);

export function ABTestingProvider({ children }: { children: React.ReactNode }) {
  const [experimentId, setExperimentId] = useState<number | null>(null);
  const [variant, setVariant] = useState<"control" | "treatment" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(() => generateSessionId());

  // Get active experiment
  const { data: activeExperiment } = trpc.abTesting.getActiveExperiment.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  // Assign to variant
  useEffect(() => {
    if (activeExperiment?.id) {
      setExperimentId(activeExperiment.id);
      // The variant assignment happens on the server
      setVariant(activeExperiment.assignedVariant || null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [activeExperiment]);

  const trackEventMutation = trpc.abTesting.trackEvent.useMutation();

  const trackEvent = useCallback(
    (eventType: string, eventName: string, metadata?: Record<string, any>) => {
      if (!experimentId) return;

      trackEventMutation.mutate({
        experimentId,
        eventType,
        eventName,
        metadata,
        sessionId,
      });
    },
    [experimentId, sessionId, trackEventMutation]
  );

  const trackConversion = useCallback(
    (metadata?: Record<string, any>) => {
      trackEvent("conversion", "search_result_conversion", metadata);
    },
    [trackEvent]
  );

  const trackEngagement = useCallback(
    (score: number, metadata?: Record<string, any>) => {
      trackEvent("engagement", "search_result_engagement", {
        ...metadata,
        engagementScore: score,
      });
    },
    [trackEvent]
  );

  return (
    <ABTestingContext.Provider
      value={{
        experimentId,
        variant,
        isLoading,
        trackEvent,
        trackConversion,
        trackEngagement,
      }}
    >
      {children}
    </ABTestingContext.Provider>
  );
}

export function useABTesting() {
  const context = useContext(ABTestingContext);
  if (context === undefined) {
    throw new Error("useABTesting must be used within ABTestingProvider");
  }
  return context;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

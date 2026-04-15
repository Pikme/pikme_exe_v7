import { useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface AnalyticsEvent {
  tagId?: number;
  locationId?: number;
  eventType: "view" | "click" | "conversion" | "share";
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const sessionIdRef = useRef<string>("");
  const trackEventMutation = trpc.analytics.trackEvent.useMutation();

  // Initialize session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  /**
   * Track an engagement event
   */
  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      try {
        await trackEventMutation.mutateAsync({
          tagId: event.tagId,
          locationId: event.locationId,
          eventType: event.eventType,
          sessionId: sessionIdRef.current,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          metadata: event.metadata,
        });
      } catch (error) {
        console.error("Failed to track event:", error);
      }
    },
    [trackEventMutation]
  );

  /**
   * Track a location view
   */
  const trackLocationView = useCallback(
    (locationId: number, tagIds?: number[]) => {
      if (tagIds && tagIds.length > 0) {
        tagIds.forEach((tagId) => {
          trackEvent({
            locationId,
            tagId,
            eventType: "view",
            metadata: { source: "location_view" },
          });
        });
      } else {
        trackEvent({
          locationId,
          eventType: "view",
          metadata: { source: "location_view" },
        });
      }
    },
    [trackEvent]
  );

  /**
   * Track a location click
   */
  const trackLocationClick = useCallback(
    (locationId: number, tagIds?: number[], clickType?: string) => {
      if (tagIds && tagIds.length > 0) {
        tagIds.forEach((tagId) => {
          trackEvent({
            locationId,
            tagId,
            eventType: "click",
            metadata: { clickType: clickType || "location_click" },
          });
        });
      } else {
        trackEvent({
          locationId,
          eventType: "click",
          metadata: { clickType: clickType || "location_click" },
        });
      }
    },
    [trackEvent]
  );

  /**
   * Track a conversion event
   */
  const trackConversion = useCallback(
    (locationId: number, tagIds?: number[], conversionType?: string) => {
      if (tagIds && tagIds.length > 0) {
        tagIds.forEach((tagId) => {
          trackEvent({
            locationId,
            tagId,
            eventType: "conversion",
            metadata: { conversionType: conversionType || "booking" },
          });
        });
      } else {
        trackEvent({
          locationId,
          eventType: "conversion",
          metadata: { conversionType: conversionType || "booking" },
        });
      }
    },
    [trackEvent]
  );

  /**
   * Track a share event
   */
  const trackShare = useCallback(
    (locationId: number, tagIds?: number[], platform?: string) => {
      if (tagIds && tagIds.length > 0) {
        tagIds.forEach((tagId) => {
          trackEvent({
            locationId,
            tagId,
            eventType: "share",
            metadata: { platform: platform || "unknown" },
          });
        });
      } else {
        trackEvent({
          locationId,
          eventType: "share",
          metadata: { platform: platform || "unknown" },
        });
      }
    },
    [trackEvent]
  );

  /**
   * Track a tag click
   */
  const trackTagClick = useCallback(
    (tagId: number, locationId?: number) => {
      trackEvent({
        tagId,
        locationId,
        eventType: "click",
        metadata: { source: "tag_click" },
      });
    },
    [trackEvent]
  );

  /**
   * Get current session ID
   */
  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return {
    trackEvent,
    trackLocationView,
    trackLocationClick,
    trackConversion,
    trackShare,
    trackTagClick,
    getSessionId,
    isLoading: trackEventMutation.isPending,
  };
}

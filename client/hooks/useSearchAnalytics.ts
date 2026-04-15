import { useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';

export interface SearchParams {
  searchTerm: string;
  filters: Record<string, string[]>;
  resultsCount: number;
}

export interface FilterParams {
  filterId: string;
  filterType: string;
  filterValue: string;
  searchTerm?: string;
}

export function useSearchAnalytics() {
  const sessionId = useRef<string>(
    typeof window !== 'undefined' 
      ? sessionStorage.getItem('sessionId') || crypto.randomUUID()
      : ''
  );

  // Initialize session ID in storage
  if (typeof window !== 'undefined' && !sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId.current);
  }

  const trackSearchMutation = trpc.analytics.trackSearch.useMutation();
  const trackFilterMutation = trpc.analytics.trackFilter.useMutation();
  const trackSearchClickMutation = trpc.analytics.trackSearchClick.useMutation();

  const trackSearch = useCallback(
    (params: SearchParams) => {
      trackSearchMutation.mutate({
        searchTerm: params.searchTerm,
        filters: params.filters,
        resultsCount: params.resultsCount,
        sessionId: sessionId.current,
        timestamp: new Date(),
      });
    },
    [trackSearchMutation]
  );

  const trackFilterUsage = useCallback(
    (params: FilterParams) => {
      trackFilterMutation.mutate({
        filterId: params.filterId,
        filterType: params.filterType,
        filterValue: params.filterValue,
        searchTerm: params.searchTerm,
        sessionId: sessionId.current,
        timestamp: new Date(),
      });
    },
    [trackFilterMutation]
  );

  const trackSearchClick = useCallback(
    (searchTerm: string, resultId: string, resultPosition: number) => {
      trackSearchClickMutation.mutate({
        searchTerm,
        resultId,
        resultPosition,
        sessionId: sessionId.current,
        timestamp: new Date(),
      });
    },
    [trackSearchClickMutation]
  );

  return {
    trackSearch,
    trackFilterUsage,
    trackSearchClick,
    sessionId: sessionId.current,
  };
}

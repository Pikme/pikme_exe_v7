import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";

/**
 * Hook for fetching engagement metrics for a specific email
 */
export function useEngagementMetrics(emailHistoryId: number) {
  return trpc.engagementAnalytics.getMetrics.useQuery(
    { emailHistoryId },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );
}

/**
 * Hook for fetching engagement trends
 */
export function useEngagementTrends(
  startDate?: Date,
  endDate?: Date,
  periodType?: "daily" | "weekly" | "monthly"
) {
  return trpc.engagementAnalytics.getTrends.useQuery(
    { startDate, endDate, periodType },
    {
      refetchInterval: 60000, // Refetch every 60 seconds
      staleTime: 30000,
    }
  );
}

/**
 * Hook for fetching top performing emails
 */
export function useTopEmails(limit = 10, offset = 0) {
  return trpc.engagementAnalytics.getTopEmails.useQuery(
    { limit, offset },
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
}

/**
 * Hook for fetching recipient engagement profile
 */
export function useRecipientProfile(recipientEmail: string) {
  return trpc.engagementAnalytics.getRecipientProfile.useQuery(
    { recipientEmail },
    {
      refetchInterval: 30000,
      staleTime: 10000,
    }
  );
}

/**
 * Hook for fetching overall engagement statistics
 */
export function useEngagementStatistics(startDate?: Date, endDate?: Date) {
  return trpc.engagementAnalytics.getStatistics.useQuery(
    { startDate, endDate },
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
}

/**
 * Hook for fetching email events
 */
export function useEmailEvents(emailHistoryId: number, limit = 50, offset = 0) {
  return trpc.engagementAnalytics.getEmailEvents.useQuery(
    { emailHistoryId, limit, offset },
    {
      refetchInterval: 30000,
      staleTime: 10000,
    }
  );
}

/**
 * Hook for fetching recipients list with engagement metrics
 */
export function useRecipientsList(
  limit = 20,
  offset = 0,
  sortBy: "engagement" | "opens" | "clicks" | "recent" = "engagement"
) {
  return trpc.engagementAnalytics.getRecipientsList.useQuery(
    { limit, offset, sortBy },
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
}

/**
 * Hook for fetching engagement summary
 */
export function useEngagementSummary() {
  return trpc.engagementAnalytics.getSummary.useQuery(undefined, {
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for real-time metrics with polling
 */
export function useRealTimeMetrics(emailHistoryId: number, pollInterval = 10000) {
  const [isPolling, setIsPolling] = useState(true);

  const query = trpc.engagementAnalytics.getMetrics.useQuery(
    { emailHistoryId },
    {
      refetchInterval: isPolling ? pollInterval : false,
      staleTime: 5000,
    }
  );

  return {
    ...query,
    isPolling,
    setIsPolling,
  };
}

/**
 * Hook for date range filtering
 */
export function useDateRangeFilter(defaultDays = 7) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - defaultDays);
    return date;
  });

  const [endDate, setEndDate] = useState(new Date());

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handlePreset,
  };
}

/**
 * Hook for pagination
 */
export function usePagination(defaultLimit = 20) {
  const [limit, setLimit] = useState(defaultLimit);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);

  const handleNextPage = () => {
    setOffset((prev) => prev + limit);
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset((prev) => prev - limit);
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setOffset((newPage - 1) * limit);
  };

  return {
    limit,
    offset,
    page,
    setLimit,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
  };
}

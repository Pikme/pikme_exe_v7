import { useEffect, useState, useCallback } from "react";
import { useLocation, useRouter } from "wouter";

interface UseUrlDateRangeOptions {
  defaultDays?: number;
}

interface UseUrlDateRangeReturn {
  startDate: Date;
  endDate: Date;
  setDateRange: (start: Date, end: Date) => void;
  setPreset: (days: number) => void;
  shareUrl: string;
  isLoading: boolean;
}

/**
 * Hook for managing date range state in URL
 * Allows sharing dashboard links with pre-configured date ranges
 */
export function useUrlDateRange(
  options: UseUrlDateRangeOptions = {}
): UseUrlDateRangeReturn {
  const { defaultDays = 7 } = options;
  const [location, navigate] = useLocation();
  const [startDate, setStartDate] = useState<Date>(() => {
    const start = new Date();
    start.setDate(start.getDate() - defaultDays);
    return start;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStart = params.get("startDate");
    const urlEnd = params.get("endDate");

    if (urlStart && urlEnd) {
      try {
        const parsedStart = parseDate(urlStart);
        const parsedEnd = parseDate(urlEnd);

        if (isValidDateRange(parsedStart, parsedEnd)) {
          setStartDate(parsedStart);
          setEndDate(parsedEnd);
        }
      } catch (error) {
        console.warn("Invalid date range in URL, using defaults:", error);
      }
    }

    setIsLoading(false);
  }, []);

  // Update URL when dates change
  const setDateRange = useCallback(
    (newStart: Date, newEnd: Date) => {
      if (!isValidDateRange(newStart, newEnd)) {
        console.warn("Invalid date range provided");
        return;
      }

      setStartDate(newStart);
      setEndDate(newEnd);

      // Update URL
      const params = new URLSearchParams(window.location.search);
      params.set("startDate", formatDateForUrl(newStart));
      params.set("endDate", formatDateForUrl(newEnd));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ startDate: newStart, endDate: newEnd }, "", newUrl);
    },
    []
  );

  // Set date range using preset days
  const setPreset = useCallback(
    (days: number) => {
      const newEnd = new Date();
      const newStart = new Date();
      newStart.setDate(newStart.getDate() - days);

      setDateRange(newStart, newEnd);
    },
    [setDateRange]
  );

  // Generate shareable URL
  const shareUrl = generateShareUrl(startDate, endDate);

  return {
    startDate,
    endDate,
    setDateRange,
    setPreset,
    shareUrl,
    isLoading,
  };
}

/**
 * Parse date string from URL format (YYYY-MM-DD)
 */
function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date;
}

/**
 * Format date for URL (YYYY-MM-DD)
 */
function formatDateForUrl(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validate date range
 */
function isValidDateRange(start: Date, end: Date): boolean {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    return false;
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  if (start > end) {
    return false;
  }

  // Check if range is not more than 2 years
  const daysDiff = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff > 730) {
    return false;
  }

  return true;
}

/**
 * Generate shareable URL with current date range
 */
function generateShareUrl(startDate: Date, endDate: Date): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set("startDate", formatDateForUrl(startDate));
  params.set("endDate", formatDateForUrl(endDate));

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Hook for reading URL state without modifying it
 */
export function useUrlDateRangeRead(): {
  startDate: Date | null;
  endDate: Date | null;
} {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStart = params.get("startDate");
    const urlEnd = params.get("endDate");

    if (urlStart && urlEnd) {
      try {
        const parsedStart = parseDate(urlStart);
        const parsedEnd = parseDate(urlEnd);

        if (isValidDateRange(parsedStart, parsedEnd)) {
          setStartDate(parsedStart);
          setEndDate(parsedEnd);
        }
      } catch (error) {
        console.warn("Invalid date range in URL:", error);
      }
    }
  }, []);

  return { startDate, endDate };
}

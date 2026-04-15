import { getDb } from '../db';
import { searchAnalytics, searchTermMetrics, filterUsageMetrics } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface SearchEvent {
  searchTerm: string;
  filters: Record<string, string[]>;
  resultsCount: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export interface FilterEvent {
  filterId: string;
  filterType: string;
  filterValue: string;
  searchTerm?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export interface SearchClickEvent {
  searchTerm: string;
  resultId: string;
  resultPosition: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

export async function trackSearchEvent(event: SearchEvent) {
  const db = getDb();
  
  try {
    // Store raw search event
    await db.insert(searchAnalytics).values({
      searchTerm: event.searchTerm,
      filters: JSON.stringify(event.filters),
      resultsCount: event.resultsCount,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp,
    });

    // Update search term metrics
    const existingMetric = await db.query.searchTermMetrics.findFirst({
      where: eq(searchTermMetrics.searchTerm, event.searchTerm),
    });

    if (existingMetric) {
      await db
        .update(searchTermMetrics)
        .set({
          searchCount: existingMetric.searchCount + 1,
          lastSearched: event.timestamp,
          avgResultsCount: 
            (existingMetric.avgResultsCount * existingMetric.searchCount + event.resultsCount) / 
            (existingMetric.searchCount + 1),
        })
        .where(eq(searchTermMetrics.searchTerm, event.searchTerm));
    } else {
      await db.insert(searchTermMetrics).values({
        searchTerm: event.searchTerm,
        searchCount: 1,
        avgResultsCount: event.resultsCount,
        lastSearched: event.timestamp,
      });
    }
  } catch (error) {
    console.error('Error tracking search event:', error);
  }
}

export async function trackFilterUsage(event: FilterEvent) {
  const db = getDb();
  
  try {
    const filterId = `${event.filterType}:${event.filterValue}`;
    
    // Update filter usage metrics
    const existingMetric = await db.query.filterUsageMetrics.findFirst({
      where: eq(filterUsageMetrics.filterId, filterId),
    });

    if (existingMetric) {
      await db
        .update(filterUsageMetrics)
        .set({
          usageCount: existingMetric.usageCount + 1,
          lastUsed: event.timestamp,
        })
        .where(eq(filterUsageMetrics.filterId, filterId));
    } else {
      await db.insert(filterUsageMetrics).values({
        filterId,
        filterType: event.filterType,
        filterValue: event.filterValue,
        usageCount: 1,
        lastUsed: event.timestamp,
      });
    }
  } catch (error) {
    console.error('Error tracking filter usage:', error);
  }
}

export async function getTopSearchTerms(limit = 10, days = 30) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    return await db.query.searchTermMetrics.findMany({
      where: gte(searchTermMetrics.lastSearched, startDate),
      orderBy: (fields) => [desc(fields.searchCount)],
      limit,
    });
  } catch (error) {
    console.error('Error getting top search terms:', error);
    return [];
  }
}

export async function getTopFilters(limit = 10, days = 30) {
  const db = getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    return await db.query.filterUsageMetrics.findMany({
      where: gte(filterUsageMetrics.lastUsed, startDate),
      orderBy: (fields) => [desc(fields.usageCount)],
      limit,
    });
  } catch (error) {
    console.error('Error getting top filters:', error);
    return [];
  }
}

export async function getSearchMetrics(startDate: Date, endDate: Date) {
  const db = getDb();

  try {
    const events = await db.query.searchAnalytics.findMany({
      where: and(
        gte(searchAnalytics.timestamp, startDate),
        lte(searchAnalytics.timestamp, endDate)
      ),
    });

    const totalSearches = events.length;
    const uniqueSearchTerms = new Set(events.map(e => e.searchTerm)).size;
    const avgResultsPerSearch = 
      events.length > 0 
        ? events.reduce((sum, e) => sum + e.resultsCount, 0) / events.length 
        : 0;

    return {
      totalSearches,
      uniqueSearchTerms,
      avgResultsPerSearch,
      dateRange: { startDate, endDate },
    };
  } catch (error) {
    console.error('Error getting search metrics:', error);
    return {
      totalSearches: 0,
      uniqueSearchTerms: 0,
      avgResultsPerSearch: 0,
      dateRange: { startDate, endDate },
    };
  }
}

export async function getFilterMetrics(startDate: Date, endDate: Date) {
  const db = getDb();

  try {
    const metrics = await db.query.filterUsageMetrics.findMany({
      where: and(
        gte(filterUsageMetrics.lastUsed, startDate),
        lte(filterUsageMetrics.lastUsed, endDate)
      ),
      orderBy: (fields) => [desc(fields.usageCount)],
    });

    const totalFilterUsages = metrics.reduce((sum, m) => sum + m.usageCount, 0);
    const filterTypes = new Set(metrics.map(m => m.filterType)).size;

    return {
      totalFilterUsages,
      filterTypes,
      topFilters: metrics.slice(0, 10),
      dateRange: { startDate, endDate },
    };
  } catch (error) {
    console.error('Error getting filter metrics:', error);
    return {
      totalFilterUsages: 0,
      filterTypes: 0,
      topFilters: [],
      dateRange: { startDate, endDate },
    };
  }
}

import { desc } from 'drizzle-orm';

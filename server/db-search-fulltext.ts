/**
 * Full-Text Search Implementation using MySQL FULLTEXT indexes
 * This module provides optimized search functions using MATCH...AGAINST syntax
 * for better performance on large datasets
 */

import { 
  eq, 
  and, 
  or, 
  desc, 
  asc, 
  count,
  sql,
} from "drizzle-orm";
import { getDb } from "./db";
import { 
  tours,
  locations,
  states,
  categories,
} from "../drizzle/schema";

// ============ Tours Full-Text Search ============

export interface TourFullTextSearchInput {
  search?: string;
  difficulty?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
}

export async function searchToursFullText(input: TourFullTextSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, difficulty, categoryId, limit = 20, offset = 0 } = input;

  let query = db.select().from(tours);
  const conditions = [];

  // Use FULLTEXT search if search term provided
  if (search && search.trim()) {
    // MySQL FULLTEXT search with MATCH...AGAINST
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${tours.name}, ${tours.description}, ${tours.longDescription}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  // Filter by difficulty
  if (difficulty) {
    conditions.push(eq(tours.difficulty, difficulty));
  }

  // Filter by category
  if (categoryId) {
    conditions.push(eq(tours.categoryId, categoryId));
  }

  // Apply all conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getTourFullTextSearchCount(input: TourFullTextSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, difficulty, categoryId } = input;

  let query = db.select({ count: count() }).from(tours);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${tours.name}, ${tours.description}, ${tours.longDescription}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (difficulty) {
    conditions.push(eq(tours.difficulty, difficulty));
  }

  if (categoryId) {
    conditions.push(eq(tours.categoryId, categoryId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Locations Full-Text Search ============

export interface LocationFullTextSearchInput {
  search?: string;
  countryId?: number;
  stateId?: number;
  limit?: number;
  offset?: number;
}

export async function searchLocationsFullText(input: LocationFullTextSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, countryId, stateId, limit = 20, offset = 0 } = input;

  let query = db.select().from(locations);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${locations.name}, ${locations.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (countryId) {
    conditions.push(eq(locations.countryId, countryId));
  }

  if (stateId) {
    conditions.push(eq(locations.stateId, stateId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getLocationFullTextSearchCount(input: LocationFullTextSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, countryId, stateId } = input;

  let query = db.select({ count: count() }).from(locations);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${locations.name}, ${locations.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (countryId) {
    conditions.push(eq(locations.countryId, countryId));
  }

  if (stateId) {
    conditions.push(eq(locations.stateId, stateId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ States Full-Text Search ============

export interface StateFullTextSearchInput {
  search?: string;
  countryId?: number;
  limit?: number;
  offset?: number;
}

export async function searchStatesFullText(input: StateFullTextSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, countryId, limit = 20, offset = 0 } = input;

  let query = db.select().from(states);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${states.name}, ${states.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (countryId) {
    conditions.push(eq(states.countryId, countryId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getStateFullTextSearchCount(input: StateFullTextSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, countryId } = input;

  let query = db.select({ count: count() }).from(states);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${states.name}, ${states.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (countryId) {
    conditions.push(eq(states.countryId, countryId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Categories Full-Text Search ============

export interface CategoryFullTextSearchInput {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function searchCategoriesFullText(input: CategoryFullTextSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, limit = 20, offset = 0 } = input;

  let query = db.select().from(categories);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${categories.name}, ${categories.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getCategoryFullTextSearchCount(input: CategoryFullTextSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search } = input;

  let query = db.select({ count: count() }).from(categories);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = search.trim();
    conditions.push(
      sql`MATCH(${categories.name}, ${categories.description}) AGAINST(${searchTerm} IN BOOLEAN MODE)`
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Full-Text Search Syntax Guide ============
/**
 * MySQL FULLTEXT Search Modes:
 * 
 * 1. BOOLEAN MODE (recommended for admin searches)
 *    - Supports operators: +, -, >, <, *, "", ()
 *    - Examples:
 *      "+beach -resort" - must contain "beach", must not contain "resort"
 *      "beach*" - matches "beach", "beaches", "beachfront"
 *      "\"luxury resort\"" - exact phrase match
 *      "(beach | mountain) tour" - matches either "beach tour" or "mountain tour"
 * 
 * 2. NATURAL LANGUAGE MODE (default)
 *    - Simpler syntax, more intuitive
 *    - Ranks results by relevance
 *    - Examples:
 *      "beach resort" - searches for both terms
 *      "luxury vacation" - finds documents with these terms
 * 
 * 3. QUERY EXPANSION MODE
 *    - Automatically expands query with related terms
 *    - Slower but finds more results
 *    - Syntax: AGAINST('search_term' WITH QUERY EXPANSION)
 */

// ============ Performance Tips ============
/**
 * 1. FULLTEXT indexes are most effective for:
 *    - Text fields with 4+ characters
 *    - Searches with 3+ character terms
 *    - Natural language queries
 * 
 * 2. FULLTEXT search is slower for:
 *    - Very short terms (1-3 characters)
 *    - Single character searches
 *    - Numbers and special characters
 * 
 * 3. Optimization strategies:
 *    - Combine FULLTEXT with indexed filters (categoryId, difficulty)
 *    - Use BOOLEAN MODE for precise searches
 *    - Cache common search results
 *    - Monitor query execution time with EXPLAIN
 * 
 * 4. Fallback strategy:
 *    - If search term < 3 characters, use LIKE fallback
 *    - If FULLTEXT returns no results, try LIKE with wildcards
 */

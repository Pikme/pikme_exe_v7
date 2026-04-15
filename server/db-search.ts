/**
 * Server-side search and filtering helpers for admin tables
 * These functions handle search and filtering at the database level for better performance
 */

import { 
  eq, 
  and, 
  or, 
  like, 
  desc, 
  asc, 
  count,
  ilike,
} from "drizzle-orm";
import { getDb } from "./db";
import { 
  tours,
  locations,
  states,
  cities,
  categories,
  activities,
} from "../drizzle/schema";

// ============ Tours Search ============

export interface TourSearchInput {
  search?: string;
  difficulty?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  limit?: number;
  offset?: number;
}

export async function searchTours(input: TourSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, difficulty, categoryId, minPrice, maxPrice, minDuration, maxDuration, limit = 20, offset = 0 } = input;

  let query = db.select().from(tours);
  const conditions = [];

  // Search by name, slug, or description
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(tours.name, searchTerm),
        ilike(tours.slug, searchTerm),
        ilike(tours.description, searchTerm),
        ilike(tours.longDescription, searchTerm)
      )
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

  // Filter by price range
  if (minPrice !== undefined) {
    conditions.push(tours.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push(tours.price <= maxPrice);
  }

  // Filter by duration range
  if (minDuration !== undefined) {
    conditions.push(tours.duration >= minDuration);
  }
  if (maxDuration !== undefined) {
    conditions.push(tours.duration <= maxDuration);
  }

  // Apply all conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getTourSearchCount(input: TourSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, difficulty, categoryId, minPrice, maxPrice, minDuration, maxDuration } = input;

  let query = db.select({ count: count() }).from(tours);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(tours.name, searchTerm),
        ilike(tours.slug, searchTerm),
        ilike(tours.description, searchTerm),
        ilike(tours.longDescription, searchTerm)
      )
    );
  }

  if (difficulty) {
    conditions.push(eq(tours.difficulty, difficulty));
  }

  if (categoryId) {
    conditions.push(eq(tours.categoryId, categoryId));
  }

  if (minPrice !== undefined) {
    conditions.push(tours.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push(tours.price <= maxPrice);
  }

  if (minDuration !== undefined) {
    conditions.push(tours.duration >= minDuration);
  }
  if (maxDuration !== undefined) {
    conditions.push(tours.duration <= maxDuration);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Locations Search ============

export interface LocationSearchInput {
  search?: string;
  countryId?: number;
  stateId?: number;
  limit?: number;
  offset?: number;
}

export async function searchLocations(input: LocationSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, countryId, stateId, limit = 20, offset = 0 } = input;

  let query = db.select().from(locations);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(locations.name, searchTerm),
        ilike(locations.description, searchTerm)
      )
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

export async function getLocationSearchCount(input: LocationSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, countryId, stateId } = input;

  let query = db.select({ count: count() }).from(locations);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(locations.name, searchTerm),
        ilike(locations.description, searchTerm)
      )
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

// ============ States Search ============

export interface StateSearchInput {
  search?: string;
  countryId?: number;
  limit?: number;
  offset?: number;
}

export async function searchStates(input: StateSearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, countryId, limit = 20, offset = 0 } = input;

  let query = db.select().from(states);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(states.name, searchTerm),
        ilike(states.description, searchTerm)
      )
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

export async function getStateSearchCount(input: StateSearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, countryId } = input;

  let query = db.select({ count: count() }).from(states);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(states.name, searchTerm),
        ilike(states.description, searchTerm)
      )
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

// ============ Categories Search ============

export interface CategorySearchInput {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function searchCategories(input: CategorySearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, limit = 20, offset = 0 } = input;

  let query = db.select().from(categories);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(categories.name, searchTerm),
        ilike(categories.description, searchTerm)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getCategorySearchCount(input: CategorySearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search } = input;

  let query = db.select({ count: count() }).from(categories);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(categories.name, searchTerm),
        ilike(categories.description, searchTerm)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Activities Search ============

export interface ActivitySearchInput {
  search?: string;
  difficulty?: string;
  locationId?: number;
  limit?: number;
  offset?: number;
}

export async function searchActivities(input: ActivitySearchInput) {
  const db = await getDb();
  if (!db) return [];

  const { search, difficulty, locationId, limit = 20, offset = 0 } = input;

  let query = db.select().from(activities);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(activities.name, searchTerm),
        ilike(activities.description, searchTerm),
        ilike(activities.category, searchTerm)
      )
    );
  }

  if (difficulty) {
    conditions.push(eq(activities.difficulty, difficulty));
  }

  if (locationId) {
    conditions.push(eq(activities.locationId, locationId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(limit).offset(offset);
}

export async function getActivitySearchCount(input: ActivitySearchInput) {
  const db = await getDb();
  if (!db) return 0;

  const { search, difficulty, locationId } = input;

  let query = db.select({ count: count() }).from(activities);
  const conditions = [];

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(activities.name, searchTerm),
        ilike(activities.description, searchTerm),
        ilike(activities.category, searchTerm)
      )
    );
  }

  if (difficulty) {
    conditions.push(eq(activities.difficulty, difficulty));
  }

  if (locationId) {
    conditions.push(eq(activities.locationId, locationId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// ============ Combined Global Search ============

export interface GlobalSearchInput {
  query: string;
  limit?: number;
}

export async function globalSearch(input: GlobalSearchInput) {
  const db = await getDb();
  if (!db) return { tours: [], activities: [], locations: [], categories: [] };

  const { query, limit = 10 } = input;

  if (!query || !query.trim()) {
    return { tours: [], activities: [], locations: [], categories: [] };
  }

  const searchTerm = `%${query.trim()}%`;

  const [toursResults, activitiesResults, locationsResults, categoriesResults] = await Promise.all([
    db.select().from(tours)
      .where(or(
        ilike(tours.name, searchTerm),
        ilike(tours.description, searchTerm)
      ))
      .limit(limit),
    db.select().from(activities)
      .where(or(
        ilike(activities.name, searchTerm),
        ilike(activities.description, searchTerm),
        ilike(activities.category, searchTerm)
      ))
      .limit(limit),
    db.select().from(locations)
      .where(or(
        ilike(locations.name, searchTerm),
        ilike(locations.description, searchTerm)
      ))
      .limit(limit),
    db.select().from(categories)
      .where(or(
        ilike(categories.name, searchTerm),
        ilike(categories.description, searchTerm)
      ))
      .limit(limit),
  ]);

  return {
    tours: toursResults,
    activities: activitiesResults,
    locations: locationsResults,
    categories: categoriesResults,
  };
}

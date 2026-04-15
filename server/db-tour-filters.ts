import { getDb } from "./db";
import { tours, countries, states, locations } from "../drizzle/schema";
import { eq, inArray, and, count } from "drizzle-orm";

/**
 * Get all countries for filter dropdown
 */
export async function getCountriesForFilter() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: countries.id,
      name: countries.name,
      code: countries.code,
    })
    .from(countries)
    .orderBy(countries.name);
}

/**
 * Get states by country for cascading dropdown
 */
export async function getStatesByCountryForFilter(countryId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: states.id,
      name: states.name,
      countryId: states.countryId,
    })
    .from(states)
    .where(eq(states.countryId, countryId))
    .orderBy(states.name);
}

/**
 * Get cities/locations by state for cascading dropdown
 */
export async function getCitiesByStateForFilter(stateId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: locations.id,
      name: locations.name,
      stateId: locations.stateId,
    })
    .from(locations)
    .where(eq(locations.stateId, stateId))
    .orderBy(locations.name);
}

/**
 * Filter tours by multiple countries, states, and cities
 * If no filters provided, returns all tours
 */
export async function getToursByLocationFilters(
  filters: {
    countryIds?: number[];
    stateIds?: number[];
    cityIds?: number[];
  },
  limit = 20,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(tours.isActive, true)];

  // Build conditions based on provided filters
  if (filters.countryIds && filters.countryIds.length > 0) {
    conditions.push(inArray(tours.countryId, filters.countryIds));
  }

  if (filters.stateIds && filters.stateIds.length > 0) {
    conditions.push(inArray(tours.stateId, filters.stateIds));
  }

  if (filters.cityIds && filters.cityIds.length > 0) {
    conditions.push(inArray(tours.locationId, filters.cityIds));
  }

  // Apply all conditions with AND logic
  return db
    .select()
    .from(tours)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
}

/**
 * Get count of tours matching location filters
 */
export async function getTourCountByLocationFilters(filters: {
  countryIds?: number[];
  stateIds?: number[];
  cityIds?: number[];
}) {
  const db = await getDb();
  if (!db) return 0;

  let query = db.select({ count: count() }).from(tours);
  const conditions = [];

  if (filters.countryIds && filters.countryIds.length > 0) {
    conditions.push(inArray(tours.countryId, filters.countryIds));
  }

  if (filters.stateIds && filters.stateIds.length > 0) {
    conditions.push(inArray(tours.stateId, filters.stateIds));
  }

  if (filters.cityIds && filters.cityIds.length > 0) {
    conditions.push(inArray(tours.locationId, filters.cityIds));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query.where(eq(tours.isActive, true));
  return result[0]?.count || 0;
}

/**
 * Get tour statistics by country
 */
export async function getTourStatsByCountry() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      countryId: tours.countryId,
      countryName: countries.name,
      tourCount: count(),
    })
    .from(tours)
    .leftJoin(countries, eq(tours.countryId, countries.id))
    .where(eq(tours.isActive, true))
    .groupBy(tours.countryId, countries.name)
    .orderBy(countries.name);
}

/**
 * Get tour statistics by state
 */
export async function getTourStatsByState() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      stateId: tours.stateId,
      stateName: states.name,
      countryName: countries.name,
      tourCount: count(),
    })
    .from(tours)
    .leftJoin(states, eq(tours.stateId, states.id))
    .leftJoin(countries, eq(states.countryId, countries.id))
    .where(eq(tours.isActive, true))
    .groupBy(tours.stateId, states.name, countries.name)
    .orderBy(countries.name, states.name);
}



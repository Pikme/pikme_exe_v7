import { getDb } from './db';
import { countries, states, locations, tours } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Get country by slug
 */
export async function getCountryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const country = await db
    .select()
    .from(countries)
    .where(eq(countries.slug, slug))
    .limit(1);

  return country[0] || null;
}

/**
 * Get country details with metadata for SEO
 */
export async function getCountryDetails(countryId: number) {
  const db = await getDb();
  if (!db) return null;

  const country = await db
    .select()
    .from(countries)
    .where(eq(countries.id, countryId))
    .limit(1);

  if (!country.length) {
    return null;
  }

  // Get all states for this country
  const countryStates = await db
    .select()
    .from(states)
    .where(eq(states.countryId, countryId));

  // Get all cities for this country
  const countryLocations = await db
    .select()
    .from(locations)
    .innerJoin(states, eq(locations.stateId, states.id))
    .where(eq(states.countryId, countryId));

  return {
    country: country[0],
    states: countryStates,
    locations: countryLocations.map((row) => row.locations),
    totalStates: countryStates.length,
    totalCities: countryLocations.length,
  };
}

/**
 * Get state details with metadata for SEO
 */
export async function getStateDetails(stateId: number) {
  const db = await getDb();
  if (!db) return null;

  const state = await db
    .select()
    .from(states)
    .where(eq(states.id, stateId))
    .limit(1);

  if (!state.length) {
    return null;
  }

  // Get country for this state
  const country = await db
    .select()
    .from(countries)
    .where(eq(countries.id, state[0].countryId))
    .limit(1);

  // Get all cities for this state
  const stateLocations = await db
    .select()
    .from(locations)
    .where(eq(locations.stateId, stateId));

  return {
    state: state[0],
    country: country[0] || null,
    locations: stateLocations,
    totalCities: stateLocations.length,
  };
}

/**
 * Get featured tours for a country
 */
export async function getFeaturedToursByCountry(
  countryId: number,
  limit: number = 6
) {
  const db = await getDb();
  if (!db) return [];

  const featuredTours = await db
    .select()
    .from(tours)
    .where(eq(tours.countryId, countryId))
    .limit(limit);

  return featuredTours;
}

/**
 * Get featured tours for a state
 */
export async function getFeaturedToursByState(
  stateId: number,
  limit: number = 6
) {
  const db = await getDb();
  if (!db) return [];

  const featuredTours = await db
    .select()
    .from(tours)
    .where(eq(tours.stateId, stateId))
    .limit(limit);

  return featuredTours;
}

/**
 * Get featured tours for a city/location
 */
export async function getFeaturedToursByLocation(
  locationId: number,
  limit: number = 6
) {
  const db = await getDb();
  if (!db) {
    console.log('[getFeaturedToursByLocation] Database not available');
    return [];
  }

  console.log('[getFeaturedToursByLocation] Querying tours for locationId:', locationId, 'limit:', limit);
  
  const featuredTours = await db
    .select()
    .from(tours)
    .where(eq(tours.locationId, locationId))
    .limit(limit);

  console.log('[getFeaturedToursByLocation] Found', featuredTours.length, 'tours');
  return featuredTours;
}

/**
 * Get all countries with state and city counts for sitemap/SEO
 */
export async function getDestinationHierarchy() {
  const db = await getDb();
  if (!db) return [];

  const allCountries = await db.select().from(countries);

  const hierarchy = await Promise.all(
    allCountries.map(async (country) => {
      const countryStates = await db
        .select()
        .from(states)
        .where(eq(states.countryId, country.id));

      const stateDetails = await Promise.all(
        countryStates.map(async (state) => {
          const stateCities = await db
            .select()
            .from(locations)
            .where(eq(locations.stateId, state.id));

          return {
            ...state,
            cityCount: stateCities.length,
          };
        })
      );

      return {
        ...country,
        stateCount: countryStates.length,
        states: stateDetails,
      };
    })
  );

  return hierarchy;
}

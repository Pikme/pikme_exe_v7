import { 
  eq, 
  and, 
  or, 
  like, 
  desc, 
  asc, 
  count, 
  gte, 
  inArray,
  sql,
  ne,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  tours,
  locations,
  countries,
  states,
  categories,
  flights,
  activities,
  attractions,
  importLogs,
  seoMetadata,
  tourLocalizations,
  stateLocalizations,
  categoryLocalizations,
  bookingEnquiries,
  InsertBookingEnquiry,
  InsertTour,
  InsertLocation,
  InsertCountry,
  InsertState,
  InsertCategory,
  InsertFlight,
  InsertActivity,
  InsertAttraction,
  InsertImportLog,
  InsertSeoMetadata,
  InsertTourLocalization,
  InsertStateLocalization,
  InsertCategoryLocalization,
  validationLogs,
  validationIssues,
  attractionAnalytics,
  InsertAttractionAnalytics,
  importRollbacks,
  rollbackLogs,
  InsertImportRollback,
  InsertRollbackLog,
  translations,
  InsertTranslation,
  homePageSettings,
  bodyImageCarousel,
  InsertBodyImageCarousel,
  BodyImageCarousel,
  featuredDestinations,
  InsertFeaturedDestination,
  FeaturedDestination,
  reviewWidgets,
  InsertReviewWidget,
  ReviewWidget,
  destinationGallery,
  InsertDestinationGallery,
  DestinationGallery,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Operations ============

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(users).values(user);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUser(id: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(users)
    .set(updates)
    .where(eq(users.id, id));
}

// ============ Tour Operations ============

export async function createTour(tour: InsertTour) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(tours).values(tour);
}

export async function getTourBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.error('[getTourBySlug] Database connection failed');
    return null;
  }
  
  console.log('[getTourBySlug] Looking for slug:', slug);
  
  const result = await db.select().from(tours)
    .where(eq(tours.slug, slug))
    .limit(1);
  
  console.log('[getTourBySlug] Query result for slug "' + slug + '":', result.length, 'rows');
  if (result.length > 0) {
    console.log('[getTourBySlug] Found tour:', { id: result[0].id, name: result[0].name, slug: result[0].slug });
  } else {
    console.log('[getTourBySlug] No tour found. Checking all tours...');
    const allTours = await db.select().from(tours).limit(10);
    console.log('[getTourBySlug] Available tours:', allTours.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
  }
  
  return result.length > 0 ? result[0] : null;
}

export async function getTourById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tours)
    .where(eq(tours.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listTours(limit = 20, offset = 0, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(tours);
  
  if (categoryId) {
    query = query.where(eq(tours.categoryId, categoryId));
  }
  
  return query.limit(limit).offset(offset);
}

export async function getTourCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(tours);
  return result[0]?.count || 0;
}

export async function updateTour(id: number, updates: Partial<InsertTour>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(tours)
    .set(updates)
    .where(eq(tours.id, id));
}

export async function deleteTour(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(tours)
    .where(eq(tours.id, id));
}

export async function getTourFlights(tourId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(flights)
    .where(eq(flights.tourId, tourId));
}

export async function getTourActivities(tourId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(activities)
    .where(eq(activities.tourId, tourId));
}

export async function getAllToursForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tours);
}

// ============ Location Operations ============

export async function createLocation(location: InsertLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(locations).values(location);
}

export async function getLocationBySlug(stateId: number, slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(locations)
    .where(and(eq(locations.stateId, stateId), eq(locations.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getLocationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(locations)
    .where(eq(locations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listLocationsByState(stateId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(locations)
    .where(eq(locations.stateId, stateId))
    .limit(limit)
    .offset(offset);
}

export async function listLocationsByCountry(countryId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all states for this country, then get all locations for those states
  const statesForCountry = await db.select({ id: states.id }).from(states)
    .where(eq(states.countryId, countryId));
  
  if (statesForCountry.length === 0) return [];
  
  const stateIds = statesForCountry.map(s => s.id);
  
  return db.select().from(locations)
    .where(inArray(locations.stateId, stateIds))
    .limit(limit)
    .offset(offset);
}

export async function getLocationCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(locations);
  return result[0]?.count || 0;
}

export async function updateLocation(id: number, updates: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(locations)
    .set(updates)
    .where(eq(locations.id, id));
}

export async function deleteLocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(locations)
    .where(eq(locations.id, id));
}

export async function getAllLocationsForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(locations);
}

// ============ Country Operations ============

export async function createCountry(country: InsertCountry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(countries).values(country);
}

export async function getCountryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(countries)
    .where(eq(countries.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCountryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(countries)
    .where(eq(countries.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listCountries(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(countries)
    .limit(limit)
    .offset(offset);
}

export async function updateCountry(id: number, updates: Partial<InsertCountry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(countries)
    .set(updates)
    .where(eq(countries.id, id));
}

export async function deleteCountry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(countries)
    .where(eq(countries.id, id));
}

export async function getAllCountriesForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(countries);
}

// ============ State Operations ============

export async function createState(state: InsertState) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(states).values(state);
}

export async function getStateBySlug(countryId: number, slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(states)
    .where(and(eq(states.countryId, countryId), eq(states.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStateBySlugAnyCountry(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(states)
    .where(eq(states.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(states)
    .where(eq(states.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listStatesByCountry(countryId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(states)
    .where(eq(states.countryId, countryId))
    .limit(limit)
    .offset(offset);
}

export async function updateState(id: number, updates: Partial<InsertState>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(states)
    .set(updates)
    .where(eq(states.id, id));
}

export async function deleteState(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(states)
    .where(eq(states.id, id));
}

// ============ Category Operations ============

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(categories).values(category);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listCategories(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categories)
    .limit(limit)
    .offset(offset);
}

export async function updateCategory(id: number, updates: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(categories)
    .set(updates)
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(categories)
    .where(eq(categories.id, id));
}

// ============ Activity Operations ============

export async function createActivity(activity: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(activities).values(activity);
}

export async function getActivityBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    activity: activities,
    location: locations,
    state: states,
    country: countries,
  })
    .from(activities)
    .leftJoin(locations, eq(activities.locationId, locations.id))
    .leftJoin(states, eq(locations.stateId, states.id))
    .leftJoin(countries, eq(states.countryId, countries.id))
    .where(eq(activities.slug, slug))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    ...row.activity,
    location: row.location,
    state: row.state,
    country: row.country,
  };
}

export async function getActivityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    activity: activities,
    location: locations,
    state: states,
    country: countries,
  })
    .from(activities)
    .leftJoin(locations, eq(activities.locationId, locations.id))
    .leftJoin(states, eq(locations.stateId, states.id))
    .leftJoin(countries, eq(states.countryId, countries.id))
    .where(eq(activities.id, id))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    ...row.activity,
    location: row.location ? {
      ...row.location,
      state: row.state ? {
        ...row.state,
        country: row.country || undefined,
      } : undefined,
    } : undefined,
  };
}

export async function getActivityCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(activities);
  return result[0]?.count || 0;
}

export async function updateActivity(id: number, updates: Partial<InsertActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(activities)
    .set(updates)
    .where(eq(activities.id, id));
}

export async function deleteActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(activities)
    .where(eq(activities.id, id));
}

export async function listActivities(locationId?: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.error('[listActivities] Database not available');
    return [];
  }
  
  try {
    if (locationId) {
      const result = await db.select().from(activities)
        .where(eq(activities.locationId, locationId))
        .limit(limit)
        .offset(offset);
      console.log(`[listActivities] Found ${result.length} activities for locationId ${locationId}`);
      return result;
    }
    const result = await db.select().from(activities)
      .limit(limit)
      .offset(offset);
    console.log(`[listActivities] Found ${result.length} total activities`);
    return result;
  } catch (error) {
    console.error('[listActivities] Error fetching activities:', error);
    return [];
  }
}

export async function listActivitiesByLocation(locationId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(activities)
    .where(eq(activities.locationId, locationId))
    .limit(limit)
    .offset(offset);
  
  if (result.length > 0) {
    console.log('[listActivitiesByLocation] First activity fields:', Object.keys(result[0]));
    console.log('[listActivitiesByLocation] whatIncluded:', result[0].whatIncluded ? 'EXISTS' : 'MISSING');
    console.log('[listActivitiesByLocation] whatExcluded:', result[0].whatExcluded ? 'EXISTS' : 'MISSING');
  }
  
  return result;
}

export async function getAllActivitiesForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(activities);
}

// ============ Flight Operations ============

export async function createFlight(flight: InsertFlight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(flights).values(flight);
}

export async function getFlightById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(flights)
    .where(eq(flights.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateFlight(id: number, updates: Partial<InsertFlight>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(flights)
    .set(updates)
    .where(eq(flights.id, id));
}

export async function deleteFlight(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(flights)
    .where(eq(flights.id, id));
}

// ============ Import Log Operations ============

export async function createImportLog(log: InsertImportLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(importLogs).values(log);
}

export async function getImportCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(importLogs);
  return result[0]?.count || 0;
}

// ============ Attractions Operations ============

export async function createAttraction(attraction: InsertAttraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(attractions).values(attraction);
}

export async function getAttractionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(attractions)
    .where(eq(attractions.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAttractionBySlug(locationId: number, slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(attractions)
    .where(and(eq(attractions.locationId, locationId), eq(attractions.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listAttractionsByLocation(locationId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(attractions)
    .where(and(eq(attractions.locationId, locationId), eq(attractions.isActive, true)))
    .orderBy(desc(attractions.isFeatured), desc(attractions.rating))
    .limit(limit)
    .offset(offset);
}

export async function listAttractionsByLocationAndType(locationId: number, type: string, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(attractions)
    .where(and(
      eq(attractions.locationId, locationId),
      eq(attractions.type, type as any),
      eq(attractions.isActive, true)
    ))
    .orderBy(desc(attractions.isFeatured), desc(attractions.rating))
    .limit(limit)
    .offset(offset);
}

export async function listFeaturedAttractionsByLocation(locationId: number, limit = 6) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(attractions)
    .where(and(eq(attractions.locationId, locationId), eq(attractions.isFeatured, true), eq(attractions.isActive, true)))
    .orderBy(desc(attractions.rating))
    .limit(limit);
}

export async function countAttractionsByLocation(locationId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(attractions)
    .where(and(eq(attractions.locationId, locationId), eq(attractions.isActive, true)));
  return result[0]?.count || 0;
}

export async function updateAttraction(id: number, updates: Partial<InsertAttraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(attractions)
    .set(updates)
    .where(eq(attractions.id, id));
}

export async function deleteAttraction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(attractions)
    .where(eq(attractions.id, id));
}

export async function searchAttractions(locationId: number, query: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(attractions)
    .where(and(
      eq(attractions.locationId, locationId),
      eq(attractions.isActive, true),
      like(attractions.name, `%${query}%`)
    ))
    .orderBy(desc(attractions.rating))
    .limit(limit);
}

// ============ Advanced Attractions Admin Operations ============

/**
 * List all attractions with filtering, search, and pagination (admin view)
 */
export async function listAllAttractions(options: {
  search?: string;
  type?: string;
  locationId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'rating' | 'created' | 'featured';
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const db = await getDb();
  if (!db) return [];

  const {
    search,
    type,
    locationId,
    isFeatured,
    isActive,
    minRating,
    limit = 50,
    offset = 0,
    sortBy = 'created',
    sortOrder = 'desc',
  } = options;

  let query = db.select().from(attractions);
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(attractions.name, `%${search}%`),
        like(attractions.description, `%${search}%`),
        like(attractions.address, `%${search}%`)
      )
    );
  }

  if (type) {
    conditions.push(eq(attractions.type, type as any));
  }

  if (locationId) {
    conditions.push(eq(attractions.locationId, locationId));
  }

  if (isFeatured !== undefined) {
    conditions.push(eq(attractions.isFeatured, isFeatured));
  }

  if (isActive !== undefined) {
    conditions.push(eq(attractions.isActive, isActive));
  }

  if (minRating !== undefined) {
    conditions.push(gte(attractions.rating, minRating as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortMap = {
    name: attractions.name,
    rating: attractions.rating,
    created: attractions.createdAt,
    featured: attractions.isFeatured,
  };

  const sortColumn = sortMap[sortBy] || attractions.createdAt;
  query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

  return query.limit(limit).offset(offset);
}

/**
 * Count attractions with filtering
 */
export async function countAllAttractions(options: {
  search?: string;
  type?: string;
  locationId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  minRating?: number;
} = {}) {
  const db = await getDb();
  if (!db) return 0;

  const {
    search,
    type,
    locationId,
    isFeatured,
    isActive,
    minRating,
  } = options;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(attractions.name, `%${search}%`),
        like(attractions.description, `%${search}%`),
        like(attractions.address, `%${search}%`)
      )
    );
  }

  if (type) {
    conditions.push(eq(attractions.type, type as any));
  }

  if (locationId) {
    conditions.push(eq(attractions.locationId, locationId));
  }

  if (isFeatured !== undefined) {
    conditions.push(eq(attractions.isFeatured, isFeatured));
  }

  if (isActive !== undefined) {
    conditions.push(eq(attractions.isActive, isActive));
  }

  if (minRating !== undefined) {
    conditions.push(gte(attractions.rating, minRating as any));
  }

  let query = db.select({ count: count() }).from(attractions);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  return result[0]?.count || 0;
}

/**
 * Get attraction statistics
 */
export async function getAttractionStats(locationId?: number) {
  const db = await getDb();
  if (!db) return null;

  const conditions = locationId ? [eq(attractions.locationId, locationId)] : [];

  const result = await db.select({
    total: count(),
    featured: count(sql`CASE WHEN ${attractions.isFeatured} = true THEN 1 END`),
    active: count(sql`CASE WHEN ${attractions.isActive} = true THEN 1 END`),
    avgRating: sql<number>`AVG(${attractions.rating})`,
  }).from(attractions)
    .where(conditions.length > 0 ? and(...conditions) : undefined) as any;

  return result[0] || null;
}

/**
 * Get attractions by type distribution
 */
export async function getAttractionsByTypeDistribution(locationId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = locationId ? [eq(attractions.locationId, locationId)] : [];

  return db.select({
    type: attractions.type,
    count: count(),
  }).from(attractions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(attractions.type) as any;
}

/**
 * Bulk create attractions
 */
export async function bulkCreateAttractions(attractionsList: InsertAttraction[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(attractions).values(attractionsList);
}

/**
 * Bulk update attractions
 */
export async function bulkUpdateAttractions(
  ids: number[],
  updates: Partial<InsertAttraction>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(attractions)
    .set(updates)
    .where(inArray(attractions.id, ids));
}

/**
 * Bulk delete attractions
 */
export async function bulkDeleteAttractions(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(attractions)
    .where(inArray(attractions.id, ids));
}

/**
 * Toggle featured status
 */
export async function toggleAttractionFeatured(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const attraction = await getAttractionById(id);
  if (!attraction) throw new Error("Attraction not found");

  return db.update(attractions)
    .set({ isFeatured: !attraction.isFeatured })
    .where(eq(attractions.id, id));
}

/**
 * Toggle active status
 */
export async function toggleAttractionActive(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const attraction = await getAttractionById(id);
  if (!attraction) throw new Error("Attraction not found");

  return db.update(attractions)
    .set({ isActive: !attraction.isActive })
    .where(eq(attractions.id, id));
}

/**
 * Get top rated attractions
 */
export async function getTopRatedAttractions(limit = 10, locationId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = locationId 
    ? [eq(attractions.locationId, locationId), eq(attractions.isActive, true)]
    : [eq(attractions.isActive, true)];

  return db.select().from(attractions)
    .where(and(...conditions))
    .orderBy(desc(attractions.rating), desc(attractions.reviewCount))
    .limit(limit);
}

/**
 * Export attractions as JSON
 */
export async function exportAttractionsAsJSON(options: {
  locationId?: number;
  type?: string;
  isFeatured?: boolean;
} = {}) {
  const db = await getDb();
  if (!db) return [];

  const { locationId, type, isFeatured } = options;
  const conditions = [];

  if (locationId) conditions.push(eq(attractions.locationId, locationId));
  if (type) conditions.push(eq(attractions.type, type as any));
  if (isFeatured !== undefined) conditions.push(eq(attractions.isFeatured, isFeatured));

  let query = db.select().from(attractions);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query;
}


// ============ Missing User Operations ============

export async function upsertUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserByOpenId(user.openId);
  if (existing) {
    return db.update(users)
      .set(user)
      .where(eq(users.id, existing.id));
  }
  
  return db.insert(users).values(user);
}

// ============ Missing Export Functions ============

export async function getAllStatesForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(states);
}

export async function getAllCategoriesForExport() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categories);
}

// ============ Localization Operations ============

export async function createTourLocalization(data: InsertTourLocalization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(tourLocalizations).values(data);
}

export async function getTourLocalization(tourId: number, locale: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tourLocalizations)
    .where(and(eq(tourLocalizations.tourId, tourId), eq(tourLocalizations.locale, locale)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listTourLocalizations(tourId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tourLocalizations)
    .where(eq(tourLocalizations.tourId, tourId));
}

export async function updateTourLocalization(tourId: number, locale: string, updates: Partial<InsertTourLocalization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(tourLocalizations)
    .set(updates)
    .where(and(eq(tourLocalizations.tourId, tourId), eq(tourLocalizations.locale, locale)));
}

export async function deleteTourLocalization(tourId: number, locale: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(tourLocalizations)
    .where(and(eq(tourLocalizations.tourId, tourId), eq(tourLocalizations.locale, locale)));
}

export async function createStateLocalization(data: InsertStateLocalization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(stateLocalizations).values(data);
}

export async function getStateLocalization(stateId: number, locale: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(stateLocalizations)
    .where(and(eq(stateLocalizations.stateId, stateId), eq(stateLocalizations.locale, locale)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listStateLocalizations(stateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stateLocalizations)
    .where(eq(stateLocalizations.stateId, stateId));
}

export async function updateStateLocalization(stateId: number, locale: string, updates: Partial<InsertStateLocalization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(stateLocalizations)
    .set(updates)
    .where(and(eq(stateLocalizations.stateId, stateId), eq(stateLocalizations.locale, locale)));
}

export async function deleteStateLocalization(stateId: number, locale: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(stateLocalizations)
    .where(and(eq(stateLocalizations.stateId, stateId), eq(stateLocalizations.locale, locale)));
}

export async function createCategoryLocalization(data: InsertCategoryLocalization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(categoryLocalizations).values(data);
}

export async function getCategoryLocalization(categoryId: number, locale: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(categoryLocalizations)
    .where(and(eq(categoryLocalizations.categoryId, categoryId), eq(categoryLocalizations.locale, locale)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listCategoryLocalizations(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categoryLocalizations)
    .where(eq(categoryLocalizations.categoryId, categoryId));
}

export async function updateCategoryLocalization(categoryId: number, locale: string, updates: Partial<InsertCategoryLocalization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(categoryLocalizations)
    .set(updates)
    .where(and(eq(categoryLocalizations.categoryId, categoryId), eq(categoryLocalizations.locale, locale)));
}

export async function deleteCategoryLocalization(categoryId: number, locale: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(categoryLocalizations)
    .where(and(eq(categoryLocalizations.categoryId, categoryId), eq(categoryLocalizations.locale, locale)));
}


export async function listTourLocalizationsByLocale(locale: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tourLocalizations)
    .where(eq(tourLocalizations.locale, locale))
    .limit(limit)
    .offset(offset);
}


// ============ Import Log Operations ============

export async function createImportLogEntry(data: {
  userId: number;
  fileName: string;
  importType: "tours" | "locations" | "flights" | "activities" | "attractions";
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: any[];
  status?: "pending" | "processing" | "completed" | "failed";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(importLogs).values({
    userId: data.userId,
    fileName: data.fileName,
    importType: data.importType,
    totalRecords: data.totalRecords,
    successfulRecords: data.successfulRecords,
    failedRecords: data.failedRecords,
    errors: data.errors || [],
    status: data.status || "completed",
    createdAt: new Date(),
    completedAt: new Date(),
  });
}

export async function getImportLogById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(importLogs).where(eq(importLogs.id, id));
  return result[0] || null;
}

export async function listImportLogs(filters?: {
  userId?: number;
  importType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(importLogs);
  
  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(importLogs.userId, filters.userId));
  }
  if (filters?.importType) {
    conditions.push(eq(importLogs.importType, filters.importType as any));
  }
  if (filters?.status) {
    conditions.push(eq(importLogs.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  query = query.orderBy(desc(importLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  return query;
}

export async function countImportLogs(filters?: {
  userId?: number;
  importType?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ count: count() }).from(importLogs);
  
  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(importLogs.userId, filters.userId));
  }
  if (filters?.importType) {
    conditions.push(eq(importLogs.importType, filters.importType as any));
  }
  if (filters?.status) {
    conditions.push(eq(importLogs.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query;
  return result[0]?.count || 0;
}

export async function updateImportLogStatus(id: number, statusOrData: "pending" | "processing" | "completed" | "failed" | { status?: string; totalRecords?: number; successfulRecords?: number; failedRecords?: number; errors?: string[]; completedAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let updateData: any;
  if (typeof statusOrData === 'string') {
    updateData = { 
      status: statusOrData,
      completedAt: statusOrData === "completed" || statusOrData === "failed" ? new Date() : undefined,
    };
  } else {
    updateData = {};
    if (statusOrData.status) updateData.status = statusOrData.status;
    if (statusOrData.totalRecords !== undefined) updateData.totalRecords = statusOrData.totalRecords;
    if (statusOrData.successfulRecords !== undefined) updateData.successfulRecords = statusOrData.successfulRecords;
    if (statusOrData.failedRecords !== undefined) updateData.failedRecords = statusOrData.failedRecords;
    if (statusOrData.errors !== undefined) updateData.errors = statusOrData.errors;
    if (statusOrData.completedAt !== undefined) updateData.completedAt = statusOrData.completedAt;
  }
  
  return db.update(importLogs)
    .set(updateData)
    .where(eq(importLogs.id, id));
}

export async function getImportStatistics(userId?: number) {
  const db = await getDb();
  if (!db) return null;
  
  let query = db.select({
    totalImports: count(),
    totalRecords: sql`SUM(${importLogs.totalRecords})`,
    successfulRecords: sql`SUM(${importLogs.successfulRecords})`,
    failedRecords: sql`SUM(${importLogs.failedRecords})`,
  }).from(importLogs);
  
  if (userId) {
    query = query.where(eq(importLogs.userId, userId));
  }
  
  const result = await query;
  return result[0] || null;
}

export async function getImportLogsByType(importType: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(importLogs)
    .where(eq(importLogs.importType, importType as any))
    .orderBy(desc(importLogs.createdAt))
    .limit(limit);
}

export async function getAllImportLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(importLogs)
    .orderBy(desc(importLogs.createdAt))
    .limit(limit);
}

export async function deleteImportLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(importLogs).where(eq(importLogs.id, id));
}

export async function getRecentImports(days: number = 7, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return db.select()
    .from(importLogs)
    .where(gte(importLogs.createdAt, dateThreshold))
    .orderBy(desc(importLogs.createdAt))
    .limit(limit);
}


// ============ Rollback Operations ============

export async function recordImportRollback(data: {
  importLogId: number;
  userId: number;
  entityType: "attractions" | "tours" | "locations" | "flights" | "activities";
  action: "create" | "update" | "delete";
  recordId: number;
  previousData?: any;
  newData?: any;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(importRollbacks).values({
    importLogId: data.importLogId,
    userId: data.userId,
    entityType: data.entityType,
    action: data.action,
    recordId: data.recordId,
    previousData: data.previousData,
    newData: data.newData,
    status: "pending",
    reason: data.reason,
    createdAt: new Date(),
  });
}

export async function getRollbacksByImportLog(importLogId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(importRollbacks)
    .where(eq(importRollbacks.importLogId, importLogId))
    .orderBy(desc(importRollbacks.createdAt));
}

export async function getRollbackById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(importRollbacks).where(eq(importRollbacks.id, id));
  return result[0] || null;
}

export async function updateRollbackStatus(id: number, status: "pending" | "completed" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(importRollbacks)
    .set({ 
      status,
      completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
    })
    .where(eq(importRollbacks.id, id));
}

export async function createRollbackLog(data: {
  importLogId: number;
  userId: number;
  totalRollbacks: number;
  successfulRollbacks: number;
  failedRollbacks: number;
  errors?: any[];
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(rollbackLogs).values({
    importLogId: data.importLogId,
    userId: data.userId,
    totalRollbacks: data.totalRollbacks,
    successfulRollbacks: data.successfulRollbacks,
    failedRollbacks: data.failedRollbacks,
    status: "completed",
    errors: data.errors || [],
    reason: data.reason,
    createdAt: new Date(),
    completedAt: new Date(),
  });
}

export async function getRollbackLog(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(rollbackLogs).where(eq(rollbackLogs.id, id));
  return result[0] || null;
}

export async function getRollbackLogsByImportLog(importLogId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(rollbackLogs)
    .where(eq(rollbackLogs.importLogId, importLogId))
    .orderBy(desc(rollbackLogs.createdAt));
}

export async function listRollbackLogs(filters?: {
  userId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(rollbackLogs);
  
  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(rollbackLogs.userId, filters.userId));
  }
  if (filters?.status) {
    conditions.push(eq(rollbackLogs.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  query = query.orderBy(desc(rollbackLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  return query;
}

export async function countRollbackLogs(filters?: {
  userId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ count: count() }).from(rollbackLogs);
  
  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(rollbackLogs.userId, filters.userId));
  }
  if (filters?.status) {
    conditions.push(eq(rollbackLogs.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query;
  return result[0]?.count || 0;
}

export async function deleteRollbackLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(rollbackLogs).where(eq(rollbackLogs.id, id));
}

export async function getRollbackStatistics(userId?: number) {
  const db = await getDb();
  if (!db) return null;
  
  let query = db.select({
    totalRollbacks: count(),
    totalRecords: sql`SUM(${rollbackLogs.totalRollbacks})`,
    successfulRecords: sql`SUM(${rollbackLogs.successfulRollbacks})`,
    failedRecords: sql`SUM(${rollbackLogs.failedRollbacks})`,
  }).from(rollbackLogs);
  
  if (userId) {
    query = query.where(eq(rollbackLogs.userId, userId));
  }
  
  const result = await query;
  return result[0] || null;
}

// ============ Attraction Rollback Operations ============

export async function deleteAttractionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(attractions).where(eq(attractions.id, id));
}

export async function restoreAttractionData(id: number, data: Partial<InsertAttraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(attractions)
    .set(data)
    .where(eq(attractions.id, id));
}


// ============================================================================
// Attraction Analytics Functions
// ============================================================================

export async function recordAttractionView(attractionId: number, views: number = 1) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await database
    .select()
    .from(attractionAnalytics)
    .where(
      and(
        eq(attractionAnalytics.attractionId, attractionId),
        gte(attractionAnalytics.date, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return database
      .update(attractionAnalytics)
      .set({ views: existing[0].views + views })
      .where(eq(attractionAnalytics.id, existing[0].id));
  }

  return database.insert(attractionAnalytics).values({
    attractionId,
    views,
    date: today,
  });
}

export async function getAttractionAnalytics(attractionId: number, days: number = 30) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database
    .select()
    .from(attractionAnalytics)
    .where(
      and(
        eq(attractionAnalytics.attractionId, attractionId),
        gte(attractionAnalytics.date, startDate)
      )
    )
    .orderBy(asc(attractionAnalytics.date));
}

export async function getTopAttractionsByViews(limit: number = 10, days: number = 30) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database
    .select({
      id: attractions.id,
      name: attractions.name,
      type: attractions.type,
      totalViews: sql`SUM(${attractionAnalytics.views})`,
      avgRating: attractions.rating,
      reviewCount: attractions.reviewCount,
    })
    .from(attractionAnalytics)
    .innerJoin(attractions, eq(attractionAnalytics.attractionId, attractions.id))
    .where(gte(attractionAnalytics.date, startDate))
    .groupBy(attractionAnalytics.attractionId)
    .orderBy(desc(sql`SUM(${attractionAnalytics.views})`))
    .limit(limit);
}

export async function getAttractionAnalyticsSummary(days: number = 30) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await database
    .select({
      totalViews: sql`SUM(${attractionAnalytics.views})`,
      totalClicks: sql`SUM(${attractionAnalytics.clicks})`,
      avgRating: sql`AVG(${attractionAnalytics.averageRating})`,
      totalFavorites: sql`SUM(${attractionAnalytics.favoriteCount})`,
      totalBookings: sql`SUM(${attractionAnalytics.bookingCount})`,
      avgConversionRate: sql`AVG(${attractionAnalytics.conversionRate})`,
    })
    .from(attractionAnalytics)
    .where(gte(attractionAnalytics.date, startDate));

  return result[0];
}

export async function getAttractionsByType(days: number = 30) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database
    .select({
      type: attractions.type,
      count: sql`COUNT(DISTINCT ${attractions.id})`,
      totalViews: sql`SUM(${attractionAnalytics.views})`,
      avgRating: sql`AVG(${attractions.rating})`,
    })
    .from(attractionAnalytics)
    .innerJoin(attractions, eq(attractionAnalytics.attractionId, attractions.id))
    .where(gte(attractionAnalytics.date, startDate))
    .groupBy(attractions.type);
}

export async function getTrendingAttractions(limit: number = 5, days: number = 7) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return database
    .select({
      id: attractions.id,
      name: attractions.name,
      type: attractions.type,
      views: sql`SUM(${attractionAnalytics.views})`,
      rating: attractions.rating,
      trendScore: sql`(SUM(${attractionAnalytics.views}) * ${attractions.rating}) / 100`,
    })
    .from(attractionAnalytics)
    .innerJoin(attractions, eq(attractionAnalytics.attractionId, attractions.id))
    .where(gte(attractionAnalytics.date, startDate))
    .groupBy(attractionAnalytics.attractionId)
    .orderBy(desc(sql`(SUM(${attractionAnalytics.views}) * ${attractions.rating}) / 100`))
    .limit(limit);
}

export async function updateAttractionAnalytics(
  attractionId: number,
  data: Partial<InsertAttractionAnalytics>
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await database
    .select()
    .from(attractionAnalytics)
    .where(
      and(
        eq(attractionAnalytics.attractionId, attractionId),
        gte(attractionAnalytics.date, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return database
      .update(attractionAnalytics)
      .set(data)
      .where(eq(attractionAnalytics.id, existing[0].id));
  }

  return database.insert(attractionAnalytics).values({
    attractionId,
    ...data,
    date: today,
  });
}

export async function deleteAttractionAnalytics(attractionId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  return database
    .delete(attractionAnalytics)
    .where(eq(attractionAnalytics.attractionId, attractionId));
}


// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Create a new validation log
 */
export async function createValidationLog(data: {
  validationType: "attractions" | "tours" | "locations" | "all";
  status: "pending" | "processing" | "completed" | "failed";
  totalRecords: number;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const result = await database.insert(validationLogs).values({
    validationType: data.validationType,
    status: data.status,
    totalRecords: data.totalRecords,
    validRecords: 0,
    invalidRecords: 0,
    warnings: 0,
    startedAt: new Date(),
  });
  return result[0];
}

/**
 * Update validation log with results
 */
export async function updateValidationLog(
  logId: number,
  data: {
    status: "pending" | "processing" | "completed" | "failed";
    validRecords?: number;
    invalidRecords?: number;
    warnings?: number;
    errors?: any[];
    anomalies?: any[];
    suggestedActions?: any[];
    executionTime?: number;
    completedAt?: Date;
  }
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  await database
    .update(validationLogs)
    .set({
      status: data.status,
      validRecords: data.validRecords,
      invalidRecords: data.invalidRecords,
      warnings: data.warnings,
      errors: data.errors ? JSON.stringify(data.errors) : undefined,
      anomalies: data.anomalies ? JSON.stringify(data.anomalies) : undefined,
      suggestedActions: data.suggestedActions ? JSON.stringify(data.suggestedActions) : undefined,
      executionTime: data.executionTime,
      completedAt: data.completedAt,
    })
    .where(eq(validationLogs.id, logId));
}

/**
 * Create validation issue
 */
export async function createValidationIssue(data: {
  validationLogId: number;
  ruleId: number;
  entityType: "attraction" | "tour" | "location" | "activity";
  entityId: number;
  field?: string;
  currentValue?: string;
  expectedValue?: string;
  severity: "info" | "warning" | "error";
  message: string;
  suggestedFix?: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const result = await database.insert(validationIssues).values({
    validationLogId: data.validationLogId,
    ruleId: data.ruleId,
    entityType: data.entityType,
    entityId: data.entityId,
    field: data.field,
    currentValue: data.currentValue,
    expectedValue: data.expectedValue,
    severity: data.severity,
    message: data.message,
    suggestedFix: data.suggestedFix,
    isResolved: false,
  });
  return result[0];
}

/**
 * Get validation logs with pagination
 */
export async function listValidationLogs(
  page: number = 1,
  limit: number = 20,
  filters?: {
    validationType?: "attractions" | "tours" | "locations" | "all";
    status?: "pending" | "processing" | "completed" | "failed";
  }
) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  let query = database.select().from(validationLogs);

  if (filters?.validationType) {
    query = query.where(eq(validationLogs.validationType, filters.validationType));
  }
  if (filters?.status) {
    query = query.where(eq(validationLogs.status, filters.status));
  }

  const offset = (page - 1) * limit;
  return query.orderBy(desc(validationLogs.createdAt)).limit(limit).offset(offset);
}

/**
 * Get validation issues for a log
 */
export async function getValidationIssues(logId: number, severity?: "info" | "warning" | "error") {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  let query = database.select().from(validationIssues).where(eq(validationIssues.validationLogId, logId));

  if (severity) {
    query = query.where(eq(validationIssues.severity, severity));
  }

  return query.orderBy(desc(validationIssues.severity));
}

/**
 * Get validation statistics
 */
export async function getValidationStatistics(days: number = 30) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await database
    .select()
    .from(validationLogs)
    .where(gte(validationLogs.createdAt, startDate))
    .orderBy(desc(validationLogs.createdAt));

  const totalValidations = logs.length;
  const completedValidations = logs.filter((l: any) => l.status === "completed").length;
  const failedValidations = logs.filter((l: any) => l.status === "failed").length;
  const totalIssues = logs.reduce((sum: number, l: any) => sum + (l.invalidRecords || 0), 0);
  const totalWarnings = logs.reduce((sum: number, l: any) => sum + (l.warnings || 0), 0);

  return {
    totalValidations,
    completedValidations,
    failedValidations,
    successRate: totalValidations > 0 ? (completedValidations / totalValidations) * 100 : 0,
    totalIssues,
    totalWarnings,
    averageExecutionTime:
      logs.length > 0
        ? logs.reduce((sum: number, l: any) => sum + (l.executionTime || 0), 0) / logs.length
        : 0,
  };
}

/**
 * Validate attractions data
 */
export async function validateAttractions() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const attractionsList = await database.select().from(attractions);
  const issues: any[] = [];
  const anomalies: any[] = [];

  for (const attraction of attractionsList) {
    // Check required fields
    if (!attraction.name) {
      issues.push({
        attractionId: attraction.id,
        field: "name",
        severity: "error",
        message: "Attraction name is required",
      });
    }

    if (!attraction.type) {
      issues.push({
        attractionId: attraction.id,
        field: "type",
        severity: "error",
        message: "Attraction type is required",
      });
    }

    if (!attraction.locationId) {
      issues.push({
        attractionId: attraction.id,
        field: "locationId",
        severity: "error",
        message: "Location is required",
      });
    }

    // Check rating range
    if (attraction.rating && (Number(attraction.rating) < 0 || Number(attraction.rating) > 5)) {
      issues.push({
        attractionId: attraction.id,
        field: "rating",
        severity: "warning",
        message: `Rating ${attraction.rating} is outside valid range (0-5)`,
      });
    }

    // Check for suspicious patterns
    if (Number(attraction.rating) === 5 && attraction.reviewCount && Number(attraction.reviewCount) > 100) {
      anomalies.push({
        attractionId: attraction.id,
        type: "perfect_rating_with_many_reviews",
        message: `Perfect 5-star rating with ${attraction.reviewCount} reviews`,
        severity: "warning",
      });
    }
  }

  return { issues, anomalies, validCount: attractionsList.length - issues.length };
}

/**
 * Validate tours data
 */
export async function validateTours() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const toursList = await database.select().from(tours);
  const issues: any[] = [];
  const anomalies: any[] = [];

  for (const tour of toursList) {
    // Check required fields
    if (!tour.name) {
      issues.push({
        tourId: tour.id,
        field: "name",
        severity: "error",
        message: "Tour name is required",
      });
    }

    if (!tour.price) {
      issues.push({
        tourId: tour.id,
        field: "price",
        severity: "error",
        message: "Tour price is required",
      });
    }

    // Check price validity
    if (tour.price && Number(tour.price) < 0) {
      issues.push({
        tourId: tour.id,
        field: "price",
        severity: "error",
        message: `Invalid price: ${tour.price}`,
      });
    }

    // Check for suspicious patterns
    if (tour.price && Number(tour.price) > 100000) {
      anomalies.push({
        tourId: tour.id,
        type: "unusually_high_price",
        message: `Tour price ${tour.price} is unusually high`,
        severity: "info",
      });
    }
  }

  return { issues, anomalies, validCount: toursList.length - issues.length };
}

/**
 * Validate locations data
 */
export async function validateLocations() {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const locationsList = await database.select().from(locations);
  const issues: any[] = [];
  const anomalies: any[] = [];

  for (const location of locationsList) {
    // Check required fields
    if (!location.name) {
      issues.push({
        locationId: location.id,
        field: "name",
        severity: "error",
        message: "Location name is required",
      });
    }

    if (!location.stateId) {
      issues.push({
        locationId: location.id,
        field: "stateId",
        severity: "error",
        message: "State is required",
      });
    }

    // Check coordinates if provided
    if (location.latitude && location.longitude) {
      if (Number(location.latitude) < -90 || Number(location.latitude) > 90) {
        issues.push({
          locationId: location.id,
          field: "latitude",
          severity: "error",
          message: `Invalid latitude: ${location.latitude}`,
        });
      }
      if (Number(location.longitude) < -180 || Number(location.longitude) > 180) {
        issues.push({
          locationId: location.id,
          field: "longitude",
          severity: "error",
          message: `Invalid longitude: ${location.longitude}`,
        });
      }
    }
  }

  return { issues, anomalies, validCount: locationsList.length - issues.length };
}


// ============================================================================
// Translation Management Functions
// ============================================================================

/**
 * Get all translations, optionally filtered by language or category
 */
export async function getAllTranslations(
  language?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(translations);

  if (language || category) {
    const conditions = [];
    if (language) conditions.push(eq(translations.language, language as any));
    if (category) conditions.push(eq(translations.category, category));
    query = query.where(and(...conditions)) as any;
  }

  return query;
}

/**
 * Get a single translation by key and language
 */
export async function getTranslation(key: string, language: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(translations)
    .where(and(eq(translations.key, key), eq(translations.language, language as any)))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new translation
 */
export async function createTranslation(data: InsertTranslation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(translations).values(data);
  return result;
}

/**
 * Update a translation
 */
export async function updateTranslation(
  id: number,
  data: Partial<InsertTranslation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(translations).set(data).where(eq(translations.id, id));
}

/**
 * Delete a translation
 */
export async function deleteTranslation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(translations).where(eq(translations.id, id));
}

/**
 * Get translations by category
 */
export async function getTranslationsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(translations)
    .where(eq(translations.category, category));
}

/**
 * Search translations by key or value
 */
export async function searchTranslations(
  searchTerm: string,
  language?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    or(
      like(translations.key, `%${searchTerm}%`),
      like(translations.value, `%${searchTerm}%`)
    ),
  ];

  if (language) {
    conditions.push(eq(translations.language, language as any));
  }
  if (category) {
    conditions.push(eq(translations.category, category));
  }

  return db
    .select()
    .from(translations)
    .where(and(...conditions));
}

/**
 * Get translation statistics
 */
export async function getTranslationStats() {
  const db = await getDb();
  if (!db) return { total: 0, byLanguage: [], byCategory: [] };
  
  const totalCount = await db
    .select({ count: count() })
    .from(translations);

  const byLanguage = await db
    .select({
      language: translations.language,
      count: count(),
    })
    .from(translations)
    .groupBy(translations.language);

  const byCategory = await db
    .select({
      category: translations.category,
      count: count(),
    })
    .from(translations)
    .groupBy(translations.category);

  return {
    total: totalCount[0]?.count || 0,
    byLanguage,
    byCategory,
  };
}

/**
 * Bulk update translations
 */
export async function bulkUpdateTranslations(
  updates: Array<{ id: number; value: string }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const update of updates) {
    await db
      .update(translations)
      .set({ value: update.value, updatedAt: new Date() })
      .where(eq(translations.id, update.id));
  }

  return { success: true, updated: updates.length };
}

/**
 * Export translations as JSON
 */
export async function exportTranslationsAsJSON(language?: string) {
  const db = await getDb();
  if (!db) return {};
  
  let query = db.select().from(translations);
  if (language) {
    query = query.where(eq(translations.language, language as any)) as any;
  }

  const records = await query;
  
  const result: Record<string, Record<string, string>> = {};
  for (const record of records) {
    if (!result[record.category]) {
      result[record.category] = {};
    }
    result[record.category][record.key] = record.value;
  }

  return result;
}

/**
 * Import translations from JSON
 */
export async function importTranslationsFromJSON(
  data: Record<string, Record<string, string>>,
  language: string,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let imported = 0;
  let updated = 0;

  for (const [category, translations_data] of Object.entries(data)) {
    for (const [key, value] of Object.entries(translations_data)) {
      const existing = await db
        .select()
        .from(translations)
        .where(
          and(
            eq(translations.key, key),
            eq(translations.language, language as any),
            eq(translations.category, category)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(translations)
          .set({
            value,
            lastModifiedBy: userId,
            updatedAt: new Date(),
          })
          .where(eq(translations.id, existing[0].id));
        updated++;
      } else {
        await db.insert(translations).values({
          key,
          language: language as any,
          value,
          category,
          lastModifiedBy: userId,
        });
        imported++;
      }
    }
  }

  return { imported, updated };
}


/**
 * Export translations as CSV
 */
export async function exportTranslationsAsCSV(language?: string) {
  const db = await getDb();
  if (!db) return "";
  
  let query = db.select().from(translations);
  if (language) {
    query = query.where(eq(translations.language, language as any)) as any;
  }

  const records = await query;
  
  // CSV header
  const headers = ["Key", "Category", "Value", "Description"];
  const rows = [headers];
  
  // Add data rows
  for (const record of records) {
    rows.push([
      record.key,
      record.category,
      `"${record.value.replace(/"/g, '""')}"`, // Escape quotes in CSV
      record.description ? `"${record.description.replace(/"/g, '""')}"` : "",
    ]);
  }
  
  // Convert to CSV string
  const csv = rows.map((row) => row.join(",")).join("\n");
  return csv;
}

/**
 * Import translations from CSV
 */
export async function importTranslationsFromCSV(
  csvContent: string,
  language: string,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row");
  }
  
  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim());
  const keyIndex = headers.findIndex((h) => h.toLowerCase() === "key");
  const categoryIndex = headers.findIndex((h) => h.toLowerCase() === "category");
  const valueIndex = headers.findIndex((h) => h.toLowerCase() === "value");
  const descriptionIndex = headers.findIndex((h) => h.toLowerCase() === "description");
  
  if (keyIndex === -1 || categoryIndex === -1 || valueIndex === -1) {
    throw new Error("CSV must have 'Key', 'Category', and 'Value' columns");
  }
  
  let imported = 0;
  let updated = 0;
  const errors: string[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Simple CSV parsing (handles quoted values with commas)
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"';
            j++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const key = values[keyIndex]?.trim();
      const category = values[categoryIndex]?.trim();
      const value = values[valueIndex]?.trim();
      const description = descriptionIndex !== -1 ? values[descriptionIndex]?.trim() : undefined;
      
      if (!key || !category || !value) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }
      
      // Check if translation exists
      const existing = await db
        .select()
        .from(translations)
        .where(
          and(
            eq(translations.key, key),
            eq(translations.language, language as any),
            eq(translations.category, category)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        await db
          .update(translations)
          .set({
            value,
            description,
            lastModifiedBy: userId,
            updatedAt: new Date(),
          })
          .where(eq(translations.id, existing[0].id));
        updated++;
      } else {
        await db.insert(translations).values({
          key,
          language: language as any,
          value,
          category,
          description,
          lastModifiedBy: userId,
        });
        imported++;
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  
  return { imported, updated, errors };
}


/**
 * Booking Enquiry Functions
 */
export async function createBookingEnquiry(data: InsertBookingEnquiry) {
  const db = await getDb();
  const result = await db.insert(bookingEnquiries).values(data);
  return result;
}

export async function getBookingEnquiries(filters?: {
  tourId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  let query = db.select().from(bookingEnquiries);

  if (filters?.tourId) {
    query = query.where(eq(bookingEnquiries.tourId, filters.tourId)) as any;
  }

  if (filters?.status) {
    query = query.where(eq(bookingEnquiries.status, filters.status as any)) as any;
  }

  query = query.orderBy(desc(bookingEnquiries.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getBookingEnquiry(id: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(bookingEnquiries)
    .where(eq(bookingEnquiries.id, id));
  return result[0] || null;
}

export async function updateBookingEnquiry(
  id: number,
  data: Partial<InsertBookingEnquiry>
) {
  const db = await getDb();
  await db
    .update(bookingEnquiries)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(bookingEnquiries.id, id));
}

export async function deleteBookingEnquiry(id: number) {
  const db = await getDb();
  await db.delete(bookingEnquiries).where(eq(bookingEnquiries.id, id));
}

export async function getBookingEnquiriesByStatus(status: string) {
  const db = await getDb();
  return await db
    .select()
    .from(bookingEnquiries)
    .where(eq(bookingEnquiries.status, status as any))
    .orderBy(desc(bookingEnquiries.createdAt));
}

export async function countBookingEnquiries(filters?: {
  status?: string;
  tourId?: number;
}) {
  const db = await getDb();
  let query = db
    .select({ count: count() })
    .from(bookingEnquiries);

  if (filters?.status) {
    query = query.where(eq(bookingEnquiries.status, filters.status as any)) as any;
  }

  if (filters?.tourId) {
    query = query.where(eq(bookingEnquiries.tourId, filters.tourId)) as any;
  }

  const result = await query;
  return result[0]?.count || 0;
}

export async function getRelatedTours(tourId: number, limit = 4) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Simply get all other tours, sorted by featured status
    const result = await db.select().from(tours)
      .where(ne(tours.id, tourId))
      .orderBy(desc(tours.isFeatured))
      .limit(limit);
    return result || [];
  } catch (error) {
    console.error('Error fetching related tours:', error);
    return [];
  }
}


// ============ Location Lookup Helpers ============
export async function getCountryByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(countries)
      .where(like(countries.name, `%${name}%`))
      .limit(1);
    return result?.[0] || null;
  } catch (error) {
    console.error('Error fetching country by name:', error);
    return null;
  }
}

export async function getStateByName(name: string, countryId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(states)
      .where(and(
        like(states.name, `%${name}%`),
        eq(states.countryId, countryId)
      ))
      .limit(1);
    return result?.[0] || null;
  } catch (error) {
    console.error('Error fetching state by name:', error);
    return null;
  }
}

export async function getLocationByName(name: string, stateId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(locations)
      .where(and(
        like(locations.name, `%${name}%`),
        eq(locations.stateId, stateId)
      ))
      .limit(1);
    return result?.[0] || null;
  } catch (error) {
    console.error('Error fetching location by name:', error);
    return null;
  }
}


// ============ SEO Hub Pages - Tours by Country ============
export async function getToursByCountry(countryId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tours)
      .where(and(
        eq(tours.countryId, countryId),
        eq(tours.isActive, true)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tours.isFeatured), desc(tours.createdAt));
  } catch (error) {
    console.error('Error fetching tours by country:', error);
    return [];
  }
}

// ============ Tours by State ============
export async function listToursByState(stateId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tours)
      .where(and(
        eq(tours.stateId, stateId),
        eq(tours.isActive, true)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tours.isFeatured), desc(tours.createdAt));
  } catch (error) {
    console.error('Error fetching tours by state:', error);
    return [];
  }
}

// ============ SEO Hub Pages - Tours by Category ============
export async function getToursByCategory(categoryId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tours)
      .where(and(
        eq(tours.categoryId, categoryId),
        eq(tours.isActive, true)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tours.isFeatured), desc(tours.createdAt));
  } catch (error) {
    console.error('Error fetching tours by category:', error);
    return [];
  }
}

// ============ SEO Hub Pages - Tours by Difficulty ============
export async function getToursByDifficulty(difficulty: "easy" | "moderate" | "challenging", limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tours)
      .where(and(
        eq(tours.difficulty, difficulty),
        eq(tours.isActive, true)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tours.isFeatured), desc(tours.createdAt));
  } catch (error) {
    console.error('Error fetching tours by difficulty:', error);
    return [];
  }
}


// ============ Home Page Settings Management ============
export async function getHomePageSettings() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(homePageSettings).limit(1);
    return result?.[0] || null;
  } catch (error) {
    console.error('Error fetching home page settings:', error);
    return null;
  }
}

export async function updateHomePageSettings(sliderImages: Array<{ id: string; image: string; alt: string; title: string }>) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const existing = await getHomePageSettings();
    
    if (existing) {
      // Update existing record
      await db.update(homePageSettings)
        .set({ sliderImages })
        .where(eq(homePageSettings.id, existing.id));
      return { id: existing.id, sliderImages };
    } else {
      // Create new record
      const result = await db.insert(homePageSettings)
        .values({ sliderImages });
      return { id: result.insertId, sliderImages };
    }
  } catch (error) {
    console.error('Error updating home page settings:', error);
    return null;
  }
}

export async function addSliderImage(image: { id: string; image: string; alt: string; title: string }) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const settings = await getHomePageSettings();
    const currentImages = settings?.sliderImages || [];
    const updatedImages = [...currentImages, image];
    
    return await updateHomePageSettings(updatedImages);
  } catch (error) {
    console.error('Error adding slider image:', error);
    return null;
  }
}

export async function removeSliderImage(imageId: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const settings = await getHomePageSettings();
    const currentImages = settings?.sliderImages || [];
    const updatedImages = currentImages.filter(img => img.id !== imageId);
    
    return await updateHomePageSettings(updatedImages);
  } catch (error) {
    console.error('Error removing slider image:', error);
    return null;
  }
}

export async function updateSliderImage(imageId: string, updates: Partial<{ image: string; alt: string; title: string }>) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const settings = await getHomePageSettings();
    const currentImages = settings?.sliderImages || [];
    const updatedImages = currentImages.map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    );
    
    return await updateHomePageSettings(updatedImages);
  } catch (error) {
    console.error('Error updating slider image:', error);
    return null;
  }
}


export async function updateSectionContent(updates: {
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const existing = await getHomePageSettings();
    
    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    
    if (existing) {
      // Update existing record
      await db.update(homePageSettings)
        .set(updateData as any)
        .where(eq(homePageSettings.id, existing.id));
      return { ...existing, ...updateData };
    } else {
      // Create new record
      const result = await db.insert(homePageSettings)
        .values(updateData as any);
      return { id: result.insertId, ...updateData };
    }
  } catch (error) {
    console.error('Error updating section content:', error);
    return null;
  }
}

// ============ Body Image Carousel Operations ============

export async function getAllBodyImages() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select()
      .from(bodyImageCarousel)
      .where(eq(bodyImageCarousel.isActive, true))
      .orderBy(asc(bodyImageCarousel.displayOrder));
    return result;
  } catch (error) {
    console.error('Error fetching body images:', error);
    return [];
  }
}

export async function createBodyImage(data: InsertBodyImageCarousel) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const result = await db.insert(bodyImageCarousel).values(data);
    return { id: result.insertId, ...data };
  } catch (error) {
    console.error('Error creating body image:', error);
    throw error;
  }
}

export async function updateBodyImage(id: number, data: Partial<InsertBodyImageCarousel>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }
    
    await db.update(bodyImageCarousel)
      .set(updateData as any)
      .where(eq(bodyImageCarousel.id, id));
    
    // Fetch and return the updated record
    const updated = await db.query.bodyImageCarousel.findFirst({
      where: eq(bodyImageCarousel.id, id),
    });
    return updated || { id, ...updateData };
  } catch (error) {
    console.error('Error updating body image:', error);
    throw error;
  }
}

export async function deleteBodyImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    await db.delete(bodyImageCarousel)
      .where(eq(bodyImageCarousel.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting body image:', error);
    throw error;
  }
}

export async function reorderBodyImages(updates: Array<{ id: number; displayOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    for (const update of updates) {
      await db.update(bodyImageCarousel)
        .set({ displayOrder: update.displayOrder })
        .where(eq(bodyImageCarousel.id, update.id));
    }
    return true;
  } catch (error) {
    console.error('Error reordering body images:', error);
    throw error;
  }
}


// ============ Featured Destinations Operations ============

export async function getAllFeaturedDestinations() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select()
      .from(featuredDestinations)
      .where(eq(featuredDestinations.isActive, true))
      .orderBy(asc(featuredDestinations.displayOrder));
    return result;
  } catch (error) {
    console.error('Error fetching featured destinations:', error);
    return [];
  }
}

export async function createFeaturedDestination(data: InsertFeaturedDestination) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const result = await db.insert(featuredDestinations).values(data);
    return { id: result.insertId, ...data };
  } catch (error) {
    console.error('Error creating featured destination:', error);
    throw error;
  }
}

export async function updateFeaturedDestination(id: number, data: Partial<InsertFeaturedDestination>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }
    
    await db.update(featuredDestinations)
      .set(updateData as any)
      .where(eq(featuredDestinations.id, id));
    
    const updated = await db.query.featuredDestinations.findFirst({
      where: eq(featuredDestinations.id, id),
    });
    return updated || { id, ...updateData };
  } catch (error) {
    console.error('Error updating featured destination:', error);
    throw error;
  }
}

export async function deleteFeaturedDestination(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    await db.delete(featuredDestinations)
      .where(eq(featuredDestinations.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting featured destination:', error);
    throw error;
  }
}

export async function reorderFeaturedDestinations(updates: Array<{ id: number; displayOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    for (const update of updates) {
      await db.update(featuredDestinations)
        .set({ displayOrder: update.displayOrder })
        .where(eq(featuredDestinations.id, update.id));
    }
    return true;
  } catch (error) {
    console.error('Error reordering featured destinations:', error);
    throw error;
  }
}

// ============ Review Widgets Operations ============

export async function getAllReviewWidgets() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select()
      .from(reviewWidgets)
      .where(eq(reviewWidgets.isActive, true));
    return result;
  } catch (error) {
    console.error('Error fetching review widgets:', error);
    return [];
  }
}

export async function createOrUpdateReviewWidget(data: InsertReviewWidget) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    // Check if widget with this platform already exists
    const existing = await db.query.reviewWidgets.findFirst({
      where: eq(reviewWidgets.platform, data.platform),
    });
    
    if (existing) {
      // Update existing
      await db.update(reviewWidgets)
        .set(data)
        .where(eq(reviewWidgets.platform, data.platform));
      
      const updated = await db.query.reviewWidgets.findFirst({
        where: eq(reviewWidgets.platform, data.platform),
      });
      return updated || { ...data };
    } else {
      // Create new
      const result = await db.insert(reviewWidgets).values(data);
      return { id: result.insertId, ...data };
    }
  } catch (error) {
    console.error('Error creating/updating review widget:', error);
    throw error;
  }
}

export async function deleteReviewWidget(platform: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    await db.delete(reviewWidgets)
      .where(eq(reviewWidgets.platform, platform));
    return true;
  } catch (error) {
    console.error('Error deleting review widget:', error);
    throw error;
  }
}


// ============ Destination Gallery Operations ============

export async function getAllDestinationGallery() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const result = await db.select()
      .from(destinationGallery)
      .orderBy(asc(destinationGallery.cardNumber));
    return result;
  } catch (error) {
    console.error('Error fetching destination gallery:', error);
    throw error;
  }
}

export async function getDestinationGalleryCard(cardNumber: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const result = await db.select()
      .from(destinationGallery)
      .where(eq(destinationGallery.cardNumber, cardNumber))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching destination gallery card:', error);
    throw error;
  }
}

export async function updateDestinationGalleryCard(
  cardNumber: number,
  data: Partial<InsertDestinationGallery>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const existing = await getDestinationGalleryCard(cardNumber);
    
    if (existing) {
      // Update existing card
      await db.update(destinationGallery)
        .set(data)
        .where(eq(destinationGallery.cardNumber, cardNumber));
      
      const updated = await getDestinationGalleryCard(cardNumber);
      return updated;
    } else {
      // Create new card
      const result = await db.insert(destinationGallery).values({
        cardNumber,
        ...data,
      });
      return { id: result.insertId, cardNumber, ...data };
    }
  } catch (error) {
    console.error('Error updating destination gallery card:', error);
    throw error;
  }
}

export async function initializeDestinationGallery() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    // Check if cards exist
    const existing = await db.select().from(destinationGallery);
    
    if (existing.length === 0) {
      // Initialize with default cards
      const defaultCards = [
        {
          cardNumber: 1,
          imageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
          title: 'Beaches of Ceará',
          description: 'Experience the pristine beaches of Ceará with golden sands and turquoise waters',
        },
        {
          cardNumber: 2,
          imageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
          title: 'Beaches of Ceará',
          description: 'Discover the natural beauty and marine life of Ceará',
        },
        {
          cardNumber: 3,
          imageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
          title: 'Fernando de Noronha',
          description: 'Explore the exotic island paradise of Fernando de Noronha',
        },
      ];
      
      for (const card of defaultCards) {
        await db.insert(destinationGallery).values(card);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing destination gallery:', error);
    throw error;
  }
}

import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  index,
  unique,
  sql,
  date
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Countries table (Level 1 of geographic hierarchy)
 */
export const countries = mysqlTable("countries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("countries_slug_idx").on(table.slug),
}));

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * States table (Level 2 of geographic hierarchy)
 */
export const states = mysqlTable("states", {
  id: int("id").autoincrement().primaryKey(),
  countryId: int("countryId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  countryIdIdx: index("states_countryId_idx").on(table.countryId),
  slugIdx: index("states_slug_idx").on(table.slug),
  uniqueSlug: unique("states_countryId_slug_unique").on(table.countryId, table.slug),
}));

export type State = typeof states.$inferSelect;
export type InsertState = typeof states.$inferInsert;

/**
 * Cities/Locations table (Level 3 of geographic hierarchy)
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  stateId: int("stateId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  image: varchar("image", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stateIdIdx: index("locations_stateId_idx").on(table.stateId),
  slugIdx: index("locations_slug_idx").on(table.slug),
  uniqueSlug: unique("locations_stateId_slug_unique").on(table.stateId, table.slug),
}));

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * Categories table (tour categories like Leisure, Holiday, Spiritual, Adventure, etc.)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }), // Icon name or emoji
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("categories_slug_idx").on(table.slug),
}));

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Tours/Packages table
 */
export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  longDescription: text("longDescription"),
  
  // Geographic hierarchy
  countryId: int("countryId"), // Link to country for filtering
  stateId: int("stateId"), // Optional: link to state for hierarchical organization
  locationId: int("locationId"), // Link to specific city/location
  categoryId: int("categoryId"),
  
  duration: int("duration"), // in days
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("INR"),
  image: varchar("image", { length: 500 }),
  images: json("images"), // Array of image URLs
  
  // SEO fields
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  
  // Content sections
  highlights: json("highlights"), // Array of strings
  itinerary: json("itinerary"), // Array of day objects
  inclusions: json("inclusions"), // Array of strings
  exclusions: json("exclusions"), // Array of strings
  bestTime: varchar("bestTime", { length: 100 }),
  travelType: varchar("travelType", { length: 50 }), // e.g., "Private Tour", "Group Tour"
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "challenging"]),
  groupSize: varchar("groupSize", { length: 50 }),
  
  // Timing & Availability
  openTime: varchar("openTime", { length: 20 }), // e.g., "5:00 AM"
  closeTime: varchar("closeTime", { length: 20 }), // e.g., "8:00 PM"
  morningTime: varchar("morningTime", { length: 20 }), // e.g., "5:00 AM - 8:00 PM"
  afternoonTime: varchar("afternoonTime", { length: 20 }), // e.g., "12:00 PM - 6:30 PM"
  
  // Amenities
  amenities: json("amenities"), // Array of amenity strings
  
  // Transport
  transport: json("transport"), // Array of transport objects {type, description}
  
  // Pricing Tiers
  pricingTiers: json("pricingTiers"), // Array of pricing objects {groupSize, price, currency}
  
  // Policies
  cancellationPolicy: text("cancellationPolicy"),
  paymentPolicy: text("paymentPolicy"),
  importantNotes: text("importantNotes"),
  
  // FAQs
  faqs: json("faqs"), // Array of {question, answer}
  
  // Transportation
  transportation: json("transportation"), // Object with airport and railway details
  
  // Heading Hierarchy for SEO
  headingH1: varchar("headingH1", { length: 200 }), // Main H1 heading
  headingH2: varchar("headingH2", { length: 200 }), // Secondary H2 heading
  headingH3: varchar("headingH3", { length: 200 }), // Tertiary H3 heading
  
  // Hotels in Puri
  hotelsPuri: json("hotelsPuri"), // Array of hotel objects
  
  // Hotels in Bhuvaneshwar
  hotelsBhuvaneshwar: json("hotelsBhuvaneshwar"), // Array of hotel objects
  
  // Transport Options
  transportOptions: json("transportOptions"), // Array of transport objects
  
  // Flags
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("tours_slug_idx").on(table.slug),
  countryIdIdx: index("tours_countryId_idx").on(table.countryId),
  stateIdIdx: index("tours_stateId_idx").on(table.stateId),
  locationIdIdx: index("tours_locationId_idx").on(table.locationId),
  categoryIdIdx: index("tours_categoryId_idx").on(table.categoryId),
}));

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

/**
 * Flights/Transportation table
 */
export const flights = mysqlTable("flights", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId"),
  fromLocation: varchar("fromLocation", { length: 100 }),
  toLocation: varchar("toLocation", { length: 100 }),
  airline: varchar("airline", { length: 100 }),
  flightNumber: varchar("flightNumber", { length: 20 }),
  departureTime: varchar("departureTime", { length: 20 }),
  arrivalTime: varchar("arrivalTime", { length: 20 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("INR"),
  duration: varchar("duration", { length: 50 }),
  stops: int("stops").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tourIdIdx: index("flights_tourId_idx").on(table.tourId),
}));

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = typeof flights.$inferInsert;

/**
 * Activities table
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  tourId: int("tourId"),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  duration: varchar("duration", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("INR"),
  image: varchar("image", { length: 500 }),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "challenging"]),
  bestTime: varchar("bestTime", { length: 100 }),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  tourDuration: varchar("tourDuration", { length: 100 }),
  whatIncluded: text("whatIncluded"),
  whatExcluded: text("whatExcluded"),
  itinerary: text("itinerary"), // Day-wise breakdown for H2 section
  locationGuide: text("locationGuide"), // Location-specific info (flights, visa, travel guide)
  pricingDetails: text("pricingDetails"), // Detailed pricing breakdown
  faqContent: text("faqContent"), // FAQ structured data (JSON format)
  authorInfo: text("authorInfo"), // Author/expert credibility info
  reviews: text("reviews"), // Traveler testimonials (JSON format)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdIdx: index("activities_locationId_idx").on(table.locationId),
  tourIdIdx: index("activities_tourId_idx").on(table.tourId),
}));

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Activity Images table - stores multiple images per activity
 */
export const activityImages = mysqlTable("activityImages", {
  id: int("id").autoincrement().primaryKey(),
  activityId: int("activityId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 file key for deletion/management
  alt: varchar("alt", { length: 255 }), // Alt text for SEO
  caption: varchar("caption", { length: 255 }), // Image caption
  order: int("order").default(0), // Display order
  isMain: boolean("isMain").default(false), // Whether this is the main/featured image
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  activityIdIdx: index("activityImages_activityId_idx").on(table.activityId),
}));

export type ActivityImage = typeof activityImages.$inferSelect;
export type InsertActivityImage = typeof activityImages.$inferInsert;

// Helper function to generate slug from name
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Activity Inclusions/Exclusions table - stores detailed inclusions and exclusions
 */
export const activityInclusions = mysqlTable("activityInclusions", {
  id: int("id").autoincrement().primaryKey(),
  activityId: int("activityId").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["include", "exclude"]).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  activityIdIdx: index("activityInclusions_activityId_idx").on(table.activityId),
}));

export type ActivityInclusion = typeof activityInclusions.$inferSelect;
export type InsertActivityInclusion = typeof activityInclusions.$inferInsert;

/**
 * CSV Import History and Logs
 */
export const importLogs = mysqlTable("importLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  importType: mysqlEnum("importType", ["tours", "locations", "flights", "activities", "attractions"]).notNull(),
  totalRecords: int("totalRecords").notNull(),
  successfulRecords: int("successfulRecords").notNull(),
  failedRecords: int("failedRecords").notNull(),
  errors: json("errors"), // Array of error messages
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  userIdIdx: index("importLogs_userId_idx").on(table.userId),
  createdAtIdx: index("importLogs_createdAt_idx").on(table.createdAt),
}));

export type ImportLog = typeof importLogs.$inferSelect;
export type InsertImportLog = typeof importLogs.$inferInsert;

/**
 * SEO Metadata Cache for dynamic pages
 */
export const seoMetadata = mysqlTable("seoMetadata", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["tour", "location", "country", "state", "category"]).notNull(),
  contentId: int("contentId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: varchar("description", { length: 160 }).notNull(),
  keywords: text("keywords"),
  ogImage: varchar("ogImage", { length: 500 }),
  canonicalUrl: varchar("canonicalUrl", { length: 500 }),
  structuredData: json("structuredData"), // JSON-LD data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contentTypeIdIdx: index("seoMetadata_contentType_contentId_idx").on(table.contentType, table.contentId),
}));

export type SeoMetadata = typeof seoMetadata.$inferSelect;
export type InsertSeoMetadata = typeof seoMetadata.$inferInsert;

/**
 * Tour Localizations table for locale-specific content
 */
export const tourLocalizations = mysqlTable("tourLocalizations", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  locale: varchar("locale", { length: 10 }).notNull(), // e.g., "en-IN", "hi-IN", "en-US"
  
  // Localized content
  title: varchar("title", { length: 200 }),
  description: text("description"),
  longDescription: text("longDescription"),
  
  // Localized SEO
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  
  // Localized content sections
  highlights: json("highlights"), // Array of strings
  itinerary: json("itinerary"), // Array of day objects
  inclusions: json("inclusions"), // Array of strings
  exclusions: json("exclusions"), // Array of strings
  bestTime: varchar("bestTime", { length: 100 }),
  cancellationPolicy: text("cancellationPolicy"),
  paymentPolicy: text("paymentPolicy"),
  importantNotes: text("importantNotes"),
  faqs: json("faqs"), // Array of {question, answer}
  
  // Localized headings
  headingH1: varchar("headingH1", { length: 200 }),
  headingH2: varchar("headingH2", { length: 200 }),
  headingH3: varchar("headingH3", { length: 200 }),
  
  // Localized amenities and transport
  amenities: json("amenities"), // Array of amenity strings
  transport: json("transport"), // Array of transport objects
  
  // Status
  isComplete: boolean("isComplete").default(false), // Whether all required fields are translated
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tourIdIdx: index("tourLocalizations_tourId_idx").on(table.tourId),
  localeIdx: index("tourLocalizations_locale_idx").on(table.locale),
  uniqueTourLocale: unique("tourLocalizations_tourId_locale_unique").on(table.tourId, table.locale),
}));

export type TourLocalization = typeof tourLocalizations.$inferSelect;
export type InsertTourLocalization = typeof tourLocalizations.$inferInsert;

/**
 * State Localizations table for locale-specific state content
 */
export const stateLocalizations = mysqlTable("stateLocalizations", {
  id: int("id").autoincrement().primaryKey(),
  stateId: int("stateId").notNull(),
  locale: varchar("locale", { length: 10 }).notNull(),
  
  title: varchar("title", { length: 200 }),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  
  isComplete: boolean("isComplete").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stateIdIdx: index("stateLocalizations_stateId_idx").on(table.stateId),
  localeIdx: index("stateLocalizations_locale_idx").on(table.locale),
  uniqueStateLocale: unique("stateLocalizations_stateId_locale_unique").on(table.stateId, table.locale),
}));

export type StateLocalization = typeof stateLocalizations.$inferSelect;
export type InsertStateLocalization = typeof stateLocalizations.$inferInsert;

/**
 * Category Localizations table for locale-specific category content
 */
export const categoryLocalizations = mysqlTable("categoryLocalizations", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  locale: varchar("locale", { length: 10 }).notNull(),
  
  title: varchar("title", { length: 200 }),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  
  isComplete: boolean("isComplete").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdIdx: index("categoryLocalizations_categoryId_idx").on(table.categoryId),
  localeIdx: index("categoryLocalizations_locale_idx").on(table.locale),
  uniqueCategoryLocale: unique("categoryLocalizations_categoryId_locale_unique").on(table.categoryId, table.locale),
}));

export type CategoryLocalization = typeof categoryLocalizations.$inferSelect;
export type InsertCategoryLocalization = typeof categoryLocalizations.$inferInsert;

/**
 * Attractions table for landmarks and restaurants in cities
 */
export const attractions = mysqlTable("attractions", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["landmark", "restaurant", "museum", "temple", "monument", "park", "cafe", "shopping", "other"]).notNull(),
  description: text("description"),
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  website: varchar("website", { length: 500 }),
  openingHours: varchar("openingHours", { length: 100 }),
  closedOn: varchar("closedOn", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  image: varchar("image", { length: 500 }),
  images: json("images"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: int("reviewCount").default(0),
  entryFee: varchar("entryFee", { length: 100 }),
  estimatedVisitTime: varchar("estimatedVisitTime", { length: 100 }),
  bestTimeToVisit: varchar("bestTimeToVisit", { length: 200 }),
  highlights: json("highlights"),
  metaTitle: varchar("metaTitle", { length: 160 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: text("metaKeywords"),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdIdx: index("attractions_locationId_idx").on(table.locationId),
  typeIdx: index("attractions_type_idx").on(table.type),
  slugIdx: index("attractions_slug_idx").on(table.slug),
  uniqueSlug: unique("attractions_locationId_slug_unique").on(table.locationId, table.slug),
}));

export type Attraction = typeof attractions.$inferSelect;
export type InsertAttraction = typeof attractions.$inferInsert;


/**
 * Import Rollbacks table for tracking rollback operations
 */
export const importRollbacks = mysqlTable("importRollbacks", {
  id: int("id").autoincrement().primaryKey(),
  importLogId: int("importLogId").notNull(),
  userId: int("userId").notNull(),
  entityType: mysqlEnum("entityType", ["attractions", "tours", "locations", "flights", "activities"]).notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  recordId: int("recordId").notNull(),
  previousData: json("previousData"), // Store previous state for updates
  newData: json("newData"), // Store new state that was created/updated
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  importLogIdIdx: index("importRollbacks_importLogId_idx").on(table.importLogId),
  userIdIdx: index("importRollbacks_userId_idx").on(table.userId),
  entityTypeIdx: index("importRollbacks_entityType_idx").on(table.entityType),
  statusIdx: index("importRollbacks_status_idx").on(table.status),
}));

export type ImportRollback = typeof importRollbacks.$inferSelect;
export type InsertImportRollback = typeof importRollbacks.$inferInsert;

/**
 * Rollback Logs table for audit trail
 */
export const rollbackLogs = mysqlTable("rollbackLogs", {
  id: int("id").autoincrement().primaryKey(),
  importLogId: int("importLogId").notNull(),
  userId: int("userId").notNull(),
  totalRollbacks: int("totalRollbacks").notNull(),
  successfulRollbacks: int("successfulRollbacks").notNull(),
  failedRollbacks: int("failedRollbacks").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errors: json("errors"), // Array of rollback errors
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  importLogIdIdx: index("rollbackLogs_importLogId_idx").on(table.importLogId),
  userIdIdx: index("rollbackLogs_userId_idx").on(table.userId),
  statusIdx: index("rollbackLogs_status_idx").on(table.status),
}));

export type RollbackLog = typeof rollbackLogs.$inferSelect;
export type InsertRollbackLog = typeof rollbackLogs.$inferInsert;


/**
 * Attraction Analytics table for tracking views and interactions
 */
export const attractionAnalytics = mysqlTable("attractionAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  attractionId: int("attractionId").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  views: int("views").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default(0),
  totalReviews: int("totalReviews").default(0).notNull(),
  favoriteCount: int("favoriteCount").default(0).notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  bookingCount: int("bookingCount").default(0).notNull(),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  attractionIdIdx: index("attractionAnalytics_attractionId_idx").on(table.attractionId),
  dateIdx: index("attractionAnalytics_date_idx").on(table.date),
  uniqueAttractionDate: unique("attractionAnalytics_attractionId_date_unique").on(table.attractionId, table.date),
}));
export type AttractionAnalytics = typeof attractionAnalytics.$inferSelect;
export type InsertAttractionAnalytics = typeof attractionAnalytics.$inferInsert;


/**
 * Data Validation Logs table for tracking validation results
 */
export const validationLogs = mysqlTable("validationLogs", {
  id: int("id").autoincrement().primaryKey(),
  validationType: mysqlEnum("validationType", ["attractions", "tours", "locations", "all"]).default("all").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  totalRecords: int("totalRecords").default(0).notNull(),
  validRecords: int("validRecords").default(0).notNull(),
  invalidRecords: int("invalidRecords").default(0).notNull(),
  warnings: int("warnings").default(0).notNull(),
  errors: json("errors"), // Array of validation errors
  anomalies: json("anomalies"), // Array of detected anomalies
  suggestedActions: json("suggestedActions"), // Array of suggested actions
  executionTime: int("executionTime"), // in milliseconds
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  validationTypeIdx: index("validationLogs_validationType_idx").on(table.validationType),
  statusIdx: index("validationLogs_status_idx").on(table.status),
  createdAtIdx: index("validationLogs_createdAt_idx").on(table.createdAt),
}));

export type ValidationLog = typeof validationLogs.$inferSelect;
export type InsertValidationLog = typeof validationLogs.$inferInsert;

/**
 * Validation Rules table for configurable validation checks
 */
export const validationRules = mysqlTable("validationRules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ruleType: mysqlEnum("ruleType", ["required_field", "format_check", "range_check", "uniqueness", "referential_integrity", "anomaly_detection"]).notNull(),
  entityType: mysqlEnum("entityType", ["attraction", "tour", "location", "activity"]).notNull(),
  field: varchar("field", { length: 100 }),
  config: json("config"), // Rule-specific configuration
  severity: mysqlEnum("severity", ["info", "warning", "error"]).default("error").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  entityTypeIdx: index("validationRules_entityType_idx").on(table.entityType),
  isActiveIdx: index("validationRules_isActive_idx").on(table.isActive),
}));

export type ValidationRule = typeof validationRules.$inferSelect;
export type InsertValidationRule = typeof validationRules.$inferInsert;

/**
 * Validation Issues table for tracking individual validation failures
 */
export const validationIssues = mysqlTable("validationIssues", {
  id: int("id").autoincrement().primaryKey(),
  validationLogId: int("validationLogId").notNull(),
  ruleId: int("ruleId").notNull(),
  entityType: mysqlEnum("entityType", ["attraction", "tour", "location", "activity"]).notNull(),
  entityId: int("entityId").notNull(),
  field: varchar("field", { length: 100 }),
  currentValue: text("currentValue"),
  expectedValue: text("expectedValue"),
  severity: mysqlEnum("severity", ["info", "warning", "error"]).default("error").notNull(),
  message: text("message").notNull(),
  suggestedFix: text("suggestedFix"),
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  validationLogIdIdx: index("validationIssues_validationLogId_idx").on(table.validationLogId),
  entityIdx: index("validationIssues_entity_idx").on(table.entityType, table.entityId),
  severityIdx: index("validationIssues_severity_idx").on(table.severity),
  isResolvedIdx: index("validationIssues_isResolved_idx").on(table.isResolved),
}));

export type ValidationIssue = typeof validationIssues.$inferSelect;
export type InsertValidationIssue = typeof validationIssues.$inferInsert;


/**
 * Translations table for managing multilingual content
 */
export const translations = mysqlTable("translations", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  language: mysqlEnum("language", ["en", "es", "fr"]).notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "nav", "footer", "home", "admin"
  description: text("description"), // Help text for translators
  lastModifiedBy: int("lastModifiedBy"), // User ID who last modified
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyLanguageIdx: index("translations_key_language_idx").on(table.key, table.language),
  categoryIdx: index("translations_category_idx").on(table.category),
  languageIdx: index("translations_language_idx").on(table.language),
}));

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;


/**
 * Booking Enquiries table for capturing user booking requests
 */
export const bookingEnquiries = mysqlTable("bookingEnquiries", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }),
  numberOfTravelers: int("numberOfTravelers").notNull(),
  preferredStartDate: varchar("preferredStartDate", { length: 50 }),
  preferredEndDate: varchar("preferredEndDate", { length: 50 }),
  specialRequests: text("specialRequests"),
  status: mysqlEnum("status", ["new", "contacted", "booked", "rejected"]).default("new").notNull(),
  notes: text("notes"), // Admin notes
  assignedTo: int("assignedTo"), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  contactedAt: timestamp("contactedAt"),
}, (table) => ({
  tourIdIdx: index("bookingEnquiries_tourId_idx").on(table.tourId),
  emailIdx: index("bookingEnquiries_email_idx").on(table.email),
  statusIdx: index("bookingEnquiries_status_idx").on(table.status),
  createdAtIdx: index("bookingEnquiries_createdAt_idx").on(table.createdAt),
}));

export type BookingEnquiry = typeof bookingEnquiries.$inferSelect;
export type InsertBookingEnquiry = typeof bookingEnquiries.$inferInsert;


/**
 * Assignment history table for tracking enquiry assignments
 */
export const assignmentHistory = mysqlTable("assignmentHistory", {
  id: int("id").autoincrement().primaryKey(),
  enquiryId: int("enquiryId").notNull(),
  assignedFrom: int("assignedFrom"), // Previous assignee (null if unassigned)
  assignedTo: int("assignedTo"), // New assignee
  assignedBy: int("assignedBy").notNull(), // User who made the assignment
  reason: text("reason"), // Reason for assignment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  enquiryIdIdx: index("assignmentHistory_enquiryId_idx").on(table.enquiryId),
  assignedToIdx: index("assignmentHistory_assignedTo_idx").on(table.assignedTo),
  createdAtIdx: index("assignmentHistory_createdAt_idx").on(table.createdAt),
}));

export type AssignmentHistory = typeof assignmentHistory.$inferSelect;
export type InsertAssignmentHistory = typeof assignmentHistory.$inferInsert;


/**
 * Team member expertise table for storing skills and specializations
 */
export const teamMemberExpertise = mysqlTable("teamMemberExpertise", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tourCategoryId: int("tourCategoryId"), // Expertise in specific tour category
  destination: varchar("destination", { length: 100 }), // Expertise in specific destination
  language: varchar("language", { length: 50 }), // Language proficiency (e.g., "en", "es", "fr")
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "expert"]).default("intermediate").notNull(),
  yearsOfExperience: int("yearsOfExperience").default(0).notNull(),
  maxConcurrentEnquiries: int("maxConcurrentEnquiries").default(10).notNull(), // Max workload
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"), // Additional notes about expertise
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("teamMemberExpertise_userId_idx").on(table.userId),
  tourCategoryIdIdx: index("teamMemberExpertise_tourCategoryId_idx").on(table.tourCategoryId),
  destinationIdx: index("teamMemberExpertise_destination_idx").on(table.destination),
  languageIdx: index("teamMemberExpertise_language_idx").on(table.language),
}));

export type TeamMemberExpertise = typeof teamMemberExpertise.$inferSelect;
export type InsertTeamMemberExpertise = typeof teamMemberExpertise.$inferInsert;

/**
 * Routing rules table for configuring automatic enquiry assignment
 */
export const routingRules = mysqlTable("routingRules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priority: int("priority").default(0).notNull(), // Higher priority rules evaluated first
  
  // Matching criteria
  tourCategoryId: int("tourCategoryId"), // Match enquiries for specific tour category
  destinationPattern: varchar("destinationPattern", { length: 100 }), // Regex pattern for destination matching
  requiredLanguage: varchar("requiredLanguage", { length: 50 }), // Required language for assignee
  minExperienceYears: int("minExperienceYears").default(0).notNull(), // Minimum experience required
  
  // Assignment strategy
  assignmentStrategy: mysqlEnum("assignmentStrategy", ["round_robin", "least_loaded", "expertise_match", "random"]).default("least_loaded").notNull(),
  
  // Conditions
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tourCategoryIdIdx: index("routingRules_tourCategoryId_idx").on(table.tourCategoryId),
  priorityIdx: index("routingRules_priority_idx").on(table.priority),
  isActiveIdx: index("routingRules_isActive_idx").on(table.isActive),
}));

export type RoutingRule = typeof routingRules.$inferSelect;
export type InsertRoutingRule = typeof routingRules.$inferInsert;

/**
 * Routing audit table for tracking automatic assignments
 */
export const routingAudit = mysqlTable("routingAudit", {
  id: int("id").autoincrement().primaryKey(),
  enquiryId: int("enquiryId").notNull(),
  routingRuleId: int("routingRuleId"), // Which rule triggered the assignment
  assignedToUserId: int("assignedToUserId").notNull(),
  scoringDetails: json("scoringDetails"), // JSON with scoring breakdown
  matchedCriteria: json("matchedCriteria"), // Which criteria were matched
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  enquiryIdIdx: index("routingAudit_enquiryId_idx").on(table.enquiryId),
  assignedToUserIdIdx: index("routingAudit_assignedToUserId_idx").on(table.assignedToUserId),
  createdAtIdx: index("routingAudit_createdAt_idx").on(table.createdAt),
}));

export type RoutingAudit = typeof routingAudit.$inferSelect;
export type InsertRoutingAudit = typeof routingAudit.$inferInsert;

/**
 * Team member availability table for tracking workload and availability
 */
export const teamMemberAvailability = mysqlTable("teamMemberAvailability", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentEnquiriesCount: int("currentEnquiriesCount").default(0).notNull(), // Current active enquiries
  maxEnquiriesPerDay: int("maxEnquiriesPerDay").default(20).notNull(), // Max assignments per day
  isAvailable: boolean("isAvailable").default(true).notNull(), // Is member available for new assignments
  unavailableUntil: timestamp("unavailableUntil"), // When member becomes available again
  lastAssignmentTime: timestamp("lastAssignmentTime"), // Last time an enquiry was assigned
  averageResponseTime: int("averageResponseTime"), // Average response time in minutes
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }), // Booking conversion percentage
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("teamMemberAvailability_userId_idx").on(table.userId),
  isAvailableIdx: index("teamMemberAvailability_isAvailable_idx").on(table.isAvailable),
}));

export type TeamMemberAvailability = typeof teamMemberAvailability.$inferSelect;
export type InsertTeamMemberAvailability = typeof teamMemberAvailability.$inferInsert;


/**
 * Notifications table for real-time alerts to team members
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Who receives the notification
  type: mysqlEnum("type", [
    "enquiry_assigned",
    "enquiry_updated",
    "enquiry_completed",
    "team_message",
    "system_alert",
  ]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  enquiryId: int("enquiryId"), // Related enquiry if applicable
  actionUrl: varchar("actionUrl", { length: 500 }), // URL for quick action
  actionLabel: varchar("actionLabel", { length: 100 }), // Label for action button
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  metadata: json("metadata"), // Additional data (enquiry details, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_userId_idx").on(table.userId),
  enquiryIdIdx: index("notifications_enquiryId_idx").on(table.enquiryId),
  isReadIdx: index("notifications_isRead_idx").on(table.isRead),
  typeIdx: index("notifications_type_idx").on(table.type),
  createdAtIdx: index("notifications_createdAt_idx").on(table.createdAt),
}));
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification preferences for team members
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enquiryAssignedEmail: boolean("enquiryAssignedEmail").default(true).notNull(),
  enquiryAssignedInApp: boolean("enquiryAssignedInApp").default(true).notNull(),
  enquiryUpdatedEmail: boolean("enquiryUpdatedEmail").default(true).notNull(),
  enquiryUpdatedInApp: boolean("enquiryUpdatedInApp").default(true).notNull(),
  enquiryCompletedEmail: boolean("enquiryCompletedEmail").default(false).notNull(),
  enquiryCompletedInApp: boolean("enquiryCompletedInApp").default(true).notNull(),
  teamMessageEmail: boolean("teamMessageEmail").default(true).notNull(),
  teamMessageInApp: boolean("teamMessageInApp").default(true).notNull(),
  systemAlertEmail: boolean("systemAlertEmail").default(false).notNull(),
  systemAlertInApp: boolean("systemAlertInApp").default(true).notNull(),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }), // HH:MM format (e.g., "18:00")
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }), // HH:MM format (e.g., "09:00")
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("notificationPreferences_userId_idx").on(table.userId),
}));
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

/**
 * Notification actions log for tracking quick-action responses
 */
export const notificationActions = mysqlTable("notificationActions", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", [
    "accept",
    "defer",
    "reassign",
    "mark_read",
    "dismiss",
  ]).notNull(),
  actionData: json("actionData"), // Additional data for the action
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  notificationIdIdx: index("notificationActions_notificationId_idx").on(table.notificationId),
  userIdIdx: index("notificationActions_userId_idx").on(table.userId),
  createdAtIdx: index("notificationActions_createdAt_idx").on(table.createdAt),
}));
export type NotificationAction = typeof notificationActions.$inferSelect;
export type InsertNotificationAction = typeof notificationActions.$inferInsert;

/**
 * Email history for tracking all sent test emails
 */
export const emailHistory = mysqlTable("emailHistory", {
  id: int("id").autoincrement().primaryKey(),
  templateType: mysqlEnum("templateType", [
    "enquiry_assigned",
    "enquiry_updated",
    "enquiry_completed",
    "team_message",
    "system_alert",
  ]).notNull(),
  scenario: varchar("scenario", { length: 50 }), // e.g., "luxury_tour", "group_tour"
  subject: varchar("subject", { length: 255 }).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  senderUserId: int("senderUserId").notNull(), // User who sent the test email
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("sent").notNull(),
  errorMessage: text("errorMessage"), // Error details if status is "failed"
  htmlSize: int("htmlSize"), // Size of HTML content in bytes
  textSize: int("textSize"), // Size of text content in bytes
  templateData: json("templateData"), // The data used to render the email
  metadata: json("metadata"), // Additional metadata (IP, user agent, etc.)
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateTypeIdx: index("emailHistory_templateType_idx").on(table.templateType),
  recipientEmailIdx: index("emailHistory_recipientEmail_idx").on(table.recipientEmail),
  senderUserIdIdx: index("emailHistory_senderUserId_idx").on(table.senderUserId),
  statusIdx: index("emailHistory_status_idx").on(table.status),
  sentAtIdx: index("emailHistory_sentAt_idx").on(table.sentAt),
  createdAtIdx: index("emailHistory_createdAt_idx").on(table.createdAt),
}));
export type EmailHistory = typeof emailHistory.$inferSelect;
export type InsertEmailHistory = typeof emailHistory.$inferInsert;

/**
 * Email delivery tracking for monitoring email performance
 */
export const emailDeliveryTracking = mysqlTable("emailDeliveryTracking", {
  id: int("id").autoincrement().primaryKey(),
  emailHistoryId: int("emailHistoryId").notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", [
    "queued",
    "sent",
    "delivered",
    "bounced",
    "complained",
    "suppressed",
  ]).default("sent").notNull(),
  bounceType: mysqlEnum("bounceType", ["permanent", "temporary", "undetermined"]),
  bounceSubType: varchar("bounceSubType", { length: 50 }),
  complaintType: varchar("complaintType", { length: 50 }), // e.g., "abuse", "auth-failure", "fraud", "not-spam", "other", "virus"
  opens: int("opens").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  lastOpenedAt: timestamp("lastOpenedAt"),
  lastClickedAt: timestamp("lastClickedAt"),
  firstOpenedAt: timestamp("firstOpenedAt"),
  firstClickedAt: timestamp("firstClickedAt"),
  trackingData: json("trackingData"), // Raw tracking data from email service
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailHistoryIdIdx: index("emailDeliveryTracking_emailHistoryId_idx").on(table.emailHistoryId),
  deliveryStatusIdx: index("emailDeliveryTracking_deliveryStatus_idx").on(table.deliveryStatus),
  createdAtIdx: index("emailDeliveryTracking_createdAt_idx").on(table.createdAt),
}));
export type EmailDeliveryTracking = typeof emailDeliveryTracking.$inferSelect;
export type InsertEmailDeliveryTracking = typeof emailDeliveryTracking.$inferInsert;

/**
 * Email statistics for analytics and reporting
 */
export const emailStatistics = mysqlTable("emailStatistics", {
  id: int("id").autoincrement().primaryKey(),
  templateType: mysqlEnum("templateType", [
    "enquiry_assigned",
    "enquiry_updated",
    "enquiry_completed",
    "team_message",
    "system_alert",
  ]).notNull(),
  totalSent: int("totalSent").default(0).notNull(),
  totalDelivered: int("totalDelivered").default(0).notNull(),
  totalBounced: int("totalBounced").default(0).notNull(),
  totalOpened: int("totalOpened").default(0).notNull(),
  totalClicked: int("totalClicked").default(0).notNull(),
  totalComplained: int("totalComplained").default(0).notNull(),
  openRate: decimal("openRate", { precision: 5, scale: 2 }).default(0), // Percentage
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }).default(0), // Percentage
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }).default(0), // Percentage
  complaintRate: decimal("complaintRate", { precision: 5, scale: 2 }).default(0), // Percentage
  averageOpenTime: int("averageOpenTime"), // In seconds
  averageClickTime: int("averageClickTime"), // In seconds
  lastCalculatedAt: timestamp("lastCalculatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  templateTypeIdx: index("emailStatistics_templateType_idx").on(table.templateType),
  updatedAtIdx: index("emailStatistics_updatedAt_idx").on(table.updatedAt),
}));
export type EmailStatistics = typeof emailStatistics.$inferSelect;
export type InsertEmailStatistics = typeof emailStatistics.$inferInsert;


// Scheduled Analytics Reports
export const reportSchedules = mysqlTable("reportSchedules", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Weekly Performance Report"
  description: text("description"),
  
  // Schedule configuration
  frequency: varchar("frequency", { length: 50 }).notNull(), // daily, weekly, monthly, custom
  dayOfWeek: int("dayOfWeek"), // 0-6 for weekly (0=Sunday)
  dayOfMonth: int("dayOfMonth"), // 1-31 for monthly
  time: varchar("time", { length: 10 }).notNull(), // HH:mm format
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  
  // Report configuration
  reportType: varchar("reportType", { length: 50 }).notNull(), // full, summary, metrics, events, providers, errors
  dateRangeType: varchar("dateRangeType", { length: 50 }).notNull(), // last7days, last30days, last90days, custom
  customDaysBack: int("customDaysBack"), // For custom date ranges
  
  // Recipients
  recipients: json("recipients").$type<string[]>().notNull(), // JSON array of email addresses
  includeAttachment: boolean("includeAttachment").default(true),
  attachmentFormat: varchar("attachmentFormat", { length: 20 }).default("csv").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("reportSchedules_userId_idx").on(table.userId),
  frequencyIdx: index("reportSchedules_frequency_idx").on(table.frequency),
  nextRunAtIdx: index("reportSchedules_nextRunAt_idx").on(table.nextRunAt),
}));

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = typeof reportSchedules.$inferInsert;

// Report Delivery History
export const reportDeliveries = mysqlTable("reportDeliveries", {
  id: varchar("id", { length: 32 }).primaryKey(),
  scheduleId: varchar("scheduleId", { length: 32 }).notNull().references(() => reportSchedules.id, { onDelete: "cascade" }),
  
  // Delivery details
  recipients: json("recipients").$type<string[]>().notNull(), // JSON array of recipients
  subject: text("subject").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // pending, sent, failed, bounced
  
  // Report data
  reportData: json("reportData"), // JSON serialized report
  attachmentUrl: text("attachmentUrl"), // S3 URL if attachment generated
  attachmentFormat: varchar("attachmentFormat", { length: 20 }),
  
  // Error tracking
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0),
  lastRetryAt: timestamp("lastRetryAt"),
  
  // Metadata
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  scheduleIdIdx: index("reportDeliveries_scheduleId_idx").on(table.scheduleId),
  statusIdx: index("reportDeliveries_status_idx").on(table.status),
  createdAtIdx: index("reportDeliveries_createdAt_idx").on(table.createdAt),
}));

export type ReportDelivery = typeof reportDeliveries.$inferSelect;
export type InsertReportDelivery = typeof reportDeliveries.$inferInsert;


/**
 * Job Execution Logs table
 * Tracks all job executions with performance metrics and error diagnostics
 */
export const jobExecutionLogs = mysqlTable("jobExecutionLogs", {
  id: varchar("id", { length: 32 }).primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  queueName: varchar("queueName", { length: 50 }).notNull(), // report-generation, email-delivery, schedule-executor
  jobType: varchar("jobType", { length: 50 }).notNull(),
  
  // Execution details
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "retried"]).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Performance metrics
  duration: int("duration"), // milliseconds
  processingTime: int("processingTime"), // milliseconds
  queueWaitTime: int("queueWaitTime"), // milliseconds
  
  // Job data
  jobData: json("jobData"), // Input data
  result: json("result"), // Output result
  
  // Error tracking
  errorMessage: text("errorMessage"),
  errorStack: text("errorStack"),
  errorCode: varchar("errorCode", { length: 50 }),
  
  // Retry information
  attemptNumber: int("attemptNumber").default(1),
  maxAttempts: int("maxAttempts").default(3),
  nextRetryAt: timestamp("nextRetryAt"),
  
  // Resource usage
  memoryUsed: int("memoryUsed"), // MB
  cpuUsed: decimal("cpuUsed", { precision: 5, scale: 2 }), // percentage
  
  // Metadata
  userId: int("userId").references(() => users.id),
  scheduleId: varchar("scheduleId", { length: 32 }),
  deliveryId: varchar("deliveryId", { length: 32 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  jobIdIdx: index("jobExecutionLogs_jobId_idx").on(table.jobId),
  queueNameIdx: index("jobExecutionLogs_queueName_idx").on(table.queueName),
  statusIdx: index("jobExecutionLogs_status_idx").on(table.status),
  createdAtIdx: index("jobExecutionLogs_createdAt_idx").on(table.createdAt),
  scheduleIdIdx: index("jobExecutionLogs_scheduleId_idx").on(table.scheduleId),
  deliveryIdIdx: index("jobExecutionLogs_deliveryId_idx").on(table.deliveryId),
}));
export type JobExecutionLog = typeof jobExecutionLogs.$inferSelect;
export type InsertJobExecutionLog = typeof jobExecutionLogs.$inferInsert;

/**
 * Job Performance Metrics table
 * Aggregated performance data for analytics
 */
export const jobPerformanceMetrics = mysqlTable("jobPerformanceMetrics", {
  id: varchar("id", { length: 32 }).primaryKey(),
  queueName: varchar("queueName", { length: 50 }).notNull(),
  jobType: varchar("jobType", { length: 50 }).notNull(),
  
  // Time period
  date: timestamp("date").notNull(),
  hour: int("hour"),
  
  // Aggregated metrics
  totalJobs: int("totalJobs").default(0),
  successfulJobs: int("successfulJobs").default(0),
  failedJobs: int("failedJobs").default(0),
  retriedJobs: int("retriedJobs").default(0),
  
  // Performance stats
  averageDuration: decimal("averageDuration", { precision: 10, scale: 2 }), // milliseconds
  minDuration: int("minDuration"),
  maxDuration: int("maxDuration"),
  
  averageProcessingTime: decimal("averageProcessingTime", { precision: 10, scale: 2 }),
  averageQueueWaitTime: decimal("averageQueueWaitTime", { precision: 10, scale: 2 }),
  
  // Success rate
  successRate: decimal("successRate", { precision: 5, scale: 2 }), // percentage
  failureRate: decimal("failureRate", { precision: 5, scale: 2 }), // percentage
  
  // Resource usage
  averageMemoryUsed: decimal("averageMemoryUsed", { precision: 10, scale: 2 }), // MB
  averageCpuUsed: decimal("averageCpuUsed", { precision: 5, scale: 2 }), // percentage
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  queueNameIdx: index("jobPerformanceMetrics_queueName_idx").on(table.queueName),
  dateIdx: index("jobPerformanceMetrics_date_idx").on(table.date),
  hourIdx: index("jobPerformanceMetrics_hour_idx").on(table.hour),
}));
export type JobPerformanceMetric = typeof jobPerformanceMetrics.$inferSelect;
export type InsertJobPerformanceMetric = typeof jobPerformanceMetrics.$inferInsert;

/**
 * Job Error Diagnostics table
 * Detailed error tracking for troubleshooting
 */
export const jobErrorDiagnostics = mysqlTable("jobErrorDiagnostics", {
  id: varchar("id", { length: 32 }).primaryKey(),
  jobLogId: varchar("jobLogId", { length: 32 }).notNull().references(() => jobExecutionLogs.id, { onDelete: "cascade" }),
  
  // Error details
  errorCode: varchar("errorCode", { length: 50 }).notNull(),
  errorMessage: text("errorMessage").notNull(),
  errorStack: text("errorStack"),
  
  // Context information
  context: json("context"), // Additional context data
  
  // Resolution tracking
  isResolved: boolean("isResolved").default(false),
  resolutionNotes: text("resolutionNotes"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy").references(() => users.id),
  
  // Severity
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  jobLogIdIdx: index("jobErrorDiagnostics_jobLogId_idx").on(table.jobLogId),
  errorCodeIdx: index("jobErrorDiagnostics_errorCode_idx").on(table.errorCode),
  severityIdx: index("jobErrorDiagnostics_severity_idx").on(table.severity),
  createdAtIdx: index("jobErrorDiagnostics_createdAt_idx").on(table.createdAt),
}));
export type JobErrorDiagnostic = typeof jobErrorDiagnostics.$inferSelect;
export type InsertJobErrorDiagnostic = typeof jobErrorDiagnostics.$inferInsert;


/**
 * Email Event Tracking table
 * Stores individual email engagement events (opens, clicks, bounces, complaints)
 */
export const emailEventTracking = mysqlTable("emailEventTracking", {
  id: int("id").autoincrement().primaryKey(),
  emailHistoryId: int("emailHistoryId").notNull(),
  emailDeliveryTrackingId: int("emailDeliveryTrackingId"),
  
  // Event type
  eventType: mysqlEnum("eventType", [
    "open",
    "click",
    "bounce",
    "complaint",
    "delivery",
    "deferred",
    "dropped",
    "processed",
    "sent",
  ]).notNull(),
  
  // Event details
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  userAgent: text("userAgent"), // Browser/client info for opens/clicks
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  
  // Click-specific fields
  linkUrl: text("linkUrl"), // URL that was clicked
  linkText: varchar("linkText", { length: 255 }), // Link text or label
  
  // Bounce/Complaint-specific fields
  bounceType: mysqlEnum("bounceType", ["permanent", "temporary", "undetermined"]),
  bounceSubType: varchar("bounceSubType", { length: 50 }),
  complaintType: varchar("complaintType", { length: 50 }),
  complaintFeedbackType: varchar("complaintFeedbackType", { length: 50 }),
  
  // Raw event data from provider
  rawEventData: json("rawEventData"),
  
  // Timestamps
  eventTimestamp: timestamp("eventTimestamp").notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  emailHistoryIdIdx: index("emailEventTracking_emailHistoryId_idx").on(table.emailHistoryId),
  emailDeliveryTrackingIdIdx: index("emailEventTracking_emailDeliveryTrackingId_idx").on(table.emailDeliveryTrackingId),
  eventTypeIdx: index("emailEventTracking_eventType_idx").on(table.eventType),
  recipientEmailIdx: index("emailEventTracking_recipientEmail_idx").on(table.recipientEmail),
  eventTimestampIdx: index("emailEventTracking_eventTimestamp_idx").on(table.eventTimestamp),
  createdAtIdx: index("emailEventTracking_createdAt_idx").on(table.createdAt),
}));

export type EmailEventTracking = typeof emailEventTracking.$inferSelect;
export type InsertEmailEventTracking = typeof emailEventTracking.$inferInsert;

/**
 * Email Engagement Metrics table
 * Stores aggregated engagement metrics per email
 */
export const emailEngagementMetrics = mysqlTable("emailEngagementMetrics", {
  id: int("id").autoincrement().primaryKey(),
  emailHistoryId: int("emailHistoryId").notNull().unique(),
  emailDeliveryTrackingId: int("emailDeliveryTrackingId"),
  
  // Engagement counts
  openCount: int("openCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  uniqueOpenCount: int("uniqueOpenCount").default(0).notNull(),
  uniqueClickCount: int("uniqueClickCount").default(0).notNull(),
  
  // Engagement rates (as percentages, 0-100)
  openRate: decimal("openRate", { precision: 5, scale: 2 }).default(0),
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }).default(0),
  clickThroughRate: decimal("clickThroughRate", { precision: 5, scale: 2 }).default(0),
  
  // Bounce and complaint
  bounceCount: int("bounceCount").default(0).notNull(),
  complaintCount: int("complaintCount").default(0).notNull(),
  
  // Time-based metrics
  firstOpenedAt: timestamp("firstOpenedAt"),
  lastOpenedAt: timestamp("lastOpenedAt"),
  firstClickedAt: timestamp("firstClickedAt"),
  lastClickedAt: timestamp("lastClickedAt"),
  
  // Engagement score (0-100)
  engagementScore: decimal("engagementScore", { precision: 5, scale: 2 }).default(0),
  
  // Links clicked (JSON array of URLs)
  linksClicked: json("linksClicked").$type<Array<{ url: string; count: number; timestamp: string }>>(),
  
  // Metadata
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  emailHistoryIdIdx: index("emailEngagementMetrics_emailHistoryId_idx").on(table.emailHistoryId),
  emailDeliveryTrackingIdIdx: index("emailEngagementMetrics_emailDeliveryTrackingId_idx").on(table.emailDeliveryTrackingId),
  engagementScoreIdx: index("emailEngagementMetrics_engagementScore_idx").on(table.engagementScore),
  lastUpdatedAtIdx: index("emailEngagementMetrics_lastUpdatedAt_idx").on(table.lastUpdatedAt),
}));

export type EmailEngagementMetrics = typeof emailEngagementMetrics.$inferSelect;
export type InsertEmailEngagementMetrics = typeof emailEngagementMetrics.$inferInsert;

/**
 * Email Engagement Trends table
 * Stores historical engagement data for trend analysis
 */
export const emailEngagementTrends = mysqlTable("emailEngagementTrends", {
  id: int("id").autoincrement().primaryKey(),
  scheduleId: varchar("scheduleId", { length: 32 }),
  
  // Time period
  periodDate: date("periodDate").notNull(),
  periodType: mysqlEnum("periodType", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  
  // Aggregated metrics
  totalEmailsSent: int("totalEmailsSent").default(0).notNull(),
  totalOpens: int("totalOpens").default(0).notNull(),
  totalClicks: int("totalClicks").default(0).notNull(),
  totalBounces: int("totalBounces").default(0).notNull(),
  totalComplaints: int("totalComplaints").default(0).notNull(),
  
  // Rates
  averageOpenRate: decimal("averageOpenRate", { precision: 5, scale: 2 }).default(0),
  averageClickRate: decimal("averageClickRate", { precision: 5, scale: 2 }).default(0),
  averageBounceRate: decimal("averageBounceRate", { precision: 5, scale: 2 }).default(0),
  
  // Engagement score
  averageEngagementScore: decimal("averageEngagementScore", { precision: 5, scale: 2 }).default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  scheduleIdIdx: index("emailEngagementTrends_scheduleId_idx").on(table.scheduleId),
  periodDateIdx: index("emailEngagementTrends_periodDate_idx").on(table.periodDate),
  periodTypeIdx: index("emailEngagementTrends_periodType_idx").on(table.periodType),
}));

export type EmailEngagementTrend = typeof emailEngagementTrends.$inferSelect;
export type InsertEmailEngagementTrend = typeof emailEngagementTrends.$inferInsert;


/**
 * Admin Audit Log table for tracking all admin actions
 */
export const adminAuditLogs = mysqlTable("adminAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 100 }).notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  action: mysqlEnum("action", ["create", "update", "delete", "view", "export", "import", "login", "logout"]).notNull(),
  entityType: mysqlEnum("entityType", ["tour", "location", "state", "country", "category", "activity", "attraction", "user", "system"]).notNull(),
  entityId: int("entityId"),
  entityName: varchar("entityName", { length: 255 }),
  description: text("description"),
  previousData: json("previousData"), // Store previous state for updates
  newData: json("newData"), // Store new state for creates/updates
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("adminAuditLogs_userId_idx").on(table.userId),
  actionIdx: index("adminAuditLogs_action_idx").on(table.action),
  entityTypeIdx: index("adminAuditLogs_entityType_idx").on(table.entityType),
  createdAtIdx: index("adminAuditLogs_createdAt_idx").on(table.createdAt),
}));

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;

/**
 * Webhook Endpoints table for storing webhook configurations
 */
export const webhookEndpoints = mysqlTable("webhookEndpoints", {
  id: varchar("id", { length: 64 }).primaryKey().notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isPaused: boolean("isPaused").default(false).notNull(),
  events: json("events").notNull(), // Array of events like ['bulk_delete', 'permission_change']
  headers: json("headers"), // Custom headers to send with webhook
  retryCount: int("retryCount").default(3).notNull(),
  timeout: int("timeout").default(30000).notNull(), // Timeout in milliseconds
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  lastSuccessAt: timestamp("lastSuccessAt"),
  lastErrorAt: timestamp("lastErrorAt"),
  lastErrorMessage: text("lastErrorMessage"),
  failureCount: int("failureCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  isActiveIdx: index("webhookEndpoints_isActive_idx").on(table.isActive),
  isPausedIdx: index("webhookEndpoints_isPaused_idx").on(table.isPaused),
  createdAtIdx: index("webhookEndpoints_createdAt_idx").on(table.createdAt),
}));

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = typeof webhookEndpoints.$inferInsert;

/**
 * Webhook Logs table for tracking webhook delivery attempts
 */
export const webhookLogs = mysqlTable(
  "webhookLogs",
  {
  id: int("id").autoincrement().primaryKey(),
  webhookEndpointId: varchar("webhookEndpointId", { length: 64 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed", "retrying"]).default("pending").notNull(),
  statusCode: int("statusCode"),
  errorMessage: text("errorMessage"),
  payload: json("payload").notNull(),
  response: json("response"),
  attemptCount: int("attemptCount").default(1).notNull(),
  nextRetryAt: timestamp("nextRetryAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  webhookEndpointIdIdx: index("webhookLogs_webhookEndpointId_idx").on(table.webhookEndpointId),
  statusIdx: index("webhookLogs_status_idx").on(table.status),
  createdAtIdx: index("webhookLogs_createdAt_idx").on(table.createdAt),
})
);

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

/**
 * Webhook Audit Log table for tracking all webhook endpoint changes
 */
export const webhookAuditLog = mysqlTable("webhookAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  webhookEndpointId: varchar("webhookEndpointId", { length: 64 }).notNull(),
  action: mysqlEnum("action", [
    "create",
    "update",
    "delete",
    "activate",
    "deactivate",
    "pause",
    "resume",
    "test",
  ]).notNull(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }),
  previousState: json("previousState"), // Previous endpoint state before change
  newState: json("newState"), // New endpoint state after change
  reason: text("reason"), // Optional reason for the action (e.g., "Paused due to high failure rate")
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  details: json("details"), // Additional metadata about the action
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  webhookEndpointIdIdx: index("webhookAuditLog_webhookEndpointId_idx").on(table.webhookEndpointId),
  actionIdx: index("webhookAuditLog_action_idx").on(table.action),
  userIdIdx: index("webhookAuditLog_userId_idx").on(table.userId),
  createdAtIdx: index("webhookAuditLog_createdAt_idx").on(table.createdAt),
}));

export type WebhookAuditLog = typeof webhookAuditLog.$inferSelect;
export type InsertWebhookAuditLog = typeof webhookAuditLog.$inferInsert;

/**
 * Encryption Key Rotation table for tracking key lifecycle
 */
export const encryptionKeyRotation = mysqlTable("encryptionKeyRotation", {
  id: int("id").autoincrement().primaryKey(),
  keyId: varchar("keyId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "rotating", "retired", "archived"]).default("active").notNull(),
  algorithm: varchar("algorithm", { length: 32 }).default("aes-256-gcm").notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull(), // SHA-256 hash of key for verification
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  activatedAt: timestamp("activatedAt"),
  retiredAt: timestamp("retiredAt"), // When key was retired (90 days after activation)
  archivedAt: timestamp("archivedAt"), // When key was archived (1 year after retirement)
  metadata: json("metadata"), // Additional key metadata
  createdBy: int("createdBy"), // User ID who initiated rotation
}, (table) => ({
  statusIdx: index("encryptionKeyRotation_status_idx").on(table.status),
  createdAtIdx: index("encryptionKeyRotation_createdAt_idx").on(table.createdAt),
}));
export type EncryptionKeyRotation = typeof encryptionKeyRotation.$inferSelect;
export type InsertEncryptionKeyRotation = typeof encryptionKeyRotation.$inferInsert;

/**
 * Audit Log Re-encryption Job table for tracking re-encryption progress
 */
export const auditLogReencryptionJob = mysqlTable("auditLogReencryptionJob", {
  id: int("id").autoincrement().primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed", "paused"]).default("pending").notNull(),
  oldKeyId: varchar("oldKeyId", { length: 64 }).notNull(),
  newKeyId: varchar("newKeyId", { length: 64 }).notNull(),
  totalRecords: int("totalRecords").default(0).notNull(),
  processedRecords: int("processedRecords").default(0).notNull(),
  failedRecords: int("failedRecords").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("auditLogReencryptionJob_status_idx").on(table.status),
  oldKeyIdIdx: index("auditLogReencryptionJob_oldKeyId_idx").on(table.oldKeyId),
  newKeyIdIdx: index("auditLogReencryptionJob_newKeyId_idx").on(table.newKeyId),
  createdAtIdx: index("auditLogReencryptionJob_createdAt_idx").on(table.createdAt),
}));
export type AuditLogReencryptionJob = typeof auditLogReencryptionJob.$inferSelect;
export type InsertAuditLogReencryptionJob = typeof auditLogReencryptionJob.$inferInsert;

/**
 * Encrypted Audit Log Storage table for storing encrypted audit logs
 */
export const encryptedAuditLogStorage = mysqlTable("encryptedAuditLogStorage", {
  id: int("id").autoincrement().primaryKey(),
  auditLogId: int("auditLogId").notNull(),
  keyId: varchar("keyId", { length: 64 }).notNull(),
  encryptedData: text("encryptedData").notNull(), // JSON string containing encrypted audit log
  iv: varchar("iv", { length: 32 }).notNull(),
  authTag: varchar("authTag", { length: 32 }).notNull(),
  salt: varchar("salt", { length: 64 }).notNull(),
  algorithm: varchar("algorithm", { length: 32 }).default("aes-256-gcm").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  auditLogIdIdx: index("encryptedAuditLogStorage_auditLogId_idx").on(table.auditLogId),
  keyIdIdx: index("encryptedAuditLogStorage_keyId_idx").on(table.keyId),
  createdAtIdx: index("encryptedAuditLogStorage_createdAt_idx").on(table.createdAt),
}));
export type EncryptedAuditLogStorage = typeof encryptedAuditLogStorage.$inferSelect;
export type InsertEncryptedAuditLogStorage = typeof encryptedAuditLogStorage.$inferInsert;

/**
 * Key Rotation Event Log for compliance and audit trail
 */
export const keyRotationEventLog = mysqlTable("keyRotationEventLog", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "key_generated",
    "key_activated",
    "key_retired",
    "key_archived",
    "rotation_started",
    "rotation_completed",
    "rotation_failed",
    "manual_rotation_initiated",
  ]).notNull(),
  keyId: varchar("keyId", { length: 64 }),
  jobId: varchar("jobId", { length: 64 }),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("keyRotationEventLog_eventType_idx").on(table.eventType),
  keyIdIdx: index("keyRotationEventLog_keyId_idx").on(table.keyId),
  jobIdIdx: index("keyRotationEventLog_jobId_idx").on(table.jobId),
  createdAtIdx: index("keyRotationEventLog_createdAt_idx").on(table.createdAt),
}));
export type KeyRotationEventLog = typeof keyRotationEventLog.$inferSelect;
export type InsertKeyRotationEventLog = typeof keyRotationEventLog.$inferInsert;


/**
 * Scheduler Alert Configuration
 * Stores configurable alert thresholds for scheduler monitoring
 */
export const schedulerAlertConfig = mysqlTable("schedulerAlertConfig", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", [
    "check_failure",
    "check_stall",
    "consecutive_errors",
    "rotation_failure",
    "job_stall",
  ]).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  threshold: int("threshold").notNull(), // Number of failures/hours for stall
  notifyAdmins: boolean("notifyAdmins").default(true).notNull(),
  notifyEmail: varchar("notifyEmail", { length: 255 }),
  cooldownMinutes: int("cooldownMinutes").default(60).notNull(), // Prevent alert spam
  lastAlertTime: timestamp("lastAlertTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  alertTypeIdx: index("schedulerAlertConfig_alertType_idx").on(table.alertType),
  enabledIdx: index("schedulerAlertConfig_enabled_idx").on(table.enabled),
}));

export type SchedulerAlertConfig = typeof schedulerAlertConfig.$inferSelect;
export type InsertSchedulerAlertConfig = typeof schedulerAlertConfig.$inferInsert;

/**
 * Scheduler Alert History
 * Tracks all alerts that have been triggered
 */
export const schedulerAlertHistory = mysqlTable("schedulerAlertHistory", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", [
    "check_failure",
    "check_stall",
    "consecutive_errors",
    "rotation_failure",
    "job_stall",
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  message: text("message").notNull(),
  details: json("details"),
  notified: boolean("notified").default(false).notNull(),
  notificationTime: timestamp("notificationTime"),
  acknowledged: boolean("acknowledged").default(false).notNull(),
  acknowledgedBy: int("acknowledgedBy"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  alertTypeIdx: index("schedulerAlertHistory_alertType_idx").on(table.alertType),
  severityIdx: index("schedulerAlertHistory_severity_idx").on(table.severity),
  notifiedIdx: index("schedulerAlertHistory_notified_idx").on(table.notified),
  acknowledgedIdx: index("schedulerAlertHistory_acknowledged_idx").on(table.acknowledged),
  createdAtIdx: index("schedulerAlertHistory_createdAt_idx").on(table.createdAt),
}));

export type SchedulerAlertHistory = typeof schedulerAlertHistory.$inferSelect;
export type InsertSchedulerAlertHistory = typeof schedulerAlertHistory.$inferInsert;


/**
 * Email Delivery Logs - Track all email delivery attempts
 */
export const emailDeliveryLogs = mysqlTable("emailDeliveryLogs", {
  id: int("id").primaryKey().autoincrement(),
  alertId: int("alertId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 255 }).notNull(),
  messageId: varchar("messageId", { length: 255 }),
  subject: text("subject").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced", "complained"]).default("pending").notNull(),
  statusCode: int("statusCode"),
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  maxRetries: int("maxRetries").default(3).notNull(),
  nextRetryAt: timestamp("nextRetryAt"),
  sentAt: timestamp("sentAt"),
  bouncedAt: timestamp("bouncedAt"),
  bounceType: mysqlEnum("bounceType", ["permanent", "temporary", "complaint"]),
  bounceSubType: varchar("bounceSubType", { length: 100 }),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  alertIdIdx: index("emailDeliveryLogs_alertId_idx").on(table.alertId),
  statusIdx: index("emailDeliveryLogs_status_idx").on(table.status),
  recipientIdx: index("emailDeliveryLogs_recipientEmail_idx").on(table.recipientEmail),
  createdAtIdx: index("emailDeliveryLogs_createdAt_idx").on(table.createdAt),
}));

export type EmailDeliveryLog = typeof emailDeliveryLogs.$inferSelect;
export type InsertEmailDeliveryLog = typeof emailDeliveryLogs.$inferInsert;

/**
 * Email Delivery Statistics - Aggregated delivery metrics
 */
export const emailDeliveryStats = mysqlTable("emailDeliveryStats", {
  id: int("id").primaryKey().autoincrement(),
  date: date("date").notNull(),
  totalSent: int("totalSent").default(0).notNull(),
  totalFailed: int("totalFailed").default(0).notNull(),
  totalBounced: int("totalBounced").default(0).notNull(),
  totalComplaints: int("totalComplaints").default(0).notNull(),
  totalOpened: int("totalOpened").default(0).notNull(),
  totalClicked: int("totalClicked").default(0).notNull(),
  deliveryRate: decimal("deliveryRate", { precision: 5, scale: 2 }).default("0"),
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }).default("0"),
  complaintRate: decimal("complaintRate", { precision: 5, scale: 2 }).default("0"),
  openRate: decimal("openRate", { precision: 5, scale: 2 }).default("0"),
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("emailDeliveryStats_date_idx").on(table.date),
}));

export type EmailDeliveryStats = typeof emailDeliveryStats.$inferSelect;
export type InsertEmailDeliveryStats = typeof emailDeliveryStats.$inferInsert;

/**
 * Email Bounce List - Track bounced email addresses
 */
export const emailBounceList = mysqlTable("emailBounceList", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  bounceType: mysqlEnum("bounceType", ["permanent", "temporary", "complaint"]).notNull(),
  bounceSubType: varchar("bounceSubType", { length: 100 }),
  bounceReason: text("bounceReason"),
  bounceCount: int("bounceCount").default(1).notNull(),
  lastBounceAt: timestamp("lastBounceAt").notNull(),
  suppressed: boolean("suppressed").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  emailIdx: index("emailBounceList_email_idx").on(table.email),
  suppressedIdx: index("emailBounceList_suppressed_idx").on(table.suppressed),
}));

export type EmailBounceList = typeof emailBounceList.$inferSelect;
export type InsertEmailBounceList = typeof emailBounceList.$inferInsert;


/**
 * Tags table for location tagging and categorization
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6"), // Hex color code
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("tags_slug_idx").on(table.slug),
}));

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Junction table for many-to-many relationship between locations and tags
 */
export const locationTags = mysqlTable("locationTags", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  locationIdIdx: index("locationTags_locationId_idx").on(table.locationId),
  tagIdIdx: index("locationTags_tagId_idx").on(table.tagId),
  uniqueLocationTag: unique("locationTags_locationId_tagId_unique").on(table.locationId, table.tagId),
}));

export type LocationTag = typeof locationTags.$inferSelect;
export type InsertLocationTag = typeof locationTags.$inferInsert;


/**
 * Auto-tagging Configuration table for storing admin settings
 */
export const autoTaggingConfigs = mysqlTable("autoTaggingConfigs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  confidenceThreshold: decimal("confidenceThreshold", { precision: 3, scale: 2 }).default(0.75).notNull(), // 0-1 scale
  autoApplyEnabled: boolean("autoApplyEnabled").default(false).notNull(),
  filterByCountry: varchar("filterByCountry", { length: 100 }),
  filterByState: varchar("filterByState", { length: 100 }),
  filterByTags: json("filterByTags"), // Array of tag IDs to filter by
  maxTagsPerLocation: int("maxTagsPerLocation").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("autoTaggingConfigs_userId_idx").on(table.userId),
}));

export type AutoTaggingConfig = typeof autoTaggingConfigs.$inferSelect;
export type InsertAutoTaggingConfig = typeof autoTaggingConfigs.$inferInsert;

/**
 * Auto-tagging History table for audit trail
 */
export const autoTaggingHistory = mysqlTable("autoTaggingHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  operationType: mysqlEnum("operationType", ["preview", "execute", "undo"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  totalLocations: int("totalLocations").default(0).notNull(),
  processedLocations: int("processedLocations").default(0).notNull(),
  tagsApplied: int("tagsApplied").default(0).notNull(),
  tagsRemoved: int("tagsRemoved").default(0).notNull(),
  confidenceThreshold: decimal("confidenceThreshold", { precision: 3, scale: 2 }).notNull(),
  affectedLocationIds: json("affectedLocationIds"), // Array of location IDs
  appliedTags: json("appliedTags"), // Array of tag objects with confidence scores
  errors: json("errors"), // Array of error messages
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("autoTaggingHistory_userId_idx").on(table.userId),
  statusIdx: index("autoTaggingHistory_status_idx").on(table.status),
  operationTypeIdx: index("autoTaggingHistory_operationType_idx").on(table.operationType),
  createdAtIdx: index("autoTaggingHistory_createdAt_idx").on(table.createdAt),
}));

export type AutoTaggingHistory = typeof autoTaggingHistory.$inferSelect;
export type InsertAutoTaggingHistory = typeof autoTaggingHistory.$inferInsert;


/**
 * A/B Testing Experiments table
 * Stores experiment configurations and metadata
 */
export const abExperiments = mysqlTable("abExperiments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  experimentType: mysqlEnum("experimentType", ["ranking", "ui", "algorithm"]).notNull(),
  controlVariant: varchar("controlVariant", { length: 100 }).notNull(), // e.g., "old_ranking"
  treatmentVariant: varchar("treatmentVariant", { length: 100 }).notNull(), // e.g., "new_ranking"
  status: mysqlEnum("status", ["draft", "running", "paused", "completed"]).default("draft").notNull(),
  trafficAllocation: int("trafficAllocation").default(50).notNull(), // Percentage for treatment (0-100)
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  minSampleSize: int("minSampleSize").default(1000).notNull(),
  confidenceLevel: decimal("confidenceLevel", { precision: 3, scale: 2 }).default(0.95).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("abExperiments_status_idx").on(table.status),
  experimentTypeIdx: index("abExperiments_experimentType_idx").on(table.experimentType),
  createdByIdx: index("abExperiments_createdBy_idx").on(table.createdBy),
  createdAtIdx: index("abExperiments_createdAt_idx").on(table.createdAt),
}));

export type ABExperiment = typeof abExperiments.$inferSelect;
export type InsertABExperiment = typeof abExperiments.$inferInsert;

/**
 * A/B Testing Assignments table
 * Tracks which variant each user/session is assigned to
 */
export const abAssignments = mysqlTable("abAssignments", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  variant: varchar("variant", { length: 100 }).notNull(), // "control" or "treatment"
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
}, (table) => ({
  experimentIdIdx: index("abAssignments_experimentId_idx").on(table.experimentId),
  userIdIdx: index("abAssignments_userId_idx").on(table.userId),
  sessionIdIdx: index("abAssignments_sessionId_idx").on(table.sessionId),
  variantIdx: index("abAssignments_variant_idx").on(table.variant),
  experimentUserIdx: index("abAssignments_experimentId_userId_idx").on(table.experimentId, table.userId),
}));

export type ABAssignment = typeof abAssignments.$inferSelect;
export type InsertABAssignment = typeof abAssignments.$inferInsert;

/**
 * A/B Testing Events table
 * Tracks user interactions and conversions for each experiment
 */
export const abEvents = mysqlTable("abEvents", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  assignmentId: int("assignmentId").notNull(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  eventType: mysqlEnum("eventType", ["view", "click", "conversion", "engagement"]).notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  locationId: int("locationId"),
  metadata: json("metadata"), // Additional event data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  experimentIdIdx: index("abEvents_experimentId_idx").on(table.experimentId),
  assignmentIdIdx: index("abEvents_assignmentId_idx").on(table.assignmentId),
  userIdIdx: index("abEvents_userId_idx").on(table.userId),
  sessionIdIdx: index("abEvents_sessionId_idx").on(table.sessionId),
  eventTypeIdx: index("abEvents_eventType_idx").on(table.eventType),
  locationIdIdx: index("abEvents_locationId_idx").on(table.locationId),
  timestampIdx: index("abEvents_timestamp_idx").on(table.timestamp),
}));

export type ABEvent = typeof abEvents.$inferSelect;
export type InsertABEvent = typeof abEvents.$inferInsert;

/**
 * A/B Testing Results table
 * Aggregated metrics and statistical analysis results
 */
export const abResults = mysqlTable("abResults", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: int("experimentId").notNull(),
  controlSampleSize: int("controlSampleSize").default(0).notNull(),
  treatmentSampleSize: int("treatmentSampleSize").default(0).notNull(),
  controlConversions: int("controlConversions").default(0).notNull(),
  treatmentConversions: int("treatmentConversions").default(0).notNull(),
  controlConversionRate: decimal("controlConversionRate", { precision: 5, scale: 4 }).default(0).notNull(),
  treatmentConversionRate: decimal("treatmentConversionRate", { precision: 5, scale: 4 }).default(0).notNull(),
  controlClickThroughRate: decimal("controlClickThroughRate", { precision: 5, scale: 4 }).default(0).notNull(),
  treatmentClickThroughRate: decimal("treatmentClickThroughRate", { precision: 5, scale: 4 }).default(0).notNull(),
  controlAvgEngagementScore: decimal("controlAvgEngagementScore", { precision: 5, scale: 2 }).default(0).notNull(),
  treatmentAvgEngagementScore: decimal("treatmentAvgEngagementScore", { precision: 5, scale: 2 }).default(0).notNull(),
  uplift: decimal("uplift", { precision: 6, scale: 2 }), // Percentage improvement
  pValue: decimal("pValue", { precision: 5, scale: 4 }), // Statistical significance
  isStatisticallySignificant: boolean("isStatisticallySignificant").default(false).notNull(),
  confidenceInterval: json("confidenceInterval"), // { lower: number, upper: number }
  winner: mysqlEnum("winner", ["control", "treatment", "inconclusive"]).default("inconclusive").notNull(),
  computedAt: timestamp("computedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  experimentIdIdx: index("abResults_experimentId_idx").on(table.experimentId),
  winnerIdx: index("abResults_winner_idx").on(table.winner),
  computedAtIdx: index("abResults_computedAt_idx").on(table.computedAt),
}));

export type ABResult = typeof abResults.$inferSelect;
export type InsertABResult = typeof abResults.$inferInsert;

/**
 * Feature Flags table
 * Manages feature flags for gradual rollout and A/B testing
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(),
  rolloutPercentage: int("rolloutPercentage").default(0).notNull(), // 0-100
  linkedExperimentId: int("linkedExperimentId"),
  targetUsers: json("targetUsers"), // Array of user IDs or roles
  targetCountries: json("targetCountries"), // Array of country IDs
  targetLocations: json("targetLocations"), // Array of location IDs
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("featureFlags_name_idx").on(table.name),
  enabledIdx: index("featureFlags_enabled_idx").on(table.enabled),
  linkedExperimentIdIdx: index("featureFlags_linkedExperimentId_idx").on(table.linkedExperimentId),
  createdByIdx: index("featureFlags_createdBy_idx").on(table.createdBy),
}));

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;


/**
 * Reviews table for tour ratings and feedback
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  userId: int("userId"),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 255 }).notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  text: text("text"),
  verified: boolean("verified").default(false).notNull(), // Verified purchase
  helpful: int("helpful").default(0).notNull(),
  unhelpful: int("unhelpful").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tourIdIdx: index("reviews_tourId_idx").on(table.tourId),
  userIdIdx: index("reviews_userId_idx").on(table.userId),
  ratingIdx: index("reviews_rating_idx").on(table.rating),
  statusIdx: index("reviews_status_idx").on(table.status),
  createdAtIdx: index("reviews_createdAt_idx").on(table.createdAt),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Bookings table for tour reservations
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  userId: int("userId"),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 255 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 20 }),
  numberOfGuests: int("numberOfGuests").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  specialRequests: text("specialRequests"),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }),
  refundReason: text("refundReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tourIdIdx: index("bookings_tourId_idx").on(table.tourId),
  userIdIdx: index("bookings_userId_idx").on(table.userId),
  statusIdx: index("bookings_status_idx").on(table.status),
  paymentStatusIdx: index("bookings_paymentStatus_idx").on(table.paymentStatus),
  emailIdx: index("bookings_guestEmail_idx").on(table.guestEmail),
  startDateIdx: index("bookings_startDate_idx").on(table.startDate),
  createdAtIdx: index("bookings_createdAt_idx").on(table.createdAt),
  stripePaymentIdIdx: index("bookings_stripePaymentId_idx").on(table.stripePaymentId),
}));

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;


/**
 * Home Page Settings table for managing hero slider and home page images
 */
export const homePageSettings = mysqlTable("homePageSettings", {
  id: int("id").autoincrement().primaryKey(),
  sliderImages: json("sliderImages").$type<Array<{
    id: string;
    image: string;
    alt: string;
    title: string;
  }>>().notNull().default([]),
  // Hero section content
  heroTitle: varchar("heroTitle", { length: 255 }).default("Discover Amazing Tours & Experiences"),
  heroSubtitle: varchar("heroSubtitle", { length: 500 }).default("Explore the best tours, activities, and destinations across the world"),
  // Why Choose section
  whyChooseTitle: varchar("whyChooseTitle", { length: 255 }).default("Pikmeusa.com"),
  whyChooseSubtitle: varchar("whyChooseSubtitle", { length: 255 }).default("Why Choose Pikmeusa.com"),
  whyChooseDescription: text("whyChooseDescription").default("VIP Customised Domestic, International & Spiritual Tours from World Wide"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HomePageSettings = typeof homePageSettings.$inferSelect;
export type InsertHomePageSettings = typeof homePageSettings.$inferInsert;

export const countriesCarousel = mysqlTable("countriesCarousel", {
  id: int("id").autoincrement().primaryKey(),
  countryName: varchar("countryName", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  destinationLink: varchar("destinationLink", { length: 1024 }).notNull(),
  displayOrder: int("displayOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CountriesCarousel = typeof countriesCarousel.$inferSelect;
export type InsertCountriesCarousel = typeof countriesCarousel.$inferInsert;


/**
 * Destination Gallery Settings table
 * Stores the section title and description for the destination gallery
 */
export const destinationGallerySettings = mysqlTable("destinationGallerySettings", {
  id: int("id").autoincrement().primaryKey(),
  sectionTitle: varchar("sectionTitle", { length: 255 }).notNull().default("Destination Gallery"),
  sectionDescription: text("sectionDescription").notNull().default("Explore amazing destinations across India and beyond"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DestinationGallerySettings = typeof destinationGallerySettings.$inferSelect;
export type InsertDestinationGallerySettings = typeof destinationGallerySettings.$inferInsert;

/**
 * Destination Gallery Cards table
 * Stores individual destination cards for the gallery
 */
export const destinationGalleryCards = mysqlTable("destinationGalleryCards", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  destinationLink: varchar("destinationLink", { length: 1024 }).notNull(),
  displayOrder: int("displayOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdIdx: index("destinationGalleryCards_categoryId_idx").on(table.categoryId),
  displayOrderIdx: index("destinationGalleryCards_displayOrder_idx").on(table.displayOrder),
  isActiveIdx: index("destinationGalleryCards_isActive_idx").on(table.isActive),
}));

export type DestinationGalleryCard = typeof destinationGalleryCards.$inferSelect;
export type InsertDestinationGalleryCard = typeof destinationGalleryCards.$inferInsert;


/**
 * Destination Gallery Categories table
 * Stores categories for organizing destination cards (e.g., Spiritual Places, Beach, Adventure)
 */
export const destinationGalleryCategories = mysqlTable("destinationGalleryCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  displayOrderIdx: index("destinationGalleryCategories_displayOrder_idx").on(table.displayOrder),
  isActiveIdx: index("destinationGalleryCategories_isActive_idx").on(table.isActive),
}));

export type DestinationGalleryCategory = typeof destinationGalleryCategories.$inferSelect;
export type InsertDestinationGalleryCategory = typeof destinationGalleryCategories.$inferInsert;


/**
 * Body Image Carousel table
 * Stores images for the "Your Perfect Travel Experience" carousel section
 * Supports up to 3 images with titles, descriptions, and ordering
 */
export const bodyImageCarousel = mysqlTable("bodyImageCarousel", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  displayOrder: int("displayOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  displayOrderIdx: index("bodyImageCarousel_displayOrder_idx").on(table.displayOrder),
  isActiveIdx: index("bodyImageCarousel_isActive_idx").on(table.isActive),
}));

export type BodyImageCarousel = typeof bodyImageCarousel.$inferSelect;
export type InsertBodyImageCarousel = typeof bodyImageCarousel.$inferInsert;


/**
 * Featured Destinations Carousel table
 * Stores featured destinations for the carousel section on homepage
 * Supports multiple destinations with images, titles, descriptions, and ordering
 */
export const featuredDestinations = mysqlTable("featuredDestinations", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  displayOrderIdx: index("featuredDestinations_displayOrder_idx").on(table.displayOrder),
  isActiveIdx: index("featuredDestinations_isActive_idx").on(table.isActive),
}));

export type FeaturedDestination = typeof featuredDestinations.$inferSelect;
export type InsertFeaturedDestination = typeof featuredDestinations.$inferInsert;

/**
 * Review Widgets table
 * Stores review platform data (Google Reviews, TrustPilot, etc.)
 * Allows admins to manage star ratings, review counts, and review links
 */
export const reviewWidgets = mysqlTable("reviewWidgets", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 100 }).notNull().unique(),
  starRating: decimal("starRating", { precision: 3, scale: 1 }).notNull(),
  reviewCount: int("reviewCount").notNull().default(0),
  reviewLink: varchar("reviewLink", { length: 1024 }).notNull(),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  platformIdx: index("reviewWidgets_platform_idx").on(table.platform),
  isActiveIdx: index("reviewWidgets_isActive_idx").on(table.isActive),
}));

export type ReviewWidget = typeof reviewWidgets.$inferSelect;
export type InsertReviewWidget = typeof reviewWidgets.$inferInsert;


/**
 * Destination Gallery table
 * Stores 3 featured destination cards for the lower body section
 * Each card has image URL, title, and description
 */
export const destinationGallery = mysqlTable("destinationGallery", {
  id: int("id").autoincrement().primaryKey(),
  cardNumber: int("cardNumber").notNull().unique(), // 1, 2, or 3
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cardNumberIdx: index("destinationGallery_cardNumber_idx").on(table.cardNumber),
}));

export type DestinationGallery = typeof destinationGallery.$inferSelect;
export type InsertDestinationGallery = typeof destinationGallery.$inferInsert;

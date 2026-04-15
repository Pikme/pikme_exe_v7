import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as tourFilters from "./db-tour-filters";
import * as dbSearch from "./db-search";
import * as dbSearchFullText from "./db-search-fulltext";
import { sitemapRouter } from "./sitemap-router";
import { localizationRouter } from "./routers/localization";
import { localizationImportRouter } from "./routers/localization-import";
import { adminAttractionsRouter } from "./routers/admin-attractions";
import { adminActivitiesRouter } from "./routers/admin-activities";
import { translationsRouter } from "./routers/translations";
import { importHistoryRouter } from "./routers/import-history";
import { rollbackRouter } from "./routers/rollback";
import { analyticsRouter as analyticsRouterFromFile } from "./routers/analytics";
import { authRouter } from "./routers/auth";
import { featureFlagsRouter } from "./routers/feature-flags";
import { featureFlagsAdminRouter } from "./routers/feature-flags-admin";
import { bookingEnquiriesRouter } from "./routers/booking-enquiries";
import { bookingEnquiriesAdminRouter } from "./routers/booking-enquiries-admin";
import { teamAssignmentsRouter } from "./routers/team-assignments";
import { routingRouter } from "./routers/routing";
import { reportSchedulesRouter } from "./routers/report-schedules";
import { jobMonitoringRouter } from "./routers/job-monitoring";
import { schedulesRouter } from "./routers/schedules";
import { destinationsRouter } from "./routers/destinations";
import { dashboardRouter } from "./routers/dashboard";
import { schedulerMonitoringRouter } from "./routers/scheduler-monitoring";
import { adminRouter } from "./routers/admin";
import { schedulerAlertsWidgetRouter } from "./routers/scheduler-alerts-widget";
import { seoRouter } from "./routers/seo";
import { reviewsRouter } from "./routers/reviews";
import { bookingsRouter } from "./routers/bookings";
import { paymentsRouter } from "./routers/payments";
import { logAdminAction } from "./audit-log";
import { homePageSettingsRouter } from "./routers/home-page-settings";
import { countriesCarouselRouter } from "./routers/countries-carousel";
import { destinationGalleryMasonryRouter } from "./routers/destination-gallery-masonry";
import { destinationGalleryAdminRouter } from "./routers/destination-gallery-admin";
import { destinationGalleryCategoriesRouter } from "./routers/destination-gallery-categories";
import { contactRouter } from "./routers/contact";

// ============ Routers Import ============

// ============ Admin Procedure ============
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============ Tours Router ============
const toursRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      categoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.listTours(input.limit, input.offset, input.categoryId);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      console.log('[tours.getBySlug] Query for slug:', input.slug);
      const tour = await db.getTourBySlug(input.slug);
      if (!tour) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tour not found" });
      }
      console.log('[tours.getBySlug] Found tour, fetching related data');
      
      let flights = [];
      let activities = [];
      
      try {
        flights = await db.getTourFlights(tour.id);
        console.log('[tours.getBySlug] Flights fetched:', flights.length);
      } catch (err) {
        console.error('[tours.getBySlug] Error fetching flights:', err);
      }
      
      try {
        activities = await db.getTourActivities(tour.id);
        console.log('[tours.getBySlug] Activities fetched:', activities.length);
      } catch (err) {
        console.error('[tours.getBySlug] Error fetching activities:', err);
      }
      
      console.log('[tours.getBySlug] Returning data');
      return { tour, flights, activities };
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      longDescription: z.string().optional(),
      category: z.string().optional(),
      duration: z.number().optional(),
      price: z.number().optional(),
      currency: z.string().default("USD"),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      itinerary: z.any().optional(),
      inclusions: z.array(z.string()).optional(),
      exclusions: z.array(z.string()).optional(),
      bestTime: z.string().optional(),
      difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
      groupSize: z.string().optional(),
      morningTime: z.string().optional(),
      afternoonTime: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      accommodation: z.any().optional(),
      transport: z.any().optional(),
      pricingTiers: z.any().optional(),
      cancellationPolicy: z.string().optional(),
      paymentPolicy: z.string().optional(),
      importantNotes: z.string().optional(),
      faqs: z.any().optional(),
      isFeatured: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.createTour(input as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "tour",
          entityId: result.id,
          entityName: input.name,
          description: `Created tour: ${input.name}`,
          newData: input,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "tour",
          entityName: input.name,
          description: `Failed to create tour: ${input.name}`,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.updateTour(input.id, input.data as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "tour",
          entityId: input.id,
          description: "Updated tour",
          newData: input.data,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "tour",
          entityId: input.id,
          description: "Failed to update tour",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.deleteTour(input.id);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "tour",
          entityId: input.id,
          description: "Deleted tour",
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "tour",
          entityId: input.id,
          description: "Failed to delete tour",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  // ============ Tour Filtering Procedures ============
  getCountries: publicProcedure.query(async () => {
    return tourFilters.getCountriesForFilter();
  }),

  getStatesByCountry: publicProcedure
    .input(z.object({ countryId: z.number() }))
    .query(async ({ input }) => {
      return tourFilters.getStatesByCountryForFilter(input.countryId);
    }),

  getCitiesByState: publicProcedure
    .input(z.object({ stateId: z.number() }))
    .query(async ({ input }) => {
      return tourFilters.getCitiesByStateForFilter(input.stateId);
    }),

  filterByLocations: publicProcedure
    .input(z.object({
      countryIds: z.array(z.number()).optional(),
      stateIds: z.array(z.number()).optional(),
      cityIds: z.array(z.number()).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const { countryIds, stateIds, cityIds, limit, offset } = input;
      return tourFilters.getToursByLocationFilters(
        { countryIds, stateIds, cityIds },
        limit,
        offset
      );
    }),

  countByLocations: publicProcedure
    .input(z.object({
      countryIds: z.array(z.number()).optional(),
      stateIds: z.array(z.number()).optional(),
      cityIds: z.array(z.number()).optional(),
    }))
    .query(async ({ input }) => {
      const { countryIds, stateIds, cityIds } = input;
      return tourFilters.getTourCountByLocationFilters({
        countryIds,
        stateIds,
        cityIds,
      });
    }),

  statsByCountry: publicProcedure.query(async () => {
    return tourFilters.getTourStatsByCountry();
  }),

  statsByState: publicProcedure.query(async () => {
    return tourFilters.getTourStatsByState();
  }),

  getRelated: publicProcedure
    .input(z.object({
      tourId: z.number(),
      limit: z.number().default(4),
    }))
    .query(async ({ input }) => {
      return db.getRelatedTours(input.tourId, input.limit);
    }),

  // ============ Server-Side Search ============
  search: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearch.searchTours(input);
    }),

  searchCount: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearch.getTourSearchCount(input);
    }),

  searchFullText: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.searchToursFullText(input);
    }),

  searchFullTextCount: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.getTourFullTextSearchCount(input);
    }),

  publicSearch: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.searchToursFullText(input);
    }),

  // ============ SEO Hub Pages ============
  getByCountry: publicProcedure
    .input(z.object({
      countryId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.getToursByCountry(input.countryId, input.limit, input.offset);
    }),

  getByCategory: publicProcedure
    .input(z.object({
      categoryId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.getToursByCategory(input.categoryId, input.limit, input.offset);
    }),

  getByDifficulty: publicProcedure
    .input(z.object({
      difficulty: z.enum(["easy", "moderate", "challenging"]),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.getToursByDifficulty(input.difficulty, input.limit, input.offset);
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      minDuration: z.number().optional(),
      maxDuration: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearch.searchTours({
        search: input.query,
        difficulty: input.difficulty,
        categoryId: input.categoryId,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        minDuration: input.minDuration,
        maxDuration: input.maxDuration,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  searchCount: publicProcedure
    .input(z.object({
      query: z.string(),
      difficulty: z.string().optional(),
      categoryId: z.number().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      minDuration: z.number().optional(),
      maxDuration: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearch.getTourSearchCount({
        search: input.query,
        difficulty: input.difficulty,
        categoryId: input.categoryId,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        minDuration: input.minDuration,
        maxDuration: input.maxDuration,
      });
    }),

});

// ============ Locations Router ============
const locationsRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      stateId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      if (input.stateId) {
        return db.listLocationsByState(input.stateId, input.limit, input.offset);
      }
      // For now, return empty if no state specified
      return [];
    }),

  listByState: publicProcedure
    .input(z.object({
      stateId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listLocationsByState(input.stateId, input.limit, input.offset);
    }),

  listByCountry: publicProcedure
    .input(z.object({
      countryId: z.number(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listLocationsByCountry(input.countryId, input.limit, input.offset);
    }),

  getBySlug: publicProcedure
    .input(z.object({
      stateId: z.number(),
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const location = await db.getLocationBySlug(input.stateId, input.slug);
      if (!location) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Location not found" });
      }
      return { location };
    }),

  create: adminProcedure
    .input(z.object({
      stateId: z.number(),
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      image: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.createLocation(input as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "location",
          entityId: result.id,
          entityName: input.name,
          description: `Created location: ${input.name}`,
          newData: input,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "location",
          entityName: input.name,
          description: `Failed to create location: ${input.name}`,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.updateLocation(input.id, input.data as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "location",
          entityId: input.id,
          description: "Updated location",
          newData: input.data,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "location",
          entityId: input.id,
          description: "Failed to update location",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  searchFullText: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      stateId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.searchLocationsFullText(input);
    }),

  searchFullTextCount: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      stateId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.getLocationFullTextSearchCount(input);
    }),

  generateTemplate: adminProcedure
    .query(async () => {
      const { generateLocationCsvTemplate, generateLocationCsvFilename } = await import("./services/location-csv-export");
      const template = generateLocationCsvTemplate();
      const filename = generateLocationCsvFilename("locations-template");
      return { template, filename };
    }),

  validateImport: adminProcedure
    .input(z.object({ csvContent: z.string() }))
    .query(async ({ input }) => {
      const { validateLocationCsv, checkForDuplicates, formatValidationErrors } = await import("./services/location-csv-import");
      const validation = await validateLocationCsv(input.csvContent);
      if (validation.validRows.length > 0) {
        const duplicates = checkForDuplicates(validation.validRows);
        if (duplicates.length > 0) {
          validation.invalidRows.push(...duplicates);
          validation.summary.invalidRows += duplicates.length;
          validation.summary.validRows -= duplicates.length;
          validation.isValid = false;
        }
      }
      return {
        isValid: validation.isValid,
        summary: validation.summary,
        errors: formatValidationErrors(validation.invalidRows),
      };
    }),

  importCsv: adminProcedure
    .input(z.object({
      csvContent: z.string(),
      stateId: z.number(),
      skipOnError: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { validateLocationCsv, checkForDuplicates, formatValidationErrors } = await import("./services/location-csv-import");
      const validation = await validateLocationCsv(input.csvContent);
      
      if (validation.validRows.length > 0) {
        const duplicates = checkForDuplicates(validation.validRows);
        if (duplicates.length > 0) {
          validation.invalidRows.push(...duplicates);
          validation.summary.invalidRows += duplicates.length;
          validation.summary.validRows -= duplicates.length;
          validation.isValid = false;
        }
      }

      if (!validation.isValid && !input.skipOnError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CSV validation failed. Please fix errors and try again.",
        });
      }

      const result = { created: 0, updated: 0, failed: 0, errors: [] as string[] };

      for (const row of validation.validRows) {
        try {
          if (row.id) {
            // Update existing location
            await db.updateLocation(row.id, {
              stateId: input.stateId,
              name: row.name,
              slug: row.slug,
              description: row.description,
              latitude: row.latitude?.toString(),
              longitude: row.longitude?.toString(),
              metaTitle: row.metaTitle,
              metaDescription: row.metaDescription,
              metaKeywords: row.metaKeywords,
              image: row.image,
            });
            result.updated++;
          } else {
            // Create new location
            await db.createLocation({
              stateId: input.stateId,
              name: row.name,
              slug: row.slug,
              description: row.description,
              latitude: row.latitude?.toString(),
              longitude: row.longitude?.toString(),
              metaTitle: row.metaTitle,
              metaDescription: row.metaDescription,
              metaKeywords: row.metaKeywords,
              image: row.image,
            });
            result.created++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import ${row.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
          if (!input.skipOnError) {
            throw error;
          }
        }
      }

      await logAdminAction({
        userId: ctx.user.id,
        userName: ctx.user.name || "Unknown",
        userEmail: ctx.user.email,
        action: "import",
        entityType: "location",
        description: `Bulk imported locations: ${result.created} created, ${result.updated} updated`,
        newData: { created: result.created, updated: result.updated, failed: result.failed },
        status: "success",
      });

      return result;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.deleteLocation(input.id);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "location",
          entityId: input.id,
          description: "Deleted location",
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "location",
          entityId: input.id,
          description: "Failed to delete location",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input }) => {
      const result = { deletedCount: 0, failedCount: 0, errors: [] as string[] };

      for (const id of input.ids) {
        try {
          await db.deleteLocation(id);
          result.deletedCount++;
        } catch (error: any) {
          result.failedCount++;
          result.errors.push(`Failed to delete location ${id}: ${error.message}`);
        }
      }

      return result;
    }),

  getTags: publicProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ input }) => {
      const tagMgmt = await import("./services/tag-management");
      return tagMgmt.getLocationTags(input.locationId);
    }),

  listAllTags: publicProcedure
    .query(async () => {
      const tagMgmt = await import("./services/tag-management");
      return tagMgmt.getAllTags();
    }),

  createTag: adminProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string().optional(),
      color: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const tagMgmt = await import("./services/tag-management");
      return tagMgmt.createTag(input);
    }),

  bulkAssignTags: adminProcedure
    .input(z.object({
      locationIds: z.array(z.number()).min(1),
      tagIds: z.array(z.number()).min(1),
    }))
    .mutation(async ({ input }) => {
      const tagMgmt = await import("./services/tag-management");
      return tagMgmt.bulkAssignTags(input.locationIds, input.tagIds);
    }),

  bulkRemoveTags: adminProcedure
    .input(z.object({
      locationIds: z.array(z.number()).min(1),
      tagIds: z.array(z.number()).min(1),
    }))
    .mutation(async ({ input }) => {
      const tagMgmt = await import("./services/tag-management");
      return tagMgmt.bulkRemoveTags(input.locationIds, input.tagIds);
    }),
  suggestTags: protectedProcedure
    .input(z.object({
      description: z.string().min(1),
      existingTags: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const tagSuggestions = await import("./services/tag-suggestions");
      return tagSuggestions.suggestTags(input.description, input.existingTags);
    }),
  batchSuggestTags: protectedProcedure
    .input(z.object({
      locations: z.array(z.object({
        id: z.number(),
        description: z.string().min(1),
      })),
    }))
    .query(async ({ input }) => {
      const tagSuggestions = await import("./services/tag-suggestions");
      const results = await tagSuggestions.batchSuggestTags(input.locations);
      return Object.fromEntries(results);
    }),

  getAutoTaggingConfig: adminProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const autoTagging = await import("./services/auto-tagging");
      return autoTagging.getAutoTaggingConfig(ctx.user.id);
    }),

  saveAutoTaggingConfig: adminProcedure
    .input(z.object({
      confidenceThreshold: z.number().min(0).max(1),
      autoApplyEnabled: z.boolean(),
      filterByCountry: z.string().optional(),
      filterByState: z.string().optional(),
      filterByTags: z.array(z.number()).optional(),
      maxTagsPerLocation: z.number().default(10),
    }))
    .mutation(async ({ input, ctx }) => {
      const autoTagging = await import("./services/auto-tagging");
      await autoTagging.saveAutoTaggingConfig(ctx.user.id, input);
      return { success: true };
    }),

  previewAutoTagging: adminProcedure
    .input(z.object({
      confidenceThreshold: z.number().min(0).max(1).default(0.75),
      countryId: z.number().optional(),
      stateId: z.number().optional(),
      tagIds: z.array(z.number()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const autoTagging = await import("./services/auto-tagging");
      return autoTagging.previewAutoTagging(ctx.user.id, input.confidenceThreshold, {
        countryId: input.countryId,
        stateId: input.stateId,
        tagIds: input.tagIds,
      });
    }),

  executeAutoTagging: adminProcedure
    .input(z.object({
      confidenceThreshold: z.number().min(0).max(1).default(0.75),
      countryId: z.number().optional(),
      stateId: z.number().optional(),
      tagIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const autoTagging = await import("./services/auto-tagging");
      return autoTagging.executeAutoTagging(ctx.user.id, input.confidenceThreshold, {
        countryId: input.countryId,
        stateId: input.stateId,
        tagIds: input.tagIds,
      });
    }),

  getAutoTaggingHistory: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const autoTagging = await import("./services/auto-tagging");
      return autoTagging.getAutoTaggingHistory(ctx.user.id, input.limit);
    }),

  undoAutoTagging: adminProcedure
    .input(z.object({
      historyId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const autoTagging = await import("./services/auto-tagging");
      return autoTagging.undoAutoTagging(input.historyId);
    }),

  // ============ Search Ranking Optimization ============
  rankSearchResults: publicProcedure
    .input(z.object({
      locationIds: z.array(z.number()).min(1),
      viewWeight: z.number().default(0.2),
      ctrWeight: z.number().default(0.3),
      conversionWeight: z.number().default(0.3),
      recencyWeight: z.number().default(0.2),
      decayDays: z.number().default(30),
    }))
    .query(async ({ input }) => {
      const searchRanking = await import("./services/search-ranking");
      return searchRanking.rankSearchResults(input.locationIds, {
        viewWeight: input.viewWeight,
        ctrWeight: input.ctrWeight,
        conversionWeight: input.conversionWeight,
        recencyWeight: input.recencyWeight,
        decayDays: input.decayDays,
      });
    }),

  getTopLocationsByEngagement: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const searchRanking = await import("./services/search-ranking");
      return searchRanking.getTopLocationsByEngagement(input.limit);
    }),

  getTrendingLocations: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      daysBack: z.number().default(7),
    }))
    .query(async ({ input }) => {
      const searchRanking = await import("./services/search-ranking");
      return searchRanking.getTrendingLocations(input.limit, input.daysBack);
    }),

  getHighConversionLocations: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      minConversionRate: z.number().default(5),
    }))
    .query(async ({ input }) => {
      const searchRanking = await import("./services/search-ranking");
      return searchRanking.getHighConversionLocations(input.limit, input.minConversionRate);
    }),

  compareRankings: adminProcedure
    .input(z.object({
      locationIds: z.array(z.number()).min(1),
    }))
    .query(async ({ input }) => {
      const searchRanking = await import("./services/search-ranking");
      return searchRanking.compareRankings(input.locationIds);
    }),
});

// ============ Countries Router ============
const countriesRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listCountries(input.limit, input.offset);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const country = await db.getCountryBySlug(input.slug);
      if (!country) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Country not found" });
      }
      return country;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.createCountry(input as any);
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      code: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateCountry(id, data as any);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteCountry(input.id);
    }),
});

// ============ States Router ============
const statesRouter = router({
  list: publicProcedure
    .input(z.object({
      countryId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      console.log('[states.list] Received input:', JSON.stringify(input));
      return db.listStatesByCountry(input.countryId, input.limit, input.offset);
    }),

  listByCountry: publicProcedure
    .input(z.object({
      countryId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listStatesByCountry(input.countryId, input.limit, input.offset);
    }),

  getBySlug: publicProcedure
    .input(z.object({
      countryId: z.number(),
      slug: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log('[states.getBySlug] Received input:', JSON.stringify(input));
      const state = await db.getStateBySlug(input.countryId, input.slug);
      if (!state) {
        throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });
      }
      return state;
    }),

  getBySlugAnyCountry: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      console.log('[states.getBySlugAnyCountry] Received input:', JSON.stringify(input));
      const state = await db.getStateBySlugAnyCountry(input.slug);
      if (!state) {
        throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });
      }
      return state;
    }),

  create: adminProcedure
    .input(z.object({
      countryId: z.number(),
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.createState(input as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "state",
          entityId: result.id,
          entityName: input.name,
          description: `Created state: ${input.name}`,
          newData: input,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "state",
          entityName: input.name,
          description: `Failed to create state: ${input.name}`,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      image: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updates } = input;
        const result = await db.updateState(id, updates as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "state",
          entityId: id,
          description: "Updated state",
          newData: updates,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "state",
          entityId: input.id,
          description: "Failed to update state",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.deleteState(input.id);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "state",
          entityId: input.id,
          description: "Deleted state",
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "state",
          entityId: input.id,
          description: "Failed to delete state",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  searchFullText: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      countryId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.searchStatesFullText(input);
    }),

  searchFullTextCount: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      countryId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.getStateFullTextSearchCount(input);
    }),
});

// ============ Categories Router ============
const categoriesRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listCategories(input.limit, input.offset);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db.getCategoryBySlug(input.slug);
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      return category;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.createCategory(input as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "category",
          entityId: result.id,
          entityName: input.name,
          description: `Created category: ${input.name}`,
          newData: input,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "create",
          entityType: "category",
          entityName: input.name,
          description: `Failed to create category: ${input.name}`,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updates } = input;
        const result = await db.updateCategory(id, updates as any);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "category",
          entityId: id,
          description: "Updated category",
          newData: updates,
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "update",
          entityType: "category",
          entityId: input.id,
          description: "Failed to update category",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.deleteCategory(input.id);
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "category",
          entityId: input.id,
          description: "Deleted category",
          status: "success",
        });
        return result;
      } catch (error) {
        await logAdminAction({
          userId: ctx.user.id,
          userName: ctx.user.name || "Unknown",
          userEmail: ctx.user.email,
          action: "delete",
          entityType: "category",
          entityId: input.id,
          description: "Failed to delete category",
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),

  searchFullText: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.searchCategoriesFullText(input);
    }),

  searchFullTextCount: adminProcedure
    .input(z.object({
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearchFullText.getCategoryFullTextSearchCount(input);
    }),
});

// ============ CSV Import Router ============
const importRouter = router({
  uploadTours: adminProcedure
    .input(z.object({
      fileName: z.string(),
      tours: z.array(z.record(z.string(), z.any())),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createImportLog({
        userId: ctx.user.id,
        fileName: input.fileName,
        importType: "tours",
        totalRecords: input.tours.length,
        successfulRecords: 0,
        failedRecords: 0,
        status: "processing",
      });
      // Get the inserted ID from Drizzle result
      let logId: number;
      if (Array.isArray(result)) {
        // If result is an array, get the first element
        logId = (result[0] as any)?.id || (result as any).insertId || 1;
      } else {
        // If result is an object with insertId
        logId = (result as any).insertId || (result as any).id || 1;
      }
      
      // Fallback: query the database to get the latest import log ID if needed
      if (logId === 1) {
        const latestLog = await db.getAllImportLogs(1);
        if (latestLog && latestLog.length > 0) {
          logId = (latestLog[0] as any).id || 1;
        }
      }

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      try {
        for (const tour of input.tours) {
          try {
            // Helper function to parse array fields (pipe-separated or JSON)
            const parseArrayField = (value: any) => {
              if (!value) return undefined;
              if (typeof value !== 'string') return value;
              // Try JSON first
              if (value.startsWith('[')) {
                try {
                  return JSON.parse(value);
                } catch (e) {
                  // Fall through to pipe-separated parsing
                }
              }
              // Parse pipe-separated values
              return value.split('|').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
            };

            // Helper function to parse FAQ objects from pipe-separated format
            const parseFaqs = (value: any) => {
              if (!value) return undefined;
              if (Array.isArray(value)) return value;
              if (typeof value !== 'string') return undefined;
              // Try JSON first
              if (value.startsWith('[')) {
                try {
                  return JSON.parse(value);
                } catch (e) {
                  // Fall through
                }
              }
              // Parse pipe-separated Q&A pairs (format: "Q1|A1|Q2|A2")
              const parts = value.split('|').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
              const faqs = [];
              for (let i = 0; i < parts.length; i += 2) {
                if (parts[i + 1]) {
                  faqs.push({ question: parts[i], answer: parts[i + 1] });
                }
              }
              return faqs.length > 0 ? faqs : undefined;
            };

            // Helper function to parse hotel objects by destination
            const parseHotels = (value: any, destination: string) => {
              if (!value) return undefined;
              if (Array.isArray(value)) return value;
              if (typeof value !== 'string') return undefined;
              // Try JSON first
              if (value.startsWith('[')) {
                try {
                  return JSON.parse(value);
                } catch (e) {
                  // Fall through
                }
              }
              // Parse pipe-separated hotel names (format: "Hotel1|Hotel2|Hotel3")
              const hotels = value.split('|').map((name: string) => ({
                name: name.trim(),
                starRating: "3 Star",
                included: true
              })).filter((h: any) => h.name.length > 0);
              return hotels.length > 0 ? hotels : undefined;
            };

            // Parse hotel fields directly from CSV columns
            const parseHotelJson = (value: any) => {
              if (!value) return undefined;
              if (Array.isArray(value)) return value;
              if (typeof value !== 'string') return undefined;
              
              // Try JSON parsing first
              if (value.startsWith('[')) {
                try {
                  return JSON.parse(value);
                } catch (e) {
                  console.error('Failed to parse hotel JSON:', e);
                }
              }
              
              // If not JSON, try pipe-separated format
              if (value.includes('|')) {
                const hotelNames = value.split('|').map((name: string) => name.trim()).filter((name: string) => name.length > 0);
                if (hotelNames.length > 0) {
                  return hotelNames.map((name: string) => ({
                    name: name,
                    star: 3,
                    website: "",
                    type: "included"
                  }));
                }
              }
              
              return undefined;
            };
            
            const hotelsPuri = parseHotelJson(tour.hotelsPuri);
            const hotelsBhuvaneshwar = parseHotelJson(tour.hotelsBhuvaneshwar);

            await db.createTour({
              name: tour.name,
              slug: tour.slug,
              description: tour.description,
              longDescription: tour.longDescription,
              category: tour.category,
              duration: tour.duration ? parseInt(tour.duration) : undefined,
              price: tour.price ? parseFloat(tour.price) : undefined,
              currency: tour.currency || "USD",
              image: tour.image,
              images: parseArrayField(tour.images),
              metaTitle: tour.metaTitle,
              metaDescription: tour.metaDescription,
              metaKeywords: tour.metaKeywords,
              highlights: parseArrayField(tour.highlights),
              itinerary: parseArrayField(tour.itinerary),
              inclusions: parseArrayField(tour.inclusions),
              exclusions: parseArrayField(tour.exclusions),
              bestTime: tour.bestTime,
              travelType: tour.travelType,
              difficulty: tour.difficulty as any,
              groupSize: tour.groupSize,
              openTime: tour.openTime,
              closeTime: tour.closeTime,
              amenities: parseArrayField(tour.amenities),
              transport: parseArrayField(tour.transport),
              pricingTiers: parseArrayField(tour.pricingTiers),
              cancellationPolicy: tour.cancellationPolicy,
              paymentPolicy: tour.paymentPolicy,
              importantNotes: tour.importantNotes,
              faqs: parseFaqs(tour.faqs),
              hotelsPuri: hotelsPuri || undefined,
              hotelsBhuvaneshwar: hotelsBhuvaneshwar || undefined,
              isActive: true,
              isFeatured: tour.isFeatured === "true" || tour.isFeatured === true,
            } as any);
            successful++;
          } catch (error) {
            failed++;
            errors.push(`Row error: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        await db.updateImportLogStatus(logId, {
          successfulRecords: successful,
          failedRecords: failed,
          errors: errors.length > 0 ? errors : undefined,
          status: failed === 0 ? "completed" : "completed",
          completedAt: new Date(),
        });

        return { logId, successful, failed, errors };
      } catch (error) {
        await db.updateImportLogStatus(logId, 'failed');
        throw error;
      }
    }),

  uploadLocations: adminProcedure
    .input(z.object({
      fileName: z.string(),
      locations: z.array(z.record(z.string(), z.any())),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createImportLog({
        userId: ctx.user.id,
        fileName: input.fileName,
        importType: "locations",
        totalRecords: input.locations.length,
        successfulRecords: 0,
        failedRecords: 0,
        status: "processing",
      });
      // Get the inserted ID from Drizzle result
      let logId: number;
      if (Array.isArray(result)) {
        logId = (result[0] as any)?.id || (result as any).insertId || 1;
      } else {
        logId = (result as any).insertId || (result as any).id || 1;
      }
      if (logId === 1) {
        const latestLog = await db.getAllImportLogs(1);
        if (latestLog && latestLog.length > 0) {
          logId = (latestLog[0] as any).id || 1;
        }
      }

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      try {
        for (const location of input.locations) {
          try {
            await db.createLocation({
              countryId: parseInt(location.countryId),
              name: location.name,
              slug: location.slug,
              description: location.description,
              metaTitle: location.metaTitle,
              metaDescription: location.metaDescription,
              metaKeywords: location.metaKeywords,
              image: location.image,
              latitude: location.latitude ? location.latitude : undefined,
              longitude: location.longitude ? location.longitude : undefined,
            } as any);
            successful++;
          } catch (error) {
            failed++;
            errors.push(`Row error: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        await db.updateImportLogStatus(logId, {
          successfulRecords: successful,
          failedRecords: failed,
          errors: errors.length > 0 ? errors : undefined,
          status: failed === 0 ? "completed" : "completed",
          completedAt: new Date(),
        });

        return { logId, successful, failed, errors };
      } catch (error) {
        await db.updateImportLogStatus(logId, 'failed');
        throw error;
      }
    }),

  uploadActivities: adminProcedure
    .input(z.object({
      fileName: z.string(),
      activities: z.array(z.record(z.string(), z.any())),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createImportLog({
        userId: ctx.user.id,
        fileName: input.fileName,
        importType: "activities",
        totalRecords: input.activities.length,
        successfulRecords: 0,
        failedRecords: 0,
        status: "processing",
      });
      // Get the inserted ID from Drizzle result
      let logId: number;
      if (Array.isArray(result)) {
        logId = (result[0] as any)?.id || (result as any).insertId || 1;
      } else {
        logId = (result as any).insertId || (result as any).id || 1;
      }
      if (logId === 1) {
        const latestLog = await db.getAllImportLogs(1);
        if (latestLog && latestLog.length > 0) {
          logId = (latestLog[0] as any).id || 1;
        }
      }

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const activity of input.activities) {
        let name = "Unknown";
        let slug = "unknown";
        let locationId: number | null = null;
        try {
          name = activity.name?.trim() || "Unknown";
          slug = activity.slug?.trim() || "unknown";
          
          // Prioritize Country/State/City mapping over locationId column
          if (activity.country && activity.state && activity.city) {
            const country = activity.country.trim();
            const state = activity.state.trim();
            const city = activity.city.trim();
            try {
              const countryResult = await db.getCountryByName(country);
              if (countryResult) {
                const stateResult = await db.getStateByName(state, countryResult.id);
                if (stateResult) {
                  const locationResult = await db.getLocationByName(city, stateResult.id);
                  if (locationResult) {
                    locationId = locationResult.id;
                  }
                }
              }
            } catch (lookupError) {
              console.error('Location lookup error:', lookupError);
            }
          }
          
          // Fall back to locationId column if Country/State/City mapping didn't work
          if (!locationId && activity.locationId) {
            locationId = parseInt(activity.locationId);
          }
          
          // Default to Ujjain (locationId=150057) if no location found
          if (!locationId) {
            locationId = 150057;
          }

          if (!name || !slug) {
            failed++;
            errors.push(`Row skipped: Missing required fields (name, slug)`);
            continue;
          }

          // Check if slug already exists
          const existingActivity = await db.getActivityBySlug(slug);
          if (existingActivity) {
            failed++;
            errors.push(`Row skipped: Duplicate slug "${slug}" already exists`);
            continue;
          }

          const activityData = {
            locationId,
            tourId: activity.tourId ? parseInt(activity.tourId) : null,
            name,
            slug,
            description: activity.description?.trim() || null,
            category: activity.category?.trim() || null,
            duration: activity.duration?.trim() || null,
            price: activity.price ? parseFloat(activity.price) : null,
            currency: activity.currency?.trim() || "INR",
            image: activity.image?.trim() || null,
            difficulty: activity.difficulty?.trim() || "easy",
            bestTime: activity.bestTime?.trim() || null,
            metaTitle: activity.metaTitle?.trim() || null,
            metaKeywords: activity.metaKeywords?.trim() || null,
            metaDescription: activity.metaDescription?.trim() || null,
            whatIncluded: activity.whatIncluded?.trim() || null,
            whatExcluded: activity.whatExcluded?.trim() || null,
            tourDuration: activity.tourDuration?.trim() || null,
          };

          await db.createActivity(activityData as any);
          successful++;
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          // Check if it's a unique constraint violation (duplicate slug)
          if (errorMsg.includes('Duplicate entry') || errorMsg.includes('UNIQUE')) {
            errors.push(`Row skipped: Duplicate slug "${slug}" already exists`);
          } else {
            errors.push(`Row failed: ${errorMsg}`);
            console.error('Activity import error:', { name, slug, locationId, error });
          }
        }
      }

      await db.updateImportLogStatus(logId, {
        successfulRecords: successful,
        failedRecords: failed,
        status: failed === 0 ? 'completed' : 'completed',
        errors: errors.length > 0 ? errors : undefined,
      });

      return {
        successful,
        failed,
        errors: errors.slice(0, 10),
      };
    }),

  getHistory: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      return db.getAllImportLogs(input.limit);
    }),
});

// ============ Activities Router ============
const activitiesRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(100),
      offset: z.number().default(0),
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.listActivities(input.locationId, input.limit, input.offset);
    }),

  create: adminProcedure
    .input(z.object({
      locationId: z.number(),
      tourId: z.number().optional(),
      name: z.string(),
      slug: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.number().optional(),
      duration: z.string().optional(),
      difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
      bestTime: z.string().optional(),
      image: z.string().optional(),
      whatIncluded: z.string().optional(),
      whatExcluded: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.createActivity(input as any);
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      locationId: z.number().optional(),
      tourId: z.number().optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.number().optional(),
      duration: z.string().optional(),
      difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
      bestTime: z.string().optional(),
      image: z.string().optional(),
      whatIncluded: z.string().optional(),
      whatExcluded: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return db.updateActivity(id, updates as any);
    }),

  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      return db.deleteActivity(input.id);
    }),

  listByLocation: publicProcedure
    .input(z.object({
      locationId: z.number(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listActivitiesByLocation(input.locationId, input.limit, input.offset);
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.string().or(z.number()),
    }))
    .query(async ({ input }) => {
      const id = typeof input.id === 'string' ? parseInt(input.id) : input.id;
      const activity = await db.getActivityById(id);
      return { activity };
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const activity = await db.getActivityBySlug(input.slug);
      if (!activity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Activity not found" });
      }
      return { activity };
    }),

  search: publicProcedure
    .input(z.object({
      query: z.string(),
      difficulty: z.string().optional(),
      locationId: z.number().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return dbSearch.searchActivities({
        search: input.query,
        difficulty: input.difficulty,
        locationId: input.locationId,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  searchCount: publicProcedure
    .input(z.object({
      query: z.string(),
      difficulty: z.string().optional(),
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return dbSearch.getActivitySearchCount({
        search: input.query,
        difficulty: input.difficulty,
        locationId: input.locationId,
      });
    }),
});

// ============ Attractions Router ============
const attractionsRouter = router({
  listByLocation: publicProcedure
    .input(z.object({
      locationId: z.number(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listAttractionsByLocation(input.locationId, input.limit, input.offset);
    }),

  listByLocationAndType: publicProcedure
    .input(z.object({
      locationId: z.number(),
      type: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return db.listAttractionsByLocationAndType(input.locationId, input.type, input.limit, input.offset);
    }),

  getFeatured: publicProcedure
    .input(z.object({
      locationId: z.number(),
      limit: z.number().default(6),
    }))
    .query(async ({ input }) => {
      return db.listFeaturedAttractionsByLocation(input.locationId, input.limit);
    }),

  getBySlug: publicProcedure
    .input(z.object({
      locationId: z.number(),
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const attraction = await db.getAttractionBySlug(input.locationId, input.slug);
      if (!attraction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Attraction not found" });
      }
      return attraction;
    }),

  create: adminProcedure
    .input(z.object({
      locationId: z.number(),
      name: z.string(),
      slug: z.string(),
      type: z.enum(["landmark", "restaurant", "museum", "temple", "monument", "park", "cafe", "shopping", "other"]),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      openingHours: z.string().optional(),
      closedOn: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
      rating: z.number().optional(),
      reviewCount: z.number().optional(),
      entryFee: z.string().optional(),
      estimatedVisitTime: z.string().optional(),
      bestTimeToVisit: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      isFeatured: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      return db.createAttraction(input as any);
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      type: z.enum(["landmark", "restaurant", "museum", "temple", "monument", "park", "cafe", "shopping", "other"]).optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      openingHours: z.string().optional(),
      closedOn: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
      rating: z.number().optional(),
      reviewCount: z.number().optional(),
      entryFee: z.string().optional(),
      estimatedVisitTime: z.string().optional(),
      bestTimeToVisit: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return db.updateAttraction(id, updates as any);
    }),

  delete: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      return db.deleteAttraction(input.id);
    }),

  search: publicProcedure
    .input(z.object({
      locationId: z.number(),
      query: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return db.searchAttractions(input.locationId, input.query, input.limit);
    }),

  getTagPerformanceMetrics: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
    }))
    .query(async ({ input }) => {
      const analytics = await import("./services/tag-performance-analytics");
      return analytics.TagPerformanceAnalytics.getTagPerformanceMetrics(input.limit);
    }),

  getTopPerformingTags: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(10),
    }))
    .query(async ({ input }) => {
      const analytics = await import("./services/tag-performance-analytics");
      return analytics.TagPerformanceAnalytics.getTopPerformingTags(input.limit);
    }),
});

// ============ A/B Testing Router ============
const abTestingRouter = router({
  getActiveExperiment: publicProcedure
    .query(async () => {
      const abTesting = await import("./services/ab-testing");
      const experiments = await abTesting.listExperiments("running", undefined, 1, 0);
      if (experiments.length === 0) return null;
      return {
        id: experiments[0].id,
        name: experiments[0].name,
        controlVariant: experiments[0].controlVariant,
        treatmentVariant: experiments[0].treatmentVariant,
        assignedVariant: "control", // Will be determined by client
      };
    }),

  createExperiment: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      experimentType: z.enum(["ranking", "ui", "algorithm"]),
      controlVariant: z.string(),
      treatmentVariant: z.string(),
      trafficAllocation: z.number().min(0).max(100).default(50),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      minSampleSize: z.number().default(1000),
      confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
    }))
    .mutation(async ({ input, ctx }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.createExperiment({
        ...input,
        createdBy: ctx.user.id,
      } as any);
    }),

  listExperiments: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      experimentType: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.listExperiments(input.status, input.experimentType, input.limit, input.offset);
    }),

  getExperiment: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.getExperimentById(input.id);
    }),

  updateExperimentStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "running", "paused", "completed"]),
    }))
    .mutation(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      await abTesting.updateExperimentStatus(input.id, input.status);
      return { success: true };
    }),

  trackEvent: publicProcedure
    .input(z.object({
      experimentId: z.number(),
      eventType: z.string(),
      eventName: z.string(),
      locationId: z.number().optional(),
      metadata: z.record(z.any()).optional(),
      sessionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const abTesting = await import("./services/ab-testing");
      
      // Get or create assignment
      let assignment = await abTesting.getAssignment(
        input.experimentId,
        ctx.user?.id || null,
        input.sessionId
      );

      if (!assignment) {
        const experiment = await abTesting.getExperimentById(input.experimentId);
        if (!experiment) throw new TRPCError({ code: "NOT_FOUND" });
        
        assignment = await abTesting.assignToVariant(
          input.experimentId,
          ctx.user?.id || null,
          input.sessionId,
          experiment.trafficAllocation
        );
      }

      // Track the event
      return abTesting.trackEvent(
        input.experimentId,
        assignment.id,
        ctx.user?.id || null,
        input.sessionId,
        input.eventType as any,
        input.eventName,
        input.locationId,
        input.metadata
      );
    }),

  getResults: adminProcedure
    .input(z.object({
      experimentId: z.number(),
    }))
    .query(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.getResultsByExperimentId(input.experimentId);
    }),

  calculateResults: adminProcedure
    .input(z.object({
      experimentId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.calculateExperimentResults(input.experimentId);
    }),

  createFeatureFlag: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      enabled: z.boolean().default(false),
      rolloutPercentage: z.number().min(0).max(100).default(0),
      linkedExperimentId: z.number().optional(),
      targetUsers: z.array(z.number()).optional(),
      targetCountries: z.array(z.number()).optional(),
      targetLocations: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.createFeatureFlag({
        ...input,
        createdBy: ctx.user.id,
      } as any);
    }),

  getFeatureFlag: publicProcedure
    .input(z.object({
      name: z.string(),
    }))
    .query(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.getFeatureFlagByName(input.name);
    }),

  isFeatureEnabled: publicProcedure
    .input(z.object({
      flagName: z.string(),
      userId: z.number().optional(),
      countryId: z.number().optional(),
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      return abTesting.isFeatureEnabled(
        input.flagName,
        input.userId,
        input.countryId,
        input.locationId
      );
    }),

  updateFeatureFlag: adminProcedure
    .input(z.object({
      id: z.number(),
      enabled: z.boolean().optional(),
      rolloutPercentage: z.number().min(0).max(100).optional(),
      targetUsers: z.array(z.number()).optional(),
      targetCountries: z.array(z.number()).optional(),
      targetLocations: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const abTesting = await import("./services/ab-testing");
      const { id, ...data } = input;
      await abTesting.updateFeatureFlag(id, data as any);
      return { success: true };
    }),
});


// ============ Main App Router ============
export const appRouter = router({
  tours: toursRouter,
  locations: locationsRouter,
  countries: countriesRouter,
  states: statesRouter,
  categories: categoriesRouter,
  import: importRouter,
  activities: activitiesRouter,
  attractions: attractionsRouter,
  abTesting: abTestingRouter,
  system: systemRouter,
  auth: authRouter,
  featureFlags: featureFlagsRouter,
  featureFlagsAdmin: featureFlagsAdminRouter,
  analytics: analyticsRouterFromFile,
  bookingEnquiries: bookingEnquiriesRouter,
  bookingEnquiriesAdmin: bookingEnquiriesAdminRouter,
  teamAssignments: teamAssignmentsRouter,
  routing: routingRouter,
  reportSchedules: reportSchedulesRouter,
  jobMonitoring: jobMonitoringRouter,
  schedules: schedulesRouter,
  destinations: destinationsRouter,
  dashboard: dashboardRouter,
  schedulerMonitoring: schedulerMonitoringRouter,
  localization: localizationRouter,
  localizationImport: localizationImportRouter,
  adminAttractions: adminAttractionsRouter,
  adminActivities: adminActivitiesRouter,
  translations: translationsRouter,
  importHistory: importHistoryRouter,
  rollback: rollbackRouter,
  sitemap: sitemapRouter,
  admin: adminRouter,
  schedulerAlertsWidget: schedulerAlertsWidgetRouter,
  seo: seoRouter,
  reviews: reviewsRouter,
  bookings: bookingsRouter,
  payments: paymentsRouter,
  homePageSettings: homePageSettingsRouter,
  countriesCarousel: countriesCarouselRouter,
  destinationGalleryMasonry: destinationGalleryMasonryRouter,
  destinationGallery: destinationGalleryAdminRouter,
  destinationGalleryCategories: destinationGalleryCategoriesRouter,
  contact: contactRouter,

});

export type AppRouter = typeof appRouter;

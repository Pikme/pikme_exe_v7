import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import {
  createTourLocalization,
  getTourLocalization,
  listTourLocalizations,
  updateTourLocalization,
  deleteTourLocalization,
  listTourLocalizationsByLocale,
  createStateLocalization,
  getStateLocalization,
  listStateLocalizations,
  updateStateLocalization,
  deleteStateLocalization,
  createCategoryLocalization,
  getCategoryLocalization,
  listCategoryLocalizations,
  updateCategoryLocalization,
  deleteCategoryLocalization,
} from "../db";

/**
 * Localization Router - Manage locale-specific content for tours, states, and categories
 */
export const localizationRouter = router({
  // ============ Tour Localizations ============

  /**
   * Create a new tour localization
   */
  createTourLocalization: adminProcedure
    .input(
      z.object({
        tourId: z.number(),
        locale: z.string().min(2).max(10),
        title: z.string().optional(),
        description: z.string().optional(),
        longDescription: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        itinerary: z.array(z.any()).optional(),
        inclusions: z.array(z.string()).optional(),
        exclusions: z.array(z.string()).optional(),
        bestTime: z.string().optional(),
        cancellationPolicy: z.string().optional(),
        paymentPolicy: z.string().optional(),
        importantNotes: z.string().optional(),
        faqs: z.array(z.any()).optional(),
        headingH1: z.string().optional(),
        headingH2: z.string().optional(),
        headingH3: z.string().optional(),
        amenities: z.array(z.string()).optional(),
        transport: z.array(z.any()).optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createTourLocalization(input);
    }),

  /**
   * Get tour localization for specific locale
   */
  getTourLocalization: publicProcedure
    .input(
      z.object({
        tourId: z.number(),
        locale: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getTourLocalization(input.tourId, input.locale);
    }),

  /**
   * List all localizations for a tour
   */
  listTourLocalizations: publicProcedure
    .input(z.object({ tourId: z.number() }))
    .query(async ({ input }) => {
      return listTourLocalizations(input.tourId);
    }),

  /**
   * Update tour localization
   */
  updateTourLocalization: adminProcedure
    .input(
      z.object({
        tourId: z.number(),
        locale: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        longDescription: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        itinerary: z.array(z.any()).optional(),
        inclusions: z.array(z.string()).optional(),
        exclusions: z.array(z.string()).optional(),
        bestTime: z.string().optional(),
        cancellationPolicy: z.string().optional(),
        paymentPolicy: z.string().optional(),
        importantNotes: z.string().optional(),
        faqs: z.array(z.any()).optional(),
        headingH1: z.string().optional(),
        headingH2: z.string().optional(),
        headingH3: z.string().optional(),
        amenities: z.array(z.string()).optional(),
        transport: z.array(z.any()).optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { tourId, locale, ...updates } = input;
      return updateTourLocalization(tourId, locale, updates);
    }),

  /**
   * Delete tour localization
   */
  deleteTourLocalization: adminProcedure
    .input(
      z.object({
        tourId: z.number(),
        locale: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return deleteTourLocalization(input.tourId, input.locale);
    }),

  /**
   * List all tour localizations for a specific locale
   */
  listTourLocalizationsByLocale: publicProcedure
    .input(
      z.object({
        locale: z.string(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return listTourLocalizationsByLocale(input.locale, input.limit, input.offset);
    }),

  // ============ State Localizations ============

  /**
   * Create a new state localization
   */
  createStateLocalization: adminProcedure
    .input(
      z.object({
        stateId: z.number(),
        locale: z.string().min(2).max(10),
        title: z.string().optional(),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createStateLocalization(input);
    }),

  /**
   * Get state localization for specific locale
   */
  getStateLocalization: publicProcedure
    .input(
      z.object({
        stateId: z.number(),
        locale: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getStateLocalization(input.stateId, input.locale);
    }),

  /**
   * List all localizations for a state
   */
  listStateLocalizations: publicProcedure
    .input(z.object({ stateId: z.number() }))
    .query(async ({ input }) => {
      return listStateLocalizations(input.stateId);
    }),

  /**
   * Update state localization
   */
  updateStateLocalization: adminProcedure
    .input(
      z.object({
        stateId: z.number(),
        locale: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { stateId, locale, ...updates } = input;
      return updateStateLocalization(stateId, locale, updates);
    }),

  /**
   * Delete state localization
   */
  deleteStateLocalization: adminProcedure
    .input(
      z.object({
        stateId: z.number(),
        locale: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return deleteStateLocalization(input.stateId, input.locale);
    }),

  // ============ Category Localizations ============

  /**
   * Create a new category localization
   */
  createCategoryLocalization: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        locale: z.string().min(2).max(10),
        title: z.string().optional(),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createCategoryLocalization(input);
    }),

  /**
   * Get category localization for specific locale
   */
  getCategoryLocalization: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        locale: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getCategoryLocalization(input.categoryId, input.locale);
    }),

  /**
   * List all localizations for a category
   */
  listCategoryLocalizations: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      return listCategoryLocalizations(input.categoryId);
    }),

  /**
   * Update category localization
   */
  updateCategoryLocalization: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        locale: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { categoryId, locale, ...updates } = input;
      return updateCategoryLocalization(categoryId, locale, updates);
    }),

  /**
   * Delete category localization
   */
  deleteCategoryLocalization: adminProcedure
    .input(
      z.object({
        categoryId: z.number(),
        locale: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return deleteCategoryLocalization(input.categoryId, input.locale);
    }),
});

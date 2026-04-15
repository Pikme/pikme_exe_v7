import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getAttractionAnalytics,
  getTopAttractionsByViews,
  getAttractionAnalyticsSummary,
  getAttractionsByType,
  getTrendingAttractions,
  recordAttractionView,
  updateAttractionAnalytics,
} from "../db";

export const analyticsRouter = router({
  // Get analytics for a specific attraction
  getAttractionAnalytics: publicProcedure
    .input(
      z.object({
        attractionId: z.number().int().positive(),
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getAttractionAnalytics(input.attractionId, input.days);
    }),

  // Get top attractions by views
  getTopAttractionsByViews: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getTopAttractionsByViews(input.limit, input.days);
    }),

  // Get analytics summary
  getAnalyticsSummary: publicProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getAttractionAnalyticsSummary(input.days);
    }),

  // Get attractions by type distribution
  getAttractionsByType: publicProcedure
    .input(
      z.object({
        days: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      return getAttractionsByType(input.days);
    }),

  // Get trending attractions
  getTrendingAttractions: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(5),
        days: z.number().int().positive().default(7),
      })
    )
    .query(async ({ input }) => {
      return getTrendingAttractions(input.limit, input.days);
    }),

  // Record attraction view (admin only)
  recordView: adminProcedure
    .input(
      z.object({
        attractionId: z.number().int().positive(),
        views: z.number().int().positive().default(1),
      })
    )
    .mutation(async ({ input }) => {
      return recordAttractionView(input.attractionId, input.views);
    }),

  // Update attraction analytics (admin only)
  updateAnalytics: adminProcedure
    .input(
      z.object({
        attractionId: z.number().int().positive(),
        views: z.number().int().optional(),
        clicks: z.number().int().optional(),
        averageRating: z.string().optional(),
        totalReviews: z.number().int().optional(),
        favoriteCount: z.number().int().optional(),
        shareCount: z.number().int().optional(),
        bookingCount: z.number().int().optional(),
        conversionRate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { attractionId, ...data } = input;
      return updateAttractionAnalytics(attractionId, data);
    }),
});

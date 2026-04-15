import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as featureFlagsService from "../services/feature-flags";
import * as rankingVariant from "../services/ranking-variant-assignment";

export const featureFlagsRouter = router({
  /**
   * Check if a feature flag is enabled for the current user
   */
  isEnabled: publicProcedure
    .input(
      z.object({
        flagName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const enabled = await featureFlagsService.isFlagEnabled(
        input.flagName,
        ctx.user?.id,
        ctx.sessionId
      );

      return { enabled };
    }),

  /**
   * Get variant assignment for a feature flag
   */
  getVariant: publicProcedure
    .input(
      z.object({
        flagName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const assignment = await featureFlagsService.assignVariant(
        input.flagName,
        ctx.user?.id,
        ctx.sessionId
      );

      return assignment;
    }),

  /**
   * Get feature flag statistics
   */
  getStats: publicProcedure
    .input(
      z.object({
        flagName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const stats = await featureFlagsService.getFlagStats(input.flagName);
      return stats;
    }),

  /**
   * Get ranking variant for search
   */
  getRankingVariant: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        sessionId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const variant = await rankingVariant.getRankingVariant(
        input.userId || ctx.user?.id,
        input.sessionId || ctx.sessionId
      );

      return { variant };
    }),

  /**
   * Rank search results with appropriate algorithm
   */
  rankSearchResults: publicProcedure
    .input(
      z.object({
        locationIds: z.array(z.number()),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const results = await rankingVariant.rankSearchResults({
        locationIds: input.locationIds,
        userId: ctx.user?.id,
        sessionId: ctx.sessionId,
        searchQuery: input.searchQuery,
      });

      return results;
    }),

  /**
   * Get ranking explanation for a location
   */
  getRankingExplanation: publicProcedure
    .input(
      z.object({
        locationId: z.number(),
        variant: z.enum(["control", "treatment"]),
      })
    )
    .query(async ({ input }) => {
      const explanation = await rankingVariant.getRankingExplanation(
        input.locationId,
        input.variant
      );

      return { explanation };
    }),

  /**
   * Track ranking event (view, click, conversion)
   */
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.enum(["view", "click", "conversion"]),
        locationId: z.number(),
        variant: z.enum(["control", "treatment"]),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await rankingVariant.trackRankingEvent(
        input.eventType,
        input.locationId,
        input.variant,
        ctx.user?.id,
        ctx.sessionId,
        input.metadata
      );

      return { success: true };
    }),

  /**
   * Get A/B test summary (admin only)
   */
  getTestSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const summary = await rankingVariant.getABTestSummary();
    return summary;
  }),

  /**
   * Update feature flag (admin only)
   */
  updateFlag: protectedProcedure
    .input(
      z.object({
        flagName: z.string(),
        enabled: z.boolean().optional(),
        rolloutPercentage: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      await featureFlagsService.updateFlag(input.flagName, {
        name: input.flagName,
        enabled: input.enabled ?? true,
        rolloutPercentage: input.rolloutPercentage ?? 50,
        description: input.description,
      });

      return { success: true };
    }),

  /**
   * Initialize default feature flags (admin only)
   */
  initializeDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Admin access required");
    }

    await featureFlagsService.initializeDefaultFlags();
    return { success: true };
  }),
});

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { featureFlags } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Admin procedures for managing feature flags
 * Only accessible to admin users
 */
export const featureFlagsAdminRouter = router({
  /**
   * Get all feature flags with current settings
   */
  listFlags: adminProcedure.query(async () => {
    try {
      const flags = await db.getDb()
        .then(database => {
          if (!database) throw new Error("Database not available");
          return database
            .select()
            .from(featureFlags)
            .orderBy(desc(featureFlags.updatedAt));
        });

      return {
        flags: flags.map((flag) => ({
          id: flag.id,
          name: flag.name,
          description: flag.description,
          enabled: flag.enabled,
          rolloutPercentage: flag.rolloutPercentage,
          linkedExperimentId: flag.linkedExperimentId,
          createdAt: flag.createdAt,
          updatedAt: flag.updatedAt,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to list flags: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }),

  /**
   * Get a specific feature flag
   */
  getFlag: adminProcedure
    .input(z.object({ flagName: z.string() }))
    .query(async ({ input }) => {
      try {
        const flag = await db.getDb()
          .then(database => {
            if (!database) throw new Error("Database not available");
            return database
              .select()
              .from(featureFlags)
              .where(eq(featureFlags.name, input.flagName))
              .limit(1);
          });

        if (!flag.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Feature flag "${input.flagName}" not found`,
          });
        }

        return {
          flag: {
            id: flag[0].id,
            name: flag[0].name,
            description: flag[0].description,
            enabled: flag[0].enabled,
            rolloutPercentage: flag[0].rolloutPercentage,
            linkedExperimentId: flag[0].linkedExperimentId,
            createdAt: flag[0].createdAt,
            updatedAt: flag[0].updatedAt,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get flag: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Create a new feature flag
   */
  createFlag: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        enabled: z.boolean().default(false),
        rolloutPercentage: z.number().min(0).max(100).default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.getDb()
          .then(database => {
            if (!database) throw new Error("Database not available");
            return database
              .insert(featureFlags)
              .values({
                name: input.name,
                description: input.description,
                enabled: input.enabled,
                rolloutPercentage: input.rolloutPercentage,
                createdBy: ctx.user!.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();
          });

        if (!result.length) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create feature flag",
          });
        }

        return { flag: result[0] };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create flag: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Toggle a feature flag enabled/disabled
   */
  toggleFlag: adminProcedure
    .input(
      z.object({
        flagName: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.getDb()
          .then(database => {
            if (!database) throw new Error("Database not available");
            return database
              .update(featureFlags)
              .set({
                enabled: input.enabled,
                updatedAt: new Date(),
              })
              .where(eq(featureFlags.name, input.flagName))
              .returning();
          });

        if (!result.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Feature flag "${input.flagName}" not found`,
          });
        }

        return { flag: result[0] };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to toggle flag: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Update rollout percentage
   */
  updateRollout: adminProcedure
    .input(
      z.object({
        flagName: z.string(),
        rolloutPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.getDb()
          .then(database => {
            if (!database) throw new Error("Database not available");
            return database
              .update(featureFlags)
              .set({
                rolloutPercentage: input.rolloutPercentage,
                updatedAt: new Date(),
              })
              .where(eq(featureFlags.name, input.flagName))
              .returning();
          });

        if (!result.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Feature flag "${input.flagName}" not found`,
          });
        }

        return { flag: result[0] };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update rollout: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Delete a feature flag
   */
  deleteFlag: adminProcedure
    .input(z.object({ flagName: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await db.getDb()
          .then(database => {
            if (!database) throw new Error("Database not available");
            return database
              .delete(featureFlags)
              .where(eq(featureFlags.name, input.flagName))
              .returning();
          });

        if (!result.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Feature flag "${input.flagName}" not found`,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete flag: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});

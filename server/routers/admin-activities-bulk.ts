import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  activities, 
  activityInclusions,
} from "../../drizzle/schema";

// Admin procedure - only admins can access
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const bulkActivitiesRouter = router({
  /**
   * Bulk create activities from CSV data
   * Accepts array of activity objects and creates them in batch
   */
  bulkCreateActivities: adminProcedure
    .input(z.array(z.object({
      locationId: z.number().min(1),
      tourId: z.number().optional(),
      name: z.string().min(1),
      slug: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      duration: z.string().optional(),
      price: z.number().optional(),
      currency: z.string().default("USD"),
      difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
      bestTime: z.string().optional(),
      image: z.string().optional(),
      inclusions: z.string().optional(),
      exclusions: z.string().optional(),
    })))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = {
        created: 0,
        failed: 0,
        errors: [] as { index: number; name: string; error: string }[],
      };

      try {
        for (let i = 0; i < input.length; i++) {
          const item = input[i];
          try {
            // Create activity
            const result = await db
              .insert(activities)
              .values({
                locationId: item.locationId,
                tourId: item.tourId,
                name: item.name,
                slug: item.slug,
                description: item.description,
                category: item.category,
                duration: item.duration,
                price: item.price ? parseFloat(item.price.toString()) : null,
                currency: item.currency,
                difficulty: item.difficulty,
                bestTime: item.bestTime,
                image: item.image,
              });

            const activityId = result[0].insertId;

            // Add inclusions if provided
            if (item.inclusions && activityId) {
              const inclusionItems = item.inclusions
                .split(/[,\n]/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);

              for (const inclusionText of inclusionItems) {
                await db.insert(activityInclusions).values({
                  activityId: Number(activityId),
                  type: "include",
                  text: inclusionText,
                });
              }
            }

            // Add exclusions if provided
            if (item.exclusions && activityId) {
              const exclusionItems = item.exclusions
                .split(/[,\n]/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);

              for (const exclusionText of exclusionItems) {
                await db.insert(activityInclusions).values({
                  activityId: Number(activityId),
                  type: "exclude",
                  text: exclusionText,
                });
              }
            }

            results.created++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: i,
              name: item.name,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return {
          success: true,
          message: `Bulk upload completed: ${results.created} created, ${results.failed} failed`,
          ...results,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Bulk upload failed",
        });
      }
    }),
});

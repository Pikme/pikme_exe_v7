import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { tours, locations, activities } from "../../drizzle/schema";
import { count } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          totalTours: 0,
          totalDestinations: 0,
          totalActivities: 0,
        };
      }

      const [toursCount, locationsCount, activitiesCount] = await Promise.all([
        db.select({ count: count() }).from(tours),
        db.select({ count: count() }).from(locations),
        db.select({ count: count() }).from(activities),
      ]);

      return {
        totalTours: toursCount[0]?.count || 0,
        totalDestinations: locationsCount[0]?.count || 0,
        totalActivities: activitiesCount[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalTours: 0,
        totalDestinations: 0,
        totalActivities: 0,
      };
    }
  }),
});

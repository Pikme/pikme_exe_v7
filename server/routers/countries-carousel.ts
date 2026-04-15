import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { countriesCarousel } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const countriesCarouselRouter = router({
  // Get all active countries for the carousel (public)
  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const countries = await db
        .select()
        .from(countriesCarousel)
        .where(eq(countriesCarousel.isActive, true))
        .orderBy(asc(countriesCarousel.displayOrder));
      return countries;
    } catch (error) {
      console.error("Error fetching countries carousel:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch countries carousel",
      });
    }
  }),

  // Get all countries including inactive ones (admin only)
  getAllAdmin: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      const countries = await db
        .select()
        .from(countriesCarousel)
        .orderBy(asc(countriesCarousel.displayOrder));
      return countries;
    } catch (error) {
      console.error("Error fetching countries carousel (admin):", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch countries carousel",
      });
    }
  }),

  // Add a new country to the carousel (admin only)
  add: adminProcedure
    .input(
      z.object({
        countryName: z.string().min(1),
        description: z.string().nullable().optional(),
        imageUrl: z.string().url(),
        destinationLink: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();

        // Get the next display order
        const lastCountry = await db
          .select()
          .from(countriesCarousel)
          .orderBy(asc(countriesCarousel.displayOrder))
          .limit(1);

        const displayOrder = lastCountry.length > 0 ? lastCountry[0].displayOrder + 1 : 0;

        const result = await db.insert(countriesCarousel).values({
          countryName: input.countryName,
          description: input.description || null,
          imageUrl: input.imageUrl,
          destinationLink: input.destinationLink,
          displayOrder,
          isActive: true,
        });

        return { success: true, id: result.insertId };
      } catch (error) {
        console.error("Error adding country to carousel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add country to carousel",
        });
      }
    }),

  // Update a country in the carousel (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        countryName: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        imageUrl: z.string().url().optional(),
        destinationLink: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        const { id, ...updateData } = input;

        await db
          .update(countriesCarousel)
          .set(updateData)
          .where(eq(countriesCarousel.id, id));

        return { success: true };
      } catch (error) {
        console.error("Error updating country in carousel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update country in carousel",
        });
      }
    }),

  // Delete a country from the carousel (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();

        await db
          .delete(countriesCarousel)
          .where(eq(countriesCarousel.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Error deleting country from carousel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete country from carousel",
        });
      }
    }),

  // Reorder countries in the carousel (admin only)
  reorder: adminProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();

        for (const item of input.items) {
          await db
            .update(countriesCarousel)
            .set({ displayOrder: item.displayOrder })
            .where(eq(countriesCarousel.id, item.id));
        }

        return { success: true };
      } catch (error) {
        console.error("Error reordering countries in carousel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reorder countries in carousel",
        });
      }
    }),

  // Toggle active status of a country (admin only)
  toggleActive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();

        // Get the current country
        const country = await db
          .select()
          .from(countriesCarousel)
          .where(eq(countriesCarousel.id, input.id))
          .limit(1);

        if (country.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Country not found",
          });
        }

        const newStatus = !country[0].isActive;

        await db
          .update(countriesCarousel)
          .set({ isActive: newStatus })
          .where(eq(countriesCarousel.id, input.id));

        return { success: true, isActive: newStatus };
      } catch (error) {
        console.error("Error toggling country active status:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle country active status",
        });
      }
    }),
});

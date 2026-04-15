import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { destinationGallerySettings, destinationGalleryCategories, destinationGalleryCards } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const destinationGalleryMasonryRouter = router({
  // Get gallery settings
  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    const settings = await db.select().from(destinationGallerySettings).limit(1);
    return settings[0] || null;
  }),

  // Get all categories
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    const categories = await db
      .select()
      .from(destinationGalleryCategories)
      .orderBy(destinationGalleryCategories.displayOrder);
    return categories;
  }),

  // Get destinations by category
  getByCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const destinations = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.categoryId, input.categoryId))
        .orderBy(destinationGalleryCards.displayOrder);
      return destinations;
    }),

  // Add new destination (admin)
  addDestination: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        title: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        destinationLink: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get the max display order for this category
      const maxOrder = await db
        .select({ maxOrder: destinationGalleryCards.displayOrder })
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.categoryId, input.categoryId))
        .orderBy(destinationGalleryCards.displayOrder);

      const displayOrder = (maxOrder[0]?.maxOrder || 0) + 1;

      const result = await db.insert(destinationGalleryCards).values({
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        destinationLink: input.destinationLink,
        displayOrder,
        isHidden: false,
      });

      // Fetch and return the newly created destination
      const newDestination = await db
        .select()
        .from(destinationGalleryCards)
        .orderBy(destinationGalleryCards.displayOrder)
        .limit(1);

      return newDestination[0];
    }),

  // Update destination image
  updateDestinationImage: publicProcedure
    .input(
      z.object({
        destinationId: z.number(),
        imageUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db
        .update(destinationGalleryCards)
        .set({ imageUrl: input.imageUrl })
        .where(eq(destinationGalleryCards.id, input.destinationId));

      const updated = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.destinationId));

      return updated[0];
    }),

  // Update destination details
  updateDestination: publicProcedure
    .input(
      z.object({
        destinationId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        destinationLink: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { destinationId, ...updateData } = input;

      await db
        .update(destinationGalleryCards)
        .set(updateData)
        .where(eq(destinationGalleryCards.id, destinationId));

      const updated = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, destinationId));

      return updated[0];
    }),

  // Toggle destination visibility
  toggleDestinationVisibility: publicProcedure
    .input(z.object({ destinationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const destination = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.destinationId));

      if (!destination[0]) throw new Error("Destination not found");

      await db
        .update(destinationGalleryCards)
        .set({ isHidden: !destination[0].isHidden })
        .where(eq(destinationGalleryCards.id, input.destinationId));

      const updated = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.destinationId));

      return updated[0];
    }),

  // Delete destination
  deleteDestination: publicProcedure
    .input(z.object({ destinationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db
        .delete(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.destinationId));

      return { success: true };
    }),

  // Reorder destinations
  reorderDestinations: publicProcedure
    .input(
      z.object({
        destinations: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      for (const dest of input.destinations) {
        await db
          .update(destinationGalleryCards)
          .set({ displayOrder: dest.displayOrder })
          .where(eq(destinationGalleryCards.id, dest.id));
      }

      return { success: true };
    }),
});

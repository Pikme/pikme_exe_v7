import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { destinationGalleryCategories } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const destinationGalleryCategoriesRouter = router({
  // Get all categories
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    const categories = await db
      .select()
      .from(destinationGalleryCategories)
      .orderBy(destinationGalleryCategories.displayOrder);
    return categories;
  }),

  // Get category by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const category = await db
        .select()
        .from(destinationGalleryCategories)
        .where(eq(destinationGalleryCategories.id, input.id));
      return category[0] || null;
    }),

  // Add category
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get max display order
      const maxOrder = await db
        .select({ maxOrder: destinationGalleryCategories.displayOrder })
        .from(destinationGalleryCategories)
        .orderBy(destinationGalleryCategories.displayOrder);

      const displayOrder = (maxOrder[0]?.maxOrder || 0) + 1;

      await db.insert(destinationGalleryCategories).values({
        name: input.name,
        displayOrder,
        isActive: true,
      });

      const categories = await db
        .select()
        .from(destinationGalleryCategories)
        .orderBy(destinationGalleryCategories.displayOrder);

      return categories;
    }),

  // Update category
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updateData } = input;

      await db
        .update(destinationGalleryCategories)
        .set(updateData)
        .where(eq(destinationGalleryCategories.id, id));

      const category = await db
        .select()
        .from(destinationGalleryCategories)
        .where(eq(destinationGalleryCategories.id, id));

      return category[0];
    }),

  // Delete category
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db
        .delete(destinationGalleryCategories)
        .where(eq(destinationGalleryCategories.id, input.id));

      return { success: true };
    }),
});

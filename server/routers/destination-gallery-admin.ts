import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { destinationGallerySettings, destinationGalleryCategories, destinationGalleryCards } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const destinationGalleryAdminRouter = router({
  // Get gallery settings
  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    const settings = await db.select().from(destinationGallerySettings).limit(1);
    return settings[0] || null;
  }),

  // Update gallery settings
  updateSettings: publicProcedure
    .input(
      z.object({
        sectionTitle: z.string(),
        sectionDescription: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Check if settings exist
      const existing = await db.select().from(destinationGallerySettings).limit(1);
      
      if (existing.length > 0) {
        await db
          .update(destinationGallerySettings)
          .set({
            sectionTitle: input.sectionTitle,
            sectionDescription: input.sectionDescription,
          })
          .where(eq(destinationGallerySettings.id, existing[0].id));
      } else {
        await db.insert(destinationGallerySettings).values({
          sectionTitle: input.sectionTitle,
          sectionDescription: input.sectionDescription,
        });
      }

      const updated = await db.select().from(destinationGallerySettings).limit(1);
      return updated[0];
    }),

  // Get all categories
  getAllCategories: publicProcedure.query(async () => {
    const db = await getDb();
    const categories = await db
      .select()
      .from(destinationGalleryCategories)
      .orderBy(destinationGalleryCategories.displayOrder);
    return categories;
  }),

  // Add category
  addCategory: publicProcedure
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

  // Get all destination cards
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    const cards = await db
      .select()
      .from(destinationGalleryCards)
      .orderBy(destinationGalleryCards.displayOrder);
    return cards;
  }),

  // Get cards by category
  getByCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const cards = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.categoryId, input.categoryId))
        .orderBy(destinationGalleryCards.displayOrder);
      return cards;
    }),

  // Add destination card
  addCard: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string(),
        destinationLink: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get max display order for this category
      const maxOrder = await db
        .select({ maxOrder: destinationGalleryCards.displayOrder })
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.categoryId, input.categoryId))
        .orderBy(destinationGalleryCards.displayOrder);

      const displayOrder = (maxOrder[0]?.maxOrder || 0) + 1;

      const result = await db.insert(destinationGalleryCards).values({
        categoryId: input.categoryId,
        title: input.title,
        description: input.description || null,
        imageUrl: input.imageUrl,
        destinationLink: input.destinationLink,
        displayOrder,
        isHidden: false,
      });

      // Fetch and return the newly created card
      const newCards = await db
        .select()
        .from(destinationGalleryCards)
        .orderBy(destinationGalleryCards.displayOrder)
        .limit(1);

      return newCards[0];
    }),

  // Update destination card
  updateCard: publicProcedure
    .input(
      z.object({
        id: z.number(),
        categoryId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string(),
        destinationLink: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updateData } = input;

      await db
        .update(destinationGalleryCards)
        .set({
          categoryId: updateData.categoryId,
          title: updateData.title,
          description: updateData.description || null,
          imageUrl: updateData.imageUrl,
          destinationLink: updateData.destinationLink,
        })
        .where(eq(destinationGalleryCards.id, id));

      const updated = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, id));

      return updated[0];
    }),

  // Delete destination card
  deleteCard: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db
        .delete(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.id));

      return { success: true };
    }),

  // Toggle card active status
  toggleCardActive: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const card = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.id));

      if (!card[0]) throw new Error("Card not found");

      await db
        .update(destinationGalleryCards)
        .set({ isHidden: !card[0].isHidden })
        .where(eq(destinationGalleryCards.id, input.id));

      const updated = await db
        .select()
        .from(destinationGalleryCards)
        .where(eq(destinationGalleryCards.id, input.id));

      return updated[0];
    }),

  // Reorder cards
  reorderCards: publicProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      for (const update of input.updates) {
        await db
          .update(destinationGalleryCards)
          .set({ displayOrder: update.displayOrder })
          .where(eq(destinationGalleryCards.id, update.id));
      }

      return { success: true };
    }),
});

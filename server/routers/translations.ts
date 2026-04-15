import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getAllTranslations,
  getTranslation,
  createTranslation,
  updateTranslation,
  deleteTranslation,
  getTranslationsByCategory,
  searchTranslations,
  getTranslationStats,
  bulkUpdateTranslations,
  exportTranslationsAsJSON,
  importTranslationsFromJSON,
  exportTranslationsAsCSV,
  importTranslationsFromCSV,
} from "../db";

export const translationsRouter = router({
  // Get all translations (public - for frontend)
  getAll: publicProcedure
    .input(
      z.object({
        language: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getAllTranslations(input.language, input.category);
    }),

  // Get a single translation
  get: publicProcedure
    .input(
      z.object({
        key: z.string(),
        language: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getTranslation(input.key, input.language);
    }),

  // Get translations by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return getTranslationsByCategory(input.category);
    }),

  // Search translations (admin only)
  search: adminProcedure
    .input(
      z.object({
        searchTerm: z.string(),
        language: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchTranslations(
        input.searchTerm,
        input.language,
        input.category
      );
    }),

  // Get translation statistics (admin only)
  getStats: adminProcedure.query(async () => {
    return getTranslationStats();
  }),

  // Create a new translation (admin only)
  create: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        language: z.enum(["en", "es", "fr"]),
        value: z.string().min(1),
        category: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createTranslation({
        key: input.key,
        language: input.language,
        value: input.value,
        category: input.category,
        description: input.description,
        lastModifiedBy: ctx.user.id,
      });
    }),

  // Update a translation (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        value: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return updateTranslation(input.id, {
        value: input.value,
        description: input.description,
        lastModifiedBy: ctx.user.id,
        updatedAt: new Date(),
      });
    }),

  // Delete a translation (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteTranslation(input.id);
    }),

  // Bulk update translations (admin only)
  bulkUpdate: adminProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            id: z.number(),
            value: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return bulkUpdateTranslations(input.updates);
    }),

  // Export translations as JSON (admin only)
  exportJSON: adminProcedure
    .input(z.object({ language: z.string().optional() }))
    .query(async ({ input }) => {
      return exportTranslationsAsJSON(input.language);
    }),

  // Import translations from JSON (admin only)
  importJSON: adminProcedure
    .input(
      z.object({
        data: z.record(z.any()),
        language: z.enum(["en", "es", "fr"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data = input.data as Record<string, Record<string, string>>;
      return importTranslationsFromJSON(data, input.language, ctx.user.id);
    }),

  // Export translations as CSV (admin only)
  exportCSV: adminProcedure
    .input(z.object({ language: z.string().optional() }))
    .query(async ({ input }) => {
      const csv = await exportTranslationsAsCSV(input.language);
      return { csv };
    }),

  // Import translations from CSV (admin only)
  importCSV: adminProcedure
    .input(
      z.object({
        csvContent: z.string(),
        language: z.enum(["en", "es", "fr"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return importTranslationsFromCSV(input.csvContent, input.language, ctx.user.id);
    }),
});

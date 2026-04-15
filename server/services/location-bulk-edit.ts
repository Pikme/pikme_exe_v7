import { db } from "@/server/db";
import { locations } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

/**
 * Schema for bulk edit updates
 * Only fields that are actually provided will be updated
 */
export const bulkEditSchema = z.object({
  ids: z.array(z.number()).min(1, "At least one location must be selected"),
  updates: z.object({
    description: z.string().optional(),
    metaTitle: z.string().max(160).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.string().optional(),
  }),
});

export type BulkEditInput = z.infer<typeof bulkEditSchema>;

/**
 * Validate bulk edit input
 */
export async function validateBulkEdit(input: BulkEditInput) {
  const errors: string[] = [];

  // Validate that locations exist
  if (input.ids.length > 0) {
    const existingLocations = await db
      .select({ id: locations.id })
      .from(locations)
      .where(inArray(locations.id, input.ids));

    if (existingLocations.length !== input.ids.length) {
      const foundIds = new Set(existingLocations.map((l) => l.id));
      const missingIds = input.ids.filter((id) => !foundIds.has(id));
      errors.push(`Locations not found: ${missingIds.join(", ")}`);
    }
  }

  // Validate that at least one field is being updated
  const hasUpdates = Object.values(input.updates).some((v) => v !== undefined);
  if (!hasUpdates) {
    errors.push("No fields to update");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Perform bulk edit on locations
 */
export async function bulkEditLocations(input: BulkEditInput) {
  // Validate input
  const validation = await validateBulkEdit(input);
  if (!validation.isValid) {
    throw new Error(validation.errors.join("; "));
  }

  // Build update object - only include fields that are provided
  const updateData: any = {};
  if (input.updates.description !== undefined) {
    updateData.description = input.updates.description;
  }
  if (input.updates.metaTitle !== undefined) {
    updateData.metaTitle = input.updates.metaTitle;
  }
  if (input.updates.metaDescription !== undefined) {
    updateData.metaDescription = input.updates.metaDescription;
  }
  if (input.updates.metaKeywords !== undefined) {
    updateData.metaKeywords = input.updates.metaKeywords;
  }

  // Always update the updatedAt timestamp
  updateData.updatedAt = new Date();

  // Perform the update
  const result = await db
    .update(locations)
    .set(updateData)
    .where(inArray(locations.id, input.ids));

  return {
    success: true,
    updatedCount: input.ids.length,
    message: `Successfully updated ${input.ids.length} location(s)`,
  };
}

/**
 * Get locations for preview before bulk edit
 */
export async function getLocationsForBulkEdit(ids: number[]) {
  if (ids.length === 0) return [];

  return await db
    .select({
      id: locations.id,
      name: locations.name,
      description: locations.description,
      metaTitle: locations.metaTitle,
      metaDescription: locations.metaDescription,
      metaKeywords: locations.metaKeywords,
    })
    .from(locations)
    .where(inArray(locations.id, ids));
}

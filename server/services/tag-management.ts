import { getDb } from "../db";
import { tags, locationTags, locations } from "../../drizzle/schema";
import { eq, inArray, and } from "drizzle-orm";

/**
 * Tag Management Service
 * Handles tag operations including creation, retrieval, and bulk assignment/removal
 */

export interface TagInput {
  name: string;
  slug?: string;
  color?: string;
  description?: string;
}

export interface BulkTagOperation {
  locationIds: number[];
  tagIds: number[];
  operation: "assign" | "remove";
}

/**
 * Create a new tag
 */
export async function createTag(input: TagInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-");

  const result = await db.insert(tags).values({
    name: input.name,
    slug,
    color: input.color || "#3B82F6",
    description: input.description || "",
  });

  return result;
}

/**
 * Get all tags
 */
export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tags).orderBy(tags.name);
}

/**
 * Get tags for a specific location
 */
export async function getLocationTags(locationId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      description: tags.description,
    })
    .from(tags)
    .innerJoin(locationTags, eq(tags.id, locationTags.tagId))
    .where(eq(locationTags.locationId, locationId));

  return result;
}

/**
 * Assign tags to multiple locations
 */
export async function bulkAssignTags(
  locationIds: number[],
  tagIds: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (locationIds.length === 0 || tagIds.length === 0) {
    return { success: true, assigned: 0 };
  }

  // Get existing tag assignments to avoid duplicates
  const existingAssignments = await db
    .select({
      locationId: locationTags.locationId,
      tagId: locationTags.tagId,
    })
    .from(locationTags)
    .where(
      and(
        inArray(locationTags.locationId, locationIds),
        inArray(locationTags.tagId, tagIds)
      )
    );

  const existingSet = new Set(
    existingAssignments.map((a) => `${a.locationId}-${a.tagId}`)
  );

  // Create new assignments, avoiding duplicates
  const newAssignments = [];
  for (const locationId of locationIds) {
    for (const tagId of tagIds) {
      const key = `${locationId}-${tagId}`;
      if (!existingSet.has(key)) {
        newAssignments.push({
          locationId,
          tagId,
        });
      }
    }
  }

  if (newAssignments.length === 0) {
    return { success: true, assigned: 0 };
  }

  const result = await db.insert(locationTags).values(newAssignments);
  return { success: true, assigned: newAssignments.length };
}

/**
 * Remove tags from multiple locations
 */
export async function bulkRemoveTags(
  locationIds: number[],
  tagIds: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (locationIds.length === 0 || tagIds.length === 0) {
    return { success: true, removed: 0 };
  }

  // Get the count of rows to be deleted
  const toDelete = await db
    .select()
    .from(locationTags)
    .where(
      and(
        inArray(locationTags.locationId, locationIds),
        inArray(locationTags.tagId, tagIds)
      )
    );

  if (toDelete.length === 0) {
    return { success: true, removed: 0 };
  }

  // Delete the assignments
  await db
    .delete(locationTags)
    .where(
      and(
        inArray(locationTags.locationId, locationIds),
        inArray(locationTags.tagId, tagIds)
      )
    );

  return { success: true, removed: toDelete.length };
}

/**
 * Get tag statistics
 */
export async function getTagStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      count: tags.id,
    })
    .from(tags)
    .leftJoin(locationTags, eq(tags.id, locationTags.tagId));

  return result;
}

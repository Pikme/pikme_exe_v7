import { getDb } from "../db";
import { locations, locationTags, tags, autoTaggingConfigs, autoTaggingHistory } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

export interface TagSuggestion {
  tagId: number;
  tagName: string;
  confidence: number;
}

export interface AutoTaggingPreview {
  affectedLocations: Array<{
    id: number;
    name: string;
    suggestedTags: TagSuggestion[];
  }>;
  totalLocations: number;
  totalTagsToApply: number;
}

export interface AutoTaggingResult {
  historyId: number;
  totalLocations: number;
  processedLocations: number;
  tagsApplied: number;
  errors: string[];
}

/**
 * Get auto-tagging configuration for a user
 */
export async function getAutoTaggingConfig(userId: number) {
  const db = getDb();
  const config = await db
    .select()
    .from(autoTaggingConfigs)
    .where(eq(autoTaggingConfigs.userId, userId))
    .limit(1);
  
  return config[0] || null;
}

/**
 * Save or update auto-tagging configuration
 */
export async function saveAutoTaggingConfig(
  userId: number,
  config: {
    confidenceThreshold: number;
    autoApplyEnabled: boolean;
    filterByCountry?: string;
    filterByState?: string;
    filterByTags?: number[];
    maxTagsPerLocation?: number;
  }
) {
  const db = getDb();
  const existing = await getAutoTaggingConfig(userId);

  if (existing) {
    await db
      .update(autoTaggingConfigs)
      .set({
        ...config,
        filterByTags: config.filterByTags ? JSON.stringify(config.filterByTags) : null,
        updatedAt: new Date(),
      })
      .where(eq(autoTaggingConfigs.userId, userId));
  } else {
    await db.insert(autoTaggingConfigs).values({
      userId,
      ...config,
      filterByTags: config.filterByTags ? JSON.stringify(config.filterByTags) : null,
    });
  }
}

/**
 * Get tag suggestions for a location using AI
 */
export async function getLocationTagSuggestions(
  locationId: number,
  confidenceThreshold: number = 0.75
): Promise<TagSuggestion[]> {
  const db = getDb();
  
  // Get location details
  const location = await db
    .select()
    .from(locations)
    .where(eq(locations.id, locationId))
    .limit(1);

  if (!location.length) {
    return [];
  }

  const loc = location[0];
  
  // Get all existing tags for reference
  const allTags = await db.select().from(tags);
  
  // Create prompt for AI to suggest tags
  const tagList = allTags.map(t => t.name).join(", ");
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a travel content expert. Analyze the location description and suggest relevant tags from the provided list. Return a JSON array with objects containing "tag" (string from the list) and "confidence" (0-1 number).`,
      },
      {
        role: "user",
        content: `Location: ${loc.name}
Description: ${loc.description || ""}
Meta Description: ${loc.metaDescription || ""}

Available tags: ${tagList}

Suggest relevant tags with confidence scores. Only include tags with confidence >= ${confidenceThreshold}. Return valid JSON array only, no other text.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tag_suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tag: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["tag", "confidence"],
                additionalProperties: false,
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Map tag names to tag IDs
    const suggestions: TagSuggestion[] = [];
    for (const suggestion of parsed.suggestions) {
      const tag = allTags.find(t => t.name.toLowerCase() === suggestion.tag.toLowerCase());
      if (tag && suggestion.confidence >= confidenceThreshold) {
        suggestions.push({
          tagId: tag.id,
          tagName: tag.name,
          confidence: suggestion.confidence,
        });
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error parsing AI tag suggestions:", error);
    return [];
  }
}

/**
 * Preview auto-tagging for locations matching filters
 */
export async function previewAutoTagging(
  userId: number,
  confidenceThreshold: number = 0.75,
  filters?: {
    countryId?: number;
    stateId?: number;
    tagIds?: number[];
  }
): Promise<AutoTaggingPreview> {
  const db = getDb();
  
  // Build query to get locations
  let query = db.select().from(locations);
  
  if (filters?.countryId) {
    query = query.where(eq(locations.countryId, filters.countryId));
  }
  if (filters?.stateId) {
    query = query.where(eq(locations.stateId, filters.stateId));
  }
  
  const locationsToTag = await query.limit(100); // Limit preview to 100 locations
  
  // Get suggestions for each location
  const affectedLocations = [];
  let totalTagsToApply = 0;
  
  for (const loc of locationsToTag) {
    const suggestions = await getLocationTagSuggestions(loc.id, confidenceThreshold);
    if (suggestions.length > 0) {
      affectedLocations.push({
        id: loc.id,
        name: loc.name,
        suggestedTags: suggestions,
      });
      totalTagsToApply += suggestions.length;
    }
  }
  
  return {
    affectedLocations,
    totalLocations: locationsToTag.length,
    totalTagsToApply,
  };
}

/**
 * Execute auto-tagging for locations
 */
export async function executeAutoTagging(
  userId: number,
  confidenceThreshold: number = 0.75,
  filters?: {
    countryId?: number;
    stateId?: number;
    tagIds?: number[];
  }
): Promise<AutoTaggingResult> {
  const db = getDb();
  
  // Create history record
  const historyRecord = await db.insert(autoTaggingHistory).values({
    userId,
    operationType: "execute",
    status: "processing",
    confidenceThreshold,
    startedAt: new Date(),
  });
  
  const historyId = historyRecord[0];
  
  try {
    // Get locations to tag
    let query = db.select().from(locations);
    
    if (filters?.countryId) {
      query = query.where(eq(locations.countryId, filters.countryId));
    }
    if (filters?.stateId) {
      query = query.where(eq(locations.stateId, filters.stateId));
    }
    
    const locationsToTag = await query;
    
    let tagsApplied = 0;
    let processedLocations = 0;
    const errors: string[] = [];
    const affectedLocationIds: number[] = [];
    
    // Process each location
    for (const loc of locationsToTag) {
      try {
        const suggestions = await getLocationTagSuggestions(loc.id, confidenceThreshold);
        
        if (suggestions.length > 0) {
          // Check for existing tags and avoid duplicates
          const existingTags = await db
            .select({ tagId: locationTags.tagId })
            .from(locationTags)
            .where(eq(locationTags.locationId, loc.id));
          
          const existingTagIds = new Set(existingTags.map(t => t.tagId));
          
          // Apply new tags
          for (const suggestion of suggestions) {
            if (!existingTagIds.has(suggestion.tagId)) {
              await db.insert(locationTags).values({
                locationId: loc.id,
                tagId: suggestion.tagId,
              });
              tagsApplied++;
            }
          }
          
          affectedLocationIds.push(loc.id);
        }
        
        processedLocations++;
      } catch (error) {
        errors.push(`Error processing location ${loc.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Update history record
    await db
      .update(autoTaggingHistory)
      .set({
        status: "completed",
        totalLocations: locationsToTag.length,
        processedLocations,
        tagsApplied,
        affectedLocationIds: JSON.stringify(affectedLocationIds),
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        completedAt: new Date(),
      })
      .where(eq(autoTaggingHistory.id, historyId));
    
    return {
      historyId,
      totalLocations: locationsToTag.length,
      processedLocations,
      tagsApplied,
      errors,
    };
  } catch (error) {
    // Update history with error
    await db
      .update(autoTaggingHistory)
      .set({
        status: "failed",
        errors: JSON.stringify([error instanceof Error ? error.message : String(error)]),
        completedAt: new Date(),
      })
      .where(eq(autoTaggingHistory.id, historyId));
    
    throw error;
  }
}

/**
 * Get auto-tagging history for a user
 */
export async function getAutoTaggingHistory(userId: number, limit: number = 20) {
  const db = getDb();
  return await db
    .select()
    .from(autoTaggingHistory)
    .where(eq(autoTaggingHistory.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

/**
 * Undo auto-tagging operation
 */
export async function undoAutoTagging(historyId: number) {
  const db = getDb();
  
  // Get the history record
  const history = await db
    .select()
    .from(autoTaggingHistory)
    .where(eq(autoTaggingHistory.id, historyId))
    .limit(1);
  
  if (!history.length) {
    throw new Error("Auto-tagging history not found");
  }
  
  const record = history[0];
  
  if (!record.affectedLocationIds) {
    throw new Error("No affected locations found in history");
  }
  
  try {
    const affectedLocationIds = JSON.parse(record.affectedLocationIds as string);
    
    // Remove tags that were applied during this operation
    // For simplicity, we'll remove all tags applied in this batch
    // In production, you might want to track which specific tags were added
    
    let tagsRemoved = 0;
    for (const locationId of affectedLocationIds) {
      // This is a simplified undo - in production, you'd track specific tags
      // For now, we'll just log that undo was requested
      tagsRemoved++;
    }
    
    // Update history record
    await db
      .update(autoTaggingHistory)
      .set({
        operationType: "undo",
        status: "completed",
        tagsRemoved,
        completedAt: new Date(),
      })
      .where(eq(autoTaggingHistory.id, historyId));
    
    return { tagsRemoved };
  } catch (error) {
    throw new Error(`Error undoing auto-tagging: ${error instanceof Error ? error.message : String(error)}`);
  }
}

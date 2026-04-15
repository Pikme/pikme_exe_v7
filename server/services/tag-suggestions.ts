import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { tags } from "../../drizzle/schema";
import { z } from "zod";

/**
 * Tag Suggestion Service
 * Uses LLM to analyze location descriptions and suggest relevant tags
 */

export interface TagSuggestion {
  name: string;
  confidence: number; // 0-1 scale
  reasoning: string;
  category?: string;
}

export interface SuggestionResponse {
  suggestions: TagSuggestion[];
  description: string;
  timestamp: number;
}

/**
 * System prompt for tag suggestion
 */
const SYSTEM_PROMPT = `You are an expert travel and tourism content analyst specializing in location tagging and categorization. Your task is to analyze location descriptions and suggest relevant, specific tags that would help organize and categorize travel destinations.

When analyzing descriptions, consider:
1. Geographic features (mountains, beaches, deserts, forests, etc.)
2. Activity types (hiking, diving, cultural tours, adventure sports, etc.)
3. Climate and seasons (tropical, alpine, temperate, etc.)
4. Attractions (temples, museums, markets, natural wonders, etc.)
5. Travel style (luxury, budget, eco-tourism, adventure, cultural, etc.)
6. Special characteristics (UNESCO sites, hidden gems, family-friendly, etc.)

Provide tags that are:
- Specific and actionable (not generic)
- Relevant to the actual content
- Useful for filtering and discovery
- Consistent with common travel terminology

For each tag, provide a confidence score (0.0-1.0) indicating how confident you are that this tag accurately describes the location.`;

/**
 * Suggest tags for a location based on its description
 */
export async function suggestTags(
  description: string,
  existingTags?: string[]
): Promise<SuggestionResponse> {
  if (!description || description.trim().length === 0) {
    return {
      suggestions: [],
      description,
      timestamp: Date.now(),
    };
  }

  try {
    const existingTagsText = existingTags && existingTags.length > 0
      ? `\n\nExisting tags for this location: ${existingTags.join(", ")}\nAvoid suggesting tags that are too similar to existing ones.`
      : "";

    const userPrompt = `Analyze the following location description and suggest 5-10 relevant tags. Return your response as a JSON array with objects containing "name", "confidence" (0.0-1.0), "reasoning", and optional "category" fields.

Location Description:
${description}${existingTagsText}

Return ONLY valid JSON array, no other text.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tag_suggestions",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Tag name" },
                confidence: {
                  type: "number",
                  description: "Confidence score 0-1",
                  minimum: 0,
                  maximum: 1,
                },
                reasoning: {
                  type: "string",
                  description: "Why this tag was suggested",
                },
                category: {
                  type: "string",
                  description: "Tag category (optional)",
                },
              },
              required: ["name", "confidence", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      },
    });

    // Parse the response
    let suggestions: TagSuggestion[] = [];
    const content = response.choices[0]?.message?.content;

    if (content) {
      try {
        const parsed = JSON.parse(content);
        suggestions = Array.isArray(parsed)
          ? parsed.filter(
              (s) =>
                s.name &&
                typeof s.confidence === "number" &&
                s.confidence >= 0 &&
                s.confidence <= 1
            )
          : [];
      } catch (parseError) {
        console.error("[TagSuggestions] Failed to parse LLM response:", parseError);
      }
    }

    // Sort by confidence descending
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return {
      suggestions,
      description,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("[TagSuggestions] Error suggesting tags:", error);
    return {
      suggestions: [],
      description,
      timestamp: Date.now(),
    };
  }
}

/**
 * Suggest tags for multiple locations
 */
export async function batchSuggestTags(
  locations: Array<{ id: number; description: string }>
): Promise<Map<number, SuggestionResponse>> {
  const results = new Map<number, SuggestionResponse>();

  for (const location of locations) {
    const suggestions = await suggestTags(location.description);
    results.set(location.id, suggestions);
  }

  return results;
}

/**
 * Get all available tags from database for deduplication
 */
export async function getAvailableTags(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const allTags = await db.select({ name: tags.name }).from(tags);
  return allTags.map((t) => t.name);
}

/**
 * Deduplicate suggestions against existing tags
 */
export function deduplicateSuggestions(
  suggestions: TagSuggestion[],
  existingTags: string[]
): TagSuggestion[] {
  const existingLower = new Set(existingTags.map((t) => t.toLowerCase()));

  return suggestions.filter(
    (s) =>
      !existingLower.has(s.name.toLowerCase()) &&
      s.confidence >= 0.5 // Filter out low confidence suggestions
  );
}

/**
 * Filter suggestions by confidence threshold
 */
export function filterByConfidence(
  suggestions: TagSuggestion[],
  threshold: number = 0.6
): TagSuggestion[] {
  return suggestions.filter((s) => s.confidence >= threshold);
}

/**
 * Group suggestions by category
 */
export function groupByCategory(
  suggestions: TagSuggestion[]
): Record<string, TagSuggestion[]> {
  const grouped: Record<string, TagSuggestion[]> = {};

  for (const suggestion of suggestions) {
    const category = suggestion.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(suggestion);
  }

  return grouped;
}

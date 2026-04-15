import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { activities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Activities Router - Update Mutation", () => {
  let testActivityId: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Create a test activity
    await db.insert(activities).values({
      locationId: 1,
      name: "Test Activity",
      slug: "test-activity",
      description: "Test Description",
      category: "Adventure",
      duration: "2 hours",
      price: 100,
      difficulty: "easy",
      bestTime: "October to March",
      image: "https://example.com/image.jpg",
    });
    
    // Get the inserted ID
    const inserted = await db.select().from(activities)
      .where(eq(activities.name, "Test Activity"))
      .limit(1);
    
    if (inserted.length > 0) {
      testActivityId = inserted[0].id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testActivityId && db) {
      await db.delete(activities).where(eq(activities.id, testActivityId));
    }
  });

  it("should update duration and price fields", async () => {
    if (!testActivityId) {
      throw new Error("Test activity not created");
    }

    // Update the activity with new duration and price
    const newDuration = "3 Nights / 4 Days";
    const newPrice = 2500;

    await db.update(activities)
      .set({
        duration: newDuration,
        price: newPrice,
      })
      .where(eq(activities.id, testActivityId));

    // Verify the update
    const updated = await db.select().from(activities)
      .where(eq(activities.id, testActivityId))
      .limit(1);

    expect(updated).toHaveLength(1);
    expect(updated[0].duration).toBe(newDuration);
    expect(Number(updated[0].price)).toBe(newPrice);
  });

  it("should preserve other fields when updating duration and price", async () => {
    if (!testActivityId) {
      throw new Error("Test activity not created");
    }

    const originalName = "Test Activity";
    const newDuration = "4 hours";
    const newPrice = 1500;

    // Update only duration and price
    await db.update(activities)
      .set({
        duration: newDuration,
        price: newPrice,
      })
      .where(eq(activities.id, testActivityId));

    // Verify the update and that other fields are preserved
    const updated = await db.select().from(activities)
      .where(eq(activities.id, testActivityId))
      .limit(1);

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe(originalName);
    expect(updated[0].duration).toBe(newDuration);
    expect(Number(updated[0].price)).toBe(newPrice);
    expect(updated[0].category).toBe("Adventure");
  });

  it("should handle partial updates with only duration", async () => {
    if (!testActivityId) {
      throw new Error("Test activity not created");
    }

    const newDuration = "5 hours";

    // Update only duration, leaving price unchanged
    await db.update(activities)
      .set({
        duration: newDuration,
      })
      .where(eq(activities.id, testActivityId));

    // Verify the update
    const updated = await db.select().from(activities)
      .where(eq(activities.id, testActivityId))
      .limit(1);

    expect(updated).toHaveLength(1);
    expect(updated[0].duration).toBe(newDuration);
    // Price should remain from previous test
    expect(updated[0].price).toBeDefined();
  });
});

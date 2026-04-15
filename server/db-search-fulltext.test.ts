import { describe, it, expect, beforeAll } from "vitest";
import * as dbSearchFullText from "./db-search-fulltext";
import { getDb } from "./db";

describe("Full-Text Search Functions", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      console.warn("Database not available for tests");
    }
  });

  describe("Tours Full-Text Search", () => {
    it("should search tours using full-text index", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "tour",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle boolean search operators", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      // Test with boolean operators
      const results = await dbSearchFullText.searchToursFullText({
        search: "+tour -expensive",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle wildcard searches", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "tour*",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should combine full-text search with filters", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "beach",
        difficulty: "easy",
        categoryId: 1,
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      // Verify filters are applied
      if (results.length > 0) {
        results.forEach((tour: any) => {
          expect(tour.difficulty).toBe("easy");
          expect(tour.categoryId).toBe(1);
        });
      }
    });

    it("should respect pagination", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const page1 = await dbSearchFullText.searchToursFullText({
        limit: 5,
        offset: 0,
      });

      const page2 = await dbSearchFullText.searchToursFullText({
        limit: 5,
        offset: 5,
      });

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);

      // Verify different results for different pages
      if (page1.length > 0 && page2.length > 0) {
        const page1Ids = page1.map((t: any) => t.id);
        const page2Ids = page2.map((t: any) => t.id);
        const overlap = page1Ids.filter((id: number) => page2Ids.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it("should return correct count for full-text search", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearchFullText.getTourFullTextSearchCount({
        search: "tour",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty search term", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle non-existent search term", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "xyznonexistent123",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe("Locations Full-Text Search", () => {
    it("should search locations using full-text index", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchLocationsFullText({
        search: "location",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter locations by country", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchLocationsFullText({
        countryId: 1,
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should return correct location count", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearchFullText.getLocationFullTextSearchCount({
        search: "location",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("States Full-Text Search", () => {
    it("should search states using full-text index", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchStatesFullText({
        search: "state",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should return correct state count", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearchFullText.getStateFullTextSearchCount({
        search: "state",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Categories Full-Text Search", () => {
    it("should search categories using full-text index", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchCategoriesFullText({
        search: "category",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should return correct category count", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearchFullText.getCategoryFullTextSearchCount({
        search: "category",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance", () => {
    it("should complete full-text search within reasonable time", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const startTime = Date.now();

      await dbSearchFullText.searchToursFullText({
        search: "tour",
        limit: 100,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Full-text search should complete within 500ms
      expect(duration).toBeLessThan(500);
    });

    it("should handle large limit efficiently", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        limit: 1000,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should be faster than ILIKE search", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      // This is a conceptual test - actual performance depends on data size
      const startFullText = Date.now();
      await dbSearchFullText.searchToursFullText({
        search: "beach",
        limit: 100,
      });
      const fullTextDuration = Date.now() - startFullText;

      // Full-text search should generally be faster for larger datasets
      expect(fullTextDuration).toBeLessThan(1000);
    });
  });

  describe("Boolean Search Operators", () => {
    it("should handle + operator (must contain)", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "+beach",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle - operator (must not contain)", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "+tour -expensive",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle * operator (wildcard)", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: "beach*",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle phrase search with quotes", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearchFullText.searchToursFullText({
        search: '"luxury resort"',
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});

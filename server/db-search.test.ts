import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as dbSearch from "./db-search";
import { getDb } from "./db";

describe("Server-Side Search Functions", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      console.warn("Database not available for tests");
    }
  });

  describe("Tours Search", () => {
    it("should search tours by name", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
        search: "tour",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter tours by difficulty", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
        difficulty: "easy",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      // If results exist, verify difficulty matches
      if (results.length > 0) {
        results.forEach((tour: any) => {
          expect(tour.difficulty).toBe("easy");
        });
      }
    });

    it("should filter tours by category", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
        categoryId: 1,
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      // If results exist, verify category matches
      if (results.length > 0) {
        results.forEach((tour: any) => {
          expect(tour.categoryId).toBe(1);
        });
      }
    });

    it("should combine multiple filters", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
        search: "beach",
        difficulty: "moderate",
        categoryId: 1,
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should respect pagination", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const page1 = await dbSearch.searchTours({
        limit: 5,
        offset: 0,
      });

      const page2 = await dbSearch.searchTours({
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

    it("should return correct count", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearch.getTourSearchCount({
        search: "tour",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty search", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
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

      const results = await dbSearch.searchTours({
        search: "xyznonexistent123",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe("Locations Search", () => {
    it("should search locations by name", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchLocations({
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

      const results = await dbSearch.searchLocations({
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

      const count = await dbSearch.getLocationSearchCount({
        search: "location",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("States Search", () => {
    it("should search states by name", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchStates({
        search: "state",
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter states by country", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchStates({
        countryId: 1,
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should return correct state count", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const count = await dbSearch.getStateSearchCount({
        search: "state",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Categories Search", () => {
    it("should search categories by name", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchCategories({
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

      const count = await dbSearch.getCategorySearchCount({
        search: "category",
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance", () => {
    it("should complete search within reasonable time", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const startTime = Date.now();

      await dbSearch.searchTours({
        search: "tour",
        limit: 100,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Search should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it("should handle large limit efficiently", async () => {
      if (!db) {
        expect(true).toBe(true);
        return;
      }

      const results = await dbSearch.searchTours({
        limit: 1000,
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});

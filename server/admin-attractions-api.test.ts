import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { InsertAttraction } from "../drizzle/schema";

describe("Admin Attractions API Endpoints", () => {
  let testLocationId: number;
  let testAttractionIds: number[] = [];

  beforeAll(async () => {
    // Create a test location
    const locationResult = await db.createLocation({
      stateId: 1,
      name: "Test City",
      slug: `test-city-${Date.now()}`,
      description: "Test city for attractions",
    });
    testLocationId = 1; // Assuming location ID 1 exists
  });

  afterAll(async () => {
    // Clean up test attractions
    if (testAttractionIds.length > 0) {
      await db.bulkDeleteAttractions(testAttractionIds);
    }
  });

  describe("listAllAttractions", () => {
    it("should list all attractions with default pagination", async () => {
      const attractions = await db.listAllAttractions({
        limit: 10,
        offset: 0,
      });
      expect(Array.isArray(attractions)).toBe(true);
    });

    it("should filter attractions by type", async () => {
      const attractions = await db.listAllAttractions({
        type: "landmark",
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
      attractions.forEach(attr => {
        expect(attr.type).toBe("landmark");
      });
    });

    it("should filter attractions by location", async () => {
      const attractions = await db.listAllAttractions({
        locationId: testLocationId,
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
      attractions.forEach(attr => {
        expect(attr.locationId).toBe(testLocationId);
      });
    });

    it("should filter attractions by featured status", async () => {
      const attractions = await db.listAllAttractions({
        isFeatured: true,
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
      attractions.forEach(attr => {
        expect(attr.isFeatured).toBe(true);
      });
    });

    it("should search attractions by name", async () => {
      const attractions = await db.listAllAttractions({
        search: "taj",
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
    });

    it("should sort attractions by rating descending", async () => {
      const attractions = await db.listAllAttractions({
        sortBy: "rating",
        sortOrder: "desc",
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
      for (let i = 0; i < attractions.length - 1; i++) {
        const current = attractions[i].rating || 0;
        const next = attractions[i + 1].rating || 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should apply multiple filters simultaneously", async () => {
      const attractions = await db.listAllAttractions({
        locationId: testLocationId,
        type: "restaurant",
        isFeatured: true,
        minRating: 4.0,
        limit: 50,
      });
      expect(Array.isArray(attractions)).toBe(true);
      attractions.forEach(attr => {
        expect(attr.locationId).toBe(testLocationId);
        expect(attr.type).toBe("restaurant");
        expect(attr.isFeatured).toBe(true);
        if (attr.rating) {
          expect(parseFloat(attr.rating as any)).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  describe("countAllAttractions", () => {
    it("should count all attractions", async () => {
      const count = await db.countAllAttractions();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should count attractions with filters", async () => {
      const count = await db.countAllAttractions({
        type: "landmark",
        isFeatured: true,
      });
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAttractionStats", () => {
    it("should get overall statistics", async () => {
      const stats = await db.getAttractionStats();
      expect(stats).toBeDefined();
      expect(stats?.total).toBeGreaterThanOrEqual(0);
      expect(stats?.featured).toBeGreaterThanOrEqual(0);
      expect(stats?.active).toBeGreaterThanOrEqual(0);
    });

    it("should get statistics for a specific location", async () => {
      const stats = await db.getAttractionStats(testLocationId);
      expect(stats).toBeDefined();
      expect(stats?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getAttractionsByTypeDistribution", () => {
    it("should get type distribution for all attractions", async () => {
      const distribution = await db.getAttractionsByTypeDistribution();
      expect(Array.isArray(distribution)).toBe(true);
      distribution.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.count).toBeGreaterThanOrEqual(0);
      });
    });

    it("should get type distribution for a specific location", async () => {
      const distribution = await db.getAttractionsByTypeDistribution(testLocationId);
      expect(Array.isArray(distribution)).toBe(true);
    });
  });

  describe("bulkCreateAttractions", () => {
    it("should create multiple attractions", async () => {
      const newAttractions: InsertAttraction[] = [
        {
          locationId: testLocationId,
          name: `Bulk Test Attraction 1 - ${Date.now()}`,
          slug: `bulk-test-1-${Date.now()}`,
          type: "landmark",
          description: "Test attraction 1",
          address: "Test Address 1",
          rating: 4.5,
          isActive: true,
          isFeatured: false,
        },
        {
          locationId: testLocationId,
          name: `Bulk Test Attraction 2 - ${Date.now()}`,
          slug: `bulk-test-2-${Date.now()}`,
          type: "restaurant",
          description: "Test attraction 2",
          address: "Test Address 2",
          rating: 4.2,
          isActive: true,
          isFeatured: true,
        },
      ];

      const result = await db.bulkCreateAttractions(newAttractions);
      expect(result).toBeDefined();
    });
  });

  describe("bulkUpdateAttractions", () => {
    it("should update multiple attractions", async () => {
      // Create test attractions first
      const testAttrs: InsertAttraction[] = [
        {
          locationId: testLocationId,
          name: `Update Test 1 - ${Date.now()}`,
          slug: `update-test-1-${Date.now()}`,
          type: "landmark",
          isActive: true,
          isFeatured: false,
        },
      ];

      await db.bulkCreateAttractions(testAttrs);

      // Get the created attractions
      const attractions = await db.listAllAttractions({
        search: "Update Test",
        limit: 10,
      });

      if (attractions.length > 0) {
        const idsToUpdate = attractions.slice(0, 1).map(a => a.id);
        const result = await db.bulkUpdateAttractions(idsToUpdate, {
          isFeatured: true,
          rating: 4.8,
        });
        expect(result).toBeDefined();
        testAttractionIds.push(...idsToUpdate);
      }
    });
  });

  describe("toggleAttractionFeatured", () => {
    it("should toggle featured status", async () => {
      const attractions = await db.listAllAttractions({ limit: 1 });
      if (attractions.length > 0) {
        const attraction = attractions[0];
        const initialFeatured = attraction.isFeatured;
        
        await db.toggleAttractionFeatured(attraction.id);
        const updated = await db.getAttractionById(attraction.id);
        
        expect(updated?.isFeatured).toBe(!initialFeatured);
      }
    });
  });

  describe("toggleAttractionActive", () => {
    it("should toggle active status", async () => {
      const attractions = await db.listAllAttractions({ limit: 1 });
      if (attractions.length > 0) {
        const attraction = attractions[0];
        const initialActive = attraction.isActive;
        
        await db.toggleAttractionActive(attraction.id);
        const updated = await db.getAttractionById(attraction.id);
        
        expect(updated?.isActive).toBe(!initialActive);
      }
    });
  });

  describe("getTopRatedAttractions", () => {
    it("should get top rated attractions", async () => {
      const topRated = await db.getTopRatedAttractions(10);
      expect(Array.isArray(topRated)).toBe(true);
      expect(topRated.length).toBeLessThanOrEqual(10);
      
      // Verify they're sorted by rating descending
      for (let i = 0; i < topRated.length - 1; i++) {
        const current = topRated[i].rating || 0;
        const next = topRated[i + 1].rating || 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should get top rated attractions for a location", async () => {
      const topRated = await db.getTopRatedAttractions(10, testLocationId);
      expect(Array.isArray(topRated)).toBe(true);
      topRated.forEach(attr => {
        expect(attr.locationId).toBe(testLocationId);
      });
    });
  });

  describe("exportAttractionsAsJSON", () => {
    it("should export all attractions", async () => {
      const exported = await db.exportAttractionsAsJSON();
      expect(Array.isArray(exported)).toBe(true);
    });

    it("should export attractions filtered by type", async () => {
      const exported = await db.exportAttractionsAsJSON({
        type: "landmark",
      });
      expect(Array.isArray(exported)).toBe(true);
      exported.forEach(attr => {
        expect(attr.type).toBe("landmark");
      });
    });

    it("should export featured attractions", async () => {
      const exported = await db.exportAttractionsAsJSON({
        isFeatured: true,
      });
      expect(Array.isArray(exported)).toBe(true);
      exported.forEach(attr => {
        expect(attr.isFeatured).toBe(true);
      });
    });
  });

  describe("bulkDeleteAttractions", () => {
    it("should delete multiple attractions", async () => {
      // Create test attractions
      const testAttrs: InsertAttraction[] = [
        {
          locationId: testLocationId,
          name: `Delete Test 1 - ${Date.now()}`,
          slug: `delete-test-1-${Date.now()}`,
          type: "landmark",
          isActive: true,
        },
      ];

      await db.bulkCreateAttractions(testAttrs);

      // Get and delete
      const attractions = await db.listAllAttractions({
        search: "Delete Test",
        limit: 10,
      });

      if (attractions.length > 0) {
        const idsToDelete = attractions.slice(0, 1).map(a => a.id);
        await db.bulkDeleteAttractions(idsToDelete);
        
        // Verify deletion
        const deleted = await db.getAttractionById(idsToDelete[0]);
        expect(deleted).toBeNull();
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid location ID gracefully", async () => {
      const attractions = await db.listAllAttractions({
        locationId: 99999,
        limit: 10,
      });
      expect(Array.isArray(attractions)).toBe(true);
      expect(attractions.length).toBe(0);
    });

    it("should handle toggle on non-existent attraction", async () => {
      try {
        await db.toggleAttractionFeatured(99999);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("not found");
      }
    });

    it("should handle delete on non-existent attractions", async () => {
      // Should not throw error
      const result = await db.bulkDeleteAttractions([99999]);
      expect(result).toBeDefined();
    });
  });
});

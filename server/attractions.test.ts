import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { InsertAttraction } from "../drizzle/schema";

describe("Attractions Database Operations", () => {
  let testLocationId: number;
  let testAttractionId: number;

  beforeAll(async () => {
    // Use first location from database (assuming it exists from seeding)
    const locations = await db.listLocationsByState(1, 1);
    if (locations.length > 0) {
      testLocationId = locations[0].id;
    } else {
      testLocationId = 1;
    }
  });

  describe("createAttraction", () => {
    it("should create a new attraction", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Taj Mahal",
        slug: `taj-mahal-${Date.now()}`,
        type: "landmark",
        description: "A white marble mausoleum",
        address: "Agra, India",
        rating: 4.8,
        image: "https://example.com/taj-mahal.jpg",
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      expect(result).toBeDefined();
      const created = await db.getAttractionBySlug(testLocationId, attraction.slug);
      if (created) {
        testAttractionId = created.id;
      }
    });

    it("should create a restaurant attraction", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Taj Restaurant",
        slug: `taj-restaurant-${Date.now()}`,
        type: "restaurant",
        description: "Fine dining Indian cuisine",
        address: "Agra, India",
        phone: "+91-562-2330000",
        website: "https://tajrestaurant.com",
        openingHours: "11:00 AM - 11:00 PM",
        entryFee: "N/A",
        rating: 4.5,
        image: "https://example.com/taj-restaurant.jpg",
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      expect(result).toBeDefined();
    });

    it("should create a museum attraction", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Agra Museum",
        slug: `agra-museum-${Date.now()}`,
        type: "museum",
        description: "Historical museum with ancient artifacts",
        address: "Agra, India",
        openingHours: "10:00 AM - 5:00 PM",
        closedOn: "Mondays",
        entryFee: "₹50",
        estimatedVisitTime: "2-3 hours",
        rating: 4.2,
        image: "https://example.com/agra-museum.jpg",
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      expect(result).toBeDefined();
    });
  });

  describe("getAttractionById", () => {
    it("should retrieve an attraction by ID", async () => {
      const attraction = await db.getAttractionById(testAttractionId);
      expect(attraction).toBeDefined();
      expect(attraction?.name).toBe("Taj Mahal");
    });

    it("should return null for non-existent attraction", async () => {
      const attraction = await db.getAttractionById(99999);
      expect(attraction).toBeNull();
    });
  });

  describe("getAttractionBySlug", () => {
    it("should retrieve an attraction by slug", async () => {
      const attraction = await db.getAttractionBySlug(testLocationId, "taj-mahal");
      expect(attraction).toBeDefined();
      expect(attraction?.name).toBe("Taj Mahal");
    });

    it("should return null for non-existent slug", async () => {
      const attraction = await db.getAttractionBySlug(testLocationId, "non-existent");
      expect(attraction).toBeNull();
    });
  });

  describe("listAttractionsByLocation", () => {
    it("should list all attractions for a location", async () => {
      const attractions = await db.listAttractionsByLocation(testLocationId);
      expect(Array.isArray(attractions)).toBe(true);
      expect(attractions.length).toBeGreaterThan(0);
    });

    it("should respect limit parameter", async () => {
      const attractions = await db.listAttractionsByLocation(testLocationId, 2);
      expect(attractions.length).toBeLessThanOrEqual(2);
    });

    it("should respect offset parameter", async () => {
      const allAttractions = await db.listAttractionsByLocation(testLocationId, 100);
      const offsetAttractions = await db.listAttractionsByLocation(testLocationId, 100, 1);
      expect(offsetAttractions.length).toBeLessThanOrEqual(allAttractions.length);
    });
  });

  describe("listAttractionsByLocationAndType", () => {
    it("should list attractions filtered by type", async () => {
      const landmarks = await db.listAttractionsByLocationAndType(testLocationId, "landmark");
      expect(Array.isArray(landmarks)).toBe(true);
      landmarks.forEach((attraction: any) => {
        expect(attraction.type).toBe("landmark");
      });
    });

    it("should list restaurants", async () => {
      const restaurants = await db.listAttractionsByLocationAndType(testLocationId, "restaurant");
      expect(Array.isArray(restaurants)).toBe(true);
      restaurants.forEach((attraction: any) => {
        expect(attraction.type).toBe("restaurant");
      });
    });

    it("should list museums", async () => {
      const museums = await db.listAttractionsByLocationAndType(testLocationId, "museum");
      expect(Array.isArray(museums)).toBe(true);
      museums.forEach((attraction: any) => {
        expect(attraction.type).toBe("museum");
      });
    });
  });

  describe("listFeaturedAttractionsByLocation", () => {
    it("should list featured attractions", async () => {
      // First, update an attraction to be featured
      await db.updateAttraction(testAttractionId, { isFeatured: true });

      const featured = await db.listFeaturedAttractionsByLocation(testLocationId);
      expect(Array.isArray(featured)).toBe(true);
      featured.forEach((attraction: any) => {
        expect(attraction.isFeatured).toBe(true);
      });
    });

    it("should respect limit parameter", async () => {
      const featured = await db.listFeaturedAttractionsByLocation(testLocationId, 3);
      expect(featured.length).toBeLessThanOrEqual(3);
    });
  });

  describe("countAttractionsByLocation", () => {
    it("should count attractions for a location", async () => {
      const count = await db.countAttractionsByLocation(testLocationId);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("updateAttraction", () => {
    it("should update an attraction", async () => {
      const updates = {
        name: "Taj Mahal (Updated)",
        rating: 4.9,
      };

      await db.updateAttraction(testAttractionId, updates);
      const updated = await db.getAttractionById(testAttractionId);
      expect(updated?.name).toBe("Taj Mahal (Updated)");
      expect(Number(updated?.rating)).toBe(4.9);
    });

    it("should update featured status", async () => {
      await db.updateAttraction(testAttractionId, { isFeatured: true });
      const updated = await db.getAttractionById(testAttractionId);
      expect(Boolean(updated?.isFeatured)).toBe(true);
    });

    it("should update active status", async () => {
      await db.updateAttraction(testAttractionId, { isActive: false });
      const updated = await db.getAttractionById(testAttractionId);
      expect(Boolean(updated?.isActive)).toBe(false);
    });
  });

  describe("searchAttractions", () => {
    it("should search attractions by name", async () => {
      const results = await db.searchAttractions(testLocationId, "Taj");
      expect(Array.isArray(results)).toBe(true);
      results.forEach((attraction: any) => {
        expect(attraction.name.toLowerCase()).toContain("taj");
      });
    });

    it("should return empty array for no matches", async () => {
      const results = await db.searchAttractions(testLocationId, "NonExistentPlace");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it("should respect limit parameter", async () => {
      const results = await db.searchAttractions(testLocationId, "Taj", 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe("deleteAttraction", () => {
    it("should delete an attraction", async () => {
      // Create a temporary attraction to delete
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Temporary Attraction",
        slug: `temp-attraction-${Date.now()}`,
        type: "landmark",
        description: "Temporary",
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      // Delete it
      await db.deleteAttraction(testAttractionId);
      const deleted = await db.getAttractionById(testAttractionId);
      expect(deleted).toBeNull();
    });
  });

  describe("Attractions with JSON fields", () => {
    it("should store and retrieve highlights array", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Museum with Highlights",
        slug: `museum-highlights-${Date.now()}`,
        type: "museum",
        description: "Museum with highlights",
        highlights: ["Ancient artifacts", "Medieval sculptures", "Modern art"],
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      const retrieved = await db.getAttractionBySlug(testLocationId, "museum-highlights");
      expect(Array.isArray(retrieved?.highlights)).toBe(true);
      expect(retrieved?.highlights?.length).toBe(3);
    });

    it("should store and retrieve images array", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Gallery",
        slug: `gallery-${Date.now()}`,
        type: "museum",
        description: "Art gallery",
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      const retrieved = await db.getAttractionBySlug(testLocationId, "gallery");
      expect(Array.isArray(retrieved?.images)).toBe(true);
      expect(retrieved?.images?.length).toBe(2);
    });
  });

  describe("Attractions with SEO fields", () => {
    it("should store SEO metadata", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "SEO Test Attraction",
        slug: `seo-test-${Date.now()}`,
        type: "landmark",
        description: "Test attraction",
        metaTitle: "Visit SEO Test Attraction | Agra",
        metaDescription: "Discover the beautiful SEO Test Attraction in Agra",
        metaKeywords: "attraction, landmark, agra, seo",
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      const retrieved = await db.getAttractionBySlug(testLocationId, "seo-test");
      expect(retrieved?.metaTitle).toBe("Visit SEO Test Attraction | Agra");
      expect(retrieved?.metaDescription).toContain("SEO Test Attraction");
      expect(retrieved?.metaKeywords).toContain("agra");
    });
  });

  describe("Attractions with location data", () => {
    it("should store latitude and longitude", async () => {
      const attraction: InsertAttraction = {
        locationId: testLocationId,
        name: "Geo-tagged Attraction",
        slug: `geo-attraction-${Date.now()}`,
        type: "landmark",
        description: "Attraction with coordinates",
        latitude: 27.1751,
        longitude: 78.0421,
        isActive: true,
      };

      const result = await db.createAttraction(attraction);
      const retrieved = await db.getAttractionBySlug(testLocationId, "geo-attraction");
      expect(retrieved?.latitude).toBeDefined();
      expect(retrieved?.longitude).toBeDefined();
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  createAttraction,
  getAttractionById,
  updateAttraction,
  deleteAttraction,
} from "./db";

describe("Admin Attractions Management", () => {
  let testAttractionId: number;
  const testCityId = "test-city-123";

  describe("Create Attraction", () => {
    it("should create a new attraction with all fields", async () => {
      const result = await createAttraction({
        name: "Test Landmark",
        slug: "test-landmark-admin",
        type: "landmark",
        description: "A beautiful test landmark",
        address: "123 Main St, Test City",
        cityId: testCityId,
        rating: 4.7,
        image: "https://example.com/landmark.jpg",
        openingHours: "9:00 AM - 6:00 PM",
        closedOn: "Monday",
        entryFee: "₹250",
        estimatedVisitTime: "2 hours",
        highlights: ["Historic", "Scenic", "Photography"],
        phone: "+91-1234567890",
        email: "landmark@test.com",
        website: "https://landmark.test.com",
        isActive: true,
        isFeatured: false,
      });

      expect(result).toBeDefined();
      testAttractionId = result[0].id;
    });

    it("should create attraction with minimal required fields", async () => {
      const result = await createAttraction({
        name: "Minimal Attraction",
        slug: "minimal-attraction-admin",
        type: "restaurant",
        address: "456 Food St, Test City",
        cityId: testCityId,
        isActive: true,
        isFeatured: false,
      });

      expect(result).toBeDefined();
      expect(result[0].name).toBe("Minimal Attraction");
    });

    it("should create attractions of different types", async () => {
      const types = ["museum", "temple", "monument", "park", "cafe", "shopping"];

      for (const type of types) {
        const result = await createAttraction({
          name: `Test ${type}`,
          slug: `test-${type}-admin-${Date.now()}`,
          type,
          address: `${type} address`,
          cityId: testCityId,
          isActive: true,
          isFeatured: false,
        });

        expect(result[0].type).toBe(type);
      }
    });
  });

  describe("Read Attraction", () => {
    it("should retrieve attraction by ID", async () => {
      const result = await getAttractionById(testAttractionId);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Landmark");
    });

    it("should retrieve attraction with all fields populated", async () => {
      const result = await getAttractionById(testAttractionId);

      expect(result?.name).toBe("Test Landmark");
      expect(result?.description).toBe("A beautiful test landmark");
      expect(result?.phone).toBe("+91-1234567890");
      expect(result?.email).toBe("landmark@test.com");
      expect(result?.website).toBe("https://landmark.test.com");
    });
  });

  describe("Update Attraction", () => {
    it("should update attraction name", async () => {
      await updateAttraction(testAttractionId, { name: "Updated Landmark" });
      const result = await getAttractionById(testAttractionId);

      expect(result?.name).toBe("Updated Landmark");
    });

    it("should update attraction rating", async () => {
      await updateAttraction(testAttractionId, { rating: 4.9 });
      const result = await getAttractionById(testAttractionId);

      expect(result?.rating).toBe(4.9);
    });

    it("should update attraction type", async () => {
      await updateAttraction(testAttractionId, { type: "museum" });
      const result = await getAttractionById(testAttractionId);

      expect(result?.type).toBe("museum");
    });

    it("should update multiple fields at once", async () => {
      await updateAttraction(testAttractionId, {
        name: "Multi-Updated Attraction",
        description: "Updated description",
        entryFee: "₹500",
        estimatedVisitTime: "3 hours",
      });

      const result = await getAttractionById(testAttractionId);

      expect(result?.name).toBe("Multi-Updated Attraction");
      expect(result?.description).toBe("Updated description");
      expect(result?.entryFee).toBe("₹500");
      expect(result?.estimatedVisitTime).toBe("3 hours");
    });

    it("should update highlights array", async () => {
      const newHighlights = ["Updated", "Highlights", "Array"];
      await updateAttraction(testAttractionId, { highlights: newHighlights });

      const result = await getAttractionById(testAttractionId);

      expect(result?.highlights).toEqual(newHighlights);
    });

    it("should update contact information", async () => {
      await updateAttraction(testAttractionId, {
        phone: "+91-9876543210",
        email: "updated@test.com",
        website: "https://updated.test.com",
      });

      const result = await getAttractionById(testAttractionId);

      expect(result?.phone).toBe("+91-9876543210");
      expect(result?.email).toBe("updated@test.com");
      expect(result?.website).toBe("https://updated.test.com");
    });
  });

  describe("Delete Attraction", () => {
    it("should delete an attraction", async () => {
      // Create an attraction to delete
      const created = await createAttraction({
        name: "To Delete",
        slug: `to-delete-${Date.now()}`,
        type: "landmark",
        address: "Delete St",
        cityId: testCityId,
        isActive: true,
        isFeatured: false,
      });

      const deleteId = created[0].id;

      await deleteAttraction(deleteId);

      // Verify deletion
      const verify = await getAttractionById(deleteId);

      expect(verify).toBeNull();
    });
  });

  describe("Validation", () => {
    it("should handle attractions with special characters in name", async () => {
      const result = await createAttraction({
        name: "Attraction's & Co. Museum",
        slug: `special-chars-${Date.now()}`,
        type: "museum",
        address: "Special St",
        cityId: testCityId,
        isActive: true,
        isFeatured: false,
      });

      expect(result[0].name).toBe("Attraction's & Co. Museum");
    });

    it("should handle attractions with long descriptions", async () => {
      const longDescription = "This is a very long description ".repeat(20);

      const result = await createAttraction({
        name: "Long Description Attraction",
        slug: `long-desc-${Date.now()}`,
        type: "landmark",
        address: "Long St",
        cityId: testCityId,
        description: longDescription,
        isActive: true,
        isFeatured: false,
      });

      expect(result[0].description).toBe(longDescription);
    });

    it("should handle attractions with empty optional fields", async () => {
      const result = await createAttraction({
        name: "Minimal Fields",
        slug: `minimal-fields-${Date.now()}`,
        type: "landmark",
        address: "Minimal St",
        cityId: testCityId,
        description: "",
        phone: "",
        email: "",
        isActive: true,
        isFeatured: false,
      });

      expect(result[0].name).toBe("Minimal Fields");
      expect(result[0].description).toBe("");
    });
  });
});

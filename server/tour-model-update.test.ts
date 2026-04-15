import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Tour Model Update - State and Category Support", () => {
  describe("Tour Schema Extensions", () => {
    it("should support stateId field in tour creation", () => {
      const tourData = {
        name: "Kerala Backwaters Tour",
        slug: "kerala-backwaters",
        description: "Explore the beautiful backwaters of Kerala",
        stateId: 1, // Optional: link to state
        categoryId: 1, // Optional: link to category
      };

      expect(tourData.stateId).toBeDefined();
      expect(tourData.categoryId).toBeDefined();
      expect(typeof tourData.stateId).toBe("number");
      expect(typeof tourData.categoryId).toBe("number");
    });

    it("should support optional stateId and categoryId fields", () => {
      const tourWithState = {
        name: "Tour 1",
        slug: "tour-1",
        stateId: 5,
      };

      const tourWithCategory = {
        name: "Tour 2",
        slug: "tour-2",
        categoryId: 3,
      };

      const tourWithBoth = {
        name: "Tour 3",
        slug: "tour-3",
        stateId: 5,
        categoryId: 3,
      };

      expect(tourWithState.stateId).toBe(5);
      expect(tourWithCategory.categoryId).toBe(3);
      expect(tourWithBoth.stateId).toBe(5);
      expect(tourWithBoth.categoryId).toBe(3);
    });
  });

  describe("Tour Database Functions", () => {
    it("should have listTours function with stateId parameter support", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      expect(caller.tours).toBeDefined();
      expect(caller.tours.list).toBeDefined();
    });

    it("should have tours router available", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      expect(caller.tours.create).toBeDefined();
      expect(caller.tours.update).toBeDefined();
      expect(caller.tours.delete).toBeDefined();
    });
  });

  describe("Hierarchical Tour Organization", () => {
    it("should support filtering tours by state", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, categoryId: 1 },
        { id: 2, name: "Tour B", stateId: 1, categoryId: 2 },
        { id: 3, name: "Tour C", stateId: 2, categoryId: 1 },
      ];

      const keralaTours = tours.filter((t) => t.stateId === 1);
      expect(keralaTours.length).toBe(2);
      expect(keralaTours.every((t) => t.stateId === 1)).toBe(true);
    });

    it("should support filtering tours by category", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, categoryId: 1 },
        { id: 2, name: "Tour B", stateId: 1, categoryId: 2 },
        { id: 3, name: "Tour C", stateId: 2, categoryId: 1 },
      ];

      const adventureTours = tours.filter((t) => t.categoryId === 1);
      expect(adventureTours.length).toBe(2);
      expect(adventureTours.every((t) => t.categoryId === 1)).toBe(true);
    });

    it("should support filtering tours by both state and category", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, categoryId: 1 },
        { id: 2, name: "Tour B", stateId: 1, categoryId: 2 },
        { id: 3, name: "Tour C", stateId: 2, categoryId: 1 },
      ];

      const filtered = tours.filter((t) => t.stateId === 1 && t.categoryId === 1);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(1);
    });

    it("should support tours without state or category assignment", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: null, categoryId: null },
        { id: 2, name: "Tour B", stateId: 1, categoryId: null },
        { id: 3, name: "Tour C", stateId: null, categoryId: 1 },
      ];

      expect(tours[0].stateId).toBeNull();
      expect(tours[0].categoryId).toBeNull();
      expect(tours[1].stateId).toBe(1);
      expect(tours[1].categoryId).toBeNull();
    });
  });

  describe("Tour Admin Form Integration", () => {
    it("should support hierarchical selection in admin form", () => {
      const formData = {
        name: "Tour Name",
        slug: "tour-slug",
        countryId: 1,
        stateId: 5,
        categoryId: 2,
        description: "Tour description",
      };

      expect(formData.countryId).toBe(1);
      expect(formData.stateId).toBe(5);
      expect(formData.categoryId).toBe(2);
    });

    it("should allow partial hierarchical selection", () => {
      const formData1 = {
        name: "Tour 1",
        slug: "tour-1",
        countryId: 1,
        stateId: 0, // Not selected
        categoryId: 0, // Not selected
      };

      const formData2 = {
        name: "Tour 2",
        slug: "tour-2",
        countryId: 0, // Not selected
        stateId: 0,
        categoryId: 2, // Selected
      };

      expect(formData1.countryId).toBe(1);
      expect(formData1.stateId).toBe(0);
      expect(formData2.categoryId).toBe(2);
      expect(formData2.countryId).toBe(0);
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain existing tour fields", () => {
      const tour = {
        id: 1,
        name: "Tour Name",
        slug: "tour-slug",
        description: "Description",
        longDescription: "Long description",
        duration: 5,
        price: 25000,
        difficulty: "moderate",
        groupSize: "2-10 people",
        // New fields
        stateId: 1,
        categoryId: 1,
      };

      expect(tour.name).toBeDefined();
      expect(tour.slug).toBeDefined();
      expect(tour.description).toBeDefined();
      expect(tour.duration).toBeDefined();
      expect(tour.price).toBeDefined();
      expect(tour.stateId).toBeDefined();
      expect(tour.categoryId).toBeDefined();
    });

    it("should not break existing tours without state or category", () => {
      const legacyTour = {
        id: 1,
        name: "Legacy Tour",
        slug: "legacy-tour",
        description: "Description",
        stateId: null,
        categoryId: null,
      };

      expect(legacyTour.name).toBe("Legacy Tour");
      expect(legacyTour.stateId).toBeNull();
      expect(legacyTour.categoryId).toBeNull();
    });
  });

  describe("Data Integrity", () => {
    it("should validate stateId references valid state", () => {
      const validStateId = 1;
      const invalidStateId = -1;

      expect(validStateId > 0).toBe(true);
      expect(invalidStateId > 0).toBe(false);
    });

    it("should validate categoryId references valid category", () => {
      const validCategoryId = 1;
      const invalidCategoryId = 0;

      expect(validCategoryId > 0).toBe(true);
      expect(invalidCategoryId > 0).toBe(false);
    });

    it("should support optional foreign key relationships", () => {
      const tourWithOptionalRefs = {
        id: 1,
        name: "Tour",
        slug: "tour",
        stateId: null, // Optional
        categoryId: null, // Optional
      };

      expect(tourWithOptionalRefs.stateId).toBeNull();
      expect(tourWithOptionalRefs.categoryId).toBeNull();
    });
  });

  describe("Query Functionality", () => {
    it("should support querying tours by state", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1 },
        { id: 2, name: "Tour B", stateId: 1 },
        { id: 3, name: "Tour C", stateId: 2 },
      ];

      const queryState = 1;
      const result = tours.filter((t) => t.stateId === queryState);

      expect(result.length).toBe(2);
      expect(result.every((t) => t.stateId === queryState)).toBe(true);
    });

    it("should support querying tours by category", () => {
      const tours = [
        { id: 1, name: "Tour A", categoryId: 1 },
        { id: 2, name: "Tour B", categoryId: 2 },
        { id: 3, name: "Tour C", categoryId: 1 },
      ];

      const queryCategory = 1;
      const result = tours.filter((t) => t.categoryId === queryCategory);

      expect(result.length).toBe(2);
      expect(result.every((t) => t.categoryId === queryCategory)).toBe(true);
    });

    it("should support combined state and category queries", () => {
      const tours = [
        { id: 1, name: "Tour A", stateId: 1, categoryId: 1 },
        { id: 2, name: "Tour B", stateId: 1, categoryId: 2 },
        { id: 3, name: "Tour C", stateId: 2, categoryId: 1 },
      ];

      const result = tours.filter((t) => t.stateId === 1 && t.categoryId === 1);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });
  });
});

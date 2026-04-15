import { describe, it, expect, beforeAll } from "vitest";
import * as tourFilters from "./db-tour-filters";

describe("Tour Filtering Functions", () => {
  describe("getCountriesForFilter", () => {
    it("should return a list of countries", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      expect(Array.isArray(countries)).toBe(true);
      if (countries.length > 0) {
        expect(countries[0]).toHaveProperty("id");
        expect(countries[0]).toHaveProperty("name");
        expect(countries[0]).toHaveProperty("code");
      }
    });

    it("should return countries sorted by name", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 1) {
        for (let i = 0; i < countries.length - 1; i++) {
          expect(countries[i].name.localeCompare(countries[i + 1].name)).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe("getStatesByCountryForFilter", () => {
    it("should return states for a valid country", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const states = await tourFilters.getStatesByCountryForFilter(countries[0].id);
        expect(Array.isArray(states)).toBe(true);
        if (states.length > 0) {
          expect(states[0]).toHaveProperty("id");
          expect(states[0]).toHaveProperty("name");
          expect(states[0]).toHaveProperty("countryId");
          expect(states[0].countryId).toBe(countries[0].id);
        }
      }
    });

    it("should return empty array for invalid country", async () => {
      const states = await tourFilters.getStatesByCountryForFilter(99999);
      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBe(0);
    });
  });

  describe("getCitiesByStateForFilter", () => {
    it("should return cities for a valid state", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const states = await tourFilters.getStatesByCountryForFilter(countries[0].id);
        if (states.length > 0) {
          const cities = await tourFilters.getCitiesByStateForFilter(states[0].id);
          expect(Array.isArray(cities)).toBe(true);
          if (cities.length > 0) {
            expect(cities[0]).toHaveProperty("id");
            expect(cities[0]).toHaveProperty("name");
            expect(cities[0]).toHaveProperty("stateId");
            expect(cities[0].stateId).toBe(states[0].id);
          }
        }
      }
    });

    it("should return empty array for invalid state", async () => {
      const cities = await tourFilters.getCitiesByStateForFilter(99999);
      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBe(0);
    });
  });

  describe("getToursByLocationFilters", () => {
    it("should return tours without filters", async () => {
      const tours = await tourFilters.getToursByLocationFilters({}, 10, 0);
      expect(Array.isArray(tours)).toBe(true);
    });

    it("should return tours with country filter", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const tours = await tourFilters.getToursByLocationFilters(
          { countryIds: [countries[0].id] },
          10,
          0
        );
        expect(Array.isArray(tours)).toBe(true);
      }
    });

    it("should return tours with state filter", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const states = await tourFilters.getStatesByCountryForFilter(countries[0].id);
        if (states.length > 0) {
          const tours = await tourFilters.getToursByLocationFilters(
            { stateIds: [states[0].id] },
            10,
            0
          );
          expect(Array.isArray(tours)).toBe(true);
        }
      }
    });

    it("should return tours with city filter", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const states = await tourFilters.getStatesByCountryForFilter(countries[0].id);
        if (states.length > 0) {
          const cities = await tourFilters.getCitiesByStateForFilter(states[0].id);
          if (cities.length > 0) {
            const tours = await tourFilters.getToursByLocationFilters(
              { cityIds: [cities[0].id] },
              10,
              0
            );
            expect(Array.isArray(tours)).toBe(true);
          }
        }
      }
    });

    it("should respect limit parameter", async () => {
      const tours = await tourFilters.getToursByLocationFilters({}, 5, 0);
      expect(tours.length).toBeLessThanOrEqual(5);
    });

    it("should respect offset parameter", async () => {
      const firstPage = await tourFilters.getToursByLocationFilters({}, 10, 0);
      const secondPage = await tourFilters.getToursByLocationFilters({}, 10, 10);
      
      if (firstPage.length > 0 && secondPage.length > 0) {
        expect(firstPage[0].id).not.toBe(secondPage[0].id);
      }
    });
  });

  describe("getTourCountByLocationFilters", () => {
    it("should return count without filters", async () => {
      const count = await tourFilters.getTourCountByLocationFilters({});
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should return count with country filter", async () => {
      const countries = await tourFilters.getCountriesForFilter();
      if (countries.length > 0) {
        const count = await tourFilters.getTourCountByLocationFilters({
          countryIds: [countries[0].id],
        });
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it("should return non-negative count", async () => {
      const count = await tourFilters.getTourCountByLocationFilters({});
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getTourStatsByCountry", () => {
    it("should return country statistics", async () => {
      const stats = await tourFilters.getTourStatsByCountry();
      expect(Array.isArray(stats)).toBe(true);
      if (stats.length > 0) {
        expect(stats[0]).toHaveProperty("countryId");
        expect(stats[0]).toHaveProperty("countryName");
        expect(stats[0]).toHaveProperty("tourCount");
        expect(typeof stats[0].tourCount).toBe("number");
      }
    });
  });

  describe("getTourStatsByState", () => {
    it("should return state statistics", async () => {
      const stats = await tourFilters.getTourStatsByState();
      expect(Array.isArray(stats)).toBe(true);
      if (stats.length > 0) {
        expect(stats[0]).toHaveProperty("stateId");
        expect(stats[0]).toHaveProperty("stateName");
        expect(stats[0]).toHaveProperty("countryName");
        expect(stats[0]).toHaveProperty("tourCount");
        expect(typeof stats[0].tourCount).toBe("number");
      }
    });
  });
});

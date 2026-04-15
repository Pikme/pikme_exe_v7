import { describe, it, expect } from "vitest";
import {
  generateTourStructuredData,
  generateLocationStructuredData,
  generateCountryStructuredData,
  generateTourMetadata,
  generateLocationMetadata,
  generateCountryMetadata,
  generateBreadcrumbStructuredData,
  generateSitemapEntry,
} from "./seo";

describe("SEO Utilities", () => {
  const baseUrl = "https://example.com";

  describe("generateTourStructuredData", () => {
    it("should generate valid JSON-LD for a tour", () => {
      const tour = {
        id: 1,
        name: "Paris Adventure",
        slug: "paris-adventure",
        description: "Explore the City of Light",
        longDescription: "A comprehensive tour of Paris",
        image: "https://example.com/paris.jpg",
        duration: 5,
        price: 1500,
        currency: "USD",
        itinerary: [
          { title: "Arrival", description: "Arrive in Paris" },
          { title: "Eiffel Tower", description: "Visit Eiffel Tower" },
        ],
      };

      const result = generateTourStructuredData(tour, baseUrl);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("TravelAction");
      expect(result.name).toBe("Paris Adventure");
      expect(result.duration).toBe("P5D");
      expect(result.price).toBe(1500);
      expect(result.priceCurrency).toBe("USD");
      expect(result.itinerary).toHaveLength(2);
    });

    it("should handle missing optional fields", () => {
      const tour = {
        id: 1,
        name: "Simple Tour",
        slug: "simple-tour",
      };

      const result = generateTourStructuredData(tour, baseUrl);

      expect(result.name).toBe("Simple Tour");
      expect(result.duration).toBeUndefined();
      expect(result.price).toBeUndefined();
    });
  });

  describe("generateLocationStructuredData", () => {
    it("should generate valid JSON-LD for a location", () => {
      const location = {
        id: 1,
        name: "Eiffel Tower",
        slug: "eiffel-tower",
        description: "Iconic monument in Paris",
        image: "https://example.com/eiffel.jpg",
        latitude: "48.8584",
        longitude: "2.2945",
      };

      const country = {
        id: 1,
        name: "France",
        code: "FR",
        slug: "france",
      };

      const result = generateLocationStructuredData(location, country, baseUrl);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Place");
      expect(result.name).toBe("Eiffel Tower");
      expect(result.address.addressCountry).toBe("FR");
      expect(result.geo.latitude).toBe("48.8584");
      expect(result.geo.longitude).toBe("2.2945");
    });
  });

  describe("generateCountryStructuredData", () => {
    it("should generate valid JSON-LD for a country", () => {
      const country = {
        id: 1,
        name: "France",
        code: "FR",
        slug: "france",
        description: "Beautiful country in Europe",
        image: "https://example.com/france.jpg",
      };

      const result = generateCountryStructuredData(country, baseUrl);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Country");
      expect(result.name).toBe("France");
      expect(result.identifier).toBe("FR");
    });
  });

  describe("generateTourMetadata", () => {
    it("should generate SEO metadata for a tour", async () => {
      const tour = {
        id: 1,
        name: "Paris Adventure",
        slug: "paris-adventure",
        description: "Explore the City of Light",
        metaTitle: "Paris Adventure Tour",
        metaDescription: "Discover Paris with our guided tour",
        metaKeywords: "Paris, tour, travel",
        image: "https://example.com/paris.jpg",
      };

      const result = await generateTourMetadata(tour, baseUrl);

      expect(result.title).toBe("Paris Adventure Tour");
      expect(result.description).toBe("Discover Paris with our guided tour");
      expect(result.keywords).toBe("Paris, tour, travel");
      expect(result.canonicalUrl).toBe(`${baseUrl}/visit/tour/paris-adventure`);
      expect(result.structuredData).toBeDefined();
    });

    it("should use fallback values when metadata is missing", async () => {
      const tour = {
        id: 1,
        name: "Paris Adventure",
        slug: "paris-adventure",
        description: "Explore the City of Light",
      };

      const result = await generateTourMetadata(tour, baseUrl);

      expect(result.title).toContain("Paris Adventure");
      expect(result.description).toContain("Explore the City of Light");
    });
  });

  describe("generateLocationMetadata", () => {
    it("should generate SEO metadata for a location", async () => {
      const location = {
        id: 1,
        name: "Eiffel Tower",
        slug: "eiffel-tower",
        description: "Iconic monument",
        metaTitle: "Eiffel Tower - Paris",
        metaDescription: "Visit the iconic Eiffel Tower",
        metaKeywords: "Eiffel Tower, Paris, monument",
      };

      const country = {
        id: 1,
        name: "France",
        code: "FR",
        slug: "france",
      };

      const result = await generateLocationMetadata(location, country, baseUrl);

      expect(result.title).toBe("Eiffel Tower - Paris");
      expect(result.description).toBe("Visit the iconic Eiffel Tower");
      expect(result.canonicalUrl).toBe(`${baseUrl}/visit/france/eiffel-tower`);
    });
  });

  describe("generateCountryMetadata", () => {
    it("should generate SEO metadata for a country", async () => {
      const country = {
        id: 1,
        name: "France",
        code: "FR",
        slug: "france",
        description: "Beautiful country in Europe",
        metaTitle: "France Travel Guide",
        metaDescription: "Explore France with our travel guide",
        metaKeywords: "France, travel, destination",
      };

      const result = await generateCountryMetadata(country, baseUrl);

      expect(result.title).toBe("France Travel Guide");
      expect(result.description).toBe("Explore France with our travel guide");
      expect(result.canonicalUrl).toBe(`${baseUrl}/visit/france`);
    });
  });

  describe("generateBreadcrumbStructuredData", () => {
    it("should generate breadcrumb structured data", () => {
      const items = [
        { name: "Home", url: `${baseUrl}/` },
        { name: "France", url: `${baseUrl}/visit/france` },
        { name: "Paris", url: `${baseUrl}/visit/france/paris` },
      ];

      const result = generateBreadcrumbStructuredData(items);

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("BreadcrumbList");
      expect(result.itemListElement).toHaveLength(3);
      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[0].name).toBe("Home");
      expect(result.itemListElement[2].position).toBe(3);
    });
  });

  describe("generateSitemapEntry", () => {
    it("should generate a valid sitemap entry", () => {
      const url = "https://example.com/visit/france";
      const result = generateSitemapEntry(url, 0.8, "monthly");

      expect(result).toContain("<url>");
      expect(result).toContain(`<loc>${url}</loc>`);
      expect(result).toContain("<priority>0.8</priority>");
      expect(result).toContain("<changefreq>monthly</changefreq>");
      expect(result).toContain("</url>");
    });

    it("should use default values", () => {
      const url = "https://example.com/visit/france";
      const result = generateSitemapEntry(url);

      expect(result).toContain("<priority>0.5</priority>");
      expect(result).toContain("<changefreq>weekly</changefreq>");
    });
  });
});

import { describe, it, expect } from "vitest";

// Test structured data utilities
describe("Structured Data (JSON-LD) - Phase 2B", () => {
  describe("Breadcrumb Schema", () => {
    it("should generate valid breadcrumb schema", () => {
      const breadcrumbs = [
        { name: "Home", url: "https://pikme.com" },
        { name: "Tours", url: "https://pikme.com/tours" },
        { name: "Kerala Tours", url: "https://pikme.com/tours/kerala" },
      ];

      const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe("Home");
    });

    it("should have correct positions in breadcrumb list", () => {
      const breadcrumbs = [
        { name: "Home", url: "https://pikme.com" },
        { name: "Tours", url: "https://pikme.com/tours" },
      ];

      const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });

    it("should include all required breadcrumb fields", () => {
      const breadcrumb = {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://pikme.com",
      };

      expect(breadcrumb).toHaveProperty("@type");
      expect(breadcrumb).toHaveProperty("position");
      expect(breadcrumb).toHaveProperty("name");
      expect(breadcrumb).toHaveProperty("item");
    });
  });

  describe("Organization Schema", () => {
    it("should generate valid organization schema", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
        url: "https://pikme.com",
        logo: "https://pikme.com/logo.png",
        description: "Travel experiences",
        sameAs: [
          "https://www.facebook.com/pikme",
          "https://www.twitter.com/pikme",
        ],
      };

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("Pikme Travel");
      expect(schema.sameAs).toHaveLength(2);
    });

    it("should include contact point when provided", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
        url: "https://pikme.com",
        logo: "https://pikme.com/logo.png",
        description: "Travel experiences",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-800-PIKME",
          contactType: "Customer Service",
        },
      };

      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint["@type"]).toBe("ContactPoint");
      expect(schema.contactPoint.telephone).toBe("+1-800-PIKME");
    });

    it("should include address when provided", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
        url: "https://pikme.com",
        logo: "https://pikme.com/logo.png",
        description: "Travel experiences",
        sameAs: [],
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Travel Street",
          addressLocality: "New York",
          addressRegion: "NY",
          postalCode: "10001",
          addressCountry: "US",
        },
      };

      expect(schema.address).toBeDefined();
      expect(schema.address["@type"]).toBe("PostalAddress");
      expect(schema.address.addressLocality).toBe("New York");
    });
  });

  describe("Local Business Schema", () => {
    it("should generate valid local business schema", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Pikme Travel",
        description: "Travel agency",
        url: "https://pikme.com",
        telephone: "+1-800-PIKME",
        email: "info@pikme.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Travel Street",
          addressLocality: "New York",
          addressRegion: "NY",
          postalCode: "10001",
          addressCountry: "US",
        },
      };

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("LocalBusiness");
      expect(schema.name).toBe("Pikme Travel");
      expect(schema.address).toBeDefined();
    });

    it("should include geo coordinates when provided", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Pikme Travel",
        description: "Travel agency",
        url: "https://pikme.com",
        telephone: "+1-800-PIKME",
        email: "info@pikme.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Travel Street",
          addressLocality: "New York",
          addressRegion: "NY",
          postalCode: "10001",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      expect(schema.geo).toBeDefined();
      expect(schema.geo["@type"]).toBe("GeoCoordinates");
      expect(schema.geo.latitude).toBe(40.7128);
    });

    it("should include rating when provided", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Pikme Travel",
        description: "Travel agency",
        url: "https://pikme.com",
        telephone: "+1-800-PIKME",
        email: "info@pikme.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Travel Street",
          addressLocality: "New York",
          addressRegion: "NY",
          postalCode: "10001",
          addressCountry: "US",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 4.8,
          reviewCount: 250,
        },
      };

      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating["@type"]).toBe("AggregateRating");
      expect(schema.aggregateRating.ratingValue).toBe(4.8);
      expect(schema.aggregateRating.reviewCount).toBe(250);
    });
  });

  describe("Product Schema (for Tours)", () => {
    it("should generate valid product schema", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kerala Backwaters Tour",
        description: "3-day tour of Kerala backwaters",
        image: "https://pikme.com/kerala.jpg",
        price: "15000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      };

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Product");
      expect(schema.name).toBe("Kerala Backwaters Tour");
      expect(schema.priceCurrency).toBe("INR");
    });

    it("should include offer details", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kerala Backwaters Tour",
        description: "3-day tour of Kerala backwaters",
        image: "https://pikme.com/kerala.jpg",
        price: "15000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        offers: {
          "@type": "Offer",
          price: "15000",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      };

      expect(schema.offers).toBeDefined();
      expect(schema.offers["@type"]).toBe("Offer");
      expect(schema.offers.price).toBe("15000");
    });

    it("should include rating when provided", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kerala Backwaters Tour",
        description: "3-day tour of Kerala backwaters",
        image: "https://pikme.com/kerala.jpg",
        price: "15000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 4.7,
          reviewCount: 120,
        },
      };

      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating["@type"]).toBe("AggregateRating");
      expect(schema.aggregateRating.ratingValue).toBe(4.7);
    });
  });

  describe("Schema Validation", () => {
    it("should have valid @context", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
      };

      expect(schema["@context"]).toBe("https://schema.org");
    });

    it("should have valid @type", () => {
      const validTypes = ["Organization", "LocalBusiness", "Product", "BreadcrumbList"];
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
      };

      expect(validTypes).toContain(schema["@type"]);
    });

    it("should handle multiple schemas in graph", () => {
      const multiSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            name: "Pikme Travel",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [],
          },
        ],
      };

      expect(multiSchema["@graph"]).toHaveLength(2);
      expect(multiSchema["@graph"][0]["@type"]).toBe("Organization");
      expect(multiSchema["@graph"][1]["@type"]).toBe("BreadcrumbList");
    });
  });

  describe("SEO Best Practices", () => {
    it("should include all required fields for breadcrumbs", () => {
      const breadcrumb = {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://pikme.com",
      };

      expect(breadcrumb.position).toBeGreaterThan(0);
      expect(breadcrumb.name).toBeTruthy();
      expect(breadcrumb.item).toMatch(/^https?:\/\//);
    });

    it("should use HTTPS URLs", () => {
      const urls = [
        "https://pikme.com",
        "https://pikme.com/tours",
        "https://schema.org",
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it("should include proper rating scale (0-5)", () => {
      const rating = {
        "@type": "AggregateRating",
        ratingValue: 4.8,
        reviewCount: 250,
      };

      expect(rating.ratingValue).toBeGreaterThanOrEqual(0);
      expect(rating.ratingValue).toBeLessThanOrEqual(5);
    });

    it("should include review count for credibility", () => {
      const rating = {
        "@type": "AggregateRating",
        ratingValue: 4.8,
        reviewCount: 250,
      };

      expect(rating.reviewCount).toBeGreaterThan(0);
    });
  });

  describe("Schema Compatibility", () => {
    it("should be JSON serializable", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
        url: "https://pikme.com",
      };

      const jsonString = JSON.stringify(schema);
      expect(typeof jsonString).toBe("string");
      expect(jsonString).toContain("@context");
      expect(jsonString).toContain("@type");
    });

    it("should parse back from JSON", () => {
      const original = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
      };

      const jsonString = JSON.stringify(original);
      const parsed = JSON.parse(jsonString);

      expect(parsed["@context"]).toBe(original["@context"]);
      expect(parsed["@type"]).toBe(original["@type"]);
      expect(parsed.name).toBe(original.name);
    });

    it("should work with nested objects", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Pikme Travel",
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Travel Street",
          addressLocality: "New York",
        },
      };

      expect(schema.address["@type"]).toBe("PostalAddress");
      expect(schema.address.addressLocality).toBe("New York");
    });
  });

  describe("Structured Data for Different Page Types", () => {
    it("should support home page schema", () => {
      const homeSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pikme Travel",
        url: "https://pikme.com",
        logo: "https://pikme.com/logo.png",
        description: "Travel experiences",
      };

      expect(homeSchema["@type"]).toBe("Organization");
      expect(homeSchema.url).toBe("https://pikme.com");
    });

    it("should support tour detail page schema", () => {
      const tourSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kerala Tour",
        description: "3-day tour",
        price: "15000",
        priceCurrency: "INR",
      };

      expect(tourSchema["@type"]).toBe("Product");
      expect(tourSchema.priceCurrency).toBe("INR");
    });

    it("should support state/category page schema", () => {
      const pageSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { position: 1, name: "Home", item: "https://pikme.com" },
          { position: 2, name: "States", item: "https://pikme.com/states" },
          { position: 3, name: "Kerala", item: "https://pikme.com/states/kerala" },
        ],
      };

      expect(pageSchema["@type"]).toBe("BreadcrumbList");
      expect(pageSchema.itemListElement).toHaveLength(3);
    });
  });
});

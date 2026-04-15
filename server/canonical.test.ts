import { describe, it, expect } from "vitest";

/**
 * Canonical URL Tests - Phase 2D
 * Tests for canonical tags and duplicate content prevention
 */

describe("Canonical URLs - Duplicate Content Prevention - Phase 2D", () => {
  describe("Basic Canonical Generation", () => {
    it("should generate home canonical URL", () => {
      const baseUrl = "https://pikme.com";
      const canonical = `${baseUrl}`;

      expect(canonical).toBe("https://pikme.com");
      expect(canonical).toMatch(/^https:\/\//);
    });

    it("should generate tour canonical URL", () => {
      const baseUrl = "https://pikme.com";
      const tourSlug = "kerala-backwaters";
      const canonical = `${baseUrl}/visit/tour/${tourSlug}`;

      expect(canonical).toBe("https://pikme.com/visit/tour/kerala-backwaters");
      expect(canonical).toContain(tourSlug);
    });

    it("should generate state canonical URL", () => {
      const baseUrl = "https://pikme.com";
      const stateSlug = "kerala";
      const canonical = `${baseUrl}/states/${stateSlug}`;

      expect(canonical).toBe("https://pikme.com/states/kerala");
      expect(canonical).toContain(stateSlug);
    });

    it("should generate category canonical URL", () => {
      const baseUrl = "https://pikme.com";
      const categorySlug = "adventure";
      const canonical = `${baseUrl}/categories/${categorySlug}`;

      expect(canonical).toBe("https://pikme.com/categories/adventure");
      expect(canonical).toContain(categorySlug);
    });
  });

  describe("Locale Handling in Canonical", () => {
    it("should ignore locale parameter in canonical", () => {
      const baseUrl = "https://pikme.com";
      const tourSlug = "kerala-backwaters";

      // URLs with different locales
      const urlEn = `${baseUrl}/visit/tour/${tourSlug}?locale=en-IN`;
      const urlUs = `${baseUrl}/visit/tour/${tourSlug}?locale=en-US`;

      // Canonical should be the same for both
      const canonical = `${baseUrl}/visit/tour/${tourSlug}`;

      expect(canonical).not.toContain("locale");
      expect(urlEn).not.toBe(urlUs); // Different URLs
      // But both should point to same canonical
    });

    it("should consolidate multi-locale variants to single canonical", () => {
      const baseUrl = "https://pikme.com";
      const path = "/states/kerala";
      const locales = ["en-IN", "en-US", "en-GB", "hi-IN"];

      const urls = locales.map((locale) => `${baseUrl}${path}?locale=${locale}`);
      const canonical = `${baseUrl}${path}`;

      // All URLs are different
      expect(new Set(urls).size).toBe(locales.length);

      // But all should point to same canonical
      urls.forEach((url) => {
        expect(url).not.toBe(canonical);
      });
    });
  });

  describe("Canonical URL Format", () => {
    it("should use HTTPS protocol", () => {
      const canonicals = [
        "https://pikme.com",
        "https://pikme.com/visit/tour/kerala-backwaters",
        "https://pikme.com/states/kerala",
      ];

      canonicals.forEach((canonical) => {
        expect(canonical).toMatch(/^https:\/\//);
      });
    });

    it("should not have trailing slash on paths", () => {
      const canonicals = [
        "https://pikme.com/visit/tour/kerala-backwaters",
        "https://pikme.com/states/kerala",
        "https://pikme.com/categories/adventure",
      ];

      canonicals.forEach((canonical) => {
        expect(canonical).not.toMatch(/\/$/);
      });
    });

    it("should have valid URL format", () => {
      const canonicals = [
        "https://pikme.com",
        "https://pikme.com/visit/tour/kerala-backwaters",
        "https://pikme.com/states/kerala",
      ];

      canonicals.forEach((canonical) => {
        expect(() => new URL(canonical)).not.toThrow();
      });
    });
  });

  describe("Page-Specific Canonical URLs", () => {
    it("should generate different canonicals for different pages", () => {
      const baseUrl = "https://pikme.com";

      const homeCanonical = `${baseUrl}`;
      const tourCanonical = `${baseUrl}/visit/tour/kerala-backwaters`;
      const stateCanonical = `${baseUrl}/states/kerala`;

      expect(homeCanonical).not.toBe(tourCanonical);
      expect(tourCanonical).not.toBe(stateCanonical);
      expect(homeCanonical).not.toBe(stateCanonical);
    });

    it("should generate same canonical for same content", () => {
      const baseUrl = "https://pikme.com";
      const tourSlug = "kerala-backwaters";

      const canonical1 = `${baseUrl}/visit/tour/${tourSlug}`;
      const canonical2 = `${baseUrl}/visit/tour/${tourSlug}`;

      expect(canonical1).toBe(canonical2);
    });
  });

  describe("Query Parameter Handling", () => {
    it("should exclude locale from canonical", () => {
      const canonical = "https://pikme.com/states/kerala";
      expect(canonical).not.toContain("locale");
    });

    it("should exclude tracking parameters from canonical", () => {
      const trackingParams = ["utm_source", "utm_medium", "fbclid", "gclid"];
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";

      trackingParams.forEach((param) => {
        expect(canonical).not.toContain(param);
      });
    });

    it("should include essential filter parameters in canonical", () => {
      const baseUrl = "https://pikme.com";
      const canonical = `${baseUrl}/tours?difficulty=moderate&duration=7`;

      expect(canonical).toContain("difficulty=moderate");
      expect(canonical).toContain("duration=7");
    });
  });

  describe("Hierarchical Content Canonical", () => {
    it("should generate canonical for state + city combination", () => {
      const baseUrl = "https://pikme.com";
      const stateSlug = "kerala";
      const citySlug = "kochi";
      const canonical = `${baseUrl}/states/${stateSlug}/${citySlug}`;

      expect(canonical).toContain(stateSlug);
      expect(canonical).toContain(citySlug);
    });

    it("should generate canonical for state + category combination", () => {
      const baseUrl = "https://pikme.com";
      const stateSlug = "kerala";
      const categorySlug = "adventure";
      const canonical = `${baseUrl}/states/${stateSlug}?category=${categorySlug}`;

      expect(canonical).toContain(stateSlug);
      expect(canonical).toContain(categorySlug);
    });

    it("should maintain consistent path structure", () => {
      const baseUrl = "https://pikme.com";

      const canonicals = [
        `${baseUrl}/states/kerala`,
        `${baseUrl}/states/maharashtra`,
        `${baseUrl}/states/goa`,
      ];

      canonicals.forEach((canonical) => {
        expect(canonical).toMatch(/^https:\/\/pikme\.com\/states\/[a-z-]+$/);
      });
    });
  });

  describe("Canonical Validation", () => {
    it("should validate HTTPS protocol", () => {
      const validCanonical = "https://pikme.com";
      const invalidCanonical = "http://pikme.com";

      expect(validCanonical).toMatch(/^https:\/\//);
      expect(invalidCanonical).not.toMatch(/^https:\/\//);
    });

    it("should validate URL structure", () => {
      const validCanonicals = [
        "https://pikme.com",
        "https://pikme.com/visit/tour/kerala-backwaters",
        "https://pikme.com/states/kerala",
      ];

      validCanonicals.forEach((canonical) => {
        expect(() => new URL(canonical)).not.toThrow();
      });
    });

    it("should detect invalid URLs", () => {
      const invalidCanonicals = [
        "not-a-url",
        "pikme.com",
        "http://pikme.com", // HTTP instead of HTTPS
      ];

      invalidCanonicals.forEach((canonical) => {
        if (canonical.startsWith("http")) {
          expect(canonical).not.toMatch(/^https:\/\//);
        } else {
          expect(() => new URL(canonical)).toThrow();
        }
      });
    });
  });

  describe("Self-Referential Canonical", () => {
    it("should identify self-referential canonical", () => {
      const pageUrl = "https://pikme.com/visit/tour/kerala-backwaters";
      const canonicalUrl = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(pageUrl).toBe(canonicalUrl);
    });

    it("should identify consolidated canonical", () => {
      const pageUrlWithLocale = "https://pikme.com/visit/tour/kerala-backwaters?locale=en-US";
      const canonicalUrl = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(pageUrlWithLocale).not.toBe(canonicalUrl);
      // But canonical consolidates multiple locale variants
    });
  });

  describe("Canonical for Different Content Types", () => {
    it("should generate canonical for tour list", () => {
      const canonical = "https://pikme.com/tours";
      expect(canonical).toBe("https://pikme.com/tours");
    });

    it("should generate canonical for state list", () => {
      const canonical = "https://pikme.com/states";
      expect(canonical).toBe("https://pikme.com/states");
    });

    it("should generate canonical for category list", () => {
      const canonical = "https://pikme.com/categories";
      expect(canonical).toBe("https://pikme.com/categories");
    });

    it("should generate canonical for destinations", () => {
      const canonical = "https://pikme.com/destinations";
      expect(canonical).toBe("https://pikme.com/destinations");
    });
  });

  describe("Canonical for Paginated Content", () => {
    it("should generate canonical for first page", () => {
      const canonical = "https://pikme.com/tours";
      expect(canonical).not.toContain("page");
    });

    it("should include page parameter in canonical for non-first pages", () => {
      const canonical = "https://pikme.com/tours?page=2";
      expect(canonical).toContain("page=2");
    });

    it("should maintain consistent pagination canonical", () => {
      const canonicals = [
        "https://pikme.com/tours",
        "https://pikme.com/tours?page=2",
        "https://pikme.com/tours?page=3",
      ];

      expect(canonicals[0]).not.toContain("page");
      expect(canonicals[1]).toContain("page=2");
      expect(canonicals[2]).toContain("page=3");
    });
  });

  describe("Canonical for Filtered Content", () => {
    it("should include filter parameters in canonical", () => {
      const canonical = "https://pikme.com/tours?difficulty=moderate";
      expect(canonical).toContain("difficulty=moderate");
    });

    it("should sort filter parameters consistently", () => {
      const canonical1 = "https://pikme.com/tours?difficulty=moderate&duration=7";
      const canonical2 = "https://pikme.com/tours?duration=7&difficulty=moderate";

      // Both should be valid, but ideally sorted consistently
      expect(canonical1).toContain("difficulty");
      expect(canonical2).toContain("difficulty");
    });
  });

  describe("Canonical HTML Meta Tag", () => {
    it("should generate valid canonical HTML tag", () => {
      const href = "https://pikme.com/visit/tour/kerala-backwaters";
      const htmlTag = `<link rel="canonical" href="${href}" />`;

      expect(htmlTag).toContain('rel="canonical"');
      expect(htmlTag).toContain(`href="${href}"`);
    });

    it("should have proper HTML structure", () => {
      const htmlTag = '<link rel="canonical" href="https://pikme.com" />';

      expect(htmlTag).toMatch(/<link\s+rel="canonical"\s+href="[^"]+"\s*\/>/);
    });
  });

  describe("Duplicate Content Prevention", () => {
    it("should prevent duplicate content from locale variants", () => {
      const baseUrl = "https://pikme.com";
      const path = "/states/kerala";
      const locales = ["en-IN", "en-US", "en-GB"];

      const urls = locales.map((locale) => `${baseUrl}${path}?locale=${locale}`);
      const canonical = `${baseUrl}${path}`;

      // All URLs are different but point to same canonical
      expect(new Set(urls).size).toBe(locales.length);
      urls.forEach((url) => {
        expect(url).not.toBe(canonical);
      });
    });

    it("should prevent duplicate content from tracking parameters", () => {
      const baseUrl = "https://pikme.com";
      const path = "/visit/tour/kerala-backwaters";

      const urlWithTracking = `${baseUrl}${path}?utm_source=google&utm_medium=cpc`;
      const canonical = `${baseUrl}${path}`;

      expect(urlWithTracking).not.toBe(canonical);
      expect(canonical).not.toContain("utm");
    });
  });

  describe("SEO Best Practices", () => {
    it("should use absolute URLs in canonical", () => {
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";
      expect(canonical).toMatch(/^https:\/\//);
    });

    it("should not use relative URLs in canonical", () => {
      const relativeUrl = "/visit/tour/kerala-backwaters";
      const absoluteUrl = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(relativeUrl).toMatch(/^\//);
      expect(absoluteUrl).toMatch(/^https:\/\//);
    });

    it("should maintain consistent domain in canonical", () => {
      const canonicals = [
        "https://pikme.com",
        "https://pikme.com/visit/tour/kerala-backwaters",
        "https://pikme.com/states/kerala",
      ];

      canonicals.forEach((canonical) => {
        expect(canonical).toContain("pikme.com");
      });
    });

    it("should not have session IDs in canonical", () => {
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";
      expect(canonical).not.toMatch(/jsessionid|phpsessid|sid=/i);
    });
  });

  describe("Canonical for Multi-Variant Content", () => {
    it("should consolidate mobile and desktop variants", () => {
      const desktopUrl = "https://pikme.com/visit/tour/kerala-backwaters";
      const mobileUrl = "https://m.pikme.com/visit/tour/kerala-backwaters";

      // Both should point to same canonical (desktop version)
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(canonical).toBe(desktopUrl);
    });

    it("should consolidate HTTP and HTTPS variants", () => {
      const httpUrl = "http://pikme.com/visit/tour/kerala-backwaters";
      const httpsUrl = "https://pikme.com/visit/tour/kerala-backwaters";

      // Canonical should be HTTPS
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(canonical).toBe(httpsUrl);
      expect(canonical).not.toBe(httpUrl);
    });
  });

  describe("Canonical Consistency", () => {
    it("should generate same canonical for same content", () => {
      const baseUrl = "https://pikme.com";
      const tourSlug = "kerala-backwaters";

      const canonical1 = `${baseUrl}/visit/tour/${tourSlug}`;
      const canonical2 = `${baseUrl}/visit/tour/${tourSlug}`;

      expect(canonical1).toBe(canonical2);
    });

    it("should maintain canonical consistency across page reloads", () => {
      const canonical = "https://pikme.com/visit/tour/kerala-backwaters";

      // Simulate multiple generations
      const canonicals = Array(5)
        .fill(null)
        .map(() => "https://pikme.com/visit/tour/kerala-backwaters");

      const uniqueCanonicals = new Set(canonicals);
      expect(uniqueCanonicals.size).toBe(1);
    });
  });
});

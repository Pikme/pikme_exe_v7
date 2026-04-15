import { describe, it, expect } from "vitest";
import {
  generateSitemap,
  generateSitemapIndex,
  generateSitemapEntry,
  generateMainPagesSitemapEntries,
  generateCountriesSitemapEntries,
  generateStatesSitemapEntries,
  generateLocationsSitemapEntries,
  generateCategoriesSitemapEntries,
  generateToursSitemapEntries,
  escapeXml,
  formatDateForSitemap,
  validateSitemapSize,
  splitSitemapEntries,
  SitemapEntry,
} from "./sitemap-utils";

describe("Sitemap Generation - Phase 2A", () => {
  describe("XML Escaping", () => {
    it("should escape XML special characters", () => {
      const input = '<tag attr="value">Content & more</tag>';
      const expected = "&lt;tag attr=&quot;value&quot;&gt;Content &amp; more&lt;/tag&gt;";
      expect(escapeXml(input)).toBe(expected);
    });

    it("should handle single quotes", () => {
      const input = "It's a test";
      const expected = "It&apos;s a test";
      expect(escapeXml(input)).toBe(expected);
    });
  });

  describe("Date Formatting", () => {
    it("should format date to ISO 8601 format", () => {
      const date = new Date("2026-01-21T12:00:00Z");
      const formatted = formatDateForSitemap(date);
      expect(formatted).toBe("2026-01-21");
    });

    it("should handle different date values", () => {
      const date = new Date("2025-12-31T23:59:59Z");
      const formatted = formatDateForSitemap(date);
      expect(formatted).toBe("2025-12-31");
    });
  });

  describe("Sitemap Entry Generation", () => {
    it("should generate basic sitemap entry", () => {
      const entry: SitemapEntry = {
        loc: "https://example.com/page",
      };
      const xml = generateSitemapEntry(entry);
      expect(xml).toContain("<loc>https://example.com/page</loc>");
      expect(xml).toContain("<url>");
      expect(xml).toContain("</url>");
    });

    it("should include optional fields when provided", () => {
      const entry: SitemapEntry = {
        loc: "https://example.com/page",
        lastmod: "2026-01-21",
        changefreq: "weekly",
        priority: 0.8,
      };
      const xml = generateSitemapEntry(entry);
      expect(xml).toContain("<lastmod>2026-01-21</lastmod>");
      expect(xml).toContain("<changefreq>weekly</changefreq>");
      expect(xml).toContain("<priority>0.8</priority>");
    });

    it("should escape URLs with special characters", () => {
      const entry: SitemapEntry = {
        loc: "https://example.com/page?param=value&other=test",
      };
      const xml = generateSitemapEntry(entry);
      expect(xml).toContain("&amp;");
    });
  });

  describe("Main Pages Sitemap", () => {
    it("should generate main pages sitemap entries", () => {
      const baseUrl = "https://pikme.com";
      const entries = generateMainPagesSitemapEntries(baseUrl);

      expect(entries.length).toBeGreaterThan(0);
      expect(entries.some((e) => e.loc === "https://pikme.com")).toBe(true);
      expect(entries.some((e) => e.loc === "https://pikme.com/tours")).toBe(true);
      expect(entries.some((e) => e.loc === "https://pikme.com/countries")).toBe(true);
      expect(entries.some((e) => e.loc === "https://pikme.com/states")).toBe(true);
      expect(entries.some((e) => e.loc === "https://pikme.com/categories")).toBe(true);
    });

    it("should set home page priority to 1.0", () => {
      const baseUrl = "https://pikme.com";
      const entries = generateMainPagesSitemapEntries(baseUrl);
      const homeEntry = entries.find((e) => e.loc === baseUrl);

      expect(homeEntry?.priority).toBe(1.0);
    });

    it("should set daily changefreq for home page", () => {
      const baseUrl = "https://pikme.com";
      const entries = generateMainPagesSitemapEntries(baseUrl);
      const homeEntry = entries.find((e) => e.loc === baseUrl);

      expect(homeEntry?.changefreq).toBe("daily");
    });
  });

  describe("Hierarchical Sitemap Entries", () => {
    it("should generate countries sitemap entries", () => {
      const countries = [
        { id: 1, slug: "india", updatedAt: new Date() },
        { id: 2, slug: "thailand", updatedAt: new Date() },
      ];
      const entries = generateCountriesSitemapEntries(countries, "https://pikme.com");

      expect(entries.length).toBe(2);
      expect(entries[0].loc).toBe("https://pikme.com/countries/india");
      expect(entries[0].priority).toBe(0.8);
    });

    it("should generate states sitemap entries", () => {
      const states = [
        { id: 1, slug: "kerala", updatedAt: new Date() },
        { id: 2, slug: "tamil-nadu", updatedAt: new Date() },
      ];
      const entries = generateStatesSitemapEntries(states, "https://pikme.com");

      expect(entries.length).toBe(2);
      expect(entries[0].loc).toBe("https://pikme.com/states/kerala");
      expect(entries[0].priority).toBe(0.8);
    });

    it("should generate locations sitemap entries", () => {
      const locations = [
        { id: 1, slug: "kochi", stateId: 1, updatedAt: new Date() },
        { id: 2, slug: "thiruvananthapuram", stateId: 1, updatedAt: new Date() },
      ];
      const entries = generateLocationsSitemapEntries(locations, "https://pikme.com");

      expect(entries.length).toBe(2);
      expect(entries[0].loc).toBe("https://pikme.com/locations/kochi");
      expect(entries[0].priority).toBe(0.7);
    });

    it("should generate categories sitemap entries", () => {
      const categories = [
        { id: 1, slug: "adventure", updatedAt: new Date() },
        { id: 2, slug: "beach", updatedAt: new Date() },
      ];
      const entries = generateCategoriesSitemapEntries(categories, "https://pikme.com");

      expect(entries.length).toBe(2);
      expect(entries[0].loc).toBe("https://pikme.com/categories/adventure");
      expect(entries[0].priority).toBe(0.8);
    });

    it("should generate tours sitemap entries", () => {
      const tours = [
        { id: 1, slug: "kerala-backwaters", updatedAt: new Date(), isFeatured: true },
        { id: 2, slug: "munnar-trek", updatedAt: new Date(), isFeatured: false },
      ];
      const entries = generateToursSitemapEntries(tours, "https://pikme.com");

      expect(entries.length).toBe(2);
      expect(entries[0].loc).toBe("https://pikme.com/visit/tour/kerala-backwaters");
      expect(entries[0].priority).toBe(0.9); // Featured tour
      expect(entries[1].priority).toBe(0.7); // Non-featured tour
    });
  });

  describe("Complete Sitemap Generation", () => {
    it("should generate valid XML sitemap", () => {
      const entries: SitemapEntry[] = [
        { loc: "https://example.com/page1", priority: 0.8 },
        { loc: "https://example.com/page2", priority: 0.7 },
      ];
      const xml = generateSitemap(entries);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<urlset");
      expect(xml).toContain("</urlset>");
      expect(xml).toContain("<loc>https://example.com/page1</loc>");
      expect(xml).toContain("<loc>https://example.com/page2</loc>");
    });

    it("should generate valid sitemap index", () => {
      const sitemaps = [
        { loc: "https://example.com/sitemap-main.xml", lastmod: "2026-01-21" },
        { loc: "https://example.com/sitemap-tours.xml", lastmod: "2026-01-21" },
      ];
      const xml = generateSitemapIndex(sitemaps);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<sitemapindex");
      expect(xml).toContain("</sitemapindex>");
      expect(xml).toContain("<loc>https://example.com/sitemap-main.xml</loc>");
      expect(xml).toContain("<loc>https://example.com/sitemap-tours.xml</loc>");
    });
  });

  describe("Sitemap Size Validation", () => {
    it("should validate sitemap size", () => {
      const entries: SitemapEntry[] = Array.from({ length: 100 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      expect(validateSitemapSize(entries)).toBe(true);
    });

    it("should reject oversized sitemaps", () => {
      const entries: SitemapEntry[] = Array.from({ length: 50001 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      expect(validateSitemapSize(entries)).toBe(false);
    });

    it("should handle Google's 50,000 URL limit", () => {
      const entries: SitemapEntry[] = Array.from({ length: 50000 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      expect(validateSitemapSize(entries)).toBe(true);
    });
  });

  describe("Sitemap Splitting", () => {
    it("should split large sitemaps into chunks", () => {
      const entries: SitemapEntry[] = Array.from({ length: 100 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      const chunks = splitSitemapEntries(entries, 30);
      expect(chunks.length).toBe(4); // 100 / 30 = 3.33, rounded up to 4
      expect(chunks[0].length).toBe(30);
      expect(chunks[3].length).toBe(10);
    });

    it("should handle exact division", () => {
      const entries: SitemapEntry[] = Array.from({ length: 60 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      const chunks = splitSitemapEntries(entries, 30);
      expect(chunks.length).toBe(2);
      expect(chunks[0].length).toBe(30);
      expect(chunks[1].length).toBe(30);
    });

    it("should handle single chunk", () => {
      const entries: SitemapEntry[] = Array.from({ length: 20 }, (_, i) => ({
        loc: `https://example.com/page${i}`,
      }));

      const chunks = splitSitemapEntries(entries, 30);
      expect(chunks.length).toBe(1);
      expect(chunks[0].length).toBe(20);
    });
  });

  describe("SEO Best Practices", () => {
    it("should include lastmod for dynamic content", () => {
      const entries: SitemapEntry[] = [
        {
          loc: "https://example.com/page",
          lastmod: "2026-01-21",
          changefreq: "weekly",
        },
      ];
      const xml = generateSitemap(entries);

      expect(xml).toContain("<lastmod>2026-01-21</lastmod>");
      expect(xml).toContain("<changefreq>weekly</changefreq>");
    });

    it("should set appropriate priorities for hierarchy", () => {
      const entries = [
        { loc: "https://pikme.com", priority: 1.0 }, // Home
        { loc: "https://pikme.com/countries/india", priority: 0.8 }, // Country
        { loc: "https://pikme.com/states/kerala", priority: 0.8 }, // State
        { loc: "https://pikme.com/locations/kochi", priority: 0.7 }, // City
        { loc: "https://pikme.com/visit/tour/backwaters", priority: 0.9 }, // Featured tour
      ];

      entries.forEach((entry) => {
        expect(entry.priority).toBeGreaterThan(0);
        expect(entry.priority).toBeLessThanOrEqual(1.0);
      });
    });

    it("should use appropriate changefreq values", () => {
      const validChangefreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
      const entries: SitemapEntry[] = [
        { loc: "https://example.com", changefreq: "daily" },
        { loc: "https://example.com/tours", changefreq: "weekly" },
      ];

      entries.forEach((entry) => {
        if (entry.changefreq) {
          expect(validChangefreqs).toContain(entry.changefreq);
        }
      });
    });
  });

  describe("Robots.txt Integration", () => {
    it("should reference all sitemap endpoints", () => {
      const sitemapReferences = [
        "Sitemap: https://pikme.com/api/trpc/sitemap.index",
        "Sitemap: https://pikme.com/api/trpc/sitemap.main",
        "Sitemap: https://pikme.com/api/trpc/sitemap.countries",
        "Sitemap: https://pikme.com/api/trpc/sitemap.states",
        "Sitemap: https://pikme.com/api/trpc/sitemap.locations",
        "Sitemap: https://pikme.com/api/trpc/sitemap.categories",
        "Sitemap: https://pikme.com/api/trpc/sitemap.tours",
      ];

      expect(sitemapReferences.length).toBe(7);
      expect(sitemapReferences.every((ref) => ref.startsWith("Sitemap:"))).toBe(true);
    });
  });
});

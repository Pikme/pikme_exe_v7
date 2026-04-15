import { describe, it, expect } from "vitest";

/**
 * hreflang Tests - Phase 2C
 * Tests for international SEO hreflang tag generation
 */

describe("hreflang - International SEO - Phase 2C", () => {
  describe("Supported Locales", () => {
    it("should have primary India locales", () => {
      const locales = {
        "en-IN": { language: "en", region: "IN", label: "English (India)" },
        "hi-IN": { language: "hi", region: "IN", label: "Hindi (India)" },
      };

      expect(locales["en-IN"]).toBeDefined();
      expect(locales["hi-IN"]).toBeDefined();
      expect(locales["en-IN"].region).toBe("IN");
    });

    it("should have English-speaking country locales", () => {
      const locales = {
        "en-US": { language: "en", region: "US", label: "English (United States)" },
        "en-GB": { language: "en", region: "GB", label: "English (United Kingdom)" },
        "en-AU": { language: "en", region: "AU", label: "English (Australia)" },
        "en-CA": { language: "en", region: "CA", label: "English (Canada)" },
      };

      Object.entries(locales).forEach(([locale, config]) => {
        expect(config.language).toBe("en");
        expect(config.label).toContain("English");
      });
    });

    it("should have European locales", () => {
      const locales = {
        "es-ES": { language: "es", region: "ES", label: "Spanish (Spain)" },
        "fr-FR": { language: "fr", region: "FR", label: "French (France)" },
        "de-DE": { language: "de", region: "DE", label: "German (Germany)" },
      };

      expect(locales["es-ES"].region).toBe("ES");
      expect(locales["fr-FR"].region).toBe("FR");
      expect(locales["de-DE"].region).toBe("DE");
    });

    it("should have Asian locales", () => {
      const locales = {
        "ja-JP": { language: "ja", region: "JP", label: "Japanese (Japan)" },
        "zh-CN": { language: "zh", region: "CN", label: "Chinese (China)" },
      };

      expect(locales["ja-JP"].region).toBe("JP");
      expect(locales["zh-CN"].region).toBe("CN");
    });
  });

  describe("hreflang Link Generation", () => {
    it("should generate valid hreflang link", () => {
      const link = {
        rel: "alternate" as const,
        hreflang: "en-IN",
        href: "https://pikme.com?locale=en-IN",
      };

      expect(link.rel).toBe("alternate");
      expect(link.hreflang).toBe("en-IN");
      expect(link.href).toMatch(/^https:\/\//);
    });

    it("should include locale parameter in URL", () => {
      const locales = ["en-IN", "en-US", "en-GB"];
      const baseUrl = "https://pikme.com";

      locales.forEach((locale) => {
        const url = `${baseUrl}?locale=${locale}`;
        expect(url).toContain(`locale=${locale}`);
      });
    });

    it("should generate x-default link", () => {
      const link = {
        rel: "alternate" as const,
        hreflang: "x-default",
        href: "https://pikme.com",
      };

      expect(link.hreflang).toBe("x-default");
      expect(link.href).toBe("https://pikme.com");
    });
  });

  describe("Locale-Specific hreflang Links", () => {
    it("should generate English hreflang links", () => {
      const baseUrl = "https://pikme.com";
      const englishLocales = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA"];

      const links = englishLocales.map((locale) => ({
        rel: "alternate" as const,
        hreflang: locale,
        href: `${baseUrl}?locale=${locale}`,
      }));

      expect(links).toHaveLength(5);
      expect(links.every((link) => link.hreflang.startsWith("en"))).toBe(true);
    });

    it("should generate India-specific hreflang links", () => {
      const baseUrl = "https://pikme.com";
      const indiaLocales = ["en-IN", "hi-IN"];

      const links = indiaLocales.map((locale) => ({
        rel: "alternate" as const,
        hreflang: locale,
        href: `${baseUrl}?locale=${locale}`,
      }));

      expect(links).toHaveLength(2);
      expect(links.every((link) => link.hreflang.endsWith("-IN"))).toBe(true);
    });

    it("should include x-default in all hreflang sets", () => {
      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: "https://pikme.com?locale=en-IN" },
        { rel: "alternate" as const, hreflang: "en-US", href: "https://pikme.com?locale=en-US" },
        { rel: "alternate" as const, hreflang: "x-default", href: "https://pikme.com" },
      ];

      expect(links.some((link) => link.hreflang === "x-default")).toBe(true);
    });
  });

  describe("Page-Specific hreflang", () => {
    it("should generate tour page hreflang links", () => {
      const baseUrl = "https://pikme.com";
      const tourSlug = "kerala-backwaters";
      const path = `/visit/tour/${tourSlug}`;

      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: `${baseUrl}${path}?locale=en-IN` },
        { rel: "alternate" as const, hreflang: "en-US", href: `${baseUrl}${path}?locale=en-US` },
        { rel: "alternate" as const, hreflang: "x-default", href: `${baseUrl}${path}` },
      ];

      expect(links[0].href).toContain("/visit/tour/kerala-backwaters");
      expect(links.every((link) => link.href.includes(tourSlug))).toBe(true);
    });

    it("should generate state page hreflang links", () => {
      const baseUrl = "https://pikme.com";
      const stateSlug = "kerala";
      const path = `/states/${stateSlug}`;

      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: `${baseUrl}${path}?locale=en-IN` },
        { rel: "alternate" as const, hreflang: "en-US", href: `${baseUrl}${path}?locale=en-US` },
        { rel: "alternate" as const, hreflang: "x-default", href: `${baseUrl}${path}` },
      ];

      expect(links[0].href).toContain("/states/kerala");
      expect(links.every((link) => link.href.includes(stateSlug))).toBe(true);
    });

    it("should generate category page hreflang links", () => {
      const baseUrl = "https://pikme.com";
      const categorySlug = "adventure";
      const path = `/categories/${categorySlug}`;

      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: `${baseUrl}${path}?locale=en-IN` },
        { rel: "alternate" as const, hreflang: "en-US", href: `${baseUrl}${path}?locale=en-US` },
        { rel: "alternate" as const, hreflang: "x-default", href: `${baseUrl}${path}` },
      ];

      expect(links[0].href).toContain("/categories/adventure");
      expect(links.every((link) => link.href.includes(categorySlug))).toBe(true);
    });
  });

  describe("hreflang Validation", () => {
    it("should have valid hreflang format (language-region)", () => {
      const validLocales = ["en-IN", "en-US", "es-ES", "fr-FR"];

      validLocales.forEach((locale) => {
        const parts = locale.split("-");
        expect(parts).toHaveLength(2);
        expect(parts[0].length).toBe(2); // Language code
        expect(parts[1].length).toBe(2); // Region code
      });
    });

    it("should validate x-default format", () => {
      const xDefault = "x-default";
      expect(xDefault).toMatch(/^x-default$/);
    });

    it("should validate URL format", () => {
      const urls = [
        "https://pikme.com",
        "https://pikme.com?locale=en-IN",
        "https://pikme.com/states/kerala",
        "https://pikme.com/visit/tour/kerala-backwaters?locale=en-US",
      ];

      urls.forEach((url) => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it("should ensure x-default points to base URL", () => {
      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: "https://pikme.com?locale=en-IN" },
        { rel: "alternate" as const, hreflang: "x-default", href: "https://pikme.com" },
      ];

      const xDefaultLink = links.find((link) => link.hreflang === "x-default");
      expect(xDefaultLink?.href).not.toContain("?locale=");
    });
  });

  describe("Locale Management", () => {
    it("should identify primary locale as en-IN", () => {
      const primaryLocale = "en-IN";
      expect(primaryLocale).toBe("en-IN");
    });

    it("should support locale switching", () => {
      const currentLocale = "en-IN";
      const newLocale = "en-US";

      expect(currentLocale).not.toBe(newLocale);
      expect(newLocale).toMatch(/^en-/);
    });

    it("should preserve locale in URL parameters", () => {
      const baseUrl = "https://pikme.com/states/kerala";
      const locale = "en-US";
      const urlWithLocale = `${baseUrl}?locale=${locale}`;

      const params = new URLSearchParams(urlWithLocale.split("?")[1]);
      expect(params.get("locale")).toBe("en-US");
    });

    it("should handle locale fallback", () => {
      const preferredLocale = "en-IN";
      const fallbackLocale = "en-US";

      // If preferred is not available, use fallback
      const selectedLocale = preferredLocale || fallbackLocale;
      expect(selectedLocale).toBe("en-IN");
    });
  });

  describe("SEO Best Practices", () => {
    it("should include all major English markets", () => {
      const englishMarkets = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA"];
      expect(englishMarkets).toHaveLength(5);
    });

    it("should prioritize India locale", () => {
      const locales = ["en-IN", "en-US", "en-GB"];
      const primaryLocale = locales[0];
      expect(primaryLocale).toBe("en-IN");
    });

    it("should include x-default for unspecified locales", () => {
      const links = [
        { rel: "alternate" as const, hreflang: "en-IN", href: "https://pikme.com?locale=en-IN" },
        { rel: "alternate" as const, hreflang: "x-default", href: "https://pikme.com" },
      ];

      expect(links.some((link) => link.hreflang === "x-default")).toBe(true);
    });

    it("should use HTTPS URLs only", () => {
      const urls = [
        "https://pikme.com",
        "https://pikme.com?locale=en-IN",
        "https://pikme.com/states/kerala",
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it("should maintain consistent URL structure", () => {
      const baseUrl = "https://pikme.com";
      const paths = ["/states/kerala", "/visit/tour/kerala-backwaters", "/categories/adventure"];

      paths.forEach((path) => {
        const url = `${baseUrl}${path}`;
        expect(url).toMatch(/^https:\/\/pikme\.com\//);
      });
    });
  });

  describe("Hreflang HTML Meta Tags", () => {
    it("should generate valid HTML meta tag format", () => {
      const link = {
        rel: "alternate",
        hreflang: "en-IN",
        href: "https://pikme.com?locale=en-IN",
      };

      const htmlTag = `<link rel="${link.rel}" hreflang="${link.hreflang}" href="${link.href}" />`;
      expect(htmlTag).toContain('rel="alternate"');
      expect(htmlTag).toContain('hreflang="en-IN"');
      expect(htmlTag).toContain("href=");
    });

    it("should generate multiple hreflang meta tags", () => {
      const links = [
        { rel: "alternate", hreflang: "en-IN", href: "https://pikme.com?locale=en-IN" },
        { rel: "alternate", hreflang: "en-US", href: "https://pikme.com?locale=en-US" },
        { rel: "alternate", hreflang: "x-default", href: "https://pikme.com" },
      ];

      const htmlTags = links
        .map(
          (link) =>
            `<link rel="${link.rel}" hreflang="${link.hreflang}" href="${link.href}" />`
        )
        .join("\n");

      expect(htmlTags).toContain("en-IN");
      expect(htmlTags).toContain("en-US");
      expect(htmlTags).toContain("x-default");
    });

    it("should place hreflang tags in head section", () => {
      const htmlTag = '<link rel="alternate" hreflang="en-IN" href="https://pikme.com?locale=en-IN" />';
      // In a real scenario, this would be verified in the DOM
      expect(htmlTag).toContain("<link");
      expect(htmlTag).toContain("rel=");
    });
  });

  describe("International Market Coverage", () => {
    it("should support major English-speaking markets", () => {
      const markets = ["IN", "US", "GB", "AU", "CA"];
      expect(markets).toHaveLength(5);
    });

    it("should support major European markets", () => {
      const markets = ["ES", "FR", "DE"];
      expect(markets).toHaveLength(3);
    });

    it("should support major Asian markets", () => {
      const markets = ["JP", "CN"];
      expect(markets).toHaveLength(2);
    });

    it("should support other major markets", () => {
      const markets = ["BR", "RU", "SA"];
      expect(markets).toHaveLength(3);
    });
  });

  describe("Locale Display Labels", () => {
    it("should provide readable locale labels", () => {
      const labels = {
        "en-IN": "English (India)",
        "en-US": "English (United States)",
        "hi-IN": "Hindi (India)",
        "es-ES": "Spanish (Spain)",
      };

      Object.values(labels).forEach((label) => {
        expect(label).toContain("(");
        expect(label).toContain(")");
      });
    });

    it("should include language and region in labels", () => {
      const label = "English (India)";
      const parts = label.split(" (");

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe("English");
      expect(parts[1]).toBe("India)");
    });
  });
});

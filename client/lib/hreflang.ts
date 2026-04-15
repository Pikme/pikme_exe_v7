/**
 * hreflang Utilities for International SEO
 * Manages language and region alternate links for better search visibility
 */

export type LanguageCode = "en" | "hi" | "es" | "fr" | "de" | "ja" | "zh" | "pt" | "ru" | "ar";

export interface LocaleVariant {
  locale: string; // e.g., "en-US", "en-GB", "hi-IN", "es-ES"
  language: LanguageCode;
  region: string; // e.g., "US", "GB", "IN", "ES"
  url: string;
}

export interface HreflangLink {
  rel: "alternate";
  hreflang: string;
  href: string;
}

/**
 * Supported locales for Pikme Travel
 * Primary: India (en-IN, hi-IN)
 * Secondary: English-speaking countries (US, UK, AU, CA)
 * Tertiary: European and other markets
 */
export const SUPPORTED_LOCALES = {
  "en-IN": { language: "en", region: "IN", label: "English (India)" },
  "hi-IN": { language: "hi", region: "IN", label: "Hindi (India)" },
  "en-US": { language: "en", region: "US", label: "English (United States)" },
  "en-GB": { language: "en", region: "GB", label: "English (United Kingdom)" },
  "en-AU": { language: "en", region: "AU", label: "English (Australia)" },
  "en-CA": { language: "en", region: "CA", label: "English (Canada)" },
  "es-ES": { language: "es", region: "ES", label: "Spanish (Spain)" },
  "es-MX": { language: "es", region: "MX", label: "Spanish (Mexico)" },
  "fr-FR": { language: "fr", region: "FR", label: "French (France)" },
  "de-DE": { language: "de", region: "DE", label: "German (Germany)" },
  "ja-JP": { language: "ja", region: "JP", label: "Japanese (Japan)" },
  "zh-CN": { language: "zh", region: "CN", label: "Chinese (China)" },
  "pt-BR": { language: "pt", region: "BR", label: "Portuguese (Brazil)" },
  "ru-RU": { language: "ru", region: "RU", label: "Russian (Russia)" },
  "ar-SA": { language: "ar", region: "SA", label: "Arabic (Saudi Arabia)" },
} as const;

/**
 * Generate hreflang link for a specific locale
 */
export function generateHreflangLink(hreflang: string, href: string): HreflangLink {
  return {
    rel: "alternate",
    hreflang,
    href,
  };
}

/**
 * Generate hreflang links for all supported locales
 */
export function generateAllHreflangLinks(baseUrl: string, path: string = ""): HreflangLink[] {
  const links: HreflangLink[] = [];

  // Add locale-specific links
  Object.keys(SUPPORTED_LOCALES).forEach((locale) => {
    const url = `${baseUrl}${path}?locale=${locale}`;
    links.push(generateHreflangLink(locale, url));
  });

  // Add x-default for unspecified locales
  const defaultUrl = `${baseUrl}${path}`;
  links.push(generateHreflangLink("x-default", defaultUrl));

  return links;
}

/**
 * Generate hreflang links for English-speaking regions
 * Useful for content that's primarily in English
 */
export function generateEnglishHreflangLinks(baseUrl: string, path: string = ""): HreflangLink[] {
  const englishLocales = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA"];
  const links: HreflangLink[] = [];

  englishLocales.forEach((locale) => {
    const url = `${baseUrl}${path}?locale=${locale}`;
    links.push(generateHreflangLink(locale, url));
  });

  // Add x-default
  const defaultUrl = `${baseUrl}${path}`;
  links.push(generateHreflangLink("x-default", defaultUrl));

  return links;
}

/**
 * Generate hreflang links for India-focused content
 * Includes English and Hindi variants
 */
export function generateIndiaHreflangLinks(baseUrl: string, path: string = ""): HreflangLink[] {
  const indiaLocales = ["en-IN", "hi-IN"];
  const links: HreflangLink[] = [];

  indiaLocales.forEach((locale) => {
    const url = `${baseUrl}${path}?locale=${locale}`;
    links.push(generateHreflangLink(locale, url));
  });

  // Add x-default (defaults to en-IN)
  const defaultUrl = `${baseUrl}${path}`;
  links.push(generateHreflangLink("x-default", defaultUrl));

  return links;
}

/**
 * Generate hreflang links for specific locales
 */
export function generateCustomHreflangLinks(
  baseUrl: string,
  locales: string[],
  path: string = ""
): HreflangLink[] {
  const links: HreflangLink[] = [];

  locales.forEach((locale) => {
    if (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]) {
      const url = `${baseUrl}${path}?locale=${locale}`;
      links.push(generateHreflangLink(locale, url));
    }
  });

  // Add x-default
  const defaultUrl = `${baseUrl}${path}`;
  links.push(generateHreflangLink("x-default", defaultUrl));

  return links;
}

/**
 * Get current locale from URL or browser
 */
export function getCurrentLocale(): string {
  // Check URL parameter
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const urlLocale = params.get("locale");
  if (urlLocale && SUPPORTED_LOCALES[urlLocale as keyof typeof SUPPORTED_LOCALES]) {
    return urlLocale;
  }

  // Check localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("preferred-locale");
    if (stored && SUPPORTED_LOCALES[stored as keyof typeof SUPPORTED_LOCALES]) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language || "en-IN";
    if (SUPPORTED_LOCALES[browserLang as keyof typeof SUPPORTED_LOCALES]) {
      return browserLang;
    }

    // Check browser language without region
    const langOnly = browserLang.split("-")[0];
    const matchingLocale = Object.keys(SUPPORTED_LOCALES).find((locale) =>
      locale.startsWith(langOnly)
    );
    if (matchingLocale) {
      return matchingLocale;
    }
  }

  // Default to en-IN
  return "en-IN";
}

/**
 * Set preferred locale in localStorage
 */
export function setPreferredLocale(locale: string): void {
  if (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]) {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", locale);
    }
  }
}

/**
 * Get locale label for display
 */
export function getLocaleLabel(locale: string): string {
  const config = SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES];
  return config?.label || locale;
}

/**
 * Get all available locales
 */
export function getAllLocales(): Array<{ locale: string; label: string }> {
  return Object.entries(SUPPORTED_LOCALES).map(([locale, config]) => ({
    locale,
    label: config.label,
  }));
}

/**
 * Generate hreflang links for tour pages
 */
export function generateTourHreflangLinks(
  baseUrl: string,
  tourSlug: string,
  locales: string[] = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA", "x-default"]
): HreflangLink[] {
  const links: HreflangLink[] = [];
  const path = `/visit/tour/${tourSlug}`;

  locales.forEach((locale) => {
    if (locale === "x-default") {
      links.push(generateHreflangLink("x-default", `${baseUrl}${path}`));
    } else if (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]) {
      links.push(generateHreflangLink(locale, `${baseUrl}${path}?locale=${locale}`));
    }
  });

  return links;
}

/**
 * Generate hreflang links for state pages
 */
export function generateStateHreflangLinks(
  baseUrl: string,
  stateSlug: string,
  locales: string[] = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA", "x-default"]
): HreflangLink[] {
  const links: HreflangLink[] = [];
  const path = `/states/${stateSlug}`;

  locales.forEach((locale) => {
    if (locale === "x-default") {
      links.push(generateHreflangLink("x-default", `${baseUrl}${path}`));
    } else if (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]) {
      links.push(generateHreflangLink(locale, `${baseUrl}${path}?locale=${locale}`));
    }
  });

  return links;
}

/**
 * Generate hreflang links for category pages
 */
export function generateCategoryHreflangLinks(
  baseUrl: string,
  categorySlug: string,
  locales: string[] = ["en-IN", "en-US", "en-GB", "en-AU", "en-CA", "x-default"]
): HreflangLink[] {
  const links: HreflangLink[] = [];
  const path = `/categories/${categorySlug}`;

  locales.forEach((locale) => {
    if (locale === "x-default") {
      links.push(generateHreflangLink("x-default", `${baseUrl}${path}`));
    } else if (SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES]) {
      links.push(generateHreflangLink(locale, `${baseUrl}${path}?locale=${locale}`));
    }
  });

  return links;
}

/**
 * Convert hreflang links to HTML meta tags
 */
export function hreflangToHtmlMeta(links: HreflangLink[]): string {
  return links
    .map((link) => `<link rel="${link.rel}" hreflang="${link.hreflang}" href="${link.href}" />`)
    .join("\n");
}

/**
 * Validate hreflang configuration
 */
export function validateHreflangConfig(links: HreflangLink[]): boolean {
  // Check for x-default
  const hasDefault = links.some((link) => link.hreflang === "x-default");
  if (!hasDefault) {
    console.warn("hreflang: Missing x-default link");
    return false;
  }

  // Check for valid hreflang values
  const validLocales = Object.keys(SUPPORTED_LOCALES);
  const allValid = links.every((link) => {
    if (link.hreflang === "x-default") return true;
    return validLocales.includes(link.hreflang);
  });

  if (!allValid) {
    console.warn("hreflang: Invalid hreflang values detected");
    return false;
  }

  // Check for valid URLs
  const urlValid = links.every((link) => {
    try {
      new URL(link.href);
      return true;
    } catch {
      return false;
    }
  });

  if (!urlValid) {
    console.warn("hreflang: Invalid URLs detected");
    return false;
  }

  return true;
}

/**
 * Get hreflang links for current page
 */
export function getPageHreflangLinks(
  baseUrl: string,
  pathname: string,
  pageType: "home" | "tour" | "state" | "category" | "generic" = "generic"
): HreflangLink[] {
  switch (pageType) {
    case "home":
      return generateEnglishHreflangLinks(baseUrl);
    case "tour": {
      const tourSlug = pathname.split("/").pop();
      return tourSlug ? generateTourHreflangLinks(baseUrl, tourSlug) : generateEnglishHreflangLinks(baseUrl);
    }
    case "state": {
      const stateSlug = pathname.split("/").pop();
      return stateSlug ? generateStateHreflangLinks(baseUrl, stateSlug) : generateEnglishHreflangLinks(baseUrl);
    }
    case "category": {
      const categorySlug = pathname.split("/").pop();
      return categorySlug ? generateCategoryHreflangLinks(baseUrl, categorySlug) : generateEnglishHreflangLinks(baseUrl);
    }
    default:
      return generateEnglishHreflangLinks(baseUrl, pathname);
  }
}

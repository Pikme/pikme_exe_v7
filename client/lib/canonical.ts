/**
 * Canonical URL Utilities for Duplicate Content Prevention
 * Manages canonical URLs across multi-locale and hierarchical pages
 */

export interface CanonicalConfig {
  baseUrl: string;
  path: string;
  locale?: string;
  ignoreLocale?: boolean; // If true, canonical points to base URL without locale
  queryParams?: Record<string, string>;
}

export interface CanonicalLink {
  rel: "canonical";
  href: string;
}

/**
 * Generate canonical URL for a page
 * By default, canonical points to the primary locale (en-IN) without locale parameter
 */
export function generateCanonicalUrl(config: CanonicalConfig): string {
  const { baseUrl, path, locale, ignoreLocale = true, queryParams = {} } = config;

  // Build base URL with path
  let url = `${baseUrl}${path}`;

  // Add locale to canonical if specified and not ignoring locale
  if (locale && !ignoreLocale) {
    queryParams.locale = locale;
  }

  // Add query parameters
  const params = new URLSearchParams(queryParams);
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
}

/**
 * Generate canonical link element
 */
export function generateCanonicalLink(href: string): CanonicalLink {
  return {
    rel: "canonical",
    href,
  };
}

/**
 * Generate canonical URL for home page
 */
export function getHomeCanonical(baseUrl: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "",
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for tour page
 * Canonical ignores locale parameter to consolidate all locale variants
 */
export function getTourCanonical(baseUrl: string, tourSlug: string, locale?: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: `/visit/tour/${tourSlug}`,
    locale,
    ignoreLocale: true, // Canonical ignores locale
  });
}

/**
 * Generate canonical URL for state page
 */
export function getStateCanonical(baseUrl: string, stateSlug: string, locale?: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: `/states/${stateSlug}`,
    locale,
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for state + city combination
 */
export function getStateCityCanonical(
  baseUrl: string,
  stateSlug: string,
  citySlug: string,
  locale?: string
): string {
  return generateCanonicalUrl({
    baseUrl,
    path: `/states/${stateSlug}/${citySlug}`,
    locale,
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for category page
 */
export function getCategoryCanonical(baseUrl: string, categorySlug: string, locale?: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: `/categories/${categorySlug}`,
    locale,
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for state + category combination
 */
export function getStateCategoryCanonical(
  baseUrl: string,
  stateSlug: string,
  categorySlug: string,
  locale?: string
): string {
  return generateCanonicalUrl({
    baseUrl,
    path: `/states/${stateSlug}?category=${categorySlug}`,
    locale,
    ignoreLocale: true,
    queryParams: { category: categorySlug },
  });
}

/**
 * Generate canonical URL for destinations page
 */
export function getDestinationsCanonical(baseUrl: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "/destinations",
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for tours page
 */
export function getToursCanonical(baseUrl: string, filters?: Record<string, string>): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "/tours",
    ignoreLocale: true,
    queryParams: filters,
  });
}

/**
 * Generate canonical URL for category list page
 */
export function getCategoriesCanonical(baseUrl: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "/categories",
    ignoreLocale: true,
  });
}

/**
 * Generate canonical URL for states list page
 */
export function getStatesCanonical(baseUrl: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "/states",
    ignoreLocale: true,
  });
}

/**
 * Get canonical URL from current pathname
 * Auto-detects page type and generates appropriate canonical
 */
export function getCanonicalFromPathname(baseUrl: string, pathname: string): string {
  // Remove trailing slash
  const path = pathname.replace(/\/$/, "");

  // Home page
  if (!path || path === "") {
    return getHomeCanonical(baseUrl);
  }

  // Tour detail page
  if (path.startsWith("/visit/tour/")) {
    const tourSlug = path.split("/").pop();
    if (tourSlug) {
      return getTourCanonical(baseUrl, tourSlug);
    }
  }

  // State detail page with city
  if (path.startsWith("/states/") && path.split("/").length === 4) {
    const parts = path.split("/");
    const stateSlug = parts[2];
    const citySlug = parts[3];
    return getStateCityCanonical(baseUrl, stateSlug, citySlug);
  }

  // State detail page
  if (path.startsWith("/states/")) {
    const stateSlug = path.split("/").pop();
    if (stateSlug) {
      return getStateCanonical(baseUrl, stateSlug);
    }
  }

  // States list page
  if (path === "/states") {
    return getStatesCanonical(baseUrl);
  }

  // Category detail page
  if (path.startsWith("/categories/")) {
    const categorySlug = path.split("/").pop();
    if (categorySlug) {
      return getCategoryCanonical(baseUrl, categorySlug);
    }
  }

  // Categories list page
  if (path === "/categories") {
    return getCategoriesCanonical(baseUrl);
  }

  // Tours list page
  if (path === "/tours") {
    return getToursCanonical(baseUrl);
  }

  // Destinations page
  if (path === "/destinations") {
    return getDestinationsCanonical(baseUrl);
  }

  // Default: use path as-is
  return generateCanonicalUrl({
    baseUrl,
    path,
    ignoreLocale: true,
  });
}

/**
 * Validate canonical URL
 */
export function validateCanonicalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== "https:") {
      console.warn("Canonical URL must use HTTPS protocol");
      return false;
    }

    // Must have valid hostname
    if (!parsed.hostname) {
      console.warn("Canonical URL must have valid hostname");
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Invalid canonical URL format:", url);
    return false;
  }
}

/**
 * Check for duplicate canonical URLs
 */
export function checkDuplicateCanonicals(urls: string[]): boolean {
  const uniqueUrls = new Set(urls);
  return uniqueUrls.size === urls.length;
}

/**
 * Normalize canonical URL (remove trailing slashes, sort params)
 */
export function normalizeCanonicalUrl(url: string): string {
  const parsed = new URL(url);

  // Remove trailing slash from pathname
  if (parsed.pathname.endsWith("/") && parsed.pathname !== "/") {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  // Sort query parameters for consistency
  const params = new URLSearchParams(parsed.search);
  const sortedParams = new URLSearchParams([...params.entries()].sort());
  parsed.search = sortedParams.toString();

  return parsed.toString();
}

/**
 * Get canonical URL for current page
 */
export function getCurrentCanonical(baseUrl: string): string {
  if (typeof window !== "undefined") {
    return getCanonicalFromPathname(baseUrl, window.location.pathname);
  }
  return baseUrl;
}

/**
 * Check if URL is self-referential canonical
 */
export function isSelfReferentialCanonical(pageUrl: string, canonicalUrl: string): boolean {
  const normalizedPage = normalizeCanonicalUrl(pageUrl);
  const normalizedCanonical = normalizeCanonicalUrl(canonicalUrl);
  return normalizedPage === normalizedCanonical;
}

/**
 * Generate canonical URLs for all locale variants
 * Returns object with locale as key and canonical URL as value
 */
export function generateCanonicalsByLocale(
  baseUrl: string,
  path: string,
  locales: string[]
): Record<string, string> {
  const canonicals: Record<string, string> = {};

  locales.forEach((locale) => {
    // All locales point to the same canonical (without locale parameter)
    canonicals[locale] = generateCanonicalUrl({
      baseUrl,
      path,
      ignoreLocale: true,
    });
  });

  return canonicals;
}

/**
 * Generate canonical URL for paginated content
 */
export function getPaginatedCanonical(
  baseUrl: string,
  path: string,
  page: number = 1
): string {
  const queryParams = page > 1 ? { page: page.toString() } : {};

  return generateCanonicalUrl({
    baseUrl,
    path,
    ignoreLocale: true,
    queryParams,
  });
}

/**
 * Generate canonical URL for filtered content
 */
export function getFilteredCanonical(
  baseUrl: string,
  path: string,
  filters: Record<string, string>
): string {
  // Sort filters for consistency
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = filters[key];
        return acc;
      },
      {} as Record<string, string>
    );

  return generateCanonicalUrl({
    baseUrl,
    path,
    ignoreLocale: true,
    queryParams: sortedFilters,
  });
}

/**
 * Generate canonical URL for sorted content
 */
export function getSortedCanonical(
  baseUrl: string,
  path: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): string {
  const queryParams: Record<string, string> = {};

  if (sortBy) {
    queryParams.sort = sortBy;
    if (sortOrder) {
      queryParams.order = sortOrder;
    }
  }

  return generateCanonicalUrl({
    baseUrl,
    path,
    ignoreLocale: true,
    queryParams,
  });
}

/**
 * Get canonical URL for search results
 */
export function getSearchCanonical(baseUrl: string, query: string): string {
  return generateCanonicalUrl({
    baseUrl,
    path: "/search",
    ignoreLocale: true,
    queryParams: { q: query },
  });
}

/**
 * Validate canonical URL follows best practices
 */
export function validateCanonicalBestPractices(url: string): string[] {
  const issues: string[] = [];

  // Check HTTPS
  if (!url.startsWith("https://")) {
    issues.push("Canonical URL must use HTTPS");
  }

  // Check for duplicate parameters
  const parsed = new URL(url);
  const params = parsed.searchParams;
  const paramKeys = Array.from(params.keys());
  if (new Set(paramKeys).size !== paramKeys.length) {
    issues.push("Canonical URL contains duplicate parameters");
  }

  // Check for session IDs or tracking parameters
  const trackingParams = ["utm_", "fbclid", "gclid", "msclkid"];
  trackingParams.forEach((param) => {
    if (url.includes(param)) {
      issues.push(`Canonical URL should not contain tracking parameter: ${param}`);
    }
  });

  // Check for trailing slash consistency
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    issues.push("Canonical URL has inconsistent trailing slash");
  }

  return issues;
}

/**
 * Generate canonical tag HTML
 */
export function canonicalToHtml(href: string): string {
  return `<link rel="canonical" href="${href}" />`;
}

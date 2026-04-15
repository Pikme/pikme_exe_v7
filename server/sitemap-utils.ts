/**
 * Sitemap generation utilities for SEO
 * Generates XML sitemaps for all hierarchical URLs
 */

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface SitemapIndex {
  sitemaps: {
    loc: string;
    lastmod?: string;
  }[];
}

/**
 * Generate XML header for sitemap
 */
export function generateSitemapHeader(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
}

/**
 * Generate XML footer for sitemap
 */
export function generateSitemapFooter(): string {
  return `</urlset>`;
}

/**
 * Generate a single URL entry in sitemap
 */
export function generateSitemapEntry(entry: SitemapEntry): string {
  const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
  const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
  const priority = entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "";

  return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`;
}

/**
 * Generate complete sitemap XML
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const header = generateSitemapHeader();
  const urlEntries = entries.map(generateSitemapEntry).join("\n");
  const footer = generateSitemapFooter();

  return `${header}\n${urlEntries}\n${footer}`;
}

/**
 * Generate sitemap index XML
 */
export function generateSitemapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const entries = sitemaps
    .map((sitemap) => {
      const lastmod = sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : "";
      return `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    ${lastmod}
  </sitemap>`;
    })
    .join("\n");

  const footer = `</sitemapindex>`;

  return `${header}\n${entries}\n${footer}`;
}

/**
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Format date to ISO 8601 format for sitemap
 */
export function formatDateForSitemap(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate sitemap entries for countries
 */
export function generateCountriesSitemapEntries(
  countries: Array<{ id: number; slug: string; updatedAt: Date }>,
  baseUrl: string
): SitemapEntry[] {
  return countries.map((country) => ({
    loc: `${baseUrl}/countries/${country.slug}`,
    lastmod: formatDateForSitemap(country.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));
}

/**
 * Generate sitemap entries for states
 */
export function generateStatesSitemapEntries(
  states: Array<{ id: number; slug: string; updatedAt: Date }>,
  baseUrl: string
): SitemapEntry[] {
  return states.map((state) => ({
    loc: `${baseUrl}/states/${state.slug}`,
    lastmod: formatDateForSitemap(state.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));
}

/**
 * Generate sitemap entries for locations/cities
 */
export function generateLocationsSitemapEntries(
  locations: Array<{ id: number; slug: string; stateId: number; updatedAt: Date }>,
  baseUrl: string
): SitemapEntry[] {
  return locations.map((location) => ({
    loc: `${baseUrl}/locations/${location.slug}`,
    lastmod: formatDateForSitemap(location.updatedAt),
    changefreq: "weekly",
    priority: 0.7,
  }));
}

/**
 * Generate sitemap entries for categories
 */
export function generateCategoriesSitemapEntries(
  categories: Array<{ id: number; slug: string; updatedAt: Date }>,
  baseUrl: string
): SitemapEntry[] {
  return categories.map((category) => ({
    loc: `${baseUrl}/categories/${category.slug}`,
    lastmod: formatDateForSitemap(category.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));
}

/**
 * Generate sitemap entries for tours
 */
export function generateToursSitemapEntries(
  tours: Array<{ id: number; slug: string; updatedAt: Date; isFeatured?: boolean }>,
  baseUrl: string
): SitemapEntry[] {
  return tours.map((tour) => ({
    loc: `${baseUrl}/visit/tour/${tour.slug}`,
    lastmod: formatDateForSitemap(tour.updatedAt),
    changefreq: "weekly",
    priority: tour.isFeatured ? 0.9 : 0.7,
  }));
}

/**
 * Generate sitemap entries for main pages
 */
export function generateMainPagesSitemapEntries(baseUrl: string): SitemapEntry[] {
  return [
    {
      loc: baseUrl,
      changefreq: "daily",
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/tours`,
      changefreq: "daily",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/countries`,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/states`,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/categories`,
      changefreq: "weekly",
      priority: 0.9,
    },
  ];
}

/**
 * Validate sitemap size (Google limit is 50,000 URLs per sitemap)
 */
export function validateSitemapSize(entries: SitemapEntry[]): boolean {
  return entries.length <= 50000;
}

/**
 * Split entries into multiple sitemaps if needed (Google limit: 50,000 URLs per sitemap)
 */
export function splitSitemapEntries(entries: SitemapEntry[], maxSize: number = 50000): SitemapEntry[][] {
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < entries.length; i += maxSize) {
    chunks.push(entries.slice(i, i + maxSize));
  }
  return chunks;
}

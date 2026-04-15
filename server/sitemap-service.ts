/**
 * Sitemap and Robots.txt Generation Service
 * Generates dynamic XML sitemaps and robots.txt for SEO
 */

import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { tours, countries, states, categories, activities } from '../drizzle/schema';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML Sitemap for tours
 */
export async function generateToursSitemap(baseUrl: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('Database not available for tours sitemap');
      return generateSitemapXml([]);
    }
    
    // Get all tours with their slugs and updated dates
    const allTours = await db.select({
      slug: tours.slug,
      updatedAt: tours.updatedAt,
    }).from(tours);

    const entries: SitemapEntry[] = allTours.map((tour) => ({
      url: `${baseUrl}/visit/tour/${tour.slug}`,
      lastmod: tour.updatedAt ? new Date(tour.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));

    console.log(`[Sitemap] Generated ${entries.length} tour URLs for sitemap`);
    return generateSitemapXml(entries);
  } catch (error) {
    console.error('Error generating tours sitemap:', error);
    return generateSitemapXml([]); // Return empty sitemap on error
  }
}

/**
 * Generate XML Sitemap for destinations (countries and states)
 */
export async function generateDestinationsSitemap(baseUrl: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('Database not available for destinations sitemap');
      return generateSitemapXml([]);
    }
    
    // Get all countries
    const allCountries = await db.select({
      slug: countries.slug,
      updatedAt: countries.updatedAt,
    }).from(countries);

    const entries: SitemapEntry[] = allCountries.map((country) => ({
      url: `${baseUrl}/destinations/${country.slug}`,
      lastmod: country.updatedAt ? new Date(country.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

    // Get all states with their country relationships
    const allStates = await db.select({
      slug: states.slug,
      countryId: states.countryId,
      updatedAt: states.updatedAt,
    }).from(states);

    // Get country slugs for state URLs
    const countryMap = new Map(allCountries.map(c => [c.slug, c]));
    
    allStates.forEach((state) => {
      // Find the country for this state
      const countryForState = allCountries.find(c => c.id === state.countryId);
      if (countryForState) {
        entries.push({
          url: `${baseUrl}/destinations/${countryForState.slug}/${state.slug}`,
          lastmod: state.updatedAt ? new Date(state.updatedAt).toISOString().split('T')[0] : undefined,
          changefreq: 'weekly' as const,
          priority: 0.6,
        });
      }
    });

    console.log(`[Sitemap] Generated ${entries.length} destination URLs for sitemap (${allCountries.length} countries + ${allStates.length} states)`);
    return generateSitemapXml(entries);
  } catch (error) {
    console.error('Error generating destinations sitemap:', error);
    return generateSitemapXml([]);
  }
}

/**
 * Generate XML Sitemap for activities
 */
export async function generateActivitiesSitemap(baseUrl: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('Database not available for activities sitemap');
      return generateSitemapXml([]);
    }
    
    const allActivities = await db.select({
      id: activities.id,
      updatedAt: activities.updatedAt,
    }).from(activities);

    const entries: SitemapEntry[] = allActivities.map((activity) => ({
      url: `${baseUrl}/visit/activity/${activity.id}`,
      lastmod: activity.updatedAt ? new Date(activity.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

    console.log(`[Sitemap] Generated ${entries.length} activity URLs for sitemap`);
    return generateSitemapXml(entries);
  } catch (error) {
    console.error('Error generating activities sitemap:', error);
    return generateSitemapXml([]);
  }
}

/**
 * Generate XML Sitemap for categories
 */
export async function generateCategoriesSitemap(baseUrl: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('Database not available for categories sitemap');
      return generateSitemapXml([]);
    }
    
    const allCategories = await db.select({
      slug: categories.slug,
      updatedAt: categories.updatedAt,
    }).from(categories);

    const entries: SitemapEntry[] = allCategories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastmod: category.updatedAt ? new Date(category.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

    console.log(`[Sitemap] Generated ${entries.length} category URLs for sitemap`);
    return generateSitemapXml(entries);
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    return generateSitemapXml([]);
  }
}

/**
 * Generate Sitemap Index
 */
export async function generateSitemapIndex(
  baseUrl: string,
  sitemapUrls: string[]
): Promise<string> {
  const entries = sitemapUrls.map((url) => ({
    loc: url,
    lastmod: new Date().toISOString().split('T')[0],
  }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt(baseUrl: string): string {
  return `# Pikme Travel Robots.txt
# Generated automatically for SEO optimization

# Allow all bots
User-agent: *
Allow: /

# Specific rules for search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Disallow admin and internal pages
Disallow: /admin/
Disallow: /api/
Disallow: /internal/
Disallow: /_next/
Disallow: /.next/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-tours.xml
Sitemap: ${baseUrl}/sitemap-destinations.xml
Sitemap: ${baseUrl}/sitemap-categories.xml

# Crawl delay for all bots
Crawl-delay: 1
Request-rate: 30/60

# Allow specific paths
Allow: /visit/
Allow: /destinations/
Allow: /categories/
Allow: /tours/
`;
}

/**
 * Generate XML Sitemap from entries
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
  if (entries.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : ''}
${entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : ''}
${entry.priority !== undefined ? `    <priority>${entry.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate all sitemaps
 */
export async function generateAllSitemaps(baseUrl: string) {
  const sitemaps = {
    tours: await generateToursSitemap(baseUrl),
    destinations: await generateDestinationsSitemap(baseUrl),
    categories: await generateCategoriesSitemap(baseUrl),
  };

  const index = await generateSitemapIndex(baseUrl, [
    `${baseUrl}/sitemap-tours.xml`,
    `${baseUrl}/sitemap-destinations.xml`,
    `${baseUrl}/sitemap-categories.xml`,
  ]);

  return {
    ...sitemaps,
    index,
  };
}

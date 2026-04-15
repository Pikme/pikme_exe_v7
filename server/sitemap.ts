import { db } from "./db";
import { tours, activities, states, countries, categories } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate XML for a single sitemap entry
 */
function generateSitemapEntry(entry: SitemapEntry): string {
  let xml = "  <url>\n";
  xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
  if (entry.lastmod) {
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  }
  if (entry.changefreq) {
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  }
  if (entry.priority !== undefined) {
    xml += `    <priority>${entry.priority}</priority>\n`;
  }
  xml += "  </url>\n";
  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Format date to ISO 8601 format (YYYY-MM-DD)
 */
function formatDate(date: Date | null | undefined): string {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Generate complete sitemap XML
 */
export async function generateSitemap(baseUrl: string): Promise<string> {
  const entries: SitemapEntry[] = [];

  // Add homepage
  entries.push({
    loc: baseUrl,
    changefreq: "weekly",
    priority: 1.0,
  });

  // Add main pages
  entries.push({
    loc: `${baseUrl}/tours`,
    changefreq: "weekly",
    priority: 0.9,
  });

  entries.push({
    loc: `${baseUrl}/destinations`,
    changefreq: "weekly",
    priority: 0.9,
  });

  entries.push({
    loc: `${baseUrl}/activities`,
    changefreq: "weekly",
    priority: 0.8,
  });

  entries.push({
    loc: `${baseUrl}/categories`,
    changefreq: "monthly",
    priority: 0.7,
  });

  // Fetch all tours
  try {
    const allTours = await db.select().from(tours);
    for (const tour of allTours) {
      entries.push({
        loc: `${baseUrl}/visit/tour/${tour.slug}`,
        lastmod: formatDate(tour.updatedAt),
        changefreq: "monthly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("Error fetching tours for sitemap:", error);
  }

  // Fetch all activities
  try {
    const allActivities = await db.select().from(activities);
    for (const activity of allActivities) {
      entries.push({
        loc: `${baseUrl}/visit/activity/${activity.id}`,
        lastmod: formatDate(activity.updatedAt),
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Error fetching activities for sitemap:", error);
  }

  // Fetch all states (destinations)
  try {
    const allStates = await db.select().from(states);
    for (const state of allStates) {
      entries.push({
        loc: `${baseUrl}/visit/state/${state.id}`,
        lastmod: formatDate(state.updatedAt),
        changefreq: "monthly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("Error fetching states for sitemap:", error);
  }

  // Fetch all countries
  try {
    const allCountries = await db.select().from(countries);
    for (const country of allCountries) {
      entries.push({
        loc: `${baseUrl}/visit/country/${country.id}`,
        lastmod: formatDate(country.updatedAt),
        changefreq: "monthly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("Error fetching countries for sitemap:", error);
  }

  // Fetch all categories
  try {
    const allCategories = await db.select().from(categories);
    for (const category of allCategories) {
      entries.push({
        loc: `${baseUrl}/visit/category/${category.id}`,
        lastmod: formatDate(category.updatedAt),
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of entries) {
    xml += generateSitemapEntry(entry);
  }

  xml += "</urlset>";

  return xml;
}

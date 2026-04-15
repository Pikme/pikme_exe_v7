import { getDb } from "./db";
import { countries, states, tours, activities, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const SITEMAP_DIR = path.join(process.cwd(), "client", "public");
const BASE_URL = "https://pikmepseo-bsflart4.manus.space";

/**
 * Generate XML sitemap from array of entries
 */
function generateSitemapXML(entries: SitemapEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of entries) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += "  </url>\n";
  }

  xml += "</urlset>\n";
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
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate destinations sitemap (countries + states)
 */
export async function generateDestinationsSitemap(): Promise<void> {
  console.log("[Sitemap] Generating destinations sitemap...");

  const entries: SitemapEntry[] = [];
  const db = await getDb();

  // Add countries
  const allCountries = await db.select().from(countries);
  console.log(`[Sitemap] Found ${allCountries.length} countries`);

  for (const country of allCountries) {
    entries.push({
      loc: `${BASE_URL}/destinations/${country.slug}`,
      lastmod: formatDate(new Date(country.updatedAt || country.createdAt)),
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  // Add states
  const allStates = await db.select().from(states);
  console.log(`[Sitemap] Found ${allStates.length} states`);

  for (const state of allStates) {
    const country = allCountries.find((c) => c.id === state.countryId);
    if (country) {
      entries.push({
        loc: `${BASE_URL}/destinations/${country.slug}/${state.slug}`,
        lastmod: formatDate(new Date(state.updatedAt || state.createdAt)),
        changefreq: "weekly",
        priority: 0.6,
      });
    }
  }

  const xml = generateSitemapXML(entries);
  const filePath = path.join(SITEMAP_DIR, "sitemap-destinations.xml");
  fs.writeFileSync(filePath, xml);
  console.log(`[Sitemap] Generated destinations sitemap: ${filePath}`);
}

/**
 * Generate tours sitemap
 */
export async function generateToursSitemap(): Promise<void> {
  console.log("[Sitemap] Generating tours sitemap...");

  const entries: SitemapEntry[] = [];
  const db = await getDb();

  // Add tours page
  entries.push({
    loc: `${BASE_URL}/tours`,
    lastmod: formatDate(new Date()),
    changefreq: "daily",
    priority: 0.8,
  });

  // Add individual tours
  const allTours = await db.select().from(tours);
  console.log(`[Sitemap] Found ${allTours.length} tours`);

  for (const tour of allTours) {
    entries.push({
      loc: `${BASE_URL}/tours/${tour.slug}`,
      lastmod: formatDate(new Date(tour.updatedAt || tour.createdAt)),
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  const xml = generateSitemapXML(entries);
  const filePath = path.join(SITEMAP_DIR, "sitemap-tours.xml");
  fs.writeFileSync(filePath, xml);
  console.log(`[Sitemap] Generated tours sitemap: ${filePath}`);
}

/**
 * Generate activities sitemap
 */
export async function generateActivitiesSitemap(): Promise<void> {
  console.log("[Sitemap] Generating activities sitemap...");

  const entries: SitemapEntry[] = [];
  const db = await getDb();

  // Add activities page
  entries.push({
    loc: `${BASE_URL}/activities`,
    lastmod: formatDate(new Date()),
    changefreq: "weekly",
    priority: 0.7,
  });

  // Add individual activities (limit to avoid huge sitemaps)
  const allActivities = await db.select().from(activities).limit(50000);
  console.log(`[Sitemap] Found ${allActivities.length} activities (limited to 50000)`);

  for (const activity of allActivities) {
    entries.push({
      loc: `${BASE_URL}/visit/activity/${activity.id}`,
      lastmod: formatDate(new Date(activity.updatedAt || activity.createdAt)),
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  const xml = generateSitemapXML(entries);
  const filePath = path.join(SITEMAP_DIR, "sitemap-activities.xml");
  fs.writeFileSync(filePath, xml);
  console.log(`[Sitemap] Generated activities sitemap: ${filePath}`);
}

/**
 * Generate categories sitemap
 */
export async function generateCategoriesSitemap(): Promise<void> {
  console.log("[Sitemap] Generating categories sitemap...");

  const entries: SitemapEntry[] = [];
  const db = await getDb();

  // Add categories page
  entries.push({
    loc: `${BASE_URL}/categories`,
    lastmod: formatDate(new Date()),
    changefreq: "weekly",
    priority: 0.7,
  });

  // Add individual categories
  const allCategories = await db.select().from(categories);
  console.log(`[Sitemap] Found ${allCategories.length} categories`);

  for (const category of allCategories) {
    entries.push({
      loc: `${BASE_URL}/categories/${category.slug}`,
      lastmod: formatDate(new Date(category.updatedAt || category.createdAt)),
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  const xml = generateSitemapXML(entries);
  const filePath = path.join(SITEMAP_DIR, "sitemap-categories.xml");
  fs.writeFileSync(filePath, xml);
  console.log(`[Sitemap] Generated categories sitemap: ${filePath}`);
}

/**
 * Generate sitemap index
 */
export async function generateSitemapIndex(): Promise<void> {
  console.log("[Sitemap] Generating sitemap index...");

  const today = formatDate(new Date());

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const sitemaps = [
    "sitemap-destinations.xml",
    "sitemap-tours.xml",
    "sitemap-activities.xml",
    "sitemap-categories.xml",
  ];

  for (const sitemap of sitemaps) {
    xml += "  <sitemap>\n";
    xml += `    <loc>${BASE_URL}/${sitemap}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += "  </sitemap>\n";
  }

  xml += "</sitemapindex>\n";

  const filePath = path.join(SITEMAP_DIR, "sitemap.xml");
  fs.writeFileSync(filePath, xml);
  console.log(`[Sitemap] Generated sitemap index: ${filePath}`);
}

/**
 * Generate all sitemaps
 */
export async function generateAllSitemaps(): Promise<void> {
  try {
    console.log("[Sitemap] Starting sitemap generation...");
    const startTime = Date.now();

    await generateDestinationsSitemap();
    await generateToursSitemap();
    await generateActivitiesSitemap();
    await generateCategoriesSitemap();
    await generateSitemapIndex();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Sitemap] ✅ All sitemaps generated successfully in ${duration}s`);
  } catch (error) {
    console.error("[Sitemap] ❌ Error generating sitemaps:", error);
    throw error;
  }
}

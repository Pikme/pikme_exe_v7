/**
 * Sitemap Router - Handles XML sitemap generation for SEO
 */

import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { eq } from "drizzle-orm";
import {
  generateSitemap,
  generateSitemapIndex,
  generateMainPagesSitemapEntries,
  generateCountriesSitemapEntries,
  generateStatesSitemapEntries,
  generateLocationsSitemapEntries,
  generateCategoriesSitemapEntries,
  generateToursSitemapEntries,
  formatDateForSitemap,
} from "./sitemap-utils";

const BASE_URL = process.env.VITE_FRONTEND_FORGE_API_URL?.replace('/api', '') || "https://pikme.com";

export const sitemapRouter = router({
  /**
   * Main sitemap index
   * Lists all available sitemaps
   */
  index: publicProcedure.query(async () => {
    const now = new Date();
    const lastmod = formatDateForSitemap(now);

    const sitemaps = [
      { loc: `${BASE_URL}/sitemap-main.xml`, lastmod },
      { loc: `${BASE_URL}/sitemap-countries.xml`, lastmod },
      { loc: `${BASE_URL}/sitemap-states.xml`, lastmod },
      { loc: `${BASE_URL}/sitemap-locations.xml`, lastmod },
      { loc: `${BASE_URL}/sitemap-categories.xml`, lastmod },
      { loc: `${BASE_URL}/sitemap-tours.xml`, lastmod },
    ];

    return generateSitemapIndex(sitemaps);
  }),

  /**
   * Main pages sitemap
   */
  main: publicProcedure.query(async () => {
    const entries = generateMainPagesSitemapEntries(BASE_URL);
    return generateSitemap(entries);
  }),

  /**
   * Countries sitemap
   */
  countries: publicProcedure.query(async () => {
    const countries = await db.getAllCountriesForExport();
    const entries = generateCountriesSitemapEntries(countries, BASE_URL);
    return generateSitemap(entries);
  }),

  /**
   * States sitemap
   */
  states: publicProcedure.query(async () => {
    const states = await db.getAllStatesForExport();
    const entries = generateStatesSitemapEntries(states, BASE_URL);
    return generateSitemap(entries);
  }),

  /**
   * Locations/Cities sitemap
   */
  locations: publicProcedure.query(async () => {
    const locations = await db.getAllLocationsForExport();
    const entries = generateLocationsSitemapEntries(locations, BASE_URL);
    return generateSitemap(entries);
  }),

  /**
   * Categories sitemap
   */
  categories: publicProcedure.query(async () => {
    const categories = await db.getAllCategoriesForExport();
    const entries = generateCategoriesSitemapEntries(categories, BASE_URL);
    return generateSitemap(entries);
  }),

  /**
   * Tours sitemap
   */
  tours: publicProcedure.query(async () => {
    const tours = await db.getAllToursForExport();
    if (!tours) return generateSitemap([]);
    const toursWithMetadata = tours.map((tour: any) => ({
      id: tour.id,
      slug: tour.slug,
      updatedAt: tour.updatedAt || new Date(),
      isFeatured: tour.isFeatured,
    }));
    const entries = generateToursSitemapEntries(toursWithMetadata, BASE_URL);
    return generateSitemap(entries);
  })
});

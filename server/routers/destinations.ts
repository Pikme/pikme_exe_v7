import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { countries } from '../../drizzle/schema';
import {
  getCountryBySlug,
  getCountryDetails,
  getStateDetails,
  getFeaturedToursByCountry,
  getFeaturedToursByState,
  getFeaturedToursByLocation,
  getDestinationHierarchy,
} from '../db-destinations';

export const destinationsRouter = router({
  /**
   * Get all countries
   */
  getCountries: publicProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(countries);
  }),

  /**
   * Get country by slug
   */
  getCountryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getCountryBySlug(input.slug);
    }),

  /**
   * Get country details with states and cities
   */
  getCountryDetails: publicProcedure
    .input(z.object({ countryId: z.number() }))
    .query(async ({ input }) => {
      return await getCountryDetails(input.countryId);
    }),

  /**
   * Get country details with states and cities (legacy name)
   */
  getCountry: publicProcedure
    .input(z.object({ countryId: z.number() }))
    .query(async ({ input }) => {
      return await getCountryDetails(input.countryId);
    }),

  /**
   * Get state details with cities
   */
  getState: publicProcedure
    .input(z.object({ stateId: z.number() }))
    .query(async ({ input }) => {
      return await getStateDetails(input.stateId);
    }),

  /**
   * Get featured tours for a country
   */
  getFeaturedToursByCountry: publicProcedure
    .input(z.object({ countryId: z.number(), limit: z.number().default(6) }))
    .query(async ({ input }) => {
      return await getFeaturedToursByCountry(input.countryId, input.limit);
    }),

  /**
   * Get featured tours for a state
   */
  getFeaturedToursByState: publicProcedure
    .input(z.object({ stateId: z.number(), limit: z.number().default(6) }))
    .query(async ({ input }) => {
      return await getFeaturedToursByState(input.stateId, input.limit);
    }),

  /**
   * Get featured tours for a location/city
   */
  getFeaturedToursByLocation: publicProcedure
    .input(z.object({ locationId: z.number(), limit: z.number().default(6) }))
    .query(async ({ input }) => {
      return await getFeaturedToursByLocation(input.locationId, input.limit);
    }),

  /**
   * Get complete destination hierarchy for sitemap and navigation
   */
  getHierarchy: publicProcedure.query(async () => {
    return await getDestinationHierarchy();
  }),
});

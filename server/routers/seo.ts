import { router, publicProcedure } from '../_core/trpc';
import {
  generateToursSitemap,
  generateDestinationsSitemap,
  generateCategoriesSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
} from '../sitemap-service';

const baseUrl = process.env.VITE_APP_URL || 'https://www.pikmeusa.com';

export const seoRouter = router({
  /**
   * Get tours sitemap
   */
  getToursSitemap: publicProcedure.query(async () => {
    try {
      const sitemap = await generateToursSitemap(baseUrl);
      return {
        success: true,
        content: sitemap,
        contentType: 'application/xml',
      };
    } catch (error) {
      console.error('Error generating tours sitemap:', error);
      return {
        success: false,
        error: 'Failed to generate tours sitemap',
      };
    }
  }),

  /**
   * Get destinations sitemap
   */
  getDestinationsSitemap: publicProcedure.query(async () => {
    try {
      const sitemap = await generateDestinationsSitemap(baseUrl);
      return {
        success: true,
        content: sitemap,
        contentType: 'application/xml',
      };
    } catch (error) {
      console.error('Error generating destinations sitemap:', error);
      return {
        success: false,
        error: 'Failed to generate destinations sitemap',
      };
    }
  }),

  /**
   * Get categories sitemap
   */
  getCategoriesSitemap: publicProcedure.query(async () => {
    try {
      const sitemap = await generateCategoriesSitemap(baseUrl);
      return {
        success: true,
        content: sitemap,
        contentType: 'application/xml',
      };
    } catch (error) {
      console.error('Error generating categories sitemap:', error);
      return {
        success: false,
        error: 'Failed to generate categories sitemap',
      };
    }
  }),

  /**
   * Get sitemap index
   */
  getSitemapIndex: publicProcedure.query(async () => {
    try {
      const sitemapUrls = [
        `${baseUrl}/sitemap-tours.xml`,
        `${baseUrl}/sitemap-destinations.xml`,
        `${baseUrl}/sitemap-categories.xml`,
      ];
      const index = await generateSitemapIndex(baseUrl, sitemapUrls);
      return {
        success: true,
        content: index,
        contentType: 'application/xml',
      };
    } catch (error) {
      console.error('Error generating sitemap index:', error);
      return {
        success: false,
        error: 'Failed to generate sitemap index',
      };
    }
  }),

  /**
   * Get robots.txt
   */
  getRobotsTxt: publicProcedure.query(async () => {
    try {
      const robots = generateRobotsTxt(baseUrl);
      return {
        success: true,
        content: robots,
        contentType: 'text/plain',
      };
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      return {
        success: false,
        error: 'Failed to generate robots.txt',
      };
    }
  }),
});

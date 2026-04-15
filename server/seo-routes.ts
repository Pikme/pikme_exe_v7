/**
 * SEO Routes for Express
 * Handles serving sitemaps and robots.txt files
 */

import { Express } from 'express';
import {
  generateToursSitemap,
  generateDestinationsSitemap,
  generateActivitiesSitemap,
  generateCategoriesSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
} from './sitemap-service';

export function setupSEORoutes(app: Express) {
  console.log('[SEO Routes] Initializing SEO routes setup');
  
  // Get base URL from environment or construct from request
  const getBaseUrl = (req: any) => {
    if (process.env.VITE_APP_URL) {
      return process.env.VITE_APP_URL;
    }
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
  };

  /**
   * Serve sitemap-tours.xml
   */
  app.get('/sitemap-tours.xml', async (req, res) => {
    console.log('[SEO] Handling /sitemap-tours.xml request');
    try {
      const baseUrl = getBaseUrl(req);
      const sitemap = await generateToursSitemap(baseUrl);
      res.type('application/xml').send(sitemap);
    } catch (error) {
      console.error('Error serving tours sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  /**
   * Serve sitemap-destinations.xml
   */
  app.get('/sitemap-destinations.xml', async (req, res) => {
    console.log('[SEO] Handling /sitemap-destinations.xml request');
    try {
      const baseUrl = getBaseUrl(req);
      const sitemap = await generateDestinationsSitemap(baseUrl);
      res.type('application/xml').send(sitemap);
    } catch (error) {
      console.error('Error serving destinations sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  /**
   * Serve sitemap-activities.xml
   */
  app.get('/sitemap-activities.xml', async (req, res) => {
    console.log('[SEO] Handling /sitemap-activities.xml request');
    try {
      const baseUrl = getBaseUrl(req);
      const sitemap = await generateActivitiesSitemap(baseUrl);
      res.type('application/xml').send(sitemap);
    } catch (error) {
      console.error('Error serving activities sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  /**
   * Serve sitemap-categories.xml
   */
  app.get('/sitemap-categories.xml', async (req, res) => {
    console.log('[SEO] Handling /sitemap-categories.xml request');
    try {
      const baseUrl = getBaseUrl(req);
      const sitemap = await generateCategoriesSitemap(baseUrl);
      res.type('application/xml').send(sitemap);
    } catch (error) {
      console.error('Error serving categories sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  /**
   * Serve sitemap-index.xml
   */
  app.get('/sitemap-index.xml', async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const sitemapUrls = [
        `${baseUrl}/sitemap-tours.xml`,
        `${baseUrl}/sitemap-destinations.xml`,
        `${baseUrl}/sitemap-activities.xml`,
        `${baseUrl}/sitemap-categories.xml`,
      ];
      const index = await generateSitemapIndex(baseUrl, sitemapUrls);
      res.type('application/xml').send(index);
    } catch (error) {
      console.error('Error serving sitemap index:', error);
      res.status(500).send('Error generating sitemap index');
    }
  });

  /**
   * Serve sitemap.xml (alias for sitemap-index.xml)
   */
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const sitemapUrls = [
        `${baseUrl}/sitemap-tours.xml`,
        `${baseUrl}/sitemap-destinations.xml`,
        `${baseUrl}/sitemap-activities.xml`,
        `${baseUrl}/sitemap-categories.xml`,
      ];
      const index = await generateSitemapIndex(baseUrl, sitemapUrls);
      res.type('application/xml').send(index);
    } catch (error) {
      console.error('Error serving sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  /**
   * Serve robots.txt
   */
  app.get('/robots.txt', (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const robots = generateRobotsTxt(baseUrl);
      res.type('text/plain').send(robots);
    } catch (error) {
      console.error('Error serving robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  });

  console.log('[SEO] Routes registered: /sitemap-*.xml, /robots.txt, /sitemap.xml');
}

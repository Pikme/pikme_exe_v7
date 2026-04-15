import { Router } from "express";
import * as seo from "../seo";

const router = Router();

/**
 * GET /api/sitemap.xml
 * Generate and return the XML sitemap for search engines
 */
// Temporary sitemap endpoint - will be regenerated after migration
router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    // const sitemap = await seo.generateSitemapXml(baseUrl);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    
    res.type("application/xml");
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

/**
 * GET /api/robots.txt
 * Generate and return the robots.txt file
 */
router.get("/robots.txt", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml

# Disallow crawling of admin pages
Disallow: /admin/

# Disallow crawling of API routes
Disallow: /api/

# Allow search engines to crawl public content
Allow: /visit/
Allow: /tours
Allow: /countries
`;

  res.type("text/plain");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(robotsTxt);
});

export default router;

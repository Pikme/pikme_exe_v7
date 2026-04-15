import { db } from './server/db.js';
import { tours, states, activities, categories } from './drizzle/schema.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://pikmepseo-bsflart4.manus.space';

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function createSitemapXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority) {
      xml += `    <priority>${url.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}

async function generateSitemaps() {
  try {
    console.log('Generating sitemaps...');
    
    // Get all tours
    const tourList = await db.select().from(tours);
    const tourUrls = tourList.map(tour => ({
      loc: `${BASE_URL}/tours/${tour.slug}`,
      lastmod: tour.updatedAt ? new Date(tour.updatedAt).toISOString().split('T')[0] : '2026-01-26',
      changefreq: 'weekly',
      priority: '0.7'
    }));
    
    // Get all states and destinations
    const stateList = await db.select().from(states);
    const destinationUrls = stateList.map(state => ({
      loc: `${BASE_URL}/destinations/${state.countrySlug}/${state.slug}`,
      lastmod: state.updatedAt ? new Date(state.updatedAt).toISOString().split('T')[0] : '2026-01-19',
      changefreq: 'weekly',
      priority: '0.6'
    }));
    
    // Get all activities
    const activityList = await db.select().from(activities);
    const activityUrls = activityList.map(activity => ({
      loc: `${BASE_URL}/visit/activity/${activity.id}`,
      lastmod: activity.updatedAt ? new Date(activity.updatedAt).toISOString().split('T')[0] : '2026-02-15',
      changefreq: 'weekly',
      priority: '0.7'
    }));
    
    // Get all categories
    const categoryList = await db.select().from(categories);
    const categoryUrls = categoryList.map(category => ({
      loc: `${BASE_URL}/categories/${category.slug}`,
      lastmod: category.updatedAt ? new Date(category.updatedAt).toISOString().split('T')[0] : '2026-01-26',
      changefreq: 'weekly',
      priority: '0.7'
    }));
    
    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'client', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write sitemap files
    fs.writeFileSync(path.join(publicDir, 'sitemap-tours.xml'), createSitemapXml(tourUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-destinations.xml'), createSitemapXml(destinationUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-activities.xml'), createSitemapXml(activityUrls));
    fs.writeFileSync(path.join(publicDir, 'sitemap-categories.xml'), createSitemapXml(categoryUrls));
    
    // Create sitemap index
    let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-tours.xml</loc>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-destinations.xml</loc>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-activities.xml</loc>\n  </sitemap>\n`;
    indexXml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-categories.xml</loc>\n  </sitemap>\n`;
    indexXml += '</sitemapindex>';
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml);
    
    console.log('✅ Sitemaps generated successfully!');
    console.log(`  - Tours: ${tourUrls.length} URLs`);
    console.log(`  - Destinations: ${destinationUrls.length} URLs`);
    console.log(`  - Activities: ${activityUrls.length} URLs`);
    console.log(`  - Categories: ${categoryUrls.length} URLs`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

generateSitemaps();

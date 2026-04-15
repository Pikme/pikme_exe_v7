import { Router, Request, Response } from 'express';
import { getStateBySlug, getStateBySlugAnyCountry, listToursByState } from './db';

const router = Router();

/**
 * Server-side rendered state detail page
 * GET /states/:slug
 */
router.get('/states/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    console.log('[SSR] State route matched for slug:', slug);
    
    // Fetch state data from database - search across all countries
    const state = await getStateBySlugAnyCountry(slug);
    
    if (!state) {
      console.log('[SSR] State not found for slug:', slug);
      return res.status(404).send('State not found');
    }
    console.log('[SSR] Rendering state:', state.name);

    // Fetch tours for this state
    const tours = await listToursByState(state.id);

    // Build meta tags using dedicated SEO fields
    const metaTitle = state.metaTitle || state.name;
    const metaDescription = state.metaDescription || `Explore attractions and tours in ${state.name}`;
    const metaKeywords = state.metaKeywords || `${state.name} tours, ${state.name} travel`;
    const ogImage = state.image || 'https://www.pikmeusa.com/og-image.png';
    const canonicalUrl = `https://www.pikmeusa.com/states/${state.slug}`;

    // Build structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: state.name,
      description: metaDescription,
      image: ogImage,
      url: canonicalUrl,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: state.name,
      },
    };

    // Build breadcrumb schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.pikmeusa.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'States',
          item: 'https://www.pikmeusa.com/states',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: state.name,
          item: canonicalUrl,
        },
      ],
    };

    // Build HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(metaTitle)}</title>
        <meta name="description" content="${escapeHtml(metaDescription)}">
        <meta name="keywords" content="${escapeHtml(metaKeywords)}">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="${canonicalUrl}">
        
        <!-- Open Graph Tags -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="${escapeHtml(metaTitle)}">
        <meta property="og:description" content="${escapeHtml(metaDescription)}">
        <meta property="og:image" content="${ogImage}">
        <meta property="og:url" content="${canonicalUrl}">
        <meta property="og:site_name" content="Pikme">
        
        <!-- Twitter Card Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${escapeHtml(metaTitle)}">
        <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
        <meta name="twitter:image" content="${ogImage}">
        
        <!-- Structured Data -->
        <script type="application/ld+json">
          ${JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          ${JSON.stringify(breadcrumbSchema)}
        </script>
        
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
          header { background: #f8f9fa; border-bottom: 1px solid #e9ecef; padding: 1rem 0; }
          nav { display: flex; gap: 2rem; }
          nav a { text-decoration: none; color: #495057; font-weight: 500; }
          nav a:hover { color: #2563eb; }
          .hero { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 4rem 0; text-align: center; }
          .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
          .hero p { font-size: 1.25rem; opacity: 0.9; }
          .breadcrumb { background: white; border-bottom: 1px solid #e9ecef; padding: 1rem 0; }
          .breadcrumb a { color: #2563eb; text-decoration: none; margin: 0 0.5rem; }
          .content { padding: 2rem 0; }
          .description { background: white; border-bottom: 1px solid #e9ecef; padding: 2rem 0; margin-bottom: 2rem; }
          .tours-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
          .tour-card { border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: box-shadow 0.3s; }
          .tour-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          .tour-image { width: 100%; height: 200px; object-fit: cover; }
          .tour-content { padding: 1rem; }
          .tour-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
          .tour-desc { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
          .tour-price { font-size: 1.5rem; font-weight: bold; color: #2563eb; }
          .no-tours { text-align: center; padding: 2rem; color: #999; }
          footer { background: #f8f9fa; border-top: 1px solid #e9ecef; padding: 2rem 0; margin-top: 2rem; }
          footer p { color: #666; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <nav>
              <a href="/">Pikme</a>
              <a href="/tours">Tours</a>
              <a href="/states">States</a>
              <a href="/activities">Activities</a>
            </nav>
          </div>
        </header>

        <div class="hero">
          <div class="container">
            <h1>${escapeHtml(state.name)}</h1>
            <p>Explore amazing tours and experiences</p>
          </div>
        </div>

        <div class="breadcrumb">
          <div class="container">
            <a href="/">Home</a> / <a href="/states">States</a> / <span>${escapeHtml(state.name)}</span>
          </div>
        </div>

        <div class="container">
          <div class="content">
            ${state.description ? `
              <div class="description">
                <p>${escapeHtml(state.description)}</p>
              </div>
            ` : ''}

            <h2 style="margin-bottom: 1.5rem;">Tours in ${escapeHtml(state.name)}</h2>
            
            ${tours && tours.length > 0 ? `
              <div class="tours-grid">
                ${tours.map((tour: any) => `
                  <div class="tour-card">
                    ${tour.image ? `<img src="${escapeHtml(tour.image)}" alt="${escapeHtml(tour.name)}" class="tour-image">` : ''}
                    <div class="tour-content">
                      <div class="tour-title">${escapeHtml(tour.name)}</div>
                      <div class="tour-desc">${escapeHtml(tour.description?.substring(0, 100) || '')}</div>
                      <div class="tour-price">₹${tour.price}</div>
                      <a href="/tour/${tour.slug}" style="color: #2563eb; text-decoration: none; font-weight: 500;">View Details →</a>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="no-tours">
                <p>No tours found in this state.</p>
              </div>
            `}
          </div>
        </div>

        <footer>
          <div class="container">
            <p>&copy; 2024 Pikme. All rights reserved.</p>
          </div>
        </footer>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('[SSR] Error rendering state detail page:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Log when this router is used
console.log('[SSR] State routes router initialized');

export default router;

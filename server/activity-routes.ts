import { Router, Request, Response } from 'express';
import { getActivityById } from './db';

const router = Router();

/**
 * Escape HTML special characters to prevent XSS
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

/**
 * Server-side rendered activity detail page
 * GET /activity/:id
 */
router.get('/activity/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[SSR] Activity route matched for ID:', id);
    
    // Fetch activity data from database
    const activity = await getActivityById(parseInt(id));
    
    if (!activity) {
      console.log('[SSR] Activity not found for ID:', id);
      return res.status(404).send('Activity not found');
    }
    console.log('[SSR] Rendering activity:', activity.name);

    // Build meta tags using dedicated SEO fields
    const metaTitle = activity.metaTitle || `${activity.name} | Pikme`;
    const metaDescription = activity.metaDescription || activity.description || `Explore ${activity.name} with Pikme. Premium travel experiences with expert guides and comfortable accommodations.`;
    const metaKeywords = activity.metaKeywords || activity.name;
    const ogImage = activity.image || 'https://www.pikmeusa.com/og-image.png';
    const canonicalUrl = `https://www.pikmeusa.com/activity/${activity.id}`;

    // Build structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: activity.name,
      description: metaDescription,
      image: ogImage,
      url: canonicalUrl,
      location: {
        '@type': 'Place',
        name: activity.location?.name || 'India',
      },
      offers: {
        '@type': 'Offer',
        price: activity.price?.toString() || '0',
        priceCurrency: 'INR',
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
          name: 'Activities',
          item: 'https://www.pikmeusa.com/activities',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: activity.name,
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
          .details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
          .detail-card { border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; }
          .detail-label { color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; }
          .detail-value { font-size: 1.25rem; font-weight: bold; color: #2563eb; }
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
              <a href="/activities">Activities</a>
              <a href="/destinations">Destinations</a>
            </nav>
          </div>
        </header>

        <div class="hero">
          <div class="container">
            <h1>${escapeHtml(activity.name)}</h1>
            <p>${escapeHtml(activity.location?.name || 'India')}</p>
          </div>
        </div>

        <div class="breadcrumb">
          <div class="container">
            <a href="/">Home</a> / <a href="/activities">Activities</a> / <span>${escapeHtml(activity.name)}</span>
          </div>
        </div>

        <div class="container">
          <div class="content">
            ${activity.description ? `
              <div class="description">
                <h2>About This Activity</h2>
                <p>${escapeHtml(activity.description)}</p>
              </div>
            ` : ''}
            
            <div class="details">
              ${activity.tourDuration ? `
                <div class="detail-card">
                  <div class="detail-label">Tour Duration</div>
                  <div class="detail-value">${escapeHtml(activity.tourDuration)}</div>
                </div>
              ` : ''}
              
              ${activity.price ? `
                <div class="detail-card">
                  <div class="detail-label">Price per Person</div>
                  <div class="detail-value">INR${typeof activity.price === 'number' ? activity.price.toFixed(2) : activity.price}</div>
                </div>
              ` : ''}
              
              ${activity.difficulty ? `
                <div class="detail-card">
                  <div class="detail-label">Difficulty</div>
                  <div class="detail-value">${escapeHtml(activity.difficulty)}</div>
                </div>
              ` : ''}
              
              ${activity.bestTime ? `
                <div class="detail-card">
                  <div class="detail-label">Best Time to Visit</div>
                  <div class="detail-value">${escapeHtml(activity.bestTime)}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <footer>
          <div class="container">
            <p>&copy; 2024 Pikme. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms & Conditions</a></p>
          </div>
        </footer>
        
        <script>
          // Redirect to React app after 2 seconds
          setTimeout(() => {
            window.location.href = window.location.href;
          }, 2000);
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('[SSR] Error rendering activity:', error);
    res.status(500).send('Error rendering activity page');
  }
});

export default router;

/**
 * Meta Tag Utility Functions
 * Provides helper functions for dynamically updating meta tags in the HTML <head>
 */

export interface MetaTagData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

/**
 * Update meta tags in the HTML <head>
 * @param data - Object containing meta tag data
 */
export function updateMetaTags(data: MetaTagData): void {
  // Update page title
  if (data.title) {
    document.title = data.title;
  }

  // Update or create meta description
  if (data.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', data.description);
  }

  // Update or create meta keywords
  if (data.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', data.keywords);
  }

  // Update or create Open Graph tags
  if (data.ogTitle) {
    updateOrCreateMetaTag('property', 'og:title', data.ogTitle);
  }

  if (data.ogDescription) {
    updateOrCreateMetaTag('property', 'og:description', data.ogDescription);
  }

  if (data.ogImage) {
    updateOrCreateMetaTag('property', 'og:image', data.ogImage);
  }

  if (data.ogUrl) {
    updateOrCreateMetaTag('property', 'og:url', data.ogUrl);
  }

  // Update or create Twitter Card tags
  if (data.twitterTitle) {
    updateOrCreateMetaTag('name', 'twitter:title', data.twitterTitle);
  }

  if (data.twitterDescription) {
    updateOrCreateMetaTag('name', 'twitter:description', data.twitterDescription);
  }

  if (data.twitterImage) {
    updateOrCreateMetaTag('name', 'twitter:image', data.twitterImage);
  }

  // Update or create canonical URL
  if (data.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', data.canonicalUrl);
  }
}

/**
 * Helper function to update or create a meta tag
 * @param attribute - The attribute name ('name' or 'property')
 * @param attributeValue - The value of the attribute
 * @param content - The content to set
 */
function updateOrCreateMetaTag(
  attribute: 'name' | 'property',
  attributeValue: string,
  content: string
): void {
  const selector = `meta[${attribute}="${attributeValue}"]`;
  let metaTag = document.querySelector(selector);

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, attributeValue);
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', content);
}

/**
 * Build meta tag data from SEO fields with fallbacks
 * @param name - Item name
 * @param metaTitle - SEO meta title
 * @param metaDescription - SEO meta description
 * @param metaKeywords - SEO meta keywords
 * @param fallbackDescription - Fallback description if metaDescription is empty
 * @param image - Image URL for OG tags
 * @param url - Canonical URL
 * @returns MetaTagData object ready for updateMetaTags()
 */
export function buildMetaTagData(
  name: string,
  metaTitle: string | null | undefined,
  metaDescription: string | null | undefined,
  metaKeywords: string | null | undefined,
  fallbackDescription: string = '',
  image?: string,
  url?: string
): MetaTagData {
  const title = metaTitle || `${name} | Pikme`;
  const description = metaDescription || fallbackDescription || `Explore ${name} with Pikme. Premium travel experiences with expert guides and comfortable accommodations.`;
  const keywords = metaKeywords || name;

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    canonicalUrl: url,
  };
}

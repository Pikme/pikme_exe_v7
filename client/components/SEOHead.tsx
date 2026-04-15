import { useEffect } from 'react';
import { SEOMetadata } from '@/lib/seo';

interface SEOHeadProps {
  metadata: SEOMetadata;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

/**
 * SEO Head Component - Manages all meta tags and structured data for a page
 * This component updates the document head with SEO metadata for better search engine rankings
 */
export function SEOHead({
  metadata,
  canonicalUrl,
  structuredData,
  breadcrumbs,
}: SEOHeadProps) {
  useEffect(() => {
    // Update page title
    document.title = metadata.title;

    // Update meta description
    updateMetaTag('description', metadata.description);

    // Update keywords if provided
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', metadata.ogTitle || metadata.title, 'property');
    updateMetaTag('og:description', metadata.ogDescription || metadata.description, 'property');
    updateMetaTag('og:type', 'website', 'property');

    if (metadata.ogImage) {
      updateMetaTag('og:image', metadata.ogImage, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', metadata.title);
    updateMetaTag('twitter:description', metadata.description);
    if (metadata.ogImage) {
      updateMetaTag('twitter:image', metadata.ogImage);
    }

    // Update canonical URL
    if (canonicalUrl) {
      updateCanonicalLink(canonicalUrl);
    }

    // Add structured data
    if (structuredData) {
      addStructuredData('main-schema', structuredData);
    }

    // Add breadcrumb structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      addStructuredData('breadcrumb-schema', breadcrumbSchema);
    }

    // Cleanup function
    return () => {
      // Optional: Clean up structured data on unmount
      // removeStructuredData('main-schema');
      // removeStructuredData('breadcrumb-schema');
    };
  }, [metadata, canonicalUrl, structuredData, breadcrumbs]);

  return null; // This component only manages head tags, doesn't render anything
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
) {
  let meta = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Update or create canonical link
 */
function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Add structured data (JSON-LD) to the page
 */
function addStructuredData(id: string, schema: Record<string, any>) {
  // Remove existing script if it exists
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create and append new script
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Remove structured data from the page
 */
function removeStructuredData(id: string) {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

/**
 * Tour SEO Head Component
 */
export function TourSEOHead({
  tour,
  url,
}: {
  tour: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency?: string;
    duration: string;
    rating?: number;
    reviewCount?: number;
    image?: string;
    destination?: string;
  };
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.name,
    description: tour.description,
    image: tour.image || '',
    url: url,
    offers: {
      '@type': 'Offer',
      price: tour.price.toString(),
      priceCurrency: tour.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: url,
    },
    aggregateRating: tour.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: tour.rating.toString(),
          reviewCount: (tour.reviewCount || 1).toString(),
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  };

  const metadata: SEOMetadata = {
    title: `${tour.name} - Pikme Travel`,
    description: tour.description,
    keywords: `${tour.name}, ${tour.destination || 'tour'}, travel, vacation, booking`,
    ogTitle: `${tour.name} - Pikme Travel`,
    ogDescription: tour.description,
    ogImage: tour.image,
    canonicalUrl: url,
  };

  return (
    <SEOHead
      metadata={metadata}
      canonicalUrl={url}
      structuredData={schema}
    />
  );
}

/**
 * Destination SEO Head Component
 */
export function DestinationSEOHead({
  destination,
  url,
  breadcrumbs,
}: {
  destination: {
    name: string;
    description: string;
    image?: string;
    tourCount?: number;
  };
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.description,
    url: url,
    image: destination.image || '/default-destination.jpg',
  };

  const metadata: SEOMetadata = {
    title: `${destination.name} Tours & Travel | Pikme`,
    description: destination.description,
    keywords: `${destination.name} tours, ${destination.name} travel, visit ${destination.name}, ${destination.name} attractions`,
    ogTitle: `${destination.name} Tours & Travel | Pikme`,
    ogDescription: destination.description,
    ogImage: destination.image,
    canonicalUrl: url,
  };

  return (
    <SEOHead
      metadata={metadata}
      canonicalUrl={url}
      structuredData={schema}
      breadcrumbs={breadcrumbs}
    />
  );
}

/**
 * Category SEO Head Component
 */
export function CategorySEOHead({
  category,
  url,
  breadcrumbs,
}: {
  category: {
    name: string;
    description: string;
    image?: string;
    tourCount?: number;
  };
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const metadata: SEOMetadata = {
    title: `${category.name} Tours | Pikme Travel`,
    description: category.description,
    keywords: `${category.name}, ${category.name} tours, travel experiences, adventure`,
    ogTitle: `${category.name} Tours | Pikme Travel`,
    ogDescription: category.description,
    ogImage: category.image,
    canonicalUrl: url,
  };

  return (
    <SEOHead
      metadata={metadata}
      canonicalUrl={url}
      breadcrumbs={breadcrumbs}
    />
  );
}

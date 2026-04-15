import { useEffect } from 'react';

export interface MetaHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
}

/**
 * MetaHead Component
 * Manages meta tags for the current page
 * This component should be placed at the top level of each page component
 */
export function MetaHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  canonicalUrl,
}: MetaHeadProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    // Update or create meta keywords
    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'keywords');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', keywords);
    }

    // Update or create og:title
    if (ogTitle) {
      let meta = document.querySelector('meta[property="og:title"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', ogTitle);
    }

    // Update or create og:description
    if (ogDescription) {
      let meta = document.querySelector('meta[property="og:description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', ogDescription);
    }

    // Update or create og:image
    if (ogImage) {
      let meta = document.querySelector('meta[property="og:image"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', ogImage);
    }

    // Update or create og:url
    if (ogUrl) {
      let meta = document.querySelector('meta[property="og:url"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:url');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', ogUrl);
    }

    // Update or create canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonicalUrl]);

  // This component doesn't render anything
  return null;
}

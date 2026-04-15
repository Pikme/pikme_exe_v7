import { useEffect } from "react";
import { Language } from "@/contexts/LanguageContext";
import {
  getSEOMetadata,
  generateHreflangs,
  updateMetaTags,
  SEOMetadata,
} from "@/lib/seo";

interface UseSEOOptions {
  pageKey: string;
  language: Language;
  baseUrl?: string;
  path?: string;
  customMetadata?: Partial<SEOMetadata>;
}

/**
 * Custom hook to manage SEO metadata for a page
 * Automatically updates meta tags, hreflang tags, and canonical links
 */
export function useSEO(options: UseSEOOptions) {
  const {
    pageKey,
    language,
    baseUrl = "https://www.pikmeusa.com",
    path = "",
    customMetadata = {},
  } = options;

  useEffect(() => {
    // Get base SEO metadata
    let metadata = getSEOMetadata(pageKey, language);

    // Merge with custom metadata
    metadata = {
      ...metadata,
      ...customMetadata,
    };

    // Generate hreflang tags
    const hreflangs = generateHreflangs(path || `/${pageKey}`, baseUrl);

    // Set canonical URL
    const langPath = language === "en" ? path || `/${pageKey}` : `/${language}${path || `/${pageKey}`}`;
    metadata.canonicalUrl = `${baseUrl}${langPath}`;

    // Update all meta tags
    updateMetaTags(metadata, hreflangs);
  }, [pageKey, language, baseUrl, path, customMetadata]);
}

/**
 * Hook to update page title
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/**
 * Hook to update meta description
 */
export function useMetaDescription(description: string) {
  useEffect(() => {
    let meta = document.querySelector(
      "meta[name='description']"
    ) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    meta.content = description;
  }, [description]);
}

/**
 * Hook to set canonical URL
 */
export function useCanonicalURL(url: string) {
  useEffect(() => {
    let link = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href = url;
  }, [url]);
}

/**
 * Hook to set hreflang tags
 */
export function useHreflangs(hreflangs: string[]) {
  useEffect(() => {
    // Remove existing hreflang tags
    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((tag) => tag.remove());

    // Add new hreflang tags
    const head = document.head;
    hreflangs.forEach((hreflang) => {
      const temp = document.createElement("div");
      temp.innerHTML = hreflang;
      const link = temp.firstElementChild;
      if (link) {
        head.appendChild(link);
      }
    });
  }, [hreflangs]);
}

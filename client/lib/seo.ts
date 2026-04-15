import { Language } from "@/contexts/LanguageContext";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  alternateLanguages?: Record<Language, string>;
}

export interface LanguageMetadata {
  en: string;
  es: string;
  fr: string;
}

// Language-specific meta descriptions
export const pageMetaDescriptions: Record<string, LanguageMetadata> = {
  home: {
    en: "Discover handpicked travel experiences across the world. VIP customized domestic, international & spiritual tours from India with expert guides.",
    es: "Descubre experiencias de viaje seleccionadas en todo el mundo. Tours domésticos, internacionales y espirituales personalizados desde India con guías expertos.",
    fr: "Découvrez des expériences de voyage sélectionnées dans le monde entier. Tours domestiques, internationaux et spirituels personnalisés depuis l'Inde avec des guides experts.",
  },
  tours: {
    en: "Browse our collection of curated tours. Find the perfect travel experience tailored to your interests and budget.",
    es: "Explora nuestra colección de tours seleccionados. Encuentra la experiencia de viaje perfecta adaptada a tus intereses y presupuesto.",
    fr: "Parcourez notre collection de tours sélectionnés. Trouvez l'expérience de voyage parfaite adaptée à vos intérêts et votre budget.",
  },
  destinations: {
    en: "Explore top travel destinations. Discover hidden gems and popular attractions across India and beyond.",
    es: "Explora los principales destinos de viaje. Descubre gemas ocultas y atracciones populares en toda India y más allá.",
    fr: "Explorez les principales destinations de voyage. Découvrez les joyaux cachés et les attractions populaires en Inde et au-delà.",
  },
  attractions: {
    en: "Discover amazing attractions and landmarks. From historical sites to natural wonders, find your next adventure.",
    es: "Descubre atracciones y monumentos increíbles. Desde sitios históricos hasta maravillas naturales, encuentra tu próxima aventura.",
    fr: "Découvrez des attractions et des monuments incroyables. Des sites historiques aux merveilles naturelles, trouvez votre prochaine aventure.",
  },
  admin: {
    en: "Admin Dashboard - Manage tours, attractions, locations, and translations for Pikme travel platform.",
    es: "Panel de Administración - Gestiona tours, atracciones, ubicaciones y traducciones para la plataforma de viajes Pikme.",
    fr: "Tableau de Bord d'Administration - Gérez les tours, attractions, lieux et traductions pour la plateforme de voyage Pikme.",
  },
};

// Language-specific page titles
export const pageTitles: Record<string, LanguageMetadata> = {
  home: {
    en: "Pikme - Handpicked Travel Experiences",
    es: "Pikme - Experiencias de Viaje Seleccionadas",
    fr: "Pikme - Expériences de Voyage Sélectionnées",
  },
  tours: {
    en: "Tours - Pikme Travel",
    es: "Tours - Viajes Pikme",
    fr: "Tours - Voyage Pikme",
  },
  destinations: {
    en: "Destinations - Pikme Travel",
    es: "Destinos - Viajes Pikme",
    fr: "Destinations - Voyage Pikme",
  },
  attractions: {
    en: "Attractions - Pikme Travel",
    es: "Atracciones - Viajes Pikme",
    fr: "Attractions - Voyage Pikme",
  },
  admin: {
    en: "Admin - Pikme Travel",
    es: "Administración - Viajes Pikme",
    fr: "Administration - Voyage Pikme",
  },
};

/**
 * Generate hreflang tags for a page
 * @param path - The page path (e.g., '/tours', '/destinations')
 * @param baseUrl - The base URL of the website
 * @returns Array of hreflang link elements as strings
 */
export function generateHreflangs(path: string, baseUrl: string): string[] {
  const languages: Language[] = ["en", "es", "fr"];
  const hreflangs: string[] = [];

  // Add hreflang for each language
  languages.forEach((lang) => {
    const langPath = lang === "en" ? path : `/${lang}${path}`;
    hreflangs.push(
      `<link rel="alternate" hrefLang="${lang}" href="${baseUrl}${langPath}" />`
    );
  });

  // Add x-default hreflang (defaults to English)
  hreflangs.push(
    `<link rel="alternate" hrefLang="x-default" href="${baseUrl}${path}" />`
  );

  return hreflangs;
}

/**
 * Get SEO metadata for a page
 * @param pageKey - The page identifier (e.g., 'home', 'tours')
 * @param language - The current language
 * @returns SEO metadata object
 */
export function getSEOMetadata(
  pageKey: string,
  language: Language
): SEOMetadata {
  const title = pageTitles[pageKey]?.[language] || "Pikme Travel";
  const description =
    pageMetaDescriptions[pageKey]?.[language] ||
    "Discover handpicked travel experiences across the world.";

  return {
    title,
    description,
    keywords: getKeywords(pageKey, language),
    ogTitle: title,
    ogDescription: description,
    ogImage: "https://www.pikmeusa.com/og-image.jpg", // Update with actual OG image URL
  };
}

/**
 * Get language-specific keywords
 */
function getKeywords(pageKey: string, language: Language): string {
  const keywordMap: Record<string, LanguageMetadata> = {
    home: {
      en: "travel, tours, destinations, India, experiences, spiritual tours",
      es: "viajes, tours, destinos, India, experiencias, tours espirituales",
      fr: "voyage, tours, destinations, Inde, expériences, tours spirituels",
    },
    tours: {
      en: "tours, travel packages, guided tours, adventure tours, India tours",
      es: "tours, paquetes de viaje, tours guiados, tours de aventura, tours de India",
      fr: "tours, forfaits de voyage, visites guidées, tours d'aventure, tours en Inde",
    },
    destinations: {
      en: "destinations, travel destinations, places to visit, India destinations",
      es: "destinos, destinos de viaje, lugares para visitar, destinos de India",
      fr: "destinations, destinations de voyage, lieux à visiter, destinations en Inde",
    },
    attractions: {
      en: "attractions, landmarks, things to do, tourist attractions, India attractions",
      es: "atracciones, monumentos, cosas que hacer, atracciones turísticas, atracciones de India",
      fr: "attractions, monuments, choses à faire, attractions touristiques, attractions en Inde",
    },
  };

  return (
    keywordMap[pageKey]?.[language] ||
    "travel, tours, destinations, experiences"
  );
}

/**
 * Update document meta tags
 */
export function updateMetaTags(metadata: SEOMetadata, hreflangs: string[]) {
  // Update title
  document.title = metadata.title;

  // Update or create meta tags
  updateMetaTag("description", metadata.description);
  updateMetaTag("keywords", metadata.keywords || "");
  updateMetaTag("og:title", metadata.ogTitle || metadata.title);
  updateMetaTag("og:description", metadata.ogDescription || metadata.description);

  if (metadata.ogImage) {
    updateMetaTag("og:image", metadata.ogImage);
  }

  if (metadata.canonicalUrl) {
    updateCanonicalLink(metadata.canonicalUrl);
  }

  // Update hreflang tags
  updateHreflangs(hreflangs);
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Update or create canonical link
 */
function updateCanonicalLink(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Update hreflang tags
 */
function updateHreflangs(hreflangs: string[]) {
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
}

/**
 * Generate structured data (JSON-LD) for a page
 */
export function generateStructuredData(
  type: "Organization" | "WebPage" | "BreadcrumbList",
  data: Record<string, any>
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  });
}


/**
 * Generate destination-specific SEO metadata
 */
export function generateDestinationSEO(
  name: string,
  type: 'country' | 'state' | 'city',
  stats?: {
    stateCount?: number;
    cityCount?: number;
    tourCount?: number;
  }
): SEOMetadata {
  const title = `${name} Tours & Travel | Pikme - Handpicked Experiences`;
  
  let description = `Explore ${name} with Pikme's curated tours and travel experiences.`;
  if (stats?.stateCount) description += ` Discover ${stats.stateCount} states and regions.`;
  if (stats?.cityCount) description += ` Visit ${stats.cityCount} amazing cities and attractions.`;
  if (stats?.tourCount) description += ` Choose from ${stats.tourCount} exclusive tour packages.`;

  const keywords = [
    `${name} tours`,
    `${name} travel`,
    `visit ${name}`,
    `${name} attractions`,
    `${name} destinations`,
    `${name} vacation`,
    `${name} travel guide`,
  ].join(', ');

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: `https://www.pikmeusa.com/destinations/${name.toLowerCase().replace(/\\s+/g, '-')}.jpg`,
  };
}

/**
 * Generate breadcrumb structured data for destination pages
 */
export function generateDestinationBreadcrumbs(
  items: Array<{ name: string; url: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * Generate TouristDestination structured data
 */
export function generateTouristDestinationSchema(
  name: string,
  description: string,
  url: string,
  image?: string,
  tours?: Array<{ name: string; price?: number; duration?: number }>
): string {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description,
    url,
    image: image || '/default-destination.jpg',
  };

  if (tours && tours.length > 0) {
    schema.offers = tours.map((tour) => ({
      '@type': 'Offer',
      name: tour.name,
      priceCurrency: 'INR',
      price: tour.price?.toString() || '0',
      duration: tour.duration ? `P${tour.duration}D` : undefined,
    }));
  }

  return JSON.stringify(schema);
}

/**
 * Build canonical URL for destination page
 */
export function buildDestinationCanonicalUrl(
  country: string,
  state?: string
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.pikmeusa.com';
  const path = state ? `/destinations/${country}/${state}` : `/destinations/${country}`;
  return `${baseUrl}${path}`;
}

/**
 * Add JSON-LD structured data to page head
 */
export function addJsonLd(data: Record<string, any>) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Generate Tour Product schema
 */
export function generateTourProductSchema(tour: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  url: string;
  destination?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.name,
    description: tour.description,
    image: tour.image || '',
    url: tour.url,
    offers: {
      '@type': 'Offer',
      price: tour.price.toString(),
      priceCurrency: tour.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: tour.url,
    },
    aggregateRating: tour.rating ? {
      '@type': 'AggregateRating',
      ratingValue: tour.rating.toString(),
      reviewCount: (tour.reviewCount || 1).toString(),
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  };
}

/**
 * Generate Review schema
 */
export function generateReviewSchema(review: {
  author: string;
  rating: number;
  text: string;
  date: string;
  productName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: review.text,
    datePublished: review.date,
    itemReviewed: {
      '@type': 'Product',
      name: review.productName,
    },
  };
}

/**
 * Set OpenGraph and Twitter Card meta tags
 */
export function setOpenGraphTags(config: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}) {
  const setMeta = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setMeta('og:title', config.title);
  setMeta('og:description', config.description);
  if (config.image) setMeta('og:image', config.image);
  if (config.url) setMeta('og:url', config.url);
  if (config.type) setMeta('og:type', config.type);

  // Twitter Card tags
  const setTwitter = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setTwitter('twitter:card', 'summary_large_image');
  setTwitter('twitter:title', config.title);
  setTwitter('twitter:description', config.description);
  if (config.image) setTwitter('twitter:image', config.image);
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{
  question: string;
  answer: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(business: {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
    },
    telephone: business.phone,
    email: business.email,
    url: business.website,
    image: business.image,
    aggregateRating: business.rating ? {
      '@type': 'AggregateRating',
      ratingValue: business.rating.toString(),
      reviewCount: (business.reviewCount || 1).toString(),
    } : undefined,
  };
}

/**
 * Generate Event schema
 */
export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  image?: string;
  url?: string;
  price?: number;
  currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    image: event.image,
    url: event.url,
    offers: event.price ? {
      '@type': 'Offer',
      price: event.price.toString(),
      priceCurrency: event.currency || 'INR',
      url: event.url,
    } : undefined,
  };
}

/**
 * Generate VideoObject schema
 */
export function generateVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
  };
}

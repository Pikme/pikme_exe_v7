/**
 * Structured Data (JSON-LD) utilities for SEO
 * Generates Schema.org compliant structured data
 */

export interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbSchema {
  "@context": string;
  "@type": string;
  itemListElement: BreadcrumbItem[];
}

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint?: {
    "@type": string;
    telephone: string;
    contactType: string;
  };
  address?: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface LocalBusinessSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  image?: string;
  priceRange?: string;
  openingHoursSpecification?: Array<{
    "@type": string;
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
  };
}

export interface ProductSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image: string;
  price: string;
  priceCurrency: string;
  availability: string;
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
  };
  offers?: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema(config: {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}): OrganizationSchema {
  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: config.url,
    logo: config.logo,
    description: config.description,
    sameAs: config.sameAs || [],
  };

  if (config.telephone || config.email) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: config.telephone || "",
      contactType: "Customer Service",
    };
  }

  if (config.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry,
    };
  }

  return schema;
}

/**
 * Generate local business schema
 */
export function generateLocalBusinessSchema(config: {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  latitude?: number;
  longitude?: number;
  image?: string;
  priceRange?: string;
  ratingValue?: number;
  reviewCount?: number;
}): LocalBusinessSchema {
  const schema: LocalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.name,
    description: config.description,
    url: config.url,
    telephone: config.telephone,
    email: config.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry,
    },
  };

  if (config.latitude && config.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: config.latitude,
      longitude: config.longitude,
    };
  }

  if (config.image) {
    schema.image = config.image;
  }

  if (config.priceRange) {
    schema.priceRange = config.priceRange;
  }

  if (config.ratingValue && config.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: config.ratingValue,
      reviewCount: config.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate product schema for tours
 */
export function generateProductSchema(config: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  ratingValue?: number;
  reviewCount?: number;
}): ProductSchema {
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: config.name,
    description: config.description,
    image: config.image,
    price: config.price.toString(),
    priceCurrency: config.currency,
    availability: `https://schema.org/${config.availability}`,
  };

  if (config.ratingValue && config.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: config.ratingValue,
      reviewCount: config.reviewCount,
    };
  }

  schema.offers = {
    "@type": "Offer",
    price: config.price.toString(),
    priceCurrency: config.currency,
    availability: `https://schema.org/${config.availability}`,
  };

  return schema;
}

/**
 * Convert schema object to JSON-LD string
 */
export function schemaToJsonLd(schema: any): string {
  return JSON.stringify(schema);
}

/**
 * Generate multiple schemas and combine them
 */
export function generateMultipleSchemas(schemas: any[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas,
  });
}

/**
 * Format breadcrumb items from route path
 */
export function formatBreadcrumbsFromPath(
  path: string,
  baseUrl: string = "https://www.pikmeusa.com"
): Array<{ name: string; url: string }> {
  const segments = path.split("/").filter((s) => s);
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: baseUrl },
  ];

  let currentPath = baseUrl;
  segments.forEach((segment) => {
    currentPath = `${currentPath}/${segment}`;
    const name = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    breadcrumbs.push({ name, url: currentPath });
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for tour detail page
 */
export function generateTourBreadcrumbs(
  tourName: string,
  stateName?: string,
  categoryName?: string
): Array<{ name: string; url: string }> {
  const baseUrl = "https://www.pikmeusa.com";
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: baseUrl },
    { name: "Tours", url: `${baseUrl}/tours` },
  ];

  if (categoryName) {
    breadcrumbs.push({
      name: categoryName,
      url: `${baseUrl}/categories/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }

  if (stateName) {
    breadcrumbs.push({
      name: stateName,
      url: `${baseUrl}/states/${stateName.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }

  breadcrumbs.push({
    name: tourName,
    url: `${baseUrl}/visit/tour/${tourName.toLowerCase().replace(/\s+/g, "-")}`,
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for state detail page
 */
export function generateStateBreadcrumbs(
  stateName: string,
  countryName?: string
): Array<{ name: string; url: string }> {
  const baseUrl = "https://www.pikmeusa.com";
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: baseUrl },
    { name: "States", url: `${baseUrl}/states` },
  ];

  if (countryName) {
    breadcrumbs.push({
      name: countryName,
      url: `${baseUrl}/countries/${countryName.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }

  breadcrumbs.push({
    name: stateName,
    url: `${baseUrl}/states/${stateName.toLowerCase().replace(/\s+/g, "-")}`,
  });

  return breadcrumbs;
}

/**
 * Generate category breadcrumbs for category detail page
 */
export function generateCategoryBreadcrumbs(categoryName: string): Array<{ name: string; url: string }> {
  const baseUrl = "https://www.pikmeusa.com";
  return [
    { name: "Home", url: baseUrl },
    { name: "Categories", url: `${baseUrl}/categories` },
    {
      name: categoryName,
      url: `${baseUrl}/categories/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
    },
  ];
}

/**
 * Generate Tour schema for individual tour pages
 */
export function generateTourSchema(tour: {
  id: number;
  name: string;
  description: string;
  slug: string;
  image?: string;
  duration?: number;
  price?: number;
  rating?: number;
  reviewCount?: number;
}): any {
  const baseUrl = "https://www.pikmeusa.com";
  const tourUrl = `${baseUrl}/tour/${tour.slug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Tour",
    name: tour.name,
    description: tour.description,
    url: tourUrl,
  };

  if (tour.image) {
    schema.image = tour.image;
  }

  if (tour.duration) {
    schema.duration = `P${tour.duration}D`; // ISO 8601 format
  }

  if (tour.price) {
    schema.priceCurrency = "INR";
    schema.price = tour.price.toString();
    schema.offers = {
      "@type": "Offer",
      url: tourUrl,
      priceCurrency: "INR",
      price: tour.price.toString(),
      availability: "https://schema.org/InStock",
    };
  }

  if (tour.rating && tour.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: tour.rating,
      reviewCount: tour.reviewCount,
    };
  }

  schema.author = {
    "@type": "Organization",
    name: "Pikme Travel",
  };

  return schema;
}

/**
 * Generate Attraction schema for individual attraction pages
 */
export function generateAttractionSchema(attraction: {
  id: number;
  name: string;
  description: string;
  slug: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  rating?: number;
  reviewCount?: number;
}): any {
  const baseUrl = "https://www.pikmeusa.com";
  const attractionUrl = `${baseUrl}/attraction/${attraction.slug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: attraction.name,
    description: attraction.description,
    url: attractionUrl,
  };

  if (attraction.image) {
    schema.image = attraction.image;
  }

  if (attraction.latitude && attraction.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: attraction.latitude,
      longitude: attraction.longitude,
    };
  }

  if (attraction.city || attraction.state || attraction.country) {
    schema.address = {
      "@type": "PostalAddress",
    };

    if (attraction.city) {
      schema.address.addressLocality = attraction.city;
    }
    if (attraction.state) {
      schema.address.addressRegion = attraction.state;
    }
    if (attraction.country) {
      schema.address.addressCountry = attraction.country;
    }
  }

  if (attraction.rating && attraction.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: attraction.rating,
      reviewCount: attraction.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate Location (Destination) schema for individual location pages
 */
export function generateLocationSchema(location: {
  id: number;
  name: string;
  description: string;
  slug: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  rating?: number;
  reviewCount?: number;
}): any {
  const baseUrl = "https://www.pikmeusa.com";
  const locationUrl = `${baseUrl}/destination/${location.slug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location.name,
    description: location.description,
    url: locationUrl,
  };

  if (location.image) {
    schema.image = location.image;
  }

  if (location.latitude && location.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  if (location.country) {
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: location.country,
    };
  }

  if (location.rating && location.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: location.rating,
      reviewCount: location.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate Activity schema for activity hub pages
 */
export function generateActivitySchema(activity: {
  name: string;
  description?: string;
  image?: string;
  tourCount?: number;
}): any {
  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": activity.name,
    "description": activity.description || `Explore ${activity.name} tours and experiences`,
    "image": activity.image || "https://www.pikmeusa.com/default-activity.jpg",
    "url": `https://www.pikmeusa.com/activities/${activity.name.toLowerCase().replace(/\s+/g, '-')}`,
    "numberOfItems": activity.tourCount || 0,
  };
}

/**
 * Insert structured data JSON-LD script into document head
 */
export function insertStructuredData(schema: any): void {
  if (typeof document === "undefined") return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Remove existing structured data scripts by type
 */
export function removeStructuredData(type: string): void {
  if (typeof document === "undefined") return;

  const scripts = document.querySelectorAll("script[type='application/ld+json']");
  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || "{}");
      if (data["@type"] === type) {
        script.remove();
      }
    } catch {
      // Ignore parse errors
    }
  });
}

/**
 * Hook-friendly structured data manager
 */
export function useStructuredData(schema: any): void {
  if (typeof window === "undefined") return;

  // Remove old schema of same type
  if (schema["@type"]) {
    removeStructuredData(schema["@type"]);
  }

  // Insert new schema
  insertStructuredData(schema);
}

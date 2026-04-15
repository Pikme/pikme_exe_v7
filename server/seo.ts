import * as db from "./db";

/**
 * Generate JSON-LD structured data for a tour
 */
export function generateTourStructuredData(tour: any, baseUrl: string) {
  const tourUrl = `${baseUrl}/visit/tour/${tour.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    name: tour.name,
    description: tour.description || tour.longDescription,
    url: tourUrl,
    image: tour.image,
    duration: tour.duration ? `P${tour.duration}D` : undefined,
    price: tour.price,
    priceCurrency: tour.currency,
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: tour.currency,
      url: tourUrl,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
    },
    itinerary: tour.itinerary ? tour.itinerary.map((day: any, index: number) => ({
      "@type": "Day",
      dayNumber: index + 1,
      name: day.title || `Day ${index + 1}`,
      description: day.description,
    })) : undefined,
  };
}

/**
 * Generate JSON-LD structured data for a location
 */
export function generateLocationStructuredData(location: any, country: any, baseUrl: string) {
  const locationUrl = `${baseUrl}/visit/${country.slug}/${location.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location.name,
    description: location.description,
    url: locationUrl,
    image: location.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.name,
      addressCountry: country.code,
    },
    geo: location.latitude && location.longitude ? {
      "@type": "GeoCoordinates",
      latitude: location.latitude,
      longitude: location.longitude,
    } : undefined,
  };
}

/**
 * Generate JSON-LD structured data for a country
 */
export function generateCountryStructuredData(country: any, baseUrl: string) {
  const countryUrl = `${baseUrl}/visit/${country.slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Country",
    name: country.name,
    description: country.description,
    url: countryUrl,
    image: country.image,
    identifier: country.code,
  };
}

/**
 * Generate SEO metadata for a tour page
 */
export async function generateTourMetadata(tour: any, baseUrl: string) {
  const title = tour.metaTitle || `${tour.name} - Travel Package`;
  const description = tour.metaDescription || tour.description?.substring(0, 160) || "Discover amazing travel experiences";
  const keywords = tour.metaKeywords || `${tour.name}, tour, travel, ${tour.category}`;
  
  const structuredData = generateTourStructuredData(tour, baseUrl);
  
  return {
    title,
    description,
    keywords,
    structuredData,
    ogImage: tour.image,
    canonicalUrl: `${baseUrl}/visit/tour/${tour.slug}`,
  };
}

/**
 * Generate SEO metadata for a location page
 */
export async function generateLocationMetadata(location: any, country: any, baseUrl: string) {
  const title = location.metaTitle || `${location.name}, ${country.name} - Travel Guide`;
  const description = location.metaDescription || location.description?.substring(0, 160) || "Explore this amazing destination";
  const keywords = location.metaKeywords || `${location.name}, ${country.name}, travel, destination`;
  
  const structuredData = generateLocationStructuredData(location, country, baseUrl);
  
  return {
    title,
    description,
    keywords,
    structuredData,
    ogImage: location.image,
    canonicalUrl: `${baseUrl}/visit/${country.slug}/${location.slug}`,
  };
}

/**
 * Generate SEO metadata for a country page
 */
export async function generateCountryMetadata(country: any, baseUrl: string) {
  const title = country.metaTitle || `${country.name} - Travel Destination`;
  const description = country.metaDescription || country.description?.substring(0, 160) || "Discover travel experiences in this country";
  const keywords = country.metaKeywords || `${country.name}, travel, destination, tours`;
  
  const structuredData = generateCountryStructuredData(country, baseUrl);
  
  return {
    title,
    description,
    keywords,
    structuredData,
    ogImage: country.image,
    canonicalUrl: `${baseUrl}/visit/${country.slug}`,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
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
 * Generate sitemap XML entry
 */
export function generateSitemapEntry(url: string, priority: number = 0.5, changeFrequency: string = "weekly") {
  return `  <url>
    <loc>${url}</loc>
    <priority>${priority}</priority>
    <changefreq>${changeFrequency}</changefreq>
  </url>`;
}

/**
 * Generate complete sitemap XML
 */
// Sitemap XML generation moved to dynamic generation
// export async function generateSitemapXml(baseUrl: string) {
//   const entries = await db.getAllSitemapEntries();
//   
//   const sitemapEntries = entries
//     .map(entry => generateSitemapEntry(
//       entry.url,
//       parseFloat(entry.priority?.toString() || "0.5"),
//       entry.changeFrequency || "weekly"
//     ))
//     .join("\n");
//
//   return `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${sitemapEntries}
// </urlset>`;
// }

// Sitemap entry functions moved to dynamic generation
// /**
//  * Update sitemap entries for a tour
//  */
// export async function updateTourSitemapEntry(tour: any, baseUrl: string) {
//   const url = `${baseUrl}/visit/tour/${tour.slug}`;
//   
//   try {
//     await db.updateSitemapEntry(url, {
//       lastModified: new Date(),
//       priority: "0.8",
//       changeFrequency: "weekly",
//     });
//   } catch {
//     // Entry doesn't exist, create it
//     await db.createSitemapEntry({
//       url,
//       priority: "0.8",
//       changeFrequency: "weekly",
//     });
//   }
// }
//
// /**
//  * Update sitemap entries for a location
//  */
// export async function updateLocationSitemapEntry(location: any, country: any, baseUrl: string) {
//   const url = `${baseUrl}/visit/${country.slug}/${location.slug}`;
//   
//   try {
//     await db.updateSitemapEntry(url, {
//       lastModified: new Date(),
//       priority: "0.7",
//       changeFrequency: "monthly",
//     });
//   } catch {
//     await db.createSitemapEntry({
//       url,
//       priority: "0.7",
//       changeFrequency: "monthly",
//     });
//   }
// }
//
// /**
//  * Update sitemap entries for a country
//  */
// export async function updateCountrySitemapEntry(country: any, baseUrl: string) {
//   const url = `${baseUrl}/visit/${country.slug}`;
//   
//   try {
//     await db.updateSitemapEntry(url, {
//       lastModified: new Date(),
//       priority: "0.9",
//       changeFrequency: "monthly",
//     });
//   } catch {
//     await db.createSitemapEntry({
//       url,
//       priority: "0.9",
//       changeFrequency: "monthly",
//     });
//   }
// }

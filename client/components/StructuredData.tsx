import { useEffect } from "react";

interface StructuredDataProps {
  schema: any;
  id?: string;
}

/**
 * StructuredData Component
 * Injects JSON-LD structured data into the page head
 * 
 * Usage:
 * <StructuredData schema={breadcrumbSchema} />
 * <StructuredData schema={organizationSchema} id="org-schema" />
 */
export function StructuredData({ schema, id }: StructuredDataProps) {
  useEffect(() => {
    // Create script tag
    const script = document.createElement("script");
    script.type = "application/ld+json";
    if (id) {
      script.id = id;
    }

    // Set schema content
    script.textContent = JSON.stringify(schema);

    // Append to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema, id]);

  // This component doesn't render anything visible
  return null;
}

interface MultipleStructuredDataProps {
  schemas: Array<{ schema: any; id?: string }>;
}

/**
 * MultipleStructuredData Component
 * Injects multiple JSON-LD schemas into the page
 * 
 * Usage:
 * <MultipleStructuredData schemas={[
 *   { schema: breadcrumbSchema },
 *   { schema: organizationSchema, id: "org-schema" }
 * ]} />
 */
export function MultipleStructuredData({ schemas }: MultipleStructuredDataProps) {
  useEffect(() => {
    const scripts = schemas.map((item) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      if (item.id) {
        script.id = item.id;
      }
      script.textContent = JSON.stringify(item.schema);
      document.head.appendChild(script);
      return script;
    });

    // Cleanup function
    return () => {
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [schemas]);

  // This component doesn't render anything visible
  return null;
}

interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>;
  id?: string;
}

/**
 * BreadcrumbStructuredData Component
 * Convenience component for breadcrumb schema
 * 
 * Usage:
 * <BreadcrumbStructuredData items={breadcrumbItems} />
 */
export function BreadcrumbStructuredData({ items, id }: BreadcrumbStructuredDataProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData schema={schema} id={id || "breadcrumb-schema"} />;
}

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  telephone?: string;
  email?: string;
  id?: string;
}

/**
 * OrganizationStructuredData Component
 * Convenience component for organization schema
 * 
 * Usage:
 * <OrganizationStructuredData
 *   name="Pikme Travel"
 *   url="https://www.pikmeusa.com"
 *   logo="https://www.pikmeusa.com/logo.png"
 *   description="Travel experiences"
 *   sameAs={["https://facebook.com/pikme", "https://twitter.com/pikme"]}
 * />
 */
export function OrganizationStructuredData({
  name,
  url,
  logo,
  description,
  sameAs,
  telephone,
  email,
  id,
}: OrganizationStructuredDataProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: sameAs || [],
  };

  if (telephone || email) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: telephone || "",
      contactType: "Customer Service",
    };
  }

  return <StructuredData schema={schema} id={id || "organization-schema"} />;
}

interface LocalBusinessStructuredDataProps {
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
  id?: string;
}

/**
 * LocalBusinessStructuredData Component
 * Convenience component for local business schema
 * 
 * Usage:
 * <LocalBusinessStructuredData
 *   name="Pikme Travel"
 *   description="Travel agency"
 *   url="https://www.pikmeusa.com"
 *   telephone="+1-800-PIKME"
 *   email="cr@pikme.org"
 *   address={{
 *     streetAddress: "123 Travel St",
 *     addressLocality: "New York",
 *     addressRegion: "NY",
 *     postalCode: "10001",
 *     addressCountry: "US"
 *   }}
 * />
 */
export function LocalBusinessStructuredData({
  name,
  description,
  url,
  telephone,
  email,
  address,
  latitude,
  longitude,
  image,
  priceRange,
  ratingValue,
  reviewCount,
  id,
}: LocalBusinessStructuredDataProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
  };

  if (latitude && longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  if (image) {
    schema.image = image;
  }

  if (priceRange) {
    schema.priceRange = priceRange;
  }

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  return <StructuredData schema={schema} id={id || "local-business-schema"} />;
}

interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  ratingValue?: number;
  reviewCount?: number;
  id?: string;
}

/**
 * ProductStructuredData Component
 * Convenience component for product schema (useful for tours)
 * 
 * Usage:
 * <ProductStructuredData
 *   name="Kerala Backwaters Tour"
 *   description="3-day tour"
 *   image="https://www.pikmeusa.com/tour.jpg"
 *   price={15000}
 *   currency="INR"
 *   availability="InStock"
 * />
 */
export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency,
  availability,
  ratingValue,
  reviewCount,
  id,
}: ProductStructuredDataProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    price: price.toString(),
    priceCurrency: currency,
    availability: `https://schema.org/${availability}`,
  };

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  schema.offers = {
    "@type": "Offer",
    price: price.toString(),
    priceCurrency: currency,
    availability: `https://schema.org/${availability}`,
  };

  return <StructuredData schema={schema} id={id || "product-schema"} />;
}

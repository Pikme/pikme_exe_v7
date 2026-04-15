import { Location } from "../db";

/**
 * CSV schema for locations export
 * Defines the columns and their order
 */
export const LOCATION_CSV_HEADERS = [
  "id",
  "name",
  "slug",
  "description",
  "latitude",
  "longitude",
  "metaTitle",
  "metaDescription",
  "metaKeywords",
  "image",
  "createdAt",
  "updatedAt",
] as const;

export type LocationCsvRow = Record<typeof LOCATION_CSV_HEADERS[number], string | number>;

/**
 * Escape CSV field values to handle special characters
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert locations to CSV format
 */
export function convertLocationsToCSV(locations: Location[]): string {
  // Add headers
  const csvLines: string[] = [LOCATION_CSV_HEADERS.join(",")];

  // Add data rows
  for (const location of locations) {
    const row = LOCATION_CSV_HEADERS.map((header) => {
      const value = location[header as keyof Location];
      return escapeCsvField(value);
    });
    csvLines.push(row.join(","));
  }

  return csvLines.join("\n");
}

/**
 * Generate CSV template with example data
 */
export function generateLocationCsvTemplate(): string {
  const exampleLocations: Partial<Location>[] = [
    {
      id: 1,
      name: "Kochi",
      slug: "kochi",
      description: "Gateway to Kerala with beautiful backwaters and Chinese fishing nets",
      latitude: 9.9312,
      longitude: 76.2673,
      metaTitle: "Kochi - Kerala's Gateway City",
      metaDescription: "Explore Kochi's historic charm, backwaters, and cultural heritage",
      metaKeywords: "Kochi, Kerala, backwaters, fishing nets",
      image: "https://example.com/kochi.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Munnar",
      slug: "munnar",
      description: "Hill station known for tea gardens and scenic beauty",
      latitude: 10.5869,
      longitude: 77.0595,
      metaTitle: "Munnar - Tea Garden Paradise",
      metaDescription: "Discover Munnar's lush tea gardens and mountain landscapes",
      metaKeywords: "Munnar, tea gardens, hill station, Kerala",
      image: "https://example.com/munnar.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const csvLines: string[] = [
    "# Location CSV Import Template",
    "# Instructions:",
    "# - Do not modify the header row",
    "# - id: Leave empty for new locations, provide existing ID to update",
    "# - name: Required, location name (1-100 characters)",
    "# - slug: Required, URL-friendly slug (lowercase, hyphens only)",
    "# - description: Optional, location description",
    "# - latitude: Optional, decimal format (e.g., 9.9312)",
    "# - longitude: Optional, decimal format (e.g., 76.2673)",
    "# - metaTitle: Optional, SEO title (max 160 characters)",
    "# - metaDescription: Optional, SEO description (max 160 characters)",
    "# - metaKeywords: Optional, comma-separated keywords",
    "# - image: Optional, image URL",
    "# - createdAt: Leave empty (auto-generated)",
    "# - updatedAt: Leave empty (auto-generated)",
    "",
    LOCATION_CSV_HEADERS.join(","),
  ];

  // Add example rows
  for (const location of exampleLocations) {
    const row = LOCATION_CSV_HEADERS.map((header) => {
      const value = location[header as keyof Location];
      return escapeCsvField(value);
    });
    csvLines.push(row.join(","));
  }

  return csvLines.join("\n");
}

/**
 * Generate filename for CSV export
 */
export function generateLocationCsvFilename(prefix: string = "locations"): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `${prefix}-${timestamp}.csv`;
}

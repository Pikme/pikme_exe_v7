import Papa from "papaparse";

/**
 * Localization Import Utilities
 * Handles CSV parsing and validation for bulk localization updates
 */

export interface LocalizationCSVRow {
  contentType: "tour" | "state" | "category";
  contentId: number;
  locale: string;
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isComplete?: boolean;
  // Tour-specific fields
  longDescription?: string;
  highlights?: string;
  itinerary?: string;
  inclusions?: string;
  exclusions?: string;
  bestTime?: string;
  cancellationPolicy?: string;
  paymentPolicy?: string;
  importantNotes?: string;
  faqs?: string;
  headingH1?: string;
  headingH2?: string;
  headingH3?: string;
  amenities?: string;
  transport?: string;
}

export interface LocalizationImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: LocalizationImportError[];
  warnings: LocalizationImportWarning[];
}

export interface LocalizationImportError {
  rowNumber: number;
  contentType: string;
  contentId: number;
  locale: string;
  message: string;
}

export interface LocalizationImportWarning {
  rowNumber: number;
  contentType: string;
  contentId: number;
  locale: string;
  message: string;
}

/**
 * Parse CSV file for localization imports
 */
export function parseLocalizationCSV(csvContent: string): {
  rows: LocalizationCSVRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: LocalizationCSVRow[] = [];

  try {
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((err) => {
        errors.push(`CSV parsing error: ${err.message}`);
      });
      return { rows: [], errors };
    }

    result.data.forEach((row: any, index: number) => {
      try {
        const parsed = parseLocalizationRow(row, index + 2); // +2 for header and 0-indexing
        if (parsed) {
          rows.push(parsed);
        }
      } catch (error) {
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });

    return { rows, errors };
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { rows: [], errors };
  }
}

/**
 * Parse a single localization CSV row
 */
function parseLocalizationRow(row: any, rowNumber: number): LocalizationCSVRow | null {
  // Validate required fields
  const contentType = row.contenttype?.toLowerCase();
  const contentIdStr = row.contentid;
  const locale = row.locale?.trim();

  if (!contentType || !["tour", "state", "category"].includes(contentType)) {
    throw new Error(
      `Invalid contentType: "${contentType}". Must be one of: tour, state, category`
    );
  }

  if (!contentIdStr) {
    throw new Error("contentId is required");
  }

  const contentId = parseInt(contentIdStr);
  if (isNaN(contentId) || contentId <= 0) {
    throw new Error(`Invalid contentId: "${contentIdStr}". Must be a positive number`);
  }

  if (!locale) {
    throw new Error("locale is required");
  }

  if (!locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    throw new Error(
      `Invalid locale format: "${locale}". Must be in format: en-IN, hi-IN, etc.`
    );
  }

  // Parse optional fields
  const parsed: LocalizationCSVRow = {
    contentType: contentType as "tour" | "state" | "category",
    contentId,
    locale,
    title: row.title?.trim() || undefined,
    description: row.description?.trim() || undefined,
    metaTitle: row.metatitle?.trim() || undefined,
    metaDescription: row.metadescription?.trim() || undefined,
    metaKeywords: row.metakeywords?.trim() || undefined,
    isComplete: parseBoolean(row.iscomplete),
  };

  // Tour-specific fields
  if (contentType === "tour") {
    parsed.longDescription = row.longdescription?.trim() || undefined;
    parsed.highlights = row.highlights?.trim() || undefined;
    parsed.itinerary = row.itinerary?.trim() || undefined;
    parsed.inclusions = row.inclusions?.trim() || undefined;
    parsed.exclusions = row.exclusions?.trim() || undefined;
    parsed.bestTime = row.besttime?.trim() || undefined;
    parsed.cancellationPolicy = row.cancellationpolicy?.trim() || undefined;
    parsed.paymentPolicy = row.paymentpolicy?.trim() || undefined;
    parsed.importantNotes = row.importantnotes?.trim() || undefined;
    parsed.faqs = row.faqs?.trim() || undefined;
    parsed.headingH1 = row.headingh1?.trim() || undefined;
    parsed.headingH2 = row.headingh2?.trim() || undefined;
    parsed.headingH3 = row.headingh3?.trim() || undefined;
    parsed.amenities = row.amenities?.trim() || undefined;
    parsed.transport = row.transport?.trim() || undefined;
  }

  return parsed;
}

/**
 * Parse boolean values from CSV
 */
function parseBoolean(value: any): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const str = String(value).toLowerCase().trim();
  if (["true", "yes", "1", "y"].includes(str)) {
    return true;
  }
  if (["false", "no", "0", "n"].includes(str)) {
    return false;
  }

  return undefined;
}

/**
 * Validate localization row
 */
export function validateLocalizationRow(
  row: LocalizationCSVRow,
  rowNumber: number
): {
  valid: boolean;
  errors: LocalizationImportError[];
  warnings: LocalizationImportWarning[];
} {
  const errors: LocalizationImportError[] = [];
  const warnings: LocalizationImportWarning[] = [];

  // Validate required fields
  if (!row.title && !row.description) {
    errors.push({
      rowNumber,
      contentType: row.contentType,
      contentId: row.contentId,
      locale: row.locale,
      message: "At least one of title or description is required",
    });
  }

  // Validate field lengths
  if (row.title && row.title.length > 500) {
    warnings.push({
      rowNumber,
      contentType: row.contentType,
      contentId: row.contentId,
      locale: row.locale,
      message: `Title is very long (${row.title.length} chars). Consider shortening for better UX`,
    });
  }

  if (row.metaTitle && row.metaTitle.length > 160) {
    warnings.push({
      rowNumber,
      contentType: row.contentType,
      contentId: row.contentId,
      locale: row.locale,
      message: `Meta title exceeds 160 characters (${row.metaTitle.length} chars). Will be truncated in search results`,
    });
  }

  if (row.metaDescription && row.metaDescription.length > 160) {
    warnings.push({
      rowNumber,
      contentType: row.contentType,
      contentId: row.contentId,
      locale: row.locale,
      message: `Meta description exceeds 160 characters (${row.metaDescription.length} chars). Will be truncated in search results`,
    });
  }

  // Validate locale
  if (!row.locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    errors.push({
      rowNumber,
      contentType: row.contentType,
      contentId: row.contentId,
      locale: row.locale,
      message: `Invalid locale format: "${row.locale}". Must be in format: en-IN, hi-IN, etc.`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate sample CSV template for localizations
 */
export function generateLocalizationCSVTemplate(contentType: "tour" | "state" | "category"): string {
  const headers = [
    "contentType",
    "contentId",
    "locale",
    "title",
    "description",
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "isComplete",
  ];

  if (contentType === "tour") {
    headers.push(
      "longDescription",
      "highlights",
      "itinerary",
      "inclusions",
      "exclusions",
      "bestTime",
      "cancellationPolicy",
      "paymentPolicy",
      "importantNotes",
      "faqs",
      "headingH1",
      "headingH2",
      "headingH3",
      "amenities",
      "transport"
    );
  }

  // Sample rows
  const sampleRows = [
    [
      contentType,
      "1",
      "en-IN",
      "Sample Title",
      "Sample description",
      "Sample Meta Title",
      "Sample meta description",
      "keyword1, keyword2",
      "false",
    ],
    [
      contentType,
      "1",
      "hi-IN",
      "नमूना शीर्षक",
      "नमूना विवरण",
      "नमूना मेटा शीर्षक",
      "नमूना मेटा विवरण",
      "कीवर्ड1, कीवर्ड2",
      "false",
    ],
  ];

  if (contentType === "tour") {
    sampleRows[0].push(
      "Long description here",
      "Highlight 1|Highlight 2",
      "Day 1: Activity 1|Day 2: Activity 2",
      "Inclusion 1|Inclusion 2",
      "Exclusion 1",
      "October to March",
      "Free cancellation up to 7 days",
      "50% upfront",
      "Important note",
      "Q1: Answer 1|Q2: Answer 2",
      "H1 Heading",
      "H2 Heading",
      "H3 Heading",
      "Amenity 1|Amenity 2",
      "Transport option 1"
    );
    sampleRows[1].push(
      "लंबा विवरण",
      "हाइलाइट 1|हाइलाइट 2",
      "दिन 1: गतिविधि 1|दिन 2: गतिविधि 2",
      "समावेशन 1|समावेशन 2",
      "बहिष्करण 1",
      "अक्टूबर से मार्च",
      "7 दिन तक मुफ्त रद्दीकरण",
      "50% अग्रिम",
      "महत्वपूर्ण नोट",
      "प्र1: उत्तर 1|प्र2: उत्तर 2",
      "H1 शीर्षक",
      "H2 शीर्षक",
      "H3 शीर्षक",
      "सुविधा 1|सुविधा 2",
      "परिवहन विकल्प 1"
    );
  }

  // Create CSV string
  const csvLines = [headers.join(","), ...sampleRows.map((row) => row.join(","))];

  return csvLines.join("\n");
}

/**
 * Parse array fields from pipe-separated values
 */
export function parseArrayField(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Convert localization row to database insert format
 */
export function convertToDatabaseFormat(row: LocalizationCSVRow): Record<string, any> {
  const data: Record<string, any> = {
    title: row.title,
    description: row.description,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    metaKeywords: row.metaKeywords,
    isComplete: row.isComplete ?? false,
  };

  // Tour-specific fields
  if (row.contentType === "tour") {
    data.longDescription = row.longDescription;
    data.highlights = row.highlights ? parseArrayField(row.highlights) : undefined;
    data.itinerary = row.itinerary ? parseArrayField(row.itinerary) : undefined;
    data.inclusions = row.inclusions ? parseArrayField(row.inclusions) : undefined;
    data.exclusions = row.exclusions ? parseArrayField(row.exclusions) : undefined;
    data.bestTime = row.bestTime;
    data.cancellationPolicy = row.cancellationPolicy;
    data.paymentPolicy = row.paymentPolicy;
    data.importantNotes = row.importantNotes;
    data.faqs = row.faqs ? parseArrayField(row.faqs) : undefined;
    data.headingH1 = row.headingH1;
    data.headingH2 = row.headingH2;
    data.headingH3 = row.headingH3;
    data.amenities = row.amenities ? parseArrayField(row.amenities) : undefined;
    data.transport = row.transport ? parseArrayField(row.transport) : undefined;
  }

  return data;
}

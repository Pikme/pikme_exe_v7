import Papa from "papaparse";
import { z } from "zod";
import { LOCATION_CSV_HEADERS } from "./location-csv-export";

/**
 * Validation schema for location CSV rows
 */
const LocationCsvRowSchema = z.object({
  id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  latitude: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  longitude: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  metaTitle: z.string().max(160, "Meta title must be 160 characters or less").optional(),
  metaDescription: z.string().max(160, "Meta description must be 160 characters or less").optional(),
  metaKeywords: z.string().optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type LocationCsvRowInput = z.infer<typeof LocationCsvRowSchema>;

/**
 * Validation error for a single row
 */
export interface RowValidationError {
  rowNumber: number;
  errors: Record<string, string>;
  data?: Record<string, any>;
}

/**
 * Result of CSV import validation
 */
export interface CsvImportValidationResult {
  isValid: boolean;
  validRows: LocationCsvRowInput[];
  invalidRows: RowValidationError[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    createCount: number;
    updateCount: number;
  };
}

/**
 * Parse CSV content and validate rows
 */
export async function validateLocationCsv(csvContent: string): Promise<CsvImportValidationResult> {
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const validRows: LocationCsvRowInput[] = [];
        const invalidRows: RowValidationError[] = [];

        // Filter out comment rows
        const dataRows = (results.data as Record<string, any>[]).filter(
          (row) => !Object.values(row).every((v) => v === "" || v === null)
        );

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const rowNumber = i + 2; // +2 because of header row and 1-based indexing

          try {
            const validatedRow = LocationCsvRowSchema.parse(row);
            validRows.push(validatedRow);
          } catch (error) {
            if (error instanceof z.ZodError) {
              const fieldErrors: Record<string, string> = {};
              for (const issue of error.issues) {
                const path = issue.path.join(".");
                fieldErrors[path] = issue.message;
              }
              invalidRows.push({
                rowNumber,
                errors: fieldErrors,
                data: row,
              });
            }
          }
        }

        // Calculate summary
        const createCount = validRows.filter((r) => !r.id).length;
        const updateCount = validRows.filter((r) => r.id).length;

        resolve({
          isValid: invalidRows.length === 0,
          validRows,
          invalidRows,
          summary: {
            totalRows: dataRows.length,
            validRows: validRows.length,
            invalidRows: invalidRows.length,
            createCount,
            updateCount,
          },
        });
      },
      error: (error) => {
        resolve({
          isValid: false,
          validRows: [],
          invalidRows: [
            {
              rowNumber: 0,
              errors: { _general: `CSV parsing error: ${error.message}` },
            },
          ],
          summary: {
            totalRows: 0,
            validRows: 0,
            invalidRows: 1,
            createCount: 0,
            updateCount: 0,
          },
        });
      },
    });
  });
}

/**
 * Check for duplicate locations in the validated rows
 */
export function checkForDuplicates(rows: LocationCsvRowInput[]): RowValidationError[] {
  const duplicates: RowValidationError[] = [];
  const seenSlugs = new Map<string, number>();
  const seenNames = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const errors: Record<string, string> = {};

    // Check for duplicate slugs
    if (seenSlugs.has(row.slug)) {
      const previousRow = seenSlugs.get(row.slug)!;
      errors.slug = `Duplicate slug found. Previously seen in row ${previousRow}`;
    } else {
      seenSlugs.set(row.slug, rowNumber);
    }

    // Check for duplicate names
    if (seenNames.has(row.name)) {
      const previousRow = seenNames.get(row.name)!;
      errors.name = `Duplicate name found. Previously seen in row ${previousRow}`;
    } else {
      seenNames.set(row.name, rowNumber);
    }

    if (Object.keys(errors).length > 0) {
      duplicates.push({
        rowNumber,
        errors,
        data: row,
      });
    }
  }

  return duplicates;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: RowValidationError[]): string[] {
  return errors.map((error) => {
    const fieldErrors = Object.entries(error.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join("; ");
    return `Row ${error.rowNumber}: ${fieldErrors}`;
  });
}

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import {
  createTourLocalization,
  updateTourLocalization,
  createStateLocalization,
  updateStateLocalization,
  createCategoryLocalization,
  updateCategoryLocalization,
  getTourLocalization,
  getStateLocalization,
  getCategoryLocalization,
  createImportLog,
  updateImportLogStatus,
} from "../db";
import {
  parseLocalizationCSV,
  validateLocalizationRow,
  convertToDatabaseFormat,
  generateLocalizationCSVTemplate,
} from "../localization-import-utils";

/**
 * Localization Import Router - Handle bulk CSV imports for localizations
 */
export const localizationImportRouter = router({
  /**
   * Import localizations from CSV content
   */
  importFromCSV: adminProcedure
    .input(
      z.object({
        csvContent: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { csvContent, fileName } = input;

      // Create import log
      const logResult = await createImportLog({
        userId: ctx.user.id,
        fileName,
        importType: "tours",
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        status: "processing",
      });

      const logId = (logResult as any).insertId || 1;
      const errors: string[] = [];
      const warnings: string[] = [];
      let successful = 0;
      let failed = 0;

      try {
        // Parse CSV
        const { rows: csvRows, errors: parseErrors } = parseLocalizationCSV(csvContent);

        if (parseErrors.length > 0) {
          errors.push(...parseErrors);
        }

        const totalRecords = csvRows.length;

        // Process each row
        for (let i = 0; i < csvRows.length; i++) {
          const row = csvRows[i];
          const rowNumber = i + 2; // +2 for header and 1-indexing

          try {
            // Validate row
            const validation = validateLocalizationRow(row, rowNumber);
            if (!validation.valid) {
              validation.errors.forEach((err) => {
                errors.push(
                  `Row ${rowNumber}: ${err.message} (${err.contentType} ${err.contentId} - ${err.locale})`
                );
              });
              failed++;
              continue;
            }

            if (validation.warnings.length > 0) {
              validation.warnings.forEach((warn) => {
                warnings.push(
                  `Row ${rowNumber}: ${warn.message} (${warn.contentType} ${warn.contentId} - ${warn.locale})`
                );
              });
            }

            // Convert to database format
            const data = convertToDatabaseFormat(row);

            // Check if localization already exists
            let exists = false;
            if (row.contentType === "tour") {
              exists = !!(await getTourLocalization(row.contentId, row.locale));
            } else if (row.contentType === "state") {
              exists = !!(await getStateLocalization(row.contentId, row.locale));
            } else if (row.contentType === "category") {
              exists = !!(await getCategoryLocalization(row.contentId, row.locale));
            }

            // Create or update
            if (row.contentType === "tour") {
              if (exists) {
                await updateTourLocalization(row.contentId, row.locale, data);
              } else {
                await createTourLocalization({
                  tourId: row.contentId,
                  locale: row.locale,
                  ...data,
                });
              }
            } else if (row.contentType === "state") {
              if (exists) {
                await updateStateLocalization(row.contentId, row.locale, data);
              } else {
                await createStateLocalization({
                  stateId: row.contentId,
                  locale: row.locale,
                  ...data,
                });
              }
            } else if (row.contentType === "category") {
              if (exists) {
                await updateCategoryLocalization(row.contentId, row.locale, data);
              } else {
                await createCategoryLocalization({
                  categoryId: row.contentId,
                  locale: row.locale,
                  ...data,
                });
              }
            }

            successful++;
          } catch (error) {
            failed++;
            errors.push(
              `Row ${rowNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        // Update import log
        await updateImportLogStatus(logId, {
          totalRecords,
          successfulRecords: successful,
          failedRecords: failed,
          status: failed === 0 ? "completed" : "completed",
          errors: errors.length > 0 ? errors : undefined,
          completedAt: new Date(),
        });

        return {
          logId,
          totalRecords,
          successful,
          failed,
          errors,
          warnings,
        };
      } catch (error) {
        await updateImportLogStatus(logId, {
          status: "failed",
          errors: [error instanceof Error ? error.message : "Unknown error"],
          completedAt: new Date(),
        }) as any;

        throw error;
      }
    }),

  /**
   * Get CSV template for localizations
   */
  getCSVTemplate: protectedProcedure
    .input(
      z.object({
        contentType: z.enum(["tour", "state", "category"]),
      })
    )
    .query(({ input }) => {
      return generateLocalizationCSVTemplate(input.contentType);
    }),

  /**
   * Get import history
   */
  getImportHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // This would typically query the import logs table
      // For now, return a placeholder
      return {
        imports: [],
        total: 0,
      };
    }),

  /**
   * Get import details
   */
  getImportDetails: adminProcedure
    .input(z.object({ logId: z.number() }))
    .query(async ({ input }) => {
      // This would typically query the import logs table
      // For now, return a placeholder
      return {
        id: input.logId,
        fileName: "import.csv",
        importType: "localizations",
        status: "completed",
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        errors: [],
        warnings: [],
        createdAt: new Date(),
        completedAt: new Date(),
      };
    }),
});

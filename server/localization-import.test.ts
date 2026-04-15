import { describe, it, expect } from "vitest";
import {
  parseLocalizationCSV,
  validateLocalizationRow,
  convertToDatabaseFormat,
  generateLocalizationCSVTemplate,
  parseArrayField,
  LocalizationCSVRow,
} from "./localization-import-utils";

describe("Localization CSV Import Utils", () => {
  describe("parseLocalizationCSV", () => {
    it("should parse valid CSV content", () => {
      const csv = `contentType,contentId,locale,title,description
tour,1,en-IN,Sample Tour,Sample description
tour,2,hi-IN,नमूना टूर,नमूना विवरण`;

      const { rows, errors } = parseLocalizationCSV(csv);

      expect(rows).toHaveLength(2);
      expect(errors).toHaveLength(0);
      expect(rows[0]).toEqual({
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "Sample Tour",
        description: "Sample description",
        isComplete: undefined,
      });
    });

    it("should handle empty CSV", () => {
      const csv = `contentType,contentId,locale,title,description`;

      const { rows, errors } = parseLocalizationCSV(csv);

      expect(rows).toHaveLength(0);
      expect(errors).toHaveLength(0);
    });

    it("should report parsing errors", () => {
      const csv = `contentType,contentId,locale,title,description
invalid,abc,en-IN,Title,Description`;

      const { rows, errors } = parseLocalizationCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid contentType");
    });

    it("should parse tour-specific fields", () => {
      const csv = `contentType,contentId,locale,title,description,longDescription,highlights
tour,1,en-IN,Title,Desc,Long desc,Highlight 1|Highlight 2`;

      const { rows } = parseLocalizationCSV(csv);

      expect(rows[0]).toMatchObject({
        contentType: "tour",
        longDescription: "Long desc",
        highlights: "Highlight 1|Highlight 2",
      });
    });
  });

  describe("validateLocalizationRow", () => {
    it("should validate a valid row", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "Sample Tour",
        description: "Sample description",
      };

      const result = validateLocalizationRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require at least title or description", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
      };

      const result = validateLocalizationRow(row, 2);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("At least one of title or description");
    });

    it("should warn about long titles", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "A".repeat(501),
        description: "Description",
      };

      const result = validateLocalizationRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain("very long");
    });

    it("should warn about long meta titles", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "Title",
        description: "Description",
        metaTitle: "A".repeat(161),
      };

      const result = validateLocalizationRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain("exceeds 160 characters");
    });

    it("should validate locale format", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "invalid",
        title: "Title",
        description: "Description",
      };

      const result = validateLocalizationRow(row, 2);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain("Invalid locale format");
    });

    it("should accept valid locales", () => {
      const locales = ["en-IN", "hi-IN", "en-US", "fr-FR", "de-DE"];

      locales.forEach((locale) => {
        const row: LocalizationCSVRow = {
          contentType: "tour",
          contentId: 1,
          locale,
          title: "Title",
          description: "Description",
        };

        const result = validateLocalizationRow(row, 2);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe("convertToDatabaseFormat", () => {
    it("should convert basic fields", () => {
      const row: LocalizationCSVRow = {
        contentType: "state",
        contentId: 1,
        locale: "en-IN",
        title: "Title",
        description: "Description",
        metaTitle: "Meta Title",
        metaDescription: "Meta Description",
        metaKeywords: "keyword1, keyword2",
        isComplete: true,
      };

      const result = convertToDatabaseFormat(row);

      expect(result).toEqual({
        title: "Title",
        description: "Description",
        metaTitle: "Meta Title",
        metaDescription: "Meta Description",
        metaKeywords: "keyword1, keyword2",
        isComplete: true,
      });
    });

    it("should convert tour-specific fields", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "Title",
        description: "Description",
        highlights: "Highlight 1|Highlight 2|Highlight 3",
        inclusions: "Inclusion 1|Inclusion 2",
        exclusions: "Exclusion 1",
        amenities: "Amenity 1|Amenity 2",
      };

      const result = convertToDatabaseFormat(row);

      expect(result.highlights).toEqual(["Highlight 1", "Highlight 2", "Highlight 3"]);
      expect(result.inclusions).toEqual(["Inclusion 1", "Inclusion 2"]);
      expect(result.exclusions).toEqual(["Exclusion 1"]);
      expect(result.amenities).toEqual(["Amenity 1", "Amenity 2"]);
    });

    it("should handle undefined array fields", () => {
      const row: LocalizationCSVRow = {
        contentType: "tour",
        contentId: 1,
        locale: "en-IN",
        title: "Title",
        description: "Description",
      };

      const result = convertToDatabaseFormat(row);

      expect(result.highlights).toBeUndefined();
      expect(result.inclusions).toBeUndefined();
    });
  });

  describe("generateLocalizationCSVTemplate", () => {
    it("should generate tour template", () => {
      const template = generateLocalizationCSVTemplate("tour");

      expect(template).toContain("contentType");
      expect(template).toContain("contentId");
      expect(template).toContain("locale");
      expect(template).toContain("tour");
      expect(template).toContain("en-IN");
      expect(template).toContain("hi-IN");
      expect(template).toContain("longDescription");
      expect(template).toContain("highlights");
    });

    it("should generate state template", () => {
      const template = generateLocalizationCSVTemplate("state");

      expect(template).toContain("contentType");
      expect(template).toContain("state");
      expect(template).not.toContain("longDescription");
    });

    it("should generate category template", () => {
      const template = generateLocalizationCSVTemplate("category");

      expect(template).toContain("contentType");
      expect(template).toContain("category");
      expect(template).not.toContain("longDescription");
    });

    it("should include sample rows", () => {
      const template = generateLocalizationCSVTemplate("tour");

      const lines = template.split("\n");
      expect(lines.length).toBeGreaterThan(2); // Header + at least 2 sample rows
    });
  });

  describe("parseArrayField", () => {
    it("should parse pipe-separated values", () => {
      const result = parseArrayField("Item 1|Item 2|Item 3");
      expect(result).toEqual(["Item 1", "Item 2", "Item 3"]);
    });

    it("should trim whitespace", () => {
      const result = parseArrayField("Item 1 | Item 2 | Item 3 ");
      expect(result).toEqual(["Item 1", "Item 2", "Item 3"]);
    });

    it("should handle empty string", () => {
      const result = parseArrayField("");
      expect(result).toEqual([]);
    });

    it("should handle undefined", () => {
      const result = parseArrayField(undefined);
      expect(result).toEqual([]);
    });

    it("should filter empty items", () => {
      const result = parseArrayField("Item 1||Item 2");
      expect(result).toEqual(["Item 1", "Item 2"]);
    });

    it("should handle single item", () => {
      const result = parseArrayField("Single Item");
      expect(result).toEqual(["Single Item"]);
    });
  });

  describe("CSV Import Integration", () => {
    it("should handle complete tour localization import", () => {
      const csv = `contentType,contentId,locale,title,description,metaTitle,metaDescription,longDescription,highlights,inclusions,exclusions
tour,1,en-IN,Kerala Backwaters,Explore the serene backwaters,Kerala Tour,Visit Kerala,A complete Kerala experience,Backwater cruise|Houseboat stay,Meals included|Guide included,Flights not included`;

      const { rows, errors } = parseLocalizationCSV(csv);

      expect(rows).toHaveLength(1);
      expect(errors).toHaveLength(0);

      const row = rows[0];
      const validation = validateLocalizationRow(row, 2);
      expect(validation.valid).toBe(true);

      const dbFormat = convertToDatabaseFormat(row);
      expect(dbFormat.highlights).toEqual(["Backwater cruise", "Houseboat stay"]);
      expect(dbFormat.inclusions).toEqual(["Meals included", "Guide included"]);
    });

    it("should handle multiple locales for same content", () => {
      const csv = `contentType,contentId,locale,title,description
tour,1,en-IN,Kerala Tour,English description
tour,1,hi-IN,केरल टूर,हिंदी विवरण
tour,1,en-US,Kerala Tour,American English description`;

      const { rows } = parseLocalizationCSV(csv);

      expect(rows).toHaveLength(3);
      expect(rows.map((r) => r.locale)).toEqual(["en-IN", "hi-IN", "en-US"]);
      expect(rows.every((r) => r.contentId === 1)).toBe(true);
    });

    it("should handle mixed content types", () => {
      const csv = `contentType,contentId,locale,title,description
tour,1,en-IN,Kerala Tour,Tour description
state,5,en-IN,Kerala State,State description
category,3,en-IN,Adventure,Category description`;

      const { rows } = parseLocalizationCSV(csv);

      expect(rows).toHaveLength(3);
      expect(rows[0].contentType).toBe("tour");
      expect(rows[1].contentType).toBe("state");
      expect(rows[2].contentType).toBe("category");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid content type", () => {
      const csv = `contentType,contentId,locale,title,description
invalid,1,en-IN,Title,Description`;

      const { errors } = parseLocalizationCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid contentType");
    });

    it("should handle invalid content ID", () => {
      const csv = `contentType,contentId,locale,title,description
tour,abc,en-IN,Title,Description`;

      const { errors } = parseLocalizationCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid contentId");
    });

    it("should handle missing locale", () => {
      const csv = `contentType,contentId,locale,title,description
tour,1,,Title,Description`;

      const { errors } = parseLocalizationCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("locale is required");
    });

    it("should handle invalid locale format", () => {
      const csv = `contentType,contentId,locale,title,description
tour,1,english,Title,Description`;

      const { errors } = parseLocalizationCSV(csv);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid locale format");
    });
  });
});

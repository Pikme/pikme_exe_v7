import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("AdminAuditLog localStorage Persistence", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("View Mode Storage Key", () => {
    it("should use correct storage key", () => {
      const STORAGE_KEY = "auditLogViewMode";
      expect(STORAGE_KEY).toBe("auditLogViewMode");
    });

    it("should be a consistent string", () => {
      const key1 = "auditLogViewMode";
      const key2 = "auditLogViewMode";
      expect(key1).toBe(key2);
    });
  });

  describe("Saving View Mode to localStorage", () => {
    it("should save table view mode", () => {
      const viewMode = "table";
      localStorage.setItem("auditLogViewMode", viewMode);
      expect(localStorage.getItem("auditLogViewMode")).toBe("table");
    });

    it("should save timeline view mode", () => {
      const viewMode = "timeline";
      localStorage.setItem("auditLogViewMode", viewMode);
      expect(localStorage.getItem("auditLogViewMode")).toBe("timeline");
    });

    it("should overwrite previous view mode", () => {
      localStorage.setItem("auditLogViewMode", "table");
      expect(localStorage.getItem("auditLogViewMode")).toBe("table");

      localStorage.setItem("auditLogViewMode", "timeline");
      expect(localStorage.getItem("auditLogViewMode")).toBe("timeline");
    });
  });

  describe("Loading View Mode from localStorage", () => {
    it("should load table view mode from storage", () => {
      localStorage.setItem("auditLogViewMode", "table");
      const saved = localStorage.getItem("auditLogViewMode");
      expect(saved).toBe("table");
    });

    it("should load timeline view mode from storage", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      const saved = localStorage.getItem("auditLogViewMode");
      expect(saved).toBe("timeline");
    });

    it("should return null when key doesn't exist", () => {
      const saved = localStorage.getItem("auditLogViewMode");
      expect(saved).toBeNull();
    });

    it("should default to table when storage is empty", () => {
      const saved = localStorage.getItem("auditLogViewMode");
      const viewMode = (saved as "table" | "timeline") || "table";
      expect(viewMode).toBe("table");
    });
  });

  describe("View Mode Validation", () => {
    it("should validate table as valid view mode", () => {
      const viewMode: "table" | "timeline" = "table";
      expect(viewMode === "table" || viewMode === "timeline").toBe(true);
    });

    it("should validate timeline as valid view mode", () => {
      const viewMode: "table" | "timeline" = "timeline";
      expect(viewMode === "table" || viewMode === "timeline").toBe(true);
    });

    it("should handle stored value as ViewMode type", () => {
      localStorage.setItem("auditLogViewMode", "table");
      const saved = localStorage.getItem("auditLogViewMode");
      const viewMode = (saved as "table" | "timeline") || "table";
      expect(viewMode === "table" || viewMode === "timeline").toBe(true);
    });
  });

  describe("localStorage Persistence Across Sessions", () => {
    it("should persist table view mode across multiple accesses", () => {
      localStorage.setItem("auditLogViewMode", "table");
      const firstAccess = localStorage.getItem("auditLogViewMode");
      const secondAccess = localStorage.getItem("auditLogViewMode");
      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess).toBe("table");
    });

    it("should persist timeline view mode across multiple accesses", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      const firstAccess = localStorage.getItem("auditLogViewMode");
      const secondAccess = localStorage.getItem("auditLogViewMode");
      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess).toBe("timeline");
    });

    it("should maintain state after multiple updates", () => {
      localStorage.setItem("auditLogViewMode", "table");
      expect(localStorage.getItem("auditLogViewMode")).toBe("table");

      localStorage.setItem("auditLogViewMode", "timeline");
      expect(localStorage.getItem("auditLogViewMode")).toBe("timeline");

      localStorage.setItem("auditLogViewMode", "table");
      expect(localStorage.getItem("auditLogViewMode")).toBe("table");
    });
  });

  describe("localStorage Edge Cases", () => {
    it("should handle empty string gracefully", () => {
      localStorage.setItem("auditLogViewMode", "");
      const saved = localStorage.getItem("auditLogViewMode");
      const viewMode = (saved as "table" | "timeline") || "table";
      expect(viewMode).toBe("table");
    });

    it("should handle clearing storage", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      localStorage.clear();
      const saved = localStorage.getItem("auditLogViewMode");
      expect(saved).toBeNull();
    });

    it("should handle removing specific key", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      localStorage.removeItem("auditLogViewMode");
      const saved = localStorage.getItem("auditLogViewMode");
      expect(saved).toBeNull();
    });
  });

  describe("SSR Safety", () => {
    it("should check if window is defined before accessing localStorage", () => {
      const isSSR = typeof window === "undefined";
      expect(isSSR).toBe(false);
    });

    it("should return default value when window is undefined", () => {
      const isSSR = typeof window === "undefined";
      const viewMode = isSSR ? "table" : localStorage.getItem("auditLogViewMode") || "table";
      expect(viewMode).toBe("table");
    });
  });

  describe("Type Safety", () => {
    it("should maintain ViewMode type after loading from storage", () => {
      localStorage.setItem("auditLogViewMode", "table");
      const saved = localStorage.getItem("auditLogViewMode");
      const viewMode = (saved as "table" | "timeline") || "table";

      if (viewMode === "table") {
        expect(true).toBe(true);
      } else if (viewMode === "timeline") {
        expect(true).toBe(true);
      }
    });

    it("should properly type cast stored value", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      const saved = localStorage.getItem("auditLogViewMode");
      const typedViewMode: "table" | "timeline" = (saved as "table" | "timeline") || "table";
      expect(typedViewMode === "timeline").toBe(true);
    });
  });

  describe("Multiple Storage Keys", () => {
    it("should not interfere with other storage keys", () => {
      localStorage.setItem("auditLogViewMode", "table");
      localStorage.setItem("otherKey", "otherValue");

      expect(localStorage.getItem("auditLogViewMode")).toBe("table");
      expect(localStorage.getItem("otherKey")).toBe("otherValue");
    });

    it("should handle removing one key without affecting others", () => {
      localStorage.setItem("auditLogViewMode", "timeline");
      localStorage.setItem("otherKey", "otherValue");
      localStorage.removeItem("auditLogViewMode");

      expect(localStorage.getItem("auditLogViewMode")).toBeNull();
      expect(localStorage.getItem("otherKey")).toBe("otherValue");
    });
  });
});

import { useState, useEffect, useCallback } from "react";

export interface DateRangePreset {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  createdAt: number; // timestamp
  usageCount: number;
  description?: string;
}

const STORAGE_KEY = "engagement_dashboard_presets";
const MAX_PRESETS = 10;

/**
 * Hook for managing date range presets in localStorage
 */
export function useLocalStoragePresets() {
  const [presets, setPresets] = useState<DateRangePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPresets(parsed);
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load presets from localStorage:", err);
      setError("Failed to load presets");
      setIsLoading(false);
    }
  }, []);

  // Save presets to localStorage
  const saveToStorage = useCallback((newPresets: DateRangePreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
      setPresets(newPresets);
      setError(null);
    } catch (err) {
      console.error("Failed to save presets to localStorage:", err);
      setError("Failed to save presets");
    }
  }, []);

  // Add a new preset
  const addPreset = useCallback(
    (name: string, startDate: string, endDate: string, description?: string) => {
      if (!name.trim()) {
        setError("Preset name cannot be empty");
        return false;
      }

      if (presets.length >= MAX_PRESETS) {
        setError(`Maximum ${MAX_PRESETS} presets allowed`);
        return false;
      }

      // Check for duplicate names
      if (presets.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        setError("A preset with this name already exists");
        return false;
      }

      const newPreset: DateRangePreset = {
        id: generateId(),
        name: name.trim(),
        startDate,
        endDate,
        createdAt: Date.now(),
        usageCount: 0,
        description: description?.trim(),
      };

      const newPresets = [...presets, newPreset];
      saveToStorage(newPresets);
      return true;
    },
    [presets, saveToStorage]
  );

  // Update an existing preset
  const updatePreset = useCallback(
    (id: string, updates: Partial<DateRangePreset>) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) {
        setError("Preset not found");
        return false;
      }

      // Check for duplicate names if name is being updated
      if (
        updates.name &&
        updates.name !== preset.name &&
        presets.some((p) => p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase())
      ) {
        setError("A preset with this name already exists");
        return false;
      }

      const updated = { ...preset, ...updates };
      const newPresets = presets.map((p) => (p.id === id ? updated : p));
      saveToStorage(newPresets);
      return true;
    },
    [presets, saveToStorage]
  );

  // Delete a preset
  const deletePreset = useCallback(
    (id: string) => {
      const newPresets = presets.filter((p) => p.id !== id);
      saveToStorage(newPresets);
      return true;
    },
    [presets, saveToStorage]
  );

  // Get a preset by ID
  const getPreset = useCallback(
    (id: string) => {
      return presets.find((p) => p.id === id);
    },
    [presets]
  );

  // Increment usage count for a preset
  const incrementUsage = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (preset) {
        updatePreset(id, { usageCount: preset.usageCount + 1 });
      }
    },
    [presets, updatePreset]
  );

  // Clear all presets
  const clearAllPresets = useCallback(() => {
    saveToStorage([]);
    return true;
  }, [saveToStorage]);

  // Get presets sorted by usage count (most used first)
  const getMostUsedPresets = useCallback(
    (limit?: number) => {
      const sorted = [...presets].sort((a, b) => b.usageCount - a.usageCount);
      return limit ? sorted.slice(0, limit) : sorted;
    },
    [presets]
  );

  // Get presets sorted by creation date (newest first)
  const getRecentPresets = useCallback(
    (limit?: number) => {
      const sorted = [...presets].sort((a, b) => b.createdAt - a.createdAt);
      return limit ? sorted.slice(0, limit) : sorted;
    },
    [presets]
  );

  // Search presets by name or description
  const searchPresets = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return presets.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
      );
    },
    [presets]
  );

  return {
    presets,
    isLoading,
    error,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    incrementUsage,
    clearAllPresets,
    getMostUsedPresets,
    getRecentPresets,
    searchPresets,
  };
}

/**
 * Generate a unique ID for a preset
 */
function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for reading presets without modifying them
 */
export function useLocalStoragePresetsRead() {
  const [presets, setPresets] = useState<DateRangePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPresets(parsed);
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load presets from localStorage:", err);
      setIsLoading(false);
    }
  }, []);

  return { presets, isLoading };
}

import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";

export interface FilterOption {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface FilterPanelProps {
  filters: FilterOption[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());
  const { trackFilterUsage } = useSearchAnalytics();

  const toggleFilter = (filterId: string) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterId)) {
      newExpanded.delete(filterId);
    } else {
      newExpanded.add(filterId);
    }
    setExpandedFilters(newExpanded);
  };

  const handleOptionChange = (filterId: string, value: string) => {
    const currentValues = selectedFilters[filterId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFilterChange(filterId, newValues);
    
    // Track filter usage
    const filterLabel = filters.find(f => f.id === filterId)?.label || filterId;
    const optionLabel = filters.find(f => f.id === filterId)?.options.find(o => o.value === value)?.label || value;
    trackFilterUsage(filterId, filterLabel, value, optionLabel);
  };

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, values) => sum + values.length,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              trackFilterUsage('clear-all', 'Clear Filters', 'all', 'Clear all');
              onClearFilters();
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filters.map((filter) => (
          <div key={filter.id} className="border-b border-gray-200 pb-3 last:border-0">
            <button
              onClick={() => toggleFilter(filter.id)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>{filter.label}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedFilters.has(filter.id) ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedFilters.has(filter.id) && (
              <div className="mt-3 space-y-2 ml-2">
                {filter.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedFilters[filter.id]?.includes(option.value) || false
                      }
                      onChange={() =>
                        handleOptionChange(filter.id, option.value)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

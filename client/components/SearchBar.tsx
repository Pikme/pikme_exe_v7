import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onClear,
}: SearchBarProps) {
  const { trackSearch } = useSearchAnalytics();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Track search term after user stops typing (debounced)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(value.trim());
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, trackSearch]);

  return (
    <div className="relative flex items-center gap-2">
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-3 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

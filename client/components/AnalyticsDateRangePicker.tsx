import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, X } from "lucide-react";

export interface DateRange {
  start: string;
  end: string;
}

export type DateRangePreset = "today" | "last7days" | "last30days" | "last90days" | "custom";

interface AnalyticsDateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onPresetChange?: (preset: DateRangePreset) => void;
}

const getPresetDateRange = (preset: DateRangePreset): DateRange => {
  const today = new Date();
  const end = today.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { start: end, end };
    case "last7days": {
      const start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: start.toISOString().split("T")[0], end };
    }
    case "last30days": {
      const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: start.toISOString().split("T")[0], end };
    }
    case "last90days": {
      const start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { start: start.toISOString().split("T")[0], end };
    }
    case "custom":
    default:
      return { start: "", end: "" };
  }
};

export function AnalyticsDateRangePicker({
  dateRange,
  onDateRangeChange,
  onPresetChange,
}: AnalyticsDateRangePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null);

  const handlePresetClick = (preset: DateRangePreset) => {
    const newRange = getPresetDateRange(preset);
    setSelectedPreset(preset);
    onDateRangeChange(newRange);
    onPresetChange?.(preset);
  };

  const handleCustomDateChange = (field: "start" | "end", value: string) => {
    const newRange = { ...dateRange, [field]: value };
    onDateRangeChange(newRange);
    setSelectedPreset(null);
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    onDateRangeChange({ start: "", end: today });
    setSelectedPreset(null);
  };

  const getDaysInRange = (): number => {
    if (!dateRange.start || !dateRange.end) return 0;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDateDisplay = (): string => {
    if (!dateRange.start || !dateRange.end) return "Select dates";
    if (dateRange.start === dateRange.end) return dateRange.start;
    return `${dateRange.start} to ${dateRange.end}`;
  };

  return (
    <div className="space-y-4">
      {/* Date Range Display Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">
                Date Range
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDateDisplay()}
                {getDaysInRange() > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({getDaysInRange()} days)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {isExpanded ? "Hide" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Quick Presets</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={selectedPreset === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick("today")}
                  className="text-xs"
                >
                  Today
                </Button>
                <Button
                  variant={selectedPreset === "last7days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick("last7days")}
                  className="text-xs"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={selectedPreset === "last30days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick("last30days")}
                  className="text-xs"
                >
                  Last 30 Days
                </Button>
                <Button
                  variant={selectedPreset === "last90days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick("last90days")}
                  className="text-xs"
                >
                  Last 90 Days
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Custom Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">From</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleCustomDateChange("start", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">To</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleCustomDateChange("end", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Apply
              </Button>
            </div>

            {/* Date Range Info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">Date Range Info</p>
              <ul className="space-y-1 text-blue-600">
                <li>• Start date: {dateRange.start || "Not set"}</li>
                <li>• End date: {dateRange.end || "Not set"}</li>
                <li>• Duration: {getDaysInRange()} days</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

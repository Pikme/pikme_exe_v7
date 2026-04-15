import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";

interface AdvancedDateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onPreset?: (days: number) => void;
}

/**
 * Advanced Date Range Filter Component
 * Provides custom date picker, presets, and comparison features
 */
export function AdvancedDateRangeFilter({
  startDate,
  endDate,
  onDateRangeChange,
  onPreset,
}: AdvancedDateRangeFilterProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presets = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 14 days", days: 14 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const handlePresetClick = (days: number, label: string) => {
    setSelectedPreset(label);
    onPreset?.(days);
  };

  const handleApplyCustom = () => {
    if (tempStartDate <= tempEndDate) {
      onDateRangeChange(tempStartDate, tempEndDate);
      setShowCustomPicker(false);
      setSelectedPreset(null);
    }
  };

  const handleReset = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const daysDiff = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Range Display */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Date Range</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {daysDiff} days • {selectedPreset && `${selectedPreset}`}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={showCustomPicker ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCustomPicker(!showCustomPicker)}
              >
                {showCustomPicker ? "Close" : "Custom"}
              </Button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={selectedPreset === preset.label ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset.days, preset.label)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Picker */}
          {showCustomPicker && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={tempStartDate.toISOString().split("T")[0]}
                    onChange={(e) => setTempStartDate(new Date(e.target.value))}
                    max={tempEndDate.toISOString().split("T")[0]}
                    className="w-full"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={tempEndDate.toISOString().split("T")[0]}
                    onChange={(e) => setTempEndDate(new Date(e.target.value))}
                    min={tempStartDate.toISOString().split("T")[0]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyCustom}
                  disabled={tempStartDate > tempEndDate}
                >
                  Apply
                </Button>
              </div>

              {/* Date Range Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  Selected range: <strong>{Math.floor((tempEndDate.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24))} days</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

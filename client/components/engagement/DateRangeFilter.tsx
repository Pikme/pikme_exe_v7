import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onPreset: (days: number) => void;
}

/**
 * Date Range Filter Component
 * Allows users to select preset date ranges or custom ranges
 */
export function DateRangeFilter({ startDate, endDate, onPreset }: DateRangeFilterProps) {
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Current Range Display */}
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
            <span className="text-xs text-slate-500">({daysDiff} days)</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <PresetButton label="7 days" days={7} onClick={() => onPreset(7)} />
            <PresetButton label="14 days" days={14} onClick={() => onPreset(14)} />
            <PresetButton label="30 days" days={30} onClick={() => onPreset(30)} />
            <PresetButton label="90 days" days={90} onClick={() => onPreset(90)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Preset Button Component
 */
function PresetButton({
  label,
  days,
  onClick,
}: {
  label: string;
  days: number;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="text-xs"
    >
      {label}
    </Button>
  );
}

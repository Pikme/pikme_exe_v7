import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RolloutPercentageControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showPresets?: boolean;
  showPreview?: boolean;
}

/**
 * Component for controlling rollout percentage with presets and preview
 */
export function RolloutPercentageControl({
  value,
  onChange,
  disabled = false,
  showPresets = true,
  showPreview = true,
}: RolloutPercentageControlProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue);
    }
  };

  const handleSliderChange = (newValue: number[]) => {
    const numValue = newValue[0];
    setInputValue(numValue.toString());
    onChange(numValue);
  };

  const handlePreset = (percentage: number) => {
    setInputValue(percentage.toString());
    onChange(percentage);
  };

  const presets = [
    { label: "Off", value: 0 },
    { label: "5%", value: 5 },
    { label: "10%", value: 10 },
    { label: "25%", value: 25 },
    { label: "50%", value: 50 },
    { label: "75%", value: 75 },
    { label: "100%", value: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* Input and Slider */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Rollout Percentage
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={inputValue}
                onChange={handleInputChange}
                disabled={disabled}
                className="w-20"
              />
              <span className="flex items-center text-gray-600">%</span>
            </div>
          </div>
        </div>

        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Preset Buttons */}
      {showPresets && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={value === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePreset(preset.value)}
                disabled={disabled}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <RolloutPreview controlPercentage={100 - value} treatmentPercentage={value} />
      )}

      {/* Status */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-grow">
          <p className="text-sm font-medium text-blue-900">
            {value === 0 && "Feature is disabled"}
            {value > 0 && value < 100 && `${value}% of users in treatment group`}
            {value === 100 && "Feature fully rolled out"}
          </p>
        </div>
        <Badge variant={value === 0 ? "outline" : "default"}>
          {value}%
        </Badge>
      </div>
    </div>
  );
}

/**
 * Component showing variant distribution preview
 */
interface RolloutPreviewProps {
  controlPercentage: number;
  treatmentPercentage: number;
  sampleSize?: number;
}

function RolloutPreview({
  controlPercentage,
  treatmentPercentage,
  sampleSize = 1000,
}: RolloutPreviewProps) {
  const controlCount = Math.round((controlPercentage / 100) * sampleSize);
  const treatmentCount = Math.round((treatmentPercentage / 100) * sampleSize);

  const data = [
    {
      name: "Variant",
      Control: controlCount,
      Treatment: treatmentCount,
    },
  ];

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Distribution Preview (out of {sampleSize} users)
      </h4>

      <div className="space-y-3">
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Control" fill="#8b5cf6" />
            <Bar dataKey="Treatment" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-purple-50 border border-purple-200 rounded">
            <p className="text-xs text-purple-600 font-medium">Control</p>
            <p className="text-lg font-bold text-purple-900">
              {controlPercentage}%
            </p>
            <p className="text-xs text-purple-600">{controlCount} users</p>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-600 font-medium">Treatment</p>
            <p className="text-lg font-bold text-blue-900">
              {treatmentPercentage}%
            </p>
            <p className="text-xs text-blue-600">{treatmentCount} users</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Rollout schedule component for gradual rollout
 */
interface RolloutScheduleProps {
  onScheduleChange?: (schedule: RolloutScheduleItem[]) => void;
}

export interface RolloutScheduleItem {
  date: string;
  percentage: number;
}

export function RolloutSchedule({ onScheduleChange }: RolloutScheduleProps) {
  const [schedule, setSchedule] = useState<RolloutScheduleItem[]>([
    { date: new Date().toISOString().split("T")[0], percentage: 0 },
  ]);

  const handleAddStep = () => {
    const lastDate = new Date(schedule[schedule.length - 1].date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);

    setSchedule([
      ...schedule,
      {
        date: nextDate.toISOString().split("T")[0],
        percentage: schedule[schedule.length - 1].percentage,
      },
    ]);
  };

  const handleUpdateStep = (index: number, field: "date" | "percentage", value: string) => {
    const newSchedule = [...schedule];
    if (field === "date") {
      newSchedule[index].date = value;
    } else {
      newSchedule[index].percentage = parseInt(value, 10);
    }
    setSchedule(newSchedule);
    onScheduleChange?.(newSchedule);
  };

  const handleRemoveStep = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
    onScheduleChange?.(newSchedule);
  };

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Gradual Rollout Schedule
      </h4>

      <div className="space-y-2">
        {schedule.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 mb-1">Date</label>
              <Input
                type="date"
                value={item.date}
                onChange={(e) => handleUpdateStep(index, "date", e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-600 mb-1">Rollout %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={item.percentage}
                onChange={(e) => handleUpdateStep(index, "percentage", e.target.value)}
              />
            </div>
            {schedule.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveStep(index)}
                className="text-red-600"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddStep}
        className="mt-3 w-full"
      >
        + Add Step
      </Button>
    </Card>
  );
}

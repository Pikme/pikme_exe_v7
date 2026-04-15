import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStoragePresets, DateRangePreset } from "@/hooks/useLocalStoragePresets";
import { Save, Trash2, Edit2, Clock, TrendingUp, AlertCircle, Plus } from "lucide-react";

interface PresetManagerProps {
  currentStartDate: Date;
  currentEndDate: Date;
  onPresetSelect: (preset: DateRangePreset) => void;
}

/**
 * Preset Manager Component
 * Allows users to save, manage, and load date range presets
 */
export function PresetManager({
  currentStartDate,
  currentEndDate,
  onPresetSelect,
}: PresetManagerProps) {
  const {
    presets,
    error,
    addPreset,
    deletePreset,
    updatePreset,
    incrementUsage,
    getMostUsedPresets,
    getRecentPresets,
  } = useLocalStoragePresets();

  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      setShowError(true);
      return;
    }

    const startStr = currentStartDate.toISOString().split("T")[0];
    const endStr = currentEndDate.toISOString().split("T")[0];

    if (editingId) {
      updatePreset(editingId, {
        name: presetName,
        description: presetDescription,
      });
      setEditingId(null);
    } else {
      addPreset(presetName, startStr, endStr, presetDescription);
    }

    setPresetName("");
    setPresetDescription("");
    setShowError(false);
    setIsOpen(false);
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    incrementUsage(preset.id);
    onPresetSelect(preset);
  };

  const handleDeletePreset = (id: string) => {
    deletePreset(id);
  };

  const mostUsedPresets = getMostUsedPresets(3);
  const recentPresets = getRecentPresets(3);

  return (
    <div className="space-y-4">
      {/* Save Current Range Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 w-full md:w-auto">
            <Save className="w-4 h-4" />
            Save as Preset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Date Range as Preset</DialogTitle>
            <DialogDescription>
              Save your current date range ({formatDate(currentStartDate.toISOString().split("T")[0])} -{" "}
              {formatDate(currentEndDate.toISOString().split("T")[0])}) for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preset Name Input */}
            <div>
              <label className="text-sm font-medium text-slate-700">Preset Name</label>
              <Input
                placeholder="e.g., Last 30 Days, Q1 2026"
                value={presetName}
                onChange={(e) => {
                  setPresetName(e.target.value);
                  setShowError(false);
                }}
                className={showError && !presetName.trim() ? "border-red-500" : ""}
              />
              {showError && !presetName.trim() && (
                <p className="text-xs text-red-600 mt-1">Preset name is required</p>
              )}
            </div>

            {/* Preset Description Input */}
            <div>
              <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
              <Input
                placeholder="e.g., Monthly performance review"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setPresetName("");
                  setPresetDescription("");
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePreset}>
                {editingId ? "Update Preset" : "Save Preset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Most Used Presets */}
      {mostUsedPresets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Most Used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mostUsedPresets.map((preset) => (
              <PresetItem
                key={preset.id}
                preset={preset}
                onSelect={() => handleSelectPreset(preset)}
                onDelete={() => handleDeletePreset(preset.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Presets */}
      {recentPresets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPresets.map((preset) => (
              <PresetItem
                key={preset.id}
                preset={preset}
                onSelect={() => handleSelectPreset(preset)}
                onDelete={() => handleDeletePreset(preset.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Presets */}
      {presets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Presets ({presets.length})</CardTitle>
            <CardDescription>Manage your saved date range presets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {presets.map((preset) => (
                <PresetItem
                  key={preset.id}
                  preset={preset}
                  onSelect={() => handleSelectPreset(preset)}
                  onDelete={() => handleDeletePreset(preset.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {presets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">No presets saved yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Save your current date range to quickly access it later
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual Preset Item Component
 */
interface PresetItemProps {
  preset: DateRangePreset;
  onSelect: () => void;
  onDelete: () => void;
}

function PresetItem({ preset, onSelect, onDelete }: PresetItemProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex-1 min-w-0">
        <button
          onClick={onSelect}
          className="text-left hover:text-blue-600 transition-colors"
        >
          <p className="font-medium text-slate-900 truncate">{preset.name}</p>
          <p className="text-xs text-slate-600 mt-1">
            {formatDate(preset.startDate)} - {formatDate(preset.endDate)}
          </p>
          {preset.description && (
            <p className="text-xs text-slate-500 mt-1 truncate">{preset.description}</p>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs font-medium text-slate-600">{preset.usageCount}</p>
          <p className="text-xs text-slate-500">uses</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSelect}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Select
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default PresetManager;

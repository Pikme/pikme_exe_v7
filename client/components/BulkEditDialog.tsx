import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Array<{ id: number; name: string }>;
  onConfirm: (updates: {
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function BulkEditDialog({
  open,
  onOpenChange,
  locations,
  onConfirm,
  isLoading = false,
}: BulkEditDialogProps) {
  const [updates, setUpdates] = useState({
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const [selectedFields, setSelectedFields] = useState({
    description: false,
    metaTitle: false,
    metaDescription: false,
    metaKeywords: false,
  });

  const [error, setError] = useState<string | null>(null);

  const handleFieldToggle = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdateChange = (
    field: keyof typeof updates,
    value: string
  ) => {
    setUpdates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirm = async () => {
    setError(null);

    // Check if at least one field is selected
    if (!Object.values(selectedFields).some((v) => v)) {
      setError("Please select at least one field to update");
      return;
    }

    try {
      // Build the updates object with only selected fields
      const fieldsToUpdate: any = {};
      if (selectedFields.description) {
        fieldsToUpdate.description = updates.description;
      }
      if (selectedFields.metaTitle) {
        fieldsToUpdate.metaTitle = updates.metaTitle;
      }
      if (selectedFields.metaDescription) {
        fieldsToUpdate.metaDescription = updates.metaDescription;
      }
      if (selectedFields.metaKeywords) {
        fieldsToUpdate.metaKeywords = updates.metaKeywords;
      }

      await onConfirm(fieldsToUpdate);

      // Reset form on success
      setUpdates({
        description: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      });
      setSelectedFields({
        description: false,
        metaTitle: false,
        metaDescription: false,
        metaKeywords: false,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update locations");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Edit Locations</DialogTitle>
          <DialogDescription>
            Update fields for {locations.length} selected location
            {locations.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Affected Locations Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Affected Locations</Label>
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {locations.map((loc) => (
                    <div key={loc.id} className="text-sm text-gray-600">
                      • {loc.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Edit Fields */}
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="description"
                  checked={selectedFields.description}
                  onCheckedChange={() => handleFieldToggle("description")}
                />
                <Label htmlFor="description" className="font-semibold cursor-pointer">
                  Description
                </Label>
              </div>
              <Textarea
                placeholder="Enter description for all selected locations"
                value={updates.description}
                onChange={(e) => handleUpdateChange("description", e.target.value)}
                disabled={!selectedFields.description}
                className="min-h-24"
              />
              <p className="text-xs text-gray-500">
                Leave empty to clear descriptions
              </p>
            </div>

            {/* Meta Title */}
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="metaTitle"
                  checked={selectedFields.metaTitle}
                  onCheckedChange={() => handleFieldToggle("metaTitle")}
                />
                <Label htmlFor="metaTitle" className="font-semibold cursor-pointer">
                  Meta Title (SEO)
                </Label>
              </div>
              <Input
                placeholder="Enter meta title"
                value={updates.metaTitle}
                onChange={(e) => handleUpdateChange("metaTitle", e.target.value)}
                disabled={!selectedFields.metaTitle}
                maxLength={160}
              />
              <p className="text-xs text-gray-500">
                {updates.metaTitle.length}/160 characters
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="metaDescription"
                  checked={selectedFields.metaDescription}
                  onCheckedChange={() => handleFieldToggle("metaDescription")}
                />
                <Label htmlFor="metaDescription" className="font-semibold cursor-pointer">
                  Meta Description (SEO)
                </Label>
              </div>
              <Textarea
                placeholder="Enter meta description"
                value={updates.metaDescription}
                onChange={(e) =>
                  handleUpdateChange("metaDescription", e.target.value)
                }
                disabled={!selectedFields.metaDescription}
                maxLength={160}
                className="min-h-20"
              />
              <p className="text-xs text-gray-500">
                {updates.metaDescription.length}/160 characters
              </p>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="metaKeywords"
                  checked={selectedFields.metaKeywords}
                  onCheckedChange={() => handleFieldToggle("metaKeywords")}
                />
                <Label htmlFor="metaKeywords" className="font-semibold cursor-pointer">
                  Meta Keywords (SEO)
                </Label>
              </div>
              <Textarea
                placeholder="Enter keywords separated by commas"
                value={updates.metaKeywords}
                onChange={(e) =>
                  handleUpdateChange("metaKeywords", e.target.value)
                }
                disabled={!selectedFields.metaKeywords}
                className="min-h-20"
              />
              <p className="text-xs text-gray-500">
                Separate keywords with commas
              </p>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only selected fields will be updated. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !Object.values(selectedFields).some((v) => v)}
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update {locations.length} Location
            {locations.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

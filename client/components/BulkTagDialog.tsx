import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, X, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { TagSuggestionsPanel } from "./TagSuggestionsPanel";
import { useState } from "react";

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLocationIds: number[];
  selectedLocationNames: string[];
  onTagsAssigned: () => void;
}

export function BulkTagDialog({
  open,
  onOpenChange,
  selectedLocationIds,
  selectedLocationNames,
  onTagsAssigned,
}: BulkTagDialogProps) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionDescription, setSuggestionDescription] = useState("");

  // Fetch all available tags
  const { data: allTags = [] } = trpc.locations.listAllTags.useQuery();

  // Create new tag mutation
  const createTagMutation = trpc.locations.createTag.useMutation();

  // Assign tags mutation
  const assignTagsMutation = trpc.locations.bulkAssignTags.useMutation({
    onSuccess: () => {
      onTagsAssigned();
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedTags([]);
    setNewTagName("");
    setNewTagColor("#3B82F6");
    setIsCreatingTag(false);
    onOpenChange(false);
  };

  const handleToggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await createTagMutation.mutateAsync({
        name: newTagName,
        color: newTagColor,
      });
      setNewTagName("");
      setNewTagColor("#3B82F6");
      setIsCreatingTag(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleAssignTags = async () => {
    if (selectedTags.length === 0) return;

    try {
      await assignTagsMutation.mutateAsync({
        locationIds: selectedLocationIds,
        tagIds: selectedTags,
      });
    } catch (error) {
      console.error("Failed to assign tags:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tags for {selectedLocationIds.length} Location(s)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Affected Locations */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Affected Locations</h3>
            <div className="max-h-24 overflow-y-auto border rounded-lg p-3 bg-muted/50">
              <div className="space-y-1">
                {selectedLocationNames.map((name, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Available Tags */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Available Tags</h3>
            {allTags.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/50">
                {allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-background/50 p-2 rounded"
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                    />
                    <Badge
                      style={{ backgroundColor: tag.color || "#3B82F6" }}
                      className="text-white"
                    >
                      {tag.name}
                    </Badge>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50">
                No tags available. Create one below.
              </div>
            )}
          </div>

          {/* AI Tag Suggestions */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI-Powered Suggestions
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? "Hide" : "Show"}
              </Button>
            </div>
            {showSuggestions && (
              <div className="space-y-3">
                <Input
                  placeholder="Paste location description here for AI tag suggestions..."
                  value={suggestionDescription}
                  onChange={(e) => setSuggestionDescription(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Create New Tag */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Create New Tag</h3>
            {!isCreatingTag ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingTag(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Tag
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                    className="flex-1"
                  >
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingTag(false);
                      setNewTagName("");
                      setNewTagColor("#3B82F6");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Selected tags will be assigned to all {selectedLocationIds.length} location(s).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignTags}
              disabled={selectedTags.length === 0 || assignTagsMutation.isPending}
            >
              {assignTagsMutation.isPending ? "Assigning..." : `Assign ${selectedTags.length} Tag(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

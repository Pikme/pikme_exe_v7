import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, X, Edit, Tag } from "lucide-react";
import { useState } from "react";

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onTags?: () => void;
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onEdit,
  onTags,
  isLoading = false,
}: BulkActionToolbarProps) {
  const [isSelectAll, setIsSelectAll] = useState(false);

  const handleSelectAllChange = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      onSelectAll();
    } else {
      onDeselectAll();
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 bg-blue-50 border-b-2 border-blue-200 px-4 py-3 flex items-center justify-between gap-4 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelectAll}
          onCheckedChange={handleSelectAllChange}
          aria-label="Select all locations"
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} of {totalCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
          disabled={isLoading}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Clear Selection
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading || selectedCount === 0}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Selected
          </Button>
        )}
        {onTags && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTags}
            disabled={isLoading || selectedCount === 0}
            className="gap-2"
          >
            <Tag className="w-4 h-4" />
            Manage Tags
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isLoading || selectedCount === 0}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}

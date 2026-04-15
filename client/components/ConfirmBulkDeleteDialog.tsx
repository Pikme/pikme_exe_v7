import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface Location {
  id: number;
  name: string;
}

interface ConfirmBulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmBulkDeleteDialog({
  open,
  onOpenChange,
  locations,
  onConfirm,
  isLoading = false,
}: ConfirmBulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {locations.length} Locations?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The following locations will be permanently deleted:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete {locations.length} location{locations.length !== 1 ? "s" : ""}. This cannot be reversed.
            </AlertDescription>
          </Alert>

          <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            <ul className="space-y-2">
              {locations.map((location) => (
                <li key={location.id} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{location.name}</span>
                </li>
              ))}
            </ul>
          </div>
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
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete {locations.length} Location{locations.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

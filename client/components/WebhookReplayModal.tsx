import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";

interface WebhookReplayModalProps {
  isOpen: boolean;
  eventIds: string[];
  onClose: () => void;
  onConfirm: (data: ReplayConfirmData) => Promise<void>;
}

interface ReplayConfirmData {
  eventIds: string[];
  reason: string;
  priority: "low" | "normal" | "high";
  dryRun: boolean;
}

export function WebhookReplayModal({
  isOpen,
  eventIds,
  onClose,
  onConfirm,
}: WebhookReplayModalProps) {
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [dryRun, setDryRun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    batchId?: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the replay");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        eventIds,
        reason,
        priority,
        dryRun,
      });

      setResult({
        success: true,
        message: dryRun
          ? `Would replay ${eventIds.length} events`
          : `Successfully queued ${eventIds.length} events for replay`,
        batchId: `batch-${Date.now()}`,
      });

      // Reset form after success
      setTimeout(() => {
        setReason("");
        setPriority("normal");
        setDryRun(false);
        setResult(null);
        onClose();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to replay events",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setPriority("normal");
      setDryRun(false);
      setResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Replay Webhook Events
          </DialogTitle>
          <DialogDescription>
            Re-trigger {eventIds.length} failed webhook event{eventIds.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <Alert className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={result.success ? "text-green-800 font-medium" : "text-red-800 font-medium"}>
                    {result.success ? "Success" : "Error"}
                  </p>
                  <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.message}
                  </AlertDescription>
                  {result.batchId && (
                    <p className="text-xs mt-2 font-mono text-green-700">
                      Batch ID: {result.batchId}
                    </p>
                  )}
                </div>
              </div>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Event Count Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  <strong>{eventIds.length}</strong> event{eventIds.length !== 1 ? "s" : ""} will be replayed
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Replay *</label>
                <Textarea
                  placeholder="Explain why these events are being replayed (e.g., 'Provider was temporarily down', 'Manual retry requested')"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Process when available</SelectItem>
                    <SelectItem value="normal">Normal - Standard processing</SelectItem>
                    <SelectItem value="high">High - Process immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dry Run */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Checkbox
                  id="dryRun"
                  checked={dryRun}
                  onCheckedChange={(checked) => setDryRun(checked as boolean)}
                  disabled={isLoading}
                />
                <label htmlFor="dryRun" className="text-sm cursor-pointer flex-1">
                  <span className="font-medium">Dry Run</span>
                  <p className="text-xs text-muted-foreground">
                    Simulate the replay without actually processing events
                  </p>
                </label>
              </div>

              {/* Warning */}
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  Replaying events will re-trigger webhook processing. Ensure the receiving endpoints can handle duplicate events.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading || !reason.trim()}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Processing..." : "Confirm Replay"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

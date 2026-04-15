import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  Download,
  Trash2,
} from "lucide-react";

interface RollbackPreview {
  totalRecords: number;
  toDelete: number;
  toRestore: number;
  cannotRestore: number;
  details: any[];
}

export function RollbackManager({ importLogId }: { importLogId: number }) {
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<RollbackPreview | null>(null);

  // Fetch preview
  const previewMutation = trpc.rollback.previewRollback.useMutation({
    onSuccess: (data) => {
      setPreview(data);
      setIsPreviewOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Execute rollback
  const rollbackMutation = trpc.rollback.executeRollback.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Rollback Completed",
        description: `${data.successfulRollbacks} successful, ${data.failedRollbacks} failed`,
      });
      setIsConfirmOpen(false);
      setReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    previewMutation.mutate({ importLogId });
  };

  const handleRollback = () => {
    rollbackMutation.mutate({
      importLogId,
      reason: reason || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      {/* Rollback Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={previewMutation.isPending}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview Rollback
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsConfirmOpen(true)}
          disabled={rollbackMutation.isPending}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Execute Rollback
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rollback Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">Total Records</p>
                    <p className="text-2xl font-bold">{preview.totalRecords}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">To Delete</p>
                    <p className="text-2xl font-bold text-red-600">{preview.toDelete}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">To Restore</p>
                    <p className="text-2xl font-bold text-blue-600">{preview.toRestore}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">Cannot Restore</p>
                    <p className="text-2xl font-bold text-orange-600">{preview.cannotRestore}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <div>
                <h3 className="font-medium mb-2">Detailed Changes</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Record ID</th>
                        <th className="text-left py-2 px-2">Action</th>
                        <th className="text-left py-2 px-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.details.map((detail, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-2">{detail.recordId}</td>
                          <td className="py-2 px-2">
                            <Badge variant={
                              detail.action === "create" ? "destructive" :
                              detail.action === "update" ? "secondary" :
                              "outline"
                            }>
                              {detail.action}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 capitalize">{detail.entityType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Warning</p>
                  <p>This action will permanently revert the changes from this import. This cannot be undone.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Critical Action</p>
                <p>You are about to rollback this import. This will permanently revert all changes.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rollback..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRollback}
                disabled={rollbackMutation.isPending}
              >
                {rollbackMutation.isPending ? "Rolling back..." : "Confirm Rollback"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

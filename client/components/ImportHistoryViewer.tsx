import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface ImportLog {
  id: number;
  userId: number;
  fileName: string;
  importType: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: any[];
  status: string;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export function ImportHistoryViewer() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [importType, setImportType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<ImportLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const offset = (page - 1) * limit;

  // Fetch import logs
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = trpc.importHistory.listAll.useQuery({
    importType: importType || undefined,
    status: status || undefined,
    limit,
    offset,
  });

  // Fetch count
  const { data: count } = trpc.importHistory.countAll.useQuery({
    importType: importType || undefined,
    status: status || undefined,
  });

  // Fetch statistics
  const { data: stats } = trpc.importHistory.getStatistics.useQuery({});

  // Delete mutation
  const deleteMutation = trpc.importHistory.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Import log deleted successfully",
      });
      refetchLogs();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = trpc.importHistory.exportAsJSON.useMutation({
    onSuccess: (data) => {
      const json = JSON.stringify(data.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `import-history-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: `Exported ${data.count} import logs`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalPages = count ? Math.ceil(count / limit) : 1;

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline",
    };
    return variants[status] || "outline";
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Import History</h2>
          <p className="text-gray-600 mt-1">Track all CSV imports and view detailed logs</p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportMutation.mutate({})}
          disabled={exportMutation.isPending}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Imports</p>
              <p className="text-3xl font-bold">{stats.totalImports}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Records</p>
              <p className="text-3xl font-bold">{stats.totalRecords}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.successfulRecords}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failedRecords}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={importType} onValueChange={setImportType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="tours">Tours</SelectItem>
            <SelectItem value="locations">Locations</SelectItem>
            <SelectItem value="flights">Flights</SelectItem>
            <SelectItem value="activities">Activities</SelectItem>
            <SelectItem value="attractions">Attractions</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Import Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No import logs found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">File Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">Records</th>
                      <th className="text-center py-3 px-4 font-medium">Success</th>
                      <th className="text-center py-3 px-4 font-medium">Failed</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-center py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: ImportLog) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{log.fileName}</td>
                        <td className="py-3 px-4 capitalize text-sm">{log.importType}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <Badge variant={getStatusBadge(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">{log.totalRecords}</td>
                        <td className="py-3 px-4 text-center text-sm text-green-600 font-medium">
                          {log.successfulRecords}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-red-600 font-medium">
                          {log.failedRecords}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this import log?")) {
                                  deleteMutation.mutate({ id: log.id });
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({count} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="font-medium">{selectedLog.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{selectedLog.importType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedLog.status)}
                    <Badge variant={getStatusBadge(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">Total Records</p>
                    <p className="text-2xl font-bold">{selectedLog.totalRecords}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedLog.successfulRecords}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedLog.failedRecords}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Errors */}
              {selectedLog.errors && selectedLog.errors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Errors ({selectedLog.errors.length})
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {selectedLog.errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          <strong>Row {error.row}:</strong> {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

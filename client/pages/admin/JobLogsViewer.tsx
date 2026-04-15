import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Search, Download, Trash2 } from "lucide-react";

/**
 * Job Logs Viewer
 * View and filter job execution logs with detailed information
 */
export default function JobLogsViewer() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [queueFilter, setQueueFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch job logs
  const { data: logsResponse, isLoading: logsLoading, refetch: refetchLogs } =
    trpc.jobMonitoring.getJobLogs.useQuery(
      {
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        queue: queueFilter === "all" ? undefined : queueFilter,
        searchQuery: searchQuery || undefined,
      },
      { enabled: true }
    );

  // Cleanup old logs mutation
  const cleanupMutation = trpc.jobMonitoring.cleanupOldLogs.useMutation();

  const handleCleanup = async () => {
    if (confirm("Are you sure you want to delete logs older than 30 days?")) {
      await cleanupMutation.mutateAsync({ daysOld: 30 });
      refetchLogs();
    }
  };

  const handleExportLogs = () => {
    if (!logsResponse?.logs) return;

    const csv = [
      ["ID", "Queue", "Job Type", "Status", "Duration (ms)", "Created At", "Error Message"],
      ...logsResponse.logs.map((log: any) => [
        log.id,
        log.queue,
        log.jobType,
        log.status,
        log.duration || "",
        new Date(log.createdAt).toISOString(),
        log.errorMessage || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "running":
        return <Badge className="bg-red-500">Running</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getQueueBadge = (queue: string) => {
    const colors: { [key: string]: string } = {
      "report-generation": "bg-purple-100 text-purple-800",
      "email-delivery": "bg-red-100 text-red-800",
      "schedule-executor": "bg-green-100 text-green-800",
    };
    return <Badge className={colors[queue] || "bg-gray-100 text-gray-800"}>{queue}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Execution Logs</h1>
          <p className="text-gray-600 mt-1">View and analyze job execution history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportLogs} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={handleCleanup} variant="destructive" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Cleanup Old Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Queue</label>
              <Select value={queueFilter} onValueChange={(value) => {
                setQueueFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Queues</SelectItem>
                  <SelectItem value="report-generation">Report Generation</SelectItem>
                  <SelectItem value="email-delivery">Email Delivery</SelectItem>
                  <SelectItem value="schedule-executor">Schedule Executor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Per Page</label>
              <Select value={limit.toString()} onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>
            Showing {logsResponse?.logs?.length || 0} of {logsResponse?.total || 0} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-600">Loading logs...</p>
            </div>
          ) : logsResponse?.logs && logsResponse.logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Queue</th>
                    <th className="text-left py-3 px-4 font-semibold">Job Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold">Created At</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logsResponse.logs.map((log: any) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs">{log.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4">{getQueueBadge(log.queue)}</td>
                      <td className="py-3 px-4">{log.jobType}</td>
                      <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                      <td className="py-3 px-4">{log.duration ? `${log.duration}ms` : "-"}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No logs found</p>
            </div>
          )}

          {/* Pagination */}
          {logsResponse && logsResponse.total > limit && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Page {page} of {Math.ceil(logsResponse.total / limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(logsResponse.total / limit)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Card className="border-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Log Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p>{getStatusBadge(selectedLog.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Queue</p>
                  <p>{getQueueBadge(selectedLog.queue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Job Type</p>
                  <p className="font-medium">{selectedLog.jobType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{selectedLog.duration ? `${selectedLog.duration}ms` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">Error Message</p>
                  <p className="text-sm text-red-800 font-mono">{selectedLog.errorMessage}</p>
                </div>
              )}

              {selectedLog.metadata && (
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Metadata</p>
                  <pre className="text-xs overflow-auto max-h-48 text-gray-800">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

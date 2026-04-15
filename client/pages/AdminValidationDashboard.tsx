import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Play,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminValidationDashboard() {
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Queries
  const logsQuery = trpc.validation.listLogs.useQuery({
    page,
    limit: 10,
    status: filterStatus !== "all" ? (filterStatus as any) : undefined,
    validationType: filterType !== "all" ? (filterType as any) : undefined,
  });

  const statsQuery = trpc.validation.getStats.useQuery({ days: 30 });

  const issuesQuery = trpc.validation.getIssues.useQuery(
    { logId: selectedLogId || 0 },
    { enabled: !!selectedLogId }
  );

  // Mutations
  const runValidationMutation = trpc.validation.runValidation.useMutation({
    onSuccess: () => {
      logsQuery.refetch();
      alert("Validation job started successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const exportReportMutation = trpc.validation.exportReport.useMutation({
    onSuccess: (data: any) => {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/${data.format};charset=utf-8,${encodeURIComponent(data.data)}`
      );
      element.setAttribute("download", data.filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-red-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "processing":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <AdminLayout title="ValidationDashboard">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Validation</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage data integrity across all entities
          </p>
        </div>
        <Button
          onClick={() => runValidationMutation.mutate({})}
          disabled={runValidationMutation.isPending}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {runValidationMutation.isPending ? "Running..." : "Run Validation"}
        </Button>
      </div>

      {/* Statistics Cards */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Validations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.data.totalValidations}
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.data.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {statsQuery.data.completedValidations} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsQuery.data.totalIssues}
              </div>
              <p className="text-xs text-gray-500 mt-1">Found and logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Execution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(statsQuery.data.averageExecutionTime / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-gray-500 mt-1">Per validation</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Validation Type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="attractions">Attractions</SelectItem>
              <SelectItem value="tours">Tours</SelectItem>
              <SelectItem value="locations">Locations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Validation History</CardTitle>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : logsQuery.data && logsQuery.data.length > 0 ? (
            <div className="space-y-2">
              {logsQuery.data.map((log: any) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${getStatusColor(log.status)} ${
                    selectedLogId === log.id ? "ring-2 ring-red-500" : ""
                  }`}
                  onClick={() => setSelectedLogId(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">
                          {log.validationType.charAt(0).toUpperCase() +
                            log.validationType.slice(1)}{" "}
                          Validation
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{log.status}</Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        Valid: {log.validRecords} | Invalid: {log.invalidRecords}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No validation logs found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues Details */}
      {selectedLogId && issuesQuery.data && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Validation Issues</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportReportMutation.mutate({ logId: selectedLogId, format: "json" })
              }
              disabled={exportReportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </CardHeader>
          <CardContent>
            {issuesQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Entity</th>
                      <th className="text-left py-2 px-2">Field</th>
                      <th className="text-left py-2 px-2">Severity</th>
                      <th className="text-left py-2 px-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuesQuery.data.map((issue: any) => (
                      <tr key={issue.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {issue.entityType} #{issue.entityId}
                        </td>
                        <td className="py-2 px-2">{issue.field || "N/A"}</td>
                        <td className="py-2 px-2">
                          <Badge
                            variant={
                              issue.severity === "error"
                                ? "destructive"
                                : issue.severity === "warning"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">{issue.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No issues found for this validation
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
}

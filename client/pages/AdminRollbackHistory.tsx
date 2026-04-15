import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/AdminLayout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Eye,
  Filter,
  Search,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
} from "lucide-react";

export function AdminRollbackHistory() {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch rollback logs
  const { data: logsData, isLoading: logsLoading } = trpc.rollback.listLogs.useQuery({
    status: filterStatus !== "all" ? (filterStatus as any) : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const { data: countData } = trpc.rollback.countLogs.useQuery({
    status: filterStatus !== "all" ? (filterStatus as any) : undefined,
  });

  const { data: statsData } = trpc.rollback.getStatistics.useQuery({});

  // Delete log mutation
  const deleteLogMutation = trpc.rollback.deleteLog.useMutation({
    onSuccess: () => {
      alert("Rollback log deleted successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Export mutation
  const exportMutation = trpc.rollback.exportHistory.useMutation({
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rollback-history-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Rollback history exported successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Filter logs by search ID
  const filteredLogs = useMemo(() => {
    if (!logsData) return [];
    if (!searchId) return logsData;
    return logsData.filter((log) =>
      log.importLogId.toString().includes(searchId)
    );
  }, [logsData, searchId]);

  // Prepare chart data
  const successRateData = statsData
    ? [
        {
          name: "Successful",
          value: statsData.successfulRecords || 0,
          fill: "#10b981",
        },
        {
          name: "Failed",
          value: statsData.failedRecords || 0,
          fill: "#ef4444",
        },
      ]
    : [];

  const totalRecords = successRateData.reduce((sum, item) => sum + item.value, 0);
  const successRate =
    totalRecords > 0
      ? Math.round((successRateData[0].value / totalRecords) * 100)
      : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this rollback log?")) {
      deleteLogMutation.mutate({ id });
    }
  };

  const handleExport = () => {
    exportMutation.mutate({
      status: filterStatus !== "all" ? (filterStatus as any) : undefined,
    });
  };

  const totalPages = countData ? Math.ceil(countData / pageSize) : 1;

  return (
    <AdminLayout title="RollbackHistory">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rollback History</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all CSV import rollback operations
          </p>
        </div>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rollbacks</p>
                <p className="text-3xl font-bold">{statsData?.totalRollbacks || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Records</p>
                <p className="text-3xl font-bold">{statsData?.totalRecords || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsData?.successfulRecords || 0}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {statsData?.failedRecords || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              {totalRecords > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={successRateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {successRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Rollback Operations</span>
                <span className="font-bold text-lg">
                  {statsData?.totalRollbacks || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Records Processed</span>
                <span className="font-bold text-lg">
                  {statsData?.totalRecords || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Successful Records</span>
                <span className="font-bold text-lg text-green-600">
                  {statsData?.successfulRecords || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Failed Records</span>
                <span className="font-bold text-lg text-red-600">
                  {statsData?.failedRecords || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Search by Import Log ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter import log ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rollback History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rollback Operations</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading rollback history...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No rollback operations found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Import ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Records
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Success Rate
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => {
                      const successRate =
                        log.totalRollbacks > 0
                          ? Math.round(
                              (log.successfulRollbacks / log.totalRollbacks) * 100
                            )
                          : 0;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            #{log.importLogId}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <Badge className={getStatusColor(log.status)}>
                                {log.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-medium">
                              {log.totalRollbacks}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({log.successfulRollbacks}✓ {log.failedRollbacks}✗)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`font-medium ${
                                successRate >= 80
                                  ? "text-green-600"
                                  : successRate >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {successRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(log)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(log.id)}
                                disabled={deleteLogMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, countData || 0)} of {countData || 0}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
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
            <DialogTitle>Rollback Details - Import #{selectedLog?.importLogId}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <Badge className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="font-medium text-lg">{selectedLog.totalRollbacks}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="font-medium text-lg text-green-600">
                    {Math.round(
                      (selectedLog.successfulRollbacks / selectedLog.totalRollbacks) * 100
                    )}
                    %
                  </p>
                </div>
              </div>

              {/* Records Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium mb-2">Records Summary</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedLog.successfulRollbacks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedLog.failedRollbacks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">
                      {selectedLog.totalRollbacks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {selectedLog.errors && selectedLog.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-900 mb-2">Errors ({selectedLog.errors.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedLog.errors.map((error: any, idx: number) => (
                      <div key={idx} className="bg-white p-2 rounded border border-red-200">
                        <p className="text-sm font-medium text-red-800">
                          Record #{error.rollbackId}
                        </p>
                        <p className="text-sm text-red-700">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason */}
              {selectedLog.reason && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-900 mb-2">Reason</p>
                  <p className="text-sm text-yellow-800">{selectedLog.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}

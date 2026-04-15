import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Loader2, Eye, BarChart3, Settings, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { AuditLogDetailsModal } from "@/components/AuditLogDetailsModal";
import { AuditLogTimeline } from "@/components/AuditLogTimeline";
import { AuditLogSettingsModal, type AuditLogSettings } from "@/components/AuditLogSettingsModal";
import { AuditLogAnalytics } from "@/components/AuditLogAnalytics";
import { AnalyticsDateRangePicker } from "@/components/AnalyticsDateRangePicker";
import { downloadAuditLogPDF, type AuditLogForPDF } from "@/lib/audit-log-pdf";
import { downloadAuditReport, type AuditReportData } from "@/lib/audit-report-pdf";
import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 50;
const STORAGE_KEY = "auditLogViewMode";

type ViewMode = "table" | "timeline" | "analytics";

export default function AdminAuditLog() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLogsForModal, setUserLogsForModal] = useState<any[]>([]);
  const [isLoadingUserLogs, setIsLoadingUserLogs] = useState(false);
  const [entityLogsForModal, setEntityLogsForModal] = useState<any[]>([]);
  const [isLoadingEntityLogs, setIsLoadingEntityLogs] = useState(false);
  const { data: analyticsQueryData, isLoading: analyticsLoading } = trpc.dashboard.getAuditAnalytics.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { enabled: false }
  );

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "table";
    const saved = localStorage.getItem("auditLogViewMode");
    return (saved as ViewMode) || "table";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [settings, setSettings] = useState<AuditLogSettings | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("auditLogSettings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to load audit log settings:", error);
        }
      }
    }
  }, []);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("auditLogViewMode", viewMode);
  }, [viewMode]);

  const handleSettingsSave = (newSettings: AuditLogSettings) => {
    setSettings(newSettings);
    // Apply default view mode if changed
    if (newSettings.defaultViewMode && newSettings.defaultViewMode !== viewMode) {
      setViewMode(newSettings.defaultViewMode);
    }
    toast({
      title: "Settings Saved",
      description: "Your audit log preferences have been updated.",
    });
  };

  // Parse date range
  const startDate = dateRange.start ? new Date(dateRange.start) : undefined;
  const endDate = dateRange.end ? new Date(dateRange.end) : undefined;

  // Fetch audit logs with filters
  const { data: auditLogs, isLoading, error, refetch } = trpc.dashboard.getAuditLogs.useQuery({
    limit: ITEMS_PER_PAGE,
    offset: currentPage * ITEMS_PER_PAGE,
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    startDate,
    endDate,
  });

  // Fetch total count for pagination
  const { data: totalCount = 0 } = trpc.dashboard.getAuditLogCount.useQuery({
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    startDate,
    endDate,
  });

  // Filter logs by search term (client-side)
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [auditLogs, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csv = await trpc.dashboard.exportAuditLogs.query({
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        startDate,
        endDate,
      });

      if (csv && csv.length > 0) {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Audit logs exported successfully",
        });
      } else {
        toast({
          title: "No Data",
          description: "No audit logs to export",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No Data",
        description: "No audit logs to export",
        variant: "default",
      });
      return;
    }

    try {
      setIsExporting(true);
      const pdfLogs: AuditLogForPDF[] = filteredLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId || "",
        userId: log.userId,
        userName: log.userName,
        timestamp: new Date(log.timestamp),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        previousData: log.previousData,
        newData: log.newData,
        description: log.description,
      }));

      const filename = `audit-logs-${new Date().toISOString().split("T")[0]}.pdf`;
      downloadAuditLogPDF(pdfLogs, filename, {
        title: "Audit Log Report",
        includeMetadata: true,
        dateRange: dateRange,
      });

      toast({
        title: "Success",
        description: `PDF exported successfully (${filteredLogs.length} records)`,
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setCurrentPage(0);
  };

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    handleFilterChange();
  };

  const handleEntityTypeFilterChange = (value: string) => {
    setEntityTypeFilter(value);
    handleFilterChange();
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    handleFilterChange();
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-red-100 text-red-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "export":
        return "bg-purple-100 text-purple-800";
      case "import":
        return "bg-orange-100 text-orange-800";
      case "view":
        return "bg-gray-100 text-gray-800";
      case "login":
        return "bg-indigo-100 text-indigo-800";
      case "logout":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEntityTypeBadgeColor = (entityType: string) => {
    switch (entityType) {
      case "tour":
        return "bg-indigo-100 text-indigo-800";
      case "location":
        return "bg-cyan-100 text-cyan-800";
      case "category":
        return "bg-amber-100 text-amber-800";
      case "activity":
        return "bg-pink-100 text-pink-800";
      case "attraction":
        return "bg-rose-100 text-rose-800";
      case "user":
        return "bg-violet-100 text-violet-800";
      case "system":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout
      title="Audit Log"
      description="Track all admin actions for accountability and compliance"
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Audit Log" }]}
    >
      <div className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Search</label>
                <Input
                  placeholder="Search by user or entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Action</label>
                <Select value={actionFilter} onValueChange={handleActionFilterChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Entity Type</label>
                <Select value={entityTypeFilter} onValueChange={handleEntityTypeFilterChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="attraction">Attraction</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange("start", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                disabled={isExporting || filteredLogs.length === 0}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                disabled={isExporting || filteredLogs.length === 0}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("table")}
            variant={viewMode === "table" ? "default" : "outline"}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Table View
          </Button>
          <Button
            onClick={() => setViewMode("timeline")}
            variant={viewMode === "timeline" ? "default" : "outline"}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Timeline View
          </Button>
          <Button
            onClick={() => setViewMode("analytics")}
            variant={viewMode === "analytics" ? "default" : "outline"}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <AuditLogTimeline
            events={filteredLogs}
            isLoading={isLoading}
            onEventClick={(event) => {
              setSelectedLog(event);
              setIsModalOpen(true);
            }}
          />
        )}

        {/* Audit Logs Table */}
        {viewMode === "table" && (
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `Total: ${totalCount} entries (Page ${currentPage + 1} of ${totalPages || 1})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading audit logs: {error.message}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No audit logs found matching your filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">User</th>
                        <th className="text-left py-3 px-4 font-semibold">Action</th>
                        <th className="text-left py-3 px-4 font-semibold">Entity Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Entity Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                        <th className="text-left py-3 px-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{log.userName}</p>
                              <p className="text-xs text-gray-500">{log.userEmail || "N/A"}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                              {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEntityTypeBadgeColor(log.entityType)}`}>
                              {log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{log.entityName || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                setSelectedLog(log);
                                setIsModalOpen(true);
                                // Fetch all logs for this user
                                setIsLoadingUserLogs(true);
                                try {
                                  const userLogs = await trpc.dashboard.getAuditLogsByUser.query({
                                    userId: log.userId,
                                    limit: 100,
                                  });
                                  setUserLogsForModal(userLogs);
                                } catch (error) {
                                  console.error("Error fetching user logs:", error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to fetch user logs",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsLoadingUserLogs(false);
                                }
                              }}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {filteredLogs.length > 0 ? currentPage * ITEMS_PER_PAGE + 1 : 0} to{" "}
                    {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={!hasPrevPage || isLoading}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((p) => (hasNextPage ? p + 1 : p))}
                      disabled={!hasNextPage || isLoading}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        )}

        {/* Audit Log Details Modal */}
        <AuditLogDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLog(null);
            setUserLogsForModal([]);
            setEntityLogsForModal([]);
          }}
          auditLog={selectedLog}
          onSelectLog={setSelectedLog}
          userLogs={userLogsForModal}
          entityLogs={entityLogsForModal}
          onFilterByEntity={async (entityType, entityId) => {
            setIsLoadingEntityLogs(true);
            try {
              const logs = await trpc.dashboard.getAuditLogsByEntity.query({
                entityType,
                entityId: entityId || 0,
                limit: 100,
              });
              setEntityLogsForModal(logs);
            } catch (error) {
              console.error("Error fetching entity logs:", error);
              toast({
                title: "Error",
                description: "Failed to fetch entity logs",
                variant: "destructive",
              });
            } finally {
              setIsLoadingEntityLogs(false);
            }
          }}
        />

        {/* Analytics View */}
        {viewMode === "analytics" && (
          <>
            <AnalyticsDateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audit Log Analytics</CardTitle>
                    <CardDescription>
                      Visual insights into audit log activity and trends
                    </CardDescription>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!analyticsQueryData || !filteredLogs) {
                        toast({
                          title: "Error",
                          description: "Please load analytics data first",
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        const reportData: AuditReportData = {
                          analytics: analyticsQueryData,
                          auditLogs: filteredLogs.map(log => ({
                            id: log.id?.toString() || '',
                            userId: log.userId,
                            userName: log.userName,
                            action: log.action,
                            entityType: log.entityType,
                            entityId: log.entityId?.toString() || '',
                            entityName: log.entityName || '',
                            status: log.status,
                            createdAt: log.createdAt,
                            ipAddress: log.ipAddress,
                            userAgent: log.userAgent,
                          })),
                        };
                        downloadAuditReport(reportData);
                        toast({
                          title: "Success",
                          description: "Audit report downloaded successfully",
                        });
                      } catch (error) {
                        console.error("Error generating report:", error);
                        toast({
                          title: "Error",
                          description: "Failed to generate audit report",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsQueryData ? (
                <AuditLogAnalytics
                  data={analyticsQueryData}
                  isLoading={analyticsLoading}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <Button
                    onClick={async () => {
                      setIsLoadingAnalytics(true);
                      try {
                        const data = await trpc.dashboard.getAuditAnalytics.query({
                          startDate: dateRange.start,
                          endDate: dateRange.end,
                        });
                        setAnalyticsData(data);
                      } catch (error) {
                        console.error("Error fetching analytics:", error);
                        toast({
                          title: "Error",
                          description: "Failed to load analytics data",
                          variant: "destructive",
                        });
                      } finally {
                        setIsLoadingAnalytics(false);
                      }
                    }}
                    disabled={isLoadingAnalytics}
                  >
                    {isLoadingAnalytics ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load Analytics"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </>
        )}

        {/* Settings Modal */}
        <AuditLogSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
        />
      </div>
    </AdminLayout>
  );
}

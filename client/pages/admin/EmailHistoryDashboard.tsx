import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import EmailHistoryTable from "@/components/EmailHistoryTable";

/**
 * Email History Analytics Dashboard
 * Admin page for viewing and analyzing email history
 */
export const EmailHistoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    templateType: "",
    status: "",
    recipientEmail: "",
  });

  // Fetch email history
  const historyQuery = trpc.emailHistory.getHistory.useQuery(
    {
      templateType: filters.templateType || undefined,
      status: filters.status || undefined,
      recipientEmail: filters.recipientEmail || undefined,
      limit,
      offset,
    },
    {
      enabled: !!user,
    }
  );

  // Fetch statistics
  const statsQuery = trpc.emailHistory.getStatistics.useQuery(
    {
      templateType: filters.templateType || undefined,
    },
    {
      enabled: !!user,
    }
  );

  // Fetch summary
  const summaryQuery = trpc.emailHistory.getSummary.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access this page</p>
      </div>
    );
  }

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setOffset(0); // Reset to first page
  };

  const handleRefresh = () => {
    historyQuery.refetch();
    statsQuery.refetch();
    summaryQuery.refetch();
  };

  const handleViewDetails = (email: any) => {
    // TODO: Open detail modal
    toast.info(`Viewing email ${email.id}`);
  };

  const stats = statsQuery.data?.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email History & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track and analyze all test emails sent through the system
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Sent */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalSent}</p>
                </div>
                <Mail className="h-8 w-8 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Successful */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalSuccessful}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Failed */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalFailed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold mt-1">{stats.successRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          {/* Avg Size */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg HTML Size</p>
                  <p className="text-2xl font-bold mt-1">{Math.round(stats.averageHtmlSize / 1024)}KB</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribution Charts */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* By Template Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribution by Template Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byTemplateType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.replace(/_/g, " ")}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* By Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribution by Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <Badge
                    variant={
                      status === "sent"
                        ? "default"
                        : status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* By Scenario */}
      {stats && Object.keys(stats.byScenario).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution by Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.byScenario).map(([scenario, count]) => (
                <div key={scenario} className="text-center">
                  <p className="text-sm font-medium">{scenario.replace(/_/g, " ")}</p>
                  <p className="text-2xl font-bold text-red-600">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email History Table */}
      <EmailHistoryTable
        data={historyQuery.data?.data || []}
        total={historyQuery.data?.pagination.total || 0}
        loading={historyQuery.isLoading}
        limit={limit}
        offset={offset}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onViewDetails={handleViewDetails}
      />

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Filter Results:</strong> Use filters to find specific emails by template type, status, or recipient
          </p>
          <p>
            <strong>View Details:</strong> Click "View" to see full email content and metadata
          </p>
          <p>
            <strong>Export Data:</strong> Use the export button to download history as CSV for analysis
          </p>
          <p>
            <strong>Success Rate:</strong> Monitor success rate to identify issues with email sending
          </p>
          <p>
            <strong>Cleanup Old Data:</strong> Admin users can delete old email history to manage database size
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailHistoryDashboard;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEngagementSummary } from "@/hooks/useEngagementAnalytics";
import { useUrlDateRange } from "@/hooks/useUrlDateRange";
import { AdvancedDateRangeFilter } from "@/components/engagement/AdvancedDateRangeFilter";
import { PeriodComparison } from "@/components/engagement/PeriodComparison";
import { MetricsOverview } from "@/components/engagement/MetricsOverview";
import { EngagementTrends } from "@/components/engagement/EngagementTrends";
import { TopPerformingEmails } from "@/components/engagement/TopPerformingEmails";
import { RecipientProfiles } from "@/components/engagement/RecipientProfiles";
import { ShareUrlButton, ShareUrlInline } from "@/components/engagement/ShareUrlButton";
import { Loader2, RefreshCw, Download, AlertCircle } from "lucide-react";

/**
 * Email Engagement Analytics Dashboard V3
 * With URL state persistence for easy sharing
 */
export function EngagementDashboardV3() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [previousPeriodStart, setPreviousPeriodStart] = useState<Date | null>(null);
  const [previousPeriodEnd, setPreviousPeriodEnd] = useState<Date | null>(null);

  // Use URL-based date range management
  const {
    startDate,
    endDate,
    setDateRange,
    setPreset,
    shareUrl,
    isLoading: isUrlLoading,
  } = useUrlDateRange({ defaultDays: 7 });

  const { data: summary, isLoading, refetch } = useEngagementSummary();

  // Calculate previous period for comparison
  useEffect(() => {
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prevEnd = new Date(startDate);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    setPreviousPeriodStart(prevStart);
    setPreviousPeriodEnd(prevEnd);
  }, [startDate, endDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log("Exporting data for range:", startDate, "to", endDate);
    // TODO: Implement export functionality
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // Mock comparison data
  const comparisonMetrics = [
    {
      label: "Total Opens",
      currentValue: summary?.totalOpens || 0,
      previousValue: Math.floor((summary?.totalOpens || 0) * 0.85),
      format: "number",
      color: "blue",
    },
    {
      label: "Total Clicks",
      currentValue: summary?.totalClicks || 0,
      previousValue: Math.floor((summary?.totalClicks || 0) * 0.78),
      format: "number",
      color: "green",
    },
    {
      label: "Open Rate",
      currentValue: summary?.averageOpenRate || 0,
      previousValue: (summary?.averageOpenRate || 0) * 0.92,
      format: "percentage",
      color: "blue",
    },
    {
      label: "Click Rate",
      currentValue: summary?.averageClickRate || 0,
      previousValue: (summary?.averageClickRate || 0) * 0.88,
      format: "percentage",
      color: "green",
    },
  ];

  if (isUrlLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Engagement Analytics</h1>
              <p className="text-slate-600 mt-2">
                Real-time insights into email performance and recipient engagement
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              <ShareUrlButton url={shareUrl} />
            </div>
          </div>
        </div>

        {/* URL State Info Banner */}
        <Card className="mb-6 border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">URL State Active</p>
                <p className="text-sm text-green-800 mt-1">
                  Your current date range is saved in the URL. You can share this link to show others the same metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Date Range Filter */}
        <div className="mb-6">
          <AdvancedDateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={setDateRange}
            onPreset={setPreset}
          />
        </div>

        {/* Share URL Display */}
        {showShareUrl && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Shareable URL</CardTitle>
                <CardDescription>
                  Copy this URL to share your current dashboard view with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShareUrlInline url={shareUrl} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toggle Share URL Display */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareUrl(!showShareUrl)}
          >
            {showShareUrl ? "Hide" : "Show"} Shareable URL
          </Button>
        </div>

        {/* Comparison Toggle */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={showComparison ? "default" : "outline"}
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? "Hide" : "Show"} Comparison
          </Button>
          {showComparison && previousPeriodStart && previousPeriodEnd && (
            <span className="text-sm text-slate-600">
              Comparing {formatDateRange(startDate, endDate)} vs{" "}
              {formatDateRange(previousPeriodStart, previousPeriodEnd)}
            </span>
          )}
        </div>

        {/* Period Comparison Section */}
        {showComparison && previousPeriodStart && previousPeriodEnd && (
          <div className="mb-6">
            <PeriodComparison
              currentPeriod={formatDateRange(startDate, endDate)}
              previousPeriod={formatDateRange(previousPeriodStart, previousPeriodEnd)}
              metrics={comparisonMetrics}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="emails">Top Emails</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : (
              <>
                <MetricsOverview summary={summary} />

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Emails"
                    value={summary?.totalEmails || 0}
                    description="Emails tracked"
                    color="blue"
                  />
                  <StatCard
                    title="Avg Open Rate"
                    value={`${(summary?.averageOpenRate || 0).toFixed(1)}%`}
                    description="Across all emails"
                    color="green"
                  />
                  <StatCard
                    title="Avg Click Rate"
                    value={`${(summary?.averageClickRate || 0).toFixed(1)}%`}
                    description="Across all emails"
                    color="purple"
                  />
                  <StatCard
                    title="Avg Engagement"
                    value={`${(summary?.averageEngagementScore || 0).toFixed(1)}`}
                    description="Score out of 100"
                    color="orange"
                  />
                </div>

                {/* Event Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Summary</CardTitle>
                    <CardDescription>
                      Total engagement events tracked for {formatDateRange(startDate, endDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {summary?.totalOpens || 0}
                        </div>
                        <div className="text-sm text-slate-600">Opens</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {summary?.totalClicks || 0}
                        </div>
                        <div className="text-sm text-slate-600">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {summary?.totalBounces || 0}
                        </div>
                        <div className="text-sm text-slate-600">Bounces</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {summary?.totalComplaints || 0}
                        </div>
                        <div className="text-sm text-slate-600">Complaints</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <EngagementTrends startDate={startDate} endDate={endDate} />
          </TabsContent>

          {/* Top Emails Tab */}
          <TabsContent value="emails">
            <TopPerformingEmails />
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients">
            <RecipientProfiles />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Reusable stat card component
 */
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
}

function StatCard({ title, value, description, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-red-50 text-red-600 border-red-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm font-medium mt-2">{title}</p>
        <p className="text-xs text-slate-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default EngagementDashboardV3;

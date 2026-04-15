import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEngagementSummary, useDateRangeFilter } from "@/hooks/useEngagementAnalytics";
import { MetricsOverview } from "@/components/engagement/MetricsOverview";
import { EngagementTrends } from "@/components/engagement/EngagementTrends";
import { TopPerformingEmails } from "@/components/engagement/TopPerformingEmails";
import { RecipientProfiles } from "@/components/engagement/RecipientProfiles";
import { DateRangeFilter } from "@/components/engagement/DateRangeFilter";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * Email Engagement Analytics Dashboard
 * Displays real-time email engagement metrics, trends, and recipient profiles
 */
export function EngagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { startDate, endDate, handlePreset } = useDateRangeFilter(7);

  const { data: summary, isLoading, refetch } = useEngagementSummary();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onPreset={handlePreset}
          />
        </div>

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
                    <CardDescription>Total engagement events tracked</CardDescription>
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

export default EngagementDashboard;

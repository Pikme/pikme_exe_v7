import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/AdminLayout";
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Target, Zap } from "lucide-react";

interface TagMetric {
  tagId: number;
  tagName: string;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  avgEngagementRate: number;
  topLocations: Array<{
    locationId: number;
    locationName: string;
    views: number;
    clicks: number;
  }>;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export function AdminTagPerformance() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "top-tags" | "detailed">("overview");

  // Queries
  const metricsQuery = trpc.locations.getTagPerformanceMetrics.useQuery({ limit: 20 });
  const topTagsQuery = trpc.locations.getTopPerformingTags.useQuery({ limit: 10 });

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 text-gray-400" />;
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return "bg-green-100 text-green-800";
    if (rate >= 5) return "bg-red-100 text-red-800";
    if (rate >= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getEngagementLabel = (rate: number) => {
    if (rate >= 10) return "Excellent";
    if (rate >= 5) return "Good";
    if (rate >= 2) return "Fair";
    return "Poor";
  };

  return (
    <AdminLayout title="TagPerformance">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tag Performance Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track engagement metrics for auto-applied tags and optimize your tagging strategy
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold">
                  {metricsQuery.data?.length || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {metricsQuery.data?.reduce((sum, tag) => sum + tag.totalViews, 0).toLocaleString() || 0}
                </p>
              </div>
              <Eye className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {metricsQuery.data?.reduce((sum, tag) => sum + tag.totalClicks, 0).toLocaleString() || 0}
                </p>
              </div>
              <Click className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-2xl font-bold">
                  {metricsQuery.data?.reduce((sum, tag) => sum + tag.totalConversions, 0).toLocaleString() || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Tags
          </CardTitle>
          <CardDescription>Tags with the highest engagement rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTagsQuery.data && topTagsQuery.data.length > 0 ? (
              topTagsQuery.data.map((tag, index) => (
                <div key={tag.tagId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-semibold">{tag.tagName}</p>
                        <p className="text-xs text-muted-foreground">
                          {tag.topLocations.length} locations
                        </p>
                      </div>
                    </div>
                    <Badge className={getEngagementColor(tag.avgEngagementRate)}>
                      {getEngagementLabel(tag.avgEngagementRate)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Views</p>
                      <p className="font-semibold">{tag.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Clicks</p>
                      <p className="font-semibold">{tag.totalClicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">CTR</p>
                      <p className="font-semibold">{tag.clickThroughRate.toFixed(2)}%</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Engagement</p>
                      <p className="font-semibold">{tag.avgEngagementRate.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Top Locations for this tag */}
                  {tag.topLocations.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Top Locations</p>
                      <div className="flex flex-wrap gap-1">
                        {tag.topLocations.slice(0, 3).map((location) => (
                          <Badge key={location.locationId} variant="secondary" className="text-xs">
                            {location.locationName} ({location.views} views)
                          </Badge>
                        ))}
                        {tag.topLocations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tag.topLocations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tag performance data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Tags Performance */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags Performance</CardTitle>
          <CardDescription>Complete list of all tags with their engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Tag Name</th>
                  <th className="text-right py-3 px-2 font-semibold">Views</th>
                  <th className="text-right py-3 px-2 font-semibold">Clicks</th>
                  <th className="text-right py-3 px-2 font-semibold">CTR %</th>
                  <th className="text-right py-3 px-2 font-semibold">Conversions</th>
                  <th className="text-right py-3 px-2 font-semibold">Engagement %</th>
                  <th className="text-center py-3 px-2 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {metricsQuery.data && metricsQuery.data.length > 0 ? (
                  metricsQuery.data.map((tag) => (
                    <tr key={tag.tagId} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{tag.tagName}</td>
                      <td className="text-right py-3 px-2">{tag.totalViews.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{tag.totalClicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{tag.clickThroughRate.toFixed(2)}%</td>
                      <td className="text-right py-3 px-2">{tag.totalConversions.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getEngagementColor(tag.avgEngagementRate)}`}>
                          {tag.avgEngagementRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(tag.trend)}
                          <span className="text-xs">{tag.trendPercentage > 0 ? '+' : ''}{tag.trendPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tag data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900 text-sm">📊 Engagement Benchmark</p>
            <p className="text-sm text-red-800 mt-1">
              Tags with engagement rates above 10% are considered excellent performers. Focus on understanding what makes these tags successful.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900 text-sm">✅ Optimization Opportunity</p>
            <p className="text-sm text-green-800 mt-1">
              Tags with low engagement rates may need refinement. Consider adjusting their descriptions or associated locations.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="font-semibold text-purple-900 text-sm">🎯 Conversion Focus</p>
            <p className="text-sm text-purple-800 mt-1">
              Monitor conversion rates closely. High-converting tags should be prioritized in your tagging strategy.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}

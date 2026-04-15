import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Download, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Replay Analytics Report Component
 * Displays comprehensive analytics on replay success rates and event types
 */
export const ReplayAnalyticsReport: React.FC<{
  startDate?: Date;
  endDate?: Date;
}> = ({ startDate, endDate }) => {
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("csv");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch report data
  const { data: report, isLoading, refetch } = trpc.replayAnalytics.generateReport.useQuery({
    startDate,
    endDate,
  });

  // Fetch metrics
  const { data: metrics } = trpc.replayAnalytics.getMetrics.useQuery({
    startDate,
    endDate,
  });

  // Fetch event type analytics
  const { data: eventTypes } = trpc.replayAnalytics.getEventTypeAnalytics.useQuery({
    startDate,
    endDate,
    limit: 10,
  });

  // Fetch provider analytics
  const { data: providers } = trpc.replayAnalytics.getProviderAnalytics.useQuery({
    startDate,
    endDate,
  });

  // Fetch top errors
  const { data: topErrors } = trpc.replayAnalytics.getTopErrors.useQuery({
    startDate,
    endDate,
    limit: 5,
  });

  // Export mutations
  const { mutate: exportJSON } = trpc.replayAnalytics.exportReportJSON.useMutation({
    onSuccess: (data) => {
      const element = document.createElement("a");
      const file = new Blob([data.content], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = data.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsExporting(false);
    },
  });

  const { mutate: exportCSV } = trpc.replayAnalytics.exportReportCSV.useMutation({
    onSuccess: (data) => {
      const element = document.createElement("a");
      const file = new Blob([data.content], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = data.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsExporting(false);
    },
  });

  const handleExport = () => {
    setIsExporting(true);
    if (exportFormat === "json") {
      exportJSON({ startDate, endDate });
    } else {
      exportCSV({ startDate, endDate });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!report || !metrics) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Replay Analytics Report</h2>
          <p className="text-gray-600 text-sm">
            Generated: {format(report.generatedAt, "PPpp")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export ({exportFormat.toUpperCase()})
          </Button>
        </div>
      </div>

      {/* Period Info */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">
            Period: {format(report.period.start, "PPP")} to {format(report.period.end, "PPP")}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Replays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReplays}</div>
            <p className="text-xs text-gray-600 mt-1">events processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.successfulReplays} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Retries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRetries}</div>
            <p className="text-xs text-gray-600 mt-1">per event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageProcessingTime}ms</div>
            <p className="text-xs text-gray-600 mt-1">per event</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Analytics */}
      {eventTypes && eventTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Replayed Event Types</CardTitle>
            <CardDescription>Event types with highest replay volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventTypes.map((et) => (
                <div key={et.eventType} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{et.eventType}</p>
                    <p className="text-sm text-gray-600">
                      {et.totalCount} replays • {et.successCount} successful
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={et.successRate >= 80 ? "default" : "destructive"}
                    >
                      {et.successRate}%
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      Last: {format(et.lastReplayed, "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Analytics */}
      {providers && providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Performance</CardTitle>
            <CardDescription>Success rates by email provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((p) => (
                <div key={p.provider} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{p.provider}</p>
                    <p className="text-sm text-gray-600">
                      {p.totalCount} events • {p.averageProcessingTime}ms avg
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={p.successRate >= 80 ? "default" : "destructive"}
                    >
                      {p.successRate}%
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      {p.successCount} / {p.totalCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Errors */}
      {topErrors && topErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Errors</CardTitle>
            <CardDescription>Most common failure reasons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topErrors.map((error, idx) => (
                <div key={idx} className="p-3 border rounded bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-red-900">{error.error}</p>
                      <p className="text-sm text-red-700 mt-1">
                        {error.count} occurrences ({error.percentage}%)
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {error.affectedProviders.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      Last: {format(error.lastOccurrence, "PPp")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Actions to improve replay success</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {report.trends && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Performance trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Daily Trend */}
              <div className="p-3 border rounded">
                <p className="font-medium">Daily Trend</p>
                <div className="flex items-center gap-2 mt-2">
                  {report.trends.daily.trend === "increasing" ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : report.trends.daily.trend === "decreasing" ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <div className="w-5 h-5 text-gray-600">→</div>
                  )}
                  <span className="text-lg font-bold">
                    {report.trends.daily.trendPercentage > 0 ? "+" : ""}
                    {report.trends.daily.trendPercentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {report.trends.daily.data.length} data points
                </p>
              </div>

              {/* Hourly Trend */}
              <div className="p-3 border rounded">
                <p className="font-medium">Hourly Trend</p>
                <div className="flex items-center gap-2 mt-2">
                  {report.trends.hourly.trend === "increasing" ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : report.trends.hourly.trend === "decreasing" ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <div className="w-5 h-5 text-gray-600">→</div>
                  )}
                  <span className="text-lg font-bold">
                    {report.trends.hourly.trendPercentage > 0 ? "+" : ""}
                    {report.trends.hourly.trendPercentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {report.trends.hourly.data.length} data points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReplayAnalyticsReport;

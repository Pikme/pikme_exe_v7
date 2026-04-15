import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { format, subDays } from "date-fns";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, Download } from "lucide-react";
import ReplayAnalyticsReport from "@/components/ReplayAnalyticsReport";

/**
 * Replay Analytics Dashboard
 * Comprehensive dashboard for analyzing replay success rates and event types
 */
export const ReplayAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [customStartDate, setCustomStartDate] = useState<string>(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "providers" | "errors" | "report">("overview");

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    if (dateRange === "7d") {
      start = subDays(end, 7);
    } else if (dateRange === "30d") {
      start = subDays(end, 30);
    } else if (dateRange === "90d") {
      start = subDays(end, 90);
    } else if (dateRange === "custom") {
      start = new Date(customStartDate);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch data
  const { data: metrics } = trpc.replayAnalytics.getMetrics.useQuery({ startDate: start, endDate: end });
  const { data: eventTypes } = trpc.replayAnalytics.getEventTypeAnalytics.useQuery({
    startDate: start,
    endDate: end,
    limit: 10,
  });
  const { data: providers } = trpc.replayAnalytics.getProviderAnalytics.useQuery({
    startDate: start,
    endDate: end,
  });
  const { data: timeSeries } = trpc.replayAnalytics.getTimeSeries.useQuery({
    period: "daily",
    startDate: start,
    endDate: end,
  });
  const { data: topErrors } = trpc.replayAnalytics.getTopErrors.useQuery({
    startDate: start,
    endDate: end,
    limit: 5,
  });

  // Chart colors
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Replay Analytics</h1>
        <p className="text-gray-600">Analyze webhook replay success rates and event patterns</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              {[
                { label: "Last 7 days", value: "7d" },
                { label: "Last 30 days", value: "30d" },
                { label: "Last 90 days", value: "90d" },
                { label: "Custom", value: "custom" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(option.value as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {dateRange === "custom" && (
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-32"
                  />
                </div>
                <span>to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {[
          { id: "overview", label: "Overview" },
          { id: "events", label: "Event Types" },
          { id: "providers", label: "Providers" },
          { id: "errors", label: "Errors" },
          { id: "report", label: "Full Report" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className="rounded-none border-b-2"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Replays</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.totalReplays}</div>
                  <p className="text-xs text-gray-600 mt-1">events processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.successRate}%</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {metrics.successfulReplays} / {metrics.totalReplays}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Retries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.averageRetries}</div>
                  <p className="text-xs text-gray-600 mt-1">per event</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.averageProcessingTime}ms</div>
                  <p className="text-xs text-gray-600 mt-1">per event</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Time Series Chart */}
          {timeSeries && timeSeries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Replay Trend</CardTitle>
                <CardDescription>Daily replay volume and success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => format(new Date(value), "MMM dd")}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), "PPP")}
                      formatter={(value) => [value, ""]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="replays"
                      stroke="#3b82f6"
                      name="Total Replays"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="successRate"
                      stroke="#10b981"
                      name="Success Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Success vs Failure */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Success vs Failure</CardTitle>
                <CardDescription>Replay outcome distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Successful", value: metrics.successfulReplays },
                        { name: "Failed", value: metrics.failedReplays },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Event Types Tab */}
      {activeTab === "events" && eventTypes && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Replayed Event Types</CardTitle>
              <CardDescription>Event types with highest replay volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCount" fill="#3b82f6" name="Total" />
                  <Bar dataKey="successCount" fill="#10b981" name="Successful" />
                  <Bar dataKey="failureCount" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event Type Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventTypes.map((et) => (
              <Card key={et.eventType}>
                <CardHeader>
                  <CardTitle className="text-base">{et.eventType}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-semibold">{et.totalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <span className="font-semibold">{et.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Retries:</span>
                    <span className="font-semibold">{et.averageRetries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Processing:</span>
                    <span className="font-semibold">{et.averageProcessingTime}ms</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === "providers" && providers && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance Comparison</CardTitle>
              <CardDescription>Success rates by email provider</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Provider Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <Card key={p.provider}>
                <CardHeader>
                  <CardTitle className="text-base capitalize">{p.provider}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events:</span>
                    <span className="font-semibold">{p.totalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <span className="font-semibold">{p.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Successful:</span>
                    <span className="font-semibold">{p.successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed:</span>
                    <span className="font-semibold">{p.failureCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Processing:</span>
                    <span className="font-semibold">{p.averageProcessingTime}ms</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === "errors" && topErrors && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Errors</CardTitle>
              <CardDescription>Most common failure reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topErrors.map((error, idx) => (
                  <div key={idx} className="p-4 border rounded bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-red-900">{error.error}</p>
                      <span className="text-sm font-bold text-red-600">{error.count}x</span>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      {error.percentage}% of all failures
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-semibold text-red-800">Providers:</p>
                        <div className="flex gap-1 mt-1">
                          {error.affectedProviders.map((p) => (
                            <span key={p} className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-800">Event Types:</p>
                        <div className="flex gap-1 mt-1">
                          {error.affectedEventTypes.map((et) => (
                            <span key={et} className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              {et}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Report Tab */}
      {activeTab === "report" && (
        <ReplayAnalyticsReport startDate={start} endDate={end} />
      )}
    </div>
  );
};

export default ReplayAnalyticsDashboard;

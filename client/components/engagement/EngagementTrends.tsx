import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEngagementTrends } from "@/hooks/useEngagementAnalytics";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface EngagementTrendsProps {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Engagement Trends Component
 * Displays engagement metrics trends over time
 */
export function EngagementTrends({ startDate, endDate }: EngagementTrendsProps) {
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data: trends, isLoading } = useEngagementTrends(startDate, endDate, periodType);

  // Sample data for demonstration
  const sampleData = [
    { date: "2024-01-17", opens: 245, clicks: 52, bounces: 8, score: 72 },
    { date: "2024-01-18", opens: 312, clicks: 68, bounces: 5, score: 78 },
    { date: "2024-01-19", opens: 289, clicks: 61, bounces: 12, score: 75 },
    { date: "2024-01-20", opens: 356, clicks: 79, bounces: 6, score: 82 },
    { date: "2024-01-21", opens: 298, clicks: 64, bounces: 9, score: 76 },
    { date: "2024-01-22", opens: 412, clicks: 95, bounces: 4, score: 85 },
    { date: "2024-01-23", opens: 378, clicks: 87, bounces: 7, score: 83 },
  ];

  const chartData = trends && trends.length > 0 ? trends : sampleData;

  return (
    <div className="space-y-6">
      {/* Period Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>View engagement trends by period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((type) => (
              <Button
                key={type}
                variant={periodType === type ? "default" : "outline"}
                onClick={() => setPeriodType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Opens and Clicks Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Opens & Clicks Trend</CardTitle>
              <CardDescription>Email engagement activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Opens"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Score Trend</CardTitle>
              <CardDescription>Overall engagement quality over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    name="Engagement Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bounce Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Bounce Rate Trend</CardTitle>
              <CardDescription>Email delivery issues over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bounces"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Bounces"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Period Summary</CardTitle>
              <CardDescription>Key metrics for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryItem
                  label="Avg Opens"
                  value={Math.round(
                    chartData.reduce((sum, d) => sum + (d.opens || 0), 0) / chartData.length
                  )}
                  color="blue"
                />
                <SummaryItem
                  label="Avg Clicks"
                  value={Math.round(
                    chartData.reduce((sum, d) => sum + (d.clicks || 0), 0) / chartData.length
                  )}
                  color="green"
                />
                <SummaryItem
                  label="Total Bounces"
                  value={chartData.reduce((sum, d) => sum + (d.bounces || 0), 0)}
                  color="red"
                />
                <SummaryItem
                  label="Avg Score"
                  value={Math.round(
                    chartData.reduce((sum, d) => sum + (d.score || 0), 0) / chartData.length
                  )}
                  color="purple"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Summary Item Component
 */
function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsOverviewProps {
  summary?: {
    totalEmails: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageEngagementScore: number;
    totalOpens: number;
    totalClicks: number;
    totalBounces: number;
    totalComplaints: number;
  };
}

/**
 * Metrics Overview Component
 * Displays key engagement metrics with visual indicators
 */
export function MetricsOverview({ summary }: MetricsOverviewProps) {
  if (!summary) {
    return null;
  }

  // Sample data for charts (in production, this would come from the API)
  const trendData = [
    { date: "Mon", opens: 45, clicks: 12, bounces: 2 },
    { date: "Tue", opens: 52, clicks: 18, bounces: 3 },
    { date: "Wed", opens: 48, clicks: 15, bounces: 1 },
    { date: "Thu", opens: 61, clicks: 22, bounces: 2 },
    { date: "Fri", opens: 55, clicks: 19, bounces: 4 },
    { date: "Sat", opens: 42, clicks: 11, bounces: 1 },
    { date: "Sun", opens: 38, clicks: 9, bounces: 0 },
  ];

  const rateData = [
    { name: "Open Rate", value: summary.averageOpenRate },
    { name: "Click Rate", value: summary.averageClickRate },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open Rate Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Average Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {summary.averageOpenRate.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on {summary.totalEmails} emails
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Click Rate Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Average Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {summary.averageClickRate.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {summary.totalClicks} total clicks
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Engagement Score Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {summary.averageEngagementScore.toFixed(1)}
                </div>
                <p className="text-xs text-slate-500 mt-2">Out of 100</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">
                  {Math.round(summary.averageEngagementScore / 10)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bounce Rate Card */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Bounces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {summary.totalBounces}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {summary.totalComplaints} complaints
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend</CardTitle>
          <CardDescription>Opens, clicks, and bounces over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
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
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bounces"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rate Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Comparison</CardTitle>
          <CardDescription>Average open and click rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

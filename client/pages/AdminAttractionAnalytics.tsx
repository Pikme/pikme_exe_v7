import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Eye,
  Star,
  Heart,
  Download,
  Calendar,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

export default function AdminAttractionAnalytics() {
  const [days, setDays] = useState(30);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch analytics data
  const summaryQuery = trpc.analytics.getAnalyticsSummary.useQuery({ days });
  const topAttractionsQuery = trpc.analytics.getTopAttractionsByViews.useQuery({
    limit: 10,
    days,
  });
  const typeDistributionQuery = trpc.analytics.getAttractionsByType.useQuery({ days });
  const trendingQuery = trpc.analytics.getTrendingAttractions.useQuery({
    limit: 5,
    days: Math.min(days, 7),
  });

  const summary = summaryQuery.data;
  const topAttractions = topAttractionsQuery.data || [];
  const typeDistribution = typeDistributionQuery.data || [];
  const trending = trendingQuery.data || [];

  // Format data for charts
  const chartData = useMemo(() => {
    return topAttractions.slice(0, 8).map((attr: any) => ({
      name: attr.name.substring(0, 15),
      views: parseInt(attr.totalViews || 0),
      rating: parseFloat(attr.avgRating || 0),
    }));
  }, [topAttractions]);

  const typeChartData = useMemo(() => {
    return typeDistribution.map((item: any) => ({
      name: item.type,
      value: parseInt(item.count || 0),
      views: parseInt(item.totalViews || 0),
    }));
  }, [typeDistribution]);

  const trendingChartData = useMemo(() => {
    return trending.map((item: any) => ({
      name: item.name.substring(0, 12),
      score: parseFloat(item.trendScore || 0),
      views: parseInt(item.views || 0),
    }));
  }, [trending]);

  // Export data as CSV
  const handleExportCSV = () => {
    const headers = ["Attraction", "Views", "Rating", "Favorites", "Bookings"];
    const rows = topAttractions.map((attr: any) => [
      attr.name,
      attr.totalViews || 0,
      attr.avgRating || 0,
      0,
      0,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attraction-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Analytics exported successfully");
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const data = {
      summary,
      topAttractions,
      typeDistribution,
      trending,
      exportDate: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attraction-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Analytics exported successfully");
  };

  return (
    <AdminLayout title="AttractionAnalytics">
      <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attraction Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track views, ratings, and performance metrics for attractions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
                size="sm"
              >
                {d} days
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalViews ? parseInt(summary.totalViews as any).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avgRating ? parseFloat(summary.avgRating as any).toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalFavorites ? parseInt(summary.totalFavorites as any).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">User favorites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalBookings ? parseInt(summary.totalBookings as any).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Conversion metric</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Attractions by Views */}
        <Card>
          <CardHeader>
            <CardTitle>Top Attractions by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attractions by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Attractions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trending Attractions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Attractions (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#10b981" name="Trend Score" />
              <Bar dataKey="views" fill="#f59e0b" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Attractions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Attractions Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-right py-3 px-4 font-semibold">Views</th>
                  <th className="text-right py-3 px-4 font-semibold">Rating</th>
                  <th className="text-right py-3 px-4 font-semibold">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {topAttractions.slice(0, 10).map((attr: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{attr.name}</td>
                    <td className="text-right py-3 px-4">{parseInt(attr.totalViews || 0).toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {parseFloat(attr.avgRating || 0).toFixed(1)}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{attr.reviewCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Webhook Analytics Dashboard
 * Visualizes webhook delivery metrics and system health
 */

interface MetricsData {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  averageProcessingTime: number;
  eventsPerSecond: number;
}

interface ProviderMetrics {
  provider: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  averageProcessingTime: number;
  lastEventTime?: Date;
}

interface EventTypeMetrics {
  eventType: string;
  count: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageProcessingTime: number;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  queueSize: number;
  circuitBreakerStatus: string;
  lastError?: {
    timestamp: Date;
    message: string;
    type: string;
  };
  metrics: {
    cpuUsage?: number;
    memoryUsage?: number;
    responseTime?: number;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const PROVIDER_COLORS = {
  sendgrid: "#0ea5e9",
  ses: "#f59e0b",
  mailgun: "#8b5cf6",
};

export default function WebhookAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetrics[]>([]);
  const [eventTypeMetrics, setEventTypeMetrics] = useState<EventTypeMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [topErrors, setTopErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - in production, use tRPC
      setMetrics({
        totalEvents: Math.floor(Math.random() * 5000 + 1000),
        successfulEvents: Math.floor(Math.random() * 4500 + 900),
        failedEvents: Math.floor(Math.random() * 500 + 50),
        successRate: Math.floor(Math.random() * 5 + 95),
        averageProcessingTime: Math.floor(Math.random() * 200 + 50),
        eventsPerSecond: Math.random() * 10 + 5,
      });

      setProviderMetrics([
        {
          provider: "SendGrid",
          totalEvents: Math.floor(Math.random() * 2000 + 500),
          successfulEvents: Math.floor(Math.random() * 1900 + 480),
          failedEvents: Math.floor(Math.random() * 100 + 10),
          successRate: Math.floor(Math.random() * 3 + 97),
          averageProcessingTime: Math.floor(Math.random() * 150 + 40),
          lastEventTime: new Date(Date.now() - Math.random() * 60000),
        },
        {
          provider: "AWS SES",
          totalEvents: Math.floor(Math.random() * 1500 + 400),
          successfulEvents: Math.floor(Math.random() * 1400 + 380),
          failedEvents: Math.floor(Math.random() * 150 + 20),
          successRate: Math.floor(Math.random() * 4 + 96),
          averageProcessingTime: Math.floor(Math.random() * 180 + 50),
          lastEventTime: new Date(Date.now() - Math.random() * 90000),
        },
        {
          provider: "Mailgun",
          totalEvents: Math.floor(Math.random() * 1200 + 300),
          successfulEvents: Math.floor(Math.random() * 1100 + 280),
          failedEvents: Math.floor(Math.random() * 120 + 15),
          successRate: Math.floor(Math.random() * 3 + 96),
          averageProcessingTime: Math.floor(Math.random() * 160 + 45),
          lastEventTime: new Date(Date.now() - Math.random() * 120000),
        },
      ]);

      setEventTypeMetrics([
        {
          eventType: "Delivered",
          count: Math.floor(Math.random() * 2000 + 500),
          successCount: Math.floor(Math.random() * 1950 + 490),
          failureCount: Math.floor(Math.random() * 50 + 5),
          successRate: 98,
          averageProcessingTime: Math.floor(Math.random() * 100 + 30),
        },
        {
          eventType: "Opened",
          count: Math.floor(Math.random() * 1500 + 300),
          successCount: Math.floor(Math.random() * 1450 + 290),
          failureCount: Math.floor(Math.random() * 50 + 5),
          successRate: 97,
          averageProcessingTime: Math.floor(Math.random() * 120 + 40),
        },
        {
          eventType: "Clicked",
          count: Math.floor(Math.random() * 800 + 150),
          successCount: Math.floor(Math.random() * 770 + 140),
          failureCount: Math.floor(Math.random() * 30 + 3),
          successRate: 97,
          averageProcessingTime: Math.floor(Math.random() * 110 + 35),
        },
        {
          eventType: "Bounced",
          count: Math.floor(Math.random() * 300 + 50),
          successCount: Math.floor(Math.random() * 290 + 45),
          failureCount: Math.floor(Math.random() * 20 + 2),
          successRate: 96,
          averageProcessingTime: Math.floor(Math.random() * 130 + 50),
        },
      ]);

      setSystemHealth({
        status: Math.random() > 0.95 ? "critical" : Math.random() > 0.8 ? "degraded" : "healthy",
        uptime: Math.random() * 30 * 24 * 3600,
        queueSize: Math.floor(Math.random() * 200),
        circuitBreakerStatus: "closed",
        lastError: Math.random() > 0.7 ? {
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          message: "Connection timeout",
          type: "temporary",
        } : undefined,
        metrics: {
          cpuUsage: Math.random() * 60,
          memoryUsage: Math.random() * 50,
          responseTime: Math.random() * 300 + 50,
        },
      });

      setTimeSeries(
        Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          events: Math.floor(Math.random() * 200 + 50),
          successes: Math.floor(Math.random() * 190 + 45),
          failures: Math.floor(Math.random() * 20 + 2),
        }))
      );

      setTopErrors([
        { error: "Connection timeout", count: 45, lastOccurred: new Date(Date.now() - 3600000) },
        { error: "Invalid signature", count: 12, lastOccurred: new Date(Date.now() - 7200000) },
        { error: "Database error", count: 8, lastOccurred: new Date(Date.now() - 10800000) },
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of email delivery and webhook events
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== "healthy" && (
        <Alert className={systemHealth.status === "critical" ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System Status: <strong>{systemHealth.status.toUpperCase()}</strong>
            {systemHealth.lastError && ` - Last error: ${systemHealth.lastError.message}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.eventsPerSecond.toFixed(1)} events/sec
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.successRate}%</div>
                <Progress value={metrics.successRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.successfulEvents.toLocaleString()} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageProcessingTime}ms</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.failedEvents.toLocaleString()} failed events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealth && (
                  <>
                    <Badge className={getStatusColor(systemHealth.status)}>
                      {systemHealth.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Queue: {systemHealth.queueSize} items
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
              <CardDescription>24-hour event trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="events" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="successes" stroke="#10b981" />
                  <Line type="monotone" dataKey="failures" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Errors</CardTitle>
              <CardDescription>Most common webhook errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topErrors.map((error, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{error.error}</p>
                      <p className="text-xs text-muted-foreground">
                        Last occurred: {error.lastOccurred.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{error.count} times</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {providerMetrics.map((provider) => (
              <Card key={provider.provider}>
                <CardHeader>
                  <CardTitle className="text-base">{provider.provider}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span className="font-semibold">{provider.successRate}%</span>
                    </div>
                    <Progress value={provider.successRate} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Events</p>
                      <p className="font-semibold">{provider.totalEvents}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-semibold">{provider.averageProcessingTime}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Provider Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successfulEvents" fill="#10b981" />
                  <Bar dataKey="failedEvents" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Types Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypeMetrics}
                    dataKey="count"
                    nameKey="eventType"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {eventTypeMetrics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Type Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventTypeMetrics.map((eventType) => (
                  <div key={eventType.eventType} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{eventType.eventType}</span>
                      <Badge variant="outline">{eventType.count} events</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Success: {eventType.successRate}%</span>
                      <span>Avg: {eventType.averageProcessingTime}ms</span>
                    </div>
                    <Progress value={eventType.successRate} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-4">
          {systemHealth && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemHealth.metrics.cpuUsage?.toFixed(1)}%</div>
                    <Progress value={systemHealth.metrics.cpuUsage || 0} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemHealth.metrics.memoryUsage?.toFixed(1)}%</div>
                    <Progress value={systemHealth.metrics.memoryUsage || 0} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemHealth.metrics.responseTime?.toFixed(0)}ms</div>
                    <p className="text-xs text-muted-foreground mt-1">Average latency</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(systemHealth.status)}>
                      {systemHealth.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-semibold">{formatUptime(systemHealth.uptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queue Size</span>
                    <span className="font-semibold">{systemHealth.queueSize} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Circuit Breaker</span>
                    <Badge variant={systemHealth.circuitBreakerStatus === "closed" ? "default" : "destructive"}>
                      {systemHealth.circuitBreakerStatus.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-right">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}

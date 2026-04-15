import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp, Clock, AlertTriangle, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AnomalyAlert {
  id: string;
  type: "success_rate_drop" | "duration_spike" | "error_rate_increase" | "queue_buildup" | "throughput_drop";
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  deviationPercent: number;
  threshold: number;
  message: string;
  detectedAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

export default function AnomalyAlertsDashboard() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const detectAnomaliesQuery = trpc.anomalyDetection.detectAllAnomalies.useQuery(
    {},
    {
      enabled: autoRefresh,
      refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    }
  );

  useEffect(() => {
    if (detectAnomaliesQuery.data) {
      setAlerts(detectAnomaliesQuery.data.alerts || []);
    }
  }, [detectAnomaliesQuery.data]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.severity === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "low":
        return <Activity className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "success_rate_drop":
        return <TrendingDown className="w-4 h-4" />;
      case "duration_spike":
        return <TrendingUp className="w-4 h-4" />;
      case "error_rate_increase":
        return <AlertTriangle className="w-4 h-4" />;
      case "queue_buildup":
        return <Activity className="w-4 h-4" />;
      case "throughput_drop":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const mediumCount = alerts.filter((a) => a.severity === "medium").length;
  const lowCount = alerts.filter((a) => a.severity === "low").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Anomaly Detection</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of job metrics and system health</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
          </Button>
          <Button onClick={() => detectAnomaliesQuery.refetch()} variant="outline" size="sm">
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-gray-500 mt-1">Immediate action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highCount}</div>
            <p className="text-xs text-gray-500 mt-1">Attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediumCount}</div>
            <p className="text-xs text-gray-500 mt-1">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowCount}</div>
            <p className="text-xs text-gray-500 mt-1">Informational</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({alerts.length})
        </Button>
        <Button
          variant={filter === "critical" ? "default" : "outline"}
          onClick={() => setFilter("critical")}
          size="sm"
          className={filter === "critical" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Critical ({criticalCount})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          onClick={() => setFilter("high")}
          size="sm"
          className={filter === "high" ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          High ({highCount})
        </Button>
        <Button
          variant={filter === "medium" ? "default" : "outline"}
          onClick={() => setFilter("medium")}
          size="sm"
          className={filter === "medium" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          Medium ({mediumCount})
        </Button>
        <Button
          variant={filter === "low" ? "default" : "outline"}
          onClick={() => setFilter("low")}
          size="sm"
          className={filter === "low" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Low ({lowCount})
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No anomalies detected</p>
                <p className="text-sm text-gray-400 mt-1">System is operating normally</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{alert.type.replace(/_/g, " ").toUpperCase()}</h3>
                        <Badge variant="outline" className="text-xs">
                          {alert.metric}
                        </Badge>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{alert.message}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-semibold">{alert.currentValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected Value</p>
                          <p className="font-semibold">{alert.expectedValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deviation</p>
                          <p className="font-semibold">
                            {alert.deviation.toFixed(2)} ({alert.deviationPercent.toFixed(1)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Threshold</p>
                          <p className="font-semibold">{alert.threshold.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Loading State */}
      {detectAnomaliesQuery.isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-block animate-spin">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mt-3">Analyzing metrics...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

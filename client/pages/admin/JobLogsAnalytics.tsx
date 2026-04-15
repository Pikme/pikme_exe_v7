import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

/**
 * Job Logs Analytics Dashboard
 * Analyze job execution patterns and performance trends
 */
export default function JobLogsAnalytics() {
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d">("24h");

  // Calculate date range
  const getDays = () => (dateRange === "24h" ? 1 : dateRange === "7d" ? 7 : 30);
  const startDate = new Date(Date.now() - getDays() * 24 * 60 * 60 * 1000);
  const endDate = new Date();

  // Fetch performance metrics
  const { data: performanceMetrics } = trpc.jobMonitoring.getPerformanceMetrics.useQuery(
    { startDate, endDate },
    { refetchInterval: 30000 }
  );

  // Fetch error diagnostics
  const { data: errorDiagnostics } = trpc.jobMonitoring.getErrorDiagnostics.useQuery(
    { startDate, endDate },
    { refetchInterval: 30000 }
  );

  // Fetch job type distribution
  const { data: jobDistribution } = trpc.jobMonitoring.getJobTypeDistribution.useQuery(
    { startDate, endDate },
    { refetchInterval: 30000 }
  );

  // Fetch queue performance
  const { data: queuePerformance } = trpc.jobMonitoring.getQueuePerformanceComparison.useQuery(
    { startDate, endDate },
    { refetchInterval: 30000 }
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Logs Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze job execution patterns and performance trends</p>
        </div>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range === "24h" ? "Last 24h" : range === "7d" ? "Last 7d" : "Last 30d"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performanceMetrics?.totalJobs || 0}</div>
            <p className="text-xs text-gray-500 mt-2">Processed in period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">
                {(performanceMetrics?.successRate || 0).toFixed(1)}%
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {performanceMetrics?.successfulJobs || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-red-600">
                {(performanceMetrics?.failureRate || 0).toFixed(1)}%
              </div>
              {(performanceMetrics?.failureRate || 0) > 5 && (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {performanceMetrics?.failedJobs || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(performanceMetrics?.averageDuration || 0).toFixed(0)}ms
            </div>
            <p className="text-xs text-gray-500 mt-2">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Min Duration</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.minDuration || 0).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Max Duration</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.maxDuration || 0).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Processing</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.averageProcessingTime || 0).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Queue Wait Time</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.averageQueueWaitTime || 0).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Throughput</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.throughput || 0).toFixed(2)} jobs/min
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">P95 Duration</p>
                    <p className="text-2xl font-bold">
                      {(performanceMetrics?.p95Duration || 0).toFixed(0)}ms
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Job Type Distribution</CardTitle>
              <CardDescription>Distribution of job types processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobDistribution &&
                  Object.entries(jobDistribution).map(([jobType, count]: [string, any]) => {
                    const total = performanceMetrics?.totalJobs || 1;
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={jobType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{jobType}</span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>Error patterns and diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              {errorDiagnostics && Object.keys(errorDiagnostics).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(errorDiagnostics).map(([errorCode, details]: [string, any]) => (
                    <div key={errorCode} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-red-900">{errorCode}</p>
                          <p className="text-sm text-red-800 mt-1">{details.message}</p>
                          <p className="text-xs text-red-700 mt-2">
                            Occurrences: <span className="font-bold">{details.count}</span>
                          </p>
                        </div>
                        <Badge
                          className={
                            details.severity === "high"
                              ? "bg-red-600"
                              : details.severity === "medium"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }
                        >
                          {details.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No errors in this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queues Tab */}
        <TabsContent value="queues">
          <Card>
            <CardHeader>
              <CardTitle>Queue Performance Comparison</CardTitle>
              <CardDescription>Performance metrics by queue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queuePerformance?.map((queue: any) => (
                  <div key={queue.queue} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{queue.queue}</h4>
                      <Badge>{queue.totalJobs} jobs</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="text-lg font-semibold text-green-600">
                          {(queue.successRate || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="text-lg font-semibold">
                          {(queue.averageDuration || 0).toFixed(0)}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Successful</p>
                        <p className="text-lg font-semibold text-green-600">
                          {queue.successfulJobs}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="text-lg font-semibold text-red-600">
                          {queue.failedJobs}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

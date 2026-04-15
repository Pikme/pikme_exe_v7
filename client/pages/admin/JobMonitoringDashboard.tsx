import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, RefreshCw, Zap } from "lucide-react";

/**
 * Job Monitoring Dashboard
 * Real-time monitoring of job queues, execution, and performance
 */
export default function JobMonitoringDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch queue stats
  const { data: queueStats, refetch: refetchQueueStats } = trpc.jobMonitoring.getQueueStats.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? refreshInterval : false }
  );

  // Fetch job statistics summary
  const { data: jobStats, refetch: refetchJobStats } = trpc.jobMonitoring.getJobStatisticsSummary.useQuery(
    {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    { refetchInterval: autoRefresh ? refreshInterval : false }
  );

  // Fetch executor status
  const { data: executorStatus, refetch: refetchExecutorStatus } = trpc.jobMonitoring.getExecutorStatus.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? refreshInterval : false }
  );

  // Fetch recent errors
  const { data: recentErrors, refetch: refetchErrors } = trpc.jobMonitoring.getRecentErrors.useQuery(
    { limit: 10 },
    { refetchInterval: autoRefresh ? refreshInterval : false }
  );

  // Fetch job type distribution
  const { data: jobDistribution, refetch: refetchDistribution } = trpc.jobMonitoring.getJobTypeDistribution.useQuery(
    {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    { refetchInterval: autoRefresh ? refreshInterval : false }
  );

  // Fetch queue performance comparison
  const { data: queueComparison, refetch: refetchComparison } =
    trpc.jobMonitoring.getQueuePerformanceComparison.useQuery(
      {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      { refetchInterval: autoRefresh ? refreshInterval : false }
    );

  // Executor control mutations
  const startExecutorMutation = trpc.jobMonitoring.startExecutor.useMutation();
  const stopExecutorMutation = trpc.jobMonitoring.stopExecutor.useMutation();

  const handleStartExecutor = async () => {
    await startExecutorMutation.mutateAsync();
    refetchExecutorStatus();
  };

  const handleStopExecutor = async () => {
    await stopExecutorMutation.mutateAsync();
    refetchExecutorStatus();
  };

  const handleManualRefresh = () => {
    refetchQueueStats();
    refetchJobStats();
    refetchExecutorStatus();
    refetchErrors();
    refetchDistribution();
    refetchComparison();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of job queues and execution</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button onClick={handleManualRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Executor Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Schedule Executor
          </CardTitle>
          <CardDescription>Manage automated schedule execution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold">{getStatusBadge(executorStatus?.status || "unknown")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Run</p>
                <p className="text-lg font-semibold">
                  {executorStatus?.lastRun ? new Date(executorStatus.lastRun).toLocaleString() : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Run</p>
                <p className="text-lg font-semibold">
                  {executorStatus?.nextRun ? new Date(executorStatus.nextRun).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStartExecutor}
                disabled={executorStatus?.status === "active"}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Start
              </Button>
              <Button
                onClick={handleStopExecutor}
                disabled={executorStatus?.status === "inactive"}
                variant="destructive"
                className="gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.totalJobs || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{jobStats?.successfulJobs || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{jobStats?.successRate || 0}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{jobStats?.failedJobs || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{jobStats?.failureRate || 0}% failure rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.averageMetrics?.duration || 0}ms</div>
            <p className="text-xs text-gray-500 mt-1">Processing time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queues" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queues">Queue Status</TabsTrigger>
          <TabsTrigger value="distribution">Job Distribution</TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
        </TabsList>

        {/* Queue Status Tab */}
        <TabsContent value="queues">
          <Card>
            <CardHeader>
              <CardTitle>Queue Performance Comparison</CardTitle>
              <CardDescription>Performance metrics for each job queue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueComparison?.map((queue: any) => (
                  <div key={queue.queue} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{queue.queue}</h4>
                      <Badge>{queue.totalJobs} jobs</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="text-lg font-semibold">{(queue.successRate || 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Duration</p>
                        <p className="text-lg font-semibold">{(queue.averageDuration || 0).toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Successful</p>
                        <p className="text-lg font-semibold text-green-600">{queue.successfulJobs}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="text-lg font-semibold text-red-600">{queue.failedJobs}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Distribution Tab */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Job Type Distribution</CardTitle>
              <CardDescription>Distribution of job types processed in last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobDistribution &&
                  Object.entries(jobDistribution).map(([jobType, count]: [string, any]) => (
                    <div key={jobType} className="flex items-center justify-between">
                      <span className="font-medium">{jobType}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${
                                ((count / (jobStats?.totalJobs || 1)) * 100).toFixed(0) + "%"
                              }`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Errors Tab */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest unresolved errors from job execution</CardDescription>
            </CardHeader>
            <CardContent>
              {recentErrors && recentErrors.length > 0 ? (
                <div className="space-y-3">
                  {recentErrors.map((error: any) => (
                    <div key={error.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-red-900">{error.errorCode}</p>
                          <p className="text-sm text-red-800 mt-1">{error.errorMessage}</p>
                          <p className="text-xs text-red-700 mt-2">
                            {new Date(error.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            error.severity === "high"
                              ? "bg-red-600"
                              : error.severity === "medium"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }
                        >
                          {error.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No recent errors</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

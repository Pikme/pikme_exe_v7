import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play, Pause, RotateCcw, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SchedulerManagement() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Queries
  const statusQuery = trpc.schedulerMonitoring.getStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const healthQuery = trpc.schedulerMonitoring.getHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const detailsQuery = trpc.schedulerMonitoring.getDetails.useQuery(undefined, {
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Mutations
  const triggerCheckMutation = trpc.schedulerMonitoring.triggerCheck.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      detailsQuery.refetch();
    },
  });

  const stopMutation = trpc.schedulerMonitoring.stop.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      healthQuery.refetch();
    },
  });

  const resumeMutation = trpc.schedulerMonitoring.resume.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      healthQuery.refetch();
    },
  });

  const resetStatsMutation = trpc.schedulerMonitoring.resetStats.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      detailsQuery.refetch();
    },
  });

  const status = statusQuery.data?.status;
  const health = healthQuery.data?.health;
  const details = detailsQuery.data;

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Rotation Scheduler</h2>
          <p className="text-sm text-muted-foreground">Automated 24-hour key rotation monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border"
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="text-sm border rounded px-2 py-1"
            disabled={!autoRefresh}
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
        </div>
      </div>

      {/* Health Status Alert */}
      {health && (
        <Alert variant={health.healthy ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            {health.healthy ? (
              <CheckCircle className="h-4 w-4 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <AlertDescription>{health.message}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Running Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-semibold">{status?.isRunning ? 'Running' : 'Stopped'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checks Completed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.checksCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">Total rotation checks</p>
          </CardContent>
        </Card>

        {/* Rotations Initiated */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rotations Initiated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.checksWithRotation || 0}</div>
            <p className="text-xs text-muted-foreground">Key rotations triggered</p>
          </CardContent>
        </Card>

        {/* Last Check Age */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{formatDuration(health?.lastCheckAge)}</div>
            <p className="text-xs text-muted-foreground">Time since last check</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Details</CardTitle>
          <CardDescription>Comprehensive scheduler information and timestamps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Check Time</p>
              <p className="text-sm font-mono">{details?.lastCheckTime || 'Never'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Check Time</p>
              <p className="text-sm font-mono">{details?.nextCheckTime || 'Pending'}</p>
            </div>
            {status?.lastError && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Error</p>
                  <p className="text-sm font-mono text-red-600">{status.lastError}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Time</p>
                  <p className="text-sm font-mono">{details?.lastErrorTime || 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Controls</CardTitle>
          <CardDescription>Manage scheduler operation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={() => triggerCheckMutation.mutate()}
            disabled={triggerCheckMutation.isPending || !status?.isRunning}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Trigger Check Now
          </Button>

          {status?.isRunning ? (
            <Button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              variant="destructive"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop Scheduler
            </Button>
          ) : (
            <Button
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              variant="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Scheduler
            </Button>
          )}

          <Button
            onClick={() => resetStatsMutation.mutate()}
            disabled={resetStatsMutation.isPending}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Statistics
          </Button>
        </CardContent>
      </Card>

      {/* Loading States */}
      {(statusQuery.isLoading || healthQuery.isLoading) && (
        <div className="text-center text-sm text-muted-foreground">Loading scheduler information...</div>
      )}
    </div>
  );
}

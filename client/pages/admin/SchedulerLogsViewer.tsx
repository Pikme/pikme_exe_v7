import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  RefreshCw,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LogType = 'all' | 'checks' | 'rotations' | 'errors';
type TimeRange = 'today' | 'week' | 'month' | 'all';

export function SchedulerLogsViewer() {
  const [logType, setLogType] = useState<LogType>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange();

  // Queries
  const summaryQuery = trpc.schedulerLogs.getSummary.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const logsQuery = trpc.schedulerLogs.getExecutionLogs.useQuery(
    {
      limit: 20,
      offset: page * 20,
      startDate,
      endDate,
    },
    {
      refetchInterval: autoRefresh ? 30000 : false,
    }
  );

  const rotationEventsQuery = trpc.schedulerLogs.getRotationEvents.useQuery(
    {
      limit: 20,
      offset: page * 20,
      startDate,
      endDate,
    },
    {
      refetchInterval: autoRefresh ? 30000 : false,
    }
  );

  const errorHistoryQuery = trpc.schedulerLogs.getErrorHistory.useQuery(
    {
      limit: 20,
      offset: page * 20,
      startDate,
      endDate,
    },
    {
      refetchInterval: autoRefresh ? 30000 : false,
    }
  );

  // Mutations
  const exportMutation = trpc.schedulerLogs.exportLogs.useMutation();

  const summary = summaryQuery.data?.summary;
  const logs = logsQuery.data?.logs || [];
  const rotationEvents = rotationEventsQuery.data?.events || [];
  const errors = errorHistoryQuery.data?.errors || [];

  // Filter logs based on type
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (logType === 'errors') {
      result = result.filter((log) => log.type === 'error');
    } else if (logType === 'rotations') {
      result = result.filter((log) => log.type === 'rotation_event');
    } else if (logType === 'checks') {
      result = result.filter((log) => log.type === 'check_completed');
    }

    if (searchTerm) {
      result = result.filter((log) =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [logs, logType, searchTerm]);

  const handleExport = async (format: 'json' | 'csv') => {
    const result = await exportMutation.mutateAsync({
      format,
      startDate,
      endDate,
    });

    if (result.success && result.data && result.filename) {
      // Create download link
      const element = document.createElement('a');
      element.setAttribute('href', `data:${result.mimeType};charset=utf-8,${encodeURIComponent(result.data)}`);
      element.setAttribute('download', result.filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduler Logs</h2>
          <p className="text-sm text-muted-foreground">View execution logs, rotation events, and error history</p>
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              logsQuery.refetch();
              rotationEventsQuery.refetch();
              errorHistoryQuery.refetch();
              summaryQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduler Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    summary.schedulerStatus === 'running' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-semibold capitalize">{summary.schedulerStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalChecks}</div>
              <p className="text-xs text-muted-foreground">Rotation checks completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rotations Initiated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalRotations}</div>
              <p className="text-xs text-muted-foreground">Key rotations triggered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {summary.schedulerHealth === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-semibold capitalize">{summary.schedulerHealth}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Log Type</label>
              <Select value={logType} onValueChange={(value) => setLogType(value as LogType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="checks">Checks</SelectItem>
                  <SelectItem value="rotations">Rotations</SelectItem>
                  <SelectItem value="errors">Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('json')}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>Recent scheduler execution events</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No logs found</div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="mt-1">
                    {log.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.message}</span>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(log.timestamp)}</p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Details
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {page * 20 + 1} to {Math.min((page + 1) * 20, logsQuery.data?.total || 0)} of{' '}
                {logsQuery.data?.total || 0}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={!logsQuery.data?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error History */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Error events from the last period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((error, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{error.eventType}</div>
                    <div className="text-xs mt-1">{formatDate(error.createdAt)}</div>
                    {error.details && (
                      <pre className="mt-2 text-xs p-2 bg-muted rounded overflow-auto max-h-32">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(logsQuery.isLoading || rotationEventsQuery.isLoading) && (
        <div className="text-center text-sm text-muted-foreground">Loading logs...</div>
      )}
    </div>
  );
}

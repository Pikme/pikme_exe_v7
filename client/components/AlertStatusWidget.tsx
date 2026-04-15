import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bell, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'wouter';

export function AlertStatusWidget() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Queries
  const summaryQuery = trpc.schedulerAlertsWidget.getAlertSummary.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const criticalAlertsQuery = trpc.schedulerAlertsWidget.getCriticalAlerts.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Mutations
  const acknowledgeMutation = trpc.schedulerAlertsWidget.quickAcknowledge.useMutation({
    onSuccess: () => {
      summaryQuery.refetch();
      criticalAlertsQuery.refetch();
    },
  });

  const resolveMutation = trpc.schedulerAlertsWidget.quickResolve.useMutation({
    onSuccess: () => {
      summaryQuery.refetch();
      criticalAlertsQuery.refetch();
    },
  });

  const summary = summaryQuery.data;
  const alerts = criticalAlertsQuery.data?.alerts || [];

  // Determine widget status color
  const getStatusColor = () => {
    if (!summary) return 'border-gray-300';
    switch (summary.status) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'warning':
        return 'border-orange-300 bg-orange-50';
      default:
        return 'border-green-300 bg-green-50';
    }
  };

  const getStatusIcon = () => {
    if (!summary) return <Bell className="h-5 w-5 text-gray-500" />;
    switch (summary.status) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Zap className="h-5 w-5 text-orange-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()} transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-base">Alert Status</CardTitle>
              <CardDescription className="text-xs">
                {summary?.status === 'critical'
                  ? 'Critical alerts require attention'
                  : summary?.status === 'warning'
                    ? 'Warning alerts detected'
                    : 'All systems healthy'}
              </CardDescription>
            </div>
          </div>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto
          </label>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white/50 rounded">
              <div className="text-lg font-bold text-red-600">{summary.criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="p-2 bg-white/50 rounded">
              <div className="text-lg font-bold text-orange-600">{summary.highCount}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="p-2 bg-white/50 rounded">
              <div className="text-lg font-bold text-blue-600">{summary.totalUnresolved}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}

        {/* Critical Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded border text-xs space-y-1 ${getSeverityBadgeColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{alert.message}</p>
                    <p className="text-xs opacity-75">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {alert.severity}
                  </Badge>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1 pt-1">
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs flex-1"
                      onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })}
                      disabled={acknowledgeMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {!alert.resolvedAt && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs flex-1"
                      onClick={() => resolveMutation.mutate({ alertId: alert.id })}
                      disabled={resolveMutation.isPending}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No critical alerts
          </div>
        )}

        {/* View All Link */}
        <Link href="/admin/scheduler-logs" className="block">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View All Alerts
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>

        {/* Loading State */}
        {(summaryQuery.isLoading || criticalAlertsQuery.isLoading) && (
          <div className="text-center text-xs text-muted-foreground">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}

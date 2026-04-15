import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, RotateCcw, TrendingUp } from 'lucide-react';

export function RotationEventsTimeline() {
  const eventsQuery = trpc.schedulerLogs.getRotationEvents.useQuery({
    limit: 100,
    offset: 0,
  });

  const events = eventsQuery.data?.events || [];

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const weekEvents = events.filter((e) => new Date(e.createdAt).getTime() > oneWeekAgo);
    const monthEvents = events.filter((e) => new Date(e.createdAt).getTime() > oneMonthAgo);

    const successCount = events.filter((e) => e.eventType === 'rotation_completed').length;
    const failureCount = events.filter((e) => e.eventType === 'rotation_failed').length;
    const successRate = events.length > 0 ? (successCount / events.length) * 100 : 0;

    return {
      totalEvents: events.length,
      weekEvents: weekEvents.length,
      monthEvents: monthEvents.length,
      successCount,
      failureCount,
      successRate: successRate.toFixed(1),
      averagePerWeek: (monthEvents.length / 4).toFixed(1),
    };
  }, [events]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'rotation_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rotation_failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'rotation_started':
        return <RotateCcw className="h-5 w-5 text-blue-500" />;
      case 'key_generated':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'rotation_completed':
        return 'bg-green-50 border-green-200';
      case 'rotation_failed':
        return 'bg-red-50 border-red-200';
      case 'rotation_started':
        return 'bg-blue-50 border-blue-200';
      case 'key_generated':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatTimeAgo = (date: string) => {
    const now = Date.now();
    const eventTime = new Date(date).getTime();
    const diff = now - eventTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weekEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.failureCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Rotation Events Timeline</CardTitle>
          <CardDescription>Chronological history of key rotation events</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No rotation events yet</div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${getEventColor(event.eventType)}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getEventIcon(event.eventType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{formatEventType(event.eventType)}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatTimeAgo(event.createdAt)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{formatDate(event.createdAt)}</p>

                      {event.keyId && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-mono">Key: {event.keyId.substring(0, 16)}...</span>
                        </p>
                      )}

                      {event.userName && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">By:</span> {event.userName}
                        </p>
                      )}

                      {event.details && Object.keys(event.details).length > 0 && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                            Details
                          </summary>
                          <pre className="mt-2 p-2 bg-white/50 rounded text-xs overflow-auto max-h-32 border">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {eventsQuery.isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading events...</div>
          )}
        </CardContent>
      </Card>

      {/* Event Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Event Statistics</CardTitle>
          <CardDescription>Breakdown of rotation events by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'rotation_completed', label: 'Completed', color: 'bg-green-500' },
              { type: 'rotation_failed', label: 'Failed', color: 'bg-red-500' },
              { type: 'rotation_started', label: 'Started', color: 'bg-blue-500' },
              { type: 'key_generated', label: 'Keys Generated', color: 'bg-purple-500' },
            ].map((stat) => {
              const count = events.filter((e) => e.eventType === stat.type).length;
              const percentage = events.length > 0 ? (count / events.length) * 100 : 0;
              return (
                <div key={stat.type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stat.label}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Bell, CheckCircle, Clock, RefreshCw, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SchedulerAlertConfig() {
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Queries
  const configsQuery = trpc.schedulerAlerts.getConfigs.useQuery();
  const statsQuery = trpc.schedulerAlerts.getStats.useQuery();
  const historyQuery = trpc.schedulerAlerts.getHistory.useQuery({ limit: 10, offset: 0 });

  // Mutations
  const updateMutation = trpc.schedulerAlerts.updateConfig.useMutation({
    onSuccess: () => {
      configsQuery.refetch();
      setEditingAlert(null);
      setFormData({});
    },
  });

  const initializeMutation = trpc.schedulerAlerts.initializeDefaults.useMutation({
    onSuccess: () => {
      configsQuery.refetch();
    },
  });

  const configs = configsQuery.data || [];
  const stats = statsQuery.data;
  const alerts = historyQuery.data?.alerts || [];

  const handleEdit = (config: any) => {
    setEditingAlert(config.alertType);
    setFormData(config);
  };

  const handleSave = async () => {
    if (!editingAlert) return;

    await updateMutation.mutateAsync({
      alertType: editingAlert,
      enabled: formData.enabled,
      threshold: formData.threshold,
      notifyAdmins: formData.notifyAdmins,
      notifyEmail: formData.notifyEmail,
      cooldownMinutes: formData.cooldownMinutes,
    });
  };

  const formatAlertType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSeverityColor = (severity: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure thresholds and notifications for scheduler events
          </p>
        </div>
        <Button
          onClick={() => initializeMutation.mutate()}
          disabled={initializeMutation.isPending || configs.length > 0}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Initialize Defaults
        </Button>
      </div>

      {/* Alert Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unresolvedAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unacknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unacknowledgedAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.bySeverity['critical'] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.bySeverity['high'] || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>Configure when alerts should be triggered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alert configurations found. Click "Initialize Defaults" to create them.
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.alertType} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{formatAlertType(config.alertType)}</h3>
                    <p className="text-sm text-muted-foreground">
                      Triggers when threshold is exceeded
                    </p>
                  </div>
                  <Badge variant={config.enabled ? 'default' : 'secondary'}>
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                {editingAlert === config.alertType ? (
                  <div className="space-y-4 bg-muted/50 p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Threshold Value</label>
                        <Input
                          type="number"
                          value={formData.threshold}
                          onChange={(e) =>
                            setFormData({ ...formData, threshold: parseInt(e.target.value) })
                          }
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Cooldown (minutes)</label>
                        <Input
                          type="number"
                          value={formData.cooldownMinutes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cooldownMinutes: parseInt(e.target.value),
                            })
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Switch
                          checked={formData.enabled}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, enabled: checked })
                          }
                        />
                        Enable this alert
                      </label>

                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Switch
                          checked={formData.notifyAdmins}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyAdmins: checked })
                          }
                        />
                        Notify admins
                      </label>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Email (optional)</label>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        value={formData.notifyEmail || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, notifyEmail: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAlert(null);
                          setFormData({});
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Threshold:</span> {config.threshold}
                      </p>
                      <p>
                        <span className="font-medium">Cooldown:</span> {config.cooldownMinutes}{' '}
                        minutes
                      </p>
                      {config.lastAlertTime && (
                        <p className="text-xs text-muted-foreground">
                          Last alert: {new Date(config.lastAlertTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest triggered alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3 flex items-start gap-3 ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  {alert.severity === 'critical' || alert.severity === 'high' ? (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Bell className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                    {alert.acknowledged && (
                      <p className="text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Acknowledged
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {configsQuery.isLoading && (
        <div className="text-center text-sm text-muted-foreground">Loading configurations...</div>
      )}
    </div>
  );
}

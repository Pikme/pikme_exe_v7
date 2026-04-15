import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Pause,
  Play,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  FileJson,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuditAction = 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'pause' | 'resume' | 'test';

const ACTION_ICONS: Record<AuditAction, React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <Eye className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  activate: <CheckCircle className="h-4 w-4" />,
  deactivate: <AlertCircle className="h-4 w-4" />,
  pause: <Pause className="h-4 w-4" />,
  resume: <Play className="h-4 w-4" />,
  test: <Clock className="h-4 w-4" />,
};

const ACTION_COLORS: Record<AuditAction, string> = {
  create: 'bg-green-50',
  update: 'bg-blue-50',
  delete: 'bg-red-50',
  activate: 'bg-green-50',
  deactivate: 'bg-red-50',
  pause: 'bg-yellow-50',
  resume: 'bg-green-50',
  test: 'bg-purple-50',
};

interface AuditLogEntry {
  id: number;
  webhookEndpointId: string;
  action: AuditAction;
  userId: number;
  userName?: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export function WebhookAuditLog() {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all');
  const [endpointFilter, setEndpointFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Fetch audit logs
  const { data: logs = [], isLoading, refetch } = trpc.webhook.getAuditLogs.useQuery({
    action: selectedAction !== 'all' ? (selectedAction as AuditAction) : undefined,
    endpointId: endpointFilter || undefined,
    limit: 100,
  });

  // Fetch statistics
  const { data: stats = {} } = trpc.webhook.getAuditStats.useQuery();

  const handleActionChange = (value: string) => {
    setSelectedAction(value as AuditAction | 'all');
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await trpc.webhook.exportAuditLogs.useQuery({
        format: exportFormat,
        action: selectedAction !== 'all' ? (selectedAction as AuditAction) : undefined,
        endpointId: endpointFilter || undefined,
        limit: 1000,
        encrypt: enableEncryption,
        encryptionPassword: enableEncryption ? encryptionPassword : undefined,
      }).refetch();

      if (result.data) {
        const { content, filename, mimeType } = result.data;
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: `Audit logs exported as ${exportFormat.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString();
  };

  const getActionLabel = (action: AuditAction): string => {
    const labels: Record<AuditAction, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      activate: 'Activated',
      deactivate: 'Deactivated',
      pause: 'Paused',
      resume: 'Resumed',
      test: 'Tested',
    };
    return labels[action];
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pause || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resumed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resume || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.delete || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Audit Logs</CardTitle>
          <CardDescription>Download audit logs for compliance reporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'csv' | 'json')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={enableEncryption} onChange={(e) => {
                  setEnableEncryption(e.target.checked);
                  setShowPasswordInput(e.target.checked);
                }} className="w-4 h-4" />
                <span className="text-sm font-medium">Encrypt</span>
              </label>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} disabled={isExporting || (enableEncryption && !encryptionPassword)} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
          {showPasswordInput && enableEncryption && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">Encryption Password</label>
              <input type="password" placeholder="Enter a strong password (min 8 characters)" value={encryptionPassword} onChange={(e) => setEncryptionPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <p className="text-xs text-gray-500 mt-2">Password required to decrypt. Store securely.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={selectedAction} onValueChange={handleActionChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Created</SelectItem>
                  <SelectItem value="update">Updated</SelectItem>
                  <SelectItem value="delete">Deleted</SelectItem>
                  <SelectItem value="activate">Activated</SelectItem>
                  <SelectItem value="deactivate">Deactivated</SelectItem>
                  <SelectItem value="pause">Paused</SelectItem>
                  <SelectItem value="resume">Resumed</SelectItem>
                  <SelectItem value="test">Tested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Endpoint ID</label>
              <Input
                placeholder="Filter by endpoint ID..."
                value={endpointFilter}
                onChange={(e) => setEndpointFilter(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={() => refetch()} variant="outline" className="w-full">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>All webhook endpoint changes and actions</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Endpoint ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${ACTION_COLORS[log.action as AuditAction]}`}
                        >
                          {ACTION_ICONS[log.action as AuditAction]}
                          <span className="ml-1">{getActionLabel(log.action as AuditAction)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm truncate max-w-xs">
                        {log.webhookEndpointId}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.userName || `User #${log.userId}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.reason || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLog(log)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Audit Log Details</DialogTitle>
                              <DialogDescription>
                                {getActionLabel(log.action as AuditAction)} on{' '}
                                {formatDate(log.createdAt)}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Endpoint ID
                                  </p>
                                  <p className="text-sm font-mono break-all">
                                    {log.webhookEndpointId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    User
                                  </p>
                                  <p className="text-sm">
                                    {log.userName || `User #${log.userId}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    IP Address
                                  </p>
                                  <p className="text-sm">{log.ipAddress || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Timestamp
                                  </p>
                                  <p className="text-sm">{formatDate(log.createdAt)}</p>
                                </div>
                              </div>

                              {/* Reason */}
                              {log.reason && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Reason
                                  </p>
                                  <p className="text-sm bg-muted p-2 rounded">{log.reason}</p>
                                </div>
                              )}

                              {/* Previous State */}
                              {log.previousState && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Previous State
                                  </p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.previousState, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* New State */}
                              {log.newState && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">
                                    New State
                                  </p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.newState, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Details */}
                              {log.details && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Details
                                  </p>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

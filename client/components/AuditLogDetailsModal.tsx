import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  description?: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  errorMessage?: string;
  createdAt: Date;
}

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog | null;
  onSelectLog?: (log: AuditLog) => void;
  userLogs?: AuditLog[];
  entityLogs?: AuditLog[];
  onFilterByEntity?: (entityType: string, entityId?: number) => void;
}

const getActionBadgeColor = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "delete":
      return "bg-red-100 text-red-800";
    case "export":
      return "bg-purple-100 text-purple-800";
    case "import":
      return "bg-orange-100 text-orange-800";
    case "view":
      return "bg-gray-100 text-gray-800";
    case "login":
      return "bg-indigo-100 text-indigo-800";
    case "logout":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEntityTypeBadgeColor = (entityType: string) => {
  switch (entityType) {
    case "tour":
      return "bg-indigo-100 text-indigo-800";
    case "location":
      return "bg-cyan-100 text-cyan-800";
    case "state":
      return "bg-teal-100 text-teal-800";
    case "country":
      return "bg-sky-100 text-sky-800";
    case "category":
      return "bg-amber-100 text-amber-800";
    case "activity":
      return "bg-pink-100 text-pink-800";
    case "attraction":
      return "bg-rose-100 text-rose-800";
    case "user":
      return "bg-violet-100 text-violet-800";
    case "system":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const JSONDiffViewer = ({ previous, current }: { previous?: Record<string, any>; current?: Record<string, any> }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!previous && !current) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data changes recorded</p>
      </div>
    );
  }

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(current || {}),
  ]);

  return (
    <div className="space-y-3">
      {Array.from(allKeys).map((key) => {
        const prevValue = previous?.[key];
        const currValue = current?.[key];
        const hasChanged = JSON.stringify(prevValue) !== JSON.stringify(currValue);

        return (
          <div
            key={key}
            className={`p-3 rounded border ${
              hasChanged ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-semibold text-gray-900">{key}</code>
                {hasChanged && (
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                    Changed
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Previous Value */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Previous</p>
                <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono break-words max-h-32 overflow-y-auto">
                  {prevValue === undefined ? (
                    <span className="text-gray-400 italic">undefined</span>
                  ) : typeof prevValue === "object" ? (
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(prevValue, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-700">{String(prevValue)}</span>
                  )}
                </div>
                {prevValue !== undefined && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        typeof prevValue === "object" ? JSON.stringify(prevValue) : String(prevValue),
                        `prev-${key}`
                      )
                    }
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedField === `prev-${key}` ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Current Value */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Current</p>
                <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono break-words max-h-32 overflow-y-auto">
                  {currValue === undefined ? (
                    <span className="text-gray-400 italic">undefined</span>
                  ) : typeof currValue === "object" ? (
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(currValue, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-700">{String(currValue)}</span>
                  )}
                </div>
                {currValue !== undefined && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        typeof currValue === "object" ? JSON.stringify(currValue) : String(currValue),
                        `curr-${key}`
                      )
                    }
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedField === `curr-${key}` ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function AuditLogDetailsModal({
  isOpen,
  onClose,
  auditLog,
  onSelectLog,
  userLogs = [],
  entityLogs = [],
  onFilterByEntity,
}: AuditLogDetailsModalProps) {
  const [showUserLogs, setShowUserLogs] = useState(false);
  const [showEntityLogs, setShowEntityLogs] = useState(false);
  const [filterMode, setFilterMode] = useState<'user' | 'entity'>('user');
  
  const currentLogIndex = userLogs.findIndex((log) => log.id === auditLog?.id) ?? -1;
  const hasPrevious = currentLogIndex > 0;
  const hasNext = currentLogIndex < userLogs.length - 1;
  
  const currentEntityLogIndex = entityLogs.findIndex((log) => log.id === auditLog?.id) ?? -1;
  const hasEntityPrevious = currentEntityLogIndex > 0;
  const hasEntityNext = currentEntityLogIndex < entityLogs.length - 1;

  const handlePreviousLog = () => {
    if (hasPrevious && userLogs[currentLogIndex - 1]) {
      onSelectLog?.(userLogs[currentLogIndex - 1]);
    }
  };

  const handleNextLog = () => {
    if (hasNext && userLogs[currentLogIndex + 1]) {
      onSelectLog?.(userLogs[currentLogIndex + 1]);
    }
  };

  const handlePreviousEntityLog = () => {
    if (hasEntityPrevious && entityLogs[currentEntityLogIndex - 1]) {
      onSelectLog?.(entityLogs[currentEntityLogIndex - 1]);
    }
  };

  const handleNextEntityLog = () => {
    if (hasEntityNext && entityLogs[currentEntityLogIndex + 1]) {
      onSelectLog?.(entityLogs[currentEntityLogIndex + 1]);
    }
  };

  const handleFilterByEntity = () => {
    if (auditLog?.entityType && auditLog?.entityId) {
      onFilterByEntity?.(auditLog.entityType, auditLog.entityId);
      setFilterMode('entity');
      setShowEntityLogs(true);
    }
  };

  if (!auditLog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Complete information about this audit log entry
              </DialogDescription>
            </div>
            {userLogs.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousLog}
                  disabled={!hasPrevious}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {currentLogIndex + 1} / {userLogs.length}
                </span>
                <button
                  onClick={handleNextLog}
                  disabled={!hasNext}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {userLogs.length > 1 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <button
              onClick={() => setShowUserLogs(!showUserLogs)}
              className="text-sm font-medium text-blue-900 hover:text-blue-700 w-full text-left"
            >
              {showUserLogs ? "▼" : "▶"} Show all logs from {auditLog.userName} ({userLogs.length})
            </button>
            {showUserLogs && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {userLogs.map((log, index) => (
                  <button
                    key={log.id}
                    onClick={() => {
                      onSelectLog?.(log);
                      setShowUserLogs(false);
                    }}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      log.id === auditLog.id
                        ? "bg-blue-200 text-blue-900 font-semibold"
                        : "bg-white hover:bg-blue-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {index + 1}. {log.action} - {log.entityType}
                        {log.entityName && ` (${log.entityName})`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User</p>
                    <p className="text-sm text-gray-900 font-semibold">{auditLog.userName}</p>
                    {auditLog.userEmail && (
                      <p className="text-xs text-gray-500">{auditLog.userEmail}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">User ID</p>
                    <p className="text-sm text-gray-900">{auditLog.userId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Action</p>
                    <Badge className={`${getActionBadgeColor(auditLog.action)} mt-1`}>
                      {auditLog.action.charAt(0).toUpperCase() + auditLog.action.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={`${getStatusBadgeColor(auditLog.status)} mt-1`}>
                      {auditLog.status.charAt(0).toUpperCase() + auditLog.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entity Type</p>
                    <Badge className={`${getEntityTypeBadgeColor(auditLog.entityType)} mt-1`}>
                      {auditLog.entityType.charAt(0).toUpperCase() + auditLog.entityType.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Timestamp</p>
                    <p className="text-sm text-gray-900">
                      {new Date(auditLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {auditLog.entityId && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entity ID</p>
                    <p className="text-sm text-gray-900">{auditLog.entityId}</p>
                  </div>
                )}

                {auditLog.entityName && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entity Name</p>
                    <p className="text-sm text-gray-900">{auditLog.entityName}</p>
                  </div>
                )}

                {auditLog.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-sm text-gray-900">{auditLog.description}</p>
                  </div>
                )}

                {auditLog.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm font-medium text-red-800">Error Message</p>
                    <p className="text-sm text-red-700 mt-1">{auditLog.errorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changes Tab */}
          <TabsContent value="changes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Changes</CardTitle>
                <CardDescription>
                  Comparison of data before and after this action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JSONDiffViewer
                  previous={auditLog.previousData}
                  current={auditLog.newData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditLog.ipAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm text-gray-900 font-mono">{auditLog.ipAddress}</p>
                  </div>
                )}

                {auditLog.userAgent && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Agent</p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-700 break-words max-h-24 overflow-y-auto">
                      {auditLog.userAgent}
                    </div>
                  </div>
                )}

                {!auditLog.ipAddress && !auditLog.userAgent && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No metadata available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Raw JSON Tab */}
          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raw JSON Data</CardTitle>
                <CardDescription>
                  Complete audit log entry in JSON format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded text-gray-100 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                  <pre>{JSON.stringify(auditLog, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

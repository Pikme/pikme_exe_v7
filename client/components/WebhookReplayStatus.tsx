import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface ReplayBatch {
  id: string;
  totalEvents: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  reason: string;
  requestedBy: string;
  priority: "low" | "normal" | "high";
  createdAt: Date;
  completedAt?: Date;
  status: "pending" | "processing" | "completed" | "failed";
  successRate: number;
}

interface WebhookReplayStatusProps {
  batchId?: string;
}

export function WebhookReplayStatus({ batchId }: WebhookReplayStatusProps) {
  const [batches, setBatches] = useState<ReplayBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ReplayBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadBatches();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadBatches();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (batchId) {
      const batch = batches.find((b) => b.id === batchId);
      setSelectedBatch(batch || null);
    }
  }, [batchId, batches]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockBatches: ReplayBatch[] = [
        {
          id: "batch-1",
          totalEvents: 50,
          successCount: 48,
          failureCount: 2,
          pendingCount: 0,
          reason: "Provider was temporarily down",
          requestedBy: "admin@example.com",
          priority: "high",
          createdAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 1800000),
          status: "completed",
          successRate: 96,
        },
        {
          id: "batch-2",
          totalEvents: 25,
          successCount: 20,
          failureCount: 5,
          pendingCount: 0,
          reason: "Manual retry requested",
          requestedBy: "admin@example.com",
          priority: "normal",
          createdAt: new Date(Date.now() - 1800000),
          completedAt: new Date(Date.now() - 900000),
          status: "completed",
          successRate: 80,
        },
        {
          id: "batch-3",
          totalEvents: 15,
          successCount: 10,
          failureCount: 0,
          pendingCount: 5,
          reason: "Retry after configuration fix",
          requestedBy: "admin@example.com",
          priority: "normal",
          createdAt: new Date(Date.now() - 300000),
          status: "processing",
          successRate: 67,
        },
      ];

      setBatches(mockBatches);
    } catch (error) {
      console.error("Failed to load batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const duration = (end || new Date()).getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const processingBatches = batches.filter((b) => b.status === "processing");
  const completedBatches = batches.filter((b) => b.status === "completed");
  const failedBatches = batches.filter((b) => b.status === "failed");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingBatches.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBatches.length}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedBatches.length}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto Refresh Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-medium">Auto-refresh every 5 seconds</span>
        </div>
        <Button
          size="sm"
          variant={autoRefresh ? "default" : "outline"}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? "Enabled" : "Disabled"}
        </Button>
      </div>

      {/* Selected Batch Details */}
      {selectedBatch && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedBatch.status)}
                  Batch {selectedBatch.id}
                </CardTitle>
                <CardDescription>{selectedBatch.reason}</CardDescription>
              </div>
              {getStatusBadge(selectedBatch.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Events</p>
                <p className="text-lg font-semibold">{selectedBatch.totalEvents}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Successful</p>
                <p className="text-lg font-semibold text-green-600">{selectedBatch.successCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-lg font-semibold text-red-600">{selectedBatch.failureCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">{selectedBatch.pendingCount}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Success Rate</span>
                <span className="font-semibold">{selectedBatch.successRate}%</span>
              </div>
              <Progress value={selectedBatch.successRate} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-mono text-xs">{selectedBatch.createdAt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-mono text-xs">
                  {formatDuration(selectedBatch.createdAt, selectedBatch.completedAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedBatch(null)}>
                Close
              </Button>
              {selectedBatch.status === "completed" && selectedBatch.failureCount > 0 && (
                <Button size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry Failed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Replay Batches</CardTitle>
          <CardDescription>History of all webhook replay requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading batches...
                    </TableCell>
                  </TableRow>
                ) : batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No replay batches found
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono text-sm">{batch.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(batch.status)}
                          {getStatusBadge(batch.status)}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(batch.priority)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-semibold">{batch.totalEvents}</p>
                          <p className="text-xs text-muted-foreground">
                            ✓ {batch.successCount} ✗ {batch.failureCount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={batch.successRate} className="w-16" />
                          <span className="text-sm font-semibold">{batch.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {batch.createdAt.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(batch.createdAt, batch.completedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedBatch(batch)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

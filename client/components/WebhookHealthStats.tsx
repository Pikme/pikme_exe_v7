import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Pause, Play, Trash2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function WebhookHealthStats() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Fetch endpoints
  const { data: endpoints = [], isLoading, refetch } = trpc.webhook.listEndpoints.useQuery();

  // Mutations
  const pauseMutation = trpc.webhook.pauseEndpoint.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Webhook endpoint paused' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resumeMutation = trpc.webhook.resumeEndpoint.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Webhook endpoint resumed' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = trpc.webhook.deleteEndpoint.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Webhook endpoint deleted' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const testMutation = trpc.webhook.testEndpoint.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Test Sent',
        description: `Status: ${result.statusCode} - ${result.statusText}`,
      });
    },
    onError: (error) => {
      toast({ title: 'Test Failed', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading endpoints...</div>;
  }

  if (endpoints.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No webhook endpoints configured yet</p>
      </div>
    );
  }

  // Calculate stats
  const activeCount = endpoints.filter(e => e.isActive && !e.isPaused).length;
  const pausedCount = endpoints.filter(e => e.isPaused).length;
  const inactiveCount = endpoints.filter(e => !e.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to receive webhooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paused Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pausedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Temporarily disabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Disabled or failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>Manage your webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Last Success</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell className="font-mono text-sm truncate max-w-xs">
                      {endpoint.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {endpoint.isPaused ? (
                          <Badge variant="outline" className="bg-yellow-50">
                            <Pause className="h-3 w-3 mr-1" />
                            Paused
                          </Badge>
                        ) : endpoint.isActive ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {Array.isArray(endpoint.events)
                        ? endpoint.events.join(', ')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {endpoint.lastSuccessAt
                        ? new Date(endpoint.lastSuccessAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {endpoint.isPaused ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resumeMutation.mutate({ id: endpoint.id })}
                            disabled={resumeMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pauseMutation.mutate({ id: endpoint.id })}
                            disabled={pauseMutation.isPending}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testMutation.mutate({ id: endpoint.id })}
                          disabled={testMutation.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Test
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this webhook endpoint? This action cannot be undone.
                            </AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ id: endpoint.id })}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

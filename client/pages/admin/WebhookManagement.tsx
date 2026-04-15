'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookEndpointForm } from '@/components/WebhookEndpointForm';
import { WebhookDeliveryLogs } from '@/components/WebhookDeliveryLogs';
import { WebhookHealthStats } from '@/components/WebhookHealthStats';
import { WebhookDeadLetterQueue } from '@/components/WebhookDeadLetterQueue';
import { WebhookEventSimulator } from '@/components/WebhookEventSimulator';
import { WebhookAnalytics } from '@/components/WebhookAnalytics';
import { WebhookAuditLog } from '@/components/WebhookAuditLog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WebhookManagement() {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhook Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure webhooks, monitor delivery, and manage endpoint health
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Webhooks send real-time notifications to your endpoints when critical actions occur. Ensure your endpoints are accessible and can handle the webhook payload format.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          <TabsTrigger value="dlq">Dead-Letter Queue</TabsTrigger>
          <TabsTrigger value="simulator">Test Event</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Health</CardTitle>
              <CardDescription>Real-time statistics for all webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookHealthStats />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Register New Endpoint</CardTitle>
              <CardDescription>Add a new webhook endpoint to receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookEndpointForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Logs</CardTitle>
              <CardDescription>View webhook delivery history and status</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookDeliveryLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dlq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dead-Letter Queue</CardTitle>
              <CardDescription>Manage failed webhook jobs and retry them</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookDeadLetterQueue />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Event Simulator</CardTitle>
              <CardDescription>Send test payloads to validate endpoint configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookEventSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Analytics</CardTitle>
              <CardDescription>Monitor delivery performance and endpoint health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all webhook endpoint changes and management actions</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookAuditLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

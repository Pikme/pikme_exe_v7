import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

/**
 * Webhook Configuration Admin Page
 * Manages webhook configurations for email service providers
 */

interface WebhookProvider {
  id: string;
  name: string;
  description: string;
  docs: string;
  icon: string;
}

const PROVIDERS: WebhookProvider[] = [
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Real-time email delivery tracking from SendGrid",
    docs: "https://docs.sendgrid.com/for-developers/tracking/signed-webhooks",
    icon: "📧",
  },
  {
    id: "ses",
    name: "AWS SES",
    description: "Amazon Simple Email Service delivery tracking",
    docs: "https://docs.aws.amazon.com/ses/latest/dg/event-publishing-verify-signature.html",
    icon: "☁️",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Mailgun email delivery and engagement tracking",
    docs: "https://documentation.mailgun.com/en/latest/user_manual.html#webhooks",
    icon: "🚀",
  },
];

export default function WebhookConfiguration() {
  const [activeProvider, setActiveProvider] = useState("sendgrid");
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleConfigChange = (provider: string, field: string, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleSaveConfig = async (provider: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`${provider} configuration saved successfully`);
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (provider: string) => {
    setTesting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`${provider} webhook test successful`);
    } catch (error) {
      toast.error("Webhook test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleCopyWebhookUrl = (provider: string) => {
    const url = `${window.location.origin}/api/webhooks/${provider}`;
    navigator.clipboard.writeText(url);
    toast.success("Webhook URL copied to clipboard");
  };

  const currentProvider = PROVIDERS.find((p) => p.id === activeProvider);
  const currentConfig = configs[activeProvider] || {};

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure webhooks from your email service provider to track delivery status, opens, and clicks in real-time.
        </p>
      </div>

      <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {PROVIDERS.map((provider) => (
            <TabsTrigger key={provider.id} value={provider.id}>
              <span className="mr-2">{provider.icon}</span>
              {provider.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {PROVIDERS.map((provider) => (
          <TabsContent key={provider.id} value={provider.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{provider.icon}</span>
                  {provider.name} Webhook Configuration
                </CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Alert */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Webhook is currently <Badge variant={currentConfig.enabled ? "default" : "secondary"}>
                      {currentConfig.enabled ? "enabled" : "disabled"}
                    </Badge>
                  </AlertDescription>
                </Alert>

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/api/webhooks/${provider.id}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyWebhookUrl(provider.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure this URL in your {provider.name} dashboard
                  </p>
                </div>

                {/* Signing Key */}
                <div className="space-y-2">
                  <Label>Signing Key / API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showKeys[provider.id] ? "text" : "password"}
                      placeholder="Enter your signing key"
                      value={currentConfig.signingKey || ""}
                      onChange={(e) => handleConfigChange(provider.id, "signingKey", e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          [provider.id]: !prev[provider.id],
                        }))
                      }
                    >
                      {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find this in your {provider.name} account settings under API keys or webhooks
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Webhook</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable webhook processing for this provider
                    </p>
                  </div>
                  <Switch
                    checked={currentConfig.enabled || false}
                    onCheckedChange={(checked) => handleConfigChange(provider.id, "enabled", checked)}
                  />
                </div>

                {/* Event Types */}
                <div className="space-y-2">
                  <Label>Tracked Events</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Delivered", "Opened", "Clicked", "Bounced", "Complained", "Deferred"].map((event) => (
                      <div key={event} className="flex items-center gap-2">
                        <input type="checkbox" id={event} defaultChecked className="rounded" />
                        <label htmlFor={event} className="text-sm cursor-pointer">
                          {event}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documentation Link */}
                <div className="pt-4 border-t">
                  <a
                    href={provider.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 hover:underline"
                  >
                    View {provider.name} Webhook Documentation →
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleSaveConfig(provider.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestWebhook(provider.id)}
                    disabled={testing || !currentConfig.signingKey}
                    className="flex-1"
                  >
                    {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure webhooks for your email provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Copy the Webhook URL</p>
                <p className="text-sm text-muted-foreground">
                  Click the copy button next to the webhook URL above
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Log in to your Email Provider</p>
                <p className="text-sm text-muted-foreground">
                  Go to your {currentProvider?.name} account settings
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Add Webhook Endpoint</p>
                <p className="text-sm text-muted-foreground">
                  Paste the webhook URL in your provider's webhook settings
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                4
              </div>
              <div>
                <p className="font-medium">Enter Signing Key</p>
                <p className="text-sm text-muted-foreground">
                  Copy your API key or signing key from the provider and paste it above
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold text-sm">
                5
              </div>
              <div>
                <p className="font-medium">Test the Connection</p>
                <p className="text-sm text-muted-foreground">
                  Click "Test Webhook" to verify the connection is working
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Keep your signing keys confidential. Never share them or commit them to version control. Webhooks are verified using cryptographic signatures to ensure authenticity.
        </AlertDescription>
      </Alert>
    </div>
  );
}

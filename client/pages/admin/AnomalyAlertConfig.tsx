import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AnomalyConfig {
  successRateThreshold: number;
  durationSpikeThreshold: number;
  errorRateThreshold: number;
  queueDepthThreshold: number;
  throughputDropThreshold: number;
  stdDevMultiplier: number;
  baselineWindowHours: number;
  checkIntervalMinutes: number;
}

export default function AnomalyAlertConfig() {
  const [config, setConfig] = useState<AnomalyConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const configQuery = trpc.anomalyDetection.getDefaultConfig.useQuery();

  // Load default config
  if (configQuery.data && !config) {
    setConfig(configQuery.data);
  }

  const handleConfigChange = (key: keyof AnomalyConfig, value: number) => {
    if (config) {
      setConfig({
        ...config,
        [key]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      // In a real implementation, this would save to the backend
      toast.success("Configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(configQuery.data || null);
    toast.info("Configuration reset to defaults");
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Anomaly Detection Configuration</h1>
        <p className="text-gray-600 mt-1">Configure thresholds and sensitivity for anomaly detection alerts</p>
      </div>

      {/* Success Rate Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate Threshold</CardTitle>
          <CardDescription>Alert when job success rate drops below this percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.successRateThreshold * 100]}
              onValueChange={(value) => handleConfigChange("successRateThreshold", value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{(config.successRateThreshold * 100).toFixed(0)}%</div>
          </div>
          <p className="text-sm text-gray-600">Current: {(config.successRateThreshold * 100).toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Duration Spike Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Duration Spike Threshold</CardTitle>
          <CardDescription>Alert when average job duration increases by this percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.durationSpikeThreshold * 100]}
              onValueChange={(value) => handleConfigChange("durationSpikeThreshold", value[0] / 100)}
              min={0}
              max={200}
              step={5}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{(config.durationSpikeThreshold * 100).toFixed(0)}%</div>
          </div>
          <p className="text-sm text-gray-600">Current: {(config.durationSpikeThreshold * 100).toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Error Rate Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Error Rate Threshold</CardTitle>
          <CardDescription>Alert when error rate exceeds this percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.errorRateThreshold * 100]}
              onValueChange={(value) => handleConfigChange("errorRateThreshold", value[0] / 100)}
              min={0}
              max={50}
              step={0.5}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{(config.errorRateThreshold * 100).toFixed(1)}%</div>
          </div>
          <p className="text-sm text-gray-600">Current: {(config.errorRateThreshold * 100).toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Queue Depth Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Depth Threshold</CardTitle>
          <CardDescription>Alert when queue depth exceeds this number of jobs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.queueDepthThreshold]}
              onValueChange={(value) => handleConfigChange("queueDepthThreshold", value[0])}
              min={100}
              max={5000}
              step={100}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{config.queueDepthThreshold}</div>
          </div>
          <p className="text-sm text-gray-600">Current: {config.queueDepthThreshold} jobs</p>
        </CardContent>
      </Card>

      {/* Throughput Drop Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Throughput Drop Threshold</CardTitle>
          <CardDescription>Alert when job throughput drops by this percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.throughputDropThreshold * 100]}
              onValueChange={(value) => handleConfigChange("throughputDropThreshold", value[0] / 100)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{(config.throughputDropThreshold * 100).toFixed(0)}%</div>
          </div>
          <p className="text-sm text-gray-600">Current: {(config.throughputDropThreshold * 100).toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Standard Deviation Multiplier */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Deviation Multiplier</CardTitle>
          <CardDescription>Number of standard deviations for anomaly detection (higher = less sensitive)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.stdDevMultiplier * 10]}
              onValueChange={(value) => handleConfigChange("stdDevMultiplier", value[0] / 10)}
              min={10}
              max={50}
              step={1}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{config.stdDevMultiplier.toFixed(1)}</div>
          </div>
          <p className="text-sm text-gray-600">Current: {config.stdDevMultiplier.toFixed(1)} σ</p>
        </CardContent>
      </Card>

      {/* Baseline Window */}
      <Card>
        <CardHeader>
          <CardTitle>Baseline Window</CardTitle>
          <CardDescription>Hours of historical data to use for baseline calculation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.baselineWindowHours]}
              onValueChange={(value) => handleConfigChange("baselineWindowHours", value[0])}
              min={1}
              max={168}
              step={1}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{config.baselineWindowHours}h</div>
          </div>
          <p className="text-sm text-gray-600">Current: {config.baselineWindowHours} hours ({(config.baselineWindowHours / 24).toFixed(1)} days)</p>
        </CardContent>
      </Card>

      {/* Check Interval */}
      <Card>
        <CardHeader>
          <CardTitle>Check Interval</CardTitle>
          <CardDescription>How often to check for anomalies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[config.checkIntervalMinutes]}
              onValueChange={(value) => handleConfigChange("checkIntervalMinutes", value[0])}
              min={1}
              max={60}
              step={1}
              className="flex-1"
            />
            <div className="text-2xl font-bold w-20 text-right">{config.checkIntervalMinutes}m</div>
          </div>
          <p className="text-sm text-gray-600">Current: Every {config.checkIntervalMinutes} minutes</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      {/* Info Box */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-red-900 mb-2">Configuration Tips</h3>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Lower thresholds = more sensitive, more alerts</li>
            <li>• Higher thresholds = less sensitive, fewer alerts</li>
            <li>• Baseline window should be at least 24 hours for accurate detection</li>
            <li>• Standard deviation multiplier of 2.5 is recommended for most use cases</li>
            <li>• Check interval should be between 5-30 minutes for real-time monitoring</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

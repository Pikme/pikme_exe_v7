import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLayout } from "@/components/AdminLayout";

interface LocationPreview {
  id: number;
  name: string;
  suggestedTags: Array<{
    tagId: number;
    tagName: string;
    confidence: number;
  }>;
}

export function AdminAutoTagging() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [selectedState, setSelectedState] = useState<number | undefined>();
  const [previewData, setPreviewData] = useState<{
    affectedLocations: LocationPreview[];
    totalLocations: number;
    totalTagsToApply: number;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Queries
  const configQuery = trpc.locations.getAutoTaggingConfig.useQuery();
  const previewQuery = trpc.locations.previewAutoTagging.useQuery(
    {
      confidenceThreshold,
      countryId: selectedCountry,
      stateId: selectedState,
    },
    { enabled: false }
  );
  const historyQuery = trpc.locations.getAutoTaggingHistory.useQuery({ limit: 10 });

  // Mutations
  const executeAutoTaggingMutation = trpc.locations.executeAutoTagging.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      setIsExecuting(false);
    },
    onError: (error) => {
      console.error("Auto-tagging failed:", error);
      setIsExecuting(false);
    },
  });

  // Handle preview
  const handlePreview = async () => {
    const result = await previewQuery.refetch();
    if (result.data) {
      setPreviewData(result.data);
    }
  };

  // Handle execute
  const handleExecute = async () => {
    if (!previewData) return;

    setIsExecuting(true);
    try {
      await executeAutoTaggingMutation.mutateAsync({
        confidenceThreshold,
        countryId: selectedCountry,
        stateId: selectedState,
      });
    } catch (error) {
      console.error("Error executing auto-tagging:", error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.75) return "bg-red-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.75) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <AdminLayout title="Auto-Tagging Manager" description="Automatically apply AI-suggested tags to locations based on confidence threshold">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auto-Tagging Manager</h1>
        <p className="text-muted-foreground mt-2">
          Automatically apply AI-suggested tags to locations based on confidence threshold
        </p>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Configuration
          </CardTitle>
          <CardDescription>Set up auto-tagging parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence Threshold Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Confidence Threshold</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
                <Badge variant="outline">{getConfidenceLabel(confidenceThreshold)}</Badge>
              </div>
            </div>
            <Slider
              value={[confidenceThreshold]}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only tags with confidence score above this threshold will be applied
            </p>
          </div>

          {/* Preview Button */}
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              disabled={previewQuery.isLoading}
              variant="outline"
              className="flex-1"
            >
              {previewQuery.isLoading ? "Generating Preview..." : "Preview Tags"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Preview Results
            </CardTitle>
            <CardDescription>
              Review the suggested tags before applying them to locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{previewData.totalLocations}</p>
                    <p className="text-sm text-muted-foreground">Total Locations</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{previewData.affectedLocations.length}</p>
                    <p className="text-sm text-muted-foreground">Affected Locations</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{previewData.totalTagsToApply}</p>
                    <p className="text-sm text-muted-foreground">Tags to Apply</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {previewData.affectedLocations.length} locations will be updated with{" "}
                {previewData.totalTagsToApply} tags. This action cannot be undone.
              </AlertDescription>
            </Alert>

            {/* Affected Locations List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-sm">Affected Locations</h3>
              {previewData.affectedLocations.slice(0, 10).map((location) => (
                <div key={location.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{location.name}</p>
                    <Badge variant="secondary">{location.suggestedTags.length} tags</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {location.suggestedTags.map((tag) => (
                      <Badge
                        key={tag.tagId}
                        variant="outline"
                        className="text-xs"
                      >
                        <div className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(tag.confidence)}`} />
                        {tag.tagName}
                        <span className="ml-1 text-muted-foreground">
                          {(tag.confidence * 100).toFixed(0)}%
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {previewData.affectedLocations.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{previewData.affectedLocations.length - 10} more locations
                </p>
              )}
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecute}
              disabled={isExecuting || executeAutoTaggingMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isExecuting || executeAutoTaggingMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Applying Tags...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Apply Tags to {previewData.affectedLocations.length} Locations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History Section */}
      {historyQuery.data && historyQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Auto-Tagging History
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide" : "Show"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-3">
                {historyQuery.data.map((record) => (
                  <div key={record.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {record.operationType === "execute"
                            ? "Tags Applied"
                            : record.operationType === "preview"
                            ? "Preview Generated"
                            : "Tags Removed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "completed"
                            ? "default"
                            : record.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Total Locations</p>
                        <p className="font-semibold">{record.totalLocations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tags Applied</p>
                        <p className="font-semibold">{record.tagsApplied}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{(record.confidenceThreshold * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
      </div>
    </AdminLayout>
  );
}

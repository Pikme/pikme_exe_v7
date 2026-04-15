import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Mail } from "lucide-react";
import { toast } from "sonner";
import EmailPreview from "@/components/EmailPreview";

interface PreviewState {
  type: string;
  scenario: string;
  subject: string;
  html: string;
  text: string;
  loading: boolean;
}

/**
 * Email Template Preview Dashboard
 * Admin page for previewing and testing email templates
 */
export const EmailTemplatePreview: React.FC = () => {
  const { user } = useAuth();
  const [previewState, setPreviewState] = useState<PreviewState>({
    type: "enquiry_assigned",
    scenario: "luxury_tour",
    subject: "",
    html: "",
    text: "",
    loading: true,
  });

  // Fetch scenarios and types
  const scenariosQuery = trpc.emailPreview.getScenarios.useQuery();
  const typesQuery = trpc.emailPreview.getNotificationTypes.useQuery();
  const statsQuery = trpc.emailPreview.getStatistics.useQuery();

  // Fetch preview
  const previewQuery = trpc.emailPreview.getPreview.useQuery(
    {
      type: previewState.type as any,
      scenario: previewState.scenario,
    },
    {
      enabled: !!previewState.type && !!previewState.scenario,
    }
  );

  // Update preview when query completes
  useEffect(() => {
    if (previewQuery.data?.success && previewQuery.data.email) {
      setPreviewState((prev) => ({
        ...prev,
        subject: previewQuery.data.email.subject,
        html: previewQuery.data.email.html,
        text: previewQuery.data.email.text,
        loading: false,
      }));
    } else if (previewQuery.isError) {
      toast.error("Failed to load email preview");
      setPreviewState((prev) => ({ ...prev, loading: false }));
    }
  }, [previewQuery.data, previewQuery.isError]);

  const handleTypeChange = (type: string) => {
    setPreviewState((prev) => ({
      ...prev,
      type,
      loading: true,
    }));
  };

  const handleScenarioChange = (scenario: string) => {
    setPreviewState((prev) => ({
      ...prev,
      scenario,
      loading: true,
    }));
  };

  const handleRefresh = () => {
    setPreviewState((prev) => ({ ...prev, loading: true }));
    previewQuery.refetch();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email Template Preview</h1>
        <p className="text-gray-600 mt-2">
          Preview and test email templates with sample data before sending to users
        </p>
      </div>

      {/* Statistics */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Template Types</p>
                <p className="text-2xl font-bold">{statsQuery.data.totalTemplateTypes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Test Scenarios</p>
                <p className="text-2xl font-bold">{statsQuery.data.totalScenarios}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600">Total Combinations</p>
                <p className="text-2xl font-bold">{statsQuery.data.totalCombinations}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Template Selection</CardTitle>
          <CardDescription>Choose a template type and scenario to preview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Template Type</label>
              <Select value={previewState.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {typesQuery.data?.types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scenario Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Scenario</label>
              <Select value={previewState.scenario} onValueChange={handleScenarioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenariosQuery.data?.scenarios.map((scenario) => (
                    <SelectItem key={scenario} value={scenario}>
                      {scenario.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={previewState.loading}
              className="gap-2"
              variant="outline"
            >
              {previewState.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewState.loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-600">Loading email preview...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmailPreview
          subject={previewState.subject}
          html={previewState.html}
          text={previewState.text}
          type={previewState.type}
          scenario={previewState.scenario}
        />
      )}

      {/* Template Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Template</p>
              <Badge className="mt-2">{previewState.type.replace(/_/g, " ")}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Scenario</p>
              <Badge variant="outline" className="mt-2">
                {previewState.scenario.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Available Template Types</p>
            <div className="flex flex-wrap gap-2">
              {typesQuery.data?.types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Available Scenarios</p>
            <div className="flex flex-wrap gap-2">
              {scenariosQuery.data?.scenarios.map((scenario) => (
                <Badge key={scenario} variant="secondary">
                  {scenario.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Desktop Preview:</strong> View the email as it appears on desktop email clients
          </p>
          <p>
            <strong>Mobile Preview:</strong> Check responsive design on mobile devices
          </p>
          <p>
            <strong>HTML View:</strong> Inspect the raw HTML code for debugging
          </p>
          <p>
            <strong>Text View:</strong> See the plain text version for email clients that don't support HTML
          </p>
          <p>
            <strong>Scenarios:</strong> Test different customer types (luxury, group, budget, honeymoon, family)
          </p>
          <p>
            <strong>Download:</strong> Save email templates as HTML files for external testing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplatePreview;

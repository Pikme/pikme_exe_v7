import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, AlertCircle, CheckCircle } from "lucide-react";

export type ExportFormat = "csv" | "json";
export type ExportType = "summary" | "metrics" | "trends" | "recipients" | "emails" | "comprehensive";

interface ExportDialogProps {
  onExport: (format: ExportFormat, type: ExportType) => Promise<void>;
  dateRange: string;
  isLoading?: boolean;
}

/**
 * Export Dialog Component
 * Allows users to select export format and type
 */
export function ExportDialog({
  onExport,
  dateRange,
  isLoading = false,
}: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedType, setSelectedType] = useState<ExportType>("comprehensive");
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus("idle");
      setErrorMessage(null);

      await onExport(selectedFormat, selectedType);

      setExportStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setExportStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to export data"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions: Array<{ value: ExportType; label: string; description: string }> = [
    {
      value: "comprehensive",
      label: "Comprehensive Report",
      description: "All metrics, trends, and recipient data",
    },
    {
      value: "summary",
      label: "Summary Report",
      description: "High-level metrics and statistics",
    },
    {
      value: "metrics",
      label: "Engagement Metrics",
      description: "Detailed engagement metrics",
    },
    {
      value: "trends",
      label: "Engagement Trends",
      description: "Trends over time",
    },
    {
      value: "recipients",
      label: "Recipient Profiles",
      description: "Individual recipient engagement data",
    },
    {
      value: "emails",
      label: "Email Performance",
      description: "Individual email performance data",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={isLoading}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Engagement Data</DialogTitle>
          <DialogDescription>
            Download your engagement metrics for {dateRange}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {(["csv", "json"] as const).map((format) => (
                <label
                  key={format}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{format}</p>
                    <p className="text-xs text-slate-600">
                      {format === "csv"
                        ? "Comma-separated values, compatible with Excel"
                        : "JSON format for data processing"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-3">
              Export Type
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {exportOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={selectedType === option.value}
                    onChange={(e) => setSelectedType(e.target.value as ExportType)}
                    className="w-4 h-4 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {exportStatus === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">Export completed successfully!</p>
            </div>
          )}

          {exportStatus === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Export failed</p>
                {errorMessage && (
                  <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Tip:</strong> Comprehensive reports export multiple files for detailed
              analysis. Individual exports are single files.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || exportStatus === "success"}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simple Export Button Component
 */
interface ExportButtonProps {
  onExport: () => Promise<void>;
  isLoading?: boolean;
}

export function ExportButton({ onExport, isLoading = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = async () => {
    try {
      setIsExporting(true);
      await onExport();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export
        </>
      )}
    </Button>
  );
}

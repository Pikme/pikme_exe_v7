import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import Papa from "papaparse";

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: ValidationError[];
  startTime: number;
  endTime: number;
}

const CSV_HEADERS = [
  "name",
  "slug",
  "type",
  "locationId",
  "description",
  "address",
  "phone",
  "email",
  "website",
  "openingHours",
  "closedOn",
  "latitude",
  "longitude",
  "image",
  "rating",
  "reviewCount",
  "entryFee",
  "estimatedVisitTime",
  "bestTimeToVisit",
  "highlights",
  "isFeatured",
  "isActive",
];

const REQUIRED_FIELDS = ["name", "slug", "type", "locationId"];

export function AttractionsCSVImport() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const bulkImportMutation = trpc.adminAttractions.bulkImport.useMutation({
    onSuccess: (result) => {
      setImportResult(result as ImportResult);
      setIsImporting(false);
      
      if (result.failed === 0) {
        toast({
          title: "Success",
          description: `Imported ${result.created} attractions successfully`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "CSV file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    setImportResult(null);
  };

  const validateCSVData = (data: any[]): { valid: boolean; errors: ValidationError[] } => {
    const errors: ValidationError[] = [];

    if (data.length === 0) {
      errors.push({
        row: 0,
        field: "file",
        message: "CSV file is empty",
      });
      return { valid: false, errors };
    }

    // Check headers
    const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
    const missingHeaders = REQUIRED_FIELDS.filter(
      field => !headers.includes(field.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        field: "headers",
        message: `Missing required columns: ${missingHeaders.join(", ")}`,
      });
      return { valid: false, errors };
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // +1 for header, +1 for 1-based indexing

      // Check required fields
      REQUIRED_FIELDS.forEach(field => {
        const value = row[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.push({
            row: rowNum,
            field,
            message: `${field} is required`,
          });
        }
      });

      // Validate type
      const validTypes = [
        "landmark",
        "restaurant",
        "museum",
        "temple",
        "monument",
        "park",
        "cafe",
        "shopping",
        "other",
      ];
      if (row.type && !validTypes.includes(row.type.toLowerCase())) {
        errors.push({
          row: rowNum,
          field: "type",
          message: `Invalid type: ${row.type}. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      // Validate locationId is a number
      if (row.locationId && isNaN(parseInt(row.locationId))) {
        errors.push({
          row: rowNum,
          field: "locationId",
          message: "locationId must be a number",
        });
      }

      // Validate rating is between 0-5
      if (row.rating && (isNaN(parseFloat(row.rating)) || parseFloat(row.rating) < 0 || parseFloat(row.rating) > 5)) {
        errors.push({
          row: rowNum,
          field: "rating",
          message: "rating must be a number between 0 and 5",
        });
      }

      // Validate latitude/longitude
      if (row.latitude && isNaN(parseFloat(row.latitude))) {
        errors.push({
          row: rowNum,
          field: "latitude",
          message: "latitude must be a number",
        });
      }

      if (row.longitude && isNaN(parseFloat(row.longitude))) {
        errors.push({
          row: rowNum,
          field: "longitude",
          message: "longitude must be a number",
        });
      }

      // Validate boolean fields
      ["isFeatured", "isActive"].forEach(field => {
        if (row[field]) {
          const value = String(row[field]).toLowerCase();
          if (!["true", "false", "yes", "no", "1", "0"].includes(value)) {
            errors.push({
              row: rowNum,
              field,
              message: `${field} must be true/false or yes/no`,
            });
          }
        }
      });
    });

    return { valid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setImportProgress(25);

        // Validate CSV data
        const { valid, errors } = validateCSVData(results.data);

        if (!valid) {
          setValidationErrors(errors);
          setIsImporting(false);
          toast({
            title: "Validation Failed",
            description: `Found ${errors.length} validation error(s)`,
            variant: "destructive",
          });
          return;
        }

        setImportProgress(50);

        // Transform data
        const attractions = results.data.map((row: any) => ({
          name: row.name.trim(),
          slug: row.slug.trim(),
          type: row.type.toLowerCase().trim(),
          locationId: parseInt(row.locationId),
          description: row.description?.trim() || "",
          address: row.address?.trim() || "",
          phone: row.phone?.trim() || "",
          email: row.email?.trim() || "",
          website: row.website?.trim() || "",
          openingHours: row.openingHours?.trim() || "",
          closedOn: row.closedOn?.trim() || "",
          latitude: row.latitude ? parseFloat(row.latitude) : undefined,
          longitude: row.longitude ? parseFloat(row.longitude) : undefined,
          image: row.image?.trim() || "",
          rating: row.rating ? parseFloat(row.rating) : undefined,
          reviewCount: row.reviewCount ? parseInt(row.reviewCount) : undefined,
          entryFee: row.entryFee?.trim() || "",
          estimatedVisitTime: row.estimatedVisitTime?.trim() || "",
          bestTimeToVisit: row.bestTimeToVisit?.trim() || "",
          highlights: row.highlights
            ? row.highlights.split("|").map((h: string) => h.trim()).filter(Boolean)
            : [],
          isFeatured: row.isFeatured
            ? ["true", "yes", "1"].includes(String(row.isFeatured).toLowerCase())
            : false,
          isActive: row.isActive
            ? ["true", "yes", "1"].includes(String(row.isActive).toLowerCase())
            : true,
        }));

        setImportProgress(75);

        // Submit bulk import
        bulkImportMutation.mutate({ attractions });
      },
      error: (error) => {
        setIsImporting(false);
        toast({
          title: "CSV Parse Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const downloadTemplate = () => {
    const headers = CSV_HEADERS;
    const sampleRow = [
      "Taj Mahal",
      "taj-mahal",
      "landmark",
      "1",
      "The Taj Mahal is an ivory-white marble mausoleum...",
      "Dharmapuri, Forest Colony, Tajganj, Agra",
      "+91-562-222-6431",
      "info@tajmahal.gov.in",
      "https://www.tajmahal.gov.in",
      "6:00 AM - 7:00 PM",
      "Friday",
      "27.1751",
      "78.0421",
      "https://example.com/taj-mahal.jpg",
      "4.8",
      "5000",
      "₹250",
      "2-3 hours",
      "October to March",
      "Marble architecture|UNESCO World Heritage|Mughal design",
      "true",
      "true",
    ];

    const csv = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attractions-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Attractions from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!importResult ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-900 mb-1">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileSelect(e.target.files[0])
                  }
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>

              {/* File Info */}
              {file && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setValidationErrors([]);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Found {validationErrors.length} validation error(s):
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {validationErrors.slice(0, 10).map((error, idx) => (
                          <p key={idx} className="text-sm">
                            Row {error.row}, {error.field}: {error.message}
                          </p>
                        ))}
                        {validationErrors.length > 10 && (
                          <p className="text-sm text-gray-600">
                            ... and {validationErrors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Importing...</p>
                    <p className="text-sm text-gray-600">{importProgress}%</p>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Need help? Download a CSV template to see the required format.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || isImporting || validationErrors.length > 0}
                  className="gap-2"
                >
                  {isImporting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isImporting ? "Importing..." : "Import"}
                </Button>
              </div>
            </>
          ) : (
            /* Import Result */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {importResult.failed === 0 ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Import Successful
                      </p>
                      <p className="text-sm text-green-700">
                        All attractions imported successfully
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        Import Completed with Errors
                      </p>
                      <p className="text-sm text-amber-700">
                        Some attractions failed to import
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="text-2xl font-bold text-green-600">
                      {importResult.created}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Updated</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {importResult.updated}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {importResult.failed}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Import Duration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Import completed in{" "}
                  <span className="font-medium">
                    {(
                      (importResult.endTime - importResult.startTime) /
                      1000
                    ).toFixed(2)}
                    s
                  </span>
                </p>
              </div>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {importResult.errors.length} error(s) occurred:
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importResult.errors.slice(0, 10).map((error, idx) => (
                          <p key={idx} className="text-sm">
                            Row {error.row}, {error.field}: {error.message}
                          </p>
                        ))}
                        {importResult.errors.length > 10 && (
                          <p className="text-sm text-gray-600">
                            ... and {importResult.errors.length - 10} more
                            errors
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Close Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setFile(null);
                  setImportResult(null);
                  setValidationErrors([]);
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

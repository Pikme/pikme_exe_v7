import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Upload, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stateId: number;
  onImportSuccess?: () => void;
}

type ImportStep = "upload" | "validate" | "confirm" | "importing" | "complete";

export function BulkImportDialog({ open, onOpenChange, stateId, onImportSuccess }: BulkImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const validateMutation = trpc.locations.validateImport.useMutation();
  const importMutation = trpc.locations.importCsv.useMutation();
  const templateQuery = trpc.locations.generateTemplate.useQuery();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvContent) {
      toast.error("Please select a CSV file");
      return;
    }

    setStep("validate");
    try {
      const result = await validateMutation.mutateAsync({ csvContent });
      setValidationResult(result);
      setStep("confirm");
    } catch (error) {
      toast.error("Validation failed");
      setStep("upload");
    }
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      const result = await importMutation.mutateAsync({
        csvContent,
        stateId,
        skipOnError: false,
      });
      setImportResult(result);
      setStep("complete");
      toast.success(`Import complete: ${result.created} created, ${result.updated} updated`);
      onImportSuccess?.();
    } catch (error) {
      toast.error("Import failed");
      setStep("confirm");
    }
  };

  const handleDownloadTemplate = () => {
    if (!templateQuery.data) return;

    const element = document.createElement("a");
    const file = new Blob([templateQuery.data.template], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = templateQuery.data.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setStep("upload");
    setCsvContent("");
    setFileName("");
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (step === "complete") {
      handleReset();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Locations</DialogTitle>
          <DialogDescription>Import multiple locations from a CSV file</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-2">Upload CSV File</p>
              <p className="text-xs text-gray-500 mb-4">Drag and drop or click to select</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                Select File
              </Button>
              {fileName && <p className="text-sm text-green-600">Selected: {fileName}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">Need a template?</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={templateQuery.isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CSV should have headers: id, name, slug, description, latitude, longitude, metaTitle, metaDescription, metaKeywords, image
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "validate" && (
          <div className="space-y-4">
            <Progress value={50} />
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Validating CSV...</p>
            </div>
          </div>
        )}

        {step === "confirm" && validationResult && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">Validation Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Total Rows</p>
                  <p className="text-lg font-bold">{validationResult.summary.totalRows}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Valid Rows</p>
                  <p className="text-lg font-bold text-green-600">{validationResult.summary.validRows}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">New Locations</p>
                  <p className="text-lg font-bold text-blue-600">{validationResult.summary.createCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Updates</p>
                  <p className="text-lg font-bold text-purple-600">{validationResult.summary.updateCount}</p>
                </div>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">{validationResult.errors.length} Validation Errors:</p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {validationResult.errors.slice(0, 5).map((error: string, i: number) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li>• ... and {validationResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.isValid && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  CSV is valid and ready to import
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-4">
            <Progress value={75} />
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Importing locations...</p>
            </div>
          </div>
        )}

        {step === "complete" && importResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Import Complete</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
                </div>
                <div>
                  <p className="text-gray-600">Updated</p>
                  <p className="text-2xl font-bold text-blue-600">{importResult.updated}</p>
                </div>
                <div>
                  <p className="text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Errors:</p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error: string, i: number) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleValidate} disabled={!csvContent}>
                Validate
              </Button>
            </>
          )}
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={!validationResult?.isValid}>
                Import
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

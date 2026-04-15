import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";

/**
 * LocalizationImport - Admin component for bulk CSV imports of localized content
 */
export default function AdminLocalizationImport() {
  const { toast } = useToast();
  const [selectedContentType, setSelectedContentType] = useState<"tour" | "state" | "category">(
    "tour"
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const getCSVTemplate = trpc.localizationImport.getCSVTemplate.useQuery({
    contentType: selectedContentType,
  });

  const importMutation = trpc.localizationImport.importFromCSV.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      setIsImporting(false);
      toast({
        title: "Import completed",
        description: `${result.successful} records imported successfully, ${result.failed} failed`,
        variant: result.failed > 0 ? "destructive" : "default",
      });
    },
    onError: (error) => {
      setIsImporting(false);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    const content = await csvFile.text();
    importMutation.mutate({
      csvContent: content,
      fileName: csvFile.name,
    });
  };

  const handleDownloadTemplate = () => {
    if (!getCSVTemplate.data) return;

    const element = document.createElement("a");
    const file = new Blob([getCSVTemplate.data], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = `localization-template-${selectedContentType}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleContentTypeChange = (type: "tour" | "state" | "category") => {
    setSelectedContentType(type);
    setCsvFile(null);
    setImportResult(null);
  };

  return (
    <AdminLayout title="LocalizationImport">
      <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Localization CSV Import</h1>
        <p className="text-gray-600">Bulk import locale-specific content for tours, states, and categories</p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="template">Download Template</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Content Type</CardTitle>
              <CardDescription>Choose which type of content to import localizations for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["tour", "state", "category"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedContentType === type ? "default" : "outline"}
                    onClick={() => handleContentTypeChange(type)}
                    className="capitalize"
                  >
                    {type}s
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>Select a CSV file with localization data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="w-full"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Selected: {csvFile.name}
                  </p>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!csvFile || isImporting}
                className="w-full"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import CSV"}
              </Button>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.failed === 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Import Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Import Completed with Errors
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-red-600">{importResult.totalRecords}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{importResult.successful}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {importResult.errors.slice(0, 10).map((error: string, i: number) => (
                          <li key={i}>{error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>... and {importResult.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {importResult.warnings.slice(0, 5).map((warning: string, i: number) => (
                          <li key={i}>{warning}</li>
                        ))}
                        {importResult.warnings.length > 5 && (
                          <li>... and {importResult.warnings.length - 5} more warnings</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
              <CardDescription>Download a template CSV file for {selectedContentType} localizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
                <pre>{getCSVTemplate.data}</pre>
              </div>

              <Button onClick={handleDownloadTemplate} disabled={!getCSVTemplate.data} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Template CSV
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">CSV Format Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>contentType: Must be one of: tour, state, category</li>
                    <li>contentId: Numeric ID of the content (must exist in database)</li>
                    <li>locale: Language-region format (e.g., en-IN, hi-IN, en-US)</li>
                    <li>title, description: Main content fields</li>
                    <li>metaTitle, metaDescription, metaKeywords: SEO fields</li>
                    <li>Array fields (for tours): Use pipe-separated values (|) for multiple items</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>View past localization imports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Import history tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}

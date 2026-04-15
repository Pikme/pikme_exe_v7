import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plane, Upload, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Papa from "papaparse";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminImport() {
  const { user } = useAuth();
  const [importType, setImportType] = useState<"tours" | "locations" | "flights" | "activities">("tours");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadToursMutation = trpc.import.uploadTours.useMutation();
  const uploadLocationsMutation = trpc.import.uploadLocations.useMutation();
  const uploadActivitiesMutation = trpc.import.uploadActivities.useMutation();
  const { data: importHistory } = trpc.import.getHistory.useQuery({
    limit: 10,
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsLoading(true);
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          try {
            if (importType === "tours") {
              const res = await uploadToursMutation.mutateAsync({
                fileName: file.name,
                tours: results.data,
              });
              setResult(res);
            } else if (importType === "locations") {
              const res = await uploadLocationsMutation.mutateAsync({
                fileName: file.name,
                locations: results.data,
              });
              setResult(res);
            } else if (importType === "activities") {
              const res = await uploadActivitiesMutation.mutateAsync({
                fileName: file.name,
                activities: results.data,
              });
              setResult(res);
            }
            setFile(null);
          } catch (error) {
            setResult({
              error: error instanceof Error ? error.message : "Import failed",
            });
          } finally {
            setIsLoading(false);
          }
        },
        error: (error: any) => {
          setResult({ error: error.message });
          setIsLoading(false);
        },
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Import failed",
      });
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="CSV Import" description="Upload CSV files to import tours, locations, or activities">
      <div className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>
                  Upload a CSV file to import tours, locations, or activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Import Type Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Import Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["tours", "locations", "flights", "activities"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setImportType(type as any)}
                        className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                          importType === type
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Select CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-input"
                    />
                    <label htmlFor="csv-input" className="cursor-pointer">
                      <p className="text-sm text-gray-600">
                        {file ? file.name : "Click to select or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">CSV format only</p>
                    </label>
                  </div>
                </div>

                {/* Import Button */}
                <Button
                  onClick={handleImport}
                  disabled={!file || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>

                {/* Result */}
                {result && (
                  <div
                    className={`p-4 rounded-lg ${
                      result.error
                        ? "bg-red-50 border border-red-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.error ? (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="text-sm">
                        {result.error ? (
                          <>
                            <p className="font-semibold text-red-900">Import Failed</p>
                            <p className="text-red-700 mt-1">{result.error}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-green-900">Import Successful</p>
                            <p className="text-green-700 mt-1">
                              {result.successful} records imported successfully
                            </p>
                            {result.failed > 0 && (
                              <p className="text-yellow-700 mt-1">
                                {result.failed} records failed
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Format Guide */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">CSV Format Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {importType === "tours" && (
                  <div>
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-900 mb-2">📥 Download Template</p>
                      <a
                        href="https://d2xsxph8kpxj0f.cloudfront.net/310519663301746209/BSfLaRT44T7kXPsafBLRTp/TOUR_IMPORT_TEMPLATE_f1fa7672.csv"
                        download
                        className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download CSV Template
                      </a>
                      <p className="text-xs text-red-700 mt-2">Use this template as a starting point for creating new tours</p>
                    </div>
                    <p className="font-semibold mb-3">All 41 Required Fields for Tours:</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Basic Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>name (string, required)</li>
                          <li>slug (string, unique, required)</li>
                          <li>description (string, required)</li>
                          <li>longDescription (string, required)</li>
                          <li>category (string, required)</li>
                          <li>duration (number, required)</li>
                          <li>price (decimal, required)</li>
                          <li>currency (string, required)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Images & SEO:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>image (string, URL)</li>
                          <li>images (JSON array)</li>
                          <li>metaTitle (string)</li>
                          <li>metaDescription (string)</li>
                          <li>metaKeywords (string)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Tour Content:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>highlights (JSON array)</li>
                          <li>itinerary (JSON array)</li>
                          <li>inclusions (JSON array)</li>
                          <li>exclusions (JSON array)</li>
                          <li>faqs (JSON array)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Tour Details:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>bestTime (string)</li>
                          <li>travelType (string)</li>
                          <li>difficulty (string)</li>
                          <li>groupSize (string)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Timing & Services:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>openTime (string)</li>
                          <li>closeTime (string)</li>
                          <li>morningTime (string)</li>
                          <li>afternoonTime (string)</li>
                          <li>amenities (JSON array)</li>
                          <li>transport (JSON array)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Pricing & Policies:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>pricingTiers (JSON array)</li>
                          <li>cancellationPolicy (string)</li>
                          <li>paymentPolicy (string)</li>
                          <li>importantNotes (string)</li>
                          <li>hotelsPuri (JSON array)</li>
                          <li>hotelsBhuvaneshwar (JSON array)</li>
                          <li>isFeatured (boolean)</li>
                          <li>isActive (boolean)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs font-semibold text-yellow-900 mb-2">💡 Tips:</p>
                      <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                        <li>JSON fields: Use double quotes and proper JSON formatting</li>
                        <li>Markdown support: longDescription supports markdown formatting</li>
                        <li>Unique slugs: Each tour must have a unique slug</li>
                        <li>UTF-8 encoding: Save CSV with UTF-8 encoding for special characters</li>
                        <li>Price format: Use numbers only (no currency symbols)</li>
                      </ul>
                    </div>
                  </div>
                )}
                {importType === "locations" && (
                  <div>
                    <p className="font-semibold mb-2">Required columns for Locations:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>countryId (number)</li>
                      <li>name (string)</li>
                      <li>slug (string)</li>
                      <li>description (string)</li>
                      <li>metaTitle (string)</li>
                      <li>metaDescription (string)</li>
                      <li>latitude (decimal, optional)</li>
                      <li>longitude (decimal, optional)</li>
                    </ul>
                  </div>
                )}
                {importType === "activities" && (
                  <div>
                    <p className="font-semibold mb-2">Required columns for Activities:</p>
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                      <p className="text-xs font-semibold text-green-900 mb-1">Auto-Location Mapping (Recommended):</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-green-800">
                        <li><strong>country</strong> (string) - Country name (e.g., India)</li>
                        <li><strong>state</strong> (string) - State/Province name (e.g., Madhya Pradesh)</li>
                        <li><strong>city</strong> (string) - City/Location name (e.g., Ujjain)</li>
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">OR use direct location ID:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
                      <li><strong>locationId</strong> (number) - Location ID (optional if country/state/city provided)</li>
                    </ul>
                    <p className="text-xs text-gray-600 mb-2">Activity details:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li><strong>name</strong> (string) - Activity name</li>
                      <li><strong>slug</strong> (string, unique) - URL-friendly identifier</li>
                      <li>tourId (number, optional) - Link to tour</li>
                      <li>description (text, optional) - Activity description</li>
                      <li>category (string, optional) - Spiritual, Cultural, Adventure, etc.</li>
                      <li>duration (string, optional) - e.g., "2-3 hours"</li>
                      <li>price (decimal, optional) - Activity price</li>
                      <li>currency (string, optional) - Currency code (default: INR)</li>
                      <li>image (string, optional) - Image URL</li>
                      <li>difficulty (string, optional) - easy, moderate, challenging</li>
                      <li>bestTime (string, optional) - Best time to visit</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-3 p-2 bg-red-50 rounded">
                      <strong>Tip:</strong> Use country/state/city columns for automatic location mapping. System will look up the correct locationId. Ensure all slugs are unique.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Import History */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Imports</CardTitle>
              </CardHeader>
              <CardContent>
                {importHistory && importHistory.length > 0 ? (
                  <div className="space-y-3">
                    {importHistory.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 border rounded-lg text-sm"
                      >
                        <p className="font-semibold capitalize">{log.importType}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {log.fileName}
                        </p>
                        <div className="flex justify-between mt-2 text-xs">
                          <span className="text-green-600">
                            ✓ {log.successfulRecords}
                          </span>
                          {log.failedRecords > 0 && (
                            <span className="text-red-600">
                              ✗ {log.failedRecords}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No imports yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

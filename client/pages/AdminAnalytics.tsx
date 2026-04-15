import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Settings, Eye, Loader2, Plane, TrendingUp, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { generateAdminAnalyticsBreadcrumbs } from "@/components/Breadcrumb";

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [sitemapOpen, setSitemapOpen] = useState(false);
  const [metaTagsOpen, setMetaTagsOpen] = useState(false);
  const [structuredDataOpen, setStructuredDataOpen] = useState(false);
  const [metaTagsConfig, setMetaTagsConfig] = useState({
    siteTitle: "Pikme - Travel Experiences",
    siteDescription: "Discover handpicked travel experiences across the world",
    defaultKeywords: "travel, tours, destinations, activities",
    ogImage: "https://www.pikmeusa.com/og-image.jpg",
    twitterHandle: "@pikmetravel",
    enableJsonLd: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
  });

  const [structuredDataSettings, setStructuredDataSettings] = useState({
    enableJsonLd: true,
    enableBreadcrumbs: true,
    enableRichSnippets: true,
    enableLocalBusiness: false,
    businessName: "Pikme Travel",
    businessPhone: "+1-800-PIKME",
    businessEmail: "cr@pikme.org",
    businessAddress: "123 Travel Street, Adventure City, AC 12345",
  });

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: sitemap } = trpc.analytics.getSitemap.useQuery();
  const { data: toursData } = trpc.analytics.exportToursAsJSON.useQuery();
  const { data: locationsData } = trpc.analytics.exportLocationsAsJSON.useQuery();
  const { data: activitiesData } = trpc.analytics.exportActivitiesAsJSON.useQuery();
  
  const { mutate: updateMetaTags, isPending: isUpdatingMetaTags } = trpc.analytics.updateMetaTagsConfig.useMutation({
    onSuccess: () => {
      toast.success("Meta tags configuration updated!");
      setMetaTagsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update meta tags: " + error.message);
    },
  });

  const { mutate: updateStructuredData, isPending: isUpdatingStructuredData } = trpc.analytics.updateStructuredDataSettings.useMutation({
    onSuccess: () => {
      toast.success("Structured data settings updated!");
      setStructuredDataOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update structured data: " + error.message);
    },
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

  const downloadJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = (row as any)[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const tsv = [
      headers.join("\t"),
      ...data.map((row) =>
        headers.map((header) => (row as any)[header]).join("\t")
      ),
    ].join("\n");

    const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportToursJSON = () => {
    if (toursData) {
      downloadJSON(toursData, "tours.json");
      toast.success("Tours exported as JSON!");
    }
  };

  const handleExportToursCSV = () => {
    if (toursData) {
      downloadCSV(toursData as any[], "tours.csv");
      toast.success("Tours exported as CSV!");
    }
  };

  const handleExportToursExcel = () => {
    if (toursData) {
      downloadExcel(toursData as any[], "tours.xlsx");
      toast.success("Tours exported as Excel!");
    }
  };

  const handleExportLocationsJSON = () => {
    if (locationsData) {
      downloadJSON(locationsData, "locations.json");
      toast.success("Locations exported as JSON!");
    }
  };

  const handleExportLocationsCSV = () => {
    if (locationsData) {
      downloadCSV(locationsData as any[], "locations.csv");
      toast.success("Locations exported as CSV!");
    }
  };

  const handleExportLocationsExcel = () => {
    if (locationsData) {
      downloadExcel(locationsData as any[], "locations.xlsx");
      toast.success("Locations exported as Excel!");
    }
  };

  const handleExportActivitiesJSON = () => {
    if (activitiesData) {
      downloadJSON(activitiesData, "activities.json");
      toast.success("Activities exported as JSON!");
    }
  };

  const handleExportActivitiesCSV = () => {
    if (activitiesData) {
      downloadCSV(activitiesData as any[], "activities.csv");
      toast.success("Activities exported as CSV!");
    }
  };

  const handleExportActivitiesExcel = () => {
    if (activitiesData) {
      downloadExcel(activitiesData as any[], "activities.xlsx");
      toast.success("Activities exported as Excel!");
    }
  };

  return (
    <AdminLayout
      title="Analytics"
      description="View platform statistics and engagement metrics"
      breadcrumbs={generateAdminAnalyticsBreadcrumbs()}
    >
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Tours</p>
                    <p className="text-3xl font-bold mt-1">{stats?.tourCount || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Locations</p>
                    <p className="text-3xl font-bold mt-1">{stats?.locationCount || 0}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Activities</p>
                    <p className="text-3xl font-bold mt-1">{stats?.activityCount || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Data Imports</p>
                    <p className="text-3xl font-bold mt-1">{stats?.importCount || 0}</p>
                  </div>
                  <Download className="w-8 h-8 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Sitemap</span>
                  <Button
                    onClick={() => setSitemapOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Meta Tags</span>
                  <Button
                    onClick={() => setMetaTagsOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Structured Data</span>
                  <Button
                    onClick={() => setStructuredDataOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Data */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Tours Data</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleExportToursJSON}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      onClick={handleExportToursCSV}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      onClick={handleExportToursExcel}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>

                {/* Locations Export */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Locations Data</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleExportLocationsJSON}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      onClick={handleExportLocationsCSV}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      onClick={handleExportLocationsExcel}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>

                {/* Activities Export */}
                <div>
                  <h3 className="font-semibold mb-3">Activities Data</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleExportActivitiesJSON}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      onClick={handleExportActivitiesCSV}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      onClick={handleExportActivitiesExcel}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Sitemap Dialog */}
      <Dialog open={sitemapOpen} onOpenChange={setSitemapOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sitemap</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {sitemap && Array.isArray(sitemap) ? (
              sitemap.map((url: string, index: number) => (
                <div key={index} className="text-sm text-gray-600 break-all">
                  {url}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No sitemap data available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Meta Tags Dialog */}
      <Dialog open={metaTagsOpen} onOpenChange={setMetaTagsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meta Tags Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Title</label>
              <input
                type="text"
                value={metaTagsConfig.siteTitle}
                onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, siteTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Description</label>
              <textarea
                value={metaTagsConfig.siteDescription}
                onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, siteDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Keywords</label>
              <input
                type="text"
                value={metaTagsConfig.defaultKeywords}
                onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, defaultKeywords: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OG Image URL</label>
              <input
                type="text"
                value={metaTagsConfig.ogImage}
                onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, ogImage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Twitter Handle</label>
              <input
                type="text"
                value={metaTagsConfig.twitterHandle}
                onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, twitterHandle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metaTagsConfig.enableJsonLd}
                  onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, enableJsonLd: e.target.checked })}
                />
                <span className="text-sm">Enable JSON-LD</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metaTagsConfig.enableOpenGraph}
                  onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, enableOpenGraph: e.target.checked })}
                />
                <span className="text-sm">Enable Open Graph</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metaTagsConfig.enableTwitterCards}
                  onChange={(e) => setMetaTagsConfig({ ...metaTagsConfig, enableTwitterCards: e.target.checked })}
                />
                <span className="text-sm">Enable Twitter Cards</span>
              </label>
            </div>

            <Button
              onClick={() => updateMetaTags(metaTagsConfig)}
              disabled={isUpdatingMetaTags}
              className="w-full"
            >
              {isUpdatingMetaTags ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Structured Data Dialog */}
      <Dialog open={structuredDataOpen} onOpenChange={setStructuredDataOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Structured Data Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={structuredDataSettings.enableJsonLd}
                  onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, enableJsonLd: e.target.checked })}
                />
                <span className="text-sm">Enable JSON-LD</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={structuredDataSettings.enableBreadcrumbs}
                  onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, enableBreadcrumbs: e.target.checked })}
                />
                <span className="text-sm">Enable Breadcrumbs</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={structuredDataSettings.enableRichSnippets}
                  onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, enableRichSnippets: e.target.checked })}
                />
                <span className="text-sm">Enable Rich Snippets</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={structuredDataSettings.enableLocalBusiness}
                  onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, enableLocalBusiness: e.target.checked })}
                />
                <span className="text-sm">Enable Local Business</span>
              </label>
            </div>
            {structuredDataSettings.enableLocalBusiness && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={structuredDataSettings.businessName}
                    onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, businessName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Phone</label>
                  <input
                    type="text"
                    value={structuredDataSettings.businessPhone}
                    onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, businessPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Email</label>
                  <input
                    type="text"
                    value={structuredDataSettings.businessEmail}
                    onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, businessEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Address</label>
                  <input
                    type="text"
                    value={structuredDataSettings.businessAddress}
                    onChange={(e) => setStructuredDataSettings({ ...structuredDataSettings, businessAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={() => updateStructuredData(structuredDataSettings)}
              disabled={isUpdatingStructuredData}
              className="w-full"
            >
              {isUpdatingStructuredData ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

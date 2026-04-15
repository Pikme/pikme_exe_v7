import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plane, Settings, Check, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { generateAdminSEOSettingsBreadcrumbs } from "@/components/Breadcrumb";
import { useState } from "react";

export default function AdminSEOSettings() {
  const { user } = useAuth();
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: "Pikme - Travel Adventures",
    siteDescription: "Discover handpicked travel experiences across the world",
    defaultKeywords: "travel, tours, adventures, destinations",
    sitemapEnabled: true,
    robotsEnabled: true,
    jsonLdEnabled: true,
    ogImageUrl: "",
    twitterHandle: "@pikmetravel",
    contactEmail: "cr@pikme.org",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="SEO Settings"
      description="Configure SEO and metadata settings for your platform"
      breadcrumbs={generateAdminSEOSettingsBreadcrumbs()}
    >
      <div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Site Title</label>
                  <input
                    type="text"
                    value={seoSettings.siteTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Your site title"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in browser tab and search results</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Site Description</label>
                  <textarea
                    value={seoSettings.siteDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, siteDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Your site description"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Displayed in search engine results (max 160 characters)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Default Keywords</label>
                  <input
                    type="text"
                    value={seoSettings.defaultKeywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultKeywords: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Comma-separated keywords"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used as fallback for pages without specific keywords</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media & Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">OG Image URL</label>
                  <input
                    type="url"
                    value={seoSettings.ogImageUrl}
                    onChange={(e) => setSeoSettings({ ...seoSettings, ogImageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="https://example.com/og-image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Image shown when sharing on social media</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Twitter Handle</label>
                  <input
                    type="text"
                    value={seoSettings.twitterHandle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="@yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={seoSettings.contactEmail}
                    onChange={(e) => setSeoSettings({ ...seoSettings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="contact@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sitemap Generation</h4>
                    <p className="text-sm text-gray-600">Automatically generate XML sitemaps for search engines</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={seoSettings.sitemapEnabled}
                    onChange={(e) => setSeoSettings({ ...seoSettings, sitemapEnabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Robots.txt Generation</h4>
                    <p className="text-sm text-gray-600">Control search engine crawler access</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={seoSettings.robotsEnabled}
                    onChange={(e) => setSeoSettings({ ...seoSettings, robotsEnabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">JSON-LD Structured Data</h4>
                    <p className="text-sm text-gray-600">Enable rich snippets in search results</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={seoSettings.jsonLdEnabled}
                    onChange={(e) => setSeoSettings({ ...seoSettings, jsonLdEnabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Settings
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">Cancel</Link>
              </Button>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  SEO Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-800 space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Meta Tags</h4>
                  <p>Keep titles under 60 characters and descriptions under 160 characters for optimal display in search results.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Keywords</h4>
                  <p>Use 3-5 relevant keywords per page. Focus on long-tail keywords for better targeting.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Structured Data</h4>
                  <p>JSON-LD helps search engines understand your content better and can improve rich snippets.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Sitemaps</h4>
                  <p>Sitemaps help search engines discover and index all your pages faster.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sitemap:</span>
                  <span className={seoSettings.sitemapEnabled ? "text-green-600 font-medium" : "text-gray-500"}>
                    {seoSettings.sitemapEnabled ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Robots.txt:</span>
                  <span className={seoSettings.robotsEnabled ? "text-green-600 font-medium" : "text-gray-500"}>
                    {seoSettings.robotsEnabled ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">JSON-LD:</span>
                  <span className={seoSettings.jsonLdEnabled ? "text-green-600 font-medium" : "text-gray-500"}>
                    {seoSettings.jsonLdEnabled ? "✓ Enabled" : "✗ Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

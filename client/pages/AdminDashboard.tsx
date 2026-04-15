import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plane, Upload, Settings, BarChart3, Clock } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertStatusWidget } from "@/components/AlertStatusWidget";
import { AdminLayout } from "@/components/AdminLayout";
import { generateAdminDashboardBreadcrumbs } from "@/components/Breadcrumb";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have permission to access this page</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Manage your Pikme travel platform content and settings"
      breadcrumbs={generateAdminDashboardBreadcrumbs()}
    >
      <div>

        {/* Alert Status Widget */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AlertStatusWidget />
          </div>
          <div className="lg:col-span-2" />
        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-l-4 border-l-red-600">
              <CardContent className="pt-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Tours</p>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                  ) : (
                    <p className="text-4xl font-bold text-red-600">{stats?.tourCount || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-l-green-600">
              <CardContent className="pt-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Locations</p>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  ) : (
                    <p className="text-4xl font-bold text-green-600">{stats?.locationCount || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-l-purple-600">
              <CardContent className="pt-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Activities</p>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  ) : (
                    <p className="text-4xl font-bold text-purple-600">{stats?.activityCount || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-l-orange-600">
              <CardContent className="pt-6">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">CSV Imports</p>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  ) : (
                    <p className="text-4xl font-bold text-orange-600">{stats?.csvImportCount || 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Management Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CSV Import Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-600" />
                  CSV Import
                </CardTitle>
                <CardDescription>
                  Import tours, locations, and activities via CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Bulk upload content from CSV files to quickly populate your database with tours, locations, flights, and activities.
                </p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/admin/import">Go to Import</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tours Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Tours Management</CardTitle>
                <CardDescription>
                  Create and manage tour packages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add, edit, or delete tour packages. Set pricing, duration, difficulty levels, and itineraries.
                </p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/admin/tours">Manage Tours</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Locations Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Locations Management</CardTitle>
                <CardDescription>
                  Manage destinations and cities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add, edit, or delete locations. Set coordinates, descriptions, and SEO metadata.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/admin/locations">Manage Locations</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Activities Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Activities Management</CardTitle>
                <CardDescription>
                  Manage activities and experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add, edit, or delete activities. Set pricing, difficulty, and duration for each activity.
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/admin/activities">Manage Activities</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Countries Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Countries Management</CardTitle>
                <CardDescription>Manage destination countries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or delete countries. Set country codes and SEO metadata.</p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/admin/countries">Manage Countries</Link>
                </Button>
              </CardContent>
            </Card>

            {/* States Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>States Management</CardTitle>
                <CardDescription>Manage states and provinces</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or delete states within countries. Set SEO metadata for each state.</p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/admin/states">Manage States</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Cities Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Cities Management</CardTitle>
                <CardDescription>Manage cities and locations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or delete cities. Set coordinates and SEO metadata for each city.</p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/admin/cities">Manage Cities</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Categories Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Categories Management</CardTitle>
                <CardDescription>Manage tour categories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or delete tour categories. Set SEO metadata for each category.</p>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                  <Link href="/admin/categories">Manage Categories</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Home Page Settings Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Home Page Settings
                </CardTitle>
                <CardDescription>
                  Manage hero slider images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Update hero slider images and manage home page content without code changes.
                </p>
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/admin/home-page-settings">Manage Home Page</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SEO Settings Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Configure SEO and sitemap settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage metadata, structured data, and sitemap generation settings.
                </p>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                  <Link href="/admin/seo">Configure SEO</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  View platform statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Track tours, locations, activities, and user engagement metrics.
                </p>
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/admin/analytics">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Exports Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  Scheduled Exports
                </CardTitle>
                <CardDescription>
                  Manage automated report exports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Schedule daily or weekly exports of engagement metrics and send them to stakeholders via email.
                </p>
                <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Link href="/admin/scheduled-exports">Manage Exports</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Imports */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
          <Card>
            <CardHeader>
              <CardTitle>Latest CSV Imports</CardTitle>
              <CardDescription>
                View your recent import history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Import history will be displayed here. <Link href="/admin/import" className="text-red-600 hover:underline">Go to imports page</Link> to upload new content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Loader2, Layers, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, generateCategoriesListBreadcrumbs } from "@/components/Breadcrumb";

export default function CategoriesList() {
  const { language } = useLanguage();
  useSEO({
    pageKey: "attractions",
    language,
    baseUrl: "https://www.pikmeusa.com",
    path: "/categories",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading } = trpc.categories.list.useQuery({ limit: 500 });

  const filteredCategories = categories?.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Tour Categories</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Explore tours organized by type and experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={generateCategoriesListBreadcrumbs()} />
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category: any) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                        )}
                      </div>
                      {category.icon && (
                        <span className="text-3xl">{category.icon}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Click to explore all {category.name.toLowerCase()} tours
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories found</h3>
            <p className="text-gray-500">Try adjusting your search</p>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-12 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Each category contains curated tours tailored to specific travel interests. Whether you're looking for
              adventure, relaxation, cultural experiences, or spiritual journeys, you'll find the perfect tour for your
              next getaway.
            </p>
          </CardContent>
        </Card>

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

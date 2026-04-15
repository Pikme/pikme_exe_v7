import { useRoute, Link } from "wouter";
import { Loader2, Layers, ArrowLeft, Filter } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, generateCategoryBreadcrumbs } from "@/components/Breadcrumb";

export default function CategoryDetail() {
  const [match, params] = useRoute("/categories/:slug");
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const slug = params?.slug as string;

  // Fetch category by slug
  const { data: categories } = trpc.categories.list.useQuery({ limit: 500 });
  const category = categories?.find((c: any) => c.slug === slug);

  // Fetch all tours with this category
  const { data: allTours } = trpc.tours.list.useQuery({ limit: 1000 });
  const toursInCategory = allTours?.filter((t: any) => t.categoryId === category?.id) || [];

  // Fetch states for filtering
  const { data: states } = trpc.states.list.useQuery({ limit: 500 });

  // Filter tours by selected state if applicable
  const filteredTours = selectedStateId
    ? toursInCategory.filter((t: any) => t.stateId === selectedStateId)
    : toursInCategory;

  // Get unique states from tours in this category
  const statesInCategory = states?.filter((s: any) =>
    toursInCategory.some((t: any) => t.stateId === s.id)
  ) || [];

  if (!match) return null;

  if (!category) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
          <div className="text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <Link href="/categories" asChild>
              <Button>Back to Categories</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <Link href="/categories" asChild>
            <Button variant="ghost" className="w-fit text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="text-4xl md:text-5xl font-bold text-white">{category.name}</h1>
          </div>
          {category.description && (
            <p className="text-purple-100 text-lg max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={generateCategoryBreadcrumbs({ name: category.name })} />
        {/* State Filter */}
        {statesInCategory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedStateId(null)}
                  variant={selectedStateId === null ? "default" : "outline"}
                >
                  All States
                </Button>
                {statesInCategory.map((state: any) => (
                  <Button
                    key={state.id}
                    onClick={() => setSelectedStateId(state.id)}
                    variant={selectedStateId === state.id ? "default" : "outline"}
                  >
                    {state.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tours Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            {category.name} Tours
            {selectedStateId && (
              <span className="text-purple-600 text-lg">
                {" "}
                - {statesInCategory.find((s: any) => s.id === selectedStateId)?.name}
              </span>
            )}
          </h2>

          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour: any) => (
                <Link key={tour.id} href={`/visit/tour/${tour.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {tour.image && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={tour.image}
                          alt={tour.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{tour.name}</CardTitle>
                      {tour.metaDescription && (
                        <CardDescription className="line-clamp-2">{tour.metaDescription}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tour.duration && (
                          <p className="text-sm text-gray-600">
                            <strong>Duration:</strong> {tour.duration} days
                          </p>
                        )}
                        {tour.price && (
                          <p className="text-sm text-gray-600">
                            <strong>Price:</strong> ₹{tour.price.toLocaleString()}
                          </p>
                        )}
                        {tour.difficulty && (
                          <p className="text-sm text-gray-600">
                            <strong>Difficulty:</strong> {tour.difficulty}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tours found</h3>
              <p className="text-gray-500">
                {selectedStateId
                  ? "No tours available in this state for this category."
                  : "No tours available for this category yet."}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        {category.description && (
          <Card className="mt-12 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle>About {category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{category.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-purple-600">Categories</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

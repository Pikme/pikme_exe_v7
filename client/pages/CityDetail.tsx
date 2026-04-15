import { useRoute, Link } from "wouter";
import { Loader2, MapPin, ArrowLeft, Filter } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, generateCityBreadcrumbs } from "@/components/Breadcrumb";
import ThingsToDoSection from "@/components/ThingsToDoSection";

export default function CityDetail() {
  const [match, params] = useRoute("/states/:stateSlug/cities/:citySlug");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const stateSlug = params?.stateSlug as string;
  const citySlug = params?.citySlug as string;

  // Fetch all states
  const { data: states } = trpc.states.list.useQuery({ limit: 500 });
  const state = states?.find((s: any) => s.slug === stateSlug);

  // Fetch all cities
  const { data: cities } = trpc.locations.listByState.useQuery(
    { stateId: state?.id || 0, limit: 500 },
    { enabled: !!state }
  );
  const city = cities?.find((c: any) => c.slug === citySlug);

  // Fetch tours for this city (using location-based filtering)
  const { data: tours, isLoading: toursLoading } = trpc.tours.list.useQuery(
    { locationId: city?.id || 0, limit: 100 },
    { enabled: !!city }
  );

  // Fetch categories
  const { data: categories } = trpc.categories.list.useQuery({ limit: 500 });

  const filteredTours = selectedCategoryId
    ? tours?.filter((t: any) => t.categoryId === selectedCategoryId)
    : tours;

  if (!match) return null;

  if (!state) {
    return (
      <PublicLayout>
        <div className="bg-gradient-to-b from-red-50 to-white flex items-center justify-center min-h-screen">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">State not found</h1>
            <p className="text-gray-600 mb-6">The state you're looking for doesn't exist.</p>
            <Link href="/states" asChild>
              <Button>Back to States</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!city) {
    return (
      <PublicLayout>
        <div className="bg-gradient-to-b from-red-50 to-white flex items-center justify-center min-h-screen">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">City not found</h1>
            <p className="text-gray-600 mb-6">The city you're looking for doesn't exist.</p>
            <Link href={`/states/${stateSlug}/cities`} asChild>
              <Button>Back to Cities</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800">
        {city.image && (
          <img
            src={city.image}
            alt={city.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <Link href={`/states/${stateSlug}/cities`}>
            <Button variant="ghost" className="w-fit text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cities
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{city.name}</h1>
          {city.metaDescription && (
            <p className="text-purple-100 text-lg max-w-2xl">{city.metaDescription}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={generateCityBreadcrumbs({ name: city.name, state: state.name, stateSlug: stateSlug })} />
        {/* Description */}
        {city.description && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">{city.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Location Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">State</p>
                <Link href={`/states/${stateSlug}`}>
                  <a className="text-red-600 hover:underline">{state.name}</a>
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">City</p>
                <p className="text-gray-900">{city.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedCategoryId(null)}
                  variant={selectedCategoryId === null ? "default" : "outline"}
                >
                  All Categories
                </Button>
                {categories.map((cat: any) => (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    variant={selectedCategoryId === cat.id ? "default" : "outline"}
                  >
                    {cat.icon} {cat.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tours Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            Tours in {city.name}
            {selectedCategoryId && (
              <span className="text-purple-600 text-lg">
                {" "}
                - {categories?.find((c: any) => c.id === selectedCategoryId)?.name}
              </span>
            )}
          </h2>

          {toursLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredTours && filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour: any) => (
                <Link key={tour.id} href={`/tours/${tour.slug}`}>
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
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tours found</h3>
              <p className="text-gray-500">
                {selectedCategoryId
                  ? "No tours available in this category for this city."
                  : "No tours available for this city yet."}
              </p>
            </div>
          )}
        </div>

        {/* Things to Do Section */}
        {city && <ThingsToDoSection locationId={city.id} cityName={city.name} />}

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t">
          <nav className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/">
              <a className="hover:text-purple-600">Home</a>
            </Link>
            <span>/</span>
            <Link href="/states">
              <a className="hover:text-purple-600">States</a>
            </Link>
            <span>/</span>
            <Link href={`/states/${stateSlug}`}>
              <a className="hover:text-purple-600">{state.name}</a>
            </Link>
            <span>/</span>
            <Link href={`/states/${stateSlug}/cities`}>
              <a className="hover:text-purple-600">Cities</a>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{city.name}</span>
          </nav>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

import { useRoute, Link } from "wouter";
import { Loader2, MapPin, ArrowLeft, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicLayout } from "@/components/PublicLayout";

export default function CitiesList() {
  const [match, params] = useRoute("/states/:stateSlug/cities");
  const [searchQuery, setSearchQuery] = useState("");
  const stateSlug = params?.stateSlug as string;

  // Fetch all states
  const { data: states } = trpc.states.list.useQuery({ limit: 500 });
  const state = states?.find((s: any) => s.slug === stateSlug);

  // Fetch cities for this state
  const { data: cities, isLoading: citiesLoading } = trpc.locations.listByState.useQuery(
    { stateId: state?.id || 0, limit: 500 },
    { enabled: !!state }
  );

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!cities) return [];
    if (!searchQuery.trim()) return cities;
    
    const query = searchQuery.toLowerCase();
    return cities.filter((city: any) =>
      city.name.toLowerCase().includes(query) ||
      city.description?.toLowerCase().includes(query) ||
      city.metaDescription?.toLowerCase().includes(query)
    );
  }, [cities, searchQuery]);

  if (!match) return null;

  if (!state) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
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

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-r from-green-600 to-green-800">
        {state.image && (
          <img
            src={state.image}
            alt={state.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <Link href={`/states/${stateSlug}`} asChild>
            <Button variant="ghost" className="w-fit text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {state.name}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Cities in {state.name}
          </h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Explore popular destinations and cities across {state.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Cities
            </CardTitle>
            <CardDescription>
              Find cities and destinations in {state.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by city name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Cities Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {filteredCities.length} {filteredCities.length === 1 ? "City" : "Cities"}
          </h2>
          <p className="text-gray-600 mb-6">
            {searchQuery && `Showing results for "${searchQuery}"`}
          </p>

          {citiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredCities && filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city: any) => (
                <Link key={city.id} href={`/states/${stateSlug}/cities/${city.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                    {city.image && (
                      <div className="h-40 overflow-hidden bg-gray-200">
                        <img
                          src={city.image}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                        {city.name}
                      </CardTitle>
                      {city.metaDescription && (
                        <CardDescription className="line-clamp-2">
                          {city.metaDescription}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {city.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {city.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? "No cities found" : "No cities available"}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No cities match your search for "${searchQuery}".`
                  : `No cities are available for ${state.name} yet.`}
              </p>
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-green-600">States</Link>
            <span>/</span>
            <Link href={`/states/${stateSlug}`} className="hover:text-green-600">{state.name}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Cities</span>
          </nav>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

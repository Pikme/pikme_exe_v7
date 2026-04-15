import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { generateDestinationSEO, buildDestinationCanonicalUrl } from "@/lib/seo";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";

export function DestinationCountry() {
  const { trackLocationView } = useAnalytics();
  const params = useParams();
  // Handle both /destinations/:country and /visit/:countryWithSuffix patterns
  let countrySlug = (params.country || params.countryWithSuffix) as string;
  
  // Remove '-tours' suffix if present
  if (countrySlug?.endsWith('-tours')) {
    countrySlug = countrySlug.replace('-tours', '');
  }
  
  const [, navigate] = useLocation();

  // Get country details directly by slug
  const { data: countryData, isLoading: isLoadingCountry } = trpc.destinations.getCountryBySlug.useQuery(
    { slug: countrySlug || "" },
    { enabled: !!countrySlug }
  );

  // Get country details with states and cities
  const { data: destinationData, isLoading: isLoadingDestination } = trpc.destinations.getCountryDetails.useQuery(
    { countryId: countryData?.id || 0 },
    { enabled: !!countryData?.id }
  );

  // Get featured tours for this country
  const { data: tours, isLoading: isLoadingTours } = trpc.destinations.getFeaturedToursByCountry.useQuery(
    { countryId: countryData?.id || 0, limit: 6 },
    { enabled: !!countryData?.id }
  );

  // Generate SEO metadata and track country view
  useEffect(() => {
    if (countryData?.id) {
      trackLocationView(countryData.id, []);
    }
  }, [countryData?.id, trackLocationView]);

  const seoMetadata = countryData
    ? generateDestinationSEO(countryData.name, 'country', {
        stateCount: destinationData?.totalStates,
        tourCount: tours?.length,
      })
    : null;

  const canonicalUrl = countryData ? buildDestinationCanonicalUrl(countrySlug) : undefined;

  const isLoading = isLoadingCountry || isLoadingDestination || isLoadingTours;

  // Track country page view
  useEffect(() => {
    if (countryData?.id) {
      trackLocationView(countryData.id, []);
    }
  }, [countryData?.id, trackLocationView]);

  if (isLoading) {
    return (
      <PublicLayout>
        {seoMetadata && (
          <SEOHead
            metadata={seoMetadata}
            canonicalUrl={canonicalUrl}
          />
        )}
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </PublicLayout>
    );
  }

  if (!countryData) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Destination Not Found</h1>
            <p className="text-muted-foreground mb-6">The destination you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/countries')}>Back to Destinations</Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Group locations by state
  const locationsByState = destinationData?.states?.reduce((acc, state) => {
    if (!acc[state.id]) {
      acc[state.id] = {
        state,
        locations: [],
      };
    }
    destinationData.locations
      ?.filter(loc => loc.stateId === state.id)
      .forEach(loc => {
        acc[state.id].locations.push(loc);
      });
    return acc;
  }, {} as Record<number, { state: any; locations: any[] }>) || {};

  return (
    <PublicLayout>
      {seoMetadata && (
        <SEOHead
          metadata={seoMetadata}
          canonicalUrl={canonicalUrl}
        />
      )}
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{countryData.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{countryData.description}</p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/countries')} variant="outline">
              Back to Destinations
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">States/Provinces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {destinationData?.totalStates || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {destinationData?.locations?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {tours?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Locations & Cities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Locations & Cities</h2>
          {Object.values(locationsByState).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(locationsByState).map(({ state, locations }) => (
                <Card key={state.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {state.name}
                    </CardTitle>
                    <CardDescription>{locations.length} cities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {locations.slice(0, 3).map(location => (
                        <div key={location.id} className="text-sm text-gray-600">
                          • {location.name}
                        </div>
                      ))}
                      {locations.length > 3 && (
                        <div className="text-sm text-gray-500">
                          + {locations.length - 3} more
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/destinations/${countrySlug}/${state.slug}`)}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No locations found</p>
          )}
        </div>

        {/* Featured Tours */}
        {tours && tours.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Featured Tours</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tours.map(tour => (
                <Card key={tour.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {tour.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        {tour.duration && (
                          <p className="text-sm text-gray-600">
                            {tour.duration} days
                          </p>
                        )}
                        {tour.price && (
                          <p className="text-lg font-bold text-red-600">
                            ₹{tour.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={() => window.open(`/visit/tour/${tour.slug}`, '_blank')}>View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
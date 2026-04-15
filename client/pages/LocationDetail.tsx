import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Plane } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { generateLocationSchema, generateBreadcrumbSchema, useStructuredData } from "@/lib/structured-data";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function LocationDetail() {
  const { countrySlug, locationSlug } = useParams<{
    countrySlug: string;
    locationSlug: string;
  }>();
  const [countryId, setCountryId] = useState<number | null>(null);
  const { trackLocationView } = useAnalytics();

  const { data: country } = trpc.countries.getBySlug.useQuery(
    { slug: countrySlug || "" },
    { enabled: !!countrySlug }
  );

  useEffect(() => {
    if (country?.id) {
      setCountryId(country.id);
    }
  }, [country, trackLocationView]);

  const { data: locationData, isLoading } = trpc.locations.getBySlug.useQuery(
    { countryId: countryId || 0, slug: locationSlug || "" },
    { enabled: countryId !== null && !!locationSlug }
  );

  // Track clicks on related locations
  const handleLocationClick = (locationId: number, tagIds?: number[]) => {
    trackLocationView(locationId, tagIds || []);
  };

  // Add structured data for location and track view
  useEffect(() => {
    if (locationData?.location && country) {
      document.title = `${locationData.location.name} - ${country.name} | Pikme`;
      
      // Track location view
      trackLocationView(locationData.location.id, locationData.location.tagIds || []);
      
      const locationSchema = generateLocationSchema({
        id: locationData.location.id,
        name: locationData.location.name,
        description: locationData.location.description || `Explore ${locationData.location.name}`,
        slug: locationData.location.slug || '',
        image: locationData.location.image,
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
        country: country.name,
        rating: locationData.location.rating,
        reviewCount: locationData.location.reviewCount,
      });
      useStructuredData(locationSchema);
      
      const breadcrumbs = [
        { name: 'Home', url: 'https://www.pikmeusa.com' },
        { name: 'Destinations', url: 'https://www.pikmeusa.com/destinations' },
        { name: country.name, url: `https://www.pikmeusa.com/visit/${country.slug}` },
        { name: locationData.location.name, url: `https://www.pikmeusa.com/visit/${country.slug}/${locationData.location.slug}` },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
      useStructuredData(breadcrumbSchema);
    }
  }, [locationData, country, trackLocationView]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!locationData?.location) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Location not found</h2>
          <Button asChild>
            <Link href={`/visit/${countrySlug}`}>Back to Locations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { location, activities } = locationData;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pikme</h1>
          </Link>
          <Button asChild variant="outline">
            <Link href={`/visit/${countrySlug}`}>Back to Locations</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Image */}
        {location.image && (
          <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-4xl font-bold">{location.name}</h1>
                {country && (
                  <p className="text-gray-600 mt-2">{country.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {location.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{location.description}</p>
              </div>
            )}

            {/* Coordinates */}
            {location.latitude && location.longitude && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Location Coordinates</h3>
                <p className="text-sm text-gray-600">
                  Latitude: {location.latitude} | Longitude: {location.longitude}
                </p>
              </div>
            )}

            {/* Activities */}
            {activities && activities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{activity.name}</CardTitle>
                        {activity.category && (
                          <CardDescription className="capitalize">
                            {activity.category}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <div>
                            {activity.duration && (
                              <p className="text-xs text-gray-600">
                                Duration: {activity.duration}
                              </p>
                            )}
                            {activity.price && (
                              <p className="text-sm font-semibold text-red-600">
                                ₹{activity.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                          {activity.difficulty && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded capitalize">
                              {activity.difficulty}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Quick Info</h3>

              {country && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-semibold">{country.name}</p>
                </div>
              )}

              {location.latitude && location.longitude && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="font-semibold text-sm">
                    {location.latitude}, {location.longitude}
                  </p>
                </div>
              )}

              <Button className="w-full" size="lg">
                Plan Your Visit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

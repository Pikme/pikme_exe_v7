import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/SEOHead';
import { generateDestinationSEO, generateTouristDestinationSchema, buildDestinationCanonicalUrl, generateDestinationBreadcrumbs } from '@/lib/seo';
import { PublicLayout } from '@/components/PublicLayout';

export function DestinationState() {
  const params = useParams();
  const countrySlug = params.country as string;
  const stateSlug = params.state as string;
  const [, navigate] = useLocation();

  // Get country by slug
  const { data: countryData } = trpc.countries.getBySlug.useQuery(
    { slug: countrySlug },
    { enabled: !!countrySlug }
  );

  // Get state by slug (using getBySlugAnyCountry to search across all countries)
  const { data: stateData, isLoading: isLoadingState } = trpc.states.getBySlugAnyCountry.useQuery(
    { slug: stateSlug },
    { enabled: !!stateSlug }
  );

  // Get featured tours for this state
  const { data: tours, isLoading: isLoadingTours } = trpc.destinations.getFeaturedToursByState.useQuery(
    { stateId: stateData?.id || 0, limit: 6 },
    { enabled: !!stateData?.id }
  );

  // Get state details with cities
  const { data: stateDetails, isLoading: isLoadingCities } = trpc.destinations.getState.useQuery(
    { stateId: stateData?.id || 0 },
    { enabled: !!stateData?.id }
  );

  const cities = stateDetails?.locations || [];

  // Generate SEO metadata
  const seoMetadata = stateData
    ? generateDestinationSEO(stateData.name, 'state', {
        cityCount: stateData.totalCities,
        tourCount: tours?.length,
      })
    : null;

  const canonicalUrl = stateData && countryData
    ? buildDestinationCanonicalUrl(countrySlug, stateSlug)
    : undefined;

  const breadcrumbs = countryData && stateData
    ? [
        { name: 'Destinations', url: '/destinations' },
        { name: countryData.name, url: `/destinations/${countrySlug}` },
        { name: stateData.name, url: canonicalUrl || '' },
      ]
    : undefined;

  const structuredData = stateData && countryData
    ? JSON.parse(
        generateTouristDestinationSchema(
          stateData.name,
          stateData.metaDescription || stateData.description || '',
          canonicalUrl || '',
          stateData.image,
          tours?.map((t) => ({ name: t.name, price: t.price, duration: t.duration }))
        )
      )
    : undefined;

  if (isLoadingState) {
    return (
      <PublicLayout>
        {seoMetadata && (
          <SEOHead
            metadata={seoMetadata}
            canonicalUrl={canonicalUrl}
            structuredData={structuredData}
            breadcrumbs={breadcrumbs}
          />
        )}
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (!stateData || !countryData) {
    return (
      <PublicLayout>
        {seoMetadata && (
          <SEOHead
            metadata={seoMetadata}
            canonicalUrl={canonicalUrl}
            structuredData={structuredData}
            breadcrumbs={breadcrumbs}
          />
        )}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Destination Not Found</h1>
            <p className="text-muted-foreground mb-6">The destination you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/destinations')}>Back to Destinations</Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {seoMetadata && (
        <SEOHead
          metadata={seoMetadata}
          canonicalUrl={canonicalUrl}
          structuredData={structuredData}
          breadcrumbs={breadcrumbs}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/destinations" className="text-red-600 hover:underline">
              Destinations
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/destinations/${countrySlug}`} className="text-red-600 hover:underline">
              {countryData.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{stateData.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Navigation className="w-6 h-6" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {countryData.name}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{stateData.name}</h1>
          <p className="text-lg text-purple-100 max-w-2xl">{stateData.metaDescription}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Description Section */}
        {stateData.description && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                About {stateData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{stateData.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Featured Tours Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Tours</h2>
            <p className="text-muted-foreground">Explore our curated selection of tours in {stateData.name}</p>
          </div>

          {isLoadingTours ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : tours && tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <Link key={tour.id} href={`/visit/tour/${tour.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tour.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tour.duration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{tour.duration} days</span>
                          </div>
                        )}
                        {tour.price && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-bold text-lg">₹{tour.price.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tours available for this destination yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cities/Locations Section */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Cities & Locations</h2>
            <p className="text-muted-foreground">Discover cities and attractions in {stateData.name}</p>
          </div>

          {isLoadingCities ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : cities && cities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city) => (
                <Link key={city.id} href={`/destinations/${countrySlug}/${stateSlug}/${city.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{city.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{city.description || 'Explore this destination'}</p>
                      <Button variant="outline" className="w-full">Explore</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cities available for this destination yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

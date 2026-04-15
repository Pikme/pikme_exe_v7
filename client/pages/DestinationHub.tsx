import { useParams, useNavigate } from 'wouter';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DestinationHub() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch destination data
  const { data: destination, isLoading: destLoading } = trpc.destinations.getBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  // Fetch tours in this destination
  const { data: tours, isLoading: toursLoading } = trpc.tours.getByCountry.useQuery(
    { countryId: destination?.id || 0 },
    { enabled: !!destination?.id }
  );

  // Fetch related destinations
  const { data: relatedDestinations } = trpc.destinations.getRelated.useQuery(
    { countryId: destination?.id || 0, limit: 5 },
    { enabled: !!destination?.id }
  );

  if (destLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-4">Destination Not Found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">{destination.name} Tours & Travel Packages</h1>
          <p className="text-xl text-red-100 max-w-2xl">
            {destination.description || `Discover the best tours and travel experiences in ${destination.name}`}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Tours */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Available Tours in {destination.name}</h2>
            
            {toursLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" />
              </div>
            ) : tours && tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tours.map((tour) => (
                  <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {tour.image && (
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">
                          {tour.duration} days
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          ₹{typeof tour.price === 'number' ? tour.price.toLocaleString() : tour.price}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/visit/tour/${tour.slug}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-12">
                No tours available in {destination.name} at the moment.
              </p>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            {/* Destination Info Card */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">About {destination.name}</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Country:</strong> {destination.name}
                </p>
                {destination.metaDescription && (
                  <p>{destination.metaDescription}</p>
                )}
              </div>
            </Card>

            {/* Related Destinations */}
            {relatedDestinations && relatedDestinations.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Explore More Destinations</h3>
                <div className="space-y-3">
                  {relatedDestinations.map((dest) => (
                    <Button
                      key={dest.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate(`/destinations/${dest.slug}`)}
                    >
                      {dest.name}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* SEO Info */}
            <Card className="p-6 bg-red-50">
              <h3 className="text-sm font-bold text-red-900 mb-2">Travel Tips</h3>
              <ul className="text-sm text-red-800 space-y-2">
                <li>✓ Expert-guided tours</li>
                <li>✓ Customizable itineraries</li>
                <li>✓ Best value packages</li>
                <li>✓ 24/7 customer support</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-50 py-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore {destination.name}?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your perfect tour today and create unforgettable memories
          </p>
          <Button size="lg" onClick={() => navigate('/visit/tours')}>
            View All Tours
          </Button>
        </div>
      </section>
    </div>
  );
}

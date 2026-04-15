import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { TourFilterPanel } from "@/components/TourFilterPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { TourCardSkeleton } from "@/components/TourCardSkeleton";

export function ToursPage() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState({
    countryIds: [] as number[],
    stateIds: [] as number[],
    cityIds: [] as number[],
  });
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  // Fetch filtered tours
  const { data: tours = [], isLoading: toursLoading } = trpc.tours.filterByLocations.useQuery({
    countryIds: filters.countryIds.length > 0 ? filters.countryIds : undefined,
    stateIds: filters.stateIds.length > 0 ? filters.stateIds : undefined,
    cityIds: filters.cityIds.length > 0 ? filters.cityIds : undefined,
    limit,
    offset,
  });

  // Fetch tour count
  const { data: tourCount = 0 } = trpc.tours.countByLocations.useQuery({
    countryIds: filters.countryIds.length > 0 ? filters.countryIds : undefined,
    stateIds: filters.stateIds.length > 0 ? filters.stateIds : undefined,
    cityIds: filters.cityIds.length > 0 ? filters.cityIds : undefined,
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setOffset(0); // Reset to first page when filters change
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  };

  return (
    <PublicLayout>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Tours</h1>
          <p className="text-muted-foreground">
            Discover amazing tours across multiple countries and destinations
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Panel - Fixed width on desktop */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-4">
              <TourFilterPanel onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Tours List - Flexible width */}
          <div className="flex-1 space-y-6">
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing {offset + 1}-{Math.min(offset + limit, tourCount)} of {tourCount} tours
                </p>
              </div>
            </div>

            {/* Loading State */}
            {toursLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TourCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!toursLoading && tours.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No tours found matching your filters. Try adjusting your selection.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tours Grid */}
            {tours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tours.map((tour) => (
                  <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {tour.image && (
                      <div className="w-full h-48 bg-muted overflow-hidden">
                        <img
                          src={tour.image}
                          alt={tour.name}
                          className="w-full h-full object-cover will-change-transform hover:scale-105 transition-transform duration-300 ease-out"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {tour.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{tour.duration} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold">
                            ₹{typeof tour.price === 'number' ? tour.price.toLocaleString() : tour.price}
                          </p>
                        </div>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => window.open(`/visit/tour/${tour.slug}`, '_blank')}>View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!toursLoading && tours.length > 0 && (
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {Math.floor(offset / limit) + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={offset + limit >= tourCount}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

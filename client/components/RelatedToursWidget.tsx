import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface RelatedToursWidgetProps {
  tourId: number;
  limit?: number;
}

export function RelatedToursWidget({ tourId, limit = 4 }: RelatedToursWidgetProps) {
  const [, navigate] = useLocation();
  const { data: relatedTours = [], isLoading } = trpc.tours.getRelated.useQuery({
    tourId,
    limit,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!relatedTours || relatedTours.length === 0) {
    return (
      <div className="w-full py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Explore More Tours</h2>
          <p className="text-muted-foreground mb-6">Discover other amazing tours and destinations</p>
          <Button onClick={() => navigate('/tours')} className="bg-primary hover:bg-primary/90">
            Browse All Tours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Explore Similar Tours</h2>
        <p className="text-muted-foreground mb-8">
          Discover other amazing tours in the same category
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {tour.image && (
                <div className="w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tour.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{tour.duration} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold">
                      ₹{typeof tour.price === 'number' ? tour.price.toLocaleString() : tour.price}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => window.open(`/visit/tour/${tour.slug}`, '_blank')}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

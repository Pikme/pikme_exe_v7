import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";
import { useSearchRanking, RankedLocation } from "@/hooks/useSearchRanking";
import { useState } from "react";

interface RankedLocationsListProps {
  locationIds: number[];
  countrySlug: string;
  showMetrics?: boolean;
  limit?: number;
}

export function RankedLocationsList({
  locationIds,
  countrySlug,
  showMetrics = true,
  limit,
}: RankedLocationsListProps) {
  const { rankedResults, isLoading, error } = useSearchRanking(locationIds);
  const [sortBy, setSortBy] = useState<"ranking" | "engagement" | "views" | "conversions">("ranking");

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading ranked results. Showing default order.
      </div>
    );
  }

  let displayResults = [...rankedResults];

  // Apply sorting
  switch (sortBy) {
    case "engagement":
      displayResults.sort((a, b) => b.engagementScore - a.engagementScore);
      break;
    case "views":
      displayResults.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case "conversions":
      displayResults.sort((a, b) => b.conversionRate - a.conversionRate);
      break;
    case "ranking":
    default:
      // Already sorted by ranking score
      break;
  }

  // Apply limit
  if (limit) {
    displayResults = displayResults.slice(0, limit);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (displayResults.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        No locations found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showMetrics && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={sortBy === "ranking" ? "default" : "outline"}
            onClick={() => setSortBy("ranking")}
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            By Ranking
          </Button>
          <Button
            variant={sortBy === "engagement" ? "default" : "outline"}
            onClick={() => setSortBy("engagement")}
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            By Engagement
          </Button>
          <Button
            variant={sortBy === "views" ? "default" : "outline"}
            onClick={() => setSortBy("views")}
            size="sm"
          >
            Views
          </Button>
          <Button
            variant={sortBy === "conversions" ? "default" : "outline"}
            onClick={() => setSortBy("conversions")}
            size="sm"
          >
            Conversions
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayResults.map((location, index) => (
          <Link
            key={location.locationId}
            href={`/visit/${countrySlug}/${location.slug}`}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              {/* Ranking Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  #{index + 1}
                </Badge>
              </div>

              {/* Image */}
              {location.image && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg relative">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  {/* Engagement Score Overlay */}
                  {showMetrics && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      Engagement: {location.engagementScore.toFixed(1)}/100
                    </div>
                  )}
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {location.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {location.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {location.description}
                  </p>
                )}

                {/* Metrics Display */}
                {showMetrics && (
                  <div className="bg-gray-50 p-3 rounded mb-4 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-semibold">{location.viewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CTR:</span>
                      <span className="font-semibold">{location.clickThroughRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion:</span>
                      <span className="font-semibold">{location.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-gray-600">Ranking Score:</span>
                      <span className="font-semibold text-blue-600">
                        {location.finalRankingScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button size="sm" className="w-full mt-auto">
                  Explore
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

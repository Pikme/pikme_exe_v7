import { useState } from "react";
import { Loader2, MapPin, Clock, DollarSign, Star, ChefHat, Building2, Landmark, Church, Mountain, Trees, Utensils, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ThingsToDoSectionProps {
  locationId: number;
  cityName: string;
}

const ATTRACTION_ICONS: Record<string, React.ReactNode> = {
  landmark: <Landmark className="w-5 h-5" />,
  restaurant: <ChefHat className="w-5 h-5" />,
  museum: <Building2 className="w-5 h-5" />,
  temple: <Church className="w-5 h-5" />,
  monument: <Mountain className="w-5 h-5" />,
  park: <Trees className="w-5 h-5" />,
  cafe: <Utensils className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  other: <MapPin className="w-5 h-5" />,
};

const ATTRACTION_LABELS: Record<string, string> = {
  landmark: "Landmarks",
  restaurant: "Restaurants",
  museum: "Museums",
  temple: "Temples",
  monument: "Monuments",
  park: "Parks",
  cafe: "Cafes",
  shopping: "Shopping",
  other: "Other",
};

export default function ThingsToDoSection({ locationId, cityName }: ThingsToDoSectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch attractions for this location
  const { data: attractions, isLoading: attractionsLoading } = trpc.attractions.listByLocation.useQuery(
    { locationId, limit: 100 },
    { enabled: !!locationId }
  );

  // Filter attractions by type if selected
  const filteredAttractions = selectedType
    ? attractions?.filter((a: any) => a.type === selectedType)
    : attractions;

  // Get featured attractions
  const { data: featured } = trpc.attractions.getFeatured.useQuery(
    { locationId, limit: 6 },
    { enabled: !!locationId }
  );

  if (!attractions || attractions.length === 0) {
    return null;
  }

  // Group attractions by type for tabs
  const types = Array.from(new Set(attractions.map((a: any) => a.type)));

  return (
    <div className="my-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Things to Do in {cityName}</h2>
        <p className="text-gray-600">
          Explore popular landmarks, restaurants, museums, and attractions in {cityName}
        </p>
      </div>

      {/* Type Filter Tabs */}
      {types.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filter by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedType(null)}
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
              >
                All ({attractions.length})
              </Button>
              {types.map((type) => {
                const count = attractions.filter((a: any) => a.type === type).length;
                return (
                  <Button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {ATTRACTION_ICONS[type]}
                    {ATTRACTION_LABELS[type]} ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attractions Grid */}
      {attractionsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredAttractions && filteredAttractions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction: any) => (
            <Card key={attraction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              {attraction.image && (
                <div className="h-40 overflow-hidden bg-gray-200">
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {ATTRACTION_ICONS[attraction.type]}
                      <span className="text-xs font-medium text-blue-600 uppercase">
                        {ATTRACTION_LABELS[attraction.type]}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{attraction.name}</CardTitle>
                  </div>
                  {attraction.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{attraction.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Description */}
                  {attraction.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {attraction.description}
                    </p>
                  )}

                  {/* Address */}
                  {attraction.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{attraction.address}</span>
                    </div>
                  )}

                  {/* Hours */}
                  {attraction.openingHours && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{attraction.openingHours}</span>
                    </div>
                  )}

                  {/* Entry Fee */}
                  {attraction.entryFee && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>{attraction.entryFee}</span>
                    </div>
                  )}

                  {/* Estimated Visit Time */}
                  {attraction.estimatedVisitTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Visit: {attraction.estimatedVisitTime}</span>
                    </div>
                  )}

                  {/* Highlights */}
                  {attraction.highlights && Array.isArray(attraction.highlights) && attraction.highlights.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-700 mb-2">Highlights:</p>
                      <ul className="space-y-1">
                        {attraction.highlights.slice(0, 3).map((highlight: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="line-clamp-1">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contact Info */}
                  {(attraction.phone || attraction.website) && (
                    <div className="pt-2 border-t space-y-1">
                      {attraction.phone && (
                        <p className="text-xs text-gray-600">
                          <strong>Phone:</strong> {attraction.phone}
                        </p>
                      )}
                      {attraction.website && (
                        <p className="text-xs">
                          <a
                            href={attraction.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visit Website →
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No attractions found</h3>
          <p className="text-gray-500">
            {selectedType
              ? `No ${ATTRACTION_LABELS[selectedType].toLowerCase()} available for this city.`
              : "No attractions available for this city yet."}
          </p>
        </div>
      )}

      {/* Featured Attractions Sidebar */}
      {featured && featured.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-2xl font-bold mb-6">Featured Attractions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((attraction: any) => (
              <div key={attraction.id} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 text-blue-600">
                  {ATTRACTION_ICONS[attraction.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {attraction.name}
                  </h4>
                  {attraction.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{attraction.rating}</span>
                    </div>
                  )}
                  {attraction.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {attraction.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

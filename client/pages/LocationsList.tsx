import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plane, MapPin } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { RankedLocationsList } from "@/components/RankedLocationsList";

export default function LocationsList() {
  const { language } = useLanguage();
  useSEO({
    pageKey: "destinations",
    language,
    baseUrl: "https://www.pikmeusa.com",
    path: "/destinations",
  });
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const [countryId, setCountryId] = useState<number | null>(null);

  const { data: country } = trpc.countries.getBySlug.useQuery(
    { slug: countrySlug || "" },
    { enabled: !!countrySlug }
  );

  useEffect(() => {
    if (country?.id) {
      setCountryId(country.id);
    }
  }, [country]);

  const { data: locations, isLoading } = trpc.locations.listByCountry.useQuery(
    { countryId: countryId || 0, limit: 50 },
    { enabled: countryId !== null }
  );

  // Extract location IDs for ranking
  const locationIds = locations?.map(loc => loc.id) || [];

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
            <Link href="/countries">Back to Countries</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 flex-1">
        {country && (
          <>
            <h2 className="text-4xl font-bold mb-2">{country.name}</h2>
            {country.description && (
              <p className="text-gray-600 mb-8">{country.description}</p>
            )}
          </>
        )}

        <h3 className="text-2xl font-bold mb-8">Locations & Cities</h3>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : locations && locations.length > 0 ? (
          <RankedLocationsList
            locationIds={locationIds}
            countrySlug={countrySlug || ""}
            showMetrics={true}
          />
        ) : (
          <p className="text-center text-gray-600 py-12">No locations found</p>
        )}
      </div>
    </div>
  );
}

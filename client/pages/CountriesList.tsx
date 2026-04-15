import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/PublicLayout";
import { Loader2, Globe } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { Breadcrumb, generateCountriesBreadcrumbs } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";

export default function CountriesList() {
  const { language } = useLanguage();
  useSEO({
    pageKey: "destinations",
    language,
    baseUrl: "https://www.pikmeusa.com",
    path: "/countries",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const { data: countries, isLoading } = trpc.countries.list.useQuery({
    limit: 1000,
  });

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    const countryList = Array.isArray(countries) ? countries : [];
    if (!searchQuery) return countryList;
    
    return countryList.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCountries.slice(startIndex, endIndex);
  }, [filteredCountries, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={generateCountriesBreadcrumbs()} />
        <h2 className="text-4xl font-bold mb-8">Explore Destinations</h2>

        {/* Search Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredCountries.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} destinations
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredCountries && filteredCountries.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCountries.map((country) => (
              <Link key={country.id} href={`/visit/${country.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {country.image && (
                    <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg">
                      <img
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          {country.name}
                        </CardTitle>
                        {country.code && (
                          <CardDescription>{country.code}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {country.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {country.description}
                      </p>
                    )}
                    <Button size="sm" className="w-full">
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCountries.length}
              isLoading={isLoading}
            />
          )}
          </>
        ) : (
          <p className="text-center text-gray-600 py-12">No countries available</p>
        )}
      </div>
    </PublicLayout>
  );
}

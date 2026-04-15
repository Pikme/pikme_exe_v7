import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Loader2, MapPin, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { Breadcrumb, generateStatesListBreadcrumbs } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";

export default function StatesList() {
  const { language } = useLanguage();
  useSEO({
    pageKey: "attractions",
    language,
    baseUrl: "https://www.pikmeusa.com",
    path: "/states",
  });
  const [selectedCountryId, setSelectedCountryId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const statesGridRef = useRef<HTMLDivElement>(null);

  const { data: countries, isLoading: countriesLoading } = trpc.countries.list.useQuery({ limit: 500 });
  const { data: states, isLoading: statesLoading } = trpc.states.listByCountry.useQuery(
    { countryId: selectedCountryId, limit: 500 },
    { enabled: selectedCountryId > 0 }
  );

  const filteredStates = useMemo(() => {
    const stateList = states?.filter((state: any) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    return stateList;
  }, [states, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStates.length / itemsPerPage);
  const paginatedStates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStates.slice(startIndex, endIndex);
  }, [filteredStates, currentPage]);

  const selectedCountry = countries?.find((c: any) => c.id === selectedCountryId);

  // Auto-scroll to states section when country is selected
  useEffect(() => {
    if (statesGridRef.current && selectedCountryId) {
      setTimeout(() => {
        statesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [selectedCountryId]);

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-red-50 to-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Explore by State</h1>
            </div>
            <p className="text-red-100 text-lg">
              Discover amazing tours and destinations across {selectedCountry?.name || "different states"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={generateStatesListBreadcrumbs()} />
        {/* Country Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Country</CardTitle>
            <CardDescription>Choose a country to browse its states and tours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {countriesLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              ) : (
                countries?.map((country: any) => (
                  <Button
                    key={country.id}
                    onClick={() => {
                      setSelectedCountryId(country.id);
                      setSearchTerm("");
                    }}
                    variant={selectedCountryId === country.id ? "default" : "outline"}
                    className="w-full"
                  >
                    {country.name}
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Results Count */}
        {filteredStates.length > 0 && (
          <div className="mb-6 text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStates.length)} of {filteredStates.length} states
          </div>
        )}

        {/* States Grid */}
        <div ref={statesGridRef}>
        {statesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredStates.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStates.map((state: any) => (
              <Link key={state.id} href={`/states/${state.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {state.image && (
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={state.image}
                        alt={state.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{state.name}</CardTitle>
                    {state.metaDescription && (
                      <CardDescription className="line-clamp-2">{state.metaDescription}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {state.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{state.description}</p>
                    )}
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
              totalItems={filteredStates.length}
              isLoading={statesLoading}
            />
          )}
          </>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No states found</h3>
            <p className="text-gray-500">Try adjusting your search or selecting a different country</p>
          </div>
        )}
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/">
              <a className="hover:text-red-600">Home</a>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">States</span>
            {selectedCountry && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">{selectedCountry.name}</span>
              </>
            )}
          </nav>
        </div>
        </div>
      </div>
    </PublicLayout>
  );
}

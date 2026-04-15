import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, generateToursListBreadcrumbs } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";

export default function ToursList() {
  const { language } = useLanguage();
  useSEO({
    pageKey: "tours",
    language,
    baseUrl: "https://www.pikmeusa.com",
    path: "/tours",
  });
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const { data: tours, isLoading } = trpc.tours.list.useQuery({
    limit: 1000,
    offset: 0,
    categoryId: category ? parseInt(category) : undefined,
  });

  // Filter tours based on search query
  const filteredTours = useMemo(() => {
    const tourList = Array.isArray(tours) ? tours : [];
    if (!searchQuery) return tourList;
    
    return tourList.filter(tour => 
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tours, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTours.slice(startIndex, endIndex);
  }, [filteredTours, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={generateToursListBreadcrumbs()} />
        <h2 className="text-4xl font-bold mb-8">All Tours</h2>

        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <Input
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
            className="flex-1 min-w-[200px]"
          />
          <select
            value={category}
            onChange={(e) => handleFilterChange(() => setCategory(e.target.value))}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="beach">Beach</option>
            <option value="mountain">Mountain</option>
            <option value="spiritual">Spiritual</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredTours.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTours.length)} of {filteredTours.length} tours
        </div>

        {/* Tours Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredTours && filteredTours.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedTours.map((tour) => (
              <Link key={tour.id} href={`/visit/tour/${tour.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {tour.image && (
                    <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                    {tour.categoryId && (
                      <CardDescription className="capitalize">
                        Category ID: {tour.categoryId}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tour.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        {tour.duration && (
                          <p className="text-sm text-gray-600">
                            {tour.duration} days
                          </p>
                        )}
                        {tour.price && (
                          <p className="text-lg font-bold text-red-600">
                            ₹{tour.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button size="sm">View</Button>
                    </div>
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
              totalItems={filteredTours.length}
              isLoading={isLoading}
            />
          )}
          </>
        ) : (
          <p className="text-center text-gray-600 py-12">No tours found</p>
        )}
      </div>
    </PublicLayout>
  );
}

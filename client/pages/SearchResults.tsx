import React, { useState, useEffect } from 'react';
import { useSearch } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Loader2, MapPin, Clock, DollarSign, X } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Pagination } from '@/components/Pagination';

interface SearchParams {
  q?: string;
}

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
}

export default function SearchResults() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const searchQuery = params.get('q') || '';
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(true);
  
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch tours search results
  const { data: toursData, isLoading: toursLoading } = trpc.tours.search.useQuery(
    {
      query: searchQuery,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minDuration: filters.minDuration,
      maxDuration: filters.maxDuration,
      limit: itemsPerPage,
      offset: offset,
    },
    {
      enabled: !!searchQuery,
    }
  );

  // Get tours count
  const { data: toursCount } = trpc.tours.searchCount.useQuery(
    {
      query: searchQuery,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minDuration: filters.minDuration,
      maxDuration: filters.maxDuration,
    },
    {
      enabled: !!searchQuery,
    }
  );

  // Fetch activities search results
  const { data: activitiesData, isLoading: activitiesLoading } = trpc.activities.search.useQuery(
    {
      query: searchQuery,
      limit: itemsPerPage,
      offset: offset,
    },
    {
      enabled: !!searchQuery,
    }
  );

  // Get activities count
  const { data: activitiesCount } = trpc.activities.searchCount.useQuery(
    {
      query: searchQuery,
    },
    {
      enabled: !!searchQuery,
    }
  );

  const tours = toursData || [];
  const activities = activitiesData || [];
  const totalResults = (toursCount || 0) + (activitiesCount || 0);
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const isLoading = toursLoading || activitiesLoading;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: value
    }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minDuration' : 'maxDuration']: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: `Search Results`, href: "#" },
            ]}
          />

          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Search Results</h1>
            <p className="text-gray-600">
              {searchQuery ? `Found ${totalResults} results for "${searchQuery}"` : 'Enter a search query to find tours and activities'}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Main Content with Filters */}
          {!isLoading && totalResults > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Filters</h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                      {showFilters ? '✕' : '☰'}
                    </button>
                  </div>

                  {showFilters && (
                    <Card>
                      <CardContent className="pt-6 space-y-6">
                        {/* Price Filter */}
                        <div>
                          <label className="block text-sm font-semibold mb-3">Price Range (₹)</label>
                          <div className="space-y-2">
                            <input
                              type="number"
                              placeholder="Min Price"
                              value={filters.minPrice || ''}
                              onChange={(e) => handlePriceChange(e, 'min')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <input
                              type="number"
                              placeholder="Max Price"
                              value={filters.maxPrice || ''}
                              onChange={(e) => handlePriceChange(e, 'max')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        {/* Duration Filter */}
                        <div>
                          <label className="block text-sm font-semibold mb-3">Duration (Days)</label>
                          <div className="space-y-2">
                            <input
                              type="number"
                              placeholder="Min Days"
                              value={filters.minDuration || ''}
                              onChange={(e) => handleDurationChange(e, 'min')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <input
                              type="number"
                              placeholder="Max Days"
                              value={filters.maxDuration || ''}
                              onChange={(e) => handleDurationChange(e, 'max')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                          <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="w-full"
                          >
                            Clear Filters
                          </Button>
                        )}

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                          <div className="pt-4 border-t">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Active Filters:</p>
                            <div className="space-y-1 text-xs">
                              {filters.minPrice && <p>Min Price: ₹{filters.minPrice}</p>}
                              {filters.maxPrice && <p>Max Price: ₹{filters.maxPrice}</p>}
                              {filters.minDuration && <p>Min Duration: {filters.minDuration} days</p>}
                              {filters.maxDuration && <p>Max Duration: {filters.maxDuration} days</p>}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Results Grid */}
              <div className="lg:col-span-3">
                {/* Tours Section */}
                {tours.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Tours ({toursCount})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tours.map((tour: any) => (
                        <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {tour.image && (
                            <div className="relative h-48 overflow-hidden bg-gray-200">
                              <img
                                src={tour.image}
                                alt={tour.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                            {tour.duration && (
                              <CardDescription className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {tour.duration} days
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {tour.description || 'Discover amazing tour experience'}
                            </p>
                            {tour.price && (
                              <div className="flex items-center gap-2 mb-4">
                                <span className="font-bold text-lg">₹{tour.price.toLocaleString()}</span>
                              </div>
                            )}
                            <Link href={`/visit/tour/${tour.slug}`}>
                              <Button className="w-full bg-red-600 hover:bg-red-700">
                                View Details
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities Section */}
                {activities.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Activities ({activitiesCount})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activities.map((activity: any) => (
                        <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {activity.image && (
                            <div className="relative h-48 overflow-hidden bg-gray-200">
                              <img
                                src={activity.image}
                                alt={activity.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{activity.name}</CardTitle>
                            {activity.category && (
                              <CardDescription className="text-red-600 font-medium">
                                {activity.category}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {activity.description || 'Discover amazing activity'}
                            </p>
                            {activity.price && (
                              <div className="flex items-center gap-2 mb-4">
                                <span className="font-bold text-lg">₹{activity.price.toLocaleString()}</span>
                              </div>
                            )}
                            <Link href={`/activities`}>
                              <Button className="w-full bg-red-600 hover:bg-red-700">
                                View Activity
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  {searchQuery
                    ? `No results found for "${searchQuery}" with the selected filters`
                    : 'Enter a search query to find tours and activities'}
                </p>
                <Link href="/tours">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Browse All Tours
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Clock, DollarSign, Search } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { PublicLayout } from "@/components/PublicLayout";
import { Breadcrumb, generateActivitiesListBreadcrumbs } from "@/components/Breadcrumb";
import { Pagination } from "@/components/Pagination";

export default function ActivitiesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Fetch all activities
  const { data: activitiesData, isLoading } = trpc.activities.list.useQuery(
    {
      limit: 1000,
      offset: 0,
    },
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    const activities = Array.isArray(activitiesData) ? activitiesData : [];
    const cats = new Set(activities.map(a => a.category).filter(Boolean));
    return Array.from(cats);
  }, [activitiesData]);

  const difficulties = useMemo(() => {
    const activities = Array.isArray(activitiesData) ? activitiesData : [];
    const diffs = new Set(activities.map(a => a.difficulty).filter(Boolean));
    return Array.from(diffs);
  }, [activitiesData]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    const activities = Array.isArray(activitiesData) ? activitiesData : [];
    if (!activities || activities.length === 0) return [];
    
    return activities.filter(activity => {
      const matchesSearch = !searchQuery || 
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || activity.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || activity.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [activitiesData, searchQuery, selectedCategory, selectedDifficulty]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  }, [filteredActivities, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Explore Activities</h1>
            <p className="text-red-100">Discover amazing activities and experiences across India</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={generateActivitiesListBreadcrumbs()} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory || ""}
              onChange={(e) => handleFilterChange(() => setSelectedCategory(e.target.value || null))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty || ""}
              onChange={(e) => handleFilterChange(() => setSelectedDifficulty(e.target.value || null))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-gray-600">
            {(() => {
              const activities = Array.isArray(activitiesData) ? activitiesData : [];
              return `Showing ${filteredActivities.length} of ${activities.length} activities`;
            })()}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          )}

          {/* Activities Grid */}
          {!isLoading && filteredActivities.length > 0 && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{activity.name}</CardTitle>
                    {activity.category && (
                      <CardDescription className="text-red-600 font-semibold">
                        {activity.category}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {activity.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {activity.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{activity.duration}</span>
                        </div>
                      )}
                      {activity.price !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span>₹{activity.price}</span>
                        </div>
                      )}
                      {activity.difficulty && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="capitalize text-gray-600">
                            Difficulty: {activity.difficulty}
                          </span>
                        </div>
                      )}
                      {activity.bestTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">
                            Best: {activity.bestTime}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link href={`/activity/${activity.slug}`}>
                      <Button className="w-full" variant="default">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredActivities.length}
                isLoading={isLoading}
              />
            )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No activities found matching your filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedDifficulty(null);
                  setCurrentPage(1);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

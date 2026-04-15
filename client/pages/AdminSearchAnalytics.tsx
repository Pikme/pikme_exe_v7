import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { DashboardLayout } from '@/components/DashboardLayout';

interface SearchMetrics {
  totalSearches: number;
  uniqueSearchTerms: number;
  avgResultsPerSearch: number;
}

interface FilterMetrics {
  totalFilterUsages: number;
  filterTypes: number;
  topFilters: Array<{
    filterId: string;
    filterType: string;
    filterValue: string;
    usageCount: number;
  }>;
}

export function AdminSearchAnalytics() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });

  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(null);
  const [filterMetrics, setFilterMetrics] = useState<FilterMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSearchMetricsQuery = trpc.analytics.getSearchMetrics.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { enabled: false }
  );

  const getFilterMetricsQuery = trpc.analytics.getFilterMetrics.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    { enabled: false }
  );

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const [searchData, filterData] = await Promise.all([
        getSearchMetricsQuery.refetch(),
        getFilterMetricsQuery.refetch(),
      ]);

      if (searchData.data) {
        setSearchMetrics(searchData.data);
      }
      if (filterData.data) {
        setFilterMetrics(filterData.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const handleDateRangeChange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ start, end });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track search terms, filter usage, and user search behavior
            </p>
          </div>
        </div>

        {/* Date Range Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select a time period to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={dateRange.start.getTime() === new Date(new Date().setDate(new Date().getDate() - 7)).getTime() ? 'default' : 'outline'}
                onClick={() => handleDateRangeChange(7)}
              >
                Last 7 Days
              </Button>
              <Button
                variant={dateRange.start.getTime() === new Date(new Date().setDate(new Date().getDate() - 30)).getTime() ? 'default' : 'outline'}
                onClick={() => handleDateRangeChange(30)}
              >
                Last 30 Days
              </Button>
              <Button
                variant={dateRange.start.getTime() === new Date(new Date().setDate(new Date().getDate() - 90)).getTime() ? 'default' : 'outline'}
                onClick={() => handleDateRangeChange(90)}
              >
                Last 90 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{searchMetrics?.totalSearches || 0}</div>
                  <p className="text-xs text-muted-foreground">searches in selected period</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Search Terms</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{searchMetrics?.uniqueSearchTerms || 0}</div>
                  <p className="text-xs text-muted-foreground">different search terms</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {searchMetrics?.avgResultsPerSearch.toFixed(1) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">results per search</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Usage</CardTitle>
            <CardDescription>Most used filters in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filterMetrics?.topFilters && filterMetrics.topFilters.length > 0 ? (
              <div className="space-y-4">
                {filterMetrics.topFilters.map((filter) => (
                  <div key={filter.filterId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{filter.filterType}</p>
                        <p className="text-sm text-muted-foreground">{filter.filterValue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{filter.usageCount}</p>
                      <p className="text-xs text-muted-foreground">uses</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No filter data available</p>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Filter Usages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filterMetrics?.totalFilterUsages || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                across {filterMetrics?.filterTypes || 0} filter types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Search Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {searchMetrics && searchMetrics.totalSearches > 0
                  ? (searchMetrics.uniqueSearchTerms / searchMetrics.totalSearches * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                unique terms per search ratio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

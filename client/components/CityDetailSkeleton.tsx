import { PublicLayout } from '@/components/PublicLayout';

export function CityDetailSkeleton() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Breadcrumb Skeleton */}
        <div className="bg-muted/50 py-4 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <span className="text-muted-foreground">/</span>
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <span className="text-muted-foreground">/</span>
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <span className="text-muted-foreground">/</span>
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            {/* Badge Skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded animate-pulse" />
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Title Skeleton */}
            <div className="mb-4">
              <div className="h-12 w-64 bg-white/20 rounded animate-pulse mb-2" />
              <div className="h-12 w-48 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 max-w-2xl">
              <div className="h-5 w-full bg-white/20 rounded animate-pulse" />
              <div className="h-5 w-5/6 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* About Section Skeleton */}
          <div className="mb-12 border rounded-lg p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-muted rounded animate-pulse" />
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Featured Tours Section */}
          <div className="mb-12">
            <div className="mb-8">
              <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-5 w-64 bg-muted rounded animate-pulse" />
            </div>

            {/* Tour Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden bg-white">
                  {/* Card Header Skeleton */}
                  <div className="p-4">
                    <div className="h-6 w-full bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse mb-4" />
                  </div>

                  {/* Card Content Skeleton */}
                  <div className="px-4 pb-4 space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-muted animate-pulse" />
      
      {/* Header Skeleton */}
      <CardHeader>
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
          {/* Description skeleton */}
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
      </CardHeader>
      
      {/* Content Skeleton */}
      <CardContent className="space-y-4">
        {/* Duration and Price skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
            <div className="h-5 bg-muted rounded animate-pulse w-20" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
            <div className="h-5 bg-muted rounded animate-pulse w-24" />
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </CardContent>
    </Card>
  );
}

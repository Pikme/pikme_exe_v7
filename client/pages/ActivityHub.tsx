import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout } from "@/components/PublicLayout";
import { Link } from "wouter";
import { useEffect } from "react";
import { generateActivitySchema, useStructuredData } from "@/lib/structured-data";

export default function ActivityHub() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  // Fetch all activities
  const { data: allActivities, isLoading: isLoadingActivities } = trpc.activities.list.useQuery({ limit: 1000 });
  
  // Find activity by slug
  const activity = allActivities?.find((a: any) => a.slug === slug || a.name.toLowerCase().replace(/\s+/g, '-') === slug);

  // Fetch tours with this activity
  const { data: allTours, isLoading: isLoadingTours } = trpc.tours.list.useQuery({ limit: 1000 });
  const toursWithActivity = allTours?.filter((t: any) => t.activities?.includes(activity?.name)) || [];

  // Fetch related activities (same category/type)
  const relatedActivities = allActivities?.filter((a: any) => 
    a.id !== activity?.id && 
    a.category === activity?.category
  ).slice(0, 4) || [];

  // Update meta tags
  useEffect(() => {
    if (activity) {
      document.title = `${activity.name} Tours & Experiences | Pikme`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', `Explore ${activity.name} tours and experiences across India. Professional guides, comfortable accommodations, and unforgettable adventures with Pikme.`);
      
      // Add schema markup
      const activitySchema = generateActivitySchema({
        name: activity.name,
        description: activity.description || `Explore ${activity.name} experiences`,
        image: activity.image,
        tourCount: toursWithActivity.length,
      });
      useStructuredData(activitySchema);
    }
  }, [activity, toursWithActivity.length]);

  if (isLoadingActivities || isLoadingTours) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </PublicLayout>
    );
  }

  if (!activity) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Activity Not Found</h1>
            <p className="text-muted-foreground mb-6">The activity you're looking for doesn't exist.</p>
            <Link href="/activities" asChild>
              <Button>Back to Activities</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-r from-red-600 to-red-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <Link href="/activities" asChild>
              <Button variant="ghost" className="w-fit text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Activities
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              {activity.icon && <span className="text-4xl">{activity.icon}</span>}
              <h1 className="text-4xl md:text-5xl font-bold text-white">{activity.name}</h1>
            </div>
            {activity.description && (
              <p className="text-red-100 text-lg max-w-2xl">{activity.description}</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Tours Section */}
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Tours Featuring {activity.name}</h2>
              <p className="text-gray-600">Discover {toursWithActivity.length} amazing tours with {activity.name} experiences</p>
            </div>

            {toursWithActivity.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toursWithActivity.map((tour: any) => (
                  <Link key={tour.id} href={`/visit/tour/${tour.slug}`} asChild>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      {tour.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={tour.image} 
                            alt={tour.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{tour.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{tour.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {tour.duration && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-600" />
                              <span>{tour.duration} Days</span>
                            </div>
                          )}
                          {tour.price && (
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-red-600" />
                              <span className="font-semibold">₹{tour.price}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No tours currently feature {activity.name}</p>
                <Link href="/tours" asChild>
                  <Button>Browse All Tours</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Related Activities Section - SEO Internal Linking */}
          {relatedActivities.length > 0 && (
            <div className="mb-16 bg-gradient-to-r from-red-50 to-red-100 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Related {activity.category || 'Activities'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedActivities.map((relatedActivity: any) => (
                  <Link 
                    key={relatedActivity.id} 
                    href={`/activities/${relatedActivity.slug || relatedActivity.name.toLowerCase().replace(/\s+/g, '-')}`}
                    asChild
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {relatedActivity.icon && <span className="text-2xl">{relatedActivity.icon}</span>}
                          <CardTitle className="text-lg">{relatedActivity.name}</CardTitle>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Explore More Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Explore More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/tours" asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>All Tours</CardTitle>
                    <CardDescription>Browse our complete collection of travel experiences</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              
              <Link href="/activities" asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>All Activities</CardTitle>
                    <CardDescription>Discover all available activity types and experiences</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/destinations" asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>Destinations</CardTitle>
                    <CardDescription>Explore tours by destination and geography</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

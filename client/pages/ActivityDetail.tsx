import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Clock, DollarSign, AlertCircle, ArrowLeft, Share2, Calendar, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight, Star, Users, MapPinIcon } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, generateActivityBreadcrumbs } from "@/components/Breadcrumb";
import { Helmet } from "react-helmet-async";

export default function ActivityDetail() {
  const params = useParams<{ id?: string; slug?: string }>();
  const param = params.id || params.slug || "";
  const [, setLocation] = useLocation();
  
  // Determine if param is numeric ID or slug
  const isNumericId = /^\d+$/.test(param);
  
  // Use appropriate query based on param type
  const byIdQuery = trpc.activities.getById.useQuery(
    { id: param },
    { enabled: isNumericId }
  );
  const bySlugQuery = trpc.activities.getBySlug.useQuery(
    { slug: param },
    { enabled: !isNumericId }
  );
  
  const data = isNumericId ? byIdQuery.data : bySlugQuery.data;
  const isLoading = isNumericId ? byIdQuery.isLoading : bySlugQuery.isLoading;
  const error = isNumericId ? byIdQuery.error : bySlugQuery.error;
  const [isCopied, setIsCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data?.activity) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>Activity not found</span>
          </div>
          <Button onClick={() => setLocation("/admin/activities")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const activity = data.activity;
  
  // Parse inclusions and exclusions from semicolon-separated strings
  const parseItems = (str: string | null | undefined): string[] => {
    if (!str) return [];
    return str
      .split(';')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };
  
  const inclusions = parseItems(activity.whatIncluded);
  const exclusions = parseItems(activity.whatExcluded);
  
  // Parse itinerary (JSON or plain text)
  const parseItinerary = (str: string | null | undefined) => {
    if (!str || typeof str !== 'string') return [];
    const trimmed = str.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return trimmed.split('\n').filter(line => line.trim().length > 0);
    }
  };
  
  const itinerary = parseItinerary(activity.itinerary);
  
  // Parse FAQ content (JSON format)
  const parseFAQ = (str: string | null | undefined) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };
  
  const faqItems = parseFAQ(activity.faqContent);
  
  // Parse reviews (JSON format)
  const parseReviews = (str: string | null | undefined) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };
  
  const reviews = parseReviews(activity.reviews);
  
  // Prepare images array - use activity image if available, otherwise use placeholder
  const images = activity.image ? [activity.image] : [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
  ];

  // Prepare meta tag data with location keyword
  const locationName = activity.location?.name || 'India';
  const metaTitle = activity.metaTitle || `${activity.name} from ${locationName} | Pikme`;
  const metaDescription = activity.metaDescription || `${activity.name} from ${locationName}. ${activity.description?.substring(0, 100) || 'Premium travel experience'} | Book now with Pikme`;
  const metaKeywords = activity.metaKeywords || `${activity.name}, ${locationName}, pilgrimage tour`;
  const metaUrl = `https://pikmepseo-bsflart4.manus.space/activity/${activity.slug || activity.id}`;

  // Build FAQ schema for structured data
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item: any) => ({
      "@type": "Question",
      "name": item.question || item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer || item.a
      }
    }))
  } : null;

  return (
    <PublicLayout>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {activity.image && <meta property="og:image" content={activity.image} />}
        <meta property="og:url" content={metaUrl} />
        <link rel="canonical" href={metaUrl} />
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={generateActivityBreadcrumbs({ name: activity.name })} />
        {/* Back Button */}
        <Button 
          onClick={() => setLocation("/activities")} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Button>

        {/* Image Carousel Section */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <div className="relative bg-gray-200 h-64 flex items-center justify-center">
            <img 
              src={images[currentImageIndex]} 
              alt={`${activity.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex ? 'border-red-600' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{activity.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>{activity.location?.name || 'Location'}</span>
              </div>
            </div>
            <Button 
              onClick={handleShare} 
              variant="outline" 
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isCopied ? 'Copied!' : 'Share'}
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {activity.category && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {activity.category}
              </Badge>
            )}
            {activity.difficulty && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {activity.difficulty}
              </Badge>
            )}
            {activity.bestTime && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {activity.bestTime}
              </Badge>
            )}
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {activity.tourDuration && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tour Duration</p>
                      <p className="font-semibold">{activity.tourDuration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activity.price !== null && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Price per Person</p>
                      <p className="font-semibold">
                        INR{typeof activity.price === 'number' ? activity.price.toFixed(2) : activity.price}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activity.difficulty && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Difficulty</p>
                      <p className="font-semibold capitalize">{activity.difficulty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">About This Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Layout - Best Time to Visit (Left) and Booking Card (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Best Time to Visit and Tour Package Includes */}
          <div className="md:col-span-2 space-y-6">
            {activity.bestTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Time to Visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{activity.bestTime}</p>
                </CardContent>
              </Card>
            )}

            {/* Itinerary Section - H2 Heading */}
            {itinerary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {itinerary.map((day: any, index: number) => (
                      <div key={index} className="border-l-4 border-l-red-600 pl-4 py-2">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {typeof day === 'string' ? day : `Day ${index + 1}`}
                        </h3>
                        {typeof day === 'object' && day.description && (
                          <p className="text-gray-700">{day.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Guide Section - H2 Heading */}
            {activity.locationGuide && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Travel from {locationName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{activity.locationGuide}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Details Section - H2 Heading */}
            {activity.pricingDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Package Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{activity.pricingDetails}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tour Package Includes */}
            <Card className="border-l-4 border-l-red-600">
              <CardHeader>
                <CardTitle className="text-lg">Tour Package Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Includes:</h4>
                    <div className="space-y-1">
                      {inclusions.length > 0 ? (
                        inclusions.map((inclusion: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                            <span className="text-gray-700">{inclusion}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">No inclusions specified</div>
                      )}
                    </div>
                  </div>
                  
                  {exclusions.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Excludes:</h4>
                      <div className="space-y-1">
                        {exclusions.map((exclusion: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-red-600 font-bold flex-shrink-0">✕</span>
                            <span className="text-gray-700">{exclusion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section - H2 Heading with Schema */}
            {faqItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((item: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.question || item.q}
                        </h3>
                        <p className="text-gray-700 text-sm">
                          {item.answer || item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Traveler Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review: any, index: number) => (
                      <div key={index} className="border-l-4 border-l-yellow-400 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="font-semibold text-gray-900">{review.name || 'Anonymous'}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment || review.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Author Info Section - Trust Signal */}
            {activity.authorInfo && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    About Our Expert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{activity.authorInfo}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="space-y-6">
            <Card className="border-red-200 bg-red-50 h-fit sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">Book complete tour package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Contact Pikme.org to book this Tour package</p>
                  
                  <div className="space-y-3 border-t border-red-200 pt-4">
                    <a 
                      href="https://wa.me/917259696555?text=Hi%20Pikme%2C%20I%20would%20like%20to%20book%20a%20tour%20package." 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">WhatsApp us</p>
                        <p className="font-semibold text-gray-900">+91 7259 696 555</p>
                      </div>
                    </a>
                    
                    <a 
                      href="tel:+919845991455" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Call us</p>
                        <p className="font-semibold text-gray-900">+91 9845 991 455</p>
                      </div>
                    </a>
                    
                    <a 
                      href="mailto:tours@pikme.org" 
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Mail className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Email us</p>
                        <p className="font-semibold text-gray-900">tours@pikme.org</p>
                      </div>
                    </a>
                  </div>
                  
                  <a 
                    href="https://wa.me/917259696555?text=Hi%20Pikme%2C%20I%20would%20like%20to%20book%20a%20tour%20package." 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message on WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice Card - Small Box Below Booking Card */}
            <Card className="border-gray-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-700 leading-relaxed">
                  We DON'T provide individual services such as VIP tickets, darshan passes, chopper bookings, Wheel Chair, or doli arrangements. All the above mentioned services are available only as part of our COMPLETE TOUR PACKAGES ONLY — not as standalone offerings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button 
            onClick={() => setLocation("/activities")} 
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

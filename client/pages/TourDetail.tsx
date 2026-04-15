import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Plane, Users, Calendar, Check, X, ChevronDown } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { parseArrayField } from "@/lib/parseData";
import { useState, useEffect } from "react";
import { generateTourSchema, generateBreadcrumbSchema, useStructuredData } from "@/lib/structured-data";
import { BookingModal } from "@/components/BookingModal";
import { RelatedToursWidget } from "@/components/RelatedToursWidget";
import { PublicLayout } from "@/components/PublicLayout";
import { marked } from 'marked';
import { Breadcrumb, generateTourBreadcrumbs } from "@/components/Breadcrumb";
import { updateMetaTags, buildMetaTagData } from "@/lib/meta-tags";

// Helper function to format text items into list items
const formatTextItems = (text: string | unknown): string[] => {
  if (typeof text === 'string') {
    return text.split('\n').filter(line => line.trim()).map(line => line.trim());
  }
  return [];
};

export default function TourDetailSEO() {
  // Use useRoute to reliably extract slug from both /visit/tour/:slug and /tour/:slug patterns
  const [matchVisit, paramsVisit] = useRoute<{ slug: string }>('/visit/tour/:slug');
  const [matchDirect, paramsDirect] = useRoute<{ slug: string }>('/tour/:slug');
  const slug = matchVisit ? paramsVisit?.slug : (matchDirect ? paramsDirect?.slug : undefined);
  
  // Guard the query to only run when slug is available
  const { data, isLoading } = trpc.tours.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTransportTab, setActiveTransportTab] = useState<'airport' | 'railway'>('airport');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Handler for Learn More button - scroll to About This Tour section
  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about-this-tour');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler for Contact Us Now button - open WhatsApp
  const handleContactUs = () => {
    window.open('https://wa.me/917259696555', '_blank');
  };

  // Remove duplicate navigation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const navs = document.querySelectorAll('nav');
      if (navs.length > 1) {
        // Remove any nav that contains Back to Tours
        for (let i = navs.length - 1; i > 0; i--) {
          if (navs[i].textContent.includes('Back to Tours')) {
            navs[i].remove();
          }
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Update meta tags
  useEffect(() => {
    if (data?.tour) {
      // Build meta tag data using dedicated SEO fields
      const metaTagData = buildMetaTagData(
        data.tour.name,
        data.tour.metaTitle,
        data.tour.metaDescription,
        data.tour.metaKeywords,
        data.tour.description,
        data.tour.image,
        `https://www.pikmeusa.com/tour/${data.tour.slug}`
      );
      
      // Update all meta tags
      updateMetaTags(metaTagData);
      
      // Add structured data for tour
      const tourSchema = generateTourSchema({
        id: data.tour.id,
        name: data.tour.name,
        description: data.tour.description || '',
        slug: data.tour.slug || '',
        image: data.tour.image,
        duration: data.tour.duration,
        price: data.tour.price,
        rating: data.tour.rating,
        reviewCount: data.tour.reviewCount,
      });
      useStructuredData(tourSchema);
      
      // Add breadcrumb structured data
      const breadcrumbs = [
        { name: 'Home', url: 'https://www.pikmeusa.com' },
        { name: 'Tours', url: 'https://www.pikmeusa.com/tours' },
        { name: data.tour.name, url: `https://www.pikmeusa.com/tour/${data.tour.slug}` },
      ];
      const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
      useStructuredData(breadcrumbSchema);
    }
  }, [data?.tour]);

  if (!slug) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Invalid tour URL</p>
            <Link href="/tours" className="text-red-600 hover:underline">Back to Tours</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!data?.tour) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tour not found</h2>
          <Button asChild>
            <Link href="/tours">Back to Tours</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { tour, locations, flights, activities } = data;

  // Use FAQs from database or provide defaults
  const faqs = tour.faqs && Array.isArray(tour.faqs) && tour.faqs.length > 0
    ? (tour.faqs as any[]).map((faq, idx) => {
        const question = typeof faq === 'object' ? (faq.question || '') : (typeof faq === 'string' ? faq : '');
        const answer = typeof faq === 'object' ? (faq.answer || '') : '';
        return {
          id: idx + 1,
          question: question || `FAQ ${idx + 1}`,
          answer: answer || "No answer provided",
        };
      })
    : [
        {
          id: 1,
          question: "Is this tour suitable for senior citizens?",
          answer: "Yes, the itinerary is relaxed and senior-friendly with comfortable pacing and quality accommodations.",
        },
        {
          id: 2,
          question: "Are vegetarian meals included?",
          answer: "Yes, pure vegetarian meals can be arranged. Please mention your dietary preferences during booking.",
        },
        {
          id: 3,
          question: "What is the best time to visit?",
          answer: tour.bestTime || "The best time varies by destination. Please contact us for specific recommendations.",
        },
        {
          id: 4,
          question: "Are flights included in the package?",
          answer: "Flights can be arranged separately. Please contact us for flight booking options.",
        },
      ];

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-900 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{tour.headingH1 || tour.name}</h1>
          {(tour.headingH2 || tour.description) && (
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {tour.headingH2 || tour.description}
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <a href="https://wa.me/917259696555" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.718.738 5.33 2.14 7.59l-2.275 6.821 6.986-2.265a9.823 9.823 0 004.895 1.271h.004c5.442 0 9.854-4.418 9.854-9.853 0-2.63-.674-5.159-1.977-7.368-1.335-2.24-3.579-3.94-6.241-4.514-2.663-.574-5.505-.156-7.637 1.52m8.817-1.884c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                WhatsApp: +91 7259696555
              </Button>
            </a>
            <Button variant="outline" className="border-white text-white hover:bg-red-700 px-8 py-6 text-lg" onClick={handleLearnMore}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <section className="bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb items={generateTourBreadcrumbs({ name: tour.name, country: tour.country, category: tour.category })} />
        </div>
      </section>

      {/* Hero Image */}
      {tour.image && (
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Trust/Why Choose Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Pikme.org</h2>
            <p className="text-lg text-gray-600 mb-2">only VIP Customised Domestic, International & Spiritual Tours from India</p>
            <p className="text-lg text-gray-700 font-semibold">Hotels | Airlines | Domestic & International Tours</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-red-600">⭐</div>
                <h3 className="text-xl font-bold mb-2">Premium Hotels</h3>
                <p className="text-gray-600">3 Star to 5 Star comfortable, clean & centrally located stays</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-red-600">🍽️</div>
                <h3 className="text-xl font-bold mb-2">MAPI Meal Plan</h3>
                <p className="text-gray-600">Breakfast, Lunch & Dinner included</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-red-600">🚗</div>
                <h3 className="text-xl font-bold mb-2">Private AC Vehicle</h3>
                <p className="text-gray-600">Relaxed & senior-friendly travel</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4 text-red-600">🗺️</div>
                <h3 className="text-xl font-bold mb-2">Expert Planning</h3>
                <p className="text-gray-600">Well-paced, no rushing itinerary</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Travel Type & Best Time Section - Blue Box */}
      <section className="bg-gradient-to-r from-red-50 to-red-100 py-8 border-b-4 border-red-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-red-600 text-white p-8 rounded-lg shadow-lg">
            {tour.duration && (
              <div>
                <p className="text-sm font-semibold text-red-100 mb-2">Duration</p>
                <p className="text-2xl font-bold">{tour.duration} Days</p>
              </div>
            )}
            {tour.price && (
              <div>
                <p className="text-sm font-semibold text-red-100 mb-2">Starting Price</p>
                <p className="text-2xl font-bold">₹{tour.price}</p>
              </div>
            )}
            {tour.travelType && (
              <div>
                <p className="text-sm font-semibold text-red-100 mb-2">Tour Type</p>
                <p className="text-2xl font-bold">{tour.travelType}</p>
              </div>
            )}
            {tour.bestTime && (
              <div>
                <p className="text-sm font-semibold text-red-100 mb-2">Best Time to Visit</p>
                <p className="text-2xl font-bold">{tour.bestTime}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              {tour.longDescription ? (
                <div className="mb-12" id="about-this-tour">
                  <h2 className="text-3xl font-bold mb-4">About This Tour</h2>
                  <div 
                    className="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: marked(tour.longDescription as string, {
                        breaks: true,
                        gfm: true
                      })
                    }}
                  />
                </div>
              ) : null}

              {/* Highlights */}
              {tour.highlights && Array.isArray(tour.highlights) && (tour.highlights as unknown[]).length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Tour Highlights</h2>
                  <ul className="space-y-3">
                    {(tour.highlights as string[]).map((highlight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Itinerary */}
              {tour.itinerary && Array.isArray(tour.itinerary) && (tour.itinerary as unknown[]).length > 0 ? (
                <div className="mb-12">
                  <h3 className="text-3xl font-bold mb-2 text-red-900">{tour.headingH3 || "What's Included in Your Journey"}</h3>
                  <h2 className="text-3xl font-bold mb-6">Tour Itinerary</h2>
                  <div className="space-y-4">
                    {(tour.itinerary as any[]).map((day: any, idx: number) => {
                      const dayNum = typeof day === 'object' && day.day ? day.day : idx + 1;
                      const title = typeof day === 'object' ? (day.title || day.name) : `Day ${idx + 1}`;
                      const description = typeof day === 'object' ? (day.description || '') : (typeof day === 'string' ? day : '');
                      return (
                        <Card key={idx}>
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2">Day {dayNum}: {title}</h3>
                            {description && <p className="text-gray-700">{description}</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Inclusions */}
              {tour.inclusions && Array.isArray(tour.inclusions) && (tour.inclusions as any[]).length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">What's Included</h2>
                  <ul className="space-y-3">
                    {(tour.inclusions as string[]).map((inclusion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Exclusions */}
              {tour.exclusions && Array.isArray(tour.exclusions) && (tour.exclusions as unknown[]).length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">What's Excluded</h2>
                  <ul className="space-y-3">
                    {(tour.exclusions as string[]).map((exclusion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}



              {/* Timing & Availability */}
              {(tour.morningTime || tour.afternoonTime) && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Timing & Availability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tour.morningTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 mb-2">Open Time</p>
                          <p className="text-2xl font-bold text-red-600">{tour.morningTime}</p>
                        </CardContent>
                      </Card>
                    )}
                    {tour.afternoonTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 mb-2">Close Time</p>
                          <p className="text-2xl font-bold text-red-600">{tour.afternoonTime}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Amenities & Services */}
              {tour.amenities && Array.isArray(tour.amenities) && (tour.amenities as unknown[]).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Amenities & Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tour.amenities as any[]).map((amenity: any, idx: number) => {
                      const amenityText = typeof amenity === 'string' ? amenity : (amenity?.name || amenity?.description || String(amenity));
                      return (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <p className="text-gray-800 font-medium">{amenityText}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transport */}
              {tour.transport && Array.isArray(tour.transport) && (tour.transport as unknown[]).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Transport</h2>
                  <div className="space-y-3">
                    {(tour.transport as any[]).map((item: any, idx: number) => {
                      const transportText = typeof item === 'string' ? item : (item?.description || item?.type || String(item));
                      return (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-800">{transportText}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing Tiers */}
              {(() => {
                let pricingTiers: any[] = [];
                
                // First check for individual pricing columns (pricing_2_guests, pricing_4_guests, pricing_6_guests)
                if (tour.pricing_2_guests || tour.pricing_4_guests || tour.pricing_6_guests) {
                  const tiers = [
                    { groupSize: '2 Guest Traveling Together', price: tour.pricing_2_guests },
                    { groupSize: '4 Guest Traveling Together', price: tour.pricing_4_guests },
                    { groupSize: '6 Guest Traveling Together', price: tour.pricing_6_guests }
                  ];
                  
                  pricingTiers = tiers.filter(tier => tier.price).map(tier => ({
                    groupSize: tier.groupSize,
                    price: String(tier.price).replace(/,/g, '').trim(),
                    description: 'Per person'
                  }));
                } else if (tour.pricingTiers) {
                  // Fallback to pricingTiers field
                  let parsedData: any = tour.pricingTiers;
                  
                  // First, try to parse as JSON string if it's a string
                  if (typeof tour.pricingTiers === 'string' && tour.pricingTiers.trim()) {
                    try {
                      parsedData = JSON.parse(tour.pricingTiers);
                    } catch (e) {
                      // Not JSON, keep as is
                      parsedData = tour.pricingTiers;
                    }
                  }
                  
                  // Handle both array and string formats
                  if (Array.isArray(parsedData)) {
                    pricingTiers = (parsedData as any[]).map((tier: any) => {
                      // Handle JSON objects with groupSize and price properties
                      if (typeof tier === 'object' && tier !== null && tier.groupSize && (tier.price || tier.amount)) {
                        return {
                          groupSize: tier.groupSize,
                          price: String(tier.price || tier.amount).replace(/,/g, ''),
                          description: 'Per person'
                        };
                      }
                      // Handle string format
                      if (typeof tier === 'string') {
                        const trimmed = tier.trim();
                        const match = trimmed.match(/^(.+?):\s*[₹$]?([\d,]+(?:\.\d{2})?)/);
                        if (match) {
                          return {
                            groupSize: match[1].trim(),
                            price: match[2].replace(/,/g, ''),
                            description: 'Per person'
                          };
                        }
                      }
                      return null;
                    }).filter(Boolean);
                  } else if (typeof parsedData === 'string' && parsedData.trim()) {
                    // Parse pipe-separated pricing string: "2 Guests: ₹15000 | 4 Guests: ₹25000 | 6 Guests: ₹35000"
                    pricingTiers = parsedData.split('|').map((tier: string) => {
                      const trimmed = tier.trim();
                      const match = trimmed.match(/^(.+?):\s*[₹$]?([\d,]+(?:\.\d{2})?)/);
                      if (match) {
                        return {
                          groupSize: match[1].trim(),
                          price: match[2].replace(/,/g, ''),
                          description: 'Per person'
                        };
                      }
                      return null;
                    }).filter(Boolean);
                  }
                }
                
                return pricingTiers && pricingTiers.length > 0 ? (
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Package Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pricingTiers.map((tier: any, idx: number) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2">{tier.groupSize || `Tier ${idx + 1}`}</h3>
                            <p className="text-3xl font-bold text-red-600 mb-4">₹{tier.price || tier.amount}</p>
                            <p className="text-sm text-gray-600">{tier.description || 'Per person'}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Policies */}
              {(tour.cancellationPolicy || tour.paymentPolicy || tour.importantNotes) && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Policies & Important Information</h2>
                  <div className="space-y-4">
                    {tour.cancellationPolicy && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-bold text-lg mb-2">Cancellation Policy</h3>
                          <p className="text-gray-700">{tour.cancellationPolicy}</p>
                        </CardContent>
                      </Card>
                    )}
                    {tour.paymentPolicy && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-bold text-lg mb-2">Payment Policy</h3>
                          <p className="text-gray-700">{tour.paymentPolicy}</p>
                        </CardContent>
                      </Card>
                    )}
                    {tour.importantNotes && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-bold text-lg mb-2">Important Notes</h3>
                          <p className="text-gray-700">{tour.importantNotes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}


              {/* Timing & Availability Section */}
              {(tour.openTime || tour.closeTime) && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Timing & Availability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tour.openTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 mb-2 font-semibold">Open Time</p>
                          <p className="text-2xl font-bold text-red-600">{tour.openTime}</p>
                        </CardContent>
                      </Card>
                    )}
                    {tour.closeTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-gray-600 mb-2 font-semibold">Close Time</p>
                          <p className="text-2xl font-bold text-red-600">{tour.closeTime}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Hotels Section */}
              {(tour as any).hotelsPuri && Array.isArray((tour as any).hotelsPuri) && (tour as any).hotelsPuri.length > 0 ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Accommodation Options</h2>
                  <div className="space-y-8">
                    {/* Hotels Section 1 */}
                    {(tour as any).hotelsPuri && Array.isArray((tour as any).hotelsPuri) && (tour as any).hotelsPuri.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold mb-4 text-red-900">Hotels</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {((tour as any).hotelsPuri as any[]).map((hotel: any, idx: number) => {
                            const starCount = parseInt(hotel.rating?.split(' ')[0] || '0');
                            const isIncluded = hotel.status?.toLowerCase().includes('included');
                            return (
                            <Card key={idx} className="hover:shadow-lg transition-shadow">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-900">{hotel.name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-lg text-yellow-400">{'⭐'.repeat(starCount)}</span>
                                      <span className="text-xs text-gray-600 font-medium">{hotel.rating}</span>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                    isIncluded
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isIncluded ? 'Included' : 'Upgrade'}
                                  </span>
                                </div>
                                {hotel.website && (
                                  <a 
                                    href={hotel.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:underline text-sm break-all"
                                  >
                                    Visit Website
                                  </a>
                                )}
                              </CardContent>
                            </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              ) : null}

              {/* Transportation Section */}
              <div className="mb-12">
                <h2 className="text-4xl font-bold mb-12">Transportation to Nearest Hubs</h2>
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setActiveTransportTab('airport')}
                    className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                      activeTransportTab === 'airport'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Nearest Airport
                  </button>
                  <button
                    onClick={() => setActiveTransportTab('railway')}
                    className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                      activeTransportTab === 'railway'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Nearest Railway Station
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTransportTab === 'airport' && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Plane className="w-8 h-8 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">Airport Transportation</h3>
                            <p className="text-sm text-gray-600 mb-1">Transportation options</p>
                            <p className="text-gray-700">
                              {(tour as any).airportTransport || "Private vehicle pickup available from the nearest airport. Please provide flight details for arrangement."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTransportTab === 'railway' && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <MapPin className="w-8 h-8 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">Railway Station Transportation</h3>
                            <p className="text-sm text-gray-600 mb-1">Transportation options</p>
                            <p className="text-gray-700">
                              {(tour as any).railwayTransport || "Comfortable AC vehicle pickup available from the railway station. Please share your train details for seamless coordination."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>



              {/* FAQs */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full text-left"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-semibold text-lg text-gray-900">{faq.question}</h3>
                            <ChevronDown
                              className={`w-5 h-5 text-red-600 flex-shrink-0 transition-transform ${
                                expandedFaq === faq.id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                          {expandedFaq === faq.id && (
                            <p className="text-gray-700 mt-4">{faq.answer}</p>
                          )}
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
                  <p className="text-gray-600 mb-6">Contact us for the best deals and customized itineraries</p>
                   <a href="https://wa.me/917259696555" target="_blank" rel="noopener noreferrer" className="block w-full mb-3">
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.sp-.347"/></svg>
                      WhatsApp: +91 7259696555
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="w-full text-lg py-6"
                    onClick={() => setIsBookingModalOpen(true)}
                  >
                    Enquire Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-red-600 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Book Your Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to reserve your spot and start your unforgettable journey
          </p>
          <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg" onClick={handleContactUs}>
            Contact Us Now
          </Button>
        </div>
      </section>

      {/* Explore More - SEO Internal Linking Section */}
      {data?.tour && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2">Explore More</h2>
            <p className="text-gray-600 mb-8">Discover related destinations, activities, and tour categories</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Destination Link */}
              {data.tour.country && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Tours in {data.tour.country}</h3>
                  <p className="text-gray-600 text-sm">Explore all tours available in {data.tour.country}</p>
                  <a 
                    href={`/destinations/${data.tour.country.toLowerCase()}`}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Discover {data.tour.country} Tours →
                  </a>
                </div>
              )}
              
              {/* Activity Links */}
              {data.tour.category && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{data.tour.category} Tours</h3>
                  <p className="text-gray-600 text-sm">Explore more {data.tour.category.toLowerCase()} experiences</p>
                  <a 
                    href={`/categories/${data.tour.category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Browse {data.tour.category} Tours →
                  </a>
                </div>
              )}
              
              {/* All Tours Link */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">All Tours</h3>
                <p className="text-gray-600 text-sm">Browse our complete collection of travel experiences</p>
                <a 
                  href="/tours"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  View All Tours →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Tours Widget */}
      {data?.tour?.id && <RelatedToursWidget tourId={data.tour.id} limit={4} />}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tourId={data?.tour?.id || 0}
        tourName={data?.tour?.name || ""}
      />
    </div>
    </PublicLayout>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Plane, Users, Calendar, Check, X, ChevronDown } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { parseArrayField } from "@/lib/parseData";
import { useState, useEffect } from "react";

export default function TourDetailSEO() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.tours.getBySlug.useQuery({ slug: slug || "" });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTransportTab, setActiveTransportTab] = useState<'airport' | 'railway'>('airport');

  // Update meta tags
  useEffect(() => {
    if (data?.tour) {
      document.title = `${data.tour.name} - Tour | Pikme`;
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', data.tour.description || `Explore ${data.tour.name} with Pikme. Premium travel experiences with expert guides and comfortable accommodations.`);
      
      // Update or create meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', `${data.tour.name}, tour, travel, ${data.tour.bestTime || 'travel'}`);
    }
  }, [data?.tour]);

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

  const { tour, flights, activities } = data;

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
    <div className="min-h-screen bg-gray-50">
      {/* Meta Information - Removed as it was causing duplicate content */}

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
            <Button variant="outline" className="border-white text-white hover:bg-red-700 px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
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

      {/* Travel Type & Best Time Section - Red Box */}
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


      {/* Main Content */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              {tour.longDescription ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4">About This Tour</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{tour.longDescription as string}</p>
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
                      // Handle both string and object formats
                      const dayNum = typeof day === 'object' && day.day ? day.day : idx + 1;
                      const title = typeof day === 'object' ? (day.title || day.name) : `Day ${idx + 1}`;
                      const description = typeof day === 'object' ? day.description : (typeof day === 'string' ? day : '');
                      
                      return (
                        <Card key={idx} className="border-l-4 border-l-red-600">
                          <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-red-600 mb-2">
                              Day {dayNum}: {title}
                            </h3>
                            {description && <p className="text-gray-700">{description}</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Inclusions & Exclusions */}
              {((tour.inclusions && Array.isArray(tour.inclusions) && (tour.inclusions as unknown[]).length > 0) || (tour.exclusions && Array.isArray(tour.exclusions) && (tour.exclusions as unknown[]).length > 0)) ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {tour.inclusions && Array.isArray(tour.inclusions) && (tour.inclusions as unknown[]).length > 0 ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Inclusions</h3>
                      <ul className="space-y-2">
                        {(tour.inclusions as string[]).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {tour.exclusions && Array.isArray(tour.exclusions) && (tour.exclusions as unknown[]).length > 0 ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Exclusions</h3>
                      <ul className="space-y-2">
                        {(tour.exclusions as string[]).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                </>
              ) : null}

              {/* Destinations - Removed, now using single locationId */}

              {/* Activities */}
              {activities && (activities as any[]).length > 0 ? (
                <>
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Activities & Experiences</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activities.map((activity: any) => (
                      <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-lg mb-2">{activity.name as string || 'Activity'}</h4>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-2">{activity.description as string}</p>
                          )}
                          {activity.price && (
                            <p className="text-sm font-semibold text-red-600">₹{activity.price}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                </>
              ) : null}

              {/* Timing & Availability */}
              {(tour.morningTime || tour.afternoonTime) ? (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Timing & Availability</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tour.morningTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-2 text-red-600">Morning Slot</h3>
                          <p className="text-gray-700">{tour.morningTime}</p>
                        </CardContent>
                      </Card>
                    )}
                    {tour.afternoonTime && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-2 text-red-600">Afternoon Slot</h3>
                          <p className="text-gray-700">{tour.afternoonTime}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Amenities & Services */}
              {tour.amenities && Array.isArray(tour.amenities) && (tour.amenities as unknown[]).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Amenities & Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tour.amenities as string[]).map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-gray-800 font-medium">{amenity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport */}
              {tour.transport && Array.isArray(tour.transport) && (tour.transport as unknown[]).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Transport</h2>
                  <div className="space-y-3">
                    {(tour.transport as string[]).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-lg">
                <CardContent className="pt-6">
                  {/* Pricing */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Starting from</p>
                    <p className="text-4xl font-bold text-red-600 mb-4">₹{tour.price}</p>
                    <p className="text-xs text-gray-500 mb-4">*Per person, subject to availability</p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mb-6">
                    <a href="https://wa.me/917259696555" target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.718.738 5.33 2.14 7.59l-2.275 6.821 6.986-2.265a9.823 9.823 0 004.895 1.271h.004c5.442 0 9.854-4.418 9.854-9.853 0-2.63-.674-5.159-1.977-7.368-1.335-2.24-3.579-3.94-6.241-4.514-2.663-.574-5.505-.156-7.637 1.52m8.817-1.884c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.sp-.347"/></svg>
                        WhatsApp: +91 7259696555
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full py-6">
                      Enquire Now
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4 text-sm border-t pt-4">
                    {tour.categoryId && (
                      <div>
                        <p className="font-semibold text-gray-900">Tour Type</p>
                        <p className="text-gray-600 capitalize">Category ID: {tour.categoryId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Package Pricing</h2>
          {tour.pricingTiers && Array.isArray(tour.pricingTiers) && (tour.pricingTiers as unknown[]).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(tour.pricingTiers as any[]).map((tier: any, idx: number) => (
                <Card
                  key={idx}
                  className={`text-center hover:shadow-lg transition-shadow ${
                    idx === 1 ? "border-2 border-red-600" : ""
                  }`}
                >
                  <CardContent className="pt-6">
                    {idx === 1 && (
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-red-600 mb-4">{tier.groupSize}</h3>
                    <p className="text-4xl font-bold mb-2">₹{tier.price}</p>
                    <p className="text-gray-600 mb-4">Per person</p>
                    <Button className={idx === 1 ? "w-full bg-red-600 hover:bg-red-700" : "w-full"}>
                      Select
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-red-600 mb-4">2–3 Persons</h3>
                  <p className="text-4xl font-bold mb-2">₹{Math.round((Number(tour.price) || 0) * 1.2)}</p>
                  <p className="text-gray-600 mb-4">Per person</p>
                  <Button className="w-full">Select</Button>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-red-600 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                    POPULAR
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-4">4–6 Persons</h3>
                  <p className="text-4xl font-bold mb-2">₹{tour.price}</p>
                  <p className="text-gray-600 mb-4">Per person</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Select</Button>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-red-600 mb-4">7–10 Persons</h3>
                  <p className="text-4xl font-bold mb-2">₹{Math.round((Number(tour.price) || 0) * 0.8)}</p>
                  <p className="text-gray-600 mb-4">Per person</p>
                  <Button className="w-full">Select</Button>
                </CardContent>
              </Card>
            </div>
          )}
          <p className="text-center text-gray-600 mt-6">*Prices may vary by season & availability</p>
        </div>
      </section>

      {/* Policies Section */}
      {(tour.cancellationPolicy || tour.paymentPolicy || tour.importantNotes) && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Policies & Important Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tour.cancellationPolicy && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-4 text-red-600">Cancellation Policy</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{tour.cancellationPolicy}</p>
                  </CardContent>
                </Card>
              )}
              {tour.paymentPolicy && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-4 text-green-600">Payment Policy</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{tour.paymentPolicy}</p>
                  </CardContent>
                </Card>
              )}
              {tour.importantNotes && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-4 text-red-600">Important Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{tour.importantNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Best Time to Visit Section */}
      {tour.bestTime && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-8">Best Time to Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Calendar className="w-12 h-12 text-red-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Ideal Season</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">{tour.bestTime}</p>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <Users className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Why This Season?</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Perfect weather conditions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Ideal for outdoor activities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Best photography opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Comfortable for all age groups</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hotels Section */}
      {(tour as any).hotelsPuri && Array.isArray((tour as any).hotelsPuri) && (tour as any).hotelsPuri.length > 0 ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12">Accommodation Options</h2>
            <div className="space-y-12">
              {/* Hotels Section 1 */}
              {(tour as any).hotelsPuri && Array.isArray((tour as any).hotelsPuri) && (tour as any).hotelsPuri.length > 0 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6 text-red-900">Hotels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {((tour as any).hotelsPuri as any[]).map((hotel: any, idx: number) => (
                      <Card key={idx} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{hotel.name}</h4>
                              <p className="text-sm text-yellow-600 font-semibold">{'⭐'.repeat(hotel.star)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              hotel.type === 'included' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {hotel.type === 'included' ? 'Included' : 'Upgrade'}
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
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
        </section>
      ) : null}

      {/* Transportation Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">Transportation to Nearest Hubs</h2>
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b">
              <button
                onClick={() => setActiveTransportTab('airport')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTransportTab === 'airport'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plane className="w-5 h-5 inline mr-2" />
                Nearest Airport
              </button>
              <button
                onClick={() => setActiveTransportTab('railway')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTransportTab === 'railway'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-5 h-5 inline mr-2" />
                Nearest Railway Station
              </button>
            </div>

            {/* Tab Content */}
            {activeTransportTab === 'airport' && (
              <Card className="border-2 border-red-600">
                <CardContent className="pt-8">
                  <h3 className="text-2xl font-bold mb-4">Airport Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Distance from tour location</p>
                      <p className="text-xl font-semibold text-gray-900">Approximately 150-200 km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Travel time by road</p>
                      <p className="text-xl font-semibold text-gray-900">3-4 hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transportation options</p>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Private AC vehicle pickup available</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Shared cab services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Train to nearby station</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTransportTab === 'railway' && (
              <Card className="border-2 border-red-600">
                <CardContent className="pt-8">
                  <h3 className="text-2xl font-bold mb-4">Railway Station Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Distance from tour location</p>
                      <p className="text-xl font-semibold text-gray-900">Approximately 50-80 km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Travel time by road</p>
                      <p className="text-xl font-semibold text-gray-900">1.5-2 hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transportation options</p>
                      <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Private AC vehicle pickup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Auto-rickshaw services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Local taxi services</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Plan Your Journey with Confidence</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Talk to our travel experts & get a customized quote tailored to your needs
          </p>
          <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg">
            Enquire Now
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent
                  className="pt-6"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-red-600 transition-transform ${
                        expandedFaq === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {expandedFaq === faq.id && (
                    <p className="text-gray-600 mt-4 pt-4 border-t">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-50 py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
          <p className="text-gray-600 mb-6">Join thousands of satisfied travelers who've experienced our tours</p>
          <Button className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg">
            Book Your Tour Today
          </Button>
        </div>
      </section>
    </div>
  );
}

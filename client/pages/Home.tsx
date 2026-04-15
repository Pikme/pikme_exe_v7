import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Plane, Users, Zap, Search, Star } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BreadcrumbStructuredData, OrganizationStructuredData } from "@/components/StructuredData";
import { generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/structured-data";
import { Hreflang, LocaleSwitcher, HreflangBreadcrumb } from "@/components/Hreflang";
import { generateEnglishHreflangLinks, getCurrentLocale, setPreferredLocale, getAllLocales } from "@/lib/hreflang";
import { Canonical } from "@/components/Canonical";
import { getHomeCanonical } from "@/lib/canonical";
import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CountriesCarousel from "@/components/CountriesCarousel";
import DestinationGalleryMasonry from "@/components/DestinationGalleryMasonry";
import { FeaturesSection } from "@/components/FeaturesSection";
import { KailashMansarovar } from "@/components/KailashMansarovar";
import { BrazilSection } from "@/components/BrazilSection";
import { FAQSection } from "@/components/FAQSection";
import { ContactUs } from "@/components/ContactUs";
import { ReviewWidgets } from "@/components/ReviewWidgets";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { FeaturedDestinationsCarousel } from "@/components/FeaturedDestinationsCarousel";

// Hero Slider Component
function HeroSlider() {
  const { t } = useLanguage();
  const { trackTagClick } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: settings } = trpc.homePageSettings.getSettings.useQuery();

  // Default slides as fallback
  const defaultSlides = [
    {
      image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
      alt: "Ujjain Mahakal Temple - Night View",
      title: "Ujjain Mahakal"
    },
    {
      image: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
      alt: "Vaishno Devi Mountain Shrine",
      title: "Vaishno Devi"
    },
    {
      image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
      alt: "Kerala Backwaters Honeymoon",
      title: "Kerala Honeymoon"
    }
  ];

  // Use database images if available, otherwise use defaults
  const slides = settings?.sliderImages && settings.sliderImages.length > 0 ? settings.sliderImages : defaultSlides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-rotate every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">{t('home.title')}</h1>
            <p className="text-2xl mb-12 text-white drop-shadow-md">
              {t('home.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 bg-white rounded-lg p-2 shadow-lg">
                <Search className="w-6 h-6 text-gray-400 ml-2 my-auto" />
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-gray-800 outline-none"
                />
                <Button 
                  className="bg-red-700 hover:bg-red-800 text-white"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      // Navigate to search results page with query
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                >
                  {t('home.searchButton')}
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" variant="secondary" onClick={() => trackTagClick(0)}>
                <Link href="/tours">{t('home.browseTours')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => trackTagClick(1)}>
                <Link href="/countries">{t('home.exploreDestinations')}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-red-700 w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: tours, isLoading: toursLoading } = trpc.tours.list.useQuery({
    limit: 6,
  });
  const { data: stats } = trpc.system.getStats.useQuery();
  const { data: settings } = trpc.homePageSettings.getSettings.useQuery();
  const { t, language } = useLanguage();
  const { trackTagClick } = useAnalytics();
  const [currentLocale, setCurrentLocale] = useState("en-IN");
  const [allLocales, setAllLocales] = useState<Array<{ locale: string; label: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const locale = getCurrentLocale();
    setCurrentLocale(locale);
    setAllLocales(getAllLocales());
  }, []);

  const baseUrl = "https://www.pikmeusa.com";
  const hreflangLinks = generateEnglishHreflangLinks(baseUrl);
  const canonicalUrl = getHomeCanonical(baseUrl);

  const breadcrumbItems = [
    { name: "Home", url: "https://www.pikmeusa.com" },
  ];

  // Sample testimonials
  

  return (
    <PublicLayout>
      <Hreflang links={hreflangLinks} />
      <Canonical href={canonicalUrl} />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <OrganizationStructuredData
        name="Pikme Travel"
        url="https://www.pikmeusa.com"
        logo="https://www.pikmeusa.com/logo.png"
        description="Discover handpicked travel experiences across the world - VIP Customised Domestic, International & Spiritual Tours from World Wide"
        sameAs={[
          "https://www.facebook.com/pikme",
          "https://www.twitter.com/pikme",
          "https://www.instagram.com/pikme",
        ]}
        telephone="+1-800-PIKME"
        email="cr@pikme.org"
      />

      {/* Hero Section with Image Slider */}
      <HeroSlider />

      {/* Statistics Section */}
      <section className="bg-black py-12 border-t-4 border-red-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.totalTours || 180}+</div>
              <p className="text-white font-semibold">{t('home.stats.tours')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.totalDestinations || 34}</div>
              <p className="text-white font-semibold">{t('home.stats.destinations')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.totalActivities || 180}+</div>
              <p className="text-white font-semibold">{t('home.stats.activities')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">10K+</div>
              <p className="text-white font-semibold">{t('home.stats.travelers')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{settings?.whyChooseTitle || t('home.whyChoose')}</h2>
            <p className="text-xl text-gray-600 mb-2">{settings?.whyChooseSubtitle || t('home.whySubtitle')}</p>
            <p className="text-lg text-gray-700 font-semibold">{settings?.whyChooseDescription || t('home.whyDescription')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-white border-l-4 border-red-700 shadow-md hover:shadow-lg transition-shadow">
              <MapPin className="w-12 h-12 text-red-700 mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg text-black">{t('home.globalDestinations')}</h4>
              <p className="text-gray-700">{t('home.globalDestinationsDesc')}</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white border-l-4 border-red-700 shadow-md hover:shadow-lg transition-shadow">
              <Plane className="w-12 h-12 text-red-700 mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg text-black">{t('home.expertGuides')}</h4>
              <p className="text-gray-700">{t('home.expertGuidesDesc')}</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white border-l-4 border-red-700 shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-red-700 mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg text-black">{t('home.hotelStays')}</h4>
              <p className="text-gray-700">{t('home.hotelStaysDesc')}</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white border-l-4 border-red-700 shadow-md hover:shadow-lg transition-shadow">
              <Zap className="w-12 h-12 text-red-700 mx-auto mb-4" />
              <h4 className="font-semibold mb-2 text-lg text-black">{t('home.bestPrices')}</h4>
              <p className="text-gray-700">{t('home.bestPricesDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blue Features Section - After Why Pikme.org */}
      <FeaturesSection />

      {/* Kailash Mansarovar Section - Text + Images */}
      <KailashMansarovar />

      {/* Brazil Section - Text + Images */}
      <BrazilSection />

      {/* Featured Tours Section */}
      <section className="py-16 bg-gray-50 border-t-4 border-red-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold mb-12 text-red-700">{t('home.featuredTours')}</h3>
          </div>
          {toursLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-700" />
            </div>
          ) : tours && tours.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-6xl mx-auto">
              {tours.map((tour) => (
                <Card key={tour.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                      {tour.image && (
                        <div className="w-full h-24 bg-gray-200 overflow-hidden rounded-t-lg relative">
                          <img
                            src={tour.image}
                            alt={tour.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover will-change-transform hover:scale-105 transition-transform duration-300 ease-out"
                          />
                        </div>
                      )}
                      <CardHeader className="py-2 px-2">
                        <CardTitle className="line-clamp-2 text-sm">{tour.name}</CardTitle>
                        <CardDescription className="line-clamp-1 text-xs">
                          {tour.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-1 py-1 px-2">
                        <div>
                          {tour.duration && (
                            <p className="text-xs text-gray-600">
                              {tour.duration}d
                            </p>
                          )}
                          {tour.price && (
                            <p className="text-sm font-bold text-red-700">
                              ₹{tour.price}
                            </p>
                          )}
                        </div>
                        <a href={`/visit/tour/${tour.slug}`} className="w-full">
                          <Button size="sm" className="w-full text-xs py-1 h-auto bg-black hover:bg-gray-800 text-white">{t('home.viewDetails')}</Button>
                        </a>
                      </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No tours available yet</p>
          )}
        </div>
      </section>

      {/* Featured Destinations Carousel Section */}
      <FeaturedDestinationsCarousel />

      {/* Destination Gallery Masonry Section */}
      <DestinationGalleryMasonry />

      {/* Countries Carousel Section */}
      <CountriesCarousel />

      {/* FAQ Section - AEO Optimized */}
      <FAQSection />

       {/* Review Widgets Section */}
      <ReviewWidgets />

      {/* Contact Us Form Section */}
      <ContactUs />
      
      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton 
        phoneNumber="918088379983"
        message="Hi! I am interested in your VIP travel services. Can you help me?"
      />
    </PublicLayout>
  );
}

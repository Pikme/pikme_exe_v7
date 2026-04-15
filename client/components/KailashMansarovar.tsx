import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plane, Hotel, Compass, MapPin, Globe, Sparkles, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const services = [
  {
    icon: Plane,
    title: "Air Travel, Elevated",
    description: "Experience flying the way it's meant to be—effortless, refined, and exclusive. We specialize in Commercial Flights | Private Charters | Chopper Transfers, offering only First Class and Business Class travel."
  },
  {
    icon: Hotel,
    title: "Handpicked Stays",
    description: "From luxury hotels to premium boutique escapes, curated for comfort and style."
  },
  {
    icon: Compass,
    title: "Bespoke Travel Experiences",
    description: "Custom-made tours and packages designed around your preferences."
  },
  {
    icon: MapPin,
    title: "Attractions & Experiences",
    description: "Easy access to top attractions and activities—even at the last minute."
  },
  {
    icon: Globe,
    title: "Domestic & International Holidays",
    description: "From quick getaways to global escapes, planned your way."
  },
  {
    icon: Sparkles,
    title: "Spiritual Journeys, Redefined",
    description: "Travel with purpose and peace of mind through our thoughtfully curated spiritual tours. Enjoy VIP access and escorted darshan services, specially arranged for senior citizens and those who prefer a smooth, guided experience."
  },
  {
    icon: Headphones,
    title: "Elite Travel Assistance",
    description: "Dedicated support at every step—before, during, and after your journey."
  },
  {
    icon: Sparkles,
    title: "Seamless Lifestyle Management",
    description: "From travel to special requests, we take care of the details so you don't have to."
  }
];

const defaultCarouselImages = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=500&fit=crop",
    alt: "Mountain landscape"
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=500&fit=crop",
    alt: "Mountain peaks"
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=500&fit=crop",
    alt: "Scenic view"
  }
];

export function KailashMansarovar() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: bodyImages = [] } = trpc.homePageSettings.getAllBodyImages.useQuery(undefined, {
    refetchInterval: 5000, // Refetch every 5 seconds to get latest images from backend
    staleTime: 2000, // Data is considered stale after 2 seconds
  });

  // Use database images if available, otherwise fall back to defaults
  const carouselImages = bodyImages.length > 0 
    ? bodyImages.map(img => ({
        src: img.imageUrl,
        alt: img.title || 'Travel experience'
      }))
    : defaultCarouselImages;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Services List */}
          <div className="space-y-8">
            <div>
              <h3 className="text-red-600 text-lg font-semibold mb-2">
                Our Core Services
              </h3>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                About Pikmeusa.com Services
              </h2>
              <p className="text-gray-600 text-lg font-semibold mb-8">What We Do:</p>
            </div>

            {/* Services Grid */}
            <div className="space-y-6">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white border-2 border-red-500">
                        <IconComponent className="h-6 w-6 text-red-500" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {service.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Single Image Carousel */}
          <div className="flex items-center justify-center">
            <div className="relative w-full">
              {/* Carousel Image */}
              <div className="relative w-full h-full min-h-96 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={carouselImages[currentImageIndex].src}
                  alt={carouselImages[currentImageIndex].alt}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dot Indicators */}
              {carouselImages.length > 0 && (
              <div className="flex justify-center gap-2 mt-6">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Red accent line */}
        <div className="mt-16 h-2 bg-red-600 w-32"></div>
      </div>
    </section>
  );
}

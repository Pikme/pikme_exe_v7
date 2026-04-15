import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface Country {
  id: number;
  countryName: string;
  description: string | null;
  imageUrl: string;
  destinationLink: string;
  displayOrder: number;
  isActive: boolean;
}

const CountriesCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [, setLocation] = useLocation();

  // Fetch countries from database
  const { data: countriesData = [], isLoading } = trpc.countriesCarousel.getAll.useQuery();

  // Filter active countries and sort by display order
  const countries: Country[] = countriesData
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const itemsPerSlide = 4;
  const totalSlides = Math.max(1, Math.ceil(countries.length / itemsPerSlide));

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, totalSlides]);

  const nextSlide = () => {
    setAutoPlay(false);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setAutoPlay(false);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setAutoPlay(false);
    setCurrentSlide(index);
  };

  const handleCountryClick = (destinationLink: string) => {
    // Check if it's an external link or internal route
    if (destinationLink.startsWith('http://') || destinationLink.startsWith('https://')) {
      window.open(destinationLink, '_blank');
    } else {
      setLocation(destinationLink);
    }
  };

  const startIndex = currentSlide * itemsPerSlide;
  const visibleCountries = countries.slice(startIndex, startIndex + itemsPerSlide);

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Explore Countries Around the Globe</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover amazing destinations across the world with our curated travel experiences
              </p>
            </div>
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading countries...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no countries
  if (countries.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explore Countries Around the Globe</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing destinations across the world with our curated travel experiences
            </p>
          </div>

          {/* Carousel Container - Centered */}
          <div className="relative">
            {/* Carousel Items - Centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 justify-center mx-auto">
              {visibleCountries.map((country, index) => (
                <div
                  key={country.id}
                  className="relative group overflow-hidden rounded-lg h-64 cursor-pointer will-change-transform transition-transform duration-300 ease-out hover:scale-105"
                  onClick={() => handleCountryClick(country.destinationLink)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCountryClick(country.destinationLink);
                    }
                  }}
                >
                  {/* Image */}
                  <img
                    src={country.imageUrl}
                    alt={country.countryName}
                    className="w-full h-full object-cover will-change-transform transition-transform duration-300 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white text-xl font-bold mb-2">{country.countryName}</h3>
                    {country.description && (
                      <p className="text-gray-200 text-sm">{country.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {countries.length > itemsPerSlide && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-colors z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-colors z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {countries.length > itemsPerSlide && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-red-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountriesCarousel;

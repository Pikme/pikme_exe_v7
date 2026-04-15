import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export function FeaturedDestinationsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const { data: destinations = [] } = trpc.homePageSettings.getAllFeaturedDestinations.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || destinations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, destinations.length]);

  if (destinations.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const goToSlide = (index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const currentDestination = destinations[currentIndex];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Destinations</h2>
          <p className="text-gray-600">Explore our handpicked travel experiences</p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div className="aspect-video relative">
              <img
                src={currentDestination.imageUrl}
                alt={currentDestination.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450';
                }}
              />

              {/* Overlay with content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {currentDestination.title}
                </h3>
                {currentDestination.description && (
                  <p className="text-white/90 text-sm md:text-base line-clamp-2">
                    {currentDestination.description}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Dots Navigation */}
          {destinations.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {destinations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-gray-900 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Strip */}
          {destinations.length > 1 && (
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {destinations.map((dest, index) => (
                <button
                  key={dest.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-gray-900 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x64';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

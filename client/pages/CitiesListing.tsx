import { useState } from 'react';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface City {
  id: string;
  name: string;
  country: string;
  slug: string;
  description: string;
  highlights: string[];
  bestTime: string;
  rating: number;
  reviews: number;
  featured: boolean;
}

const cities: City[] = [
  {
    id: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    slug: 'chiang-mai',
    description: 'Thailand\'s cultural jewel featuring ancient temples, vibrant markets, and authentic experiences in northern Thailand.',
    highlights: ['300+ Temples', 'Night Bazaar', 'Elephant Sanctuaries', 'Cooking Classes'],
    bestTime: 'November - February',
    rating: 4.8,
    reviews: 2547,
    featured: true
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    slug: 'bangkok',
    description: 'Thailand\'s vibrant capital city with stunning temples, bustling markets, world-class dining, and modern attractions.',
    highlights: ['Grand Palace', 'Floating Markets', 'Street Food', 'Nightlife'],
    bestTime: 'November - February',
    rating: 4.6,
    reviews: 3821,
    featured: true
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    slug: 'bali',
    description: 'Indonesia\'s paradise island offering pristine beaches, ancient temples, rice terraces, and world-class resorts.',
    highlights: ['Beaches', 'Temples', 'Rice Terraces', 'Yoga Retreats'],
    bestTime: 'April - October',
    rating: 4.7,
    reviews: 4156,
    featured: true
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    slug: 'delhi',
    description: 'India\'s capital city blending ancient history with modern vibrancy, featuring iconic monuments and diverse culture.',
    highlights: ['Red Fort', 'Jama Masjid', 'Street Food', 'Markets'],
    bestTime: 'October - March',
    rating: 4.5,
    reviews: 1923,
    featured: true
  },
  {
    id: 'phuket',
    name: 'Phuket',
    country: 'Thailand',
    slug: 'phuket',
    description: 'Thailand\'s largest island known for beautiful beaches, water sports, vibrant nightlife, and island hopping opportunities.',
    highlights: ['Patong Beach', 'Water Sports', 'Nightlife', 'Island Tours'],
    bestTime: 'November - April',
    rating: 4.5,
    reviews: 2834,
    featured: false
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    slug: 'jaipur',
    description: 'The Pink City of India featuring the iconic Palace of Winds, stunning architecture, and vibrant bazaars.',
    highlights: ['Hawa Mahal', 'City Palace', 'Bazaars', 'Forts'],
    bestTime: 'October - March',
    rating: 4.6,
    reviews: 1654,
    featured: false
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    country: 'Vietnam',
    slug: 'hanoi',
    description: 'Vietnam\'s capital city with a rich history, charming old town, delicious street food, and nearby natural wonders.',
    highlights: ['Old Town', 'Hoan Kiem Lake', 'Street Food', 'Ha Long Bay'],
    bestTime: 'October - April',
    rating: 4.6,
    reviews: 2245,
    featured: false
  },
  {
    id: 'kathmandu',
    name: 'Kathmandu',
    country: 'Nepal',
    slug: 'kathmandu',
    description: 'Nepal\'s capital city nestled in the Himalayas, featuring ancient temples, spiritual sites, and mountain views.',
    highlights: ['Temples', 'Durbar Square', 'Hiking', 'Mountain Views'],
    bestTime: 'September - November',
    rating: 4.7,
    reviews: 1876,
    featured: false
  }
];

export function CitiesListing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countries = Array.from(new Set(cities.map(city => city.country)));
  
  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || city.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const featuredCities = filteredCities.filter(city => city.featured);
  const otherCities = filteredCities.filter(city => !city.featured);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary/40 to-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Explore Amazing Cities
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked travel experiences in the world's most captivating destinations
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search cities, countries, or experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCountry(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCountry === null
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All Countries
              </button>
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCountry === country
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Cities Section */}
          {featuredCities.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
                <Star className="text-yellow-500" size={28} />
                Featured Destinations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCities.map(city => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </section>
          )}

          {/* All Cities Section */}
          {otherCities.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
                <MapPin className="text-primary" size={28} />
                All Destinations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCities.map(city => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {filteredCities.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No cities found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* CTA Section */}
          <section className="mt-16 bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-3">Ready to Book Your Adventure?</h2>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Browse our curated tours and experiences in these amazing destinations
            </p>
            <Button className="bg-white text-primary hover:bg-gray-100">
              Explore All Tours
            </Button>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

function CityCard({ city }: { city: City }) {
  return (
    <Link href={`/cities/${city.slug}`}>
      <a className="block">
        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 h-full">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold">{city.name}</h3>
              {city.featured && (
                <Star className="text-yellow-300 fill-yellow-300" size={20} />
              )}
            </div>
            <p className="text-sm opacity-90 flex items-center gap-1">
              <MapPin size={16} />
              {city.country}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {city.description}
            </p>

            {/* Highlights */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {city.highlights.slice(0, 3).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating and Best Time */}
            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(city.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{city.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({city.reviews} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Best Time:</strong> {city.bestTime}
              </p>
            </div>

            {/* CTA Button */}
            <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              Explore <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </a>
    </Link>
  );
}

import { useState } from 'react';
import { MapPin, Calendar, Thermometer, Users, Star, Clock, Heart, Share2, ChevronRight } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';

interface Attraction {
  id: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  bestTime: string;
}

interface Experience {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  price: string;
}

const attractions: Attraction[] = [
  {
    id: 'doi-suthep',
    name: 'Wat Phra That Doi Suthep',
    category: 'Temple',
    description: 'The most iconic temple in Chiang Mai, perched on a mountain overlooking the city. Built in 1383, this golden temple is a spiritual heart of the region and offers breathtaking panoramic views of the city below.',
    highlights: ['Golden pagoda', 'Mountain views', 'Spiritual significance', 'Sunset viewing'],
    bestTime: 'Early morning or late afternoon for best light and fewer crowds'
  },
  {
    id: 'old-city',
    name: 'Chiang Mai Old City',
    category: 'Cultural',
    description: 'The historic heart of Chiang Mai surrounded by ancient walls and moats. This area is filled with temples, traditional houses, and local shops. Perfect for walking tours and discovering authentic Chiang Mai culture.',
    highlights: ['Ancient walls', 'Temple hopping', 'Local markets', 'Traditional architecture'],
    bestTime: 'Morning walks or evening exploration'
  },
  {
    id: 'night-bazaar',
    name: 'Chiang Mai Night Bazaar',
    category: 'Shopping & Market',
    description: 'A massive night market offering everything from souvenirs to clothing, handicrafts, and local food. The vibrant atmosphere, colorful stalls, and street food make it a must-visit for shopping and experiencing local culture.',
    highlights: ['Souvenirs', 'Street food', 'Local crafts', 'Live entertainment'],
    bestTime: 'Evening (6 PM onwards)'
  },
  {
    id: 'sunday-market',
    name: 'Sunday Walking Street Market',
    category: 'Market',
    description: 'Every Sunday, the entire Nimmanhaemin Road transforms into a walking street filled with vendors selling art, crafts, clothing, and food. This is the most vibrant market experience in Chiang Mai.',
    highlights: ['Local art', 'Handmade crafts', 'Street food', 'Cultural performances'],
    bestTime: 'Sunday evening (4 PM - 11 PM)'
  },
  {
    id: 'elephant-nature',
    name: 'Elephant Nature Park',
    category: 'Wildlife & Nature',
    description: 'A sanctuary for rescued elephants offering ethical elephant interactions. Learn about elephant behavior, feed them, and bathe them in natural settings while supporting conservation efforts.',
    highlights: ['Ethical elephant encounters', 'Conservation education', 'Natural environment', 'Photography opportunities'],
    bestTime: 'Morning tours for best elephant activity'
  },
  {
    id: 'monk-chat',
    name: 'Monk Chat at Wat Chedi Luang',
    category: 'Cultural Experience',
    description: 'Engage in casual conversations with Buddhist monks to learn about Thai culture, Buddhism, and daily monastic life. A unique and authentic cultural exchange experience.',
    highlights: ['Cultural exchange', 'Language practice', 'Buddhist teachings', 'Authentic interaction'],
    bestTime: 'Afternoon sessions (2 PM - 5 PM)'
  },
  {
    id: 'cooking-class',
    name: 'Thai Cooking Classes',
    category: 'Culinary Experience',
    description: 'Learn to cook authentic Thai dishes from professional chefs. Visit local markets to select ingredients, then prepare and enjoy multiple courses in a hands-on cooking class.',
    highlights: ['Market visit', 'Hands-on cooking', 'Authentic recipes', 'Meal included'],
    bestTime: 'Morning or afternoon sessions'
  },
  {
    id: 'lantern-festival',
    name: 'Yi Peng Lantern Festival',
    category: 'Festival & Event',
    description: 'Experience thousands of glowing lanterns floating into the night sky during this magical festival. One of the most spectacular festivals in Thailand, typically held in November.',
    highlights: ['Thousands of lanterns', 'Magical atmosphere', 'Cultural celebration', 'Photography paradise'],
    bestTime: 'November (Yi Peng Festival dates)'
  }
];

const experiences: Experience[] = [
  {
    id: 'temple-tour',
    title: 'Full Day Temple Tour',
    description: 'Visit 3-4 major temples including Doi Suthep, Wat Chedi Luang, and Wat Phra Singh with knowledgeable guides explaining history and significance.',
    duration: '6-8 hours',
    difficulty: 'Easy',
    price: '₹2,500 - ₹4,000'
  },
  {
    id: 'trekking',
    title: 'Jungle Trekking Adventure',
    description: 'Explore the lush forests surrounding Chiang Mai with opportunities to visit hill tribe villages and experience nature up close.',
    duration: '4-6 hours',
    difficulty: 'Moderate',
    price: '₹3,000 - ₹5,000'
  },
  {
    id: 'zipline',
    title: 'Canopy Zipline Tour',
    description: 'Soar through the treetops on thrilling ziplines with panoramic views of the jungle and surrounding landscape.',
    duration: '2-3 hours',
    difficulty: 'Moderate',
    price: '₹3,500 - ₹5,500'
  },
  {
    id: 'massage',
    title: 'Traditional Thai Massage & Spa',
    description: 'Relax with authentic Thai massage and spa treatments in traditional settings, perfect for unwinding after exploration.',
    duration: '1-3 hours',
    difficulty: 'Easy',
    price: '₹800 - ₹2,500'
  },
  {
    id: 'night-safari',
    title: 'Night Safari & Market Tour',
    description: 'Experience the city at night with visits to the Night Bazaar, local restaurants, and evening entertainment venues.',
    duration: '4-5 hours',
    difficulty: 'Easy',
    price: '₹2,000 - ₹3,500'
  },
  {
    id: 'motorcycle',
    title: 'Motorcycle Tour',
    description: 'Ride through scenic routes around Chiang Mai, visiting waterfalls, viewpoints, and local villages on a thrilling adventure.',
    duration: '4-6 hours',
    difficulty: 'Moderate',
    price: '₹2,500 - ₹4,000'
  }
];

const quickFacts = [
  { label: 'Best Time to Visit', value: 'November - February (cool & dry)' },
  { label: 'Climate', value: 'Tropical; 25-35°C year-round' },
  { label: 'Altitude', value: '310 meters above sea level' },
  { label: 'Population', value: '~1.2 million' },
  { label: 'Language', value: 'Thai (English widely spoken in tourist areas)' },
  { label: 'Currency', value: 'Thai Baht (THB)' }
];

const thingsToDo = [
  { icon: '🏯', category: 'Temples & Spirituality', count: '300+ temples' },
  { icon: '🛍️', category: 'Shopping & Markets', count: 'Night Bazaar, Sunday Market' },
  { icon: '🐘', category: 'Wildlife & Nature', count: 'Elephant parks, jungle treks' },
  { icon: '🍜', category: 'Culinary Experiences', count: 'Cooking classes, street food' },
  { icon: '🎨', category: 'Art & Culture', count: 'Art galleries, craft workshops' },
  { icon: '🏞️', category: 'Outdoor Activities', count: 'Trekking, ziplines, waterfalls' }
];

export function ChiangMai() {
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
  const [savedAttractions, setSavedAttractions] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    const newSaved = new Set(savedAttractions);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedAttractions(newSaved);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-b from-primary/40 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">Chiang Mai</h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
              Thailand's Cultural Jewel - Ancient Temples, Vibrant Markets & Unforgettable Experiences
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary hover:bg-primary/90">Explore Tours</Button>
              <Button variant="outline">Save for Later</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Facts */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Quick Facts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">{fact.label}</p>
                  <p className="text-lg font-semibold text-foreground">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">About Chiang Mai</h2>
            <div className="bg-card border border-border rounded-lg p-8">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Chiang Mai, located in northern Thailand, is a city that seamlessly blends ancient traditions with modern charm. Founded in 1296, this historic city served as the capital of the Lanna Kingdom and remains a cultural heartland of Thailand. With over 300 temples, vibrant markets, and a warm, welcoming atmosphere, Chiang Mai offers visitors an authentic Thai experience away from the hustle and bustle of Bangkok.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                The city is renowned for its spiritual significance, artistic heritage, and natural beauty. Surrounded by mountains and lush valleys, Chiang Mai provides the perfect backdrop for adventure, relaxation, and cultural immersion. Whether you're seeking spiritual enlightenment at ancient temples, culinary adventures in bustling markets, or thrilling outdoor activities, Chiang Mai has something for everyone.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The local people, known for their hospitality and craftsmanship, create a welcoming environment for visitors. From traditional silk weaving to elephant sanctuaries, from cooking classes to meditation retreats, Chiang Mai offers authentic experiences that leave lasting memories.
              </p>
            </div>
          </section>

          {/* Must-See Attractions */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Must-See Attractions</h2>
            <div className="space-y-4">
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => setSelectedAttraction(selectedAttraction === attraction.id ? null : attraction.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{attraction.name}</h3>
                        <p className="text-sm text-muted-foreground">{attraction.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(attraction.id);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Heart
                          size={20}
                          className={savedAttractions.has(attraction.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                        />
                      </button>
                      <ChevronRight
                        size={20}
                        className={`text-muted-foreground transition-transform ${
                          selectedAttraction === attraction.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {selectedAttraction === attraction.id && (
                    <div className="px-6 py-4 border-t border-border bg-muted/30">
                      <p className="text-muted-foreground mb-4">{attraction.description}</p>
                      <div className="mb-4">
                        <h4 className="font-semibold text-foreground mb-2">Highlights:</h4>
                        <div className="flex flex-wrap gap-2">
                          {attraction.highlights.map((highlight, idx) => (
                            <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock size={16} className="mt-1 flex-shrink-0" />
                        <span>{attraction.bestTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Things to Do by Category */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Things to Do by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {thingsToDo.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.category}</h3>
                  <p className="text-sm text-muted-foreground">{item.count}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Local Experiences */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Popular Local Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{exp.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users size={16} />
                        <span>Difficulty: {exp.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <span>{exp.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-muted/50 border-t border-border">
                    <Button variant="ghost" className="w-full text-primary hover:bg-primary/10">
                      View Tours
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Best Time to Visit */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Best Time to Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Cool & Dry Season
                </h3>
                <p className="text-sm text-muted-foreground mb-2"><strong>November - February</strong></p>
                <p className="text-sm text-muted-foreground">Best time to visit with pleasant weather, clear skies, and comfortable temperatures (15-25°C). Perfect for outdoor activities and temple visits.</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Thermometer size={20} className="text-primary" />
                  Hot Season
                </h3>
                <p className="text-sm text-muted-foreground mb-2"><strong>March - May</strong></p>
                <p className="text-sm text-muted-foreground">Hot and dry with temperatures reaching 35-40°C. Good for budget travelers, fewer tourists, but requires sun protection and hydration.</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  Monsoon Season
                </h3>
                <p className="text-sm text-muted-foreground mb-2"><strong>June - October</strong></p>
                <p className="text-sm text-muted-foreground">Rainy season with lush green landscapes and lower prices. Afternoon showers are common, but mornings are usually clear for exploration.</p>
              </div>
            </div>
          </section>

          {/* Getting Around */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Getting Around Chiang Mai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Local Transportation</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Songthaews:</strong> Red shared taxis following fixed routes, very affordable (₹20-50)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Tuk-tuks:</strong> Three-wheeled taxis, ideal for short distances (₹50-150)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Motorcycles:</strong> Rent for ₹150-300/day for independent exploration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Bicycles:</strong> Perfect for exploring the Old City (₹50-100/day)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Practical Tips</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>Most attractions are within 30 minutes from the city center</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>Walking is great for exploring the Old City and Nimman area</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>Negotiate tuk-tuk fares before boarding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>Download Grab app for convenient ride-hailing</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Related Destinations */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Nearby Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Doi Inthanon', distance: '60 km south', highlight: 'Highest mountain in Thailand' },
                { name: 'Chiang Rai', distance: '180 km north', highlight: 'White Temple & Golden Triangle' },
                { name: 'Pai', distance: '130 km west', highlight: 'Artistic town & waterfalls' },
                { name: 'Lamphun', distance: '30 km south', highlight: 'Ancient temples & orchards' }
              ].map((dest, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-foreground mb-2">{dest.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{dest.distance}</p>
                  <p className="text-sm text-muted-foreground">{dest.highlight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-3">Ready to Explore Chiang Mai?</h2>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Discover unforgettable experiences in Thailand's cultural capital. Browse our curated tours and book your adventure today.
            </p>
            <Button className="bg-white text-primary hover:bg-gray-100">
              Browse Chiang Mai Tours
            </Button>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

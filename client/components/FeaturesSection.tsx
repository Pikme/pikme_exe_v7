import { MapPin, Plane, Hotel, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export function FeaturesSection() {
  const { data: settings } = trpc.homePageSettings.getSettings.useQuery();
  const features = [
    {
      icon: MapPin,
      title: 'Global Destinations',
      description: 'Explore destinations across all continents',
    },
    {
      icon: Plane,
      title: 'Expert Guides',
      description: 'Travel with experienced local guides',
    },
    {
      icon: Hotel,
      title: '3 Star to 5 Star Hotels',
      description: 'Comfortable, clean & centrally located stays',
    },
    {
      icon: Zap,
      title: 'Best Prices',
      description: 'Get the best deals on travel packages',
    },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-12 overflow-hidden">
      {/* Background decorative elements with white geometric patterns */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {/* White geometric shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full opacity-15"></div>
        
        {/* White diagonal lines for geometric pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
          <defs>
            <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
        
        {/* White accent triangles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5" style={{
          clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5" style={{
          clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)'
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List - Left Side */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 text-white"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-red-100 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section - Right Side */}
          <div className="flex flex-col justify-center items-center lg:items-end text-white text-center lg:text-right">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Your Perfect Travel Experience
            </h2>
            <p className="text-red-100 text-lg mb-8 max-w-md">
              {(settings as any)?.featuresDescription || "Discover handpicked travel experiences tailored to your preferences and class."}
            </p>
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold rounded-full px-8 py-6 text-lg"
            >
              Explore Tours
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

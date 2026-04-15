import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export function SolarEnergySection() {
  const images = [
    'https://images.unsplash.com/photo-1509391366360-2e938d440dbb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509391366360-2e938d440dbb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509391366360-2e938d440dbb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=300&fit=crop',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-12 h-12 text-yellow-500" />
                <h2 className="text-5xl font-bold">
                  <span className="text-blue-400">Solar</span>
                  <br />
                  <span className="text-gray-900">Energy</span>
                </h2>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              We're a full-service design and development agency crafting modern brands, websites, and products that drive results.
            </p>

            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold"
            >
              Get Started →
            </Button>

            <div className="pt-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">30<span className="text-3xl">+</span></div>
              <p className="text-gray-600 font-semibold">Years of Experience</p>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="space-y-4">
            {/* Featured Card */}
            <div className="bg-blue-400 rounded-lg p-6 text-white mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-300">⭐</span>
                <span className="text-sm font-semibold">READY FOR FUTURE</span>
              </div>
              <h3 className="text-2xl font-bold">Green Energy Make Bold Impact</h3>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden h-40 shadow-lg group cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Solar ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">200K+</p>
                <p className="text-gray-600 font-semibold">Meet the heart of our community</p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

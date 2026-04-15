import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const defaultDestinations = [
  {
    title: 'Beaches of Ceará',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=400&fit=crop',
    description: '',
  },
  {
    title: 'Beaches of Ceará',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=400&fit=crop',
    description: '',
  },
  {
    title: 'Fernando de Noronha',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    description: '',
  },
];

export function BrazilSection() {
  const { data: galleryData = [] } = trpc.homePageSettings.getAllDestinationGallery.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const destinations = galleryData.length > 0 ? galleryData.map(card => ({
    title: card.title,
    image: card.imageUrl,
    description: card.description || '',
  })) : defaultDestinations;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="text-red-600">Pikme</span> Luxury Travel
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 text-lg leading-relaxed text-justify">
              <p>
                Our curated itineraries are created for travelers who value privacy, comfort, and elevated experiences. Every journey is thoughtfully designed with private access, luxury stays, and seamless planning at its core.
              </p>
              <p>
                We work with high-net-worth individuals, C-suite leaders, and business owners who seek fully managed, premium travel. As a specialist provider of luxury, end-to-end journeys, our services are best suited for those looking for a highly personalized and comprehensive travel experience.
              </p>
            </div>

            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-600"
            >
              ALL DESTINATIONS
            </Button>
          </div>

          {/* Right Side - Images Grid */}
          <div className="grid grid-cols-3 gap-4 h-96">
            {destinations.map((dest, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer"
              >
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-end">
                  <div className="p-4 text-white">
                    <p className="text-sm font-semibold">{dest.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

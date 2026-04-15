import { Plane, Building2, MapPin, Sparkles, Globe, Headphones, Heart, Zap } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

export default function AboutUs() {
  const services = [
    {
      icon: Plane,
      title: "Air Travel, Elevated",
      description:
        "Experience flying the way it's meant to be—effortless, refined, and exclusive. We specialize in Commercial Flights | Private Charters | Chopper Transfers, offering only First Class and Business Class travel.",
    },
    {
      icon: Building2,
      title: "Handpicked Stays",
      description:
        "From luxury hotels to premium boutique escapes, curated for comfort and style.",
    },
    {
      icon: MapPin,
      title: "Bespoke Travel Experiences",
      description:
        "Custom-made tours and packages designed around your preferences.",
    },
    {
      icon: Sparkles,
      title: "Attractions & Experiences",
      description:
        "Easy access to top attractions and activities—even at the last minute.",
    },
    {
      icon: Globe,
      title: "Domestic & International Holidays",
      description:
        "From quick getaways to global escapes, planned your way.",
    },
    {
      icon: Heart,
      title: "Spiritual Journeys, Redefined",
      description:
        "Travel with purpose and peace of mind through our thoughtfully curated spiritual tours. Enjoy VIP access and escorted darshan services, specially arranged for senior citizens and those who prefer a smooth, guided experience.",
    },
    {
      icon: Headphones,
      title: "Elite Travel Assistance",
      description:
        "Dedicated support at every step—before, during, and after your journey.",
    },
    {
      icon: Zap,
      title: "Seamless Lifestyle Management",
      description:
        "From travel to special requests, we take care of the details so you don't have to.",
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Us
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            At Pikme, we believe travel is more than just reaching a destination—it's about the journey, the experiences, and the memories you create along the way. We're committed to crafting extraordinary travel experiences that exceed expectations.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg border-2 border-red-500 text-red-500">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              To revolutionize travel by combining personalized service, curated experiences, and seamless logistics. We empower travelers to explore the world on their terms, with the confidence that every detail is thoughtfully managed.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're seeking adventure, spiritual awakening, or pure relaxation, Pikme is your trusted partner in creating unforgettable journeys.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Pikme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expertise</h3>
            <p className="text-gray-600">
              Years of experience in crafting exceptional travel experiences across India and globally.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalization</h3>
            <p className="text-gray-600">
              Every journey is unique. We tailor experiences to match your preferences and requirements.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-gray-600">
              Our dedicated team is always available to assist you before, during, and after your travels.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
            Discover the Pikme difference. Let us help you create memories that last a lifetime.
          </p>
          <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Us Today
          </button>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}

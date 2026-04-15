import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = {
  faqs: [
    {
      id: 1,
      question: "What makes your VIP travel services different from standard travel packages?",
      answer: "Our VIP travel services are designed exclusively for discerning travelers who demand excellence. We offer First Class and Business Class flights only, curated luxury accommodations ranging from 5-star hotels to premium boutique properties, dedicated concierge support, and personalized itineraries crafted around your preferences. Every detail—from private transfers to exclusive access at attractions—is meticulously planned to ensure an elevated travel experience that goes far beyond standard tourism."
    },
    {
      id: 2,
      question: "Do you offer private charter flights and helicopter transfers?",
      answer: "Yes, we specialize in private aviation solutions for the ultimate in luxury and convenience. Our services include private charter flights for complete privacy and flexibility, helicopter transfers for scenic arrivals and time-efficient journeys, and seamless ground transportation in premium vehicles. Whether you're traveling for business or leisure, our private aviation options ensure you arrive refreshed, on your schedule, with maximum comfort and discretion."
    },
    {
      id: 3,
      question: "What types of luxury accommodations are included in your VIP packages?",
      answer: "We partner exclusively with the world's finest hospitality brands. Our curated stays include 5-star luxury hotels with premium suites and personalized service, ultra-luxury boutique properties offering unique experiences, heritage palaces and resorts for culturally immersive stays, private villas with dedicated staff for ultimate privacy, and exclusive resort experiences with VIP amenities. Each property is hand-selected based on service excellence, location, and the unique experiences they offer."
    },
    {
      id: 4,
      question: "How do you customize travel experiences for individual preferences?",
      answer: "Customization is at the heart of our service. Our travel specialists work closely with you to understand your interests, lifestyle preferences, and travel goals. We then design bespoke itineraries that reflect your personality—whether you seek cultural immersion, adventure, relaxation, or spiritual journeys. From private guided tours with expert historians to exclusive dining experiences with Michelin-starred chefs, every element is tailored to create your perfect journey."
    },
    {
      id: 5,
      question: "What VIP access and exclusive experiences do you provide?",
      answer: "Our VIP connections unlock extraordinary experiences unavailable to regular tourists. We arrange private museum tours after hours, exclusive access to spiritual sites with VIP darshan services, private performances and cultural events, priority access to world-class attractions, helicopter tours over iconic landmarks, and curated meetings with local artisans and cultural experts. Our relationships with premium venues ensure you experience destinations as an insider, not a visitor."
    },
    {
      id: 6,
      question: "Do you offer special services for senior citizens and families?",
      answer: "Absolutely. We provide specialized VIP services for senior travelers including escorted darshan services at spiritual sites, accessible accommodations with mobility assistance, slower-paced itineraries with rest days, medical support coordination, and dedicated staff to ensure comfort and safety. For families, we offer multi-generational itineraries, private guides, kid-friendly luxury experiences, and seamless logistics that allow everyone to enjoy the journey without stress."
    },
    {
      id: 7,
      question: "What is included in your elite travel assistance and concierge services?",
      answer: "Our 24/7 elite concierge team provides comprehensive support including pre-travel planning and visa assistance, real-time travel coordination and emergency support, restaurant reservations at exclusive venues, special event tickets and experiences, ground transportation arrangements, personal shopping assistance, and lifestyle management services. We handle every detail so you can focus entirely on enjoying your journey. Our team is available around the clock for any request or concern."
    },
    {
      id: 8,
      question: "How do you handle special requests and last-minute changes?",
      answer: "VIP flexibility is our hallmark. Our dedicated team can arrange last-minute experiences, modify itineraries on the fly, source rare or exclusive items, and coordinate complex logistics with minimal notice. Whether you want to extend your stay, add an unexpected destination, arrange a surprise celebration, or need specialized services, our relationships with premium providers worldwide enable us to fulfill requests that would be impossible through standard channels. We pride ourselves on saying 'yes' to our VIP clients."
    },
    {
      id: 9,
      question: "What are your pricing models and payment options for VIP packages?",
      answer: "VIP packages are fully customizable with pricing based on your specific requirements, destinations, accommodation choices, and service level. We offer transparent pricing with no hidden fees, flexible payment plans including deposits and installments, corporate billing options, and exclusive pricing for repeat clients and loyalty program members. We also offer all-inclusive packages at fixed rates for popular itineraries. Our team provides detailed quotes and can structure payments to suit your preferences."
    },
    {
      id: 10,
      question: "How far in advance should I book VIP travel experiences?",
      answer: "For optimal planning and access to the finest accommodations and experiences, we recommend booking 2-3 months in advance for domestic travel and 3-6 months for international journeys. However, our VIP network allows us to arrange exceptional experiences with shorter notice. For peak seasons or highly exclusive experiences (private charters, rare spiritual access, luxury villa rentals), earlier booking ensures availability. We welcome inquiries at any time and will advise on optimal booking timelines for your specific preferences."
    }
  ]
};

export function FAQSection() {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            VIP Travel Services - Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Discover how our elite travel services deliver luxury, exclusivity, and personalized experiences for the most discerning travelers
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-red-700 transition-colors"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={expandedId === faq.id}
              >
                <h3 className="text-left font-semibold text-gray-900 text-lg">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-red-700 flex-shrink-0 transition-transform ${
                    expandedId === faq.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer Content */}
              {expandedId === faq.id && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Ready to experience VIP travel like never before?
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors"
          >
            Plan Your VIP Journey
          </a>
        </div>
      </div>

      {/* Structured Data for FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </section>
  );
}

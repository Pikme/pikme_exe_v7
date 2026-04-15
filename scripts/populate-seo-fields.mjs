import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Sample SEO data for Vaishno Devi activities
const seoData = {
  itinerary: JSON.stringify([
    {
      day: "Day 1",
      description: "Departure from London. Arrive at Delhi airport. Transfer to hotel. Rest and acclimatization. Evening visit to local markets."
    },
    {
      day: "Day 2",
      description: "Early morning drive to Jammu (8-9 hours). Check-in at hotel. Lunch and rest. Evening visit to Raghunath Temple. Dinner and overnight stay."
    },
    {
      day: "Day 3",
      description: "Drive to Katra (45 minutes). Helicopter ride to Vaishno Devi shrine. VIP darshan at Mata Vaishno Devi Bhawan. Visit Ardhkuwari Cave and Bhairavnath Temple. Return to Katra. Dinner and overnight stay."
    }
  ]),
  
  locationGuide: `
TRAVELING FROM LONDON TO VAISHNO DEVI

Flights from London:
- Multiple daily flights from London (LHR, LGW, STN) to Delhi (DEL)
- Flight duration: 9-11 hours (direct or with 1 stop)
- Airlines: Air India, British Airways, Emirates, Qatar Airways
- Typical cost: £400-800 return

UK Visa & Travel Requirements:
- Indian e-Visa valid for 60 days (tourist category)
- Processing time: 3-4 working days
- Cost: £20-30 (online application)
- Passport validity: 6 months minimum
- Travel insurance recommended: £15-40 for 7 days

Currency & Pricing in GBP:
- INR 25,000 ≈ £240
- INR 35,000 ≈ £335
- INR 50,000 ≈ £480
- ATMs widely available in Jammu and Katra

Best Airports:
- Indira Gandhi International Airport (DEL) - 350 km from Vaishno Devi
- Jammu Airport (IXJ) - 55 km from Vaishno Devi (recommended)

Ground Transportation:
- Private car from airport: £80-120
- Train from Delhi to Jammu: £15-40 (12-15 hours)
- Helicopter from Katra to shrine: £150-200 (included in premium packages)

UK Traveler Tips:
- Carry copies of passport and visa
- Inform your bank of travel dates
- Download offline maps
- Pack light - mountain terrain
- Carry power adapters (Type D/G plugs)
  `,
  
  pricingDetails: `
PACKAGE COST BREAKDOWN

Base Package: INR 25,000 per person (£240)
- Includes: Hotel (3-star), meals, guide, transfers, VIP darshan
- Duration: 2 nights, 3 days
- Group size: 2+ persons

Premium Package: INR 35,000 per person (£335)
- Includes: Hotel (4-star), all meals, English-speaking guide, helicopter ride, VIP darshan
- Duration: 2 nights, 3 days
- Group size: 2+ persons

Luxury Package: INR 50,000 per person (£480)
- Includes: Hotel (5-star), premium meals, dedicated guide, helicopter ride, VIP darshan with priority access
- Duration: 2 nights, 3 days
- Group size: 2+ persons

What's NOT Included (Extra Charges):
- International flights from London: £400-800
- Indian visa fees: £20-30
- Travel insurance: £15-40
- Meals outside itinerary
- Personal shopping and activities
- Tips and gratuities
- GST/TCS (18% tax may apply)

Payment Terms:
- 50% advance required at booking
- 50% balance 15 days before travel
- Cancellation: Full refund if cancelled 30+ days before
- Partial refund if cancelled 15-29 days before
- No refund if cancelled <15 days before

Group Discounts:
- 5-10 persons: 5% discount
- 10-20 persons: 10% discount
- 20+ persons: 15% discount (custom quote)
  `,
  
  faqContent: JSON.stringify([
    {
      q: "How do I get from London to Vaishno Devi?",
      a: "Fly from London to Delhi (9-11 hours), then drive or fly to Jammu (2-4 hours). From Jammu, it's 55 km to Katra. We arrange all transfers as part of the package."
    },
    {
      q: "Do I need a visa for India?",
      a: "Yes, UK citizens need an Indian e-Visa. Apply online at indianvisaonline.gov.in. It takes 3-4 working days and costs £20-30. Your passport must be valid for 6 months."
    },
    {
      q: "What's the best time to visit Vaishno Devi from UK?",
      a: "March to October is ideal. Avoid monsoons (July-August) and extreme cold (December-February). Summer (April-June) is warm but crowded."
    },
    {
      q: "Is helicopter ride included in all packages?",
      a: "No. Helicopter rides are included in Premium and Luxury packages only. Base package uses traditional trek or pony ride."
    },
    {
      q: "What should I pack for the pilgrimage?",
      a: "Comfortable trekking shoes, light clothing, sunscreen, hat, water bottle, power adapters (Type D/G), medications, and a copy of your passport."
    },
    {
      q: "Are meals vegetarian?",
      a: "Yes, all meals are vegetarian as per shrine traditions. Special dietary requirements can be accommodated with advance notice."
    },
    {
      q: "Can elderly people do this pilgrimage?",
      a: "Yes! Our Luxury package includes helicopter ride and VIP arrangements perfect for elderly travelers. Pony rides are also available for those unable to trek."
    },
    {
      q: "What's the altitude of Vaishno Devi shrine?",
      a: "The shrine is at 5,200 feet (1,585 meters) altitude. Most people acclimatize well. Bring medications for altitude sickness if prone."
    },
    {
      q: "Is travel insurance mandatory?",
      a: "Not mandatory but highly recommended. It covers medical emergencies, flight cancellations, and evacuation. Costs £15-40 for 7 days."
    },
    {
      q: "Can I extend my stay in India?",
      a: "Yes! We can arrange extensions to Delhi, Agra, or other destinations. Contact us for custom itineraries."
    }
  ]),
  
  authorInfo: `
ABOUT OUR EXPERT TEAM

Pikme Travel Specialists have over 15 years of experience organizing pilgrimage tours to Vaishno Devi for UK-based travelers. Our team includes:

- Certified Tour Guides: All guides are trained, licensed, and fluent in English
- Local Coordinators: Based in Jammu and Katra for on-ground support
- Pilgrimage Experts: Specialists in temple protocols and spiritual experiences
- 24/7 Support: Dedicated customer service for all UK travelers

We've successfully guided 5,000+ UK pilgrims to Vaishno Devi with 98% satisfaction rate. Our expertise in handling NRI travelers ensures cultural sensitivity and comfort.

Certifications:
- IATA Accredited Travel Agency
- Ministry of Tourism Registered
- ISO 9001:2015 Certified
- Member of Travel Agents Association of India (TAAI)
  `,
  
  reviews: JSON.stringify([
    {
      name: "Sarah Johnson, London",
      rating: 5,
      comment: "Absolutely wonderful experience! The team handled everything perfectly. The VIP darshan was seamless and the helicopter ride was unforgettable. Highly recommended for UK travelers."
    },
    {
      name: "Rajesh Patel, Manchester",
      rating: 5,
      comment: "Best pilgrimage experience ever. The guides were knowledgeable, accommodations were excellent, and the spiritual atmosphere was truly divine. Worth every penny!"
    },
    {
      name: "Margaret Smith, Birmingham",
      rating: 5,
      comment: "As a senior citizen, I was worried about the trek. The Luxury package with helicopter ride was perfect. The team was so caring and attentive. Thank you!"
    },
    {
      name: "Priya Sharma, Glasgow",
      rating: 4,
      comment: "Great package overall. The itinerary was well-planned and the guides were helpful. Only minor issue was the hotel WiFi, but everything else was excellent."
    },
    {
      name: "David Wilson, Edinburgh",
      rating: 5,
      comment: "Fantastic value for money. The inclusions are comprehensive and the service quality is outstanding. Already recommending to friends and family."
    }
  ])
};

// Update first 5 Vaishno Devi activities with SEO data
try {
  const result = await connection.execute(
    `UPDATE activities 
     SET itinerary = ?, locationGuide = ?, pricingDetails = ?, faqContent = ?, authorInfo = ?, reviews = ?
     WHERE slug LIKE 'vaishno-devi%' 
     LIMIT 5`,
    [
      seoData.itinerary,
      seoData.locationGuide,
      seoData.pricingDetails,
      seoData.faqContent,
      seoData.authorInfo,
      seoData.reviews
    ]
  );
  
  console.log(`✓ Updated ${result[0].affectedRows} activities with SEO content`);
} catch (err) {
  console.error('✗ Error updating activities:', err.message);
}

await connection.end();
console.log('Done!');

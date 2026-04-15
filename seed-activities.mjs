import { drizzle } from "drizzle-orm/mysql2/http";
import { activities } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const karnatakActivities = [
  // Bangalore activities
  {
    locationId: 1, // Bangalore
    name: "Vidhana Soudha Heritage Tour",
    slug: "vidhana-soudha-tour",
    description: "Guided tour of the iconic Vidhana Soudha, the seat of the State Legislature",
    category: "Heritage",
    duration: "2 hours",
    price: 500,
    difficulty: "easy",
    bestTime: "October to March",
  },
  {
    locationId: 1, // Bangalore
    name: "Lalbagh Botanical Garden Walk",
    slug: "lalbagh-walk",
    description: "Peaceful walk through the historic Lalbagh Botanical Garden with diverse flora",
    category: "Nature",
    duration: "1.5 hours",
    price: 300,
    difficulty: "easy",
    bestTime: "Year-round",
  },
  {
    locationId: 1, // Bangalore
    name: "Cubbon Park Adventure",
    slug: "cubbon-park-adventure",
    description: "Explore the green lung of Bangalore with jogging, cycling, and nature walks",
    category: "Adventure",
    duration: "2 hours",
    price: 250,
    difficulty: "easy",
    bestTime: "Early morning",
  },
  // Mysore activities
  {
    locationId: 2, // Mysore
    name: "Mysore Palace Grand Tour",
    slug: "mysore-palace-tour",
    description: "Comprehensive guided tour of the magnificent Mysore Palace",
    category: "Heritage",
    duration: "3 hours",
    price: 800,
    difficulty: "easy",
    bestTime: "October to March",
  },
  {
    locationId: 2, // Mysore
    name: "Chamundeshwari Temple Trek",
    slug: "chamundeshwari-trek",
    description: "Trek to the ancient Chamundeshwari Temple perched on Chamundi Hills",
    category: "Spiritual",
    duration: "4 hours",
    price: 600,
    difficulty: "moderate",
    bestTime: "October to March",
  },
  {
    locationId: 2, // Mysore
    name: "Brindavan Gardens Evening Stroll",
    slug: "brindavan-gardens",
    description: "Romantic evening walk through the illuminated Brindavan Gardens",
    category: "Leisure",
    duration: "2 hours",
    price: 400,
    difficulty: "easy",
    bestTime: "Evening",
  },
  // Coorg activities
  {
    locationId: 3, // Coorg
    name: "Coffee Plantation Tour",
    slug: "coffee-plantation-tour",
    description: "Learn about coffee cultivation and enjoy fresh brewed coffee at a plantation",
    category: "Agritourism",
    duration: "3 hours",
    price: 1000,
    difficulty: "easy",
    bestTime: "Year-round",
  },
  {
    locationId: 3, // Coorg
    name: "Abbey Falls Trek",
    slug: "abbey-falls-trek",
    description: "Scenic trek through spice plantations to the beautiful Abbey Falls",
    category: "Adventure",
    duration: "2.5 hours",
    price: 800,
    difficulty: "moderate",
    bestTime: "October to May",
  },
  // Gokarna activities
  {
    locationId: 4, // Gokarna
    name: "Beach Yoga & Meditation",
    slug: "beach-yoga",
    description: "Rejuvenating yoga and meditation session on the pristine Gokarna Beach",
    category: "Wellness",
    duration: "1.5 hours",
    price: 600,
    difficulty: "easy",
    bestTime: "Year-round",
  },
  {
    locationId: 4, // Gokarna
    name: "Mahabaleshwar Temple Pilgrimage",
    slug: "mahabaleshwar-temple",
    description: "Sacred pilgrimage to the ancient Mahabaleshwar Temple",
    category: "Spiritual",
    duration: "2 hours",
    price: 400,
    difficulty: "easy",
    bestTime: "Year-round",
  },
  // Hampi activities
  {
    locationId: 5, // Hampi
    name: "Virupaksha Temple Archaeological Tour",
    slug: "virupaksha-temple-tour",
    description: "Guided archaeological tour of the magnificent Virupaksha Temple",
    category: "Heritage",
    duration: "2.5 hours",
    price: 700,
    difficulty: "moderate",
    bestTime: "October to March",
  },
  {
    locationId: 5, // Hampi
    name: "Vittala Temple Sunset Visit",
    slug: "vittala-temple-sunset",
    description: "Experience the stunning sunset at the iconic Vittala Temple",
    category: "Heritage",
    duration: "2 hours",
    price: 500,
    difficulty: "easy",
    bestTime: "October to March",
  },
  // Chikmagalur activities
  {
    locationId: 6, // Chikmagalur
    name: "Mullayanagiri Peak Trek",
    slug: "mullayanagiri-trek",
    description: "Challenging trek to the highest peak in Karnataka with panoramic views",
    category: "Adventure",
    duration: "6 hours",
    price: 1500,
    difficulty: "challenging",
    bestTime: "October to May",
  },
  {
    locationId: 6, // Chikmagalur
    name: "Coffee Estate Experience",
    slug: "coffee-estate-experience",
    description: "Immersive experience at a coffee estate with harvesting and processing",
    category: "Agritourism",
    duration: "4 hours",
    price: 1200,
    difficulty: "easy",
    bestTime: "Year-round",
  },
];

async function seedActivities() {
  try {
    console.log("Starting to seed activities...");
    for (const activity of karnatakActivities) {
      await db.insert(activities).values({
        ...activity,
        currency: "INR",
      });
      console.log(`✓ Added: ${activity.name}`);
    }
    console.log(`\n✅ Successfully seeded ${karnatakActivities.length} activities!`);
  } catch (error) {
    console.error("Error seeding activities:", error);
    process.exit(1);
  }
}

seedActivities();

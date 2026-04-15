import { drizzle } from "drizzle-orm/mysql2";
import { countries } from "./drizzle/schema.js";
import mysql from "mysql2/promise.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Parse the DATABASE_URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
};

async function seedCountries() {
  try {
    const connection = await mysql.createConnection(config);
    const db = drizzle(connection);

    const countryList = [
      { name: "India", slug: "india", description: "Discover the vibrant culture, ancient temples, and diverse landscapes of India" },
      { name: "Thailand", slug: "thailand", description: "Experience the golden temples, tropical beaches, and warm hospitality of Thailand" },
      { name: "Nepal", slug: "nepal", description: "Trek through the Himalayas and explore the spiritual heart of Nepal" },
      { name: "Sri Lanka", slug: "sri-lanka", description: "Relax on pristine beaches and explore the ancient ruins of Sri Lanka" },
      { name: "Vietnam", slug: "vietnam", description: "Journey through the emerald waters of Halong Bay and vibrant cities of Vietnam" },
      { name: "Cambodia", slug: "cambodia", description: "Discover the magnificent temples of Angkor Wat in Cambodia" },
      { name: "Laos", slug: "laos", description: "Experience the serene landscapes and Buddhist culture of Laos" },
      { name: "Indonesia", slug: "indonesia", description: "Explore the tropical islands and ancient temples of Indonesia" },
      { name: "Malaysia", slug: "malaysia", description: "Discover the modern cities and natural wonders of Malaysia" },
      { name: "Philippines", slug: "philippines", description: "Relax on beautiful islands and experience Filipino hospitality" },
      { name: "Japan", slug: "japan", description: "Experience the blend of ancient traditions and modern technology in Japan" },
      { name: "South Korea", slug: "south-korea", description: "Discover the vibrant culture and stunning landscapes of South Korea" },
      { name: "China", slug: "china", description: "Explore the Great Wall, ancient temples, and modern cities of China" },
      { name: "Myanmar", slug: "myanmar", description: "Discover the golden pagodas and warm culture of Myanmar" },
      { name: "Bangladesh", slug: "bangladesh", description: "Experience the rivers, tea gardens, and cultural heritage of Bangladesh" },
    ];

    console.log("Seeding countries...");
    
    for (const country of countryList) {
      try {
        await db.insert(countries).values(country);
        console.log(`✓ Added country: ${country.name}`);
      } catch (error) {
        // Ignore duplicate key errors
        if (error && error.code === "ER_DUP_ENTRY") {
          console.log(`- Country already exists: ${country.name}`);
        } else {
          console.error(`✗ Error adding ${country.name}:`, error.message);
        }
      }
    }

    console.log("✓ Countries seeding completed!");
    await connection.end();
  } catch (error) {
    console.error("Error seeding countries:", error);
    process.exit(1);
  }
}

seedCountries();

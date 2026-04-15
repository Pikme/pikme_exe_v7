import { getDb } from './server/db';
import { countries } from './drizzle/schema';

async function check() {
  try {
    const db = await getDb();
    if (!db) {
      console.log('Database connection failed');
      return;
    }
    const allCountries = await db.select().from(countries).limit(5);
    console.log('Countries in DB:', JSON.stringify(allCountries, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

check();

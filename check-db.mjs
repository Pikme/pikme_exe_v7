import { getDb } from './server/db.ts';
import { countries } from './drizzle/schema.ts';

async function check() {
  const db = await getDb();
  const allCountries = await db.select().from(countries).limit(5);
  console.log('Countries in DB:', JSON.stringify(allCountries, null, 2));
}

check().catch(console.error);

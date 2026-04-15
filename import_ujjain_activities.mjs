import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { activities } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);
const csvFile = '/home/ubuntu/upload/ujjain_activities_CORRECTED.csv';

async function importActivities() {
  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] ? values[idx].trim() : '';
    });
    rows.push(row);
  }
  
  console.log(`Read ${rows.length} rows from CSV`);
  
  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(row => ({
      locationId: parseInt(row.locationId) || 1,
      tourId: row.tourId ? parseInt(row.tourId) : null,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.category,
      duration: row.duration,
      price: row.price ? parseFloat(row.price) : null,
      currency: row.currency || 'INR',
      image: row.image,
      difficulty: row.difficulty || 'easy',
      bestTime: row.bestTime,
    }));
    
    try {
      await db.insert(activities).values(batch);
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${rows.length} activities`);
    } catch (err) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, err.message);
    }
  }
  
  console.log(`Import complete! Total inserted: ${inserted}`);
}

importActivities().catch(console.error).finally(() => process.exit(0));

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { getDb } from './server/db.ts';

async function bulkImportActivities() {
  try {
    const csvPath = '/home/ubuntu/upload/ujjain_activities_LOCATION_CORRECTED.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📊 Total records to import: ${records.length}`);
    
    // Get database connection
    const db = await getDb();
    if (!db) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Batch insert
    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100);
      
      for (const record of batch) {
        try {
          // Parse numeric fields
          const locationId = parseInt(record.locationId) || 1;
          const tourId = record.tourId ? parseInt(record.tourId) : null;
          const price = record.price ? parseFloat(record.price) : null;

          // Insert activity
          await db.insert(activities).values({
            locationId,
            tourId,
            name: record.name,
            slug: record.slug,
            description: record.description || null,
            category: record.category || null,
            duration: record.duration || null,
            price,
            currency: record.currency || 'INR',
            image: record.image || null,
            difficulty: record.difficulty || 'easy',
            bestTime: record.bestTime || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push({
            row: i + batch.indexOf(record) + 2,
            name: record.name,
            error: err.message,
          });
        }
      }
      
      console.log(`✅ Processed ${Math.min(i + 100, records.length)}/${records.length} records`);
    }

    console.log(`\n📈 Import Summary:`);
    console.log(`✅ Successfully imported: ${successCount} activities`);
    console.log(`❌ Failed: ${errorCount} activities`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ Errors (first 10):`);
      errors.slice(0, 10).forEach(err => {
        console.log(`  Row ${err.row}: ${err.name} - ${err.error}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

bulkImportActivities();

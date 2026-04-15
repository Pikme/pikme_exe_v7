import mysql from 'mysql2/promise';

// Database connection
const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'pikme',
});

try {
  // Get all countries without states
  const [countriesWithoutStates] = await connection.execute(
    `SELECT c.id, c.name, c.code, c.slug FROM countries c 
     LEFT JOIN states s ON c.id = s.countryId 
     WHERE s.id IS NULL 
     GROUP BY c.id, c.name, c.code, c.slug 
     ORDER BY c.name`
  );

  console.log(`Found ${countriesWithoutStates.length} countries without states/locations`);

  let insertedCount = 0;

  for (const country of countriesWithoutStates) {
    // Create a default state for each country
    const stateSlug = `${country.slug}-state`;
    
    try {
      const [stateResult] = await connection.execute(
        `INSERT INTO states (countryId, name, slug, description, metaTitle, metaDescription, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          country.id,
          country.name,
          stateSlug,
          `Explore the best destinations in ${country.name}`,
          `${country.name} - Travel Guide`,
          `Discover amazing tours and destinations in ${country.name}`,
        ]
      );

      const stateId = stateResult.insertId;

      // Create a default location for each state
      const locationSlug = `${country.slug}-main`;
      
      await connection.execute(
        `INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          stateId,
          country.name,
          locationSlug,
          `Discover the best tours and experiences in ${country.name}`,
          `${country.name} Tours & Travel`,
          `Explore amazing destinations and activities in ${country.name}`,
        ]
      );

      insertedCount++;
      console.log(`✓ Added state and location for ${country.name}`);
    } catch (error) {
      console.error(`✗ Error adding data for ${country.name}:`, error.message);
    }
  }

  console.log(`\n✓ Successfully populated ${insertedCount} countries with default states and locations`);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await connection.end();
}

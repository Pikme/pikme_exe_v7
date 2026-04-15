import { db } from './server/db.ts';

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data population...');

    // Get India country (assuming it exists with ID 1)
    const indiaId = 1;

    // Sample states with cities
    const statesData = [
      {
        name: 'Maharashtra',
        slug: 'maharashtra',
        metaTitle: 'Maharashtra Tours - Explore India\'s Most Vibrant State',
        metaDescription: 'Discover the best tours and travel packages in Maharashtra, from Mumbai to Pune and beyond.',
        metaKeywords: 'Maharashtra tours, Mumbai tourism, Pune travel, Maharashtra packages',
        cities: [
          { name: 'Mumbai', slug: 'mumbai', metaTitle: 'Mumbai Tours', metaDescription: 'Explore the City of Dreams' },
          { name: 'Pune', slug: 'pune', metaTitle: 'Pune Tours', metaDescription: 'Discover the cultural capital' },
          { name: 'Aurangabad', slug: 'aurangabad', metaTitle: 'Aurangabad Tours', metaDescription: 'Gateway to Ajanta and Ellora' },
        ]
      },
      {
        name: 'Kerala',
        slug: 'kerala',
        metaTitle: 'Kerala Tours - God\'s Own Country',
        metaDescription: 'Experience the backwaters, beaches, and spice plantations of Kerala.',
        metaKeywords: 'Kerala tours, backwater cruises, Kochi travel, Kerala packages',
        cities: [
          { name: 'Kochi', slug: 'kochi', metaTitle: 'Kochi Tours', metaDescription: 'Explore the spice trade capital' },
          { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', metaTitle: 'Thiruvananthapuram Tours', metaDescription: 'The capital city' },
          { name: 'Munnar', slug: 'munnar', metaTitle: 'Munnar Tours', metaDescription: 'Tea plantations and misty hills' },
          { name: 'Alleppey', slug: 'alleppey', metaTitle: 'Alleppey Tours', metaDescription: 'Backwater paradise' },
        ]
      },
      {
        name: 'Tamil Nadu',
        slug: 'tamil-nadu',
        metaTitle: 'Tamil Nadu Tours - South Indian Heritage',
        metaDescription: 'Discover ancient temples, beaches, and cultural heritage of Tamil Nadu.',
        metaKeywords: 'Tamil Nadu tours, Chennai travel, Madurai temples, Tamil Nadu packages',
        cities: [
          { name: 'Chennai', slug: 'chennai', metaTitle: 'Chennai Tours', metaDescription: 'The capital city' },
          { name: 'Madurai', slug: 'madurai', metaTitle: 'Madurai Tours', metaDescription: 'Temple city of South India' },
          { name: 'Ooty', slug: 'ooty', metaTitle: 'Ooty Tours', metaDescription: 'Queen of hill stations' },
          { name: 'Kanyakumari', slug: 'kanyakumari', metaTitle: 'Kanyakumari Tours', metaDescription: 'Land\'s end of India' },
        ]
      },
      {
        name: 'Goa',
        slug: 'goa',
        metaTitle: 'Goa Tours - Beaches & Culture',
        metaDescription: 'Relax on pristine beaches, explore Portuguese heritage, and enjoy Goa\'s vibrant nightlife.',
        metaKeywords: 'Goa tours, beach holidays, Goa travel, Goa packages',
        cities: [
          { name: 'Panaji', slug: 'panaji', metaTitle: 'Panaji Tours', metaDescription: 'The capital city' },
          { name: 'Calangute', slug: 'calangute', metaTitle: 'Calangute Tours', metaDescription: 'Popular beach destination' },
          { name: 'Baga', slug: 'baga', metaTitle: 'Baga Tours', metaDescription: 'Beach and nightlife hub' },
        ]
      },
      {
        name: 'Rajasthan',
        slug: 'rajasthan',
        metaTitle: 'Rajasthan Tours - Land of Kings',
        metaDescription: 'Experience the royal heritage, desert landscapes, and vibrant culture of Rajasthan.',
        metaKeywords: 'Rajasthan tours, Jaipur travel, Udaipur packages, desert safari',
        cities: [
          { name: 'Jaipur', slug: 'jaipur', metaTitle: 'Jaipur Tours', metaDescription: 'The Pink City' },
          { name: 'Udaipur', slug: 'udaipur', metaTitle: 'Udaipur Tours', metaDescription: 'City of Lakes' },
          { name: 'Jodhpur', slug: 'jodhpur', metaTitle: 'Jodhpur Tours', metaDescription: 'The Blue City' },
          { name: 'Jaisalmer', slug: 'jaisalmer', metaTitle: 'Jaisalmer Tours', metaDescription: 'Golden city of desert' },
        ]
      },
      {
        name: 'Karnataka',
        slug: 'karnataka',
        metaTitle: 'Karnataka Tours - Coffee Country',
        metaDescription: 'Explore coffee plantations, temples, and beaches of Karnataka.',
        metaKeywords: 'Karnataka tours, Bangalore travel, Coorg packages, Mysore tourism',
        cities: [
          { name: 'Bangalore', slug: 'bangalore', metaTitle: 'Bangalore Tours', metaDescription: 'The IT capital' },
          { name: 'Mysore', slug: 'mysore', metaTitle: 'Mysore Tours', metaDescription: 'City of Palaces' },
          { name: 'Coorg', slug: 'coorg', metaTitle: 'Coorg Tours', metaDescription: 'Coffee plantation paradise' },
          { name: 'Gokarna', slug: 'gokarna', metaTitle: 'Gokarna Tours', metaDescription: 'Beach and spiritual hub' },
        ]
      }
    ];

    // Seed states and cities
    for (const stateData of statesData) {
      console.log(`\n📍 Creating state: ${stateData.name}`);
      
      const state = await db.createState({
        countryId: indiaId,
        name: stateData.name,
        slug: stateData.slug,
        description: `Explore the beautiful state of ${stateData.name}`,
        metaTitle: stateData.metaTitle,
        metaDescription: stateData.metaDescription,
        metaKeywords: stateData.metaKeywords,
      });

      console.log(`✅ State created: ${state.name} (ID: ${state.id})`);

      // Create cities for this state
      for (const cityData of stateData.cities) {
        const city = await db.createLocation({
          stateId: state.id,
          name: cityData.name,
          slug: cityData.slug,
          description: `Discover ${cityData.name}, a wonderful destination in ${stateData.name}`,
          metaTitle: cityData.metaTitle,
          metaDescription: cityData.metaDescription,
          metaKeywords: `${cityData.name} tours, ${cityData.name} travel, ${cityData.name} packages`,
        });

        console.log(`  ✅ City created: ${city.name} (ID: ${city.id})`);
      }
    }

    console.log('\n🎉 Seed data population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - States created: ${statesData.length}`);
    console.log(`   - Cities created: ${statesData.reduce((sum, s) => sum + s.cities.length, 0)}`);
    console.log('\n🚀 You can now test the hierarchical filtering in the admin panel!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed script
seedData().then(() => {
  console.log('\n✨ Seed script finished. Exiting...');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

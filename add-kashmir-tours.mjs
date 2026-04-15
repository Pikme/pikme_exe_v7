import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'pikme',
});

const kashimirTours = [
  {
    name: 'Srinagar Paradise Tour',
    slug: 'srinagar-paradise-tour',
    description: 'Experience the beauty of Srinagar with houseboat stays on Dal Lake, Mughal gardens, and local markets.',
    duration: 4,
    price: 15000,
    category: 'Cultural',
    location: 'Srinagar, Kashmir',
    image: 'https://images.pexels.com/photos/3408356/pexels-photo-3408356.jpeg',
    rating: 4.5,
    reviews: 45,
    highlights: ['Dal Lake Houseboat', 'Mughal Gardens', 'Local Markets', 'Shikaras'],
    itinerary: 'Day 1: Arrival in Srinagar, houseboat check-in. Day 2: Mughal Gardens tour. Day 3: Dal Lake Shikara ride. Day 4: Shopping and departure.',
    inclusions: ['Accommodation', 'Meals', 'Shikara rides', 'Garden tours'],
    exclusions: ['Flights', 'Personal expenses'],
    best_time: 'April to October',
    difficulty: 'Easy',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
  {
    name: 'Gulmarg Adventure Expedition',
    slug: 'gulmarg-adventure-expedition',
    description: 'Adventure seekers paradise with skiing, trekking, and alpine meadows in Gulmarg.',
    duration: 5,
    price: 22000,
    category: 'Adventure',
    location: 'Gulmarg, Kashmir',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    rating: 4.7,
    reviews: 62,
    highlights: ['Skiing', 'Alpine Meadows', 'Trekking', 'Gondola rides'],
    itinerary: 'Day 1: Arrival in Gulmarg. Day 2-4: Adventure activities. Day 5: Departure.',
    inclusions: ['Accommodation', 'Meals', 'Equipment rental', 'Guide services'],
    exclusions: ['Flights', 'Insurance'],
    best_time: 'December to March (Skiing), June to September (Trekking)',
    difficulty: 'Moderate',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
  {
    name: 'Pahalgam Trekking Trail',
    slug: 'pahalgam-trekking-trail',
    description: 'Scenic trekking routes through forests and meadows in the beautiful Pahalgam valley.',
    duration: 6,
    price: 18000,
    category: 'Trekking',
    location: 'Pahalgam, Kashmir',
    image: 'https://images.pexels.com/photos/3915857/pexels-photo-3915857.jpeg',
    rating: 4.6,
    reviews: 38,
    highlights: ['Forest trekking', 'Meadows', 'River valleys', 'Wildlife viewing'],
    itinerary: 'Day 1: Arrival. Day 2-5: Trekking. Day 6: Return and departure.',
    inclusions: ['Accommodation', 'Meals', 'Guide', 'Equipment'],
    exclusions: ['Flights', 'Personal gear'],
    best_time: 'May to October',
    difficulty: 'Moderate',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
  {
    name: 'Leh Ladakh Spiritual Journey',
    slug: 'leh-ladakh-spiritual-journey',
    description: 'Explore ancient monasteries, high-altitude passes, and spiritual centers in Leh Ladakh.',
    duration: 7,
    price: 28000,
    category: 'Spiritual',
    location: 'Leh, Ladakh',
    image: 'https://images.pexels.com/photos/3532557/pexels-photo-3532557.jpeg',
    rating: 4.8,
    reviews: 71,
    highlights: ['Monasteries', 'High passes', 'Spiritual sites', 'Local culture'],
    itinerary: 'Day 1: Arrival in Leh. Day 2-6: Monastery tours and sightseeing. Day 7: Departure.',
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide services'],
    exclusions: ['Flights', 'Travel insurance'],
    best_time: 'June to September',
    difficulty: 'Moderate',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
  {
    name: 'Sonamarg Alpine Escape',
    slug: 'sonamarg-alpine-escape',
    description: 'Enjoy pristine alpine meadows, glacier views, and mountain activities in Sonamarg.',
    duration: 3,
    price: 12000,
    category: 'Nature',
    location: 'Sonamarg, Kashmir',
    image: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg',
    rating: 4.4,
    reviews: 29,
    highlights: ['Alpine meadows', 'Glacier views', 'Horse riding', 'Photography'],
    itinerary: 'Day 1: Arrival. Day 2: Meadow exploration. Day 3: Departure.',
    inclusions: ['Accommodation', 'Meals', 'Horse riding', 'Guide'],
    exclusions: ['Flights', 'Personal expenses'],
    best_time: 'June to August',
    difficulty: 'Easy',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
  {
    name: 'Vaishno Devi Pilgrimage',
    slug: 'vaishno-devi-pilgrimage',
    description: 'Sacred pilgrimage to the holy Vaishno Devi temple with guided trekking and spiritual experiences.',
    duration: 4,
    price: 8000,
    category: 'Spiritual',
    location: 'Katra, Jammu',
    image: 'https://images.pexels.com/photos/3532560/pexels-photo-3532560.jpeg',
    rating: 4.9,
    reviews: 156,
    highlights: ['Temple trek', 'Spiritual experience', 'Local guides', 'Accommodation'],
    itinerary: 'Day 1: Arrival in Katra. Day 2: Trek to temple. Day 3: Temple darshan. Day 4: Return.',
    inclusions: ['Accommodation', 'Meals', 'Guide', 'Pony service'],
    exclusions: ['Flights', 'Personal items'],
    best_time: 'Year-round',
    difficulty: 'Moderate',
    country: 'India',
    state: 'Jammu & Kashmir',
  },
];

console.log('Adding Kashmir tours to database...');

for (const tour of kashimirTours) {
  const query = `
    INSERT INTO tours (
      name, slug, description, duration, price, category, location, 
      image, rating, reviews, highlights, itinerary, inclusions, 
      exclusions, best_time, difficulty, country, state, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  try {
    await connection.execute(query, [
      tour.name,
      tour.slug,
      tour.description,
      tour.duration,
      tour.price,
      tour.category,
      tour.location,
      tour.image,
      tour.rating,
      tour.reviews,
      JSON.stringify(tour.highlights),
      tour.itinerary,
      JSON.stringify(tour.inclusions),
      JSON.stringify(tour.exclusions),
      tour.best_time,
      tour.difficulty,
      tour.country,
      tour.state,
    ]);
    console.log(`✓ Added: ${tour.name}`);
  } catch (error) {
    console.error(`✗ Error adding ${tour.name}:`, error.message);
  }
}

console.log('Kashmir tours added successfully!');
await connection.end();

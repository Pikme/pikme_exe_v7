// Comprehensive location data with coordinates and descriptions
const locationData = {
  // Africa
  'Zimbabwe': { lat: -19.0154, lng: 29.1549, desc: 'Explore the natural wonders of Zimbabwe, home to Victoria Falls, wildlife safaris, and rich cultural heritage.' },
  'Zambia': { lat: -13.1339, lng: 27.8493, desc: 'Discover Zambia\'s pristine wilderness, featuring Victoria Falls, the Zambezi River, and abundant wildlife.' },
  'Egypt': { lat: 26.8206, lng: 30.8025, desc: 'Experience ancient Egypt with iconic pyramids, temples, and the Nile River.' },
  'Kenya': { lat: -0.0236, lng: 37.9062, desc: 'Witness the great migration and explore Kenya\'s diverse landscapes and wildlife.' },
  'South Africa': { lat: -30.5595, lng: 22.9375, desc: 'Discover South Africa\'s stunning coastlines, mountains, and world-class safari experiences.' },
  'Tanzania': { lat: -6.3690, lng: 34.8888, desc: 'Climb Mount Kilimanjaro and explore the Serengeti National Park.' },
  'Uganda': { lat: 1.3733, lng: 32.2903, desc: 'Trek with mountain gorillas and explore Uganda\'s lush landscapes.' },
  'Rwanda': { lat: -1.9536, lng: 29.8739, desc: 'Visit the land of a thousand hills and encounter endangered mountain gorillas.' },
  'Botswana': { lat: -22.3285, lng: 24.6849, desc: 'Explore the Okavango Delta and Kalahari Desert in Botswana.' },
  'Namibia': { lat: -22.9375, lng: 18.6753, desc: 'Experience dramatic desert landscapes and unique wildlife in Namibia.' },

  // Asia
  'India': { lat: 20.5937, lng: 78.9629, desc: 'Discover India\'s diverse culture, ancient temples, and vibrant traditions.' },
  'Thailand': { lat: 15.8700, lng: 100.9925, desc: 'Experience Thailand\'s golden temples, pristine beaches, and warm hospitality.' },
  'Vietnam': { lat: 14.0583, lng: 108.2772, desc: 'Explore Vietnam\'s stunning landscapes from Ha Long Bay to the Mekong Delta.' },
  'Cambodia': { lat: 12.5657, lng: 104.9910, desc: 'Visit the magnificent temples of Angkor and explore Cambodia\'s rich heritage.' },
  'Laos': { lat: 19.8523, lng: 102.4955, desc: 'Discover Laos\'s serene temples, waterfalls, and peaceful riverside towns.' },
  'Indonesia': { lat: -0.7893, lng: 113.9213, desc: 'Explore Indonesia\'s diverse islands, from Bali beaches to Komodo dragons.' },
  'Philippines': { lat: 12.8797, lng: 121.7740, desc: 'Discover the Philippines\' tropical islands, pristine beaches, and warm culture.' },
  'Malaysia': { lat: 4.2105, lng: 101.6964, desc: 'Experience Malaysia\'s blend of modern cities and natural wonders.' },
  'Singapore': { lat: 1.3521, lng: 103.8198, desc: 'Explore Singapore\'s modern attractions, diverse culture, and culinary delights.' },
  'Japan': { lat: 36.2048, lng: 138.2529, desc: 'Experience Japan\'s ancient temples, modern technology, and natural beauty.' },
  'South Korea': { lat: 35.9078, lng: 127.7669, desc: 'Discover South Korea\'s vibrant cities, temples, and beautiful mountains.' },
  'China': { lat: 35.8617, lng: 104.1954, desc: 'Explore China\'s Great Wall, ancient temples, and diverse landscapes.' },
  'Nepal': { lat: 28.3949, lng: 84.1240, desc: 'Trek to Everest Base Camp and explore Nepal\'s Himalayan beauty.' },
  'Bhutan': { lat: 27.5142, lng: 90.4336, desc: 'Discover Bhutan\'s pristine mountains, monasteries, and unique culture.' },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718, desc: 'Experience Sri Lanka\'s tea plantations, ancient temples, and tropical beaches.' },
  'Pakistan': { lat: 30.3753, lng: 69.3451, desc: 'Explore Pakistan\'s stunning mountain ranges and ancient cultural sites.' },
  'Bangladesh': { lat: 23.6850, lng: 90.3563, desc: 'Discover Bangladesh\'s rivers, temples, and vibrant culture.' },

  // Europe
  'France': { lat: 46.2276, lng: 2.2137, desc: 'Experience the romance of Paris, the vineyards of Bordeaux, and the French Riviera.' },
  'Italy': { lat: 41.8719, lng: 12.5674, desc: 'Explore Italy\'s historic cities, Renaissance art, and Mediterranean coastlines.' },
  'Spain': { lat: 40.4637, lng: -3.7492, desc: 'Discover Spain\'s vibrant culture, stunning architecture, and beautiful beaches.' },
  'Germany': { lat: 51.1657, lng: 10.4515, desc: 'Experience Germany\'s historic cities, castles, and Bavarian landscapes.' },
  'United Kingdom': { lat: 55.3781, lng: -3.4360, desc: 'Explore the UK\'s historic landmarks, royal palaces, and charming countryside.' },
  'Switzerland': { lat: 46.8182, lng: 8.2275, desc: 'Discover Switzerland\'s Alpine mountains, pristine lakes, and charming villages.' },
  'Austria': { lat: 47.5162, lng: 14.5501, desc: 'Experience Austria\'s imperial palaces, Alpine scenery, and classical music heritage.' },
  'Greece': { lat: 39.0742, lng: 21.8243, desc: 'Explore Greece\'s ancient ruins, Mediterranean islands, and historic sites.' },
  'Portugal': { lat: 39.3999, lng: -8.2245, desc: 'Discover Portugal\'s coastal beauty, historic cities, and wine regions.' },
  'Netherlands': { lat: 52.1326, lng: 5.2913, desc: 'Experience the Netherlands\' canals, windmills, and vibrant cities.' },
  'Belgium': { lat: 50.5039, lng: 4.4699, desc: 'Explore Belgium\'s medieval cities, chocolate, and historic landmarks.' },
  'Poland': { lat: 51.9194, lng: 19.1451, desc: 'Discover Poland\'s historic cities, castles, and cultural heritage.' },
  'Czech Republic': { lat: 49.8175, lng: 15.4730, desc: 'Experience Czech Republic\'s Prague castles, beer culture, and medieval towns.' },
  'Hungary': { lat: 47.1625, lng: 19.5033, desc: 'Explore Hungary\'s thermal baths, Danube River, and historic architecture.' },
  'Romania': { lat: 45.9432, lng: 24.9668, desc: 'Discover Romania\'s Carpathian mountains, medieval towns, and Dracula\'s castle.' },
  'Croatia': { lat: 45.1000, lng: 15.2, desc: 'Explore Croatia\'s Adriatic coast, ancient cities, and stunning national parks.' },
  'Iceland': { lat: 64.9631, lng: -19.0208, desc: 'Experience Iceland\'s geysers, waterfalls, glaciers, and Northern Lights.' },
  'Norway': { lat: 60.4720, lng: 8.4689, desc: 'Discover Norway\'s fjords, mountains, and Arctic wilderness.' },
  'Sweden': { lat: 60.1282, lng: 18.6435, desc: 'Explore Sweden\'s Stockholm archipelago, forests, and Northern Lights.' },
  'Finland': { lat: 61.9241, lng: 25.7482, desc: 'Experience Finland\'s lakes, forests, and the magical Northern Lights.' },
  'Russia': { lat: 61.5240, lng: 105.3188, desc: 'Discover Russia\'s vast landscapes, historic cities, and cultural treasures.' },
  'Vatican City': { lat: 41.9029, lng: 12.4534, desc: 'Visit Vatican City, the spiritual center of Catholicism with St. Peter\'s Basilica.' },
  'Ireland': { lat: 53.4129, lng: -8.2439, desc: 'Explore Ireland\'s green landscapes, ancient ruins, and vibrant culture.' },
  'Scotland': { lat: 56.4907, lng: -4.2026, desc: 'Discover Scotland\'s Highlands, lochs, and historic castles.' },
  'Wales': { lat: 52.3555, lng: -3.4787, desc: 'Experience Wales\' mountains, castles, and dramatic coastlines.' },

  // Americas
  'United States': { lat: 37.0902, lng: -95.7129, desc: 'Explore the USA\'s diverse landscapes from Yellowstone to the Grand Canyon.' },
  'Canada': { lat: 56.1304, lng: -106.3468, desc: 'Discover Canada\'s Niagara Falls, Rocky Mountains, and vast wilderness.' },
  'Mexico': { lat: 23.6345, lng: -102.5528, desc: 'Experience Mexico\'s ancient ruins, beaches, and vibrant culture.' },
  'Brazil': { lat: -14.2350, lng: -51.9253, desc: 'Explore Brazil\'s Amazon rainforest, Christ the Redeemer, and beautiful beaches.' },
  'Argentina': { lat: -38.4161, lng: -63.6167, desc: 'Discover Argentina\'s Patagonia, tango culture, and wine regions.' },
  'Chile': { lat: -35.6751, lng: -71.5430, desc: 'Experience Chile\'s Atacama Desert, Patagonia, and Easter Island.' },
  'Peru': { lat: -9.1900, lng: -75.0152, desc: 'Visit Machu Picchu and explore Peru\'s ancient Incan heritage.' },
  'Colombia': { lat: 4.5709, lng: -74.2973, desc: 'Discover Colombia\'s coffee region, Amazon rainforest, and vibrant cities.' },
  'Ecuador': { lat: -1.8312, lng: -78.1834, desc: 'Explore Ecuador\'s Galapagos Islands, Amazon, and Andean mountains.' },
  'Bolivia': { lat: -16.2902, lng: -63.5887, desc: 'Experience Bolivia\'s salt flats, Lake Titicaca, and Amazon rainforest.' },
  'Venezuela': { lat: 6.4238, lng: -66.5897, desc: 'Discover Venezuela\'s Angel Falls and Caribbean beaches.' },
  'Costa Rica': { lat: 9.7489, lng: -83.7534, desc: 'Experience Costa Rica\'s rainforests, volcanoes, and biodiversity.' },
  'Panama': { lat: 8.5380, lng: -80.7821, desc: 'Explore Panama\'s canal, rainforests, and Caribbean islands.' },
  'Jamaica': { lat: 18.1096, lng: -77.2975, desc: 'Discover Jamaica\'s beaches, reggae culture, and tropical beauty.' },
  'Cuba': { lat: 21.5218, lng: -77.7812, desc: 'Experience Cuba\'s colonial cities, beaches, and vibrant culture.' },

  // Oceania
  'Australia': { lat: -25.2744, lng: 133.7751, desc: 'Explore Australia\'s Great Barrier Reef, Outback, and iconic landmarks.' },
  'New Zealand': { lat: -40.9006, lng: 174.8860, desc: 'Discover New Zealand\'s fjords, mountains, and adventure activities.' },
  'Fiji': { lat: -17.7134, lng: 178.0650, desc: 'Experience Fiji\'s tropical islands, coral reefs, and island culture.' },
  'Samoa': { lat: -13.7590, lng: -172.1046, desc: 'Discover Samoa\'s pristine beaches and Polynesian culture.' },
  'Tonga': { lat: -21.1789, lng: -175.1982, desc: 'Explore Tonga\'s islands and South Pacific beauty.' },
  'Papua New Guinea': { lat: -6.3150, lng: 143.9555, desc: 'Experience Papua New Guinea\'s rainforests and unique tribal cultures.' },

  // Middle East
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478, desc: 'Explore the UAE\'s modern cities, deserts, and luxury experiences.' },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792, desc: 'Discover Saudi Arabia\'s deserts, ancient sites, and Islamic heritage.' },
  'Israel': { lat: 31.0461, lng: 34.8516, desc: 'Experience Israel\'s holy sites, deserts, and Mediterranean coast.' },
  'Jordan': { lat: 30.5852, lng: 36.2384, desc: 'Explore Jordan\'s Petra, Dead Sea, and desert landscapes.' },
  'Lebanon': { lat: 33.8547, lng: 35.8623, desc: 'Discover Lebanon\'s mountains, ancient ruins, and Mediterranean beauty.' },
  'Turkey': { lat: 38.9637, lng: 35.2433, desc: 'Experience Turkey\'s Cappadocia, Istanbul, and Mediterranean coast.' },
  'Iran': { lat: 32.4279, lng: 53.6880, desc: 'Explore Iran\'s Persian architecture, deserts, and ancient sites.' },
  'Iraq': { lat: 33.2232, lng: 43.6793, desc: 'Discover Iraq\'s Mesopotamian heritage and historic sites.' },
  'Kuwait': { lat: 29.3117, lng: 47.4818, desc: 'Experience Kuwait\'s modern cities and desert landscapes.' },
  'Qatar': { lat: 25.3548, lng: 51.1839, desc: 'Explore Qatar\'s modern architecture and desert culture.' },
  'Oman': { lat: 21.4735, lng: 55.9754, desc: 'Discover Oman\'s mountains, beaches, and Arabian culture.' },
  'Yemen': { lat: 15.5527, lng: 48.5164, desc: 'Experience Yemen\'s historic cities and Arabian heritage.' },
};

// SQL update statements
let updateStatements = [];

for (const [country, data] of Object.entries(locationData)) {
  const description = data.desc;
  const latitude = data.lat;
  const longitude = data.lng;
  
  // Escape single quotes in description
  const escapedDesc = description.replace(/'/g, "\\'");
  
  updateStatements.push(
    `UPDATE locations l
     INNER JOIN states s ON l.stateId = s.id
     INNER JOIN countries c ON s.countryId = c.id
     SET l.description = '${escapedDesc}',
         l.latitude = ${latitude},
         l.longitude = ${longitude},
         l.metaDescription = '${escapedDesc}',
         l.updatedAt = NOW()
     WHERE c.name = '${country}';`
  );
}

// Print all update statements
console.log('-- Location Data Enhancement SQL Script');
console.log('-- This script updates all locations with real descriptions and coordinates');
console.log('-- Generated: ' + new Date().toISOString());
console.log('');
console.log(updateStatements.join('\n\n'));
console.log('');
console.log(`-- Total updates: ${updateStatements.length}`);

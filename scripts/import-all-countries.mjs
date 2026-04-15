import 'dotenv/config.js';
import { getDb } from '../server/db.ts';
import { countries, states, locations } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const countriesData = {
  TH: {
    name: 'Thailand',
    provinces: {
      'Bangkok': { cities: ['Bangkok', 'Thonburi', 'Nonthaburi'], desc: 'Capital city with temples, palaces, and vibrant street food' },
      'Chiang Mai': { cities: ['Chiang Mai', 'Chiang Rai', 'Mae Sai', 'Pai'], desc: 'Northern mountains with ancient temples and trekking' },
      'Phuket': { cities: ['Phuket', 'Patong', 'Kata', 'Karon'], desc: 'Tropical island paradise with beaches and water sports' },
      'Krabi': { cities: ['Krabi', 'Ao Nang', 'Railay Beach', 'Phi Phi Islands'], desc: 'Limestone cliffs and pristine beaches' },
      'Pattaya': { cities: ['Pattaya', 'Jomtien', 'Na Jomtien'], desc: 'Coastal city with beaches and entertainment' },
      'Hua Hin': { cities: ['Hua Hin', 'Cha-am', 'Pranburi'], desc: 'Royal seaside resort town' },
      'Koh Samui': { cities: ['Koh Samui', 'Koh Phangan', 'Koh Tao'], desc: 'Island group with beaches and diving' },
      'Sukhothai': { cities: ['Sukhothai', 'Si Satchanalai'], desc: 'Ancient capital with historical temples' },
      'Ayutthaya': { cities: ['Ayutthaya', 'Bang Pa-in'], desc: 'Former capital with temple ruins' },
      'Udon Thani': { cities: ['Udon Thani', 'Nong Khai', 'Loei'], desc: 'Northeast region with Mekong River views' },
      'Nakhon Ratchasima': { cities: ['Nakhon Ratchasima', 'Khao Yai'], desc: 'Gateway to national parks' },
      'Chachoengsao': { cities: ['Chachoengsao', 'Rayong', 'Trat'], desc: 'Eastern provinces with beaches and islands' },
      'Phetchaburi': { cities: ['Phetchaburi', 'Kaeng Krachan'], desc: 'Historic town with caves and waterfalls' },
      'Chumphon': { cities: ['Chumphon', 'Ranong'], desc: 'Southern gateway with diving spots' },
      'Surat Thani': { cities: ['Surat Thani', 'Khao Lak'], desc: 'Gateway to island tours' }
    }
  },
  NP: {
    name: 'Nepal',
    provinces: {
      'Kathmandu': { cities: ['Kathmandu', 'Bhaktapur', 'Panauti'], desc: 'Capital with ancient temples and Durbar Square' },
      'Pokhara': { cities: ['Pokhara', 'Sarangkot', 'Naudanda'], desc: 'Lakeside city with Annapurna views' },
      'Chitwan': { cities: ['Chitwan', 'Bharatpur'], desc: 'National park with wildlife safari' },
      'Janakpur': { cities: ['Janakpur', 'Dhanusa'], desc: 'Sacred pilgrimage site' },
      'Biratnagar': { cities: ['Biratnagar', 'Morang'], desc: 'Eastern industrial city' },
      'Dharan': { cities: ['Dharan', 'Sunsari'], desc: 'Eastern hill station' },
      'Ilam': { cities: ['Ilam', 'Kanyam'], desc: 'Tea gardens and scenic views' },
      'Gorkha': { cities: ['Gorkha', 'Manakamana'], desc: 'Historic town with cable car' },
      'Nuwakot': { cities: ['Nuwakot', 'Trisuli'], desc: 'Historic fortress and river valley' },
      'Namche Bazaar': { cities: ['Namche Bazaar', 'Lukla'], desc: 'Everest region gateway' },
      'Dhulikhel': { cities: ['Dhulikhel', 'Namobuddha'], desc: 'Ancient trading town' }
    }
  },
  LK: {
    name: 'Sri Lanka',
    provinces: {
      'Colombo': { cities: ['Colombo', 'Dehiwala', 'Moratuwa'], desc: 'Capital city with colonial architecture' },
      'Kandy': { cities: ['Kandy', 'Peradeniya'], desc: 'Hill country with sacred temple' },
      'Galle': { cities: ['Galle', 'Mirissa', 'Unawatuna'], desc: 'Coastal town with historic fort' },
      'Nuwara Eliya': { cities: ['Nuwara Eliya', 'Hakgala'], desc: 'Hill station with tea plantations' },
      'Anuradhapura': { cities: ['Anuradhapura', 'Mihintale'], desc: 'Ancient Buddhist capital' },
      'Polonnaruwa': { cities: ['Polonnaruwa'], desc: 'Medieval kingdom ruins' },
      'Jaffna': { cities: ['Jaffna', 'Mullaitivu'], desc: 'Northern peninsula with Hindu temples' },
      'Matara': { cities: ['Matara', 'Dondra'], desc: 'Southern coastal town' },
      'Trincomalee': { cities: ['Trincomalee', 'Arugam Bay'], desc: 'Eastern beaches and Hindu temple' },
      'Batticaloa': { cities: ['Batticaloa', 'Kalmunai'], desc: 'Eastern lagoon town' },
      'Ratnapura': { cities: ['Ratnapura'], desc: 'Gem mining town' },
      'Sigiriya': { cities: ['Sigiriya', 'Dambulla'], desc: 'Ancient rock fortress and caves' }
    }
  },
  VN: {
    name: 'Vietnam',
    provinces: {
      'Hanoi': { cities: ['Hanoi', 'Ha Dong', 'Thanh Tri'], desc: 'Capital with French colonial architecture' },
      'Ho Chi Minh City': { cities: ['Ho Chi Minh City', 'Thu Duc', 'Binh Thanh'], desc: 'Largest city with vibrant culture' },
      'Da Nang': { cities: ['Da Nang', 'Hoi An', 'My Khe'], desc: 'Central coast with ancient town' },
      'Halong Bay': { cities: ['Halong', 'Cat Ba', 'Bai Chay'], desc: 'UNESCO limestone karsts and bay' },
      'Sapa': { cities: ['Sapa', 'Lao Cai'], desc: 'Mountain town with ethnic minorities' },
      'Hue': { cities: ['Hue', 'Phu Loc'], desc: 'Imperial city with citadel' },
      'Nha Trang': { cities: ['Nha Trang', 'Cam Ranh'], desc: 'Coastal resort with beaches' },
      'Da Lat': { cities: ['Da Lat', 'Thap Cham'], desc: 'Hill station with waterfalls' },
      'Can Tho': { cities: ['Can Tho', 'Vinh Long'], desc: 'Mekong Delta city' },
      'Phu Quoc': { cities: ['Phu Quoc', 'Duong Dong'], desc: 'Island paradise with beaches' },
      'Mekong Delta': { cities: ['My Tho', 'Ben Tre', 'Tra Vinh'], desc: 'River delta with floating markets' },
      'Ninh Binh': { cities: ['Ninh Binh', 'Tam Coc'], desc: 'Karst landscape and ancient capital' },
      'Hoi An': { cities: ['Hoi An', 'Cam Thanh'], desc: 'Ancient trading town with lanterns' }
    }
  },
  KH: {
    name: 'Cambodia',
    provinces: {
      'Phnom Penh': { cities: ['Phnom Penh', 'Chroy Changvar'], desc: 'Capital with royal palace and temples' },
      'Siem Reap': { cities: ['Siem Reap', 'Puok', 'Kralanh'], desc: 'Gateway to Angkor temples' },
      'Sihanoukville': { cities: ['Sihanoukville', 'Kampong Som'], desc: 'Coastal resort with beaches' },
      'Battambang': { cities: ['Battambang', 'Sampov Loun'], desc: 'Colonial city with temples' },
      'Kampot': { cities: ['Kampot', 'Kep'], desc: 'Coastal town with pepper plantations' },
      'Mondulkiri': { cities: ['Sen Monorom', 'Koh Nhek'], desc: 'Highland province with waterfalls' },
      'Ratanakiri': { cities: ['Banlung', 'Andoung Meas'], desc: 'Remote province with waterfalls and lakes' },
      'Kratie': { cities: ['Kratie', 'Chhlong'], desc: 'Mekong River town with dolphins' },
      'Kompong Thom': { cities: ['Kompong Thom', 'Stung Saen'], desc: 'Central province with temples' },
      'Kompong Chhnang': { cities: ['Kompong Chhnang'], desc: 'Pottery and silver town' },
      'Takeo': { cities: ['Takeo', 'Angkor Borei'], desc: 'Southern province with temples' },
      'Oddar Meanchey': { cities: ['Samraong'], desc: 'Northern frontier province' }
    }
  },
  LA: {
    name: 'Laos',
    provinces: {
      'Vientiane': { cities: ['Vientiane', 'Sisattanak'], desc: 'Capital with temples and French influence' },
      'Luang Prabang': { cities: ['Luang Prabang', 'Pak Ou'], desc: 'Ancient royal city with temples' },
      'Pakse': { cities: ['Pakse', 'Champasak'], desc: 'Southern city with temple ruins' },
      'Vang Vieng': { cities: ['Vang Vieng', 'Tham Phu Kham'], desc: 'Adventure town with karst landscape' },
      'Savannakhet': { cities: ['Savannakhet', 'Khone Phapheng'], desc: 'Mekong River town' },
      'Xieng Khuang': { cities: ['Phonsavan', 'Plain of Jars'], desc: 'Highland province with archaeological sites' },
      'Oudomxay': { cities: ['Oudomxay', 'Muang Xay'], desc: 'Northern province' },
      'Luang Namtha': { cities: ['Luang Namtha', 'Muang Sing'], desc: 'Northern border town' },
      'Sekong': { cities: ['Sekong'], desc: 'Southern province' },
      'Attapeu': { cities: ['Attapeu'], desc: 'Southern frontier province' },
      'Khammouane': { cities: ['Thakhek', 'Mahaxai'], desc: 'Central province with caves' }
    }
  },
  ID: {
    name: 'Indonesia',
    provinces: {
      'Jakarta': { cities: ['Jakarta', 'Tangerang', 'Bekasi'], desc: 'Capital with modern skyline' },
      'Bali': { cities: ['Denpasar', 'Ubud', 'Seminyak', 'Sanur'], desc: 'Island paradise with temples and beaches' },
      'Yogyakarta': { cities: ['Yogyakarta', 'Sleman'], desc: 'Cultural heart with Borobudur temple' },
      'Surabaya': { cities: ['Surabaya', 'Gresik'], desc: 'East Java city with colonial heritage' },
      'Bandung': { cities: ['Bandung', 'Lembang', 'Tangkuban Perahu'], desc: 'Mountain city with hot springs' },
      'Lombok': { cities: ['Mataram', 'Senggigi', 'Gili Islands'], desc: 'Island with beaches and Gili Islands' },
      'Flores': { cities: ['Labuan Bajo', 'Ruteng', 'Maumere'], desc: 'Island with Komodo dragons' },
      'Sulawesi': { cities: ['Makassar', 'Manado', 'Gorontalo'], desc: 'Eastern islands with diving' },
      'Papua': { cities: ['Jayapura', 'Sorong', 'Wamena'], desc: 'Remote region with indigenous culture' },
      'Sumatra': { cities: ['Medan', 'Palembang', 'Pekanbaru'], desc: 'Western island with nature' },
      'Kalimantan': { cities: ['Banjarmasin', 'Pontianak', 'Samarinda'], desc: 'Borneo island with rainforests' },
      'Riau Islands': { cities: ['Batam', 'Bintan'], desc: 'Island archipelago' },
      'Aceh': { cities: ['Banda Aceh', 'Lhokseumawe'], desc: 'Northern province with history' }
    }
  },
  MY: {
    name: 'Malaysia',
    provinces: {
      'Kuala Lumpur': { cities: ['Kuala Lumpur', 'Petaling Jaya', 'Subang'], desc: 'Capital with Petronas Towers' },
      'Penang': { cities: ['Georgetown', 'Penang Island', 'Batu Ferringhi'], desc: 'Island state with colonial town' },
      'Malacca': { cities: ['Malacca City', 'Ayer Keroh'], desc: 'Historic port city' },
      'Selangor': { cities: ['Shah Alam', 'Klang', 'Putrajaya'], desc: 'Federal territory and state' },
      'Johor': { cities: ['Johor Bahru', 'Desaru', 'Kota Tinggi'], desc: 'Southern state with beaches' },
      'Pahang': { cities: ['Kuantan', 'Pekan', 'Kuala Terengganu'], desc: 'East coast with national parks' },
      'Terengganu': { cities: ['Kuala Terengganu', 'Kota Bharu'], desc: 'East coast beaches' },
      'Kedah': { cities: ['Alor Setar', 'Langkawi'], desc: 'Northern state with island' },
      'Perlis': { cities: ['Kangar', 'Padang Besar'], desc: 'Northernmost state' },
      'Perak': { cities: ['Ipoh', 'Taiping', 'Lumut'], desc: 'Mining state with caves' },
      'Negeri Sembilan': { cities: ['Seremban', 'Port Dickson'], desc: 'Central state' },
      'Sabah': { cities: ['Kota Kinabalu', 'Sandakan', 'Tawau'], desc: 'Borneo state with Mount Kinabalu' },
      'Sarawak': { cities: ['Kuching', 'Sibu', 'Miri'], desc: 'Borneo state with rainforests' }
    }
  },
  PH: {
    name: 'Philippines',
    provinces: {
      'Manila': { cities: ['Manila', 'Quezon City', 'Makati'], desc: 'Capital with Spanish colonial sites' },
      'Cebu': { cities: ['Cebu City', 'Lapu-Lapu', 'Mandaue'], desc: 'Central island with beaches' },
      'Davao': { cities: ['Davao City', 'Toril'], desc: 'Southern city with Mount Apo' },
      'Palawan': { cities: ['Puerto Princesa', 'El Nido', 'Coron'], desc: 'Island paradise with underground river' },
      'Boracay': { cities: ['Boracay', 'Malay'], desc: 'Famous beach island' },
      'Iloilo': { cities: ['Iloilo City', 'Antique'], desc: 'Panay island city' },
      'Bacolod': { cities: ['Bacolod', 'Negros Occidental'], desc: 'Sugar city' },
      'Baguio': { cities: ['Baguio City', 'Benguet'], desc: 'Mountain city with cool climate' },
      'Vigan': { cities: ['Vigan', 'Ilocos Sur'], desc: 'Historic colonial city' },
      'Subic': { cities: ['Subic Bay', 'Zambales'], desc: 'Former US naval base' },
      'Tagaytay': { cities: ['Tagaytay', 'Cavite'], desc: 'Highland city with Taal Volcano views' },
      'Mindoro': { cities: ['Puerto Galera', 'Calapan'], desc: 'Island with beaches and diving' },
      'Siargao': { cities: ['Siargao', 'Surigao del Norte'], desc: 'Surfing island' }
    }
  },
  JP: {
    name: 'Japan',
    provinces: {
      'Tokyo': { cities: ['Tokyo', 'Shinjuku', 'Shibuya', 'Asakusa'], desc: 'Capital with temples and modern culture' },
      'Kyoto': { cities: ['Kyoto', 'Arashiyama', 'Fushimi'], desc: 'Ancient capital with thousands of temples' },
      'Osaka': { cities: ['Osaka', 'Kobe', 'Nara'], desc: 'Commercial hub with castles' },
      'Hiroshima': { cities: ['Hiroshima', 'Miyajima'], desc: 'Peace memorial and floating torii gate' },
      'Nagasaki': { cities: ['Nagasaki', 'Sasebo'], desc: 'Historic port city' },
      'Hokkaido': { cities: ['Sapporo', 'Asahikawa', 'Hakodate'], desc: 'Northern island with skiing' },
      'Fukuoka': { cities: ['Fukuoka', 'Kitakyushu'], desc: 'Southern city gateway' },
      'Nagano': { cities: ['Nagano', 'Matsumoto'], desc: 'Mountain prefecture with skiing' },
      'Takayama': { cities: ['Takayama', 'Kanazawa'], desc: 'Historic mountain town' },
      'Hakone': { cities: ['Hakone', 'Kawaguchiko'], desc: 'Mountain resort with Mount Fuji views' },
      'Nikko': { cities: ['Nikko', 'Yumoto'], desc: 'Mountain town with shrines' },
      'Yokohama': { cities: ['Yokohama', 'Kamakura'], desc: 'Port city near Tokyo' },
      'Okinawa': { cities: ['Naha', 'Okinawa City'], desc: 'Tropical island prefecture' }
    }
  },
  MM: {
    name: 'Myanmar',
    provinces: {
      'Yangon': { cities: ['Yangon', 'Thanlyin', 'Kyaikto'], desc: 'Largest city with golden pagoda' },
      'Mandalay': { cities: ['Mandalay', 'Amarapura', 'Sagaing'], desc: 'Cultural center with temples' },
      'Bagan': { cities: ['Bagan', 'Nyaung U'], desc: 'Ancient city with thousands of temples' },
      'Inle Lake': { cities: ['Nyaungshwe', 'Inle Lake'], desc: 'Mountain lake with floating villages' },
      'Taunggyi': { cities: ['Taunggyi', 'Kalaw'], desc: 'Highland city' },
      'Pindaya': { cities: ['Pindaya', 'Shan State'], desc: 'Cave temple town' },
      'Mawlamyine': { cities: ['Mawlamyine', 'Kyaikto'], desc: 'Mon state city' },
      'Hpa-an': { cities: ['Hpa-an', 'Kayin State'], desc: 'Karst landscape town' },
      'Sittwe': { cities: ['Sittwe', 'Rakhine State'], desc: 'Coastal city' },
      'Myitkyina': { cities: ['Myitkyina', 'Kachin State'], desc: 'Northern frontier city' },
      'Tachileik': { cities: ['Tachileik', 'Shan State'], desc: 'Border town' },
      'Pathein': { cities: ['Pathein', 'Irrawaddy Delta'], desc: 'Delta city' }
    }
  },
  AZ: {
    name: 'Azerbaijan',
    provinces: {
      'Baku': { cities: ['Baku', 'Sumgait', 'Ganja'], desc: 'Capital with oil wealth and modern architecture' },
      'Ganja': { cities: ['Ganja', 'Shamakhi'], desc: 'Second largest city with historic sites' },
      'Shaki': { cities: ['Shaki', 'Lahij'], desc: 'Mountain city with palace' },
      'Lahij': { cities: ['Lahij', 'Ismayilli'], desc: 'Copper crafts village' },
      'Quba': { cities: ['Quba', 'Khinalug'], desc: 'Mountain region with waterfalls' },
      'Gabala': { cities: ['Gabala', 'Altiagin'], desc: 'Mountain resort town' },
      'Shemakha': { cities: ['Shemakha', 'Ismayilli'], desc: 'Historic mountain town' },
      'Lankaran': { cities: ['Lankaran', 'Astara'], desc: 'Coastal city with tea plantations' },
      'Masally': { cities: ['Masally', 'Yardymli'], desc: 'Southern province' },
      'Lerik': { cities: ['Lerik'], desc: 'Highland tea region' },
      'Ordubad': { cities: ['Ordubad', 'Nakhchivan'], desc: 'Exclave with historical sites' },
      'Nakhchivan': { cities: ['Nakhchivan City'], desc: 'Autonomous republic' }
    }
  },
  BH: {
    name: 'Bahrain',
    provinces: {
      'Manama': { cities: ['Manama', 'Al Muharraq', 'Riffa'], desc: 'Capital with souks and mosques' },
      'Al Muharraq': { cities: ['Al Muharraq', 'Arad'], desc: 'Second largest city with pearl diving heritage' },
      'Riffa': { cities: ['Riffa', 'Al Jasra'], desc: 'Inland city' },
      'A\'ali': { cities: ['A\'ali', 'Juffair'], desc: 'Pottery town' },
      'Budaiya': { cities: ['Budaiya', 'Saar'], desc: 'Northern villages' },
      'Zinj': { cities: ['Zinj', 'Diraz'], desc: 'Village areas' },
      'Barbar': { cities: ['Barbar', 'Karbabad'], desc: 'Archaeological site area' },
      'Hawar Islands': { cities: ['Hawar'], desc: 'Southern island group' }
    }
  }
};

async function importCountries() {
  try {
    console.log('[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops');
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    let totalCitiesCreated = 0;
    let totalCitiesUpdated = 0;

    for (const [code, countryData] of Object.entries(countriesData)) {
      // Get or create country
      let countryResult = await db.select().from(countries).where(eq(countries.code, code)).limit(1);
      let country = countryResult.length > 0 ? countryResult[0] : null;

      if (!country) {
        await db.insert(countries).values({
          name: countryData.name,
          code: code
        });
        countryResult = await db.select().from(countries).where(eq(countries.code, code)).limit(1);
        country = countryResult[0];
      }

      // Import states and cities
      for (const [stateName, stateData] of Object.entries(countryData.provinces)) {
        let stateResult = await db.select().from(states).where(eq(states.name, stateName)).limit(1);
        let state = stateResult.length > 0 ? stateResult[0] : null;

        if (!state) {
          const slug = stateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          await db.insert(states).values({
            name: stateName,
            slug: slug,
            countryId: country.id,
            metaTitle: `${stateName} Tours - ${stateData.desc}`,
            metaDescription: `Explore ${stateName}'s attractions. ${stateData.desc}`,
            metaKeywords: `${stateName}, tours, travel`
          });
          stateResult = await db.select().from(states).where(eq(states.name, stateName)).limit(1);
          state = stateResult[0];
        }

        // Import cities
        for (const cityName of stateData.cities) {
          const slug = cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          
          let locationResult = await db.select().from(locations).where(eq(locations.name, cityName)).limit(1);
          let location = locationResult.length > 0 ? locationResult[0] : null;

          if (location) {
            await db.update(locations).set({
              description: `${cityName} is a popular destination in ${stateName}. ${stateData.desc}`
            }).where(eq(locations.id, location.id));
            totalCitiesUpdated++;
          } else {
            await db.insert(locations).values({
              name: cityName,
              slug: slug,
              stateId: state.id,
              description: `${cityName} is a popular destination in ${stateName}. ${stateData.desc}`,
              metaTitle: `${cityName} Tours - ${stateName}`,
              metaDescription: `Discover ${cityName} in ${stateName}. ${stateData.desc}`,
              metaKeywords: `${cityName}, ${stateName}, tours`
            });
            totalCitiesCreated++;
          }
        }
      }

      console.log(`✓ ${countryData.name}: ${Object.values(countryData.provinces).reduce((sum, p) => sum + p.cities.length, 0)} cities`);
    }

    console.log(`✅ Import Complete!`);
    console.log(`Cities Created: ${totalCitiesCreated}`);
    console.log(`Cities Updated: ${totalCitiesUpdated}`);
    console.log(`Total Cities: ${totalCitiesCreated + totalCitiesUpdated}`);

    process.exit(0);
  } catch (error) {
    console.error('Error importing countries:', error);
    process.exit(1);
  }
}

importCountries();

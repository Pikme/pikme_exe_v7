import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const statesAndCitiesData = [
  {
    state: "Andhra Pradesh",
    slug: "andhra-pradesh",
    metaTitle: "Andhra Pradesh Tours - Temples & Heritage",
    metaDescription: "Explore Andhra Pradesh with its ancient temples, beaches, and cultural heritage sites.",
    cities: [
      { name: "Hyderabad", slug: "hyderabad", attractions: "Charminar, Bibi Ka Maqbara, Golconda Fort" },
      { name: "Tirupati", slug: "tirupati", attractions: "Tirupati Temple, Sri Venkateswara Temple" },
      { name: "Visakhapatnam", slug: "visakhapatnam", attractions: "Araku Valley, Kailasagiri, Submarine Museum" },
      { name: "Vijayawada", slug: "vijayawada", attractions: "Kanaka Durga Temple, Undavalli Caves" },
      { name: "Warangal", slug: "warangal", attractions: "Warangal Fort, Thousand Pillar Temple" },
    ],
  },
  {
    state: "Arunachal Pradesh",
    slug: "arunachal-pradesh",
    metaTitle: "Arunachal Pradesh Tours - Northeast Adventure",
    metaDescription: "Discover the pristine beauty of Arunachal Pradesh with mountains, monasteries, and tribal culture.",
    cities: [
      { name: "Itanagar", slug: "itanagar", attractions: "Itanagar Citadel, Ganga Lake, Jawaharlal Nehru Museum" },
      { name: "Tawang", slug: "tawang", attractions: "Tawang Monastery, Sela Pass, Bumla Pass" },
      { name: "Bomdila", slug: "bomdila", attractions: "Bomdila Monastery, Craft Centre" },
      { name: "Pasighat", slug: "pasighat", attractions: "Siang River, Pasighat Adventure Sports" },
    ],
  },
  {
    state: "Assam",
    slug: "assam",
    metaTitle: "Assam Tours - Wildlife & Tea Gardens",
    metaDescription: "Experience Assam's rich wildlife, tea gardens, and cultural heritage.",
    cities: [
      { name: "Guwahati", slug: "guwahati", attractions: "Kamakhya Temple, Assam State Museum" },
      { name: "Kaziranga", slug: "kaziranga", attractions: "Kaziranga National Park, One-horned Rhino" },
      { name: "Darjeeling", slug: "darjeeling", attractions: "Tea Gardens, Toy Train, Tiger Hill" },
      { name: "Silchar", slug: "silchar", attractions: "Barak Valley, Haflong Hill" },
      { name: "Jorhat", slug: "jorhat", attractions: "Tea Gardens, Gibbon Wildlife Sanctuary" },
    ],
  },
  {
    state: "Bihar",
    slug: "bihar",
    metaTitle: "Bihar Tours - Spiritual & Historical",
    metaDescription: "Visit Bihar's sacred sites including Bodh Gaya, Nalanda, and Vaishali.",
    cities: [
      { name: "Bodh Gaya", slug: "bodh-gaya", attractions: "Mahabodhi Temple, Bodhi Tree" },
      { name: "Patna", slug: "patna", attractions: "Patna Museum, Golghar, Har Mandir Sahib" },
      { name: "Nalanda", slug: "nalanda", attractions: "Nalanda University Ruins, Nalanda Museum" },
      { name: "Vaishali", slug: "vaishali", attractions: "Ashoka Pillar, Rajagraha Hill" },
      { name: "Rajgir", slug: "rajgir", attractions: "Griddhakuta Peak, Nalanda, Hot Springs" },
    ],
  },
  {
    state: "Chhattisgarh",
    slug: "chhattisgarh",
    metaTitle: "Chhattisgarh Tours - Tribal Culture & Forests",
    metaDescription: "Explore Chhattisgarh's tribal villages, waterfalls, and ancient temples.",
    cities: [
      { name: "Raipur", slug: "raipur", attractions: "Mahant Ghasidas Museum, Naya Raipur" },
      { name: "Jagdalpur", slug: "jagdalpur", attractions: "Bastar Dussehra, Chitrakoot Falls" },
      { name: "Bilaspur", slug: "bilaspur", attractions: "Achanakmar Wildlife Sanctuary" },
      { name: "Dantewada", slug: "dantewada", attractions: "Danteshwari Temple, Tribal Art" },
    ],
  },
  {
    state: "Goa",
    slug: "goa",
    metaTitle: "Goa Tours - Beaches & Culture",
    metaDescription: "Enjoy Goa's beautiful beaches, Portuguese heritage, and vibrant nightlife.",
    cities: [
      { name: "Panaji", slug: "panaji", attractions: "Basilica of Bom Jesus, Se Cathedral" },
      { name: "Margao", slug: "margao", attractions: "Holy Spirit Church, Margao Market" },
      { name: "Calangute", slug: "calangute", attractions: "Calangute Beach, Water Sports" },
      { name: "Baga", slug: "baga", attractions: "Baga Beach, Tito's Lane" },
      { name: "Palolem", slug: "palolem", attractions: "Palolem Beach, Butterfly Beach" },
    ],
  },
  {
    state: "Gujarat",
    slug: "gujarat",
    metaTitle: "Gujarat Tours - Heritage & Culture",
    metaDescription: "Discover Gujarat's rich heritage, temples, and traditional crafts.",
    cities: [
      { name: "Ahmedabad", slug: "ahmedabad", attractions: "Sabarmati Ashram, Jama Masjid, Textile Museum" },
      { name: "Vadodara", slug: "vadodara", attractions: "Lakshmi Vilas Palace, Champaner-Pavagadh" },
      { name: "Surat", slug: "surat", attractions: "Dumas Beach, Castle Museum" },
      { name: "Rajkot", slug: "rajkot", attractions: "Kaba Gandhi no Delo, Wankaner Palace" },
      { name: "Dwarka", slug: "dwarka", attractions: "Dwarkadhish Temple, Nageshwar Temple" },
      { name: "Somnath", slug: "somnath", attractions: "Somnath Temple, Triveni Beach" },
    ],
  },
  {
    state: "Haryana",
    slug: "haryana",
    metaTitle: "Haryana Tours - Heritage & Adventure",
    metaDescription: "Explore Haryana's historical sites, adventure activities, and cultural attractions.",
    cities: [
      { name: "Chandigarh", slug: "chandigarh", attractions: "Rock Garden, Sukhna Lake, Capitol Complex" },
      { name: "Faridabad", slug: "faridabad", attractions: "Badkhal Lake, Surajkund" },
      { name: "Gurgaon", slug: "gurgaon", attractions: "Kingdom of Dreams, Cyber Hub" },
      { name: "Hisar", slug: "hisar", attractions: "Hisar Fort, Agrasen Baoli" },
    ],
  },
  {
    state: "Himachal Pradesh",
    slug: "himachal-pradesh",
    metaTitle: "Himachal Pradesh Tours - Mountain Adventure",
    metaDescription: "Experience the stunning Himalayas with adventure activities and scenic beauty.",
    cities: [
      { name: "Shimla", slug: "shimla", attractions: "Mall Road, Jakhoo Temple, Ridge" },
      { name: "Manali", slug: "manali", attractions: "Rohtang Pass, Solang Valley, Hadimba Temple" },
      { name: "Dharamshala", slug: "dharamshala", attractions: "Dalai Lama Temple, Triund Trek" },
      { name: "Kullu", slug: "kullu", attractions: "Kullu Valley, Raghunath Temple, Dussehra" },
      { name: "Spiti", slug: "spiti", attractions: "Kaza, Tabo Monastery, Dhankar Lake" },
      { name: "Kinnaur", slug: "kinnaur", attractions: "Kinner Kailash, Kalpa, Sangla Valley" },
    ],
  },
  {
    state: "Jharkhand",
    slug: "jharkhand",
    metaTitle: "Jharkhand Tours - Waterfalls & Tribal Culture",
    metaDescription: "Discover Jharkhand's beautiful waterfalls, tribal villages, and mineral wealth.",
    cities: [
      { name: "Ranchi", slug: "ranchi", attractions: "Jamshedpur, Tagore Hill, Kanke Dam" },
      { name: "Jamshedpur", slug: "jamshedpur", attractions: "Tata Steel Plant, Dimna Lake" },
      { name: "Giridih", slug: "giridih", attractions: "Parasnath Hill, Madhuban" },
      { name: "Hazaribagh", slug: "hazaribagh", attractions: "Hazaribagh Wildlife Sanctuary" },
    ],
  },
  {
    state: "Karnataka",
    slug: "karnataka",
    metaTitle: "Karnataka Tours - Coffee & Culture",
    metaDescription: "Explore Karnataka's coffee plantations, temples, and scenic landscapes.",
    cities: [
      { name: "Bangalore", slug: "bangalore", attractions: "Vidhana Soudha, Lalbagh, Cubbon Park" },
      { name: "Mysore", slug: "mysore", attractions: "Mysore Palace, Chamundeshwari Temple" },
      { name: "Coorg", slug: "coorg", attractions: "Coffee Plantations, Abbey Falls, Madikeri" },
      { name: "Hampi", slug: "hampi", attractions: "Virupaksha Temple, Vittala Temple, Bazaar Street" },
      { name: "Gokarna", slug: "gokarna", attractions: "Gokarna Beach, Mahabaleshwar Temple" },
      { name: "Chikmagalur", slug: "chikmagalur", attractions: "Coffee Estates, Mullayanagiri" },
    ],
  },
  {
    state: "Kerala",
    slug: "kerala",
    metaTitle: "Kerala Tours - God's Own Country",
    metaDescription: "Experience Kerala's backwaters, beaches, and lush green landscapes.",
    cities: [
      { name: "Kochi", slug: "kochi", attractions: "Chinese Fishing Nets, Fort Kochi, Spice Markets" },
      { name: "Thiruvananthapuram", slug: "thiruvananthapuram", attractions: "Padmanabha Swamy Temple, Beaches" },
      { name: "Munnar", slug: "munnar", attractions: "Tea Gardens, Anamudi Peak, Eravikulam" },
      { name: "Alleppey", slug: "alleppey", attractions: "Backwaters, Houseboat Cruises" },
      { name: "Thekkady", slug: "thekkady", attractions: "Periyar Wildlife Sanctuary, Spice Plantations" },
      { name: "Wayanad", slug: "wayanad", attractions: "Wayanad Wildlife Sanctuary, Chembra Peak" },
    ],
  },
  {
    state: "Madhya Pradesh",
    slug: "madhya-pradesh",
    metaTitle: "Madhya Pradesh Tours - Heart of India",
    metaDescription: "Discover Madhya Pradesh's ancient temples, diamond mines, and tribal culture.",
    cities: [
      { name: "Bhopal", slug: "bhopal", attractions: "Taj-ul-Masques, Sanchi Stupa, Upper Lake" },
      { name: "Indore", slug: "indore", attractions: "Rajwada Palace, Lal Baag Palace" },
      { name: "Khajuraho", slug: "khajuraho", attractions: "Khajuraho Temples, Medieval Architecture" },
      { name: "Gwalior", slug: "gwalior", attractions: "Gwalior Fort, Jai Vilas Palace" },
      { name: "Ujjain", slug: "ujjain", attractions: "Mahakaleshwar Temple, Kumbh Mela" },
      { name: "Mandu", slug: "mandu", attractions: "Mandu Fort, Jahaz Mahal" },
    ],
  },
  {
    state: "Maharashtra",
    slug: "maharashtra",
    metaTitle: "Maharashtra Tours - Culture & Beaches",
    metaDescription: "Explore Maharashtra's vibrant culture, beaches, and historical monuments.",
    cities: [
      { name: "Mumbai", slug: "mumbai", attractions: "Gateway of India, Marine Drive, Taj Hotel" },
      { name: "Pune", slug: "pune", attractions: "Aga Khan Palace, Shaniwar Wada" },
      { name: "Aurangabad", slug: "aurangabad", attractions: "Ajanta Caves, Ellora Caves" },
      { name: "Nashik", slug: "nashik", attractions: "Trimbakeshwar Temple, Godavari River" },
      { name: "Kolhapur", slug: "kolhapur", attractions: "Mahalakshmi Temple, Rankala Lake" },
      { name: "Lonavala", slug: "lonavala", attractions: "Bhushi Dam, Karla Caves" },
    ],
  },
  {
    state: "Manipur",
    slug: "manipur",
    metaTitle: "Manipur Tours - Jewel of Northeast",
    metaDescription: "Discover Manipur's pristine lakes, temples, and vibrant tribal culture.",
    cities: [
      { name: "Imphal", slug: "imphal", attractions: "Loktak Lake, Kangla Fort, Shree Govindajee Temple" },
      { name: "Ukhrul", slug: "ukhrul", attractions: "Ukhrul District, Shirui Peak" },
      { name: "Moirang", slug: "moirang", attractions: "Moirang Manipuri Sahitya Parishat" },
    ],
  },
  {
    state: "Meghalaya",
    slug: "meghalaya",
    metaTitle: "Meghalaya Tours - Abode of Clouds",
    metaDescription: "Experience Meghalaya's living root bridges, waterfalls, and misty hills.",
    cities: [
      { name: "Shillong", slug: "shillong", attractions: "Khasi Hills, Shillong Peak, Ward Lake" },
      { name: "Cherrapunji", slug: "cherrapunji", attractions: "Living Root Bridges, Nohkalikai Falls" },
      { name: "Mawlynnong", slug: "mawlynnong", attractions: "Cleanest Village, Mawlynnong Falls" },
      { name: "Tura", slug: "tura", attractions: "Garo Hills, Tura Peak" },
    ],
  },
  {
    state: "Mizoram",
    slug: "mizoram",
    metaTitle: "Mizoram Tours - Land of Blue Mountains",
    metaDescription: "Explore Mizoram's scenic beauty, tribal villages, and bamboo forests.",
    cities: [
      { name: "Aizawl", slug: "aizawl", attractions: "Aizawl City, Durtlang Hills" },
      { name: "Lunglei", slug: "lunglei", attractions: "Lunglei District, Tlabung" },
      { name: "Champhai", slug: "champhai", attractions: "Champhai District, Tam Dil Lake" },
    ],
  },
  {
    state: "Nagaland",
    slug: "nagaland",
    metaTitle: "Nagaland Tours - Tribal Festivals",
    metaDescription: "Experience Nagaland's unique tribal culture, festivals, and traditions.",
    cities: [
      { name: "Kohima", slug: "kohima", attractions: "Kohima City, Nagaland State Museum" },
      { name: "Dimapur", slug: "dimapur", attractions: "Dimapur City, Chumukedima" },
      { name: "Mokokchung", slug: "mokokchung", attractions: "Mokokchung District, Ungma Village" },
    ],
  },
  {
    state: "Odisha",
    slug: "odisha",
    metaTitle: "Odisha Tours - Temples & Beaches",
    metaDescription: "Discover Odisha's ancient temples, beaches, and tribal art forms.",
    cities: [
      { name: "Bhubaneswar", slug: "bhubaneswar", attractions: "Lingaraj Temple, Odisha Museum" },
      { name: "Puri", slug: "puri", attractions: "Jagannath Temple, Puri Beach" },
      { name: "Konark", slug: "konark", attractions: "Konark Sun Temple, Chandrabhaga Beach" },
      { name: "Cuttack", slug: "cuttack", attractions: "Barabati Fort, Odisha Textile Museum" },
      { name: "Rourkela", slug: "rourkela", attractions: "Rourkela Steel Plant, Hanuman Vatika" },
    ],
  },
  {
    state: "Punjab",
    slug: "punjab",
    metaTitle: "Punjab Tours - Land of Five Rivers",
    metaDescription: "Experience Punjab's vibrant culture, temples, and agricultural heritage.",
    cities: [
      { name: "Amritsar", slug: "amritsar", attractions: "Golden Temple, Jallianwala Bagh" },
      { name: "Chandigarh", slug: "chandigarh-punjab", attractions: "Rock Garden, Sukhna Lake" },
      { name: "Ludhiana", slug: "ludhiana", attractions: "Phillaur Fort, Lodhi Fort" },
      { name: "Jalandhar", slug: "jalandhar", attractions: "Devi Talab Mandir, Pushpa Gujral Science City" },
    ],
  },
  {
    state: "Rajasthan",
    slug: "rajasthan",
    metaTitle: "Rajasthan Tours - Land of Kings",
    metaDescription: "Explore Rajasthan's magnificent forts, palaces, and desert landscapes.",
    cities: [
      { name: "Jaipur", slug: "jaipur", attractions: "City Palace, Hawa Mahal, Jantar Mantar" },
      { name: "Jodhpur", slug: "jodhpur", attractions: "Mehrangarh Fort, Blue City" },
      { name: "Udaipur", slug: "udaipur", attractions: "City Palace, Lake Pichola, Jag Mandir" },
      { name: "Pushkar", slug: "pushkar", attractions: "Pushkar Lake, Brahma Temple, Camel Fair" },
      { name: "Jaisalmer", slug: "jaisalmer", attractions: "Jaisalmer Fort, Sam Sand Dunes" },
      { name: "Mount Abu", slug: "mount-abu", attractions: "Dilwara Temples, Nakki Lake" },
    ],
  },
  {
    state: "Sikkim",
    slug: "sikkim",
    metaTitle: "Sikkim Tours - Mountain Paradise",
    metaDescription: "Experience Sikkim's majestic mountains, monasteries, and pristine nature.",
    cities: [
      { name: "Gangtok", slug: "gangtok", attractions: "Rumtek Monastery, Kanyak Kumari Statue" },
      { name: "Pelling", slug: "pelling", attractions: "Pelling Monastery, Kanyak Kumari Statue" },
      { name: "Darjeeling", slug: "darjeeling-sikkim", attractions: "Tea Gardens, Toy Train" },
      { name: "Lachung", slug: "lachung", attractions: "Yumthang Valley, Yumthang Hot Springs" },
    ],
  },
  {
    state: "Tamil Nadu",
    slug: "tamil-nadu",
    metaTitle: "Tamil Nadu Tours - South Indian Heritage",
    metaDescription: "Discover Tamil Nadu's ancient temples, beaches, and cultural treasures.",
    cities: [
      { name: "Chennai", slug: "chennai", attractions: "Marina Beach, Kapaleeshwarar Temple" },
      { name: "Madurai", slug: "madurai", attractions: "Meenakshi Temple, Thirumalai Nayak Palace" },
      { name: "Ooty", slug: "ooty", attractions: "Nilgiri Mountain Railway, Botanical Gardens" },
      { name: "Kanyakumari", slug: "kanyakumari", attractions: "Vivekananda Rock, Thiruvalluvar Statue" },
      { name: "Pondicherry", slug: "pondicherry", attractions: "Auroville, French Quarter" },
      { name: "Rameshwaram", slug: "rameshwaram", attractions: "Ramanatha Swamy Temple, Adam's Bridge" },
    ],
  },
  {
    state: "Telangana",
    slug: "telangana",
    metaTitle: "Telangana Tours - Modern & Historic",
    metaDescription: "Explore Telangana's blend of modern development and historic monuments.",
    cities: [
      { name: "Hyderabad", slug: "hyderabad-telangana", attractions: "Charminar, Golconda Fort" },
      { name: "Warangal", slug: "warangal-telangana", attractions: "Warangal Fort, Thousand Pillar Temple" },
      { name: "Nizamabad", slug: "nizamabad", attractions: "Nizamabad Fort, Ganesh Temple" },
    ],
  },
  {
    state: "Tripura",
    slug: "tripura",
    metaTitle: "Tripura Tours - Northeast Gem",
    metaDescription: "Discover Tripura's palaces, temples, and tribal heritage.",
    cities: [
      { name: "Agartala", slug: "agartala", attractions: "Ujjayanta Palace, Jagannath Temple" },
      { name: "Udaipur", slug: "udaipur-tripura", attractions: "Ujjayanta Palace, Tripura Sundari Temple" },
    ],
  },
  {
    state: "Uttar Pradesh",
    slug: "uttar-pradesh",
    metaTitle: "Uttar Pradesh Tours - Spiritual Journey",
    metaDescription: "Experience Uttar Pradesh's sacred sites, monuments, and cultural heritage.",
    cities: [
      { name: "Agra", slug: "agra", attractions: "Taj Mahal, Agra Fort, Fatehpur Sikri" },
      { name: "Varanasi", slug: "varanasi", attractions: "Kashi Vishwanath Temple, Ghat, Sarnath" },
      { name: "Lucknow", slug: "lucknow", attractions: "Bara Imambara, Chota Imambara" },
      { name: "Mathura", slug: "mathura", attractions: "Krishna Janmabhoomi, Dwarkadhish Temple" },
      { name: "Vrindavan", slug: "vrindavan", attractions: "Banke Bihari Temple, Radha Raman Temple" },
      { name: "Ayodhya", slug: "ayodhya", attractions: "Ram Mandir, Hanuman Garhi" },
    ],
  },
  {
    state: "Uttarakhand",
    slug: "uttarakhand",
    metaTitle: "Uttarakhand Tours - Land of Gods",
    metaDescription: "Explore Uttarakhand's sacred temples, mountains, and adventure activities.",
    cities: [
      { name: "Dehradun", slug: "dehradun", attractions: "Robber's Cave, Sahastradhara" },
      { name: "Rishikesh", slug: "rishikesh", attractions: "Yoga Capital, Ghat, Adventure Sports" },
      { name: "Haridwar", slug: "haridwar", attractions: "Har Ki Pauri, Mansa Devi Temple" },
      { name: "Nainital", slug: "nainital", attractions: "Naini Lake, Naina Devi Temple" },
      { name: "Auli", slug: "auli", attractions: "Skiing, Mountain Views" },
      { name: "Chopta", slug: "chopta", attractions: "Tungnath Temple, Chandrashila Peak" },
    ],
  },
  {
    state: "West Bengal",
    slug: "west-bengal",
    metaTitle: "West Bengal Tours - Culture & Nature",
    metaDescription: "Discover West Bengal's literary heritage, mountains, and cultural attractions.",
    cities: [
      { name: "Kolkata", slug: "kolkata", attractions: "Victoria Memorial, Howrah Bridge" },
      { name: "Darjeeling", slug: "darjeeling-wb", attractions: "Tea Gardens, Toy Train, Kanyak Kumari" },
      { name: "Siliguri", slug: "siliguri", attractions: "Mahananda Wildlife Sanctuary" },
      { name: "Sundarbans", slug: "sundarbans", attractions: "Sundarbans National Park, Tiger Reserve" },
    ],
  },
  // Union Territories
  {
    state: "Andaman and Nicobar Islands",
    slug: "andaman-nicobar",
    metaTitle: "Andaman & Nicobar Tours - Island Paradise",
    metaDescription: "Experience the pristine beaches and marine life of Andaman and Nicobar Islands.",
    cities: [
      { name: "Port Blair", slug: "port-blair", attractions: "Cellular Jail, Radhanagar Beach" },
      { name: "Havelock Island", slug: "havelock-island", attractions: "Radhanagar Beach, Diving" },
      { name: "Neil Island", slug: "neil-island", attractions: "Beaches, Snorkeling" },
    ],
  },
  {
    state: "Chandigarh",
    slug: "chandigarh-ut",
    metaTitle: "Chandigarh Tours - Modern City",
    metaDescription: "Explore Chandigarh's modern architecture, gardens, and cultural attractions.",
    cities: [
      { name: "Chandigarh City", slug: "chandigarh-city", attractions: "Rock Garden, Sukhna Lake, Capitol Complex" },
    ],
  },
  {
    state: "Dadra and Nagar Haveli",
    slug: "dadra-nagar-haveli",
    metaTitle: "Dadra & Nagar Haveli Tours - Tribal Heritage",
    metaDescription: "Discover Dadra and Nagar Haveli's tribal culture and natural beauty.",
    cities: [
      { name: "Silvassa", slug: "silvassa", attractions: "Silvassa City, Tribal Museum" },
    ],
  },
  {
    state: "Daman and Diu",
    slug: "daman-diu",
    metaTitle: "Daman & Diu Tours - Coastal Beauty",
    metaDescription: "Explore Daman and Diu's beaches, forts, and Portuguese heritage.",
    cities: [
      { name: "Daman", slug: "daman", attractions: "Daman Fort, Devka Beach" },
      { name: "Diu", slug: "diu", attractions: "Diu Fort, Nagoa Beach" },
    ],
  },
  {
    state: "Delhi",
    slug: "delhi",
    metaTitle: "Delhi Tours - Capital City",
    metaDescription: "Experience Delhi's monuments, museums, and vibrant culture.",
    cities: [
      { name: "New Delhi", slug: "new-delhi", attractions: "India Gate, Rashtrapati Bhavan, Red Fort" },
      { name: "Old Delhi", slug: "old-delhi", attractions: "Jama Masjid, Chandni Chowk" },
    ],
  },
  {
    state: "Ladakh",
    slug: "ladakh",
    metaTitle: "Ladakh Tours - High Altitude Adventure",
    metaDescription: "Explore Ladakh's stunning mountains, monasteries, and adventure activities.",
    cities: [
      { name: "Leh", slug: "leh", attractions: "Leh Palace, Shanti Stupa, Leh Bazaar" },
      { name: "Kargil", slug: "kargil", attractions: "Kargil War Memorial, Dras" },
      { name: "Nubra Valley", slug: "nubra-valley", attractions: "Nubra Valley, Bactrian Camels" },
    ],
  },
  {
    state: "Lakshadweep",
    slug: "lakshadweep",
    metaTitle: "Lakshadweep Tours - Island Escape",
    metaDescription: "Discover Lakshadweep's coral islands, beaches, and water sports.",
    cities: [
      { name: "Kavarati", slug: "kavarati", attractions: "Kavarati Island, Beaches" },
      { name: "Agatti", slug: "agatti", attractions: "Agatti Island, Diving" },
    ],
  },
  {
    state: "Puducherry",
    slug: "puducherry",
    metaTitle: "Puducherry Tours - French Charm",
    metaDescription: "Experience Puducherry's French colonial architecture and spiritual atmosphere.",
    cities: [
      { name: "Puducherry City", slug: "puducherry-city", attractions: "Auroville, French Quarter, Beach" },
      { name: "Karaikal", slug: "karaikal", attractions: "Karaikal Beach, Temples" },
    ],
  },
];

async function importStatesAndCities() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Get India country ID
    const [countries] = await connection.query(
      "SELECT id FROM countries WHERE code = 'IN'"
    );

    if (countries.length === 0) {
      console.error("India country not found. Please create it first.");
      process.exit(1);
    }

    const countryId = countries[0].id;

    for (const stateData of statesAndCitiesData) {
      // Insert or update state
      const [existingState] = await connection.query(
        "SELECT id FROM states WHERE countryId = ? AND slug = ?",
        [countryId, stateData.slug]
      );

      let stateId;

      if (existingState.length > 0) {
        stateId = existingState[0].id;
        // Update existing state
        await connection.query(
          "UPDATE states SET name = ?, metaTitle = ?, metaDescription = ? WHERE id = ?",
          [stateData.state, stateData.metaTitle, stateData.metaDescription, stateId]
        );
        console.log(`Updated state: ${stateData.state}`);
      } else {
        // Insert new state
        const [result] = await connection.query(
          "INSERT INTO states (countryId, name, slug, metaTitle, metaDescription) VALUES (?, ?, ?, ?, ?)",
          [countryId, stateData.state, stateData.slug, stateData.metaTitle, stateData.metaDescription]
        );
        stateId = result.insertId;
        console.log(`Created state: ${stateData.state}`);
      }

      // Insert cities for this state
      for (const city of stateData.cities) {
        const [existingCity] = await connection.query(
          "SELECT id FROM locations WHERE stateId = ? AND slug = ?",
          [stateId, city.slug]
        );

        if (existingCity.length > 0) {
          // Update existing city
          await connection.query(
            "UPDATE locations SET name = ?, description = ? WHERE id = ?",
            [city.name, city.attractions, existingCity[0].id]
          );
        } else {
          // Insert new city
          await connection.query(
            "INSERT INTO locations (stateId, name, slug, description) VALUES (?, ?, ?, ?)",
            [stateId, city.name, city.slug, city.attractions]
          );
        }
      }

      console.log(`  Added ${stateData.cities.length} cities to ${stateData.state}`);
    }

    console.log("\n✅ Successfully imported all Indian states and cities!");
  } catch (error) {
    console.error("Error importing states and cities:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importStatesAndCities();

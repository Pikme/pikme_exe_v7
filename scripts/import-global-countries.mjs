import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pikme",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const countriesData = [
  // Middle East - City States & Emirates
  {
    name: "Dubai",
    code: "AE",
    slug: "dubai",
    states: [
      {
        name: "Dubai",
        slug: "dubai",
        cities: [
          { name: "Dubai", slug: "dubai", description: "Iconic desert metropolis with Burj Khalifa, Palm Jumeirah, and luxury shopping" },
          { name: "Deira", slug: "deira", description: "Historic trading district with gold souks and traditional architecture" },
          { name: "Bur Dubai", slug: "bur-dubai", description: "Old Dubai with heritage buildings, museums, and waterfront promenades" },
        ],
      },
    ],
  },
  {
    name: "Singapore",
    code: "SG",
    slug: "singapore",
    states: [
      {
        name: "Singapore",
        slug: "singapore",
        cities: [
          { name: "Marina Bay", slug: "marina-bay", description: "Modern district with Marina Bay Sands, Gardens by the Bay, and ArtScience Museum" },
          { name: "Sentosa", slug: "sentosa", description: "Resort island with beaches, theme parks, and water sports" },
          { name: "Chinatown", slug: "chinatown", description: "Historic district with temples, shops, and traditional restaurants" },
          { name: "Orchard", slug: "orchard", description: "Shopping and entertainment hub with luxury brands and dining" },
        ],
      },
    ],
  },
  {
    name: "Hong Kong",
    code: "HK",
    slug: "hong-kong",
    states: [
      {
        name: "Hong Kong Island",
        slug: "hong-kong-island",
        cities: [
          { name: "Central", slug: "central", description: "Business and cultural heart with skyscrapers, museums, and galleries" },
          { name: "Victoria Peak", slug: "victoria-peak", description: "Iconic viewpoint with panoramic harbor views and hiking trails" },
          { name: "Stanley", slug: "stanley", description: "Coastal town with beaches, promenade, and seafood restaurants" },
        ],
      },
      {
        name: "Kowloon",
        slug: "kowloon",
        cities: [
          { name: "Tsim Sha Tsui", slug: "tsim-sha-tsui", description: "Waterfront district with museums, shopping, and harbor views" },
          { name: "Mong Kok", slug: "mong-kok", description: "Vibrant neighborhood with street markets and local culture" },
        ],
      },
    ],
  },
  {
    name: "Bhutan",
    code: "BT",
    slug: "bhutan",
    states: [
      {
        name: "Thimphu",
        slug: "thimphu",
        cities: [
          { name: "Thimphu", slug: "thimphu", description: "Capital city with monasteries, museums, and traditional architecture" },
        ],
      },
      {
        name: "Paro",
        slug: "paro",
        cities: [
          { name: "Paro", slug: "paro", description: "Gateway to Bhutan with Tiger's Nest Monastery and scenic valleys" },
        ],
      },
      {
        name: "Punakha",
        slug: "punakha",
        cities: [
          { name: "Punakha", slug: "punakha", description: "Historic city with Punakha Dzong fortress and river valleys" },
        ],
      },
    ],
  },
  {
    name: "Nepal",
    code: "NP",
    slug: "nepal",
    states: [
      {
        name: "Kathmandu",
        slug: "kathmandu",
        cities: [
          { name: "Kathmandu", slug: "kathmandu", description: "Capital with ancient temples, Durbar Square, and Himalayan views" },
          { name: "Bhaktapur", slug: "bhaktapur", description: "Medieval city with traditional Newari architecture and pottery" },
          { name: "Panauti", slug: "panauti", description: "Ancient town with historic temples and cultural heritage" },
        ],
      },
      {
        name: "Pokhara",
        slug: "pokhara",
        cities: [
          { name: "Pokhara", slug: "pokhara", description: "Lake city with Annapurna views, adventure sports, and lakeside promenades" },
        ],
      },
      {
        name: "Sagarmatha",
        slug: "sagarmatha",
        cities: [
          { name: "Namche Bazaar", slug: "namche-bazaar", description: "Gateway to Mount Everest with trekking routes and mountain views" },
        ],
      },
    ],
  },
  {
    name: "Sri Lanka",
    code: "LK",
    slug: "sri-lanka",
    states: [
      {
        name: "Western",
        slug: "western",
        cities: [
          { name: "Colombo", slug: "colombo", description: "Capital and largest city with colonial architecture and beaches" },
          { name: "Negombo", slug: "negombo", description: "Coastal town with lagoons, beaches, and fishing villages" },
        ],
      },
      {
        name: "Central",
        slug: "central",
        cities: [
          { name: "Kandy", slug: "kandy", description: "Historic city with Temple of the Tooth and mountain scenery" },
          { name: "Nuwara Eliya", slug: "nuwara-eliya", description: "Hill station with colonial charm and tea plantations" },
        ],
      },
      {
        name: "Southern",
        slug: "southern",
        cities: [
          { name: "Galle", slug: "galle", description: "Coastal city with historic fort and pristine beaches" },
          { name: "Mirissa", slug: "mirissa", description: "Beach town with whale watching and water sports" },
        ],
      },
    ],
  },
  {
    name: "Turkey",
    code: "TR",
    slug: "turkey",
    states: [
      {
        name: "Istanbul",
        slug: "istanbul",
        cities: [
          { name: "Istanbul", slug: "istanbul", description: "Historic city spanning Europe and Asia with mosques, bazaars, and Bosphorus views" },
        ],
      },
      {
        name: "Cappadocia",
        slug: "cappadocia",
        cities: [
          { name: "Göreme", slug: "goreme", description: "Fairy-tale landscape with cave dwellings and hot air balloon rides" },
          { name: "Ürgüp", slug: "urgup", description: "Town with rock formations and underground cities" },
        ],
      },
      {
        name: "Aegean",
        slug: "aegean",
        cities: [
          { name: "Izmir", slug: "izmir", description: "Coastal city with beaches, ancient ruins, and Mediterranean charm" },
          { name: "Bodrum", slug: "bodrum", description: "Beach resort with Castle of St. Peter and nightlife" },
        ],
      },
    ],
  },
  {
    name: "Vietnam",
    code: "VN",
    slug: "vietnam",
    states: [
      {
        name: "Hanoi",
        slug: "hanoi",
        cities: [
          { name: "Hanoi", slug: "hanoi", description: "Capital with ancient temples, Old Quarter, and Hoan Kiem Lake" },
        ],
      },
      {
        name: "Ha Long Bay",
        slug: "ha-long-bay",
        cities: [
          { name: "Ha Long", slug: "ha-long", description: "UNESCO site with limestone karsts and emerald waters" },
        ],
      },
      {
        name: "Ho Chi Minh City",
        slug: "ho-chi-minh-city",
        cities: [
          { name: "Ho Chi Minh City", slug: "ho-chi-minh-city", description: "Largest city with War Remnants Museum, Ben Thanh Market, and vibrant nightlife" },
          { name: "Mekong Delta", slug: "mekong-delta", description: "River delta with floating markets and rural villages" },
        ],
      },
    ],
  },
  {
    name: "Maldives",
    code: "MV",
    slug: "maldives",
    states: [
      {
        name: "Kaafu",
        slug: "kaafu",
        cities: [
          { name: "Male", slug: "male", description: "Capital with colorful buildings, mosques, and local markets" },
          { name: "Hulhumalé", slug: "hulhumale", description: "Artificial island with beaches and water sports" },
        ],
      },
      {
        name: "Ari Atoll",
        slug: "ari-atoll",
        cities: [
          { name: "Ari Atoll", slug: "ari-atoll", description: "Resort destination with coral reefs and marine life" },
        ],
      },
    ],
  },
  {
    name: "Philippines",
    code: "PH",
    slug: "philippines",
    states: [
      {
        name: "Metro Manila",
        slug: "metro-manila",
        cities: [
          { name: "Manila", slug: "manila", description: "Capital with historic Intramuros, museums, and urban energy" },
          { name: "Makati", slug: "makati", description: "Business district with shopping malls and nightlife" },
        ],
      },
      {
        name: "Visayas",
        slug: "visayas",
        cities: [
          { name: "Cebu", slug: "cebu", description: "Island city with beaches, diving, and Magellan's Cross" },
          { name: "Boracay", slug: "boracay", description: "Beach paradise with white sand and water sports" },
        ],
      },
      {
        name: "Mindanao",
        slug: "mindanao",
        cities: [
          { name: "Davao", slug: "davao", description: "Coastal city with Mount Apo and diverse culture" },
        ],
      },
    ],
  },
  {
    name: "Brunei",
    code: "BN",
    slug: "brunei",
    states: [
      {
        name: "Brunei-Muara",
        slug: "brunei-muara",
        cities: [
          { name: "Bandar Seri Begawan", slug: "bandar-seri-begawan", description: "Capital with Jame Asr Hassanil Bolkiah Mosque and water villages" },
        ],
      },
    ],
  },
  {
    name: "Jordan",
    code: "JO",
    slug: "jordan",
    states: [
      {
        name: "Amman",
        slug: "amman",
        cities: [
          { name: "Amman", slug: "amman", description: "Capital with Roman theaters, museums, and Citadel views" },
        ],
      },
      {
        name: "Petra",
        slug: "petra",
        cities: [
          { name: "Wadi Musa", slug: "wadi-musa", description: "Gateway to Petra with ancient rose-red rock formations" },
        ],
      },
      {
        name: "Dead Sea",
        slug: "dead-sea",
        cities: [
          { name: "Dead Sea", slug: "dead-sea", description: "Lowest point on Earth with therapeutic mineral waters" },
        ],
      },
    ],
  },
  {
    name: "Qatar",
    code: "QA",
    slug: "qatar",
    states: [
      {
        name: "Doha",
        slug: "doha",
        cities: [
          { name: "Doha", slug: "doha", description: "Capital with Museum of Islamic Art, Corniche, and modern skyline" },
          { name: "Al Wakrah", slug: "al-wakrah", description: "Coastal town with traditional architecture and beaches" },
        ],
      },
    ],
  },
  {
    name: "Oman",
    code: "OM",
    slug: "oman",
    states: [
      {
        name: "Muscat",
        slug: "muscat",
        cities: [
          { name: "Muscat", slug: "muscat", description: "Capital with Grand Mosque, museums, and coastal beauty" },
        ],
      },
      {
        name: "Dhofar",
        slug: "dhofar",
        cities: [
          { name: "Salalah", slug: "salalah", description: "Coastal city with frankincense trees and white sand beaches" },
        ],
      },
    ],
  },
  {
    name: "Israel",
    code: "IL",
    slug: "israel",
    states: [
      {
        name: "Tel Aviv",
        slug: "tel-aviv",
        cities: [
          { name: "Tel Aviv", slug: "tel-aviv", description: "Modern city with beaches, nightlife, and cultural scene" },
        ],
      },
      {
        name: "Jerusalem",
        slug: "jerusalem",
        cities: [
          { name: "Jerusalem", slug: "jerusalem", description: "Holy city with Western Wall, Church of Holy Sepulchre, and Old City" },
        ],
      },
      {
        name: "Dead Sea",
        slug: "dead-sea-israel",
        cities: [
          { name: "Dead Sea", slug: "dead-sea-israel", description: "Lowest point on Earth with therapeutic mineral waters" },
        ],
      },
    ],
  },
  {
    name: "Taiwan",
    code: "TW",
    slug: "taiwan",
    states: [
      {
        name: "Taipei",
        slug: "taipei",
        cities: [
          { name: "Taipei", slug: "taipei", description: "Capital with Taipei 101, night markets, and hot springs" },
        ],
      },
      {
        name: "Taichung",
        slug: "taichung",
        cities: [
          { name: "Taichung", slug: "taichung", description: "Central city with Rainbow Village and cultural attractions" },
        ],
      },
      {
        name: "Jiufen",
        slug: "jiufen",
        cities: [
          { name: "Jiufen", slug: "jiufen", description: "Mountain village with old street, teahouses, and scenic views" },
        ],
      },
    ],
  },
  {
    name: "Uzbekistan",
    code: "UZ",
    slug: "uzbekistan",
    states: [
      {
        name: "Tashkent",
        slug: "tashkent",
        cities: [
          { name: "Tashkent", slug: "tashkent", description: "Capital with Silk Road heritage, museums, and bazaars" },
        ],
      },
      {
        name: "Samarkand",
        slug: "samarkand",
        cities: [
          { name: "Samarkand", slug: "samarkand", description: "Ancient Silk Road city with Registan and turquoise domes" },
        ],
      },
      {
        name: "Bukhara",
        slug: "bukhara",
        cities: [
          { name: "Bukhara", slug: "bukhara", description: "Historic city with ancient mosques and trading domes" },
        ],
      },
    ],
  },
  // Europe
  {
    name: "Austria",
    code: "AT",
    slug: "austria",
    states: [
      {
        name: "Vienna",
        slug: "vienna",
        cities: [
          { name: "Vienna", slug: "vienna", description: "Capital with imperial palaces, classical music, and Danube River" },
        ],
      },
      {
        name: "Salzburg",
        slug: "salzburg",
        cities: [
          { name: "Salzburg", slug: "salzburg", description: "Mozart's birthplace with baroque architecture and Alpine views" },
        ],
      },
      {
        name: "Tyrol",
        slug: "tyrol",
        cities: [
          { name: "Innsbruck", slug: "innsbruck", description: "Mountain resort with skiing and Alpine scenery" },
        ],
      },
    ],
  },
  {
    name: "Denmark",
    code: "DK",
    slug: "denmark",
    states: [
      {
        name: "Copenhagen",
        slug: "copenhagen",
        cities: [
          { name: "Copenhagen", slug: "copenhagen", description: "Capital with Tivoli Gardens, Nyhavn, and Nordic design" },
        ],
      },
      {
        name: "Aarhus",
        slug: "aarhus",
        cities: [
          { name: "Aarhus", slug: "aarhus", description: "Coastal city with museums, beaches, and cultural events" },
        ],
      },
    ],
  },
  {
    name: "Spain",
    code: "ES",
    slug: "spain",
    states: [
      {
        name: "Madrid",
        slug: "madrid",
        cities: [
          { name: "Madrid", slug: "madrid", description: "Capital with Prado Museum, Royal Palace, and vibrant nightlife" },
        ],
      },
      {
        name: "Barcelona",
        slug: "barcelona",
        cities: [
          { name: "Barcelona", slug: "barcelona", description: "Coastal city with Sagrada Familia, Park Güell, and beaches" },
        ],
      },
      {
        name: "Andalusia",
        slug: "andalusia",
        cities: [
          { name: "Granada", slug: "granada", description: "City with Alhambra palace and Moorish architecture" },
          { name: "Seville", slug: "seville", description: "Historic city with flamenco, cathedrals, and Alcázar palace" },
        ],
      },
    ],
  },
  {
    name: "Italy",
    code: "IT",
    slug: "italy",
    states: [
      {
        name: "Lazio",
        slug: "lazio",
        cities: [
          { name: "Rome", slug: "rome", description: "Eternal City with Colosseum, Vatican, and ancient ruins" },
        ],
      },
      {
        name: "Tuscany",
        slug: "tuscany",
        cities: [
          { name: "Florence", slug: "florence", description: "Renaissance capital with Uffizi Gallery and Duomo" },
          { name: "Siena", slug: "siena", description: "Medieval city with Palio horse race and historic squares" },
        ],
      },
      {
        name: "Campania",
        slug: "campania",
        cities: [
          { name: "Naples", slug: "naples", description: "Coastal city with Mount Vesuvius and pizza heritage" },
          { name: "Pompeii", slug: "pompeii", description: "Ancient Roman city preserved by volcanic eruption" },
        ],
      },
    ],
  },
  {
    name: "Norway",
    code: "NO",
    slug: "norway",
    states: [
      {
        name: "Oslo",
        slug: "oslo",
        cities: [
          { name: "Oslo", slug: "oslo", description: "Capital with Viking Ship Museum, Opera House, and fjord views" },
        ],
      },
      {
        name: "Hordaland",
        slug: "hordaland",
        cities: [
          { name: "Bergen", slug: "bergen", description: "Coastal city with Bryggen wharf and gateway to fjords" },
        ],
      },
      {
        name: "Sogn og Fjordane",
        slug: "sogn-og-fjordane",
        cities: [
          { name: "Flam", slug: "flam", description: "Scenic fjord village with railway and hiking trails" },
        ],
      },
    ],
  },
  {
    name: "Belgium",
    code: "BE",
    slug: "belgium",
    states: [
      {
        name: "Brussels",
        slug: "brussels",
        cities: [
          { name: "Brussels", slug: "brussels", description: "Capital with Grand Place, chocolates, and European institutions" },
        ],
      },
      {
        name: "Flanders",
        slug: "flanders",
        cities: [
          { name: "Bruges", slug: "bruges", description: "Medieval city with canals, cobblestone streets, and beer culture" },
          { name: "Antwerp", slug: "antwerp", description: "Port city with diamonds, fashion, and museums" },
        ],
      },
    ],
  },
  {
    name: "France",
    code: "FR",
    slug: "france",
    states: [
      {
        name: "Île-de-France",
        slug: "ile-de-france",
        cities: [
          { name: "Paris", slug: "paris", description: "City of Light with Eiffel Tower, Louvre, and romance" },
        ],
      },
      {
        name: "Provence",
        slug: "provence",
        cities: [
          { name: "Avignon", slug: "avignon", description: "Historic city with Papal Palace and lavender fields" },
        ],
      },
      {
        name: "Côte d'Azur",
        slug: "cote-d-azur",
        cities: [
          { name: "Nice", slug: "nice", description: "Riviera city with beaches, Promenade des Anglais, and art" },
          { name: "Cannes", slug: "cannes", description: "Film festival city with glamorous beaches and yachts" },
        ],
      },
    ],
  },
  {
    name: "Germany",
    code: "DE",
    slug: "germany",
    states: [
      {
        name: "Berlin",
        slug: "berlin",
        cities: [
          { name: "Berlin", slug: "berlin", description: "Capital with Brandenburg Gate, museums, and nightlife" },
        ],
      },
      {
        name: "Bavaria",
        slug: "bavaria",
        cities: [
          { name: "Munich", slug: "munich", description: "Bavarian capital with beer halls, palaces, and Alps nearby" },
          { name: "Neuschwanstein", slug: "neuschwanstein", description: "Fairy-tale castle in Alpine setting" },
        ],
      },
      {
        name: "North Rhine-Westphalia",
        slug: "north-rhine-westphalia",
        cities: [
          { name: "Cologne", slug: "cologne", description: "Rhine city with Gothic cathedral and beer culture" },
        ],
      },
    ],
  },
  {
    name: "Greece",
    code: "GR",
    slug: "greece",
    states: [
      {
        name: "Attica",
        slug: "attica",
        cities: [
          { name: "Athens", slug: "athens", description: "Ancient capital with Acropolis, Parthenon, and Mediterranean charm" },
        ],
      },
      {
        name: "Crete",
        slug: "crete",
        cities: [
          { name: "Heraklion", slug: "heraklion", description: "Largest island city with Minoan palace and beaches" },
          { name: "Chania", slug: "chania", description: "Venetian harbor town with pink beach and old town" },
        ],
      },
      {
        name: "Aegean Islands",
        slug: "aegean-islands",
        cities: [
          { name: "Santorini", slug: "santorini", description: "Iconic island with white buildings, blue domes, and caldera views" },
          { name: "Mykonos", slug: "mykonos", description: "Party island with beaches, windmills, and nightlife" },
        ],
      },
    ],
  },
  {
    name: "Switzerland",
    code: "CH",
    slug: "switzerland",
    states: [
      {
        name: "Zurich",
        slug: "zurich",
        cities: [
          { name: "Zurich", slug: "zurich", description: "Largest city with lakes, museums, and banking heritage" },
        ],
      },
      {
        name: "Bern",
        slug: "bern",
        cities: [
          { name: "Bern", slug: "bern", description: "Capital with medieval old town and Aare River" },
        ],
      },
      {
        name: "Valais",
        slug: "valais",
        cities: [
          { name: "Zermatt", slug: "zermatt", description: "Alpine resort with Matterhorn views and skiing" },
        ],
      },
    ],
  },
  {
    name: "Russia",
    code: "RU",
    slug: "russia",
    states: [
      {
        name: "Moscow",
        slug: "moscow",
        cities: [
          { name: "Moscow", slug: "moscow", description: "Capital with Red Square, Kremlin, and Russian culture" },
        ],
      },
      {
        name: "Saint Petersburg",
        slug: "saint-petersburg",
        cities: [
          { name: "Saint Petersburg", slug: "saint-petersburg", description: "Venice of the North with palaces, canals, and Hermitage" },
        ],
      },
      {
        name: "Siberia",
        slug: "siberia",
        cities: [
          { name: "Lake Baikal", slug: "lake-baikal", description: "Deepest freshwater lake with pristine nature" },
        ],
      },
    ],
  },
  {
    name: "United Kingdom",
    code: "GB",
    slug: "united-kingdom",
    states: [
      {
        name: "England",
        slug: "england",
        cities: [
          { name: "London", slug: "london", description: "Capital with Big Ben, Tower Bridge, and royal heritage" },
          { name: "Manchester", slug: "manchester", description: "Industrial city with museums and music scene" },
        ],
      },
      {
        name: "Scotland",
        slug: "scotland",
        cities: [
          { name: "Edinburgh", slug: "edinburgh", description: "Capital with castle, Royal Mile, and whisky heritage" },
          { name: "Glasgow", slug: "glasgow", description: "Vibrant city with art, architecture, and culture" },
        ],
      },
      {
        name: "Wales",
        slug: "wales",
        cities: [
          { name: "Cardiff", slug: "cardiff", description: "Capital with castle and cultural attractions" },
        ],
      },
    ],
  },
  {
    name: "Iceland",
    code: "IS",
    slug: "iceland",
    states: [
      {
        name: "Capital Region",
        slug: "capital-region",
        cities: [
          { name: "Reykjavik", slug: "reykjavik", description: "Capital with geothermal hot springs and Northern Lights" },
        ],
      },
      {
        name: "South",
        slug: "south",
        cities: [
          { name: "Vik", slug: "vik", description: "Coastal village with black sand beaches and waterfalls" },
        ],
      },
    ],
  },
  {
    name: "Portugal",
    code: "PT",
    slug: "portugal",
    states: [
      {
        name: "Lisbon",
        slug: "lisbon",
        cities: [
          { name: "Lisbon", slug: "lisbon", description: "Capital with Belém Tower, azulejo tiles, and pastéis de nata" },
        ],
      },
      {
        name: "Porto",
        slug: "porto",
        cities: [
          { name: "Porto", slug: "porto", description: "Port wine city with riverside charm and historic bridges" },
        ],
      },
      {
        name: "Algarve",
        slug: "algarve",
        cities: [
          { name: "Faro", slug: "faro", description: "Beach resort with golden cliffs and water sports" },
        ],
      },
    ],
  },
  {
    name: "Croatia",
    code: "HR",
    slug: "croatia",
    states: [
      {
        name: "Dalmatia",
        slug: "dalmatia",
        cities: [
          { name: "Dubrovnik", slug: "dubrovnik", description: "Pearl of Adriatic with medieval walls and Game of Thrones sites" },
          { name: "Split", slug: "split", description: "Coastal city with Diocletian's Palace and beaches" },
        ],
      },
      {
        name: "Istria",
        slug: "istria",
        cities: [
          { name: "Rovinj", slug: "rovinj", description: "Picturesque Venetian town with colorful buildings and harbor" },
        ],
      },
    ],
  },
  {
    name: "Czech Republic",
    code: "CZ",
    slug: "czech-republic",
    states: [
      {
        name: "Bohemia",
        slug: "bohemia",
        cities: [
          { name: "Prague", slug: "prague", description: "Capital with Charles Bridge, Prague Castle, and beer culture" },
        ],
      },
      {
        name: "Moravia",
        slug: "moravia",
        cities: [
          { name: "Brno", slug: "brno", description: "Second city with Spilberk Castle and wine region" },
        ],
      },
    ],
  },
  {
    name: "Finland",
    code: "FI",
    slug: "finland",
    states: [
      {
        name: "Uusimaa",
        slug: "uusimaa",
        cities: [
          { name: "Helsinki", slug: "helsinki", description: "Capital with modern design, saunas, and Baltic Sea views" },
        ],
      },
      {
        name: "Lapland",
        slug: "lapland",
        cities: [
          { name: "Rovaniemi", slug: "rovaniemi", description: "Arctic city with Northern Lights and Santa Claus Village" },
        ],
      },
    ],
  },
  {
    name: "Georgia",
    code: "GE",
    slug: "georgia",
    states: [
      {
        name: "Tbilisi",
        slug: "tbilisi",
        cities: [
          { name: "Tbilisi", slug: "tbilisi", description: "Capital with sulfur baths, old town, and wine culture" },
        ],
      },
      {
        name: "Kakheti",
        slug: "kakheti",
        cities: [
          { name: "Sighnaghi", slug: "sighnaghi", description: "Wine region town with vineyards and historic walls" },
        ],
      },
    ],
  },
  {
    name: "Ireland",
    code: "IE",
    slug: "ireland",
    states: [
      {
        name: "Dublin",
        slug: "dublin",
        cities: [
          { name: "Dublin", slug: "dublin", description: "Capital with Guinness Storehouse, Trinity College, and Irish pubs" },
        ],
      },
      {
        name: "Munster",
        slug: "munster",
        cities: [
          { name: "Cork", slug: "cork", description: "Second city with Blarney Stone and coastal charm" },
        ],
      },
      {
        name: "Connacht",
        slug: "connacht",
        cities: [
          { name: "Galway", slug: "galway", description: "Bohemian city with colorful streets and Connemara access" },
        ],
      },
    ],
  },
  {
    name: "Poland",
    code: "PL",
    slug: "poland",
    states: [
      {
        name: "Masovia",
        slug: "masovia",
        cities: [
          { name: "Warsaw", slug: "warsaw", description: "Capital with WWII history, museums, and nightlife" },
        ],
      },
      {
        name: "Lesser Poland",
        slug: "lesser-poland",
        cities: [
          { name: "Krakow", slug: "krakow", description: "Historic city with Wawel Castle and Jewish Quarter" },
        ],
      },
    ],
  },
  // Africa
  {
    name: "Egypt",
    code: "EG",
    slug: "egypt",
    states: [
      {
        name: "Cairo",
        slug: "cairo",
        cities: [
          { name: "Cairo", slug: "cairo", description: "Capital with Great Pyramids, Sphinx, and Egyptian Museum" },
        ],
      },
      {
        name: "Giza",
        slug: "giza",
        cities: [
          { name: "Giza", slug: "giza", description: "Home to Pyramids of Giza and Sphinx" },
        ],
      },
      {
        name: "Luxor",
        slug: "luxor",
        cities: [
          { name: "Luxor", slug: "luxor", description: "Ancient Thebes with temples and Valley of the Kings" },
        ],
      },
    ],
  },
  {
    name: "Ethiopia",
    code: "ET",
    slug: "ethiopia",
    states: [
      {
        name: "Addis Ababa",
        slug: "addis-ababa",
        cities: [
          { name: "Addis Ababa", slug: "addis-ababa", description: "Capital with National Museum and African Union headquarters" },
        ],
      },
      {
        name: "Amhara",
        slug: "amhara",
        cities: [
          { name: "Lalibela", slug: "lalibela", description: "Ancient pilgrimage site with rock-hewn churches" },
        ],
      },
    ],
  },
  {
    name: "Kenya",
    code: "KE",
    slug: "kenya",
    states: [
      {
        name: "Nairobi",
        slug: "nairobi",
        cities: [
          { name: "Nairobi", slug: "nairobi", description: "Capital with wildlife museums and Nairobi National Park" },
        ],
      },
      {
        name: "Rift Valley",
        slug: "rift-valley",
        cities: [
          { name: "Nakuru", slug: "nakuru", description: "Lake city with flamingos and wildlife reserves" },
        ],
      },
      {
        name: "Coast",
        slug: "coast",
        cities: [
          { name: "Mombasa", slug: "mombasa", description: "Beach city with historic Old Town and coral reefs" },
        ],
      },
    ],
  },
  {
    name: "Morocco",
    code: "MA",
    slug: "morocco",
    states: [
      {
        name: "Fez-Meknes",
        slug: "fez-meknes",
        cities: [
          { name: "Fez", slug: "fez", description: "Ancient medina with leather tanneries and Islamic architecture" },
          { name: "Meknes", slug: "meknes", description: "Imperial city with gates and palaces" },
        ],
      },
      {
        name: "Marrakesh-Safi",
        slug: "marrakesh-safi",
        cities: [
          { name: "Marrakesh", slug: "marrakesh", description: "Red city with Jemaa el-Fnaa square and Koutoubia Mosque" },
          { name: "Essaouira", slug: "essaouira", description: "Coastal town with blue and white buildings and beaches" },
        ],
      },
      {
        name: "Tangier-Tetouan",
        slug: "tangier-tetouan",
        cities: [
          { name: "Tangier", slug: "tangier", description: "Gateway city with Strait of Gibraltar views" },
        ],
      },
    ],
  },
  {
    name: "South Africa",
    code: "ZA",
    slug: "south-africa",
    states: [
      {
        name: "Western Cape",
        slug: "western-cape",
        cities: [
          { name: "Cape Town", slug: "cape-town", description: "Mother City with Table Mountain, beaches, and wine country" },
        ],
      },
      {
        name: "Gauteng",
        slug: "gauteng",
        cities: [
          { name: "Johannesburg", slug: "johannesburg", description: "Largest city with Apartheid Museum and vibrant culture" },
        ],
      },
      {
        name: "KwaZulu-Natal",
        slug: "kwazulu-natal",
        cities: [
          { name: "Durban", slug: "durban", description: "Coastal city with beaches and Indian Ocean charm" },
        ],
      },
    ],
  },
  {
    name: "Zimbabwe",
    code: "ZW",
    slug: "zimbabwe",
    states: [
      {
        name: "Matabeleland North",
        slug: "matabeleland-north",
        cities: [
          { name: "Victoria Falls", slug: "victoria-falls", description: "One of world's largest waterfalls with adventure activities" },
        ],
      },
      {
        name: "Harare",
        slug: "harare",
        cities: [
          { name: "Harare", slug: "harare", description: "Capital with museums and colonial architecture" },
        ],
      },
    ],
  },
  {
    name: "Tanzania",
    code: "TZ",
    slug: "tanzania",
    states: [
      {
        name: "Arusha",
        slug: "arusha",
        cities: [
          { name: "Arusha", slug: "arusha", description: "Gateway to Kilimanjaro and Serengeti" },
        ],
      },
      {
        name: "Dar es Salaam",
        slug: "dar-es-salaam",
        cities: [
          { name: "Dar es Salaam", slug: "dar-es-salaam", description: "Largest city with beaches and cultural attractions" },
        ],
      },
      {
        name: "Zanzibar",
        slug: "zanzibar",
        cities: [
          { name: "Stone Town", slug: "stone-town", description: "Historic island city with spice markets and beaches" },
        ],
      },
    ],
  },
  {
    name: "Seychelles",
    code: "SC",
    slug: "seychelles",
    states: [
      {
        name: "Mahe",
        slug: "mahe",
        cities: [
          { name: "Victoria", slug: "victoria", description: "Capital with tropical beaches and granite islands" },
        ],
      },
    ],
  },
  {
    name: "Mauritius",
    code: "MU",
    slug: "mauritius",
    states: [
      {
        name: "Port Louis",
        slug: "port-louis",
        cities: [
          { name: "Port Louis", slug: "port-louis", description: "Capital with colorful markets and waterfront" },
        ],
      },
      {
        name: "Pamplemousses",
        slug: "pamplemousses",
        cities: [
          { name: "Pamplemousses", slug: "pamplemousses", description: "District with botanical gardens and sugar estates" },
        ],
      },
    ],
  },
  {
    name: "Libya",
    code: "LY",
    slug: "libya",
    states: [
      {
        name: "Tripoli",
        slug: "tripoli",
        cities: [
          { name: "Tripoli", slug: "tripoli", description: "Capital with medina and Mediterranean coast" },
        ],
      },
    ],
  },
  // Americas
  {
    name: "Brazil",
    code: "BR",
    slug: "brazil",
    states: [
      {
        name: "São Paulo",
        slug: "sao-paulo",
        cities: [
          { name: "São Paulo", slug: "sao-paulo", description: "Largest city with museums, nightlife, and urban energy" },
        ],
      },
      {
        name: "Rio de Janeiro",
        slug: "rio-de-janeiro",
        cities: [
          { name: "Rio de Janeiro", slug: "rio-de-janeiro", description: "Beach city with Christ the Redeemer and Copacabana" },
        ],
      },
      {
        name: "Amazonas",
        slug: "amazonas",
        cities: [
          { name: "Manaus", slug: "manaus", description: "Amazon gateway with rainforest access" },
        ],
      },
    ],
  },
  {
    name: "Mexico",
    code: "MX",
    slug: "mexico",
    states: [
      {
        name: "Mexico City",
        slug: "mexico-city",
        cities: [
          { name: "Mexico City", slug: "mexico-city", description: "Capital with Aztec ruins, museums, and vibrant culture" },
        ],
      },
      {
        name: "Quintana Roo",
        slug: "quintana-roo",
        cities: [
          { name: "Cancun", slug: "cancun", description: "Beach resort with Caribbean waters and Mayan ruins" },
          { name: "Playa del Carmen", slug: "playa-del-carmen", description: "Coastal town with beaches and nightlife" },
        ],
      },
      {
        name: "Oaxaca",
        slug: "oaxaca",
        cities: [
          { name: "Oaxaca City", slug: "oaxaca-city", description: "Colonial city with indigenous culture and cuisine" },
        ],
      },
    ],
  },
  {
    name: "Peru",
    code: "PE",
    slug: "peru",
    states: [
      {
        name: "Lima",
        slug: "lima",
        cities: [
          { name: "Lima", slug: "lima", description: "Capital with museums, colonial architecture, and cuisine" },
        ],
      },
      {
        name: "Cusco",
        slug: "cusco",
        cities: [
          { name: "Cusco", slug: "cusco", description: "Ancient Incan capital with Machu Picchu access" },
        ],
      },
      {
        name: "Puno",
        slug: "puno",
        cities: [
          { name: "Puno", slug: "puno", description: "Lake Titicaca city with floating islands" },
        ],
      },
    ],
  },
  {
    name: "Argentina",
    code: "AR",
    slug: "argentina",
    states: [
      {
        name: "Buenos Aires",
        slug: "buenos-aires",
        cities: [
          { name: "Buenos Aires", slug: "buenos-aires", description: "Capital with tango, European architecture, and steaks" },
        ],
      },
      {
        name: "Mendoza",
        slug: "mendoza",
        cities: [
          { name: "Mendoza", slug: "mendoza", description: "Wine region with vineyards and Andes views" },
        ],
      },
      {
        name: "Misiones",
        slug: "misiones",
        cities: [
          { name: "Puerto Iguazú", slug: "puerto-iguazu", description: "Gateway to Iguazu Falls" },
        ],
      },
    ],
  },
  {
    name: "Ecuador",
    code: "EC",
    slug: "ecuador",
    states: [
      {
        name: "Pichincha",
        slug: "pichincha",
        cities: [
          { name: "Quito", slug: "quito", description: "Capital on equator with colonial old town and Andean views" },
        ],
      },
      {
        name: "Tungurahua",
        slug: "tungurahua",
        cities: [
          { name: "Baños", slug: "banos", description: "Adventure town with waterfalls and jungle access" },
        ],
      },
    ],
  },
  {
    name: "Colombia",
    code: "CO",
    slug: "colombia",
    states: [
      {
        name: "Bogotá",
        slug: "bogota",
        cities: [
          { name: "Bogotá", slug: "bogota", description: "Capital with museums, colonial architecture, and mountain views" },
        ],
      },
      {
        name: "Bolívar",
        slug: "bolivar",
        cities: [
          { name: "Cartagena", slug: "cartagena", description: "Caribbean city with walled old town and beaches" },
        ],
      },
      {
        name: "Quindío",
        slug: "quindio",
        cities: [
          { name: "Salento", slug: "salento", description: "Coffee region town with colorful buildings and plantations" },
        ],
      },
    ],
  },
  {
    name: "El Salvador",
    code: "SV",
    slug: "el-salvador",
    states: [
      {
        name: "San Salvador",
        slug: "san-salvador",
        cities: [
          { name: "San Salvador", slug: "san-salvador", description: "Capital with museums and colonial charm" },
        ],
      },
      {
        name: "La Libertad",
        slug: "la-libertad",
        cities: [
          { name: "La Libertad", slug: "la-libertad", description: "Beach town with surfing and Pacific views" },
        ],
      },
    ],
  },
  // Oceania
  {
    name: "Australia",
    code: "AU",
    slug: "australia",
    states: [
      {
        name: "New South Wales",
        slug: "new-south-wales",
        cities: [
          { name: "Sydney", slug: "sydney", description: "Largest city with Opera House, Harbour Bridge, and beaches" },
        ],
      },
      {
        name: "Victoria",
        slug: "victoria",
        cities: [
          { name: "Melbourne", slug: "melbourne", description: "Cultural capital with street art, coffee, and sports" },
        ],
      },
      {
        name: "Queensland",
        slug: "queensland",
        cities: [
          { name: "Brisbane", slug: "brisbane", description: "Subtropical city with river and nearby Great Barrier Reef" },
          { name: "Cairns", slug: "cairns", description: "Gateway to Great Barrier Reef and rainforest" },
        ],
      },
    ],
  },
  {
    name: "New Zealand",
    code: "NZ",
    slug: "new-zealand",
    states: [
      {
        name: "Auckland",
        slug: "auckland",
        cities: [
          { name: "Auckland", slug: "auckland", description: "Largest city with harbors, volcanoes, and island access" },
        ],
      },
      {
        name: "Wellington",
        slug: "wellington",
        cities: [
          { name: "Wellington", slug: "wellington", description: "Capital with creative culture and harbor views" },
        ],
      },
      {
        name: "Otago",
        slug: "otago",
        cities: [
          { name: "Queenstown", slug: "queenstown", description: "Adventure capital with mountains, lakes, and activities" },
        ],
      },
    ],
  },
  // North America
  {
    name: "Canada",
    code: "CA",
    slug: "canada",
    states: [
      {
        name: "Ontario",
        slug: "ontario",
        cities: [
          { name: "Toronto", slug: "toronto", description: "Largest city with CN Tower, museums, and multicultural scene" },
          { name: "Niagara Falls", slug: "niagara-falls", description: "Famous waterfall with tourism attractions" },
        ],
      },
      {
        name: "British Columbia",
        slug: "british-columbia",
        cities: [
          { name: "Vancouver", slug: "vancouver", description: "West coast city with mountains, ocean, and parks" },
          { name: "Whistler", slug: "whistler", description: "Mountain resort with skiing and outdoor activities" },
        ],
      },
      {
        name: "Alberta",
        slug: "alberta",
        cities: [
          { name: "Banff", slug: "banff", description: "National park town with turquoise lakes and Rocky Mountains" },
        ],
      },
    ],
  },
  {
    name: "United States of America",
    code: "US",
    slug: "united-states-of-america",
    states: [
      {
        name: "New York",
        slug: "new-york",
        cities: [
          { name: "New York City", slug: "new-york-city", description: "The Big Apple with Times Square, Statue of Liberty, and Broadway" },
          { name: "Niagara Falls", slug: "niagara-falls-us", description: "Famous waterfall with American side views" },
        ],
      },
      {
        name: "California",
        slug: "california",
        cities: [
          { name: "Los Angeles", slug: "los-angeles", description: "City of Angels with Hollywood, beaches, and entertainment" },
          { name: "San Francisco", slug: "san-francisco", description: "Bay city with Golden Gate Bridge and tech culture" },
          { name: "San Diego", slug: "san-diego", description: "Southern California beach city with perfect weather" },
        ],
      },
      {
        name: "Florida",
        slug: "florida",
        cities: [
          { name: "Miami", slug: "miami", description: "Beach city with Art Deco architecture and nightlife" },
          { name: "Orlando", slug: "orlando", description: "Theme park capital with Disney World and Universal" },
        ],
      },
      {
        name: "Nevada",
        slug: "nevada",
        cities: [
          { name: "Las Vegas", slug: "las-vegas", description: "Entertainment capital with casinos, shows, and nightlife" },
        ],
      },
      {
        name: "Arizona",
        slug: "arizona",
        cities: [
          { name: "Phoenix", slug: "phoenix", description: "Desert city with resorts and nearby Grand Canyon" },
        ],
      },
      {
        name: "Utah",
        slug: "utah",
        cities: [
          { name: "Salt Lake City", slug: "salt-lake-city", description: "Mountain city with skiing and national parks nearby" },
        ],
      },
    ],
  },
];

async function importCountries() {
  const connection = await pool.getConnection();
  try {
    console.log("Starting global countries import...");
    let countryCount = 0;
    let stateCount = 0;
    let cityCount = 0;

    for (const country of countriesData) {
      try {
        // Insert country
        const [countryResult] = await connection.query(
          "INSERT INTO countries (name, code, slug, metaTitle, metaDescription, metaKeywords, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())",
          [country.name, country.code, country.slug, `${country.name} Tours`, `Explore tours in ${country.name}`, country.name]
        );

        const countryId = countryResult.insertId;
        countryCount++;
        console.log(`✓ Imported country: ${country.name} (ID: ${countryId})`);

        // Insert states
        for (const state of country.states) {
          try {
            const [stateResult] = await connection.query(
              "INSERT INTO states (countryId, name, slug, metaTitle, metaDescription, metaKeywords, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())",
              [countryId, state.name, state.slug, `${state.name}, ${country.name}`, `Explore ${state.name}`, state.name]
            );

            const stateId = stateResult.insertId;
            stateCount++;

            // Insert cities
            for (const city of state.cities) {
              try {
                await connection.query(
                  "INSERT INTO cities (stateId, countryId, name, slug, description, metaTitle, metaDescription, metaKeywords, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())",
                  [
                    stateId,
                    countryId,
                    city.name,
                    city.slug,
                    city.description,
                    `${city.name} Tours`,
                    city.description,
                    city.name,
                  ]
                );
                cityCount++;
              } catch (error) {
                console.error(`✗ Error importing city ${city.name}:`, error.message);
              }
            }
            console.log(`  ✓ Imported state: ${state.name} with ${state.cities.length} cities`);
          } catch (error) {
            console.error(`✗ Error importing state ${state.name}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`✗ Error importing country ${country.name}:`, error.message);
      }
    }

    console.log("\n✅ Import completed!");
    console.log(`Total countries: ${countryCount}`);
    console.log(`Total states: ${stateCount}`);
    console.log(`Total cities: ${cityCount}`);
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    connection.release();
    pool.end();
  }
}

importCountries();

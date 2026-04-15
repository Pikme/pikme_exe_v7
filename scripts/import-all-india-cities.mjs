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
      { name: "Hyderabad", slug: "hyderabad", attractions: "Charminar, Bibi Ka Maqbara, Golconda Fort, Ramakrishna Mission" },
      { name: "Tirupati", slug: "tirupati", attractions: "Tirupati Temple, Sri Venkateswara Temple, Chandragiri Fort" },
      { name: "Visakhapatnam", slug: "visakhapatnam", attractions: "Araku Valley, Kailasagiri, Submarine Museum, Simhachalam Temple" },
      { name: "Vijayawada", slug: "vijayawada", attractions: "Kanaka Durga Temple, Undavalli Caves, Prakasam Barrage" },
      { name: "Warangal", slug: "warangal", attractions: "Warangal Fort, Thousand Pillar Temple, Ramappa Temple" },
      { name: "Vikarabad", slug: "vikarabad", attractions: "Vikarabad Fort, Tandur Fort" },
      { name: "Nellore", slug: "nellore", attractions: "Sri Ranganathaswamy Temple, Pulicat Lake" },
      { name: "Ongole", slug: "ongole", attractions: "Ongole Town, Kandukur Temple" },
      { name: "Rajahmundry", slug: "rajahmundry", attractions: "Godavari River, Papi Hills" },
      { name: "Kakinada", slug: "kakinada", attractions: "Kakinada Beach, Coringa Wildlife Sanctuary" },
      { name: "Tenali", slug: "tenali", attractions: "Tenali Rama Temple, Tenali Town" },
      { name: "Guntur", slug: "guntur", attractions: "Guntur Fort, Kondavid Fort" },
      { name: "Kurnool", slug: "kurnool", attractions: "Kurnool Fort, Belum Caves" },
      { name: "Anantapur", slug: "anantapur", attractions: "Anantapur Fort, Lepakshi Temple" },
      { name: "Kadapa", slug: "kadapa", attractions: "Tirupati Temple, Chandragiri Fort" },
    ],
  },
  {
    state: "Arunachal Pradesh",
    slug: "arunachal-pradesh",
    metaTitle: "Arunachal Pradesh Tours - Northeast Adventure",
    metaDescription: "Discover the pristine beauty of Arunachal Pradesh with mountains, monasteries, and tribal culture.",
    cities: [
      { name: "Itanagar", slug: "itanagar", attractions: "Itanagar Citadel, Ganga Lake, Jawaharlal Nehru Museum" },
      { name: "Tawang", slug: "tawang", attractions: "Tawang Monastery, Sela Pass, Bumla Pass, Tawang War Memorial" },
      { name: "Bomdila", slug: "bomdila", attractions: "Bomdila Monastery, Craft Centre, Dirang Dzong" },
      { name: "Pasighat", slug: "pasighat", attractions: "Siang River, Pasighat Adventure Sports, Pasighat Town" },
      { name: "Ziro", slug: "ziro", attractions: "Ziro Valley, Apatani Tribal Village, Ziro Festival" },
      { name: "Naharlagun", slug: "naharlagun", attractions: "Naharlagun Town, Papum Pare District" },
      { name: "Khonsa", slug: "khonsa", attractions: "Khonsa Town, Tirap District" },
      { name: "Roing", slug: "roing", attractions: "Roing Town, Dibang Valley" },
    ],
  },
  {
    state: "Assam",
    slug: "assam",
    metaTitle: "Assam Tours - Wildlife & Tea Gardens",
    metaDescription: "Experience Assam's rich wildlife, tea gardens, and cultural heritage.",
    cities: [
      { name: "Guwahati", slug: "guwahati", attractions: "Kamakhya Temple, Assam State Museum, Brahmaputra River" },
      { name: "Kaziranga", slug: "kaziranga", attractions: "Kaziranga National Park, One-horned Rhino, Wildlife Safari" },
      { name: "Darjeeling", slug: "darjeeling", attractions: "Tea Gardens, Toy Train, Tiger Hill, Batasia Loop" },
      { name: "Silchar", slug: "silchar", attractions: "Barak Valley, Haflong Hill, Silchar Town" },
      { name: "Jorhat", slug: "jorhat", attractions: "Tea Gardens, Gibbon Wildlife Sanctuary, Majuli Island" },
      { name: "Dibrugarh", slug: "dibrugarh", attractions: "Tea Gardens, Dibru-Saikhowa National Park" },
      { name: "Tezpur", slug: "tezpur", attractions: "Tezpur Town, Agnigarh Hill, Cole Park" },
      { name: "Nagaon", slug: "nagaon", attractions: "Nagaon Town, Deepor Beel Wildlife Sanctuary" },
      { name: "Barpeta", slug: "barpeta", attractions: "Barpeta Satra, Barpeta Town" },
      { name: "Golaghat", slug: "golaghat", attractions: "Tea Gardens, Golaghat Town" },
    ],
  },
  {
    state: "Bihar",
    slug: "bihar",
    metaTitle: "Bihar Tours - Spiritual & Historical",
    metaDescription: "Visit Bihar's sacred sites including Bodh Gaya, Nalanda, and Vaishali.",
    cities: [
      { name: "Bodh Gaya", slug: "bodh-gaya", attractions: "Mahabodhi Temple, Bodhi Tree, Buddhist Temple" },
      { name: "Patna", slug: "patna", attractions: "Patna Museum, Golghar, Har Mandir Sahib, Kumhrar" },
      { name: "Nalanda", slug: "nalanda", attractions: "Nalanda University Ruins, Nalanda Museum, Ancient University" },
      { name: "Vaishali", slug: "vaishali", attractions: "Ashoka Pillar, Rajagraha Hill, Vaishali Museum" },
      { name: "Rajgir", slug: "rajgir", attractions: "Griddhakuta Peak, Nalanda, Hot Springs, Vulture Peak" },
      { name: "Muzaffarpur", slug: "muzaffarpur", attractions: "Muzaffarpur Town, Litchi Gardens" },
      { name: "Madhubani", slug: "madhubani", attractions: "Madhubani Art, Madhubani Painting" },
      { name: "Arrah", slug: "arrah", attractions: "Arrah Fort, Arrah Town" },
      { name: "Gaya", slug: "gaya", attractions: "Vishnupad Temple, Gaya Town, Fakir Hill" },
      { name: "Darbhanga", slug: "darbhanga", attractions: "Darbhanga Raj Palace, Darbhanga Town" },
    ],
  },
  {
    state: "Chhattisgarh",
    slug: "chhattisgarh",
    metaTitle: "Chhattisgarh Tours - Tribal Culture & Forests",
    metaDescription: "Explore Chhattisgarh's tribal villages, waterfalls, and ancient temples.",
    cities: [
      { name: "Raipur", slug: "raipur", attractions: "Mahant Ghasidas Museum, Naya Raipur, Laxmi Narayan Temple" },
      { name: "Jagdalpur", slug: "jagdalpur", attractions: "Bastar Dussehra, Chitrakoot Falls, Jagdalpur Town" },
      { name: "Bilaspur", slug: "bilaspur", attractions: "Achanakmar Wildlife Sanctuary, Bilaspur Town" },
      { name: "Dantewada", slug: "dantewada", attractions: "Danteshwari Temple, Tribal Art, Dantewada Town" },
      { name: "Rajnandgaon", slug: "rajnandgaon", attractions: "Rajnandgaon Town, Rajnandgaon Fort" },
      { name: "Raigarh", slug: "raigarh", attractions: "Raigarh Fort, Raigarh Town" },
      { name: "Durg", slug: "durg", attractions: "Durg Fort, Durg Town" },
      { name: "Korba", slug: "korba", attractions: "Korba Town, Korba Industrial Area" },
    ],
  },
  {
    state: "Goa",
    slug: "goa",
    metaTitle: "Goa Tours - Beaches & Culture",
    metaDescription: "Enjoy Goa's beautiful beaches, Portuguese heritage, and vibrant nightlife.",
    cities: [
      { name: "Panaji", slug: "panaji", attractions: "Basilica of Bom Jesus, Se Cathedral, Igrexa de St. Cajetan" },
      { name: "Margao", slug: "margao", attractions: "Holy Spirit Church, Margao Market, Margao Town" },
      { name: "Calangute", slug: "calangute", attractions: "Calangute Beach, Water Sports, Calangute Town" },
      { name: "Baga", slug: "baga", attractions: "Baga Beach, Tito's Lane, Baga River" },
      { name: "Palolem", slug: "palolem", attractions: "Palolem Beach, Butterfly Beach, Palolem Town" },
      { name: "Anjuna", slug: "anjuna", attractions: "Anjuna Beach, Flea Market, Anjuna Fort" },
      { name: "Arambol", slug: "arambol", attractions: "Arambol Beach, Arambol Lake, Arambol Town" },
      { name: "Morjim", slug: "morjim", attractions: "Morjim Beach, Turtle Nesting Site" },
      { name: "Vasco da Gama", slug: "vasco-da-gama", attractions: "Vasco da Gama Town, Port" },
      { name: "Sanvordem", slug: "sanvordem", attractions: "Sanvordem Town, Dudhsagar Falls" },
    ],
  },
  {
    state: "Gujarat",
    slug: "gujarat",
    metaTitle: "Gujarat Tours - Heritage & Culture",
    metaDescription: "Discover Gujarat's rich heritage, temples, and traditional crafts.",
    cities: [
      { name: "Ahmedabad", slug: "ahmedabad", attractions: "Sabarmati Ashram, Jama Masjid, Textile Museum, Calico Museum" },
      { name: "Vadodara", slug: "vadodara", attractions: "Lakshmi Vilas Palace, Champaner-Pavagadh, Sayaji Baug" },
      { name: "Surat", slug: "surat", attractions: "Dumas Beach, Castle Museum, Surat Fort" },
      { name: "Rajkot", slug: "rajkot", attractions: "Kaba Gandhi no Delo, Wankaner Palace, Rajkot Town" },
      { name: "Dwarka", slug: "dwarka", attractions: "Dwarkadhish Temple, Nageshwar Temple, Dwarka Beach" },
      { name: "Somnath", slug: "somnath", attractions: "Somnath Temple, Triveni Beach, Somnath Town" },
      { name: "Junagadh", slug: "junagadh", attractions: "Girnar Mountain, Junagadh Fort, Uparkot Fort" },
      { name: "Bhavnagar", slug: "bhavnagar", attractions: "Bhavnagar Palace, Bhavnagar Beach, Bhavnagar Town" },
      { name: "Porbandar", slug: "porbandar", attractions: "Porbandar Beach, Kirti Mandir, Porbandar Town" },
      { name: "Gondal", slug: "gondal", attractions: "Gondal Palace, Gondal Town" },
      { name: "Anand", slug: "anand", attractions: "Anand Town, Dairy Cooperative" },
      { name: "Khambhat", slug: "khambhat", attractions: "Khambhat Town, Khambhat Pottery" },
    ],
  },
  {
    state: "Haryana",
    slug: "haryana",
    metaTitle: "Haryana Tours - Heritage & Adventure",
    metaDescription: "Explore Haryana's historical sites, adventure activities, and cultural attractions.",
    cities: [
      { name: "Chandigarh", slug: "chandigarh", attractions: "Rock Garden, Sukhna Lake, Capitol Complex, Rose Garden" },
      { name: "Faridabad", slug: "faridabad", attractions: "Badkhal Lake, Surajkund, Faridabad Town" },
      { name: "Gurgaon", slug: "gurgaon", attractions: "Kingdom of Dreams, Cyber Hub, Gurgaon Town" },
      { name: "Hisar", slug: "hisar", attractions: "Hisar Fort, Agrasen Baoli, Hisar Town" },
      { name: "Rohtak", slug: "rohtak", attractions: "Rohtak Town, Rohtak Museum" },
      { name: "Panipat", slug: "panipat", attractions: "Panipat Battlefield, Panipat Town" },
      { name: "Karnal", slug: "karnal", attractions: "Karnal Town, Karnal Fort" },
      { name: "Ambala", slug: "ambala", attractions: "Ambala Town, Ambala Fort" },
    ],
  },
  {
    state: "Himachal Pradesh",
    slug: "himachal-pradesh",
    metaTitle: "Himachal Pradesh Tours - Mountain Adventure",
    metaDescription: "Experience the stunning Himalayas with adventure activities and scenic beauty.",
    cities: [
      { name: "Shimla", slug: "shimla", attractions: "Mall Road, Jakhoo Temple, Ridge, Christ Church" },
      { name: "Manali", slug: "manali", attractions: "Rohtang Pass, Solang Valley, Hadimba Temple, Beas River" },
      { name: "Dharamshala", slug: "dharamshala", attractions: "Dalai Lama Temple, Triund Trek, Bhagsu Waterfall" },
      { name: "Kullu", slug: "kullu", attractions: "Kullu Valley, Raghunath Temple, Dussehra, Beas River" },
      { name: "Spiti", slug: "spiti", attractions: "Kaza, Tabo Monastery, Dhankar Lake, Kaza Town" },
      { name: "Kinnaur", slug: "kinnaur", attractions: "Kinner Kailash, Kalpa, Sangla Valley, Kinnaur Town" },
      { name: "Mandi", slug: "mandi", attractions: "Mandi Town, Rewalsar Lake, Mandi Palace" },
      { name: "Palampur", slug: "palampur", attractions: "Tea Gardens, Palampur Town, Bundla Lake" },
      { name: "Dalhousie", slug: "dalhousie", attractions: "Dalhousie Town, Khajjiar Lake, Dainkund Peak" },
      { name: "Kasol", slug: "kasol", attractions: "Kasol Town, Parvati River, Kasol Trek" },
      { name: "Tirthan Valley", slug: "tirthan-valley", attractions: "Tirthan Valley, Tirthan River" },
    ],
  },
  {
    state: "Jharkhand",
    slug: "jharkhand",
    metaTitle: "Jharkhand Tours - Waterfalls & Tribal Culture",
    metaDescription: "Discover Jharkhand's beautiful waterfalls, tribal villages, and mineral wealth.",
    cities: [
      { name: "Ranchi", slug: "ranchi", attractions: "Jamshedpur, Tagore Hill, Kanke Dam, Ranchi Town" },
      { name: "Jamshedpur", slug: "jamshedpur", attractions: "Tata Steel Plant, Dimna Lake, Jamshedpur Town" },
      { name: "Giridih", slug: "giridih", attractions: "Parasnath Hill, Madhuban, Giridih Town" },
      { name: "Hazaribagh", slug: "hazaribagh", attractions: "Hazaribagh Wildlife Sanctuary, Hazaribagh Town" },
      { name: "Dhanbad", slug: "dhanbad", attractions: "Dhanbad Town, Coal Mines, Dhanbad Lake" },
      { name: "Bokaro", slug: "bokaro", attractions: "Bokaro Steel Plant, Bokaro Town" },
      { name: "Deoghar", slug: "deoghar", attractions: "Navagraha Temple, Deoghar Town" },
      { name: "Dumka", slug: "dumka", attractions: "Dumka Town, Dumka Fort" },
    ],
  },
  {
    state: "Karnataka",
    slug: "karnataka",
    metaTitle: "Karnataka Tours - Coffee & Culture",
    metaDescription: "Explore Karnataka's coffee plantations, temples, and scenic landscapes.",
    cities: [
      { name: "Bangalore", slug: "bangalore", attractions: "Vidhana Soudha, Lalbagh, Cubbon Park, Bangalore Fort" },
      { name: "Mysore", slug: "mysore", attractions: "Mysore Palace, Chamundeshwari Temple, Brindavan Gardens" },
      { name: "Coorg", slug: "coorg", attractions: "Coffee Plantations, Abbey Falls, Madikeri, Coorg Town" },
      { name: "Hampi", slug: "hampi", attractions: "Virupaksha Temple, Vittala Temple, Bazaar Street, Hampi Town" },
      { name: "Gokarna", slug: "gokarna", attractions: "Gokarna Beach, Mahabaleshwar Temple, Gokarna Town" },
      { name: "Chikmagalur", slug: "chikmagalur", attractions: "Coffee Estates, Mullayanagiri, Chikmagalur Town" },
      { name: "Udupi", slug: "udupi", attractions: "Sri Krishna Temple, Udupi Beach, Udupi Town" },
      { name: "Mangalore", slug: "mangalore", attractions: "Mangalore Beach, Mangalore Port, Mangalore Town" },
      { name: "Hubli", slug: "hubli", attractions: "Hubli Town, Chandramouleshwara Temple" },
      { name: "Belgaum", slug: "belgaum", attractions: "Belgaum Fort, Belgaum Town" },
      { name: "Bijapur", slug: "bijapur", attractions: "Gol Gumbaz, Ibrahim Rauza, Bijapur Town" },
      { name: "Gulbarga", slug: "gulbarga", attractions: "Gulbarga Fort, Gulbarga Town" },
    ],
  },
  {
    state: "Kerala",
    slug: "kerala",
    metaTitle: "Kerala Tours - God's Own Country",
    metaDescription: "Experience Kerala's backwaters, beaches, and lush green landscapes.",
    cities: [
      { name: "Kochi", slug: "kochi", attractions: "Chinese Fishing Nets, Fort Kochi, Spice Markets, Jewish Synagogue" },
      { name: "Thiruvananthapuram", slug: "thiruvananthapuram", attractions: "Padmanabha Swamy Temple, Beaches, Thiruvananthapuram Palace" },
      { name: "Munnar", slug: "munnar", attractions: "Tea Gardens, Anamudi Peak, Eravikulam, Munnar Town" },
      { name: "Alleppey", slug: "alleppey", attractions: "Backwaters, Houseboat Cruises, Alleppey Beach" },
      { name: "Thekkady", slug: "thekkady", attractions: "Periyar Wildlife Sanctuary, Spice Plantations, Thekkady Town" },
      { name: "Wayanad", slug: "wayanad", attractions: "Wayanad Wildlife Sanctuary, Chembra Peak, Wayanad Town" },
      { name: "Kannur", slug: "kannur", attractions: "Kannur Beach, Kannur Fort, Kannur Town" },
      { name: "Kasaragod", slug: "kasaragod", attractions: "Kasaragod Beach, Kasaragod Town" },
      { name: "Pathanamthitta", slug: "pathanamthitta", attractions: "Ayyappa Temple, Pathanamthitta Town" },
      { name: "Idukki", slug: "idukki", attractions: "Idukki Dam, Idukki Town" },
      { name: "Ernakulam", slug: "ernakulam", attractions: "Ernakulam Town, Ernakulam Shiva Temple" },
    ],
  },
  {
    state: "Madhya Pradesh",
    slug: "madhya-pradesh",
    metaTitle: "Madhya Pradesh Tours - Heart of India",
    metaDescription: "Discover Madhya Pradesh's ancient temples, diamond mines, and tribal culture.",
    cities: [
      { name: "Bhopal", slug: "bhopal", attractions: "Taj-ul-Masques, Sanchi Stupa, Upper Lake, Bhopal Museum" },
      { name: "Indore", slug: "indore", attractions: "Rajwada Palace, Lal Baag Palace, Indore Town" },
      { name: "Khajuraho", slug: "khajuraho", attractions: "Khajuraho Temples, Medieval Architecture, Khajuraho Town" },
      { name: "Gwalior", slug: "gwalior", attractions: "Gwalior Fort, Jai Vilas Palace, Gwalior Town" },
      { name: "Ujjain", slug: "ujjain", attractions: "Mahakaleshwar Temple, Kumbh Mela, Ujjain Town" },
      { name: "Mandu", slug: "mandu", attractions: "Mandu Fort, Jahaz Mahal, Mandu Town" },
      { name: "Jabalpur", slug: "jabalpur", attractions: "Marble Rocks, Jabalpur Town, Jabalpur Fort" },
      { name: "Pachmarhi", slug: "pachmarhi", attractions: "Pachmarhi Hill Station, Pachmarhi Town" },
      { name: "Omkareshwar", slug: "omkareshwar", attractions: "Omkareshwar Temple, Omkareshwar Town" },
      { name: "Maheshwar", slug: "maheshwar", attractions: "Maheshwar Temple, Maheshwar Town" },
      { name: "Burhanpur", slug: "burhanpur", attractions: "Burhanpur Town, Burhanpur Fort" },
    ],
  },
  {
    state: "Maharashtra",
    slug: "maharashtra",
    metaTitle: "Maharashtra Tours - Culture & Beaches",
    metaDescription: "Explore Maharashtra's vibrant culture, beaches, and historical monuments.",
    cities: [
      { name: "Mumbai", slug: "mumbai", attractions: "Gateway of India, Marine Drive, Taj Hotel, Elephanta Caves" },
      { name: "Pune", slug: "pune", attractions: "Aga Khan Palace, Shaniwar Wada, Pune Town" },
      { name: "Aurangabad", slug: "aurangabad", attractions: "Ajanta Caves, Ellora Caves, Aurangabad Town" },
      { name: "Nashik", slug: "nashik", attractions: "Trimbakeshwar Temple, Godavari River, Nashik Town" },
      { name: "Kolhapur", slug: "kolhapur", attractions: "Mahalakshmi Temple, Rankala Lake, Kolhapur Town" },
      { name: "Lonavala", slug: "lonavala", attractions: "Bhushi Dam, Karla Caves, Lonavala Town" },
      { name: "Khandala", slug: "khandala", attractions: "Khandala Town, Khandala Hill Station" },
      { name: "Nagpur", slug: "nagpur", attractions: "Nagpur Town, Nagpur Orange" },
      { name: "Amravati", slug: "amravati", attractions: "Amravati Town, Amravati Temple" },
      { name: "Akola", slug: "akola", attractions: "Akola Town, Akola Fort" },
      { name: "Ratnagiri", slug: "ratnagiri", attractions: "Ratnagiri Beach, Ratnagiri Town" },
      { name: "Sindhudurg", slug: "sindhudurg", attractions: "Sindhudurg Fort, Sindhudurg Town" },
    ],
  },
  {
    state: "Manipur",
    slug: "manipur",
    metaTitle: "Manipur Tours - Jewel of Northeast",
    metaDescription: "Discover Manipur's pristine lakes, temples, and vibrant tribal culture.",
    cities: [
      { name: "Imphal", slug: "imphal", attractions: "Loktak Lake, Kangla Fort, Shree Govindajee Temple, Imphal Town" },
      { name: "Ukhrul", slug: "ukhrul", attractions: "Ukhrul District, Shirui Peak, Ukhrul Town" },
      { name: "Moirang", slug: "moirang", attractions: "Moirang Manipuri Sahitya Parishat, Moirang Town" },
      { name: "Thoubal", slug: "thoubal", attractions: "Thoubal Town, Thoubal District" },
      { name: "Bishnupur", slug: "bishnupur", attractions: "Bishnupur Town, Bishnupur District" },
    ],
  },
  {
    state: "Meghalaya",
    slug: "meghalaya",
    metaTitle: "Meghalaya Tours - Abode of Clouds",
    metaDescription: "Experience Meghalaya's living root bridges, waterfalls, and misty hills.",
    cities: [
      { name: "Shillong", slug: "shillong", attractions: "Khasi Hills, Shillong Peak, Ward Lake, Shillong Town" },
      { name: "Cherrapunji", slug: "cherrapunji", attractions: "Living Root Bridges, Nohkalikai Falls, Cherrapunji Town" },
      { name: "Mawlynnong", slug: "mawlynnong", attractions: "Cleanest Village, Mawlynnong Falls, Mawlynnong Town" },
      { name: "Tura", slug: "tura", attractions: "Garo Hills, Tura Peak, Tura Town" },
      { name: "Jowai", slug: "jowai", attractions: "Jowai Town, Jowai District" },
      { name: "Nongstoin", slug: "nongstoin", attractions: "Nongstoin Town, Nongstoin District" },
    ],
  },
  {
    state: "Mizoram",
    slug: "mizoram",
    metaTitle: "Mizoram Tours - Land of Blue Mountains",
    metaDescription: "Explore Mizoram's scenic beauty, tribal villages, and bamboo forests.",
    cities: [
      { name: "Aizawl", slug: "aizawl", attractions: "Aizawl City, Durtlang Hills, Aizawl Town" },
      { name: "Lunglei", slug: "lunglei", attractions: "Lunglei District, Tlabung, Lunglei Town" },
      { name: "Champhai", slug: "champhai", attractions: "Champhai District, Tam Dil Lake, Champhai Town" },
      { name: "Saiha", slug: "saiha", attractions: "Saiha Town, Saiha District" },
      { name: "Kolasib", slug: "kolasib", attractions: "Kolasib Town, Kolasib District" },
    ],
  },
  {
    state: "Nagaland",
    slug: "nagaland",
    metaTitle: "Nagaland Tours - Tribal Festivals",
    metaDescription: "Experience Nagaland's unique tribal culture, festivals, and traditions.",
    cities: [
      { name: "Kohima", slug: "kohima", attractions: "Kohima City, Nagaland State Museum, Kohima Town" },
      { name: "Dimapur", slug: "dimapur", attractions: "Dimapur City, Chumukedima, Dimapur Town" },
      { name: "Mokokchung", slug: "mokokchung", attractions: "Mokokchung District, Ungma Village, Mokokchung Town" },
      { name: "Wokha", slug: "wokha", attractions: "Wokha Town, Wokha District" },
      { name: "Tuensang", slug: "tuensang", attractions: "Tuensang Town, Tuensang District" },
    ],
  },
  {
    state: "Odisha",
    slug: "odisha",
    metaTitle: "Odisha Tours - Temples & Beaches",
    metaDescription: "Discover Odisha's ancient temples, beaches, and tribal art forms.",
    cities: [
      { name: "Bhubaneswar", slug: "bhubaneswar", attractions: "Lingaraj Temple, Odisha Museum, Bhubaneswar Town" },
      { name: "Puri", slug: "puri", attractions: "Jagannath Temple, Puri Beach, Puri Town" },
      { name: "Konark", slug: "konark", attractions: "Konark Sun Temple, Chandrabhaga Beach, Konark Town" },
      { name: "Cuttack", slug: "cuttack", attractions: "Barabati Fort, Odisha Textile Museum, Cuttack Town" },
      { name: "Rourkela", slug: "rourkela", attractions: "Rourkela Steel Plant, Hanuman Vatika, Rourkela Town" },
      { name: "Balasore", slug: "balasore", attractions: "Balasore Beach, Balasore Town" },
      { name: "Sambalpur", slug: "sambalpur", attractions: "Sambalpur Town, Hirakud Dam" },
      { name: "Berhampur", slug: "berhampur", attractions: "Berhampur Beach, Berhampur Town" },
    ],
  },
  {
    state: "Punjab",
    slug: "punjab",
    metaTitle: "Punjab Tours - Land of Five Rivers",
    metaDescription: "Experience Punjab's vibrant culture, temples, and agricultural heritage.",
    cities: [
      { name: "Amritsar", slug: "amritsar", attractions: "Golden Temple, Jallianwala Bagh, Amritsar Town" },
      { name: "Chandigarh", slug: "chandigarh-punjab", attractions: "Rock Garden, Sukhna Lake, Chandigarh Town" },
      { name: "Ludhiana", slug: "ludhiana", attractions: "Phillaur Fort, Lodhi Fort, Ludhiana Town" },
      { name: "Jalandhar", slug: "jalandhar", attractions: "Devi Talab Mandir, Pushpa Gujral Science City, Jalandhar Town" },
      { name: "Patiala", slug: "patiala", attractions: "Patiala Palace, Patiala Town" },
      { name: "Bathinda", slug: "bathinda", attractions: "Bathinda Fort, Bathinda Town" },
      { name: "Mohali", slug: "mohali", attractions: "Mohali Town, Mohali Cricket Stadium" },
      { name: "Kapurthala", slug: "kapurthala", attractions: "Kapurthala Palace, Kapurthala Town" },
    ],
  },
  {
    state: "Rajasthan",
    slug: "rajasthan",
    metaTitle: "Rajasthan Tours - Land of Kings",
    metaDescription: "Explore Rajasthan's magnificent forts, palaces, and desert landscapes.",
    cities: [
      { name: "Jaipur", slug: "jaipur", attractions: "City Palace, Hawa Mahal, Jantar Mantar, Jaipur Town" },
      { name: "Jodhpur", slug: "jodhpur", attractions: "Mehrangarh Fort, Blue City, Jodhpur Town" },
      { name: "Udaipur", slug: "udaipur", attractions: "City Palace, Lake Pichola, Jag Mandir, Udaipur Town" },
      { name: "Pushkar", slug: "pushkar", attractions: "Pushkar Lake, Brahma Temple, Camel Fair, Pushkar Town" },
      { name: "Jaisalmer", slug: "jaisalmer", attractions: "Jaisalmer Fort, Sam Sand Dunes, Jaisalmer Town" },
      { name: "Mount Abu", slug: "mount-abu", attractions: "Dilwara Temples, Nakki Lake, Mount Abu Town" },
      { name: "Bikaner", slug: "bikaner", attractions: "Bikaner Fort, Bikaner Palace, Bikaner Town" },
      { name: "Ajmer", slug: "ajmer", attractions: "Ajmer Sharif, Ajmer Town" },
      { name: "Alwar", slug: "alwar", attractions: "Alwar Fort, Alwar Palace, Alwar Town" },
      { name: "Bharatpur", slug: "bharatpur", attractions: "Keoladeo National Park, Bharatpur Fort, Bharatpur Town" },
      { name: "Chittorgarh", slug: "chittorgarh", attractions: "Chittorgarh Fort, Chittorgarh Town" },
      { name: "Kota", slug: "kota", attractions: "Kota Fort, Kota Palace, Kota Town" },
    ],
  },
  {
    state: "Sikkim",
    slug: "sikkim",
    metaTitle: "Sikkim Tours - Mountain Paradise",
    metaDescription: "Experience Sikkim's majestic mountains, monasteries, and pristine nature.",
    cities: [
      { name: "Gangtok", slug: "gangtok", attractions: "Rumtek Monastery, Kanyak Kumari Statue, Gangtok Town" },
      { name: "Pelling", slug: "pelling", attractions: "Pelling Monastery, Kanyak Kumari Statue, Pelling Town" },
      { name: "Darjeeling", slug: "darjeeling-sikkim", attractions: "Tea Gardens, Toy Train, Darjeeling Town" },
      { name: "Lachung", slug: "lachung", attractions: "Yumthang Valley, Yumthang Hot Springs, Lachung Town" },
      { name: "Namchi", slug: "namchi", attractions: "Namchi Town, Namchi District" },
      { name: "Geyzing", slug: "geyzing", attractions: "Geyzing Town, Geyzing District" },
    ],
  },
  {
    state: "Tamil Nadu",
    slug: "tamil-nadu",
    metaTitle: "Tamil Nadu Tours - South Indian Heritage",
    metaDescription: "Discover Tamil Nadu's ancient temples, beaches, and cultural treasures.",
    cities: [
      { name: "Chennai", slug: "chennai", attractions: "Marina Beach, Kapaleeshwarar Temple, Chennai Town" },
      { name: "Madurai", slug: "madurai", attractions: "Meenakshi Temple, Thirumalai Nayak Palace, Madurai Town" },
      { name: "Ooty", slug: "ooty", attractions: "Nilgiri Mountain Railway, Botanical Gardens, Ooty Town" },
      { name: "Kanyakumari", slug: "kanyakumari", attractions: "Vivekananda Rock, Thiruvalluvar Statue, Kanyakumari Town" },
      { name: "Pondicherry", slug: "pondicherry", attractions: "Auroville, French Quarter, Pondicherry Town" },
      { name: "Rameshwaram", slug: "rameshwaram", attractions: "Ramanatha Swamy Temple, Adam's Bridge, Rameshwaram Town" },
      { name: "Coimbatore", slug: "coimbatore", attractions: "Coimbatore Town, Nilgiri Hills" },
      { name: "Tirupati", slug: "tirupati-tn", attractions: "Tirupati Temple, Tirupati Town" },
      { name: "Chidambaram", slug: "chidambaram", attractions: "Chidambaram Temple, Chidambaram Town" },
      { name: "Thanjavur", slug: "thanjavur", attractions: "Brihadeeswarar Temple, Thanjavur Town" },
      { name: "Trichy", slug: "trichy", attractions: "Ranganathaswamy Temple, Trichy Town" },
      { name: "Nagercoil", slug: "nagercoil", attractions: "Nagercoil Town, Nagercoil District" },
    ],
  },
  {
    state: "Telangana",
    slug: "telangana",
    metaTitle: "Telangana Tours - Modern & Historic",
    metaDescription: "Explore Telangana's blend of modern development and historic monuments.",
    cities: [
      { name: "Hyderabad", slug: "hyderabad-telangana", attractions: "Charminar, Golconda Fort, Hyderabad Town" },
      { name: "Warangal", slug: "warangal-telangana", attractions: "Warangal Fort, Thousand Pillar Temple, Warangal Town" },
      { name: "Nizamabad", slug: "nizamabad", attractions: "Nizamabad Fort, Ganesh Temple, Nizamabad Town" },
      { name: "Karimnagar", slug: "karimnagar", attractions: "Karimnagar Town, Karimnagar District" },
      { name: "Khammam", slug: "khammam", attractions: "Khammam Town, Khammam District" },
    ],
  },
  {
    state: "Tripura",
    slug: "tripura",
    metaTitle: "Tripura Tours - Northeast Gem",
    metaDescription: "Discover Tripura's palaces, temples, and tribal heritage.",
    cities: [
      { name: "Agartala", slug: "agartala", attractions: "Ujjayanta Palace, Jagannath Temple, Agartala Town" },
      { name: "Udaipur", slug: "udaipur-tripura", attractions: "Ujjayanta Palace, Tripura Sundari Temple, Udaipur Town" },
      { name: "Dharmanagar", slug: "dharmanagar", attractions: "Dharmanagar Town, Dharmanagar District" },
      { name: "Kailashahar", slug: "kailashahar", attractions: "Kailashahar Town, Kailashahar District" },
    ],
  },
  {
    state: "Uttar Pradesh",
    slug: "uttar-pradesh",
    metaTitle: "Uttar Pradesh Tours - Spiritual Journey",
    metaDescription: "Experience Uttar Pradesh's sacred sites, monuments, and cultural heritage.",
    cities: [
      { name: "Agra", slug: "agra", attractions: "Taj Mahal, Agra Fort, Fatehpur Sikri, Agra Town" },
      { name: "Varanasi", slug: "varanasi", attractions: "Kashi Vishwanath Temple, Ghat, Sarnath, Varanasi Town" },
      { name: "Lucknow", slug: "lucknow", attractions: "Bara Imambara, Chota Imambara, Lucknow Town" },
      { name: "Mathura", slug: "mathura", attractions: "Krishna Janmabhoomi, Dwarkadhish Temple, Mathura Town" },
      { name: "Vrindavan", slug: "vrindavan", attractions: "Banke Bihari Temple, Radha Raman Temple, Vrindavan Town" },
      { name: "Ayodhya", slug: "ayodhya", attractions: "Ram Mandir, Hanuman Garhi, Ayodhya Town" },
      { name: "Kanpur", slug: "kanpur", attractions: "Kanpur Town, Kanpur Fort" },
      { name: "Meerut", slug: "meerut", attractions: "Meerut Town, Meerut Fort" },
      { name: "Allahabad", slug: "allahabad", attractions: "Sangam, Allahabad Fort, Allahabad Town" },
      { name: "Gorakhpur", slug: "gorakhpur", attractions: "Gorakhpur Town, Gorakhpur District" },
      { name: "Bareilly", slug: "bareilly", attractions: "Bareilly Town, Bareilly Fort" },
      { name: "Moradabad", slug: "moradabad", attractions: "Moradabad Town, Moradabad Brass Work" },
    ],
  },
  {
    state: "Uttarakhand",
    slug: "uttarakhand",
    metaTitle: "Uttarakhand Tours - Land of Gods",
    metaDescription: "Explore Uttarakhand's sacred temples, mountains, and adventure activities.",
    cities: [
      { name: "Dehradun", slug: "dehradun", attractions: "Robber's Cave, Sahastradhara, Dehradun Town" },
      { name: "Rishikesh", slug: "rishikesh", attractions: "Yoga Capital, Ghat, Adventure Sports, Rishikesh Town" },
      { name: "Haridwar", slug: "haridwar", attractions: "Har Ki Pauri, Mansa Devi Temple, Haridwar Town" },
      { name: "Nainital", slug: "nainital", attractions: "Naini Lake, Naina Devi Temple, Nainital Town" },
      { name: "Auli", slug: "auli", attractions: "Skiing, Mountain Views, Auli Town" },
      { name: "Chopta", slug: "chopta", attractions: "Tungnath Temple, Chandrashila Peak, Chopta Town" },
      { name: "Mussoorie", slug: "mussoorie", attractions: "Mussoorie Town, Mussoorie Mall Road" },
      { name: "Almora", slug: "almora", attractions: "Almora Town, Almora Fort" },
      { name: "Pithoragarh", slug: "pithoragarh", attractions: "Pithoragarh Town, Pithoragarh District" },
      { name: "Bageshwar", slug: "bageshwar", attractions: "Bageshwar Town, Bageshwar District" },
    ],
  },
  {
    state: "West Bengal",
    slug: "west-bengal",
    metaTitle: "West Bengal Tours - Culture & Nature",
    metaDescription: "Discover West Bengal's literary heritage, mountains, and cultural attractions.",
    cities: [
      { name: "Kolkata", slug: "kolkata", attractions: "Victoria Memorial, Howrah Bridge, Kolkata Town" },
      { name: "Darjeeling", slug: "darjeeling-wb", attractions: "Tea Gardens, Toy Train, Kanyak Kumari, Darjeeling Town" },
      { name: "Siliguri", slug: "siliguri", attractions: "Mahananda Wildlife Sanctuary, Siliguri Town" },
      { name: "Sundarbans", slug: "sundarbans", attractions: "Sundarbans National Park, Tiger Reserve, Sundarbans Town" },
      { name: "Santiniketan", slug: "santiniketan", attractions: "Santiniketan Town, Tagore University" },
      { name: "Kalimpong", slug: "kalimpong", attractions: "Kalimpong Town, Kalimpong Hill Station" },
      { name: "Asansol", slug: "asansol", attractions: "Asansol Town, Asansol Industrial Area" },
      { name: "Durgapur", slug: "durgapur", attractions: "Durgapur Town, Durgapur Steel Plant" },
    ],
  },
  // Union Territories
  {
    state: "Andaman and Nicobar Islands",
    slug: "andaman-nicobar",
    metaTitle: "Andaman & Nicobar Tours - Island Paradise",
    metaDescription: "Experience the pristine beaches and marine life of Andaman and Nicobar Islands.",
    cities: [
      { name: "Port Blair", slug: "port-blair", attractions: "Cellular Jail, Radhanagar Beach, Port Blair Town" },
      { name: "Havelock Island", slug: "havelock-island", attractions: "Radhanagar Beach, Diving, Havelock Town" },
      { name: "Neil Island", slug: "neil-island", attractions: "Beaches, Snorkeling, Neil Island Town" },
      { name: "Long Island", slug: "long-island", attractions: "Long Island Town, Long Island Beach" },
      { name: "Baratang Island", slug: "baratang-island", attractions: "Baratang Island, Limestone Caves" },
    ],
  },
  {
    state: "Chandigarh",
    slug: "chandigarh-ut",
    metaTitle: "Chandigarh Tours - Modern City",
    metaDescription: "Explore Chandigarh's modern architecture, gardens, and cultural attractions.",
    cities: [
      { name: "Chandigarh City", slug: "chandigarh-city", attractions: "Rock Garden, Sukhna Lake, Capitol Complex, Chandigarh Town" },
      { name: "Sector 17", slug: "sector-17", attractions: "Sector 17 Plaza, Shopping District" },
      { name: "Sector 35", slug: "sector-35", attractions: "Sector 35 Market, Shopping Area" },
    ],
  },
  {
    state: "Dadra and Nagar Haveli",
    slug: "dadra-nagar-haveli",
    metaTitle: "Dadra & Nagar Haveli Tours - Tribal Heritage",
    metaDescription: "Discover Dadra and Nagar Haveli's tribal culture and natural beauty.",
    cities: [
      { name: "Silvassa", slug: "silvassa", attractions: "Silvassa City, Tribal Museum, Silvassa Town" },
      { name: "Dadra", slug: "dadra", attractions: "Dadra Town, Dadra District" },
      { name: "Nagar Haveli", slug: "nagar-haveli", attractions: "Nagar Haveli Town, Nagar Haveli District" },
    ],
  },
  {
    state: "Daman and Diu",
    slug: "daman-diu",
    metaTitle: "Daman & Diu Tours - Coastal Beauty",
    metaDescription: "Explore Daman and Diu's beaches, forts, and Portuguese heritage.",
    cities: [
      { name: "Daman", slug: "daman", attractions: "Daman Fort, Devka Beach, Daman Town" },
      { name: "Diu", slug: "diu", attractions: "Diu Fort, Nagoa Beach, Diu Town" },
      { name: "Nani Daman", slug: "nani-daman", attractions: "Nani Daman Town, Nani Daman District" },
    ],
  },
  {
    state: "Delhi",
    slug: "delhi",
    metaTitle: "Delhi Tours - Capital City",
    metaDescription: "Experience Delhi's monuments, museums, and vibrant culture.",
    cities: [
      { name: "New Delhi", slug: "new-delhi", attractions: "India Gate, Rashtrapati Bhavan, Red Fort, New Delhi Town" },
      { name: "Old Delhi", slug: "old-delhi", attractions: "Jama Masjid, Chandni Chowk, Old Delhi Town" },
      { name: "South Delhi", slug: "south-delhi", attractions: "South Delhi Market, South Delhi Town" },
      { name: "East Delhi", slug: "east-delhi", attractions: "East Delhi Town, East Delhi Market" },
      { name: "West Delhi", slug: "west-delhi", attractions: "West Delhi Town, West Delhi Market" },
    ],
  },
  {
    state: "Ladakh",
    slug: "ladakh",
    metaTitle: "Ladakh Tours - High Altitude Adventure",
    metaDescription: "Explore Ladakh's stunning mountains, monasteries, and adventure activities.",
    cities: [
      { name: "Leh", slug: "leh", attractions: "Leh Palace, Shanti Stupa, Leh Bazaar, Leh Town" },
      { name: "Kargil", slug: "kargil", attractions: "Kargil War Memorial, Dras, Kargil Town" },
      { name: "Nubra Valley", slug: "nubra-valley", attractions: "Nubra Valley, Bactrian Camels, Nubra Town" },
      { name: "Pangong Lake", slug: "pangong-lake", attractions: "Pangong Lake, Pangong Town" },
      { name: "Khardung La", slug: "khardung-la", attractions: "Khardung La Pass, Khardung La Town" },
    ],
  },
  {
    state: "Lakshadweep",
    slug: "lakshadweep",
    metaTitle: "Lakshadweep Tours - Island Escape",
    metaDescription: "Discover Lakshadweep's coral islands, beaches, and water sports.",
    cities: [
      { name: "Kavarati", slug: "kavarati", attractions: "Kavarati Island, Beaches, Kavarati Town" },
      { name: "Agatti", slug: "agatti", attractions: "Agatti Island, Diving, Agatti Town" },
      { name: "Minicoy", slug: "minicoy", attractions: "Minicoy Island, Minicoy Town" },
      { name: "Androth", slug: "androth", attractions: "Androth Island, Androth Town" },
    ],
  },
  {
    state: "Puducherry",
    slug: "puducherry",
    metaTitle: "Puducherry Tours - French Charm",
    metaDescription: "Experience Puducherry's French colonial architecture and spiritual atmosphere.",
    cities: [
      { name: "Puducherry City", slug: "puducherry-city", attractions: "Auroville, French Quarter, Beach, Puducherry Town" },
      { name: "Karaikal", slug: "karaikal", attractions: "Karaikal Beach, Temples, Karaikal Town" },
      { name: "Yanam", slug: "yanam", attractions: "Yanam Town, Yanam District" },
      { name: "Mahe", slug: "mahe", attractions: "Mahe Town, Mahe District" },
    ],
  },
];

async function importAllIndianCities() {
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
    let statesCreated = 0;
    let citiesCreated = 0;
    let citiesUpdated = 0;

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
      } else {
        // Insert new state
        const [result] = await connection.query(
          "INSERT INTO states (countryId, name, slug, metaTitle, metaDescription) VALUES (?, ?, ?, ?, ?)",
          [countryId, stateData.state, stateData.slug, stateData.metaTitle, stateData.metaDescription]
        );
        stateId = result.insertId;
        statesCreated++;
      }

      // Insert or update cities for this state
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
          citiesUpdated++;
        } else {
          // Insert new city
          await connection.query(
            "INSERT INTO locations (stateId, name, slug, description) VALUES (?, ?, ?, ?)",
            [stateId, city.name, city.slug, city.attractions]
          );
          citiesCreated++;
        }
      }

      console.log(`✓ ${stateData.state}: ${stateData.cities.length} cities`);
    }

    console.log("\n✅ Import Complete!");
    console.log(`States Created: ${statesCreated}`);
    console.log(`Cities Created: ${citiesCreated}`);
    console.log(`Cities Updated: ${citiesUpdated}`);
    console.log(`Total Cities: ${citiesCreated + citiesUpdated}`);
  } catch (error) {
    console.error("Error importing cities:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importAllIndianCities();

-- Import 11 Kerala Tour Packages from Pikme.org
-- Tours without images - to be added manually from admin panel

INSERT INTO tours (name, slug, description, duration, price, image, difficulty, bestTime, highlights, itinerary, inclusions, exclusions, metaTitle, metaDescription, createdAt, updatedAt) VALUES

-- Tour 1: Kerala Spiritual Tour Package
('Kerala Spiritual Tour Package', 'kerala-spiritual-tour-package', 
'Experience the spiritual essence of Kerala with visits to ancient temples, ashrams, and sacred sites. Connect with the spiritual traditions and peaceful ambiance of God\'s Own Country.', 
5, 16000, '', 'easy', 'October to March', 
'["Temple visits", "Spiritual experiences", "Yoga and meditation", "Sacred sites", "Local traditions", "Peaceful ambiance"]', 
'[{"day": 1, "title": "Arrival in Kerala", "description": "Arrive and settle into accommodation. Evening temple visit."}, {"day": 2, "title": "Spiritual exploration", "description": "Visit ancient temples and ashrams. Participate in yoga and meditation sessions."}, {"day": 3, "title": "Sacred sites tour", "description": "Explore more spiritual destinations and sacred locations."}, {"day": 4, "title": "Wellness activities", "description": "Ayurvedic treatments and wellness sessions."}, {"day": 5, "title": "Departure", "description": "Final spiritual experience and departure."}]', 
'["Accommodation", "Meals", "Temple entries", "Yoga sessions", "Guide services"]', 
'["Flights", "Personal expenses", "Activities not mentioned"]', 
'Kerala Spiritual Tour Package - 5 Days', 
'Spiritual tour of Kerala with temples, yoga, meditation and sacred sites', 
NOW(), NOW()),

-- Tour 2: Kannur Wayanad Kozhikode Thrissur Tour
('Kannur Wayanad Kozhikode Thrissur Tour', 'kannur-wayanad-kozhikode-thrissur-tour', 
'Explore the diverse beauty of North Kerala with visits to Kannur, Wayanad, Kozhikode, and Thrissur. Experience beaches, backwaters, historical sites, and cultural heritage.', 
6, 24000, '', 'moderate', 'October to May', 
'["Beach exploration", "Backwater cruises", "Historical sites", "Cultural heritage", "Wildlife viewing", "Local experiences"]', 
'[{"day": 1, "title": "Kannur arrival", "description": "Arrive in Kannur, explore beaches and forts."}, {"day": 2, "title": "Wayanad adventure", "description": "Travel to Wayanad, explore caves and waterfalls."}, {"day": 3, "title": "Kozhikode exploration", "description": "Visit Kozhikode (Calicut) and explore historical sites."}, {"day": 4, "title": "Thrissur temples", "description": "Visit Thrissur temples and cultural landmarks."}, {"day": 5, "title": "Backwater cruise", "description": "Enjoy backwater cruise and local experiences."}, {"day": 6, "title": "Departure", "description": "Final sightseeing and departure."}]', 
'["Accommodation", "Meals", "Transportation", "Guide services", "Entry fees"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Kannur Wayanad Kozhikode Thrissur Tour - 6 Days', 
'North Kerala tour covering Kannur, Wayanad, Kozhikode and Thrissur', 
NOW(), NOW()),

-- Tour 3: Kochi Munnar Thekkady Alappuzha Tour
('Kochi Munnar Thekkady Alappuzha Tour', 'kochi-munnar-thekkady-alappuzha-tour', 
'Discover the complete Kerala experience from Kochi to Munnar, Thekkady, and Alappuzha. Experience tea gardens, wildlife sanctuaries, backwaters, and houseboat cruises.', 
7, 32000, '', 'moderate', 'October to May', 
'["Tea gardens", "Wildlife sanctuaries", "Backwater cruises", "Houseboat experience", "Spice plantations", "Scenic beauty"]', 
'[{"day": 1, "title": "Kochi arrival", "description": "Arrive in Kochi, explore Fort Kochi and spice markets."}, {"day": 2, "title": "Munnar journey", "description": "Travel to Munnar, explore tea gardens and scenic views."}, {"day": 3, "title": "Munnar trekking", "description": "Trek through tea gardens and visit viewpoints."}, {"day": 4, "title": "Thekkady wildlife", "description": "Travel to Thekkady, explore wildlife sanctuary."}, {"day": 5, "title": "Spice plantation tour", "description": "Visit spice plantations and enjoy local cuisine."}, {"day": 6, "title": "Alappuzha backwaters", "description": "Travel to Alappuzha, enjoy houseboat cruise."}, {"day": 7, "title": "Departure", "description": "Final activities and departure."}]', 
'["Accommodation", "Meals", "Transportation", "Houseboat cruise", "Guide services", "Entry fees"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Kochi Munnar Thekkady Alappuzha Tour - 7 Days', 
'Complete Kerala tour with tea gardens, wildlife, backwaters and houseboat cruises', 
NOW(), NOW()),

-- Tour 4: Wayanad Tour - Wildlife, Caves & Heritage
('Wayanad Tour: Wildlife, Caves & Heritage', 'wayanad-tour-wildlife-caves-heritage', 
'Immerse yourself in Wayanad\'s natural and cultural wealth. Explore wildlife sanctuaries, ancient caves, waterfalls, and heritage sites. Perfect for adventure and nature lovers.', 
4, 19000, '', 'moderate', 'September to May', 
'["Wildlife viewing", "Cave exploration", "Waterfalls", "Heritage sites", "Adventure activities", "Nature trekking"]', 
'[{"day": 1, "title": "Wayanad arrival", "description": "Arrive in Wayanad, settle and explore local areas."}, {"day": 2, "title": "Wildlife safari", "description": "Wildlife sanctuary tour and nature walk."}, {"day": 3, "title": "Caves and waterfalls", "description": "Explore caves, waterfalls, and adventure activities."}, {"day": 4, "title": "Heritage and departure", "description": "Visit heritage sites and depart."}]', 
'["Accommodation", "Meals", "Guide services", "Safari entry", "Transportation"]', 
'["Flights", "Personal expenses", "Activities not mentioned"]', 
'Wayanad Tour: Wildlife, Caves & Heritage - 4 Days', 
'Wayanad adventure tour with wildlife, caves, waterfalls and heritage sites', 
NOW(), NOW()),

-- Tour 5: Munnar Thekkady Alleppey Tour
('Munnar Thekkady Alleppey Tour', 'munnar-thekkady-alleppey-tour', 
'Experience the best of Kerala\'s hill stations and backwaters. Visit Munnar tea gardens, Thekkady wildlife sanctuary, and enjoy Alleppey houseboat cruises.', 
5, 23000, '', 'easy', 'October to May', 
'["Tea gardens", "Wildlife viewing", "Backwater cruises", "Houseboat experience", "Scenic views", "Local culture"]', 
'[{"day": 1, "title": "Munnar arrival", "description": "Arrive in Munnar, explore tea gardens and viewpoints."}, {"day": 2, "title": "Munnar exploration", "description": "Trek through tea gardens and visit scenic spots."}, {"day": 3, "title": "Thekkady wildlife", "description": "Travel to Thekkady, wildlife sanctuary tour."}, {"day": 4, "title": "Alleppey backwaters", "description": "Travel to Alleppey, enjoy houseboat cruise."}, {"day": 5, "title": "Departure", "description": "Final activities and departure."}]', 
'["Accommodation", "Meals", "Transportation", "Houseboat cruise", "Guide services"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Munnar Thekkady Alleppey Tour - 5 Days', 
'Kerala hill stations and backwaters tour with tea gardens and houseboat cruises', 
NOW(), NOW()),

-- Tour 6: Sabarimala Pilgrimage Tour via Kochi
('Sabarimala Pilgrimage Tour via Kochi', 'sabarimala-pilgrimage-tour-via-kochi', 
'Sacred pilgrimage journey to Sabarimala temple starting from Kochi. Experience spiritual traditions, temple rituals, and the natural beauty of Western Ghats.', 
5, 14000, '', 'moderate', 'October to January', 
'["Temple pilgrimage", "Spiritual experience", "Western Ghats views", "Temple rituals", "Darshan", "Local traditions"]', 
'[{"day": 1, "title": "Kochi arrival", "description": "Arrive in Kochi, explore the city."}, {"day": 2, "title": "Journey to Sabarimala", "description": "Travel to Sabarimala base camp."}, {"day": 3, "title": "Sabarimala temple trek", "description": "Trek to temple, participate in darshan and rituals."}, {"day": 4, "title": "Spiritual experience", "description": "Continue temple activities and exploration."}, {"day": 5, "title": "Return and departure", "description": "Return journey and departure."}]', 
'["Accommodation", "Meals", "Guide services", "Temple entry", "Transportation"]', 
'["Flights", "Personal items", "Activities not mentioned"]', 
'Sabarimala Pilgrimage Tour via Kochi - 5 Days', 
'Sacred pilgrimage to Sabarimala temple with spiritual experiences and Western Ghats views', 
NOW(), NOW()),

-- Tour 7: Kerala Hills Temples Tour - Munnar Thrissur
('Kerala Hills Temples Tour: Munnar Thrissur', 'kerala-hills-temples-tour-munnar-thrissur', 
'Explore Kerala\'s spiritual and natural beauty. Visit Munnar tea gardens and Thrissur temples. Experience the perfect blend of nature and spirituality.', 
4, 18000, '', 'easy', 'October to May', 
'["Tea gardens", "Temple visits", "Spiritual sites", "Scenic views", "Local culture", "Peaceful ambiance"]', 
'[{"day": 1, "title": "Munnar arrival", "description": "Arrive in Munnar, explore tea gardens."}, {"day": 2, "title": "Munnar trekking", "description": "Trek through scenic tea gardens and viewpoints."}, {"day": 3, "title": "Travel to Thrissur", "description": "Journey to Thrissur, explore temples."}, {"day": 4, "title": "Thrissur temples and departure", "description": "Visit more temples and depart."}]', 
'["Accommodation", "Meals", "Guide services", "Transportation", "Temple entries"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Kerala Hills Temples Tour: Munnar Thrissur - 4 Days', 
'Kerala tour combining tea gardens in Munnar and temples in Thrissur', 
NOW(), NOW()),

-- Tour 8: Munnar Thekkady Wildlife Tour - Kerala Hills
('Munnar Thekkady Wildlife Tour: Kerala Hills', 'munnar-thekkady-wildlife-tour-kerala-hills', 
'Adventure through Kerala\'s wildlife and scenic hills. Explore Munnar tea plantations and Thekkady wildlife sanctuary. Perfect for nature enthusiasts.', 
5, 21000, '', 'moderate', 'October to May', 
'["Tea gardens", "Wildlife viewing", "Scenic trekking", "Nature exploration", "Adventure activities", "Local experiences"]', 
'[{"day": 1, "title": "Munnar arrival", "description": "Arrive in Munnar, explore tea gardens and viewpoints."}, {"day": 2, "title": "Munnar trekking", "description": "Trek through tea gardens and scenic areas."}, {"day": 3, "title": "Travel to Thekkady", "description": "Journey to Thekkady wildlife sanctuary."}, {"day": 4, "title": "Wildlife safari", "description": "Wildlife sanctuary tour and nature walk."}, {"day": 5, "title": "Departure", "description": "Final activities and departure."}]', 
'["Accommodation", "Meals", "Guide services", "Safari entry", "Transportation"]', 
'["Flights", "Personal expenses", "Activities not mentioned"]', 
'Munnar Thekkady Wildlife Tour: Kerala Hills - 5 Days', 
'Wildlife and nature tour through Munnar tea gardens and Thekkady sanctuary', 
NOW(), NOW()),

-- Tour 9: Munnar Tea Gardens Waterfalls Nature Tour
('Munnar Tea Gardens Waterfalls Nature Tour', 'munnar-tea-gardens-waterfalls-nature-tour', 
'Discover the natural splendor of Munnar. Explore vast tea gardens, cascading waterfalls, and scenic viewpoints. A paradise for nature lovers and photographers.', 
3, 15000, '', 'easy', 'October to May', 
'["Tea gardens", "Waterfalls", "Scenic viewpoints", "Photography spots", "Nature trekking", "Local experiences"]', 
'[{"day": 1, "title": "Munnar arrival", "description": "Arrive in Munnar, explore local areas."}, {"day": 2, "title": "Tea gardens and waterfalls", "description": "Trek through tea gardens, visit waterfalls and viewpoints."}, {"day": 3, "title": "Scenic exploration and departure", "description": "Final scenic spots and departure."}]', 
'["Accommodation", "Meals", "Guide services", "Transportation"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Munnar Tea Gardens Waterfalls Nature Tour - 3 Days', 
'Nature tour of Munnar with tea gardens, waterfalls and scenic viewpoints', 
NOW(), NOW()),

-- Tour 10: Varkala Kovalam Beach Tour Package
('Varkala Kovalam Beach Tour Package', 'varkala-kovalam-beach-tour-package', 
'Relax on Kerala\'s most beautiful beaches. Experience Varkala and Kovalam with beach activities, water sports, and coastal beauty. Perfect for beach lovers.', 
4, 17000, '', 'easy', 'October to March', 
'["Beach relaxation", "Water sports", "Sunset views", "Coastal beauty", "Beach activities", "Local cuisine"]', 
'[{"day": 1, "title": "Varkala arrival", "description": "Arrive in Varkala, explore the beach."}, {"day": 2, "title": "Varkala beach activities", "description": "Beach relaxation, water sports, and local experiences."}, {"day": 3, "title": "Travel to Kovalam", "description": "Journey to Kovalam beach."}, {"day": 4, "title": "Kovalam and departure", "description": "Beach activities and departure."}]', 
'["Accommodation", "Meals", "Transportation", "Beach access"]', 
'["Flights", "Personal expenses", "Water sports not included"]', 
'Varkala Kovalam Beach Tour Package - 4 Days', 
'Beach tour of Kerala featuring Varkala and Kovalam beaches', 
NOW(), NOW()),

-- Tour 11: Wayanad Tour - Caves, Rivers & Rainforests (Duplicate - already imported)
('Wayanad Tour: Caves Rivers Rainforests Extended', 'wayanad-tour-caves-rivers-rainforests-extended', 
'Extended Wayanad adventure exploring caves, rivers, and rainforests. Experience wildlife, adventure activities, and immerse in nature. Perfect for adventure enthusiasts.', 
4, 20000, '', 'moderate', 'September to May', 
'["Cave exploration", "River activities", "Rainforest trekking", "Wildlife viewing", "Adventure sports", "Nature immersion"]', 
'[{"day": 1, "title": "Wayanad arrival", "description": "Arrive in Wayanad, explore local areas."}, {"day": 2, "title": "Cave and river exploration", "description": "Explore caves and river activities."}, {"day": 3, "title": "Rainforest trekking", "description": "Trek through rainforests and wildlife viewing."}, {"day": 4, "title": "Adventure and departure", "description": "Final adventure activities and departure."}]', 
'["Accommodation", "Meals", "Guide services", "Activity equipment", "Transportation"]', 
'["Flights", "Personal expenses", "Activities not mentioned"]', 
'Wayanad Tour: Caves Rivers Rainforests Extended - 4 Days', 
'Extended Wayanad adventure with caves, rivers, rainforests and wildlife', 
NOW(), NOW());

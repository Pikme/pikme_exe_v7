-- Import Kerala Tour Packages from Pikme.org
-- Tours: Wayanad, Sabarimala, Kochi to Kovalam, Kochi to Kanyakumari

INSERT INTO tours (name, slug, description, duration, price, image, difficulty, bestTime, highlights, itinerary, inclusions, exclusions, metaTitle, metaDescription, createdAt, updatedAt) VALUES

-- Tour 1: Wayanad Tour - Caves, Rivers & Rainforests
('Wayanad Tour: Caves, Rivers & Rainforests', 'wayanad-tour-caves-rivers-rainforests', 
'Explore the natural beauty of Wayanad with its stunning caves, cascading rivers, and lush rainforests. Experience wildlife, adventure activities, and local culture in this scenic destination.', 
3, 18000, 'https://images.pexels.com/photos/3532560/pexels-photo-3532560.jpeg', 'moderate', 'September to May', 
'["Caves exploration", "River adventures", "Rainforest trekking", "Wildlife viewing", "Local culture", "Adventure activities"]', 
'[{"day": 1, "title": "Arrival in Wayanad", "description": "Arrive in Wayanad, Kerala and settle into your accommodation. Evening local exploration."}, {"day": 2, "title": "Wayanad Wildlife and Nature Escapes", "description": "Visit caves, waterfalls, and nature reserves. Experience adventure activities and wildlife viewing."}, {"day": 3, "title": "Wayanad Farewell and Departure", "description": "Final sightseeing and departure from Wayanad."}]', 
'["Accommodation", "Meals", "Local guide", "Transportation", "Adventure activities"]', 
'["Flights", "Personal expenses", "Travel insurance"]', 
'Wayanad Tour: Caves, Rivers & Rainforests - 3 Days', 
'Explore caves, rivers, and rainforests in Wayanad with adventure activities and wildlife viewing', 
NOW(), NOW()),

-- Tour 2: Sabarimala Temple Tour Package Kerala
('Sabarimala Temple Tour Package Kerala', 'sabarimala-temple-tour-package-kerala', 
'Sacred pilgrimage to the holy Sabarimala temple in Kerala. Experience spiritual traditions, temple rituals, and the serene beauty of the Western Ghats. A spiritual journey for devotees and nature lovers.', 
4, 12000, 'https://images.pexels.com/photos/3532557/pexels-photo-3532557.jpeg', 'moderate', 'October to January', 
'["Temple pilgrimage", "Spiritual experience", "Western Ghats views", "Local traditions", "Darshan rituals", "Scenic beauty"]', 
'[{"day": 1, "title": "Arrival in Kerala", "description": "Arrive in Kerala and proceed to Sabarimala base camp."}, {"day": 2, "title": "Sabarimala Temple Trek", "description": "Trek to the holy Sabarimala temple with local guides. Participate in darshan and temple rituals."}, {"day": 3, "title": "Spiritual Experience", "description": "Continue temple visit and spiritual activities. Explore surrounding areas."}, {"day": 4, "title": "Departure", "description": "Return journey and departure from Kerala."}]', 
'["Accommodation", "Meals", "Guide services", "Temple entry", "Transportation"]', 
'["Flights", "Personal items", "Travel insurance"]', 
'Sabarimala Temple Tour Package Kerala - 4 Days', 
'Sacred pilgrimage to Sabarimala temple with spiritual experiences and Western Ghats views', 
NOW(), NOW()),

-- Tour 3: Kochi to Kovalam Kerala Tour Package
('Kochi to Kovalam Kerala Tour Package', 'kochi-to-kovalam-kerala-tour-package', 
'Discover the beauty of Kerala from Kochi to Kovalam. Experience backwaters, beaches, houseboat cruises, and local culture. A perfect blend of adventure, relaxation, and cultural immersion.', 
5, 22000, 'https://images.pexels.com/photos/3408356/pexels-photo-3408356.jpeg', 'easy', 'October to March', 
'["Backwater cruises", "Houseboat experience", "Beach relaxation", "Local culture", "Spice markets", "Sunset views"]', 
'[{"day": 1, "title": "Arrival in Kochi", "description": "Arrive in Kochi, explore Fort Kochi and Chinese fishing nets."}, {"day": 2, "title": "Kochi exploration", "description": "Visit spice markets, historical sites, and local attractions."}, {"day": 3, "title": "Backwater cruise", "description": "Enjoy houseboat cruise through Kerala backwaters."}, {"day": 4, "title": "Journey to Kovalam", "description": "Travel to Kovalam beach and settle in."}, {"day": 5, "title": "Kovalam and departure", "description": "Beach relaxation and departure from Kovalam."}]', 
'["Accommodation", "Meals", "Houseboat cruise", "Guide services", "Transportation"]', 
'["Flights", "Personal expenses", "Activities not mentioned"]', 
'Kochi to Kovalam Kerala Tour Package - 5 Days', 
'Backwaters, beaches, and houseboat cruises from Kochi to Kovalam in Kerala', 
NOW(), NOW()),

-- Tour 4: Kochi to Kanyakumari Coast Heritage Tour
('Kochi to Kanyakumari Coast Heritage Tour', 'kochi-to-kanyakumari-coast-heritage-tour', 
'Experience the coastal heritage journey from Kochi to Kanyakumari. Visit historical sites, temples, beaches, and witness the meeting point of three seas. A unique blend of history, spirituality, and natural beauty.', 
6, 28000, 'https://images.pexels.com/photos/3915857/pexels-photo-3915857.jpeg', 'moderate', 'October to March', 
'["Coastal heritage sites", "Temples", "Three seas meeting point", "Beaches", "Historical monuments", "Sunset views"]', 
'[{"day": 1, "title": "Arrival in Kochi", "description": "Arrive in Kochi and explore the city."}, {"day": 2, "title": "Kochi heritage tour", "description": "Visit historical sites and cultural landmarks."}, {"day": 3, "title": "Journey south", "description": "Travel towards Kanyakumari, visit coastal towns."}, {"day": 4, "title": "Kanyakumari exploration", "description": "Visit Vivekananda Rock, Thiruvalluvar statue, and temples."}, {"day": 5, "title": "Kanyakumari sightseeing", "description": "Sunrise/sunset views and beach relaxation."}, {"day": 6, "title": "Departure", "description": "Final sightseeing and departure."}]', 
'["Accommodation", "Meals", "Guide services", "Transportation", "Temple entries"]', 
'["Flights", "Personal expenses", "Activities not included"]', 
'Kochi to Kanyakumari Coast Heritage Tour - 6 Days', 
'Coastal heritage journey from Kochi to Kanyakumari with temples, beaches, and historical sites', 
NOW(), NOW());

-- Seed script for populating sample states and cities for testing
-- Run this using: mysql -u user -p database < seed-data.sql

-- Insert States for India (assuming countryId = 1)
INSERT INTO states (countryId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
(1, 'Maharashtra', 'maharashtra', 'Explore the beautiful state of Maharashtra', 'Maharashtra Tours - Explore India\'s Most Vibrant State', 'Discover the best tours and travel packages in Maharashtra, from Mumbai to Pune and beyond.', 'Maharashtra tours, Mumbai tourism, Pune travel, Maharashtra packages', NOW(), NOW()),
(1, 'Kerala', 'kerala', 'Explore the beautiful state of Kerala', 'Kerala Tours - God\'s Own Country', 'Experience the backwaters, beaches, and spice plantations of Kerala.', 'Kerala tours, backwater cruises, Kochi travel, Kerala packages', NOW(), NOW()),
(1, 'Tamil Nadu', 'tamil-nadu', 'Explore the beautiful state of Tamil Nadu', 'Tamil Nadu Tours - South Indian Heritage', 'Discover ancient temples, beaches, and cultural heritage of Tamil Nadu.', 'Tamil Nadu tours, Chennai travel, Madurai temples, Tamil Nadu packages', NOW(), NOW()),
(1, 'Goa', 'goa', 'Explore the beautiful state of Goa', 'Goa Tours - Beaches & Culture', 'Relax on pristine beaches, explore Portuguese heritage, and enjoy Goa\'s vibrant nightlife.', 'Goa tours, beach holidays, Goa travel, Goa packages', NOW(), NOW()),
(1, 'Rajasthan', 'rajasthan', 'Explore the beautiful state of Rajasthan', 'Rajasthan Tours - Land of Kings', 'Experience the royal heritage, desert landscapes, and vibrant culture of Rajasthan.', 'Rajasthan tours, Jaipur travel, Udaipur packages, desert safari', NOW(), NOW()),
(1, 'Karnataka', 'karnataka', 'Explore the beautiful state of Karnataka', 'Karnataka Tours - Coffee Country', 'Explore coffee plantations, temples, and beaches of Karnataka.', 'Karnataka tours, Bangalore travel, Coorg packages, Mysore tourism', NOW(), NOW());

-- Get the state IDs (these will be auto-incremented)
-- We'll use @maharashtra_id, @kerala_id, etc. to reference them

-- Insert Cities for Maharashtra
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'maharashtra' LIMIT 1), 'Mumbai', 'mumbai', 'Discover Mumbai, a wonderful destination in Maharashtra', 'Mumbai Tours', 'Explore the City of Dreams', 'Mumbai tours, Mumbai travel, Mumbai packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'maharashtra' LIMIT 1), 'Pune', 'pune', 'Discover Pune, a wonderful destination in Maharashtra', 'Pune Tours', 'Discover the cultural capital', 'Pune tours, Pune travel, Pune packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'maharashtra' LIMIT 1), 'Aurangabad', 'aurangabad', 'Discover Aurangabad, a wonderful destination in Maharashtra', 'Aurangabad Tours', 'Gateway to Ajanta and Ellora', 'Aurangabad tours, Aurangabad travel, Aurangabad packages', NOW(), NOW());

-- Insert Cities for Kerala
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'kerala' LIMIT 1), 'Kochi', 'kochi', 'Discover Kochi, a wonderful destination in Kerala', 'Kochi Tours', 'Explore the spice trade capital', 'Kochi tours, Kochi travel, Kochi packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'kerala' LIMIT 1), 'Thiruvananthapuram', 'thiruvananthapuram', 'Discover Thiruvananthapuram, a wonderful destination in Kerala', 'Thiruvananthapuram Tours', 'The capital city', 'Thiruvananthapuram tours, Thiruvananthapuram travel, Thiruvananthapuram packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'kerala' LIMIT 1), 'Munnar', 'munnar', 'Discover Munnar, a wonderful destination in Kerala', 'Munnar Tours', 'Tea plantations and misty hills', 'Munnar tours, Munnar travel, Munnar packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'kerala' LIMIT 1), 'Alleppey', 'alleppey', 'Discover Alleppey, a wonderful destination in Kerala', 'Alleppey Tours', 'Backwater paradise', 'Alleppey tours, Alleppey travel, Alleppey packages', NOW(), NOW());

-- Insert Cities for Tamil Nadu
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'tamil-nadu' LIMIT 1), 'Chennai', 'chennai', 'Discover Chennai, a wonderful destination in Tamil Nadu', 'Chennai Tours', 'The capital city', 'Chennai tours, Chennai travel, Chennai packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'tamil-nadu' LIMIT 1), 'Madurai', 'madurai', 'Discover Madurai, a wonderful destination in Tamil Nadu', 'Madurai Tours', 'Temple city of South India', 'Madurai tours, Madurai travel, Madurai packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'tamil-nadu' LIMIT 1), 'Ooty', 'ooty', 'Discover Ooty, a wonderful destination in Tamil Nadu', 'Ooty Tours', 'Queen of hill stations', 'Ooty tours, Ooty travel, Ooty packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'tamil-nadu' LIMIT 1), 'Kanyakumari', 'kanyakumari', 'Discover Kanyakumari, a wonderful destination in Tamil Nadu', 'Kanyakumari Tours', 'Land\'s end of India', 'Kanyakumari tours, Kanyakumari travel, Kanyakumari packages', NOW(), NOW());

-- Insert Cities for Goa
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'goa' LIMIT 1), 'Panaji', 'panaji', 'Discover Panaji, a wonderful destination in Goa', 'Panaji Tours', 'The capital city', 'Panaji tours, Panaji travel, Panaji packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'goa' LIMIT 1), 'Calangute', 'calangute', 'Discover Calangute, a wonderful destination in Goa', 'Calangute Tours', 'Popular beach destination', 'Calangute tours, Calangute travel, Calangute packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'goa' LIMIT 1), 'Baga', 'baga', 'Discover Baga, a wonderful destination in Goa', 'Baga Tours', 'Beach and nightlife hub', 'Baga tours, Baga travel, Baga packages', NOW(), NOW());

-- Insert Cities for Rajasthan
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'rajasthan' LIMIT 1), 'Jaipur', 'jaipur', 'Discover Jaipur, a wonderful destination in Rajasthan', 'Jaipur Tours', 'The Pink City', 'Jaipur tours, Jaipur travel, Jaipur packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'rajasthan' LIMIT 1), 'Udaipur', 'udaipur', 'Discover Udaipur, a wonderful destination in Rajasthan', 'Udaipur Tours', 'City of Lakes', 'Udaipur tours, Udaipur travel, Udaipur packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'rajasthan' LIMIT 1), 'Jodhpur', 'jodhpur', 'Discover Jodhpur, a wonderful destination in Rajasthan', 'Jodhpur Tours', 'The Blue City', 'Jodhpur tours, Jodhpur travel, Jodhpur packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'rajasthan' LIMIT 1), 'Jaisalmer', 'jaisalmer', 'Discover Jaisalmer, a wonderful destination in Rajasthan', 'Jaisalmer Tours', 'Golden city of desert', 'Jaisalmer tours, Jaisalmer travel, Jaisalmer packages', NOW(), NOW());

-- Insert Cities for Karnataka
INSERT INTO locations (stateId, name, slug, description, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) VALUES
((SELECT id FROM states WHERE slug = 'karnataka' LIMIT 1), 'Bangalore', 'bangalore', 'Discover Bangalore, a wonderful destination in Karnataka', 'Bangalore Tours', 'The IT capital', 'Bangalore tours, Bangalore travel, Bangalore packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'karnataka' LIMIT 1), 'Mysore', 'mysore', 'Discover Mysore, a wonderful destination in Karnataka', 'Mysore Tours', 'City of Palaces', 'Mysore tours, Mysore travel, Mysore packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'karnataka' LIMIT 1), 'Coorg', 'coorg', 'Discover Coorg, a wonderful destination in Karnataka', 'Coorg Tours', 'Coffee plantation paradise', 'Coorg tours, Coorg travel, Coorg packages', NOW(), NOW()),
((SELECT id FROM states WHERE slug = 'karnataka' LIMIT 1), 'Gokarna', 'gokarna', 'Discover Gokarna, a wonderful destination in Karnataka', 'Gokarna Tours', 'Beach and spiritual hub', 'Gokarna tours, Gokarna travel, Gokarna packages', NOW(), NOW());

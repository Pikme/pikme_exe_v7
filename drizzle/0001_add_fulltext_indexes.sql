-- Full-Text Search Indexes Migration
-- This migration adds FULLTEXT indexes to improve search performance
-- on searchable columns across all main tables

-- ============ Tours Table Full-Text Index ============
-- Index for searching tours by name, description, and long description
ALTER TABLE tours ADD FULLTEXT INDEX tours_fulltext_idx (name, description, longDescription);

-- ============ Locations Table Full-Text Index ============
-- Index for searching locations by name and description
ALTER TABLE locations ADD FULLTEXT INDEX locations_fulltext_idx (name, description);

-- ============ States Table Full-Text Index ============
-- Index for searching states by name and description
ALTER TABLE states ADD FULLTEXT INDEX states_fulltext_idx (name, description);

-- ============ Countries Table Full-Text Index ============
-- Index for searching countries by name and description
ALTER TABLE countries ADD FULLTEXT INDEX countries_fulltext_idx (name, description);

-- ============ Categories Table Full-Text Index ============
-- Index for searching categories by name and description
ALTER TABLE categories ADD FULLTEXT INDEX categories_fulltext_idx (name, description);

-- ============ Activities Table Full-Text Index ============
-- Index for searching activities by name and description
ALTER TABLE activities ADD FULLTEXT INDEX activities_fulltext_idx (name, description);

-- ============ Additional Performance Indexes ============
-- Index for filtering by difficulty level
ALTER TABLE tours ADD INDEX tours_difficulty_idx (difficulty);

-- Index for filtering by active status
ALTER TABLE tours ADD INDEX tours_isActive_idx (isActive);

-- Index for filtering by featured status
ALTER TABLE tours ADD INDEX tours_isFeatured_idx (isFeatured);

-- Index for filtering locations by country (through state)
ALTER TABLE locations ADD INDEX locations_countryId_idx (countryId);

-- Index for filtering states by country
ALTER TABLE states ADD INDEX states_countryId_idx (countryId);

-- ============ Composite Indexes for Common Queries ============
-- Index for finding tours by category and difficulty
ALTER TABLE tours ADD INDEX tours_categoryId_difficulty_idx (categoryId, difficulty);

-- Index for finding tours by country and active status
ALTER TABLE tours ADD INDEX tours_countryId_isActive_idx (countryId, isActive);

-- Index for finding tours by state and active status
ALTER TABLE tours ADD INDEX tours_stateId_isActive_idx (stateId, isActive);

-- Index for finding locations by state and active status (if applicable)
ALTER TABLE locations ADD INDEX locations_stateId_idx (stateId);

-- ============ Index Statistics ============
-- Analyze tables to update index statistics for query optimizer
ANALYZE TABLE tours;
ANALYZE TABLE locations;
ANALYZE TABLE states;
ANALYZE TABLE countries;
ANALYZE TABLE categories;
ANALYZE TABLE activities;

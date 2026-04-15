# Ujjain Activities Import Guide

## 📊 Data Overview

**Source:** Ujjain.xlsx (3,749 original records)
**Cleaned Records:** 3,613 activities
**Location:** Ujjain, Madhya Pradesh, India
**Import Format:** CSV

---

## 🔍 Data Cleaning Process

### Issues Found & Fixed

1. **Duplicate Records** (136 removed)
   - Removed duplicate slugs while keeping first occurrence
   - Ensured unique activity identifiers

2. **Description Cleaning**
   - Removed embedded URLs and links
   - Removed pipe separators (|) used as dividers
   - Trimmed excess whitespace and normalized spacing
   - Limited descriptions to 1000 characters for database compatibility

3. **Keyword Optimization**
   - Extracted SEO keywords from meta descriptions
   - Validated keyword relevance for Ujjain tourism
   - Ensured keywords target spiritual tourism, pilgrimage, and cultural heritage

4. **Category Mapping**
   - **Spiritual** (2,420 activities): Darshan, Aarti, Temple tours, Pilgrimage packages
   - **Cultural** (1,192 activities): Heritage tours, Historical sites, Local experiences
   - **Culinary** (1 activity): Food and dining experiences

5. **Difficulty Classification**
   - **Easy** (3,606 activities): Darshan, temple visits, guided tours
   - **Moderate** (7 activities): Activities with physical requirements

---

## 📋 CSV Structure

### Column Details

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| id | Integer | (empty) | Leave empty for new records; system auto-generates |
| locationId | Integer | 1 | Ujjain location ID in database |
| name | String | "Mahakaleshwar Darshan with Bhasma Aarti Package" | Activity title |
| slug | String | "mahakaleshwar-darshan-bhasma-aarti-package" | URL-friendly identifier |
| description | Text | "Mahakaleshwar Darshan offers..." | Cleaned, max 1000 chars |
| category | String | "Spiritual" | Spiritual, Cultural, or Culinary |
| duration | String | "2-3 hours" | Activity duration |
| price | Decimal | (empty) | Can be set later in admin |
| currency | String | "INR" | Indian Rupees |
| image | String | "https://images.pikmeusa.com/..." | CDN image URL |
| difficulty | String | "easy" | easy, moderate, or challenging |
| bestTime | String | "October to March" | Optimal season for visit |

---

## 🎯 Import Instructions

### Step 1: Access Admin Panel
1. Navigate to your Pikme admin dashboard
2. Go to **Activities Management**
3. Select **Ujjain** from the location dropdown

### Step 2: Bulk Import
1. Click the **"Bulk Import"** button
2. Select the CSV file: `Ujjain_Activities_Import.csv`
3. System will validate the file

### Step 3: Review & Confirm
1. Review the import preview showing:
   - Total records to import: 3,613
   - Categories breakdown
   - Validation results
2. Confirm to proceed with import

### Step 4: Monitor Progress
- System will display import progress
- Check for any validation errors
- Review success/failure count after completion

---

## 🔑 SEO Keywords Included

### Top Keywords by Category

**Spiritual Activities:**
- Mahakaleshwar Temple tour
- Bhasma Aarti experience
- Ujjain spiritual travel
- Mahakaleshwar Darshan package
- Kshipra River sightseeing
- Cultural heritage of Ujjain
- Family-friendly pilgrimage

**Cultural Activities:**
- Ujjain heritage tourism
- Historical sites exploration
- Local culture experiences
- Ancient temples and forts
- Seasonal festivals in Ujjain

---

## 📈 Import Statistics

### Activity Breakdown
- **Total Activities:** 3,613
- **Spiritual:** 2,420 (67%)
- **Cultural:** 1,192 (33%)
- **Culinary:** 1 (<1%)

### Difficulty Distribution
- **Easy:** 3,606 (99.8%)
- **Moderate:** 7 (0.2%)
- **Challenging:** 0 (0%)

### Duration
- **Standard Duration:** 2-3 hours
- **Optimal Season:** October to March
- **Currency:** INR (Indian Rupees)

---

## ✅ Quality Assurance

### Validation Checks Performed
- ✅ All required fields present
- ✅ No duplicate slugs
- ✅ Valid category mappings
- ✅ Clean descriptions without URLs
- ✅ Proper image URLs
- ✅ Consistent difficulty levels
- ✅ SEO keywords optimized

### Post-Import Recommendations
1. **Set Pricing:** Add activity prices based on market research
2. **Verify Images:** Ensure all image URLs are accessible
3. **Test Search:** Verify activities appear in search results
4. **Monitor Analytics:** Track which activities get most views
5. **Collect Reviews:** Enable customer reviews for social proof

---

## 🚀 Next Steps

1. **Import the CSV** using the admin bulk import feature
2. **Set Activity Prices** for each category
3. **Create Destination Landing Page** for Ujjain
4. **Optimize Meta Tags** for search engines
5. **Promote on Social Media** to drive traffic

---

## 📞 Support

For questions about the import process or data structure, refer to:
- Activities Management Admin Page
- CSV Import Documentation
- Database Schema (drizzle/schema.ts)

---

**Generated:** February 14, 2026
**File:** Ujjain_Activities_Import.csv
**Records:** 3,613 activities

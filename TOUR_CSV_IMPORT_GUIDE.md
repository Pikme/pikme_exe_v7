# Tour Package CSV Import Guide

This guide explains how to use the `tours_import_template.csv` file to bulk import tour packages into the Pikme database.

## CSV File Location
- **File**: `tours_import_template.csv`
- **Location**: Root of the project directory

## Column Definitions

### Basic Information
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `name` | String (200) | ✅ Yes | Tour package name | "Wayanad Tour: Caves, Rivers & Rainforests" |
| `slug` | String (200) | ✅ Yes | URL-friendly identifier (unique) | "wayanad-caves-rivers-rainforest-tour-package" |
| `description` | Text | ❌ No | Short description | "Explore the untouched beauty of Wayanad..." |
| `longDescription` | Text | ❌ No | Detailed tour description | "Discover the untouched beauty of Wayanad..." |

### Geographic Information
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `countryId` | Integer | ❌ No | Country ID (1 = India) | 1 |
| `stateId` | Integer | ❌ No | State ID (5 = Kerala) | 5 |
| `locationId` | Integer | ❌ No | Location/City ID | 12 |
| `categoryId` | Integer | ❌ No | Category ID (3 = Adventure) | 3 |

### Tour Details
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `duration` | Integer | ❌ No | Duration in days | 3 |
| `price` | Decimal | ❌ No | Base price | 15435.00 |
| `currency` | String (3) | ❌ No | Currency code (default: INR) | "INR" |
| `travelType` | String (50) | ❌ No | Type of tour | "Private Tour" or "Group Tour" |
| `difficulty` | Enum | ❌ No | Difficulty level | "easy", "moderate", or "challenging" |
| `groupSize` | String (50) | ❌ No | Recommended group size | "2-7 pax" |
| `bestTime` | String (100) | ❌ No | Best season to visit | "September to May" |

### Images
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `image` | String (500) | ❌ No | Main image URL | "https://example.com/wayanad-main.jpg" |
| `images` | JSON Array | ❌ No | Additional images as JSON array | `["https://example.com/wayanad-1.jpg","https://example.com/wayanad-2.jpg"]` |

### SEO Fields
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `metaTitle` | String (160) | ❌ No | SEO meta title | "Wayanad Tour: Caves, Rivers & Rainforests \| Pikme" |
| `metaDescription` | String (160) | ❌ No | SEO meta description | "Explore Wayanad's ancient caves, scenic rivers..." |
| `metaKeywords` | Text | ❌ No | SEO keywords | "Wayanad tour, caves tour, rainforest trek" |
| `headingH1` | String (200) | ❌ No | Main H1 heading | "Wayanad Tour: Caves, Rivers & Rainforests" |
| `headingH2` | String (200) | ❌ No | Secondary H2 heading | "Explore Ancient Caves and Scenic Waterfalls" |
| `headingH3` | String (200) | ❌ No | Tertiary H3 heading | "Premium 3-Day Wayanad Adventure" |

### Content Sections (JSON Format)
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `highlights` | JSON Array | ❌ No | Tour highlights | `["Explore Edakkal Caves","Visit scenic rivers","Trek through rainforest"]` |
| `itinerary` | JSON Array | ❌ No | Day-by-day itinerary | `[{"day":1,"title":"Arrival","description":"..."},...]` |
| `inclusions` | JSON Array | ❌ No | What's included | `["Hotel","Meals","Guide","Transport"]` |
| `exclusions` | JSON Array | ❌ No | What's excluded | `["Flights","Personal expenses","Tips"]` |
| `amenities` | JSON Array | ❌ No | Amenities offered | `["Medical Assistance","Tour Guide","Support"]` |
| `faqs` | JSON Array | ❌ No | Frequently asked questions | `[{"question":"...","answer":"..."},...]` |

### Timing Information
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `openTime` | String (20) | ❌ No | Opening time | "05:00 AM" |
| `closeTime` | String (20) | ❌ No | Closing time | "08:00 PM" |
| `morningTime` | String (20) | ❌ No | Morning slot | "05:00 AM - 08:00 PM" |
| `afternoonTime` | String (20) | ❌ No | Afternoon slot | "12:00 PM - 06:30 PM" |

### Transportation & Pricing
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `transport` | JSON Array | ❌ No | Transport options | `[{"type":"Sedan","description":"1-3 Pax"},...]` |
| `pricingTiers` | JSON Array | ❌ No | Group pricing | `[{"groupSize":"2 Guests","price":15436,"currency":"INR"},...]` |
| `transportation` | JSON Object | ❌ No | Airport/railway details | `{"airport":"Calicut Airport","railway":"..."}` |

### Policies & Information
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `cancellationPolicy` | Text | ❌ No | Cancellation terms | "30+ days: Full refund. <7 days: 100% non-refundable" |
| `paymentPolicy` | Text | ❌ No | Payment terms | "50% advance. Balance 15 days before." |
| `importantNotes` | Text | ❌ No | Important information | "Prices for double occupancy. GST 5% extra." |

### Accommodation
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `hotelsPuri` | JSON Array | ❌ No | Hotels in Puri (if applicable) | `[{"name":"Hotel Name","stars":3,"status":"Included"},...]` |
| `hotelsBhuvaneshwar` | JSON Array | ❌ No | Hotels in Bhuvaneshwar (if applicable) | `[{"name":"Hotel Name","stars":4,"status":"Upgrade"},...]` |
| `transportOptions` | JSON Array | ❌ No | Available transport options | `[{"type":"Sedan","capacity":"1-3 Pax"},...]` |

### Status Flags
| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `isActive` | Boolean | ❌ No | Is tour active? (default: true) | true |
| `isFeatured` | Boolean | ❌ No | Is tour featured? (default: false) | true |

## JSON Format Examples

### Highlights Array
```json
["Explore Edakkal Caves with ancient carvings","Visit scenic rivers and waterfalls","Trek through lush rainforest trails","Experience wildlife spotting in Wayanad"]
```

### Itinerary Array
```json
[
  {
    "day": 1,
    "title": "Arrival in Wayanad, Kerala",
    "description": "Arrive at Calicut Airport and transfer to Wayanad (Kalpetta), Local sightseeing as time permits: Visit Edakkal Caves, Overnight stay in Kalpetta."
  },
  {
    "day": 2,
    "title": "Wayanad Wildlife and Nature Escapes, Kerala",
    "description": "Visit Muthanga Wildlife Sanctuary, Visit Pookode Lake, Visit Banasura Sagar Dam, Overnight stay in Kalpetta"
  }
]
```

### Pricing Tiers Array
```json
[
  {"groupSize": "2 Guests", "price": 15436.00, "currency": "INR"},
  {"groupSize": "4 Guests", "price": 13892.00, "currency": "INR"},
  {"groupSize": "6 Guests", "price": 12349.00, "currency": "INR"}
]
```

### Transport Array
```json
[
  {"type": "Sedan", "description": "1 to 3 Pax"},
  {"type": "MUV", "description": "3 to 5 Pax"},
  {"type": "SUV", "description": "5 to 7 Pax"}
]
```

### FAQs Array
```json
[
  {
    "question": "What are the main attractions included in the Wayanad tour package?",
    "answer": "The package includes Edakkal Caves, Muthanga Wildlife Sanctuary, Pookode Lake, Banasura Sagar Dam, and Wayanad Heritage Museum."
  },
  {
    "question": "What is the best time to visit Wayanad?",
    "answer": "September to May is the best time to visit Wayanad for pleasant weather and clear skies."
  }
]
```

### Hotels Array
```json
[
  {"name": "Hotel Indriya Wayanad", "stars": 3, "status": "Included"},
  {"name": "3 Hills County Resort", "stars": 4, "status": "Upgrade"},
  {"name": "Oshin Resort & Hotel", "stars": 5, "status": "Upgrade"}
]
```

### Transportation Object
```json
{
  "airport": "Calicut Airport",
  "railway": "Calicut Railway Station",
  "pickupDetails": "Private vehicle pickup available from the nearest airport. Please provide flight details for arrangement."
}
```

## Important Notes

1. **Slug Uniqueness**: The `slug` field must be unique across all tours. Use lowercase, hyphens instead of spaces.

2. **JSON Formatting**: When entering JSON data in CSV, ensure proper escaping:
   - Use double quotes for JSON strings
   - Escape quotes within strings with backslashes
   - Keep arrays and objects on a single line

3. **Country/State/Location IDs**: Ensure these IDs exist in the database before importing:
   - Country: 1 = India
   - State: 5 = Kerala
   - Location: 12 = Wayanad (example)
   - Category: 3 = Adventure (example)

4. **Image URLs**: All image URLs should be publicly accessible and use HTTPS.

5. **Pricing**: Use decimal format (e.g., 15435.00) for prices.

6. **Difficulty Levels**: Must be one of: "easy", "moderate", or "challenging"

7. **Boolean Values**: Use `true` or `false` (lowercase) for boolean fields.

## How to Import

1. **Prepare your CSV file** following the template format
2. **Navigate to the Tours Management section** in the admin panel
3. **Click "Bulk Import"** button
4. **Select the CSV file** from your computer
5. **Review the preview** of tours to be imported
6. **Click "Import"** to complete the bulk import

## CSV File Template

The template file `tours_import_template.csv` includes 3 sample tours:
1. Wayanad Tour: Caves, Rivers & Rainforests
2. Munnar Nature Tour: Tea Gardens, National Park & Waterfalls
3. Varkala Kovalam Beach Tour Package

You can use these as reference and modify them for your tours.

## Troubleshooting

- **Validation Error**: Check that all required fields are filled and JSON is properly formatted
- **Slug Already Exists**: Change the slug to a unique value
- **Invalid IDs**: Verify that countryId, stateId, locationId, and categoryId exist in the database
- **JSON Parse Error**: Ensure JSON is properly formatted with correct quotes and escaping

## Support

For issues with CSV import, please contact support or check the admin panel logs for detailed error messages.

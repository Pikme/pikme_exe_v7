# Activity Bulk Upload Guide (Updated)

This guide explains how to use the CSV template to bulk upload activities to the Pikme platform with all the latest frontend fields.

## CSV File Format

The `activities_bulk_upload_template.csv` file contains all required and optional fields for creating activities in bulk.

### Column Definitions

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| **locationId** | Number | Yes | The ID of the location where the activity is offered | 1, 2, 3, 4 |
| **name** | Text | Yes | Activity name (max 200 characters) | Sunrise Trek to Ujjain Temple |
| **category** | Text | No | Activity category/type | Trekking, Religious, Water Sports, Adventure |
| **description** | Text | No | Detailed description of the activity (max 65535 characters) | Experience the spiritual awakening... |
| **duration** | Text | No | Tour duration format (e.g., "X Nights / Y Days") | 2 Nights / 3 Days, 1 Night / 2 Days |
| **price** | Number | No | Price per person (numeric value) | 5000, 3000, 12000 |
| **difficulty** | Text | No | Difficulty level (must be one of: easy, moderate, challenging) | easy, moderate, challenging |
| **bestTime** | Text | No | Best time to visit/do activity | October to March, Year-round, November to February |
| **image** | Text | No | URL to activity image (HTTPS recommended) | https://example.com/image.jpg |
| **inclusions** | Text | No | What's included (newline separated - one item per line) | Guided tour\nBreakfast\nWater bottle |
| **exclusions** | Text | No | What's excluded (newline separated - one item per line) | Accommodation\nMeals\nTransportation |

## Key Updates from Frontend

### 1. Duration Format
The frontend now displays duration as **"X Nights / Y Days"** format instead of generic time ranges.
- **Old format:** "2-3 hours", "4-5 hours"
- **New format:** "2 Nights / 3 Days", "1 Night / 2 Days", "Full day"

### 2. Price per Person
Price field is now labeled as **"Price per Person"** for clarity.
- Use numeric values only (no currency symbols)
- Examples: 5000, 3000, 12000

### 3. Inclusions & Exclusions
Both fields now use **newline-separated format** (one item per line) for better readability.
- Each item should be on a new line
- No need for commas or special separators
- Examples:
  ```
  Guided tour
  Breakfast
  Water bottle
  Camera access
  ```

### 4. Removed Fields
The following fields have been removed from the current CSV template as they are not actively used in the frontend:
- **tourId** - Tour linking (can be added later if needed)
- **slug** - Auto-generated from activity name
- **currency** - Default to USD (can be added later if needed)

## How to Prepare Your CSV File

### Step 1: Download the Template
Download the `activities_bulk_upload_template.csv` file from the admin panel or use the provided template.

### Step 2: Edit in Spreadsheet Application
Open the file in Excel, Google Sheets, or any spreadsheet application:

1. **Keep the header row** - Do not modify the first row with column names
2. **Add your activity data** - Each row represents one activity
3. **Fill required fields** - locationId and name are mandatory
4. **Fill optional fields** - Add as much detail as possible for better SEO and user experience

### Step 3: Format Guidelines

#### Location ID
- Must be a valid location ID from your system
- Common IDs: 1 (Ujjain), 2 (Khajuraho), 3 (Varanasi), 4 (Jaipur)
- Contact admin for complete location ID list

#### Activity Name
- Clear, descriptive name (50-60 characters recommended)
- Examples: "Sunrise Trek to Ujjain Temple", "Mahakal Temple Darshan"
- Avoid generic names like "Tour" or "Activity"

#### Category
- Categorize activities by type for better organization
- Examples: Trekking, Religious, Water Sports, Adventure, Photography, Historical, Nature, Spiritual
- Use consistent category names across activities

#### Description
- Write compelling, detailed descriptions (150-300 words recommended)
- Include what makes this activity unique
- Mention any special requirements or restrictions
- Use SEO-friendly language with relevant keywords

#### Duration
- Use the format: **"X Nights / Y Days"**
- Examples:
  - "1 Night / 2 Days"
  - "2 Nights / 3 Days"
  - "4 Nights / 5 Days"
  - "Full day"
  - "Half day"
- Be specific for better user understanding

#### Price per Person
- Use numeric values only (no currency symbols)
- Use decimal point for cents: 5000.50, 3000.00
- Leave blank if price varies or is not applicable
- Ensure prices are competitive and consistent

#### Difficulty Level
- Must be exactly one of: **easy**, **moderate**, or **challenging**
- Case-sensitive (use lowercase)
- Consider physical fitness requirements and terrain difficulty

#### Best Time to Visit
- Specify the best season/months for the activity
- Examples: 
  - "October to March" (winter season)
  - "Year-round" (available all year)
  - "November to February" (peak season)
  - "May to September" (monsoon season)
- Consider weather, festivals, and local conditions

#### Image URLs
- Must be complete HTTPS URLs
- Recommended image dimensions: 1200x800px or 16:9 aspect ratio
- Maximum file size: 5MB
- Supported formats: JPG, PNG, WebP
- Ensure images are high-quality and represent the activity accurately

#### Inclusions (What's Included)
- List items one per line (newline-separated)
- Include everything provided in the activity package
- Examples:
  ```
  Guided tour
  Breakfast
  Water bottle
  Camera access
  ```
- Be specific and detailed

#### Exclusions (What's Excluded)
- List items one per line (newline-separated)
- Clearly state what's NOT included
- Examples:
  ```
  Accommodation
  Meals
  Transportation
  ```
- Helps set proper expectations for customers

### Step 4: Validation Checklist

Before uploading, verify:

- [ ] All rows have a **locationId** (required)
- [ ] All rows have an **activity name** (required)
- [ ] **Price** values are numeric (if provided)
- [ ] **Difficulty** is one of: easy, moderate, challenging
- [ ] **Duration** uses "X Nights / Y Days" format
- [ ] **Image URLs** are complete HTTPS URLs
- [ ] **Inclusions/Exclusions** are newline-separated (one item per line)
- [ ] No duplicate activity names in same location
- [ ] Descriptions are clear and SEO-friendly
- [ ] Category names are consistent across activities

## CSV Example

```csv
locationId,name,category,description,duration,price,difficulty,bestTime,image,inclusions,exclusions
1,Sunrise Trek to Ujjain Temple,Trekking,"Experience the spiritual awakening with a guided trek to the ancient Ujjain Temple.",2 Nights / 3 Days,5000,easy,October to March,https://example.com/sunrise-trek.jpg,"Guided tour
Breakfast
Water bottle
Camera access","Accommodation
Meals
Transportation"
1,Mahakal Temple Darshan,Religious,"Visit the sacred Mahakal Temple with an experienced guide.",1 Night / 2 Days,3000,easy,Year-round,https://example.com/mahakal-temple.jpg,"Temple guide
Prayer materials
Prasad","Photography permit
Meals"
```

## Uploading to Pikme

### Via Admin Panel
1. Go to Admin → Activities Management
2. Click "Download CSV Template" to get the latest template
3. Click "Import CSV" to upload your file
4. Review the preview
5. Click "Upload" to create all activities

### Via API (For Developers)
```javascript
const csvData = [
  {
    locationId: 1,
    name: "Sunrise Trek to Ujjain Temple",
    category: "Trekking",
    description: "...",
    duration: "2 Nights / 3 Days",
    price: 5000,
    difficulty: "easy",
    bestTime: "October to March",
    image: "https://example.com/image.jpg",
    inclusions: "Guided tour\nBreakfast\nWater bottle",
    exclusions: "Accommodation\nMeals"
  },
  // ... more activities
];

const response = await trpc.bulkActivities.bulkCreateActivities.mutate(csvData);
console.log(response); // { success: true, created: 10, failed: 0, ... }
```

## Troubleshooting

### Common Issues

**Issue: "Location ID not found"**
- Verify the locationId exists in your system
- Check with admin for valid location IDs

**Issue: "Invalid difficulty level"**
- Must be exactly: easy, moderate, or challenging
- Check for typos or extra spaces

**Issue: "Price must be numeric"**
- Remove currency symbols ($, ₹, €)
- Use decimal point: 5000.50 (not 5000,50)

**Issue: "Image URL invalid"**
- Ensure URL starts with https://
- Check URL is accessible and not expired
- Verify image file exists

**Issue: "Duplicate activity name"**
- Activity names must be unique within a location
- Rename duplicate activities or add location identifier

**Issue: "Inclusions/Exclusions not parsing correctly"**
- Ensure items are separated by newlines (press Enter between items)
- Don't use commas or other separators
- Each item should be on its own line

## Best Practices

### 1. SEO Optimization
- Use descriptive activity names (50-60 characters)
- Write detailed descriptions (150-300 words)
- Include relevant keywords naturally
- Use proper formatting and structure

### 2. Pricing Strategy
- Keep prices competitive and market-aligned
- Update regularly based on season
- Consider group discounts or package deals
- Be transparent about what's included

### 3. Image Quality
- Use high-quality, professional images
- Ensure images represent the activity accurately
- Optimize image file size for faster loading
- Use consistent image dimensions and aspect ratios

### 4. Content Quality
- Be specific about what's included
- Mention any age/fitness restrictions
- Include booking/cancellation policies
- Use clear, engaging language

### 5. Consistency
- Use consistent category names across activities
- Maintain uniform formatting for duration and pricing
- Keep inclusions/exclusions format consistent
- Review for typos and grammatical errors

## Support

For questions or issues with bulk upload:
- Contact: admin@pikme.com
- Documentation: https://docs.pikme.com/bulk-upload
- API Reference: https://api.pikme.com/docs

## Changelog

### Version 2.0 (February 15, 2026)
- Updated duration format to "X Nights / Y Days"
- Changed price label to "Price per Person"
- Updated inclusions/exclusions to newline-separated format
- Removed tourId, slug, and currency fields from template
- Added detailed formatting guidelines for each field
- Enhanced examples and best practices

### Version 1.0 (February 15, 2026)
- Initial release with basic CSV template

---

**Last Updated:** February 15, 2026
**Version:** 2.0

# SEO Meta Data Management Guide for Admin Pages

This guide explains where and how to update Meta Title, Meta Description, Meta Keywords, and other SEO data for the management pages in the Pikme Admin Dashboard.

---

## Overview

The admin management pages have two layers of SEO data:

1. **Page-Level SEO** - The AdminLayout component title and description (for the admin page itself)
2. **Item-Level SEO** - Individual meta data for each item (Tour, Activity, Country, State, City, Category) that you're managing

---

## 1. Tours Management Page (`/admin/tours`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminToursManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
```tsx
// Line ~380 in AdminToursManagement.tsx
<AdminLayout
  title="Tours Management"
  description="Create, edit, and manage comprehensive tour packages"
  breadcrumbs={[
    { label: "Tours", href: "/admin/tours" },
  ]}
>
```

**Update these fields in AdminLayout:**
- `title` - The page heading (e.g., "Tours Management")
- `description` - The page subheading (e.g., "Create, edit, and manage comprehensive tour packages")

#### B. Individual Tour Meta Data (In the Form)
```tsx
// Line ~1188-1230 in AdminToursManagement.tsx
// Inside the "Meta Title, Keywords, Description" section
```

**Form Fields to Update:**
- **Meta Title** - Input field (currently using `formData.name`)
  - Update in: `<input value={formData.name || ""} ... />`
  - This should store the SEO title for the tour

- **Meta Keywords** - Input field (currently using `formData.category`)
  - Update in: `<input value={formData.category || ""} ... />`
  - This should store comma-separated keywords

- **Meta Description** - Textarea field (currently using `formData.description`)
  - Update in: `<textarea value={formData.description || ""} ... />`
  - This should store the SEO description (max 160 characters)

### Database Schema
The tour data is stored in the database with these fields:
- `name` - Tour name / Meta Title
- `description` - Tour description / Meta Description
- `category` - Tour category / Meta Keywords

---

## 2. Activities Management Page (`/admin/activities`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminActivitiesManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
```tsx
// Line ~267 in AdminActivitiesManagement.tsx
<AdminLayout 
  title="Activities Management" 
  description="Create, edit, and manage activities and experiences across India"
>
```

**Update these fields:**
- `title` - Page heading
- `description` - Page subheading

#### B. Individual Activity Meta Data
The Activities Management page **does not currently have a dedicated meta data section** in the form. 

**To add meta data fields for activities:**
1. Update the `activitySchema` (line ~13) to include:
   ```ts
   metaTitle: z.string().optional(),
   metaDescription: z.string().optional(),
   metaKeywords: z.string().optional(),
   ```

2. Add form fields in the activity form section to capture these values

3. Update the database schema to store these fields

---

## 3. Countries Management Page (`/admin/countries`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminCountriesManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
Find the AdminLayout component and update:
- `title` - Page heading
- `description` - Page subheading

#### B. Individual Country Meta Data
```tsx
// Line ~11-18 in AdminCountriesManagement.tsx
const countrySchema = z.object({
  name: z.string().min(1, "Country name is required"),
  slug: z.string().min(1, "Slug is required"),
  code: z.string().min(2, "Country code is required"),
  metaTitle: z.string().optional(),        // ← Meta Title
  metaDescription: z.string().optional(),  // ← Meta Description
  metaKeywords: z.string().optional(),     // ← Meta Keywords
});
```

**Form Fields to Update:**
- **Meta Title** - Search for the form field that uses `formData.metaTitle`
- **Meta Description** - Search for the form field that uses `formData.metaDescription`
- **Meta Keywords** - Search for the form field that uses `formData.metaKeywords`

These fields are already defined in the schema and should have corresponding form inputs in the country form section.

---

## 4. States Management Page (`/admin/states`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminStatesManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
Find the AdminLayout component and update:
- `title` - Page heading
- `description` - Page subheading

#### B. Individual State Meta Data
```tsx
// Line ~13-20 in AdminStatesManagement.tsx
const stateSchema = z.object({
  countryId: z.coerce.number().min(1, "Country is required"),
  name: z.string().min(1, "State name is required"),
  slug: z.string().min(1, "Slug is required"),
  metaTitle: z.string().optional(),        // ← Meta Title
  metaDescription: z.string().optional(),  // ← Meta Description
  metaKeywords: z.string().optional(),     // ← Meta Keywords
});
```

**Form Fields to Update:**
- **Meta Title** - Form field using `formData.metaTitle`
- **Meta Description** - Form field using `formData.metaDescription`
- **Meta Keywords** - Form field using `formData.metaKeywords`

---

## 5. Cities Management Page (`/admin/cities`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminCitiesManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
Find the AdminLayout component and update:
- `title` - Page heading
- `description` - Page subheading

#### B. Individual City Meta Data
```tsx
// Line ~11-21 in AdminCitiesManagement.tsx
const citySchema = z.object({
  stateId: z.coerce.number().min(1, "State is required"),
  name: z.string().min(1, "City name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  metaTitle: z.string().optional(),        // ← Meta Title
  metaDescription: z.string().optional(),  // ← Meta Description
  metaKeywords: z.string().optional(),     // ← Meta Keywords
});
```

**Form Fields to Update:**
- **Meta Title** - Form field using `formData.metaTitle`
- **Meta Description** - Form field using `formData.metaDescription`
- **Meta Keywords** - Form field using `formData.metaKeywords`

---

## 6. Categories Management Page (`/admin/categories`)

### Location
**File:** `/home/ubuntu/pikme-pseo/client/src/pages/AdminCategoriesManagement.tsx`

### Where to Update Meta Data

#### A. Page-Level SEO (Admin Page Header)
Find the AdminLayout component and update:
- `title` - Page heading
- `description` - Page subheading

#### B. Individual Category Meta Data
```tsx
// Line ~13-20 in AdminCategoriesManagement.tsx
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),        // ← Meta Title
  metaDescription: z.string().optional(),  // ← Meta Description
  metaKeywords: z.string().optional(),     // ← Meta Keywords
});
```

**Form Fields to Update:**
- **Meta Title** - Form field using `formData.metaTitle`
- **Meta Description** - Form field using `formData.metaDescription`
- **Meta Keywords** - Form field using `formData.metaKeywords`

---

## Quick Reference Table

| Page | File | Schema Fields | Form Fields | Notes |
|------|------|---------------|-------------|-------|
| **Tours** | AdminToursManagement.tsx | name, description, category | Meta Title, Keywords, Description | Uses name/description/category for SEO |
| **Activities** | AdminActivitiesManagement.tsx | ❌ Missing | ❌ Missing | Needs implementation |
| **Countries** | AdminCountriesManagement.tsx | metaTitle, metaDescription, metaKeywords | ✅ Available | Ready to use |
| **States** | AdminStatesManagement.tsx | metaTitle, metaDescription, metaKeywords | ✅ Available | Ready to use |
| **Cities** | AdminCitiesManagement.tsx | metaTitle, metaDescription, metaKeywords | ✅ Available | Ready to use |
| **Categories** | AdminCategoriesManagement.tsx | metaTitle, metaDescription, metaKeywords | ✅ Available | Ready to use |

---

## How to Update Meta Data - Step by Step

### For Pages with Dedicated Meta Fields (Countries, States, Cities, Categories)

1. **Open the management page** (e.g., `/admin/countries`)
2. **Click "Add New" or "Edit"** to open the form
3. **Scroll to the meta data section** (usually at the bottom of the form)
4. **Fill in the fields:**
   - **Meta Title** - Enter the SEO title (recommended: 50-60 characters)
   - **Meta Description** - Enter the SEO description (recommended: 150-160 characters)
   - **Meta Keywords** - Enter comma-separated keywords (e.g., "keyword1, keyword2, keyword3")
5. **Save** the form

### For Tours Management

1. **Open Tours Management** (`/admin/tours`)
2. **Click "Add New Tour" or "Edit Tour"**
3. **Scroll to "Meta Title, Keywords, Description" section**
4. **Fill in the fields:**
   - **Meta Title** - Uses the Tour Name field
   - **Meta Keywords** - Uses the Category field
   - **Meta Description** - Uses the Description field
5. **Save** the tour

---

## Database Storage

All meta data is stored in the database with the following structure:

```sql
-- Countries table
CREATE TABLE countries (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255),
  code VARCHAR(2),
  metaTitle VARCHAR(255),
  metaDescription TEXT,
  metaKeywords VARCHAR(255),
  ...
);

-- Similar structure for states, cities, categories
```

---

## Best Practices for SEO Meta Data

### Meta Title
- **Length:** 50-60 characters (optimal for search results)
- **Format:** Include target keyword at the beginning
- **Example:** "Best Tours in India | Pikme Travel"

### Meta Description
- **Length:** 150-160 characters (optimal for search results)
- **Format:** Clear, compelling description with call-to-action
- **Example:** "Discover handpicked tours across India. Book your adventure today with Pikme Travel."

### Meta Keywords
- **Count:** 3-5 relevant keywords
- **Format:** Comma-separated, lowercase
- **Example:** "tours, travel, India, adventure, experiences"

---

## Frontend Display

The meta data is used in:

1. **Search Engine Results** - Title and description appear in Google/Bing search results
2. **Social Media Sharing** - Used when sharing links on Facebook, Twitter, etc.
3. **Browser Tab** - Title appears in the browser tab
4. **Page Header** - Description may appear as page subtitle

---

## Next Steps

1. **Verify all form fields** are properly connected to the schema
2. **Test meta data updates** by editing an item and checking the database
3. **Implement missing meta fields** for Activities Management
4. **Add frontend meta tag rendering** to display the meta data in the HTML `<head>`

---

## Support

For questions or issues with updating meta data, refer to the specific page files listed above or contact the development team.

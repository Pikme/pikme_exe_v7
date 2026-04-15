# Attractions Management API Documentation

## Overview

The Attractions Management API provides comprehensive CRUD operations for managing city attractions, landmarks, restaurants, and other points of interest. All endpoints are built using tRPC and require admin authentication for write operations.

## Base URL

```
/api/trpc
```

## Authentication

All admin endpoints require the user to have `admin` role. Authentication is handled via session cookies set during OAuth login.

## API Endpoints

### Public Endpoints

#### 1. List Attractions by Location
**Endpoint:** `attractions.listByLocation`
**Method:** Query
**Authentication:** Public

**Request Parameters:**
```typescript
{
  locationId: number;
  limit?: number; // default: 100
  offset?: number; // default: 0
}
```

**Response:**
```typescript
Array<{
  id: number;
  locationId: number;
  name: string;
  slug: string;
  type: "landmark" | "restaurant" | "museum" | "temple" | "monument" | "park" | "cafe" | "shopping" | "other";
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  closedOn?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  entryFee?: string;
  estimatedVisitTime?: string;
  bestTimeToVisit?: string;
  highlights?: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example:**
```javascript
const attractions = await trpc.attractions.listByLocation.query({
  locationId: 1,
  limit: 20,
  offset: 0
});
```

#### 2. List Attractions by Type
**Endpoint:** `attractions.listByLocationAndType`
**Method:** Query
**Authentication:** Public

**Request Parameters:**
```typescript
{
  locationId: number;
  type: string;
  limit?: number; // default: 50
  offset?: number; // default: 0
}
```

**Example:**
```javascript
const restaurants = await trpc.attractions.listByLocationAndType.query({
  locationId: 1,
  type: "restaurant",
  limit: 20
});
```

#### 3. Get Featured Attractions
**Endpoint:** `attractions.getFeatured`
**Method:** Query
**Authentication:** Public

**Request Parameters:**
```typescript
{
  locationId: number;
  limit?: number; // default: 6
}
```

#### 4. Get Attraction by Slug
**Endpoint:** `attractions.getBySlug`
**Method:** Query
**Authentication:** Public

**Request Parameters:**
```typescript
{
  locationId: number;
  slug: string;
}
```

#### 5. Search Attractions
**Endpoint:** `attractions.search`
**Method:** Query
**Authentication:** Public

**Request Parameters:**
```typescript
{
  locationId: number;
  query: string;
  limit?: number; // default: 50
}
```

**Example:**
```javascript
const results = await trpc.attractions.search.query({
  locationId: 1,
  query: "taj",
  limit: 20
});
```

### Admin Endpoints

#### 1. List All Attractions (Admin)
**Endpoint:** `adminAttractions.listAll`
**Method:** Query
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  search?: string;
  type?: string;
  locationId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  minRating?: number;
  limit?: number; // default: 50
  offset?: number; // default: 0
  sortBy?: "name" | "rating" | "created" | "featured"; // default: "created"
  sortOrder?: "asc" | "desc"; // default: "desc"
}
```

**Example:**
```javascript
const attractions = await trpc.adminAttractions.listAll.query({
  type: "landmark",
  locationId: 1,
  isFeatured: true,
  minRating: 4.0,
  sortBy: "rating",
  sortOrder: "desc",
  limit: 50,
  offset: 0
});
```

#### 2. Count All Attractions (Admin)
**Endpoint:** `adminAttractions.countAll`
**Method:** Query
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  search?: string;
  type?: string;
  locationId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  minRating?: number;
}
```

**Response:**
```typescript
number
```

#### 3. Get Attraction Statistics
**Endpoint:** `adminAttractions.getStats`
**Method:** Query
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  locationId?: number;
}
```

**Response:**
```typescript
{
  total: number;
  featured: number;
  active: number;
  avgRating: number;
}
```

#### 4. Get Type Distribution
**Endpoint:** `adminAttractions.getTypeDistribution`
**Method:** Query
**Authentication:** Admin required

**Response:**
```typescript
Array<{
  type: string;
  count: number;
}>
```

#### 5. Get Top Rated Attractions
**Endpoint:** `adminAttractions.getTopRated`
**Method:** Query
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  limit?: number; // default: 10
  locationId?: number;
}
```

#### 6. Create Attraction
**Endpoint:** `attractions.create`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  locationId: number;
  name: string;
  slug: string;
  type: "landmark" | "restaurant" | "museum" | "temple" | "monument" | "park" | "cafe" | "shopping" | "other";
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  closedOn?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  entryFee?: string;
  estimatedVisitTime?: string;
  bestTimeToVisit?: string;
  highlights?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isFeatured?: boolean; // default: false
}
```

**Example:**
```javascript
const newAttraction = await trpc.attractions.create.mutate({
  locationId: 1,
  name: "Taj Mahal",
  slug: "taj-mahal",
  type: "monument",
  description: "A white marble mausoleum built by Mughal Emperor Shah Jahan",
  address: "Agra, Uttar Pradesh 282001",
  rating: 4.8,
  isFeatured: true
});
```

#### 7. Update Attraction
**Endpoint:** `attractions.update`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  id: number;
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  closedOn?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  entryFee?: string;
  estimatedVisitTime?: string;
  bestTimeToVisit?: string;
  highlights?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}
```

#### 8. Delete Attraction
**Endpoint:** `attractions.delete`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  id: number;
}
```

#### 9. Bulk Create Attractions
**Endpoint:** `adminAttractions.bulkCreate`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  attractions: Array<InsertAttraction>;
}
```

**Constraints:**
- Maximum 1000 attractions per bulk import
- At least 1 attraction required

#### 10. Bulk Update Attractions
**Endpoint:** `adminAttractions.bulkUpdate`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  ids: number[];
  updates: {
    isFeatured?: boolean;
    isActive?: boolean;
    type?: string;
    rating?: number;
  };
}
```

#### 11. Bulk Delete Attractions
**Endpoint:** `adminAttractions.bulkDelete`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  ids: number[];
}
```

#### 12. Toggle Featured Status
**Endpoint:** `adminAttractions.toggleFeatured`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  id: number;
}
```

#### 13. Toggle Active Status
**Endpoint:** `adminAttractions.toggleActive`
**Method:** Mutation
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  id: number;
}
```

#### 14. Export as JSON
**Endpoint:** `adminAttractions.exportJSON`
**Method:** Query
**Authentication:** Admin required

**Request Parameters:**
```typescript
{
  locationId?: number;
  type?: string;
  isFeatured?: boolean;
}
```

**Response:**
```typescript
{
  data: Array<Attraction>;
  count: number;
  exportedAt: string; // ISO 8601 timestamp
}
```

#### 15. Export as CSV
**Endpoint:** `adminAttractions.exportCSV`
**Method:** Query
**Authentication:** Admin required

**Response:**
```typescript
{
  csv: string;
  count: number;
  exportedAt: string; // ISO 8601 timestamp
}
```

#### 16. Get CSV Template
**Endpoint:** `adminAttractions.getCSVTemplate`
**Method:** Query
**Authentication:** Admin required

**Response:**
```typescript
{
  csv: string;
  filename: string;
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request:** Invalid input parameters
- **401 Unauthorized:** Missing authentication
- **403 Forbidden:** Insufficient permissions (admin required)
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server-side error

**Error Response Format:**
```typescript
{
  code: string; // TRPC error code
  message: string;
}
```

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production deployments.

## Pagination

All list endpoints support pagination using `limit` and `offset` parameters:

- **limit:** Number of results to return (default: 50, max: 1000)
- **offset:** Number of results to skip (default: 0)

## Sorting

Admin list endpoints support sorting with `sortBy` and `sortOrder` parameters:

- **sortBy:** Field to sort by (name, rating, created, featured)
- **sortOrder:** Sort direction (asc, desc)

## Filtering

Admin endpoints support multiple filters that can be combined:

- **search:** Full-text search across name, description, and address
- **type:** Filter by attraction type
- **locationId:** Filter by city/location
- **isFeatured:** Filter by featured status
- **isActive:** Filter by active status
- **minRating:** Filter by minimum rating

## CSV Import Format

When importing attractions via CSV, use the following columns:

```
locationId, name, slug, type, description, address, phone, email, website,
openingHours, closedOn, latitude, longitude, image, rating, reviewCount,
entryFee, estimatedVisitTime, bestTimeToVisit, highlights, isFeatured, isActive
```

**Example CSV Row:**
```
1, Taj Mahal, taj-mahal, monument, A white marble mausoleum, Agra UP 282001, +91-562-2226431, info@tajmahal.com, https://www.tajmahal.com, 6:00 AM - 7:00 PM, Friday, 27.1751, 78.0421, https://example.com/taj.jpg, 4.8, 5000, ₹250 (Indian) ₹500 (Foreign), 2-3 hours, October-March, Ancient architecture|Intricate carvings|Spiritual significance, true, true
```

## Usage Examples

### React Component Example

```typescript
import { trpc } from "@/lib/trpc";

export function AttractionsList() {
  const { data: attractions, isLoading } = trpc.attractions.listByLocation.useQuery({
    locationId: 1,
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {attractions?.map(attraction => (
        <div key={attraction.id}>
          <h3>{attraction.name}</h3>
          <p>{attraction.description}</p>
          <span>{attraction.type}</span>
          <span>★ {attraction.rating}</span>
        </div>
      ))}
    </div>
  );
}
```

### Admin Management Example

```typescript
import { trpc } from "@/lib/trpc";

export function AdminAttractionsManager() {
  const utils = trpc.useUtils();
  const { data: attractions } = trpc.adminAttractions.listAll.useQuery({
    locationId: 1,
    limit: 50,
    sortBy: "rating",
    sortOrder: "desc",
  });

  const updateMutation = trpc.attractions.update.useMutation({
    onSuccess: () => {
      utils.adminAttractions.listAll.invalidate();
    },
  });

  const handleToggleFeatured = (id: number) => {
    updateMutation.mutate({
      id,
      isFeatured: !attractions?.find(a => a.id === id)?.isFeatured,
    });
  };

  return (
    <div>
      {attractions?.map(attraction => (
        <div key={attraction.id}>
          <h3>{attraction.name}</h3>
          <button onClick={() => handleToggleFeatured(attraction.id)}>
            {attraction.isFeatured ? "Unfeature" : "Feature"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always use pagination** for list endpoints to avoid loading too much data
2. **Combine filters** to narrow down results efficiently
3. **Use bulk operations** for multiple updates/deletes to reduce API calls
4. **Cache results** using React Query (tRPC automatically does this)
5. **Validate input** on the client side before sending to the API
6. **Handle errors gracefully** with appropriate user feedback
7. **Use CSV import** for bulk data migration instead of individual creates

## Version History

- **v1.0.0** (2026-01-23): Initial release with full CRUD operations, filtering, search, and bulk operations

# Pikme - Programmatic SEO Travel Platform

A scalable, high-performance travel content platform built with React 19, Express, tRPC, and Drizzle ORM. Pikme generates and manages large-scale programmatic SEO pages for travel destinations, tours, and activities with built-in SEO optimization and ISR support.

## Features

### Core Platform
- **Programmatic Page Generation**: Automatically generate travel content pages at scale
- **Dynamic Routing**: Support for `/visit/[country]/[city]/[slug]` and tour detail pages
- **Database-Driven Content**: Manage tours, locations, flights, and activities through a relational database
- **Admin Dashboard**: Comprehensive admin interface for content management
- **CSV Import**: Bulk import content from CSV files with error handling and logging

### SEO Optimization
- **Metadata Generation**: Automatic title, description, and keyword generation
- **JSON-LD Structured Data**: Rich snippets for tours, locations, and countries
- **XML Sitemap Generation**: Automatic sitemap creation for search engine indexing
- **Robots.txt**: Automatic robots.txt generation
- **Canonical URLs**: Proper canonical URL handling to prevent duplicate content
- **Open Graph Tags**: Social media preview optimization

### Performance
- **Server-Side Rendering**: Fast initial page loads with React Server Components
- **Incremental Static Regeneration (ISR)**: Efficient content updates without full rebuilds
- **Database Query Optimization**: Indexed queries for fast data retrieval
- **Caching Strategies**: Multi-layer caching for optimal performance

### Admin Features
- **Role-Based Access Control**: Admin-only features protected by authentication
- **CSV Import System**: Bulk upload tours, locations, flights, and activities
- **Import History**: Track all imports with success/failure metrics
- **Content Management**: Create, read, update, delete operations for all content types

## Architecture

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Backend**: Express.js with tRPC
- **Database**: MySQL with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Authentication**: Manus OAuth
- **File Storage**: S3 for images and media

### Database Schema

#### Core Tables
- **users**: User accounts with role-based access control
- **countries**: Travel destinations (countries)
- **locations**: Cities and locations within countries
- **tours**: Travel packages and tour offerings
- **flights**: Flight information and pricing
- **activities**: Activities and experiences
- **tourLocations**: Many-to-many relationship between tours and locations
- **importLogs**: CSV import history and status tracking

### API Structure

#### tRPC Routers
- **tours**: Tour listing, detail, creation, updates
- **locations**: Location management and queries
- **countries**: Country listing and detail pages
- **import**: CSV import functionality for bulk content
- **auth**: Authentication and user management
- **system**: System-level operations

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL database
- Manus OAuth credentials

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Development

```bash
# Run development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm check

# Format code
pnpm format
```

## Usage Guide

### Adding Tours via CSV

1. Navigate to Admin Dashboard (`/admin`)
2. Click "CSV Import"
3. Select "Tours" import type
4. Upload a CSV file with the following columns:
   - `name` (required): Tour name
   - `slug` (required): URL-friendly identifier
   - `description`: Short description
   - `category`: Tour category (adventure, cultural, beach, etc.)
   - `duration`: Number of days
   - `price`: Tour price
   - `metaTitle`: SEO title tag
   - `metaDescription`: SEO meta description
   - `metaKeywords`: SEO keywords

### Adding Locations via CSV

1. Go to Admin Dashboard → CSV Import
2. Select "Locations" import type
3. Upload a CSV with columns:
   - `countryId` (required): Country ID
   - `name` (required): Location name
   - `slug` (required): URL-friendly identifier
   - `description`: Location description
   - `metaTitle`: SEO title
   - `metaDescription`: SEO description
   - `latitude`: Coordinates (optional)
   - `longitude`: Coordinates (optional)

### Creating Tours Programmatically

```typescript
const tour = await trpc.tours.create.mutate({
  name: "Paris Adventure",
  slug: "paris-adventure",
  description: "Explore the City of Light",
  category: "cultural",
  duration: 5,
  price: 1500,
  currency: "USD",
  metaTitle: "Paris Adventure Tour",
  metaDescription: "Discover Paris with our guided tour",
  highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame"],
});
```

## SEO Implementation

### Metadata Generation

The platform automatically generates SEO metadata for all pages:

```typescript
import { generateTourMetadata } from "@/server/seo";

const metadata = await generateTourMetadata(tour, baseUrl);
// Returns: { title, description, keywords, structuredData, ogImage, canonicalUrl }
```

### Structured Data

JSON-LD structured data is automatically generated for:
- **Tours**: TravelAction schema with pricing, duration, itinerary
- **Locations**: Place schema with coordinates and address
- **Countries**: Country schema with basic information

### Sitemap Generation

Access the XML sitemap at `/api/sitemap.xml`. The sitemap includes:
- All tour detail pages (priority: 0.8)
- All location pages (priority: 0.7)
- All country pages (priority: 0.9)

### Robots.txt

Access robots.txt at `/api/robots.txt`. Automatically configured to:
- Allow public content crawling
- Disallow admin pages
- Disallow API routes
- Include sitemap reference

## Performance Optimization

### Database Queries

All queries are optimized with:
- Proper indexing on frequently queried columns
- Eager loading of relationships
- Query result caching

### Frontend Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Lazy loading and responsive images
- **CSS Optimization**: Tailwind CSS purging unused styles
- **Bundle Analysis**: Monitor bundle size with build tools

### Caching Strategy

- **HTTP Caching**: Sitemap and robots.txt cached for 24 hours
- **Database Caching**: Query results cached in memory
- **Browser Caching**: Static assets cached with content hashing

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy with `vercel deploy`

### Environment Variables

```
DATABASE_URL=mysql://user:password@host:3306/pikme
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
```

## API Documentation

### Tours Endpoints

**List Tours**
```
GET /api/trpc/tours.list?input={"limit":20,"offset":0}
```

**Get Tour Detail**
```
GET /api/trpc/tours.getBySlug?input={"slug":"paris-adventure"}
```

**Create Tour** (Admin only)
```
POST /api/trpc/tours.create
```

### Locations Endpoints

**List Locations by Country**
```
GET /api/trpc/locations.listByCountry?input={"countryId":1,"limit":20}
```

**Get Location Detail**
```
GET /api/trpc/locations.getBySlug?input={"countryId":1,"slug":"eiffel-tower"}
```

### Import Endpoints

**Upload Tours CSV**
```
POST /api/trpc/import.uploadTours
```

**Get Import History**
```
GET /api/trpc/import.getHistory?input={"limit":10}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/seo.test.ts
```

### Test Coverage

- SEO utilities: 11 tests covering metadata and structured data generation
- Authentication: 1 test for logout functionality
- Database operations: Query helpers for all content types

## Troubleshooting

### CSV Import Fails

1. Verify CSV format matches required columns
2. Check for special characters in data
3. Ensure all required fields are present
4. Review import history for error details

### Pages Not Showing Content

1. Verify database connection is active
2. Check that content has been imported
3. Review browser console for API errors
4. Check server logs for database query errors

### SEO Metadata Not Generating

1. Ensure metaTitle and metaDescription are provided
2. Check that tour/location records exist in database
3. Verify base URL is correctly configured
4. Review SEO generation logs

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Format code with Prettier
- Write tests for new features

### Adding New Features

1. Update database schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to migrate
3. Add query helpers in `server/db.ts`
4. Create tRPC procedures in `server/routers.ts`
5. Build frontend components in `client/src/pages/`
6. Write tests in `server/*.test.ts`

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review test files for usage examples
3. Check database schema for data structure
4. Review tRPC router definitions for API usage

## Roadmap

### Phase 1 (Current)
- ✅ Core database schema
- ✅ Admin dashboard with CSV import
- ✅ Frontend pages for tours and locations
- ✅ SEO metadata and structured data
- ✅ Sitemap and robots.txt generation

### Phase 2 (Planned)
- Dynamic route generation with ISR
- Advanced search and filtering
- User reviews and ratings
- Booking system integration
- Email notifications
- Analytics dashboard

### Phase 3 (Future)
- Multi-language support
- Payment processing (Stripe)
- Real-time availability updates
- AI-powered content generation
- Mobile app
- Advanced analytics

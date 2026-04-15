import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

const attractionTypeEnum = z.enum(["landmark", "restaurant", "museum", "temple", "monument", "park", "cafe", "shopping", "other"]);

export const adminAttractionsRouter = router({
  // ============ List and Search ============
  listAll: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.string().optional(),
      locationId: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      minRating: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      sortBy: z.enum(['name', 'rating', 'created', 'featured']).default('created'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input }) => {
      return db.listAllAttractions(input);
    }),

  countAll: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.string().optional(),
      locationId: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      minRating: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.countAllAttractions(input);
    }),

  // ============ Statistics ============
  getStats: adminProcedure
    .input(z.object({
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const stats = await db.getAttractionStats(input.locationId);
      if (!stats) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch statistics" });
      }
      return stats;
    }),

  getTypeDistribution: adminProcedure
    .input(z.object({
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.getAttractionsByTypeDistribution(input.locationId);
    }),

  getTopRated: adminProcedure
    .input(z.object({
      limit: z.number().default(10),
      locationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return db.getTopRatedAttractions(input.limit, input.locationId);
    }),

  // ============ Bulk Operations ============
  bulkCreate: adminProcedure
    .input(z.object({
      attractions: z.array(z.object({
        locationId: z.number(),
        name: z.string(),
        slug: z.string(),
        type: attractionTypeEnum,
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        openingHours: z.string().optional(),
        closedOn: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        entryFee: z.string().optional(),
        estimatedVisitTime: z.string().optional(),
        bestTimeToVisit: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      if (input.attractions.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one attraction is required" });
      }
      if (input.attractions.length > 1000) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 1000 attractions per bulk import" });
      }
      return db.bulkCreateAttractions(input.attractions as any);
    }),

  bulkUpdate: adminProcedure
    .input(z.object({
      ids: z.array(z.number()),
      updates: z.object({
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
        type: attractionTypeEnum.optional(),
        rating: z.number().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      if (input.ids.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one attraction ID is required" });
      }
      if (Object.keys(input.updates).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one field to update is required" });
      }
      return db.bulkUpdateAttractions(input.ids, input.updates as any);
    }),

  bulkDelete: adminProcedure
    .input(z.object({
      ids: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      if (input.ids.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "At least one attraction ID is required" });
      }
      return db.bulkDeleteAttractions(input.ids);
    }),

  // ============ Toggle Operations ============
  toggleFeatured: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await db.toggleAttractionFeatured(input.id);
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Attraction not found" });
      }
    }),

  toggleActive: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await db.toggleAttractionActive(input.id);
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Attraction not found" });
      }
    }),

  // ============ Export Operations ============
  exportJSON: adminProcedure
    .input(z.object({
      locationId: z.number().optional(),
      type: z.string().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const attractions = await db.exportAttractionsAsJSON(input);
      return {
        data: attractions,
        count: attractions.length,
        exportedAt: new Date().toISOString(),
      };
    }),

  exportCSV: adminProcedure
    .input(z.object({
      locationId: z.number().optional(),
      type: z.string().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const attractions = await db.exportAttractionsAsJSON(input);
      
      // Convert to CSV format
      const headers = [
        'id', 'locationId', 'name', 'slug', 'type', 'description', 'address',
        'phone', 'email', 'website', 'openingHours', 'closedOn',
        'latitude', 'longitude', 'image', 'rating', 'reviewCount',
        'entryFee', 'estimatedVisitTime', 'bestTimeToVisit',
        'isFeatured', 'isActive', 'createdAt', 'updatedAt'
      ];

      const rows = attractions.map(attr => [
        attr.id,
        attr.locationId,
        `"${attr.name}"`,
        attr.slug,
        attr.type,
        `"${attr.description || ''}"`,
        `"${attr.address || ''}"`,
        attr.phone || '',
        attr.email || '',
        attr.website || '',
        attr.openingHours || '',
        attr.closedOn || '',
        attr.latitude || '',
        attr.longitude || '',
        attr.image || '',
        attr.rating || '',
        attr.reviewCount || '',
        attr.entryFee || '',
        attr.estimatedVisitTime || '',
        attr.bestTimeToVisit || '',
        attr.isFeatured ? 'true' : 'false',
        attr.isActive ? 'true' : 'false',
        attr.createdAt,
        attr.updatedAt,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return {
        csv,
        count: attractions.length,
        exportedAt: new Date().toISOString(),
      };
    }),

  // ============ Bulk Import ============
  bulkImport: adminProcedure
    .input(z.object({
      attractions: z.array(z.object({
        name: z.string(),
        slug: z.string(),
        type: attractionTypeEnum,
        locationId: z.number(),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        openingHours: z.string().optional(),
        closedOn: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        image: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        entryFee: z.string().optional(),
        estimatedVisitTime: z.string().optional(),
        bestTimeToVisit: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      const results = {
        created: 0,
        updated: 0,
        failed: 0,
        errors: [] as any[],
        startTime,
        endTime: 0,
      };

      for (let i = 0; i < input.attractions.length; i++) {
        try {
          const attraction = input.attractions[i];
          const locationId = attraction.locationId || 1; // Default to first location if not specified
          const existing = await db.getAttractionBySlug(locationId, attraction.slug);
          if (existing) {
            await db.updateAttraction(existing.id, attraction as any);
            results.updated++;
          } else {
            await db.createAttraction(attraction as any);
            results.created++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            field: "attraction",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      results.endTime = Date.now();
      return results;
    }),

  // ============ Image Management ============
  uploadImage: adminProcedure
    .input(z.object({
      attractionId: z.number(),
      imageUrl: z.string(),
      altText: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Image upload logic - store reference in database
      return { success: true, imageUrl: input.imageUrl };
    }),

  deleteImage: adminProcedure
    .input(z.object({
      attractionId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Image deletion logic
      return { success: true };
    }),

  setFeaturedImage: adminProcedure
    .input(z.object({
      attractionId: z.number(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Set featured image logic
      return { success: true, featuredImage: input.imageUrl };
    }),

  // ============ Template Download ============
  getCSVTemplate: adminProcedure.query(() => {
    const headers = [
      'locationId', 'name', 'slug', 'type', 'description', 'address',
      'phone', 'email', 'website', 'openingHours', 'closedOn',
      'latitude', 'longitude', 'image', 'rating', 'reviewCount',
      'entryFee', 'estimatedVisitTime', 'bestTimeToVisit', 'highlights',
      'isFeatured', 'isActive'
    ];

    const sampleRow = [
      '1', 'Taj Mahal', 'taj-mahal', 'monument',
      'A white marble mausoleum built by Mughal Emperor Shah Jahan',
      'Agra, Uttar Pradesh 282001',
      '+91-562-2226431', 'info@tajmahal.com', 'https://www.tajmahal.com',
      '6:00 AM - 7:00 PM', 'Friday',
      '27.1751', '78.0421', 'https://example.com/taj-mahal.jpg',
      '4.8', '5000',
      '₹250 (Indian), ₹500 (Foreign)', '2-3 hours', 'October-March',
      'Ancient architecture|Intricate carvings|Spiritual significance',
      'true', 'true'
    ];

    const csv = [
      headers.join(','),
      sampleRow.join(','),
    ].join('\n');

    return {
      csv,
      filename: 'attractions-template.csv',
    };
  }),

});

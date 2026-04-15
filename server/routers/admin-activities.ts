import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  activities, 
  activityImages, 
  activityInclusions,
  locations,
  InsertActivityImage,
  InsertActivityInclusion,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut, storageGet } from "../storage";

// Admin procedure - only admins can access
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminActivitiesRouter = router({
  // ============ Activity Image Management ============

  /**
   * Upload image for an activity
   * Accepts base64 encoded image data and stores it in S3
   */
  uploadImage: adminProcedure
    .input(z.object({
      activityId: z.number(),
      imageData: z.string(), // base64 encoded image
      fileName: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      isMain: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verify activity exists
        const activity = await db
          .select()
          .from(activities)
          .where(eq(activities.id, input.activityId))
          .limit(1);

        if (!activity.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Activity not found",
          });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.imageData, "base64");
        const fileKey = `activities/${input.activityId}/${Date.now()}-${input.fileName}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        // If this is the main image, unset other main images
        if (input.isMain) {
          await db
            .update(activityImages)
            .set({ isMain: false })
            .where(eq(activityImages.activityId, input.activityId));
        }

        // Insert image record
        const result = await db.insert(activityImages).values({
          activityId: input.activityId,
          url,
          fileKey,
          alt: input.alt,
          caption: input.caption,
          isMain: input.isMain,
          order: 0,
        });

        return {
          success: true,
          url,
          fileKey,
          message: "Image uploaded successfully",
        };
      } catch (error) {
        console.error("Image upload error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload image",
        });
      }
    }),

  /**
   * Get all images for an activity
   */
  getImages: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(activityImages)
        .where(eq(activityImages.activityId, input.activityId))
        .orderBy(activityImages.order);
    }),

  /**
   * Delete an activity image
   */
  deleteImage: adminProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Get image details
        const image = await db
          .select()
          .from(activityImages)
          .where(eq(activityImages.id, input.imageId))
          .limit(1);

        if (!image.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // Delete from S3 (optional - depends on storage implementation)
        // await storageDelete(image[0].fileKey);

        // Delete from database
        await db.delete(activityImages).where(eq(activityImages.id, input.imageId));

        return { success: true, message: "Image deleted successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete image",
        });
      }
    }),

  /**
   * Update image metadata (alt, caption, order, isMain)
   */
  updateImage: adminProcedure
    .input(
      z.object({
        imageId: z.number(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        order: z.number().optional(),
        isMain: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { imageId, ...updateData } = input;

        // If setting as main, unset other main images
        if (updateData.isMain) {
          const image = await db
            .select()
            .from(activityImages)
            .where(eq(activityImages.id, imageId))
            .limit(1);

          if (image.length) {
            await db
              .update(activityImages)
              .set({ isMain: false })
              .where(eq(activityImages.activityId, image[0].activityId));
          }
        }

        await db.update(activityImages).set(updateData).where(eq(activityImages.id, imageId));

        return { success: true, message: "Image updated successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update image",
        });
      }
    }),

  // ============ Activity Inclusions/Exclusions Management ============

  /**
   * Add inclusion or exclusion item
   */
  addInclusionItem: adminProcedure
    .input(
      z.object({
        activityId: z.number(),
        item: z.string(),
        type: z.enum(["include", "exclude"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Get max order for this activity
        const maxOrder = await db
          .select({ maxOrder: activityInclusions.order })
          .from(activityInclusions)
          .where(eq(activityInclusions.activityId, input.activityId));

        const order = maxOrder.length > 0 ? (maxOrder[0].maxOrder || 0) + 1 : 0;

        await db.insert(activityInclusions).values({
          activityId: input.activityId,
          item: input.item,
          type: input.type,
          order,
        });

        return { success: true, message: "Item added successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to add item",
        });
      }
    }),

  /**
   * Get inclusions and exclusions for an activity
   */
  getInclusions: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { includes: [], excludes: [] };

      const items = await db
        .select()
        .from(activityInclusions)
        .where(eq(activityInclusions.activityId, input.activityId))
        .orderBy(activityInclusions.order);

      return {
        includes: items.filter((i) => i.type === "include"),
        excludes: items.filter((i) => i.type === "exclude"),
      };
    }),

  /**
   * Delete an inclusion/exclusion item
   */
  deleteInclusionItem: adminProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .delete(activityInclusions)
          .where(eq(activityInclusions.id, input.itemId));

        return { success: true, message: "Item deleted successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete item",
        });
      }
    }),

  /**
   * Update inclusion/exclusion item
   */
  updateInclusionItem: adminProcedure
    .input(
      z.object({
        itemId: z.number(),
        item: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { itemId, ...updateData } = input;

        await db
          .update(activityInclusions)
          .set(updateData)
          .where(eq(activityInclusions.id, itemId));

        return { success: true, message: "Item updated successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update item",
        });
      }
    }),

  // ============ Location Management ============

  /**
   * Get all locations with activity count
   */
  listLocations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(locations);
  }),

  /**
   * Create a new location
   */
  createLocation: adminProcedure
    .input(
      z.object({
        stateId: z.number(),
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db.insert(locations).values(input as any);
        return { success: true, message: "Location created successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create location",
        });
      }
    }),

  /**
   * Update a location
   */
  updateLocation: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(locations)
          .set(input.data)
          .where(eq(locations.id, input.id));

        return { success: true, message: "Location updated successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update location",
        });
      }
    }),

  /**
   * Delete a location
   */
  deleteLocation: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(locations).where(eq(locations.id, input.id));

        return { success: true, message: "Location deleted successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete location",
        });
      }
    }),
});

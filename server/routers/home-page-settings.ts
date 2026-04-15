import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const sliderImageSchema = z.object({
  id: z.string(),
  image: z.string().url(),
  alt: z.string(),
  title: z.string(),
});

export const homePageSettingsRouter = router({
  // Get home page settings (public)
  getSettings: publicProcedure.query(async () => {
    try {
      const settings = await db.getHomePageSettings();
      return settings || { 
        id: 0, 
        sliderImages: [],
        heroTitle: '',
        heroSubtitle: '',
        whyChooseTitle: '',
        whyChooseSubtitle: '',
        whyChooseDescription: '',
        kailashTitle: '',
        kailashDescription: '',
        kailashImage: '',
        brazilTitle: '',
        brazilDescription: '',
        brazilImage: '',
        solarTitle: '',
        solarDescription: '',
        solarButtonText: '',
        contactTitle: '',
        contactDescription: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: ''
      };
    } catch (error) {
      console.error("Error fetching home page settings:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch home page settings",
      });
    }
  }),

  // Update all slider images (admin only)
  updateSettings: adminProcedure
    .input(
      z.object({
        sliderImages: z.array(sliderImageSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.updateHomePageSettings(input.sliderImages);
        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update home page settings",
          });
        }
        return result;
      } catch (error) {
        console.error("Error updating home page settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update home page settings",
        });
      }
    }),

  // Add a new slider image (admin only)
  addImage: adminProcedure
    .input(sliderImageSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db.addSliderImage(input);
        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add slider image",
          });
        }
        return result;
      } catch (error) {
        console.error("Error adding slider image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add slider image",
        });
      }
    }),

  // Remove a slider image (admin only)
  removeImage: adminProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await db.removeSliderImage(input.imageId);
        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove slider image",
          });
        }
        return result;
      } catch (error) {
        console.error("Error removing slider image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove slider image",
        });
      }
    }),

  // Update a specific slider image (admin only)
  updateImage: adminProcedure
    .input(
      z.object({
        imageId: z.string(),
        updates: z.object({
          image: z.string().url().optional(),
          alt: z.string().optional(),
          title: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.updateSliderImage(input.imageId, input.updates);
        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update slider image",
          });
        }
        return result;
      } catch (error) {
        console.error("Error updating slider image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update slider image",
        });
      }
    }),

  // Update section content (admin only)
  updateSectionContent: adminProcedure
    .input(
      z.object({
        heroTitle: z.string().optional(),
        heroSubtitle: z.string().optional(),
        kailashTitle: z.string().optional(),
        kailashDescription: z.string().optional(),
        kailashImage: z.string().optional(),
        brazilTitle: z.string().optional(),
        brazilDescription: z.string().optional(),
        brazilImage: z.string().optional(),
        solarTitle: z.string().optional(),
        solarDescription: z.string().optional(),
        solarButtonText: z.string().optional(),
        getInTouchTitle: z.string().optional(),
        getInTouchDescription: z.string().optional(),
        getInTouchEmail: z.string().optional(),
        getInTouchPhone: z.string().optional(),
        getInTouchAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.updateSectionContent(input);
        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update section content",
          });
        }
        return result;
      } catch (error) {
        console.error("Error updating section content:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update section content",
        });
      }
    }),

  // Body Image Carousel procedures
  getAllBodyImages: publicProcedure.query(async () => {
    try {
      const images = await db.getAllBodyImages();
      return images;
    } catch (error) {
      console.error('Error fetching body images:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch body images',
      });
    }
  }),

  createBodyImage: adminProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        title: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.createBodyImage({
          imageUrl: input.imageUrl,
          title: input.title,
          description: input.description,
          displayOrder: input.displayOrder,
          isActive: true,
        });
        return result;
      } catch (error) {
        console.error('Error creating body image:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create body image',
        });
      }
    }),

  updateBodyImage: adminProcedure
    .input(
      z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        const result = await db.updateBodyImage(id, updateData);
        return result;
      } catch (error) {
        console.error('Error updating body image:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update body image',
        });
      }
    }),

  deleteBodyImage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteBodyImage(input.id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting body image:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete body image',
        });
      }
    }),

  reorderBodyImages: adminProcedure
    .input(
      z.object({
        images: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.reorderBodyImages(input.images);
        return { success: true };
      } catch (error) {
        console.error('Error reordering body images:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder body images',
        });
      }
    }),

  // Featured Destinations procedures
  getAllFeaturedDestinations: publicProcedure.query(async () => {
    try {
      const destinations = await db.getAllFeaturedDestinations();
      return destinations;
    } catch (error) {
      console.error('Error fetching featured destinations:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch featured destinations',
      });
    }
  }),

  createFeaturedDestination: adminProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        title: z.string(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.createFeaturedDestination({
          imageUrl: input.imageUrl,
          title: input.title,
          description: input.description,
          displayOrder: input.displayOrder || 0,
          isActive: true,
        });
        return result;
      } catch (error) {
        console.error('Error creating featured destination:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create featured destination',
        });
      }
    }),

  updateFeaturedDestination: adminProcedure
    .input(
      z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        const result = await db.updateFeaturedDestination(id, updateData);
        return result;
      } catch (error) {
        console.error('Error updating featured destination:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update featured destination',
        });
      }
    }),

  deleteFeaturedDestination: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteFeaturedDestination(input.id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting featured destination:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete featured destination',
        });
      }
    }),

  reorderFeaturedDestinations: adminProcedure
    .input(
      z.object({
        destinations: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.reorderFeaturedDestinations(input.destinations);
        return { success: true };
      } catch (error) {
        console.error('Error reordering featured destinations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder featured destinations',
        });
      }
    }),

  // Review Widgets procedures
  getAllReviewWidgets: publicProcedure.query(async () => {
    try {
      const widgets = await db.getAllReviewWidgets();
      return widgets;
    } catch (error) {
      console.error('Error fetching review widgets:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch review widgets',
      });
    }
  }),

  createOrUpdateReviewWidget: adminProcedure
    .input(
      z.object({
        platform: z.string(),
        starRating: z.number(),
        reviewCount: z.number(),
        reviewLink: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.createOrUpdateReviewWidget({
          platform: input.platform,
          starRating: input.starRating,
          reviewCount: input.reviewCount,
          reviewLink: input.reviewLink,
          isActive: true,
        });
        return result;
      } catch (error) {
        console.error('Error creating/updating review widget:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create/update review widget',
        });
      }
    }),

  deleteReviewWidget: adminProcedure
    .input(z.object({ platform: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await db.deleteReviewWidget(input.platform);
        return { success: true };
      } catch (error) {
        console.error('Error deleting review widget:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete review widget',
        });
      }
    }),

  // Destination Gallery procedures
  getAllDestinationGallery: publicProcedure.query(async () => {
    try {
      const gallery = await db.getAllDestinationGallery();
      if (gallery.length === 0) {
        // Initialize with defaults
        await db.initializeDestinationGallery();
        return await db.getAllDestinationGallery();
      }
      return gallery;
    } catch (error) {
      console.error('Error fetching destination gallery:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch destination gallery',
      });
    }
  }),

  updateDestinationGalleryCard: adminProcedure
    .input(
      z.object({
        cardNumber: z.number().min(1).max(3),
        imageUrl: z.string().url(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.updateDestinationGalleryCard(input.cardNumber, {
          imageUrl: input.imageUrl,
          title: input.title,
          description: input.description,
        });
        return result;
      } catch (error) {
        console.error('Error updating destination gallery card:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update destination gallery card',
        });
      }
    }),
});

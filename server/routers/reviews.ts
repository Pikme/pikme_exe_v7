import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { reviews, tours } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const reviewsRouter = router({
  /**
   * Create a new review
   */
  create: publicProcedure
    .input(
      z.object({
        tourId: z.number(),
        guestName: z.string().min(2).max(255),
        guestEmail: z.string().email(),
        rating: z.number().min(1).max(5),
        title: z.string().min(3).max(255).optional(),
        text: z.string().min(10).max(5000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      try {
        // Verify tour exists
        const tour = await db.query.tours.findFirst({
          where: eq(tours.id, input.tourId),
        });

        if (!tour) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tour not found',
          });
        }

        // Create review
        const result = await db.insert(reviews).values({
          tourId: input.tourId,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          rating: input.rating,
          title: input.title,
          text: input.text,
          status: 'pending', // Reviews require approval
        });

        return {
          success: true,
          message: 'Review submitted successfully. It will be reviewed before publishing.',
          reviewId: result[0],
        };
      } catch (error) {
        console.error('Error creating review:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create review',
        });
      }
    }),

  /**
   * Get reviews for a tour
   */
  getByTour: publicProcedure
    .input(
      z.object({
        tourId: z.number(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      try {
        const tourReviews = await db.query.reviews.findMany({
          where: and(
            eq(reviews.tourId, input.tourId),
            eq(reviews.status, 'approved')
          ),
          orderBy: desc(reviews.createdAt),
          limit: input.limit,
          offset: input.offset,
        });

        const totalCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(
            and(
              eq(reviews.tourId, input.tourId),
              eq(reviews.status, 'approved')
            )
          );

        return {
          reviews: tourReviews,
          total: totalCount[0]?.count || 0,
        };
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reviews',
        });
      }
    }),

  /**
   * Get average rating for a tour
   */
  getAverageRating: publicProcedure
    .input(z.object({ tourId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      try {
        const result = await db
          .select({
            averageRating: sql<number>`AVG(${reviews.rating})`,
            totalReviews: sql<number>`COUNT(*)`,
            ratingDistribution: sql<string>`JSON_OBJECT(
              '5', COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END),
              '4', COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END),
              '3', COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END),
              '2', COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END),
              '1', COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)
            )`,
          })
          .from(reviews)
          .where(
            and(
              eq(reviews.tourId, input.tourId),
              eq(reviews.status, 'approved')
            )
          );

        const data = result[0];
        return {
          averageRating: data.averageRating ? Math.round(data.averageRating * 10) / 10 : 0,
          totalReviews: data.totalReviews || 0,
          ratingDistribution: data.ratingDistribution ? JSON.parse(data.ratingDistribution) : {},
        };
      } catch (error) {
        console.error('Error fetching average rating:', error);
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        };
      }
    }),

  /**
   * Mark review as helpful
   */
  markHelpful: publicProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      try {
        await db
          .update(reviews)
          .set({
            helpful: sql`${reviews.helpful} + 1`,
          })
          .where(eq(reviews.id, input.reviewId));

        return { success: true };
      } catch (error) {
        console.error('Error marking review as helpful:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark review as helpful',
        });
      }
    }),

  /**
   * Mark review as unhelpful
   */
  markUnhelpful: publicProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      try {
        await db
          .update(reviews)
          .set({
            unhelpful: sql`${reviews.unhelpful} + 1`,
          })
          .where(eq(reviews.id, input.reviewId));

        return { success: true };
      } catch (error) {
        console.error('Error marking review as unhelpful:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark review as unhelpful',
        });
      }
    }),

  /**
   * Admin: Get pending reviews
   */
  getPendingReviews: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const db = getDb();

      try {
        const pendingReviews = await db.query.reviews.findMany({
          where: eq(reviews.status, 'pending'),
          orderBy: desc(reviews.createdAt),
          limit: input.limit,
          offset: input.offset,
        });

        const totalCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.status, 'pending'));

        return {
          reviews: pendingReviews,
          total: totalCount[0]?.count || 0,
        };
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pending reviews',
        });
      }
    }),

  /**
   * Admin: Approve review
   */
  approveReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const db = getDb();

      try {
        await db
          .update(reviews)
          .set({ status: 'approved' })
          .where(eq(reviews.id, input.reviewId));

        return { success: true, message: 'Review approved' };
      } catch (error) {
        console.error('Error approving review:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve review',
        });
      }
    }),

  /**
   * Admin: Reject review
   */
  rejectReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const db = getDb();

      try {
        await db
          .update(reviews)
          .set({ status: 'rejected' })
          .where(eq(reviews.id, input.reviewId));

        return { success: true, message: 'Review rejected' };
      } catch (error) {
        console.error('Error rejecting review:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject review',
        });
      }
    }),

  /**
   * Admin: Delete review
   */
  deleteReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const db = getDb();

      try {
        await db.delete(reviews).where(eq(reviews.id, input.reviewId));

        return { success: true, message: 'Review deleted' };
      } catch (error) {
        console.error('Error deleting review:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete review',
        });
      }
    }),
});

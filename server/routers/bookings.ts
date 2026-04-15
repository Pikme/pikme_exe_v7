import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { bookings, tours } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const bookingsRouter = router({
  /**
   * Create a new booking
   */
  create: publicProcedure
    .input(
      z.object({
        tourId: z.number(),
        guestName: z.string().min(2).max(255),
        guestEmail: z.string().email(),
        guestPhone: z.string().max(20).optional(),
        numberOfGuests: z.number().min(1),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
        totalPrice: z.number().min(0),
        specialRequests: z.string().max(5000).optional(),
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

        // Create booking
        const result = await db.insert(bookings).values({
          tourId: input.tourId,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          numberOfGuests: input.numberOfGuests,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
          totalPrice: input.totalPrice.toString(),
          specialRequests: input.specialRequests,
          status: 'pending',
          paymentStatus: 'pending',
        });

        return {
          success: true,
          bookingId: result[0],
          message: 'Booking created successfully',
        };
      } catch (error) {
        console.error('Error creating booking:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create booking',
        });
      }
    }),

  /**
   * Get booking by ID
   */
  getById: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      try {
        const booking = await db.query.bookings.findFirst({
          where: eq(bookings.id, input.bookingId),
        });

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }

        return booking;
      } catch (error) {
        console.error('Error fetching booking:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch booking',
        });
      }
    }),

  /**
   * Get bookings by email
   */
  getByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      try {
        const userBookings = await db.query.bookings.findMany({
          where: eq(bookings.guestEmail, input.email),
          orderBy: desc(bookings.createdAt),
          limit: input.limit,
          offset: input.offset,
        });

        const totalCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(bookings)
          .where(eq(bookings.guestEmail, input.email));

        return {
          bookings: userBookings,
          total: totalCount[0]?.count || 0,
        };
      } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bookings',
        });
      }
    }),

  /**
   * Update booking status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
      })
    )
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
          .update(bookings)
          .set({ status: input.status })
          .where(eq(bookings.id, input.bookingId));

        return { success: true, message: 'Booking status updated' };
      } catch (error) {
        console.error('Error updating booking:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update booking',
        });
      }
    }),

  /**
   * Update payment status
   */
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        paymentStatus: z.enum(['pending', 'succeeded', 'failed', 'refunded']),
        stripePaymentId: z.string().optional(),
      })
    )
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
          .update(bookings)
          .set({
            paymentStatus: input.paymentStatus,
            stripePaymentId: input.stripePaymentId,
          })
          .where(eq(bookings.id, input.bookingId));

        return { success: true, message: 'Payment status updated' };
      } catch (error) {
        console.error('Error updating payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payment',
        });
      }
    }),

  /**
   * Process refund
   */
  processRefund: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        refundAmount: z.number().min(0),
        refundReason: z.string().max(5000),
      })
    )
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
          .update(bookings)
          .set({
            paymentStatus: 'refunded',
            refundAmount: input.refundAmount.toString(),
            refundReason: input.refundReason,
          })
          .where(eq(bookings.id, input.bookingId));

        return { success: true, message: 'Refund processed' };
      } catch (error) {
        console.error('Error processing refund:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process refund',
        });
      }
    }),

  /**
   * Admin: Get all bookings
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
        paymentStatus: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
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
        const conditions = [];
        if (input.status) conditions.push(eq(bookings.status, input.status));
        if (input.paymentStatus) conditions.push(eq(bookings.paymentStatus, input.paymentStatus));

        const allBookings = await db.query.bookings.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          orderBy: desc(bookings.createdAt),
          limit: input.limit,
          offset: input.offset,
        });

        const totalCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(bookings)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
          bookings: allBookings,
          total: totalCount[0]?.count || 0,
        };
      } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bookings',
        });
      }
    }),

  /**
   * Get booking statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }

    const db = getDb();

    try {
      const stats = await db
        .select({
          totalBookings: sql<number>`COUNT(*)`,
          confirmedBookings: sql<number>`COUNT(CASE WHEN status = 'confirmed' THEN 1 END)`,
          pendingBookings: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
          cancelledBookings: sql<number>`COUNT(CASE WHEN status = 'cancelled' THEN 1 END)`,
          completedBookings: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
          totalRevenue: sql<string>`SUM(totalPrice)`,
          successfulPayments: sql<number>`COUNT(CASE WHEN paymentStatus = 'succeeded' THEN 1 END)`,
          failedPayments: sql<number>`COUNT(CASE WHEN paymentStatus = 'failed' THEN 1 END)`,
        })
        .from(bookings);

      return stats[0] || {};
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {};
    }
  }),
});

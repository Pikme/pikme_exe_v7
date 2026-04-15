import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  processRefund,
} from '../stripe-service';
import { TRPCError } from '@trpc/server';

export const paymentsRouter = router({
  /**
   * Create payment intent for booking
   */
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        bookingId: z.number(),
        amount: z.number().min(0),
        customerEmail: z.string().email(),
        customerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Payment processing is not configured. Please contact support.',
          });
        }

        const result = await createPaymentIntent({
          bookingId: input.bookingId,
          amount: input.amount,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
        });

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to create payment intent',
          });
        }

        return {
          success: true,
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId,
        };
      } catch (error) {
        console.error('Error creating payment intent:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent',
        });
      }
    }),

  /**
   * Confirm payment
   */
  confirmPayment: publicProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        bookingId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Payment processing is not configured. Please contact support.',
          });
        }

        const result = await confirmPayment({
          paymentIntentId: input.paymentIntentId,
          bookingId: input.bookingId,
        });

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to confirm payment',
          });
        }

        return {
          success: true,
          message: result.message,
          bookingId: result.bookingId,
        };
      } catch (error) {
        console.error('Error confirming payment:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm payment',
        });
      }
    }),

  /**
   * Get payment intent details
   */
  getPaymentIntent: publicProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .query(async ({ input }) => {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Payment processing is not configured.',
          });
        }

        const result = await getPaymentIntent(input.paymentIntentId);

        if (!result.success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: result.error || 'Payment intent not found',
          });
        }

        return result.paymentIntent;
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment intent',
        });
      }
    }),

  /**
   * Admin: Process refund
   */
  processRefund: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Payment processing is not configured.',
          });
        }

        const result = await processRefund(input.paymentIntentId, input.amount);

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to process refund',
          });
        }

        return {
          success: true,
          refundId: result.refundId,
          amount: result.amount,
        };
      } catch (error) {
        console.error('Error processing refund:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process refund',
        });
      }
    }),
});

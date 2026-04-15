import Stripe from 'stripe';
import { getDb } from './db';
import { bookings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

// Initialize Stripe only if the API key is provided
if (stripeKey) {
  stripe = new Stripe(stripeKey, {
    apiVersion: '2024-06-20',
  });
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe payment features will be disabled.');
}

// Helper function to check if Stripe is configured
function ensureStripeConfigured() {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

export interface CreatePaymentIntentParams {
  bookingId: number;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  bookingId: number;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent({
  bookingId,
  amount,
  currency = 'INR',
  customerEmail,
  customerName,
}: CreatePaymentIntentParams) {
  try {
    const stripeInstance = ensureStripeConfigured();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingId.toString(),
      },
      description: `Booking #${bookingId}`,
      receipt_email: customerEmail,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Confirm payment and update booking
 */
export async function confirmPayment({ paymentIntentId, bookingId }: ConfirmPaymentParams) {
  try {
    const stripeInstance = ensureStripeConfigured();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const db = getDb();

      // Update booking with payment details
      await db
        .update(bookings)
        .set({
          stripePaymentId: paymentIntentId,
          paymentStatus: 'succeeded',
          status: 'confirmed',
        })
        .where(eq(bookings.id, bookingId));

      return {
        success: true,
        message: 'Payment confirmed successfully',
        bookingId,
      };
    } else if (paymentIntent.status === 'processing') {
      return {
        success: false,
        error: 'Payment is still processing. Please wait.',
      };
    } else {
      const db = getDb();

      // Update booking with failed payment
      await db
        .update(bookings)
        .set({
          stripePaymentId: paymentIntentId,
          paymentStatus: 'failed',
        })
        .where(eq(bookings.id, bookingId));

      return {
        success: false,
        error: 'Payment failed. Please try again.',
      };
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    };
  }
}

/**
 * Create a customer
 */
export async function createCustomer(email: string, name: string) {
  try {
    const stripeInstance = ensureStripeConfigured();
    const customer = await stripeInstance.customers.create({
      email,
      name,
    });

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    };
  }
}

/**
 * Process refund
 */
export async function processRefund(paymentIntentId: string, amount?: number) {
  try {
    const stripeInstance = ensureStripeConfigured();
    const refund = await stripeInstance.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    };
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripeInstance = ensureStripeConfigured();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
      },
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    };
  }
}

/**
 * Handle Stripe webhook
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (bookingId) {
        const db = getDb();
        await db
          .update(bookings)
          .set({
            paymentStatus: 'succeeded',
            status: 'confirmed',
          })
          .where(eq(bookings.id, parseInt(bookingId)));
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (bookingId) {
        const db = getDb();
        await db
          .update(bookings)
          .set({
            paymentStatus: 'failed',
          })
          .where(eq(bookings.id, parseInt(bookingId)));
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        const db = getDb();
        await db
          .update(bookings)
          .set({
            paymentStatus: 'refunded',
          })
          .where(eq(bookings.stripePaymentId, paymentIntentId));
      }
      break;
    }
  }

  return { received: true };
}

export default stripe || null;

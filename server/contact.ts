import { z } from 'zod';
import { publicProcedure } from './routers';
import axios from 'axios';

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+\d{1,3}\d{6,14}$/, 'Invalid phone format'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  recaptchaToken: z.string(),
});

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    // reCAPTCHA v3 returns a score between 0 and 1
    // 1.0 is very likely a legitimate interaction, 0.0 is very likely a bot
    // We'll accept scores >= 0.5
    return response.data.success && response.data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

// Contact form submission procedure
export const contactSubmitProcedure = publicProcedure
  .input(contactFormSchema)
  .mutation(async ({ input }) => {
    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(input.recaptchaToken);
    if (!isValidCaptcha) {
      throw new Error('reCAPTCHA verification failed');
    }

    // Here you would typically:
    // 1. Save the contact form to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user

    console.log('Contact form submitted:', {
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
    });

    // Return success response
    return {
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
    };
  });

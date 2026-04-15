import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+\d{1,3}\d{6,14}$/, 'Invalid phone format'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const contactRouter = router({
  submitForm: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
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
    }),
});

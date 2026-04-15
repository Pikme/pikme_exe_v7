import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createBookingEnquiry,
  getBookingEnquiries,
  getBookingEnquiry,
  updateBookingEnquiry,
  deleteBookingEnquiry,
  getBookingEnquiriesByStatus,
  countBookingEnquiries,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { routeEnquiry } from "../routing-engine";

export const bookingEnquiriesRouter = router({
  /**
   * Create a new booking enquiry (public)
   */
  create: publicProcedure
    .input(
      z.object({
        tourId: z.number(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
        country: z.string().optional(),
        numberOfTravelers: z.number().min(1, "At least 1 traveler required"),
        preferredStartDate: z.string().optional(),
        preferredEndDate: z.string().optional(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createBookingEnquiry({
        tourId: input.tourId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        country: input.country,
        numberOfTravelers: input.numberOfTravelers,
        preferredStartDate: input.preferredStartDate,
        preferredEndDate: input.preferredEndDate,
        specialRequests: input.specialRequests,
        status: "new",
      });

      // Send notification to admin
      await notifyOwner({
        title: "New Booking Enquiry",
        content: `New booking enquiry from ${input.firstName} ${input.lastName} (${input.email}) for ${input.numberOfTravelers} travelers. Phone: ${input.phone}`,
      });

      // Automatically route enquiry to best team member
      try {
        const routingResult = await routeEnquiry(result.id);
        console.log(
          `[BOOKING] Enquiry #${result.id} auto-routed to user ${routingResult.assignedToUserId}`
        );
        return {
          ...result,
          autoRoutingApplied: true,
          assignedToUserId: routingResult.assignedToUserId,
          routingScore: routingResult.scores[0]?.totalScore,
        };
      } catch (routingError) {
        console.error(
          `[BOOKING] Failed to auto-route enquiry #${result.id}:`,
          routingError
        );
        return {
          ...result,
          autoRoutingApplied: false,
          routingError: routingError instanceof Error ? routingError.message : "Unknown error",
        };
      }
    }),

  /**
   * Get all booking enquiries (admin only)
   */
  list: protectedProcedure
    .input(
      z.object({
        tourId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const enquiries = await getBookingEnquiries({
        tourId: input.tourId,
        status: input.status,
        limit: input.limit,
        offset: input.offset,
      });

      const total = await countBookingEnquiries({
        tourId: input.tourId,
        status: input.status,
      });

      return {
        enquiries,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get a single booking enquiry (admin only)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await getBookingEnquiry(input.id);
    }),

  /**
   * Update booking enquiry status (admin only)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "booked", "rejected"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const updateData: any = {
        status: input.status,
      };

      if (input.status === "contacted") {
        updateData.contactedAt = new Date();
      }

      if (input.notes) {
        updateData.notes = input.notes;
      }

      await updateBookingEnquiry(input.id, updateData);
      return { success: true };
    }),

  /**
   * Delete booking enquiry (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await deleteBookingEnquiry(input.id);
      return { success: true };
    }),

  /**
   * Get booking enquiries by status (admin only)
   */
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await getBookingEnquiriesByStatus(input.status);
    }),

  /**
   * Get booking enquiry count (admin only)
   */
  count: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        tourId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await countBookingEnquiries({
        status: input.status,
        tourId: input.tourId,
      });
    }),
});

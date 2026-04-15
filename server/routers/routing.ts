import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import {
  teamMemberExpertise,
  teamMemberAvailability,
  routingRules,
  routingAudit,
  bookingEnquiries,
  users,
} from "../../drizzle/schema";
import { getDb } from "../db";
import {
  routeEnquiry,
  updateTeamMemberAvailability,
  getTeamMemberExpertiseSummary,
  getRoutingStatistics,
} from "../routing-engine";
import { notifyOwner } from "../_core/notification";

// Admin procedure for routing configuration
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const routingRouter = router({
  /**
   * Automatically route an enquiry to best team member
   */
  autoRouteEnquiry: adminProcedure
    .input(z.object({ enquiryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get enquiry
      const enquiry = await db
        .select()
        .from(bookingEnquiries)
        .where(eq(bookingEnquiries.id, input.enquiryId))
        .then((rows) => rows[0]);

      if (!enquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Enquiry not found" });
      }

      // Run routing algorithm
      const result = await routeEnquiry(input.enquiryId);

      // Update enquiry with assignment
      await db
        .update(bookingEnquiries)
        .set({
          assignedTo: result.assignedToUserId,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.enquiryId));

      // Update team member availability
      await updateTeamMemberAvailability(result.assignedToUserId, 1);

      // Get assigned team member info
      const assignedMember = await db
        .select()
        .from(users)
        .where(eq(users.id, result.assignedToUserId))
        .then((rows) => rows[0]);

      // Send notification
      await notifyOwner({
        title: "Enquiry Auto-Routed",
        content: `Enquiry #${input.enquiryId} has been automatically assigned to ${assignedMember?.name}. Score: ${result.scores[0]?.totalScore.toFixed(2)}/100`,
      });

      return {
        success: true,
        enquiryId: input.enquiryId,
        assignedToUserId: result.assignedToUserId,
        assignedToName: assignedMember?.name,
        score: result.scores[0]?.totalScore,
        allScores: result.scores,
        appliedRule: result.selectedRule,
      };
    }),

  /**
   * Get routing scores for an enquiry (preview before assigning)
   */
  getRoutingScores: adminProcedure
    .input(z.object({ enquiryId: z.number() }))
    .query(async ({ input }) => {
      const result = await routeEnquiry(input.enquiryId);
      return {
        enquiryId: input.enquiryId,
        scores: result.scores,
        recommendedUserId: result.scores[0]?.userId,
        recommendedUserName: result.scores[0]?.userName,
        appliedRule: result.selectedRule,
      };
    }),

  /**
   * Configure team member expertise
   */
  configureExpertise: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        tourCategoryId: z.number().optional(),
        destination: z.string().optional(),
        language: z.string().optional(),
        proficiencyLevel: z.enum(["beginner", "intermediate", "expert"]),
        yearsOfExperience: z.number().optional(),
        maxConcurrentEnquiries: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Check if expertise record exists
      const existing = await db
        .select()
        .from(teamMemberExpertise)
        .where(
          and(
            eq(teamMemberExpertise.userId, input.userId),
            eq(teamMemberExpertise.destination, input.destination || null),
            eq(teamMemberExpertise.language, input.language || null)
          )
        )
        .then((rows) => rows[0]);

      if (existing) {
        // Update existing
        await db
          .update(teamMemberExpertise)
          .set({
            proficiencyLevel: input.proficiencyLevel,
            yearsOfExperience: input.yearsOfExperience,
            updatedAt: new Date(),
          })
          .where(eq(teamMemberExpertise.id, existing.id));
      } else {
        // Create new
        await db.insert(teamMemberExpertise).values({
          userId: input.userId,
          tourCategoryId: input.tourCategoryId,
          destination: input.destination,
          language: input.language,
          proficiencyLevel: input.proficiencyLevel,
          yearsOfExperience: input.yearsOfExperience || 0,
          maxConcurrentEnquiries: input.maxConcurrentEnquiries || 10,
        });
      }

      return { success: true, message: "Expertise configured" };
    }),

  /**
   * Get team member expertise summary
   */
  getExpertiseSummary: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getTeamMemberExpertiseSummary(input.userId);
    }),

  /**
   * Create or update routing rule
   */
  createRoutingRule: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        priority: z.number(),
        tourCategoryId: z.number().optional(),
        destinationPattern: z.string().optional(),
        requiredLanguage: z.string().optional(),
        minExperienceYears: z.number().optional(),
        assignmentStrategy: z.enum([
          "round_robin",
          "least_loaded",
          "expertise_match",
          "random",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      const result = await db.insert(routingRules).values({
        name: input.name,
        description: input.description,
        priority: input.priority,
        tourCategoryId: input.tourCategoryId,
        destinationPattern: input.destinationPattern,
        requiredLanguage: input.requiredLanguage,
        minExperienceYears: input.minExperienceYears || 0,
        assignmentStrategy: input.assignmentStrategy,
      });

      return {
        success: true,
        message: "Routing rule created",
        ruleId: result.insertId,
      };
    }),

  /**
   * List all routing rules
   */
  listRoutingRules: adminProcedure.query(async () => {
    const db = await getDb();
    return await db.select().from(routingRules).orderBy((t) => t.priority);
  }),

  /**
   * Update routing rule
   */
  updateRoutingRule: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      await db
        .update(routingRules)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(routingRules.id, input.id));

      return { success: true, message: "Routing rule updated" };
    }),

  /**
   * Delete routing rule
   */
  deleteRoutingRule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      await db
        .update(routingRules)
        .set({ isActive: false })
        .where(eq(routingRules.id, input.id));

      return { success: true, message: "Routing rule deactivated" };
    }),

  /**
   * Get routing audit trail for an enquiry
   */
  getRoutingAudit: adminProcedure
    .input(z.object({ enquiryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();

      return await db
        .select()
        .from(routingAudit)
        .where(eq(routingAudit.enquiryId, input.enquiryId));
    }),

  /**
   * Get routing statistics
   */
  getRoutingStats: adminProcedure.query(async () => {
    return await getRoutingStatistics();
  }),

  /**
   * Update team member availability
   */
  updateAvailability: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        isAvailable: z.boolean().optional(),
        unavailableUntil: z.date().optional(),
        maxEnquiriesPerDay: z.number().optional(),
        currentEnquiriesCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      const existing = await db
        .select()
        .from(teamMemberAvailability)
        .where(eq(teamMemberAvailability.userId, input.userId))
        .then((rows) => rows[0]);

      if (existing) {
        await db
          .update(teamMemberAvailability)
          .set({
            isAvailable: input.isAvailable ?? existing.isAvailable,
            unavailableUntil: input.unavailableUntil,
            maxEnquiriesPerDay: input.maxEnquiriesPerDay ?? existing.maxEnquiriesPerDay,
            currentEnquiriesCount:
              input.currentEnquiriesCount ?? existing.currentEnquiriesCount,
            updatedAt: new Date(),
          })
          .where(eq(teamMemberAvailability.userId, input.userId));
      } else {
        await db.insert(teamMemberAvailability).values({
          userId: input.userId,
          isAvailable: input.isAvailable ?? true,
          unavailableUntil: input.unavailableUntil,
          maxEnquiriesPerDay: input.maxEnquiriesPerDay || 20,
          currentEnquiriesCount: input.currentEnquiriesCount || 0,
        });
      }

      return { success: true, message: "Availability updated" };
    }),

  /**
   * Get team member availability
   */
  getAvailability: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();

      return await db
        .select()
        .from(teamMemberAvailability)
        .where(eq(teamMemberAvailability.userId, input.userId))
        .then((rows) => rows[0]);
    }),

  /**
   * Bulk auto-route enquiries
   */
  bulkAutoRoute: adminProcedure
    .input(z.object({ enquiryIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const enquiryId of input.enquiryIds) {
        try {
          const result = await routeEnquiry(enquiryId);
          const db = await getDb();

          // Update enquiry
          await db
            .update(bookingEnquiries)
            .set({
              assignedTo: result.assignedToUserId,
              updatedAt: new Date(),
            })
            .where(eq(bookingEnquiries.id, enquiryId));

          // Update availability
          await updateTeamMemberAvailability(result.assignedToUserId, 1);

          results.push({
            enquiryId,
            success: true,
            assignedToUserId: result.assignedToUserId,
            score: result.scores[0]?.totalScore,
          });

          successCount++;
        } catch (error) {
          results.push({
            enquiryId,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          errorCount++;
        }
      }

      return {
        success: true,
        message: `${successCount} enquiries routed, ${errorCount} failed`,
        successCount,
        errorCount,
        results,
      };
    }),
});

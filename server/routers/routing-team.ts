import { router, protectedProcedure } from "../_core/trpc";
import { eq } from "drizzle-orm";
import { users, teamMemberAvailability } from "../drizzle/schema";
import { getDb } from "../db";

/**
 * Router for team member operations in routing context
 */
export const routingTeamRouter = router({
  /**
   * Get list of team members for manual assignment
   * Shows available team members with their current workload
   */
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();

    // Get all team members with their availability info
    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        availability: teamMemberAvailability,
      })
      .from(users)
      .leftJoin(
        teamMemberAvailability,
        eq(users.id, teamMemberAvailability.userId)
      )
      .where(eq(users.role, "user"));

    // Format response
    return teamMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      isAvailable: member.availability?.isAvailable ?? true,
      currentLoad: member.availability?.currentEnquiriesCount ?? 0,
      maxCapacity: member.availability?.maxEnquiriesPerDay ?? 10,
      conversionRate: member.availability?.conversionRate ?? 0,
    }));
  }),

  /**
   * Get team member details for display
   */
  getTeamMemberById: protectedProcedure
    .input(require("zod").z.object({ userId: require("zod").z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();

      const member = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          availability: teamMemberAvailability,
        })
        .from(users)
        .leftJoin(
          teamMemberAvailability,
          eq(users.id, teamMemberAvailability.userId)
        )
        .where(eq(users.id, input.userId))
        .then((rows) => rows[0]);

      if (!member) {
        throw new Error("Team member not found");
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        isAvailable: member.availability?.isAvailable ?? true,
        currentLoad: member.availability?.currentEnquiriesCount ?? 0,
        maxCapacity: member.availability?.maxEnquiriesPerDay ?? 10,
        conversionRate: member.availability?.conversionRate ?? 0,
        unavailableUntil: member.availability?.unavailableUntil,
      };
    }),
});

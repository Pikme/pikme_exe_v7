import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { bookingEnquiries, assignmentHistory, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";

// Admin procedure for team assignments
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const teamAssignmentsRouter = router({
  /**
   * Assign an enquiry to a team member
   */
  assignEnquiry: adminProcedure
    .input(
      z.object({
        enquiryId: z.number(),
        assignToUserId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get current enquiry
      const enquiry = await db
        .select()
        .from(bookingEnquiries)
        .where(eq(bookingEnquiries.id, input.enquiryId))
        .then((rows) => rows[0]);

      if (!enquiry) {
        throw new Error("Enquiry not found");
      }

      // Get assignee user info
      const assignee = await db
        .select()
        .from(users)
        .where(eq(users.id, input.assignToUserId))
        .then((rows) => rows[0]);

      if (!assignee) {
        throw new Error("User not found");
      }

      // Create assignment history record
      await db.insert(assignmentHistory).values({
        enquiryId: input.enquiryId,
        assignedFrom: enquiry.assignedTo || null,
        assignedTo: input.assignToUserId,
        assignedBy: ctx.user.id,
        reason: input.reason || null,
      });

      // Update enquiry assignment
      await db
        .update(bookingEnquiries)
        .set({
          assignedTo: input.assignToUserId,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.enquiryId));

      // Send notification to assigned user
      await notifyOwner({
        title: "New Enquiry Assignment",
        content: `You have been assigned enquiry #${input.enquiryId} by ${ctx.user.name}. ${input.reason ? `Reason: ${input.reason}` : ""}`,
      });

      return { success: true, message: "Enquiry assigned successfully" };
    }),

  /**
   * Unassign an enquiry from a team member
   */
  unassignEnquiry: adminProcedure
    .input(z.object({ enquiryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get current enquiry
      const enquiry = await db
        .select()
        .from(bookingEnquiries)
        .where(eq(bookingEnquiries.id, input.enquiryId))
        .then((rows) => rows[0]);

      if (!enquiry) {
        throw new Error("Enquiry not found");
      }

      // Create assignment history record
      if (enquiry.assignedTo) {
        await db.insert(assignmentHistory).values({
          enquiryId: input.enquiryId,
          assignedFrom: enquiry.assignedTo,
          assignedTo: null,
          assignedBy: ctx.user.id,
          reason: "Unassigned",
        });
      }

      // Update enquiry assignment
      await db
        .update(bookingEnquiries)
        .set({
          assignedTo: null,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.enquiryId));

      return { success: true, message: "Enquiry unassigned successfully" };
    }),

  /**
   * Get all team members for assignment dropdown
   */
  getTeamMembers: adminProcedure.query(async () => {
    const db = await getDb();

    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, "admin"));

    return teamMembers;
  }),

  /**
   * Get my assigned enquiries
   */
  getMyAssignments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();

    const myAssignments = await db
      .select()
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.assignedTo, ctx.user.id));

    return myAssignments;
  }),

  /**
   * Get assignment history for an enquiry
   */
  getAssignmentHistory: adminProcedure
    .input(z.object({ enquiryId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();

      const history = await db
        .select({
          id: assignmentHistory.id,
          enquiryId: assignmentHistory.enquiryId,
          assignedFrom: assignmentHistory.assignedFrom,
          assignedTo: assignmentHistory.assignedTo,
          assignedBy: assignmentHistory.assignedBy,
          reason: assignmentHistory.reason,
          createdAt: assignmentHistory.createdAt,
          assignedByName: users.name,
        })
        .from(assignmentHistory)
        .leftJoin(users, eq(assignmentHistory.assignedBy, users.id))
        .where(eq(assignmentHistory.enquiryId, input.enquiryId));

      return history;
    }),

  /**
   * Get assignment statistics
   */
  getAssignmentStats: adminProcedure.query(async () => {
    const db = await getDb();

    // Get total assignments per user
    const stats = await db
      .select({
        userId: bookingEnquiries.assignedTo,
        userName: users.name,
        totalAssigned: z.number().parse(0), // Placeholder - will be calculated
        newEnquiries: z.number().parse(0),
        contactedEnquiries: z.number().parse(0),
        bookedEnquiries: z.number().parse(0),
      })
      .from(bookingEnquiries)
      .leftJoin(users, eq(bookingEnquiries.assignedTo, users.id))
      .where(eq(bookingEnquiries.assignedTo, null));

    // Group and count assignments
    const groupedStats = stats.reduce((acc: any, row: any) => {
      const userId = row.userId;
      if (!userId) return acc;
      
      const existing = acc.find((s: any) => s.userId === userId);
      if (existing) {
        existing.totalAssigned++;
        if (row.status === 'new') existing.newEnquiries++;
        if (row.status === 'contacted') existing.contactedEnquiries++;
        if (row.status === 'booked') existing.bookedEnquiries++;
      } else {
        acc.push({
          userId,
          userName: row.userName,
          totalAssigned: 1,
          newEnquiries: row.status === 'new' ? 1 : 0,
          contactedEnquiries: row.status === 'contacted' ? 1 : 0,
          bookedEnquiries: row.status === 'booked' ? 1 : 0,
        });
      }
      return acc;
    }, []);

    return groupedStats;
  }),

  /**
   * Bulk assign enquiries to a team member
   */
  bulkAssignEnquiries: adminProcedure
    .input(
      z.object({
        enquiryIds: z.array(z.number()),
        assignToUserId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      let successCount = 0;
      let errorCount = 0;

      for (const enquiryId of input.enquiryIds) {
        try {
          // Get current enquiry
          const enquiry = await db
            .select()
            .from(bookingEnquiries)
            .where(eq(bookingEnquiries.id, enquiryId))
            .then((rows) => rows[0]);

          if (!enquiry) {
            errorCount++;
            continue;
          }

          // Create assignment history record
          await db.insert(assignmentHistory).values({
            enquiryId: enquiryId,
            assignedFrom: enquiry.assignedTo || null,
            assignedTo: input.assignToUserId,
            assignedBy: ctx.user.id,
            reason: input.reason || "Bulk assignment",
          });

          // Update enquiry assignment
          await db
            .update(bookingEnquiries)
            .set({
              assignedTo: input.assignToUserId,
              updatedAt: new Date(),
            })
            .where(eq(bookingEnquiries.id, enquiryId));

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      return {
        success: true,
        message: `${successCount} enquiries assigned, ${errorCount} failed`,
        successCount,
        errorCount,
      };
    }),
});

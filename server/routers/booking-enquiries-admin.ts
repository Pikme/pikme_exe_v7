import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookingEnquiries, tours } from "../../drizzle/schema";
import { eq, and, gte, lte, like, or, desc, asc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const bookingEnquiriesAdminRouter = router({
  // List all enquiries with filters
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "contacted", "booked", "rejected"]).optional(),
        tourId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "firstName", "status"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [];

      if (input.status) {
        conditions.push(eq(bookingEnquiries.status, input.status));
      }

      if (input.tourId) {
        conditions.push(eq(bookingEnquiries.tourId, input.tourId));
      }

      if (input.dateFrom) {
        conditions.push(gte(bookingEnquiries.createdAt, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(bookingEnquiries.createdAt, input.dateTo));
      }

      if (input.search) {
        conditions.push(
          or(
            like(bookingEnquiries.firstName, `%${input.search}%`),
            like(bookingEnquiries.lastName, `%${input.search}%`),
            like(bookingEnquiries.email, `%${input.search}%`),
            like(bookingEnquiries.phone, `%${input.search}%`)
          )
        );
      }

      const orderBy =
        input.sortOrder === "asc"
          ? asc(bookingEnquiries[input.sortBy as keyof typeof bookingEnquiries])
          : desc(bookingEnquiries[input.sortBy as keyof typeof bookingEnquiries]);

      const whereClause = conditions.length > 0 ? and(...(conditions as any)) : undefined;

      const enquiries = await db
        .select({
          id: bookingEnquiries.id,
          firstName: bookingEnquiries.firstName,
          lastName: bookingEnquiries.lastName,
          email: bookingEnquiries.email,
          phone: bookingEnquiries.phone,
          tourId: bookingEnquiries.tourId,
          numberOfTravelers: bookingEnquiries.numberOfTravelers,
          status: bookingEnquiries.status,
          createdAt: bookingEnquiries.createdAt,
          contactedAt: bookingEnquiries.contactedAt,
          assignedTo: bookingEnquiries.assignedTo,
          tourName: tours.name,
        })
        .from(bookingEnquiries)
        .leftJoin(tours, eq(bookingEnquiries.tourId, tours.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: bookingEnquiries.id })
        .from(bookingEnquiries)
        .where(whereClause);

      return {
        enquiries,
        total: total[0]?.count || 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Get enquiry details
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const enquiry = await db
        .select({
          id: bookingEnquiries.id,
          firstName: bookingEnquiries.firstName,
          lastName: bookingEnquiries.lastName,
          email: bookingEnquiries.email,
          phone: bookingEnquiries.phone,
          country: bookingEnquiries.country,
          tourId: bookingEnquiries.tourId,
          numberOfTravelers: bookingEnquiries.numberOfTravelers,
          preferredStartDate: bookingEnquiries.preferredStartDate,
          preferredEndDate: bookingEnquiries.preferredEndDate,
          specialRequests: bookingEnquiries.specialRequests,
          status: bookingEnquiries.status,
          notes: bookingEnquiries.notes,
          assignedTo: bookingEnquiries.assignedTo,
          createdAt: bookingEnquiries.createdAt,
          contactedAt: bookingEnquiries.contactedAt,
          tourName: tours.name,
        })
        .from(bookingEnquiries)
        .leftJoin(tours, eq(bookingEnquiries.tourId, tours.id))
        .where(eq(bookingEnquiries.id, input))
        .limit(1);

      if (!enquiry[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Enquiry not found" });
      }

      return enquiry[0];
    }),

  // Update enquiry status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "booked", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const contactedAt =
        input.status === "contacted" ? new Date() : undefined;

      await db
        .update(bookingEnquiries)
        .set({
          status: input.status,
          ...(contactedAt && { contactedAt }),
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.id));

      return { success: true };
    }),

  // Add or update notes
  updateNotes: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(bookingEnquiries)
        .set({
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.id));

      return { success: true };
    }),

  // Assign enquiry to admin
  assign: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        assignedTo: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(bookingEnquiries)
        .set({
          assignedTo: input.assignedTo,
          updatedAt: new Date(),
        })
        .where(eq(bookingEnquiries.id, input.id));

      return { success: true };
    }),

  // Delete enquiry
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(bookingEnquiries)
        .where(eq(bookingEnquiries.id, input));

      return { success: true };
    }),

  // Bulk update status
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        status: z.enum(["new", "contacted", "booked", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const contactedAt =
        input.status === "contacted" ? new Date() : undefined;

      await db
        .update(bookingEnquiries)
        .set({
          status: input.status,
          ...(contactedAt && { contactedAt }),
          updatedAt: new Date(),
        })
        .where(inArray(bookingEnquiries.id, input.ids));

      return { success: true, updated: input.ids.length };
    }),

  // Bulk delete
  bulkDelete: protectedProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(bookingEnquiries)
        .where(inArray(bookingEnquiries.id, input));

      return { success: true, deleted: input.length };
    }),

  // Get statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const total = await db
      .select({ count: bookingEnquiries.id })
      .from(bookingEnquiries);

    const newEnquiries = await db
      .select({ count: bookingEnquiries.id })
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.status, "new"));

    const contacted = await db
      .select({ count: bookingEnquiries.id })
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.status, "contacted"));

    const booked = await db
      .select({ count: bookingEnquiries.id })
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.status, "booked"));

    const rejected = await db
      .select({ count: bookingEnquiries.id })
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.status, "rejected"));

    const totalCount = total[0]?.count || 0;
    const bookedCount = booked[0]?.count || 0;
    const conversionRate =
      totalCount > 0 ? ((bookedCount / totalCount) * 100).toFixed(2) : "0";

    return {
      total: totalCount,
      new: newEnquiries[0]?.count || 0,
      contacted: contacted[0]?.count || 0,
      booked: bookedCount,
      rejected: rejected[0]?.count || 0,
      conversionRate: parseFloat(conversionRate),
    };
  }),

  // Export to CSV
  exportCSV: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "contacted", "booked", "rejected"]).optional(),
        tourId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [];

      if (input.status) {
        conditions.push(eq(bookingEnquiries.status, input.status));
      }

      if (input.tourId) {
        conditions.push(eq(bookingEnquiries.tourId, input.tourId));
      }

      if (input.dateFrom) {
        conditions.push(gte(bookingEnquiries.createdAt, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(bookingEnquiries.createdAt, input.dateTo));
      }

      const whereClause = conditions.length > 0 ? and(...(conditions as any)) : undefined;

      const enquiries = await db
        .select({
          id: bookingEnquiries.id,
          firstName: bookingEnquiries.firstName,
          lastName: bookingEnquiries.lastName,
          email: bookingEnquiries.email,
          phone: bookingEnquiries.phone,
          country: bookingEnquiries.country,
          tourId: bookingEnquiries.tourId,
          numberOfTravelers: bookingEnquiries.numberOfTravelers,
          preferredStartDate: bookingEnquiries.preferredStartDate,
          preferredEndDate: bookingEnquiries.preferredEndDate,
          status: bookingEnquiries.status,
          createdAt: bookingEnquiries.createdAt,
          tourName: tours.name,
        })
        .from(bookingEnquiries)
        .leftJoin(tours, eq(bookingEnquiries.tourId, tours.id))
        .where(whereClause);

      // Generate CSV content
      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Country",
        "Tour",
        "Travelers",
        "Start Date",
        "End Date",
        "Status",
        "Created Date",
      ];

      const rows: (string | number | null | undefined)[][] = enquiries.map((e) => [
        e.id,
        e.firstName,
        e.lastName,
        e.email,
        e.phone,
        e.country || "",
        e.tourName || "",
        e.numberOfTravelers,
        e.preferredStartDate || "",
        e.preferredEndDate || "",
        e.status,
        new Date(e.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: (string | number | null | undefined)[]) =>
          row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return csvContent;
    }),
});

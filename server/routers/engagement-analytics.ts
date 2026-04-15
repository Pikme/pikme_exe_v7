import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailEngagementMetrics, emailEventTracking, emailEngagementTrends } from "../../drizzle/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export const engagementAnalyticsRouter = router({
  /**
   * Get engagement metrics for a specific email
   */
  getMetrics: protectedProcedure
    .input(z.object({
      emailHistoryId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      const metrics = await db
        .select()
        .from(emailEngagementMetrics)
        .where(eq(emailEngagementMetrics.emailHistoryId, input.emailHistoryId));

      return metrics[0] || null;
    }),

  /**
   * Get engagement trends over time
   */
  getTrends: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      periodType: z.enum(["daily", "weekly", "monthly"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      let query = db.select().from(emailEngagementTrends);

      if (input.startDate && input.endDate) {
        query = query.where(
          and(
            gte(emailEngagementTrends.periodDate, input.startDate),
            lte(emailEngagementTrends.periodDate, input.endDate)
          )
        );
      }

      if (input.periodType) {
        query = query.where(eq(emailEngagementTrends.periodType, input.periodType));
      }

      return query.orderBy(desc(emailEngagementTrends.periodDate));
    }),

  /**
   * Get top performing emails
   */
  getTopEmails: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      return db
        .select()
        .from(emailEngagementMetrics)
        .orderBy(desc(emailEngagementMetrics.engagementScore))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Get recipient engagement profile
   */
  getRecipientProfile: protectedProcedure
    .input(z.object({
      recipientEmail: z.string().email(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      const events = await db
        .select()
        .from(emailEventTracking)
        .where(eq(emailEventTracking.recipientEmail, input.recipientEmail));

      if (events.length === 0) {
        return null;
      }

      const openCount = events.filter((e) => e.eventType === "open").length;
      const clickCount = events.filter((e) => e.eventType === "click").length;
      const bounceCount = events.filter((e) => e.eventType === "bounce").length;
      const complaintCount = events.filter((e) => e.eventType === "complaint").length;

      return {
        recipientEmail: input.recipientEmail,
        totalEvents: events.length,
        openCount,
        clickCount,
        bounceCount,
        complaintCount,
        engagementRate: (openCount + clickCount) / events.length * 100,
        lastEventAt: events[events.length - 1]?.eventTimestamp || null,
        firstEventAt: events[0]?.eventTimestamp || null,
        events: events.slice(0, 50), // Return last 50 events
      };
    }),

  /**
   * Get overall engagement statistics
   */
  getStatistics: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      let query = db.select().from(emailEventTracking);

      if (input.startDate && input.endDate) {
        query = query.where(
          and(
            gte(emailEventTracking.eventTimestamp, input.startDate),
            lte(emailEventTracking.eventTimestamp, input.endDate)
          )
        );
      }

      const events = await query;

      const stats = {
        totalEvents: events.length,
        openCount: events.filter((e) => e.eventType === "open").length,
        clickCount: events.filter((e) => e.eventType === "click").length,
        bounceCount: events.filter((e) => e.eventType === "bounce").length,
        complaintCount: events.filter((e) => e.eventType === "complaint").length,
        deliveryCount: events.filter((e) => e.eventType === "delivery").length,
        uniqueRecipients: new Set(events.map((e) => e.recipientEmail)).size,
      };

      // Calculate rates
      const totalDelivered = stats.deliveryCount || stats.totalEvents;
      return {
        ...stats,
        openRate: totalDelivered > 0 ? (stats.openCount / totalDelivered) * 100 : 0,
        clickRate: totalDelivered > 0 ? (stats.clickCount / totalDelivered) * 100 : 0,
        bounceRate: totalDelivered > 0 ? (stats.bounceCount / totalDelivered) * 100 : 0,
        complaintRate: totalDelivered > 0 ? (stats.complaintCount / totalDelivered) * 100 : 0,
      };
    }),

  /**
   * Get engagement events for an email
   */
  getEmailEvents: protectedProcedure
    .input(z.object({
      emailHistoryId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      return db
        .select()
        .from(emailEventTracking)
        .where(eq(emailEventTracking.emailHistoryId, input.emailHistoryId))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Get recipient list with engagement metrics
   */
  getRecipientsList: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      sortBy: z.enum(["engagement", "opens", "clicks", "recent"]).default("engagement"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection unavailable");

      // Get unique recipients with their event counts
      const events = await db.select().from(emailEventTracking);

      // Group events by recipient
      const recipientMap = new Map<string, any>();
      for (const event of events) {
        if (!recipientMap.has(event.recipientEmail)) {
          recipientMap.set(event.recipientEmail, {
            recipientEmail: event.recipientEmail,
            openCount: 0,
            clickCount: 0,
            bounceCount: 0,
            complaintCount: 0,
            totalEvents: 0,
            lastEventAt: event.eventTimestamp,
          });
        }

        const recipient = recipientMap.get(event.recipientEmail)!;
        recipient.totalEvents++;
        if (event.eventType === "open") recipient.openCount++;
        if (event.eventType === "click") recipient.clickCount++;
        if (event.eventType === "bounce") recipient.bounceCount++;
        if (event.eventType === "complaint") recipient.complaintCount++;
        if (event.eventTimestamp > recipient.lastEventAt) {
          recipient.lastEventAt = event.eventTimestamp;
        }
      }

      let recipients = Array.from(recipientMap.values());

      // Sort by requested field
      if (input.sortBy === "engagement") {
        recipients.sort((a, b) => {
          const aEngagement = (a.openCount + a.clickCount) / a.totalEvents;
          const bEngagement = (b.openCount + b.clickCount) / b.totalEvents;
          return bEngagement - aEngagement;
        });
      } else if (input.sortBy === "opens") {
        recipients.sort((a, b) => b.openCount - a.openCount);
      } else if (input.sortBy === "clicks") {
        recipients.sort((a, b) => b.clickCount - a.clickCount);
      } else if (input.sortBy === "recent") {
        recipients.sort((a, b) => b.lastEventAt.getTime() - a.lastEventAt.getTime());
      }

      // Calculate engagement rate
      recipients = recipients.map((r) => ({
        ...r,
        engagementRate: (r.openCount + r.clickCount) / r.totalEvents * 100,
      }));

      return {
        total: recipients.length,
        recipients: recipients.slice(input.offset, input.offset + input.limit),
      };
    }),

  /**
   * Get engagement metrics summary
   */
  getSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    const metrics = await db.select().from(emailEngagementMetrics);
    const events = await db.select().from(emailEventTracking);

    if (metrics.length === 0) {
      return {
        totalEmails: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageEngagementScore: 0,
        totalOpens: 0,
        totalClicks: 0,
        totalBounces: 0,
        totalComplaints: 0,
      };
    }

    const totalOpenRate = metrics.reduce((sum, m) => sum + (Number(m.openRate) || 0), 0);
    const totalClickRate = metrics.reduce((sum, m) => sum + (Number(m.clickRate) || 0), 0);
    const totalEngagementScore = metrics.reduce((sum, m) => sum + (Number(m.engagementScore) || 0), 0);

    return {
      totalEmails: metrics.length,
      averageOpenRate: totalOpenRate / metrics.length,
      averageClickRate: totalClickRate / metrics.length,
      averageEngagementScore: totalEngagementScore / metrics.length,
      totalOpens: events.filter((e) => e.eventType === "open").length,
      totalClicks: events.filter((e) => e.eventType === "click").length,
      totalBounces: events.filter((e) => e.eventType === "bounce").length,
      totalComplaints: events.filter((e) => e.eventType === "complaint").length,
    };
  }),
});

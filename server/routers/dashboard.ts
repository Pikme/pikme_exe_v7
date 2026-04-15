import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { getAuditLogs, getAuditLogCount, exportAuditLogsToCSV } from "../audit-log";

// Admin procedure for dashboard access
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const dashboardRouter = router({
  // Get all dashboard metrics
  getMetrics: adminProcedure.query(async () => {
    try {
      // Get counts for all entities
      const tourCount = await db.getTourCount();
      const locationCount = await db.getLocationCount();
      const stateCount = await db.listStatesByCountry(1, 1000, 0).then(s => s.length).catch(() => 0);
      const countryCount = await db.listCountries(1000, 0).then(c => c.length);
      const categoryCount = await db.listCategories(1000, 0).then(c => c.length).catch(() => 0);

      return {
        tours: tourCount,
        locations: locationCount,
        states: stateCount,
        countries: countryCount,
        categories: categoryCount,
        cities: 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch metrics",
      });
    }
  }),

  // Get recent activity feed
  getRecentActivity: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        // Fetch recent tours
        const recentTours = await db.listTours(5, 0);

        // Fetch recent locations - get from all countries for now
        const recentLocations = await db.listLocationsByCountry(1, 5, 0).catch(() => []);

        // Fetch recent categories
        const recentCategories = await db.listCategories(5, 0).catch(() => []);

        // Combine and sort by date
        const activities = [
          ...recentTours.map((tour: any) => ({
            id: `tour-${tour.id}`,
            type: "tour",
            name: tour.name,
            action: "created",
            timestamp: tour.createdAt || new Date(),
          })),
          ...recentLocations.map((location: any) => ({
            id: `location-${location.id}`,
            type: "location",
            name: location.name,
            action: "created",
            timestamp: location.createdAt || new Date(),
          })),
          ...recentCategories.map((category: any) => ({
            id: `category-${category.id}`,
            type: "category",
            name: category.name,
            action: "created",
            timestamp: category.createdAt || new Date(),
          })),
        ]
          .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
          .slice(input.offset, input.offset + input.limit);

        return activities;
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity feed",
        });
      }
    }),

  // Get metrics summary
  getSummary: adminProcedure.query(async () => {
    try {
      const tourCount = await db.getTourCount();
      const locationCount = await db.getLocationCount();
      const stateCount = await db.listStatesByCountry(1, 1000, 0).then(s => s.length).catch(() => 0);
      const countryCount = await db.listCountries(1000, 0).then(c => c.length);
      const categoryCount = await db.listCategories(1000, 0).then(c => c.length).catch(() => 0);

      return {
        totalItems: tourCount + locationCount + stateCount + countryCount + categoryCount,
        totalTours: tourCount,
        totalLocations: locationCount,
        totalStates: stateCount,
        totalCountries: countryCount,
        totalCategories: categoryCount,
        totalCities: 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch summary",
      });
    }
  }),

  // Get audit logs
  getAuditLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getAuditLogs({
          limit: input.limit,
          offset: input.offset,
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return logs;
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit logs",
        });
      }
    }),

  // Get audit log count
  getAuditLogCount: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const count = await getAuditLogCount({
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return count;
      } catch (error) {
        console.error("Error fetching audit log count:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit log count",
        });
      }
    }),

  // Export audit logs to CSV
  exportAuditLogs: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const csv = await exportAuditLogsToCSV({
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return csv;
      } catch (error) {
        console.error("Error exporting audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export audit logs",
        });
      }
    }),

  // Get audit logs by user (for quick filter in modal)
  getAuditLogsByUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getAuditLogs({
          limit: input.limit,
          offset: 0,
          userId: input.userId,
        });
        return logs;
      } catch (error) {
        console.error("Error fetching user audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user audit logs",
        });
      }
    }),

  // Get audit logs by entity
  getAuditLogsByEntity: adminProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.number(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getAuditLogs({
          limit: input.limit,
          offset: 0,
          entityType: input.entityType,
        });
        return logs.filter((log: any) => log.entityId === input.entityId);
      } catch (error) {
        console.error("Error fetching entity audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch entity audit logs",
        });
      }
    }),

  // Get audit analytics data
  getAuditAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getAuditLogs({
          limit: 10000,
          offset: 0,
          startDate: input.startDate,
          endDate: input.endDate,
        });

        const eventsPerDay: Record<string, any> = {};
        logs.forEach((log: any) => {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          if (!eventsPerDay[date]) {
            eventsPerDay[date] = {
              date,
              count: 0,
              create: 0,
              update: 0,
              delete: 0,
              export: 0,
              import: 0,
              login: 0,
              logout: 0,
            };
          }
          eventsPerDay[date].count++;
          eventsPerDay[date][log.action] = (eventsPerDay[date][log.action] || 0) + 1;
        });

        const userMap: Record<string, any> = {};
        logs.forEach((log: any) => {
          const key = log.userId;
          if (!userMap[key]) {
            userMap[key] = {
              userId: log.userId,
              userName: log.userName,
              count: 0,
            };
          }
          userMap[key].count++;
        });

        const topUsers = Object.values(userMap)
          .sort((a: any, b: any) => b.count - a.count)
          .map((user: any) => ({
            ...user,
            percentage: (user.count / logs.length) * 100,
          }));

        const entityMap: Record<string, any> = {};
        logs.forEach((log: any) => {
          const key = `${log.entityType}:${log.entityId}`;
          if (!entityMap[key]) {
            entityMap[key] = {
              entityType: log.entityType,
              entityId: log.entityId,
              entityName: `${log.entityType}-${log.entityId}`,
              count: 0,
              lastModified: log.timestamp,
            };
          }
          entityMap[key].count++;
          entityMap[key].lastModified = new Date(
            Math.max(
              new Date(entityMap[key].lastModified).getTime(),
              new Date(log.timestamp).getTime()
            )
          );
        });

        const mostModifiedEntities = Object.values(entityMap)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 20);

        return {
          eventsPerDay: Object.values(eventsPerDay).sort((a: any, b: any) =>
            a.date.localeCompare(b.date)
          ),
          topUsers: topUsers.slice(0, 10),
          mostModifiedEntities,
          totalEvents: logs.length,
          dateRange: {
            start: input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: input.endDate || new Date().toISOString().split('T')[0],
          },
        };
      } catch (error) {
        console.error("Error fetching audit analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit analytics",
        });
      }
    }),
});

export type DashboardRouter = typeof dashboardRouter;

import { getDb } from "@/server/db";
import { sql } from "drizzle-orm";

export interface EngagementEvent {
  tagId: number;
  locationId: number;
  eventType: "view" | "click" | "conversion" | "share";
  userId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class AnalyticsTrackingService {
  /**
   * Track an engagement event
   */
  static async trackEvent(event: EngagementEvent): Promise<number> {
    const db = getDb();

    const result = await db.execute(
      sql`
        INSERT INTO tagEngagementEvents (
          tagId, locationId, eventType, userId, sessionId, 
          referrer, userAgent, ipAddress, metadata
        ) VALUES (
          ${event.tagId}, ${event.locationId}, ${event.eventType},
          ${event.userId || null}, ${event.sessionId || null},
          ${event.referrer || null}, ${event.userAgent || null},
          ${event.ipAddress || null}, ${event.metadata ? JSON.stringify(event.metadata) : null}
        )
      `
    );

    return result.insertId;
  }

  /**
   * Track multiple events in batch
   */
  static async trackEventsBatch(events: EngagementEvent[]): Promise<number[]> {
    const ids: number[] = [];
    for (const event of events) {
      const id = await this.trackEvent(event);
      ids.push(id);
    }
    return ids;
  }

  /**
   * Get tag engagement metrics for a date range
   */
  static async getTagMetrics(
    tagId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const db = getDb();

    const result = await db.execute(
      sql`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as totalEvents,
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) as totalViews,
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as totalClicks,
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) as totalConversions,
          SUM(CASE WHEN eventType = 'share' THEN 1 ELSE 0 END) as totalShares,
          COUNT(DISTINCT userId) as uniqueUsers,
          COUNT(DISTINCT sessionId) as uniqueSessions,
          ROUND(
            (SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) / 
             SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) * 100), 2
          ) as clickThroughRate,
          ROUND(
            (SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) / 
             SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) * 100), 2
          ) as conversionRate
        FROM tagEngagementEvents
        WHERE tagId = ${tagId}
          AND DATE(createdAt) BETWEEN ${startDate.toISOString().split('T')[0]} 
          AND ${endDate.toISOString().split('T')[0]}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `
    );

    return result.rows;
  }

  /**
   * Get location engagement metrics
   */
  static async getLocationMetrics(
    locationId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const db = getDb();

    const result = await db.execute(
      sql`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as totalEvents,
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) as totalViews,
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as totalClicks,
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) as totalConversions,
          COUNT(DISTINCT userId) as uniqueUsers,
          COUNT(DISTINCT sessionId) as uniqueSessions
        FROM tagEngagementEvents
        WHERE locationId = ${locationId}
          AND DATE(createdAt) BETWEEN ${startDate.toISOString().split('T')[0]} 
          AND ${endDate.toISOString().split('T')[0]}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `
    );

    return result.rows;
  }

  /**
   * Get top performing tags
   */
  static async getTopTags(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const db = getDb();

    const dateFilter = startDate && endDate
      ? `AND DATE(createdAt) BETWEEN '${startDate.toISOString().split('T')[0]}' AND '${endDate.toISOString().split('T')[0]}'`
      : '';

    const result = await db.execute(
      sql`
        SELECT 
          t.id,
          t.name,
          COUNT(*) as totalEvents,
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) as totalViews,
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as totalClicks,
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) as totalConversions,
          COUNT(DISTINCT userId) as uniqueUsers,
          ROUND(
            (SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) / 
             SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) * 100), 2
          ) as clickThroughRate,
          ROUND(
            (SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) / 
             SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) * 100), 2
          ) as conversionRate
        FROM tagEngagementEvents e
        JOIN tags t ON e.tagId = t.id
        WHERE 1=1 ${sql.raw(dateFilter)}
        GROUP BY t.id, t.name
        ORDER BY totalEvents DESC
        LIMIT ${limit}
      `
    );

    return result.rows;
  }

  /**
   * Create or update daily metrics
   */
  static async aggregateDailyMetrics(date: Date): Promise<void> {
    const db = getDb();
    const dateStr = date.toISOString().split('T')[0];

    // Aggregate tag metrics
    await db.execute(
      sql`
        INSERT INTO tagEngagementMetrics (
          tagId, date, totalViews, totalClicks, totalConversions, totalShares,
          uniqueUsers, uniqueSessions, clickThroughRate, conversionRate
        )
        SELECT 
          tagId,
          ${dateStr},
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END),
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END),
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END),
          SUM(CASE WHEN eventType = 'share' THEN 1 ELSE 0 END),
          COUNT(DISTINCT userId),
          COUNT(DISTINCT sessionId),
          ROUND(
            (SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ),
          ROUND(
            (SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          )
        FROM tagEngagementEvents
        WHERE DATE(createdAt) = ${dateStr}
        GROUP BY tagId
        ON DUPLICATE KEY UPDATE
          totalViews = VALUES(totalViews),
          totalClicks = VALUES(totalClicks),
          totalConversions = VALUES(totalConversions),
          totalShares = VALUES(totalShares),
          uniqueUsers = VALUES(uniqueUsers),
          uniqueSessions = VALUES(uniqueSessions),
          clickThroughRate = VALUES(clickThroughRate),
          conversionRate = VALUES(conversionRate)
      `
    );

    // Aggregate location metrics
    await db.execute(
      sql`
        INSERT INTO locationEngagementMetrics (
          locationId, date, totalViews, totalClicks, totalConversions, uniqueUsers
        )
        SELECT 
          locationId,
          ${dateStr},
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END),
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END),
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END),
          COUNT(DISTINCT userId)
        FROM tagEngagementEvents
        WHERE DATE(createdAt) = ${dateStr}
        GROUP BY locationId
        ON DUPLICATE KEY UPDATE
          totalViews = VALUES(totalViews),
          totalClicks = VALUES(totalClicks),
          totalConversions = VALUES(totalConversions),
          uniqueUsers = VALUES(uniqueUsers)
      `
    );
  }

  /**
   * Get event summary for a date range
   */
  static async getEventSummary(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const db = getDb();

    const result = await db.execute(
      sql`
        SELECT 
          COUNT(*) as totalEvents,
          SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END) as totalViews,
          SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as totalClicks,
          SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) as totalConversions,
          SUM(CASE WHEN eventType = 'share' THEN 1 ELSE 0 END) as totalShares,
          COUNT(DISTINCT userId) as uniqueUsers,
          COUNT(DISTINCT sessionId) as uniqueSessions,
          COUNT(DISTINCT tagId) as uniqueTags,
          COUNT(DISTINCT locationId) as uniqueLocations,
          ROUND(
            (SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ) as overallClickThroughRate,
          ROUND(
            (SUM(CASE WHEN eventType = 'conversion' THEN 1 ELSE 0 END) / 
             NULLIF(SUM(CASE WHEN eventType = 'view' THEN 1 ELSE 0 END), 0) * 100), 2
          ) as overallConversionRate
        FROM tagEngagementEvents
        WHERE DATE(createdAt) BETWEEN ${startDate.toISOString().split('T')[0]} 
          AND ${endDate.toISOString().split('T')[0]}
      `
    );

    return result.rows[0];
  }
}

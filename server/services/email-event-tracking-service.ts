import { getDb } from "../db";
import { emailEventTracking, emailEngagementMetrics, emailDeliveryTracking, emailHistory } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Email Event Tracking Service
 * Handles tracking of email engagement events (opens, clicks, bounces, complaints)
 */
export class EmailEventTrackingService {
  /**
   * Record an email event (open, click, bounce, complaint, etc.)
   */
  async recordEmailEvent(data: {
    emailHistoryId: number;
    eventType: "open" | "click" | "bounce" | "complaint" | "delivery" | "deferred" | "dropped" | "processed" | "sent";
    recipientEmail: string;
    userAgent?: string;
    ipAddress?: string;
    linkUrl?: string;
    linkText?: string;
    bounceType?: "permanent" | "temporary" | "undetermined";
    bounceSubType?: string;
    complaintType?: string;
    complaintFeedbackType?: string;
    rawEventData?: any;
    eventTimestamp: Date;
  }): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    // Find email delivery tracking record
    const deliveryRecords = await db
      .select()
      .from(emailDeliveryTracking)
      .where(eq(emailDeliveryTracking.emailHistoryId, data.emailHistoryId));
    
    const deliveryRecord = deliveryRecords[0];

    // Insert event
    const result = await db.insert(emailEventTracking).values({
      emailHistoryId: data.emailHistoryId,
      emailDeliveryTrackingId: deliveryRecord?.id,
      eventType: data.eventType,
      recipientEmail: data.recipientEmail,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      linkUrl: data.linkUrl,
      linkText: data.linkText,
      bounceType: data.bounceType,
      bounceSubType: data.bounceSubType,
      complaintType: data.complaintType,
      complaintFeedbackType: data.complaintFeedbackType,
      rawEventData: data.rawEventData,
      eventTimestamp: data.eventTimestamp,
    });

    // Update engagement metrics
    await this.updateEngagementMetrics(data.emailHistoryId, data.eventType, data.linkUrl);

    return result.insertId;
  }

  /**
   * Update engagement metrics for an email
   */
  private async updateEngagementMetrics(
    emailHistoryId: number,
    eventType: string,
    linkUrl?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    // Get or create metrics record
    const metricsRecords = await db
      .select()
      .from(emailEngagementMetrics)
      .where(eq(emailEngagementMetrics.emailHistoryId, emailHistoryId));

    let metrics = metricsRecords[0];

    if (!metrics) {
      // Create new metrics record
      await db.insert(emailEngagementMetrics).values({
        emailHistoryId: emailHistoryId,
        openCount: eventType === "open" ? 1 : 0,
        clickCount: eventType === "click" ? 1 : 0,
        uniqueOpenCount: eventType === "open" ? 1 : 0,
        uniqueClickCount: eventType === "click" ? 1 : 0,
        bounceCount: eventType === "bounce" ? 1 : 0,
        complaintCount: eventType === "complaint" ? 1 : 0,
        firstOpenedAt: eventType === "open" ? new Date() : undefined,
        firstClickedAt: eventType === "click" ? new Date() : undefined,
        engagementScore: this.calculateEngagementScore(eventType),
      });
    } else {
      // Update existing metrics
      const updates: any = {
        lastUpdatedAt: new Date(),
      };

      if (eventType === "open") {
        updates.openCount = (metrics.openCount || 0) + 1;
        updates.lastOpenedAt = new Date();
        if (!metrics.firstOpenedAt) {
          updates.firstOpenedAt = new Date();
          updates.uniqueOpenCount = 1;
        } else {
          updates.uniqueOpenCount = (metrics.uniqueOpenCount || 0) + 1;
        }
      } else if (eventType === "click") {
        updates.clickCount = (metrics.clickCount || 0) + 1;
        updates.lastClickedAt = new Date();
        if (!metrics.firstClickedAt) {
          updates.firstClickedAt = new Date();
          updates.uniqueClickCount = 1;
        } else {
          updates.uniqueClickCount = (metrics.uniqueClickCount || 0) + 1;
        }

        // Add to links clicked
        if (linkUrl) {
          const linksClicked = (metrics.linksClicked as any) || [];
          const existingLink = linksClicked.find((l: any) => l.url === linkUrl);
          if (existingLink) {
            existingLink.count += 1;
            existingLink.timestamp = new Date().toISOString();
          } else {
            linksClicked.push({
              url: linkUrl,
              count: 1,
              timestamp: new Date().toISOString(),
            });
          }
          updates.linksClicked = linksClicked;
        }
      } else if (eventType === "bounce") {
        updates.bounceCount = (metrics.bounceCount || 0) + 1;
      } else if (eventType === "complaint") {
        updates.complaintCount = (metrics.complaintCount || 0) + 1;
      }

      // Recalculate engagement score
      updates.engagementScore = this.calculateEngagementScore(eventType, metrics);

      // Calculate rates
      const totalEmailsSent = 1; // Assuming 1 email per record
      updates.openRate = (updates.openCount || metrics.openCount || 0) / totalEmailsSent * 100;
      updates.clickRate = (updates.clickCount || metrics.clickCount || 0) / totalEmailsSent * 100;
      updates.clickThroughRate = updates.openRate > 0 
        ? (updates.clickCount || metrics.clickCount || 0) / (updates.openCount || metrics.openCount || 1) * 100
        : 0;

      await db
        .update(emailEngagementMetrics)
        .set(updates)
        .where(eq(emailEngagementMetrics.emailHistoryId, emailHistoryId));
    }

    // Update email delivery tracking
    const deliveryRecords = await db
      .select()
      .from(emailDeliveryTracking)
      .where(eq(emailDeliveryTracking.emailHistoryId, emailHistoryId));

    if (deliveryRecords[0]) {
      const delivery = deliveryRecords[0];
      const updates: any = {};

      if (eventType === "open") {
        updates.opens = (delivery.opens || 0) + 1;
        updates.lastOpenedAt = new Date();
        if (!delivery.firstOpenedAt) {
          updates.firstOpenedAt = new Date();
        }
      } else if (eventType === "click") {
        updates.clicks = (delivery.clicks || 0) + 1;
        updates.lastClickedAt = new Date();
        if (!delivery.firstClickedAt) {
          updates.firstClickedAt = new Date();
        }
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(emailDeliveryTracking)
          .set(updates)
          .where(eq(emailDeliveryTracking.id, delivery.id));
      }
    }
  }

  /**
   * Calculate engagement score based on event type
   */
  private calculateEngagementScore(eventType: string, currentMetrics?: any): number {
    let score = 0;

    // Base scores for different events
    const eventScores: Record<string, number> = {
      open: 25,
      click: 50,
      bounce: -50,
      complaint: -100,
      delivery: 10,
      deferred: 5,
      dropped: -75,
      processed: 5,
      sent: 0,
    };

    score += eventScores[eventType] || 0;

    // Bonus for multiple opens
    if (eventType === "open" && currentMetrics?.openCount) {
      score += Math.min(currentMetrics.openCount * 5, 25);
    }

    // Bonus for multiple clicks
    if (eventType === "click" && currentMetrics?.clickCount) {
      score += Math.min(currentMetrics.clickCount * 10, 50);
    }

    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, (currentMetrics?.engagementScore || 0) + score));
  }

  /**
   * Get engagement metrics for an email
   */
  async getEngagementMetrics(emailHistoryId: number): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    const records = await db
      .select()
      .from(emailEngagementMetrics)
      .where(eq(emailEngagementMetrics.emailHistoryId, emailHistoryId));

    return records[0] || null;
  }

  /**
   * Get all events for an email
   */
  async getEmailEvents(emailHistoryId: number, limit = 100, offset = 0): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    return db
      .select()
      .from(emailEventTracking)
      .where(eq(emailEventTracking.emailHistoryId, emailHistoryId))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
    offset = 0
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    const conditions = [eq(emailEventTracking.eventType, eventType as any)];

    if (startDate && endDate) {
      conditions.push(gte(emailEventTracking.eventTimestamp, startDate));
      conditions.push(lte(emailEventTracking.eventTimestamp, endDate));
    }

    return db
      .select()
      .from(emailEventTracking)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    const conditions: any[] = [];

    if (startDate && endDate) {
      conditions.push(gte(emailEventTracking.eventTimestamp, startDate));
      conditions.push(lte(emailEventTracking.eventTimestamp, endDate));
    }

    let events: any[] = [];
    if (conditions.length > 0) {
      events = await db
        .select()
        .from(emailEventTracking)
        .where(and(...conditions));
    } else {
      events = await db
        .select()
        .from(emailEventTracking);
    }

    const stats = {
      totalEvents: events.length,
      openCount: events.filter((e: any) => e.eventType === "open").length,
      clickCount: events.filter((e: any) => e.eventType === "click").length,
      bounceCount: events.filter((e: any) => e.eventType === "bounce").length,
      complaintCount: events.filter((e: any) => e.eventType === "complaint").length,
      averageEngagementScore: 0,
    };

    // Calculate average engagement score
    const metrics = await db.select().from(emailEngagementMetrics);
    if (metrics.length > 0) {
      const totalScore = metrics.reduce((sum: number, m: any) => sum + (m.engagementScore || 0), 0);
      stats.averageEngagementScore = totalScore / metrics.length;
    }

    return stats;
  }

  /**
   * Get top performing emails
   */
  async getTopPerformingEmails(limit = 10): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    return db
      .select()
      .from(emailEngagementMetrics)
      .limit(limit);
  }

  /**
   * Get recipient engagement profile
   */
  async getRecipientEngagementProfile(recipientEmail: string): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database connection unavailable");

    const events = await db
      .select()
      .from(emailEventTracking)
      .where(eq(emailEventTracking.recipientEmail, recipientEmail));

    const openCount = events.filter((e) => e.eventType === "open").length;
    const clickCount = events.filter((e) => e.eventType === "click").length;
    const bounceCount = events.filter((e) => e.eventType === "bounce").length;
    const complaintCount = events.filter((e) => e.eventType === "complaint").length;

    return {
      recipientEmail,
      totalEvents: events.length,
      openCount,
      clickCount,
      bounceCount,
      complaintCount,
      engagementRate: events.length > 0 ? (openCount + clickCount) / events.length * 100 : 0,
      lastEventAt: events.length > 0 ? events[events.length - 1].eventTimestamp : null,
      firstEventAt: events.length > 0 ? events[0].eventTimestamp : null,
    };
  }
}

let emailEventTrackingService: EmailEventTrackingService | null = null;

export function getEmailEventTrackingService(): EmailEventTrackingService {
  if (!emailEventTrackingService) {
    emailEventTrackingService = new EmailEventTrackingService();
  }
  return emailEventTrackingService;
}

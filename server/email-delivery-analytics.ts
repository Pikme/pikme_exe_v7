import { db } from './db';
import { emailDeliveryLogs, emailDeliveryStats, emailBounceList } from '../drizzle/schema';
import { eq, and, gte, lte, desc, count, sql } from 'drizzle-orm';

export interface DeliveryMetrics {
  totalSent: number;
  totalFailed: number;
  totalBounced: number;
  totalComplaints: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  openRate: number;
  clickRate: number;
}

export interface DeliveryTrend {
  date: string;
  sent: number;
  failed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
}

export class EmailDeliveryAnalytics {
  /**
   * Log email delivery attempt
   */
  static async logDelivery(data: {
    alertId: number;
    recipientEmail: string;
    messageId?: string;
    subject: string;
    status: 'pending' | 'sent' | 'failed' | 'bounced' | 'complained';
    statusCode?: number;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await db.insert(emailDeliveryLogs).values({
        alertId: data.alertId,
        recipientEmail: data.recipientEmail,
        messageId: data.messageId || null,
        subject: data.subject,
        status: data.status,
        statusCode: data.statusCode,
        errorMessage: data.errorMessage,
        retryCount: 0,
        maxRetries: 3,
      });
    } catch (error) {
      console.error('[EmailAnalytics] Failed to log delivery:', error);
    }
  }

  /**
   * Update delivery status (sent, failed, bounced, etc.)
   */
  static async updateDeliveryStatus(
    logId: number,
    status: 'sent' | 'failed' | 'bounced' | 'complained',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updates: any = { status };

      if (status === 'sent') {
        updates.sentAt = new Date();
      } else if (status === 'bounced') {
        updates.bouncedAt = new Date();
      } else if (status === 'failed') {
        updates.retryCount = sql`${emailDeliveryLogs.retryCount} + 1`;
      }

      if (errorMessage) {
        updates.errorMessage = errorMessage;
      }

      await db.update(emailDeliveryLogs).set(updates).where(eq(emailDeliveryLogs.id, logId));
    } catch (error) {
      console.error('[EmailAnalytics] Failed to update delivery status:', error);
    }
  }

  /**
   * Record bounce event
   */
  static async recordBounce(
    email: string,
    bounceType: 'permanent' | 'temporary' | 'complaint',
    bounceSubType?: string,
    bounceReason?: string
  ): Promise<void> {
    try {
      const existing = await db.query.emailBounceList.findFirst({
        where: eq(emailBounceList.email, email),
      });

      if (existing) {
        await db.update(emailBounceList)
          .set({
            bounceCount: existing.bounceCount + 1,
            lastBounceAt: new Date(),
            bounceType,
            bounceSubType,
            bounceReason,
            suppressed: bounceType === 'permanent',
          })
          .where(eq(emailBounceList.email, email));
      } else {
        await db.insert(emailBounceList).values({
          email,
          bounceType,
          bounceSubType,
          bounceReason,
          bounceCount: 1,
          lastBounceAt: new Date(),
          suppressed: bounceType === 'permanent',
        });
      }
    } catch (error) {
      console.error('[EmailAnalytics] Failed to record bounce:', error);
    }
  }

  /**
   * Get delivery metrics for date range
   */
  static async getMetrics(startDate?: Date, endDate?: Date): Promise<DeliveryMetrics> {
    try {
      const conditions = [];
      if (startDate) conditions.push(gte(emailDeliveryLogs.createdAt, startDate));
      if (endDate) conditions.push(lte(emailDeliveryLogs.createdAt, endDate));

      const logs = await db.query.emailDeliveryLogs.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      const totalSent = logs.filter((l) => l.status === 'sent').length;
      const totalFailed = logs.filter((l) => l.status === 'failed').length;
      const totalBounced = logs.filter((l) => l.status === 'bounced').length;
      const totalComplaints = logs.filter((l) => l.status === 'complained').length;
      const totalOpened = logs.filter((l) => l.openedAt).length;
      const totalClicked = logs.filter((l) => l.clickedAt).length;
      const total = logs.length;

      return {
        totalSent,
        totalFailed,
        totalBounced,
        totalComplaints,
        totalOpened,
        totalClicked,
        deliveryRate: total > 0 ? (totalSent / total) * 100 : 0,
        bounceRate: total > 0 ? (totalBounced / total) * 100 : 0,
        complaintRate: total > 0 ? (totalComplaints / total) * 100 : 0,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      };
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get metrics:', error);
      return {
        totalSent: 0,
        totalFailed: 0,
        totalBounced: 0,
        totalComplaints: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        bounceRate: 0,
        complaintRate: 0,
        openRate: 0,
        clickRate: 0,
      };
    }
  }

  /**
   * Get delivery trend over time
   */
  static async getDeliveryTrend(days: number = 7): Promise<DeliveryTrend[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await db.query.emailDeliveryLogs.findMany({
        where: gte(emailDeliveryLogs.createdAt, startDate),
      });

      const trendMap: Record<string, any> = {};

      for (const log of logs) {
        const date = new Date(log.createdAt).toISOString().split('T')[0];

        if (!trendMap[date]) {
          trendMap[date] = {
            date,
            sent: 0,
            failed: 0,
            bounced: 0,
            opened: 0,
            clicked: 0,
          };
        }

        if (log.status === 'sent') trendMap[date].sent++;
        if (log.status === 'failed') trendMap[date].failed++;
        if (log.status === 'bounced') trendMap[date].bounced++;
        if (log.openedAt) trendMap[date].opened++;
        if (log.clickedAt) trendMap[date].clicked++;
      }

      return Object.values(trendMap).map((trend) => ({
        ...trend,
        openRate: trend.sent > 0 ? (trend.opened / trend.sent) * 100 : 0,
        clickRate: trend.sent > 0 ? (trend.clicked / trend.sent) * 100 : 0,
      }));
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get delivery trend:', error);
      return [];
    }
  }

  /**
   * Get failed deliveries for retry
   */
  static async getFailedDeliveries(limit: number = 50): Promise<any[]> {
    try {
      return await db.query.emailDeliveryLogs.findMany({
        where: and(
          eq(emailDeliveryLogs.status, 'failed'),
          lte(emailDeliveryLogs.retryCount, emailDeliveryLogs.maxRetries)
        ),
        limit,
        orderBy: desc(emailDeliveryLogs.createdAt),
      });
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get failed deliveries:', error);
      return [];
    }
  }

  /**
   * Get bounce list
   */
  static async getBounceList(limit: number = 100, offset: number = 0): Promise<{ bounces: any[]; total: number }> {
    try {
      const bounces = await db.query.emailBounceList.findMany({
        where: eq(emailBounceList.suppressed, true),
        limit,
        offset,
        orderBy: desc(emailBounceList.lastBounceAt),
      });

      return { bounces, total: bounces.length };
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get bounce list:', error);
      return { bounces: [], total: 0 };
    }
  }

  /**
   * Get delivery statistics by recipient domain
   */
  static async getStatsByDomain(): Promise<Record<string, any>> {
    try {
      const logs = await db.query.emailDeliveryLogs.findMany();

      const domainStats: Record<string, any> = {};

      for (const log of logs) {
        const domain = log.recipientEmail.split('@')[1] || 'unknown';

        if (!domainStats[domain]) {
          domainStats[domain] = {
            domain,
            sent: 0,
            failed: 0,
            bounced: 0,
            opened: 0,
            clicked: 0,
          };
        }

        if (log.status === 'sent') domainStats[domain].sent++;
        if (log.status === 'failed') domainStats[domain].failed++;
        if (log.status === 'bounced') domainStats[domain].bounced++;
        if (log.openedAt) domainStats[domain].opened++;
        if (log.clickedAt) domainStats[domain].clicked++;
      }

      return Object.values(domainStats).map((stats) => ({
        ...stats,
        deliveryRate: (stats.sent / (stats.sent + stats.failed + stats.bounced)) * 100 || 0,
        openRate: (stats.opened / stats.sent) * 100 || 0,
      }));
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get stats by domain:', error);
      return {};
    }
  }

  /**
   * Update daily statistics
   */
  static async updateDailyStats(date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const metrics = await this.getMetrics(startOfDay, endOfDay);

      const existing = await db.query.emailDeliveryStats.findFirst({
        where: eq(emailDeliveryStats.date, date),
      });

      if (existing) {
        await db.update(emailDeliveryStats)
          .set({
            totalSent: metrics.totalSent,
            totalFailed: metrics.totalFailed,
            totalBounced: metrics.totalBounced,
            totalComplaints: metrics.totalComplaints,
            totalOpened: metrics.totalOpened,
            totalClicked: metrics.totalClicked,
            deliveryRate: metrics.deliveryRate,
            bounceRate: metrics.bounceRate,
            complaintRate: metrics.complaintRate,
            openRate: metrics.openRate,
            clickRate: metrics.clickRate,
          })
          .where(eq(emailDeliveryStats.date, date));
      } else {
        await db.insert(emailDeliveryStats).values({
          date,
          totalSent: metrics.totalSent,
          totalFailed: metrics.totalFailed,
          totalBounced: metrics.totalBounced,
          totalComplaints: metrics.totalComplaints,
          totalOpened: metrics.totalOpened,
          totalClicked: metrics.totalClicked,
          deliveryRate: metrics.deliveryRate,
          bounceRate: metrics.bounceRate,
          complaintRate: metrics.complaintRate,
          openRate: metrics.openRate,
          clickRate: metrics.clickRate,
        });
      }
    } catch (error) {
      console.error('[EmailAnalytics] Failed to update daily stats:', error);
    }
  }

  /**
   * Get statistics for date range
   */
  static async getStatsRange(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      return await db.query.emailDeliveryStats.findMany({
        where: and(gte(emailDeliveryStats.date, startDate), lte(emailDeliveryStats.date, endDate)),
        orderBy: desc(emailDeliveryStats.date),
      });
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get stats range:', error);
      return [];
    }
  }

  /**
   * Remove email from bounce list (whitelist)
   */
  static async removeFromBounceList(email: string): Promise<boolean> {
    try {
      await db.update(emailBounceList)
        .set({ suppressed: false })
        .where(eq(emailBounceList.email, email));
      return true;
    } catch (error) {
      console.error('[EmailAnalytics] Failed to remove from bounce list:', error);
      return false;
    }
  }

  /**
   * Get delivery health score (0-100)
   */
  static async getHealthScore(): Promise<number> {
    try {
      const metrics = await this.getMetrics();

      // Calculate health score based on delivery rate and bounce rate
      const deliveryScore = metrics.deliveryRate * 0.7; // 70% weight
      const bounceScore = (100 - metrics.bounceRate) * 0.3; // 30% weight

      return Math.round(deliveryScore + bounceScore);
    } catch (error) {
      console.error('[EmailAnalytics] Failed to get health score:', error);
      return 0;
    }
  }
}

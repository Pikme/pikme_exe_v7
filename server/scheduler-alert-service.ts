import { getDb } from './db';
import { schedulerAlertConfig, schedulerAlertHistory } from '../drizzle/schema';
import { eq, and, gte, desc, isNull } from 'drizzle-orm';
import { notifyOwner } from './_core/notification';
import { AlertEmailService } from './alert-email-service';

/**
 * Scheduler Alert Service
 * Manages alert thresholds and triggers notifications for scheduler events
 */
export class SchedulerAlertService {
  /**
   * Initialize default alert configurations
   */
  static async initializeDefaultAlerts(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      const existing = await db.select().from(schedulerAlertConfig);
      if (existing.length > 0) return;

      // Create default alert configurations
      const defaults = [
        {
          alertType: 'check_failure' as const,
          enabled: true,
          threshold: 3, // Alert after 3 consecutive failures
          notifyAdmins: true,
          cooldownMinutes: 60,
        },
        {
          alertType: 'check_stall' as const,
          enabled: true,
          threshold: 24, // Alert if no check in 24 hours
          notifyAdmins: true,
          cooldownMinutes: 120,
        },
        {
          alertType: 'consecutive_errors' as const,
          enabled: true,
          threshold: 5, // Alert after 5 consecutive errors
          notifyAdmins: true,
          cooldownMinutes: 60,
        },
        {
          alertType: 'rotation_failure' as const,
          enabled: true,
          threshold: 1, // Alert on any rotation failure
          notifyAdmins: true,
          cooldownMinutes: 30,
        },
        {
          alertType: 'job_stall' as const,
          enabled: true,
          threshold: 12, // Alert if job stalled for 12 hours
          notifyAdmins: true,
          cooldownMinutes: 120,
        },
      ];

      for (const config of defaults) {
        await db.insert(schedulerAlertConfig).values(config);
      }
    } catch (error) {
      console.error('Error initializing default alerts:', error);
    }
  }

  /**
   * Check if alert should be triggered based on threshold
   */
  static async checkAlertThreshold(
    alertType: string,
    currentValue: number,
    details?: any
  ): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;

      const configs = await db.select().from(schedulerAlertConfig)
        .where(and(
          eq(schedulerAlertConfig.alertType, alertType as any),
          eq(schedulerAlertConfig.enabled, true)
        ));
      
      const config = configs[0];
      if (!config) return false;

      // Check if threshold is exceeded
      if (currentValue < config.threshold) return false;

      // Check cooldown period
      if (config.lastAlertTime) {
        const timeSinceLastAlert = Date.now() - new Date(config.lastAlertTime).getTime();
        const cooldownMs = config.cooldownMinutes * 60 * 1000;
        if (timeSinceLastAlert < cooldownMs) {
          return false; // Still in cooldown period
        }
      }

      // Trigger alert
      await this.triggerAlert(alertType, currentValue, details, config);
      return true;
    } catch (error) {
      console.error('Error checking alert threshold:', error);
      return false;
    }
  }

  /**
   * Trigger an alert and record it
   */
  static async triggerAlert(
    alertType: string,
    value: number,
    details: any,
    config: any
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // Determine severity based on alert type and value
      const severity = this.calculateSeverity(alertType, value);

      // Create alert message
      const message = this.createAlertMessage(alertType, value);

      // Record alert in history
      await db.insert(schedulerAlertHistory).values({
        alertType: alertType as any,
        severity: severity as any,
        message,
        details: JSON.stringify(details),
        notified: false,
      });

      // Update last alert time
      await db.update(schedulerAlertConfig)
        .set({ lastAlertTime: new Date() })
        .where(eq(schedulerAlertConfig.alertType, alertType as any));

      // Send notification if enabled
      if (config.notifyAdmins) {
        await this.sendAlertNotification(alertType, message, severity, details);
      }
    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  }

  /**
   * Send alert notification to admins
   */
  static async sendAlertNotification(
    alertType: string,
    message: string,
    severity: string,
    details: any
  ): Promise<void> {
    try {
      const title = `🚨 Scheduler Alert: ${this.formatAlertType(alertType)}`;
      const content = `
**Severity:** ${severity.toUpperCase()}

**Message:** ${message}

**Details:**
\`\`\`json
${JSON.stringify(details, null, 2)}
\`\`\`

**Time:** ${new Date().toISOString()}

Please check the Scheduler Logs page for more information.
      `.trim();

      await notifyOwner({ title, content });

      if (severity === 'critical' || severity === 'high') {
        await this.sendEmailNotification(alertType, message, severity, details);
      }
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  /**
   * Calculate alert severity based on type and value
   */
  static calculateSeverity(alertType: string, value: number): string {
    switch (alertType) {
      case 'check_failure':
        if (value >= 10) return 'critical';
        if (value >= 5) return 'high';
        if (value >= 3) return 'medium';
        return 'low';
      case 'check_stall':
        if (value >= 72) return 'critical'; // 3 days
        if (value >= 48) return 'high'; // 2 days
        if (value >= 24) return 'medium'; // 1 day
        return 'low';
      case 'consecutive_errors':
        if (value >= 10) return 'critical';
        if (value >= 7) return 'high';
        if (value >= 5) return 'medium';
        return 'low';
      case 'rotation_failure':
        return 'high';
      case 'job_stall':
        if (value >= 48) return 'critical'; // 2 days
        if (value >= 24) return 'high'; // 1 day
        if (value >= 12) return 'medium'; // 12 hours
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Create human-readable alert message
   */
  static createAlertMessage(alertType: string, value: number): string {
    switch (alertType) {
      case 'check_failure':
        return `Scheduler has experienced ${value} consecutive check failures`;
      case 'check_stall':
        return `No scheduler check has run for ${value} hours`;
      case 'consecutive_errors':
        return `Scheduler has encountered ${value} consecutive errors`;
      case 'rotation_failure':
        return `Key rotation check failed`;
      case 'job_stall':
        return `Re-encryption job has been stalled for ${value} hours`;
      default:
        return `Scheduler alert triggered: ${alertType}`;
    }
  }

  /**
   * Format alert type for display
   */
  static formatAlertType(alertType: string): string {
    return alertType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get alert configuration
   */
  static async getAlertConfig(alertType?: string): Promise<any[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      if (alertType) {
        const configs = await db.select().from(schedulerAlertConfig)
          .where(eq(schedulerAlertConfig.alertType, alertType as any));
        return configs;
      }

      return await db.select().from(schedulerAlertConfig);
    } catch (error) {
      console.error('Error getting alert config:', error);
      return [];
    }
  }

  /**
   * Update alert configuration
   */
  static async updateAlertConfig(
    alertType: string,
    updates: Partial<any>
  ): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;

      await db.update(schedulerAlertConfig)
        .set(updates)
        .where(eq(schedulerAlertConfig.alertType, alertType as any));
      return true;
    } catch (error) {
      console.error('Error updating alert config:', error);
      return false;
    }
  }

  /**
   * Get alert history
   */
  static async getAlertHistory(
    limit: number = 50,
    offset: number = 0,
    alertType?: string
  ): Promise<{
    alerts: any[];
    total: number;
  }> {
    try {
      const db = await getDb();
      if (!db) return { alerts: [], total: 0 };

      let query = db.select().from(schedulerAlertHistory)
        .orderBy(desc(schedulerAlertHistory.createdAt))
        .limit(limit)
        .offset(offset);

      if (alertType) {
        query = db.select().from(schedulerAlertHistory)
          .where(eq(schedulerAlertHistory.alertType, alertType as any))
          .orderBy(desc(schedulerAlertHistory.createdAt))
          .limit(limit)
          .offset(offset);
      }

      const alerts = await query;
      return { alerts, total: alerts.length };
    } catch (error) {
      console.error('Error getting alert history:', error);
      return { alerts: [], total: 0 };
    }
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(
    alertId: number,
    userId?: number
  ): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;

      await db.update(schedulerAlertHistory)
        .set({
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
        })
        .where(eq(schedulerAlertHistory.id, alertId));
      return true;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: number): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;

      await db.update(schedulerAlertHistory)
        .set({ resolvedAt: new Date() })
        .where(eq(schedulerAlertHistory.id, alertId));
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  /**
   * Get unresolved alerts
   */
  static async getUnresolvedAlerts(): Promise<any[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(schedulerAlertHistory)
        .where(isNull(schedulerAlertHistory.resolvedAt))
        .orderBy(desc(schedulerAlertHistory.createdAt));
    } catch (error) {
      console.error('Error getting unresolved alerts:', error);
      return [];
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(): Promise<{
    unresolvedAlerts: number;
    unacknowledgedAlerts: number;
  }> {
    try {
      const db = await getDb();
      if (!db) return { unresolvedAlerts: 0, unacknowledgedAlerts: 0 };

      const unresolved = await db.select().from(schedulerAlertHistory)
        .where(isNull(schedulerAlertHistory.resolvedAt));
      
      const unacknowledged = await db.select().from(schedulerAlertHistory)
        .where(and(
          eq(schedulerAlertHistory.acknowledged, false),
          isNull(schedulerAlertHistory.resolvedAt)
        ));

      return {
        unresolvedAlerts: unresolved.length,
        unacknowledgedAlerts: unacknowledged.length,
      };
    } catch (error) {
      console.error('Error getting alert stats:', error);
      return { unresolvedAlerts: 0, unacknowledgedAlerts: 0 };
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(
    alertType: string,
    message: string,
    severity: string,
    details: any
  ): Promise<void> {
    try {
      // Use AlertEmailService if available
      if (AlertEmailService && AlertEmailService.sendAlert) {
        await AlertEmailService.sendAlert({
          alertType,
          message,
          severity,
          details,
        });
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
}

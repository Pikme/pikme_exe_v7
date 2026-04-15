import { getDb } from './db';
import { webhookAuditLog, webhookEndpoints } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export type WebhookAuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'pause'
  | 'resume'
  | 'test';

export interface WebhookAuditLogEntry {
  webhookEndpointId: string;
  action: WebhookAuditAction;
  userId: number;
  userName?: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export class WebhookAuditService {
  /**
   * Log a webhook endpoint action to the audit trail
   */
  static async logAction(entry: WebhookAuditLogEntry): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn('Database connection not available for webhook audit logging');
        return;
      }

      await db.insert(webhookAuditLog).values({
        webhookEndpointId: entry.webhookEndpointId,
        action: entry.action,
        userId: entry.userId,
        userName: entry.userName,
        previousState: entry.previousState ? JSON.stringify(entry.previousState) : null,
        newState: entry.newState ? JSON.stringify(entry.newState) : null,
        reason: entry.reason,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details ? JSON.stringify(entry.details) : null,
        createdAt: new Date(),
      });

      console.log(`Webhook audit logged: ${entry.action} for endpoint ${entry.webhookEndpointId}`);
    } catch (error) {
      console.error('Error logging webhook audit action:', error);
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }

  /**
   * Log endpoint pause action
   */
  static async logPause(
    endpointId: string,
    userId: number,
    userName?: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // Get current endpoint state
      const endpoint = await db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, endpointId))
        .then(rows => rows[0]);

      if (!endpoint) {
        console.warn(`Endpoint ${endpointId} not found for audit logging`);
        return;
      }

      const previousState = {
        id: endpoint.id,
        url: endpoint.url,
        isActive: endpoint.isActive,
        isPaused: endpoint.isPaused,
        events: endpoint.events,
      };

      const newState = {
        ...previousState,
        isPaused: true,
      };

      await this.logAction({
        webhookEndpointId: endpointId,
        action: 'pause',
        userId,
        userName,
        previousState,
        newState,
        reason: reason || 'Endpoint paused by admin',
        ipAddress,
        userAgent,
        details: {
          changedField: 'isPaused',
          previousValue: false,
          newValue: true,
        },
      });
    } catch (error) {
      console.error('Error logging pause action:', error);
    }
  }

  /**
   * Log endpoint resume action
   */
  static async logResume(
    endpointId: string,
    userId: number,
    userName?: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // Get current endpoint state
      const endpoint = await db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, endpointId))
        .then(rows => rows[0]);

      if (!endpoint) {
        console.warn(`Endpoint ${endpointId} not found for audit logging`);
        return;
      }

      const previousState = {
        id: endpoint.id,
        url: endpoint.url,
        isActive: endpoint.isActive,
        isPaused: endpoint.isPaused,
        events: endpoint.events,
      };

      const newState = {
        ...previousState,
        isPaused: false,
      };

      await this.logAction({
        webhookEndpointId: endpointId,
        action: 'resume',
        userId,
        userName,
        previousState,
        newState,
        reason: reason || 'Endpoint resumed by admin',
        ipAddress,
        userAgent,
        details: {
          changedField: 'isPaused',
          previousValue: true,
          newValue: false,
        },
      });
    } catch (error) {
      console.error('Error logging resume action:', error);
    }
  }

  /**
   * Log endpoint creation
   */
  static async logCreate(
    endpointId: string,
    userId: number,
    userName?: string,
    endpoint?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'create',
      userId,
      userName,
      newState: endpoint,
      reason: 'Webhook endpoint created',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log endpoint update
   */
  static async logUpdate(
    endpointId: string,
    userId: number,
    userName?: string,
    previousState?: Record<string, any>,
    newState?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'update',
      userId,
      userName,
      previousState,
      newState,
      reason: 'Webhook endpoint updated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log endpoint deletion
   */
  static async logDelete(
    endpointId: string,
    userId: number,
    userName?: string,
    endpoint?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'delete',
      userId,
      userName,
      previousState: endpoint,
      reason: 'Webhook endpoint deleted',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log endpoint activation
   */
  static async logActivate(
    endpointId: string,
    userId: number,
    userName?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'activate',
      userId,
      userName,
      reason: 'Webhook endpoint activated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log endpoint deactivation
   */
  static async logDeactivate(
    endpointId: string,
    userId: number,
    userName?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'deactivate',
      userId,
      userName,
      reason: 'Webhook endpoint deactivated',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log endpoint test
   */
  static async logTest(
    endpointId: string,
    userId: number,
    userName?: string,
    testResult?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      webhookEndpointId: endpointId,
      action: 'test',
      userId,
      userName,
      reason: 'Webhook endpoint test executed',
      ipAddress,
      userAgent,
      details: testResult,
    });
  }

  /**
   * Get audit log for a specific endpoint
   */
  static async getEndpointAuditLog(
    endpointId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      const logs = await db
        .select()
        .from(webhookAuditLog)
        .where(eq(webhookAuditLog.webhookEndpointId, endpointId))
        .orderBy((t) => ({ createdAt: 'desc' }))
        .limit(limit)
        .offset(offset);

      return logs.map(log => ({
        ...log,
        previousState: log.previousState ? JSON.parse(log.previousState as any) : null,
        newState: log.newState ? JSON.parse(log.newState as any) : null,
        details: log.details ? JSON.parse(log.details as any) : null,
      }));
    } catch (error) {
      console.error('Error fetching endpoint audit log:', error);
      return [];
    }
  }

  /**
   * Get all audit logs with optional filtering
   */
  static async getAllAuditLogs(
    action?: WebhookAuditAction,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(webhookAuditLog);

      if (action) {
        query = query.where(eq(webhookAuditLog.action, action));
      }

      const logs = await query
        .orderBy((t) => ({ createdAt: 'desc' }))
        .limit(limit)
        .offset(offset);

      return logs.map(log => ({
        ...log,
        previousState: log.previousState ? JSON.parse(log.previousState as any) : null,
        newState: log.newState ? JSON.parse(log.newState as any) : null,
        details: log.details ? JSON.parse(log.details as any) : null,
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(): Promise<Record<string, number>> {
    try {
      const db = await getDb();
      if (!db) return {};

      const logs = await db.select().from(webhookAuditLog);

      const stats: Record<string, number> = {
        total: logs.length,
        create: 0,
        update: 0,
        delete: 0,
        activate: 0,
        deactivate: 0,
        pause: 0,
        resume: 0,
        test: 0,
      };

      logs.forEach(log => {
        if (log.action in stats) {
          stats[log.action]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      return {};
    }
  }
}

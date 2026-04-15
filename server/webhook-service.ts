import { getDb } from './db';
import { eq, and } from 'drizzle-orm';
import { webhookEndpoints, webhookLogs } from '../drizzle/schema';

export type CriticalAction = 
  | 'bulk_delete'
  | 'bulk_export'
  | 'permission_change'
  | 'user_role_change'
  | 'mass_update'
  | 'data_export'
  | 'system_config_change';

export interface WebhookPayload {
  action: CriticalAction;
  severity: 'high' | 'critical';
  timestamp: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  entityType: string;
  entityCount: number;
  details: Record<string, any>;
  affectedEntities: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  isActive: boolean;
  isPaused: boolean;
  events: CriticalAction[];
  headers?: Record<string, string>;
  retryCount: number;
  timeout: number;
}

export class WebhookService {
  /**
   * Send webhook notification to all registered endpoints
   */
  static async notifyWebhooks(payload: WebhookPayload): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn('Database connection not available for webhook notifications');
        return;
      }
      const endpoints = await db
        .select()
        .from(webhookEndpoints)
        .where(and(eq(webhookEndpoints.isActive, true), eq(webhookEndpoints.isPaused, false)));

      const matchingEndpoints = endpoints.filter(endpoint => {
        try {
          const events = JSON.parse(endpoint.events as any);
          return events.includes(payload.action);
        } catch {
          return false;
        }
      });

      if (matchingEndpoints.length === 0) {
        console.log(`No webhook endpoints configured for action: ${payload.action}`);
        return;
      }

      // Send webhooks in parallel
      const webhookPromises = matchingEndpoints.map(endpoint =>
        this.sendWebhookWithRetry(endpoint, payload)
      );

      await Promise.allSettled(webhookPromises);
    } catch (error) {
      console.error('Error notifying webhooks:', error);
    }
  }

  /**
   * Send webhook with retry logic
   */
  private static async sendWebhookWithRetry(
    endpoint: any,
    payload: WebhookPayload,
    attempt: number = 0
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': this.generateSignature(payload),
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...((endpoint.headers as any) || {}),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 30000);

      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }

        console.log(`Webhook sent successfully to ${endpoint.url}`);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error(`Webhook send failed (attempt ${attempt + 1}):`, error);

      // Retry logic
      if (attempt < (endpoint.retryCount || 3)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWebhookWithRetry(endpoint, payload, attempt + 1);
      }

      // Log failed webhook attempt
      await this.logFailedWebhook(endpoint.id, payload, error);
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private static generateSignature(payload: WebhookPayload): string {
    const crypto = require('crypto');
    const secret = process.env.WEBHOOK_SECRET || 'default-secret';
    const message = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Log failed webhook attempts
   */
  private static async logFailedWebhook(
    endpointId: string,
    payload: WebhookPayload,
    error: any
  ): Promise<void> {
    try {
      const db = getDb();
      // Log to database for monitoring
      console.error(`Failed webhook for endpoint ${endpointId}:`, {
        action: payload.action,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Error logging failed webhook:', logError);
    }
  }

  /**
   * Trigger webhook for bulk delete action
   */
  static async triggerBulkDeleteAlert(
    userId: string,
    userName: string,
    entityType: string,
    entityCount: number,
    affectedEntities: Array<{ id: string; name: string }>,
    ipAddress?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      action: 'bulk_delete',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ipAddress,
      entityType,
      entityCount,
      details: {
        operation: 'bulk_delete',
        deletedCount: entityCount,
        timestamp: new Date().toISOString(),
      },
      affectedEntities: affectedEntities.map(entity => ({
        id: entity.id,
        name: entity.name,
        type: entityType,
      })),
    };

    await this.notifyWebhooks(payload);
  }

  /**
   * Trigger webhook for permission change
   */
  static async triggerPermissionChangeAlert(
    userId: string,
    userName: string,
    targetUserId: string,
    targetUserName: string,
    oldPermissions: string[],
    newPermissions: string[],
    ipAddress?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      action: 'permission_change',
      severity: 'high',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ipAddress,
      entityType: 'user_permission',
      entityCount: 1,
      details: {
        operation: 'permission_change',
        targetUserId,
        targetUserName,
        oldPermissions,
        newPermissions,
        timestamp: new Date().toISOString(),
      },
      affectedEntities: [
        {
          id: targetUserId,
          name: targetUserName,
          type: 'user',
        },
      ],
    };

    await this.notifyWebhooks(payload);
  }

  /**
   * Trigger webhook for bulk export
   */
  static async triggerBulkExportAlert(
    userId: string,
    userName: string,
    entityType: string,
    entityCount: number,
    exportFormat: string,
    ipAddress?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      action: 'bulk_export',
      severity: 'high',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ipAddress,
      entityType,
      entityCount,
      details: {
        operation: 'bulk_export',
        exportFormat,
        exportedCount: entityCount,
        timestamp: new Date().toISOString(),
      },
      affectedEntities: [],
    };

    await this.notifyWebhooks(payload);
  }

  /**
   * Trigger webhook for user role change
   */
  static async triggerUserRoleChangeAlert(
    userId: string,
    userName: string,
    targetUserId: string,
    targetUserName: string,
    oldRole: string,
    newRole: string,
    ipAddress?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      action: 'user_role_change',
      severity: 'high',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ipAddress,
      entityType: 'user_role',
      entityCount: 1,
      details: {
        operation: 'user_role_change',
        targetUserId,
        targetUserName,
        oldRole,
        newRole,
        timestamp: new Date().toISOString(),
      },
      affectedEntities: [
        {
          id: targetUserId,
          name: targetUserName,
          type: 'user',
        },
      ],
    };

    await this.notifyWebhooks(payload);
  }

  /**
   * Trigger webhook for system config change
   */
  static async triggerSystemConfigChangeAlert(
    userId: string,
    userName: string,
    configKey: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      action: 'system_config_change',
      severity: 'high',
      timestamp: new Date().toISOString(),
      userId,
      userName,
      ipAddress,
      entityType: 'system_config',
      entityCount: 1,
      details: {
        operation: 'system_config_change',
        configKey,
        oldValue,
        newValue,
        timestamp: new Date().toISOString(),
      },
      affectedEntities: [
        {
          id: configKey,
          name: configKey,
          type: 'config',
        },
      ],
    };

    await this.notifyWebhooks(payload);
  }

  /**
   * Register a new webhook endpoint
   */
  static async registerWebhook(
    url: string,
    events: CriticalAction[],
    headers?: Record<string, string>,
    retryCount: number = 3,
    timeout: number = 30000
  ): Promise<string> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database connection not available');
      const id = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(webhookEndpoints).values({
        id,
        url,
        isActive: true,
        events: JSON.stringify(events),
        headers: headers ? JSON.stringify(headers) : null,
        retryCount,
        timeout,
        createdAt: new Date(),
      });

      return id;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  /**
   * Update webhook endpoint
   */
  static async updateWebhook(
    id: string,
    updates: Partial<WebhookEndpoint>
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database connection not available');
      await db
        .update(webhookEndpoints)
        .set({
          ...(updates.url && { url: updates.url }),
          ...(updates.isActive !== undefined && { isActive: updates.isActive }),
          ...(updates.events && { events: JSON.stringify(updates.events) }),
          ...(updates.headers && { headers: JSON.stringify(updates.headers) }),
          ...(updates.retryCount !== undefined && { retryCount: updates.retryCount }),
          ...(updates.timeout !== undefined && { timeout: updates.timeout }),
          updatedAt: new Date(),
        })
        .where(eq(webhookEndpoints.id, id));
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  }

  /**
   * Delete webhook endpoint
   */
  static async deleteWebhook(id: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database connection not available');
      await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  }

  /**
   * Get all webhook endpoints
   */
  static async getWebhooks(): Promise<WebhookEndpoint[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database connection not available');
      const endpoints = await db.select().from(webhookEndpoints);
      return endpoints.map(endpoint => ({
        id: endpoint.id,
        url: endpoint.url,
        isActive: endpoint.isActive,
        isPaused: endpoint.isPaused,
        events: JSON.parse(endpoint.events as any),
        headers: endpoint.headers ? JSON.parse(endpoint.headers as any) : undefined,
        retryCount: endpoint.retryCount,
        timeout: endpoint.timeout
      }));
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  static async testWebhook(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database connection not available');
      const endpoint = await db
        .select()
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.id, id))
        .limit(1);

      if (!endpoint || endpoint.length === 0) {
        throw new Error('Webhook endpoint not found');
      }

      const testPayload: WebhookPayload = {
        action: 'bulk_delete',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        userId: 'test-user',
        userName: 'Test User',
        entityType: 'test',
        entityCount: 0,
        details: {
          test: true,
          message: 'This is a test webhook',
        },
        affectedEntities: [],
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(endpoint[0].url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Test': 'true',
          },
          body: JSON.stringify(testPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.ok;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      return false;
    }
  }
}

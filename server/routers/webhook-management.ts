import { router, adminProcedure } from './_base';
import { z } from 'zod';
import { getDb } from '../db';
import { webhookEndpoints, webhookLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getWebhookQueue } from '../webhook-queue';
import { WebhookAuditService } from '../webhook-audit-service';
import { WebhookAuditExportService } from '../webhook-audit-export';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

export const webhookManagementRouter = router({
  /**
   * Create a new webhook endpoint
   */
  createEndpoint: adminProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.string()),
        headers: z.record(z.string()).optional(),
        retryCount: z.number().int().min(1).max(10).default(3),
        timeout: z.number().int().min(5000).max(120000).default(30000),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const id = crypto.randomUUID();

      try {
        await db.insert(webhookEndpoints).values({
          id,
          url: input.url,
          isActive: true,
          events: input.events,
          headers: input.headers || {},
          retryCount: input.retryCount,
          timeout: input.timeout,
          failureCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { id, message: 'Webhook endpoint created successfully' };
      } catch (error) {
        console.error('Error creating webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create webhook endpoint',
        });
      }
    }),

  /**
   * Update webhook endpoint
   */
  updateEndpoint: adminProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        headers: z.record(z.string()).optional(),
        isActive: z.boolean().optional(),
        retryCount: z.number().int().min(1).max(10).optional(),
        timeout: z.number().int().min(5000).max(120000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const { id, ...updates } = input;

      try {
        await db
          .update(webhookEndpoints)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(webhookEndpoints.id, id));

        return { message: 'Webhook endpoint updated successfully' };
      } catch (error) {
        console.error('Error updating webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook endpoint',
        });
      }
    }),

  /**
   * Delete webhook endpoint
   */
  deleteEndpoint: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        await db
          .delete(webhookEndpoints)
          .where(eq(webhookEndpoints.id, input.id));

        return { message: 'Webhook endpoint deleted successfully' };
      } catch (error) {
        console.error('Error deleting webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete webhook endpoint',
        });
      }
    }),

  /**
   * Get webhook audit logs
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        endpointId: z.string().optional(),
        action: z.enum(['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test']).optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        if (input.endpointId) {
          return await WebhookAuditService.getEndpointAuditLog(
            input.endpointId,
            input.limit,
            input.offset
          );
        } else if (input.action) {
          return await WebhookAuditService.getAllAuditLogs(
            input.action,
            input.limit,
            input.offset
          );
        } else {
          return await WebhookAuditService.getAllAuditLogs(
            undefined,
            input.limit,
            input.offset
          );
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
        });
      }
    }),

  /**
   * Get webhook audit statistics
   */
  getAuditStats: adminProcedure.query(async () => {
    try {
      return await WebhookAuditService.getAuditStatistics();
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch audit statistics',
      });
    }
  }),

  /**
   * Export audit logs as CSV or JSON
   */
  exportAuditLogs: adminProcedure
    .input(
      z.object({
        format: z.enum(['csv', 'json']),
        action: z.enum(['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test']).optional(),
        endpointId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().int().min(1).max(10000).default(1000),
      })
    )
    .query(async ({ input }) => {
      try {
        // Validate options
        const validation = WebhookAuditExportService.validateExportOptions({
          action: input.action,
          endpointId: input.endpointId,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
        });

        if (!validation.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid export options: ${validation.errors.join(', ')}`,
          });
        }

        // Generate export
        const content = await WebhookAuditExportService.exportAuditLogs(input.format, {
          action: input.action,
          endpointId: input.endpointId,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
        });

        // Generate filename
        const filename = WebhookAuditExportService.generateFilename(input.format, input.action);

        return {
          content,
          filename,
          format: input.format,
          mimeType: input.format === 'csv' ? 'text/csv' : 'application/json',
        };
      } catch (error) {
        console.error('Error exporting audit logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export audit logs',
        });
      }
    }),

  /**
   * Get export statistics
   */
  getExportStats: adminProcedure
    .input(
      z.object({
        action: z.enum(['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test']).optional(),
        endpointId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await WebhookAuditExportService.getExportStats({
          action: input.action,
          endpointId: input.endpointId,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      } catch (error) {
        console.error('Error fetching export statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch export statistics',
        });
      }
    }),

  /**
   * Get all webhook endpoints
   */
  listEndpoints: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    try {
      const endpoints = await db.select().from(webhookEndpoints);
      return endpoints;
    } catch (error) {
      console.error('Error fetching webhook endpoints:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch webhook endpoints',
      });
    }
  }),

  /**
   * Get webhook endpoint details
   */
  getEndpoint: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        const endpoint = await db
          .select()
          .from(webhookEndpoints)
          .where(eq(webhookEndpoints.id, input.id))
          .then(rows => rows[0]);

        if (!endpoint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook endpoint not found',
          });
        }

        return endpoint;
      } catch (error) {
        console.error('Error fetching webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch webhook endpoint',
        });
      }
    }),

  /**
   * Get webhook delivery logs
   */
  getDeliveryLogs: adminProcedure
    .input(
      z.object({
        webhookEndpointId: z.string().optional(),
        status: z.enum(['pending', 'success', 'failed', 'retrying', 'dead_letter']).optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        let query = db.select().from(webhookLogs);

        if (input.webhookEndpointId) {
          query = query.where(eq(webhookLogs.webhookEndpointId, input.webhookEndpointId));
        }

        if (input.status) {
          query = query.where(eq(webhookLogs.status, input.status));
        }

        const logs = await query.limit(input.limit).offset(input.offset);
        return logs;
      } catch (error) {
        console.error('Error fetching webhook logs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch webhook logs',
        });
      }
    }),

  /**
   * Get queue statistics
   */
  getQueueStats: adminProcedure.query(async () => {
    try {
      const queue = getWebhookQueue();
      const stats = await queue.getQueueStats();
      return stats;
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch queue statistics',
      });
    }
  }),

  /**
   * Retry a dead-letter job
   */
  retryDeadLetterJob: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const queue = getWebhookQueue();
        await queue.retryDeadLetterJob(input.jobId);
        return { message: 'Job queued for retry' };
      } catch (error) {
        console.error('Error retrying dead-letter job:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry job',
        });
      }
    }),

  /**
   * Test webhook endpoint
   */
  testEndpoint: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        const endpoint = await db
          .select()
          .from(webhookEndpoints)
          .where(eq(webhookEndpoints.id, input.id))
          .then(rows => rows[0]);

        if (!endpoint) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook endpoint not found',
          });
        }

        // Send test payload
        const testPayload = {
          action: 'test',
          timestamp: new Date().toISOString(),
          message: 'This is a test webhook',
        };

        const signature = crypto
          .createHmac('sha256', endpoint.id)
          .update(JSON.stringify(testPayload))
          .digest('hex');

        const headers = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': 'test-' + crypto.randomUUID(),
          'X-Webhook-Timestamp': new Date().toISOString(),
          ...(endpoint.headers as Record<string, string> || {}),
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 30000);

        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(testPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          return {
            success: response.ok,
            statusCode: response.status,
            statusText: response.statusText,
          };
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        console.error('Error testing webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to test webhook endpoint',
        });
      }
    }),

  /**
   * Pause a webhook endpoint
   */
  pauseEndpoint: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        await db
          .update(webhookEndpoints)
          .set({
            isPaused: true,
            updatedAt: new Date(),
          })
          .where(eq(webhookEndpoints.id, input.id));

        // Log to audit trail
        await WebhookAuditService.logPause(
          input.id,
          ctx.user.id,
          ctx.user.name,
          input.reason,
          ctx.ipAddress,
          ctx.userAgent
        );

        return { message: 'Webhook endpoint paused successfully' };
      } catch (error) {
        console.error('Error pausing webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to pause webhook endpoint',
        });
      }
    }),

  /**
   * Resume a webhook endpoint
   */
  resumeEndpoint: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      try {
        await db
          .update(webhookEndpoints)
          .set({
            isPaused: false,
            updatedAt: new Date(),
          })
          .where(eq(webhookEndpoints.id, input.id));

        // Log to audit trail
        await WebhookAuditService.logResume(
          input.id,
          ctx.user.id,
          ctx.user.name,
          input.reason,
          ctx.ipAddress,
          ctx.userAgent
        );

        return { message: 'Webhook endpoint resumed successfully' };
      } catch (error) {
        console.error('Error resuming webhook endpoint:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resume webhook endpoint',
        });
      }
    }),

  /**
   * Clear dead-letter queue
   */
  clearDeadLetterQueue: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    try {
      await db
        .delete(webhookLogs)
        .where(eq(webhookLogs.status, 'dead_letter'));

      return { message: 'Dead-letter queue cleared' };
    } catch (error) {
      console.error('Error clearing dead-letter queue:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to clear dead-letter queue',
      });
    }
  }),
});

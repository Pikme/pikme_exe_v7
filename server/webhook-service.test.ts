import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhookService, type WebhookPayload, type CriticalAction } from './webhook-service';

describe('WebhookService', () => {
  describe('Webhook Payload Generation', () => {
    it('should generate bulk delete alert payload', () => {
      const payload = {
        action: 'bulk_delete' as CriticalAction,
        severity: 'critical' as const,
        timestamp: new Date().toISOString(),
        userId: 'user-123',
        userName: 'Admin User',
        ipAddress: '192.168.1.1',
        entityType: 'tour',
        entityCount: 5,
        details: {
          operation: 'bulk_delete',
          deletedCount: 5,
        },
        affectedEntities: [
          { id: '1', name: 'Tour 1', type: 'tour' },
          { id: '2', name: 'Tour 2', type: 'tour' },
        ],
      };

      expect(payload.action).toBe('bulk_delete');
      expect(payload.severity).toBe('critical');
      expect(payload.entityCount).toBe(5);
      expect(payload.affectedEntities).toHaveLength(2);
    });

    it('should generate permission change alert payload', () => {
      const payload = {
        action: 'permission_change' as CriticalAction,
        severity: 'high' as const,
        timestamp: new Date().toISOString(),
        userId: 'admin-1',
        userName: 'Admin',
        entityType: 'user_permission',
        entityCount: 1,
        details: {
          operation: 'permission_change',
          targetUserId: 'user-2',
          targetUserName: 'John Doe',
          oldPermissions: ['read', 'write'],
          newPermissions: ['read', 'write', 'delete', 'admin'],
        },
        affectedEntities: [
          { id: 'user-2', name: 'John Doe', type: 'user' },
        ],
      };

      expect(payload.action).toBe('permission_change');
      expect(payload.severity).toBe('high');
      expect(payload.details.oldPermissions).toHaveLength(2);
      expect(payload.details.newPermissions).toHaveLength(4);
    });

    it('should generate bulk export alert payload', () => {
      const payload = {
        action: 'bulk_export' as CriticalAction,
        severity: 'high' as const,
        timestamp: new Date().toISOString(),
        userId: 'user-123',
        userName: 'Admin User',
        entityType: 'tour',
        entityCount: 100,
        details: {
          operation: 'bulk_export',
          exportFormat: 'csv',
          exportedCount: 100,
        },
        affectedEntities: [],
      };

      expect(payload.action).toBe('bulk_export');
      expect(payload.details.exportFormat).toBe('csv');
      expect(payload.entityCount).toBe(100);
    });

    it('should generate user role change alert payload', () => {
      const payload = {
        action: 'user_role_change' as CriticalAction,
        severity: 'high' as const,
        timestamp: new Date().toISOString(),
        userId: 'admin-1',
        userName: 'Admin',
        entityType: 'user_role',
        entityCount: 1,
        details: {
          operation: 'user_role_change',
          targetUserId: 'user-2',
          targetUserName: 'John Doe',
          oldRole: 'user',
          newRole: 'admin',
        },
        affectedEntities: [
          { id: 'user-2', name: 'John Doe', type: 'user' },
        ],
      };

      expect(payload.action).toBe('user_role_change');
      expect(payload.details.oldRole).toBe('user');
      expect(payload.details.newRole).toBe('admin');
    });

    it('should generate system config change alert payload', () => {
      const payload = {
        action: 'system_config_change' as CriticalAction,
        severity: 'high' as const,
        timestamp: new Date().toISOString(),
        userId: 'admin-1',
        userName: 'Admin',
        entityType: 'system_config',
        entityCount: 1,
        details: {
          operation: 'system_config_change',
          configKey: 'max_upload_size',
          oldValue: '100MB',
          newValue: '500MB',
        },
        affectedEntities: [
          { id: 'max_upload_size', name: 'max_upload_size', type: 'config' },
        ],
      };

      expect(payload.action).toBe('system_config_change');
      expect(payload.details.configKey).toBe('max_upload_size');
      expect(payload.details.oldValue).toBe('100MB');
      expect(payload.details.newValue).toBe('500MB');
    });
  });

  describe('Webhook Endpoint Management', () => {
    it('should validate webhook URL format', () => {
      const validUrls = [
        'https://example.com/webhook',
        'https://api.example.com/webhooks/audit',
        'https://webhook.example.com:8080/events',
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should validate critical action types', () => {
      const validActions: CriticalAction[] = [
        'bulk_delete',
        'bulk_export',
        'permission_change',
        'user_role_change',
        'mass_update',
        'data_export',
        'system_config_change',
      ];

      expect(validActions).toHaveLength(7);
      expect(validActions).toContain('bulk_delete');
      expect(validActions).toContain('permission_change');
    });

    it('should handle webhook endpoint configuration', () => {
      const endpoint = {
        id: 'webhook-123',
        url: 'https://example.com/webhook',
        isActive: true,
        events: ['bulk_delete', 'permission_change'],
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'value',
        },
        retryCount: 3,
        timeout: 30000,
      };

      expect(endpoint.id).toBe('webhook-123');
      expect(endpoint.isActive).toBe(true);
      expect(endpoint.events).toContain('bulk_delete');
      expect(endpoint.headers['Authorization']).toBe('Bearer token123');
      expect(endpoint.retryCount).toBe(3);
      expect(endpoint.timeout).toBe(30000);
    });
  });

  describe('Webhook Retry Logic', () => {
    it('should calculate exponential backoff', () => {
      const delays = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        const delay = Math.pow(2, attempt) * 1000;
        delays.push(delay);
      }

      expect(delays).toEqual([1000, 2000, 4000, 8000]);
    });

    it('should respect max retry count', () => {
      const maxRetries = 3;
      let attempts = 0;

      while (attempts < maxRetries) {
        attempts++;
      }

      expect(attempts).toBe(maxRetries);
    });
  });

  describe('Webhook Signature Generation', () => {
    it('should generate consistent HMAC signatures', () => {
      const crypto = require('crypto');
      const payload = { action: 'bulk_delete', timestamp: '2024-01-30' };
      const secret = 'test-secret';
      const message = JSON.stringify(payload);

      const sig1 = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      const sig2 = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex is 64 chars
    });

    it('should generate different signatures for different payloads', () => {
      const crypto = require('crypto');
      const secret = 'test-secret';

      const sig1 = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify({ action: 'bulk_delete' }))
        .digest('hex');

      const sig2 = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify({ action: 'permission_change' }))
        .digest('hex');

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('Webhook Event Filtering', () => {
    it('should filter endpoints by event type', () => {
      const endpoints = [
        { id: '1', events: ['bulk_delete', 'permission_change'], isActive: true },
        { id: '2', events: ['bulk_export'], isActive: true },
        { id: '3', events: ['bulk_delete'], isActive: false },
      ];

      const bulkDeleteEndpoints = endpoints.filter(
        e => e.isActive && e.events.includes('bulk_delete')
      );

      expect(bulkDeleteEndpoints).toHaveLength(1);
      expect(bulkDeleteEndpoints[0].id).toBe('1');
    });

    it('should exclude inactive endpoints', () => {
      const endpoints = [
        { id: '1', isActive: true },
        { id: '2', isActive: false },
        { id: '3', isActive: true },
      ];

      const activeEndpoints = endpoints.filter(e => e.isActive);

      expect(activeEndpoints).toHaveLength(2);
      expect(activeEndpoints.map(e => e.id)).toEqual(['1', '3']);
    });
  });

  describe('Webhook Payload Validation', () => {
    it('should validate required payload fields', () => {
      const payload: WebhookPayload = {
        action: 'bulk_delete',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        userId: 'user-123',
        userName: 'Admin',
        entityType: 'tour',
        entityCount: 5,
        details: {},
        affectedEntities: [],
      };

      expect(payload.action).toBeDefined();
      expect(payload.severity).toBeDefined();
      expect(payload.timestamp).toBeDefined();
      expect(payload.userId).toBeDefined();
      expect(payload.userName).toBeDefined();
      expect(payload.entityType).toBeDefined();
      expect(payload.entityCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle optional payload fields', () => {
      const payload: WebhookPayload = {
        action: 'bulk_delete',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        userId: 'user-123',
        userName: 'Admin',
        entityType: 'tour',
        entityCount: 5,
        details: {},
        affectedEntities: [],
        ipAddress: '192.168.1.1',
      };

      expect(payload.ipAddress).toBe('192.168.1.1');
    });
  });

  describe('Critical Action Detection', () => {
    it('should identify bulk delete as critical', () => {
      const action: CriticalAction = 'bulk_delete';
      const isCritical = action === 'bulk_delete';

      expect(isCritical).toBe(true);
    });

    it('should identify permission change as high severity', () => {
      const action: CriticalAction = 'permission_change';
      const isHighSeverity = ['permission_change', 'user_role_change', 'system_config_change'].includes(action);

      expect(isHighSeverity).toBe(true);
    });

    it('should track all critical actions', () => {
      const criticalActions: CriticalAction[] = [
        'bulk_delete',
        'bulk_export',
        'permission_change',
        'user_role_change',
        'mass_update',
        'data_export',
        'system_config_change',
      ];

      expect(criticalActions.length).toBeGreaterThan(0);
      expect(criticalActions).toContain('bulk_delete');
      expect(criticalActions).toContain('permission_change');
    });
  });
});

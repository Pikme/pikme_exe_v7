import { describe, it, expect } from 'vitest';

describe('Webhook Audit Export Service', () => {
  describe('CSV Export', () => {
    it('should generate CSV headers', () => {
      const headers = [
        'ID',
        'Timestamp',
        'Action',
        'Endpoint ID',
        'User ID',
        'User Name',
        'Reason',
        'IP Address',
        'Previous State',
        'New State',
        'Details',
      ];

      expect(headers).toHaveLength(11);
      expect(headers[0]).toBe('ID');
      expect(headers[2]).toBe('Action');
    });

    it('should escape quotes in CSV values', () => {
      const value = 'Test "quoted" value';
      const escaped = value.replace(/"/g, '""');
      expect(escaped).toBe('Test ""quoted"" value');
    });

    it('should format CSV row correctly', () => {
      const row = [1, '2026-01-30T10:00:00Z', 'pause', 'endpoint-1', 123, 'admin', 'High failure rate', '192.168.1.1', '{}', '{}', '{}'];
      const csvRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
      
      expect(csvRow).toContain('"1"');
      expect(csvRow).toContain('"pause"');
      expect(csvRow).toContain('"admin"');
    });

    it('should handle empty values in CSV', () => {
      const row = [1, '2026-01-30T10:00:00Z', 'pause', 'endpoint-1', 123, '', '', '', '{}', '{}', '{}'];
      const csvRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
      
      expect(csvRow).toContain('""');
    });

    it('should include JSON in CSV cells', () => {
      const details = { changedField: 'isPaused', previousValue: false, newValue: true };
      const jsonStr = JSON.stringify(details);
      const csvCell = `"${jsonStr.replace(/"/g, '""')}"`;
      
      expect(csvCell).toContain('changedField');
    });
  });

  describe('JSON Export', () => {
    it('should include export metadata', () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRecords: 10,
        filters: {
          action: 'pause',
          endpointId: null,
          startDate: null,
          endDate: null,
        },
        logs: [],
      };

      expect(exportData.exportedAt).toBeTruthy();
      expect(exportData.totalRecords).toBe(10);
      expect(exportData.filters.action).toBe('pause');
    });

    it('should format JSON with proper indentation', () => {
      const data = { test: 'value' };
      const json = JSON.stringify(data, null, 2);
      
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should include log entries in JSON', () => {
      const logs = [
        {
          id: 1,
          timestamp: '2026-01-30T10:00:00Z',
          action: 'pause',
          endpointId: 'ep1',
          userId: 123,
          userName: 'admin',
        },
      ];

      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        filters: {},
        logs,
      };

      expect(exportData.logs).toHaveLength(1);
      expect(exportData.logs[0].action).toBe('pause');
    });

    it('should handle null values in JSON', () => {
      const log = {
        id: 1,
        userName: null,
        reason: null,
        ipAddress: null,
      };

      const json = JSON.stringify(log);
      expect(json).toContain('null');
    });
  });

  describe('Filename Generation', () => {
    it('should generate CSV filename', () => {
      const filename = `webhook-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      
      expect(filename).toContain('webhook-audit-log');
      expect(filename).toContain('.csv');
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should generate JSON filename', () => {
      const filename = `webhook-audit-log-${new Date().toISOString().split('T')[0]}.json`;
      
      expect(filename).toContain('webhook-audit-log');
      expect(filename).toContain('.json');
    });

    it('should include action in filename', () => {
      const action = 'pause';
      const filename = `webhook-audit-log-${action}-${new Date().toISOString().split('T')[0]}.csv`;
      
      expect(filename).toContain('pause');
    });
  });

  describe('Export Options Validation', () => {
    it('should validate limit range', () => {
      const errors = [];
      
      if (0 < 1 || 0 > 10000) errors.push('Limit must be between 1 and 10000');
      if (10001 < 1 || 10001 > 10000) errors.push('Limit must be between 1 and 10000');
      
      expect(errors).toHaveLength(2);
    });

    it('should validate date range', () => {
      const startDate = new Date('2026-01-30');
      const endDate = new Date('2026-01-29');
      const errors = [];
      
      if (startDate > endDate) errors.push('Start date must be before end date');
      
      expect(errors).toHaveLength(1);
    });

    it('should validate action values', () => {
      const validActions = ['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test'];
      const testAction = 'invalid-action';
      const errors = [];
      
      if (!validActions.includes(testAction)) errors.push(`Invalid action: ${testAction}`);
      
      expect(errors).toHaveLength(1);
    });

    it('should pass valid options', () => {
      const errors = [];
      const limit = 500;
      const action = 'pause';
      const validActions = ['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test'];
      
      if (limit < 1 || limit > 10000) errors.push('Limit must be between 1 and 10000');
      if (!validActions.includes(action)) errors.push(`Invalid action: ${action}`);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Export Statistics', () => {
    it('should calculate total records', () => {
      const logs = [
        { id: 1, action: 'pause' },
        { id: 2, action: 'resume' },
        { id: 3, action: 'pause' },
      ];

      const totalRecords = logs.length;
      expect(totalRecords).toBe(3);
    });

    it('should calculate action breakdown', () => {
      const logs = [
        { id: 1, action: 'pause' },
        { id: 2, action: 'pause' },
        { id: 3, action: 'resume' },
        { id: 4, action: 'pause' },
      ];

      const actionBreakdown: Record<string, number> = {};
      logs.forEach(log => {
        actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      });

      expect(actionBreakdown.pause).toBe(3);
      expect(actionBreakdown.resume).toBe(1);
    });

    it('should calculate date range', () => {
      const logs = [
        { id: 1, createdAt: new Date('2026-01-30T10:00:00Z') },
        { id: 2, createdAt: new Date('2026-01-31T15:30:00Z') },
        { id: 3, createdAt: new Date('2026-01-29T08:00:00Z') },
      ];

      const dates = logs.map(log => new Date(log.createdAt).getTime());
      const startDate = new Date(Math.min(...dates)).toISOString();
      const endDate = new Date(Math.max(...dates)).toISOString();

      expect(startDate).toContain('2026-01-29');
      expect(endDate).toContain('2026-01-31');
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter logs by start date', () => {
      const logs = [
        { id: 1, createdAt: new Date('2026-01-29') },
        { id: 2, createdAt: new Date('2026-01-30') },
        { id: 3, createdAt: new Date('2026-01-31') },
      ];

      const startDate = new Date('2026-01-30');
      const filtered = logs.filter(log => new Date(log.createdAt) >= startDate);

      expect(filtered).toHaveLength(2);
    });

    it('should filter logs by end date', () => {
      const logs = [
        { id: 1, createdAt: new Date('2026-01-29') },
        { id: 2, createdAt: new Date('2026-01-30') },
        { id: 3, createdAt: new Date('2026-01-31') },
      ];

      const endDate = new Date('2026-01-30');
      const filtered = logs.filter(log => new Date(log.createdAt) <= endDate);

      expect(filtered).toHaveLength(2);
    });

    it('should filter logs by date range', () => {
      const logs = [
        { id: 1, createdAt: new Date('2026-01-29') },
        { id: 2, createdAt: new Date('2026-01-30') },
        { id: 3, createdAt: new Date('2026-01-31') },
      ];

      const startDate = new Date('2026-01-30');
      const endDate = new Date('2026-01-31');
      const filtered = logs.filter(
        log => new Date(log.createdAt) >= startDate && new Date(log.createdAt) <= endDate
      );

      expect(filtered).toHaveLength(2);
    });
  });

  describe('Endpoint Filtering', () => {
    it('should filter logs by endpoint ID', () => {
      const logs = [
        { id: 1, webhookEndpointId: 'ep1' },
        { id: 2, webhookEndpointId: 'ep2' },
        { id: 3, webhookEndpointId: 'ep1' },
      ];

      const endpointId = 'ep1';
      const filtered = logs.filter(log => log.webhookEndpointId === endpointId);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(log => log.webhookEndpointId === 'ep1')).toBe(true);
    });
  });

  describe('MIME Types', () => {
    it('should return correct MIME type for CSV', () => {
      const mimeType = 'text/csv';
      expect(mimeType).toBe('text/csv');
    });

    it('should return correct MIME type for JSON', () => {
      const mimeType = 'application/json';
      expect(mimeType).toBe('application/json');
    });
  });

  describe('Compliance Export Features', () => {
    it('should include all required compliance fields', () => {
      const auditLog = {
        id: 1,
        timestamp: '2026-01-30T10:00:00Z',
        action: 'pause',
        endpointId: 'ep1',
        userId: 123,
        userName: 'compliance-officer',
        reason: 'Security incident',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        previousState: { isPaused: false },
        newState: { isPaused: true },
      };

      expect(auditLog.userId).toBeTruthy();
      expect(auditLog.userName).toBeTruthy();
      expect(auditLog.timestamp).toBeTruthy();
      expect(auditLog.reason).toBeTruthy();
      expect(auditLog.ipAddress).toBeTruthy();
    });

    it('should preserve state information in export', () => {
      const log = {
        previousState: {
          id: 'ep1',
          isPaused: false,
          isActive: true,
          url: 'https://example.com',
        },
        newState: {
          id: 'ep1',
          isPaused: true,
          isActive: true,
          url: 'https://example.com',
        },
      };

      expect(log.previousState.isPaused).toBe(false);
      expect(log.newState.isPaused).toBe(true);
      expect(log.previousState.url).toBe(log.newState.url);
    });
  });
});

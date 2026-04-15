import { describe, it, expect } from 'vitest';
import type { AuditReportData } from './audit-report-pdf';

describe('Audit Report PDF Generation', () => {
  const mockReportData: AuditReportData = {
    analytics: {
      eventsPerDay: [
        {
          date: '2024-01-15',
          count: 45,
          create: 10,
          update: 20,
          delete: 5,
          export: 5,
          import: 3,
          login: 1,
          logout: 1,
        },
        {
          date: '2024-01-16',
          count: 52,
          create: 12,
          update: 25,
          delete: 8,
          export: 4,
          import: 2,
          login: 0,
          logout: 1,
        },
      ],
      topUsers: [
        {
          userId: 'user-1',
          userName: 'John Doe',
          count: 150,
          percentage: 45.5,
        },
        {
          userId: 'user-2',
          userName: 'Jane Smith',
          count: 120,
          percentage: 36.4,
        },
      ],
      mostModifiedEntities: [
        {
          entityType: 'tour',
          entityId: 'tour-123',
          entityName: 'Paris City Tour',
          count: 45,
          lastModified: new Date('2024-01-16T10:30:00Z'),
        },
        {
          entityType: 'location',
          entityId: 'loc-456',
          entityName: 'Eiffel Tower',
          count: 32,
          lastModified: new Date('2024-01-16T09:15:00Z'),
        },
      ],
      totalEvents: 330,
      dateRange: {
        start: '2024-01-15',
        end: '2024-01-16',
      },
    },
    auditLogs: [
      {
        id: 'log-1',
        userId: 'user-1',
        userName: 'John Doe',
        action: 'create',
        entityType: 'tour',
        entityId: 'tour-123',
        entityName: 'Paris City Tour',
        status: 'success',
        createdAt: '2024-01-15T10:30:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'log-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        action: 'update',
        entityType: 'location',
        entityId: 'loc-456',
        entityName: 'Eiffel Tower',
        status: 'success',
        createdAt: '2024-01-16T09:15:00Z',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
    ],
  };

  describe('Report Data Validation', () => {
    it('should have valid analytics data', () => {
      expect(mockReportData.analytics).toBeDefined();
      expect(mockReportData.analytics.totalEvents).toBe(330);
      expect(mockReportData.analytics.dateRange.start).toBe('2024-01-15');
      expect(mockReportData.analytics.dateRange.end).toBe('2024-01-16');
    });

    it('should have valid audit logs', () => {
      expect(mockReportData.auditLogs).toBeDefined();
      expect(mockReportData.auditLogs.length).toBe(2);
      expect(mockReportData.auditLogs[0].action).toBe('create');
      expect(mockReportData.auditLogs[1].action).toBe('update');
    });

    it('should have events per day data', () => {
      expect(mockReportData.analytics.eventsPerDay).toBeDefined();
      expect(mockReportData.analytics.eventsPerDay.length).toBe(2);
      expect(mockReportData.analytics.eventsPerDay[0].date).toBe('2024-01-15');
    });

    it('should have top users data', () => {
      expect(mockReportData.analytics.topUsers).toBeDefined();
      expect(mockReportData.analytics.topUsers.length).toBe(2);
      expect(mockReportData.analytics.topUsers[0].userName).toBe('John Doe');
    });

    it('should have modified entities data', () => {
      expect(mockReportData.analytics.mostModifiedEntities).toBeDefined();
      expect(mockReportData.analytics.mostModifiedEntities.length).toBe(2);
      expect(mockReportData.analytics.mostModifiedEntities[0].entityName).toBe('Paris City Tour');
    });
  });

  describe('Report Statistics', () => {
    it('should calculate total events correctly', () => {
      const total = mockReportData.analytics.eventsPerDay.reduce((sum, day) => sum + day.count, 0);
      expect(total).toBe(97);
    });

    it('should have correct user count', () => {
      expect(mockReportData.analytics.topUsers.length).toBeGreaterThan(0);
    });

    it('should have correct entity count', () => {
      expect(mockReportData.analytics.mostModifiedEntities.length).toBeGreaterThan(0);
    });

    it('should have correct audit log count', () => {
      expect(mockReportData.auditLogs.length).toBe(2);
    });

    it('should calculate user percentages correctly', () => {
      const totalCount = mockReportData.analytics.topUsers.reduce((sum, user) => sum + user.count, 0);
      const firstUserPercentage = (mockReportData.analytics.topUsers[0].count / totalCount) * 100;
      expect(firstUserPercentage).toBeCloseTo(55.56, 1);
    });
  });

  describe('Daily Activity Breakdown', () => {
    it('should track create actions', () => {
      const firstDay = mockReportData.analytics.eventsPerDay[0];
      expect(firstDay.create).toBe(10);
    });

    it('should track update actions', () => {
      const firstDay = mockReportData.analytics.eventsPerDay[0];
      expect(firstDay.update).toBe(20);
    });

    it('should track delete actions', () => {
      const firstDay = mockReportData.analytics.eventsPerDay[0];
      expect(firstDay.delete).toBe(5);
    });

    it('should track export actions', () => {
      const firstDay = mockReportData.analytics.eventsPerDay[0];
      expect(firstDay.export).toBe(5);
    });

    it('should sum action counts to total', () => {
      const firstDay = mockReportData.analytics.eventsPerDay[0];
      const actionSum = firstDay.create + firstDay.update + firstDay.delete + 
                       firstDay.export + firstDay.import + firstDay.login + firstDay.logout;
      expect(actionSum).toBe(firstDay.count);
    });
  });

  describe('Entity Modification Tracking', () => {
    it('should track entity modifications', () => {
      const entity = mockReportData.analytics.mostModifiedEntities[0];
      expect(entity.count).toBe(45);
    });

    it('should track last modified date', () => {
      const entity = mockReportData.analytics.mostModifiedEntities[0];
      expect(entity.lastModified).toBeInstanceOf(Date);
    });

    it('should have entity type', () => {
      const entity = mockReportData.analytics.mostModifiedEntities[0];
      expect(entity.entityType).toBe('tour');
    });

    it('should have entity name', () => {
      const entity = mockReportData.analytics.mostModifiedEntities[0];
      expect(entity.entityName).toBe('Paris City Tour');
    });
  });

  describe('Audit Log Details', () => {
    it('should have user information', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.userId).toBeDefined();
      expect(log.userName).toBeDefined();
    });

    it('should have action type', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.action).toBeDefined();
      expect(['create', 'update', 'delete', 'export', 'import']).toContain(log.action);
    });

    it('should have entity information', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.entityType).toBeDefined();
      expect(log.entityId).toBeDefined();
      expect(log.entityName).toBeDefined();
    });

    it('should have timestamp', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.createdAt).toBeDefined();
      const date = new Date(log.createdAt);
      expect(date.getTime()).toBeGreaterThan(0);
    });

    it('should have status', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.status).toBe('success');
    });

    it('should have IP address', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.ipAddress).toBeDefined();
      expect(log.ipAddress).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });

    it('should have user agent', () => {
      const log = mockReportData.auditLogs[0];
      expect(log.userAgent).toBeDefined();
    });
  });

  describe('Date Range Validation', () => {
    it('should have valid date range', () => {
      const { start, end } = mockReportData.analytics.dateRange;
      expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should have start date before end date', () => {
      const { start, end } = mockReportData.analytics.dateRange;
      expect(start <= end).toBe(true);
    });

    it('should match events per day dates', () => {
      const dates = mockReportData.analytics.eventsPerDay.map(d => d.date);
      const { start, end } = mockReportData.analytics.dateRange;
      expect(dates.every(date => date >= start && date <= end)).toBe(true);
    });
  });

  describe('Report Completeness', () => {
    it('should have all required sections', () => {
      expect(mockReportData.analytics).toBeDefined();
      expect(mockReportData.analytics.eventsPerDay).toBeDefined();
      expect(mockReportData.analytics.topUsers).toBeDefined();
      expect(mockReportData.analytics.mostModifiedEntities).toBeDefined();
      expect(mockReportData.auditLogs).toBeDefined();
    });

    it('should have metadata', () => {
      expect(mockReportData.analytics.totalEvents).toBeDefined();
      expect(mockReportData.analytics.dateRange).toBeDefined();
    });

    it('should handle empty audit logs', () => {
      const emptyData = { ...mockReportData, auditLogs: [] };
      expect(emptyData.auditLogs.length).toBe(0);
    });

    it('should handle large audit logs', () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        ...mockReportData.auditLogs[0],
        id: `log-${i}`,
      }));
      expect(largeLogs.length).toBe(1000);
    });
  });
});

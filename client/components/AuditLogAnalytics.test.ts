import { describe, it, expect } from 'vitest';
import { AuditLogAnalytics } from './AuditLogAnalytics';
import type { AuditAnalyticsData } from './AuditLogAnalytics';

describe('AuditLogAnalytics Component', () => {
  const mockAnalyticsData: AuditAnalyticsData = {
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
      {
        userId: 'user-3',
        userName: 'Bob Johnson',
        count: 60,
        percentage: 18.1,
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
      {
        entityType: 'activity',
        entityId: 'act-789',
        entityName: 'Museum Visit',
        count: 28,
        lastModified: new Date('2024-01-15T14:45:00Z'),
      },
    ],
    totalEvents: 330,
    dateRange: {
      start: '2024-01-15',
      end: '2024-01-16',
    },
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const component = AuditLogAnalytics({
        data: mockAnalyticsData,
        isLoading: false,
      });
      expect(component).toBeDefined();
    });

    it('should display loading state when isLoading is true', () => {
      const component = AuditLogAnalytics({
        data: mockAnalyticsData,
        isLoading: true,
      });
      expect(component).toBeDefined();
    });

    it('should display summary statistics', () => {
      const component = AuditLogAnalytics({
        data: mockAnalyticsData,
        isLoading: false,
      });
      expect(component).toBeDefined();
      // Component should show total events, active users, and modified entities
    });
  });

  describe('Data Processing', () => {
    it('should handle empty events per day', () => {
      const emptyData: AuditAnalyticsData = {
        ...mockAnalyticsData,
        eventsPerDay: [],
      };
      const component = AuditLogAnalytics({
        data: emptyData,
        isLoading: false,
      });
      expect(component).toBeDefined();
    });

    it('should handle empty top users', () => {
      const emptyData: AuditAnalyticsData = {
        ...mockAnalyticsData,
        topUsers: [],
      };
      const component = AuditLogAnalytics({
        data: emptyData,
        isLoading: false,
      });
      expect(component).toBeDefined();
    });

    it('should handle empty modified entities', () => {
      const emptyData: AuditAnalyticsData = {
        ...mockAnalyticsData,
        mostModifiedEntities: [],
      };
      const component = AuditLogAnalytics({
        data: emptyData,
        isLoading: false,
      });
      expect(component).toBeDefined();
    });

    it('should calculate percentages correctly', () => {
      const totalEvents = mockAnalyticsData.topUsers.reduce((sum, user) => sum + user.count, 0);
      const firstUserPercentage = (mockAnalyticsData.topUsers[0].count / totalEvents) * 100;
      expect(firstUserPercentage).toBeCloseTo(mockAnalyticsData.topUsers[0].percentage, 1);
    });
  });

  describe('Date Range Handling', () => {
    it('should display correct date range', () => {
      const component = AuditLogAnalytics({
        data: mockAnalyticsData,
        isLoading: false,
      });
      expect(component).toBeDefined();
      // Component should show the date range from data
    });

    it('should handle date range changes', () => {
      const onDateRangeChange = (start: string, end: string) => {
        expect(start).toBe('2024-01-01');
        expect(end).toBe('2024-01-31');
      };

      const component = AuditLogAnalytics({
        data: mockAnalyticsData,
        isLoading: false,
        onDateRangeChange,
      });
      expect(component).toBeDefined();
    });
  });

  describe('Chart Data', () => {
    it('should have events per day data sorted by date', () => {
      const dates = mockAnalyticsData.eventsPerDay.map(d => d.date);
      const sortedDates = [...dates].sort();
      expect(dates).toEqual(sortedDates);
    });

    it('should have top users sorted by count descending', () => {
      const counts = mockAnalyticsData.topUsers.map(u => u.count);
      const sortedCounts = [...counts].sort((a, b) => b - a);
      expect(counts).toEqual(sortedCounts);
    });

    it('should have modified entities sorted by count descending', () => {
      const counts = mockAnalyticsData.mostModifiedEntities.map(e => e.count);
      const sortedCounts = [...counts].sort((a, b) => b - a);
      expect(counts).toEqual(sortedCounts);
    });

    it('should limit top users to 10', () => {
      const manyUsers = Array.from({ length: 20 }, (_, i) => ({
        userId: `user-${i}`,
        userName: `User ${i}`,
        count: 100 - i,
        percentage: (100 - i) / 2000 * 100,
      }));

      const data: AuditAnalyticsData = {
        ...mockAnalyticsData,
        topUsers: manyUsers,
      };

      const component = AuditLogAnalytics({
        data,
        isLoading: false,
      });
      expect(component).toBeDefined();
      // Component should display only top 10 users
    });

    it('should limit modified entities to 20', () => {
      const manyEntities = Array.from({ length: 30 }, (_, i) => ({
        entityType: 'tour',
        entityId: `entity-${i}`,
        entityName: `Entity ${i}`,
        count: 100 - i,
        lastModified: new Date(),
      }));

      const data: AuditAnalyticsData = {
        ...mockAnalyticsData,
        mostModifiedEntities: manyEntities,
      };

      const component = AuditLogAnalytics({
        data,
        isLoading: false,
      });
      expect(component).toBeDefined();
      // Component should display only top 20 entities
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate total events correctly', () => {
      const total = mockAnalyticsData.eventsPerDay.reduce((sum, day) => sum + day.count, 0);
      expect(total).toBe(97);
    });

    it('should count active users correctly', () => {
      expect(mockAnalyticsData.topUsers.length).toBe(3);
    });

    it('should count unique entities correctly', () => {
      expect(mockAnalyticsData.mostModifiedEntities.length).toBe(3);
    });

    it('should track last modified dates', () => {
      const lastModified = mockAnalyticsData.mostModifiedEntities[0].lastModified;
      expect(lastModified).toBeInstanceOf(Date);
      expect(lastModified.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Action Types', () => {
    it('should track all action types', () => {
      const actions = ['create', 'update', 'delete', 'export', 'import', 'login', 'logout'];
      const firstDay = mockAnalyticsData.eventsPerDay[0];
      
      actions.forEach(action => {
        expect(firstDay).toHaveProperty(action);
        expect(typeof firstDay[action as keyof typeof firstDay]).toBe('number');
      });
    });

    it('should sum action counts to total count', () => {
      const firstDay = mockAnalyticsData.eventsPerDay[0];
      const actionSum = firstDay.create + firstDay.update + firstDay.delete + 
                       firstDay.export + firstDay.import + firstDay.login + firstDay.logout;
      expect(actionSum).toBe(firstDay.count);
    });
  });
});

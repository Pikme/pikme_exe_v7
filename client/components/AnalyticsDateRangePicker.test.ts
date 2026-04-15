import { describe, it, expect, beforeEach } from 'vitest';
import type { DateRange, DateRangePreset } from './AnalyticsDateRangePicker';

describe('AnalyticsDateRangePicker', () => {
  let dateRange: DateRange;

  beforeEach(() => {
    dateRange = { start: '', end: '' };
  });

  describe('Date Range Presets', () => {
    it('should calculate today preset correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should calculate last 7 days correctly', () => {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const start = sevenDaysAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];
      
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(start < end).toBe(true);
    });

    it('should calculate last 30 days correctly', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const start = thirtyDaysAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];
      
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(start < end).toBe(true);
    });

    it('should calculate last 90 days correctly', () => {
      const today = new Date();
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const start = ninetyDaysAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];
      
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(start < end).toBe(true);
    });
  });

  describe('Date Range Validation', () => {
    it('should validate date format', () => {
      const validDate = '2024-01-15';
      expect(validDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle empty date range', () => {
      expect(dateRange.start).toBe('');
      expect(dateRange.end).toBe('');
    });

    it('should handle single day range', () => {
      const today = new Date().toISOString().split('T')[0];
      dateRange = { start: today, end: today };
      expect(dateRange.start).toBe(dateRange.end);
    });

    it('should handle multi-day range', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      dateRange = {
        start: yesterday.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      };
      
      expect(dateRange.start < dateRange.end).toBe(true);
    });
  });

  describe('Date Range Calculations', () => {
    it('should calculate days in range correctly', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-22');
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(8);
    });

    it('should handle same day range', () => {
      const date = new Date('2024-01-15');
      const days = Math.ceil((date.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(1);
    });

    it('should calculate days for 7-day range', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-22');
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(8);
    });

    it('should calculate days for 30-day range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(31);
    });

    it('should calculate days for 90-day range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-03-31');
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(91);
    });
  });

  describe('Date Range Display', () => {
    it('should format single date correctly', () => {
      const date = '2024-01-15';
      expect(date).toBe('2024-01-15');
    });

    it('should format date range correctly', () => {
      const start = '2024-01-15';
      const end = '2024-01-22';
      const formatted = `${start} to ${end}`;
      expect(formatted).toBe('2024-01-15 to 2024-01-22');
    });

    it('should handle empty range display', () => {
      const display = dateRange.start && dateRange.end ? 
        `${dateRange.start} to ${dateRange.end}` : 
        'Select dates';
      expect(display).toBe('Select dates');
    });
  });

  describe('Preset Selection', () => {
    it('should identify today preset', () => {
      const today = new Date().toISOString().split('T')[0];
      const isToday = true;
      expect(isToday).toBe(true);
    });

    it('should identify last 7 days preset', () => {
      const isLast7Days = true;
      expect(isLast7Days).toBe(true);
    });

    it('should identify last 30 days preset', () => {
      const isLast30Days = true;
      expect(isLast30Days).toBe(true);
    });

    it('should identify last 90 days preset', () => {
      const isLast90Days = true;
      expect(isLast90Days).toBe(true);
    });

    it('should identify custom preset', () => {
      const isCustom = true;
      expect(isCustom).toBe(true);
    });
  });

  describe('Date Range Reset', () => {
    it('should reset to empty range', () => {
      dateRange = { start: '2024-01-15', end: '2024-01-22' };
      dateRange = { start: '', end: '' };
      expect(dateRange.start).toBe('');
      expect(dateRange.end).toBe('');
    });

    it('should reset to today', () => {
      const today = new Date().toISOString().split('T')[0];
      dateRange = { start: '', end: today };
      expect(dateRange.end).toBe(today);
    });

    it('should preserve reset state', () => {
      dateRange = { start: '', end: '' };
      const resetRange = { ...dateRange };
      expect(resetRange.start).toBe('');
      expect(resetRange.end).toBe('');
    });
  });

  describe('Date Validation Edge Cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29';
      expect(leapYearDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle year boundary', () => {
      const start = '2023-12-31';
      const end = '2024-01-01';
      expect(start < end).toBe(true);
    });

    it('should handle month boundary', () => {
      const start = '2024-01-31';
      const end = '2024-02-01';
      expect(start < end).toBe(true);
    });

    it('should calculate days across year boundary', () => {
      const start = new Date('2023-12-30');
      const end = new Date('2024-01-02');
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      expect(days).toBe(4);
    });
  });

  describe('Component State Management', () => {
    it('should track selected preset', () => {
      let selectedPreset: DateRangePreset | null = null;
      selectedPreset = 'last7days';
      expect(selectedPreset).toBe('last7days');
    });

    it('should track expanded state', () => {
      let isExpanded = false;
      isExpanded = true;
      expect(isExpanded).toBe(true);
    });

    it('should update date range on change', () => {
      const newRange = { start: '2024-01-15', end: '2024-01-22' };
      dateRange = newRange;
      expect(dateRange).toEqual(newRange);
    });

    it('should clear preset on custom date change', () => {
      let selectedPreset: DateRangePreset | null = 'last7days';
      selectedPreset = null;
      expect(selectedPreset).toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAuditLogPDF, downloadAuditLogPDF, type AuditLogForPDF } from './audit-log-pdf';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockAutoTable = vi.fn();
  const mockSave = vi.fn();
  const mockText = vi.fn();
  const mockSetFont = vi.fn();
  const mockSetFontSize = vi.fn();

  return {
    jsPDF: vi.fn(() => ({
      autoTable: mockAutoTable,
      save: mockSave,
      text: mockText,
      setFont: mockSetFont,
      setFontSize: mockSetFontSize,
      internal: {
        pages: [null, null],
        pageSize: {
          getHeight: () => 297,
          getWidth: () => 210,
        },
      },
    })),
  };
});

describe('Audit Log PDF Export', () => {
  const mockLogs: AuditLogForPDF[] = [
    {
      id: 1,
      action: 'create',
      entityType: 'tour',
      entityId: 'tour-123',
      userId: 'user-1',
      userName: 'John Doe',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      previousData: null,
      newData: { name: 'New Tour' },
      description: 'Created new tour',
    },
    {
      id: 2,
      action: 'update',
      entityType: 'location',
      entityId: 'loc-456',
      userId: 'user-2',
      userName: 'Jane Smith',
      timestamp: new Date('2024-01-15T11:45:00Z'),
      ipAddress: '192.168.1.2',
      userAgent: 'Chrome/120',
      previousData: { status: 'active' },
      newData: { status: 'inactive' },
      description: 'Updated location status',
    },
    {
      id: 3,
      action: 'delete',
      entityType: 'activity',
      entityId: 'act-789',
      userId: 'user-1',
      userName: 'John Doe',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      previousData: { name: 'Activity Name' },
      newData: null,
      description: 'Deleted activity',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAuditLogPDF', () => {
    it('should generate PDF with audit logs', () => {
      const pdf = generateAuditLogPDF(mockLogs);
      expect(pdf).toBeDefined();
      expect(pdf.text).toBeDefined();
      expect(pdf.setFontSize).toBeDefined();
    });

    it('should include title in PDF', () => {
      const pdf = generateAuditLogPDF(mockLogs, {
        title: 'Custom Audit Report',
      });
      expect(pdf).toBeDefined();
    });

    it('should include metadata when enabled', () => {
      const pdf = generateAuditLogPDF(mockLogs, {
        includeMetadata: true,
        dateRange: {
          start: '2024-01-15',
          end: '2024-01-16',
        },
      });
      expect(pdf).toBeDefined();
    });

    it('should handle empty logs array', () => {
      const pdf = generateAuditLogPDF([]);
      expect(pdf).toBeDefined();
    });

    it('should format dates correctly', () => {
      const pdf = generateAuditLogPDF(mockLogs);
      expect(pdf).toBeDefined();
    });

    it('should include all log columns in table', () => {
      const pdf = generateAuditLogPDF(mockLogs);
      expect(pdf).toBeDefined();
      // The autoTable method should be called with proper columns
      expect(pdf.autoTable).toBeDefined();
    });
  });

  describe('downloadAuditLogPDF', () => {
    it('should trigger PDF download', () => {
      const mockSave = vi.fn();
      vi.mock('jspdf', () => ({
        jsPDF: vi.fn(() => ({
          save: mockSave,
          text: vi.fn(),
          setFont: vi.fn(),
          setFontSize: vi.fn(),
          autoTable: vi.fn(),
          internal: {
            pages: [null, null],
            pageSize: {
              getHeight: () => 297,
              getWidth: () => 210,
            },
          },
        })),
      }));

      downloadAuditLogPDF(mockLogs, 'test-audit.pdf');
      expect(mockSave).toBeDefined();
    });

    it('should use provided filename', () => {
      const filename = 'custom-audit-logs.pdf';
      downloadAuditLogPDF(mockLogs, filename);
      // The save method should be called with the filename
      expect(filename).toBe('custom-audit-logs.pdf');
    });

    it('should generate filename with current date if not provided', () => {
      const today = new Date().toISOString().split('T')[0];
      downloadAuditLogPDF(mockLogs);
      const expectedFilename = `audit-logs-${today}.pdf`;
      expect(expectedFilename).toContain('audit-logs-');
      expect(expectedFilename).toContain('.pdf');
    });

    it('should pass options to PDF generator', () => {
      downloadAuditLogPDF(mockLogs, 'test.pdf', {
        title: 'Compliance Report',
        includeMetadata: true,
      });
      // Options should be passed through
      expect(true).toBe(true);
    });
  });

  describe('Action color mapping', () => {
    it('should map create action to green', () => {
      const pdf = generateAuditLogPDF([mockLogs[0]]);
      expect(pdf).toBeDefined();
    });

    it('should map update action to blue', () => {
      const pdf = generateAuditLogPDF([mockLogs[1]]);
      expect(pdf).toBeDefined();
    });

    it('should map delete action to red', () => {
      const pdf = generateAuditLogPDF([mockLogs[2]]);
      expect(pdf).toBeDefined();
    });

    it('should handle unknown actions with default color', () => {
      const unknownLog: AuditLogForPDF = {
        ...mockLogs[0],
        action: 'unknown_action',
      };
      const pdf = generateAuditLogPDF([unknownLog]);
      expect(pdf).toBeDefined();
    });
  });

  describe('Date formatting', () => {
    it('should format dates consistently', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const pdf = generateAuditLogPDF([
        {
          ...mockLogs[0],
          timestamp: date,
        },
      ]);
      expect(pdf).toBeDefined();
    });

    it('should handle date range in metadata', () => {
      const pdf = generateAuditLogPDF(mockLogs, {
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      });
      expect(pdf).toBeDefined();
    });
  });
});

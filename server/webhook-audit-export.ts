import { WebhookAuditService } from './webhook-audit-service';
import { AuditEncryptionService } from './audit-encryption-service';

export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  action?: string;
  endpointId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  encrypt?: boolean;
  encryptionPassword?: string;
}

export class WebhookAuditExportService {
  /**
   * Export audit logs as CSV
   */
  static async exportAsCSV(options: ExportOptions = {}): Promise<string> {
    try {
      const logs = await WebhookAuditService.getAllAuditLogs(
        options.action as any,
        options.limit || 1000,
        0
      );

      // Filter by date range if provided
      let filteredLogs = logs;
      if (options.startDate || options.endDate) {
        filteredLogs = logs.filter(log => {
          const logDate = new Date(log.createdAt);
          if (options.startDate && logDate < options.startDate) return false;
          if (options.endDate && logDate > options.endDate) return false;
          return true;
        });
      }

      // Filter by endpoint if provided
      if (options.endpointId) {
        filteredLogs = filteredLogs.filter(log => log.webhookEndpointId === options.endpointId);
      }

      // CSV headers
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

      // CSV rows
      const rows = filteredLogs.map(log => [
        log.id,
        new Date(log.createdAt).toISOString(),
        log.action,
        log.webhookEndpointId,
        log.userId,
        log.userName || '',
        (log.reason || '').replace(/"/g, '""'), // Escape quotes
        log.ipAddress || '',
        JSON.stringify(log.previousState || {}),
        JSON.stringify(log.newState || {}),
        JSON.stringify(log.details || {}),
      ]);

      // Build CSV content
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting audit logs as CSV:', error);
      throw new Error('Failed to export audit logs as CSV');
    }
  }

  /**
   * Export audit logs as JSON
   */
  static async exportAsJSON(options: ExportOptions = {}): Promise<string> {
    try {
      const logs = await WebhookAuditService.getAllAuditLogs(
        options.action as any,
        options.limit || 1000,
        0
      );

      // Filter by date range if provided
      let filteredLogs = logs;
      if (options.startDate || options.endDate) {
        filteredLogs = logs.filter(log => {
          const logDate = new Date(log.createdAt);
          if (options.startDate && logDate < options.startDate) return false;
          if (options.endDate && logDate > options.endDate) return false;
          return true;
        });
      }

      // Filter by endpoint if provided
      if (options.endpointId) {
        filteredLogs = filteredLogs.filter(log => log.webhookEndpointId === options.endpointId);
      }

      // Format logs for JSON export
      const formattedLogs = filteredLogs.map(log => ({
        id: log.id,
        timestamp: new Date(log.createdAt).toISOString(),
        action: log.action,
        endpointId: log.webhookEndpointId,
        userId: log.userId,
        userName: log.userName || null,
        reason: log.reason || null,
        ipAddress: log.ipAddress || null,
        userAgent: log.userAgent || null,
        previousState: log.previousState || null,
        newState: log.newState || null,
        details: log.details || null,
      }));

      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRecords: formattedLogs.length,
        filters: {
          action: options.action || null,
          endpointId: options.endpointId || null,
          startDate: options.startDate?.toISOString() || null,
          endDate: options.endDate?.toISOString() || null,
        },
        logs: formattedLogs,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting audit logs as JSON:', error);
      throw new Error('Failed to export audit logs as JSON');
    }
  }

  /**
   * Export audit logs in specified format
   */
  static async exportAuditLogs(
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<string> {
    let content: string;
    
    if (format === 'csv') {
      content = await this.exportAsCSV(options);
    } else if (format === 'json') {
      content = await this.exportAsJSON(options);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }

    if (options.encrypt && options.encryptionPassword) {
      const metadata = {
        format,
        action: options.action,
        exportedAt: new Date().toISOString(),
      };
      return AuditEncryptionService.createEncryptedFile(
        content,
        options.encryptionPassword,
        metadata
      );
    }

    return content;
  }

  /**
   * Generate filename for export
   */
  static generateFilename(format: ExportFormat, action?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const actionSuffix = action ? `-${action}` : '';
    const extension = format === 'csv' ? 'csv' : 'json';
    return `webhook-audit-log${actionSuffix}-${timestamp}.${extension}`;
  }

  /**
   * Get export statistics
   */
  static async getExportStats(options: ExportOptions = {}): Promise<{
    totalRecords: number;
    actionBreakdown: Record<string, number>;
    dateRange: { start: string; end: string };
  }> {
    try {
      const logs = await WebhookAuditService.getAllAuditLogs(
        options.action as any,
        options.limit || 1000,
        0
      );

      // Filter by date range if provided
      let filteredLogs = logs;
      if (options.startDate || options.endDate) {
        filteredLogs = logs.filter(log => {
          const logDate = new Date(log.createdAt);
          if (options.startDate && logDate < options.startDate) return false;
          if (options.endDate && logDate > options.endDate) return false;
          return true;
        });
      }

      // Filter by endpoint if provided
      if (options.endpointId) {
        filteredLogs = filteredLogs.filter(log => log.webhookEndpointId === options.endpointId);
      }

      // Calculate action breakdown
      const actionBreakdown: Record<string, number> = {};
      filteredLogs.forEach(log => {
        actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      });

      // Get date range
      const dates = filteredLogs.map(log => new Date(log.createdAt).getTime());
      const startDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
      const endDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

      return {
        totalRecords: filteredLogs.length,
        actionBreakdown,
        dateRange: {
          start: startDate || 'N/A',
          end: endDate || 'N/A',
        },
      };
    } catch (error) {
      console.error('Error calculating export statistics:', error);
      return {
        totalRecords: 0,
        actionBreakdown: {},
        dateRange: { start: 'N/A', end: 'N/A' },
      };
    }
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.limit && (options.limit < 1 || options.limit > 10000)) {
      errors.push('Limit must be between 1 and 10000');
    }

    if (options.startDate && options.endDate && options.startDate > options.endDate) {
      errors.push('Start date must be before end date');
    }

    if (options.action && !['create', 'update', 'delete', 'activate', 'deactivate', 'pause', 'resume', 'test'].includes(options.action)) {
      errors.push(`Invalid action: ${options.action}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

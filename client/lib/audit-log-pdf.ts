import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface AuditLogPDFOptions {
  title?: string;
  includeMetadata?: boolean;
  includeTimeline?: boolean;
  dateRange?: { start?: string; end?: string };
}

export interface AuditLogForPDF {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  previousData?: any;
  newData?: any;
  description?: string;
}

const ACTION_COLORS: Record<string, [number, number, number]> = {
  create: [76, 175, 80],    // Green
  update: [33, 150, 243],   // Blue
  delete: [244, 67, 54],    // Red
  export: [255, 152, 0],    // Orange
  import: [156, 39, 176],   // Purple
  login: [0, 188, 212],     // Cyan
  logout: [158, 158, 158],  // Gray
};

function getActionColor(action: string): [number, number, number] {
  return ACTION_COLORS[action.toLowerCase()] || [100, 100, 100];
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function generateAuditLogPDF(
  logs: AuditLogForPDF[],
  options: AuditLogPDFOptions = {}
): jsPDF {
  const {
    title = 'Audit Log Report',
    includeMetadata = true,
    dateRange,
  } = options;

  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, yPosition);
  yPosition += 15;

  // Metadata section
  if (includeMetadata) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${formatDate(new Date())}`, 20, yPosition);
    yPosition += 7;

    if (dateRange?.start || dateRange?.end) {
      const startStr = dateRange.start ? formatDate(dateRange.start) : 'N/A';
      const endStr = dateRange.end ? formatDate(dateRange.end) : 'N/A';
      doc.text(`Date Range: ${startStr} to ${endStr}`, 20, yPosition);
      yPosition += 7;
    }

    doc.text(`Total Records: ${logs.length}`, 20, yPosition);
    yPosition += 10;
  }

  // Prepare table data
  const tableData = logs.map((log) => [
    formatDate(log.timestamp),
    log.action.toUpperCase(),
    log.entityType,
    log.entityId || '-',
    log.userName || log.userId || '-',
    log.ipAddress || '-',
  ]);

  // Add table
  (doc as any).autoTable({
    head: [['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'IP Address']],
    body: tableData,
    startY: yPosition,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: (data: any) => {
      // Footer
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.internal.pages.length - 1}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    },
  });

  return doc;
}

export function downloadAuditLogPDF(
  logs: AuditLogForPDF[],
  filename: string = 'audit-logs.pdf',
  options?: AuditLogPDFOptions
): void {
  const doc = generateAuditLogPDF(logs, options);
  doc.save(filename);
}

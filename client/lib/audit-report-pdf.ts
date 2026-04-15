import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface AuditReportData {
  analytics: {
    eventsPerDay: Array<{
      date: string;
      count: number;
      create: number;
      update: number;
      delete: number;
      export: number;
      import: number;
      login: number;
      logout: number;
    }>;
    topUsers: Array<{
      userId: string;
      userName: string;
      count: number;
      percentage: number;
    }>;
    mostModifiedEntities: Array<{
      entityType: string;
      entityId: string;
      entityName: string;
      count: number;
      lastModified: Date;
    }>;
    totalEvents: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  auditLogs: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    entityName: string;
    status: string;
    createdAt: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

export function generateAuditReportPDF(data: AuditReportData): void {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Log Report', margin, yPosition);
  yPosition += 10;

  // Report metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const generatedDate = new Date().toLocaleString();
  doc.text(`Generated: ${generatedDate}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Date Range: ${data.analytics.dateRange.start} to ${data.analytics.dateRange.end}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Total Events: ${data.analytics.totalEvents}`, margin, yPosition);
  yPosition += 10;

  // Executive Summary Section
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Audit Events', data.analytics.totalEvents.toString()],
    ['Active Users', data.analytics.topUsers.length.toString()],
    ['Modified Entities', data.analytics.mostModifiedEntities.length.toString()],
    ['Date Range', `${data.analytics.dateRange.start} to ${data.analytics.dateRange.end}`],
    ['Report Generated', generatedDate],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      halign: 'left',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Top Users Section
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Users by Activity', margin, yPosition);
  yPosition += 8;

  const topUsersData = [
    ['User Name', 'Events', 'Percentage'],
    ...data.analytics.topUsers.slice(0, 10).map(user => [
      user.userName,
      user.count.toString(),
      `${user.percentage.toFixed(1)}%`,
    ]),
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [topUsersData[0]],
    body: topUsersData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Most Modified Entities Section
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Most Modified Entities', margin, yPosition);
  yPosition += 8;

  const entitiesData = [
    ['Entity Type', 'Entity Name', 'Modifications', 'Last Modified'],
    ...data.analytics.mostModifiedEntities.slice(0, 10).map(entity => [
      entity.entityType,
      entity.entityName,
      entity.count.toString(),
      new Date(entity.lastModified).toLocaleDateString(),
    ]),
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [entitiesData[0]],
    body: entitiesData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [46, 204, 113],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Daily Activity Section
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Activity Summary', margin, yPosition);
  yPosition += 8;

  const dailyActivityData = [
    ['Date', 'Total', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Login', 'Logout'],
    ...data.analytics.eventsPerDay.map(day => [
      day.date,
      day.count.toString(),
      day.create.toString(),
      day.update.toString(),
      day.delete.toString(),
      day.export.toString(),
      day.import.toString(),
      day.login.toString(),
      day.logout.toString(),
    ]),
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [dailyActivityData[0]],
    body: dailyActivityData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [155, 89, 182],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Detailed Audit Logs Section
  checkPageBreak(50);
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Audit Logs', margin, yPosition);
  yPosition += 8;

  const logsData = [
    ['Date/Time', 'User', 'Action', 'Entity Type', 'Entity Name', 'Status'],
    ...data.auditLogs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.userName,
      log.action,
      log.entityType,
      log.entityName || 'N/A',
      log.status,
    ]),
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [logsData[0]],
    body: logsData.slice(1),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 40 },
      5: { cellWidth: 20 },
    },
  });

  // Footer
  const totalPages = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `audit-report-${data.analytics.dateRange.start}-to-${data.analytics.dateRange.end}.pdf`;
  doc.save(fileName);
}

export function downloadAuditReport(data: AuditReportData): void {
  try {
    generateAuditReportPDF(data);
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw new Error('Failed to generate audit report PDF');
  }
}

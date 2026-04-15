import { db } from "./db";
import { emailHistory, emailDeliveryTracking, emailStatistics } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

/**
 * Email History Service
 * Handles logging, retrieval, and analytics for email history
 */

export interface LogEmailParams {
  templateType: "enquiry_assigned" | "enquiry_updated" | "enquiry_completed" | "team_message" | "system_alert";
  scenario?: string;
  subject: string;
  recipientEmail: string;
  recipientName?: string;
  senderUserId: number;
  status: "sent" | "failed" | "pending";
  errorMessage?: string;
  htmlSize?: number;
  textSize?: number;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EmailHistoryFilter {
  templateType?: string;
  scenario?: string;
  recipientEmail?: string;
  senderUserId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface EmailHistoryStats {
  totalSent: number;
  totalSuccessful: number;
  totalFailed: number;
  successRate: number;
  averageHtmlSize: number;
  averageTextSize: number;
  byTemplateType: Record<string, number>;
  byStatus: Record<string, number>;
  byScenario: Record<string, number>;
}

/**
 * Log an email to history
 */
export async function logEmail(params: LogEmailParams): Promise<number> {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const result = await db.insert(emailHistory).values({
    templateType: params.templateType,
    scenario: params.scenario,
    subject: params.subject,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    senderUserId: params.senderUserId,
    status: params.status,
    errorMessage: params.errorMessage,
    htmlSize: params.htmlSize,
    textSize: params.textSize,
    templateData: params.templateData,
    metadata: params.metadata,
    sentAt: new Date(),
  });

  return result[0].insertId;
}

/**
 * Get email history with filtering and pagination
 */
export async function getEmailHistory(filter: EmailHistoryFilter = {}) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const conditions = [];

  if (filter.templateType) {
    conditions.push(eq(emailHistory.templateType, filter.templateType as any));
  }

  if (filter.scenario) {
    conditions.push(eq(emailHistory.scenario, filter.scenario));
  }

  if (filter.recipientEmail) {
    conditions.push(eq(emailHistory.recipientEmail, filter.recipientEmail));
  }

  if (filter.senderUserId) {
    conditions.push(eq(emailHistory.senderUserId, filter.senderUserId));
  }

  if (filter.status) {
    conditions.push(eq(emailHistory.status, filter.status as any));
  }

  if (filter.startDate) {
    conditions.push(gte(emailHistory.sentAt, filter.startDate));
  }

  if (filter.endDate) {
    conditions.push(lte(emailHistory.sentAt, filter.endDate));
  }

  const query = db
    .select()
    .from(emailHistory)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(emailHistory.sentAt));

  if (filter.limit) {
    query.limit(filter.limit);
  }

  if (filter.offset) {
    query.offset(filter.offset);
  }

  return query;
}

/**
 * Get email history count
 */
export async function getEmailHistoryCount(filter: EmailHistoryFilter = {}): Promise<number> {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const conditions = [];

  if (filter.templateType) {
    conditions.push(eq(emailHistory.templateType, filter.templateType as any));
  }

  if (filter.scenario) {
    conditions.push(eq(emailHistory.scenario, filter.scenario));
  }

  if (filter.recipientEmail) {
    conditions.push(eq(emailHistory.recipientEmail, filter.recipientEmail));
  }

  if (filter.senderUserId) {
    conditions.push(eq(emailHistory.senderUserId, filter.senderUserId));
  }

  if (filter.status) {
    conditions.push(eq(emailHistory.status, filter.status as any));
  }

  if (filter.startDate) {
    conditions.push(gte(emailHistory.sentAt, filter.startDate));
  }

  if (filter.endDate) {
    conditions.push(lte(emailHistory.sentAt, filter.endDate));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(emailHistory)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count || 0;
}

/**
 * Get email by ID
 */
export async function getEmailById(id: number) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const result = await db.select().from(emailHistory).where(eq(emailHistory.id, id));

  return result[0] || null;
}

/**
 * Update email status
 */
export async function updateEmailStatus(
  id: number,
  status: "sent" | "failed" | "pending",
  errorMessage?: string
) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  await db
    .update(emailHistory)
    .set({
      status,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(emailHistory.id, id));
}

/**
 * Get email history statistics
 */
export async function getEmailHistoryStats(filter: EmailHistoryFilter = {}): Promise<EmailHistoryStats> {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const conditions = [];

  if (filter.templateType) {
    conditions.push(eq(emailHistory.templateType, filter.templateType as any));
  }

  if (filter.scenario) {
    conditions.push(eq(emailHistory.scenario, filter.scenario));
  }

  if (filter.startDate) {
    conditions.push(gte(emailHistory.sentAt, filter.startDate));
  }

  if (filter.endDate) {
    conditions.push(lte(emailHistory.sentAt, filter.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get all emails
  const allEmails = await db
    .select()
    .from(emailHistory)
    .where(whereClause);

  const totalSent = allEmails.length;
  const totalSuccessful = allEmails.filter((e) => e.status === "sent").length;
  const totalFailed = allEmails.filter((e) => e.status === "failed").length;
  const successRate = totalSent > 0 ? (totalSuccessful / totalSent) * 100 : 0;

  // Calculate size averages
  const validHtmlSizes = allEmails.filter((e) => e.htmlSize).map((e) => e.htmlSize || 0);
  const validTextSizes = allEmails.filter((e) => e.textSize).map((e) => e.textSize || 0);
  const averageHtmlSize =
    validHtmlSizes.length > 0 ? validHtmlSizes.reduce((a, b) => a + b, 0) / validHtmlSizes.length : 0;
  const averageTextSize =
    validTextSizes.length > 0 ? validTextSizes.reduce((a, b) => a + b, 0) / validTextSizes.length : 0;

  // Group by template type
  const byTemplateType: Record<string, number> = {};
  allEmails.forEach((email) => {
    byTemplateType[email.templateType] = (byTemplateType[email.templateType] || 0) + 1;
  });

  // Group by status
  const byStatus: Record<string, number> = {};
  allEmails.forEach((email) => {
    byStatus[email.status] = (byStatus[email.status] || 0) + 1;
  });

  // Group by scenario
  const byScenario: Record<string, number> = {};
  allEmails.forEach((email) => {
    if (email.scenario) {
      byScenario[email.scenario] = (byScenario[email.scenario] || 0) + 1;
    }
  });

  return {
    totalSent,
    totalSuccessful,
    totalFailed,
    successRate: Math.round(successRate * 100) / 100,
    averageHtmlSize: Math.round(averageHtmlSize),
    averageTextSize: Math.round(averageTextSize),
    byTemplateType,
    byStatus,
    byScenario,
  };
}

/**
 * Delete old email history (for cleanup)
 */
export async function deleteOldEmailHistory(daysOld: number): Promise<number> {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(emailHistory)
    .where(lte(emailHistory.createdAt, cutoffDate));

  return result.rowsAffected || 0;
}

/**
 * Get recent email history
 */
export async function getRecentEmailHistory(limit: number = 10) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  return db
    .select()
    .from(emailHistory)
    .orderBy(desc(emailHistory.sentAt))
    .limit(limit);
}

/**
 * Get email history by template type
 */
export async function getEmailHistoryByTemplateType(templateType: string, limit: number = 10) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  return db
    .select()
    .from(emailHistory)
    .where(eq(emailHistory.templateType, templateType as any))
    .orderBy(desc(emailHistory.sentAt))
    .limit(limit);
}

/**
 * Get email history by sender
 */
export async function getEmailHistoryBySender(senderUserId: number, limit: number = 10) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  return db
    .select()
    .from(emailHistory)
    .where(eq(emailHistory.senderUserId, senderUserId))
    .orderBy(desc(emailHistory.sentAt))
    .limit(limit);
}

/**
 * Get email history by recipient
 */
export async function getEmailHistoryByRecipient(recipientEmail: string, limit: number = 10) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  return db
    .select()
    .from(emailHistory)
    .where(eq(emailHistory.recipientEmail, recipientEmail))
    .orderBy(desc(emailHistory.sentAt))
    .limit(limit);
}

/**
 * Log delivery tracking
 */
export async function logDeliveryTracking(emailHistoryId: number, data: Record<string, any>) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const result = await db.insert(emailDeliveryTracking).values({
    emailHistoryId,
    deliveryStatus: data.status || "sent",
    bounceType: data.bounceType,
    bounceSubType: data.bounceSubType,
    complaintType: data.complaintType,
    opens: data.opens || 0,
    clicks: data.clicks || 0,
    lastOpenedAt: data.lastOpenedAt,
    lastClickedAt: data.lastClickedAt,
    firstOpenedAt: data.firstOpenedAt,
    firstClickedAt: data.firstClickedAt,
    trackingData: data,
  });

  return result[0].insertId;
}

/**
 * Get delivery tracking by email history ID
 */
export async function getDeliveryTracking(emailHistoryId: number) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const result = await db
    .select()
    .from(emailDeliveryTracking)
    .where(eq(emailDeliveryTracking.emailHistoryId, emailHistoryId));

  return result[0] || null;
}

/**
 * Update statistics for template type
 */
export async function updateEmailStatistics(templateType: string) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const stats = await getEmailHistoryStats({ templateType });

  const existing = await db
    .select()
    .from(emailStatistics)
    .where(eq(emailStatistics.templateType, templateType as any));

  if (existing.length > 0) {
    await db
      .update(emailStatistics)
      .set({
        totalSent: stats.totalSent,
        totalDelivered: stats.totalSuccessful,
        totalBounced: stats.totalFailed,
        openRate: 0, // Will be updated from delivery tracking
        clickRate: 0, // Will be updated from delivery tracking
        bounceRate: Math.round((stats.totalFailed / stats.totalSent) * 100 * 100) / 100,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emailStatistics.templateType, templateType as any));
  } else {
    await db.insert(emailStatistics).values({
      templateType: templateType as any,
      totalSent: stats.totalSent,
      totalDelivered: stats.totalSuccessful,
      totalBounced: stats.totalFailed,
      bounceRate: Math.round((stats.totalFailed / stats.totalSent) * 100 * 100) / 100,
      lastCalculatedAt: new Date(),
    });
  }
}

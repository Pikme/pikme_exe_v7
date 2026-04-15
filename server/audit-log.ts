import { getDb } from "./db";
import { adminAuditLogs } from "../drizzle/schema";
import { InsertAdminAuditLog } from "../drizzle/schema";
import { WebhookService } from "./webhook-service";

/**
 * Log an admin action to the audit log
 */
export async function logAdminAction(data: {
  userId: number;
  userName: string;
  userEmail?: string;
  action: "create" | "update" | "delete" | "view" | "export" | "import" | "login" | "logout";
  entityType: "tour" | "location" | "state" | "country" | "category" | "activity" | "attraction" | "user" | "system";
  entityId?: number;
  entityName?: string;
  description?: string;
  previousData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failed" | "pending";
  errorMessage?: string;
}): Promise<void> {
  try {
    // Log to console for debugging
    console.log("[AUDIT LOG]", {
      timestamp: new Date().toISOString(),
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      status: data.status || "success",
    });

    // Get database connection
    const db = await getDb();
    if (!db) {
      console.warn("[AUDIT LOG] Database connection not available");
      return;
    }

    // Insert into database
    await db.insert(adminAuditLogs).values({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      description: data.description,
      previousData: data.previousData ? JSON.stringify(data.previousData) : null,
      newData: data.newData ? JSON.stringify(data.newData) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || "success",
      errorMessage: data.errorMessage,
    });

    // Trigger webhooks for critical actions
    if (data.action === "delete" && data.entityType !== "view") {
      try {
        await WebhookService.triggerBulkDeleteAlert(
          data.userId.toString(),
          data.userName,
          data.entityType,
          1,
          data.entityId && data.entityName ? [{ id: data.entityId.toString(), name: data.entityName }] : [],
          data.ipAddress
        );
      } catch (webhookError) {
        console.error("[WEBHOOK ERROR] Failed to send delete alert:", webhookError);
      }
    } else if (data.action === "export") {
      try {
        await WebhookService.triggerBulkExportAlert(
          data.userId.toString(),
          data.userName,
          data.entityType,
          1,
          "json",
          data.ipAddress
        );
      } catch (webhookError) {
        console.error("[WEBHOOK ERROR] Failed to send export alert:", webhookError);
      }
    }
  } catch (error) {
    console.error("[AUDIT LOG ERROR]", error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(options: {
  limit?: number;
  offset?: number;
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    let query = db.select().from(adminAuditLogs);

    // Apply filters if provided
    if (options.userId) {
      query = query.where((col) => col.userId === options.userId);
    }
    if (options.action) {
      query = query.where((col) => col.action === options.action);
    }
    if (options.entityType) {
      query = query.where((col) => col.entityType === options.entityType);
    }
    if (options.startDate) {
      query = query.where((col) => col.createdAt >= options.startDate);
    }
    if (options.endDate) {
      query = query.where((col) => col.createdAt <= options.endDate);
    }

    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    query = query.limit(limit).offset(offset);

    // Order by most recent first
    query = query.orderBy((col) => col.createdAt, "desc");

    const result = await query;
    return result;
  } catch (error) {
    console.error("[GET AUDIT LOGS ERROR]", error);
    return [];
  }
}

/**
 * Get audit log count
 */
export async function getAuditLogCount(options?: {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    let query = db.select().from(adminAuditLogs);

    // Apply filters if provided
    if (options?.userId) {
      query = query.where((col) => col.userId === options.userId);
    }
    if (options?.action) {
      query = query.where((col) => col.action === options.action);
    }
    if (options?.entityType) {
      query = query.where((col) => col.entityType === options.entityType);
    }
    if (options?.startDate) {
      query = query.where((col) => col.createdAt >= options.startDate);
    }
    if (options?.endDate) {
      query = query.where((col) => col.createdAt <= options.endDate);
    }

    const result = await query;
    return result.length;
  } catch (error) {
    console.error("[GET AUDIT LOG COUNT ERROR]", error);
    return 0;
  }
}

/**
 * Export audit logs to CSV format
 */
export async function exportAuditLogsToCSV(options?: {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<string> {
  try {
    const logs = await getAuditLogs({
      limit: 10000, // Get all logs for export
      offset: 0,
      ...options,
    });

    if (logs.length === 0) {
      return "No audit logs found";
    }

    // Create CSV header
    const headers = [
      "ID",
      "User ID",
      "User Name",
      "User Email",
      "Action",
      "Entity Type",
      "Entity ID",
      "Entity Name",
      "Description",
      "Status",
      "Error Message",
      "Created At",
    ];

    // Create CSV rows
    const rows = logs.map((log) => [
      log.id,
      log.userId,
      escapeCSV(log.userName),
      escapeCSV(log.userEmail || ""),
      log.action,
      log.entityType,
      log.entityId || "",
      escapeCSV(log.entityName || ""),
      escapeCSV(log.description || ""),
      log.status,
      escapeCSV(log.errorMessage || ""),
      new Date(log.createdAt).toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  } catch (error) {
    console.error("[EXPORT AUDIT LOGS ERROR]", error);
    return "Error exporting audit logs";
  }
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
  if (!value) return '""';
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

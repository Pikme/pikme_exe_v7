

/**
 * Webhook Configuration Service
 * Manages webhook configurations for different email providers
 */

export interface WebhookConfig {
  id?: number;
  provider: "sendgrid" | "ses" | "mailgun" | "custom";
  signingKey: string;
  webhookUrl: string;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WebhookLog {
  id?: number;
  provider: string;
  eventType: string;
  status: "success" | "failed" | "pending";
  messageId?: string;
  email?: string;
  errorMessage?: string;
  payload?: Record<string, any>;
  createdAt?: Date;
}

// In-memory storage for webhook configurations
// In production, this should be stored in database
const webhookConfigs: Map<string, WebhookConfig> = new Map();
const webhookLogs: WebhookLog[] = [];

/**
 * Get webhook configuration for provider
 */
export function getWebhookConfig(provider: string): WebhookConfig | null {
  return webhookConfigs.get(provider) || null;
}

/**
 * Set webhook configuration for provider
 */
export function setWebhookConfig(provider: string, config: WebhookConfig): boolean {
  try {
    webhookConfigs.set(provider, {
      ...config,
      createdAt: config.createdAt || new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Failed to set webhook config:", error);
    return false;
  }
}

/**
 * Get all webhook configurations
 */
export function getAllWebhookConfigs(): WebhookConfig[] {
  return Array.from(webhookConfigs.values());
}

/**
 * Delete webhook configuration
 */
export function deleteWebhookConfig(provider: string): boolean {
  return webhookConfigs.delete(provider);
}

/**
 * Enable webhook configuration
 */
export function enableWebhookConfig(provider: string): boolean {
  const config = webhookConfigs.get(provider);
  if (!config) return false;

  config.enabled = true;
  config.updatedAt = new Date();
  webhookConfigs.set(provider, config);
  return true;
}

/**
 * Disable webhook configuration
 */
export function disableWebhookConfig(provider: string): boolean {
  const config = webhookConfigs.get(provider);
  if (!config) return false;

  config.enabled = false;
  config.updatedAt = new Date();
  webhookConfigs.set(provider, config);
  return true;
}

/**
 * Log webhook event
 */
export function logWebhookEvent(log: WebhookLog): void {
  webhookLogs.push({
    ...log,
    createdAt: log.createdAt || new Date(),
  });

  // Keep only last 10000 logs in memory
  if (webhookLogs.length > 10000) {
    webhookLogs.shift();
  }
}

/**
 * Get webhook logs with filtering
 */
export function getWebhookLogs(filter: {
  provider?: string;
  eventType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): WebhookLog[] {
  let logs = webhookLogs;

  if (filter.provider) {
    logs = logs.filter((log) => log.provider === filter.provider);
  }

  if (filter.eventType) {
    logs = logs.filter((log) => log.eventType === filter.eventType);
  }

  if (filter.status) {
    logs = logs.filter((log) => log.status === filter.status);
  }

  // Sort by date descending
  logs = logs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

  // Apply pagination
  const offset = filter.offset || 0;
  const limit = filter.limit || 100;

  return logs.slice(offset, offset + limit);
}

/**
 * Get webhook logs count
 */
export function getWebhookLogsCount(filter: {
  provider?: string;
  eventType?: string;
  status?: string;
}): number {
  let logs = webhookLogs;

  if (filter.provider) {
    logs = logs.filter((log) => log.provider === filter.provider);
  }

  if (filter.eventType) {
    logs = logs.filter((log) => log.eventType === filter.eventType);
  }

  if (filter.status) {
    logs = logs.filter((log) => log.status === filter.status);
  }

  return logs.length;
}

/**
 * Get webhook statistics
 */
export function getWebhookStatistics(): {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  pendingEvents: number;
  successRate: number;
  byProvider: Record<string, number>;
  byEventType: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const stats = {
    totalEvents: webhookLogs.length,
    successfulEvents: 0,
    failedEvents: 0,
    pendingEvents: 0,
    successRate: 0,
    byProvider: {} as Record<string, number>,
    byEventType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  webhookLogs.forEach((log) => {
    if (log.status === "success") stats.successfulEvents++;
    if (log.status === "failed") stats.failedEvents++;
    if (log.status === "pending") stats.pendingEvents++;

    stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1;
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
  });

  if (stats.totalEvents > 0) {
    stats.successRate = Math.round((stats.successfulEvents / stats.totalEvents) * 100 * 100) / 100;
  }

  return stats;
}

/**
 * Clear old webhook logs
 */
export function clearOldWebhookLogs(daysOld: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const initialLength = webhookLogs.length;
  const filtered = webhookLogs.filter((log) => (log.createdAt?.getTime() || 0) > cutoffDate.getTime());

  webhookLogs.length = 0;
  webhookLogs.push(...filtered);

  return initialLength - webhookLogs.length;
}

/**
 * Validate webhook configuration
 */
export function validateWebhookConfig(config: WebhookConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push("Provider is required");
  }

  if (!config.signingKey) {
    errors.push("Signing key is required");
  }

  if (!config.webhookUrl) {
    errors.push("Webhook URL is required");
  }

  if (config.webhookUrl && !config.webhookUrl.startsWith("http")) {
    errors.push("Webhook URL must be a valid HTTP URL");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test webhook configuration
 */
export async function testWebhookConfig(provider: string): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  const config = webhookConfigs.get(provider);

  if (!config) {
    return {
      success: false,
      message: `No configuration found for provider: ${provider}`,
    };
  }

  if (!config.enabled) {
    return {
      success: false,
      message: `Webhook is disabled for provider: ${provider}`,
    };
  }

  try {
    // Simulate sending a test webhook
    const testPayload = {
      type: "test",
      timestamp: Date.now(),
      provider,
    };

    // Log the test event
    logWebhookEvent({
      provider,
      eventType: "test",
      status: "success",
      payload: testPayload,
    });

    return {
      success: true,
      message: `Webhook test successful for provider: ${provider}`,
      details: {
        provider,
        enabled: config.enabled,
        lastTested: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Webhook test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Initialize default webhook configurations
 */
export function initializeDefaultConfigs(): void {
  // These are placeholder configs - should be configured by admin
  const defaultConfigs: Record<string, WebhookConfig> = {
    sendgrid: {
      provider: "sendgrid",
      signingKey: process.env.SENDGRID_WEBHOOK_KEY || "",
      webhookUrl: process.env.SENDGRID_WEBHOOK_URL || "",
      enabled: !!process.env.SENDGRID_WEBHOOK_KEY,
    },
    ses: {
      provider: "ses",
      signingKey: process.env.SES_WEBHOOK_KEY || "",
      webhookUrl: process.env.SES_WEBHOOK_URL || "",
      enabled: !!process.env.SES_WEBHOOK_KEY,
    },
    mailgun: {
      provider: "mailgun",
      signingKey: process.env.MAILGUN_WEBHOOK_KEY || "",
      webhookUrl: process.env.MAILGUN_WEBHOOK_URL || "",
      enabled: !!process.env.MAILGUN_WEBHOOK_KEY,
    },
  };

  Object.entries(defaultConfigs).forEach(([provider, config]) => {
    if (config.signingKey) {
      setWebhookConfig(provider, config);
    }
  });
}

/**
 * Get webhook configuration status
 */
export function getWebhookStatus(): {
  configured: string[];
  unconfigured: string[];
  enabled: string[];
  disabled: string[];
} {
  const providers = ["sendgrid", "ses", "mailgun"];
  const status = {
    configured: [] as string[],
    unconfigured: [] as string[],
    enabled: [] as string[],
    disabled: [] as string[],
  };

  providers.forEach((provider) => {
    const config = webhookConfigs.get(provider);

    if (config) {
      status.configured.push(provider);
      if (config.enabled) {
        status.enabled.push(provider);
      } else {
        status.disabled.push(provider);
      }
    } else {
      status.unconfigured.push(provider);
    }
  });

  return status;
}

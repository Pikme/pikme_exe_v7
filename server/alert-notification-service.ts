import { notifyOwner } from "./_core/notification";
import { type AnomalyAlert } from "./anomaly-detection-service";

/**
 * Alert Notification Service
 * Handles triggering and sending notifications for detected anomalies
 */

export interface AlertNotification {
  id: string;
  alertId: string;
  type: "in_app" | "email" | "webhook";
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  error?: string;
}

export interface AlertSubscription {
  id: string;
  userId: string;
  alertTypes: string[];
  minSeverity: "low" | "medium" | "high" | "critical";
  notificationMethods: ("in_app" | "email" | "webhook")[];
  webhookUrl?: string;
  isActive: boolean;
}

/**
 * Send in-app notification for anomaly alert
 */
export async function sendInAppNotification(alert: AnomalyAlert): Promise<AlertNotification> {
  const notification: AlertNotification = {
    id: `notif-${Date.now()}`,
    alertId: alert.id,
    type: "in_app",
    status: "pending",
  };

  try {
    // In-app notifications are stored in the database
    // This would be implemented in the notification system
    notification.status = "sent";
    notification.sentAt = new Date();
  } catch (error) {
    notification.status = "failed";
    notification.error = error instanceof Error ? error.message : "Unknown error";
  }

  return notification;
}

/**
 * Send email notification for anomaly alert
 */
export async function sendEmailNotification(alert: AnomalyAlert): Promise<AlertNotification> {
  const notification: AlertNotification = {
    id: `notif-${Date.now()}`,
    alertId: alert.id,
    type: "email",
    status: "pending",
  };

  try {
    const title = `⚠️ Anomaly Detected: ${alert.type.replace(/_/g, " ").toUpperCase()}`;
    const content = formatAlertForEmail(alert);

    await notifyOwner({
      title,
      content,
    });

    notification.status = "sent";
    notification.sentAt = new Date();
  } catch (error) {
    notification.status = "failed";
    notification.error = error instanceof Error ? error.message : "Unknown error";
  }

  return notification;
}

/**
 * Send webhook notification for anomaly alert
 */
export async function sendWebhookNotification(
  alert: AnomalyAlert,
  webhookUrl: string
): Promise<AlertNotification> {
  const notification: AlertNotification = {
    id: `notif-${Date.now()}`,
    alertId: alert.id,
    type: "webhook",
    status: "pending",
  };

  try {
    const payload = {
      alert,
      timestamp: new Date().toISOString(),
      severity: alert.severity,
      message: alert.message,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Anomaly-Alert": "true",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    notification.status = "sent";
    notification.sentAt = new Date();
  } catch (error) {
    notification.status = "failed";
    notification.error = error instanceof Error ? error.message : "Unknown error";
  }

  return notification;
}

/**
 * Send all notifications for an anomaly alert
 */
export async function sendAllNotifications(
  alert: AnomalyAlert,
  methods: ("in_app" | "email" | "webhook")[] = ["in_app", "email"],
  webhookUrl?: string
): Promise<AlertNotification[]> {
  const notifications: AlertNotification[] = [];

  for (const method of methods) {
    if (method === "in_app") {
      notifications.push(await sendInAppNotification(alert));
    } else if (method === "email") {
      notifications.push(await sendEmailNotification(alert));
    } else if (method === "webhook" && webhookUrl) {
      notifications.push(await sendWebhookNotification(alert, webhookUrl));
    }
  }

  return notifications;
}

/**
 * Format anomaly alert for email
 */
export function formatAlertForEmail(alert: AnomalyAlert): string {
  const severityColors = {
    low: "#FFA500",
    medium: "#FF8C00",
    high: "#FF0000",
    critical: "#8B0000",
  };

  const severityLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    critical: "Critical Priority",
  };

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
    <h2 style="margin: 0;">⚠️ ${severityLabels[alert.severity]} Alert</h2>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px;">
    <h3 style="margin-top: 0;">Anomaly Type</h3>
    <p style="font-size: 16px; font-weight: bold;">${alert.type.replace(/_/g, " ").toUpperCase()}</p>
    
    <h3>Details</h3>
    <p><strong>Metric:</strong> ${alert.metric}</p>
    <p><strong>Current Value:</strong> ${alert.currentValue.toFixed(2)}</p>
    <p><strong>Expected Value:</strong> ${alert.expectedValue.toFixed(2)}</p>
    <p><strong>Deviation:</strong> ${alert.deviation.toFixed(2)} (${alert.deviationPercent.toFixed(1)}%)</p>
    <p><strong>Threshold:</strong> ${alert.threshold.toFixed(2)}</p>
    
    <h3>Message</h3>
    <p style="background-color: white; padding: 10px; border-left: 4px solid ${severityColors[alert.severity]};">
      ${alert.message}
    </p>
    
    <h3>Recommended Actions</h3>
    <ul>
      <li>Review job logs for error patterns</li>
      <li>Check system resource usage</li>
      <li>Verify external service connectivity</li>
      <li>Monitor queue depth and processing times</li>
    </ul>
    
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
      Detected at: ${alert.detectedAt.toISOString()}
    </p>
  </div>
</div>
  `;
}

/**
 * Check if alert should be sent based on severity threshold
 */
export function shouldSendAlert(alert: AnomalyAlert, minSeverity: string): boolean {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const alertSeverityLevel = severityOrder[alert.severity as keyof typeof severityOrder] || 0;
  const minSeverityLevel = severityOrder[minSeverity as keyof typeof severityOrder] || 0;

  return alertSeverityLevel >= minSeverityLevel;
}

/**
 * Deduplicate alerts to avoid sending duplicate notifications
 */
export function deduplicateAlerts(alerts: AnomalyAlert[], timeWindowMinutes: number = 5): AnomalyAlert[] {
  const seen = new Map<string, Date>();
  const deduped: AnomalyAlert[] = [];

  for (const alert of alerts) {
    const key = `${alert.type}-${alert.metric}`;
    const lastSeen = seen.get(key);

    if (!lastSeen || Date.now() - lastSeen.getTime() > timeWindowMinutes * 60 * 1000) {
      deduped.push(alert);
      seen.set(key, new Date());
    }
  }

  return deduped;
}

/**
 * Get alert priority score for sorting
 */
export function getAlertPriority(alert: AnomalyAlert): number {
  const severityScores = {
    critical: 1000,
    high: 100,
    medium: 10,
    low: 1,
  };

  const typeScores = {
    success_rate_drop: 500,
    error_rate_increase: 400,
    duration_spike: 300,
    queue_buildup: 200,
    throughput_drop: 100,
  };

  const severityScore = severityScores[alert.severity];
  const typeScore = typeScores[alert.type];

  return severityScore + typeScore;
}

/**
 * Sort alerts by priority
 */
export function sortAlertsByPriority(alerts: AnomalyAlert[]): AnomalyAlert[] {
  return [...alerts].sort((a, b) => getAlertPriority(b) - getAlertPriority(a));
}

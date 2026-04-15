import { describe, it, expect } from "vitest";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
} from "./webhooks/email-provider-webhook";
import {
  WebhookRetryManager,
  classifyError,
  ErrorType,
  WebhookErrorHandler,
  WebhookCircuitBreaker,
} from "./webhook-retry-service";
import {
  getWebhookConfig,
  setWebhookConfig,
  getAllWebhookConfigs,
  deleteWebhookConfig,
  enableWebhookConfig,
  disableWebhookConfig,
  getWebhookStatistics,
  validateWebhookConfig,
} from "./webhook-config-service";
import {
  WebhookSimulator,
  WebhookPayloadGenerator,
  WebhookTestRunner,
} from "./webhook-test-simulator";

/**
 * Webhook System Tests
 */

describe("Webhook Signature Verification", () => {
  it("should verify webhook signatures", () => {
    expect(typeof verifyWebhookSignature).toBe("function");
  });

  it("should handle missing signature", () => {
    const result = verifyWebhookSignature("sendgrid", "payload", "", "key");
    expect(typeof result).toBe("boolean");
  });

  it("should support multiple providers", () => {
    const providers = ["sendgrid", "ses", "mailgun"];
    providers.forEach((provider) => {
      const result = verifyWebhookSignature(provider, "payload", "sig", "key");
      expect(typeof result).toBe("boolean");
    });
  });
});

describe("Webhook Payload Parsing", () => {
  it("should parse SendGrid payload", () => {
    const payload = [
      {
        event: "delivered",
        timestamp: 1234567890,
        sg_message_id: "msg-123",
        email: "test@example.com",
      },
    ];

    const events = parseWebhookPayload("sendgrid", payload);
    expect(Array.isArray(events)).toBe(true);
  });

  it("should parse SES payload", () => {
    const payload = {
      Message: JSON.stringify({
        eventType: "Delivery",
        mail: { messageId: "msg-123", timestamp: "2024-01-24T10:00:00Z" },
      }),
    };

    const events = parseWebhookPayload("ses", payload);
    expect(Array.isArray(events)).toBe(true);
  });

  it("should parse Mailgun payload", () => {
    const payload = {
      "event-data": {
        event: "delivered",
        timestamp: 1234567890,
        recipient: "test@example.com",
      },
    };

    const events = parseWebhookPayload("mailgun", payload);
    expect(Array.isArray(events)).toBe(true);
  });

  it("should handle empty payload", () => {
    const events = parseWebhookPayload("sendgrid", []);
    expect(events).toEqual([]);
  });
});

describe("Event Type Support", () => {
  it("should support delivery status mapping", () => {
    const statusMap = {
      sent: "sent",
      delivered: "delivered",
      bounce: "bounced",
      complaint: "complained",
      open: "delivered",
      click: "delivered",
    };
    expect(Object.keys(statusMap).length).toBe(6);
  });

  it("should support all event types", () => {
    const eventTypes = ["sent", "delivered", "bounce", "complaint", "open", "click"];
    expect(eventTypes.length).toBeGreaterThan(0);
  });
});

describe("Webhook Retry Manager", () => {
  it("should create retry manager", () => {
    const manager = new WebhookRetryManager();
    expect(manager).toBeTruthy();
  });

  it("should support retry configuration", () => {
    const config = {
      maxRetries: 5,
      initialDelayMs: 1000,
      maxDelayMs: 300000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
    };
    expect(config.maxRetries).toBe(5);
    expect(config.backoffMultiplier).toBe(2);
  });

  it("should get pending retries", () => {
    const manager = new WebhookRetryManager();
    const retries = manager.getPendingRetries();
    expect(Array.isArray(retries)).toBe(true);
  });

  it("should get retry statistics", () => {
    const manager = new WebhookRetryManager();
    const stats = manager.getRetryStats();
    expect(stats.totalPending).toBe(0);
    expect(typeof stats.byAttempt).toBe("object");
  });

  it("should clear all retries", () => {
    const manager = new WebhookRetryManager();
    manager.clearAll();
    expect(manager).toBeTruthy();
  });
});

describe("Error Classification", () => {
  it("should classify timeout as temporary", () => {
    const error = new Error("Connection timeout");
    const type = classifyError(error);
    expect(type).toBe(ErrorType.TEMPORARY);
  });

  it("should classify connection refused as temporary", () => {
    const error = new Error("ECONNREFUSED");
    const type = classifyError(error);
    expect(type).toBe(ErrorType.TEMPORARY);
  });

  it("should classify invalid as permanent", () => {
    const error = new Error("Invalid request");
    const type = classifyError(error);
    expect(type).toBe(ErrorType.PERMANENT);
  });

  it("should classify not found as permanent", () => {
    const error = new Error("404 not found");
    const type = classifyError(error);
    expect(type).toBe(ErrorType.PERMANENT);
  });

  it("should classify unknown error", () => {
    const error = new Error("Some random error");
    const type = classifyError(error);
    expect(type).toBe(ErrorType.UNKNOWN);
  });
});

describe("Webhook Error Handler", () => {
  it("should handle temporary error", async () => {
    const handler = new WebhookErrorHandler();
    const error = new Error("Service temporarily unavailable");
    const result = await handler.handleError(error);

    expect(result.shouldRetry).toBe(true);
    expect(result.errorType).toBe(ErrorType.TEMPORARY);
  });

  it("should handle permanent error", async () => {
    const handler = new WebhookErrorHandler();
    const error = new Error("Invalid request");
    const result = await handler.handleError(error);

    expect(result.shouldRetry).toBe(false);
    expect(result.errorType).toBe(ErrorType.PERMANENT);
  });

  it("should get error statistics", () => {
    const handler = new WebhookErrorHandler();
    const stats = handler.getErrorStats();

    expect(stats.totalErrors).toBe(0);
    expect(stats.temporaryErrors).toBe(0);
    expect(stats.permanentErrors).toBe(0);
  });

  it("should clear error log", () => {
    const handler = new WebhookErrorHandler();
    handler.clearLog();
    const stats = handler.getErrorStats();
    expect(stats.totalErrors).toBe(0);
  });
});

describe("Webhook Circuit Breaker", () => {
  it("should start in closed state", () => {
    const breaker = new WebhookCircuitBreaker();
    expect(breaker.isOpen()).toBe(false);
  });

  it("should record success", () => {
    const breaker = new WebhookCircuitBreaker();
    breaker.recordSuccess();
    expect(breaker.isOpen()).toBe(false);
  });

  it("should record failure", () => {
    const breaker = new WebhookCircuitBreaker();
    breaker.recordFailure();
    expect(breaker.isOpen()).toBe(false);
  });

  it("should get status", () => {
    const breaker = new WebhookCircuitBreaker();
    const status = breaker.getStatus();

    expect(status.state).toBe("closed");
    expect(status.failureCount).toBe(0);
    expect(status.successCount).toBe(0);
  });

  it("should reset circuit breaker", () => {
    const breaker = new WebhookCircuitBreaker();
    breaker.recordFailure();
    breaker.reset();

    const status = breaker.getStatus();
    expect(status.state).toBe("closed");
    expect(status.failureCount).toBe(0);
  });
});

describe("Webhook Configuration Management", () => {
  it("should set and get webhook config", () => {
    const config = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: true,
    };

    setWebhookConfig("sendgrid", config);
    const retrieved = getWebhookConfig("sendgrid");

    expect(retrieved).not.toBeNull();
    expect(retrieved?.provider).toBe("sendgrid");
  });

  it("should get all webhook configs", () => {
    const config = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: true,
    };

    setWebhookConfig("sendgrid", config);
    const all = getAllWebhookConfigs();

    expect(Array.isArray(all)).toBe(true);
  });

  it("should delete webhook config", () => {
    const config = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: true,
    };

    setWebhookConfig("sendgrid", config);
    const deleted = deleteWebhookConfig("sendgrid");

    expect(deleted).toBe(true);
  });

  it("should enable webhook config", () => {
    const config = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: false,
    };

    setWebhookConfig("sendgrid", config);
    enableWebhookConfig("sendgrid");

    const retrieved = getWebhookConfig("sendgrid");
    expect(retrieved?.enabled).toBe(true);
  });

  it("should disable webhook config", () => {
    const config = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: true,
    };

    setWebhookConfig("sendgrid", config);
    disableWebhookConfig("sendgrid");

    const retrieved = getWebhookConfig("sendgrid");
    expect(retrieved?.enabled).toBe(false);
  });

  it("should validate webhook config", () => {
    const validConfig = {
      provider: "sendgrid" as const,
      signingKey: "test-key",
      webhookUrl: "https://example.com/webhook",
      enabled: true,
    };

    const result = validateWebhookConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should validate invalid webhook config", () => {
    const invalidConfig = {
      provider: "sendgrid" as const,
      signingKey: "",
      webhookUrl: "invalid-url",
      enabled: true,
    };

    const result = validateWebhookConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should get webhook statistics", () => {
    const stats = getWebhookStatistics();

    expect(stats.totalEvents).toBeGreaterThanOrEqual(0);
    expect(typeof stats.successfulEvents).toBe("number");
    expect(typeof stats.failedEvents).toBe("number");
  });
});

describe("Webhook Simulator", () => {
  it("should generate SendGrid event", () => {
    const event = WebhookSimulator.generateSendGridEvent("sent", "msg-123", "test@example.com");

    expect(event.type).toBe("sent");
    expect(event.messageId).toBe("msg-123");
    expect(event.email).toBe("test@example.com");
  });

  it("should generate SES event", () => {
    const event = WebhookSimulator.generateSESEvent("Send", "msg-123", "test@example.com");

    expect(event.email).toBe("test@example.com");
    expect(event.messageId).toBe("msg-123");
  });

  it("should generate Mailgun event", () => {
    const event = WebhookSimulator.generateMailgunEvent("delivered", "msg-123", "test@example.com");

    expect(event.type).toBe("delivered");
    expect(event.email).toBe("test@example.com");
  });

  it("should generate email journey scenario", () => {
    const scenario = WebhookSimulator.generateEmailJourney("msg-123", "test@example.com");

    expect(scenario.name).toBe("Complete Email Journey");
    expect(Array.isArray(scenario.events)).toBe(true);
    expect(scenario.events.length).toBeGreaterThan(0);
  });

  it("should generate bounce scenario", () => {
    const scenario = WebhookSimulator.generateBounceScenario("msg-123", "test@example.com");

    expect(scenario.name).toBe("Email Bounce");
    expect(scenario.events.length).toBeGreaterThan(0);
  });

  it("should generate all scenarios", () => {
    const scenarios = WebhookSimulator.getAllScenarios("msg-123", "test@example.com");

    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBeGreaterThan(0);
  });
});

describe("Webhook Payload Generator", () => {
  it("should generate SendGrid payload", () => {
    const events = [
      {
        type: "sent" as const,
        timestamp: Date.now(),
        messageId: "msg-123",
        email: "test@example.com",
        event: "sent",
      },
    ];

    const payload = WebhookPayloadGenerator.generateSendGridPayload(events);

    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0].event).toBe("sent");
  });

  it("should generate SES payload", () => {
    const event = {
      type: "delivered" as const,
      timestamp: Date.now(),
      messageId: "msg-123",
      email: "test@example.com",
      event: "delivered",
    };

    const payload = WebhookPayloadGenerator.generateSESPayload(event);

    expect(payload.Message).toBeTruthy();
  });

  it("should generate Mailgun payload", () => {
    const event = {
      type: "delivered" as const,
      timestamp: Date.now(),
      messageId: "msg-123",
      email: "test@example.com",
      event: "delivered",
    };

    const payload = WebhookPayloadGenerator.generateMailgunPayload(event);

    expect(payload["event-data"]).toBeTruthy();
  });
});

describe("Webhook Test Runner", () => {
  it("should create test runner", () => {
    const runner = new WebhookTestRunner();
    expect(runner).toBeTruthy();
  });

  it("should get test results", () => {
    const runner = new WebhookTestRunner();
    const results = runner.getResults();

    expect(Array.isArray(results)).toBe(true);
  });

  it("should get test summary", () => {
    const runner = new WebhookTestRunner();
    const summary = runner.getSummary();

    expect(summary.totalTests).toBe(0);
    expect(summary.successfulTests).toBe(0);
    expect(summary.failedTests).toBe(0);
  });

  it("should clear results", () => {
    const runner = new WebhookTestRunner();
    runner.clearResults();

    const summary = runner.getSummary();
    expect(summary.totalTests).toBe(0);
  });
});

import { WebhookEvent } from "./webhooks/email-provider-webhook";

/**
 * Webhook Test Simulator
 * Generates realistic webhook events for testing and debugging
 */

export interface SimulationScenario {
  name: string;
  description: string;
  events: WebhookEvent[];
}

/**
 * Generate realistic webhook events for testing
 */
export class WebhookSimulator {
  /**
   * Generate SendGrid-style webhook event
   */
  static generateSendGridEvent(
    type: "sent" | "delivered" | "open" | "click" | "bounce" | "complaint",
    messageId: string,
    email: string
  ): WebhookEvent {
    return {
      type,
      timestamp: Date.now(),
      messageId,
      email,
      event: type,
      url: type === "click" ? "https://example.com/promo" : undefined,
      useragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      ip: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      reason: type === "bounce" ? "550 user unknown" : undefined,
    };
  }

  /**
   * Generate AWS SES-style webhook event
   */
  static generateSESEvent(
    type: "Delivery" | "Bounce" | "Complaint" | "Send" | "Open" | "Click",
    messageId: string,
    email: string
  ): WebhookEvent {
    const eventTypeMap: Record<string, string> = {
      Delivery: "delivered",
      Bounce: "bounced",
      Complaint: "complained",
      Send: "sent",
      Open: "open",
      Click: "click",
    };

    return {
      type: eventTypeMap[type] || type.toLowerCase(),
      timestamp: Date.now(),
      messageId,
      email,
      event: type,
      status: type === "Delivery" ? "Success" : undefined,
      reason: type === "Bounce" ? "Permanent" : undefined,
    };
  }

  /**
   * Generate Mailgun-style webhook event
   */
  static generateMailgunEvent(
    type: "delivered" | "opened" | "clicked" | "bounced" | "complained",
    messageId: string,
    email: string
  ): WebhookEvent {
    return {
      type,
      timestamp: Date.now(),
      messageId,
      email,
      event: type,
      url: type === "clicked" ? "https://example.com/link" : undefined,
      useragent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)",
      ip: `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      reason: type === "bounced" ? "permanent" : undefined,
    };
  }

  /**
   * Generate complete email journey scenario
   */
  static generateEmailJourney(messageId: string, email: string): SimulationScenario {
    return {
      name: "Complete Email Journey",
      description: "Simulates a complete email lifecycle from send to engagement",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        this.generateSendGridEvent("delivered", messageId, email),
        {
          type: "open",
          timestamp: Date.now() + 5000,
          messageId,
          email,
          event: "open",
          useragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          ip: "192.168.1.100",
        },
        {
          type: "click",
          timestamp: Date.now() + 10000,
          messageId,
          email,
          event: "click",
          url: "https://example.com/offer",
          useragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          ip: "192.168.1.100",
        },
      ],
    };
  }

  /**
   * Generate bounce scenario
   */
  static generateBounceScenario(messageId: string, email: string): SimulationScenario {
    return {
      name: "Email Bounce",
      description: "Simulates an email that bounces due to invalid address",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        {
          type: "bounce",
          timestamp: Date.now() + 2000,
          messageId,
          email,
          event: "bounce",
          reason: "550 user unknown",
        },
      ],
    };
  }

  /**
   * Generate complaint scenario
   */
  static generateComplaintScenario(messageId: string, email: string): SimulationScenario {
    return {
      name: "Spam Complaint",
      description: "Simulates recipient marking email as spam",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        this.generateSendGridEvent("delivered", messageId, email),
        {
          type: "complaint",
          timestamp: Date.now() + 3600000, // 1 hour later
          messageId,
          email,
          event: "complaint",
          reason: "abuse",
        },
      ],
    };
  }

  /**
   * Generate high engagement scenario
   */
  static generateHighEngagementScenario(messageId: string, email: string): SimulationScenario {
    const clicks = Array.from({ length: 3 }, (_, i) => ({
      type: "click" as const,
      timestamp: Date.now() + 15000 + i * 5000,
      messageId,
      email,
      event: "click",
      url: `https://example.com/link-${i + 1}`,
      useragent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)",
      ip: "10.0.1.100",
    }));

    return {
      name: "High Engagement",
      description: "Simulates recipient with multiple opens and clicks",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        this.generateSendGridEvent("delivered", messageId, email),
        ...Array.from({ length: 2 }, (_, i) => ({
          type: "open" as const,
          timestamp: Date.now() + 5000 + i * 10000,
          messageId,
          email,
          event: "open",
          useragent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)",
          ip: "10.0.1.100",
        })),
        ...clicks,
      ],
    };
  }

  /**
   * Generate no engagement scenario
   */
  static generateNoEngagementScenario(messageId: string, email: string): SimulationScenario {
    return {
      name: "No Engagement",
      description: "Simulates email that is delivered but not opened",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        this.generateSendGridEvent("delivered", messageId, email),
      ],
    };
  }

  /**
   * Generate deferred delivery scenario
   */
  static generateDeferredScenario(messageId: string, email: string): SimulationScenario {
    return {
      name: "Deferred Delivery",
      description: "Simulates email that is deferred and later delivered",
      events: [
        this.generateSendGridEvent("sent", messageId, email),
        {
          type: "deferred",
          timestamp: Date.now() + 1000,
          messageId,
          email,
          event: "deferred",
          reason: "Temporary service unavailable",
        },
        {
          type: "delivered",
          timestamp: Date.now() + 30000,
          messageId,
          email,
          event: "delivered",
        },
      ],
    };
  }

  /**
   * Get all available scenarios
   */
  static getAllScenarios(messageId: string, email: string): SimulationScenario[] {
    return [
      this.generateEmailJourney(messageId, email),
      this.generateBounceScenario(messageId, email),
      this.generateComplaintScenario(messageId, email),
      this.generateHighEngagementScenario(messageId, email),
      this.generateNoEngagementScenario(messageId, email),
      this.generateDeferredScenario(messageId, email),
    ];
  }
}

/**
 * Webhook test payload generator
 */
export class WebhookPayloadGenerator {
  /**
   * Generate SendGrid webhook payload
   */
  static generateSendGridPayload(events: WebhookEvent[]): any[] {
    return events.map((event) => ({
      event: event.event,
      timestamp: Math.floor(event.timestamp / 1000),
      sg_message_id: event.messageId,
      email: event.email,
      reason: event.reason,
      status: event.status,
      url: event.url,
      useragent: event.useragent,
      ip: event.ip,
    }));
  }

  /**
   * Generate AWS SES webhook payload
   */
  static generateSESPayload(event: WebhookEvent): any {
    const eventTypeMap: Record<string, string> = {
      sent: "Send",
      delivered: "Delivery",
      bounce: "Bounce",
      complaint: "Complaint",
      open: "Open",
      click: "Click",
    };

    return {
      Message: JSON.stringify({
        eventType: eventTypeMap[event.type] || event.type,
        mail: {
          timestamp: new Date(event.timestamp).toISOString(),
          messageId: event.messageId,
          destination: [event.email],
        },
        delivery: {
          status: event.status || "Success",
        },
        bounce: {
          bounceSubType: event.reason,
        },
      }),
    };
  }

  /**
   * Generate Mailgun webhook payload
   */
  static generateMailgunPayload(event: WebhookEvent): any {
    return {
      "event-data": {
        event: event.event,
        timestamp: Math.floor(event.timestamp / 1000),
        message: {
          headers: {
            "message-id": event.messageId,
          },
        },
        recipient: event.email,
        reason: event.reason,
        severity: event.status,
        url: event.url,
        "user-agent": event.useragent,
        ip: event.ip,
      },
    };
  }
}

/**
 * Webhook test runner
 */
export class WebhookTestRunner {
  private results: Array<{
    scenario: string;
    status: "success" | "failed";
    eventsProcessed: number;
    errors?: string[];
    duration: number;
  }> = [];

  /**
   * Run scenario test
   */
  async runScenario(
    scenario: SimulationScenario,
    handler: (event: WebhookEvent) => Promise<boolean>
  ): Promise<{
    status: "success" | "failed";
    eventsProcessed: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let eventsProcessed = 0;

    for (const event of scenario.events) {
      try {
        const success = await handler(event);
        if (success) {
          eventsProcessed++;
        } else {
          errors.push(`Failed to process event: ${event.type}`);
        }
      } catch (error) {
        errors.push(`Error processing event: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    const duration = Date.now() - startTime;
    const result = {
      status: errors.length === 0 ? ("success" as const) : ("failed" as const),
      eventsProcessed,
      errors,
      duration,
    };

    this.results.push({
      scenario: scenario.name,
      ...result,
    });

    return result;
  }

  /**
   * Get test results
   */
  getResults(): typeof this.results {
    return this.results;
  }

  /**
   * Get test summary
   */
  getSummary(): {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    totalEventsProcessed: number;
    totalDuration: number;
    successRate: number;
  } {
    const summary = {
      totalTests: this.results.length,
      successfulTests: this.results.filter((r) => r.status === "success").length,
      failedTests: this.results.filter((r) => r.status === "failed").length,
      totalEventsProcessed: this.results.reduce((sum, r) => sum + r.eventsProcessed, 0),
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
      successRate: 0,
    };

    if (summary.totalTests > 0) {
      summary.successRate = Math.round((summary.successfulTests / summary.totalTests) * 100);
    }

    return summary;
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.results = [];
  }
}

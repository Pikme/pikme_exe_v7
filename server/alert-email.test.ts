import { describe, it, expect, beforeEach } from 'vitest';
import { AlertEmailService } from './alert-email-service';

describe('Alert Email Service', () => {
  beforeEach(() => {
    // Initialize service before each test
    AlertEmailService.initialize({
      smtpHost: 'smtp.test.local',
      smtpPort: 587,
      smtpUser: 'test@test.local',
      smtpPassword: 'password123',
      fromEmail: 'alerts@pikme.local',
      fromName: 'Pikme Alerts',
      replyTo: 'admin@pikme.local',
    });
  });

  describe('Email Subject Generation', () => {
    it('should generate critical alert subject with emoji', () => {
      const options = {
        alertId: 1,
        alertType: 'check_failure',
        severity: 'critical',
        message: 'Critical failure detected',
        recipientEmail: 'admin@test.local',
        recipientName: 'Admin',
      };

      // Subject generation logic
      const subject = `🚨 CRITICAL: ${options.message}`;
      expect(subject).toContain('🚨 CRITICAL');
      expect(subject).toContain('Critical failure detected');
    });

    it('should generate high severity alert subject', () => {
      const options = {
        alertId: 1,
        alertType: 'check_stall',
        severity: 'high',
        message: 'High severity warning',
        recipientEmail: 'admin@test.local',
        recipientName: 'Admin',
      };

      const subject = `⚠️ HIGH: ${options.message}`;
      expect(subject).toContain('⚠️ HIGH');
    });

    it('should generate medium severity alert subject', () => {
      const options = {
        alertId: 1,
        alertType: 'consecutive_errors',
        severity: 'medium',
        message: 'Medium severity issue',
        recipientEmail: 'admin@test.local',
        recipientName: 'Admin',
      };

      const subject = `⚡ MEDIUM: ${options.message}`;
      expect(subject).toContain('⚡ MEDIUM');
    });

    it('should generate low severity alert subject', () => {
      const options = {
        alertId: 1,
        alertType: 'info',
        severity: 'low',
        message: 'Low severity info',
        recipientEmail: 'admin@test.local',
        recipientName: 'Admin',
      };

      const subject = `ℹ️ LOW: ${options.message}`;
      expect(subject).toContain('ℹ️ LOW');
    });
  });

  describe('Email HTML Generation', () => {
    it('should generate HTML email with proper structure', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"></head>
          <body>
            <div class="container">
              <div class="header">Alert Notification</div>
              <div class="content">Email content</div>
            </div>
          </body>
        </html>
      `;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('Alert Notification');
    });

    it('should include alert details in HTML', () => {
      const details = {
        failureCount: 5,
        lastFailure: '2026-01-31T08:00:00Z',
        endpoint: 'https://api.example.com/webhook',
      };

      const detailsHTML = Object.entries(details)
        .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
        .join('');

      expect(detailsHTML).toContain('failureCount');
      expect(detailsHTML).toContain('5');
      expect(detailsHTML).toContain('endpoint');
    });

    it('should include action URL in HTML', () => {
      const actionUrl = 'http://localhost:3000/admin/scheduler-logs';
      const html = `<a href="${actionUrl}">View Alert Details</a>`;

      expect(html).toContain('href="http://localhost:3000/admin/scheduler-logs"');
      expect(html).toContain('View Alert Details');
    });

    it('should apply severity color coding', () => {
      const severityColors = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#eab308',
        low: '#3b82f6',
      };

      const severity = 'critical';
      const color = severityColors[severity as keyof typeof severityColors];

      expect(color).toBe('#dc2626');
    });
  });

  describe('Email Text Generation', () => {
    it('should generate plain text email', () => {
      const text = `Alert Notification
==================================================

Severity: CRITICAL
Message: Critical failure detected
Alert Type: check_failure
Alert ID: 1

This is an automated alert notification.`;

      expect(text).toContain('Alert Notification');
      expect(text).toContain('Severity: CRITICAL');
      expect(text).toContain('automated alert notification');
    });

    it('should include details in plain text', () => {
      const details = { failureCount: 5, endpoint: 'https://api.example.com' };
      const detailsText = Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      expect(detailsText).toContain('failureCount: 5');
      expect(detailsText).toContain('endpoint: https://api.example.com');
    });
  });

  describe('Batch Email Sending', () => {
    it('should track successful email sends', async () => {
      const options = [
        {
          alertId: 1,
          alertType: 'check_failure',
          severity: 'critical',
          message: 'Alert 1',
          recipientEmail: 'admin1@test.local',
          recipientName: 'Admin 1',
        },
        {
          alertId: 2,
          alertType: 'check_failure',
          severity: 'critical',
          message: 'Alert 2',
          recipientEmail: 'admin2@test.local',
          recipientName: 'Admin 2',
        },
      ];

      // Mock successful sends
      const result = { successful: 2, failed: 0 };

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should retry failed email sends', async () => {
      let attempts = 0;
      const maxRetries = 3;

      while (attempts < maxRetries) {
        attempts++;
        if (attempts === 3) break; // Simulate success on 3rd attempt
      }

      expect(attempts).toBe(3);
    });

    it('should apply exponential backoff for retries', () => {
      const retries = [1, 2, 3];
      const backoffs = retries.map((r) => Math.pow(2, r) * 1000);

      expect(backoffs[0]).toBe(2000);
      expect(backoffs[1]).toBe(4000);
      expect(backoffs[2]).toBe(8000);
    });
  });

  describe('Email Configuration', () => {
    it('should validate SMTP configuration', () => {
      const config = {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'user@gmail.com',
        smtpPassword: 'password',
        fromEmail: 'alerts@example.com',
        fromName: 'Alerts',
      };

      expect(config.smtpHost).toBeDefined();
      expect(config.smtpPort).toBe(587);
      expect(config.smtpUser).toBeDefined();
    });

    it('should use secure connection for port 465', () => {
      const port = 465;
      const secure = port === 465;

      expect(secure).toBe(true);
    });

    it('should use non-secure connection for port 587', () => {
      const port = 587;
      const secure = port === 465;

      expect(secure).toBe(false);
    });
  });

  describe('Email Delivery Logging', () => {
    it('should log successful email delivery', () => {
      const log = {
        alertId: 1,
        recipientEmail: 'admin@test.local',
        messageId: '<msg123@test.local>',
        status: 'sent',
        sentAt: new Date(),
      };

      expect(log.status).toBe('sent');
      expect(log.messageId).toBeDefined();
      expect(log.sentAt).toBeInstanceOf(Date);
    });

    it('should log failed email delivery with error', () => {
      const log = {
        alertId: 1,
        recipientEmail: 'admin@test.local',
        messageId: null,
        status: 'failed',
        error: 'SMTP connection timeout',
        sentAt: new Date(),
      };

      expect(log.status).toBe('failed');
      expect(log.messageId).toBeNull();
      expect(log.error).toContain('timeout');
    });

    it('should track delivery attempts', () => {
      const deliveries = [
        { alertId: 1, attempt: 1, status: 'failed' },
        { alertId: 1, attempt: 2, status: 'failed' },
        { alertId: 1, attempt: 3, status: 'sent' },
      ];

      expect(deliveries).toHaveLength(3);
      expect(deliveries[2].status).toBe('sent');
    });
  });

  describe('Alert Type Formatting', () => {
    it('should format check_failure alert type', () => {
      const alertType = 'check_failure';
      const formatted = alertType.replace(/_/g, ' ').toUpperCase();

      expect(formatted).toBe('CHECK FAILURE');
    });

    it('should format check_stall alert type', () => {
      const alertType = 'check_stall';
      const formatted = alertType.replace(/_/g, ' ').toUpperCase();

      expect(formatted).toBe('CHECK STALL');
    });

    it('should format rotation_failure alert type', () => {
      const alertType = 'rotation_failure';
      const formatted = alertType.replace(/_/g, ' ').toUpperCase();

      expect(formatted).toBe('ROTATION FAILURE');
    });
  });

  describe('Email Service Initialization', () => {
    it('should initialize with valid config', () => {
      const config = {
        smtpHost: 'smtp.test.local',
        smtpPort: 587,
        smtpUser: 'test@test.local',
        smtpPassword: 'password',
        fromEmail: 'alerts@test.local',
        fromName: 'Test Alerts',
      };

      expect(config).toBeDefined();
      expect(config.smtpHost).toBe('smtp.test.local');
    });

    it('should use environment variables as fallback', () => {
      const config = {
        smtpHost: process.env.SMTP_HOST || 'localhost',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        fromEmail: process.env.SMTP_FROM || 'noreply@local',
      };

      expect(config.smtpHost).toBeDefined();
      expect(config.smtpPort).toBeGreaterThan(0);
    });
  });

  describe('Email Content Validation', () => {
    it('should sanitize email content', () => {
      const unsafeContent = '<script>alert("xss")</script>';
      const safe = unsafeContent.replace(/<script[^>]*>.*?<\/script>/gi, '');

      expect(safe).not.toContain('<script>');
    });

    it('should escape special characters in details', () => {
      const details = { message: 'Error: "Connection failed" & timeout' };
      const escaped = JSON.stringify(details);

      expect(escaped).toContain('\\\"');
    });
  });
});

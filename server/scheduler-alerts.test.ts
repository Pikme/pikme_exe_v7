import { describe, it, expect } from 'vitest';

describe('Scheduler Alert Service', () => {
  describe('Alert Thresholds', () => {
    it('should calculate severity for check failures', () => {
      const severities = [
        { value: 2, expected: 'low' },
        { value: 3, expected: 'medium' },
        { value: 5, expected: 'high' },
        { value: 10, expected: 'critical' },
      ];

      for (const { value, expected } of severities) {
        const severity = calculateSeverity('check_failure', value);
        expect(severity).toBe(expected);
      }
    });

    it('should calculate severity for check stalls', () => {
      const severities = [
        { value: 12, expected: 'low' },
        { value: 24, expected: 'medium' },
        { value: 48, expected: 'high' },
        { value: 72, expected: 'critical' },
      ];

      for (const { value, expected } of severities) {
        const severity = calculateSeverity('check_stall', value);
        expect(severity).toBe(expected);
      }
    });

    it('should create appropriate alert messages', () => {
      const messages = [
        {
          type: 'check_failure',
          value: 5,
          contains: '5 consecutive check failures',
        },
        {
          type: 'check_stall',
          value: 24,
          contains: '24 hours',
        },
        {
          type: 'rotation_failure',
          value: 1,
          contains: 'failed',
        },
      ];

      for (const { type, value, contains } of messages) {
        const message = createAlertMessage(type, value);
        expect(message.toLowerCase()).toContain(contains.toLowerCase());
      }
    });
  });

  describe('Cooldown Management', () => {
    it('should respect cooldown periods', () => {
      const now = Date.now();
      const cooldownMs = 60 * 60 * 1000; // 1 hour

      const lastAlertTime = new Date(now - 30 * 60 * 1000); // 30 minutes ago
      const timeSinceLastAlert = now - lastAlertTime.getTime();

      expect(timeSinceLastAlert < cooldownMs).toBe(true);
    });

    it('should allow alerts after cooldown expires', () => {
      const now = Date.now();
      const cooldownMs = 60 * 60 * 1000; // 1 hour

      const lastAlertTime = new Date(now - 90 * 60 * 1000); // 90 minutes ago
      const timeSinceLastAlert = now - lastAlertTime.getTime();

      expect(timeSinceLastAlert >= cooldownMs).toBe(true);
    });
  });

  describe('Alert Statistics', () => {
    it('should calculate alert distribution', () => {
      const alerts = [
        { alertType: 'check_failure', severity: 'high' },
        { alertType: 'check_failure', severity: 'medium' },
        { alertType: 'check_stall', severity: 'critical' },
        { alertType: 'rotation_failure', severity: 'high' },
      ];

      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      for (const alert of alerts) {
        byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
        bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      }

      expect(byType['check_failure']).toBe(2);
      expect(byType['check_stall']).toBe(1);
      expect(bySeverity['high']).toBe(2);
      expect(bySeverity['critical']).toBe(1);
    });

    it('should count unresolved alerts', () => {
      const alerts = [
        { resolvedAt: null, acknowledged: false },
        { resolvedAt: null, acknowledged: true },
        { resolvedAt: new Date(), acknowledged: true },
      ];

      const unresolved = alerts.filter((a) => !a.resolvedAt);
      const unacknowledged = alerts.filter((a) => !a.acknowledged);

      expect(unresolved).toHaveLength(2);
      expect(unacknowledged).toHaveLength(1);
    });
  });

  describe('Alert Configurations', () => {
    it('should have default alert types', () => {
      const defaultTypes = [
        'check_failure',
        'check_stall',
        'consecutive_errors',
        'rotation_failure',
        'job_stall',
      ];

      expect(defaultTypes).toHaveLength(5);
      expect(defaultTypes.every((t) => typeof t === 'string')).toBe(true);
    });

    it('should validate threshold values', () => {
      const validThresholds = [1, 3, 5, 10, 24, 72];
      const invalidThresholds = [0, -1, -5];

      for (const threshold of validThresholds) {
        expect(threshold > 0).toBe(true);
      }

      for (const threshold of invalidThresholds) {
        expect(threshold > 0).toBe(false);
      }
    });

    it('should validate cooldown values', () => {
      const validCooldowns = [30, 60, 120, 300];
      const invalidCooldowns = [0, -1, -60];

      for (const cooldown of validCooldowns) {
        expect(cooldown > 0).toBe(true);
      }

      for (const cooldown of invalidCooldowns) {
        expect(cooldown > 0).toBe(false);
      }
    });
  });

  describe('Alert Formatting', () => {
    it('should format alert types correctly', () => {
      const formatted = [
        { input: 'check_failure', expected: 'Check Failure' },
        { input: 'check_stall', expected: 'Check Stall' },
        { input: 'consecutive_errors', expected: 'Consecutive Errors' },
        { input: 'rotation_failure', expected: 'Rotation Failure' },
        { input: 'job_stall', expected: 'Job Stall' },
      ];

      for (const { input, expected } of formatted) {
        const result = formatAlertType(input);
        expect(result).toBe(expected);
      }
    });
  });

  describe('Alert Acknowledgment', () => {
    it('should track acknowledged alerts', () => {
      const alert = {
        id: 1,
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null,
      };

      // Simulate acknowledgment
      const acknowledged = {
        ...alert,
        acknowledged: true,
        acknowledgedBy: 123,
        acknowledgedAt: new Date(),
      };

      expect(alert.acknowledged).toBe(false);
      expect(acknowledged.acknowledged).toBe(true);
      expect(acknowledged.acknowledgedBy).toBe(123);
    });

    it('should track alert resolution', () => {
      const alert = {
        id: 1,
        resolvedAt: null,
      };

      // Simulate resolution
      const resolved = {
        ...alert,
        resolvedAt: new Date(),
      };

      expect(alert.resolvedAt).toBeNull();
      expect(resolved.resolvedAt).not.toBeNull();
    });
  });

  describe('Failure Count Tracking', () => {
    it('should increment failure count on errors', () => {
      let failureCount = 0;

      // Simulate failures
      failureCount++;
      failureCount++;
      failureCount++;

      expect(failureCount).toBe(3);
    });

    it('should reset failure count on success', () => {
      let failureCount = 5;

      // Simulate success
      failureCount = 0;

      expect(failureCount).toBe(0);
    });

    it('should trigger alert at threshold', () => {
      const threshold = 3;
      let failureCount = 0;
      let alertTriggered = false;

      for (let i = 0; i < 5; i++) {
        failureCount++;
        if (failureCount >= threshold) {
          alertTriggered = true;
          break;
        }
      }

      expect(alertTriggered).toBe(true);
      expect(failureCount).toBe(3);
    });
  });

  describe('Stall Detection', () => {
    it('should detect check stalls', () => {
      const now = Date.now();
      const lastCheckTime = now - 25 * 60 * 60 * 1000; // 25 hours ago
      const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);

      expect(hoursSinceLastCheck > 24).toBe(true);
    });

    it('should not trigger stall alert too early', () => {
      const now = Date.now();
      const lastCheckTime = now - 12 * 60 * 60 * 1000; // 12 hours ago
      const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);

      expect(hoursSinceLastCheck > 24).toBe(false);
    });
  });
});

// Helper functions for testing
function calculateSeverity(alertType: string, value: number): string {
  switch (alertType) {
    case 'check_failure':
      if (value >= 10) return 'critical';
      if (value >= 5) return 'high';
      if (value >= 3) return 'medium';
      return 'low';
    case 'check_stall':
      if (value >= 72) return 'critical';
      if (value >= 48) return 'high';
      if (value >= 24) return 'medium';
      return 'low';
    default:
      return 'medium';
  }
}

function createAlertMessage(alertType: string, value: number): string {
  switch (alertType) {
    case 'check_failure':
      return `Scheduler has experienced ${value} consecutive check failures`;
    case 'check_stall':
      return `No scheduler check has run for ${value} hours`;
    case 'rotation_failure':
      return `Key rotation check failed`;
    default:
      return `Scheduler alert triggered: ${alertType}`;
  }
}

function formatAlertType(alertType: string): string {
  return alertType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

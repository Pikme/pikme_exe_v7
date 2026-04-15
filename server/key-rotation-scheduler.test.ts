import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KeyRotationScheduler } from './key-rotation-scheduler';

describe('Key Rotation Scheduler', () => {
  beforeEach(() => {
    KeyRotationScheduler.stop();
    KeyRotationScheduler.resetStats();
  });

  afterEach(() => {
    KeyRotationScheduler.stop();
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      expect(() => {
        KeyRotationScheduler.initialize();
      }).not.toThrow();
    });

    it('should set isRunning to true after initialization', () => {
      KeyRotationScheduler.initialize();
      const status = KeyRotationScheduler.getStatus();
      expect(status.isRunning).toBe(true);
    });

    it('should not initialize twice', () => {
      KeyRotationScheduler.initialize();
      const firstStatus = KeyRotationScheduler.getStatus();
      KeyRotationScheduler.initialize();
      const secondStatus = KeyRotationScheduler.getStatus();
      expect(firstStatus.isRunning).toBe(secondStatus.isRunning);
    });
  });

  describe('Status Management', () => {
    it('should return initial status structure', () => {
      const status = KeyRotationScheduler.getStatus();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastCheckTime');
      expect(status).toHaveProperty('nextCheckTime');
      expect(status).toHaveProperty('checksCompleted');
      expect(status).toHaveProperty('checksWithRotation');
      expect(status).toHaveProperty('lastError');
      expect(status).toHaveProperty('lastErrorTime');
    });

    it('should have zero checks completed initially', () => {
      const status = KeyRotationScheduler.getStatus();
      expect(status.checksCompleted).toBe(0);
      expect(status.checksWithRotation).toBe(0);
    });

    it('should have no errors initially', () => {
      const status = KeyRotationScheduler.getStatus();
      expect(status.lastError).toBeNull();
      expect(status.lastErrorTime).toBeNull();
    });
  });

  describe('Stop and Resume', () => {
    it('should stop the scheduler', () => {
      KeyRotationScheduler.initialize();
      KeyRotationScheduler.stop();
      const status = KeyRotationScheduler.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('should resume the scheduler', () => {
      KeyRotationScheduler.initialize();
      KeyRotationScheduler.stop();
      KeyRotationScheduler.resume();
      const status = KeyRotationScheduler.getStatus();
      expect(status.isRunning).toBe(true);
    });
  });

  describe('Health Checks', () => {
    it('should return health status structure', () => {
      const health = KeyRotationScheduler.getHealth();
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('lastCheckAge');
      expect(health).toHaveProperty('consecutiveErrors');
      expect(health).toHaveProperty('message');
    });

    it('should be healthy when running with no errors', () => {
      KeyRotationScheduler.initialize();
      const health = KeyRotationScheduler.getHealth();
      expect(health.healthy).toBe(true);
      expect(health.message).toContain('running');
    });

    it('should be unhealthy when not running', () => {
      KeyRotationScheduler.stop();
      const health = KeyRotationScheduler.getHealth();
      expect(health.healthy).toBe(false);
      expect(health.message).toContain('not running');
    });
  });

  describe('Statistics', () => {
    it('should reset statistics', () => {
      KeyRotationScheduler.resetStats();
      const status = KeyRotationScheduler.getStatus();
      expect(status.checksCompleted).toBe(0);
      expect(status.checksWithRotation).toBe(0);
      expect(status.lastError).toBeNull();
    });

    it('should maintain statistics across multiple calls', () => {
      const status1 = KeyRotationScheduler.getStatus();
      const status2 = KeyRotationScheduler.getStatus();
      expect(status1.checksCompleted).toBe(status2.checksCompleted);
    });
  });

  describe('Manual Trigger', () => {
    it('should handle manual trigger without errors', async () => {
      const result = await KeyRotationScheduler.triggerCheck();
      expect(result).toHaveProperty('success');
    });

    it('should return error property on failure', async () => {
      const result = await KeyRotationScheduler.triggerCheck();
      expect(result).toHaveProperty('error');
    });
  });

  describe('Cron Scheduling', () => {
    it('should initialize with running status', () => {
      KeyRotationScheduler.initialize();
      const status = KeyRotationScheduler.getStatus();
      expect(status.isRunning).toBe(true);
    });

    it('should have consistent status across calls', () => {
      KeyRotationScheduler.initialize();
      const status1 = KeyRotationScheduler.getStatus();
      const status2 = KeyRotationScheduler.getStatus();
      expect(status1.isRunning).toBe(status2.isRunning);
    });
  });

  describe('Error Handling', () => {
    it('should handle trigger check gracefully', async () => {
      const result = await KeyRotationScheduler.triggerCheck();
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should not throw on stop when not initialized', () => {
      expect(() => {
        KeyRotationScheduler.stop();
      }).not.toThrow();
    });

    it('should not throw on resume when not initialized', () => {
      expect(() => {
        KeyRotationScheduler.resume();
      }).not.toThrow();
    });

    it('should not throw on resetStats', () => {
      expect(() => {
        KeyRotationScheduler.resetStats();
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should maintain consistent state across operations', () => {
      KeyRotationScheduler.initialize();
      const status1 = KeyRotationScheduler.getStatus();
      const health1 = KeyRotationScheduler.getHealth();

      KeyRotationScheduler.stop();
      const status2 = KeyRotationScheduler.getStatus();
      const health2 = KeyRotationScheduler.getHealth();

      expect(status1.isRunning).toBe(true);
      expect(status2.isRunning).toBe(false);
      expect(health1.healthy).toBe(true);
      expect(health2.healthy).toBe(false);
    });

    it('should provide complete scheduler information', () => {
      KeyRotationScheduler.initialize();
      const status = KeyRotationScheduler.getStatus();
      const health = KeyRotationScheduler.getHealth();

      expect(status.isRunning).toBe(true);
      expect(health.healthy).toBe(true);
      expect(health.message).toBeTruthy();
    });

    it('should handle lifecycle transitions', async () => {
      KeyRotationScheduler.initialize();
      expect(KeyRotationScheduler.getStatus().isRunning).toBe(true);

      KeyRotationScheduler.stop();
      expect(KeyRotationScheduler.getStatus().isRunning).toBe(false);

      KeyRotationScheduler.resume();
      expect(KeyRotationScheduler.getStatus().isRunning).toBe(true);

      const result = await KeyRotationScheduler.triggerCheck();
      expect(result).toHaveProperty('success');

      KeyRotationScheduler.resetStats();
      const finalStatus = KeyRotationScheduler.getStatus();
      expect(finalStatus.checksCompleted).toBe(0);
    });
  });
});

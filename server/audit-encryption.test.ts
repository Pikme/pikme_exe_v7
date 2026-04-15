import { describe, it, expect } from 'vitest';
import { AuditEncryptionService } from './audit-encryption-service';

describe('Audit Encryption Service', () => {
  const testPassword = 'TestPassword123!@#';
  const testData = 'This is sensitive audit log data that needs encryption';

  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt data successfully', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      expect(encrypted.encrypted).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();

      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(testData);
    });

    it('should fail decryption with wrong password', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, 'WrongPassword123!');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should fail with password too short', () => {
      expect(() => {
        AuditEncryptionService.encrypt(testData, { password: 'short' });
      }).toThrow('Password must be at least 8 characters long');
    });

    it('should handle empty password', () => {
      expect(() => {
        AuditEncryptionService.encrypt(testData, { password: '' });
      }).toThrow('Password must be at least 8 characters long');
    });
  });

  describe('Encryption Algorithms', () => {
    it('should support AES-256-GCM', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, {
        password: testPassword,
        algorithm: 'aes-256-gcm',
      });
      expect(encrypted.algorithm).toBe('aes-256-gcm');

      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
    });

    it('should support AES-192-GCM', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, {
        password: testPassword,
        algorithm: 'aes-192-gcm',
      });
      expect(encrypted.algorithm).toBe('aes-192-gcm');

      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
    });

    it('should support AES-128-GCM', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, {
        password: testPassword,
        algorithm: 'aes-128-gcm',
      });
      expect(encrypted.algorithm).toBe('aes-128-gcm');

      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
    });

    it('should reject unsupported algorithms', () => {
      expect(() => {
        AuditEncryptionService.encrypt(testData, {
          password: testPassword,
          algorithm: 'aes-256-cbc' as any,
        });
      }).toThrow('Unsupported algorithm');
    });
  });

  describe('Base64 Encoding', () => {
    it('should encrypt and encode to Base64', () => {
      const base64 = AuditEncryptionService.encryptToBase64(testData, { password: testPassword });
      expect(typeof base64).toBe('string');
      expect(base64.length > 0).toBe(true);
      expect(/^[A-Za-z0-9+/=]+$/.test(base64)).toBe(true);
    });

    it('should decrypt from Base64', () => {
      const base64 = AuditEncryptionService.encryptToBase64(testData, { password: testPassword });
      const result = AuditEncryptionService.decryptFromBase64(base64, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(testData);
    });

    it('should fail decryption from invalid Base64', () => {
      const result = AuditEncryptionService.decryptFromBase64('invalid-base64!!!', testPassword);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Password Generation', () => {
    it('should generate secure random passwords', () => {
      const password = AuditEncryptionService.generateSecurePassword(16);
      expect(password.length).toBe(16);
      expect(password).toBeTruthy();
    });

    it('should generate different passwords on each call', () => {
      const password1 = AuditEncryptionService.generateSecurePassword(16);
      const password2 = AuditEncryptionService.generateSecurePassword(16);
      expect(password1).not.toBe(password2);
    });

    it('should generate passwords with custom length', () => {
      const password = AuditEncryptionService.generateSecurePassword(32);
      expect(password.length).toBe(32);
    });
  });

  describe('Password Strength Validation', () => {
    it('should validate weak passwords', () => {
      const result = AuditEncryptionService.validatePasswordStrength('weak');
      expect(result.valid).toBe(false);
      expect(result.feedback.length > 0).toBe(true);
    });

    it('should validate strong passwords', () => {
      const result = AuditEncryptionService.validatePasswordStrength('StrongPass123!@#');
      expect(result.valid).toBe(true);
      expect(result.score >= 3).toBe(true);
    });

    it('should provide feedback for improvement', () => {
      const result = AuditEncryptionService.validatePasswordStrength('password');
      expect(result.feedback.length > 0).toBe(true);
      expect(result.feedback[0]).toBeTruthy();
    });

    it('should score password strength', () => {
      const weak = AuditEncryptionService.validatePasswordStrength('weak');
      const strong = AuditEncryptionService.validatePasswordStrength('StrongPass123!@#');
      expect(strong.score > weak.score).toBe(true);
    });
  });

  describe('Encrypted File Format', () => {
    it('should create encrypted file with metadata', () => {
      const metadata = { userId: 123, action: 'pause' };
      const fileContent = AuditEncryptionService.createEncryptedFile(
        testData,
        testPassword,
        metadata
      );

      const file = JSON.parse(fileContent);
      expect(file.version).toBe('1.0');
      expect(file.type).toBe('encrypted-audit-log');
      expect(file.timestamp).toBeTruthy();
      expect(file.metadata).toEqual(metadata);
      expect(file.encrypted).toBeTruthy();
    });

    it('should read and decrypt encrypted file', () => {
      const metadata = { userId: 123 };
      const fileContent = AuditEncryptionService.createEncryptedFile(
        testData,
        testPassword,
        metadata
      );

      const result = AuditEncryptionService.readEncryptedFile(fileContent, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(testData);
    });

    it('should fail with wrong password on encrypted file', () => {
      const fileContent = AuditEncryptionService.createEncryptedFile(testData, testPassword);
      const result = AuditEncryptionService.readEncryptedFile(fileContent, 'WrongPassword123!');
      expect(result.success).toBe(false);
    });

    it('should extract metadata without decrypting', () => {
      const metadata = { userId: 123, action: 'pause', timestamp: '2026-01-30' };
      const fileContent = AuditEncryptionService.createEncryptedFile(
        testData,
        testPassword,
        metadata
      );

      const result = AuditEncryptionService.getEncryptionMetadata(fileContent);
      expect(result.success).toBe(true);
      expect(result.metadata).toEqual(metadata);
    });

    it('should handle invalid file format', () => {
      const invalidFile = JSON.stringify({ version: '2.0', type: 'wrong-type' });
      const result = AuditEncryptionService.readEncryptedFile(invalidFile, testPassword);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid encrypted file format');
    });
  });

  describe('Encryption Integrity', () => {
    it('should verify valid encryption structure', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const valid = AuditEncryptionService.verifyIntegrity(encrypted);
      expect(valid).toBe(true);
    });

    it('should reject missing fields', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const invalid = { ...encrypted, iv: '' };
      const valid = AuditEncryptionService.verifyIntegrity(invalid);
      expect(valid).toBe(false);
    });

    it('should reject invalid hex format', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const invalid = { ...encrypted, encrypted: 'not-hex-format' };
      const valid = AuditEncryptionService.verifyIntegrity(invalid);
      expect(valid).toBe(false);
    });

    it('should reject incorrect field lengths', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const invalid = { ...encrypted, iv: 'ff' };
      const valid = AuditEncryptionService.verifyIntegrity(invalid);
      expect(valid).toBe(false);
    });
  });

  describe('Large Data Encryption', () => {
    it('should handle large audit log data', () => {
      const largeData = testData.repeat(1000);
      const encrypted = AuditEncryptionService.encrypt(largeData, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(largeData);
    });

    it('should handle JSON data', () => {
      const jsonData = JSON.stringify({
        logs: [
          { id: 1, action: 'pause', timestamp: '2026-01-30T10:00:00Z' },
          { id: 2, action: 'resume', timestamp: '2026-01-30T11:00:00Z' },
        ],
      });
      const encrypted = AuditEncryptionService.encrypt(jsonData, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(JSON.parse(result.data!)).toEqual(JSON.parse(jsonData));
    });

    it('should handle CSV data', () => {
      const csvData = 'ID,Action,Timestamp\n1,pause,2026-01-30T10:00:00Z\n2,resume,2026-01-30T11:00:00Z';
      const encrypted = AuditEncryptionService.encrypt(csvData, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(csvData);
    });
  });

  describe('Special Characters', () => {
    it('should handle Unicode characters', () => {
      const unicodeData = 'Test with émojis 🔐 and special chars: ñ, ü, ö';
      const encrypted = AuditEncryptionService.encrypt(unicodeData, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(unicodeData);
    });

    it('should handle newlines and whitespace', () => {
      const dataWithWhitespace = 'Line 1\nLine 2\n\nLine 3\t\tTabbed';
      const encrypted = AuditEncryptionService.encrypt(dataWithWhitespace, { password: testPassword });
      const result = AuditEncryptionService.decrypt(encrypted, testPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(dataWithWhitespace);
    });

    it('should handle special password characters', () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = AuditEncryptionService.encrypt(testData, { password: specialPassword });
      const result = AuditEncryptionService.decrypt(encrypted, specialPassword);
      expect(result.success).toBe(true);
      expect(result.data).toBe(testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption errors gracefully', () => {
      expect(() => {
        AuditEncryptionService.encrypt(testData, { password: 'short' });
      }).toThrow();
    });

    it('should return error in decryption result', () => {
      const result = AuditEncryptionService.decrypt('invalid', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle corrupted encrypted data', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      const corrupted = {
        ...encrypted,
        encrypted: encrypted.encrypted.slice(0, -10) + '0000000000',
      };
      const result = AuditEncryptionService.decrypt(corrupted, testPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('Compliance Features', () => {
    it('should include timestamp in encrypted file', () => {
      const fileContent = AuditEncryptionService.createEncryptedFile(testData, testPassword);
      const file = JSON.parse(fileContent);
      expect(file.timestamp).toBeTruthy();
      expect(new Date(file.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should preserve metadata through encryption', () => {
      const metadata = {
        userId: 123,
        userName: 'admin',
        action: 'pause',
        reason: 'Security incident',
      };
      const fileContent = AuditEncryptionService.createEncryptedFile(
        testData,
        testPassword,
        metadata
      );
      const file = JSON.parse(fileContent);
      expect(file.metadata).toEqual(metadata);
    });

    it('should use PBKDF2 key derivation', () => {
      const encrypted = AuditEncryptionService.encrypt(testData, { password: testPassword });
      expect(encrypted.salt).toBeTruthy();
      expect(encrypted.salt.length).toBe(64); // 32 bytes * 2 (hex)
    });
  });
});

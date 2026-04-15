import crypto from 'crypto';

export interface EncryptionOptions {
  password: string;
  algorithm?: 'aes-256-gcm' | 'aes-192-gcm' | 'aes-128-gcm';
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
  algorithm: string;
}

export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Audit Encryption Service
 * Provides AES-256-GCM encryption/decryption for audit log exports
 */
export class AuditEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly SALT_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;

  private static getKeyLength(algorithm: string): number {
    switch (algorithm) {
      case 'aes-256-gcm':
        return 32;
      case 'aes-192-gcm':
        return 24;
      case 'aes-128-gcm':
        return 16;
      default:
        return 32;
    }
  }
  private static readonly ITERATIONS = 100000;
  private static readonly DIGEST = 'sha256';

  /**
   * Derive a key from password using PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer, algorithm: string = 'aes-256-gcm'): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.ITERATIONS,
      this.getKeyLength(algorithm),
      this.DIGEST
    );
  }

  /**
   * Encrypt data with password
   */
  static encrypt(data: string, options: EncryptionOptions): EncryptedData {
    try {
      const algorithm = options.algorithm || this.ALGORITHM;

      // Validate algorithm
      if (!['aes-256-gcm', 'aes-192-gcm', 'aes-128-gcm'].includes(algorithm)) {
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      // Validate password strength
      if (!options.password || options.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Generate salt and IV
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Derive key from password
      const key = this.deriveKey(options.password, salt, algorithm);

      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        salt: salt.toString('hex'),
        algorithm,
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data with password
   */
  static decrypt(encryptedData: EncryptedData | string, password: string): DecryptionResult {
    try {
      // Parse encrypted data if it's a string (JSON)
      let data: EncryptedData;
      if (typeof encryptedData === 'string') {
        data = JSON.parse(encryptedData);
      } else {
        data = encryptedData;
      }

      // Validate required fields
      if (!data.encrypted || !data.iv || !data.authTag || !data.salt) {
        return {
          success: false,
          error: 'Invalid encrypted data format',
        };
      }

      // Validate password
      if (!password || password.length < 8) {
        return {
          success: false,
          error: 'Invalid password',
        };
      }

      // Reconstruct key and IV
      const salt = Buffer.from(data.salt, 'hex');
      const iv = Buffer.from(data.iv, 'hex');
      const authTag = Buffer.from(data.authTag, 'hex');
      const algorithm = data.algorithm || this.ALGORITHM;

      // Derive key from password
      const key = this.deriveKey(password, salt, algorithm);

      // Create decipher
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        success: true,
        data: decrypted,
      };
    } catch (error) {
      console.error('Decryption error:', error);
      return {
        success: false,
        error: `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Encrypt and encode to Base64 for file storage
   */
  static encryptToBase64(data: string, options: EncryptionOptions): string {
    try {
      const encrypted = this.encrypt(data, options);
      const json = JSON.stringify(encrypted);
      return Buffer.from(json).toString('base64');
    } catch (error) {
      console.error('Error encrypting to Base64:', error);
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt from Base64 encoded data
   */
  static decryptFromBase64(encryptedBase64: string, password: string): DecryptionResult {
    try {
      const json = Buffer.from(encryptedBase64, 'base64').toString('utf8');
      const encryptedData = JSON.parse(json) as EncryptedData;
      return this.decrypt(encryptedData, password);
    } catch (error) {
      console.error('Error decrypting from Base64:', error);
      return {
        success: false,
        error: `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      password += chars[randomValues[i] % chars.length];
    }
    return password;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push('Consider using a longer password (12+ characters)');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Add special characters for better security');

    return {
      valid: score >= 3,
      score,
      feedback,
    };
  }

  /**
   * Create encrypted file with metadata
   */
  static createEncryptedFile(
    data: string,
    password: string,
    metadata?: Record<string, any>
  ): string {
    try {
      const encrypted = this.encrypt(data, { password });

      const fileContent = {
        version: '1.0',
        type: 'encrypted-audit-log',
        timestamp: new Date().toISOString(),
        metadata: metadata || {},
        encrypted,
      };

      return JSON.stringify(fileContent, null, 2);
    } catch (error) {
      console.error('Error creating encrypted file:', error);
      throw new Error(`Failed to create encrypted file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read and decrypt encrypted file
   */
  static readEncryptedFile(fileContent: string, password: string): DecryptionResult {
    try {
      const file = JSON.parse(fileContent);

      if (file.version !== '1.0' || file.type !== 'encrypted-audit-log') {
        return {
          success: false,
          error: 'Invalid encrypted file format',
        };
      }

      return this.decrypt(file.encrypted, password);
    } catch (error) {
      console.error('Error reading encrypted file:', error);
      return {
        success: false,
        error: `Failed to read encrypted file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get encryption metadata without decrypting
   */
  static getEncryptionMetadata(fileContent: string): {
    success: boolean;
    metadata?: Record<string, any>;
    timestamp?: string;
    error?: string;
  } {
    try {
      const file = JSON.parse(fileContent);

      if (file.version !== '1.0' || file.type !== 'encrypted-audit-log') {
        return {
          success: false,
          error: 'Invalid encrypted file format',
        };
      }

      return {
        success: true,
        metadata: file.metadata,
        timestamp: file.timestamp,
      };
    } catch (error) {
      console.error('Error reading encryption metadata:', error);
      return {
        success: false,
        error: `Failed to read metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Verify encryption integrity
   */
  static verifyIntegrity(encryptedData: EncryptedData): boolean {
    try {
      // Check required fields
      if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag || !encryptedData.salt) {
        return false;
      }

      // Verify hex format
      if (!/^[0-9a-f]*$/.test(encryptedData.encrypted)) return false;
      if (!/^[0-9a-f]*$/.test(encryptedData.iv)) return false;
      if (!/^[0-9a-f]*$/.test(encryptedData.authTag)) return false;
      if (!/^[0-9a-f]*$/.test(encryptedData.salt)) return false;

      // Verify lengths
      if (encryptedData.iv.length !== this.IV_LENGTH * 2) return false;
      if (encryptedData.authTag.length !== this.AUTH_TAG_LENGTH * 2) return false;
      if (encryptedData.salt.length !== this.SALT_LENGTH * 2) return false;

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Client-side decryption helper for encrypted audit log files
 * This utility helps users decrypt exported audit logs that were encrypted with a password
 */

export interface EncryptedAuditFile {
  version: string;
  type: string;
  timestamp: string;
  metadata: Record<string, any>;
  encrypted: {
    encrypted: string;
    iv: string;
    authTag: string;
    salt: string;
    algorithm: string;
  };
}

/**
 * Parse an encrypted audit log file
 */
export function parseEncryptedFile(fileContent: string): {
  success: boolean;
  file?: EncryptedAuditFile;
  error?: string;
} {
  try {
    const file = JSON.parse(fileContent) as EncryptedAuditFile;

    if (file.version !== '1.0' || file.type !== 'encrypted-audit-log') {
      return {
        success: false,
        error: 'Invalid encrypted file format. Expected version 1.0 and type encrypted-audit-log.',
      };
    }

    if (!file.encrypted || !file.encrypted.encrypted || !file.encrypted.iv || !file.encrypted.authTag || !file.encrypted.salt) {
      return {
        success: false,
        error: 'Encrypted file is missing required fields.',
      };
    }

    return {
      success: true,
      file,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get metadata from encrypted file without decrypting
 */
export function getEncryptedFileMetadata(fileContent: string): {
  success: boolean;
  metadata?: {
    timestamp: string;
    format?: string;
    action?: string;
  };
  error?: string;
} {
  const parsed = parseEncryptedFile(fileContent);
  if (!parsed.success || !parsed.file) {
    return {
      success: false,
      error: parsed.error,
    };
  }

  return {
    success: true,
    metadata: {
      timestamp: parsed.file.timestamp,
      format: parsed.file.metadata?.format,
      action: parsed.file.metadata?.action,
    },
  };
}

/**
 * Instructions for decrypting audit logs
 */
export const DECRYPTION_INSTRUCTIONS = `
# Decrypting Encrypted Audit Logs

Your exported audit logs are encrypted with AES-256-GCM encryption. To decrypt them:

## Option 1: Using Node.js (Recommended for Developers)

\`\`\`javascript
const crypto = require('crypto');
const fs = require('fs');

function decryptAuditLog(filePath, password) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const file = JSON.parse(fileContent);
  const encrypted = file.encrypted;

  // Derive key from password
  const salt = Buffer.from(encrypted.salt, 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

  // Prepare decryption
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

const password = 'your-encryption-password';
const decrypted = decryptAuditLog('webhook-audit-log-encrypted-2026-01-30.json', password);
console.log(decrypted);
\`\`\`

## Option 2: Using Python

\`\`\`python
import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes

def decrypt_audit_log(file_path, password):
    with open(file_path, 'r') as f:
        file_data = json.load(f)
    
    encrypted = file_data['encrypted']
    
    # Derive key from password
    salt = bytes.fromhex(encrypted['salt'])
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    
    # Prepare decryption
    iv = bytes.fromhex(encrypted['iv'])
    auth_tag = bytes.fromhex(encrypted['authTag'])
    cipher_text = bytes.fromhex(encrypted['encrypted'])
    
    # Decrypt
    cipher = AESGCM(key)
    decrypted = cipher.decrypt(iv, cipher_text + auth_tag, None)
    
    return decrypted.decode('utf8')

password = 'your-encryption-password'
decrypted = decrypt_audit_log('webhook-audit-log-encrypted-2026-01-30.json', password)
print(decrypted)
\`\`\`

## Option 3: Using OpenSSL (Command Line)

Note: OpenSSL has limitations with GCM mode. For best results, use Node.js or Python.

## Security Notes

- **Password Storage**: Keep your encryption password in a secure location (password manager, secure vault)
- **File Integrity**: The encryption includes authentication tags to detect tampering
- **Algorithm**: AES-256-GCM provides both encryption and authentication
- **Key Derivation**: PBKDF2 with 100,000 iterations is used to derive the encryption key from your password

## Troubleshooting

**"Failed to decrypt data"**
- Verify the password is correct
- Ensure the file hasn't been corrupted or modified
- Check that the file format is valid JSON

**"Invalid encrypted file format"**
- The file may not be a valid encrypted audit log export
- Check the file extension (.json for encrypted files)

## Support

If you encounter issues decrypting your audit logs, contact support with:
- File name and timestamp
- Error message received
- (Do NOT share the password or encrypted file content)
`;

/**
 * Generate a decryption script for the user
 */
export function generateDecryptionScript(format: 'nodejs' | 'python' = 'nodejs'): string {
  if (format === 'python') {
    return `import json
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes

def decrypt_audit_log(file_path, password):
    with open(file_path, 'r') as f:
        file_data = json.load(f)
    
    encrypted = file_data['encrypted']
    salt = bytes.fromhex(encrypted['salt'])
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    
    iv = bytes.fromhex(encrypted['iv'])
    auth_tag = bytes.fromhex(encrypted['authTag'])
    cipher_text = bytes.fromhex(encrypted['encrypted'])
    
    cipher = AESGCM(key)
    decrypted = cipher.decrypt(iv, cipher_text + auth_tag, None)
    
    return decrypted.decode('utf8')

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python decrypt_audit.py <file_path> <password>')
        sys.exit(1)
    
    file_path = sys.argv[1]
    password = sys.argv[2]
    
    try:
        decrypted = decrypt_audit_log(file_path, password)
        print(decrypted)
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        sys.exit(1)`;
  }

  return `const crypto = require('crypto');
const fs = require('fs');

function decryptAuditLog(filePath, password) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const file = JSON.parse(fileContent);
  const encrypted = file.encrypted;

  // Derive key from password
  const salt = Buffer.from(encrypted.salt, 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

  // Prepare decryption
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node decrypt_audit.js <file_path> <password>');
  process.exit(1);
}

const filePath = args[0];
const password = args[1];

try {
  const decrypted = decryptAuditLog(filePath, password);
  console.log(decrypted);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}`;
}

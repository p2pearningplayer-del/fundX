// ==============================================================================
// FundX Panel — Cryptographic Engine & PII Security Vault
// Standards: AES-256-GCM at rest, Bcrypt cost factor 12, RBI IFSC Regex
// ==============================================================================

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit auth tag

// Ensure 32-byte key for AES-256
function getMasterKey(): Buffer {
  const secret = process.env.AES_256_PII_SECRET_KEY || 'fundx_enterprise_master_key_32_bytes_len_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive PII plaintext using AES-256-GCM with authenticated tags.
 * Output format: <iv_hex>:<auth_tag_hex>:<cipher_hex>
 */
export function encryptPII(plaintext: string): string {
  if (!plaintext) return '';
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted PII payload with authentication verification.
 */
export function decryptPII(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('Cryptographic PII decryption failed:', err);
    return '[ENCRYPTED_VAULT_RECORD]';
  }
}

/**
 * Masks bank account number according to PRD spec (e.g. XXXX-XXXX-1234)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  const lastFour = clean.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}

/**
 * RBI IFSC format validation regex: ^[A-Z]{4}0[A-Z0-9]{6}$
 * First 4 letters: Bank code
 * 5th character: Always 0 (reserved for future use)
 * Last 6 characters: Branch code (alphanumeric)
 */
export function validateIFSC(ifsc: string): boolean {
  if (!ifsc) return false;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.trim().toUpperCase());
}

/**
 * Fuzzy match between profile legal name and bank account holder name
 */
export function fuzzyMatchNames(profileName: string, accountHolder: string): boolean {
  if (!profileName || !accountHolder) return false;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const n1 = normalize(profileName);
  const n2 = normalize(accountHolder);

  if (n1 === n2) return true;

  const tokens1 = n1.split(' ');
  const tokens2 = n2.split(' ');

  // Check token intersection
  const matchCount = tokens1.filter((t) => tokens2.includes(t)).length;
  const requiredMatches = Math.min(tokens1.length, tokens2.length);

  return matchCount >= Math.max(1, Math.floor(requiredMatches * 0.7));
}

/**
 * Bcrypt password hashing with PRD mandated cost factor 12
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plaintext, salt);
}

/**
 * Bcrypt password verification
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Generates an immutable HMAC-SHA256 signature for administrator audit log signing
 */
export function generateAuditSignature(adminId: string, action: string, payload: unknown, timestamp: string): string {
  const secret = process.env.JWT_ACCESS_SECRET || 'fundx_audit_secret_key_2026';
  const data = `${adminId}|${action}|${JSON.stringify(payload)}|${timestamp}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

import { ValueTransformer } from 'typeorm';
import CryptoJS from 'crypto-js';

/**
 * Marker prefix written in front of every value this transformer encrypts.
 * Values without the prefix are treated as legacy plaintext and returned as-is,
 * so existing rows keep working and are re-encrypted on their next write.
 */
const ENVELOPE_PREFIX = 'enc:v1:';

function secret(): string | null {
  const key = process.env.SECERT_KEY;
  return key && key.length > 0 ? key : null;
}

/**
 * Transparently encrypts sensitive column values (Meta access tokens, app secrets)
 * at rest, so a database dump or read-only DB compromise does not expose live
 * credentials for connected Instagram accounts.
 *
 * Applied via TypeORM's column `transformer`, which keeps every existing call
 * site reading `company.instagram_access_token` unchanged.
 */
export const SecretColumnTransformer: ValueTransformer = {
  to(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') return (value as any) ?? null;

    const key = secret();
    if (!key) {
      // Without a key we must not silently drop the credential; store as-is and warn loudly.
      console.error('[SECRET COLUMN] SECERT_KEY is not configured — storing sensitive column in plaintext.');
      return value;
    }

    // Already enveloped (e.g. a value round-tripped without being touched).
    if (value.startsWith(ENVELOPE_PREFIX)) return value;

    try {
      const cipher = CryptoJS.AES.encrypt(value, key).toString();
      return ENVELOPE_PREFIX + CryptoJS.enc.Base64.parse(cipher).toString(CryptoJS.enc.Hex);
    } catch (err: any) {
      console.error('[SECRET COLUMN] Encryption failed, storing plaintext:', err.message);
      return value;
    }
  },

  from(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') return (value as any) ?? null;

    // Legacy plaintext row written before encryption was introduced.
    if (!value.startsWith(ENVELOPE_PREFIX)) return value;

    const key = secret();
    if (!key) {
      console.error('[SECRET COLUMN] SECERT_KEY is not configured — cannot decrypt stored secret.');
      return null;
    }

    try {
      const hex = value.slice(ENVELOPE_PREFIX.length);
      const b64 = CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Base64);
      const plain = CryptoJS.AES.decrypt(b64, key).toString(CryptoJS.enc.Utf8);
      // A wrong key yields an empty string rather than throwing.
      return plain.length > 0 ? plain : null;
    } catch (err: any) {
      console.error('[SECRET COLUMN] Decryption failed for a stored secret:', err.message);
      return null;
    }
  }
};

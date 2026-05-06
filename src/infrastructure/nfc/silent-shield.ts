import { Buffer } from 'buffer';
import Crypto from 'react-native-quick-crypto';
import type { MbcCard } from '../../domain/entities/mbc-card';
import { encode, decode } from './mbc-card-codec';

/**
 * Silent Shield v1 — AES-256-GCM authenticated encryption for MBC card payload.
 *
 * Envelope format (binary):
 *   [magic 4B "MBC1"] [version 1B] [kid 1B] [alg 1B] [IV 12B] [authTag 16B] [ciphertext ...]
 *
 * For assessment MVP: demo key is bundled. Production must use secure key provisioning.
 */

const MAGIC = Buffer.from('MBC1', 'ascii');
const ENVELOPE_VERSION = 0x01;
const KEY_ID = 0x01;
const ALG_A256GCM = 0x01;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const HEADER_LENGTH = 4 + 1 + 1 + 1; // magic + version + kid + alg = 7

/**
 * Demo-only AES-256 key for assessment build (32 bytes).
 * NEVER use in production. Production must load from secure config / Android Keystore.
 */
const DEMO_KEY = Buffer.from(
  '4d42433153696c656e745368696c643031323334353637383941424344454647',
  'hex',
);

export type ShieldResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function encrypt(
  card: MbcCard,
  writeCounter: number,
): ShieldResult<Buffer> {
  const encodeResult = encode(card, writeCounter);
  if (!encodeResult.ok) {
    return { ok: false, error: encodeResult.error };
  }

  const plaintext = Buffer.from(encodeResult.value, 'utf8');
  const iv = Crypto.randomBytes(IV_LENGTH);

  const cipher = Crypto.createCipheriv('aes-256-gcm', DEMO_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope = Buffer.concat([
    MAGIC,
    Buffer.from([ENVELOPE_VERSION, KEY_ID, ALG_A256GCM]),
    iv,
    authTag,
    encrypted,
  ]);

  return { ok: true, value: envelope };
}

export function decrypt(
  envelope: Buffer,
): ShieldResult<{ card: MbcCard; writeCounter: number }> {
  if (envelope.length < HEADER_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    return { ok: false, error: 'ENVELOPE_TOO_SHORT' };
  }

  if (!isMbcEnvelope(envelope)) {
    return { ok: false, error: 'INVALID_MAGIC' };
  }

  const version = envelope[4];
  if (version !== ENVELOPE_VERSION) {
    return { ok: false, error: 'UNSUPPORTED_ENVELOPE_VERSION' };
  }

  const kid = envelope[5];
  if (kid !== KEY_ID) {
    return { ok: false, error: 'UNKNOWN_KEY_ID' };
  }

  const alg = envelope[6];
  if (alg !== ALG_A256GCM) {
    return { ok: false, error: 'UNSUPPORTED_ALGORITHM' };
  }

  const iv = Buffer.from(
    envelope.slice(HEADER_LENGTH, HEADER_LENGTH + IV_LENGTH),
  );
  const authTag = Buffer.from(
    envelope.slice(
      HEADER_LENGTH + IV_LENGTH,
      HEADER_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    ),
  );
  const ciphertext = Buffer.from(
    envelope.slice(HEADER_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH),
  );

  try {
    const decipher = Crypto.createDecipheriv('aes-256-gcm', DEMO_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    const json = decrypted.toString('utf8');
    return decode(json);
  } catch {
    return { ok: false, error: 'TAMPERED_CARD' };
  }
}

/**
 * Checks if a raw buffer starts with the MBC1 magic marker.
 */
export function isMbcEnvelope(data: Buffer): boolean {
  if (data.length < 4) {
    return false;
  }
  return (
    data[0] === 0x4d && data[1] === 0x42 && data[2] === 0x43 && data[3] === 0x31
  ); // "MBC1"
}

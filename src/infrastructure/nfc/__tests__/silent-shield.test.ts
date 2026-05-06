jest.mock('react-native-quick-crypto', () => {
  const nodeCrypto = require('crypto');
  return {
    __esModule: true,
    default: {
      randomBytes: (size: number) => nodeCrypto.randomBytes(size),
      createCipheriv: (alg: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createCipheriv(alg, key, iv),
      createDecipheriv: (alg: string, key: Buffer, iv: Buffer) =>
        nodeCrypto.createDecipheriv(alg, key, iv),
    },
  };
});

import { encrypt, decrypt, isMbcEnvelope } from '../silent-shield';
import type { MbcCard } from '../../../domain/entities/mbc-card';

const validCard: MbcCard = {
  version: 1,
  cardId: 'C000001',
  member: { memberId: 'M000001' },
  balance: 50000,
  currency: 'IDR',
  visitStatus: 'CHECKED_IN',
  activeSession: {
    activityId: 'ACT-1',
    activityType: 'PARKING',
    checkedInAt: '2026-05-06T10:00:00+07:00',
  },
  transactionLogs: [
    {
      id: 'L1',
      activity: 'REGISTER',
      nominal: 0,
      occurredAt: '2026-05-06T09:00:00+07:00',
    },
    {
      id: 'L2',
      activity: 'TOP_UP',
      nominal: 50000,
      occurredAt: '2026-05-06T09:05:00+07:00',
    },
  ],
};

describe('Silent Shield', () => {
  it('encrypts and decrypts a valid card roundtrip', () => {
    const encResult = encrypt(validCard, 5);
    expect(encResult.ok).toBe(true);
    if (!encResult.ok) {
      return;
    }

    const decResult = decrypt(encResult.value);
    expect(decResult.ok).toBe(true);
    if (!decResult.ok) {
      return;
    }

    expect(decResult.value.card.cardId).toBe('C000001');
    expect(decResult.value.card.balance).toBe(50000);
    expect(decResult.value.card.visitStatus).toBe('CHECKED_IN');
    expect(decResult.value.writeCounter).toBe(5);
  });

  it('produces different ciphertext each time (fresh IV)', () => {
    const r1 = encrypt(validCard, 1);
    const r2 = encrypt(validCard, 1);
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) {
      return;
    }
    expect(r1.value.equals(r2.value)).toBe(false);
  });

  it('detects tampered ciphertext', () => {
    const encResult = encrypt(validCard, 1);
    expect(encResult.ok).toBe(true);
    if (!encResult.ok) {
      return;
    }

    // Flip a byte in the ciphertext area
    const tampered = Buffer.from(encResult.value);
    // eslint-disable-next-line no-bitwise
    tampered[tampered.length - 1] ^= 0xff;

    const decResult = decrypt(tampered);
    expect(decResult).toEqual({ ok: false, error: 'TAMPERED_CARD' });
  });

  it('detects tampered auth tag', () => {
    const encResult = encrypt(validCard, 1);
    expect(encResult.ok).toBe(true);
    if (!encResult.ok) {
      return;
    }

    const tampered = Buffer.from(encResult.value);
    // Auth tag starts at offset 7 + 12 = 19
    // eslint-disable-next-line no-bitwise
    tampered[19] ^= 0xff;

    const decResult = decrypt(tampered);
    expect(decResult).toEqual({ ok: false, error: 'TAMPERED_CARD' });
  });

  it('rejects envelope too short', () => {
    const result = decrypt(Buffer.from('MBC1'));
    expect(result).toEqual({ ok: false, error: 'ENVELOPE_TOO_SHORT' });
  });

  it('rejects invalid magic', () => {
    const buf = Buffer.alloc(50, 0);
    buf.write('XXXX', 0, 'ascii');
    expect(decrypt(buf)).toEqual({ ok: false, error: 'INVALID_MAGIC' });
  });

  it('rejects unsupported envelope version', () => {
    const encResult = encrypt(validCard, 1);
    if (!encResult.ok) {
      return;
    }
    const tampered = Buffer.from(encResult.value);
    tampered[4] = 0x99; // bad version
    expect(decrypt(tampered)).toEqual({
      ok: false,
      error: 'UNSUPPORTED_ENVELOPE_VERSION',
    });
  });

  it('rejects unknown key ID', () => {
    const encResult = encrypt(validCard, 1);
    if (!encResult.ok) {
      return;
    }
    const tampered = Buffer.from(encResult.value);
    tampered[5] = 0x99; // bad kid
    expect(decrypt(tampered)).toEqual({ ok: false, error: 'UNKNOWN_KEY_ID' });
  });

  it('rejects unsupported algorithm', () => {
    const encResult = encrypt(validCard, 1);
    if (!encResult.ok) {
      return;
    }
    const tampered = Buffer.from(encResult.value);
    tampered[6] = 0x99; // bad alg
    expect(decrypt(tampered)).toEqual({
      ok: false,
      error: 'UNSUPPORTED_ALGORITHM',
    });
  });

  it('propagates codec validation errors', () => {
    const badCard: MbcCard = { ...validCard, balance: -1 };
    const result = encrypt(badCard, 1);
    expect(result).toEqual({ ok: false, error: 'INVALID_BALANCE' });
  });

  describe('isMbcEnvelope', () => {
    it('returns true for valid MBC1 envelope', () => {
      const encResult = encrypt(validCard, 1);
      if (!encResult.ok) {
        return;
      }
      expect(isMbcEnvelope(encResult.value)).toBe(true);
    });

    it('returns false for non-MBC data', () => {
      expect(isMbcEnvelope(Buffer.from('hello world'))).toBe(false);
    });

    it('returns false for too-short buffer', () => {
      expect(isMbcEnvelope(Buffer.from('MB'))).toBe(false);
    });
  });
});

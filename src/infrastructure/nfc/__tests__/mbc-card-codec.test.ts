import { encode, decode } from '@infrastructure/nfc/mbc-card-codec';
import type { MbcCard } from '@domain/entities/mbc-card';

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
    {
      id: 'L3',
      activity: 'CHECK_IN',
      nominal: 0,
      occurredAt: '2026-05-06T10:00:00+07:00',
    },
  ],
};

describe('mbc-card-codec', () => {
  describe('encode', () => {
    it('encodes a valid card to compact JSON', () => {
      const result = encode(validCard, 3);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      const parsed = JSON.parse(result.value);
      expect(parsed.v).toBe(1);
      expect(parsed.c).toBe('C000001');
      expect(parsed.m).toBe('M000001');
      expect(parsed.b).toBe(50000);
      expect(parsed.i).toEqual({ a: 1, t: '2026-05-06T10:00:00+07:00' });
      expect(parsed.x).toHaveLength(3);
      expect(parsed.x[0]).toEqual(['R', 0, '2026-05-06T09:00:00+07:00']);
      expect(parsed.n).toBe(3);
    });

    it('encodes NOT_CHECKED_IN card with i:null', () => {
      const card: MbcCard = {
        ...validCard,
        visitStatus: 'NOT_CHECKED_IN',
        activeSession: undefined,
      };
      const result = encode(card, 1);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      expect(JSON.parse(result.value).i).toBeNull();
    });

    it('rejects negative balance', () => {
      const card: MbcCard = { ...validCard, balance: -1 };
      const result = encode(card, 1);
      expect(result).toEqual({ ok: false, error: 'INVALID_BALANCE' });
    });

    it('rejects missing cardId', () => {
      const card: MbcCard = { ...validCard, cardId: '' };
      const result = encode(card, 1);
      expect(result).toEqual({ ok: false, error: 'MISSING_CARD_ID' });
    });

    it('rejects missing memberId', () => {
      const card: MbcCard = { ...validCard, member: { memberId: '' } };
      const result = encode(card, 1);
      expect(result).toEqual({ ok: false, error: 'MISSING_MEMBER_ID' });
    });

    it('rejects negative counter', () => {
      const result = encode(validCard, -1);
      expect(result).toEqual({ ok: false, error: 'INVALID_COUNTER' });
    });

    it('rejects more than 5 transaction logs', () => {
      const logs = Array.from({ length: 6 }, (_, i) => ({
        id: `L${i}`,
        activity: 'TOP_UP' as const,
        nominal: 10000,
        occurredAt: '2026-05-06T09:00:00+07:00',
      }));
      const card: MbcCard = { ...validCard, transactionLogs: logs };
      const result = encode(card, 1);
      expect(result).toEqual({
        ok: false,
        error: 'TRANSACTION_LOGS_EXCEED_MAX',
      });
    });

    it('rejects invalid check-in (missing checkedInAt)', () => {
      const card: MbcCard = {
        ...validCard,
        activeSession: {
          activityId: 'A1',
          activityType: 'PARKING',
          checkedInAt: '',
        },
      };
      const result = encode(card, 1);
      expect(result).toEqual({ ok: false, error: 'INVALID_CHECK_IN' });
    });

    it('rejects oversized payload', () => {
      const logs = Array.from({ length: 5 }, (_, i) => ({
        id: `L${i}`,
        activity: 'TOP_UP' as const,
        nominal: 10000,
        occurredAt: 'A'.repeat(60),
      }));
      const card: MbcCard = {
        ...validCard,
        cardId: 'X'.repeat(50),
        member: { memberId: 'Y'.repeat(50) },
        transactionLogs: logs,
      };
      const result = encode(card, 1);
      expect(result).toEqual({ ok: false, error: 'PAYLOAD_EXCEEDS_CAPACITY' });
    });

    it('fits worst-case 5-log payload within NTAG215 budget', () => {
      const logs = Array.from({ length: 5 }, (_, i) => ({
        id: `L${i}`,
        activity: (
          ['REGISTER', 'TOP_UP', 'CHECK_IN', 'CHECK_OUT', 'TOP_UP'] as const
        )[i],
        nominal: i === 3 ? 99999999 : i === 1 || i === 4 ? 99999999 : 0,
        occurredAt: '2026-12-31T23:59:59+07:00',
      }));
      const card: MbcCard = {
        ...validCard,
        cardId: 'MBC-C0000001',
        member: { memberId: 'MBC-M0000001' },
        balance: 99999999,
        activeSession: {
          activityId: 'ACT-1',
          activityType: 'PARKING',
          checkedInAt: '2026-12-31T23:59:59+07:00',
        },
        transactionLogs: logs,
      };
      const result = encode(card, 99999);
      expect(result.ok).toBe(true);
    });
  });

  describe('decode', () => {
    it('decodes a valid compact payload back to MbcCard', () => {
      const encResult = encode(validCard, 3);
      expect(encResult.ok).toBe(true);
      if (!encResult.ok) {
        return;
      }

      const decResult = decode(encResult.value);
      expect(decResult.ok).toBe(true);
      if (!decResult.ok) {
        return;
      }

      expect(decResult.value.writeCounter).toBe(3);
      expect(decResult.value.card.cardId).toBe('C000001');
      expect(decResult.value.card.member.memberId).toBe('M000001');
      expect(decResult.value.card.balance).toBe(50000);
      expect(decResult.value.card.visitStatus).toBe('CHECKED_IN');
      expect(decResult.value.card.activeSession?.checkedInAt).toBe(
        '2026-05-06T10:00:00+07:00',
      );
      expect(decResult.value.card.transactionLogs).toHaveLength(3);
      expect(decResult.value.card.transactionLogs[0].activity).toBe('REGISTER');
    });

    it('decodes NOT_CHECKED_IN payload', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [],
        n: 0,
      });
      const result = decode(payload);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      expect(result.value.card.visitStatus).toBe('NOT_CHECKED_IN');
      expect(result.value.card.activeSession).toBeUndefined();
    });

    it('rejects invalid JSON', () => {
      expect(decode('not json')).toEqual({ ok: false, error: 'INVALID_JSON' });
    });

    it('rejects unsupported version', () => {
      const payload = JSON.stringify({
        v: 99,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'UNSUPPORTED_VERSION',
      });
    });

    it('rejects missing card ID', () => {
      const payload = JSON.stringify({
        v: 1,
        c: '',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({ ok: false, error: 'MISSING_CARD_ID' });
    });

    it('rejects missing member ID', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: '',
        b: 0,
        s: 'A',
        i: null,
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'MISSING_MEMBER_ID',
      });
    });

    it('rejects negative balance', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: -5,
        s: 'A',
        i: null,
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({ ok: false, error: 'INVALID_BALANCE' });
    });

    it('rejects invalid counter', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [],
        n: -1,
      });
      expect(decode(payload)).toEqual({ ok: false, error: 'INVALID_COUNTER' });
    });

    it('rejects more than 5 transaction logs', () => {
      const x = Array.from({ length: 6 }, () => [
        'R',
        0,
        '2026-01-01T00:00:00Z',
      ]);
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x,
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'TRANSACTION_LOGS_EXCEED_MAX',
      });
    });

    it('rejects invalid check-in structure (missing t)', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: { a: 1 },
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({ ok: false, error: 'INVALID_CHECK_IN' });
    });

    it('rejects invalid check-in structure (wrong a)', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: { a: 0, t: 'x' },
        x: [],
        n: 0,
      });
      expect(decode(payload)).toEqual({ ok: false, error: 'INVALID_CHECK_IN' });
    });

    it('rejects invalid transaction log entry (wrong tuple length)', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [['R', 0]],
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'INVALID_TRANSACTION_LOG_ENTRY',
      });
    });

    it('rejects invalid transaction log entry (unknown activity)', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [['Z', 0, 't']],
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'INVALID_TRANSACTION_LOG_ENTRY',
      });
    });

    it('rejects invalid transaction log entry (negative nominal)', () => {
      const payload = JSON.stringify({
        v: 1,
        c: 'C1',
        m: 'M1',
        b: 0,
        s: 'A',
        i: null,
        x: [['R', -1, 't']],
        n: 0,
      });
      expect(decode(payload)).toEqual({
        ok: false,
        error: 'INVALID_TRANSACTION_LOG_ENTRY',
      });
    });
  });
});

describe('mbc-card-codec – additional decode error paths', () => {
  it('rejects when x is not an array', () => {
    const raw = JSON.stringify({
      v: 1,
      c: 'C1',
      m: 'M1',
      b: 0,
      s: 'A',
      n: 0,
      x: 'not-array',
      i: null,
    });
    const result = decode(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('MISSING_TRANSACTION_LOGS');
  });

  it('rejects when check-in i is not an object', () => {
    const raw = JSON.stringify({
      v: 1,
      c: 'C1',
      m: 'M1',
      b: 0,
      s: 'A',
      n: 0,
      x: [],
      i: 'string',
    });
    const result = decode(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('INVALID_CHECK_IN');
  });

  it('rejects when transaction log time is not a string', () => {
    const raw = JSON.stringify({
      v: 1,
      c: 'C1',
      m: 'M1',
      b: 0,
      s: 'A',
      n: 0,
      x: [['R', 0, 123]],
      i: null,
    });
    const result = decode(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('INVALID_TRANSACTION_LOG_ENTRY');
  });
});

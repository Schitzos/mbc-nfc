import { Buffer } from 'node:buffer';
import type {
  MbcCard,
  MbcActivity,
  VisitStatus,
} from '../../domain/entities/mbc-card';

const SUPPORTED_VERSION = 1;
const MAX_TRANSACTION_LOGS = 5;

/**
 * Safe plaintext budget after accounting for:
 * - NDEF record overhead (~7 bytes for text record header)
 * - Silent Shield envelope: magic(4) + version(1) + kid(1) + alg(1) + IV(12) + authTag(16) = 35 bytes
 * - Base64URL encoding expansion (×4/3) as worst-case NDEF text fallback
 *
 * Calculation: floor((504 - 7) × 3/4) - 35 = 337 bytes available for compact JSON plaintext.
 */
const SAFE_PLAINTEXT_BUDGET = 337;

const ACTIVITY_TO_COMPACT: Record<MbcActivity, string> = {
  REGISTER: 'R',
  TOP_UP: 'U',
  CHECK_IN: 'I',
  CHECK_OUT: 'O',
};

const COMPACT_TO_ACTIVITY: Record<string, MbcActivity> = {
  R: 'REGISTER',
  U: 'TOP_UP',
  I: 'CHECK_IN',
  O: 'CHECK_OUT',
};

export type CompactPayload = {
  v: number;
  c: string;
  m: string;
  b: number;
  i: { a: number; t: string } | null;
  x: [string, number, string][];
  n: number;
};

export type CodecResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function encode(
  card: MbcCard,
  writeCounter: number,
): CodecResult<string> {
  const validationError = validateCard(card, writeCounter);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const compact: CompactPayload = {
    v: SUPPORTED_VERSION,
    c: card.cardId,
    m: card.member.memberId,
    b: card.balance,
    i: card.activeSession ? { a: 1, t: card.activeSession.checkedInAt } : null,
    x: card.transactionLogs
      .slice(-MAX_TRANSACTION_LOGS)
      .map(log => [
        ACTIVITY_TO_COMPACT[log.activity],
        log.nominal,
        log.occurredAt,
      ]),
    n: writeCounter,
  };

  const json = JSON.stringify(compact);

  if (Buffer.byteLength(json, 'utf8') > SAFE_PLAINTEXT_BUDGET) {
    return { ok: false, error: 'PAYLOAD_EXCEEDS_CAPACITY' };
  }

  return { ok: true, value: json };
}

export function decode(
  raw: string,
): CodecResult<{ card: MbcCard; writeCounter: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'INVALID_JSON' };
  }

  const p = parsed as Partial<CompactPayload>;

  if (p.v !== SUPPORTED_VERSION) {
    return { ok: false, error: 'UNSUPPORTED_VERSION' };
  }
  if (!p.c || typeof p.c !== 'string') {
    return { ok: false, error: 'MISSING_CARD_ID' };
  }
  if (!p.m || typeof p.m !== 'string') {
    return { ok: false, error: 'MISSING_MEMBER_ID' };
  }
  if (typeof p.b !== 'number' || p.b < 0) {
    return { ok: false, error: 'INVALID_BALANCE' };
  }
  if (typeof p.n !== 'number' || p.n < 0) {
    return { ok: false, error: 'INVALID_COUNTER' };
  }
  if (!Array.isArray(p.x)) {
    return { ok: false, error: 'MISSING_TRANSACTION_LOGS' };
  }
  if (p.x.length > MAX_TRANSACTION_LOGS) {
    return { ok: false, error: 'TRANSACTION_LOGS_EXCEED_MAX' };
  }

  const checkInError = validateCheckIn(p.i);
  if (checkInError) {
    return { ok: false, error: checkInError };
  }

  const logsError = validateLogs(p.x);
  if (logsError) {
    return { ok: false, error: logsError };
  }

  const visitStatus: VisitStatus = p.i ? 'CHECKED_IN' : 'NOT_CHECKED_IN';

  const card: MbcCard = {
    version: SUPPORTED_VERSION,
    cardId: p.c,
    member: { memberId: p.m },
    balance: p.b,
    currency: 'IDR',
    visitStatus,
    activeSession: p.i
      ? {
          activityId: `ACT-${p.c}`,
          activityType: 'PARKING',
          checkedInAt: p.i.t,
        }
      : undefined,
    transactionLogs: p.x.map((tuple, idx) => ({
      id: `${p.c}-LOG-${idx}`,
      activity:
        /* istanbul ignore next */ COMPACT_TO_ACTIVITY[tuple[0]] ?? 'REGISTER',
      nominal: tuple[1],
      occurredAt: tuple[2],
    })),
  };

  return { ok: true, value: { card, writeCounter: p.n } };
}

function validateCard(card: MbcCard, writeCounter: number): string | null {
  if (!card.cardId) {
    return 'MISSING_CARD_ID';
  }
  if (!card.member?.memberId) {
    return 'MISSING_MEMBER_ID';
  }
  if (card.balance < 0) {
    return 'INVALID_BALANCE';
  }
  if (writeCounter < 0) {
    return 'INVALID_COUNTER';
  }
  if (card.transactionLogs.length > MAX_TRANSACTION_LOGS) {
    return 'TRANSACTION_LOGS_EXCEED_MAX';
  }
  if (card.activeSession && !card.activeSession.checkedInAt) {
    return 'INVALID_CHECK_IN';
  }
  return null;
}

function validateCheckIn(i: unknown): string | null {
  if (i === null || i === undefined) {
    return null;
  }
  if (typeof i !== 'object') {
    return 'INVALID_CHECK_IN';
  }
  const obj = i as Record<string, unknown>;
  if (obj.a !== 1) {
    return 'INVALID_CHECK_IN';
  }
  if (typeof obj.t !== 'string' || !obj.t) {
    return 'INVALID_CHECK_IN';
  }
  return null;
}

function validateLogs(x: unknown[]): string | null {
  for (const entry of x) {
    if (!Array.isArray(entry) || entry.length !== 3) {
      return 'INVALID_TRANSACTION_LOG_ENTRY';
    }
    const [activity, nominal, time] = entry;
    if (typeof activity !== 'string' || !COMPACT_TO_ACTIVITY[activity]) {
      return 'INVALID_TRANSACTION_LOG_ENTRY';
    }
    if (typeof nominal !== 'number' || nominal < 0) {
      return 'INVALID_TRANSACTION_LOG_ENTRY';
    }
    if (typeof time !== 'string' || !time) {
      return 'INVALID_TRANSACTION_LOG_ENTRY';
    }
  }
  return null;
}

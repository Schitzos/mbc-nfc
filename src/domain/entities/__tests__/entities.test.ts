import {
  PARKING_TARIFF_PER_STARTED_HOUR,
  type MbcCard,
  type MbcActivity,
  type MbcRole,
  type VisitStatus,
  type BenefitActivityType,
  type CurrencyCode,
  type ActivitySession,
  type MemberProfile,
  type TransactionLog,
  type LedgerEntry,
} from '../mbc-card';
import type { StationLedgerSummary } from '../station-ledger-summary';

describe('domain/entities/mbc-card', () => {
  it('exports PARKING_TARIFF_PER_STARTED_HOUR as 2000', () => {
    expect(PARKING_TARIFF_PER_STARTED_HOUR).toBe(2000);
  });

  it('MbcCard can be constructed with all required fields', () => {
    const card: MbcCard = {
      version: 1,
      cardId: 'CARD-001',
      member: { memberId: 'MEM-001' },
      balance: 50000,
      currency: 'IDR',
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    };
    expect(card.version).toBe(1);
    expect(card.balance).toBe(50000);
    expect(card.activeSession).toBeUndefined();
  });

  it('MbcCard supports checked-in state with activeSession', () => {
    const session: ActivitySession = {
      activityId: 'ACT-001',
      activityType: 'PARKING',
      checkedInAt: '2026-05-07T10:00:00+07:00',
    };
    const card: MbcCard = {
      version: 1,
      cardId: 'CARD-002',
      member: { memberId: 'MEM-002', displayName: 'John' },
      balance: 30000,
      currency: 'IDR',
      visitStatus: 'CHECKED_IN',
      activeSession: session,
      transactionLogs: [],
    };
    expect(card.visitStatus).toBe('CHECKED_IN');
    expect(card.activeSession?.activityType).toBe('PARKING');
    expect(card.member.displayName).toBe('John');
  });

  it('TransactionLog holds activity, nominal, and time', () => {
    const log: TransactionLog = {
      id: 'LOG-001',
      activity: 'TOP_UP',
      nominal: 50000,
      occurredAt: '2026-05-07T09:00:00+07:00',
    };
    expect(log.activity).toBe('TOP_UP');
    expect(log.nominal).toBe(50000);
  });

  it('LedgerEntry holds role, action, and optional fields', () => {
    const entry: LedgerEntry = {
      id: 'LEDGER-001',
      role: 'STATION',
      action: 'REGISTER',
      maskedMemberReference: 'MEM-***-001',
      occurredAt: '2026-05-07T09:00:00+07:00',
    };
    expect(entry.role).toBe('STATION');
    expect(entry.amount).toBeUndefined();
    expect(entry.deviceId).toBeUndefined();
  });

  it('LedgerEntry supports all optional fields', () => {
    const entry: LedgerEntry = {
      id: 'LEDGER-002',
      role: 'TERMINAL',
      action: 'CHECK_OUT',
      maskedMemberReference: 'MEM-***-002',
      activityType: 'PARKING',
      amount: 4000,
      occurredAt: '2026-05-07T12:00:00+07:00',
      deviceId: 'DEV-001',
    };
    expect(entry.amount).toBe(4000);
    expect(entry.activityType).toBe('PARKING');
    expect(entry.deviceId).toBe('DEV-001');
  });

  it('MemberProfile supports optional displayName', () => {
    const withName: MemberProfile = { memberId: 'M1', displayName: 'Alice' };
    const withoutName: MemberProfile = { memberId: 'M2' };
    expect(withName.displayName).toBe('Alice');
    expect(withoutName.displayName).toBeUndefined();
  });

  it('VisitStatus covers both values', () => {
    const statuses: VisitStatus[] = ['NOT_CHECKED_IN', 'CHECKED_IN'];
    expect(statuses).toHaveLength(2);
  });

  it('MbcActivity covers all four values', () => {
    const activities: MbcActivity[] = [
      'REGISTER',
      'TOP_UP',
      'CHECK_IN',
      'CHECK_OUT',
    ];
    expect(activities).toHaveLength(4);
  });

  it('MbcRole covers all four values', () => {
    const roles: MbcRole[] = ['STATION', 'GATE', 'TERMINAL', 'SCOUT'];
    expect(roles).toHaveLength(4);
  });

  it('BenefitActivityType is PARKING for MVP', () => {
    const type: BenefitActivityType = 'PARKING';
    expect(type).toBe('PARKING');
  });

  it('CurrencyCode is IDR', () => {
    const code: CurrencyCode = 'IDR';
    expect(code).toBe('IDR');
  });
});

describe('domain/entities/station-ledger-summary', () => {
  it('StationLedgerSummary can be constructed with all fields', () => {
    const summary: StationLedgerSummary = {
      topUpTotal: 200000,
      checkoutTotal: 8000,
      registerCount: 5,
      topUpCount: 4,
      checkoutCount: 2,
      latestEntries: [
        {
          id: 'L-001',
          role: 'STATION',
          action: 'TOP_UP',
          amount: 50000,
          occurredAt: '2026-05-07T10:00:00+07:00',
        },
      ],
    };
    expect(summary.topUpTotal).toBe(200000);
    expect(summary.latestEntries).toHaveLength(1);
  });

  it('StationLedgerSummary supports empty latestEntries', () => {
    const summary: StationLedgerSummary = {
      topUpTotal: 0,
      checkoutTotal: 0,
      registerCount: 0,
      topUpCount: 0,
      checkoutCount: 0,
      latestEntries: [],
    };
    expect(summary.latestEntries).toHaveLength(0);
    expect(summary.registerCount).toBe(0);
  });
});

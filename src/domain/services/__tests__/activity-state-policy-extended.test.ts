import {
  applyCheckInState,
  applyCheckOutState,
} from '../activity-state-policy';
import type { MbcCard } from '../../entities/mbc-card';
import { DomainError } from '../../errors/domain-error';

const baseCard: MbcCard = {
  version: 1,
  cardId: 'card-001',
  member: { memberId: 'member-001' },
  balance: 50000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

describe('activityStatePolicy – extended branch coverage', () => {
  it('rejects check-in with an invalid ISO timestamp', () => {
    expect(() =>
      applyCheckInState(baseCard, {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: 'not-a-valid-date',
      }),
    ).toThrow(DomainError);
  });

  it('supports GENERIC activity type for check-in (not hardcoded to parking)', () => {
    const result = applyCheckInState(baseCard, {
      activityId: 'co-working-space',
      activityType: 'GENERIC',
      checkedInAt: '2026-05-01T10:00:00.000Z',
    });

    expect(result.activeSession?.activityType).toBe('GENERIC');
    expect(result.activeSession?.activityId).toBe('co-working-space');
  });

  it('rejects checkout when activeSession is missing even if visitStatus is CHECKED_IN', () => {
    const inconsistentCard: MbcCard = {
      ...baseCard,
      visitStatus: 'CHECKED_IN',
      activeSession: undefined,
    };

    expect(() =>
      applyCheckOutState(inconsistentCard, { chargedAmount: 2000 }),
    ).toThrow(DomainError);
  });

  it('does not mutate the original card on successful check-in', () => {
    const original = { ...baseCard };
    applyCheckInState(baseCard, {
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    });

    expect(baseCard.visitStatus).toBe(original.visitStatus);
    expect(baseCard.activeSession).toBeUndefined();
  });

  it('does not mutate the original card on successful checkout', () => {
    const checkedInCard: MbcCard = {
      ...baseCard,
      balance: 10000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    const originalBalance = checkedInCard.balance;
    applyCheckOutState(checkedInCard, { chargedAmount: 2000 });

    expect(checkedInCard.balance).toBe(originalBalance);
    expect(checkedInCard.visitStatus).toBe('CHECKED_IN');
  });

  it('deducts exact charged amount on checkout', () => {
    const checkedInCard: MbcCard = {
      ...baseCard,
      balance: 10000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    const result = applyCheckOutState(checkedInCard, { chargedAmount: 10000 });
    expect(result.balance).toBe(0);
    expect(result.visitStatus).toBe('NOT_CHECKED_IN');
  });

  it('throws INSUFFICIENT_BALANCE when chargedAmount exceeds balance', () => {
    const checkedInCard: MbcCard = {
      ...baseCard,
      balance: 1000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    try {
      applyCheckOutState(checkedInCard, { chargedAmount: 2000 });
      fail('Expected DomainError');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe('INSUFFICIENT_BALANCE');
    }
  });
});

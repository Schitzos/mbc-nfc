import {
  applyCheckInState,
  applyCheckOutState,
} from '../activity-state-policy';
import type { MbcCard } from '../../entities/mbc-card';
import { DomainError } from '../../errors/domain-error';

const baseCard: MbcCard = {
  version: 1,
  cardId: 'card-001',
  member: {
    memberId: 'member-001',
  },
  balance: 50000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

describe('activityStatePolicy', () => {
  it('allows valid check-in from NOT_CHECKED_IN', () => {
    const checkedInCard = applyCheckInState(baseCard, {
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    });

    expect(checkedInCard.visitStatus).toBe('CHECKED_IN');
    expect(checkedInCard.activeSession).toEqual({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    });
  });

  it('prevents starting a second activity while one is active', () => {
    expect(() =>
      applyCheckInState(
        {
          ...baseCard,
          visitStatus: 'CHECKED_IN',
          activeSession: {
            activityId: 'parking-main-gate',
            activityType: 'PARKING',
            checkedInAt: '2026-05-01T08:00:00.000Z',
          },
        },
        {
          activityId: 'other-activity',
          activityType: 'GENERIC',
          checkedInAt: '2026-05-01T09:00:00.000Z',
        },
      ),
    ).toThrow(DomainError);
  });

  it('rejects double check-in', () => {
    expect(() =>
      applyCheckInState(
        {
          ...baseCard,
          visitStatus: 'CHECKED_IN',
        },
        {
          activityId: 'parking-main-gate',
          activityType: 'PARKING',
          checkedInAt: '2026-05-01T08:00:00.000Z',
        },
      ),
    ).toThrow(DomainError);
  });

  it('allows valid checkout and clears active state', () => {
    const checkedOutCard = applyCheckOutState(
      {
        ...baseCard,
        visitStatus: 'CHECKED_IN',
        activeSession: {
          activityId: 'parking-main-gate',
          activityType: 'PARKING',
          checkedInAt: '2026-05-01T08:00:00.000Z',
        },
      },
      {
        chargedAmount: 4000,
      },
    );

    expect(checkedOutCard.balance).toBe(46000);
    expect(checkedOutCard.visitStatus).toBe('NOT_CHECKED_IN');
    expect(checkedOutCard.activeSession).toBeUndefined();
  });

  it('rejects double check-out', () => {
    expect(() =>
      applyCheckOutState(baseCard, {
        chargedAmount: 4000,
      }),
    ).toThrow(DomainError);
  });

  it('does not mutate active card state when balance is insufficient', () => {
    const activeCard: MbcCard = {
      ...baseCard,
      balance: 1000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    expect(() =>
      applyCheckOutState(activeCard, {
        chargedAmount: 4000,
      }),
    ).toThrow(DomainError);
    expect(activeCard.visitStatus).toBe('CHECKED_IN');
    expect(activeCard.activeSession).toBeDefined();
    expect(activeCard.balance).toBe(1000);
  });
});

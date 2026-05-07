import type { MbcCard } from '@domain/entities/mbc-card';
import { DomainError } from '@domain/errors/domain-error';
import {
  appendTransactionLog,
  createTransactionLog,
} from '@domain/services/transaction-log-policy';

const baseCard: MbcCard = {
  version: 1,
  cardId: 'card-001',
  member: { memberId: 'member-001' },
  balance: 50000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

describe('transactionLogPolicy – extended branch coverage', () => {
  it('rejects invalid ISO timestamp in createTransactionLog', () => {
    expect(() =>
      createTransactionLog({
        id: 'log-bad',
        activity: 'TOP_UP',
        nominal: 5000,
        occurredAt: 'invalid-date-string',
      }),
    ).toThrow(DomainError);
  });

  it('does not mutate the original card when appending a log', () => {
    const log = createTransactionLog({
      id: 'log-1',
      activity: 'REGISTER',
      nominal: 0,
      occurredAt: '2026-05-01T08:00:00.000Z',
    });

    const result = appendTransactionLog(baseCard, log);

    expect(baseCard.transactionLogs).toHaveLength(0);
    expect(result.transactionLogs).toHaveLength(1);
  });

  it('preserves activeSession when appending a log to a checked-in card', () => {
    const checkedInCard: MbcCard = {
      ...baseCard,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    const log = createTransactionLog({
      id: 'log-checkin',
      activity: 'CHECK_IN',
      nominal: 0,
      occurredAt: '2026-05-01T08:00:00.000Z',
    });

    const result = appendTransactionLog(checkedInCard, log);
    expect(result.activeSession).toEqual(checkedInCard.activeSession);
  });

  it('handles card with no activeSession (undefined) correctly', () => {
    const log = createTransactionLog({
      id: 'log-topup',
      activity: 'TOP_UP',
      nominal: 10000,
      occurredAt: '2026-05-01T09:00:00.000Z',
    });

    const result = appendTransactionLog(baseCard, log);
    expect(result.activeSession).toBeUndefined();
  });

  it('FIFO removes oldest when adding a sixth record', () => {
    let card = baseCard;
    for (let i = 1; i <= 6; i++) {
      const log = createTransactionLog({
        id: `log-${i}`,
        activity: 'TOP_UP',
        nominal: i * 1000,
        occurredAt: `2026-05-0${i}T08:00:00.000Z`,
      });
      card = appendTransactionLog(card, log);
    }

    expect(card.transactionLogs).toHaveLength(5);
    expect(card.transactionLogs[0].id).toBe('log-2');
    expect(card.transactionLogs[4].id).toBe('log-6');
  });
});

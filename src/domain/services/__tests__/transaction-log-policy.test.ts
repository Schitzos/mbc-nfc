import type { MbcCard } from '../../entities/mbc-card';
import {
  appendTransactionLog,
  createTransactionLog,
} from '../transaction-log-policy';

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

describe('transactionLogPolicy', () => {
  it('keeps only the latest five logs', () => {
    const updatedCard = [1, 2, 3, 4, 5, 6].reduce((card, value) => {
      const log = createTransactionLog({
        id: `log-${value}`,
        activity: value === 1 ? 'REGISTER' : 'TOP_UP',
        nominal: value * 1000,
        occurredAt: `2026-05-0${Math.min(value, 9)}T08:00:00.000Z`,
      });

      return appendTransactionLog(card, log);
    }, baseCard);

    expect(updatedCard.transactionLogs).toHaveLength(5);
    expect(updatedCard.transactionLogs[0].id).toBe('log-2');
    expect(updatedCard.transactionLogs[4].id).toBe('log-6');
  });

  it('supports register, top-up, check-in, and checkout logs consistently', () => {
    const logs = [
      createTransactionLog({
        id: 'log-register',
        activity: 'REGISTER',
        nominal: 0,
        occurredAt: '2026-05-01T08:00:00.000Z',
      }),
      createTransactionLog({
        id: 'log-topup',
        activity: 'TOP_UP',
        nominal: 50000,
        occurredAt: '2026-05-01T08:05:00.000Z',
      }),
      createTransactionLog({
        id: 'log-checkin',
        activity: 'CHECK_IN',
        nominal: 0,
        occurredAt: '2026-05-01T09:00:00.000Z',
      }),
      createTransactionLog({
        id: 'log-checkout',
        activity: 'CHECK_OUT',
        nominal: 4000,
        occurredAt: '2026-05-01T11:00:00.000Z',
      }),
    ];

    const updatedCard = logs.reduce(appendTransactionLog, baseCard);

    expect(updatedCard.transactionLogs.map(log => log.activity)).toEqual([
      'REGISTER',
      'TOP_UP',
      'CHECK_IN',
      'CHECK_OUT',
    ]);
  });
});

import type { MbcCard } from '../entities/membership-card';
import {
  createTransactionLog,
  appendTransactionLog,
} from '../policies/transaction-log-policy';
import { createRandomId } from '@shared/utils/create-random-id';

export function createInitialCard(): MbcCard {
  const occurredAt = new Date().toISOString();
  const card: MbcCard = {
    version: 1,
    cardId: createRandomId('CARD'),
    member: { memberId: createRandomId('MEM') },
    balance: 0,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [],
  };

  return appendTransactionLog(
    card,
    createTransactionLog({
      id: createRandomId('LOG'),
      activity: 'REGISTER',
      nominal: 0,
      occurredAt,
    }),
  );
}

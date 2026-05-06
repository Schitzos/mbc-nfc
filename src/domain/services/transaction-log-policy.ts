import type {
  MbcActivity,
  MbcCard,
  TransactionLog,
} from '../entities/mbc-card';
import { DomainError } from '../errors/domain-error';

type CreateTransactionLogInput = {
  id: string;
  activity: MbcActivity;
  nominal: number;
  occurredAt: string;
};

function parseIsoDate(value: string): void {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new DomainError(
      'INVALID_TIMESTAMP',
      'Transaction logs must use valid ISO date strings.',
    );
  }
}

export function createTransactionLog(
  input: CreateTransactionLogInput,
): TransactionLog {
  parseIsoDate(input.occurredAt);

  return {
    id: input.id,
    activity: input.activity,
    nominal: input.nominal,
    occurredAt: input.occurredAt,
  };
}

export function appendTransactionLog(
  card: MbcCard,
  log: TransactionLog,
): MbcCard {
  const nextLogs = [...card.transactionLogs, log].slice(-5);

  return {
    ...card,
    member: { ...card.member },
    activeSession: card.activeSession ? { ...card.activeSession } : undefined,
    transactionLogs: nextLogs,
  };
}

/**
 * Thin DTO — intentionally re-uses domain value types (CurrencyCode, VisitStatus,
 * ActivitySession, TransactionLog) because this offline-first app has no serialization
 * boundary. Mapping to primitive-only fields would add boilerplate without benefit.
 */
import type { ActivitySession } from '@domain/membership/entities/activity-session';
import type { TransactionLog } from '@domain/membership/entities/transaction-log';
import type { VisitStatus } from '@domain/membership/types/card-status';
import type { CurrencyCode } from '@domain/membership/types/money';

export type CardSummaryDto = {
  cardId: string;
  memberName?: string;
  maskedMemberReference?: string;
  balance: number;
  currency: CurrencyCode;
  visitStatus: VisitStatus;
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};

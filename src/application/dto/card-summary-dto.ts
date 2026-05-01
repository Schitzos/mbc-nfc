import type {
  ActivitySession,
  CurrencyCode,
  TransactionLog,
  VisitStatus,
} from '../../domain/entities/mbc-card';

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

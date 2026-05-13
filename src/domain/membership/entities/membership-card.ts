import type { ActivitySession } from './activity-session';
import type { TransactionLog } from './transaction-log';
import type { VisitStatus } from '../types/card-status';
import type { CurrencyCode } from '../types/money';
import type { MemberProfile } from '../types/member-id';

export type MbcCard = {
  version: number;
  cardId: string;
  member: MemberProfile;
  balance: number;
  currency: CurrencyCode;
  visitStatus: VisitStatus;
  activeSession?: ActivitySession;
  transactionLogs: TransactionLog[];
};

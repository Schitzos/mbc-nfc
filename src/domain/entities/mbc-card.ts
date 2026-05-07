export type VisitStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN';

export type MbcActivity = 'REGISTER' | 'TOP_UP' | 'CHECK_IN' | 'CHECK_OUT';

export type BenefitActivityType = 'PARKING';

export type MbcRole = 'STATION' | 'GATE' | 'TERMINAL' | 'SCOUT';

export type CurrencyCode = 'IDR';

export type ActivitySession = {
  activityId: string;
  activityType: BenefitActivityType;
  checkedInAt: string;
};

export type MemberProfile = {
  memberId: string;
  displayName?: string;
};

export type TransactionLog = {
  id: string;
  activity: MbcActivity;
  nominal: number;
  occurredAt: string;
};

export type LedgerEntry = {
  id: string;
  role: MbcRole;
  action: MbcActivity;
  maskedMemberReference?: string;
  activityType?: BenefitActivityType;
  amount?: number;
  occurredAt: string;
  deviceId?: string;
};

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

/**
 * Fixed parking tariff: Rp 2.000 per started hour.
 * Defined once in the domain layer — import where needed.
 */
export const PARKING_TARIFF_PER_STARTED_HOUR = 2000;

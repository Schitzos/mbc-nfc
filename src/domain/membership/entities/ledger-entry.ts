import type {
  MbcRole,
  MbcActivity,
  BenefitActivityType,
} from '../types/card-status';

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

export type StationLedgerSummary = {
  topUpTotal: number;
  checkoutTotal: number;
  registerCount: number;
  topUpCount: number;
  checkoutCount: number;
  latestEntries: LedgerEntry[];
};

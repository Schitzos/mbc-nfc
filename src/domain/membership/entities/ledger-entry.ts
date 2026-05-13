import type { LedgerEntry } from './membership-card';

export type { LedgerEntry } from './membership-card';

export type StationLedgerSummary = {
  topUpTotal: number;
  checkoutTotal: number;
  registerCount: number;
  topUpCount: number;
  checkoutCount: number;
  latestEntries: LedgerEntry[];
};

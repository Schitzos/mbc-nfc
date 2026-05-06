import type { LedgerEntry } from './mbc-card';

export type StationLedgerSummary = {
  topUpTotal: number;
  checkoutTotal: number;
  registerCount: number;
  topUpCount: number;
  checkoutCount: number;
  latestEntries: LedgerEntry[];
};

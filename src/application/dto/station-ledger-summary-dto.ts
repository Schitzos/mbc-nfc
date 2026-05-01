import type { LedgerEntry } from '../../domain/entities/mbc-card';

export type StationLedgerSummaryDto = {
  topUpTotal: number;
  checkoutTotal: number;
  registerCount: number;
  topUpCount: number;
  checkoutCount: number;
  latestEntries: LedgerEntry[];
};

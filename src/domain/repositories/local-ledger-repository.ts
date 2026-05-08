import type { LedgerEntry } from '@domain/entities/mbc-card';
import type { StationLedgerSummary } from '@domain/entities/station-ledger-summary';

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummary>;
}

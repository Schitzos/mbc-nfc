import type { LedgerEntry } from '../entities/mbc-card';
import type { StationLedgerSummary } from '../entities/station-ledger-summary';

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummary>;
}

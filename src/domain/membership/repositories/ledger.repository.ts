import type {
  LedgerEntry,
  StationLedgerSummary,
} from '../entities/ledger-entry';

export type {
  LedgerEntry,
  StationLedgerSummary,
} from '../entities/ledger-entry';

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummary>;
}

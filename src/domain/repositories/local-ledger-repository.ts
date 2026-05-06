import type { LedgerEntry } from '../entities/mbc-card';
import type { StationLedgerSummaryDto } from '../../application/dto/station-ledger-summary-dto';

export interface LocalLedgerRepository {
  append(entry: LedgerEntry): Promise<void>;
  getStationSummary(): Promise<StationLedgerSummaryDto>;
}

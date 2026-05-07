import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';
import type { StationLedgerSummaryDto } from '@application/dto/station-ledger-summary-dto';

export class GetStationLedgerSummaryUseCase {
  constructor(private readonly localLedgerRepository: LocalLedgerRepository) {}

  execute(): Promise<StationLedgerSummaryDto> {
    return this.localLedgerRepository.getStationSummary();
  }
}

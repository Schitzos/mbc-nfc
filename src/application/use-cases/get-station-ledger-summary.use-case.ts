import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import type { StationLedgerSummaryDto } from '@application/dto/station-ledger-summary-dto';

export type GetStationLedgerSummaryUseCase = {
  execute: () => Promise<StationLedgerSummaryDto>;
};

export function createGetStationLedgerSummaryUseCase(
  localLedgerRepository: LocalLedgerRepository,
): GetStationLedgerSummaryUseCase {
  return {
    execute(): Promise<StationLedgerSummaryDto> {
      return localLedgerRepository.getStationSummary();
    },
  };
}

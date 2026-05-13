import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';
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

import { GetStationLedgerSummaryUseCase } from '../get-station-ledger-summary.use-case';
import type { LocalLedgerRepository } from '../../../domain/repositories/local-ledger-repository';

function createLedgerRepository(
  overrides?: Partial<LocalLedgerRepository>,
): LocalLedgerRepository {
  return {
    append: jest.fn().mockResolvedValue(undefined),
    getStationSummary: jest.fn().mockResolvedValue({
      topUpTotal: 50000,
      checkoutTotal: 4000,
      registerCount: 1,
      topUpCount: 1,
      checkoutCount: 1,
      latestEntries: [],
    }),
    ...overrides,
  };
}

describe('GetStationLedgerSummaryUseCase', () => {
  it('returns the local station ledger summary from the repository', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = new GetStationLedgerSummaryUseCase(ledgerRepository);

    const result = await useCase.execute();

    expect(result.topUpTotal).toBe(50000);
    expect(result.checkoutTotal).toBe(4000);
    expect(ledgerRepository.getStationSummary).toHaveBeenCalledTimes(1);
  });
});

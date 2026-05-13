import { createTopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import type { LocalLedgerRepository } from '@domain/repositories/local-ledger-repository';

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  const defaultCard = {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-001' },
    balance: 1000,
    currency: 'IDR' as const,
    visitStatus: 'NOT_CHECKED_IN' as const,
    transactionLogs: [] as any[],
  };
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(defaultCard),
    writeCard: jest.fn().mockResolvedValue(undefined),
    readWriteCard: jest
      .fn()
      .mockImplementation(async (fn: any) => fn(defaultCard)),
    registerCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createLedgerRepository(
  overrides?: Partial<LocalLedgerRepository>,
): LocalLedgerRepository {
  return {
    append: jest.fn().mockResolvedValue(undefined),
    getStationSummary: jest.fn(),
    ...overrides,
  };
}

describe('createTopUpMemberCardUseCase – extended coverage', () => {
  it('rejects negative top-up amounts', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: -5000 });

    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });

  it('rejects NaN top-up amounts', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: NaN });

    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });

  it('rejects Infinity top-up amounts', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: Infinity });

    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });

  it('works without a ledger repository (optional dependency)', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: 10000 });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Top-up completed successfully.');
  });

  it('includes masked member reference in ledger entry', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    await useCase.execute({ amount: 25000 });

    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        maskedMemberReference: expect.stringContaining('MBC-***-'),
      }),
    );
  });

  it('re-throws unexpected errors', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest.fn().mockRejectedValue(new Error('Disk failure')),
    });
    const useCase = createTopUpMemberCardUseCase(cardRepository);

    await expect(useCase.execute({ amount: 10000 })).rejects.toThrow(
      'Disk failure',
    );
  });
});

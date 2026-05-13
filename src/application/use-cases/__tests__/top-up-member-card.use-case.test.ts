import { createTopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import { createCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';

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

describe('createTopUpMemberCardUseCase', () => {
  it('rejects non-positive top-up amounts', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: 0 });

    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });

  it('increases balance and appends a top-up log', async () => {
    const cardRepository = createCardRepository();
    const useCase = createTopUpMemberCardUseCase(cardRepository);

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(51000);
    expect(cardRepository.readWriteCard).toHaveBeenCalled();
  });

  it('writes a local ledger entry after successful top-up when configured', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'STATION',
        action: 'TOP_UP',
        amount: 50000,
      }),
    );
  });

  it('returns a warning message when card top-up succeeds but ledger append fails', async () => {
    const ledgerRepository = createLedgerRepository({
      append: jest.fn().mockRejectedValue(new Error('ledger unavailable')),
    });
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(true);
    expect(result.message).toContain('local audit ledger could not be updated');
  });

  it('surfaces repository read failures safely', async () => {
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository({
        readWriteCard: jest
          .fn()
          .mockRejectedValue(
            createCardRepositoryError(
              'UNREGISTERED_CARD',
              'Card is not registered yet. Register it first at Station.',
            ),
          ),
      }),
    );

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Register it first at Station');
  });
});

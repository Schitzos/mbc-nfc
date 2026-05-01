import { TopUpMemberCardUseCase } from '../top-up-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { LocalLedgerRepository } from '../../../domain/repositories/local-ledger-repository';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue({
      version: 1,
      cardId: 'CARD-001',
      member: { memberId: 'MEM-001' },
      balance: 1000,
      currency: 'IDR',
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    }),
    writeCard: jest.fn().mockResolvedValue(undefined),
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

describe('TopUpMemberCardUseCase', () => {
  it('rejects non-positive top-up amounts', async () => {
    const useCase = new TopUpMemberCardUseCase(createCardRepository());

    const result = await useCase.execute({ amount: 0 });

    expect(result.success).toBe(false);
    expect(result.message).toContain('positive');
  });

  it('increases balance and appends a top-up log', async () => {
    const cardRepository = createCardRepository();
    const useCase = new TopUpMemberCardUseCase(cardRepository);

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(51000);
    expect(cardRepository.writeCard).toHaveBeenCalledWith(
      expect.objectContaining({
        balance: 51000,
        transactionLogs: [
          expect.objectContaining({
            activity: 'TOP_UP',
            nominal: 50000,
          }),
        ],
      }),
    );
  });

  it('writes a local ledger entry after successful top-up when configured', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = new TopUpMemberCardUseCase(
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
    const useCase = new TopUpMemberCardUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({ amount: 50000 });

    expect(result.success).toBe(true);
    expect(result.message).toContain('local audit ledger could not be updated');
  });

  it('surfaces repository read failures safely', async () => {
    const useCase = new TopUpMemberCardUseCase(
      createCardRepository({
        readCard: jest
          .fn()
          .mockRejectedValue(
            new CardRepositoryError(
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

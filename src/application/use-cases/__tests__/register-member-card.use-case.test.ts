import { RegisterMemberCardUseCase } from '../register-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { LocalLedgerRepository } from '../../../domain/repositories/local-ledger-repository';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest
      .fn()
      .mockRejectedValue(
        new CardRepositoryError('UNREGISTERED_CARD', 'Not registered'),
      ),
    writeCard: jest.fn().mockResolvedValue(undefined),
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

describe('RegisterMemberCardUseCase', () => {
  it('registers a new card via registerCard', async () => {
    const cardRepository = createCardRepository();
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.role).toBe('STATION');
    expect(result.card?.maskedMemberReference).toContain('MBC-***-');
    expect(cardRepository.registerCard).toHaveBeenCalledWith(
      expect.objectContaining({
        balance: 0,
        visitStatus: 'NOT_CHECKED_IN',
      }),
    );
  });

  it('returns failure when card is already registered', async () => {
    const cardRepository = createCardRepository({
      registerCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError(
            'ALREADY_REGISTERED_CARD',
            'This card is already registered.',
          ),
        ),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    expect(result.message).toContain('already registered');
  });

  it('appends a local ledger record after successful registration', async () => {
    const cardRepository = createCardRepository();
    const ledgerRepository = createLedgerRepository();
    const useCase = new RegisterMemberCardUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'STATION', action: 'REGISTER' }),
    );
  });

  it('returns warning when registration succeeds but ledger fails', async () => {
    const cardRepository = createCardRepository();
    const ledgerRepository = createLedgerRepository({
      append: jest.fn().mockRejectedValue(new Error('ledger unavailable')),
    });
    const useCase = new RegisterMemberCardUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.message).toContain('local audit ledger could not be updated');
  });

  it('re-throws non-CardRepositoryError exceptions', async () => {
    const cardRepository = createCardRepository({
      registerCard: jest.fn().mockRejectedValue(new Error('unexpected')),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    await expect(useCase.execute()).rejects.toThrow('unexpected');
  });
});

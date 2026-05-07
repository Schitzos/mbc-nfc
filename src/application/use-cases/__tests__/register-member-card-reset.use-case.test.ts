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
    readWriteCard: jest.fn(),
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

describe('RegisterMemberCardUseCase – reset/re-registration flow', () => {
  describe('executeWithReset() forces registration via writeCard', () => {
    it('writes a fresh card payload bypassing registerCard check', async () => {
      const cardRepository = createCardRepository();
      const useCase = new RegisterMemberCardUseCase(cardRepository);

      const result = await useCase.executeWithReset();

      expect(result.success).toBe(true);
      expect(result.role).toBe('STATION');
      expect(cardRepository.writeCard).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 0,
          visitStatus: 'NOT_CHECKED_IN',
        }),
      );
    });

    it('appends a ledger entry after successful reset registration', async () => {
      const cardRepository = createCardRepository();
      const ledgerRepository = createLedgerRepository();
      const useCase = new RegisterMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      );

      const result = await useCase.executeWithReset();

      expect(result.success).toBe(true);
      expect(ledgerRepository.append).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'STATION', action: 'REGISTER' }),
      );
    });

    it('generates a new card ID and member ID', async () => {
      const cardRepository = createCardRepository();
      const useCase = new RegisterMemberCardUseCase(cardRepository);

      const result = await useCase.executeWithReset();

      expect(result.success).toBe(true);
      expect(result.card?.maskedMemberReference).toContain('MBC-***-');
    });

    it('succeeds with warning when ledger append fails', async () => {
      const cardRepository = createCardRepository();
      const ledgerRepository = createLedgerRepository({
        append: jest.fn().mockRejectedValue(new Error('disk full')),
      });
      const useCase = new RegisterMemberCardUseCase(
        cardRepository,
        ledgerRepository,
      );

      const result = await useCase.executeWithReset();

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'local audit ledger could not be updated',
      );
    });
  });
});

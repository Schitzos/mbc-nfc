import { RegisterMemberCardUseCase } from '../register-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest
      .fn()
      .mockRejectedValue(
        new CardRepositoryError(
          'UNREGISTERED_CARD',
          'Card is not registered yet. Register it first at Station.',
        ),
      ),
    writeCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('RegisterMemberCardUseCase', () => {
  it('creates an initial card payload without requiring typed member input', async () => {
    const cardRepository = createCardRepository();
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.role).toBe('STATION');
    expect(result.card?.memberName).toBeUndefined();
    expect(result.card?.maskedMemberReference).toContain('MBC-***-');
    expect(cardRepository.writeCard).toHaveBeenCalledWith(
      expect.objectContaining({
        balance: 0,
        visitStatus: 'NOT_CHECKED_IN',
      }),
    );
  });

  it('rejects cards that are already registered', async () => {
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue({
        version: 1,
        cardId: 'CARD-001',
        member: { memberId: 'MEM-001' },
        balance: 1000,
        currency: 'IDR',
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [],
      }),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(false);
    expect(result.message).toContain('already registered');
    expect(cardRepository.writeCard).not.toHaveBeenCalled();
  });
});

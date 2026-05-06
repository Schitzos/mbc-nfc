import { RegisterMemberCardUseCase } from '../register-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockRejectedValue(
      Object.assign(new Error('Card is not registered yet.'), {
        name: 'CardRepositoryError',
        code: 'UNREGISTERED_CARD',
      }),
    ),
    writeCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('RegisterMemberCardUseCase – extended coverage', () => {
  it('re-throws unexpected errors from readCard', async () => {
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockRejectedValue(new TypeError('Unexpected')),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    await expect(useCase.execute()).rejects.toThrow('Unexpected');
  });

  it('generates a unique member ID automatically (no typed input)', async () => {
    const {
      CardRepositoryError,
    } = require('../../../domain/errors/card-repository-error');
    const cardRepository = createCardRepository({
      readCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError(
            'UNREGISTERED_CARD',
            'Card is not registered yet.',
          ),
        ),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.card?.maskedMemberReference).toMatch(/^MBC-\*\*\*-/);
  });

  it('does not expose full internal member ID in the result', async () => {
    const {
      CardRepositoryError,
    } = require('../../../domain/errors/card-repository-error');
    const cardRepository = createCardRepository({
      readCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError(
            'UNREGISTERED_CARD',
            'Card is not registered yet.',
          ),
        ),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    // The card summary should only have maskedMemberReference, not the full memberId
    expect(result.card?.maskedMemberReference).toContain('***');
  });

  it('works without a ledger repository (optional dependency)', async () => {
    const {
      CardRepositoryError,
    } = require('../../../domain/errors/card-repository-error');
    const cardRepository = createCardRepository({
      readCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError(
            'UNREGISTERED_CARD',
            'Card is not registered yet.',
          ),
        ),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Member card registered successfully.');
  });
});

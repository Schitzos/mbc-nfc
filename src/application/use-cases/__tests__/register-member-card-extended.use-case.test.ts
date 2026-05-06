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
        new CardRepositoryError('UNREGISTERED_CARD', 'Not registered'),
      ),
    writeCard: jest.fn().mockResolvedValue(undefined),
    readWriteCard: jest.fn(),
    registerCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('RegisterMemberCardUseCase – extended coverage', () => {
  it('re-throws unexpected errors from registerCard', async () => {
    const cardRepository = createCardRepository({
      registerCard: jest.fn().mockRejectedValue(new TypeError('Unexpected')),
    });
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    await expect(useCase.execute()).rejects.toThrow('Unexpected');
  });

  it('generates a unique member ID automatically (no typed input)', async () => {
    const cardRepository = createCardRepository();
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.card?.maskedMemberReference).toMatch(/^MBC-\*\*\*-/);
  });

  it('does not expose full internal member ID in the result', async () => {
    const cardRepository = createCardRepository();
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.card?.maskedMemberReference).toContain('***');
  });

  it('works without a ledger repository (optional dependency)', async () => {
    const cardRepository = createCardRepository();
    const useCase = new RegisterMemberCardUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Member card registered successfully.');
  });
});

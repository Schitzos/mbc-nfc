import { TopUpMemberCardUseCase } from '../top-up-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';

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
});

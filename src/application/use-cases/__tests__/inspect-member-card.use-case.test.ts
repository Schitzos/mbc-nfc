import { InspectMemberCardUseCase } from '../inspect-member-card.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { MbcCard } from '../../../domain/entities/mbc-card';

function createCard(overrides?: Partial<MbcCard>): MbcCard {
  return {
    version: 1,
    cardId: 'CARD-SCOUT-001',
    member: { memberId: 'MEM-SCOUT-001' },
    balance: 69000,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [
      {
        id: 'LOG-001',
        activity: 'TOP_UP',
        nominal: 50000,
        occurredAt: '2026-05-01T08:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

function createRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(createCard()),
    writeCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('InspectMemberCardUseCase', () => {
  it('returns balance, status, and logs without writing the card', async () => {
    const repository = createRepository();
    const useCase = new InspectMemberCardUseCase(repository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.role).toBe('SCOUT');
    expect(result.card?.balance).toBe(69000);
    expect(result.card?.visitStatus).toBe('NOT_CHECKED_IN');
    expect(result.card?.transactionLogs).toHaveLength(1);
    expect(repository.writeCard).not.toHaveBeenCalled();
  });

  it('returns a read failure without mutating card state', async () => {
    const repository = createRepository({
      readCard: jest
        .fn()
        .mockRejectedValue(new Error('Card read failed unexpectedly')),
    });
    const useCase = new InspectMemberCardUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow(
      'Card read failed unexpectedly',
    );
    expect(repository.writeCard).not.toHaveBeenCalled();
  });
});

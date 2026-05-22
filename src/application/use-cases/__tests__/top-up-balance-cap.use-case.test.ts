import { createTopUpMemberCardUseCase } from '@application/use-cases/top-up-member-card.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import { MAX_CARD_BALANCE } from '@domain/membership/config/balance-limits';

function createCardRepository(
  balance: number,
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  const card = {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-001' },
    balance,
    currency: 'IDR' as const,
    visitStatus: 'NOT_CHECKED_IN' as const,
    transactionLogs: [] as any[],
  };
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(card),
    writeCard: jest.fn().mockResolvedValue(undefined),
    readWriteCard: jest.fn().mockImplementation(async (fn: any) => fn(card)),
    registerCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('Top-up balance cap validation', () => {
  it('succeeds when resulting balance equals MAX_CARD_BALANCE (boundary)', async () => {
    const currentBalance = 4_000_000;
    const amount = MAX_CARD_BALANCE - currentBalance;
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(currentBalance),
    );

    const result = await useCase.execute({ amount });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(MAX_CARD_BALANCE);
  });

  it('rejects top-up when resulting balance exceeds MAX_CARD_BALANCE', async () => {
    const currentBalance = 4_500_000;
    const amount = 600_000; // 4_500_000 + 600_000 = 5_100_000 > 5_000_000
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(currentBalance),
    );

    const result = await useCase.execute({ amount });

    expect(result.success).toBe(false);
    expect(result.message).toContain('maximum allowed balance');
    expect(result.message).toContain('Rp 5.000.000');
  });

  it('provides a user-friendly error message', async () => {
    const useCase = createTopUpMemberCardUseCase(
      createCardRepository(MAX_CARD_BALANCE),
    );

    const result = await useCase.execute({ amount: 1 });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/top-up rejected/i);
    expect(result.message).toContain('Rp 5.000.000');
  });

  it('allows top-up when balance is zero and amount equals MAX_CARD_BALANCE', async () => {
    const useCase = createTopUpMemberCardUseCase(createCardRepository(0));

    const result = await useCase.execute({ amount: MAX_CARD_BALANCE });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(MAX_CARD_BALANCE);
  });
});

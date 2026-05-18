import { createCheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import { createCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';
import type { MbcCard } from '@domain/membership/entities/membership-card';

function createCheckedInCard(overrides?: Partial<MbcCard>): MbcCard {
  return {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-001' },
    balance: 10000,
    currency: 'IDR',
    visitStatus: 'CHECKED_IN',
    activeSession: {
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    },
    transactionLogs: [],
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

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  const defaultCard = createCheckedInCard();
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

describe('createCheckOutActivityUseCase', () => {
  it('calculates duration and fee using fixed tariff, deducts balance, and clears status', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.chargedHours).toBe(2);
    expect(result.chargedAmount).toBe(4000);
    expect(result.card?.balance).toBe(6000);
    expect(result.card?.visitStatus).toBe('NOT_CHECKED_IN');
    expect(result.card?.activeSession).toBeUndefined();
  });

  it('handles invalid state safely', async () => {
    const noSessionCard = createCheckedInCard({
      visitStatus: 'NOT_CHECKED_IN',
      activeSession: undefined,
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(noSessionCard)),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('active activity session');
  });

  it('returns top-up guidance and keeps checked-in state when balance is insufficient', async () => {
    const insufficientCard = createCheckedInCard({
      balance: 1000,
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(insufficientCard)),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('top up at Station');
  });

  it('appends a local ledger entry after successful checkout when configured', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = createCheckOutActivityUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'TERMINAL',
        action: 'CHECK_OUT',
        amount: 4000,
      }),
    );
  });

  it('returns a warning when checkout succeeds but local ledger append fails', async () => {
    const ledgerRepository = createLedgerRepository({
      append: jest.fn().mockRejectedValue(new Error('ledger unavailable')),
    });
    const useCase = createCheckOutActivityUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('local audit ledger could not be updated');
  });

  it('surfaces repository errors safely during checkout', async () => {
    const useCase = createCheckOutActivityUseCase(
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

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Register it first at Station');
  });

  it('returns a non-balance domain validation error when checkout timestamp is invalid', async () => {
    const useCase = createCheckOutActivityUseCase(createCardRepository());

    const result = await useCase.execute({
      checkedOutAt: 'not-a-real-date',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('valid ISO date strings');
  });
});

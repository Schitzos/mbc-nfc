import { createCheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import { createCardRepositoryError } from '@domain/membership/errors/card-repository-error';
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

function createLedgerRepository(
  overrides?: Partial<LocalLedgerRepository>,
): LocalLedgerRepository {
  return {
    append: jest.fn().mockResolvedValue(undefined),
    getStationSummary: jest.fn(),
    ...overrides,
  };
}

describe('createCheckOutActivityUseCase – extended coverage', () => {
  it('uses current time when checkedOutAt is not provided', async () => {
    const card = createCheckedInCard({
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest.fn().mockImplementation(async (fn: any) => fn(card)),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.chargedHours).toBeGreaterThanOrEqual(2);
  });

  it('re-throws unexpected errors', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest.fn().mockRejectedValue(new Error('Network failure')),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    await expect(
      useCase.execute({ checkedOutAt: '2026-05-01T10:00:00.000Z' }),
    ).rejects.toThrow('Network failure');
  });

  it('includes masked member reference in ledger entry', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = createCheckOutActivityUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    await useCase.execute({ checkedOutAt: '2026-05-01T09:05:01.000Z' });

    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        maskedMemberReference: expect.stringContaining('MBC-***-'),
      }),
    );
  });

  it('includes activityType in ledger entry', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = createCheckOutActivityUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    await useCase.execute({ checkedOutAt: '2026-05-01T09:05:01.000Z' });

    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: 'PARKING',
      }),
    );
  });

  it('handles custom activityId checkout (not hardcoded)', async () => {
    const card = createCheckedInCard({
      activeSession: {
        activityId: 'co-working',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest.fn().mockImplementation(async (fn: any) => fn(card)),
    });
    const ledgerRepository = createLedgerRepository();
    const useCase = createCheckOutActivityUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: 'PARKING',
      }),
    );
  });

  it('insufficient balance does not mutate active activity status', async () => {
    const insufficientCard = createCheckedInCard({ balance: 1000 });
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
  });

  it('rejects checkout with exit time before entry time (INVALID_DURATION)', async () => {
    const useCase = createCheckOutActivityUseCase(createCardRepository());

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T07:00:00.000Z', // before check-in at 08:00
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('later than the check-in time');
  });

  it('returns CARD_TAMPERED errorCode for tampered card', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockRejectedValue(
          createCardRepositoryError('CARD_TAMPERED', 'Card data is tampered.'),
        ),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('CARD_TAMPERED');
  });
});

it('returns UNREGISTERED_CARD errorCode for unregistered card', async () => {
  const cardRepository = createCardRepository({
    readWriteCard: jest
      .fn()
      .mockRejectedValue(
        createCardRepositoryError('UNREGISTERED_CARD', 'Card not registered.'),
      ),
  });
  const useCase = createCheckOutActivityUseCase(cardRepository);

  const result = await useCase.execute({
    checkedOutAt: '2026-05-01T09:05:01.000Z',
  });

  expect(result.success).toBe(false);
  expect(result.errorCode).toBe('UNREGISTERED_CARD');
});

it('returns GENERIC_FAILURE errorCode for other CardRepositoryError codes', async () => {
  const cardRepository = createCardRepository({
    readWriteCard: jest
      .fn()
      .mockRejectedValue(
        createCardRepositoryError('SCAN_CANCELLED', 'Scan was cancelled.'),
      ),
  });
  const useCase = createCheckOutActivityUseCase(cardRepository);

  const result = await useCase.execute({
    checkedOutAt: '2026-05-01T09:05:01.000Z',
  });

  expect(result.success).toBe(false);
  expect(result.errorCode).toBe('GENERIC_FAILURE');
});

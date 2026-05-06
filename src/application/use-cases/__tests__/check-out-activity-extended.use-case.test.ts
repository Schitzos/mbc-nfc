import { CheckOutActivityUseCase } from '../check-out-activity.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { LocalLedgerRepository } from '../../../domain/repositories/local-ledger-repository';
import type { MbcCard } from '../../../domain/entities/mbc-card';

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
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(createCheckedInCard()),
    writeCard: jest.fn().mockResolvedValue(undefined),
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

describe('CheckOutActivityUseCase – extended coverage', () => {
  it('uses current time when checkedOutAt is not provided', async () => {
    // Use a check-in time far in the past so current time produces a valid duration
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(
        createCheckedInCard({
          activeSession: {
            activityId: 'parking-main-gate',
            activityType: 'PARKING',
            checkedInAt: new Date(
              Date.now() - 2 * 60 * 60 * 1000,
            ).toISOString(),
          },
        }),
      ),
    });
    const useCase = new CheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute();

    expect(result.success).toBe(true);
    expect(result.chargedHours).toBeGreaterThanOrEqual(2);
  });

  it('re-throws unexpected errors', async () => {
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockRejectedValue(new Error('Network failure')),
    });
    const useCase = new CheckOutActivityUseCase(cardRepository);

    await expect(
      useCase.execute({ checkedOutAt: '2026-05-01T10:00:00.000Z' }),
    ).rejects.toThrow('Network failure');
  });

  it('includes masked member reference in ledger entry', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = new CheckOutActivityUseCase(
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
    const useCase = new CheckOutActivityUseCase(
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

  it('handles GENERIC activity type checkout (not hardcoded to parking)', async () => {
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(
        createCheckedInCard({
          activeSession: {
            activityId: 'co-working',
            activityType: 'GENERIC',
            checkedInAt: '2026-05-01T08:00:00.000Z',
          },
        }),
      ),
    });
    const ledgerRepository = createLedgerRepository();
    const useCase = new CheckOutActivityUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: 'GENERIC',
      }),
    );
  });

  it('insufficient balance does not mutate active activity status', async () => {
    const insufficientCard = createCheckedInCard({ balance: 1000 });
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(insufficientCard),
    });
    const useCase = new CheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(insufficientCard.visitStatus).toBe('CHECKED_IN');
    expect(insufficientCard.activeSession).toBeDefined();
    expect(insufficientCard.balance).toBe(1000);
    expect(cardRepository.writeCard).not.toHaveBeenCalled();
  });

  it('rejects checkout with exit time before entry time (INVALID_DURATION)', async () => {
    const useCase = new CheckOutActivityUseCase(createCardRepository());

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T07:00:00.000Z', // before check-in at 08:00
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('later than the check-in time');
  });
});

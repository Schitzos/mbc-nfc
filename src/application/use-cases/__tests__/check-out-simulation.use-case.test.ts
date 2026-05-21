import { createCheckOutActivityUseCase } from '@application/use-cases/check-out-activity.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
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

describe('Check-out simulation mode', () => {
  it('does not deduct balance when activeSession.isSimulation is true', async () => {
    const simulationCard = createCheckedInCard({
      balance: 10000,
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
        isSimulation: true,
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(simulationCard)),
    });
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(10000);
    expect(result.chargedHours).toBe(2);
    expect(result.chargedAmount).toBe(4000);
  });

  it('still deducts balance for non-simulation sessions', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.card?.balance).toBe(6000);
    expect(result.chargedAmount).toBe(4000);
  });

  it('skips localLedgerRepository.append when wasSimulation is true', async () => {
    const simulationCard = createCheckedInCard({
      balance: 10000,
      activeSession: {
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
        isSimulation: true,
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(simulationCard)),
    });
    const ledgerRepository = {
      append: jest.fn().mockResolvedValue(undefined),
      getStationSummary: jest.fn(),
    };
    const useCase = createCheckOutActivityUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).not.toHaveBeenCalled();
  });

  it('appends to localLedgerRepository for non-simulation sessions', async () => {
    const cardRepository = createCardRepository();
    const ledgerRepository = {
      append: jest.fn().mockResolvedValue(undefined),
      getStationSummary: jest.fn(),
    };
    const useCase = createCheckOutActivityUseCase(
      cardRepository,
      ledgerRepository,
    );

    const result = await useCase.execute({
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(true);
    expect(ledgerRepository.append).toHaveBeenCalled();
  });
});

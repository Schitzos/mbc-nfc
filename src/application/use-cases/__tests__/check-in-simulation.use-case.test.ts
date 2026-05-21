import { createCheckInActivityUseCase } from '@application/use-cases/check-in-activity.use-case';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import type { MbcCard } from '@domain/membership/entities/membership-card';

function createCard(overrides?: Partial<MbcCard>): MbcCard {
  return {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-001' },
    balance: 50000,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [],
    ...overrides,
  };
}

function createCardRepository(
  overrides?: Partial<MbcCardRepository>,
): MbcCardRepository {
  const defaultCard = createCard();
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

describe('Check-in simulation mode', () => {
  it('uses provided checkedInAt timestamp instead of current time', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.card?.activeSession?.checkedInAt).toBe(
      '2026-05-01T08:00:00.000Z',
    );
  });

  it('stores isSimulation flag in activeSession when provided', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T08:00:00.000Z',
      isSimulation: true,
    });

    expect(result.success).toBe(true);
    expect(result.card?.activeSession?.isSimulation).toBe(true);
  });

  it('does not set isSimulation when not provided', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(true);
    expect(result.card?.activeSession?.isSimulation).toBeUndefined();
  });

  it('rejects checkedInAt if it is in the future', async () => {
    const cardRepository = createCardRepository();
    const useCase = createCheckInActivityUseCase(cardRepository);
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: futureDate,
      isSimulation: true,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Simulation time cannot be in the future.');
  });
});

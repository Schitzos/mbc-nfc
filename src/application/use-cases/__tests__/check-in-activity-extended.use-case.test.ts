import { CheckInActivityUseCase } from '../check-in-activity.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { MbcCard } from '../../../domain/entities/mbc-card';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

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

describe('CheckInActivityUseCase – extended coverage', () => {
  it('handles CardRepositoryError gracefully', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError(
            'UNREGISTERED_CARD',
            'Card is not registered yet.',
          ),
        ),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.role).toBe('GATE');
    expect(result.message).toContain('not registered');
  });

  it('supports GENERIC activity type (not hardcoded to parking)', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'co-working-space',
      activityType: 'GENERIC',
    });

    expect(result.success).toBe(true);
    expect(result.card?.activeSession?.activityType).toBe('GENERIC');
    expect(result.card?.activeSession?.activityId).toBe('co-working-space');
  });

  it('appends a CHECK_IN transaction log with nominal 0', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(true);
    expect(result.card?.transactionLogs[0].activity).toBe('CHECK_IN');
    expect(result.card?.transactionLogs[0].nominal).toBe(0);
  });

  it('re-throws unexpected errors', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockRejectedValue(new Error('Unexpected failure')),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    await expect(
      useCase.execute({
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
      }),
    ).rejects.toThrow('Unexpected failure');
  });

  it('rejects check-in when card has an active session (ACTIVE_SESSION_EXISTS)', async () => {
    const checkedInCard = createCard({
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'existing-activity',
        activityType: 'GENERIC',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(checkedInCard)),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'new-activity',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already checked in');
  });
});

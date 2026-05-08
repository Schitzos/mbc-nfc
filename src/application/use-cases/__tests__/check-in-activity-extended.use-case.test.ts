import { CheckInActivityUseCase } from '@application/use-cases/check-in-activity.use-case';
import type { MbcCardRepository } from '@domain/repositories/mbc-card-repository';
import type { MbcCard } from '@domain/entities/mbc-card';
import { CardRepositoryError } from '@domain/errors/card-repository-error';
import { DomainError } from '@domain/errors/domain-error';

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

  it('supports custom activityId (not hardcoded)', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'co-working-space',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(true);
    expect(result.card?.activeSession?.activityType).toBe('PARKING');
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
        activityType: 'PARKING',
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

  it('returns CARD_TAMPERED errorCode for tampered card', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError('CARD_TAMPERED', 'Card data is tampered.'),
        ),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('CARD_TAMPERED');
  });

  it('returns UNREGISTERED_CARD errorCode for unregistered card', async () => {
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockRejectedValue(
          new CardRepositoryError('UNREGISTERED_CARD', 'Not registered.'),
        ),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('UNREGISTERED_CARD');
  });

  it('returns ALREADY_CHECKED_IN errorCode for double check-in', async () => {
    const checkedInCard2 = createCard({
      visitStatus: 'CHECKED_IN',
      activeSession: {
        activityId: 'existing',
        activityType: 'PARKING',
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    });
    const cardRepository = createCardRepository({
      readWriteCard: jest
        .fn()
        .mockImplementation(async (fn: any) => fn(checkedInCard2)),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'new-activity',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('ALREADY_CHECKED_IN');
  });
});

it('returns GENERIC_FAILURE errorCode for other CardRepositoryError codes', async () => {
  const cardRepository = createCardRepository({
    readWriteCard: jest
      .fn()
      .mockRejectedValue(
        new CardRepositoryError('SCAN_CANCELLED', 'Scan was cancelled.'),
      ),
  });
  const useCase = new CheckInActivityUseCase(cardRepository);

  const result = await useCase.execute({
    activityId: 'parking-main-gate',
    activityType: 'PARKING',
  });

  expect(result.success).toBe(false);
  expect(result.errorCode).toBe('GENERIC_FAILURE');
});

it('returns ALREADY_CHECKED_IN errorCode for ACTIVE_SESSION_EXISTS DomainError', async () => {
  const cardRepository = createCardRepository({
    readWriteCard: jest
      .fn()
      .mockRejectedValue(
        new DomainError('ACTIVE_SESSION_EXISTS', 'Active session exists.'),
      ),
  });
  const useCase = new CheckInActivityUseCase(cardRepository);

  const result = await useCase.execute({
    activityId: 'parking-main-gate',
    activityType: 'PARKING',
  });

  expect(result.success).toBe(false);
  expect(result.errorCode).toBe('ALREADY_CHECKED_IN');
});

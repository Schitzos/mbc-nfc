import { CheckInActivityUseCase } from '../check-in-activity.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { MbcCard } from '../../../domain/entities/mbc-card';

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
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(createCard()),
    writeCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CheckInActivityUseCase', () => {
  it('writes activity context, timestamp, and checked-in status', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(true);
    expect(result.card?.visitStatus).toBe('CHECKED_IN');
    expect(result.card?.activeSession).toEqual({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: expect.any(String),
    });
    expect(cardRepository.writeCard).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionLogs: [
          expect.objectContaining({
            activity: 'CHECK_IN',
          }),
        ],
      }),
    );
  });

  it('supports an optional simulation timestamp', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'coop-event-hall',
      activityType: 'GENERIC',
      simulatedCheckedInAt: '2026-05-01T08:30:00.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('simulation timestamp');
    expect(result.card?.activeSession?.checkedInAt).toBe(
      '2026-05-01T08:30:00.000Z',
    );
  });

  it('rejects invalid repeated check-in safely', async () => {
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(
        createCard({
          visitStatus: 'CHECKED_IN',
          activeSession: {
            activityId: 'parking-main-gate',
            activityType: 'PARKING',
            checkedInAt: '2026-05-01T08:00:00.000Z',
          },
        }),
      ),
    });
    const useCase = new CheckInActivityUseCase(cardRepository);

    const result = await useCase.execute({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('already checked in');
    expect(cardRepository.writeCard).not.toHaveBeenCalled();
  });
});

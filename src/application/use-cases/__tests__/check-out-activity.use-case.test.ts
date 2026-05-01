import { CheckOutActivityUseCase } from '../check-out-activity.use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { LocalLedgerRepository } from '../../../domain/repositories/local-ledger-repository';
import type {
  ActivityTariffRule,
  MbcCard,
} from '../../../domain/entities/mbc-card';

const parkingRule: ActivityTariffRule = {
  activityType: 'PARKING',
  feePerStartedHour: 2000,
  currency: 'IDR',
};

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
  return {
    isSupported: jest.fn().mockResolvedValue(true),
    readCard: jest.fn().mockResolvedValue(createCheckedInCard()),
    writeCard: jest.fn().mockResolvedValue(undefined),
    cancel: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CheckOutActivityUseCase', () => {
  it('calculates duration and fee correctly, deducts balance, and clears status', async () => {
    const cardRepository = createCardRepository();
    const useCase = new CheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      tariffRule: parkingRule,
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
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(
        createCheckedInCard({
          visitStatus: 'NOT_CHECKED_IN',
          activeSession: undefined,
        }),
      ),
    });
    const useCase = new CheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      tariffRule: parkingRule,
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('active activity session');
    expect(cardRepository.writeCard).not.toHaveBeenCalled();
  });

  it('returns top-up guidance and keeps checked-in state when balance is insufficient', async () => {
    const insufficientCard = createCheckedInCard({
      balance: 1000,
    });
    const cardRepository = createCardRepository({
      readCard: jest.fn().mockResolvedValue(insufficientCard),
    });
    const useCase = new CheckOutActivityUseCase(cardRepository);

    const result = await useCase.execute({
      tariffRule: parkingRule,
      checkedOutAt: '2026-05-01T09:05:01.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('top up at Station');
    expect(cardRepository.writeCard).not.toHaveBeenCalled();
    expect(insufficientCard.visitStatus).toBe('CHECKED_IN');
    expect(insufficientCard.activeSession).toBeDefined();
  });

  it('appends a local ledger entry after successful checkout when configured', async () => {
    const ledgerRepository = createLedgerRepository();
    const useCase = new CheckOutActivityUseCase(
      createCardRepository(),
      ledgerRepository,
    );

    const result = await useCase.execute({
      tariffRule: parkingRule,
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
});

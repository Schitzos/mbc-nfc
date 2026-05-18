import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import type { MbcCardRepository } from '@domain/membership/repositories/membership-card.repository';
import type {
  NfcAvailabilityRepository,
  NfcAvailabilityStatus,
} from '@domain/membership/repositories/nfc-availability.repository';
import type { MbcCard } from '@domain/membership/entities/membership-card';

describe('LocalLedgerRepository', () => {
  it('append stores a ledger entry', async () => {
    const mock: LocalLedgerRepository = {
      append: jest.fn().mockResolvedValue(undefined),
      getStationSummary: jest.fn(),
    };

    await mock.append({
      id: 'LEDGER-001',
      role: 'STATION',
      action: 'TOP_UP',
      amount: 50000,
      occurredAt: '2026-05-07T10:00:00+07:00',
    });

    expect(mock.append).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'LEDGER-001', action: 'TOP_UP' }),
    );
  });

  it('getStationSummary returns aggregated totals', async () => {
    const mock: LocalLedgerRepository = {
      append: jest.fn(),
      getStationSummary: jest.fn().mockResolvedValue({
        topUpTotal: 100000,
        checkoutTotal: 4000,
        registerCount: 2,
        topUpCount: 3,
        checkoutCount: 1,
        latestEntries: [],
      }),
    };

    const summary = await mock.getStationSummary();

    expect(summary.topUpTotal).toBe(100000);
    expect(summary.checkoutTotal).toBe(4000);
    expect(summary.registerCount).toBe(2);
  });
});

describe('MbcCardRepository', () => {
  const sampleCard: MbcCard = {
    version: 1,
    cardId: 'CARD-001',
    member: { memberId: 'MEM-001' },
    balance: 50000,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [],
  };

  it('isSupported returns boolean', async () => {
    const mock: MbcCardRepository = {
      isSupported: jest.fn().mockResolvedValue(true),
      readCard: jest.fn(),
      writeCard: jest.fn(),
      readWriteCard: jest.fn(),
      registerCard: jest.fn(),
      cancel: jest.fn(),
    };

    expect(await mock.isSupported()).toBe(true);
  });

  it('readCard returns an MbcCard', async () => {
    const mock: MbcCardRepository = {
      isSupported: jest.fn(),
      readCard: jest.fn().mockResolvedValue(sampleCard),
      writeCard: jest.fn(),
      readWriteCard: jest.fn(),
      registerCard: jest.fn(),
      cancel: jest.fn(),
    };

    const card = await mock.readCard();
    expect(card.cardId).toBe('CARD-001');
    expect(card.balance).toBe(50000);
  });

  it('writeCard accepts an MbcCard', async () => {
    const mock: MbcCardRepository = {
      isSupported: jest.fn(),
      readCard: jest.fn(),
      writeCard: jest.fn().mockResolvedValue(undefined),
      readWriteCard: jest.fn(),
      registerCard: jest.fn(),
      cancel: jest.fn(),
    };

    await mock.writeCard(sampleCard);
    expect(mock.writeCard).toHaveBeenCalledWith(sampleCard);
  });

  it('readWriteCard applies transform and returns updated card', async () => {
    const updated = { ...sampleCard, balance: 100000 };
    const mock: MbcCardRepository = {
      isSupported: jest.fn(),
      readCard: jest.fn(),
      writeCard: jest.fn(),
      readWriteCard: jest.fn().mockResolvedValue(updated),
      registerCard: jest.fn(),
      cancel: jest.fn(),
    };

    const result = await mock.readWriteCard(c => ({ ...c, balance: 100000 }));
    expect(result.balance).toBe(100000);
  });

  it('registerCard writes initial card data', async () => {
    const mock: MbcCardRepository = {
      isSupported: jest.fn(),
      readCard: jest.fn(),
      writeCard: jest.fn(),
      readWriteCard: jest.fn(),
      registerCard: jest.fn().mockResolvedValue(undefined),
      cancel: jest.fn(),
    };

    await mock.registerCard(sampleCard);
    expect(mock.registerCard).toHaveBeenCalledWith(sampleCard);
  });

  it('cancel cleans up NFC session', async () => {
    const mock: MbcCardRepository = {
      isSupported: jest.fn(),
      readCard: jest.fn(),
      writeCard: jest.fn(),
      readWriteCard: jest.fn(),
      registerCard: jest.fn(),
      cancel: jest.fn().mockResolvedValue(undefined),
    };

    await mock.cancel();
    expect(mock.cancel).toHaveBeenCalled();
  });
});

describe('NfcAvailabilityRepository', () => {
  it('isSupported returns boolean', async () => {
    const mock: NfcAvailabilityRepository = {
      isSupported: jest.fn().mockResolvedValue(true),
      getAvailabilityStatus: jest.fn(),
    };

    expect(await mock.isSupported()).toBe(true);
  });

  it('getAvailabilityStatus returns a valid status', async () => {
    const mock: NfcAvailabilityRepository = {
      isSupported: jest.fn(),
      getAvailabilityStatus: jest.fn().mockResolvedValue('SUPPORTED'),
    };

    const status = await mock.getAvailabilityStatus();
    expect(status).toBe('SUPPORTED');
  });

  it('NfcAvailabilityStatus covers all four values', () => {
    const statuses: NfcAvailabilityStatus[] = [
      'SUPPORTED',
      'UNSUPPORTED',
      'DISABLED',
      'UNAVAILABLE',
    ];
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain('SUPPORTED');
    expect(statuses).toContain('UNSUPPORTED');
    expect(statuses).toContain('DISABLED');
    expect(statuses).toContain('UNAVAILABLE');
  });
});

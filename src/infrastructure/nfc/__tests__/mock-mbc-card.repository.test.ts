import {
  createMockMbcCardRepository,
  resetMockCardState,
} from '../mock-mbc-card.repository';
import type { MbcCard } from '@domain/membership/entities/membership-card';
import { isCardRepositoryError } from '@domain/membership/errors/membership-card-repository-error';

const sampleCard: MbcCard = {
  version: 1,
  cardId: 'CARD-001',
  member: { memberId: 'MBR-001', displayName: 'Test User' },
  balance: 50_000,
  currency: 'IDR',
  visitStatus: 'NOT_CHECKED_IN',
  transactionLogs: [],
};

describe('MockMbcCardRepository', () => {
  beforeEach(() => {
    resetMockCardState();
  });

  it('isSupported returns true', async () => {
    const repo = createMockMbcCardRepository();
    expect(await repo.isSupported()).toBe(true);
  });

  it('readCard throws UNREGISTERED_CARD when no card stored', async () => {
    const repo = createMockMbcCardRepository();
    try {
      await repo.readCard();
      fail('Expected error');
    } catch (e) {
      expect(isCardRepositoryError(e)).toBe(true);
      if (isCardRepositoryError(e)) {
        expect(e.code).toBe('UNREGISTERED_CARD');
      }
    }
  });

  it('registerCard stores card and readCard returns it', async () => {
    const repo = createMockMbcCardRepository();
    await repo.registerCard(sampleCard);
    const result = await repo.readCard();
    expect(result).toEqual(sampleCard);
  });

  it('registerCard throws CARD_ALREADY_REGISTERED if card exists', async () => {
    const repo = createMockMbcCardRepository();
    await repo.registerCard(sampleCard);
    try {
      await repo.registerCard(sampleCard);
      fail('Expected error');
    } catch (e) {
      expect(isCardRepositoryError(e)).toBe(true);
      if (isCardRepositoryError(e)) {
        expect(e.code).toBe('CARD_ALREADY_REGISTERED');
      }
    }
  });

  it('writeCard overwrites stored card', async () => {
    const repo = createMockMbcCardRepository();
    await repo.registerCard(sampleCard);
    const updated = { ...sampleCard, balance: 100_000 };
    await repo.writeCard(updated);
    expect(await repo.readCard()).toEqual(updated);
  });

  it('readWriteCard applies transform and returns result', async () => {
    const repo = createMockMbcCardRepository();
    await repo.registerCard(sampleCard);
    const result = await repo.readWriteCard(card => ({
      ...card,
      balance: card.balance + 10_000,
    }));
    expect(result.balance).toBe(60_000);
    expect((await repo.readCard()).balance).toBe(60_000);
  });

  it('readWriteCard throws UNREGISTERED_CARD when no card', async () => {
    const repo = createMockMbcCardRepository();
    try {
      await repo.readWriteCard(card => card);
      fail('Expected error');
    } catch (e) {
      expect(isCardRepositoryError(e)).toBe(true);
      if (isCardRepositoryError(e)) {
        expect(e.code).toBe('UNREGISTERED_CARD');
      }
    }
  });

  it('cancel resolves without error', async () => {
    const repo = createMockMbcCardRepository();
    await expect(repo.cancel()).resolves.toBeUndefined();
  });

  it('state is singleton across multiple createMockMbcCardRepository calls', async () => {
    const repo1 = createMockMbcCardRepository();
    const repo2 = createMockMbcCardRepository();
    await repo1.registerCard(sampleCard);
    const result = await repo2.readCard();
    expect(result).toEqual(sampleCard);
  });
});

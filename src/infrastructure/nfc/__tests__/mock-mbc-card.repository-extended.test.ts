import { MockMbcCardRepository } from '../mock-mbc-card.repository';

describe('MockMbcCardRepository – extended scenario coverage', () => {
  it('returns a low-balance card for the low-balance scenario', async () => {
    const repository = new MockMbcCardRepository();
    repository.setScenario('low-balance');

    const card = await repository.readCard();
    expect(card.balance).toBe(1000);
    expect(card.visitStatus).toBe('NOT_CHECKED_IN');
  });

  it('returns a checked-in card with low balance for checked-in-low-balance scenario', async () => {
    const repository = new MockMbcCardRepository();
    repository.setScenario('checked-in-low-balance');

    const card = await repository.readCard();
    expect(card.balance).toBe(1000);
    expect(card.visitStatus).toBe('CHECKED_IN');
    expect(card.activeSession?.activityType).toBe('PARKING');
  });

  it('returns a checked-in card for the checked-in scenario', async () => {
    const repository = new MockMbcCardRepository();
    repository.setScenario('checked-in');

    const card = await repository.readCard();
    expect(card.visitStatus).toBe('CHECKED_IN');
    expect(card.activeSession?.activityType).toBe('PARKING');
    expect(card.balance).toBe(12000);
  });

  it('falls back to normal scenario for unknown scenario values', async () => {
    const repository = new MockMbcCardRepository();
    // Force an unknown scenario via type assertion
    repository.setScenario('unknown-scenario' as never);

    const card = await repository.readCard();
    expect(card.balance).toBe(50000);
    expect(card.cardId).toBe('CARD-NORMAL-001');
  });

  it('does not share state between reads (returns clones)', async () => {
    const repository = new MockMbcCardRepository();
    const cardA = await repository.readCard();
    const cardB = await repository.readCard();

    cardA.balance = 0;
    expect(cardB.balance).toBe(50000);
  });

  it('writeCard persists state for subsequent reads', async () => {
    const repository = new MockMbcCardRepository();
    const card = await repository.readCard();
    card.balance = 99999;
    await repository.writeCard(card);

    const next = await repository.readCard();
    expect(next.balance).toBe(99999);
  });

  it('writeCard does not share reference with internal state', async () => {
    const repository = new MockMbcCardRepository();
    const card = await repository.readCard();
    await repository.writeCard(card);

    card.balance = 0;
    const stored = await repository.readCard();
    expect(stored.balance).toBe(50000);
  });
});

import { MockMbcCardRepository } from '../mock-mbc-card.repository';
import { CardRepositoryError } from '../../../domain/errors/card-repository-error';

describe('MockMbcCardRepository', () => {
  it('reads and writes registered card state', async () => {
    const repository = new MockMbcCardRepository();
    const card = await repository.readCard();

    expect(card.balance).toBeGreaterThan(0);

    const updated = { ...card, balance: card.balance + 1000 };
    await repository.writeCard(updated);
    const next = await repository.readCard();
    expect(next.balance).toBe(updated.balance);
  });

  it('switches scenarios and returns current scenario', async () => {
    const repository = new MockMbcCardRepository();
    repository.setScenario('checked-in-generic');
    expect(repository.getScenario()).toBe('checked-in-generic');

    const card = await repository.readCard();
    expect(card.activeSession?.activityType).toBe('GENERIC');
  });

  it('throws unregistered and tampered errors for unsafe scenarios', async () => {
    const repository = new MockMbcCardRepository();
    repository.setScenario('unregistered');
    await expect(repository.readCard()).rejects.toMatchObject({
      code: 'UNREGISTERED_CARD',
    });

    repository.setScenario('tampered');
    await expect(repository.readCard()).rejects.toBeInstanceOf(
      CardRepositoryError,
    );
  });

  it('supports probe and cancel no-op', async () => {
    const repository = new MockMbcCardRepository();
    await expect(repository.isSupported()).resolves.toBe(true);
    await expect(repository.cancel()).resolves.toBeUndefined();
  });
});

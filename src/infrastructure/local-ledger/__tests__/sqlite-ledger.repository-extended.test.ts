import type { DB } from '@op-engineering/op-sqlite';
import { SqliteLedgerRepository } from '../sqlite-ledger.repository';

type ExecuteMock = jest.MockedFunction<DB['execute']>;

function createDb(execute: ExecuteMock): DB {
  return { execute } as unknown as DB;
}

describe('SqliteLedgerRepository – extended branch coverage', () => {
  it('handles null summary row values gracefully', async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // CREATE TABLE
      .mockResolvedValueOnce({
        rows: [
          {
            top_up_total: null,
            checkout_total: null,
            register_count: null,
            top_up_count: null,
            checkout_count: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] }) as ExecuteMock;

    const repository = new SqliteLedgerRepository(createDb(execute));
    const summary = await repository.getStationSummary();

    expect(summary.topUpTotal).toBe(0);
    expect(summary.checkoutTotal).toBe(0);
    expect(summary.registerCount).toBe(0);
    expect(summary.topUpCount).toBe(0);
    expect(summary.checkoutCount).toBe(0);
    expect(summary.latestEntries).toHaveLength(0);
  });

  it('handles empty summary rows (no data)', async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // CREATE TABLE
      .mockResolvedValueOnce({ rows: [undefined] })
      .mockResolvedValueOnce({ rows: [] }) as ExecuteMock;

    const repository = new SqliteLedgerRepository(createDb(execute));
    const summary = await repository.getStationSummary();

    expect(summary.topUpTotal).toBe(0);
    expect(summary.latestEntries).toHaveLength(0);
  });

  it('appends entries with all optional fields as null', async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // CREATE TABLE
      .mockResolvedValueOnce({ rows: [] }) as ExecuteMock; // INSERT

    const repository = new SqliteLedgerRepository(createDb(execute));

    await repository.append({
      id: 'LEDGER-MINIMAL',
      role: 'GATE',
      action: 'CHECK_IN',
      occurredAt: '2026-05-02T10:00:00.000Z',
    });

    const insertCall = execute.mock.calls[1];
    const params = insertCall[1] as unknown[];
    // maskedMemberReference, activityType, amount, deviceId should be null
    expect(params[3]).toBeNull();
    expect(params[4]).toBeNull();
    expect(params[5]).toBeNull();
    expect(params[7]).toBeNull();
  });
});

import type { DB } from '@op-engineering/op-sqlite';
import { SqliteLedgerRepository } from '../sqlite-ledger.repository';

type ExecuteMock = jest.MockedFunction<DB['execute']>;

function createDb(execute: ExecuteMock): DB {
  return { execute } as unknown as DB;
}

describe('SqliteLedgerRepository', () => {
  it('initializes schema once and appends entries', async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] }) as ExecuteMock;
    const repository = new SqliteLedgerRepository(createDb(execute));

    await repository.append({
      id: 'LEDGER-001',
      role: 'STATION',
      action: 'TOP_UP',
      maskedMemberReference: 'MBC-***-0001',
      amount: 50000,
      occurredAt: '2026-05-02T10:00:00.000Z',
    });
    await repository.append({
      id: 'LEDGER-002',
      role: 'TERMINAL',
      action: 'CHECK_OUT',
      amount: 4000,
      occurredAt: '2026-05-02T11:00:00.000Z',
    });

    expect(execute).toHaveBeenCalled();
    expect(execute.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS');
    const insertCalls = execute.mock.calls.filter(([sql]) =>
      String(sql).includes('INSERT INTO station_ledger_entries'),
    );
    expect(insertCalls).toHaveLength(2);
  });

  it('returns station summary and latest entries', async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            top_up_total: 50000,
            checkout_total: 4000,
            register_count: 1,
            top_up_count: 1,
            checkout_count: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'LEDGER-001',
            role: 'STATION',
            action: 'TOP_UP',
            masked_member_reference: 'MBC-***-0001',
            activity_type: 'PARKING',
            amount: 50000,
            occurred_at: '2026-05-02T10:00:00.000Z',
            device_id: null,
          },
        ],
      }) as ExecuteMock;
    const repository = new SqliteLedgerRepository(createDb(execute));

    const summary = await repository.getStationSummary();

    expect(summary.topUpTotal).toBe(50000);
    expect(summary.checkoutTotal).toBe(4000);
    expect(summary.latestEntries).toHaveLength(1);
    expect(summary.latestEntries[0].maskedMemberReference).toBe('MBC-***-0001');
  });
});

import type { DB } from '@op-engineering/op-sqlite';
import type { LocalLedgerRepository } from '@domain/membership/repositories/ledger.repository';
import type {
  LedgerEntry,
  StationLedgerSummary,
} from '@domain/membership/entities/ledger-entry';
import { mapLedgerRowToEntry } from './sqlite-ledger-mapper';

const CREATE_LEDGER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS station_ledger_entries (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    masked_member_reference TEXT,
    activity_type TEXT,
    amount INTEGER,
    occurred_at TEXT NOT NULL,
    device_id TEXT
  )
`;

export type SqliteLedgerRepository = LocalLedgerRepository;

export function createSqliteLedgerRepository(db: DB): SqliteLedgerRepository {
  let initialized = false;

  async function ensureInitialized(): Promise<void> {
    if (initialized) {
      return;
    }

    await db.execute(CREATE_LEDGER_TABLE_SQL);
    initialized = true;
  }

  return {
    async append(entry: LedgerEntry): Promise<void> {
      await ensureInitialized();
      await db.execute(
        `
        INSERT INTO station_ledger_entries (
          id,
          role,
          action,
          masked_member_reference,
          activity_type,
          amount,
          occurred_at,
          device_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          entry.id,
          entry.role,
          entry.action,
          entry.maskedMemberReference ?? null,
          entry.activityType ?? null,
          entry.amount ?? null,
          entry.occurredAt,
          entry.deviceId ?? null,
        ],
      );
    },

    async getStationSummary(): Promise<StationLedgerSummary> {
      await ensureInitialized();

      const summaryResult = await db.execute(
        `
        SELECT
          COALESCE(SUM(CASE WHEN action = 'TOP_UP' THEN amount ELSE 0 END), 0) AS top_up_total,
          COALESCE(SUM(CASE WHEN action = 'CHECK_OUT' THEN amount ELSE 0 END), 0) AS checkout_total,
          COALESCE(SUM(CASE WHEN action = 'REGISTER' THEN 1 ELSE 0 END), 0) AS register_count,
          COALESCE(SUM(CASE WHEN action = 'TOP_UP' THEN 1 ELSE 0 END), 0) AS top_up_count,
          COALESCE(SUM(CASE WHEN action = 'CHECK_OUT' THEN 1 ELSE 0 END), 0) AS checkout_count
        FROM station_ledger_entries
      `,
      );

      const latestEntriesResult = await db.execute(
        `
        SELECT
          id,
          role,
          action,
          masked_member_reference,
          activity_type,
          amount,
          occurred_at,
          device_id
        FROM station_ledger_entries
        ORDER BY occurred_at DESC
        LIMIT 5
      `,
      );

      const summaryRow = summaryResult.rows[0] as {
        top_up_total: number;
        checkout_total: number;
        register_count: number;
        top_up_count: number;
        checkout_count: number;
      };

      return {
        topUpTotal: Number(summaryRow?.top_up_total ?? 0),
        checkoutTotal: Number(summaryRow?.checkout_total ?? 0),
        registerCount: Number(summaryRow?.register_count ?? 0),
        topUpCount: Number(summaryRow?.top_up_count ?? 0),
        checkoutCount: Number(summaryRow?.checkout_count ?? 0),
        latestEntries: latestEntriesResult.rows.map(row =>
          mapLedgerRowToEntry(row as never),
        ),
      };
    },
  };
}

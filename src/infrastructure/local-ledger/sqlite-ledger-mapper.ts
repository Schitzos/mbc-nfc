import type { LedgerEntry } from '../../domain/entities/mbc-card';

type LedgerRow = {
  id: string;
  role: LedgerEntry['role'];
  action: LedgerEntry['action'];
  masked_member_reference: string | null;
  activity_type: LedgerEntry['activityType'] | null;
  amount: number | null;
  occurred_at: string;
  device_id: string | null;
};

export function mapLedgerRowToEntry(row: LedgerRow): LedgerEntry {
  return {
    id: row.id,
    role: row.role,
    action: row.action,
    maskedMemberReference: row.masked_member_reference ?? undefined,
    activityType: row.activity_type ?? undefined,
    amount: row.amount ?? undefined,
    occurredAt: row.occurred_at,
    deviceId: row.device_id ?? undefined,
  };
}

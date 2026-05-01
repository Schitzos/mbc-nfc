import { mapLedgerRowToEntry } from '../sqlite-ledger-mapper';

describe('sqlite ledger mapper', () => {
  it('maps sqlite row fields into ledger entry shape', () => {
    const mapped = mapLedgerRowToEntry({
      id: 'LEDGER-001',
      role: 'STATION',
      action: 'TOP_UP',
      masked_member_reference: 'MBC-***-0001',
      activity_type: 'PARKING',
      amount: 50000,
      occurred_at: '2026-05-02T10:00:00.000Z',
      device_id: 'ANDROID-001',
    });

    expect(mapped).toEqual({
      id: 'LEDGER-001',
      role: 'STATION',
      action: 'TOP_UP',
      maskedMemberReference: 'MBC-***-0001',
      activityType: 'PARKING',
      amount: 50000,
      occurredAt: '2026-05-02T10:00:00.000Z',
      deviceId: 'ANDROID-001',
    });
  });
});

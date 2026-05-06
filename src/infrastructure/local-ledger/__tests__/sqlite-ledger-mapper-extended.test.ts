import { mapLedgerRowToEntry } from '../sqlite-ledger-mapper';

describe('sqlite ledger mapper – extended branch coverage', () => {
  it('maps null optional fields to undefined', () => {
    const mapped = mapLedgerRowToEntry({
      id: 'LEDGER-002',
      role: 'GATE',
      action: 'CHECK_IN',
      masked_member_reference: null,
      activity_type: null,
      amount: null,
      occurred_at: '2026-05-02T11:00:00.000Z',
      device_id: null,
    });

    expect(mapped).toEqual({
      id: 'LEDGER-002',
      role: 'GATE',
      action: 'CHECK_IN',
      maskedMemberReference: undefined,
      activityType: undefined,
      amount: undefined,
      occurredAt: '2026-05-02T11:00:00.000Z',
      deviceId: undefined,
    });
  });

  it('maps all fields when present', () => {
    const mapped = mapLedgerRowToEntry({
      id: 'LEDGER-003',
      role: 'TERMINAL',
      action: 'CHECK_OUT',
      masked_member_reference: 'MBC-***-1234',
      activity_type: 'PARKING',
      amount: 4000,
      occurred_at: '2026-05-02T12:00:00.000Z',
      device_id: 'DEVICE-001',
    });

    expect(mapped.maskedMemberReference).toBe('MBC-***-1234');
    expect(mapped.activityType).toBe('PARKING');
    expect(mapped.amount).toBe(4000);
    expect(mapped.deviceId).toBe('DEVICE-001');
  });
});

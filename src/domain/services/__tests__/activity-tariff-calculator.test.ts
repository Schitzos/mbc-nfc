import { calculateActivityTariff } from '@domain/services/activity-tariff-calculator';
import { DomainError } from '@domain/errors/domain-error';
import { PARKING_TARIFF_PER_STARTED_HOUR } from '@domain/entities/mbc-card';

describe('calculateActivityTariff', () => {
  it('uses the fixed parking tariff constant of Rp 2.000', () => {
    expect(PARKING_TARIFF_PER_STARTED_HOUR).toBe(2000);
  });

  it('returns Rp 2.000 for one hour of parking', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T09:00:00.000Z',
      }),
    ).toEqual({
      chargedHours: 1,
      chargedAmount: 2000,
      durationMs: 3600000,
    });
  });

  it('rounds partial hours up (ceiling-hour rounding)', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T09:05:01.000Z',
      }),
    ).toEqual({
      chargedHours: 2,
      chargedAmount: 4000,
      durationMs: 3901000,
    });
  });

  it('charges 3 hours for a 2h15m duration', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
      }),
    ).toEqual({
      chargedHours: 3,
      chargedAmount: 6000,
      durationMs: 8100000,
    });
  });

  it('rejects invalid timestamps', () => {
    expect(() =>
      calculateActivityTariff({
        checkedInAt: 'not-a-date',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
      }),
    ).toThrow(DomainError);
  });

  it('rejects zero or negative durations', () => {
    expect(() =>
      calculateActivityTariff({
        checkedInAt: '2026-05-01T10:15:00.000Z',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
      }),
    ).toThrow(DomainError);
  });
});

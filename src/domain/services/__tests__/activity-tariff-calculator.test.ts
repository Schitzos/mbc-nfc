import { calculateActivityTariff } from '../activity-tariff-calculator';
import { DomainError } from '../../errors/domain-error';

const parkingRule = {
  activityType: 'PARKING' as const,
  feePerStartedHour: 2000,
  currency: 'IDR' as const,
};

describe('calculateActivityTariff', () => {
  it('returns Rp 2.000 for one hour of parking', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T09:00:00.000Z',
        rule: parkingRule,
      }),
    ).toEqual({
      chargedHours: 1,
      chargedAmount: 2000,
    });
  });

  it('rounds partial hours up for the parking demo tariff', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T09:05:01.000Z',
        rule: parkingRule,
      }),
    ).toEqual({
      chargedHours: 2,
      chargedAmount: 4000,
    });
  });

  it('accepts a generic activity rule without hardcoding parking everywhere', () => {
    expect(
      calculateActivityTariff({
        checkedInAt: '2026-05-01T08:00:00.000Z',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
        rule: {
          activityType: 'GENERIC',
          feePerStartedHour: 3500,
          currency: 'IDR',
        },
      }),
    ).toEqual({
      chargedHours: 3,
      chargedAmount: 10500,
    });
  });

  it('rejects invalid timestamps', () => {
    expect(() =>
      calculateActivityTariff({
        checkedInAt: 'not-a-date',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
        rule: parkingRule,
      }),
    ).toThrow(DomainError);
  });

  it('rejects zero or negative durations', () => {
    expect(() =>
      calculateActivityTariff({
        checkedInAt: '2026-05-01T10:15:00.000Z',
        checkedOutAt: '2026-05-01T10:15:00.000Z',
        rule: parkingRule,
      }),
    ).toThrow(DomainError);
  });
});

import type { TariffStrategy } from '@domain/services/activity-tariff-calculator';

/**
 * Fixed parking tariff: Rp 2.000 per started hour (ceiling-hour rounding).
 */
export const PARKING_TARIFF_PER_STARTED_HOUR = 2000;

export const PARKING_TARIFF_STRATEGY: TariffStrategy = {
  ratePerUnit: PARKING_TARIFF_PER_STARTED_HOUR,
  unitMs: 60 * 60 * 1000,
  roundUp: true,
};

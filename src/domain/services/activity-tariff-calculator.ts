import { DomainError } from '../errors/domain-error';
import { PARKING_TARIFF_PER_STARTED_HOUR } from '../entities/mbc-card';

export type ActivityTariffCalculation = {
  chargedHours: number;
  chargedAmount: number;
  durationMs: number;
};

interface CalculateActivityTariffInput {
  checkedInAt: string;
  checkedOutAt: string;
}

function parseIsoDate(value: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new DomainError(
      'INVALID_TIMESTAMP',
      'Activity timestamps must be valid ISO date strings.',
    );
  }

  return parsedDate;
}

export function calculateActivityTariff({
  checkedInAt,
  checkedOutAt,
}: CalculateActivityTariffInput): ActivityTariffCalculation {
  const startedAt = parseIsoDate(checkedInAt);
  const finishedAt = parseIsoDate(checkedOutAt);
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  if (durationMs <= 0) {
    throw new DomainError(
      'INVALID_DURATION',
      'Activity checkout time must be later than the check-in time.',
    );
  }

  const durationHours = durationMs / (60 * 60 * 1000);
  const chargedHours = Math.ceil(durationHours);

  return {
    chargedHours,
    chargedAmount: chargedHours * PARKING_TARIFF_PER_STARTED_HOUR,
    durationMs,
  };
}

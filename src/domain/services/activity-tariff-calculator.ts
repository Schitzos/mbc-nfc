import { DomainError } from '../errors/domain-error';
import type { ActivityTariffRule } from '../entities/mbc-card';

export type ActivityTariffCalculation = {
  chargedHours: number;
  chargedAmount: number;
};

type CalculateActivityTariffInput = {
  checkedInAt: string;
  checkedOutAt: string;
  rule: ActivityTariffRule;
};

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
  rule,
}: CalculateActivityTariffInput): ActivityTariffCalculation {
  if (rule.feePerStartedHour <= 0) {
    throw new DomainError(
      'INVALID_TARIFF_RULE',
      'Activity tariff must be a positive per-hour amount.',
    );
  }

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
    chargedAmount: chargedHours * rule.feePerStartedHour,
  };
}
